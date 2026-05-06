import { useState } from "react";
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

      {/* HERO MAP */}
      <div className="relative rounded-xl overflow-hidden border border-border/60 shadow-card h-[460px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        {layers.radar && (
          <div className="absolute inset-0 opacity-60"
               style={{ backgroundImage: "radial-gradient(circle at 30% 40%, hsl(var(--storm)/0.55), transparent 35%), radial-gradient(circle at 70% 55%, hsl(var(--warning)/0.5), transparent 30%), radial-gradient(circle at 80% 70%, hsl(var(--destructive)/0.5), transparent 25%)" }} />
        )}
        {layers.satellite && (
          <div className="absolute inset-0 opacity-40 mix-blend-screen"
               style={{ backgroundImage: "radial-gradient(ellipse at 50% 50%, white, transparent 60%)" }} />
        )}
        <svg className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none">
          {[...Array(10)].map((_, i) => (
            <g key={i}>
              <line x1={`${i * 10}%`} y1="0" x2={`${i * 10}%`} y2="100%" stroke="white" strokeWidth="0.5" />
              <line y1={`${i * 10}%`} x1="0" y2={`${i * 10}%`} x2="100%" stroke="white" strokeWidth="0.5" />
            </g>
          ))}
        </svg>

        {visibleCells.map(c => {
          const Icon = CELL_ICON[c.type];
          return (
            <div key={c.id} className="absolute" style={{ left: `${c.x}%`, top: `${c.y}%`, transform: "translate(-50%,-50%)" }}>
              {layers.tracks && (
                <div className="absolute left-1/2 top-1/2 w-20 h-0.5 bg-white/70 origin-left"
                     style={{ transform: `rotate(${c.headingDeg}deg)` }} />
              )}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white/40 ${CELL_COLOR[c.type]} animate-pulse`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="mt-1 text-[10px] text-white bg-black/50 px-1.5 py-0.5 rounded whitespace-nowrap">
                {c.label} · ETA {c.etaMinutes}m
              </div>
            </div>
          );
        })}

        <div className="absolute top-3 left-3 right-3 flex flex-wrap gap-1.5 max-w-[70%]">
          {LAYER_DEFS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => toggle(key)}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium border transition ${
                layers[key]
                  ? "bg-white text-slate-900 border-white"
                  : "bg-black/40 text-white/80 border-white/20 hover:bg-black/60"
              }`}
            >
              <Icon className="w-3 h-3" /> {label}
            </button>
          ))}
        </div>

        <Card className="absolute bottom-3 left-3 w-56 p-3 bg-card/95 backdrop-blur">
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

        <Card className="absolute top-3 right-3 w-64 p-3 bg-card/95 backdrop-blur max-h-[280px] overflow-auto">
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

        <Card className="absolute bottom-3 right-3 w-56 p-3 bg-card/95 backdrop-blur">
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

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-4 lg:col-span-1">
          <div className="flex items-center gap-2 mb-3">
            <Megaphone className="w-4 h-4 text-storm" />
            <h3 className="font-semibold text-sm">Roofer Action Alerts</h3>
          </div>
          <div className="space-y-2">
            {rooferAlerts.slice(0, 7).map(a => (
              <div key={a.id} className={`text-xs p-2 rounded-md border ${
                a.tone === "destructive" ? "bg-destructive/10 border-destructive/40 text-destructive" :
                a.tone === "warning" ? "bg-warning/10 border-warning/40" :
                a.tone === "success" ? "bg-success/10 border-success/40" :
                "bg-storm/10 border-storm/40"
              }`}>{a.text}</div>
            ))}
          </div>
        </Card>

        <Card className="p-4 lg:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-storm" />
            <h3 className="font-semibold text-sm">Saved Markets — Live Weather Impact</h3>
          </div>
          <div className="space-y-2">
            {marketImpacts.length === 0 && (
              <div className="text-xs text-muted-foreground">No saved markets. Build one in Market Targeting.</div>
            )}
            {marketImpacts.map(m => {
              const Icon = CELL_ICON[m.type];
              return (
                <div key={m.marketId} className="flex items-center justify-between p-2 rounded-md bg-background border border-border/60">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center ${CELL_COLOR[m.type]}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{m.marketName}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{m.status} · {m.recommendedAction}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="text-[10px]">Sev {m.severity}</Badge>
                    <Badge variant="outline" className="text-[10px]">ETA {m.etaMinutes}m</Badge>
                    <Button size="sm" variant="outline" className="h-7 text-[11px]">Trigger</Button>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground mt-3">
            Storms passing a saved market create storm events, flag affected properties, boost storm scores, and queue inspection + door-knock campaigns.
          </p>
        </Card>
      </div>
    </section>
  );
}
