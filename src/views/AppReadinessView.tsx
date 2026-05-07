import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, MinusCircle, ShieldCheck, Loader2, FlaskConical, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useDemoMode } from "@/contexts/DemoModeContext";
import { supabase } from "@/integrations/supabase/client";
import { downloadCsv } from "@/lib/csv";

type CheckStatus = "ok" | "fail" | "skipped" | "pending";
type Check = { name: string; status: CheckStatus; detail?: string; group: "core" | "data" | "integrations" | "beta" };

function StatusIcon({ status }: { status: CheckStatus }) {
  if (status === "ok") return <CheckCircle2 className="w-4 h-4 text-success" />;
  if (status === "fail") return <XCircle className="w-4 h-4 text-destructive" />;
  if (status === "pending") return <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />;
  return <MinusCircle className="w-4 h-4 text-muted-foreground" />;
}

const SAMPLE_CSV_HEADERS = [
  "homeowner_name","address","city","state","zip","phone","email",
  "market","source","sms_consent","dnc_status","email_unsubscribed",
];
const SAMPLE_CSV_ROWS = [
  ["Jane Doe","123 Oak St","Hendersonville","TN","37075","+16155551234","jane@example.com","Hendersonville","manual","yes","no","no"],
  ["John Smith","456 Maple Ave","Nashville","TN","37201","+16155555678","john@example.com","Nashville","door-knock","no","no","no"],
  ["Acme Owner","789 Pine Ln","Bowling Green","KY","42101","+12705559876","owner@example.com","Southern Kentucky","csv-import","yes","no","no"],
];

function buildSampleCsv() {
  const escape = (s: string) => /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  return [SAMPLE_CSV_HEADERS.join(","), ...SAMPLE_CSV_ROWS.map(r => r.map(escape).join(","))].join("\n");
}

export function AppReadinessView() {
  const { user } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { demoMode, setDemoMode } = useDemoMode();
  const [checks, setChecks] = useState<Check[]>([]);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (roleLoading || !isAdmin) return;
    (async () => {
      setRunning(true);
      const out: Check[] = [];

      out.push({ group: "core", name: "Authentication", status: user ? "ok" : "fail", detail: user ? `Signed in as ${user.email}` : "No active session" });

      const probe = async (table: string, label: string, group: Check["group"] = "data"): Promise<Check> => {
        const { error } = await supabase.from(table as any).select("id", { count: "exact", head: true }).limit(1);
        return { group, name: label, status: error ? "fail" : "ok", detail: error ? error.message : "Reachable" };
      };

      out.push(await probe("leads", "Leads (import/export)"));
      out.push(await probe("markets", "Markets"));
      out.push(await probe("auto_campaign_rules", "Automation rules"));
      out.push(await probe("triggered_campaigns", "Triggered campaigns"));
      out.push(await probe("campaign_compliance_logs", "Campaign exports / compliance logs"));
      out.push(await probe("user_map_preferences", "Map preferences"));
      out.push(await probe("subscriptions", "Stripe subscriptions", "integrations"));
      out.push({ ...await probe("lead_imports", "Lead import history"), group: "data" });

      // External services
      try {
        const res = await fetch("https://api.weather.gov/alerts/active?area=TN&limit=1");
        out.push({ group: "integrations", name: "NWS alerts (api.weather.gov)", status: res.ok ? "ok" : "fail", detail: res.ok ? "Reachable" : `HTTP ${res.status}` });
      } catch (e) { out.push({ group: "integrations", name: "NWS alerts", status: "fail", detail: "Network error" }); }
      try {
        const res = await fetch("https://api.rainviewer.com/public/weather-maps.json", { cache: "no-store" });
        out.push({ group: "integrations", name: "Radar tiles (RainViewer)", status: res.ok ? "ok" : "fail", detail: res.ok ? "Reachable" : `HTTP ${res.status}` });
      } catch (e) { out.push({ group: "integrations", name: "Radar tiles", status: "fail", detail: "Network error" }); }

      out.push({ group: "integrations", name: "Twilio (SMS)", status: "skipped", detail: "Connector not added — sending disabled" });
      out.push({ group: "integrations", name: "Resend (Email)", status: "skipped", detail: "Connector not added — sending disabled" });

      // Beta launch checklist (cumulative)
      const allOk = out.filter(c => c.group !== "beta").every(c => c.status === "ok" || c.status === "skipped");
      out.push({ group: "beta", name: "App store blockers", status: allOk ? "ok" : "fail",
        detail: allOk ? "Core + data + integrations healthy. SMS/Email sending intentionally skipped." : "One or more checks failed — see above." });

      setChecks(out);
      setRunning(false);
    })();
  }, [user, isAdmin, roleLoading]);

  if (roleLoading) return <div className="text-sm text-muted-foreground">Checking access…</div>;
  if (!isAdmin) {
    return (
      <Card className="p-6 max-w-md">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-5 h-5 text-warning" />
          <h2 className="font-semibold">Admin only</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          The App Readiness page is restricted to admins. Ask an administrator to grant the <code>admin</code> role.
        </p>
      </Card>
    );
  }

  const groups: { key: Check["group"]; title: string }[] = [
    { key: "core", title: "Core" },
    { key: "data", title: "Database" },
    { key: "integrations", title: "Integrations" },
    { key: "beta", title: "Beta launch" },
  ];

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-storm" /> App Readiness
        </h1>
        <p className="text-sm text-muted-foreground">Live health checks for backend, billing, automation, and integrations.</p>
      </header>

      <Card className="p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-warning" />
          <div>
            <div className="font-semibold text-sm">Demo mode</div>
            <div className="text-xs text-muted-foreground">
              When on, mock storm overlays and simulated triggers may appear. Off = real data only.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={demoMode ? "default" : "outline"} className="text-[10px] uppercase">{demoMode ? "On" : "Off"}</Badge>
          <Switch checked={demoMode} onCheckedChange={setDemoMode} />
        </div>
      </Card>

      <Card className="p-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="font-semibold text-sm">Sample lead CSV</div>
          <div className="text-xs text-muted-foreground">Download a template with all import columns pre-populated.</div>
        </div>
        <Button size="sm" variant="outline" onClick={() => downloadCsv("roofradar-sample-leads.csv", buildSampleCsv())}>
          <Download className="w-4 h-4 mr-2" /> Download sample CSV
        </Button>
      </Card>

      {groups.map(g => {
        const items = checks.filter(c => c.group === g.key);
        if (items.length === 0) return null;
        return (
          <Card key={g.key} className="overflow-hidden">
            <div className="p-4 border-b border-border/60 flex items-center justify-between">
              <div className="font-semibold text-sm">{g.title}</div>
              <Badge variant="outline" className="text-[10px] uppercase">{running ? "Running" : "Live"}</Badge>
            </div>
            <ul className="divide-y divide-border/60">
              {items.map((c, i) => (
                <li key={i} className="px-4 py-3 flex items-start gap-3">
                  <StatusIcon status={c.status} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{c.name}</div>
                    {c.detail && <div className="text-xs text-muted-foreground">{c.detail}</div>}
                  </div>
                  <Badge variant="outline" className="text-[10px] uppercase">{c.status}</Badge>
                </li>
              ))}
            </ul>
          </Card>
        );
      })}
      {running && checks.length === 0 && (
        <Card className="p-6 text-center text-sm text-muted-foreground">Running checks…</Card>
      )}
    </div>
  );
}
