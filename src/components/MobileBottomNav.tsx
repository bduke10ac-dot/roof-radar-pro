import { LayoutDashboard, Map, BookOpen, Send, CreditCard } from "lucide-react";
import type { View } from "@/components/AppSidebar";
import { cn } from "@/lib/utils";

const items: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Home", icon: LayoutDashboard },
  { id: "map", label: "Map", icon: Map },
  { id: "playbook", label: "Playbook", icon: BookOpen },
  { id: "campaigns", label: "Send", icon: Send },
  { id: "billing", label: "Plan", icon: CreditCard },
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
              "flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] text-[11px] font-medium transition-colors",
              isActive ? "text-storm" : "text-muted-foreground hover:text-foreground"
            )}
            aria-label={it.label}
          >
            <Icon className="w-5 h-5" />
            {it.label}
          </button>
        );
      })}
    </nav>
  );
}
