import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, ArrowLeft, FileText, Clock } from 'lucide-react';
import { AnalysisResults } from '@/components/document/AnalysisResults';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Document {
  id: string;
  title: string;
  original_content: string;
  summary: string | null;
  simple_explanation: string | null;
  suggestions: string | null;
  improved_version: string | null;
  status: string;
  created_at: string;
}

export default function DocumentDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStates, setLoadingStates] = useState({
    summary: false,
    simple: false,
    suggestions: false,
    improved: false,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && id) {
      fetchDocument();
    }
  }, [user, id]);

  const fetchDocument = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setDocument(data);
    } catch (error) {
      console.error('Error fetching document:', error);
      toast.error('Documento não encontrado');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const analyzeDocument = async (type: 'summary' | 'simple' | 'suggestions' | 'improved') => {
    if (!document) return;

    setLoadingStates((prev) => ({ ...prev, [type]: true }));

    try {
      const response = await supabase.functions.invoke('analyze-document', {
        body: { content: document.original_content, analysisType: type },
      });

      if (response.error) throw response.error;

      const result = response.data?.result || '';

      // Update document with result
      const updateField =
        type === 'summary'
          ? 'summary'
          : type === 'simple'
          ? 'simple_explanation'
          : type === 'suggestions'
          ? 'suggestions'
          : 'improved_version';

      await supabase
        .from('documents')
        .update({ [updateField]: result })
        .eq('id', document.id);

      setDocument((prev) => (prev ? { ...prev, [updateField]: result } : null));
      toast.success('Análise concluída!');
    } catch (error) {
      console.error(`Error analyzing ${type}:`, error);
      toast.error(`Erro ao gerar análise`);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [type]: false }));
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!document) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold">DocMind</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Dashboard
          </Link>

          {/* Document info */}
          <div className="flex items-start gap-4 mb-8">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold mb-2">
                {document.title}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>
                  Criado{' '}
                  {formatDistanceToNow(new Date(document.created_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Original content */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="font-display text-xl font-semibold mb-4">
                Conteúdo Original
              </h2>
              <div className="bg-muted/50 rounded-xl p-4 max-h-[500px] overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-foreground font-sans">
                  {document.original_content}
                </pre>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {document.original_content.length.toLocaleString()} caracteres
              </p>
            </div>

            {/* Analysis results */}
            <AnalysisResults
              summary={document.summary}
              simpleExplanation={document.simple_explanation}
              suggestions={document.suggestions}
              improvedVersion={document.improved_version}
              isLoading={loadingStates}
              onAnalyze={analyzeDocument}
            />
          </div>
        </motion.div>
      </main>
    </div>
  );
}
