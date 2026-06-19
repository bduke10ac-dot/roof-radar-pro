import { Check, Cloud, CloudOff, Loader2 } from "lucide-react";
import { useSyncStatus } from "@/lib/syncStatus";

export function SyncIndicator({ className = "" }: { className?: string }) {
  const { state } = useSyncStatus();

  const config = {
    idle: {
      icon: <Cloud className="w-3.5 h-3.5" />,
      label: "Synced",
      classes: "text-muted-foreground border-border bg-transparent",
    },
    saving: {
      icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
      label: "Saving…",
      classes: "text-warning border-warning/30 bg-warning/10",
    },
    saved: {
      icon: <Check className="w-3.5 h-3.5" />,
      label: "Saved",
      classes: "text-success border-success/30 bg-success/10",
    },
    error: {
      icon: <CloudOff className="w-3.5 h-3.5" />,
      label: "Not saved",
      classes: "text-destructive border-destructive/30 bg-destructive/10",
    },
  }[state];

  return (
    <span
      role="status"
      aria-live="polite"
      title="Changes are saved to your account"
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium ${config.classes} ${className}`}
    >
      {config.icon}
      <span className="hidden sm:inline">{config.label}</span>
    </span>
  );
}
