import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComingSoonProps {
  label?: string;
  className?: string;
  variant?: "badge" | "inline" | "overlay";
}

/**
 * Visual indicator that a feature is mocked / not yet wired to a real backend.
 * Used to clearly communicate non-functional UI to end users.
 */
export function ComingSoon({ label = "Coming soon", className, variant = "badge" }: ComingSoonProps) {
  if (variant === "overlay") {
    return (
      <div className={cn(
        "absolute top-2 right-2 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-full",
        "bg-warning/15 text-warning border border-warning/30 text-[10px] font-semibold uppercase tracking-wide backdrop-blur-sm",
        className
      )}>
        <Clock className="w-3 h-3" />
        {label}
      </div>
    );
  }
  if (variant === "inline") {
    return (
      <span className={cn("inline-flex items-center gap-1 text-[11px] text-warning font-medium", className)}>
        <Clock className="w-3 h-3" />
        {label}
      </span>
    );
  }
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-warning/15 text-warning border border-warning/30 text-[10px] font-semibold uppercase tracking-wide",
      className
    )}>
      <Clock className="w-2.5 h-2.5" />
      {label}
    </span>
  );
}
