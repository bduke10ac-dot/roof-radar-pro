import { useState } from "react";
import { MapContainer, TileLayer, Polygon, Polyline, CircleMarker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Pencil, Trash2, Check, X } from "lucide-react";

type Polygon2 = GeoJSON.Polygon;

export type GeofenceEditorProps = {
  value: Polygon2 | GeoJSON.MultiPolygon | null | undefined;
  onChange: (geo: Polygon2 | null) => void;
  center?: [number, number];
};

// Accepts a Polygon, Feature<Polygon>, or FeatureCollection containing one polygon; returns Polygon.
function normalizeGeoJsonInput(raw: string): Polygon2 | null {
  try {
    const j = JSON.parse(raw);
    if (j?.type === "Polygon" && Array.isArray(j.coordinates)) return j as Polygon2;
    if (j?.type === "Feature" && j?.geometry?.type === "Polygon") return j.geometry as Polygon2;
    if (j?.type === "FeatureCollection" && Array.isArray(j.features)) {
      const f = j.features.find((x: any) => x?.geometry?.type === "Polygon");
      if (f) return f.geometry as Polygon2;
    }
    return null;
  } catch {
    return null;
  }
}

function ringFromPolygon(p: Polygon2 | GeoJSON.MultiPolygon | null | undefined): [number, number][] {
  if (!p) return [];
  if (p.type === "Polygon") return p.coordinates[0].map(([lng, lat]) => [lat, lng] as [number, number]);
  if (p.type === "MultiPolygon") return p.coordinates[0]?.[0]?.map(([lng, lat]) => [lat, lng] as [number, number]) ?? [];
  return [];
}

function DrawHandler({ drawing, onAddVertex }: { drawing: boolean; onAddVertex: (latlng: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      if (!drawing) return;
      onAddVertex([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export function GeofenceEditor({ value, onChange, center = [36.3, -86.6] }: GeofenceEditorProps) {
  const [drawing, setDrawing] = useState(false);
  const [vertices, setVertices] = useState<[number, number][]>([]);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");

  const existingRing = ringFromPolygon(value);

  const startDraw = () => {
    setDrawing(true);
    setVertices([]);
    toast.message("Tap the map to add corners. Click Finish when you're done (need ≥3 points).");
  };

  const finishDraw = () => {
    if (vertices.length < 3) {
      toast.error("Add at least 3 points to form a polygon");
      return;
    }
    // Close the ring; convert to [lng, lat] for GeoJSON.
    const ring = [...vertices, vertices[0]].map(([lat, lng]) => [lng, lat]);
    const poly: Polygon2 = { type: "Polygon", coordinates: [ring] };
    onChange(poly);
    setDrawing(false);
    setVertices([]);
    toast.success("Geofence saved to draft");
  };

  const cancelDraw = () => {
    setDrawing(false);
    setVertices([]);
  };

  const clearGeofence = () => {
    onChange(null);
    setVertices([]);
    setDrawing(false);
  };

  const handlePaste = () => {
    const poly = normalizeGeoJsonInput(pasteText.trim());
    if (!poly) {
      toast.error("Could not parse GeoJSON Polygon");
      return;
    }
    onChange(poly);
    setPasteText("");
    setPasteOpen(false);
    toast.success("Geofence imported");
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {!drawing ? (
          <Button type="button" size="sm" variant="outline" onClick={startDraw}>
            <Pencil className="w-3.5 h-3.5 mr-1.5" /> Draw on map
          </Button>
        ) : (
          <>
            <Button type="button" size="sm" onClick={finishDraw}>
              <Check className="w-3.5 h-3.5 mr-1.5" /> Finish ({vertices.length})
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={cancelDraw}>
              <X className="w-3.5 h-3.5 mr-1.5" /> Cancel
            </Button>
          </>
        )}
        <Button type="button" size="sm" variant="outline" onClick={() => setPasteOpen(p => !p)}>
          Paste GeoJSON
        </Button>
        {value && (
          <Button type="button" size="sm" variant="ghost" onClick={clearGeofence} className="text-destructive">
            <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Clear
          </Button>
        )}
      </div>

      {pasteOpen && (
        <div className="space-y-2">
          <Textarea
            value={pasteText}
            onChange={e => setPasteText(e.target.value)}
            placeholder='{ "type": "Polygon", "coordinates": [[[lng,lat],[lng,lat],...]] }'
            className="text-xs font-mono h-24"
          />
          <Button type="button" size="sm" onClick={handlePaste}>Import polygon</Button>
        </div>
      )}

      <div className="rounded-md overflow-hidden border border-border min-h-[280px] max-w-full" style={{ height: 280 }}>
        <MapContainer center={center} zoom={9} className="w-full h-full" scrollWheelZoom>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          <DrawHandler drawing={drawing} onAddVertex={(p) => setVertices(v => [...v, p])} />
          {existingRing.length > 0 && (
            <Polygon positions={existingRing} pathOptions={{ color: "hsl(199 95% 55%)", fillOpacity: 0.15 }} />
          )}
          {drawing && vertices.length > 0 && (
            <>
              <Polyline positions={vertices} pathOptions={{ color: "hsl(45 95% 55%)", dashArray: "6,6" }} />
              {vertices.map((v, i) => (
                <CircleMarker key={i} center={v} radius={5} pathOptions={{ color: "hsl(45 95% 55%)", fillColor: "white", fillOpacity: 1, weight: 2 }} />
              ))}
            </>
          )}
        </MapContainer>
      </div>

      <p className="text-[11px] text-muted-foreground">
        A custom geofence narrows leads, storm overlays, and campaign targeting to addresses inside the shape, overriding state/region/ZIP filters when present.
      </p>
    </div>
  );
}
