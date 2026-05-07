import { LayoutDashboard, Users, Map, Send, ShieldCheck, Plug, CloudLightning, Target, Zap, CreditCard, Sparkles, BookOpen, Activity } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";

export type View = "dashboard" | "storm-ops" | "leads" | "map" | "markets" | "campaigns" | "auto-campaigns" | "playbook" | "compliance" | "integrations" | "billing" | "readiness";

const items: { id: View; label: string; icon: typeof LayoutDashboard; adminOnly?: boolean }[] = [
  { id: "dashboard", label: "Home", icon: LayoutDashboard },
  { id: "storm-ops", label: "Storm Operations", icon: CloudLightning },
  { id: "leads", label: "Leads", icon: Users },
  { id: "map", label: "Map", icon: Map },
  { id: "markets", label: "Market Targeting", icon: Target },
  { id: "campaigns", label: "Campaigns", icon: Send },
  { id: "auto-campaigns", label: "Auto Storm Campaigns", icon: Zap },
  { id: "playbook", label: "Storm Playbook", icon: BookOpen },
  { id: "compliance", label: "Compliance", icon: ShieldCheck },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "billing", label: "Billing & Subscription", icon: CreditCard },
  { id: "readiness", label: "App Readiness", icon: Activity, adminOnly: true },
];

export function AppSidebar({ active, onNavigate }: { active: View; onNavigate: (v: View) => void }) {
  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="px-5 py-5 flex items-center gap-2.5 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg bg-gradient-storm flex items-center justify-center shadow-elevated">
          <BrandLogo className="w-6 h-6" />
        </div>
        <div>
          <div className="font-bold text-white tracking-tight">RoofRadar</div>
          <div className="text-[11px] text-sidebar-foreground/60">Storm intelligence</div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {items.map((it) => {
          const Icon = it.icon;
          const isActive = active === it.id;
          return (
            <button
              key={it.id}
              onClick={() => onNavigate(it.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium shadow-elevated"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
              {it.label}
            </button>
          );
        })}
      </nav>
      <PlanWidget onNavigate={onNavigate} />
    </aside>
  );
}

function PlanWidget({ onNavigate }: { onNavigate: (v: View) => void }) {
  const { plan, status, requestUpgrade } = useSubscription();
  return (
    <div className="p-3 m-3 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground text-xs space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-semibold">{plan.name} plan</span>
        <span className="text-[10px] uppercase opacity-70">{status === "trialing" ? "Trial" : status}</span>
      </div>
      {plan.id !== "pro" && plan.id !== "enterprise" && (
        <Button size="sm" className="w-full h-7" onClick={() => requestUpgrade()}>
          <Sparkles className="w-3 h-3" /> Upgrade
        </Button>
      )}
      <button onClick={() => onNavigate("billing")} className="w-full text-left opacity-80 hover:opacity-100 underline-offset-2 hover:underline">
        Manage billing →
      </button>
    </div>
  );
}
