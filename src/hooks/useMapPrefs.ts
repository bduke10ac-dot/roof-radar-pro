import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface MapPrefs {
  default_map_type: string;
  satellite_enabled: boolean;
  hybrid_enabled: boolean;
  terrain_enabled: boolean;
  three_d_enabled: boolean;
  parcel_layer_enabled: boolean;
  hail_layer_enabled: boolean;
  wind_layer_enabled: boolean;
  rain_layer_enabled: boolean;
  tornado_layer_enabled: boolean;
  lightning_layer_enabled: boolean;
  lead_heatmap_enabled: boolean;
  roof_age_heatmap_enabled: boolean;
  claim_opportunity_enabled: boolean;
  job_zone_enabled: boolean;
  route_layer_enabled: boolean;
  saved_market_boundaries_enabled: boolean;
  measurement_tools_enabled: boolean;
}

const DEFAULTS: MapPrefs = {
  default_map_type: "roadmap",
  satellite_enabled: false, hybrid_enabled: false, terrain_enabled: false, three_d_enabled: false,
  parcel_layer_enabled: true, hail_layer_enabled: true, wind_layer_enabled: true,
  rain_layer_enabled: false, tornado_layer_enabled: false, lightning_layer_enabled: false,
  lead_heatmap_enabled: true, roof_age_heatmap_enabled: false, claim_opportunity_enabled: true,
  job_zone_enabled: true, route_layer_enabled: false,
  saved_market_boundaries_enabled: true, measurement_tools_enabled: true,
};

export function useMapPrefs() {
  const { user, loading: authLoading } = useAuth();
  const [prefs, setPrefs] = useState<MapPrefs>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (authLoading || !user) return;
    (async () => {
      const { data } = await supabase
        .from("user_map_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) setPrefs({ ...DEFAULTS, ...(data as any) });
      initialized.current = true;
      setLoading(false);
    })();
  }, [user, authLoading]);

  const update = useCallback(async (patch: Partial<MapPrefs>) => {
    setPrefs(p => ({ ...p, ...patch }));
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("user_map_preferences")
      .upsert({ user_id: user.id, ...prefs, ...patch } as any, { onConflict: "user_id" });
    setSaving(false);
    if (error) console.error("map prefs save", error);
  }, [user, prefs]);

  return { prefs, loading, saving, update };
}
