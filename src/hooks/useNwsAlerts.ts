import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface NwsAlert {
  id: string;
  event: string;
  severity: string;
  certainty: string;
  urgency: string;
  headline: string;
  description: string;
  instruction: string | null;
  area: string;
  sent: string;
  effective: string;
  expires: string;
  senderName: string;
  geometry: unknown;
}

/**
 * Fetches real National Weather Service alerts via the `nws-alerts` edge function.
 * No API key required (public NOAA API).
 */
export function useNwsAlerts(state?: string, event?: string, refreshMs = 60_000) {
  const [alerts, setAlerts] = useState<NwsAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setInterval> | undefined;

    async function load() {
      try {
        const { data, error } = await supabase.functions.invoke("nws-alerts", {
          body: { state, event },
          method: "GET",
        }).catch(async () => {
          // functions.invoke uses POST; fall back to direct GET
          const url = new URL(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/nws-alerts`);
          if (state) url.searchParams.set("state", state);
          if (event) url.searchParams.set("event", event);
          const res = await fetch(url.toString(), {
            headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
          });
          return { data: await res.json(), error: res.ok ? null : { message: `HTTP ${res.status}` } };
        });
        if (!active) return;
        if (error) throw error;
        setAlerts((data?.alerts ?? []) as NwsAlert[]);
        setError(null);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : "Failed to load alerts");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    if (refreshMs > 0) timer = setInterval(load, refreshMs);
    return () => { active = false; if (timer) clearInterval(timer); };
  }, [state, event, refreshMs]);

  return { alerts, loading, error };
}
