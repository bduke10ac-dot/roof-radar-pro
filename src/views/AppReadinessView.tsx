import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, MinusCircle, ShieldCheck, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";

type CheckStatus = "ok" | "fail" | "skipped" | "pending";
type Check = { name: string; status: CheckStatus; detail?: string };

function StatusIcon({ status }: { status: CheckStatus }) {
  if (status === "ok") return <CheckCircle2 className="w-4 h-4 text-success" />;
  if (status === "fail") return <XCircle className="w-4 h-4 text-destructive" />;
  if (status === "pending") return <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />;
  return <MinusCircle className="w-4 h-4 text-muted-foreground" />;
}

export function AppReadinessView() {
  const { user } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [checks, setChecks] = useState<Check[]>([]);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    if (roleLoading || !isAdmin) return;
    (async () => {
      setRunning(true);
      const out: Check[] = [];

      out.push({
        name: "Authentication",
        status: user ? "ok" : "fail",
        detail: user ? `Signed in as ${user.email}` : "No active session",
      });

      const probe = async (table: string): Promise<Check> => {
        const { error } = await supabase.from(table as any).select("id", { count: "exact", head: true }).limit(1);
        return {
          name: table,
          status: error ? "fail" : "ok",
          detail: error ? error.message : "Reachable",
        };
      };

      out.push({ ...(await probe("leads")), name: "Lovable Cloud DB · leads" });
      out.push({ ...(await probe("auto_campaign_rules")), name: "Rules table" });
      out.push({ ...(await probe("triggered_campaigns")), name: "Campaign queue" });
      out.push({ ...(await probe("user_map_preferences")), name: "Map preferences" });
      out.push({ ...(await probe("subscriptions")), name: "Stripe subscriptions" });

      out.push({ name: "Twilio (SMS)", status: "skipped", detail: "Connector not added — sending disabled" });
      out.push({ name: "Resend (Email)", status: "skipped", detail: "Connector not added — sending disabled" });

      const allOk = out.every(c => c.status === "ok" || c.status === "skipped");
      out.push({
        name: "App store readiness",
        status: allOk ? "ok" : "fail",
        detail: allOk ? "Core systems healthy. Sending connectors are intentionally skipped." : "One or more checks failed.",
      });

      setChecks(out);
      setRunning(false);
    })();
  }, [user, isAdmin, roleLoading]);

  if (roleLoading) {
    return <div className="text-sm text-muted-foreground">Checking access…</div>;
  }
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

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-storm" /> App Readiness
        </h1>
        <p className="text-sm text-muted-foreground">
          Live health checks for backend, billing, automation, and integrations.
        </p>
      </header>

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-border/60 flex items-center justify-between">
          <div className="font-semibold text-sm">System checks</div>
          <Badge variant="outline" className="text-[10px] uppercase">{running ? "Running" : "Live"}</Badge>
        </div>
        <ul className="divide-y divide-border/60">
          {checks.map((c, i) => (
            <li key={i} className="px-4 py-3 flex items-start gap-3">
              <StatusIcon status={c.status} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{c.name}</div>
                {c.detail && <div className="text-xs text-muted-foreground">{c.detail}</div>}
              </div>
              <Badge variant="outline" className="text-[10px] uppercase">{c.status}</Badge>
            </li>
          ))}
          {running && checks.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-muted-foreground">Running checks…</li>
          )}
        </ul>
      </Card>
    </div>
  );
}
