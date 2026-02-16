import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Method = "mpesa" | "emola";
type Plan = "standard" | "pro";
type BillingPeriod = "monthly" | "yearly";

const PRICE_MZN: Record<BillingPeriod, Record<Plan, number>> = {
  monthly: { standard: 319.31, pro: 637.98 },
  yearly: { standard: 3832.86, pro: 7665.73 },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const plan = String(body.plan || "").toLowerCase() as Plan;
    const billingPeriod = String(body.billingPeriod || "").toLowerCase() as BillingPeriod;
    const method = String(body.method || "").toLowerCase() as Method;

    if (!["standard", "pro"].includes(plan)) {
      return new Response(JSON.stringify({ error: "Invalid plan" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!["monthly", "yearly"].includes(billingPeriod)) {
      return new Response(JSON.stringify({ error: "Invalid billingPeriod" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!["mpesa", "emola"].includes(method)) {
      return new Response(JSON.stringify({ error: "Invalid method" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const amount = PRICE_MZN[billingPeriod][plan];

    // This function supports two integration modes:
    // 1) Hosted checkout redirect URL
    // 2) Direct API trigger (no redirect) with async confirmation
    // Keep all secrets server-side only.

    const providerBaseUrl = Deno.env.get("MOBILE_MONEY_PROVIDER_BASE_URL") ?? "";
    const providerApiKey = Deno.env.get("MOBILE_MONEY_PROVIDER_API_KEY") ?? "";
    const merchantId = Deno.env.get("MOBILE_MONEY_MERCHANT_ID") ?? "";

    if (!providerBaseUrl || !providerApiKey || !merchantId) {
      return new Response(
        JSON.stringify({
          error:
            "Mobile money gateway is not configured yet. Set MOBILE_MONEY_PROVIDER_BASE_URL, MOBILE_MONEY_PROVIDER_API_KEY, MOBILE_MONEY_MERCHANT_ID.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const externalRef = `docmind_${method}_${userData.user.id}_${Date.now()}`;

    const response = await fetch(`${providerBaseUrl}/payments/mobile-money`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${providerApiKey}`,
      },
      body: JSON.stringify({
        merchantId,
        method,
        amount,
        currency: "MZN",
        plan,
        billingPeriod,
        customer: {
          id: userData.user.id,
          email: userData.user.email,
        },
        externalRef,
        // The gateway should handle receiver details internally via merchant credentials.
      }),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return new Response(JSON.stringify({ error: payload?.error || "Gateway error", details: payload }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        ok: true,
        provider: method,
        redirectUrl: payload?.redirectUrl || null,
        message:
          payload?.message ||
          "Pagamento iniciado. Confirme no seu telemóvel e aguarde a ativação automática.",
        reference: payload?.reference || externalRef,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
