import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription, FeatureKey } from "@/contexts/SubscriptionContext";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FeatureGate({
  feature, children, title, description, className,
}: {
  feature: FeatureKey;
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
}) {
  const { has, requestUpgrade, plan } = useSubscription();
  if (has(feature)) return <>{children}</>;
  return (
    <div className={cn("relative rounded-lg border border-dashed border-border bg-muted/30 overflow-hidden", className)}>
      <div className="pointer-events-none opacity-40 blur-[1px]">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center p-6">
        <div className="max-w-sm w-full bg-background border border-border rounded-lg p-5 shadow-elevated text-center">
          <div className="w-10 h-10 mx-auto rounded-full bg-storm/15 text-storm flex items-center justify-center mb-3">
            <Lock className="w-5 h-5" />
          </div>
          <div className="font-semibold text-sm mb-1">{title ?? "Upgrade to unlock"}</div>
          <div className="text-xs text-muted-foreground mb-4">
            {description ?? `Not included in your ${plan.name} plan.`}
          </div>
          <Button size="sm" className="w-full" onClick={() => requestUpgrade(feature, description)}>
            <Sparkles className="w-3.5 h-3.5" /> See upgrade options
          </Button>
        </div>
      </div>
    </div>
  );
}

export function LockedBadge({ feature, className }: { feature: FeatureKey; className?: string }) {
  const { has, requestUpgrade } = useSubscription();
  if (has(feature)) return null;
  return (
    <button
      onClick={(e) => { e.stopPropagation(); requestUpgrade(feature); }}
      className={cn("inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-storm/15 text-storm border border-storm/30 hover:bg-storm/25", className)}
    >
      <Lock className="w-2.5 h-2.5" /> Pro
    </button>
  );
}
