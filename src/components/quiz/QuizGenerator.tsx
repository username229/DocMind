import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  content: string;
  documentId: string;
  onQuizGenerated: (quiz: any) => void;
}

export function QuizGenerator({ content, documentId, onQuizGenerated }: Props) {
  const [loading, setLoading] = useState(false);

  const generateQuiz = async () => {
    if (!content) {
      toast.error("Conteúdo insuficiente para gerar a prova");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-quiz", {
        body: {
          content,
          documentId,
        },
      });

      if (error) throw error;

      onQuizGenerated(data.quiz);
      toast.success("Prova gerada com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao gerar a prova");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="font-display text-lg font-semibold mb-4">
        Gerar Prova Automática
      </h3>

      <Button onClick={generateQuiz} disabled={loading}>
        {loading ? "Gerando prova..." : "Gerar Prova"}
      </Button>
    </div>
  );
}
