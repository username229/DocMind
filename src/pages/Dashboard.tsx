import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Plus, LogOut, FileText, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DocumentList } from '@/components/document/DocumentList';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Document {
  id: string;
  title: string;
  status: string;
  created_at: string;
  summary: string | null;
}

interface Profile {
  plan: string;
  documents_count: number;
}

export default function Dashboard() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch documents
      const { data: docs, error: docsError } = await supabase
        .from('documents')
        .select('id, title, status, created_at, summary')
        .order('created_at', { ascending: false });

      if (docsError) throw docsError;
      setDocuments(docs || []);

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('plan, documents_count')
        .single();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;
      setProfile(profileData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setDocuments(documents.filter((doc) => doc.id !== id));
      toast.success('Documento excluído');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Erro ao excluir documento');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isPro = profile?.plan === 'pro';
  const docsThisMonth = documents.length;
  const freeLimit = 5;
  const canCreate = isPro || docsThisMonth < freeLimit;

  if (authLoading || loading) {
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

            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link to="/#pricing">Planos</Link>
              </Button>
              {isPro && (
                <span className="flex items-center gap-1 text-sm text-accent font-medium">
                  <Crown className="w-4 h-4" />
                  Pro
                </span>
              )}
              <span className="text-sm text-muted-foreground hidden sm:block">
                {user?.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Stats and CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold mb-2">
                Seus Documentos
              </h1>
              {!isPro && (
                <p className="text-muted-foreground">
                  {docsThisMonth}/{freeLimit} documentos usados este mês
                  <Link to="/#pricing" className="text-primary ml-2 hover:underline">
                    Fazer upgrade
                  </Link>
                </p>
              )}
            </div>

            <Button
              asChild
              variant={canCreate ? 'hero' : 'secondary'}
              disabled={!canCreate}
            >
              <Link to="/dashboard/new">
                <Plus className="w-4 h-4" />
                Novo Documento
              </Link>
            </Button>
          </div>

          {/* Usage warning */}
          {!isPro && docsThisMonth >= freeLimit && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-accent-soft border border-accent/20"
            >
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-accent" />
                <div>
                  <p className="font-medium">Limite mensal atingido</p>
                  <p className="text-sm text-muted-foreground">
                    Faça upgrade para o plano Pro e tenha documentos ilimitados.
                  </p>
                </div>
                <Button asChild variant="accent" size="sm" className="ml-auto">
                  <Link to="/#pricing">Upgrade</Link>
                </Button>
              </div>
            </motion.div>
          )}

          {/* Document list */}
          <DocumentList documents={documents} onDelete={handleDelete} />
        </motion.div>
      </main>
    </div>
  );
}
