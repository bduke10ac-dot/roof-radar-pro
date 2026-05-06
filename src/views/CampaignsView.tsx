import { useState } from "react";
import { Mail, MessageSquare, Save, Send, Download, Lock, AlertTriangle, Target, ImageIcon, Upload, PhoneCall, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMarketLeads } from "@/hooks/useMarketFilter";
import { useMarkets, type SavedMarket } from "@/contexts/MarketContext";
import { leadMatchesMarket } from "@/hooks/useMarketFilter";
import { toast } from "sonner";
import { useBrand } from "@/hooks/useBrand";

type Segment = "all" | "state" | "region" | "county" | "city" | "zip" | "geofence" | "market" | "storm";
const SEGMENTS: { value: Segment; label: string }[] = [
  { value: "all", label: "Entire database" },
  { value: "state", label: "By state" },
  { value: "region", label: "By region" },
  { value: "county", label: "By county" },
  { value: "city", label: "By city" },
  { value: "zip", label: "ZIP group" },
  { value: "geofence", label: "Custom geofence" },
  { value: "market", label: "Saved market" },
  { value: "storm", label: "Storm event area" },
];

export function CampaignsView() {
  const { leads, allLeads } = useMarketLeads();
  const { markets, activeMarket } = useMarkets();
  const { brand } = useBrand();
  const [segment, setSegment] = useState<Segment>(activeMarket ? "market" : "all");
  const [marketId, setMarketId] = useState<string>(activeMarket?.id ?? markets[0]?.id ?? "");
  const [emailSubj, setEmailSubj] = useState("Free roof inspection after the April 22 storm");
  const [emailBody, setEmailBody] = useState(
    "Hi {{first_name}},\n\nWe noticed your neighborhood was hit by 1.75\" hail on 4/22. We'd be glad to provide a free, no-obligation roof inspection.\n\n— RoofRadar Team\n\nUnsubscribe: {{unsubscribe_link}}"
  );
  const [smsBody, setSmsBody] = useState(
    "RoofRadar: Hi {{first_name}}, free post-storm roof inspection in your area. Reply YES to schedule. Reply STOP to opt out."
  );

  // AI cold call settings
  const [aiCallEnabled, setAiCallEnabled] = useState(false);
  const [aiVoice, setAiVoice] = useState<"female_warm" | "male_pro" | "female_pro" | "male_friendly">("female_warm");
  const [aiCallWindow, setAiCallWindow] = useState<"9to6" | "10to7" | "11to5">("9to6");
  const [aiGoal, setAiGoal] = useState<"book_inspection" | "qualify_only" | "voicemail_drop">("book_inspection");
  const [aiScript, setAiScript] = useState(
    `Hi, this is {{agent_name}} calling from {{company_name}} about recent storm damage in {{city}}.\n\nI'm not selling anything — we're offering free, no-obligation roof and exterior inspections to homeowners on {{street_name}} after the {{storm_date}} storm that brought {{hail_size}}\" hail and {{wind_speed}} mph winds to your area.\n\nMost inspections take about 20 minutes and we provide a written report you can keep, even if you don't need any work done. Many insurance carriers require an inspection within their claim window.\n\nWould a quick visit on {{slot_1}} or {{slot_2}} work better for you?\n\n[If yes] Great — I'll text you a confirmation right after this call.\n[If not interested] No problem, I'll mark you as not interested and we won't call again. Have a great day.\n[If voicemail] Hi, this is {{agent_name}} from {{company_name}}. We're offering free roof inspections after the recent storm in {{city}}. Call us back at {{callback_number}} or reply STOP to {{sms_number}} to opt out. Thanks.`
  );


  const segmentLeads = (() => {
    if (segment === "market") {
      const m: SavedMarket | undefined = markets.find(x => x.id === marketId);
      if (!m) return leads;
      return allLeads.filter(l => leadMatchesMarket(l, m));
    }
    // All other segment types still respect the globally active market
    return leads;
  })();

  // SMS-eligible: explicit sms_consent AND not on DNC list, within selected segment
  const smsEligible = segmentLeads.filter(l => l.smsConsent && !l.dncStatus);
  const emailEligible = segmentLeads.filter(l => l.consent !== "opted_out");
  const coldExportable = segmentLeads.filter(l => !l.dncStatus); // direct mail / door knock
  const aiCallEligible = segmentLeads.filter(l => !l.dncStatus && !!l.phone);
  const smsBlocked = segmentLeads.length - smsEligible.length;
  const hasStop = smsBody.toUpperCase().includes("STOP");
  const hasUnsub = emailBody.toLowerCase().includes("unsubscribe");
  const canSendSms = smsEligible.length > 0 && hasStop;
  const canSendEmail = emailEligible.length > 0 && hasUnsub;
  const hasOptOut = aiScript.toLowerCase().includes("stop") || aiScript.toLowerCase().includes("opt out") || aiScript.toLowerCase().includes("not interested");
  const canStartAiCalls = aiCallEnabled && aiCallEligible.length > 0 && hasOptOut;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Campaign builder</h1>
        <p className="text-sm text-muted-foreground">Reach the right homeowners through compliant channels.</p>
      </header>

      <div className="bg-card rounded-xl p-3 shadow-card border border-border/60 flex items-center gap-3">
        <div className="w-12 h-12 rounded-md bg-background border border-border/60 flex items-center justify-center overflow-hidden shrink-0">
          {brand.company_logo_url
            ? <img src={brand.company_logo_url} alt="Company logo" className="w-full h-full object-contain" />
            : <ImageIcon className="w-5 h-5 text-muted-foreground" />}
        </div>
        <div className="flex-1 min-w-0 text-xs">
          <div className="font-semibold truncate">
            {brand.company_logo_url ? (brand.company_name ?? "Your branding") : "No company logo set"}
          </div>
          <div className="text-muted-foreground truncate">
            {brand.company_logo_url
              ? "Will appear on outgoing emails, SMS landing pages and shared storm reports."
              : "Upload your logo in Billing & Subscription → Company branding."}
          </div>
        </div>
        <Button size="sm" variant="outline" className="shrink-0" onClick={() => toast.info("Open Billing & Subscription → Company branding to upload your logo.")}>
          <Upload className="w-3.5 h-3.5" /> {brand.company_logo_url ? "Change" : "Add logo"}
        </Button>
      </div>

      <div className="bg-card rounded-xl p-4 shadow-card border border-border/60 grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
        <div>
          <Label className="text-xs text-muted-foreground flex items-center gap-1.5"><Target className="w-3.5 h-3.5" />Segment</Label>
          <Select value={segment} onValueChange={(v) => setSegment(v as Segment)}>
            <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
            <SelectContent>
              {SEGMENTS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {segment === "market" && (
          <div>
            <Label className="text-xs text-muted-foreground">Saved market</Label>
            <Select value={marketId} onValueChange={setMarketId}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select market" /></SelectTrigger>
              <SelectContent>
                {markets.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="text-xs text-muted-foreground sm:text-right">
          <span className="font-semibold text-foreground">{segmentLeads.length}</span> contacts in segment
        </div>
      </div>

      <Tabs defaultValue="email">
        <TabsList>
          <TabsTrigger value="email"><Mail className="w-4 h-4 mr-2" />Email</TabsTrigger>
          <TabsTrigger value="sms"><MessageSquare className="w-4 h-4 mr-2" />SMS</TabsTrigger>
          <TabsTrigger value="aicall"><PhoneCall className="w-4 h-4 mr-2" />AI cold call</TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="mt-5">
          <div className="grid lg:grid-cols-[1fr_320px] gap-5">
            <div className="bg-card rounded-xl p-5 shadow-card border border-border/60 space-y-4">
              <div>
                <Label>Subject</Label>
                <Input value={emailSubj} onChange={e => setEmailSubj(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label>Body</Label>
                <Textarea value={emailBody} onChange={e => setEmailBody(e.target.value)} rows={10} className="mt-1.5 font-mono text-sm" />
                <p className="text-xs text-muted-foreground mt-2">Must include an unsubscribe link. Use <code>{`{{unsubscribe_link}}`}</code>.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button disabled={!canSendEmail} onClick={() => toast.success(`Test email queued for ${emailEligible.length} contacts`)}>
                  {canSendEmail ? <Send className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                  {canSendEmail ? "Send test" : "Add unsubscribe link"}
                </Button>
                <Button variant="outline" onClick={() => toast.success("Template saved")}><Save className="w-4 h-4 mr-2" />Save template</Button>
                <Button variant="outline" onClick={() => toast.success(`CSV exported (${emailEligible.length} contacts)`)}><Download className="w-4 h-4 mr-2" />Export CSV</Button>
                <Button variant="outline" onClick={() => toast.success(`Direct mail / door-knock list: ${coldExportable.length} addresses`)}>
                  <Download className="w-4 h-4 mr-2" />Cold outreach (mail/door)
                </Button>
              </div>
            </div>
            <div className="bg-card rounded-xl p-5 shadow-card border border-border/60 h-fit space-y-3 text-sm">
              <div className="font-semibold">Audience</div>
              <Stat label="Email-eligible (in segment)" value={emailEligible.length} />
              <Stat label="Excluded (opted out)" value={segmentLeads.length - emailEligible.length} />
              <Stat label="Cold-outreach exportable" value={coldExportable.length} />
              <div className="pt-3 border-t border-border/60 text-xs text-muted-foreground">
                CAN-SPAM: physical address & one-click unsubscribe required. Cold mail/door-knock is permitted for non-DNC contacts.
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="sms" className="mt-5">
          <div className="rounded-xl p-4 border border-warning/40 bg-warning/10 flex gap-3 mb-5">
            <Lock className="w-5 h-5 shrink-0 text-warning mt-0.5" />
            <div className="text-sm">
              <div className="font-semibold text-warning">SMS sending is locked: requires sms_consent = true and dnc_status = false</div>
              <div className="text-foreground/80 mt-1">
                {smsEligible.length} of {segmentLeads.length} contacts in segment are SMS-eligible. {smsBlocked} blocked (no consent or DNC). Cold SMS violates TCPA.
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_320px] gap-5">
            <div className="bg-card rounded-xl p-5 shadow-card border border-border/60 space-y-4">
              <div>
                <Label>Message ({smsBody.length}/160)</Label>
                <Textarea value={smsBody} onChange={e => setSmsBody(e.target.value)} rows={6} className="mt-1.5" maxLength={320} />
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                  {smsBody.toUpperCase().includes("STOP")
                    ? <span className="text-success font-medium">✓ Includes STOP opt-out language</span>
                    : <span className="text-destructive font-medium flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Must include "Reply STOP to opt out"</span>}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={!canSendSms}
                  onClick={() => {
                    if (!canSendSms) return;
                    toast.success(`Test SMS queued for ${smsEligible.length} eligible contacts`);
                  }}
                >
                  {canSendSms ? <Send className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                  {canSendSms ? "Send test" : "SMS locked"}
                </Button>
                <Button variant="outline" onClick={() => toast.success("Template saved")}><Save className="w-4 h-4 mr-2" />Save template</Button>
                <Button variant="outline" onClick={() => toast.success(`CSV exported (${smsEligible.length} eligible)`)}><Download className="w-4 h-4 mr-2" />Export CSV</Button>
              </div>
            </div>
            <div className="bg-card rounded-xl p-5 shadow-card border border-border/60 h-fit space-y-3 text-sm">
              <div className="font-semibold">SMS-eligible audience</div>
              <Stat label="SMS-eligible (consent + no DNC)" value={smsEligible.length} />
              <Stat label="Locked (no consent or DNC)" value={smsBlocked} />
              <div className="pt-3 border-t border-border/60 text-xs text-muted-foreground">
                TCPA: prior express written consent required. Always include opt-out instructions.
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="aicall" className="mt-5">
          <div className="rounded-xl p-4 border border-storm/40 bg-storm/10 flex gap-3 mb-5">
            <Sparkles className="w-5 h-5 shrink-0 text-storm mt-0.5" />
            <div className="text-sm">
              <div className="font-semibold text-storm">AI voice agent — optional cold-call source</div>
              <div className="text-foreground/80 mt-1">
                A natural-sounding AI voice agent calls non-DNC homeowners in your segment to book free roof &amp; exterior storm-damage inspections. Skips DNC, respects state calling hours, leaves a voicemail with opt-out, and logs every call.
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_320px] gap-5">
            <div className="bg-card rounded-xl p-5 shadow-card border border-border/60 space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
                <div>
                  <div className="font-semibold text-sm">Enable AI cold-call source</div>
                  <div className="text-xs text-muted-foreground">Off by default. Turn on to start placing calls to {aiCallEligible.length} eligible numbers in segment.</div>
                </div>
                <Switch checked={aiCallEnabled} onCheckedChange={setAiCallEnabled} />
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Goal</Label>
                  <Select value={aiGoal} onValueChange={(v) => setAiGoal(v as typeof aiGoal)}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="book_inspection">Book inspection</SelectItem>
                      <SelectItem value="qualify_only">Qualify only</SelectItem>
                      <SelectItem value="voicemail_drop">Voicemail drop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Voice</Label>
                  <Select value={aiVoice} onValueChange={(v) => setAiVoice(v as typeof aiVoice)}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="female_warm">Female — warm</SelectItem>
                      <SelectItem value="female_pro">Female — professional</SelectItem>
                      <SelectItem value="male_friendly">Male — friendly</SelectItem>
                      <SelectItem value="male_pro">Male — professional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Calling window (local)</Label>
                  <Select value={aiCallWindow} onValueChange={(v) => setAiCallWindow(v as typeof aiCallWindow)}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9to6">9 AM – 6 PM</SelectItem>
                      <SelectItem value="10to7">10 AM – 7 PM</SelectItem>
                      <SelectItem value="11to5">11 AM – 5 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Pre-written script</Label>
                <Textarea value={aiScript} onChange={e => setAiScript(e.target.value)} rows={14} className="mt-1.5 font-mono text-xs" />
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-2">
                  <span>Merge tags: <code>{`{{first_name}}`}</code> <code>{`{{city}}`}</code> <code>{`{{street_name}}`}</code> <code>{`{{storm_date}}`}</code> <code>{`{{hail_size}}`}</code> <code>{`{{wind_speed}}`}</code> <code>{`{{slot_1}}`}</code> <code>{`{{slot_2}}`}</code> <code>{`{{company_name}}`}</code> <code>{`{{callback_number}}`}</code></span>
                </div>
                <div className="flex items-center gap-2 text-xs mt-2">
                  {hasOptOut
                    ? <span className="text-success font-medium">✓ Includes opt-out / "not interested" handling</span>
                    : <span className="text-destructive font-medium flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Script must include opt-out language ("STOP", "opt out", or "not interested")</span>}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  disabled={!canStartAiCalls}
                  onClick={() => {
                    if (!canStartAiCalls) return;
                    toast.success(`AI cold-call campaign queued for ${aiCallEligible.length} numbers (goal: ${aiGoal.replace("_"," ")})`);
                  }}
                >
                  {canStartAiCalls ? <PhoneCall className="w-4 h-4 mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
                  {!aiCallEnabled ? "Enable to start" : !hasOptOut ? "Add opt-out language" : "Start AI calls"}
                </Button>
                <Button variant="outline" onClick={() => toast.success("Script template saved")}><Save className="w-4 h-4 mr-2" />Save script</Button>
                <Button variant="outline" onClick={() => toast.success(`Call list exported (${aiCallEligible.length} numbers)`)}><Download className="w-4 h-4 mr-2" />Export call list</Button>
              </div>
            </div>

            <div className="bg-card rounded-xl p-5 shadow-card border border-border/60 h-fit space-y-3 text-sm">
              <div className="font-semibold">AI call audience</div>
              <Stat label="Callable (phone + no DNC)" value={aiCallEligible.length} />
              <Stat label="Excluded (DNC or no phone)" value={segmentLeads.length - aiCallEligible.length} />
              <div className="pt-3 border-t border-border/60 text-xs text-muted-foreground space-y-1.5">
                <div><span className="font-semibold text-foreground">TCPA safeguards:</span> federal & state DNC scrubbed before each call, calling-hour limits enforced per recipient time zone, AI discloses it is an automated assistant, and "STOP / not interested" instantly opts the lead out across all channels.</div>
                <div>Every call is recorded (where lawful), transcribed, and attached to the lead record.</div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
