import { useEffect } from "react";
import { MarketingLayout } from "@/components/MarketingLayout";

export default function DataSources() {
  useEffect(() => { document.title = "Data Sources Disclaimer — RoofRadar"; }, []);
  return (
    <MarketingLayout>
      <article className="max-w-3xl mx-auto px-4 py-12 prose prose-sm dark:prose-invert">
        <h1>Data Sources Disclaimer</h1>
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

        <h2>Property & ownership data</h2>
        <p>Property records, parcel boundaries, ownership names, mailing addresses, estimated home value,
        and roof-age estimates are sourced from licensed third-party providers (e.g., ATTOM, Estated,
        Regrid, DataTree) and public county/parcel datasets. Coverage and freshness vary by jurisdiction.
        Data is provided on a best-effort basis and may be inaccurate, outdated, or incomplete.</p>

        <h2>Mapping</h2>
        <p>Map tiles, geocoding, and aerial imagery are provided by Google Maps and are subject to Google's
        terms of service.</p>

        <h2>Verify before acting</h2>
        <p>Always independently verify ownership, addresses, contact methods, parcel boundaries, and
        property details with authoritative sources (county recorder, on-site inspection, direct
        homeowner confirmation) before sending outreach, signing contracts, or filing claims.</p>

        <h2>Not a credit, insurance, or background-screening tool</h2>
        <p>RoofRadar is not a consumer reporting agency. Data may not be used for credit, insurance,
        employment, housing, or any FCRA-regulated decision.</p>
      </article>
    </MarketingLayout>
  );
}
