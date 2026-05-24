import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface MarketFilters {
  minHail?: number;
  minWind?: number;
  stormDateFrom?: string;
  minConfidence?: number;
  minAffected?: number;
  minRoofAge?: number;
  minHomeValue?: number;
  minClaimScore?: number;
}

export interface SavedMarket {
  id: string;
  name: string;
  states: string[];
  regions: string[];
  counties: string[];
  cities: string[];
  zips: string[];
  filters: MarketFilters;
  geofence?: GeoJSON.Polygon | GeoJSON.MultiPolygon | null;
  createdAt: number;
}

export const STATES = [
  { code: "TN", name: "Tennessee" },
  { code: "KY", name: "Kentucky" },
  { code: "AL", name: "Alabama" },
  { code: "GA", name: "Georgia" },
  { code: "TX", name: "Texas" },
  { code: "NC", name: "North Carolina" },
];

export const REGIONS = [
  "Middle Tennessee",
  "East Tennessee",
  "West Tennessee",
  "North Georgia",
  "Southern Kentucky",
  "Custom region",
];

export const COUNTIES = [
  "Sumner County",
  "Davidson County",
  "Wilson County",
  "Robertson County",
  "Rutherford County",
];

interface Ctx {
  markets: SavedMarket[];
  loading: boolean;
  error: string | null;
  saving: boolean;
  activeMarketId: string | null;
  setActiveMarketId: (id: string | null) => void;
  saveMarket: (m: Omit<SavedMarket, "id" | "createdAt">) => Promise<SavedMarket | null>;
  updateMarket: (id: string, patch: Partial<Omit<SavedMarket, "id" | "createdAt">>) => Promise<SavedMarket | null>;
  deleteMarket: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
  activeMarket: SavedMarket | null;
}

const MarketContext = createContext<Ctx | null>(null);
const ACTIVE_KEY = "roofradar.activeMarket.v1";

type Row = {
  id: string;
  market_name: string;
  states: string[] | null;
  regions: string[] | null;
  counties: string[] | null;
  cities: string[] | null;
  zip_codes: string[] | null;
  filters: MarketFilters | null;
  geofence_geojson: GeoJSON.Polygon | GeoJSON.MultiPolygon | null;
  created_at: string;
};

const rowToMarket = (r: Row): SavedMarket => ({
  id: r.id,
  name: r.market_name,
  states: r.states ?? [],
  regions: r.regions ?? [],
  counties: r.counties ?? [],
  cities: r.cities ?? [],
  zips: r.zip_codes ?? [],
  filters: (r.filters ?? {}) as MarketFilters,
  geofence: r.geofence_geojson ?? null,
  createdAt: new Date(r.created_at).getTime(),
});

export function MarketProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [markets, setMarkets] = useState<SavedMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeMarketId, setActiveMarketIdState] = useState<string | null>(
    () => (typeof window !== "undefined" ? localStorage.getItem(ACTIVE_KEY) : null)
  );

  const setActiveMarketId = useCallback((id: string | null) => {
    setActiveMarketIdState(id);
    if (id) localStorage.setItem(ACTIVE_KEY, id);
    else localStorage.removeItem(ACTIVE_KEY);
  }, []);

  const refresh = useCallback(async () => {
    if (!user) { setMarkets([]); setLoading(false); return; }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("markets")
      .select("id, market_name, states, regions, counties, cities, zip_codes, filters, geofence_geojson, created_at")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });
    if (error) {
      setError(error.message);
      setMarkets([]);
    } else {
      setMarkets((data as unknown as Row[]).map(rowToMarket));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    refresh();
  }, [authLoading, refresh]);

  const saveMarket: Ctx["saveMarket"] = async (m) => {
    if (!user) {
      toast.error("Please log in to save a market");
      return null;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("markets")
      .insert({
        owner_id: user.id,
        market_name: m.name,
        states: m.states,
        regions: m.regions,
        counties: m.counties,
        cities: m.cities,
        zip_codes: m.zips,
        filters: m.filters as any,
      })
      .select("id, market_name, states, regions, counties, cities, zip_codes, filters, created_at")
      .single();
    setSaving(false);
    if (error || !data) {
      toast.error(error?.message ?? "Failed to save market");
      return null;
    }
    const created = rowToMarket(data as Row);
    setMarkets(prev => [created, ...prev]);
    return created;
  };

  const updateMarket: Ctx["updateMarket"] = async (id, patch) => {
    if (!user) { toast.error("Please log in"); return null; }
    const row: Record<string, unknown> = {};
    if (patch.name !== undefined) row.market_name = patch.name;
    if (patch.states !== undefined) row.states = patch.states;
    if (patch.regions !== undefined) row.regions = patch.regions;
    if (patch.counties !== undefined) row.counties = patch.counties;
    if (patch.cities !== undefined) row.cities = patch.cities;
    if (patch.zips !== undefined) row.zip_codes = patch.zips;
    if (patch.filters !== undefined) row.filters = patch.filters as any;
    setSaving(true);
    const { data, error } = await supabase
      .from("markets")
      .update(row as any)
      .eq("id", id)
      .select("id, market_name, states, regions, counties, cities, zip_codes, filters, created_at")
      .single();
    setSaving(false);
    if (error || !data) { toast.error(error?.message ?? "Update failed"); return null; }
    const updated = rowToMarket(data as Row);
    setMarkets(prev => prev.map(m => m.id === id ? updated : m));
    return updated;
  };

  const deleteMarket = async (id: string) => {
    const prev = markets;
    setMarkets(prev.filter(m => m.id !== id));
    if (activeMarketId === id) setActiveMarketId(null);
    const { error } = await supabase.from("markets").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      setMarkets(prev);
    }
  };

  const activeMarket = markets.find(m => m.id === activeMarketId) ?? null;

  return (
    <MarketContext.Provider value={{
      markets, loading, error, saving,
      activeMarketId, setActiveMarketId,
      saveMarket, updateMarket, deleteMarket, refresh, activeMarket,
    }}>
      {children}
    </MarketContext.Provider>
  );
}

export function useMarkets() {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error("useMarkets must be used inside MarketProvider");
  return ctx;
}

// Compute Market Opportunity Score (0–100)
export function scoreMarket(m: SavedMarket, ctx: { stormCount: number; avgHail: number; avgWind: number; affectedHomes: number; avgRoofAge: number; avgHomeValue: number; claimScore?: number; competition?: number; distanceMi?: number }) {
  const stormPart = Math.min(20, ctx.stormCount * 4) + Math.min(15, ctx.avgHail * 8) + Math.min(15, ctx.avgWind / 5);
  const homesPart = Math.min(15, ctx.affectedHomes / 200);
  const propertyPart = Math.min(10, (ctx.avgRoofAge - 8) * 1.2) + Math.min(10, ctx.avgHomeValue / 80000);
  const claimPart = Math.min(10, (ctx.claimScore ?? 50) / 10);
  const compPenalty = Math.min(8, (ctx.competition ?? 3) * 1.5);
  const distPenalty = Math.min(7, (ctx.distanceMi ?? 20) / 10);
  return Math.max(0, Math.min(100, Math.round(stormPart + homesPart + propertyPart + claimPart - compPenalty - distPenalty + 5)));
}
