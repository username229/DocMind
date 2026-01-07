import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, ArrowLeft } from 'lucide-react';
import { DocumentUpload } from '@/components/document/DocumentUpload';
import { AnalysisResults } from '@/components/document/AnalysisResults';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function NewDocument() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState({
    summary: null as string | null,
    simple: null as string | null,
    suggestions: null as string | null,
    improved: null as string | null,
  });
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

  const handleSubmit = async (title: string, documentContent: string) => {
    if (!user) return;

    setIsAnalyzing(true);
    setContent(documentContent);

    try {
      // Create document in database
      const { data: doc, error } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          title,
          original_content: documentContent,
          status: 'processing',
        })
        .select()
        .single();

      if (error) throw error;
      setDocumentId(doc.id);

      // Start analysis for all types
      await Promise.all([
        analyzeDocument(doc.id, documentContent, 'summary'),
        analyzeDocument(doc.id, documentContent, 'simple'),
        analyzeDocument(doc.id, documentContent, 'suggestions'),
        analyzeDocument(doc.id, documentContent, 'improved'),
      ]);

      // Update document status
      await supabase
        .from('documents')
        .update({ status: 'completed' })
        .eq('id', doc.id);

      toast.success('Análise completa!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao processar documento');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeDocument = async (
    docId: string,
    documentContent: string,
    type: 'summary' | 'simple' | 'suggestions' | 'improved'
  ) => {
    setLoadingStates((prev) => ({ ...prev, [type]: true }));

    try {
      const response = await supabase.functions.invoke('analyze-document', {
        body: { content: documentContent, analysisType: type },
      });

      if (response.error) throw response.error;

      const result = response.data?.result || '';
      setResults((prev) => ({ ...prev, [type]: result }));

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
        .eq('id', docId);
    } catch (error) {
      console.error(`Error analyzing ${type}:`, error);
      toast.error(`Erro ao gerar ${type}`);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleReanalyze = async (type: 'summary' | 'simple' | 'suggestions' | 'improved') => {
    if (!documentId || !content) return;
    await analyzeDocument(documentId, content, type);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

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

          <h1 className="font-display text-3xl font-bold mb-8">
            {documentId ? 'Análise do Documento' : 'Novo Documento'}
          </h1>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload section */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="font-display text-xl font-semibold mb-6">
                {documentId ? 'Documento Enviado' : 'Enviar Documento'}
              </h2>
              <DocumentUpload
                onSubmit={handleSubmit}
                isLoading={isAnalyzing}
              />
            </div>

            {/* Results section */}
            {documentId && (
              <AnalysisResults
                summary={results.summary}
                simpleExplanation={results.simple}
                suggestions={results.suggestions}
                improvedVersion={results.improved}
                isLoading={loadingStates}
                onAnalyze={handleReanalyze}
              />
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
