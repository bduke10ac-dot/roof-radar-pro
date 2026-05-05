import { LayoutDashboard, Users, Map, Send, ShieldCheck, Plug, CloudLightning } from "lucide-react";
import { cn } from "@/lib/utils";

export type View = "dashboard" | "leads" | "map" | "campaigns" | "compliance" | "integrations";

const items: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "leads", label: "Leads", icon: Users },
  { id: "map", label: "Map", icon: Map },
  { id: "campaigns", label: "Campaigns", icon: Send },
  { id: "compliance", label: "Compliance", icon: ShieldCheck },
  { id: "integrations", label: "Integrations", icon: Plug },
];

export function AppSidebar({ active, onNavigate }: { active: View; onNavigate: (v: View) => void }) {
  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="px-5 py-5 flex items-center gap-2.5 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg bg-gradient-storm flex items-center justify-center shadow-elevated">
          <CloudLightning className="w-5 h-5 text-white" />
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
      <div className="p-3 m-3 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground text-xs">
        <div className="font-semibold mb-1">Demo mode</div>
        <div className="opacity-80">Connect Supabase & APIs to go live.</div>
      </div>
    </aside>
  );
}
