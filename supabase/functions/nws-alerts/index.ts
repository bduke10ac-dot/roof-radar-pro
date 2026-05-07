// Real NOAA / National Weather Service alerts feed.
// Public API — no key required. https://www.weather.gov/documentation/services-web-api
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

interface NwsFeature {
  id: string;
  properties: {
    id: string;
    event: string;
    severity: string;
    certainty: string;
    urgency: string;
    headline: string;
    description: string;
    instruction: string | null;
    areaDesc: string;
    sent: string;
    effective: string;
    expires: string;
    senderName: string;
  };
  geometry: unknown;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const state = url.searchParams.get("state"); // e.g. "TN"
    const event = url.searchParams.get("event"); // optional filter, e.g. "Tornado Warning"

    const params = new URLSearchParams({ status: "actual", message_type: "alert" });
    if (state) params.set("area", state.toUpperCase());

    const apiUrl = `https://api.weather.gov/alerts/active?${params.toString()}`;
    const res = await fetch(apiUrl, {
      headers: {
        // NWS requires a User-Agent identifying the app
        "User-Agent": "RoofRadar (support@myroofradar.com)",
        Accept: "application/geo+json",
      },
    });

    if (!res.ok) {
      const text = await res.text();
      return new Response(
        JSON.stringify({ error: `NWS API error ${res.status}`, details: text.slice(0, 500) }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await res.json();
    let features: NwsFeature[] = data.features ?? [];
    if (event) {
      const e = event.toLowerCase();
      features = features.filter(f => f.properties.event?.toLowerCase().includes(e));
    }

    const alerts = features.map(f => ({
      id: f.properties.id,
      event: f.properties.event,
      severity: f.properties.severity,
      certainty: f.properties.certainty,
      urgency: f.properties.urgency,
      headline: f.properties.headline,
      description: f.properties.description,
      instruction: f.properties.instruction,
      area: f.properties.areaDesc,
      sent: f.properties.sent,
      effective: f.properties.effective,
      expires: f.properties.expires,
      senderName: f.properties.senderName,
      geometry: f.geometry,
    }));

    return new Response(
      JSON.stringify({ count: alerts.length, alerts, fetchedAt: new Date().toISOString() }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=60",
        },
        status: 200,
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
