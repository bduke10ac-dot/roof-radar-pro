import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type TriggeredStatus = "pending" | "approved" | "sent" | "rejected" | "draft";

export interface TriggeredCampaignRow {
  id: string;
  ruleId: string | null;
  ruleName: string;
  marketId: string | null;
  marketName: string;
  triggerType: string;
  triggerReading: string;
  channels: string[];
  message: string;
  eligibleCount: number;
  blockedCount: number;
  smsEligible: number;
  smsBlockedNoConsent: number;
  smsBlockedDnc: number;
  reroutedToMail: number;
  reroutedToDoorKnock: number;
  status: TriggeredStatus;
  isDemo: boolean;
  createdAt: string;
  approvedAt: string | null;
  rejectedAt: string | null;
  sentAt: string | null;
}

const COLS =
  "id, rule_id, rule_name, market_id, market_name, trigger_type, trigger_reading, channels, message_body, eligible_contact_count, blocked_contact_count, sms_eligible, sms_blocked_no_consent, sms_blocked_dnc, rerouted_to_mail, rerouted_to_door_knock, campaign_status, is_demo, created_at, approved_at, rejected_at, sent_at";

function rowToTriggered(r: any): TriggeredCampaignRow {
  return {
    id: r.id,
    ruleId: r.rule_id,
    ruleName: r.rule_name ?? "",
    marketId: r.market_id,
    marketName: r.market_name ?? "",
    triggerType: r.trigger_type ?? "",
    triggerReading: r.trigger_reading ?? "",
    channels: Array.isArray(r.channels) ? r.channels : [],
    message: r.message_body ?? "",
    eligibleCount: r.eligible_contact_count ?? 0,
    blockedCount: r.blocked_contact_count ?? 0,
    smsEligible: r.sms_eligible ?? 0,
    smsBlockedNoConsent: r.sms_blocked_no_consent ?? 0,
    smsBlockedDnc: r.sms_blocked_dnc ?? 0,
    reroutedToMail: r.rerouted_to_mail ?? 0,
    reroutedToDoorKnock: r.rerouted_to_door_knock ?? 0,
    status: (r.campaign_status as TriggeredStatus) ?? "pending",
    isDemo: !!r.is_demo,
    createdAt: r.created_at,
    approvedAt: r.approved_at,
    rejectedAt: r.rejected_at,
    sentAt: r.sent_at,
  };
}

export function useTriggeredCampaigns() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<TriggeredCampaignRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) { setItems([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from("triggered_campaigns")
      .select(COLS)
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });
    if (error) { toast.error(error.message); setItems([]); }
    else setItems((data ?? []).map(rowToTriggered));
    setLoading(false);
  }, [user]);

  useEffect(() => { if (!authLoading) refresh(); }, [authLoading, refresh]);

  const create = async (input: Omit<TriggeredCampaignRow, "id" | "createdAt" | "approvedAt" | "rejectedAt" | "sentAt">) => {
    if (!user) { toast.error("Log in to record triggered campaigns"); return null; }
    const payload = {
      owner_id: user.id,
      rule_id: input.ruleId,
      rule_name: input.ruleName,
      market_id: input.marketId,
      market_name: input.marketName,
      trigger_type: input.triggerType,
      trigger_reading: input.triggerReading,
      channels: input.channels,
      message_body: input.message,
      eligible_contact_count: input.eligibleCount,
      blocked_contact_count: input.blockedCount,
      sms_eligible: input.smsEligible,
      sms_blocked_no_consent: input.smsBlockedNoConsent,
      sms_blocked_dnc: input.smsBlockedDnc,
      rerouted_to_mail: input.reroutedToMail,
      rerouted_to_door_knock: input.reroutedToDoorKnock,
      campaign_status: input.status,
      is_demo: input.isDemo,
      requires_approval: input.status === "pending",
    };
    const { data, error } = await supabase
      .from("triggered_campaigns")
      .insert(payload as any)
      .select(COLS)
      .single();
    if (error || !data) { toast.error(error?.message ?? "Failed to record triggered campaign"); return null; }
    const created = rowToTriggered(data);
    setItems(prev => [created, ...prev]);
    return created;
  };

  const setStatus = async (id: string, status: TriggeredStatus) => {
    const prev = items;
    const ts = new Date().toISOString();
    const patch: { campaign_status: string; approved_at?: string; rejected_at?: string; sent_at?: string } = { campaign_status: status };
    if (status === "approved") patch.approved_at = ts;
    if (status === "rejected") patch.rejected_at = ts;
    if (status === "sent") patch.sent_at = ts;
    setItems(items.map(x => x.id === id ? { ...x, status, ...(status === "approved" ? { approvedAt: ts } : status === "rejected" ? { rejectedAt: ts } : status === "sent" ? { sentAt: ts } : {}) } : x));
    const { error } = await supabase.from("triggered_campaigns").update(patch).eq("id", id);
    if (error) { toast.error(error.message); setItems(prev); return false; }
    return true;
  };

  return { items, loading, refresh, create, setStatus };
}
