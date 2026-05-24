import { useMemo } from "react";
import { useLeads, useStormEvents } from "@/hooks/useLeads";
import { useMarkets, type SavedMarket } from "@/contexts/MarketContext";
import type { Lead } from "@/lib/mockData";

// Ray-casting point-in-polygon for a single linear ring [[lng,lat], ...].
function pointInRing(lng: number, lat: number, ring: number[][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    const intersect = ((yi > lat) !== (yj > lat)) &&
      (lng < ((xj - xi) * (lat - yi)) / (yj - yi + 1e-12) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function pointInGeofence(lng: number, lat: number, geo: SavedMarket["geofence"]): boolean {
  if (!geo) return true;
  if (geo.type === "Polygon") {
    const [outer, ...holes] = geo.coordinates;
    if (!pointInRing(lng, lat, outer)) return false;
    return !holes.some(h => pointInRing(lng, lat, h));
  }
  if (geo.type === "MultiPolygon") {
    return geo.coordinates.some(poly => {
      const [outer, ...holes] = poly;
      if (!pointInRing(lng, lat, outer)) return false;
      return !holes.some(h => pointInRing(lng, lat, h));
    });
  }
  return true;
}

export function leadMatchesMarket(l: Lead, m: SavedMarket | null): boolean {
  if (!m) return true;
  const addr = (l.propertyAddress || "").toLowerCase();

  if (m.zips.length > 0 && !m.zips.includes(l.zip)) return false;

  if (m.states.length > 0) {
    const ok = m.states.some(s => new RegExp(`,\\s*${s}\\b`, "i").test(l.propertyAddress));
    if (!ok) return false;
  }

  if (m.cities.length > 0) {
    const ok = m.cities.some(c => addr.includes(c.toLowerCase()));
    if (!ok) return false;
  }

  if (m.counties.length > 0 && m.zips.length === 0 && m.cities.length === 0) {
    // counties not in lead address — only enforce if no other geo narrows it
  }

  const f = m.filters;
  if (f.minHail && l.hailSize < f.minHail) return false;
  if (f.minWind && l.windSpeed < f.minWind) return false;
  if (f.minRoofAge && l.roofAge < f.minRoofAge) return false;
  if (f.minHomeValue && l.homeValue < f.minHomeValue) return false;
  if (f.minClaimScore && l.stormScore < f.minClaimScore) return false;
  if (f.stormDateFrom && l.lastStormDate && l.lastStormDate < f.stormDateFrom) return false;

  return true;
}

export function stormMatchesMarket(
  s: { location: string; hailSize: number; windSpeed: number; date: string },
  m: SavedMarket | null
): boolean {
  if (!m) return true;
  const loc = (s.location || "").toLowerCase();

  if (m.states.length > 0) {
    const ok = m.states.some(st => new RegExp(`\\b${st}\\b`, "i").test(s.location));
    if (!ok) return false;
  }
  if (m.cities.length > 0) {
    const ok = m.cities.some(c => loc.includes(c.toLowerCase()));
    if (!ok) return false;
  }

  const f = m.filters;
  if (f.minHail && s.hailSize < f.minHail) return false;
  if (f.minWind && s.windSpeed < f.minWind) return false;
  if (f.stormDateFrom && s.date < f.stormDateFrom) return false;

  return true;
}

export function useMarketLeads() {
  const { leads, loading } = useLeads();
  const { activeMarket } = useMarkets();
  const filtered = useMemo(
    () => leads.filter(l => leadMatchesMarket(l, activeMarket)),
    [leads, activeMarket]
  );
  return { leads: filtered, allLeads: leads, loading, activeMarket };
}

export function useMarketStormEvents() {
  const events = useStormEvents();
  const { activeMarket } = useMarkets();
  return useMemo(
    () => events.filter(s => stormMatchesMarket(s, activeMarket)),
    [events, activeMarket]
  );
}
