import { Home, AlertTriangle, MailCheck, CalendarCheck, CloudRain, Target, Zap, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { StatusBadge, StormScoreBadge } from "@/components/StormScoreBadge";
import { type LeadStatus } from "@/lib/mockData";
import { useMarketLeads, useMarketStormEvents } from "@/hooks/useMarketFilter";
import { useMarkets } from "@/contexts/MarketContext";
import { WeatherCommandCenter } from "@/components/WeatherCommandCenter";
import { useWeather } from "@/contexts/WeatherContext";
import { Badge } from "@/components/ui/badge";

const pipelineStages: LeadStatus[] = ["new", "contacted", "inspection", "quoted", "won"];

export function DashboardView() {
  const { leads, allLeads } = useMarketLeads();
  const stormEvents = useMarketStormEvents();
  const { activeMarket } = useMarkets();
  const { leadBoost, opportunityScore, marketImpacts } = useWeather();

  // Apply live storm boost to leads
  const liveLeads = leads.map(l => {
    const { boost, reason } = leadBoost(l);
    return { ...l, liveScore: Math.min(100, l.stormScore + boost), boost, boostReason: reason };
  }).sort((a, b) => b.liveScore - a.liveScore);

  const highScore = liveLeads.filter(l => l.liveScore >= 85).length;
  const optedIn = leads.filter(l => l.consent === "opted_in").length;
  const inspections = leads.filter(l => l.status === "inspection").length;
  const liveImpacted = liveLeads.filter(l => l.boost > 0).length;

  return (
    <div className="space-y-6">
      <WeatherCommandCenter />

      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Storm Operations Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {activeMarket
              ? <>Scoped to <span className="text-storm font-medium inline-flex items-center gap-1"><Target className="w-3 h-3" />{activeMarket.name}</span> · {leads.length} of {allLeads.length} leads</>
              : <>Live storm conditions are driving lead scores and market alerts.</>}
          </p>
        </div>
        <Badge variant="outline" className="gap-1"><Zap className="w-3 h-3 text-storm" /> {liveImpacted} leads live-boosted</Badge>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Mapped homes" value={leads.length.toLocaleString()} icon={Home} trend={activeMarket ? `Market: ${activeMarket.name}` : "All territories"} />
        <StatCard label="High storm-score (live)" value={highScore} icon={AlertTriangle} tone="warning" trend="Score ≥ 85 with boost" />
        <StatCard label="Opted-in contacts" value={optedIn} icon={MailCheck} tone="success" trend="SMS eligible" />
        <StatCard label="Scheduled inspections" value={inspections} icon={CalendarCheck} tone="storm" trend="This week" />
        <StatCard label="Live opportunity" value={opportunityScore} icon={TrendingUp} tone="storm" trend={`${marketImpacts.length} markets impacted`} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-xl p-5 shadow-card border border-border/60">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Lead pipeline</h2>
            <span className="text-xs text-muted-foreground">{leads.length} active</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {pipelineStages.map(stage => {
              const stageLeads = liveLeads.filter(l => l.status === stage);
              return (
                <div key={stage} className="rounded-lg border border-border/60 p-3 bg-background">
                  <div className="flex items-center justify-between mb-2">
                    <StatusBadge status={stage} />
                    <span className="text-lg font-bold">{stageLeads.length}</span>
                  </div>
                  <div className="space-y-1.5">
                    {stageLeads.slice(0, 2).map(l => (
                      <div key={l.id} className="text-xs p-2 rounded bg-card border border-border/50">
                        <div className="font-medium truncate">{l.ownerName}</div>
                        <div className="text-muted-foreground truncate">{l.propertyAddress}</div>
                        {l.boost > 0 && (
                          <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-storm">
                            <Zap className="w-2.5 h-2.5" /> +{l.boost} live
                          </div>
                        )}
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Top opportunity leads (live)</h2>
          <span className="text-xs text-muted-foreground">Scores include real-time storm boost</span>
        </div>
        <div className="space-y-2">
          {liveLeads.slice(0, 6).map(l => (
            <div key={l.id} className="flex items-center justify-between p-3 rounded-lg bg-background border border-border/50">
              <div className="min-w-0">
                <div className="font-medium text-sm">{l.ownerName}</div>
                <div className="text-xs text-muted-foreground truncate">{l.propertyAddress}</div>
                {l.boostReason && (
                  <div className="text-[11px] text-storm mt-0.5 inline-flex items-center gap-1">
                    <Zap className="w-3 h-3" /> {l.boostReason} (+{l.boost})
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-muted-foreground hidden sm:inline">Roof {l.roofAge}y</span>
                <StormScoreBadge score={l.liveScore} />
                <StatusBadge status={l.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
