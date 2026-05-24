import { Activity, Users, Map as MapIcon, Send, BookOpen, Target, Zap, ArrowRight, CloudLightning, CheckCircle2, Circle, Download } from "lucide-react";
import type { View } from "@/components/AppSidebar";
import { useMarkets } from "@/contexts/MarketContext";
import { useLeads } from "@/hooks/useLeads";
import { useMarketLeads } from "@/hooks/useMarketFilter";
import { useAutoRules } from "@/hooks/useAutoRules";

const moreTiles: { id: View; label: string; icon: typeof Activity }[] = [
  { id: "markets", label: "Markets", icon: Target },
  { id: "auto-campaigns", label: "Automations", icon: Zap },
  { id: "campaigns", label: "Campaigns", icon: Send },
  { id: "playbook", label: "Playbook", icon: BookOpen },
];

export function DashboardView({ onNavigate }: { onNavigate?: (v: View) => void }) {
  const { activeMarket, markets } = useMarkets();
  const { leads, allLeads } = useMarketLeads();
  const { usingMock } = useLeads();
  const { rules } = useAutoRules();

  const hasMarket = markets.length > 0;
  const hasLeads = !usingMock && allLeads.length > 0;
  const hasRule = (rules?.length ?? 0) > 0;
  const completed = [hasMarket, hasLeads, hasRule].filter(Boolean).length;
  const showSetup = completed < 3;

  // Decide the "next best action" so the user doesn't have to.
  const nextAction = !hasMarket
    ? { label: "Create your first market", desc: "Define the area you serve.", view: "markets" as View }
    : !hasLeads
    ? { label: "Import leads", desc: "Upload a CSV of homeowners.", view: "leads" as View }
    : !hasRule
    ? { label: "Set up an auto storm campaign", desc: "Trigger outreach when storms hit.", view: "auto-campaigns" as View }
    : { label: "Find storm-impacted homes", desc: "Open the map and start working.", view: "map" as View };

  return (
    <div className="space-y-5">
      {/* Compact hero */}
      <header className="rounded-xl bg-gradient-storm text-white p-4 md:p-6 shadow-elevated">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider opacity-80">
          <CloudLightning className="w-3.5 h-3.5" /> RoofRadar
        </div>
        <h1 className="text-lg md:text-2xl font-bold mt-1.5 leading-tight">
          Be first on the roof after every storm.
        </h1>
        {activeMarket && (
          <p className="text-[11px] opacity-80 mt-2 inline-flex items-center gap-1">
            <Target className="w-3 h-3" /> {activeMarket.name}
          </p>
        )}
      </header>

      {/* Storm Workflow — Storms · Leads · Export */}
      <section className="min-w-0">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Storm workflow</div>
        <div className="grid grid-cols-1 min-[380px]:grid-cols-3 gap-2 md:gap-3 min-w-0">
          <WorkflowTile icon={CloudLightning} label="Storms" desc="Active areas" onClick={() => onNavigate?.("storm-ops")} />
          <WorkflowTile icon={Users} label="Leads" desc={`${leads.length} homes`} onClick={() => onNavigate?.("leads")} />
          <WorkflowTile icon={Download} label="Export" desc="Send & route" onClick={() => onNavigate?.("campaigns")} />
        </div>
      </section>

      {/* Sticky Next Action */}
      <button
        onClick={() => onNavigate?.(nextAction.view)}
        className="w-full text-left bg-storm text-white rounded-xl p-4 shadow-elevated active:scale-[0.99] transition-transform flex items-center gap-3"
      >
        <div className="w-11 h-11 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
          <ArrowRight className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-wider opacity-80">Next step</div>
          <div className="font-semibold break-words leading-snug">{nextAction.label}</div>
          <div className="text-xs opacity-80 break-words leading-snug">{nextAction.desc}</div>
        </div>
      </button>

      {showSetup && (
        <section className="bg-card rounded-xl p-4 shadow-card border border-border/60">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Get started</h2>
            <span className="text-xs text-muted-foreground tabular-nums">{completed} of 3</span>
          </div>
          <div className="space-y-2">
            <SetupItem done={hasMarket} label="Create your first market" onClick={() => onNavigate?.("markets")} />
            <SetupItem done={hasLeads} label="Import or add leads" onClick={() => onNavigate?.("leads")} />
            <SetupItem done={hasRule} label="Set up an auto storm campaign" onClick={() => onNavigate?.("auto-campaigns")} />
          </div>
        </section>
      )}

      {/* Secondary — collapsed list */}
      <section>
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">More tools</div>
        <div className="grid grid-cols-2 gap-2">
          {moreTiles.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => onNavigate?.(t.id)}
                className="flex items-center gap-2 bg-card border border-border/60 rounded-lg px-3 py-3 text-sm font-medium active:bg-accent/50 transition-colors min-h-[52px]"
              >
                <Icon className="w-4 h-4 text-storm" />
                {t.label}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function WorkflowTile({ icon: Icon, label, desc, onClick }: { icon: typeof Activity; label: string; desc: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-card border border-border/60 rounded-xl p-3 md:p-4 shadow-card hover:border-storm/50 active:scale-[0.98] transition-all flex flex-col items-start min-h-[88px]"
    >
      <div className="w-9 h-9 rounded-md bg-storm/10 text-storm flex items-center justify-center">
        <Icon className="w-5 h-5" />
      </div>
      <div className="mt-2 text-sm font-semibold">{label}</div>
      <div className="text-[11px] text-muted-foreground">{desc}</div>
    </button>
  );
}

function SetupItem({ done, label, onClick }: { done: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={done ? undefined : onClick}
      disabled={done}
      className={`w-full flex items-center gap-2.5 rounded-lg border p-3 text-left min-h-[48px] ${done ? "border-success/40 bg-success/5" : "border-border bg-background active:bg-accent/40"}`}
    >
      {done ? <CheckCircle2 className="w-4 h-4 text-success shrink-0" /> : <Circle className="w-4 h-4 text-muted-foreground shrink-0" />}
      <span className={`text-sm flex-1 ${done ? "line-through text-muted-foreground" : "font-medium"}`}>{label}</span>
      {!done && <ArrowRight className="w-4 h-4 text-storm" />}
    </button>
  );
}
