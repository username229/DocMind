import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

function json(headers: HeadersInit, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers });
}

serve(async (req) => {
  const headers: HeadersInit = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") return new Response(null, { headers });

  try {
    // ---- ENV CHECK
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

    const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID") ?? "";
    const PAYPAL_SECRET = Deno.env.get("PAYPAL_SECRET") ?? "";
    const PAYPAL_BASE_URL = Deno.env.get("PAYPAL_BASE_URL") ?? ""; // https://api-m.paypal.com or sandbox
    const SITE_URL = Deno.env.get("SITE_URL") ?? "";

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error("Supabase env ausente");
    if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET || !PAYPAL_BASE_URL) throw new Error("PayPal env ausente");
    if (!SITE_URL) throw new Error("SITE_URL ausente");

    // ---- AUTH (opcional, mas recomendado)
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader) return json(headers, { error: "Não autorizado" }, 401);

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return json(headers, { error: "Não autorizado" }, 401);

    // ---- BODY
    const { plan, billingPeriod } = await req.json();

    const amountMap: Record<string, Record<string, string>> = {
      monthly: { standard: "85.00", pro: "120.00" },
      yearly: { standard: "1020.00", pro: "1440.00" },
    };

    const amount = amountMap?.[billingPeriod]?.[plan];
    if (!amount) return json(headers, { error: "Plano ou período inválido" }, 400);

    // ---- PAYPAL TOKEN
    const basic = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`);

    const tokenRes = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const tokenData = await tokenRes.json().catch(() => ({}));
    if (!tokenRes.ok || !tokenData?.access_token) {
      return json(headers, { error: "PayPal token error", details: tokenData }, 400);
    }

    // ---- CREATE ORDER
    const orderRes = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": crypto.randomUUID(),
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: `user_${user.id}_${Date.now()}`,
            amount: { currency_code: "EUR", value: amount },
            description: `Plano ${plan} - ${billingPeriod}`,
            custom_id: user.id,
          },
        ],
        application_context: {
          brand_name: "Sua Marca",
          user_action: "PAY_NOW",
          shipping_preference: "NO_SHIPPING",
          return_url: `${SITE_URL}/dashboard?payment=success`,
          cancel_url: `${SITE_URL}/pricing?payment=cancel`,
        },
      }),
    });

    const orderData = await orderRes.json().catch(() => ({}));
    if (!orderRes.ok) {
      return json(headers, { error: "PayPal order error", details: orderData }, 400);
    }

    // útil pro frontend: link de aprovação
    const approve = orderData?.links?.find((l: any) => l.rel === "approve")?.href;

    return json(headers, { ...orderData, approve }, 200);

  } catch (err) {
    return json(headers, { error: String(err?.message ?? err) }, 400);
  }
});
