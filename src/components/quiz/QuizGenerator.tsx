import { supabase } from "@/integrations/supabase/client";

export async function generateQuiz(files: File[]) {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  const { data, error } = await supabase.functions.invoke("generate-quiz", {
    body: formData,
  });

  if (error) {
    throw error;
  }

  return data;
}
