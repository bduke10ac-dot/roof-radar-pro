import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { MarketingLayout } from "@/components/MarketingLayout";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";

export default function Checkout() {
  const [params] = useSearchParams();
  const plan = params.get("plan") || "pro";
  const cycle = params.get("cycle") || "monthly";
  const priceId = `${plan}_${cycle}`;
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { document.title = "Checkout — RoofRadar"; }, []);
  useEffect(() => {
    if (!loading && !user) navigate(`/signup?plan=${plan}&cycle=${cycle}`, { replace: true });
  }, [loading, user, navigate, plan, cycle]);

  if (loading || !user) return null;

  return (
    <MarketingLayout>
      <PaymentTestModeBanner />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-1">Complete your subscription</h1>
        <p className="text-sm text-muted-foreground mb-6 capitalize">{plan} plan — billed {cycle}</p>
        <StripeEmbeddedCheckout priceId={priceId} customerEmail={user.email ?? undefined} userId={user.id} />
      </div>
    </MarketingLayout>
  );
}
