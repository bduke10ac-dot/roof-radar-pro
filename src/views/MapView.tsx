import { useEffect, useMemo, useRef, useState } from "react";
import { Route, Layers, MapPin, Target, Flame, CloudHail, Wind, Tornado, CloudRain, TreeDeciduous, Plus, Minus, Maximize2, Minimize2, Locate, Ruler, Move } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose, DrawerTrigger } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { MapControls, useMapControls, baseMapBackground } from "@/components/MapControls";
import { useMarkets } from "@/contexts/MarketContext";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StormScoreBadge } from "@/components/StormScoreBadge";
import { useMarketLeads } from "@/hooks/useMarketFilter";
import {
  DEFAULT_OVERLAYS, HAIL_THRESHOLDS, WIND_THRESHOLDS, EF_RATINGS, applyPreset, computeStormScore,
  HAIL_SWATHS, WIND_CORRIDORS, TORNADO_TRACKS, RAIN_ZONES, TREE_DAMAGE_ZONES,
  type OverlayState, type LayerPreset,
} from "@/lib/stormOverlays";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function MapView() {
  const { leads, allLeads, activeMarket } = useMarketLeads();
  const { markets, activeMarketId, setActiveMarketId } = useMarkets();
  const [minScore, setMinScore] = useState([60]);
  const [zip, setZip] = useState("all");
  const [radius, setRadius] = useState([35]);
  const [overlays, setOverlays] = useState<OverlayState>(DEFAULT_OVERLAYS);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [geoCenter, setGeoCenter] = useState({ x: 55, y: 60 });
  const [editRadiusOpen, setEditRadiusOpen] = useState(false);
  const mapWrapRef = useRef<HTMLDivElement>(null);
  const mapCtl = useMapControls("territory-map");
  const isMobile = useIsMobile();

  useEffect(() => {
    const onFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  const toggleFullscreen = async () => {
    const el = mapWrapRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) await el.requestFullscreen();
      else await document.exitFullscreen();
    } catch {}
  };

  const zoomIn = () => setZoom(z => Math.min(4, +(z + 0.25).toFixed(2)));
  const zoomOut = () => setZoom(z => Math.max(0.5, +(z - 0.25).toFixed(2)));
  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const dragRef = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setZoom(z => Math.max(0.5, Math.min(4, +(z + delta).toFixed(2))));
  };
  const onMouseDown = (e: React.MouseEvent) => {
    dragRef.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current) return;
    setPan({ x: dragRef.current.px + (e.clientX - dragRef.current.x), y: dragRef.current.py + (e.clientY - dragRef.current.y) });
  };
  const endDrag = () => { dragRef.current = null; };

  // Touch: pinch-zoom + 1-finger pan
  const touchRef = useRef<{
    mode: "pan" | "pinch" | null;
    startX?: number; startY?: number; startPanX?: number; startPanY?: number;
    startDist?: number; startZoom?: number;
  }>({ mode: null });
  const distance = (a: React.Touch, b: React.Touch) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      touchRef.current = { mode: "pinch", startDist: distance(e.touches[0], e.touches[1]), startZoom: zoom };
    } else if (e.touches.length === 1) {
      const t = e.touches[0];
      touchRef.current = { mode: "pan", startX: t.clientX, startY: t.clientY, startPanX: pan.x, startPanY: pan.y };
    }
  };
  const onTouchMove = (e: React.TouchEvent) => {
    const ref = touchRef.current;
    if (ref.mode === "pinch" && e.touches.length >= 2) {
      e.preventDefault();
      const d = distance(e.touches[0], e.touches[1]);
      const ratio = d / (ref.startDist || d);
      setZoom(Math.max(0.5, Math.min(4, +((ref.startZoom || 1) * ratio).toFixed(2))));
    } else if (ref.mode === "pan" && e.touches.length === 1) {
      const t = e.touches[0];
      setPan({
        x: (ref.startPanX || 0) + (t.clientX - (ref.startX || 0)),
        y: (ref.startPanY || 0) + (t.clientY - (ref.startY || 0)),
      });
    }
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 0) touchRef.current = { mode: null };
    else if (e.touches.length === 1) {
      const t = e.touches[0];
      touchRef.current = { mode: "pan", startX: t.clientX, startY: t.clientY, startPanX: pan.x, startPanY: pan.y };
    }
  };

  // Geofence drag (center + radius handle)
  const geoDragRef = useRef<{ kind: "move" | "resize"; startX: number; startY: number; startCx: number; startCy: number; startR: number } | null>(null);
  const beginGeoDrag = (kind: "move" | "resize", clientX: number, clientY: number) => {
    geoDragRef.current = { kind, startX: clientX, startY: clientY, startCx: geoCenter.x, startCy: geoCenter.y, startR: radius[0] };
    const move = (cx: number, cy: number) => {
      const ref = geoDragRef.current; const wrap = mapWrapRef.current;
      if (!ref || !wrap) return;
      const rect = wrap.getBoundingClientRect();
      if (ref.kind === "move") {
        const dxPct = ((cx - ref.startX) / rect.width) * 100;
        const dyPct = ((cy - ref.startY) / rect.height) * 100;
        setGeoCenter({
          x: Math.max(5, Math.min(95, ref.startCx + dxPct)),
          y: Math.max(5, Math.min(95, ref.startCy + dyPct)),
        });
      } else {
        const dx = cx - ref.startX; const dy = cy - ref.startY;
        const delta = (Math.abs(dx) > Math.abs(dy) ? dx : dy);
        const next = Math.max(5, Math.min(100, Math.round(ref.startR + delta / 4)));
        setRadius([next]);
      }
    };
    const onMM = (ev: MouseEvent) => move(ev.clientX, ev.clientY);
    const onTM = (ev: TouchEvent) => { if (ev.touches[0]) { ev.preventDefault(); move(ev.touches[0].clientX, ev.touches[0].clientY); } };
    const end = () => {
      geoDragRef.current = null;
      window.removeEventListener("mousemove", onMM);
      window.removeEventListener("mouseup", end);
      window.removeEventListener("touchmove", onTM);
      window.removeEventListener("touchend", end);
    };
    window.addEventListener("mousemove", onMM);
    window.addEventListener("mouseup", end);
    window.addEventListener("touchmove", onTM, { passive: false });
    window.addEventListener("touchend", end);
  };


  // Sync MapControls layer toggles -> storm overlay state
  useEffect(() => {
    setOverlays(o => ({
      ...o,
      hail: mapCtl.state.layers.stormHail,
      wind: mapCtl.state.layers.stormWind,
      rain: mapCtl.state.layers.stormRain,
      tornado: mapCtl.state.layers.stormTornado,
      leadHeatmap: mapCtl.state.layers.leadDensity,
    }));
  }, [mapCtl.state.layers.stormHail, mapCtl.state.layers.stormWind, mapCtl.state.layers.stormRain, mapCtl.state.layers.stormTornado, mapCtl.state.layers.leadDensity]);

  const update = (patch: Partial<OverlayState>) => setOverlays(o => ({ ...o, ...patch }));
  const preset = (p: LayerPreset) => setOverlays(o => applyPreset(o, p));

  const lats = leads.map(l => l.lat);
  const lngs = leads.map(l => l.lng);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
  const projectXY = (lat: number, lng: number) => ({
    x: ((lng - minLng) / (maxLng - minLng || 1)) * 88 + 6,
    y: (1 - (lat - minLat) / (maxLat - minLat || 1)) * 80 + 10,
  });

  // Live scored leads (uses overlays)
  const scored = useMemo(() => leads.map(l => {
    const pos = projectXY(l.lat, l.lng);
    const r = computeStormScore(l, pos, overlays);
    return { ...l, pos, liveScore: r.score, inHail: r.inHail, inWind: r.inWind, inTornado: r.inTornado, inRain: r.inRain };
  }), [leads, overlays]); // eslint-disable-line react-hooks/exhaustive-deps

  const visible = scored.filter(l => l.liveScore >= minScore[0] && (zip === "all" || l.zip === zip));
  const zips = Array.from(new Set(leads.map(l => l.zip))).filter(Boolean) as string[];

  const hailColor = (size: number) => {
    if (size >= 2.0) return "hsl(0 80% 55%)";
    if (size >= 1.5) return "hsl(15 85% 55%)";
    if (size >= 1.25) return "hsl(30 90% 55%)";
    if (size >= 1.0) return "hsl(45 90% 55%)";
    return "hsl(55 80% 60%)";
  };
  const windColor = (mph: number) => {
    if (mph >= 70) return "hsl(280 70% 55%)";
    if (mph >= 65) return "hsl(260 70% 60%)";
    if (mph >= 58) return "hsl(220 75% 55%)";
    if (mph >= 50) return "hsl(200 70% 55%)";
    return "hsl(190 60% 60%)";
  };

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Territory map</h1>
          <p className="text-sm text-muted-foreground">
            {visible.length} properties match your filters
            {activeMarket && <> · in <span className="text-storm font-medium">{activeMarket.name}</span> ({allLeads.length} unscoped)</>}
          </p>
        </div>
        <Button onClick={() => toast.success(`Route created with ${visible.length} stops`)}>
          <Route className="w-4 h-4 mr-2" />Create door-knocking route
        </Button>
      </header>

      <div className="grid lg:grid-cols-[320px_1fr] gap-5">
        {/* Layer panel */}
        <div className="bg-card rounded-xl shadow-card border border-border/60 h-fit">
          <div className="p-4 border-b border-border/60 space-y-3">
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
                <SelectTrigger className="mt-2 h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All ZIPs</SelectItem>
                  {zips.map(z => <SelectItem key={z} value={z}>{z}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="p-4 border-b border-border/60">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Layer presets</div>
            <div className="grid grid-cols-3 gap-1.5">
              {(["all","hail","wind","tornado","rain","none"] as LayerPreset[]).map(p => (
                <button key={p} onClick={() => preset(p)}
                  className="px-2 py-1.5 rounded-md text-[11px] font-medium border border-border bg-background hover:bg-accent capitalize">
                  {p === "none" ? "Clear" : p === "all" ? "All" : p}
                </button>
              ))}
            </div>
          </div>

          <Tabs defaultValue="hail" className="p-1">
            <TabsList className="grid grid-cols-5 h-9">
              <TabsTrigger value="hail" className="text-[11px] px-1"><CloudHail className="w-3.5 h-3.5" /></TabsTrigger>
              <TabsTrigger value="wind" className="text-[11px] px-1"><Wind className="w-3.5 h-3.5" /></TabsTrigger>
              <TabsTrigger value="tornado" className="text-[11px] px-1"><Tornado className="w-3.5 h-3.5" /></TabsTrigger>
              <TabsTrigger value="rain" className="text-[11px] px-1"><CloudRain className="w-3.5 h-3.5" /></TabsTrigger>
              <TabsTrigger value="other" className="text-[11px] px-1"><TreeDeciduous className="w-3.5 h-3.5" /></TabsTrigger>
            </TabsList>

            <TabsContent value="hail" className="p-3 space-y-3">
              <ToggleRow icon={<CloudHail className="w-4 h-4 text-warning" />} label="Hail swaths" checked={overlays.hail} onChange={v => update({ hail: v })} />
              <ChipFilter label="Min hail size" suffix={`"`} options={HAIL_THRESHOLDS} value={overlays.minHail} onChange={v => update({ minHail: v })} />
              <ToggleRow label="Show confidence score" checked={overlays.showHailConfidence} onChange={v => update({ showHailConfidence: v })} small />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px] text-muted-foreground">From</Label>
                  <Input type="date" value={overlays.hailDateFrom} onChange={e => update({ hailDateFrom: e.target.value })} className="h-8 text-xs" />
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground">To</Label>
                  <Input type="date" value={overlays.hailDateTo} onChange={e => update({ hailDateTo: e.target.value })} className="h-8 text-xs" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="wind" className="p-3 space-y-3">
              <ToggleRow icon={<Wind className="w-4 h-4 text-storm" />} label="Wind corridors" checked={overlays.wind} onChange={v => update({ wind: v })} />
              <ChipFilter label="Min wind speed" suffix=" mph" options={WIND_THRESHOLDS} value={overlays.minWind} onChange={v => update({ minWind: v })} />
              <ToggleRow label="Show direction arrows" checked={overlays.showWindDirection} onChange={v => update({ showWindDirection: v })} small />
              <ToggleRow label="Affected homes inside zone" checked={overlays.showWindAffected} onChange={v => update({ showWindAffected: v })} small />
            </TabsContent>

            <TabsContent value="tornado" className="p-3 space-y-3">
              <ToggleRow icon={<Tornado className="w-4 h-4 text-destructive" />} label="Tornado tracks" checked={overlays.tornado} onChange={v => update({ tornado: v })} />
              <div>
                <Label className="text-xs text-muted-foreground">Min EF rating</Label>
                <div className="flex gap-1 mt-1.5">
                  {EF_RATINGS.map(ef => (
                    <button key={ef} onClick={() => update({ efRating: ef })}
                      className={cn("flex-1 py-1 rounded text-xs font-medium border",
                        overlays.efRating === ef ? "bg-destructive text-destructive-foreground border-destructive" : "bg-background border-border hover:border-destructive/50")}>
                      EF{ef}
                    </button>
                  ))}
                </div>
              </div>
              <ToggleRow label="Show damage path width" checked={overlays.showTornadoWidth} onChange={v => update({ showTornadoWidth: v })} small />
            </TabsContent>

            <TabsContent value="rain" className="p-3 space-y-3">
              <ToggleRow icon={<CloudRain className="w-4 h-4 text-storm" />} label="Heavy rain zones" checked={overlays.rain} onChange={v => update({ rain: v })} />
              <p className="text-[11px] text-muted-foreground">Repeat-storm areas highlighted. Older roofs (15+ yrs) inside high-rain zones are flagged in scoring.</p>
            </TabsContent>

            <TabsContent value="other" className="p-3 space-y-3">
              <ToggleRow icon={<TreeDeciduous className="w-4 h-4 text-success" />} label="Tree damage / debris" checked={overlays.treeDamage} onChange={v => update({ treeDamage: v })} />
              <p className="text-[11px] text-muted-foreground">Includes emergency call density and power-outage correlation (placeholder data).</p>
              <div className="border-t border-border/60 pt-3">
                <ToggleRow icon={<Flame className="w-4 h-4 text-warning" />} label="Lead density heatmap" checked={overlays.leadHeatmap} onChange={v => update({ leadHeatmap: v })} />
              </div>
            </TabsContent>
          </Tabs>

          {activeMarket && (
            <div className="m-3 rounded-md p-3 bg-storm/10 border border-storm/30 text-xs">
              <div className="flex items-center gap-1.5 text-storm font-semibold mb-1">
                <Target className="w-3.5 h-3.5" /> Active market
              </div>
              <div className="font-medium text-foreground">{activeMarket.name}</div>
            </div>
          )}
        </div>

        {/* Map canvas */}
        <div
          ref={mapWrapRef}
          className={cn(
            "relative rounded-xl overflow-hidden shadow-elevated border border-border/60 select-none",
            isFullscreen ? "min-h-screen" : "min-h-[420px] lg:min-h-[640px]"
          )}
          style={{ ...baseMapBackground(mapCtl.state.base), touchAction: "none" }}
          onWheel={onWheel}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Transformed scene (zoom + pan) */}
          <div
            className="absolute inset-0 origin-center transition-transform duration-100 ease-out"
            style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, cursor: dragRef.current ? "grabbing" : "grab" }}
          >
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(hsl(210 30% 85%) 1px, transparent 1px), linear-gradient(90deg, hsl(210 30% 85%) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }} />
          <div className="absolute top-1/3 left-0 right-0 h-2 bg-white/80" />
          <div className="absolute top-2/3 left-0 right-0 h-1.5 bg-white/70" />
          <div className="absolute top-0 bottom-0 left-1/4 w-1.5 bg-white/70" />
          <div className="absolute top-0 bottom-0 left-2/3 w-2 bg-white/80" />

          {/* Active market boundary */}
          {activeMarket && (mapCtl.state.layers.bCustom || mapCtl.state.layers.bCity) && (
            <div className="absolute pointer-events-none border-2 border-dashed border-storm rounded-2xl"
              style={{ left: "8%", top: "6%", right: "6%", bottom: "10%" }}>
              <div className="absolute -top-3 left-3 px-2 py-0.5 bg-storm text-storm-foreground text-[10px] font-bold rounded uppercase tracking-wider">
                {activeMarket.name}
              </div>
            </div>
          )}

          {/* SVG overlays */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Rain zones (under everything) */}
            {overlays.rain && RAIN_ZONES.map(r => (
              <g key={r.id}>
                <rect x={r.x} y={r.y} width={r.w} height={r.h} rx="3"
                  fill="hsl(210 90% 55%)" fillOpacity={0.12 + r.intensity * 0.18}
                  stroke="hsl(210 90% 50%)" strokeOpacity={0.5} strokeWidth={0.3} strokeDasharray="1.5 1" />
              </g>
            ))}
            {/* Tree damage */}
            {overlays.treeDamage && TREE_DAMAGE_ZONES.map(t => (
              <circle key={t.id} cx={t.x} cy={t.y} r={t.r}
                fill="hsl(140 50% 45%)" fillOpacity={0.18}
                stroke="hsl(140 60% 35%)" strokeOpacity={0.7} strokeWidth={0.3} strokeDasharray="0.8 0.8" />
            ))}
            {/* Hail swaths */}
            {overlays.hail && HAIL_SWATHS
              .filter(s => s.hailSize >= overlays.minHail)
              .filter(s => !overlays.hailDateFrom || s.date >= overlays.hailDateFrom)
              .filter(s => !overlays.hailDateTo || s.date <= overlays.hailDateTo)
              .map(s => (
                <g key={s.id}>
                  <rect x={s.x} y={s.y} width={s.w} height={s.h} rx="6"
                    fill={hailColor(s.hailSize)} fillOpacity={0.22}
                    stroke={hailColor(s.hailSize)} strokeOpacity={0.85} strokeWidth={0.4} />
                </g>
            ))}
            {/* Wind corridors */}
            {overlays.wind && WIND_CORRIDORS.filter(w => w.windSpeed >= overlays.minWind).map(w => (
              <g key={w.id}>
                <line x1={w.x1} y1={w.y1} x2={w.x2} y2={w.y2}
                  stroke={windColor(w.windSpeed)} strokeWidth={w.windSpeed / 18} strokeOpacity={0.55} strokeLinecap="round" />
                {overlays.showWindDirection && (
                  <polygon
                    points={`${w.x2},${w.y2} ${w.x2 - 3},${w.y2 - 1.5} ${w.x2 - 3},${w.y2 + 1.5}`}
                    transform={`rotate(${(Math.atan2(w.y2 - w.y1, w.x2 - w.x1) * 180) / Math.PI}, ${w.x2}, ${w.y2})`}
                    fill={windColor(w.windSpeed)} fillOpacity={0.9} />
                )}
              </g>
            ))}
            {/* Tornado tracks */}
            {overlays.tornado && TORNADO_TRACKS.filter(t => t.ef >= overlays.efRating).map(t => (
              <g key={t.id}>
                {overlays.showTornadoWidth && (
                  <line x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
                    stroke="hsl(0 80% 50%)" strokeOpacity={0.18} strokeWidth={Math.max(2, t.widthYd / 60)} strokeLinecap="round" />
                )}
                <line x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
                  stroke="hsl(0 85% 45%)" strokeWidth={0.6} strokeDasharray="1.5 1" strokeLinecap="round" />
              </g>
            ))}
          </svg>

          {/* Hail labels (HTML so tooltips look right) */}
          {overlays.hail && HAIL_SWATHS
            .filter(s => s.hailSize >= overlays.minHail)
            .map(s => (
              <div key={`hl-${s.id}`} className="absolute pointer-events-none" style={{ left: `${s.x + 1}%`, top: `${s.y + 1}%` }}>
                <div className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-card/90 border border-border/60"
                  style={{ color: hailColor(s.hailSize) }}>
                  {s.hailSize}" hail · {s.date}{overlays.showHailConfidence && ` · ${s.confidence}%`}
                </div>
              </div>
          ))}
          {/* Wind labels */}
          {overlays.wind && overlays.showWindAffected && WIND_CORRIDORS
            .filter(w => w.windSpeed >= overlays.minWind)
            .map(w => (
              <div key={`wl-${w.id}`} className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${(w.x1 + w.x2) / 2}%`, top: `${(w.y1 + w.y2) / 2}%` }}>
                <div className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-card/90 border border-border/60"
                  style={{ color: windColor(w.windSpeed) }}>
                  {w.windSpeed} mph · {w.affectedHomes.toLocaleString()} homes
                </div>
              </div>
          ))}
          {/* Tornado labels */}
          {overlays.tornado && TORNADO_TRACKS.filter(t => t.ef >= overlays.efRating).map(t => (
            <div key={`tl-${t.id}`} className="absolute pointer-events-none"
              style={{ left: `${(t.x1 + t.x2) / 2}%`, top: `${(t.y1 + t.y2) / 2}%` }}>
              <div className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-destructive text-destructive-foreground -translate-x-1/2 -translate-y-1/2">
                EF{t.ef} · {t.widthYd}yd · {t.date}
              </div>
            </div>
          ))}

          {/* Geofence (draggable center + resize handle) */}
          <div
            className="absolute"
            style={{ left: `${geoCenter.x}%`, top: `${geoCenter.y}%`, transform: "translate(-50%, -50%)" }}
          >
            <div
              className="relative rounded-full border-2 border-storm/70 bg-storm/10 shadow-elevated"
              style={{ width: `${radius[0] * 4}px`, height: `${radius[0] * 4}px` }}
            >
              {/* Center handle (move) */}
              <button
                type="button"
                onMouseDown={(e) => { e.stopPropagation(); beginGeoDrag("move", e.clientX, e.clientY); }}
                onTouchStart={(e) => { e.stopPropagation(); const t = e.touches[0]; beginGeoDrag("move", t.clientX, t.clientY); }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-storm text-storm-foreground shadow-elevated flex items-center justify-center ring-4 ring-background/80 active:scale-95 touch-none"
                title="Drag to move geofence"
                aria-label="Move geofence"
              >
                <Move className="w-4 h-4" />
              </button>
              {/* Resize handle (radius) */}
              <button
                type="button"
                onMouseDown={(e) => { e.stopPropagation(); beginGeoDrag("resize", e.clientX, e.clientY); }}
                onTouchStart={(e) => { e.stopPropagation(); const t = e.touches[0]; beginGeoDrag("resize", t.clientX, t.clientY); }}
                onClick={(e) => e.stopPropagation()}
                className="absolute -right-5 -bottom-5 w-11 h-11 rounded-full bg-warning text-background shadow-elevated flex items-center justify-center ring-4 ring-background/80 active:scale-95 touch-none"
                title="Drag to change radius"
                aria-label="Resize geofence"
              >
                <Ruler className="w-4 h-4" />
              </button>
              {/* Radius badge + Edit button */}
              <div className="absolute left-1/2 -top-3 -translate-x-1/2 -translate-y-full flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-card/95 backdrop-blur border border-border/60 text-[11px] font-bold tabular-nums shadow-card">
                  {radius[0]} mi
                </span>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setEditRadiusOpen(true); }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  className="px-2 py-0.5 rounded-full bg-storm text-storm-foreground text-[11px] font-semibold shadow-card active:scale-95"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>


          {/* Lead heatmap */}
          {overlays.leadHeatmap && visible.filter(l => l.liveScore >= 80).map(l => (
            <div key={`h-${l.id}`} className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
              style={{ left: `${l.pos.x}%`, top: `${l.pos.y}%`, width: 120, height: 120, background: "hsl(var(--warning) / 0.45)" }} />
          ))}

          {/* Pins */}
          {visible.map(l => {
            const color = l.liveScore >= 85 ? "bg-warning" : l.liveScore >= 70 ? "bg-storm" : "bg-muted-foreground";
            return (
              <div key={l.id} className="absolute -translate-x-1/2 -translate-y-full group" style={{ left: `${l.pos.x}%`, top: `${l.pos.y}%` }}>
                <div className="relative">
                  {l.liveScore >= 85 && <div className={`absolute inset-0 rounded-full ${color} animate-pulse-ring`} />}
                  <div className={`relative w-6 h-6 rounded-full ${color} ring-2 ring-white shadow-elevated flex items-center justify-center`}>
                    <MapPin className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-primary text-primary-foreground text-[11px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition shadow-elevated">
                  {l.ownerName} · score {l.liveScore}
                  {(l.inHail || l.inWind || l.inTornado || l.inRain) && <> · {[l.inHail && "hail", l.inWind && "wind", l.inTornado && "tornado", l.inRain && "rain"].filter(Boolean).join("+")}</>}
                </div>
              </div>
            );
          })}
          </div>
          {/* End transformed scene */}

          {/* Floating Map Controls (outside transform) */}
          <div className="absolute top-3 right-3 z-20" onMouseDown={(e) => e.stopPropagation()} onWheel={(e) => e.stopPropagation()}>
            <MapControls
              state={mapCtl.state}
              onBase={mapCtl.setBase}
              onPitch={mapCtl.setPitch}
              onRotation={mapCtl.setRotation}
              onToggle={mapCtl.toggle}
            />
          </div>

          {/* Zoom + fullscreen toolbar */}
          <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5" onMouseDown={(e) => e.stopPropagation()} onWheel={(e) => e.stopPropagation()}>
            <button onClick={zoomIn} title="Zoom in" className="w-9 h-9 rounded-md bg-card/95 backdrop-blur border border-border/60 shadow-card flex items-center justify-center hover:bg-accent">
              <Plus className="w-4 h-4" />
            </button>
            <button onClick={zoomOut} title="Zoom out" className="w-9 h-9 rounded-md bg-card/95 backdrop-blur border border-border/60 shadow-card flex items-center justify-center hover:bg-accent">
              <Minus className="w-4 h-4" />
            </button>
            <button onClick={resetView} title="Reset view" className="w-9 h-9 rounded-md bg-card/95 backdrop-blur border border-border/60 shadow-card flex items-center justify-center hover:bg-accent">
              <Locate className="w-4 h-4" />
            </button>
            <button onClick={toggleFullscreen} title={isFullscreen ? "Exit fullscreen" : "Fullscreen"} className="w-9 h-9 rounded-md bg-card/95 backdrop-blur border border-border/60 shadow-card flex items-center justify-center hover:bg-accent">
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <div className="px-1.5 py-0.5 rounded bg-card/95 backdrop-blur border border-border/60 text-[10px] text-center font-semibold tabular-nums">
              {Math.round(zoom * 100)}%
            </div>
          </div>

          {/* Market quick-selector */}
          <div className="absolute bottom-3 right-3 z-20 w-56 max-w-[calc(100vw-1.5rem)]" onMouseDown={(e) => e.stopPropagation()} onWheel={(e) => e.stopPropagation()}>
            <div className="bg-card/95 backdrop-blur rounded-lg border border-border/60 shadow-elevated p-2">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 px-1 flex items-center gap-1">
                <Target className="w-3 h-3 text-storm" /> Active market
              </div>
              <Select value={activeMarketId ?? "none"} onValueChange={(v) => setActiveMarketId(v === "none" ? null : v)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="No market selected" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">All territories</SelectItem>
                  {markets.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>


          {/* Legend */}
          <div className="absolute bottom-3 left-3 bg-card/95 backdrop-blur rounded-lg p-3 shadow-card border border-border/60 text-[11px] space-y-2 max-w-[220px]">
            {overlays.hail && (
              <LegendRow title="Hail size">
                {[0.75, 1.0, 1.5, 2.0].map(s => (
                  <span key={s} className="inline-flex items-center gap-1">
                    <span className="w-3 h-3 rounded" style={{ background: hailColor(s) }} /> {s}"
                  </span>
                ))}
              </LegendRow>
            )}
            {overlays.wind && (
              <LegendRow title="Wind mph">
                {[50, 58, 65, 70].map(s => (
                  <span key={s} className="inline-flex items-center gap-1">
                    <span className="w-3 h-1.5 rounded" style={{ background: windColor(s) }} /> {s}+
                  </span>
                ))}
              </LegendRow>
            )}
            {overlays.tornado && (
              <LegendRow title="Tornado">
                <span className="inline-flex items-center gap-1"><span className="w-4 h-0.5 bg-destructive" /> track</span>
              </LegendRow>
            )}
            {overlays.rain && (
              <LegendRow title="Rain"><span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-storm/50" /> heavy</span></LegendRow>
            )}
            {overlays.leadHeatmap && (
              <LegendRow title="Leads"><span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-warning/60 blur-[1px]" /> density</span></LegendRow>
            )}
            <div className="pt-1.5 border-t border-border/60 flex flex-wrap gap-x-3 gap-y-1">
              <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-warning" /> ≥85</span>
              <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-storm" /> 70–84</span>
              <span className="inline-flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-muted-foreground" /> &lt;70</span>
            </div>
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
                {(l.inHail || l.inWind || l.inTornado || l.inRain) && (
                  <div className="text-[10px] text-storm mt-0.5">
                    {[l.inHail && "in hail", l.inWind && "wind path", l.inTornado && "tornado", l.inRain && "rain zone"].filter(Boolean).join(" · ")}
                  </div>
                )}
              </div>
              <StormScoreBadge score={l.liveScore} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ icon, label, checked, onChange, small }: { icon?: React.ReactNode; label: string; checked: boolean; onChange: (v: boolean) => void; small?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div className={cn("flex items-center gap-2", small ? "text-xs text-muted-foreground" : "text-sm")}>
        {icon}{label}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function ChipFilter({ label, options, value, onChange, suffix }: { label: string; options: number[]; value: number; onChange: (v: number) => void; suffix?: string }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex flex-wrap gap-1 mt-1.5">
        {options.map(o => (
          <button key={o} onClick={() => onChange(o)}
            className={cn("px-2 py-1 rounded text-[11px] font-medium border",
              value === o ? "bg-storm text-storm-foreground border-storm" : "bg-background border-border hover:border-storm/50")}>
            {o}{suffix}+
          </button>
        ))}
      </div>
    </div>
  );
}

function LegendRow({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="font-semibold mb-0.5">{title}</div>
      <div className="flex flex-wrap gap-x-2 gap-y-1 text-muted-foreground">{children}</div>
    </div>
  );
}
