import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MarketingLayout } from "@/components/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, Sparkles } from "lucide-react";
import { PLANS, BillingCycle } from "@/contexts/SubscriptionContext";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export default function Pricing() {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    document.title = "Pricing — RoofRadar";
  }, []);

  const handlePick = (planId: string) => {
    if (planId === "free") return navigate(user ? "/app" : "/signup");
    if (planId === "enterprise") return navigate("/support?topic=enterprise");
    if (!user) return navigate(`/signup?plan=${planId}&cycle=${cycle}`);
    navigate(`/checkout?plan=${planId}&cycle=${cycle}`);
  };

  return (
    <MarketingLayout>
      <section className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-bold">Simple pricing for every crew</h1>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">Start free. Upgrade when storms start landing.</p>
          <div className="inline-flex items-center gap-3 mt-6 p-1 rounded-md border border-border">
            <span className={cn("px-3 py-1 text-sm rounded", cycle === "monthly" && "font-semibold")}>Monthly</span>
            <Switch checked={cycle === "yearly"} onCheckedChange={(v) => setCycle(v ? "yearly" : "monthly")} />
            <span className={cn("px-3 py-1 text-sm rounded flex items-center gap-1.5", cycle === "yearly" && "font-semibold")}>
              Yearly <Badge variant="secondary" className="text-[10px]">Save ~17%</Badge>
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {PLANS.map((p) => {
            const price = cycle === "yearly" ? p.yearlyPrice : p.monthlyPrice;
            return (
              <Card key={p.id} className={cn("p-5 flex flex-col relative", p.highlight && "border-storm shadow-elevated")}>
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
                      <span className="text-xs text-muted-foreground">/{cycle === "yearly" ? "yr" : "mo"}</span>
                    </div>
                  )}
                </div>
                <ul className="space-y-1.5 text-xs flex-1 mb-4">
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex gap-1.5"><Check className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />{perk}</li>
                  ))}
                </ul>
                <Button size="sm" variant={p.highlight ? "default" : "outline"} onClick={() => handlePick(p.id)}>
                  {p.id === "free" ? "Get started" : p.id === "enterprise" ? "Contact sales" : <><Sparkles className="w-3.5 h-3.5" /> Start free trial</>}
                </Button>
              </Card>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          All plans include compliant TCPA/DNC screening. Questions? <Link to="/support" className="underline">Contact us</Link>.
        </p>
      </section>
    </MarketingLayout>
  );
}
