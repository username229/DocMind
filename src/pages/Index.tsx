import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, FileText, Lightbulb, Target, Wand2, Zap, Check, Sparkles, Clock, Shield, Crown, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageCurrencySelector } from '@/components/LanguageCurrencySelector';
import { PaymentModal } from '@/components/PaymentModal';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const { user, signOut } = useAuth();
  const { t, formatPriceFromMZN, basePricesMZN } = useLanguage();
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'standard' | 'pro'>('pro');
  const [currentPlan, setCurrentPlan] = useState<'free' | 'standard' | 'pro'>('free');

  const standardPrice = formatPriceFromMZN(basePricesMZN.standard);
  const proPrice = formatPriceFromMZN(basePricesMZN.pro);

  const displayName = useMemo(() => {
    if (!user) return '';
    const name =
      (user.user_metadata?.full_name as string | undefined) ||
      (user.user_metadata?.name as string | undefined) ||
      user.email?.split('@')[0];
    return name || 'Usuário';
  }, [user]);

  const planConfig = useMemo(() => ({
    free: {
      label: 'Grátis',
      description: 'Ideal para experimentar',
      features: [
        '2 análises de IA no total',
        '1 documento',
        'Upload até 5 páginas',
        'IA básica: GPT-4o mini',
      ],
    },
    standard: {
      label: 'Standard',
      description: 'Para produtividade diária',
      features: [
        'Documentos ilimitados',
        'Resumo, explicação e sugestões',
        'Upload até 50 páginas',
        'IA avançada: GPT-4o mini e Gemini 1.5 Flash',
      ],
    },
    pro: {
      label: 'Pro',
      description: 'Máxima performance com IA',
      features: [
        'Tudo do Standard',
        'Simulação de provas com correção',
        'Upload até 100 páginas',
        'IA premium: GPT-4o, Claude 3.5 Sonnet e Gemini 1.5 Pro',
      ],
    },
  }), []);

  useEffect(() => {
    const fetchPlan = async () => {
      if (!user) {
        setCurrentPlan('free');
        return;
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('plan')
        .single();

      if (error) {
        console.error('Erro ao carregar plano:', error);
        return;
      }

      const plan = data?.plan;
      if (plan === 'standard' || plan === 'pro' || plan === 'free') {
        setCurrentPlan(plan);
      } else {
        setCurrentPlan('free');
      }
    };

    fetchPlan();
  }, [user]);

  const handleSubscribe = (plan: 'standard' | 'pro') => {
    setSelectedPlan(plan);
    if (user) {
      setPaymentModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">DocMind</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-600 hover:text-slate-900 transition-colors">{t('features')}</a>
              <a href="#pricing" className="text-slate-600 hover:text-slate-900 transition-colors">{t('pricing')}</a>
            </nav>

            <div className="flex items-center gap-3">
              <LanguageCurrencySelector />
              {user ? (
                <>
                  <Button asChild variant="ghost">
                    <Link to="/dashboard">{t('dashboard')}</Link>
                  </Button>
                  <div className="hidden md:flex items-center gap-2 text-sm text-slate-600">
                    <span>Olá, {displayName}</span>
                    <span className="rounded-full border border-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
                      Plano {planConfig[currentPlan].label}
                    </span>
                  </div>
                  <Button variant="outline" onClick={signOut}>{t('logout')}</Button>
                </>
              ) : (
                <>
                  <Button asChild variant="ghost">
                    <Link to="/auth">{t('login')}</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/auth">{t('startFree')}</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          {user && (
            <div className="mb-10 rounded-3xl border border-slate-200 bg-white/90 p-6 text-left shadow-sm">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-slate-500">Bem-vindo de volta</p>
                  <h2 className="text-2xl font-bold text-slate-900">{displayName}</h2>
                  <p className="text-sm text-slate-600">
                    Plano atual: <span className="font-semibold">{planConfig[currentPlan].label}</span> · {planConfig[currentPlan].description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button asChild size="lg">
                    <Link to="/dashboard">Ir para o painel</Link>
                  </Button>
                  {currentPlan !== 'pro' && (
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => handleSubscribe('pro')}
                    >
                      Mudar para Pro
                    </Button>
                  )}
                  {(currentPlan === 'pro' || currentPlan === 'free') && (
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={() => handleSubscribe('standard')}
                    >
                      Mudar para Standard
                    </Button>
                  )}
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {planConfig[currentPlan].features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Check className="w-3 h-3 text-emerald-600" />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 mb-8">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">{t('tagline')}</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
            {t('heroTitle1')}{' '}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">{t('heroTitle2')}</span>
            {' '}{t('heroTitle3')}
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 mb-10 max-w-2xl mx-auto">
            {t('heroDescription')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Button asChild size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-200 h-14 px-8 text-lg">
                <Link to="/dashboard">
                  <Zap className="w-5 h-5" />
                  Ir para o painel
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-200 h-14 px-8 text-lg">
                <Link to="/auth">
                  <Zap className="w-5 h-5" />
                  {t('startFree')}
                </Link>
              </Button>
            )}
            <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg">
              <a href="#features">{t('learnMore')}</a>
            </Button>
          </div>

          <div className="mt-16 flex items-center justify-center gap-8 text-slate-500">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <span className="text-sm">+10k {t('documents')}</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-slate-300" />
            <div className="hidden sm:flex items-center gap-2">
              <Brain className="w-5 h-5" />
              <span className="text-sm">{t('latestAI')}</span>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { icon: '📝', label: t('summary') },
              { icon: '💡', label: t('explanation') },
              { icon: '🎯', label: t('suggestions') },
              { icon: '✨', label: t('improvedVersion') },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-2xl p-6 text-center shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <span className="text-3xl mb-3 block">{item.icon}</span>
                <span className="font-medium text-slate-900">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">{t('featuresTitle')}</h2>
            <p className="text-xl text-slate-600">{t('featuresSubtitle')}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { icon: FileText, title: t('smartSummary'), desc: t('smartSummaryDesc'), color: 'text-indigo-500', bg: 'bg-indigo-50' },
              { icon: Lightbulb, title: t('simpleExplanation'), desc: t('simpleExplanationDesc'), color: 'text-amber-500', bg: 'bg-amber-50' },
              { icon: Target, title: t('improvementSuggestions'), desc: t('improvementSuggestionsDesc'), color: 'text-emerald-500', bg: 'bg-emerald-50' },
              { icon: Wand2, title: t('improvedVersionTitle'), desc: t('improvedVersionDesc'), color: 'text-purple-500', bg: 'bg-purple-50' },
              { icon: GraduationCap, title: 'Simulação de Provas', desc: 'Gere provas aleatórias e receba correção automática com feedback detalhado (Pro)', color: 'text-rose-500', bg: 'bg-rose-50' },
              { icon: Shield, title: t('securePrivate'), desc: t('securePrivateDesc'), color: 'text-blue-500', bg: 'bg-blue-50' },
            ].map((f) => (
              <div key={f.title} className="bg-slate-50 rounded-2xl p-8 hover:shadow-lg transition-all hover:-translate-y-1">
                <div className={`inline-flex p-3 rounded-xl ${f.bg} mb-4`}>
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">{t('pricingTitle')}</h2>
            <p className="text-xl text-slate-600">{t('pricingSubtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('free')}</h3>
                <p className="text-sm text-slate-500 mb-4">Perfeito para experimentar</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-slate-900">Grátis</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  '2 análises de IA no total',
                  '1 documento',
                  'Upload até 5 páginas',
                  'Resumo e explicação',
                  'IA básica: GPT-4o mini',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Check className="w-3 h-3 text-emerald-600" />
                    </div>
                    <span className="text-sm text-slate-700">{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild={!user}
                size="lg"
                className="w-full"
                variant="outline"
                disabled={user && currentPlan === 'free'}
              >
                {user ? (
                  <span>{currentPlan === 'free' ? 'Plano atual' : 'Voltar ao plano grátis'}</span>
                ) : (
                  <Link to="/auth">{t('startFree')}</Link>
                )}
              </Button>
            </div>

            {/* Standard Plan */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-2xl font-bold text-slate-900">Standard</h3>
                </div>
                <p className="text-sm text-slate-500 mb-4">Todas as funcionalidades essenciais</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-slate-900">{standardPrice}</span>
                  <span className="text-slate-500 ml-1">/mês</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Documentos ilimitados',
                  'Todas as 4 análises de IA',
                  'Histórico ilimitado',
                  'Upload até 50 páginas',
                  'Sugestões de melhoria',
                  'Versão melhorada',
                  'IA avançada: GPT-4o mini e Gemini 1.5 Flash',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Check className="w-3 h-3 text-emerald-600" />
                    </div>
                    <span className="text-sm text-slate-700">{f}</span>
                  </li>
                ))}
              </ul>
              <Button 
                size="lg" 
                className="w-full"
                variant="outline"
                onClick={() => handleSubscribe('standard')}
                asChild={!user}
                disabled={user && currentPlan === 'standard'}
              >
                {user ? (
                  <span>{currentPlan === 'standard' ? 'Plano atual' : 'Assinar Standard'}</span>
                ) : (
                  <Link to="/auth">Assinar Standard</Link>
                )}
              </Button>
            </div>

            {/* Pro Plan */}
            <div className="bg-white rounded-3xl p-8 ring-2 ring-indigo-500 shadow-xl relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Crown className="w-4 h-4" /> {t('mostPopular')}
                </span>
              </div>
              <div className="text-center mb-8 pt-2">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Crown className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-2xl font-bold text-slate-900">{t('pro')}</h3>
                </div>
                <p className="text-sm text-slate-500 mb-4">Para estudantes e profissionais</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-slate-900">{proPrice}</span>
                  <span className="text-slate-500 ml-1">/mês</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Tudo do Standard',
                  '📚 Simulação de provas',
                  '🎲 Provas aleatórias',
                  '✅ Correção automática',
                  '💬 Feedback detalhado',
                  'Upload até 100 páginas',
                  'Suporte prioritário',
                  'IA premium: GPT-4o, Claude 3.5 Sonnet e Gemini 1.5 Pro',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Check className="w-3 h-3 text-emerald-600" />
                    </div>
                    <span className="text-sm text-slate-700">{f}</span>
                  </li>
                ))}
              </ul>
              <Button 
                size="lg" 
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                onClick={() => handleSubscribe('pro')}
                asChild={!user}
                disabled={user && currentPlan === 'pro'}
              >
                {user ? (
                  <span>{currentPlan === 'pro' ? 'Plano atual' : t('subscribePro')}</span>
                ) : (
                  <Link to="/auth">{t('subscribePro')}</Link>
                )}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 bg-white">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">DocMind</span>
          </Link>
          <p className="text-slate-500 text-sm">© 2025 DocMind. {t('allRightsReserved')}</p>
        </div>
      </footer>

      {/* Payment Modal */}
      <PaymentModal 
        open={paymentModalOpen} 
        onOpenChange={setPaymentModalOpen}
        plan={selectedPlan}
        billingPeriod="monthly"
      />
    </div>
  );
};

export default Index;
