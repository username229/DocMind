import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Plus, LogOut, FileText, Crown, Search, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  original_content: string | null;
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
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'processing' | 'error' | 'pending'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title' | 'favorites'>('newest');
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
      const saved = localStorage.getItem(`docmind:favorites:${user.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setFavorites(parsed);
        } catch {
          // ignore parse errors
        }
      }
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch documents
      const { data: docs, error: docsError } = await supabase
        .from('documents')
        .select('id, title, status, created_at, summary, original_content')
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
    const confirmed = window.confirm('Deseja mesmo excluir este documento? Esta ação não pode ser desfeita.');
    if (!confirmed) return;

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

  const handleRename = async (id: string, currentTitle: string) => {
    const next = window.prompt('Novo nome do documento:', currentTitle)?.trim();
    if (!next || next === currentTitle) return;

    try {
      const { error } = await supabase
        .from('documents')
        .update({ title: next })
        .eq('id', id);

      if (error) throw error;

      setDocuments((prev) => prev.map((doc) => (doc.id === id ? { ...doc, title: next } : doc)));
      toast.success('Título atualizado.');
    } catch (error) {
      console.error('Error renaming document:', error);
      toast.error('Não foi possível renomear.');
    }
  };

  const handleDuplicate = async (id: string) => {
    const source = documents.find((d) => d.id === id);
    if (!source || !user) return;

    try {
      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          title: `${source.title} (cópia)`,
          original_content: source.original_content || source.summary || '',
          status: 'pending',
        })
        .select('id, title, status, created_at, summary, original_content')
        .single();

      if (error) throw error;

      setDocuments((prev) => [data as Document, ...prev]);
      toast.success('Documento duplicado.');
    } catch (error) {
      console.error('Error duplicating document:', error);
      toast.error('Não foi possível duplicar.');
    }
  };

  const toggleFavorite = (id: string) => {
    if (!user) return;

    const next = favorites.includes(id)
      ? favorites.filter((x) => x !== id)
      : [...favorites, id];

    setFavorites(next);
    localStorage.setItem(`docmind:favorites:${user.id}`, JSON.stringify(next));
  };

  const isPro = profile?.plan === 'pro';
  const docsThisMonth = documents.length;
  const freeLimit = 5;
  const canCreate = isPro || docsThisMonth < freeLimit;

  const onboardingChecklist = useMemo(() => {
    const hasAnyDoc = documents.length > 0;
    const hasCompleted = documents.some((d) => d.status === 'completed');
    const hasFavorite = favorites.length > 0;

    return [
      { label: 'Criar primeiro documento', done: hasAnyDoc },
      { label: 'Concluir primeira análise', done: hasCompleted },
      { label: 'Salvar um favorito', done: hasFavorite },
    ];
  }, [documents, favorites]);

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLowerCase();

    const byFilter = documents.filter((doc) => {
      const matchesSearch = !query || doc.title.toLowerCase().includes(query) || (doc.summary || '').toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    if (sortBy === 'title') {
      return [...byFilter].sort((a, b) => a.title.localeCompare(b.title));
    }

    if (sortBy === 'oldest') {
      return [...byFilter].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }

    if (sortBy === 'favorites') {
      return [...byFilter].sort((a, b) => {
        const aFav = favorites.includes(a.id) ? 1 : 0;
        const bFav = favorites.includes(b.id) ? 1 : 0;
        if (aFav !== bFav) return bFav - aFav;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    }

    return [...byFilter].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [documents, search, statusFilter, sortBy, favorites]);

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

          {/* Quick onboarding checklist */}
          <div className="mb-6 rounded-xl border border-border bg-card p-4">
            <p className="text-sm font-medium mb-2">Checklist de início rápido</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {onboardingChecklist.map((item) => (
                <div key={item.label} className="text-sm flex items-center gap-2">
                  <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs ${item.done ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {item.done ? '✓' : '•'}
                  </span>
                  <span className={item.done ? 'text-foreground' : 'text-muted-foreground'}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Discovery tools */}
          <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Star className="w-3 h-3 text-amber-500" />
            {favorites.length} favorito(s) salvos neste dispositivo
          </div>
          <div className="mb-6 grid gap-3 md:grid-cols-3">
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por título ou conteúdo..."
                className="pl-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">Todos</option>
                <option value="completed">Concluídos</option>
                <option value="processing">Processando</option>
                <option value="error">Com erro</option>
                <option value="pending">Pendentes</option>
              </select>
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="newest">Mais novos</option>
                <option value="oldest">Mais antigos</option>
                <option value="title">A-Z</option>
                <option value="favorites">Favoritos primeiro</option>
              </select>
            </div>
          </div>

          {/* Document list */}
          <DocumentList
            documents={filteredDocuments}
            onDelete={handleDelete}
            onRename={handleRename}
            onDuplicate={handleDuplicate}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        </motion.div>
      </main>
    </div>
  );
}
