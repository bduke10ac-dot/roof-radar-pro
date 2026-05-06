import { useEffect } from "react";
import { MarketingLayout } from "@/components/MarketingLayout";

const sections = [
  ["Information we collect", "Account details, billing data, usage telemetry, and property data sourced from licensed third-party providers (ATTOM, Estated, Regrid, DataTree)."],
  ["How we use it", "To provide the RoofRadar service, deliver weather alerts, run compliant outreach, process payments, and improve our product."],
  ["Sharing", "We share data only with subprocessors required to operate the service: Supabase (database/auth), Stripe (payments), Twilio (SMS), SendGrid (email), Google Maps (mapping)."],
  ["Your rights", "Access, correction, deletion and portability. Email privacy@myroofradar.com to exercise any right. We respond within 30 days."],
  ["Retention", "Account data is retained while your subscription is active and for 90 days after cancellation. Compliance/audit logs are retained for 7 years."],
  ["Compliance", "We follow CCPA, GDPR (where applicable), TCPA, CAN-SPAM, and 10DLC SMS rules. Outreach respects DNC and opt-out lists."],
];

export default function Privacy() {
  useEffect(() => { document.title = "Privacy Policy — RoofRadar"; }, []);
  return (
    <MarketingLayout>
      <article className="max-w-3xl mx-auto px-4 py-12 prose prose-sm dark:prose-invert">
        <h1>Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        {sections.map(([title, body]) => (
          <section key={title} className="mt-6">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{body}</p>
          </section>
        ))}
        <p className="text-xs text-muted-foreground mt-10">
          Contact: privacy@myroofradar.com
        </p>
      </article>
    </MarketingLayout>
  );
}
