import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import {
  Zap, Plus, CloudLightning, Wind, Tornado, CloudRain, AlertTriangle, Bolt,
  TreeDeciduous, PowerOff, Mail, MessageSquare, FileText, Footprints,
  ClipboardCheck, Send, ShieldCheck, ShieldAlert, Clock, Eye, Pencil, Trash2,
  CheckCircle2, XCircle, Activity, Megaphone, Target, MapPin, Lock, PhoneCall,
} from "lucide-react";
import { useMarkets } from "@/contexts/MarketContext";
import { useWeather } from "@/contexts/WeatherContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// =============== Types ===============

type TriggerKey =
  | "hail" | "windGust" | "windSustained" | "tornadoWarning" | "tornadoWatch"
  | "severeWarning" | "severeWatch" | "heavyRain" | "lightning"
  | "powerOutage" | "treeDamage";

type ChannelKey = "email" | "sms" | "aiCall" | "directMail" | "doorKnock" | "crmTask" | "repPush";

type Timing =
  | "immediate" | "afterStorm" | "after30m" | "after1h" | "nextMorning"
  | "manualApproval" | "draftOnly";

type TemplateKey = "hail" | "wind" | "severe" | "leak";

type Rule = {
  id: string;
  name: string;
  enabled: boolean;
  marketScope: { type: "saved" | "state" | "region" | "county" | "city" | "zip" | "custom" | "stormPath"; value: string };
  triggers: Record<TriggerKey, boolean>;
  thresholds: { hailIn: number; gustMph: number; sustainedMph: number; tornado: "watch" | "warning" | "confirmed"; severe: "watch" | "warning" | "radar" | "nws" };
  timing: Timing;
  channels: Record<ChannelKey, boolean>;
  template: TemplateKey;
  manualApproval: boolean;
  createdAt: string;
};

type TriggeredCampaign = {
  id: string;
  ruleName: string;
  marketName: string;
  trigger: TriggerKey;
  reading: string;
  eligible: number;
  blocked: number;
  status: "pending" | "approved" | "sent" | "rejected" | "draft";
  channels: ChannelKey[];
  message: string;
  triggeredAt: string;
  // SMS compliance breakdown
  smsEligible?: number;
  smsBlockedNoConsent?: number;
  smsBlockedDnc?: number;
  reroutedToMail?: number;
  reroutedToDoorKnock?: number;
};

// =============== Constants ===============

const TRIGGER_DEFS: { key: TriggerKey; label: string; icon: any }[] = [
  { key: "hail",            label: "Hail",                       icon: CloudLightning },
  { key: "windGust",        label: "Wind gusts",                 icon: Wind },
  { key: "windSustained",   label: "Sustained wind",             icon: Wind },
  { key: "tornadoWarning",  label: "Tornado warning",            icon: Tornado },
  { key: "tornadoWatch",    label: "Tornado watch",              icon: Tornado },
  { key: "severeWarning",   label: "Severe T-storm warning",     icon: AlertTriangle },
  { key: "severeWatch",     label: "Severe T-storm watch",       icon: AlertTriangle },
  { key: "heavyRain",       label: "Heavy rain",                 icon: CloudRain },
  { key: "lightning",       label: "Lightning",                  icon: Bolt },
  { key: "powerOutage",     label: "Power outage (placeholder)", icon: PowerOff },
  { key: "treeDamage",      label: "Tree/debris (placeholder)",  icon: TreeDeciduous },
];

const CHANNEL_DEFS: { key: ChannelKey; label: string; icon: any }[] = [
  { key: "email",      label: "Email",                    icon: Mail },
  { key: "sms",        label: "SMS (consent required)",   icon: MessageSquare },
  { key: "directMail", label: "Direct mail export",       icon: FileText },
  { key: "doorKnock",  label: "Door-knocking route",      icon: Footprints },
  { key: "crmTask",    label: "CRM task",                 icon: ClipboardCheck },
  { key: "repPush",    label: "Push to sales rep",        icon: Send },
];

const TIMING_DEFS: { key: Timing; label: string }[] = [
  { key: "immediate",      label: "Send immediately when alert occurs" },
  { key: "afterStorm",     label: "Wait until storm passes" },
  { key: "after30m",       label: "Send 30 min after storm passes" },
  { key: "after1h",        label: "Send 1 hour after storm passes" },
  { key: "nextMorning",    label: "Send next morning at 8 AM" },
  { key: "manualApproval", label: "Require manual approval" },
  { key: "draftOnly",      label: "Create draft campaign only" },
];

const HAIL_OPTIONS = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
const GUST_OPTIONS = [45, 50, 58, 60, 65, 70];
const SUSTAINED_OPTIONS = [35, 40, 45, 50];

const TEMPLATES: Record<TemplateKey, { label: string; subject: string; body: string }> = {
  hail: {
    label: "Hail Alert",
    subject: "Hail moved through your neighborhood",
    body: "We're tracking hail activity that recently moved through your area. Homes near your neighborhood may have roof, gutter, or soft metal damage. Would you like a free exterior inspection?",
  },
  wind: {
    label: "Wind Alert",
    subject: "High wind reported near your home",
    body: "High wind gusts were reported near your property. Wind can lift shingles, damage flashing, and create hidden leak risks. Would you like us to check your roof?",
  },
  severe: {
    label: "Severe Storm Follow-Up",
    subject: "Severe storm follow-up — free inspection",
    body: "A severe storm recently passed through your area. We're helping nearby homeowners check for roof, gutter, siding, and exterior damage. Would you like a free inspection?",
  },
  leak: {
    label: "Leak Risk Alert",
    subject: "Heavy rain — watch for leaks",
    body: "Heavy rain recently moved through your area. If you notice stains, drips, or ceiling spots, we can inspect the roof and exterior for possible storm-related entry points.",
  },
};

const DEFAULT_RULE = (): Rule => ({
  id: crypto.randomUUID(),
  name: "",
  enabled: true,
  marketScope: { type: "saved", value: "" },
  triggers: {
    hail: true, windGust: true, windSustained: false,
    tornadoWarning: true, tornadoWatch: false,
    severeWarning: true, severeWatch: false,
    heavyRain: false, lightning: false,
    powerOutage: false, treeDamage: false,
  },
  thresholds: { hailIn: 1.0, gustMph: 58, sustainedMph: 40, tornado: "warning", severe: "warning" },
  timing: "manualApproval",
  channels: { email: true, sms: false, directMail: true, doorKnock: true, crmTask: true, repPush: true },
  template: "hail",
  manualApproval: true,
  createdAt: new Date().toISOString(),
});

// =============== Seed sample data ===============

const SEED_RULES: Rule[] = [
  { ...DEFAULT_RULE(), id: "r1", name: "Hendersonville Hail Alert",
    marketScope: { type: "saved", value: "Hendersonville" },
    thresholds: { hailIn: 1.25, gustMph: 58, sustainedMph: 40, tornado: "warning", severe: "warning" },
    timing: "manualApproval", template: "hail", createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
  { ...DEFAULT_RULE(), id: "r2", name: "Middle TN Wind Campaign",
    marketScope: { type: "region", value: "Middle Tennessee" },
    triggers: { ...DEFAULT_RULE().triggers, hail: false, windGust: true, windSustained: true },
    thresholds: { hailIn: 1.0, gustMph: 65, sustainedMph: 45, tornado: "warning", severe: "warning" },
    timing: "after1h", template: "wind",
    channels: { email: true, sms: false, directMail: true, doorKnock: true, crmTask: true, repPush: false },
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
  { ...DEFAULT_RULE(), id: "r3", name: "Nashville Severe Weather Follow-Up",
    marketScope: { type: "city", value: "Nashville" }, timing: "nextMorning", template: "severe",
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString() },
  { ...DEFAULT_RULE(), id: "r4", name: "Southern KY Tornado Watch Campaign",
    marketScope: { type: "region", value: "Southern Kentucky" },
    triggers: { ...DEFAULT_RULE().triggers, tornadoWatch: true, tornadoWarning: true },
    timing: "immediate", template: "severe", enabled: false,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString() },
];

const SEED_TRIGGERED: TriggeredCampaign[] = [
  { id: "t1", ruleName: "Hendersonville Hail Alert", marketName: "Hendersonville", trigger: "hail",
    reading: "1.5\" hail · 87% confidence", eligible: 412, blocked: 38, status: "pending",
    channels: ["email", "directMail", "doorKnock", "crmTask"],
    message: TEMPLATES.hail.body, triggeredAt: new Date(Date.now() - 1000 * 60 * 22).toISOString() },
  { id: "t2", ruleName: "Middle TN Wind Campaign", marketName: "Middle Tennessee", trigger: "windGust",
    reading: "68 mph gusts · NWS confirmed", eligible: 1284, blocked: 162, status: "approved",
    channels: ["email", "doorKnock"], message: TEMPLATES.wind.body,
    triggeredAt: new Date(Date.now() - 1000 * 60 * 90).toISOString() },
  { id: "t3", ruleName: "Nashville Severe Weather Follow-Up", marketName: "Nashville", trigger: "severeWarning",
    reading: "Severe T-storm warning · radar-indicated", eligible: 2106, blocked: 290, status: "sent",
    channels: ["email", "directMail"], message: TEMPLATES.severe.body,
    triggeredAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
];

// =============== Component ===============

export function AutoStormCampaignsView() {
  const { markets } = useMarkets();
  const { cells, marketImpacts } = useWeather();
  const [rules, setRules] = useState<Rule[]>(SEED_RULES);
  const [triggered, setTriggered] = useState<TriggeredCampaign[]>(SEED_TRIGGERED);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Rule>(DEFAULT_RULE());
  const [reviewing, setReviewing] = useState<TriggeredCampaign | null>(null);
  // Per-market master switch — automation only watches markets that are turned on
  const [marketAutomation, setMarketAutomation] = useState<Record<string, boolean>>(
    () => Object.fromEntries(markets.map(m => [m.name, true]))
  );

  const isMarketArmed = (name: string) => marketAutomation[name] !== false;

  const armed = rules.filter(r => r.enabled && isMarketArmed(r.marketScope.value)).length;
  const triggeredToday = triggered.filter(t => Date.now() - new Date(t.triggeredAt).getTime() < 86400000).length;
  const pending = triggered.filter(t => t.status === "pending");
  const sent = triggered.filter(t => t.status === "sent").length;
  const totalBlocked = triggered.reduce((s, t) => s + t.blocked, 0);
  const routesCreated = triggered.filter(t => t.channels.includes("doorKnock")).length;

  // Evaluate a single rule against a live weather cell using user thresholds
  const evaluateRule = (r: Rule, cell: typeof cells[number]) => {
    if (!cell) return null;
    if (r.triggers.hail && cell.type === "hail" && (cell as any).hailSize >= r.thresholds.hailIn)
      return { trigger: "hail" as TriggerKey, reading: `${(cell as any).hailSize}" hail ≥ ${r.thresholds.hailIn}"` };
    if (r.triggers.windGust && cell.type === "wind" && (cell as any).windSpeed >= r.thresholds.gustMph)
      return { trigger: "windGust" as TriggerKey, reading: `${(cell as any).windSpeed} mph gust ≥ ${r.thresholds.gustMph} mph` };
    if (r.triggers.tornadoWarning && cell.type === "tornado")
      return { trigger: "tornadoWarning" as TriggerKey, reading: `Tornado ${r.thresholds.tornado}` };
    return null;
  };

  const openNew = () => { setEditing(DEFAULT_RULE()); setEditorOpen(true); };
  const openEdit = (r: Rule) => { setEditing({ ...r }); setEditorOpen(true); };

  const saveRule = () => {
    if (!editing.name.trim()) { toast.error("Rule name is required"); return; }
    setRules(rs => {
      const exists = rs.find(r => r.id === editing.id);
      return exists ? rs.map(r => r.id === editing.id ? editing : r) : [editing, ...rs];
    });
    setEditorOpen(false);
    toast.success(`Rule "${editing.name}" saved`);
  };

  const deleteRule = (id: string) => {
    setRules(rs => rs.filter(r => r.id !== id));
    toast.success("Rule deleted");
  };

  const toggleRule = (id: string) => {
    setRules(rs => rs.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const approve = (t: TriggeredCampaign) => {
    setTriggered(ts => ts.map(x => x.id === t.id ? { ...x, status: "sent" } : x));
    setReviewing(null);
    toast.success(`Approved & sent · ${t.eligible.toLocaleString()} eligible recipients`);
  };
  const reject = (t: TriggeredCampaign) => {
    setTriggered(ts => ts.map(x => x.id === t.id ? { ...x, status: "rejected" } : x));
    setReviewing(null);
    toast(`Campaign rejected`);
  };

  // Compliance gate: never SMS without explicit consent and never to DNC.
  // Non-eligible contacts are auto-rerouted to direct mail / door-knock.
  const partitionForCompliance = (totalContacts: number, rule: Rule) => {
    const consentRate = 0.42; // sms_consent = true (simulated)
    const dncRate = 0.08;     // dnc_status = true
    const smsEligible = rule.channels.sms ? Math.floor(totalContacts * (consentRate - dncRate)) : 0;
    const smsBlockedNoConsent = rule.channels.sms ? Math.floor(totalContacts * (1 - consentRate)) : 0;
    const smsBlockedDnc = rule.channels.sms ? Math.floor(totalContacts * dncRate) : 0;
    const blocked = smsBlockedNoConsent + smsBlockedDnc;
    const fallbacks: ChannelKey[] = [];
    if (rule.channels.directMail) fallbacks.push("directMail");
    if (rule.channels.doorKnock) fallbacks.push("doorKnock");
    let reroutedToMail = 0, reroutedToDoorKnock = 0;
    if (fallbacks.length === 2) {
      reroutedToMail = Math.ceil(blocked / 2);
      reroutedToDoorKnock = Math.floor(blocked / 2);
    } else if (fallbacks[0] === "directMail") {
      reroutedToMail = blocked;
    } else if (fallbacks[0] === "doorKnock") {
      reroutedToDoorKnock = blocked;
    }
    return { smsEligible, smsBlockedNoConsent, smsBlockedDnc, blocked, reroutedToMail, reroutedToDoorKnock };
  };

  const simulate = () => {
    const armedRules = rules.filter(r => r.enabled && isMarketArmed(r.marketScope.value));
    if (armedRules.length === 0) return toast.error("No armed rules in active markets");
    let match: { rule: Rule; trigger: TriggerKey; reading: string } | null = null;
    for (const r of armedRules) {
      for (const c of cells) {
        const ev = evaluateRule(r, c);
        if (ev) { match = { rule: r, ...ev }; break; }
      }
      if (match) break;
    }
    if (!match) return toast.error("No live weather currently meets your thresholds");
    const r = match.rule;
    const tpl = TEMPLATES[r.template];
    const totalContacts = 200 + Math.floor(Math.random() * 1500);
    const comp = partitionForCompliance(totalContacts, r);
    const channels = (Object.keys(r.channels) as ChannelKey[]).filter(k => r.channels[k]);
    const t: TriggeredCampaign = {
      id: crypto.randomUUID(),
      ruleName: r.name || "Unnamed rule",
      marketName: r.marketScope.value || marketImpacts[0]?.marketName || "Active market",
      trigger: match.trigger,
      reading: match.reading,
      eligible: totalContacts - comp.blocked,
      blocked: comp.blocked,
      status: r.manualApproval ? "pending" : "sent",
      channels,
      message: tpl.body,
      triggeredAt: new Date().toISOString(),
      smsEligible: comp.smsEligible,
      smsBlockedNoConsent: comp.smsBlockedNoConsent,
      smsBlockedDnc: comp.smsBlockedDnc,
      reroutedToMail: comp.reroutedToMail,
      reroutedToDoorKnock: comp.reroutedToDoorKnock,
    };
    setTriggered(ts => [t, ...ts]);
    if (r.channels.sms && comp.blocked > 0) {
      const parts: string[] = [];
      if (comp.reroutedToMail) parts.push(`${comp.reroutedToMail} → mail`);
      if (comp.reroutedToDoorKnock) parts.push(`${comp.reroutedToDoorKnock} → door-knock`);
      toast.success(`${r.name} · ${comp.blocked} non-consenting SMS blocked · ${parts.join(", ") || "no fallback channel"}`);
    } else {
      toast.success(`Threshold met · ${r.name} · ${match.reading}`);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Zap className="w-6 h-6 text-storm" /> Auto Storm Campaigns
          </h1>
          <p className="text-sm text-muted-foreground">
            Automatically trigger email, SMS, mail, and door-knock campaigns when damaging weather is detected in your markets.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={simulate}>
            <Activity className="w-4 h-4 mr-2" /> Simulate trigger
          </Button>
          <Button onClick={openNew}>
            <Plus className="w-4 h-4 mr-2" /> New automation rule
          </Button>
        </div>
      </header>

      {/* Real-time dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <Stat label="Monitored markets" value={markets.length} icon={Target} tone="storm" />
        <Stat label="Active triggers" value={cells.length} icon={CloudLightning} tone="warning" />
        <Stat label="Rules armed" value={armed} icon={ShieldCheck} tone="success" />
        <Stat label="Triggered today" value={triggeredToday} icon={Zap} tone="storm" />
        <Stat label="Awaiting approval" value={pending.length} icon={Clock} tone="warning" />
        <Stat label="Campaigns sent" value={sent} icon={Send} tone="success" />
        <Stat label="Compliance blocked" value={totalBlocked} icon={ShieldAlert} tone="destructive" />
      </div>

      {/* Per-market automation master switches */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-storm" />
            <h2 className="font-semibold text-sm">Market automation</h2>
          </div>
          <span className="text-[11px] text-muted-foreground">Off = no triggers fire for that market, regardless of rules.</span>
        </div>
        {markets.length === 0 ? (
          <p className="text-xs text-muted-foreground">No saved markets yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {markets.map(m => {
              const on = isMarketArmed(m.name);
              const ruleCount = rules.filter(r => r.marketScope.value === m.name).length;
              return (
                <label key={m.id} className={cn(
                  "flex items-center justify-between gap-2 px-3 py-2 rounded border cursor-pointer transition-colors",
                  on ? "border-storm/40 bg-storm/5" : "border-border bg-muted/40"
                )}>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{m.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {ruleCount} rule{ruleCount === 1 ? "" : "s"} · {on ? "Watching live weather" : "Paused"}
                    </div>
                  </div>
                  <Switch checked={on} onCheckedChange={v => {
                    setMarketAutomation(s => ({ ...s, [m.name]: v }));
                    toast.success(`${m.name} auto-campaigns ${v ? "on" : "off"}`);
                  }} />
                </label>
              );
            })}
          </div>
        )}
      </Card>

      <Tabs defaultValue="rules">
        <TabsList>
          <TabsTrigger value="rules">Automation rules ({rules.length})</TabsTrigger>
          <TabsTrigger value="approval">Approval queue ({pending.length})</TabsTrigger>
          <TabsTrigger value="log">Trigger log ({triggered.length})</TabsTrigger>
          <TabsTrigger value="templates">Message templates</TabsTrigger>
        </TabsList>

        {/* Rules list */}
        <TabsContent value="rules" className="space-y-2 mt-4">
          {rules.length === 0 && (
            <Card className="p-8 text-center text-sm text-muted-foreground">
              No rules yet. Create your first automation to start watching markets.
            </Card>
          )}
          {rules.map(r => {
            const Tpl = TEMPLATES[r.template];
            const activeTriggers = (Object.keys(r.triggers) as TriggerKey[]).filter(k => r.triggers[k]);
            const activeChannels = (Object.keys(r.channels) as ChannelKey[]).filter(k => r.channels[k]);
            return (
              <Card key={r.id} className="p-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-base truncate">{r.name || "Unnamed rule"}</h3>
                      <Badge variant={r.enabled ? "default" : "outline"} className="text-[10px]">
                        {r.enabled ? "Armed" : "Paused"}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] capitalize">{r.marketScope.type}: {r.marketScope.value || "—"}</Badge>
                      <Badge variant="outline" className="text-[10px]">{TIMING_DEFS.find(t => t.key === r.timing)?.label}</Badge>
                    </div>
                    <div className="mt-2 grid sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-muted-foreground mb-1">Triggers</div>
                        <div className="flex flex-wrap gap-1">
                          {activeTriggers.map(k => {
                            const def = TRIGGER_DEFS.find(d => d.key === k)!;
                            const Icon = def.icon;
                            return (
                              <span key={k} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-storm/10 text-storm border border-storm/30">
                                <Icon className="w-3 h-3" /> {def.label}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground mb-1">Channels</div>
                        <div className="flex flex-wrap gap-1">
                          {activeChannels.map(k => {
                            const def = CHANNEL_DEFS.find(d => d.key === k)!;
                            const Icon = def.icon;
                            return (
                              <span key={k} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-accent border border-border">
                                <Icon className="w-3 h-3" /> {def.label}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-[11px] text-muted-foreground">
                      Thresholds: hail ≥ {r.thresholds.hailIn}" · gust ≥ {r.thresholds.gustMph} mph · sustained ≥ {r.thresholds.sustainedMph} mph · tornado: {r.thresholds.tornado} · severe: {r.thresholds.severe} · template: <span className="text-foreground">{Tpl.label}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch checked={r.enabled} onCheckedChange={() => toggleRule(r.id)} />
                    <Button variant="outline" size="sm" onClick={() => openEdit(r)}>
                      <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteRule(r.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </TabsContent>

        {/* Approval queue */}
        <TabsContent value="approval" className="space-y-2 mt-4">
          {pending.length === 0 && (
            <Card className="p-8 text-center text-sm text-muted-foreground">
              No campaigns awaiting approval.
            </Card>
          )}
          {pending.map(t => (
            <Card key={t.id} className="p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-base truncate">{t.ruleName}</h3>
                    <Badge className="text-[10px] bg-warning text-warning-foreground">Awaiting approval</Badge>
                    <Badge variant="outline" className="text-[10px]">{t.marketName}</Badge>
                    <Badge variant="outline" className="text-[10px]">{t.reading}</Badge>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {t.eligible.toLocaleString()} eligible · {t.blocked} blocked by compliance · channels: {t.channels.join(", ")}
                  </div>
                  <p className="mt-2 text-sm bg-muted p-2 rounded line-clamp-2">{t.message}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => setReviewing(t)}>
                    <Eye className="w-3.5 h-3.5 mr-1" /> Review
                  </Button>
                  <Button size="sm" onClick={() => approve(t)}>
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => reject(t)}>
                    <XCircle className="w-3.5 h-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        {/* Trigger log */}
        <TabsContent value="log" className="mt-4">
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Time</th>
                    <th className="px-3 py-2">Rule</th>
                    <th className="px-3 py-2">Market</th>
                    <th className="px-3 py-2">Trigger</th>
                    <th className="px-3 py-2">Eligible</th>
                    <th className="px-3 py-2">Blocked</th>
                    <th className="px-3 py-2">Channels</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {triggered.map(t => (
                    <tr key={t.id} className="border-t border-border/60">
                      <td className="px-3 py-2 text-xs text-muted-foreground">{new Date(t.triggeredAt).toLocaleString()}</td>
                      <td className="px-3 py-2 font-medium">{t.ruleName}</td>
                      <td className="px-3 py-2">{t.marketName}</td>
                      <td className="px-3 py-2 text-xs">{t.reading}</td>
                      <td className="px-3 py-2">{t.eligible.toLocaleString()}</td>
                      <td className="px-3 py-2 text-destructive">{t.blocked}</td>
                      <td className="px-3 py-2 text-xs">{t.channels.join(", ")}</td>
                      <td className="px-3 py-2">
                        <Badge className={cn("text-[10px] capitalize",
                          t.status === "sent" && "bg-success text-success-foreground",
                          t.status === "pending" && "bg-warning text-warning-foreground",
                          t.status === "rejected" && "bg-destructive text-destructive-foreground",
                          t.status === "approved" && "bg-storm text-storm-foreground",
                        )}>{t.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Templates */}
        <TabsContent value="templates" className="grid md:grid-cols-2 gap-3 mt-4">
          {(Object.keys(TEMPLATES) as TemplateKey[]).map(k => (
            <Card key={k} className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Megaphone className="w-4 h-4 text-storm" />
                <h3 className="font-semibold text-sm">{TEMPLATES[k].label}</h3>
              </div>
              <div className="text-xs text-muted-foreground mb-1">Subject</div>
              <div className="text-sm font-medium mb-2">{TEMPLATES[k].subject}</div>
              <div className="text-xs text-muted-foreground mb-1">Body</div>
              <p className="text-sm bg-muted p-3 rounded">{TEMPLATES[k].body}</p>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Compliance banner */}
      <Card className="p-4 bg-storm/5 border-storm/30">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-storm shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="font-semibold text-sm text-foreground">Compliance safety rules (always on)</div>
            <ul className="list-disc pl-4 space-y-0.5 text-muted-foreground">
              <li>SMS only sends to contacts with <code>sms_consent = true</code> and never to <code>dnc_status = true</code>.</li>
              <li>Cold SMS is blocked — non-consented homeowners are routed to direct mail or door-knock instead.</li>
              <li>SMS includes STOP opt-out language; email includes unsubscribe footer (system-managed).</li>
              <li>Every triggered campaign is logged with eligible/blocked counts and the reason for each block.</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Rule editor */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing.name ? `Edit · ${editing.name}` : "New automation rule"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label>Rule name</Label>
                <Input value={editing.name} onChange={e => setEditing(r => ({ ...r, name: e.target.value }))}
                  placeholder="e.g. Hendersonville Hail Alert" />
              </div>
              <div>
                <Label>Template</Label>
                <Select value={editing.template} onValueChange={v => setEditing(r => ({ ...r, template: v as TemplateKey }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(Object.keys(TEMPLATES) as TemplateKey[]).map(k => (
                      <SelectItem key={k} value={k}>{TEMPLATES[k].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label>Target market type</Label>
                <Select value={editing.marketScope.type}
                  onValueChange={v => setEditing(r => ({ ...r, marketScope: { ...r.marketScope, type: v as any } }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["saved", "state", "region", "county", "city", "zip", "custom", "stormPath"].map(t => (
                      <SelectItem key={t} value={t} className="capitalize">{t === "stormPath" ? "Storm path polygon" : t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Target value</Label>
                {editing.marketScope.type === "saved" ? (
                  <Select value={editing.marketScope.value}
                    onValueChange={v => setEditing(r => ({ ...r, marketScope: { ...r.marketScope, value: v } }))}>
                    <SelectTrigger><SelectValue placeholder="Pick a saved market" /></SelectTrigger>
                    <SelectContent>
                      {markets.map(m => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input value={editing.marketScope.value}
                    onChange={e => setEditing(r => ({ ...r, marketScope: { ...r.marketScope, value: e.target.value } }))}
                    placeholder="Enter value" />
                )}
              </div>
            </div>

            <div>
              <Label>Weather triggers</Label>
              <div className="grid sm:grid-cols-2 gap-1.5 mt-1">
                {TRIGGER_DEFS.map(({ key, label, icon: Icon }) => (
                  <label key={key} className="flex items-center justify-between gap-2 px-2 py-1.5 rounded border border-border bg-background cursor-pointer">
                    <span className="flex items-center gap-1.5 text-xs"><Icon className="w-3.5 h-3.5 text-storm" /> {label}</span>
                    <Switch checked={editing.triggers[key]}
                      onCheckedChange={v => setEditing(r => ({ ...r, triggers: { ...r.triggers, [key]: v } }))} />
                  </label>
                ))}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <ChipSelect label='Hail size ≥' suffix='"' options={HAIL_OPTIONS} value={editing.thresholds.hailIn}
                onChange={v => setEditing(r => ({ ...r, thresholds: { ...r.thresholds, hailIn: v } }))} />
              <ChipSelect label="Wind gust ≥" suffix=" mph" options={GUST_OPTIONS} value={editing.thresholds.gustMph}
                onChange={v => setEditing(r => ({ ...r, thresholds: { ...r.thresholds, gustMph: v } }))} />
              <ChipSelect label="Sustained wind ≥" suffix=" mph" options={SUSTAINED_OPTIONS} value={editing.thresholds.sustainedMph}
                onChange={v => setEditing(r => ({ ...r, thresholds: { ...r.thresholds, sustainedMph: v } }))} />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Tornado</Label>
                  <Select value={editing.thresholds.tornado}
                    onValueChange={v => setEditing(r => ({ ...r, thresholds: { ...r.thresholds, tornado: v as any } }))}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="watch">Watch</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Severe</Label>
                  <Select value={editing.thresholds.severe}
                    onValueChange={v => setEditing(r => ({ ...r, thresholds: { ...r.thresholds, severe: v as any } }))}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="watch">Watch</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="radar">Radar-indicated</SelectItem>
                      <SelectItem value="nws">NWS alert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <Label>Campaign timing</Label>
              <Select value={editing.timing}
                onValueChange={v => setEditing(r => ({ ...r, timing: v as Timing, manualApproval: v === "manualApproval" || r.manualApproval }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIMING_DEFS.map(t => <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Channels</Label>
              <div className="grid sm:grid-cols-2 gap-1.5 mt-1">
                {CHANNEL_DEFS.map(({ key, label, icon: Icon }) => (
                  <label key={key} className="flex items-center justify-between gap-2 px-2 py-1.5 rounded border border-border bg-background cursor-pointer">
                    <span className="flex items-center gap-1.5 text-xs"><Icon className="w-3.5 h-3.5 text-storm" /> {label}</span>
                    <Switch checked={editing.channels[key]}
                      onCheckedChange={v => setEditing(r => ({
                        ...r,
                        channels: { ...r.channels, [key]: v },
                        // SMS always forces manual approval ON for compliance
                        manualApproval: key === "sms" && v ? true : r.manualApproval,
                      }))} />
                  </label>
                ))}
              </div>
              {editing.channels.sms && (
                <p className="text-[11px] text-warning mt-1.5 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> SMS sends only to consenting contacts (no DNC) and is locked to manual approval.
                </p>
              )}
            </div>

            <label className={cn(
              "flex items-center justify-between gap-2 px-3 py-2 rounded border cursor-pointer",
              editing.channels.sms ? "border-warning/50 bg-warning/5" : "border-border bg-background"
            )}>
              <span className="text-sm flex items-center gap-2">
                Require manual approval before any send
                {editing.channels.sms && <Lock className="w-3.5 h-3.5 text-warning" />}
              </span>
              <Switch
                checked={editing.manualApproval || editing.channels.sms}
                disabled={editing.channels.sms}
                onCheckedChange={v => setEditing(r => ({ ...r, manualApproval: v }))}
              />
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditorOpen(false)}>Cancel</Button>
            <Button onClick={saveRule}>Save rule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval review */}
      <Dialog open={!!reviewing} onOpenChange={v => !v && setReviewing(null)}>
        <DialogContent className="max-w-xl">
          {reviewing && (
            <>
              <DialogHeader><DialogTitle>Review · {reviewing.ruleName}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Field label="Market" value={reviewing.marketName} />
                  <Field label="Trigger" value={reviewing.reading} />
                  <Field label="Eligible contacts" value={reviewing.eligible.toLocaleString()} />
                  <Field label="Blocked by compliance" value={`${reviewing.blocked}`} />
                  <Field label="Channels" value={reviewing.channels.join(", ")} />
                  <Field label="Triggered at" value={new Date(reviewing.triggeredAt).toLocaleString()} />
                </div>
                {reviewing.channels.includes("sms") && (
                  <Card className="p-3 bg-warning/5 border-warning/30">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldAlert className="w-4 h-4 text-warning" />
                      <span className="text-xs font-semibold">SMS compliance breakdown</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <Field label="SMS eligible (consent ✓, not DNC)" value={(reviewing.smsEligible ?? 0).toLocaleString()} />
                      <Field label="Blocked — no consent" value={(reviewing.smsBlockedNoConsent ?? 0).toLocaleString()} />
                      <Field label="Blocked — DNC" value={(reviewing.smsBlockedDnc ?? 0).toLocaleString()} />
                      <Field label="Rerouted → Direct mail" value={(reviewing.reroutedToMail ?? 0).toLocaleString()} />
                      <Field label="Rerouted → Door-knock" value={(reviewing.reroutedToDoorKnock ?? 0).toLocaleString()} />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-2">
                      Non-consenting and DNC contacts are never texted. They are automatically rerouted to direct mail export and door-knock route.
                    </p>
                  </Card>
                )}
                <div>
                  <Label>Message</Label>
                  <Textarea value={reviewing.message} rows={5}
                    onChange={e => setReviewing(r => r ? { ...r, message: e.target.value } : r)} />
                </div>
              </div>
              <DialogFooter className="gap-2 flex-wrap">
                <Button variant="outline" onClick={() => { toast.success(`${reviewing.eligible} leads exported`); }}>
                  <FileText className="w-4 h-4 mr-2" /> Export leads
                </Button>
                <Button variant="outline" onClick={() => { toast.success("Door-knock route assigned to rep"); }}>
                  <Footprints className="w-4 h-4 mr-2" /> Assign to rep
                </Button>
                <Button variant="ghost" onClick={() => reject(reviewing)}>
                  <XCircle className="w-4 h-4 mr-2 text-destructive" /> Reject
                </Button>
                <Button onClick={() => approve(reviewing)}>
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Approve & send
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ label, value, icon: Icon, tone }: { label: string; value: number; icon: any; tone: "storm" | "warning" | "success" | "destructive" }) {
  const toneClass = {
    storm: "text-storm bg-storm/10",
    warning: "text-warning bg-warning/10",
    success: "text-success bg-success/10",
    destructive: "text-destructive bg-destructive/10",
  }[tone];
  return (
    <Card className="p-3">
      <div className="flex items-center justify-between">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className={`w-7 h-7 rounded-md flex items-center justify-center ${toneClass}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </Card>
  );
}

function ChipSelect({ label, options, value, onChange, suffix }: { label: string; options: number[]; value: number; onChange: (v: number) => void; suffix?: string }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <div className="flex flex-wrap gap-1 mt-1">
        {options.map(o => (
          <button key={o} type="button" onClick={() => onChange(o)}
            className={cn("px-2 py-1 rounded text-[11px] font-medium border",
              value === o ? "bg-storm text-storm-foreground border-storm" : "bg-background border-border hover:border-storm/50")}>
            {o}{suffix}
          </button>
        ))}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2 rounded bg-muted">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
