const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
import { createClient } from "npm:@supabase/supabase-js@2";

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// Tables that have an owner_id (or user_id) column scoped to the user.
// Service role bypasses RLS so we delete explicitly here.
const OWNER_ID_TABLES = [
  "leads",
  "properties",
  "markets",
  "auto_campaign_rules",
  "campaigns",
  "triggered_campaigns",
  "lead_imports",
  "market_storm_scores",
];
const USER_ID_TABLES = [
  "user_market_automation_preferences",
  "user_map_preferences",
  "user_subscriptions",
  "usage_tracking",
  "subscriptions",
  "user_roles",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: { user }, error: authError } = await admin.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { confirmation } = await req.json().catch(() => ({}));
    if (confirmation !== "DELETE MY ACCOUNT") {
      return new Response(JSON.stringify({ error: "Confirmation phrase missing or incorrect" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const uid = user.id;
    const errors: string[] = [];

    for (const t of OWNER_ID_TABLES) {
      const { error } = await admin.from(t).delete().eq("owner_id", uid);
      if (error) errors.push(`${t}: ${error.message}`);
    }
    for (const t of USER_ID_TABLES) {
      const { error } = await admin.from(t).delete().eq("user_id", uid);
      if (error) errors.push(`${t}: ${error.message}`);
    }
    // profile last
    await admin.from("profiles").delete().eq("user_id", uid);

    // Finally delete the auth user. This will sign them out everywhere.
    const { error: delErr } = await admin.auth.admin.deleteUser(uid);
    if (delErr) {
      return new Response(JSON.stringify({ error: `Failed to delete account: ${delErr.message}`, partial: errors }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, dataWarnings: errors }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("delete-account error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
