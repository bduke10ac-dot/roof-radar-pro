import { Activity, Users, Map as MapIcon, Send, BookOpen, Target, Zap, ArrowRight, CloudLightning } from "lucide-react";
import type { View } from "@/components/AppSidebar";
import { useMarkets } from "@/contexts/MarketContext";

const tiles: { id: View; label: string; desc: string; icon: typeof Activity }[] = [
  { id: "storm-ops", label: "Storm Operations", desc: "Live weather, lead boost, pipeline & opportunities", icon: Activity },
  { id: "map", label: "Map", desc: "Radar, geofences and impacted homes", icon: MapIcon },
  { id: "leads", label: "Leads", desc: "Browse and manage homeowner leads", icon: Users },
  { id: "markets", label: "Market Targeting", desc: "Define and prioritize service markets", icon: Target },
  { id: "campaigns", label: "Campaigns", desc: "Send SMS and email outreach", icon: Send },
  { id: "auto-campaigns", label: "Auto Storm Campaigns", desc: "Triggered automation when storms hit", icon: Zap },
  { id: "playbook", label: "Storm Playbook", desc: "Before / during / after the storm", icon: BookOpen },
];

export function DashboardView({ onNavigate }: { onNavigate?: (v: View) => void }) {
  const { activeMarket } = useMarkets();
  return (
    <div className="space-y-6">
      <header className="rounded-xl bg-gradient-storm text-white p-5 md:p-7 shadow-elevated">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wider opacity-80">
          <CloudLightning className="w-4 h-4" /> RoofRadar
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mt-2">
          Everything you need to be ready for the next storm — and be the first to assist after.
        </h1>
        <p className="text-sm md:text-base opacity-90 mt-2">
          Maximize every opportunity. From radar to roof — prepare, track, target, contact, close.
        </p>
        {activeMarket && (
          <p className="text-xs opacity-80 mt-3 inline-flex items-center gap-1">
            <Target className="w-3 h-3" /> Active market: {activeMarket.name}
          </p>
        )}
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {tiles.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => onNavigate?.(t.id)}
              className="group text-left bg-card rounded-xl p-4 md:p-5 shadow-card border border-border/60 hover:border-storm/50 hover:shadow-elevated transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-md bg-storm/10 text-storm flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold flex items-center gap-1">
                    {t.label}
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{t.desc}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
