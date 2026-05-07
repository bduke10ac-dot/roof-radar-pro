import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CloudLightning, Cloud, CloudRain, Wind, Zap, Tornado, Radar,
  Thermometer, Droplets, Gauge, AlertTriangle, Navigation, Satellite, Eye,
  MapPin, Clock, TrendingUp, Megaphone, Activity,
} from "lucide-react";
import { type StormCell } from "@/lib/mockWeather";
import { useWeather } from "@/contexts/WeatherContext";
import { MapControls, useMapControls, baseMapBackground } from "@/components/MapControls";

type LayerKey =
  | "radar" | "hail" | "wind" | "rain" | "lightning"
  | "tornado" | "severe" | "watches" | "tracks" | "future" | "satellite";

const LAYER_DEFS: { key: LayerKey; label: string; icon: any }[] = [
  { key: "radar",     label: "Live Radar",     icon: Radar },
  { key: "hail",      label: "Hail",           icon: CloudLightning },
  { key: "wind",      label: "Wind",           icon: Wind },
  { key: "rain",      label: "Rain",           icon: CloudRain },
  { key: "lightning", label: "Lightning",      icon: Zap },
  { key: "tornado",   label: "Tornado Warn.",  icon: Tornado },
  { key: "severe",    label: "Severe T-Storm", icon: AlertTriangle },
  { key: "watches",   label: "Watches",        icon: Eye },
  { key: "tracks",    label: "Storm Tracks",   icon: Navigation },
  { key: "future",    label: "Future Radar",   icon: Clock },
  { key: "satellite", label: "Satellite",      icon: Satellite },
];

const CELL_ICON: Record<StormCell["type"], any> = {
  hail: CloudLightning, wind: Wind, tornado: Tornado, rain: CloudRain, lightning: Zap,
};
const CELL_COLOR: Record<StormCell["type"], string> = {
  hail: "bg-warning text-warning-foreground",
  wind: "bg-storm text-white",
  tornado: "bg-destructive text-destructive-foreground",
  rain: "bg-primary text-primary-foreground",
  lightning: "bg-accent text-accent-foreground",
};

export function WeatherCommandCenter() {
  const { conditions, cells, alerts, marketImpacts, rooferAlerts, opportunityScore, lastTick } = useWeather();
  const mapCtl = useMapControls("command-center");
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>({
    radar: true, hail: true, wind: true, rain: false, lightning: true,
    tornado: true, severe: true, watches: false, tracks: true, future: false, satellite: false,
  });

  const visibleCells = cells.filter(c =>
    (c.type === "hail" && layers.hail) ||
    (c.type === "wind" && layers.wind) ||
    (c.type === "rain" && layers.rain) ||
    (c.type === "lightning" && layers.lightning) ||
    (c.type === "tornado" && layers.tornado)
  );

  const nearest = cells.reduce((a, b) => (a.etaMinutes < b.etaMinutes ? a : b));
  const toggle = (k: LayerKey) => setLayers(s => ({ ...s, [k]: !s[k] }));

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CloudLightning className="w-5 h-5 text-storm" />
            Storm Command Center
          </h2>
          <p className="text-xs text-muted-foreground">
            Live radar driving lead alerts, market impacts, and recommended actions.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Activity className="w-3 h-3 text-success animate-pulse" />
          <span className="text-muted-foreground">Live · updated {new Date(lastTick).toLocaleTimeString()}</span>
        </div>
      </div>

      {/* HERO MAP — real Leaflet map with live RainViewer radar + NWS polygons */}
      <div className="relative rounded-xl overflow-hidden border border-border/60 shadow-card h-[320px] md:h-[460px] w-full max-w-full">
        <RealMap
          showRadar={layers.radar}
          pins={[]}
          center={[37.5, -97]}
          zoom={4}
        />
        {/* Layer chips — scrollable on mobile so they never overflow */}
        <div className="absolute top-2 left-2 right-2 z-[500] flex gap-1.5 overflow-x-auto no-scrollbar">
          {LAYER_DEFS.slice(0, 6).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => toggle(key)}
              className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium border transition ${
                layers[key]
                  ? "bg-white text-slate-900 border-white"
                  : "bg-black/40 text-white/80 border-white/20 hover:bg-black/60"
              }`}
            >
              <Icon className="w-3 h-3" /> {label}
            </button>
          ))}
        </div>

        {/* Floating cards — desktop only */}
        <Card className="hidden md:block absolute bottom-3 left-3 w-56 p-3 bg-card/95 backdrop-blur">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Current</span>
            <Cloud className="w-4 h-4 text-storm" />
          </div>
          <div className="text-3xl font-bold leading-none">{conditions.tempF}°F</div>
          <div className="text-xs text-muted-foreground">Feels {conditions.feelsLikeF}° · {conditions.conditions}</div>
          <div className="grid grid-cols-2 gap-1 mt-2 text-[11px]">
            <span className="flex items-center gap-1"><Wind className="w-3 h-3"/> {conditions.windMph} ({conditions.gustMph}g) {conditions.windDir}</span>
            <span className="flex items-center gap-1"><Droplets className="w-3 h-3"/> {conditions.humidity}%</span>
            <span className="flex items-center gap-1"><Thermometer className="w-3 h-3"/> Dew {conditions.dewPointF}°</span>
            <span className="flex items-center gap-1"><Gauge className="w-3 h-3"/> {conditions.pressureInHg}"</span>
          </div>
        </Card>

        <Card className="hidden md:block absolute top-14 left-3 w-64 p-3 bg-card/95 backdrop-blur max-h-[260px] overflow-auto z-20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Active Alerts</span>
            <Badge variant="destructive" className="text-[10px]">{alerts.length}</Badge>
          </div>
          <div className="space-y-1.5">
            {alerts.map(a => (
              <div key={a.id} className="flex items-start gap-2 text-[11px] p-1.5 rounded bg-background border border-border/60">
                <AlertTriangle className={`w-3 h-3 mt-0.5 shrink-0 ${a.level === "warning" ? "text-destructive" : a.level === "watch" ? "text-warning" : "text-storm"}`} />
                <div className="min-w-0">
                  <div className="font-medium capitalize">{a.type.replace("-", " ")} {a.level}</div>
                  <div className="text-muted-foreground truncate">{a.area} · until {a.expires}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="hidden md:block absolute bottom-3 right-3 w-56 p-3 bg-card/95 backdrop-blur">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold uppercase text-muted-foreground">Opportunity</span>
            <TrendingUp className="w-4 h-4 text-success" />
          </div>
          <div className="text-3xl font-bold leading-none text-storm">{opportunityScore || 0}</div>
          <div className="text-xs text-muted-foreground">Live storm opportunity score</div>
          <div className="mt-2 text-[11px] flex items-center gap-1">
            <MapPin className="w-3 h-3 text-storm" />
            Nearest: {nearest.label} · ETA {nearest.etaMinutes}m
          </div>
        </Card>
      </div>

      {/* Mobile summary cards — shown below the map */}
      <div className="grid grid-cols-2 gap-3 md:hidden">
        <Card className="p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold uppercase text-muted-foreground">Current</span>
            <Cloud className="w-3.5 h-3.5 text-storm" />
          </div>
          <div className="text-2xl font-bold leading-none">{conditions.tempF}°F</div>
          <div className="text-[11px] text-muted-foreground">{conditions.conditions}</div>
          <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
            <Wind className="w-3 h-3" /> {conditions.windMph} mph {conditions.windDir}
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold uppercase text-muted-foreground">Opportunity</span>
            <TrendingUp className="w-3.5 h-3.5 text-success" />
          </div>
          <div className="text-2xl font-bold leading-none text-storm">{opportunityScore || 0}</div>
          <div className="text-[11px] text-muted-foreground">{alerts.length} active alerts</div>
          <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-storm" /> ETA {nearest.etaMinutes}m
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-3 md:gap-4">
        <CollapsiblePanel
          icon={Megaphone}
          title="Roofer Action Alerts"
          count={rooferAlerts.length}
          className="lg:col-span-1"
        >
          <div className="space-y-1.5 md:space-y-2">
            {rooferAlerts.slice(0, 7).map(a => (
              <div key={a.id} className="text-[11px] md:text-xs p-2 rounded-md border border-border/60 bg-background text-foreground leading-snug">
                {a.text}
              </div>
            ))}
          </div>
        </CollapsiblePanel>

        <CollapsiblePanel
          icon={MapPin}
          title="Saved Markets — Live Impact"
          count={marketImpacts.length}
          className="lg:col-span-2"
        >
          <div className="space-y-1.5 md:space-y-2">
            {marketImpacts.length === 0 && (
              <div className="text-xs text-muted-foreground">No saved markets. Build one in Market Targeting.</div>
            )}
            {marketImpacts.map(m => {
              const Icon = CELL_ICON[m.type];
              return (
                <div key={m.marketId} className="flex items-center justify-between gap-2 p-2 rounded-md bg-background border border-border/60">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${CELL_COLOR[m.type]}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs md:text-sm font-medium truncate">{m.marketName}</div>
                      <div className="text-[10px] md:text-[11px] text-muted-foreground truncate">{m.status} · ETA {m.etaMinutes}m · Sev {m.severity}</div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 text-[11px] px-2 shrink-0">Trigger</Button>
                </div>
              );
            })}
          </div>
        </CollapsiblePanel>
      </div>
    </section>
  );
}

function CollapsiblePanel({
  icon: Icon, title, count, children, className = "",
}: { icon: any; title: string; count: number; children: React.ReactNode; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Card className={`bg-card border-border/60 overflow-hidden ${className}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-3 md:px-4 py-3 text-left hover:bg-accent/40 transition-colors"
      >
        <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
        <h3 className="font-semibold text-xs md:text-sm flex-1">{title}</h3>
        <Badge variant="outline" className="text-[10px]">{count}</Badge>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-3 md:px-4 pb-3 md:pb-4">{children}</div>}
    </Card>
  );
}
