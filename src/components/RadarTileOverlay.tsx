import { useEffect, useRef, useState } from "react";
import { CloudOff, Loader2, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Live radar tile imagery from RainViewer (free, no API key).
 * Falls back to a clear "radar unavailable" state on failure.
 * Renders an absolutely-positioned overlay sized to its parent.
 */
export function RadarTileOverlay({ opacity = 0.55, className }: { opacity?: number; className?: string }) {
  const [tileHost, setTileHost] = useState<string | null>(null);
  const [path, setPath] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const failedRef = useRef(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("https://api.rainviewer.com/public/weather-maps.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const last = json?.radar?.past?.[json.radar.past.length - 1];
        if (!active) return;
        if (!last?.path || !json?.host) throw new Error("No radar frame");
        setTileHost(json.host);
        setPath(last.path);
        setStatus("ok");
      } catch (e) {
        if (active) setStatus("error");
      }
    })();
    return () => { active = false; };
  }, []);

  if (status === "loading") {
    return (
      <div className={cn("absolute top-2 right-2 pointer-events-none", className)}>
        <div className="bg-card/80 backdrop-blur-sm border border-border/60 rounded-md px-2 py-1 text-[11px] flex items-center gap-1.5">
          <Loader2 className="w-3 h-3 animate-spin" /> Radar…
        </div>
      </div>
    );
  }
  if (status === "error" || !tileHost || !path) {
    return (
      <div className={cn("absolute top-2 right-2 pointer-events-none", className)}>
        <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-md px-2 py-1 text-[11px] flex items-center gap-1">
          <CloudOff className="w-3 h-3" /> Radar unavailable
        </div>
      </div>
    );
  }
  // World tile z=2,x=1,y=1 covers the continental US — good enough for the schematic map.
  // Tile URL: {host}{path}/{size}/{z}/{x}/{y}/{color}/{options}.png
  const url = `${tileHost}${path}/512/2/1/1/4/1_1.png`;
  return (
    <div className={cn("absolute inset-0 pointer-events-none", className)}>
      <img
        src={url}
        alt="Live precipitation radar"
        className="w-full h-full object-cover"
        style={{ opacity }}
        onError={() => { if (!failedRef.current) { failedRef.current = true; setStatus("error"); } }}
      />
      <div className="absolute bottom-2 left-2 bg-card/80 backdrop-blur-sm border border-border/60 rounded px-2 py-1 text-[10px] flex items-center gap-1">
        <Radio className="w-3 h-3 text-success" /> Live radar · RainViewer
      </div>
    </div>
  );
}
