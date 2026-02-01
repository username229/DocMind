import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, FileText, Lightbulb, Target, Wand2, Zap, Check, Sparkles, Clock, Shield, Crown, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageCurrencySelector } from '@/components/LanguageCurrencySelector';
import { PaymentModal } from '@/components/PaymentModal';

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

const Index = () => {
  const { user, signOut } = useAuth();
  const { t, formatPrice, basePricesUSD } = useLanguage();
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'standard' | 'pro'>('pro');

  const standardPrice = formatPrice(basePricesUSD.standard);
  const proPrice = formatPrice(basePricesUSD.pro);

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
            <Button asChild size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-200 h-14 px-8 text-lg">
              <Link to="/auth">
                <Zap className="w-5 h-5" />
                {t('startFree')}
              </Link>
            </Button>
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
              { icon: GraduationCap, title: t('proPlanFeature3').replace('📚 ', ''), desc: t('proPlanFeature3').replace('📚 ', '') + ' - Disponível em todos os planos', color: 'text-rose-500', bg: 'bg-rose-50' },
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
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('freePlanTitle')}</h3>
                <p className="text-sm text-slate-500 mb-4">{t('freePlanDesc')}</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-slate-900">{t('free')}</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  t('freePlanFeature1'),
                  t('freePlanFeature2'),
                  t('freePlanFeature3'),
                  t('freePlanFeature4'),
                  t('freePlanFeature5'),
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Check className="w-3 h-3 text-emerald-600" />
                    </div>
                    <span className="text-sm text-slate-700">{f}</span>
                  </li>
                ))}
              </ul>
              <Button asChild size="lg" className="w-full" variant="outline">
                <Link to="/auth">{t('startFree')}</Link>
              </Button>
            </div>

            {/* Standard Plan */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-2xl font-bold text-slate-900">{t('standardPlanTitle')}</h3>
                </div>
                <p className="text-sm text-slate-500 mb-4">{t('standardPlanDesc')}</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-slate-900">{standardPrice}</span>
                  <span className="text-slate-500 ml-1">{t('perMonth')}</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  t('standardPlanFeature1'),
                  t('standardPlanFeature2'),
                  t('standardPlanFeature3'),
                  t('standardPlanFeature4'),
                  t('standardPlanFeature5'),
                  t('standardPlanFeature6'),
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
              >
                {user ? (
                  <span>{t('subscribeStandard')}</span>
                ) : (
                  <Link to="/auth">{t('subscribeStandard')}</Link>
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
                  <h3 className="text-2xl font-bold text-slate-900">{t('proPlanTitle')}</h3>
                </div>
                <p className="text-sm text-slate-500 mb-4">{t('proPlanDesc')}</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-4xl font-bold text-slate-900">{proPrice}</span>
                  <span className="text-slate-500 ml-1">{t('perMonth')}</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  t('proPlanFeature1'),
                  t('proPlanFeature2'),
                  t('proPlanFeature3'),
                  t('proPlanFeature4'),
                  t('proPlanFeature5'),
                  t('proPlanFeature6'),
                  t('proPlanFeature7'),
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
              >
                {user ? (
                  <span>{t('subscribePro')}</span>
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