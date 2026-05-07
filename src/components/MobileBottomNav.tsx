import { CloudLightning, Map, Users, Download, MoreHorizontal } from "lucide-react";
import type { View } from "@/components/AppSidebar";
import { cn } from "@/lib/utils";

const items: { id: View; label: string; icon: typeof Map }[] = [
  { id: "storm-ops", label: "Storms", icon: CloudLightning },
  { id: "map", label: "Map", icon: Map },
  { id: "leads", label: "Leads", icon: Users },
  { id: "campaigns", label: "Export", icon: Download },
  { id: "dashboard", label: "More", icon: MoreHorizontal },
];

export function MobileBottomNav({ active, onNavigate }: { active: View; onNavigate: (v: View) => void }) {
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur border-t border-border flex justify-around"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {items.map((it) => {
        const Icon = it.icon;
        const isActive = active === it.id;
        return (
          <button
            key={it.id}
            onClick={() => onNavigate(it.id)}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-1 py-2.5 min-h-[64px] text-[11px] font-medium transition-colors active:bg-accent/50",
              isActive ? "text-storm" : "text-muted-foreground hover:text-foreground"
            )}
            aria-label={it.label}
          >
            <Icon className="w-[22px] h-[22px]" />
            {it.label}
          </button>
        );
      })}
    </nav>
  );
}
