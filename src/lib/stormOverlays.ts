import type { Lead } from "./mockData";

export type LayerPreset = "all" | "none" | "hail" | "wind" | "tornado" | "rain" | "custom";

export interface OverlayState {
  hail: boolean;
  wind: boolean;
  tornado: boolean;
  treeDamage: boolean;
  rain: boolean;
  leadHeatmap: boolean;
  // filters
  minHail: number;        // inches
  minWind: number;        // mph
  efRating: number;       // 0..5
  hailDateFrom: string;
  hailDateTo: string;
  showHailConfidence: boolean;
  showWindDirection: boolean;
  showWindAffected: boolean;
  showTornadoWidth: boolean;
}

export const DEFAULT_OVERLAYS: OverlayState = {
  hail: true,
  wind: true,
  tornado: false,
  treeDamage: false,
  rain: false,
  leadHeatmap: true,
  minHail: 1.0,
  minWind: 58,
  efRating: 0,
  hailDateFrom: "",
  hailDateTo: "",
  showHailConfidence: true,
  showWindDirection: true,
  showWindAffected: true,
  showTornadoWidth: true,
};

export const HAIL_THRESHOLDS = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
export const WIND_THRESHOLDS = [45, 50, 58, 65, 70];
export const EF_RATINGS = [0, 1, 2, 3, 4, 5];

export function applyPreset(s: OverlayState, p: LayerPreset): OverlayState {
  if (p === "all")  return { ...s, hail: true,  wind: true,  tornado: true,  treeDamage: true,  rain: true };
  if (p === "none") return { ...s, hail: false, wind: false, tornado: false, treeDamage: false, rain: false };
  if (p === "hail")    return { ...s, hail: true,  wind: false, tornado: false, treeDamage: false, rain: false };
  if (p === "wind")    return { ...s, hail: false, wind: true,  tornado: false, treeDamage: false, rain: false };
  if (p === "tornado") return { ...s, hail: false, wind: false, tornado: true,  treeDamage: false, rain: false };
  if (p === "rain")    return { ...s, hail: false, wind: false, tornado: false, treeDamage: false, rain: true };
  return s;
}

// Mocked overlay polygons (percent coordinates over the stylized map)
export const HAIL_SWATHS = [
  { id: "h1", date: "2026-04-22", hailSize: 2.25, confidence: 92, x: 18, y: 12, w: 58, h: 38 },
  { id: "h2", date: "2026-04-18", hailSize: 1.5,  confidence: 78, x: 35, y: 45, w: 40, h: 28 },
  { id: "h3", date: "2026-03-30", hailSize: 0.75, confidence: 55, x: 55, y: 58, w: 32, h: 24 },
];

export const WIND_CORRIDORS = [
  { id: "w1", windSpeed: 85, headingDeg: 65, x1: 8,  y1: 70, x2: 92, y2: 30, affectedHomes: 3420 },
  { id: "w2", windSpeed: 65, headingDeg: 45, x1: 18, y1: 85, x2: 70, y2: 50, affectedHomes: 1890 },
  { id: "w3", windSpeed: 50, headingDeg: 30, x1: 30, y1: 92, x2: 80, y2: 65, affectedHomes:  740 },
];

export const TORNADO_TRACKS = [
  { id: "t1", ef: 2, widthYd: 220, date: "2026-04-22 18:42", x1: 22, y1: 78, x2: 64, y2: 32 },
  { id: "t2", ef: 1, widthYd: 110, date: "2026-04-09 22:10", x1: 50, y1: 88, x2: 86, y2: 58 },
];

export const RAIN_ZONES = [
  { id: "r1", intensity: 0.85, repeatCount: 3, x: 12, y: 8,  w: 50, h: 40 },
  { id: "r2", intensity: 0.55, repeatCount: 2, x: 50, y: 50, w: 42, h: 38 },
];

export const TREE_DAMAGE_ZONES = [
  { id: "td1", x: 28, y: 22, r: 14, calls: 47, outages: 12 },
  { id: "td2", x: 62, y: 55, r: 11, calls: 28, outages: 6 },
];

// Distance from a point (px, py in 0-100) to a line segment (x1,y1)->(x2,y2)
function distToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1, dy = y2 - y1;
  const len2 = dx*dx + dy*dy || 1;
  let t = ((px - x1) * dx + (py - y1) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const cx = x1 + t*dx, cy = y1 + t*dy;
  return Math.hypot(px - cx, py - cy);
}

export interface ProjectedXY { x: number; y: number }

// Compute live storm score adjustment based on active overlays + position on map
export function computeStormScore(
  lead: Lead,
  pos: ProjectedXY,
  o: OverlayState,
  priorExposure = 1
): { score: number; inHail: boolean; inWind: boolean; inTornado: boolean; inRain: boolean } {
  let score = 0;
  let inHail = false, inWind = false, inTornado = false, inRain = false;

  // Hail
  if (o.hail) {
    for (const s of HAIL_SWATHS) {
      if (s.hailSize < o.minHail) continue;
      if (o.hailDateFrom && s.date < o.hailDateFrom) continue;
      if (o.hailDateTo && s.date > o.hailDateTo) continue;
      if (pos.x >= s.x && pos.x <= s.x + s.w && pos.y >= s.y && pos.y <= s.y + s.h) {
        inHail = true;
        score += 25 + Math.min(20, s.hailSize * 10) + (s.confidence / 10);
        break;
      }
    }
  }

  // Wind — closeness to corridor centerline
  if (o.wind) {
    for (const w of WIND_CORRIDORS) {
      if (w.windSpeed < o.minWind) continue;
      const d = distToSegment(pos.x, pos.y, w.x1, w.y1, w.x2, w.y2);
      if (d < 12) {
        inWind = true;
        const closeness = 1 - d / 12;
        score += 12 + closeness * (w.windSpeed / 5);
        break;
      }
    }
  }

  // Tornado
  if (o.tornado) {
    for (const t of TORNADO_TRACKS) {
      if (t.ef < o.efRating) continue;
      const d = distToSegment(pos.x, pos.y, t.x1, t.y1, t.x2, t.y2);
      if (d < 6) { inTornado = true; score += 30 + t.ef * 5; break; }
    }
  }

  // Rain
  if (o.rain) {
    for (const r of RAIN_ZONES) {
      if (pos.x >= r.x && pos.x <= r.x + r.w && pos.y >= r.y && pos.y <= r.y + r.h) {
        inRain = true;
        score += r.intensity * 8 + r.repeatCount * 2;
        if (lead.roofAge >= 15) score += 8; // older roof in heavy rain zone
        break;
      }
    }
  }

  // Roof age, prior exposure, value modifiers
  score += Math.min(15, Math.max(0, lead.roofAge - 8));
  score += priorExposure * 3;
  score += Math.min(8, lead.homeValue / 100000);

  // Baseline if no overlays active — fall back to lead's stored score
  const overlaysActive = o.hail || o.wind || o.tornado || o.rain;
  const final = overlaysActive ? Math.round(Math.max(0, Math.min(100, score))) : lead.stormScore;
  return { score: final, inHail, inWind, inTornado, inRain };
}
