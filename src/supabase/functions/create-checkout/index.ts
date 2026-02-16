import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

const getCheckoutUrls = () => {
  const provider = (Deno.env.get("CARD_PROVIDER") || "dodo").toLowerCase();

  // Keep provider URLs in Supabase secrets, never hardcoded.
  const dodo = {
    standard: Deno.env.get("DODO_CHECKOUT_STANDARD_URL") || "",
    pro: Deno.env.get("DODO_CHECKOUT_PRO_URL") || "",
  };

  const flutterwave = {
    standard: Deno.env.get("FLW_CHECKOUT_STANDARD_URL") || "",
    pro: Deno.env.get("FLW_CHECKOUT_PRO_URL") || "",
  };

  const paystack = {
    standard: Deno.env.get("PAYSTACK_CHECKOUT_STANDARD_URL") || "",
    pro: Deno.env.get("PAYSTACK_CHECKOUT_PRO_URL") || "",
  };

  if (provider === "flutterwave") return { provider, ...flutterwave };
  if (provider === "paystack") return { provider, ...paystack };
  return { provider: "dodo", ...dodo };
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

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
      logStep("Auth failed", { message: userError?.message });
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const plan = String(body.plan || "").toLowerCase();

    if (plan !== "standard" && plan !== "pro") {
      return new Response(JSON.stringify({ error: "Invalid plan. Use standard|pro" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { provider, standard, pro } = getCheckoutUrls();
    const url = plan === "pro" ? pro : standard;

    if (!url) {
      return new Response(
        JSON.stringify({
          error: `Card checkout URL not configured for provider '${provider}' and plan '${plan}'.`,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ url, provider }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
