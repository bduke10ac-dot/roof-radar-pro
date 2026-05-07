import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface AutoRule {
  id: string;
  name: string;
  enabled: boolean;
  marketId: string | null;
  triggerHail: boolean;
  triggerWindGust: boolean;
  triggerSustainedWind: boolean;
  triggerTornado: boolean;
  triggerSevereWeather: boolean;
  triggerHeavyRain: boolean;
  triggerLightning: boolean;
  hailThreshold: number | null;
  windGustThreshold: number | null;
  sustainedWindThreshold: number | null;
  rainThreshold: number | null;
  tornadoAlertType: string | null;
  severeAlertType: string | null;
  allowEmail: boolean;
  allowSms: boolean;
  allowDirectMail: boolean;
  allowDoorKnockRoute: boolean;
  allowCrmTask: boolean;
  allowRepPush: boolean;
  requireManualApproval: boolean;
  sendTiming: string | null;
  messageTemplate: string | null;
  createdAt: string;
}

const ROW_COLS = "id, rule_name, is_active, market_id, trigger_hail, trigger_wind_gust, trigger_sustained_wind, trigger_tornado, trigger_severe_weather, trigger_heavy_rain, trigger_lightning, hail_threshold, wind_gust_threshold, sustained_wind_threshold, rain_threshold, tornado_alert_type, severe_alert_type, allow_email, allow_sms, allow_direct_mail_export, allow_door_knock_route, allow_crm_task, allow_rep_push_notification, require_manual_approval, send_timing, message_template, created_at";

function rowToRule(r: any): AutoRule {
  return {
    id: r.id,
    name: r.rule_name,
    enabled: !!r.is_active,
    marketId: r.market_id,
    triggerHail: !!r.trigger_hail,
    triggerWindGust: !!r.trigger_wind_gust,
    triggerSustainedWind: !!r.trigger_sustained_wind,
    triggerTornado: !!r.trigger_tornado,
    triggerSevereWeather: !!r.trigger_severe_weather,
    triggerHeavyRain: !!r.trigger_heavy_rain,
    triggerLightning: !!r.trigger_lightning,
    hailThreshold: r.hail_threshold !== null ? Number(r.hail_threshold) : null,
    windGustThreshold: r.wind_gust_threshold !== null ? Number(r.wind_gust_threshold) : null,
    sustainedWindThreshold: r.sustained_wind_threshold !== null ? Number(r.sustained_wind_threshold) : null,
    rainThreshold: r.rain_threshold !== null ? Number(r.rain_threshold) : null,
    tornadoAlertType: r.tornado_alert_type,
    severeAlertType: r.severe_alert_type,
    allowEmail: !!r.allow_email,
    allowSms: !!r.allow_sms,
    allowDirectMail: !!r.allow_direct_mail_export,
    allowDoorKnockRoute: !!r.allow_door_knock_route,
    allowCrmTask: !!r.allow_crm_task,
    allowRepPush: !!r.allow_rep_push_notification,
    requireManualApproval: !!r.require_manual_approval,
    sendTiming: r.send_timing,
    messageTemplate: r.message_template,
    createdAt: r.created_at,
  };
}

function ruleToRow(r: Partial<AutoRule>): Record<string, unknown> {
  const m: Record<string, unknown> = {};
  if (r.name !== undefined) m.rule_name = r.name;
  if (r.enabled !== undefined) m.is_active = r.enabled;
  if (r.marketId !== undefined) m.market_id = r.marketId;
  if (r.triggerHail !== undefined) m.trigger_hail = r.triggerHail;
  if (r.triggerWindGust !== undefined) m.trigger_wind_gust = r.triggerWindGust;
  if (r.triggerSustainedWind !== undefined) m.trigger_sustained_wind = r.triggerSustainedWind;
  if (r.triggerTornado !== undefined) m.trigger_tornado = r.triggerTornado;
  if (r.triggerSevereWeather !== undefined) m.trigger_severe_weather = r.triggerSevereWeather;
  if (r.triggerHeavyRain !== undefined) m.trigger_heavy_rain = r.triggerHeavyRain;
  if (r.triggerLightning !== undefined) m.trigger_lightning = r.triggerLightning;
  if (r.hailThreshold !== undefined) m.hail_threshold = r.hailThreshold;
  if (r.windGustThreshold !== undefined) m.wind_gust_threshold = r.windGustThreshold;
  if (r.sustainedWindThreshold !== undefined) m.sustained_wind_threshold = r.sustainedWindThreshold;
  if (r.rainThreshold !== undefined) m.rain_threshold = r.rainThreshold;
  if (r.tornadoAlertType !== undefined) m.tornado_alert_type = r.tornadoAlertType;
  if (r.severeAlertType !== undefined) m.severe_alert_type = r.severeAlertType;
  if (r.allowEmail !== undefined) m.allow_email = r.allowEmail;
  if (r.allowSms !== undefined) m.allow_sms = r.allowSms;
  if (r.allowDirectMail !== undefined) m.allow_direct_mail_export = r.allowDirectMail;
  if (r.allowDoorKnockRoute !== undefined) m.allow_door_knock_route = r.allowDoorKnockRoute;
  if (r.allowCrmTask !== undefined) m.allow_crm_task = r.allowCrmTask;
  if (r.allowRepPush !== undefined) m.allow_rep_push_notification = r.allowRepPush;
  if (r.requireManualApproval !== undefined) m.require_manual_approval = r.requireManualApproval;
  if (r.sendTiming !== undefined) m.send_timing = r.sendTiming;
  if (r.messageTemplate !== undefined) m.message_template = r.messageTemplate;
  return m;
}

export function useAutoRules() {
  const { user, loading: authLoading } = useAuth();
  const [rules, setRules] = useState<AutoRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) { setRules([]); setLoading(false); return; }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("auto_campaign_rules")
      .select(ROW_COLS)
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });
    if (error) { setError(error.message); setRules([]); }
    else setRules(data!.map(rowToRule));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    refresh();
  }, [authLoading, refresh]);

  const createRule = async (input: Omit<AutoRule, "id" | "createdAt">): Promise<AutoRule | null> => {
    if (!user) { toast.error("Log in to save rules"); return null; }
    setSaving(true);
    const { data, error } = await supabase
      .from("auto_campaign_rules")
      .insert({ owner_id: user.id, ...ruleToRow(input) } as any)
      .select(ROW_COLS)
      .single();
    setSaving(false);
    if (error || !data) { toast.error(error?.message ?? "Failed to create rule"); return null; }
    const created = rowToRule(data);
    setRules(prev => [created, ...prev]);
    return created;
  };

  const updateRule = async (id: string, patch: Partial<AutoRule>): Promise<boolean> => {
    setSaving(true);
    const { data, error } = await supabase
      .from("auto_campaign_rules")
      .update(ruleToRow(patch))
      .eq("id", id)
      .select(ROW_COLS)
      .single();
    setSaving(false);
    if (error || !data) { toast.error(error?.message ?? "Failed to update rule"); return false; }
    const updated = rowToRule(data);
    setRules(prev => prev.map(r => r.id === id ? updated : r));
    return true;
  };

  const toggleRule = (id: string) => {
    const r = rules.find(x => x.id === id);
    if (!r) return Promise.resolve(false);
    return updateRule(id, { enabled: !r.enabled });
  };

  const deleteRule = async (id: string): Promise<boolean> => {
    const prev = rules;
    setRules(prev.filter(r => r.id !== id));
    const { error } = await supabase.from("auto_campaign_rules").delete().eq("id", id);
    if (error) { toast.error(error.message); setRules(prev); return false; }
    return true;
  };

  return { rules, loading, saving, error, refresh, createRule, updateRule, toggleRule, deleteRule };
}
