import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'pt' | 'en';
type Currency = 'MZN' | 'USD' | 'BRL' | 'EUR';

interface LanguageContextType {
  language: Language;
  currency: Currency;
  setLanguage: (lang: Language) => void;
  setCurrency: (curr: Currency) => void;
  t: (key: string) => string;
  formatPriceFromMZN: (priceInMZN: number) => string;
  basePricesMZN: {
    standard: number;
    pro: number;
  };
}

// ============================================================
// 💰 PREÇOS ATUALIZADOS: $5 Standard / $9.99 Pro
// ============================================================

// Preços base em MZN (Metical Moçambicano)
// Taxa de conversão: 1 USD = 63 MZN
export const basePricesMZN = {
  standard: 315,  // $5.00 USD
  pro: 630        // $9.99 USD
};

// Taxas de conversão para outras moedas
const exchangeRates = {
  MZN: 1,         // Base
  USD: 0.01587,   // 1 MZN = 0.01587 USD
  BRL: 0.079,     // 1 MZN = 0.079 BRL  
  EUR: 0.0146,    // 1 MZN = 0.0146 EUR
};

// Símbolos de moeda
const currencySymbols = {
  MZN: 'MT',
  USD: '$',
  BRL: 'R$',
  EUR: '€'
};

// Função para formatar preços
export const formatPrice = (priceInMZN: number, currency: Currency): string => {
  const rate = exchangeRates[currency];
  const convertedPrice = priceInMZN * rate;
  const symbol = currencySymbols[currency];
  
  // Arredondar para valores "bonitos"
  let displayPrice;
  
  if (currency === 'USD' || currency === 'EUR') {
    // USD e EUR: arredondar para centavos
    displayPrice = Math.ceil(convertedPrice * 100) / 100;
  } else if (currency === 'BRL') {
    // BRL: arredondar para múltiplos de 5
    displayPrice = Math.ceil(convertedPrice / 5) * 5;
  } else {
    // MZN: arredondar para inteiro
    displayPrice = Math.ceil(convertedPrice);
  }
  
  return `${symbol}${displayPrice.toFixed(currency === 'MZN' ? 0 : 2)}`;
};

// Traduções
const translations = {
  pt: {
    // Navigation
    features: 'Recursos',
    pricing: 'Preços',
    dashboard: 'Dashboard',
    login: 'Entrar',
    logout: 'Sair',
    startFree: 'Começar Grátis',
    
    // Hero section
    tagline: 'Análise Inteligente de Documentos',
    heroTitle1: 'Transforme',
    heroTitle2: 'documentos',
    heroTitle3: 'em conhecimento',
    heroDescription: 'Análise profissional de documentos com IA. Obtenha resumos, explicações simples e sugestões de melhoria instantaneamente.',
    learnMore: 'Saiba Mais',
    
    // Features
    documents: 'documentos',
    latestAI: 'IA de última geração',
    summary: 'Resumo',
    explanation: 'Explicação',
    suggestions: 'Sugestões',
    improvedVersion: 'Versão Melhorada',
    
    // Feature cards
    featuresTitle: 'Recursos Poderosos',
    featuresSubtitle: 'Tudo que você precisa para analisar documentos profissionalmente',
    smartSummary: 'Resumo Inteligente',
    smartSummaryDesc: 'Extraia os pontos principais de qualquer documento em segundos',
    simpleExplanation: 'Explicação Simples',
    simpleExplanationDesc: 'Entenda conceitos complexos com explicações claras e acessíveis',
    improvementSuggestions: 'Sugestões de Melhoria',
    improvementSuggestionsDesc: 'Receba feedback construtivo para aprimorar seus documentos',
    improvedVersionTitle: 'Versão Melhorada',
    improvedVersionDesc: 'Obtenha uma versão otimizada do seu documento com correções e melhorias',
    securePrivate: 'Seguro e Privado',
    securePrivateDesc: 'Seus documentos são processados com segurança e nunca compartilhados',
    
    // Pricing
    pricingTitle: 'Planos e Preços',
    pricingSubtitle: 'Escolha o plano ideal para suas necessidades',
    free: 'Grátis',
    standard: 'Standard',
    pro: 'Pro',
    mostPopular: 'Mais Popular',
    subscribePro: 'Assinar Pro',
    
    // Footer
    allRightsReserved: 'Todos os direitos reservados',
  },
  en: {
    // Navigation
    features: 'Features',
    pricing: 'Pricing',
    dashboard: 'Dashboard',
    login: 'Sign In',
    logout: 'Sign Out',
    startFree: 'Start Free',
    
    // Hero section
    tagline: 'Intelligent Document Analysis',
    heroTitle1: 'Transform',
    heroTitle2: 'documents',
    heroTitle3: 'into knowledge',
    heroDescription: 'Professional document analysis with AI. Get summaries, simple explanations, and improvement suggestions instantly.',
    learnMore: 'Learn More',
    
    // Features
    documents: 'documents',
    latestAI: 'Latest AI',
    summary: 'Summary',
    explanation: 'Explanation',
    suggestions: 'Suggestions',
    improvedVersion: 'Improved Version',
    
    // Feature cards
    featuresTitle: 'Powerful Features',
    featuresSubtitle: 'Everything you need to analyze documents professionally',
    smartSummary: 'Smart Summary',
    smartSummaryDesc: 'Extract key points from any document in seconds',
    simpleExplanation: 'Simple Explanation',
    simpleExplanationDesc: 'Understand complex concepts with clear and accessible explanations',
    improvementSuggestions: 'Improvement Suggestions',
    improvementSuggestionsDesc: 'Get constructive feedback to enhance your documents',
    improvedVersionTitle: 'Improved Version',
    improvedVersionDesc: 'Get an optimized version of your document with corrections and improvements',
    securePrivate: 'Secure & Private',
    securePrivateDesc: 'Your documents are processed securely and never shared',
    
    // Pricing
    pricingTitle: 'Plans & Pricing',
    pricingSubtitle: 'Choose the perfect plan for your needs',
    free: 'Free',
    standard: 'Standard',
    pro: 'Pro',
    mostPopular: 'Most Popular',
    subscribePro: 'Subscribe Pro',
    
    // Footer
    allRightsReserved: 'All rights reserved',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('pt');
  const [currency, setCurrency] = useState<Currency>('USD');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.pt] || key;
  };

  const formatPriceFromMZN = (priceInMZN: number): string => {
    return formatPrice(priceInMZN, currency);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        currency,
        setLanguage,
        setCurrency,
        t,
        formatPriceFromMZN,
        basePricesMZN,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}