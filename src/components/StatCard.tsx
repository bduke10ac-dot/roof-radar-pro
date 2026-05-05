import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  tone?: "default" | "storm" | "warning" | "success";
}

export function StatCard({ label, value, icon: Icon, trend, tone = "default" }: Props) {
  const toneClass = {
    default: "bg-accent text-accent-foreground",
    storm: "bg-storm/10 text-storm",
    warning: "bg-warning/15 text-warning",
    success: "bg-success/15 text-success",
  }[tone];

  return (
    <div className="bg-card rounded-xl p-5 shadow-card border border-border/60">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-muted-foreground font-medium">{label}</div>
          <div className="text-3xl font-bold tracking-tight mt-2 text-foreground">{value}</div>
          {trend && <div className="text-xs text-muted-foreground mt-1.5">{trend}</div>}
        </div>
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", toneClass)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
