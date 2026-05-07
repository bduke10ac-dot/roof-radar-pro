import { useEffect } from "react";
import { MarketingLayout } from "@/components/MarketingLayout";

export default function Consent() {
  useEffect(() => { document.title = "Consent & Communications Policy — RoofRadar"; }, []);
  return (
    <MarketingLayout>
      <article className="max-w-3xl mx-auto px-4 py-12 prose prose-sm dark:prose-invert">
        <h1>Consent & Communications Policy</h1>
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

        <h2>SMS messaging (TCPA / 10DLC)</h2>
        <p>RoofRadar customers may only send SMS to homeowners who have provided documented prior express
        written consent. Consent must be specific to the contractor (not a list-broker), include disclosures
        (frequency, message & data rates may apply, opt-out instructions), and be independently revocable.
        Inbound STOP / UNSUBSCRIBE / CANCEL keywords are honored automatically and the contact is added to
        a permanent suppression list. Calls and texts are restricted to local calling-hour rules
        (8am–9pm local time) and respect federal and state Do Not Call (DNC) registries.</p>

        <h2>Email (CAN-SPAM)</h2>
        <p>All outbound email includes the sender's identity, a physical mailing address, and a one-click
        unsubscribe link. Unsubscribe requests are processed within 10 business days and stored as a
        permanent suppression record.</p>

        <h2>AI-assisted follow-up</h2>
        <p>Automated voice/AI calling features are <strong>not active</strong>. When enabled, they will be
        restricted to contacts who have given consent, are not on DNC, and only during permitted calling
        hours. AI agents will identify themselves as automated.</p>

        <h2>Data retention</h2>
        <p>Consent records, opt-outs, and message-send logs are retained for 7 years for compliance audits.</p>

        <p className="text-xs text-muted-foreground mt-10">Contact: compliance@myroofradar.com</p>
      </article>
    </MarketingLayout>
  );
}
