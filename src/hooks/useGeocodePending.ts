import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useGeocodePending() {
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);
  const [running, setRunning] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) { setPendingCount(0); return; }
    const { count } = await supabase
      .from("properties")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", user.id)
      .or("latitude.is.null,longitude.is.null");
    setPendingCount(count ?? 0);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const run = useCallback(async (limit = 25): Promise<{ ok: number; failed: number }> => {
    if (!user) { toast.error("Log in to geocode addresses"); return { ok: 0, failed: 0 }; }
    setRunning(true);
    const { data: rows, error } = await supabase
      .from("properties")
      .select("id, property_address")
      .eq("owner_id", user.id)
      .or("latitude.is.null,longitude.is.null")
      .not("property_address", "is", null)
      .limit(limit);
    if (error) { toast.error(error.message); setRunning(false); return { ok: 0, failed: 0 }; }

    const baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/geocode`;
    let ok = 0, failed = 0;
    for (const r of rows ?? []) {
      try {
        const u = `${baseUrl}?q=${encodeURIComponent(r.property_address ?? "")}`;
        const res = await fetch(u, {
          headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        });
        const j = await res.json();
        if (j?.found && Number.isFinite(j.lat) && Number.isFinite(j.lng)) {
          await supabase.from("properties")
            .update({ latitude: j.lat, longitude: j.lng })
            .eq("id", r.id);
          ok++;
        } else {
          failed++;
        }
      } catch {
        failed++;
      }
      // Be polite to Nominatim (1 req/sec policy)
      await new Promise(res => setTimeout(res, 1100));
    }
    setRunning(false);
    await refresh();
    if (ok > 0) toast.success(`Geocoded ${ok} address${ok === 1 ? "" : "es"}${failed ? ` · ${failed} failed` : ""}`);
    else if (failed > 0) toast.error(`Geocoding failed for ${failed} address${failed === 1 ? "" : "es"}`);
    return { ok, failed };
  }, [user, refresh]);

  return { pendingCount, running, run, refresh };
}
