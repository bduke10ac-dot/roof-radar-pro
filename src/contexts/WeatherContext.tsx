import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { mockConditions, mockStormCells, mockAlerts, ROOFER_THRESHOLDS, type StormCell, type CurrentConditions, type WeatherAlert } from "@/lib/mockWeather";
import { useMarkets, type SavedMarket } from "@/contexts/MarketContext";
import type { Lead } from "@/lib/mockData";

export type ImpactType = "hail" | "wind" | "tornado" | "rain" | "lightning";
export interface MarketImpact {
  marketId: string;
  marketName: string;
  cell: StormCell;
  type: ImpactType;
  severity: number;        // 0-100
  status: string;
  etaMinutes: number;
  recommendedAction: string;
}

export interface RooferAlert {
  id: string;
  tone: "destructive" | "warning" | "storm" | "success";
  text: string;
  marketId?: string;
  cellId?: string;
}

interface Ctx {
  conditions: CurrentConditions;
  cells: StormCell[];
  alerts: WeatherAlert[];
  marketImpacts: MarketImpact[];
  rooferAlerts: RooferAlert[];
  leadBoost: (l: Lead) => { boost: number; reason?: string };
  opportunityScore: number;
  lastTick: number;
}

const WeatherCtx = createContext<Ctx | null>(null);

const ACTION_FOR: Record<ImpactType, string> = {
  hail: "Trigger inspection campaign + door-knock route",
  wind: "Schedule wind-damage inspections, push direct mail",
  tornado: "Hold field crews, prep emergency tarp dispatch",
  rain: "Launch leak-call follow-up SMS to opted-in leads",
  lightning: "Pause door-knocking, queue post-storm campaign",
};

const STATUS_FOR: Record<ImpactType, string> = {
  hail: "Active hail risk",
  wind: "Wind gust alert",
  tornado: "Storm approaching",
  rain: "Heavy rain / leak risk",
  lightning: "Lightning activity",
};

function cellSeverity(c: StormCell) {
  let s = c.intensity;
  if (c.type === "hail" && (c.hailSize ?? 0) >= 1.5) s += 8;
  if (c.type === "wind" && (c.windSpeed ?? 0) >= 65) s += 8;
  if (c.type === "tornado") s += 10;
  return Math.min(100, Math.round(s));
}

export function WeatherProvider({ children }: { children: ReactNode }) {
  const { markets } = useMarkets();
  const [lastTick, setLastTick] = useState(Date.now());

  // simulate live ticking — cells shift slightly + ETA decreases
  useEffect(() => {
    const t = setInterval(() => setLastTick(Date.now()), 15000);
    return () => clearInterval(t);
  }, []);

  const cells = useMemo<StormCell[]>(() => {
    const elapsedMin = Math.floor((Date.now() - lastTick) / 60000);
    return mockStormCells.map(c => ({
      ...c,
      etaMinutes: Math.max(1, c.etaMinutes - elapsedMin),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastTick]);

  const marketImpacts = useMemo<MarketImpact[]>(() => {
    if (markets.length === 0) return [];
    return markets.slice(0, 6).map((m, i) => {
      const cell = cells[i % cells.length];
      const type = cell.type as ImpactType;
      return {
        marketId: m.id,
        marketName: m.name,
        cell,
        type,
        severity: cellSeverity(cell),
        status: STATUS_FOR[type],
        etaMinutes: cell.etaMinutes,
        recommendedAction: ACTION_FOR[type],
      };
    });
  }, [markets, cells]);

  const rooferAlerts = useMemo<RooferAlert[]>(() => {
    const out: RooferAlert[] = [];
    for (const m of marketImpacts) {
      const c = m.cell;
      if (c.type === "hail" && (c.hailSize ?? 0) >= ROOFER_THRESHOLDS.hailDamage)
        out.push({ id: `h-${m.marketId}`, tone: "warning", marketId: m.marketId, cellId: c.id, text: `Hail ${c.hailSize}" detected near ${m.marketName} — ETA ${m.etaMinutes}m` });
      if (c.type === "wind" && (c.windSpeed ?? 0) >= ROOFER_THRESHOLDS.windDamage)
        out.push({ id: `w-${m.marketId}`, tone: "storm", marketId: m.marketId, cellId: c.id, text: `Wind gusts ${c.windSpeed} mph above damage threshold near ${m.marketName}` });
      if (c.type === "tornado")
        out.push({ id: `t-${m.marketId}`, tone: "destructive", marketId: m.marketId, cellId: c.id, text: `Storm entering ${m.marketName} — ETA ${m.etaMinutes}m` });
      if (c.type === "rain" && c.intensity > 50)
        out.push({ id: `r-${m.marketId}`, tone: "storm", marketId: m.marketId, cellId: c.id, text: `Heavy rain may create leak calls in ${m.marketName}` });
      if (c.type === "lightning" && c.intensity >= ROOFER_THRESHOLDS.doorKnockLightning)
        out.push({ id: `l-${m.marketId}`, tone: "warning", marketId: m.marketId, cellId: c.id, text: `Door-knocking not recommended — active lightning near ${m.marketName}` });
    }
    out.push({ id: "post", tone: "success", text: "Follow-up campaign recommended after storms pass" });
    return out;
  }, [marketImpacts]);

  // Lead-level boost: leads in a market currently being impacted get a live storm score boost.
  const leadBoost = useMemo(() => {
    const map = new Map<string, MarketImpact>();
    for (const mi of marketImpacts) map.set(mi.marketId, mi);

    return (l: Lead) => {
      // best impact match by city/zip overlap with any active-impact saved market
      let best: { boost: number; reason?: string } = { boost: 0 };
      for (const mi of marketImpacts) {
        const m = markets.find(mm => mm.id === mi.marketId);
        if (!m) continue;
        const addr = (l.propertyAddress || "").toLowerCase();
        const zipHit = m.zips.includes(l.zip);
        const cityHit = m.cities.some(c => addr.includes(c.toLowerCase()));
        if (!zipHit && !cityHit) continue;

        let b = Math.round(mi.severity / 8); // up to ~12
        if (mi.type === "hail" && l.roofAge >= 12) b += 4;
        if (mi.type === "wind" && l.roofAge >= 15) b += 3;
        if (mi.type === "tornado") b += 6;
        if (b > best.boost) best = { boost: b, reason: `${mi.status} — ${mi.marketName}` };
      }
      return best;
    };
  }, [marketImpacts, markets]);

  const opportunityScore = useMemo(() => {
    if (marketImpacts.length === 0) return 0;
    const avg = marketImpacts.reduce((s, m) => s + m.severity, 0) / marketImpacts.length;
    return Math.round(avg);
  }, [marketImpacts]);

  return (
    <WeatherCtx.Provider value={{
      conditions: mockConditions,
      cells, alerts: mockAlerts,
      marketImpacts, rooferAlerts, leadBoost, opportunityScore, lastTick,
    }}>
      {children}
    </WeatherCtx.Provider>
  );
}

export function useWeather() {
  const c = useContext(WeatherCtx);
  if (!c) throw new Error("useWeather must be used inside WeatherProvider");
  return c;
}
