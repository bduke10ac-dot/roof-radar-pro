import { Home, AlertTriangle, MailCheck, CalendarCheck, CloudRain } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { StatusBadge, StormScoreBadge } from "@/components/StormScoreBadge";
import { type LeadStatus } from "@/lib/mockData";
import { useLeads, useStormEvents } from "@/hooks/useLeads";

const pipelineStages: LeadStatus[] = ["new", "contacted", "inspection", "quoted", "won"];

export function DashboardView() {
  const { leads } = useLeads();
  const stormEvents = useStormEvents();
  const highScore = leads.filter(l => l.stormScore >= 85).length;
  const optedIn = leads.filter(l => l.consent === "opted_in").length;
  const inspections = leads.filter(l => l.status === "inspection").length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Storm Operations Dashboard</h1>
        <p className="text-sm text-muted-foreground">Live overview of your territory and lead pipeline.</p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Mapped homes" value="12,847" icon={Home} trend="Across 14 ZIP codes" />
        <StatCard label="High storm-score leads" value={highScore} icon={AlertTriangle} tone="warning" trend="Score ≥ 85" />
        <StatCard label="Opted-in contacts" value={optedIn} icon={MailCheck} tone="success" trend="SMS eligible" />
        <StatCard label="Scheduled inspections" value={inspections} icon={CalendarCheck} tone="storm" trend="This week" />
        <StatCard label="Recent storm events" value={stormEvents.length} icon={CloudRain} tone="storm" trend="Last 60 days" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-xl p-5 shadow-card border border-border/60">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Lead pipeline</h2>
            <span className="text-xs text-muted-foreground">{mockLeads.length} active</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {pipelineStages.map(stage => {
              const count = mockLeads.filter(l => l.status === stage).length;
              return (
                <div key={stage} className="rounded-lg border border-border/60 p-3 bg-background">
                  <div className="flex items-center justify-between mb-2">
                    <StatusBadge status={stage} />
                    <span className="text-lg font-bold">{count}</span>
                  </div>
                  <div className="space-y-1.5">
                    {mockLeads.filter(l => l.status === stage).slice(0, 2).map(l => (
                      <div key={l.id} className="text-xs p-2 rounded bg-card border border-border/50">
                        <div className="font-medium truncate">{l.ownerName}</div>
                        <div className="text-muted-foreground truncate">{l.propertyAddress}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-card rounded-xl p-5 shadow-card border border-border/60">
          <h2 className="font-semibold mb-4">Recent storm events</h2>
          <div className="space-y-3">
            {stormEvents.map(s => (
              <div key={s.id} className="flex items-start gap-3 p-3 rounded-lg bg-background border border-border/60">
                <div className="w-9 h-9 rounded-md bg-gradient-storm flex items-center justify-center shrink-0">
                  <CloudRain className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium text-sm truncate">{s.location}</div>
                    <StormScoreBadge score={Math.round(s.hailSize * 40 + s.windSpeed / 2)} />
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {s.date} · {s.hailSize}" hail · {s.windSpeed} mph · {s.affected.toLocaleString()} homes
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-5 shadow-card border border-border/60">
        <h2 className="font-semibold mb-4">Top opportunity leads</h2>
        <div className="space-y-2">
          {[...mockLeads].sort((a,b) => b.stormScore - a.stormScore).slice(0, 5).map(l => (
            <div key={l.id} className="flex items-center justify-between p-3 rounded-lg bg-background border border-border/50">
              <div>
                <div className="font-medium text-sm">{l.ownerName}</div>
                <div className="text-xs text-muted-foreground">{l.propertyAddress}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground hidden sm:inline">Roof {l.roofAge}y</span>
                <StormScoreBadge score={l.stormScore} />
                <StatusBadge status={l.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
