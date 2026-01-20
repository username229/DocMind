import OpenAI from "https://esm.sh/openai@4.56.0";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return new Response(
        JSON.stringify({ error: "No files received" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const openai = new OpenAI({
      apiKey: Deno.env.get("OPENAI_API_KEY"),
    });

    let combinedContent = "";

    for (const file of files) {
      if (file.type.startsWith("image/")) {
        combinedContent += await interpretImage(openai, file);
      } else {
        combinedContent += await file.text();
      }
    }

    const quiz = await openai.chat.completions.create({
      model: "gpt-4.1",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content: `
You are an educational AI.
Return ONLY valid JSON.
Language: Portuguese (PT-BR).

Create an exam with:
- Multiple choice
- True/False
- Short answer
- Essay

Each question must include:
id, type, question, options?, correct_answer?, expected_topics?, points
          `,
        },
        {
          role: "user",
          content: combinedContent,
        },
      ],
    });

    const raw = quiz.choices[0].message.content;

    return new Response(raw, {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: "Failed to generate quiz" }),
      { status: 500, headers: corsHeaders }
    );
  }
});

/* =========================
   IMAGE OCR + INTERPRETATION
========================= */

async function interpretImage(openai: OpenAI, file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const base64 = btoa(
    String.fromCharCode(...new Uint8Array(buffer))
  );

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Extract all educational content from this image." },
          {
            type: "image_url",
            image_url: {
              url: `data:${file.type};base64,${base64}`,
            },
          },
        ],
      },
    ],
  });

  return response.choices[0].message.content ?? "";
}
