import { useEffect, useMemo, useRef, useState } from "react";
import { Route, Layers, MapPin, Target, Flame, CloudHail, Wind, Tornado, CloudRain, TreeDeciduous, Plus, Minus, Maximize2, Minimize2, Locate, Ruler, Move, Phone, Navigation, ClipboardCheck, MessageSquare, Loader2 } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { MapControls, useMapControls } from "@/components/MapControls";
import { useMarkets } from "@/contexts/MarketContext";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StormScoreBadge, StatusBadge, ConsentBadge } from "@/components/StormScoreBadge";
import { useMarketLeads } from "@/hooks/useMarketFilter";
import { useLeads } from "@/hooks/useLeads";
import { useGeocodePending } from "@/hooks/useGeocodePending";
import { useMapPrefs } from "@/hooks/useMapPrefs";
import {
  DEFAULT_OVERLAYS, HAIL_THRESHOLDS, WIND_THRESHOLDS, EF_RATINGS, applyPreset, computeStormScore,
  HAIL_SWATHS, WIND_CORRIDORS, TORNADO_TRACKS, RAIN_ZONES, TREE_DAMAGE_ZONES,
  type OverlayState, type LayerPreset,
} from "@/lib/stormOverlays";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { NwsAlertsPanel } from "@/components/NwsAlertsPanel";
import { useNwsAlerts } from "@/hooks/useNwsAlerts";

import { useDemoMode } from "@/contexts/DemoModeContext";
import { RealMap } from "@/components/RealMap";

export function MapView() {
  const { demoMode } = useDemoMode();
  const { leads, allLeads, activeMarket } = useMarketLeads();
  const { markets, activeMarketId, setActiveMarketId } = useMarkets();
  const [minScore, setMinScore] = useState([60]);
  const [zip, setZip] = useState("all");
  const [radius, setRadius] = useState([35]);
  const { prefs, update: updatePrefs } = useMapPrefs();
  const nwsState = activeMarket?.states?.[0] ?? "TN";
  const { alerts: nwsAlerts } = useNwsAlerts(nwsState);
  // Real NWS polygons in scope (only those with geometry). When present, override mock storm polygons.
  const nwsPolygons = useMemo(() => (nwsAlerts ?? []).filter(a => a.geometry), [nwsAlerts]);
  const [overlays, setOverlays] = useState<OverlayState>(DEFAULT_OVERLAYS);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);

  // Hydrate overlay toggles from saved map preferences once they load
  const hydrated = useRef(false);
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    setOverlays(o => ({
      ...o,
      hail: prefs.hail_layer_enabled,
      wind: prefs.wind_layer_enabled,
      rain: prefs.rain_layer_enabled,
      tornado: prefs.tornado_layer_enabled,
      leadHeatmap: prefs.lead_heatmap_enabled,
    }));
  }, [prefs]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [geoCenter, setGeoCenter] = useState({ x: 55, y: 60 });
  const [editRadiusOpen, setEditRadiusOpen] = useState(false);
  const mapWrapRef = useRef<HTMLDivElement>(null);
  const mapCtl = useMapControls("territory-map");
  

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
  const [isDragging, setIsDragging] = useState(false);
  const rafRef = useRef<number | null>(null);
  const pendingPanRef = useRef<{ x: number; y: number } | null>(null);
  const flushPan = () => {
    rafRef.current = null;
    if (pendingPanRef.current) {
      setPan(pendingPanRef.current);
      pendingPanRef.current = null;
    }
  };
  const queuePan = (next: { x: number; y: number }) => {
    pendingPanRef.current = next;
    if (rafRef.current == null) rafRef.current = requestAnimationFrame(flushPan);
  };
  const onWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setZoom(z => Math.max(0.5, Math.min(4, +(z + delta).toFixed(2))));
  };
  const onMouseDown = (e: React.MouseEvent) => {
    dragRef.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
    setIsDragging(true);
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current) return;
    queuePan({ x: dragRef.current.px + (e.clientX - dragRef.current.x), y: dragRef.current.py + (e.clientY - dragRef.current.y) });
  };
  const endDrag = () => { dragRef.current = null; setIsDragging(false); };
  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

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
      const d = distance(e.touches[0], e.touches[1]);
      const ratio = d / (ref.startDist || d);
      setZoom(Math.max(0.5, Math.min(4, +((ref.startZoom || 1) * ratio).toFixed(2))));
    } else if (ref.mode === "pan" && e.touches.length === 1) {
      const t = e.touches[0];
      queuePan({
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

  const update = (patch: Partial<OverlayState>) => {
    setOverlays(o => ({ ...o, ...patch }));
    // Persist common layer toggles to user_map_preferences
    const dbPatch: Record<string, unknown> = {};
    if (patch.hail !== undefined) dbPatch.hail_layer_enabled = patch.hail;
    if (patch.wind !== undefined) dbPatch.wind_layer_enabled = patch.wind;
    if (patch.rain !== undefined) dbPatch.rain_layer_enabled = patch.rain;
    if (patch.tornado !== undefined) dbPatch.tornado_layer_enabled = patch.tornado;
    if (patch.leadHeatmap !== undefined) dbPatch.lead_heatmap_enabled = patch.leadHeatmap;
    if (Object.keys(dbPatch).length > 0) updatePrefs(dbPatch as any);
  };
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
        <Button onClick={() => toast.info("Route building coming soon", { description: `Will optimize a ${visible.length}-stop door-knock route across your reps.` })}>
          <Route className="w-4 h-4 mr-2" />Create door-knocking route
        </Button>
      </header>

      <NwsAlertsPanel />

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

        {/* Real interactive map (Leaflet + OpenStreetMap tiles + RainViewer radar + NWS polygons) */}
        <div
          ref={mapWrapRef}
          className={cn(
            "relative rounded-xl overflow-hidden shadow-elevated border border-border/60 w-full max-w-full",
            isFullscreen ? "h-screen" : "h-[60vh] min-h-[360px] lg:h-[640px]"
          )}
        >
          <RealMap
            pins={visible.map(l => ({
              id: l.id,
              lat: l.lat,
              lng: l.lng,
              title: l.ownerName,
              subtitle: l.propertyAddress,
              score: l.liveScore,
              onClick: () => setSelectedLeadId(l.id),
            }))}
            showRadar={overlays.rain}
            nwsGeometry={
              nwsPolygons.length > 0
                ? ({
                    type: "FeatureCollection",
                    features: nwsPolygons.map((a) => ({
                      type: "Feature",
                      properties: { id: a.id, severity: a.severity, headline: a.headline },
                      geometry: a.geometry as any,
                    })),
                  } as any)
                : null
            }
          />
          {demoMode && (overlays.hail || overlays.wind || overlays.tornado) && (
            <div className="absolute top-2 left-2 z-[500] bg-warning text-warning-foreground text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow pointer-events-none">
              Demo Mode · simulated overlays
            </div>
          )}
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

      {/* Edit radius bottom sheet (mobile-friendly) */}
      <Drawer open={editRadiusOpen} onOpenChange={setEditRadiusOpen}>
        <DrawerContent className="px-4">
          <DrawerHeader className="text-left px-0">
            <DrawerTitle className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-storm" /> Edit geofence radius
            </DrawerTitle>
            <DrawerDescription>
              Adjust the search area around your pin. Tap a preset or fine-tune with the slider.
            </DrawerDescription>
          </DrawerHeader>

          <div className="px-0 pb-2 space-y-5">
            <div className="text-center">
              <div className="text-5xl font-bold tabular-nums text-storm">{radius[0]}</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">miles</div>
            </div>

            <Slider value={radius} onValueChange={setRadius} min={5} max={100} step={1} className="py-2" />

            <div className="grid grid-cols-5 gap-2">
              {[5, 15, 25, 50, 100].map(v => (
                <button
                  key={v}
                  onClick={() => setRadius([v])}
                  className={cn(
                    "h-11 rounded-lg border text-sm font-semibold tabular-nums",
                    radius[0] === v
                      ? "bg-storm text-storm-foreground border-storm"
                      : "bg-background border-border hover:border-storm/50"
                  )}
                >
                  {v}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
              <span>Properties inside radius</span>
              <span className="font-bold text-foreground tabular-nums">{visible.length}</span>
            </div>
          </div>

          <DrawerFooter className="px-0">
            <Button onClick={() => setEditRadiusOpen(false)} size="lg">Done</Button>
            <DrawerClose asChild>
              <Button variant="ghost" size="sm">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
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
