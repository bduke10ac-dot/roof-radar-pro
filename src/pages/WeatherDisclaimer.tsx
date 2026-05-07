import { useEffect } from "react";
import { MarketingLayout } from "@/components/MarketingLayout";

export default function WeatherDisclaimer() {
  useEffect(() => { document.title = "Weather Data Disclaimer — RoofRadar"; }, []);
  return (
    <MarketingLayout>
      <article className="max-w-3xl mx-auto px-4 py-12 prose prose-sm dark:prose-invert">
        <h1>Weather Data Disclaimer</h1>
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

        <p>RoofRadar surfaces weather information — including radar imagery, NWS alerts, hail and wind
        estimates, and storm overlays — sourced from public and third-party providers (National Weather
        Service / NOAA, RainViewer, and similar). Weather information is provided for situational awareness
        only.</p>

        <h2>Not for life-safety decisions</h2>
        <p>RoofRadar is <strong>not</strong> an emergency alerting system. Do not rely on RoofRadar to
        protect life or property during severe weather. Always defer to NOAA/NWS official channels
        (weather.gov, NOAA Weather Radio, local emergency management).</p>

        <h2>Estimates, not measurements</h2>
        <p>Hail size, wind speed, and storm path overlays are <em>modeled estimates</em>, not on-site
        measurements. Always verify damage with a physical inspection before making contractual,
        insurance, or business commitments.</p>

        <h2>No SLA</h2>
        <p>Third-party feeds may be delayed, intermittent, or temporarily unavailable. RoofRadar provides
        no warranty as to accuracy, completeness, or availability of weather data.</p>
      </article>
    </MarketingLayout>
  );
}
