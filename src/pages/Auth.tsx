import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
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

/* =======================
   Types & Schema
======================= */

const authSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
});

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset';
type SocialProvider = 'google';

/* =======================
   Component
======================= */

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, signInWithProvider, resetPassword, user } = useAuth();
  const navigate = useNavigate();

  /* =======================
     Effects
  ======================= */

  useEffect(() => {
    if (user && mode !== 'reset') {
      navigate('/dashboard');
    }
  }, [user, navigate, mode]);

  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam === 'reset') {
      setMode('reset');
    }
  }, [searchParams]);

  /* =======================
     Handlers
  ======================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'forgot') {
        const { error } = await resetPassword(email);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Email de recuperação enviado! Verifique sua caixa de entrada.');
          setMode('login');
        }
        return;
      }

      if (mode === 'reset') {
        if (password !== confirmPassword) {
          toast.error('As senhas não coincidem');
          return;
        }

        const { error } = await supabase.auth.updateUser({ password });
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Senha atualizada com sucesso!');
          navigate('/dashboard');
        }
        return;
      }

      const validation = authSchema.safeParse({
        email,
        password,
        fullName: mode === 'login' ? undefined : fullName,
      });

      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        return;
      }

      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(
            error.message.includes('Invalid login credentials')
              ? 'Email ou senha incorretos'
              : error.message
          );
        } else {
          toast.success('Login realizado com sucesso!');
          navigate('/dashboard');
        }
      }

      if (mode === 'signup') {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          toast.error(
            error.message.includes('already registered')
              ? 'Este email já está cadastrado'
              : error.message
          );
        } else {
          toast.success('Conta criada com sucesso!');
          navigate('/dashboard');
        }
      }
    } catch {
      toast.error('Ocorreu um erro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: SocialProvider) => {
    setLoading(true);

    try {
      const { error } = await signInWithProvider(provider);

      if (error) {
        toast.error('Erro ao fazer login com Google');
      }
    } catch {
      toast.error('Erro inesperado ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     Helpers
  ======================= */

  const getTitle = () => {
    switch (mode) {
      case 'login':
        return 'Entre na sua conta';
      case 'signup':
        return 'Crie sua conta grátis';
      case 'forgot':
        return 'Recuperar senha';
      case 'reset':
        return 'Definir nova senha';
    }
  };

  const getButtonText = () => {
    if (loading) return 'Carregando...';
    switch (mode) {
      case 'login':
        return 'Entrar';
      case 'signup':
        return 'Criar conta';
      case 'forgot':
        return 'Enviar email de recuperação';
      case 'reset':
        return 'Atualizar senha';
    }
  };

  /* =======================
     JSX
  ======================= */

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>

          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">DocMind</h1>
              <p className="text-sm text-muted-foreground">{getTitle()}</p>
            </div>
          </div>

          {(mode === 'login' || mode === 'signup') && (
            <div className="space-y-3 mb-6">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => handleSocialLogin('google')}
                disabled={loading}
              >
                Continuar com Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Ou continue com email
                  </span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <Label>Nome completo</Label>
                <Input 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}

            {mode !== 'reset' && (
              <div>
                <Label>Email</Label>
                <Input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}

            {(mode === 'login' || mode === 'signup' || mode === 'reset') && (
              <div>
                <Label>{mode === 'reset' ? 'Nova senha' : 'Senha'}</Label>
                <Input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}

            {mode === 'reset' && (
              <div>
                <Label>Confirmar nova senha</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}

            {mode === 'login' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-sm text-primary hover:underline"
                  disabled={loading}
                >
                  Esqueceu a senha?
                </button>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {getButtonText()}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            {mode === 'login' && (
              <p className="text-muted-foreground">
                Não tem uma conta?{' '}
                <button
                  onClick={() => setMode('signup')}
                  className="text-primary hover:underline"
                  disabled={loading}
                >
                  Criar conta
                </button>
              </p>
            )}
            {mode === 'signup' && (
              <p className="text-muted-foreground">
                Já tem uma conta?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-primary hover:underline"
                  disabled={loading}
                >
                  Fazer login
                </button>
              </p>
            )}
            {mode === 'forgot' && (
              <p className="text-muted-foreground">
                Lembrou a senha?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-primary hover:underline"
                  disabled={loading}
                >
                  Voltar ao login
                </button>
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Right side */}
      <div className="hidden lg:flex flex-1 bg-gradient-primary items-center justify-center p-8">
        <div className="text-center text-primary-foreground max-w-md">
          <Brain className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">
            Transforme seus documentos com IA
          </h2>
          <p className="opacity-80">
            Resumos, explicações simples e melhorias em segundos.
          </p>
        </div>
      </div>
    </div>
  );
}