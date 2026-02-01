import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, ArrowLeft, Crown, Lock } from 'lucide-react';
import { MultiFileUpload } from '@/components/document/MultiFileUpload';
import { AnalysisResults } from '@/components/document/AnalysisResults';
import { QuizGenerator } from '@/components/quiz/QuizGenerator';
import { QuizTaker } from '@/components/quiz/QuizTaker';
import { QuizResults } from '@/components/quiz/QuizResults';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

import { SEO } from "@/components/SEO";

const base = "https://docmind.co";

// helper simples pra hreflang
function makeAlternates(path: string) {
  return [
    { hreflang: "en", href: `${base}/en${path}` },
    { hreflang: "pt", href: `${base}/pt${path}` },
    { hreflang: "x-default", href: `${base}/en${path}` },
  ];
}

// Limites de documentos por plano
const PLAN_LIMITS = {
  free: 2,        // 2 documentos totais com todos os recursos
  standard: 10,   // 10 documentos
  pro: 20,        // 20 documentos
};

export default function NewDocument() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [documentCount, setDocumentCount] = useState(0);
  const [userPlan, setUserPlan] = useState<'free' | 'standard' | 'pro'>('free');
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

  // Quiz state (disponível para todos os planos, mas Pro tem features extras)
  const [quiz, setQuiz] = useState<any>(null);
  const [quizResults, setQuizResults] = useState<any>(null);
  const [quizMode, setQuizMode] = useState<'generator' | 'taking' | 'results'>('generator');

  const isPro = userPlan === 'pro';
  const planLimit = PLAN_LIMITS[userPlan] ?? 2;
  const canCreateMore = documentCount < planLimit;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;
    
    try {
      // Buscar plano do usuário
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('plan')
        .eq('user_id', user.id)
        .single();
      
      if (profileError) throw profileError;
      
      const plan = (profileData?.plan as 'free' | 'standard' | 'pro') || 'free';
      setUserPlan(plan);

      // Buscar contagem de documentos
      const { count, error: countError } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      if (countError) throw countError;
      
      setDocumentCount(count || 0);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleSubmit = async (files: { title: string; content: string; imageBase64?: string }[]) => {
    if (!user) return;

    // Verificar limite de documentos
    if (documentCount + files.length > planLimit) {
      toast.error(`Seu plano ${userPlan} permite apenas ${planLimit} documentos. Faça upgrade para continuar.`);
      return;
    }

    setIsAnalyzing(true);

    try {
      // Processar primeiro arquivo para exibição
      const firstFile = files[0];
      setContent(firstFile.content);
      setImageBase64(firstFile.imageBase64 || null);

      // Criar documentos para todos os arquivos
      const createdDocs = await Promise.all(
        files.map(async (file) => {
          const { data: doc, error } = await supabase
            .from('documents')
            .insert({
              user_id: user.id,
              title: file.title,
              original_content: file.imageBase64 ? '[Imagem]' : file.content,
              status: 'processing',
            })
            .select()
            .single();

          if (error) throw error;
          return { doc, file };
        })
      );

      // Definir o primeiro documento como atual
      setDocumentId(createdDocs[0].doc.id);

      // Analisar primeiro documento - TODOS OS RECURSOS PARA TODOS OS PLANOS
      const firstDoc = createdDocs[0];
      const isImage = !!firstDoc.file.imageBase64;

      // Executar todas as 4 análises para TODOS os planos (Free, Standard, Pro)
      await Promise.all([
        analyzeDocument(firstDoc.doc.id, firstDoc.file.content, 'summary', isImage, firstDoc.file.imageBase64),
        analyzeDocument(firstDoc.doc.id, firstDoc.file.content, 'simple', isImage, firstDoc.file.imageBase64),
        analyzeDocument(firstDoc.doc.id, firstDoc.file.content, 'suggestions', isImage, firstDoc.file.imageBase64),
        analyzeDocument(firstDoc.doc.id, firstDoc.file.content, 'improved', isImage, firstDoc.file.imageBase64),
      ]);

      // Atualizar status do primeiro documento
      await supabase
        .from('documents')
        .update({ status: 'completed' })
        .eq('id', firstDoc.doc.id);

      // Processar documentos restantes em background
      if (createdDocs.length > 1) {
        processRemainingDocuments(createdDocs.slice(1));
      }

      setDocumentCount((prev) => prev + files.length);
      toast.success(`${files.length} documento(s) processado(s) com sucesso!`);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao processar documento');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const processRemainingDocuments = async (docs: { doc: any; file: any }[]) => {
    for (const { doc, file } of docs) {
      try {
        const isImage = !!file.imageBase64;
        await Promise.all([
          analyzeDocumentSilent(doc.id, file.content, 'summary', isImage, file.imageBase64),
          analyzeDocumentSilent(doc.id, file.content, 'simple', isImage, file.imageBase64),
          analyzeDocumentSilent(doc.id, file.content, 'suggestions', isImage, file.imageBase64),
          analyzeDocumentSilent(doc.id, file.content, 'improved', isImage, file.imageBase64),
        ]);
        await supabase.from('documents').update({ status: 'completed' }).eq('id', doc.id);
      } catch (error) {
        console.error('Error processing document:', error);
        await supabase.from('documents').update({ status: 'error' }).eq('id', doc.id);
      }
    }
  };

  const analyzeDocumentSilent = async (
    docId: string,
    documentContent: string,
    type: 'summary' | 'simple' | 'suggestions' | 'improved',
    isImage: boolean = false,
    imageData?: string
  ) => {
    const response = await supabase.functions.invoke('analyse-document', {
      body: { content: documentContent, analysisType: type, isImage, imageBase64: imageData },
    });

    if (response.error) throw response.error;

    const result = response.data?.result || '';
    const updateField =
      type === 'summary' ? 'summary' :
      type === 'simple' ? 'simple_explanation' :
      type === 'suggestions' ? 'suggestions' : 'improved_version';

    await supabase.from('documents').update({ [updateField]: result }).eq('id', docId);
  };

  const analyzeDocument = async (
    docId: string,
    documentContent: string,
    type: 'summary' | 'simple' | 'suggestions' | 'improved',
    isImage: boolean = false,
    imageData?: string
  ) => {
    setLoadingStates((prev) => ({ ...prev, [type]: true }));

    try {
      const response = await supabase.functions.invoke('analyse-document', {
        body: { content: documentContent, analysisType: type, isImage, imageBase64: imageData },
      });

      if (response.error) throw response.error;

      const result = response.data?.result || '';
      setResults((prev) => ({ ...prev, [type]: result }));

      const updateField =
        type === 'summary' ? 'summary' :
        type === 'simple' ? 'simple_explanation' :
        type === 'suggestions' ? 'suggestions' : 'improved_version';

      await supabase.from('documents').update({ [updateField]: result }).eq('id', docId);
    } catch (error) {
      console.error(`Error analyzing ${type}:`, error);
      toast.error(`Erro ao gerar ${type}`);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleReanalyze = async (type: 'summary' | 'simple' | 'suggestions' | 'improved') => {
    if (!documentId || (!content && !imageBase64)) return;
    await analyzeDocument(documentId, content, type, !!imageBase64, imageBase64 || undefined);
  };

  // Quiz handlers
  const handleQuizGenerated = (quizData: any) => {
    setQuiz(quizData);
    setQuizMode('taking');
  };

  const handleQuizComplete = (resultsData: any) => {
    setQuizResults(resultsData);
    setQuizMode('results');
  };

  const handleQuizReset = () => {
    setQuiz(null);
    setQuizResults(null);
    setQuizMode('generator');
  };

  const handleQuizRetry = () => {
    setQuizResults(null);
    setQuizMode('taking');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!user) return null;

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

            <div className="flex items-center gap-4">
              {isPro && (
                <span className="flex items-center gap-1 text-sm text-accent font-medium">
                  <Crown className="w-4 h-4" />
                  Pro
                </span>
              )}
              <span className="text-sm text-muted-foreground">
                Plano: <span className="font-medium capitalize">{userPlan}</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Dashboard
          </Link>

          <div className="flex items-center justify-between mb-8">
            <h1 className="font-display text-3xl font-bold">
              {documentId ? 'Análise do Documento' : 'Novo Documento'}
            </h1>

            <div className="text-sm text-muted-foreground">
              {documentCount}/{planLimit} documentos usados
              {userPlan === 'free' && (
                <Link to="/#pricing" className="text-primary ml-2 hover:underline">
                  Upgrade para mais
                </Link>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Upload section */}
            <div className="glass-card rounded-2xl p-6">
              <h2 className="font-display text-xl font-semibold mb-6">
                {documentId ? 'Documento Enviado' : 'Enviar Documentos'}
              </h2>
              <MultiFileUpload
                onSubmit={handleSubmit}
                isLoading={isAnalyzing}
                plan={userPlan}
              />

              {!canCreateMore && (
                <div className="mt-4 p-4 rounded-xl bg-accent/10 border border-accent/20">
                  <div className="flex items-center gap-2 text-accent">
                    <Lock className="w-4 h-4" />
                    <span className="font-medium">Limite de {planLimit} documentos atingido</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Faça upgrade para {userPlan === 'free' ? 'Standard (10 docs)' : 'Pro (20 docs)'} para continuar.
                  </p>
                  <Button asChild variant="accent" size="sm" className="mt-3">
                    <Link to="/#pricing">Ver Planos</Link>
                  </Button>
                </div>
              )}
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

          {/* Quiz Section - Disponível para todos, mas Pro tem features extras */}
          {documentId && (
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-6">
                <Crown className="w-5 h-5 text-accent" />
                <h2 className="font-display text-2xl font-bold">Simulador de Provas</h2>
                <span className="text-xs text-muted-foreground">
                  (Disponível para todos os planos)
                </span>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {quizMode === 'generator' && (
                  <QuizGenerator
                    content={content || results.summary || ''}
                    documentId={documentId}
                    onQuizGenerated={handleQuizGenerated}
                  />
                )}

                {quizMode === 'taking' && quiz && (
                  <div className="lg:col-span-2">
                    <QuizTaker
                      quiz={quiz}
                      onComplete={handleQuizComplete}
                      onReset={handleQuizReset}
                    />
                  </div>
                )}

                {quizMode === 'results' && quizResults && (
                  <div className="lg:col-span-2">
                    <QuizResults
                      results={quizResults}
                      onRetry={handleQuizRetry}
                      onNewQuiz={handleQuizReset}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}