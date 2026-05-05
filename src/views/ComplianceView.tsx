import { AlertTriangle, ShieldCheck } from "lucide-react";
import { ConsentBadge } from "@/components/StormScoreBadge";
import { mockLeads } from "@/lib/mockData";

const sources = ["Web form", "Door knock card", "Phone (recorded)", "Imported list"];

export function ComplianceView() {
  const logs = mockLeads.map((l, i) => ({
    ...l,
    source: l.consent === "opted_in" ? sources[i % sources.length] : l.consent === "opted_out" ? "Reply STOP" : "—",
    optOutDate: l.consent === "opted_out" ? "2026-04-25" : "—",
    dnc: l.consent === "opted_out",
    smsEligible: l.consent === "opted_in",
    emailEligible: l.consent !== "opted_out",
  }));

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Compliance center</h1>
        <p className="text-sm text-muted-foreground">Consent, DNC, and channel eligibility.</p>
      </header>

      <div className="rounded-xl p-4 border border-warning/40 bg-warning/10 flex gap-3">
        <AlertTriangle className="w-5 h-5 shrink-0 text-warning mt-0.5" />
        <div className="text-sm">
          <div className="font-semibold text-warning">Cold SMS marketing requires proper consent</div>
          <div className="text-foreground/80 mt-1">
            Use direct mail, door knocking, or compliant email for non-opted-in contacts. TCPA violations carry $500–$1,500 per message.
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <Stat label="Opted-in" value={logs.filter(l => l.consent === "opted_in").length} tone="success" />
        <Stat label="No consent" value={logs.filter(l => l.consent === "no_consent").length} tone="muted" />
        <Stat label="DNC / opted-out" value={logs.filter(l => l.dnc).length} tone="destructive" />
      </div>

      <div className="bg-card rounded-xl shadow-card border border-border/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr className="text-left">
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Opt-in source</th>
                <th className="px-4 py-3 font-medium">Opt-out date</th>
                <th className="px-4 py-3 font-medium">DNC</th>
                <th className="px-4 py-3 font-medium">SMS</th>
                <th className="px-4 py-3 font-medium">Email</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id} className="border-t border-border/60">
                  <td className="px-4 py-3">
                    <div className="font-medium">{l.ownerName}</div>
                    <div className="text-xs text-muted-foreground">{l.phone}</div>
                  </td>
                  <td className="px-4 py-3"><ConsentBadge consent={l.consent} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{l.source}</td>
                  <td className="px-4 py-3 text-muted-foreground">{l.optOutDate}</td>
                  <td className="px-4 py-3">{l.dnc ? <span className="text-destructive font-medium">Yes</span> : <span className="text-muted-foreground">No</span>}</td>
                  <td className="px-4 py-3">{l.smsEligible ? <ShieldCheck className="w-4 h-4 text-success" /> : <span className="text-muted-foreground">—</span>}</td>
                  <td className="px-4 py-3">{l.emailEligible ? <ShieldCheck className="w-4 h-4 text-success" /> : <span className="text-muted-foreground">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "success" | "muted" | "destructive" }) {
  const cls = { success: "text-success", muted: "text-muted-foreground", destructive: "text-destructive" }[tone];
  return (
    <div className="bg-card rounded-xl p-5 shadow-card border border-border/60">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className={`text-3xl font-bold tracking-tight mt-1 ${cls}`}>{value}</div>
    </div>
  );
}
