import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap, Circle, CircleMarker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CloudOff, Radio, Loader2, Crosshair, LocateFixed } from "lucide-react";
import { toast } from "sonner";

// Fix default marker icons for bundlers (Vite)
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
// @ts-expect-error patch leaflet defaults
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

export type RealMapPin = {
  id: string;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  score?: number;
  onClick?: () => void;
};

export type RealMapProps = {
  pins?: RealMapPin[];
  center?: [number, number];
  zoom?: number;
  showRadar?: boolean;
  nwsGeometry?: GeoJSON.GeoJSON | null;
  marketBoundary?: GeoJSON.GeoJSON | null;
  className?: string;
  /** Render extra layers/controls inside the map container */
  children?: React.ReactNode;
};

// RainViewer radar — fetches latest frame, refreshes every 5 min.
function useRainViewerFrame(enabled: boolean) {
  const [frame, setFrame] = useState<{ host: string; path: string } | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch("https://api.rainviewer.com/public/weather-maps.json", { cache: "no-store" });
        const j = await res.json();
        const last = j?.radar?.past?.[j.radar.past.length - 1];
        if (!alive) return;
        if (last?.path && j?.host) { setFrame({ host: j.host, path: last.path }); setError(false); }
        else setError(true);
      } catch { if (alive) setError(true); }
    };
    load();
    const t = setInterval(load, 5 * 60 * 1000);
    return () => { alive = false; clearInterval(t); };
  }, [enabled]);
  return { frame, error };
}

/** Fits bounds ONCE on initial pin load, then stops fighting user. */
function FitBoundsOnce({ pins, center, trigger }: { pins?: RealMapPin[]; center?: [number, number]; trigger: number }) {
  const map = useMap();
  const didInitial = useRef(false);
  useEffect(() => {
    if (didInitial.current && trigger === 0) return;
    if (pins && pins.length > 1) {
      const bounds = L.latLngBounds(pins.map(p => [p.lat, p.lng] as [number, number]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 11 });
    } else if (pins && pins.length === 1) {
      map.setView([pins[0].lat, pins[0].lng], 11);
    } else if (center && !didInitial.current) {
      map.setView(center, map.getZoom());
    }
    didInitial.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);
  return null;
}

function InvalidateSize() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 150);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

function pinIcon(score?: number) {
  const color = score && score >= 85 ? "#f97316" : score && score >= 70 ? "#2563eb" : "#64748b";
  const html = `<div style="width:18px;height:18px;border-radius:9999px;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`;
  return L.divIcon({ html, className: "rr-pin", iconSize: [18, 18], iconAnchor: [9, 9] });
}

export function RealMap({
  pins = [],
  center = [37.5, -97],
  zoom = 5,
  showRadar = false,
  nwsGeometry,
  marketBoundary,
  className,
  children,
}: RealMapProps) {
  const { frame, error: radarError } = useRainViewerFrame(showRadar);
  const radarLoading = showRadar && !frame && !radarError;
  const renderedPins = useMemo(() => pins.slice(0, 500), [pins]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fitTrigger, setFitTrigger] = useState(1);
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  const handleLocate = () => {
    if (!("geolocation" in navigator)) {
      toast.error("Location not supported", { description: "Your device doesn't support geolocation." });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setUserLoc({ lat: latitude, lng: longitude, accuracy });
        mapRef.current?.setView([latitude, longitude], 15);
        setLocating(false);
        toast.success("Centered on your location", {
          description: "Your location is used only to center the map and is not saved.",
        });
      },
      (err) => {
        setLocating(false);
        const msg = err.code === err.PERMISSION_DENIED
          ? "Location permission denied"
          : err.code === err.POSITION_UNAVAILABLE
          ? "Location unavailable"
          : "Location request timed out";
        toast.error(msg, {
          description: "Your location is used only to center the map and is not saved.",
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  return (
    <div ref={containerRef} className={`relative w-full h-full min-h-[360px] max-w-full overflow-hidden ${className ?? ""}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom
        ref={(m) => { mapRef.current = m as unknown as L.Map | null; }}
        className="w-full h-full rounded-xl overflow-hidden"
        style={{ background: "#0b1220" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        {showRadar && frame && (
          <TileLayer
            url={`${frame.host}${frame.path}/256/{z}/{x}/{y}/4/1_1.png`}
            opacity={0.55}
            attribution="Radar &copy; RainViewer"
          />
        )}
        {marketBoundary && (
          <GeoJSON data={marketBoundary as any} style={{ color: "#2563eb", weight: 2, fillOpacity: 0.05 }} />
        )}
        {nwsGeometry && (
          <GeoJSON data={nwsGeometry as any} style={{ color: "#dc2626", weight: 2, fillOpacity: 0.15 }} />
        )}
        {renderedPins.map(p => (
          <Marker key={p.id} position={[p.lat, p.lng]} icon={pinIcon(p.score)}
            eventHandlers={{ click: () => p.onClick?.() }}>
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{p.title}</div>
                {p.subtitle && <div className="text-xs opacity-80">{p.subtitle}</div>}
                {typeof p.score === "number" && <div className="text-xs mt-1">Score <b>{p.score}</b></div>}
              </div>
            </Popup>
          </Marker>
        ))}
        <FitBoundsOnce pins={renderedPins} center={center} trigger={fitTrigger} />
        <InvalidateSize />
        {children}
      </MapContainer>

      {renderedPins.length > 0 && (
        <button
          onClick={() => setFitTrigger(t => t + 1)}
          className="absolute top-2 right-2 z-[400] bg-card/95 backdrop-blur border border-border/60 rounded-md px-2 py-1.5 text-[11px] font-medium shadow-card flex items-center gap-1 hover:bg-accent active:scale-95"
          title="Fit to leads"
        >
          <Crosshair className="w-3 h-3 text-storm" /> Fit to leads
        </button>
      )}

      {showRadar && (
        <div className="absolute bottom-2 left-2 z-[400] pointer-events-none">
          {radarError ? (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded px-2 py-1 text-[10px] flex items-center gap-1">
              <CloudOff className="w-3 h-3" /> Radar unavailable
            </div>
          ) : radarLoading ? (
            <div className="bg-card/90 backdrop-blur border border-border/60 rounded px-2 py-1 text-[10px] flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin text-storm" /> Loading radar…
            </div>
          ) : frame ? (
            <div className="bg-card/90 backdrop-blur border border-border/60 rounded px-2 py-1 text-[10px] flex items-center gap-1">
              <Radio className="w-3 h-3 text-success" /> Live radar · RainViewer
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
