import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";
import { useAuth } from "@/contexts/AuthContext";

export type StripeSub = {
  status: string;
  price_id: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
};

const ACTIVE = ["active", "trialing", "past_due"];

export function useStripeSubscription() {
  const { user } = useAuth();
  const [sub, setSub] = useState<StripeSub | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!user) { setSub(null); setLoading(false); return; }
    const { data } = await supabase
      .from("subscriptions")
      .select("status, price_id, current_period_end, cancel_at_period_end")
      .eq("user_id", user.id)
      .eq("environment", getStripeEnvironment())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setSub(data as StripeSub | null);
    setLoading(false);
  }, [user]);

  useEffect(() => { refetch(); }, [refetch]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`subs-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "subscriptions", filter: `user_id=eq.${user.id}` }, refetch)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, refetch]);

  const isActive = !!sub && ACTIVE.includes(sub.status) && (!sub.current_period_end || new Date(sub.current_period_end) > new Date());
  const planTier: "free" | "starter" | "pro" = sub?.price_id?.startsWith("pro") ? "pro"
    : sub?.price_id?.startsWith("starter") ? "starter" : "free";

  return { sub, loading, isActive, planTier, refetch };
}
