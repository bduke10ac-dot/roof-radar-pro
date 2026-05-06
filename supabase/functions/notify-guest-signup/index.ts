import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.23.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Internal recipient — never returned to clients or logged to UI.
const INTERNAL_RECIPIENT = "Bduke10ac@gmail.com";

const Body = z.object({
  name: z.string().trim().min(2).max(120),
  company: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(240),
  phone: z.string().trim().min(7).max(40),
  consent: z.boolean().optional(),
  captured_at: z.string().optional(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const json = await req.json();
    const parsed = Body.safeParse(json);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const lead = parsed.data;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1. Persist the lead
    const { data: row, error: insertErr } = await supabase
      .from("guest_leads")
      .insert({
        name: lead.name,
        company: lead.company,
        email: lead.email,
        phone: lead.phone,
        consent: lead.consent ?? true,
        user_agent: req.headers.get("user-agent") ?? null,
        source: "use_it_now",
      })
      .select("id")
      .single();

    if (insertErr) {
      console.error("guest_leads insert failed", insertErr);
      return new Response(JSON.stringify({ error: "store_failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Best-effort email forward to internal recipient.
    //    Uses send-transactional-email if email infra is configured.
    let notified = false;
    try {
      const { error: mailErr } = await supabase.functions.invoke("send-transactional-email", {
        body: {
          to: INTERNAL_RECIPIENT,
          templateName: "guest_lead_notification",
          subject: `New free-preview lead: ${lead.name} (${lead.company})`,
          variables: {
            name: lead.name,
            company: lead.company,
            email: lead.email,
            phone: lead.phone,
            captured_at: lead.captured_at ?? new Date().toISOString(),
          },
          fallbackHtml: `
            <h2>New RoofRadar free-preview signup</h2>
            <p><strong>Name:</strong> ${lead.name}</p>
            <p><strong>Company:</strong> ${lead.company}</p>
            <p><strong>Email:</strong> ${lead.email}</p>
            <p><strong>Phone:</strong> ${lead.phone}</p>
            <p><strong>Captured:</strong> ${lead.captured_at ?? new Date().toISOString()}</p>
          `,
        },
      });
      if (!mailErr) notified = true;
    } catch (e) {
      console.warn("Email forward skipped (email infra not ready):", e);
    }

    if (notified && row?.id) {
      await supabase.from("guest_leads").update({ notified: true }).eq("id", row.id);
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("notify-guest-signup error", err);
    return new Response(JSON.stringify({ error: "internal_error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
