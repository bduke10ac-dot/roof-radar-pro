import { useState } from "react";
import { Route, Layers, MapPin, Target, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { StormScoreBadge } from "@/components/StormScoreBadge";
import { useLeads } from "@/hooks/useLeads";
import { useMarkets } from "@/contexts/MarketContext";
import { toast } from "sonner";

export function MapView() {
  const { leads } = useLeads();
  const { activeMarket } = useMarkets();
  const [minScore, setMinScore] = useState([60]);
  const [zip, setZip] = useState("all");
  const [showSwath, setShowSwath] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [radius, setRadius] = useState([35]);

  const matchesMarket = (zipCode: string) => {
    if (!activeMarket || activeMarket.zips.length === 0) return true;
    return activeMarket.zips.includes(zipCode);
  };
  const visible = leads.filter(l =>
    l.stormScore >= minScore[0] &&
    (zip === "all" || l.zip === zip) &&
    matchesMarket(l.zip)
  );
  const zips = Array.from(new Set(leads.map(l => l.zip)));

  // Project lat/lng to a 0-100% box
  const lats = leads.map(l => l.lat);
  const lngs = leads.map(l => l.lng);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const project = (lat: number, lng: number) => ({
    left: `${((lng - minLng) / (maxLng - minLng)) * 88 + 6}%`,
    top: `${(1 - (lat - minLat) / (maxLat - minLat)) * 80 + 10}%`,
  });

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Territory map</h1>
          <p className="text-sm text-muted-foreground">{visible.length} properties match your filters</p>
        </div>
        <Button onClick={() => toast.success(`Route created with ${visible.length} stops`)}>
          <Route className="w-4 h-4 mr-2" />Create door-knocking route
        </Button>
      </header>

      <div className="grid lg:grid-cols-[280px_1fr] gap-5">
        <div className="bg-card rounded-xl p-5 shadow-card border border-border/60 space-y-5 h-fit">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Min storm score: {minScore[0]}</label>
            <Slider value={minScore} onValueChange={setMinScore} min={0} max={100} step={5} className="mt-2" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Geofence radius: {radius[0]} mi</label>
            <Slider value={radius} onValueChange={setRadius} min={5} max={100} step={5} className="mt-2" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">ZIP code</label>
            <Select value={zip} onValueChange={setZip}>
              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ZIPs</SelectItem>
                {zips.map(z => <SelectItem key={z} value={z}>{z}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border/60">
            <div className="flex items-center gap-2 text-sm">
              <Layers className="w-4 h-4 text-storm" /> Storm swath
            </div>
            <Switch checked={showSwath} onCheckedChange={setShowSwath} />
          </div>
        </div>

        <div className="relative rounded-xl overflow-hidden shadow-elevated border border-border/60 aspect-[4/3] lg:aspect-auto lg:min-h-[560px] bg-[hsl(210_40%_92%)]">
          {/* Stylized map background */}
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(hsl(210 30% 85%) 1px, transparent 1px),
              linear-gradient(90deg, hsl(210 30% 85%) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }} />
          {/* roads */}
          <div className="absolute top-1/3 left-0 right-0 h-2 bg-white/80" />
          <div className="absolute top-2/3 left-0 right-0 h-1.5 bg-white/70" />
          <div className="absolute top-0 bottom-0 left-1/4 w-1.5 bg-white/70" />
          <div className="absolute top-0 bottom-0 left-2/3 w-2 bg-white/80" />

          {/* Storm swath */}
          {showSwath && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute" style={{ left: "20%", top: "15%", width: "55%", height: "50%" }}>
                <div className="w-full h-full rounded-[40%] bg-warning/25 border-2 border-warning/50 backdrop-blur-[1px]" />
                <div className="absolute top-2 left-3 text-[10px] font-bold text-warning uppercase tracking-wider">Hail swath · 4/22</div>
              </div>
            </div>
          )}

          {/* Geofence */}
          <div className="absolute pointer-events-none" style={{ left: "55%", top: "60%", transform: "translate(-50%, -50%)" }}>
            <div
              className="rounded-full border-2 border-storm/60 bg-storm/10"
              style={{ width: `${radius[0] * 4}px`, height: `${radius[0] * 4}px` }}
            />
          </div>

          {/* Pins */}
          {visible.map(l => {
            const pos = project(l.lat, l.lng);
            const color = l.stormScore >= 85 ? "bg-warning" : l.stormScore >= 70 ? "bg-storm" : "bg-muted-foreground";
            return (
              <div key={l.id} className="absolute -translate-x-1/2 -translate-y-full group" style={pos}>
                <div className="relative">
                  {l.stormScore >= 85 && (
                    <div className={`absolute inset-0 rounded-full ${color} animate-pulse-ring`} />
                  )}
                  <div className={`relative w-6 h-6 rounded-full ${color} ring-2 ring-white shadow-elevated flex items-center justify-center`}>
                    <MapPin className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-primary text-primary-foreground text-[11px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition shadow-elevated">
                  {l.ownerName} · {l.stormScore}
                </div>
              </div>
            );
          })}

          {/* Legend */}
          <div className="absolute bottom-3 left-3 bg-card/95 backdrop-blur rounded-lg p-3 shadow-card border border-border/60 text-xs space-y-1.5">
            <div className="font-semibold mb-1">Storm score</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-warning" /> ≥ 85 (high)</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-storm" /> 70–84</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-muted-foreground" /> &lt; 70</div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-4 shadow-card border border-border/60">
        <h3 className="font-semibold mb-3 text-sm">Properties in view</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {visible.map(l => (
            <div key={l.id} className="p-3 rounded-lg bg-background border border-border/60 flex items-center justify-between">
              <div className="min-w-0">
                <div className="font-medium text-sm truncate">{l.ownerName}</div>
                <div className="text-xs text-muted-foreground truncate">{l.propertyAddress}</div>
              </div>
              <StormScoreBadge score={l.stormScore} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
