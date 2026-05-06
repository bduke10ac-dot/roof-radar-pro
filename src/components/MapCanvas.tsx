import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { MapControls, useMapControls, baseMapBackground, type MapControlsState, type MapLayerKey } from "@/components/MapControls";

/**
 * Global wrapper for every map surface in RoofRadar.
 * Ensures every map gets:
 *   - A floating Map Controls panel (base mode, pitch, rotation, all layer toggles)
 *   - Persisted per-user settings via storageKey (localStorage today, syncable to user_map_preferences)
 *   - The selected base-map background (road / satellite / hybrid / terrain / 3D)
 *
 * Usage:
 *   <MapCanvas storageKey="job-zones">{({ state }) => <YourMap layers={state.layers} />}</MapCanvas>
 */
export function MapCanvas({
  storageKey,
  className,
  children,
  controlsPosition = "top-right",
}: {
  storageKey: string;
  className?: string;
  children: (api: {
    state: MapControlsState;
    isLayerOn: (k: MapLayerKey) => boolean;
  }) => ReactNode;
  controlsPosition?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}) {
  const ctl = useMapControls(storageKey);
  const pos = {
    "top-right": "top-3 right-3",
    "top-left": "top-3 left-3",
    "bottom-right": "bottom-3 right-3",
    "bottom-left": "bottom-3 left-3",
  }[controlsPosition];

  return (
    <div
      className={cn("relative rounded-xl overflow-hidden border border-border/60 shadow-elevated", className)}
      style={baseMapBackground(ctl.state.base)}
    >
      <div className={cn("absolute z-30", pos)}>
        <MapControls
          state={ctl.state}
          onBase={ctl.setBase}
          onPitch={ctl.setPitch}
          onRotation={ctl.setRotation}
          onToggle={ctl.toggle}
        />
      </div>
      {children({
        state: ctl.state,
        isLayerOn: (k) => ctl.state.layers[k],
      })}
    </div>
  );
}
