import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type MarketAutomationPref = {
  marketId: string | null;
  marketName: string;
  enabled: boolean;
};

export function useMarketAutomationPrefs() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setPrefs({}); setLoading(false); return; }
    let alive = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_market_automation_preferences")
        .select("market_name, enabled")
        .eq("user_id", user.id);
      if (!alive) return;
      if (!error && data) {
        const map: Record<string, boolean> = {};
        data.forEach(r => { map[r.market_name] = r.enabled; });
        setPrefs(map);
      }
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [user]);

  const setMarketEnabled = useCallback(async (marketName: string, marketId: string | null, enabled: boolean) => {
    setPrefs(p => ({ ...p, [marketName]: enabled }));
    if (!user) return true;
    const { error } = await supabase
      .from("user_market_automation_preferences")
      .upsert(
        { user_id: user.id, market_name: marketName, market_id: marketId, enabled },
        { onConflict: "user_id,market_name" }
      );
    if (error) {
      // rollback
      setPrefs(p => ({ ...p, [marketName]: !enabled }));
      return false;
    }
    return true;
  }, [user]);

  return { prefs, setMarketEnabled, loading };
}
