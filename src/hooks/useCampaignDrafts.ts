import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface CampaignDraft {
  id: string;
  name: string;
  channel: "email" | "sms" | "aicall" | string;
  message: string;
  sentCount: number;
  optOutCount: number;
  createdAt: string;
}

const COLS = "id, name, channel, message, sent_count, opt_out_count, created_at";

function row(r: any): CampaignDraft {
  return {
    id: r.id,
    name: r.name ?? "",
    channel: r.channel ?? "email",
    message: r.message ?? "",
    sentCount: r.sent_count ?? 0,
    optOutCount: r.opt_out_count ?? 0,
    createdAt: r.created_at,
  };
}

export function useCampaignDrafts() {
  const { user, loading: authLoading } = useAuth();
  const [drafts, setDrafts] = useState<CampaignDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) { setDrafts([]); setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from("campaigns")
      .select(COLS)
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });
    if (!error && data) setDrafts(data.map(row));
    setLoading(false);
  }, [user]);

  useEffect(() => { if (!authLoading) refresh(); }, [authLoading, refresh]);

  const saveDraft = async (input: { id?: string; name: string; channel: string; message: string }): Promise<CampaignDraft | null> => {
    if (!user) { toast.error("Log in to save campaigns"); return null; }
    setSaving(true);
    if (input.id) {
      const { data, error } = await supabase
        .from("campaigns")
        .update({ name: input.name, channel: input.channel, message: input.message })
        .eq("id", input.id)
        .select(COLS)
        .single();
      setSaving(false);
      if (error || !data) { toast.error(error?.message ?? "Update failed"); return null; }
      const updated = row(data);
      setDrafts(prev => prev.map(d => d.id === input.id ? updated : d));
      return updated;
    } else {
      const { data, error } = await supabase
        .from("campaigns")
        .insert({ owner_id: user.id, name: input.name, channel: input.channel, message: input.message })
        .select(COLS)
        .single();
      setSaving(false);
      if (error || !data) { toast.error(error?.message ?? "Save failed"); return null; }
      const created = row(data);
      setDrafts(prev => [created, ...prev]);
      return created;
    }
  };

  const deleteDraft = async (id: string): Promise<boolean> => {
    const prev = drafts;
    setDrafts(prev.filter(d => d.id !== id));
    const { error } = await supabase.from("campaigns").delete().eq("id", id);
    if (error) { toast.error(error.message); setDrafts(prev); return false; }
    return true;
  };

  return { drafts, loading, saving, refresh, saveDraft, deleteDraft };
}
