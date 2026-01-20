import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

serve(async (req) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") return new Response(null, { headers });

  try {
    // 1. Validar Usuário (Opcional, mas recomendado)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Não autorizado");

    // 2. Pegar dados do corpo
    const { plan, billingPeriod } = await req.json();

    const amountMap = {
      monthly: { standard: "85.00", pro: "120.00" },
      yearly: { standard: "1020.00", pro: "1440.00" },
    };

    const amount = amountMap[billingPeriod]?.[plan];
    if (!amount) throw new Error("Plano ou período inválido");

    // 3. PayPal Auth
    const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const secret = Deno.env.get("PAYPAL_SECRET");
    const baseUrl = Deno.env.get("PAYPAL_BASE_URL"); // https://api-m.sandbox.paypal.com ou https://api-m.paypal.com

    const auth = btoa(`${clientId}:${secret}`);
    
    const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: { 
        Authorization: `Basic ${auth}`, 
        "Content-Type": "application/x-www-form-urlencoded" 
      },
      body: "grant_type=client_credentials",
    });

    const { access_token } = await tokenRes.json();

    // 4. Criar Ordem
    const orderRes = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": crypto.randomUUID(), // Evita duplicidade
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: `user_${user.id}_${Date.now()}`,
            amount: { 
              currency_code: "EUR", 
              value: amount 
            },
            description: `Plano ${plan} - ${billingPeriod}`,
            custom_id: user.id // Útil para o Webhook depois
          },
        ],
        application_context: {
          brand_name: "Sua Marca",
          user_action: "PAY_NOW",
          shipping_preference: "NO_SHIPPING", // Importante para serviços digitais
          return_url: `${Deno.env.get("SITE_URL")}/dashboard?payment=success`,
          cancel_url: `${Deno.env.get("SITE_URL")}/pricing`,
        },
      }),
    });

    const orderData = await orderRes.json();

    if (!orderRes.ok) throw new Error(orderData.message || "Erro no PayPal");

    return new Response(JSON.stringify(orderData), { status: 200, headers });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: err.message === "Não autorizado" ? 401 : 400, 
      headers 
    });
  }
});