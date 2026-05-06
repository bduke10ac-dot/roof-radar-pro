// Mock live weather data — replace with OpenWeatherMap / WeatherAPI / NOAA / HailTrace integrations.
export interface StormCell {
  id: string;
  x: number; // % position on map
  y: number;
  type: "hail" | "wind" | "tornado" | "rain" | "lightning";
  intensity: number; // 0-100
  hailSize?: number;
  windSpeed?: number;
  headingDeg: number;
  speedMph: number;
  etaMinutes: number;
  nearestMarket?: string;
  label: string;
}

export interface WeatherAlert {
  id: string;
  level: "watch" | "warning" | "advisory";
  type: "tornado" | "severe-thunderstorm" | "flash-flood" | "hail" | "wind";
  area: string;
  expires: string;
  marketId?: string;
}

export interface CurrentConditions {
  tempF: number;
  feelsLikeF: number;
  windMph: number;
  gustMph: number;
  windDir: string;
  humidity: number;
  dewPointF: number;
  pressureInHg: number;
  rainChance: number;
  conditions: string;
}

export const mockConditions: CurrentConditions = {
  tempF: 74,
  feelsLikeF: 76,
  windMph: 18,
  gustMph: 34,
  windDir: "SW",
  humidity: 78,
  dewPointF: 67,
  pressureInHg: 29.74,
  rainChance: 85,
  conditions: "Severe Thunderstorms",
};

export const mockStormCells: StormCell[] = [
  { id: "sc-1", x: 22, y: 28, type: "hail", intensity: 88, hailSize: 1.75, headingDeg: 65, speedMph: 38, etaMinutes: 14, nearestMarket: "Hendersonville Storm Zone", label: "Supercell — 1.75\" hail" },
  { id: "sc-2", x: 48, y: 52, type: "wind", intensity: 72, windSpeed: 68, headingDeg: 70, speedMph: 32, etaMinutes: 28, nearestMarket: "Gallatin Market", label: "Wind core — 68 mph gusts" },
  { id: "sc-3", x: 70, y: 38, type: "lightning", intensity: 60, headingDeg: 55, speedMph: 25, etaMinutes: 9, nearestMarket: "Nashville Wind Corridor", label: "Lightning cluster" },
  { id: "sc-4", x: 35, y: 72, type: "rain", intensity: 55, headingDeg: 80, speedMph: 22, etaMinutes: 45, nearestMarket: "Middle TN Hail Leads", label: "Heavy rain band" },
  { id: "sc-5", x: 82, y: 65, type: "tornado", intensity: 95, headingDeg: 60, speedMph: 42, etaMinutes: 6, nearestMarket: "Southern KY Expansion", label: "Rotation detected" },
];

export const mockAlerts: WeatherAlert[] = [
  { id: "a-1", level: "warning", type: "tornado",            area: "Sumner County, TN",   expires: "7:45 PM CDT" },
  { id: "a-2", level: "warning", type: "severe-thunderstorm", area: "Davidson County, TN", expires: "8:30 PM CDT" },
  { id: "a-3", level: "watch",   type: "hail",               area: "Middle Tennessee",    expires: "10:00 PM CDT" },
  { id: "a-4", level: "advisory", type: "flash-flood",       area: "Wilson County, TN",   expires: "11:15 PM CDT" },
];

export const ROOFER_THRESHOLDS = {
  hailDamage: 1.0,        // inches
  windDamage: 58,         // mph
  doorKnockLightning: 70, // intensity
};
