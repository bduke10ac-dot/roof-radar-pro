import { cn } from "@/lib/utils";

export function StormScoreBadge({ score }: { score: number }) {
  const tone =
    score >= 85 ? "bg-warning/15 text-warning border-warning/30"
    : score >= 70 ? "bg-storm/15 text-storm border-storm/30"
    : "bg-muted text-muted-foreground border-border";
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-semibold", tone)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {score}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    new: "bg-storm/15 text-storm",
    contacted: "bg-accent text-accent-foreground",
    inspection: "bg-warning/15 text-warning",
    quoted: "bg-primary/10 text-primary",
    won: "bg-success/15 text-success",
    lost: "bg-muted text-muted-foreground",
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-md text-xs font-medium capitalize", map[status] || "bg-muted text-muted-foreground")}>
      {status}
    </span>
  );
}

export function ConsentBadge({ consent }: { consent: "opted_in" | "no_consent" | "opted_out" }) {
  const map = {
    opted_in: { label: "Opted in", cls: "bg-success/15 text-success" },
    no_consent: { label: "No consent", cls: "bg-muted text-muted-foreground" },
    opted_out: { label: "Opted out", cls: "bg-destructive/15 text-destructive" },
  };
  const m = map[consent];
  return <span className={cn("px-2 py-0.5 rounded-md text-xs font-medium", m.cls)}>{m.label}</span>;
}
