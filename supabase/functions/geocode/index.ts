// Geocodes a free-form address string via OpenStreetMap Nominatim.
// Public, no API key. Respects the 1 req/sec usage policy via a small delay.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    let address = url.searchParams.get("q") ?? "";
    if (!address && req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      address = body?.address ?? body?.q ?? "";
    }
    address = String(address).trim();
    if (!address) {
      return new Response(JSON.stringify({ error: "address required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const u = new URL("https://nominatim.openstreetmap.org/search");
    u.searchParams.set("q", address);
    u.searchParams.set("format", "json");
    u.searchParams.set("limit", "1");
    u.searchParams.set("countrycodes", "us");

    const r = await fetch(u.toString(), {
      headers: {
        "User-Agent": "RoofRadar/1.0 (+https://myroofradar.com)",
        "Accept": "application/json",
      },
    });
    if (!r.ok) {
      return new Response(JSON.stringify({ error: `nominatim ${r.status}` }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const arr = await r.json();
    const hit = Array.isArray(arr) ? arr[0] : null;
    if (!hit) {
      return new Response(JSON.stringify({ found: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({
      found: true,
      lat: Number(hit.lat),
      lng: Number(hit.lon),
      display_name: hit.display_name,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
