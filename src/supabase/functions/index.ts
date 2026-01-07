import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Prompts otimizados para cada tipo de análise
const PROMPTS = {
  summary: `Você é um especialista em síntese de textos. Analise o documento a seguir e crie um resumo conciso e objetivo.

Instruções:
- Identifique os pontos principais e temas centrais
- Mantenha o resumo entre 150-300 palavras
- Use bullet points para organizar as ideias principais
- Preserve o tom e contexto do documento original
- Destaque conclusões e insights importantes

Documento:`,

  simple: `Você é um educador experiente que explica conceitos complexos de forma simples. Sua tarefa é explicar o documento a seguir como se estivesse falando com uma criança de 12 anos.

Instruções:
- Use linguagem simples e acessível
- Evite jargões técnicos (se necessário, explique-os)
- Use analogias e exemplos do dia-a-dia
- Divida conceitos complexos em partes menores
- Seja engajante e interessante
- Mantenha o texto informativo mas fácil de entender

Documento:`,

  suggestions: `Você é um consultor editorial especializado em melhorar documentos. Analise o texto a seguir e forneça sugestões de melhoria.

Instruções:
- Identifique pontos fortes e fracos do texto
- Sugira melhorias de clareza e organização
- Aponte possíveis erros ou inconsistências
- Recomende ajustes de tom e estilo se necessário
- Sugira adições de conteúdo que poderiam enriquecer o documento
- Organize as sugestões por prioridade (alta, média, baixa)
- Seja construtivo e específico

Documento:`,

  improved: `Você é um escritor profissional especializado em revisão e aprimoramento de textos. Sua tarefa é criar uma versão melhorada do documento a seguir.

Instruções:
- Mantenha a essência e as ideias principais do original
- Melhore a clareza e fluidez do texto
- Corrija erros gramaticais e de ortografia
- Aprimore a estrutura e organização
- Enriqueça o vocabulário quando apropriado
- Torne o texto mais engajante e profissional
- Marque as principais alterações com comentários breves entre [colchetes]

Documento:`,
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, analysisType, stream = false } = await req.json();

    if (!content || !analysisType) {
      return new Response(
        JSON.stringify({ error: "Content and analysisType are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = PROMPTS[analysisType as keyof typeof PROMPTS];
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Invalid analysisType. Use: summary, simple, suggestions, or improved" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Processing ${analysisType} analysis, content length: ${content.length}`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Você é um assistente especializado em análise e processamento de documentos. Responda sempre em português brasileiro." },
          { role: "user", content: `${prompt}\n\n${content}` },
        ],
        stream: stream,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Por favor, adicione créditos à sua conta." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "Erro ao processar com IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (stream) {
      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || "";

    console.log(`Analysis complete, result length: ${result.length}`);

    return new Response(
      JSON.stringify({ result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in analyze-document:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
