import { createContext, useContext, useEffect, useState, ReactNode } from "react";

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

const DEFAULT_MARKETS: SavedMarket[] = [
  {
    id: "m-1",
    name: "Hendersonville Storm Zone",
    states: ["TN"],
    regions: ["Middle Tennessee"],
    counties: ["Sumner County"],
    cities: ["Hendersonville"],
    zips: ["37075", "37077"],
    filters: { minHail: 1.0, minWind: 60, minRoofAge: 12 },
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: "m-2",
    name: "Middle TN Hail Leads",
    states: ["TN"],
    regions: ["Middle Tennessee"],
    counties: ["Davidson County", "Sumner County", "Wilson County"],
    cities: [],
    zips: [],
    filters: { minHail: 1.25, minConfidence: 70 },
    createdAt: Date.now() - 86400000 * 12,
  },
  {
    id: "m-3",
    name: "Gallatin High Roof Age",
    states: ["TN"],
    regions: ["Middle Tennessee"],
    counties: ["Sumner County"],
    cities: ["Gallatin"],
    zips: ["37066"],
    filters: { minRoofAge: 18, minHomeValue: 250000 },
    createdAt: Date.now() - 86400000 * 20,
  },
  {
    id: "m-4",
    name: "Nashville Wind Corridor",
    states: ["TN"],
    regions: ["Middle Tennessee"],
    counties: ["Davidson County"],
    cities: ["Nashville"],
    zips: [],
    filters: { minWind: 70 },
    createdAt: Date.now() - 86400000 * 30,
  },
  {
    id: "m-5",
    name: "Southern KY Expansion",
    states: ["KY"],
    regions: ["Southern Kentucky"],
    counties: [],
    cities: ["Bowling Green"],
    zips: [],
    filters: { minClaimScore: 50 },
    createdAt: Date.now() - 86400000 * 45,
  },
];

interface Ctx {
  markets: SavedMarket[];
  activeMarketId: string | null;
  setActiveMarketId: (id: string | null) => void;
  saveMarket: (m: Omit<SavedMarket, "id" | "createdAt">) => SavedMarket;
  deleteMarket: (id: string) => void;
  activeMarket: SavedMarket | null;
}

const MarketContext = createContext<Ctx | null>(null);
const KEY = "roofradar.markets.v1";
const ACTIVE_KEY = "roofradar.activeMarket.v1";

export function MarketProvider({ children }: { children: ReactNode }) {
  const [markets, setMarkets] = useState<SavedMarket[]>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : DEFAULT_MARKETS;
    } catch { return DEFAULT_MARKETS; }
  });
  const [activeMarketId, setActiveMarketId] = useState<string | null>(() =>
    localStorage.getItem(ACTIVE_KEY)
  );

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(markets)); }, [markets]);
  useEffect(() => {
    if (activeMarketId) localStorage.setItem(ACTIVE_KEY, activeMarketId);
    else localStorage.removeItem(ACTIVE_KEY);
  }, [activeMarketId]);

  const saveMarket: Ctx["saveMarket"] = (m) => {
    const created: SavedMarket = { ...m, id: crypto.randomUUID(), createdAt: Date.now() };
    setMarkets(prev => [created, ...prev]);
    return created;
  };
  const deleteMarket = (id: string) => {
    setMarkets(prev => prev.filter(m => m.id !== id));
    if (activeMarketId === id) setActiveMarketId(null);
  };

  const activeMarket = markets.find(m => m.id === activeMarketId) ?? null;

  return (
    <MarketContext.Provider value={{ markets, activeMarketId, setActiveMarketId, saveMarket, deleteMarket, activeMarket }}>
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
