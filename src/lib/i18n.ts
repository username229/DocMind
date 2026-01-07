export type Language = 'pt' | 'en';

export const translations = {
  pt: {
    // Header
    features: 'Funcionalidades',
    pricing: 'Preços',
    dashboard: 'Dashboard',
    logout: 'Sair',
    login: 'Entrar',
    startFree: 'Começar Grátis',
    
    // Hero
    tagline: 'Análise inteligente de documentos',
    heroTitle1: 'Transforme seus',
    heroTitle2: 'documentos',
    heroTitle3: 'com IA',
    heroDescription: 'Faça upload de PDFs ou textos e receba resumos, explicações simples, sugestões de melhoria e versões aprimoradas em segundos.',
    learnMore: 'Saiba Mais',
    documents: 'documentos',
    latestAI: 'IA de última geração',
    
    // Features labels
    summary: 'Resumo',
    explanation: 'Explicação',
    suggestions: 'Sugestões',
    improvedVersion: 'Versão Melhorada',
    
    // Features section
    featuresTitle: 'Tudo que você precisa',
    featuresSubtitle: 'Ferramentas poderosas de IA para transformar seus documentos',
    smartSummary: 'Resumo Inteligente',
    smartSummaryDesc: 'Transforme documentos longos em resumos concisos.',
    simpleExplanation: 'Explicação Simples',
    simpleExplanationDesc: 'Explicações claras para qualquer idade.',
    improvementSuggestions: 'Sugestões de Melhoria',
    improvementSuggestionsDesc: 'Identifique pontos fracos e melhore seu texto.',
    improvedVersionTitle: 'Versão Melhorada',
    improvedVersionDesc: 'Gere uma versão aprimorada automaticamente.',
    completeHistory: 'Histórico Completo',
    completeHistoryDesc: 'Acesse seus documentos a qualquer momento.',
    securePrivate: 'Seguro e Privado',
    securePrivateDesc: 'Seus documentos são processados com segurança.',
    
    // Pricing
    pricingTitle: 'Planos simples',
    pricingSubtitle: 'Escolha o plano ideal para suas necessidades',
    free: 'Grátis',
    pro: 'Pro',
    mostPopular: 'Mais Popular',
    perMonth: '/mês',
    docsPerMonth: 'documentos/mês',
    aiAnalyses: 'análises de IA',
    historyDays: 'Histórico de 30 dias',
    unlimitedDocs: 'Documentos ilimitados',
    unlimitedHistory: 'Histórico ilimitado',
    prioritySupport: 'Suporte prioritário',
    subscribePro: 'Assinar Pro',
    
    // Footer
    allRightsReserved: 'Todos os direitos reservados.',
    
    // Auth
    createAccount: 'Criar Conta',
    signIn: 'Entrar',
    email: 'Email',
    password: 'Senha',
    fullName: 'Nome Completo',
    noAccount: 'Não tem conta?',
    hasAccount: 'Já tem conta?',
    register: 'Cadastrar',
    
    // Dashboard
    myDocuments: 'Meus Documentos',
    newDocument: 'Novo Documento',
    noDocuments: 'Nenhum documento ainda',
    uploadFirst: 'Faça upload do seu primeiro documento para começar.',
    
    // Document
    uploadDocument: 'Fazer upload de documento',
    pasteText: 'Ou cole seu texto aqui',
    analyze: 'Analisar com IA',
    analyzing: 'Analisando...',
    
    // Payment
    selectPaymentMethod: 'Selecione o método de pagamento',
    payWithDPO: 'Pagar com DPO Group',
    payWithPayGate: 'Pagar com PayGate',
    selectCurrency: 'Moeda',
  },
  en: {
    // Header
    features: 'Features',
    pricing: 'Pricing',
    dashboard: 'Dashboard',
    logout: 'Logout',
    login: 'Login',
    startFree: 'Start Free',
    
    // Hero
    tagline: 'Intelligent document analysis',
    heroTitle1: 'Transform your',
    heroTitle2: 'documents',
    heroTitle3: 'with AI',
    heroDescription: 'Upload PDFs or text and receive summaries, simple explanations, improvement suggestions and enhanced versions in seconds.',
    learnMore: 'Learn More',
    documents: 'documents',
    latestAI: 'Latest AI technology',
    
    // Features labels
    summary: 'Summary',
    explanation: 'Explanation',
    suggestions: 'Suggestions',
    improvedVersion: 'Improved Version',
    
    // Features section
    featuresTitle: 'Everything you need',
    featuresSubtitle: 'Powerful AI tools to transform your documents',
    smartSummary: 'Smart Summary',
    smartSummaryDesc: 'Transform long documents into concise summaries.',
    simpleExplanation: 'Simple Explanation',
    simpleExplanationDesc: 'Clear explanations for any age.',
    improvementSuggestions: 'Improvement Suggestions',
    improvementSuggestionsDesc: 'Identify weak points and improve your text.',
    improvedVersionTitle: 'Improved Version',
    improvedVersionDesc: 'Automatically generate an enhanced version.',
    completeHistory: 'Complete History',
    completeHistoryDesc: 'Access your documents anytime.',
    securePrivate: 'Secure & Private',
    securePrivateDesc: 'Your documents are processed securely.',
    
    // Pricing
    pricingTitle: 'Simple pricing',
    pricingSubtitle: 'Choose the ideal plan for your needs',
    free: 'Free',
    pro: 'Pro',
    mostPopular: 'Most Popular',
    perMonth: '/month',
    docsPerMonth: 'documents/month',
    aiAnalyses: 'AI analyses',
    historyDays: '30-day history',
    unlimitedDocs: 'Unlimited documents',
    unlimitedHistory: 'Unlimited history',
    prioritySupport: 'Priority support',
    subscribePro: 'Subscribe Pro',
    
    // Footer
    allRightsReserved: 'All rights reserved.',
    
    // Auth
    createAccount: 'Create Account',
    signIn: 'Sign In',
    email: 'Email',
    password: 'Password',
    fullName: 'Full Name',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    register: 'Register',
    
    // Dashboard
    myDocuments: 'My Documents',
    newDocument: 'New Document',
    noDocuments: 'No documents yet',
    uploadFirst: 'Upload your first document to get started.',
    
    // Document
    uploadDocument: 'Upload document',
    pasteText: 'Or paste your text here',
    analyze: 'Analyze with AI',
    analyzing: 'Analyzing...',
    
    // Payment
    selectPaymentMethod: 'Select payment method',
    payWithDPO: 'Pay with DPO Group',
    payWithPayGate: 'Pay with PayGate',
    selectCurrency: 'Currency',
  },
};

export type TranslationKey = keyof typeof translations.en;
