import { useState } from "react";
import { Mail, MessageSquare, Save, Send, Download, Lock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useLeads } from "@/hooks/useLeads";
import { toast } from "sonner";

export function CampaignsView() {
  const { leads } = useLeads();
  const [emailSubj, setEmailSubj] = useState("Free roof inspection after the April 22 storm");
  const [emailBody, setEmailBody] = useState(
    "Hi {{first_name}},\n\nWe noticed your neighborhood was hit by 1.75\" hail on 4/22. We'd be glad to provide a free, no-obligation roof inspection.\n\n— RoofRadar Team\n\nUnsubscribe: {{unsubscribe_link}}"
  );
  const [smsBody, setSmsBody] = useState(
    "RoofRadar: Hi {{first_name}}, free post-storm roof inspection in your area. Reply YES to schedule. Reply STOP to opt out."
  );

  // SMS-eligible: explicit sms_consent AND not on DNC list
  const smsEligible = leads.filter(l => l.smsConsent && !l.dncStatus);
  const emailEligible = leads.filter(l => l.consent !== "opted_out");
  const smsBlocked = leads.length - smsEligible.length;
  const hasStop = smsBody.toUpperCase().includes("STOP");
  const canSendSms = smsEligible.length > 0 && hasStop;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Campaign builder</h1>
        <p className="text-sm text-muted-foreground">Reach the right homeowners through compliant channels.</p>
      </header>

      <Tabs defaultValue="email">
        <TabsList>
          <TabsTrigger value="email"><Mail className="w-4 h-4 mr-2" />Email</TabsTrigger>
          <TabsTrigger value="sms"><MessageSquare className="w-4 h-4 mr-2" />SMS</TabsTrigger>
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
                <Button onClick={() => toast.success("Test email sent")}><Send className="w-4 h-4 mr-2" />Send test</Button>
                <Button variant="outline" onClick={() => toast.success("Template saved")}><Save className="w-4 h-4 mr-2" />Save template</Button>
                <Button variant="outline" onClick={() => toast.success("CSV exported")}><Download className="w-4 h-4 mr-2" />Export CSV</Button>
              </div>
            </div>
            <div className="bg-card rounded-xl p-5 shadow-card border border-border/60 h-fit space-y-3 text-sm">
              <div className="font-semibold">Audience</div>
              <Stat label="Email-eligible contacts" value={emailEligible.length} />
              <Stat label="Excluded (opted out)" value={leads.length - emailEligible.length} />
              <div className="pt-3 border-t border-border/60 text-xs text-muted-foreground">
                CAN-SPAM: physical address & one-click unsubscribe required.
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
                {smsEligible.length} of {leads.length} contacts are SMS-eligible. {smsBlocked} blocked (no consent or DNC). Cold SMS violates TCPA.
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
