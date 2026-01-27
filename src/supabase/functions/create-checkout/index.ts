import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const logStep = (step: string, details?: unknown) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[CREATE-CHECKOUT/DODO] ${step}${detailsStr}`);
};

// ✅ Links Dodo (com redirect_url)
const DODO_LINKS = {
  standard:
    "https://checkout.dodopayments.com/buy/pdt_0NXBlp8QKAqSCyBOwvAbB?quantity=1&redirect_url=https://docmind.co",
  pro:
    "https://checkout.dodopayments.com/buy/pdt_0NXCGSxnwR3uZ3A897lLH?quantity=1&redirect_url=https://docmind.co",
} as const;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // 1) Validar usuário via token
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

    logStep("User authenticated", { userId: userData.user.id, email: userData.user.email });

    // 2) Ler body (aceita plan/billingPeriod, mas billingPeriod será ignorado)
    const body = await req.json().catch(() => ({}));
    const plan = String(body.plan || "").toLowerCase();
    // const billingPeriod = String(body.billingPeriod || "").toLowerCase(); // (ignorado no Dodo)

    if (plan !== "standard" && plan !== "pro") {
      return new Response(JSON.stringify({ error: "Invalid plan. Use standard|pro" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = plan === "pro" ? DODO_LINKS.pro : DODO_LINKS.standard;

    // 3) Retornar URL para o frontend redirecionar
    return new Response(JSON.stringify({ url }), {
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
