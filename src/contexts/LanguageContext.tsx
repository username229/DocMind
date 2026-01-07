import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language, TranslationKey } from '@/lib/i18n';
import { currencies, Currency, getCurrencyByCode, defaultCurrencies, convertPrice, formatPrice as formatPriceUtil, convertFromMZN, basePricesMZN } from '@/lib/currencies';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  currency: Currency;
  setCurrency: (code: string) => void;
  currencies: Currency[];
  formatPrice: (priceUSD: number) => string;
  formatPriceFromMZN: (priceMZN: number) => string;
  basePricesMZN: typeof basePricesMZN;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('docmind-language');
    if (saved === 'pt' || saved === 'en') return saved;
    // Detect browser language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('pt')) return 'pt';
    return 'en';
  });

  const [currencyCode, setCurrencyCode] = useState<string>(() => {
    const saved = localStorage.getItem('docmind-currency');
    if (saved) return saved;
    // Default to MZN for Mozambique, otherwise USD
    return defaultCurrencies.mozambique;
  });

  const currency = getCurrencyByCode(currencyCode) || currencies[0];

  useEffect(() => {
    localStorage.setItem('docmind-language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('docmind-currency', currencyCode);
  }, [currencyCode]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const setCurrency = (code: string) => {
    setCurrencyCode(code);
  };

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  const formatPrice = (priceUSD: number): string => {
    const converted = convertPrice(priceUSD, currency);
    return formatPriceUtil(converted, currency);
  };

  const formatPriceFromMZN = (priceMZN: number): string => {
    if (currency.code === 'MZN') {
      return formatPriceUtil(priceMZN, currency);
    }
    const converted = convertFromMZN(priceMZN, currency);
    return formatPriceUtil(converted, currency);
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      t, 
      currency, 
      setCurrency, 
      currencies,
      formatPrice,
      formatPriceFromMZN,
      basePricesMZN
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
