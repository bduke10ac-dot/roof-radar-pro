import { useEffect } from "react";
import { MarketingLayout } from "@/components/MarketingLayout";

const sections = [
  ["Acceptance", "By creating an account you agree to these Terms and our Privacy Policy."],
  ["The service", "RoofRadar is a B2B SaaS platform providing storm tracking, lead generation, and compliant outreach automation for licensed roofing contractors."],
  ["Acceptable use", "You will not use RoofRadar to send unsolicited messages outside applicable law (TCPA, CAN-SPAM, 10DLC). You will honor DNC and opt-out lists. Misuse may result in termination without refund."],
  ["Subscriptions & billing", "Plans are billed monthly or yearly via Stripe and renew automatically until canceled. You can cancel at any time from the billing portal; access continues until the end of the paid period."],
  ["Refunds", "All fees are non-refundable except where required by law."],
  ["Data accuracy", "Property and weather data is sourced from third-party providers. We do not guarantee accuracy and you are responsible for verifying any lead before contact."],
  ["Limitation of liability", "RoofRadar is provided \"as is\". To the maximum extent permitted by law, our liability is limited to the fees you paid in the prior 12 months."],
  ["Termination", "Either party may terminate at any time. We may suspend service for non-payment or violation of these Terms."],
  ["Governing law", "These Terms are governed by the laws of the United States and the state of your billing address."],
];

export default function Terms() {
  useEffect(() => { document.title = "Terms of Service — RoofRadar"; }, []);
  return (
    <MarketingLayout>
      <article className="max-w-3xl mx-auto px-4 py-12 prose prose-sm dark:prose-invert">
        <h1>Terms of Service</h1>
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
        {sections.map(([title, body]) => (
          <section key={title} className="mt-6">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{body}</p>
          </section>
        ))}
        <p className="text-xs text-muted-foreground mt-10">Contact: legal@myroofradar.com</p>
      </article>
    </MarketingLayout>
  );
}
