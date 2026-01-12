import OpenAI from 'openai';
import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

interface Quiz {
  title: string;
  description: string;
  questions: any[];
  total_points: number;
  time_limit_minutes: number;
}

/* ============================
   TEXT EXTRACTORS
============================ */

async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => item.str).join(' ') + '\n';
  }

  return text;
}

async function extractTextFromDocx(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value;
}

/* ============================
   IMAGE INTERPRETER (OCR + IA)
============================ */

async function interpretImage(file: File): Promise<string> {
  const base64 = await fileToBase64(file);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content:
          'You are an expert OCR and study assistant. Extract all educational content from the image accurately.',
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Extract and summarize all educational content from this image.' },
          {
            type: 'image_url',
            image_url: { url: base64 },
          },
        ],
      },
    ],
  });

  return response.choices[0].message.content || '';
}

/* ============================
   FILE READER
============================ */

async function readFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase();

  if (!ext) return '';

  if (ext === 'pdf') return extractTextFromPDF(file);
  if (ext === 'docx') return extractTextFromDocx(file);
  if (ext === 'txt') return file.text();
  if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
    return interpretImage(file);
  }

  return '';
}

/* ============================
   MAIN QUIZ GENERATOR
============================ */

export async function generateQuizFromFiles(files: File[]): Promise<Quiz> {
  let combinedContent = '';

  for (const file of files) {
    const content = await readFile(file);
    combinedContent += `\n\n--- FILE: ${file.name} ---\n${content}`;
  }

  const completion = await openai.chat.completions.create({
    model: 'gpt-4.1',
    temperature: 0.4,
    messages: [
      {
        role: 'system',
        content: `
You are an educational AI that creates exams.
You MUST return ONLY valid JSON.
Language: Portuguese (PT-BR).

Create a complete exam with:
- Multiple choice
- True/False
- Short answer
- Essay questions

Each question must include:
- id
- type
- question
- options (if applicable)
- correct_answer or expected_topics
- points
`,
      },
      {
        role: 'user',
        content: `
Based on the following study material, create a complete exam:

${combinedContent}
`,
      },
    ],
  });

  const raw = completion.choices[0].message.content!;
  return JSON.parse(raw);
}

/* ============================
   UTILS
============================ */

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
