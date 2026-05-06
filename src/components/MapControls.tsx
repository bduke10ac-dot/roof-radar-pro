import { useEffect, useState } from "react";
import {
  Map as MapIcon, Satellite, Layers, Mountain, Box, Eye, Grid3x3,
  CloudLightning, Flame, Home, Briefcase, Route, Globe, Ruler,
  ChevronDown, ChevronUp, Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type BaseMapMode = "road" | "satellite" | "hybrid" | "terrain" | "3d";

export type MapLayerKey =
  // Road sub
  | "streets" | "neighborhoods" | "cityLabels" | "parcelOutlines"
  // Street view
  | "streetView"
  // Parcels
  | "parcelView"
  // Storm
  | "stormHail" | "stormWind" | "stormRain" | "stormTornado" | "stormLightning"
  // Heatmaps
  | "leadDensity" | "roofAge" | "claimOpportunity"
  // Jobs / routes
  | "jobZones" | "geofenceRadius" | "completedRoofs"
  | "routeDoorKnock" | "routeInspection" | "routeRep"
  // Boundaries
  | "bState" | "bRegion" | "bCounty" | "bCity" | "bZip" | "bCustom"
  // Tools
  | "toolRoofOutline" | "toolDistance" | "toolArea" | "toolSlope" | "toolElevation";

export type MapControlsState = {
  base: BaseMapMode;
  pitch: number;
  rotation: number;
  layers: Record<MapLayerKey, boolean>;
};

export const DEFAULT_MAP_CONTROLS: MapControlsState = {
  base: "road",
  pitch: 0,
  rotation: 0,
  layers: {
    streets: true, neighborhoods: true, cityLabels: true, parcelOutlines: false,
    streetView: false, parcelView: false,
    stormHail: true, stormWind: true, stormRain: false, stormTornado: true, stormLightning: false,
    leadDensity: false, roofAge: false, claimOpportunity: false,
    jobZones: false, geofenceRadius: true, completedRoofs: false,
    routeDoorKnock: false, routeInspection: false, routeRep: false,
    bState: false, bRegion: false, bCounty: false, bCity: false, bZip: false, bCustom: true,
    toolRoofOutline: false, toolDistance: false, toolArea: false, toolSlope: false, toolElevation: false,
  },
};

const BASE_MODES: { key: BaseMapMode; label: string; icon: any }[] = [
  { key: "road",      label: "Road",      icon: MapIcon },
  { key: "satellite", label: "Satellite", icon: Satellite },
  { key: "hybrid",    label: "Hybrid",    icon: Layers },
  { key: "terrain",   label: "Terrain",   icon: Mountain },
  { key: "3d",        label: "3D",        icon: Box },
];

type Group = { title: string; icon: any; items: { key: MapLayerKey; label: string }[] };

const GROUPS: Group[] = [
  { title: "Road labels", icon: MapIcon, items: [
    { key: "streets", label: "Streets & roads" },
    { key: "neighborhoods", label: "Neighborhoods" },
    { key: "cityLabels", label: "City labels" },
    { key: "parcelOutlines", label: "Parcel outlines" },
  ]},
  { title: "Property", icon: Home, items: [
    { key: "streetView", label: "Street view" },
    { key: "parcelView", label: "Parcel boundaries" },
  ]},
  { title: "Storm overlays", icon: CloudLightning, items: [
    { key: "stormHail", label: "Hail" },
    { key: "stormWind", label: "Wind" },
    { key: "stormRain", label: "Rain" },
    { key: "stormTornado", label: "Tornado" },
    { key: "stormLightning", label: "Lightning" },
  ]},
  { title: "Heat maps", icon: Flame, items: [
    { key: "leadDensity", label: "Lead density" },
    { key: "roofAge", label: "Roof age" },
    { key: "claimOpportunity", label: "Claim opportunity" },
  ]},
  { title: "Jobs & routes", icon: Briefcase, items: [
    { key: "jobZones", label: "Active job zones" },
    { key: "geofenceRadius", label: "Geofence radius" },
    { key: "completedRoofs", label: "Completed roofs" },
    { key: "routeDoorKnock", label: "Door-knock route" },
    { key: "routeInspection", label: "Inspection route" },
    { key: "routeRep", label: "Rep territory" },
  ]},
  { title: "Boundaries", icon: Globe, items: [
    { key: "bState", label: "State" },
    { key: "bRegion", label: "Region" },
    { key: "bCounty", label: "County" },
    { key: "bCity", label: "City" },
    { key: "bZip", label: "ZIP" },
    { key: "bCustom", label: "Custom geofence" },
  ]},
  { title: "Measurement", icon: Ruler, items: [
    { key: "toolRoofOutline", label: "Roof outline" },
    { key: "toolDistance", label: "Distance" },
    { key: "toolArea", label: "Area" },
    { key: "toolSlope", label: "Slope / pitch (preview)" },
    { key: "toolElevation", label: "Elevation profile (preview)" },
  ]},
];

export function useMapControls(storageKey: string) {
  const [state, setState] = useState<MapControlsState>(() => {
    if (typeof window === "undefined") return DEFAULT_MAP_CONTROLS;
    try {
      const raw = localStorage.getItem(`mapctl:${storageKey}`);
      if (raw) return { ...DEFAULT_MAP_CONTROLS, ...JSON.parse(raw) };
    } catch {}
    return DEFAULT_MAP_CONTROLS;
  });
  useEffect(() => {
    try { localStorage.setItem(`mapctl:${storageKey}`, JSON.stringify(state)); } catch {}
  }, [state, storageKey]);
  const setBase = (base: BaseMapMode) => setState(s => ({ ...s, base }));
  const setPitch = (pitch: number) => setState(s => ({ ...s, pitch }));
  const setRotation = (rotation: number) => setState(s => ({ ...s, rotation }));
  const toggle = (k: MapLayerKey) => setState(s => ({ ...s, layers: { ...s.layers, [k]: !s.layers[k] } }));
  const setLayer = (k: MapLayerKey, v: boolean) => setState(s => ({ ...s, layers: { ...s.layers, [k]: v } }));
  return { state, setBase, setPitch, setRotation, toggle, setLayer };
}

export function MapControls({
  state, onBase, onPitch, onRotation, onToggle,
  className,
}: {
  state: MapControlsState;
  onBase: (b: BaseMapMode) => void;
  onPitch: (p: number) => void;
  onRotation: (r: number) => void;
  onToggle: (k: MapLayerKey) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(true);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    "Storm overlays": true, "Road labels": true,
  });
  const toggleGroup = (t: string) => setOpenGroups(g => ({ ...g, [t]: !g[t] }));

  return (
    <div className={cn("bg-card/95 backdrop-blur rounded-lg border border-border/60 shadow-elevated text-xs w-64", className)}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 border-b border-border/60"
      >
        <span className="flex items-center gap-1.5 font-semibold">
          <Settings2 className="w-3.5 h-3.5 text-storm" /> Map Controls
        </span>
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {open && (
        <div className="max-h-[460px] overflow-y-auto">
          {/* Base modes */}
          <div className="p-2 border-b border-border/60">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 px-1">Map Type</div>
            <div className="grid grid-cols-5 gap-1">
              {BASE_MODES.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => onBase(key)}
                  title={label}
                  className={cn(
                    "flex flex-col items-center gap-0.5 py-1.5 rounded border text-[10px]",
                    state.base === key
                      ? "bg-storm text-storm-foreground border-storm"
                      : "bg-background border-border hover:border-storm/50"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" /> {label}
                </button>
              ))}
            </div>
            {state.base === "3d" && (
              <div className="mt-2 grid grid-cols-2 gap-2 px-1">
                <label className="text-[10px] text-muted-foreground">
                  Pitch {state.pitch}°
                  <input type="range" min={0} max={60} value={state.pitch}
                    onChange={e => onPitch(+e.target.value)} className="w-full" />
                </label>
                <label className="text-[10px] text-muted-foreground">
                  Rotate {state.rotation}°
                  <input type="range" min={0} max={360} value={state.rotation}
                    onChange={e => onRotation(+e.target.value)} className="w-full" />
                </label>
              </div>
            )}
          </div>

          {/* Layer groups */}
          {GROUPS.map(g => {
            const Icon = g.icon;
            const expanded = openGroups[g.title];
            const activeCount = g.items.filter(i => state.layers[i.key]).length;
            return (
              <div key={g.title} className="border-b border-border/60 last:border-0">
                <button
                  onClick={() => toggleGroup(g.title)}
                  className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-accent/40"
                >
                  <span className="flex items-center gap-1.5 font-medium">
                    <Icon className="w-3 h-3 text-storm" /> {g.title}
                    {activeCount > 0 && (
                      <span className="px-1 rounded bg-storm/15 text-storm text-[9px]">{activeCount}</span>
                    )}
                  </span>
                  {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                {expanded && (
                  <div className="px-3 pb-2 space-y-1">
                    {g.items.map(i => (
                      <label key={i.key} className="flex items-center justify-between gap-2 cursor-pointer py-0.5">
                        <span className="text-[11px] text-foreground/90">{i.label}</span>
                        <input
                          type="checkbox"
                          checked={state.layers[i.key]}
                          onChange={() => onToggle(i.key)}
                          className="accent-[hsl(var(--storm))] w-3.5 h-3.5"
                        />
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Visual base-map background helper (mock — for non-Google maps). */
export function baseMapBackground(base: BaseMapMode): React.CSSProperties {
  switch (base) {
    case "satellite":
      return { background: "radial-gradient(ellipse at 30% 30%, hsl(140 30% 22%), hsl(140 25% 12%) 70%)" };
    case "hybrid":
      return { background: "radial-gradient(ellipse at 30% 30%, hsl(140 20% 25%), hsl(220 25% 15%) 75%)" };
    case "terrain":
      return { background: "linear-gradient(135deg, hsl(80 35% 78%), hsl(35 40% 70%) 60%, hsl(20 30% 55%))" };
    case "3d":
      return { background: "linear-gradient(180deg, hsl(210 40% 88%), hsl(210 25% 75%))" };
    default:
      return { background: "hsl(210 40% 92%)" };
  }
}
