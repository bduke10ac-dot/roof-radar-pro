import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSubscription, PLANS, PlanId, BillingCycle } from "@/contexts/SubscriptionContext";
import { Check, Sparkles, CreditCard, Receipt, Users, Zap, AlertTriangle, ExternalLink, Trash2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { BrandSettings } from "@/components/BrandSettings";
import { DeleteAccountDialog } from "@/components/DeleteAccountDialog";

export function BillingView() {
  const { plan, cycle, status, trialEndsAt, renewsAt, usage, startTrial, changePlan, cancel, setCycle } = useSubscription();
  const [previewCycle, setPreviewCycle] = useState<BillingCycle>(cycle);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const fmtLimit = (n: number) => (n === -1 ? "Unlimited" : n.toLocaleString());
  const pct = (used: number, limit: number) => (limit === -1 ? 5 : Math.min(100, (used / Math.max(limit, 1)) * 100));

  const handlePick = (id: PlanId) => {
    if (id === plan.id) return;
    if (id === "enterprise") {
      toast.success("Sales will reach out", { description: "We'll contact you about Enterprise pricing." });
      return;
    }
    if (status === "free" && id !== "free") {
      startTrial(id);
      toast.success(`14-day ${PLANS.find(p => p.id === id)!.name} trial started`);
    } else {
      changePlan(id, previewCycle);
      const target = PLANS.find(p => p.id === id)!;
      const isUpgrade = (target.monthlyPrice ?? Infinity) > (plan.monthlyPrice ?? 0);
      toast.success(`${isUpgrade ? "Upgraded" : "Switched"} to ${target.name}`);
    }
  };

  const mockInvoices = status === "free" ? [] : [
    { id: "INV-2026-005", date: "May 1, 2026", amount: plan.monthlyPrice ?? 0, status: "Paid" },
    { id: "INV-2026-004", date: "Apr 1, 2026", amount: plan.monthlyPrice ?? 0, status: "Paid" },
    { id: "INV-2026-003", date: "Mar 1, 2026", amount: plan.monthlyPrice ?? 0, status: "Paid" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Billing & Subscription</h1>
        <p className="text-sm text-muted-foreground">Manage your plan, usage, payment method, and team seats.</p>
      </div>

      <BrandSettings />

      {/* Current plan summary */}
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Current plan</div>
              <Badge variant={status === "trialing" ? "secondary" : "default"} className="text-[10px]">
                {status === "trialing" ? "Trial" : status === "active" ? "Active" : status === "free" ? "Free" : status}
              </Badge>
            </div>
            <div className="text-2xl font-bold mt-1">{plan.name}</div>
            <div className="text-sm text-muted-foreground">{plan.tagline}</div>
            {status === "trialing" && trialEndsAt && (
              <div className="mt-2 text-xs text-storm font-medium">
                Trial ends {trialEndsAt.toLocaleDateString()} — {Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / 86400000))} days left
              </div>
            )}
            {status === "active" && renewsAt && (
              <div className="mt-2 text-xs text-muted-foreground">Renews {renewsAt.toLocaleDateString()}</div>
            )}
          </div>
          <div className="flex gap-2">
            {plan.id !== "free" && status !== "canceled" && (
              <Button variant="outline" size="sm" onClick={() => { cancel(); toast("Subscription canceled at period end"); }}>
                Cancel plan
              </Button>
            )}
            {plan.id !== "pro" && (
              <Button size="sm" onClick={() => handlePick("pro")}>
                <Sparkles className="w-3.5 h-3.5" /> Upgrade to Pro
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Tabs defaultValue="plans">
        <TabsList>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="payment">Payment & invoices</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        {/* PLANS */}
        <TabsContent value="plans" className="space-y-4">
          <div className="flex items-center justify-end gap-3">
            <span className={cn("text-sm", previewCycle === "monthly" && "font-semibold")}>Monthly</span>
            <Switch checked={previewCycle === "yearly"} onCheckedChange={(v) => setPreviewCycle(v ? "yearly" : "monthly")} />
            <span className={cn("text-sm flex items-center gap-1.5", previewCycle === "yearly" && "font-semibold")}>
              Yearly <Badge variant="secondary" className="text-[10px]">Save ~17%</Badge>
            </span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLANS.map(p => {
              const price = previewCycle === "yearly" ? p.yearlyPrice : p.monthlyPrice;
              const isCurrent = p.id === plan.id;
              const isUpgrade = (p.monthlyPrice ?? Infinity) > (plan.monthlyPrice ?? 0);
              return (
                <Card key={p.id} className={cn("p-5 flex flex-col", p.highlight && "border-storm shadow-elevated relative")}>
                  {p.highlight && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-storm text-white">Most popular</div>
                  )}
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-xs text-muted-foreground min-h-[32px]">{p.tagline}</div>
                  <div className="my-3">
                    {price == null ? (
                      <div className="text-2xl font-bold">Custom</div>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold">${price}</span>
                        <span className="text-xs text-muted-foreground">/{previewCycle === "yearly" ? "yr" : "mo"}</span>
                      </div>
                    )}
                  </div>
                  <ul className="space-y-1.5 text-xs flex-1 mb-4">
                    {p.perks.map(perk => (
                      <li key={perk} className="flex gap-1.5"><Check className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />{perk}</li>
                    ))}
                  </ul>
                  <Button
                    size="sm"
                    variant={isCurrent ? "outline" : p.highlight ? "default" : "outline"}
                    disabled={isCurrent}
                    onClick={() => handlePick(p.id)}
                  >
                    {isCurrent ? "Current plan" :
                      p.id === "enterprise" ? "Contact sales" :
                      status === "free" && p.id !== "free" ? "Start 14-day trial" :
                      isUpgrade ? "Upgrade" : "Switch"}
                  </Button>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* USAGE */}
        <TabsContent value="usage" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {([
              ["Leads this month", usage.leads, plan.limits.maxLeadsPerMonth],
              ["Emails sent", usage.emails, plan.limits.maxEmailsPerMonth],
              ["SMS sent", usage.sms, plan.limits.maxSmsPerMonth],
              ["Saved markets", usage.markets, plan.limits.maxMarkets],
            ] as const).map(([label, used, lim]) => {
              const percent = pct(used, lim);
              const danger = lim !== -1 && percent >= 80;
              return (
                <Card key={label} className="p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{label}</span>
                    <span className={cn("text-xs", danger && "text-warning font-semibold")}>
                      {used.toLocaleString()} / {fmtLimit(lim)}
                    </span>
                  </div>
                  <Progress value={percent} className={cn("mt-2 h-2", danger && "[&>div]:bg-warning")} />
                  {danger && (
                    <div className="mt-2 flex items-center gap-1.5 text-xs text-warning">
                      <AlertTriangle className="w-3.5 h-3.5" /> Approaching limit. <button className="underline" onClick={() => handlePick("pro")}>Upgrade</button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* PAYMENT */}
        <TabsContent value="payment" className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="font-medium text-sm">
                    {status === "free" ? "No payment method on file" : "Visa •••• 4242"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {status === "free" ? "Add one to start a paid plan" : "Expires 12/2028"}
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => toast("Stripe billing portal will open here once Stripe is connected.")}>
                <ExternalLink className="w-3.5 h-3.5" /> Manage in Stripe
              </Button>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Receipt className="w-4 h-4" /> <h3 className="font-semibold text-sm">Invoices</h3>
            </div>
            {mockInvoices.length === 0 ? (
              <div className="text-sm text-muted-foreground">No invoices yet.</div>
            ) : (
              <div className="divide-y divide-border">
                {mockInvoices.map(inv => (
                  <div key={inv.id} className="flex items-center justify-between py-2.5 text-sm">
                    <div>
                      <div className="font-medium">{inv.id}</div>
                      <div className="text-xs text-muted-foreground">{inv.date}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="tabular-nums">${inv.amount.toFixed(2)}</span>
                      <Badge variant="secondary" className="text-[10px]">{inv.status}</Badge>
                      <Button variant="ghost" size="sm" className="h-7">PDF</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* TEAM */}
        <TabsContent value="team" className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4" />
              <h3 className="font-semibold text-sm">Team accounts</h3>
            </div>
            {plan.features.teamAccounts ? (
              <>
                <div className="text-sm text-muted-foreground mb-3">Invite reps and assign territories.</div>
                <Button size="sm"><Users className="w-3.5 h-3.5" /> Invite teammate</Button>
              </>
            ) : (
              <div className="rounded-md border border-dashed border-border p-4 text-center">
                <Zap className="w-6 h-6 mx-auto text-storm mb-2" />
                <div className="font-semibold text-sm">Team accounts are a Pro feature</div>
                <div className="text-xs text-muted-foreground mb-3">Add reps, assign territories, and manage permissions.</div>
                <Button size="sm" onClick={() => handlePick("pro")}><Sparkles className="w-3.5 h-3.5" /> Upgrade to Pro</Button>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
