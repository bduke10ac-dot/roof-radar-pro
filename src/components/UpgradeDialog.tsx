import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useSubscription, PLANS, PlanId } from "@/contexts/SubscriptionContext";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function UpgradeDialog() {
  const { upgradePrompt, closeUpgrade, plan, startTrial, changePlan, status } = useSubscription();
  const recommended: PlanId = plan.id === "free" ? "starter" : "pro";

  const handleSelect = (id: PlanId) => {
    if (id === "enterprise") {
      toast.success("Sales will reach out", { description: "Enterprise inquiry submitted." });
      closeUpgrade();
      return;
    }
    if (status === "free" && id !== "free") {
      startTrial(id);
      toast.success(`14-day ${PLANS.find(p => p.id === id)!.name} trial started`, {
        description: "No charge today. Cancel anytime before trial ends.",
      });
    } else {
      changePlan(id);
      toast.success(`Switched to ${PLANS.find(p => p.id === id)!.name}`);
    }
    closeUpgrade();
  };

  return (
    <Dialog open={upgradePrompt.open} onOpenChange={(o) => !o && closeUpgrade()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-storm" /> Upgrade RoofRadar
          </DialogTitle>
          <DialogDescription>
            {upgradePrompt.reason ?? "Unlock more markets, automation, and storm intelligence."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-3 mt-2">
          {PLANS.filter(p => p.id !== "free").map(p => {
            const isRec = p.id === recommended;
            const isCurrent = p.id === plan.id;
            return (
              <div
                key={p.id}
                className={cn(
                  "rounded-lg border p-4 flex flex-col",
                  isRec ? "border-storm bg-storm/5 shadow-elevated" : "border-border bg-card",
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="font-semibold">{p.name}</div>
                  {isRec && <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-storm text-white">Recommended</span>}
                </div>
                <div className="text-xs text-muted-foreground mb-3">{p.tagline}</div>
                <div className="text-2xl font-bold mb-3">
                  {p.monthlyPrice == null ? "Custom" : `$${p.monthlyPrice}`}
                  {p.monthlyPrice != null && <span className="text-xs font-normal text-muted-foreground">/mo</span>}
                </div>
                <ul className="space-y-1.5 text-xs flex-1 mb-4">
                  {p.perks.slice(0, 6).map(perk => (
                    <li key={perk} className="flex gap-1.5"><Check className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />{perk}</li>
                  ))}
                </ul>
                <Button
                  size="sm"
                  variant={isRec ? "default" : "outline"}
                  disabled={isCurrent}
                  onClick={() => handleSelect(p.id)}
                >
                  {isCurrent ? "Current plan" : p.id === "enterprise" ? "Contact sales" : status === "free" ? "Start 14-day trial" : "Switch plan"}
                </Button>
              </div>
            );
          })}
        </div>

        <button onClick={closeUpgrade} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </DialogContent>
    </Dialog>
  );
}
