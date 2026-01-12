import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const plans = {
  monthly: [
    {
      name: 'Grátis',
      nameEn: 'Free',
      priceMZN: 0,
      description: 'Perfeito para experimentar',
      descriptionEn: 'Perfect to try',
      features: [
        { pt: '2 análises de IA no total', en: '2 AI analyses total' },
        { pt: '1 documento', en: '1 document' },
        { pt: 'Upload de até 5 páginas', en: 'Up to 5 pages upload' },
        { pt: 'Resumo e explicação simples', en: 'Summary and simple explanation' },
      ],
      cta: 'Começar Grátis',
      ctaEn: 'Start Free',
      popular: false,
      icon: null,
    },
    {
      name: 'Standard',
      nameEn: 'Standard',
      priceMZN: 85,
      description: 'Todas as funcionalidades essenciais',
      descriptionEn: 'All essential features',
      features: [
        { pt: 'Documentos ilimitados', en: 'Unlimited documents' },
        { pt: 'Todas as 4 análises de IA', en: 'All 4 AI analyses' },
        { pt: 'Histórico ilimitado', en: 'Unlimited history' },
        { pt: 'Upload de até 50 páginas', en: 'Up to 50 pages upload' },
        { pt: 'Sugestões de melhoria', en: 'Improvement suggestions' },
        { pt: 'Versão melhorada do documento', en: 'Improved document version' },
      ],
      cta: 'Assinar Standard',
      ctaEn: 'Subscribe Standard',
      popular: false,
      icon: Sparkles,
    },
    {
      name: 'Pro',
      nameEn: 'Pro',
      priceMZN: 120,
      description: 'Para estudantes e profissionais',
      descriptionEn: 'For students and professionals',
      features: [
        { pt: 'Tudo do Standard', en: 'Everything in Standard' },
        { pt: 'Simulação de provas', en: 'Exam simulation' },
        { pt: 'Geração de provas aleatórias', en: 'Random test generation' },
        { pt: 'Correção automática com feedback', en: 'Auto-correction with feedback' },
        { pt: 'Upload de até 100 páginas', en: 'Up to 100 pages upload' },
        { pt: 'Prioridade no processamento', en: 'Priority processing' },
        { pt: 'Suporte prioritário', en: 'Priority support' },
      ],
      cta: 'Assinar Pro',
      ctaEn: 'Subscribe Pro',
      popular: true,
      icon: Crown,
    },
  ],
  yearly: [
    {
      name: 'Grátis',
      nameEn: 'Free',
      priceMZN: 0,
      description: 'Perfeito para experimentar',
      descriptionEn: 'Perfect to try',
      features: [
        { pt: '2 análises de IA no total', en: '2 AI analyses total' },
        { pt: '1 documento', en: '1 document' },
        { pt: 'Upload de até 5 páginas', en: 'Up to 5 pages upload' },
        { pt: 'Resumo e explicação simples', en: 'Summary and simple explanation' },
      ],
      cta: 'Começar Grátis',
      ctaEn: 'Start Free',
      popular: false,
      icon: null,
    },
    {
      name: 'Standard',
      nameEn: 'Standard',
      priceMZN: 85,
      originalPriceMZN: 10200,
      description: 'Todas as funcionalidades essenciais',
      descriptionEn: 'All essential features',
      features: [
        { pt: 'Documentos ilimitados', en: 'Unlimited documents' },
        { pt: 'Todas as 4 análises de IA', en: 'All 4 AI analyses' },
        { pt: 'Histórico ilimitado', en: 'Unlimited history' },
        { pt: 'Upload de até 50 páginas', en: 'Up to 50 pages upload' },
        { pt: 'Sugestões de melhoria', en: 'Improvement suggestions' },
        { pt: 'Versão melhorada do documento', en: 'Improved document version' },
        { pt: '2 meses grátis', en: '2 months free' },
      ],
      cta: 'Assinar Standard Anual',
      ctaEn: 'Subscribe Standard Yearly',
      popular: false,
      icon: Sparkles,
    },
    {
      name: 'Pro',
      nameEn: 'Pro',
      priceMZN: 120,
      originalPriceMZN: 120,
      description: 'Para estudantes e profissionais',
      descriptionEn: 'For students and professionals',
      features: [
        { pt: 'Tudo do Standard', en: 'Everything in Standard' },
        { pt: 'Simulação de provas', en: 'Exam simulation' },
        { pt: 'Geração de provas aleatórias', en: 'Random test generation' },
        { pt: 'Correção automática com feedback', en: 'Auto-correction with feedback' },
        { pt: 'Upload de até 100 páginas', en: 'Up to 100 pages upload' },
        { pt: 'Prioridade no processamento', en: 'Priority processing' },
        { pt: 'Suporte prioritário', en: 'Priority support' },
        { pt: '2 meses grátis', en: '2 months free' },
      ],
      cta: 'Assinar Pro Anual',
      ctaEn: 'Subscribe Pro Yearly',
      popular: true,
      icon: Crown,
    },
  ],
};

export function PricingSection() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const { language, formatPriceFromMZN } = useLanguage();
  const isEnglish = language === 'en';

  const currentPlans = plans[billingPeriod];

  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 text-foreground">
            {isEnglish ? 'Simple and transparent pricing' : 'Planos simples e transparentes'}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {isEnglish ? 'Choose the ideal plan for your needs' : 'Escolha o plano ideal para suas necessidades'}
          </p>
        </motion.div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              billingPeriod === 'monthly'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {isEnglish ? 'Monthly' : 'Mensal'}
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
              billingPeriod === 'yearly'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {isEnglish ? 'Yearly' : 'Anual'}
            <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
              -17%
            </span>
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {currentPlans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative bg-card rounded-2xl p-6 border ${
                plan.popular ? 'border-primary shadow-lg scale-105' : 'border-border'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                    {isEnglish ? 'Most Popular' : 'Mais Popular'}
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {plan.icon && <plan.icon className="w-5 h-5 text-primary" />}
                  <h3 className="font-display text-xl font-bold text-foreground">
                    {isEnglish ? plan.nameEn : plan.name}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {isEnglish ? plan.descriptionEn : plan.description}
                </p>
                <div className="flex items-baseline justify-center gap-1">
                  {plan.originalPriceMZN && (
                    <span className="text-base text-muted-foreground line-through mr-2">
                      {formatPriceFromMZN(plan.originalPriceMZN)}
                    </span>
                  )}
                  <span className="font-display text-4xl font-bold text-foreground">
                    {plan.priceMZN === 0 ? (isEnglish ? 'Free' : 'Grátis') : formatPriceFromMZN(plan.priceMZN)}
                  </span>
                  {plan.priceMZN > 0 && (
                    <span className="text-sm text-muted-foreground">
                      /{billingPeriod === 'monthly' ? (isEnglish ? 'mo' : 'mês') : (isEnglish ? 'yr' : 'ano')}
                    </span>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature.pt} className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-4 h-4 rounded-full bg-success/10 flex items-center justify-center mt-0.5">
                      <Check className="w-2.5 h-2.5 text-success" />
                    </div>
                    <span className="text-sm text-foreground">{isEnglish ? feature.en : feature.pt}</span>
                  </li>
                ))}
              </ul>

              <Button 
                asChild 
                variant={plan.popular ? 'default' : 'outline'} 
                size="lg" 
                className="w-full"
              >
                <Link to="/auth">{isEnglish ? plan.ctaEn : plan.cta}</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}