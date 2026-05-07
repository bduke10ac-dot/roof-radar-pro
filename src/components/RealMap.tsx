import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CloudOff, Radio } from "lucide-react";

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

function FitBounds({ pins, center }: { pins?: RealMapPin[]; center?: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (pins && pins.length > 1) {
      const bounds = L.latLngBounds(pins.map(p => [p.lat, p.lng] as [number, number]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 11 });
    } else if (pins && pins.length === 1) {
      map.setView([pins[0].lat, pins[0].lng], 11);
    } else if (center) {
      map.setView(center, map.getZoom());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pins?.length, center?.[0], center?.[1]]);
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
  const renderedPins = useMemo(() => pins.slice(0, 500), [pins]);
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className ?? ""}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom
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
        <FitBounds pins={renderedPins} center={center} />
        {children}
      </MapContainer>
      {showRadar && (
        <div className="absolute bottom-2 left-2 z-[400] pointer-events-none">
          {radarError ? (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded px-2 py-1 text-[10px] flex items-center gap-1">
              <CloudOff className="w-3 h-3" /> Radar unavailable
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
