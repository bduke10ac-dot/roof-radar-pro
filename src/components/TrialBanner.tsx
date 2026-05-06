import { useSubscription } from "@/contexts/SubscriptionContext";
import { Sparkles, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TrialBanner({ onUpgrade }: { onUpgrade: () => void }) {
  const { status, trialEndsAt, plan } = useSubscription();
  if (status !== "trialing" || !trialEndsAt) return null;
  const daysLeft = Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / 86400000));

  return (
    <div className="bg-gradient-storm text-white px-4 py-2 flex items-center gap-3 text-sm">
      <Clock className="w-4 h-4 shrink-0" />
      <div className="flex-1 min-w-0 truncate">
        <strong>{plan.name} trial:</strong> {daysLeft} day{daysLeft === 1 ? "" : "s"} left. Add a payment method to keep access.
      </div>
      <Button size="sm" variant="secondary" className="h-7" onClick={onUpgrade}>
        <Sparkles className="w-3.5 h-3.5" /> Activate
      </Button>
    </div>
  );
}
