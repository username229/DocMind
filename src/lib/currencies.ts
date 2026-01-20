export interface Currency {
  code: string;
  symbol: string;
  name: string;
  country: string;
  flag: string;
  // Conversion rate to USD (approximate)
  rateToUSD: number;
}

export const currencies: Currency[] = [
  // Africa
  { code: 'MZN', symbol: 'MT', name: 'Metical', country: 'Moçambique', flag: '🇲🇿', rateToUSD: 0.016 },
  { code: 'ZAR', symbol: 'R', name: 'Rand', country: 'South Africa', flag: '🇿🇦', rateToUSD: 0.055 },
  { code: 'KES', symbol: 'KSh', name: 'Shilling', country: 'Kenya', flag: '🇰🇪', rateToUSD: 0.0078 },
  { code: 'NGN', symbol: '₦', name: 'Naira', country: 'Nigeria', flag: '🇳🇬', rateToUSD: 0.00065 },
  { code: 'GHS', symbol: 'GH₵', name: 'Cedi', country: 'Ghana', flag: '🇬🇭', rateToUSD: 0.083 },
  { code: 'UGX', symbol: 'USh', name: 'Shilling', country: 'Uganda', flag: '🇺🇬', rateToUSD: 0.00027 },
  { code: 'TZS', symbol: 'TSh', name: 'Shilling', country: 'Tanzania', flag: '🇹🇿', rateToUSD: 0.00039 },
  { code: 'RWF', symbol: 'FRw', name: 'Franc', country: 'Rwanda', flag: '🇷🇼', rateToUSD: 0.00077 },
  { code: 'ZMW', symbol: 'ZK', name: 'Kwacha', country: 'Zambia', flag: '🇿🇲', rateToUSD: 0.039 },
  { code: 'BWP', symbol: 'P', name: 'Pula', country: 'Botswana', flag: '🇧🇼', rateToUSD: 0.074 },
  { code: 'MWK', symbol: 'MK', name: 'Kwacha', country: 'Malawi', flag: '🇲🇼', rateToUSD: 0.00058 },
  { code: 'AOA', symbol: 'Kz', name: 'Kwanza', country: 'Angola', flag: '🇦🇴', rateToUSD: 0.0012 },
  { code: 'EGP', symbol: 'E£', name: 'Pound', country: 'Egypt', flag: '🇪🇬', rateToUSD: 0.032 },
  { code: 'MAD', symbol: 'DH', name: 'Dirham', country: 'Morocco', flag: '🇲🇦', rateToUSD: 0.10 },
  
  // Americas
  { code: 'USD', symbol: '$', name: 'Dollar', country: 'United States', flag: '🇺🇸', rateToUSD: 1 },
  { code: 'BRL', symbol: 'R$', name: 'Real', country: 'Brasil', flag: '🇧🇷', rateToUSD: 0.20 },
  { code: 'CAD', symbol: 'C$', name: 'Dollar', country: 'Canada', flag: '🇨🇦', rateToUSD: 0.74 },
  { code: 'MXN', symbol: 'MX$', name: 'Peso', country: 'Mexico', flag: '🇲🇽', rateToUSD: 0.059 },
  { code: 'ARS', symbol: 'AR$', name: 'Peso', country: 'Argentina', flag: '🇦🇷', rateToUSD: 0.0012 },
  { code: 'COP', symbol: 'CO$', name: 'Peso', country: 'Colombia', flag: '🇨🇴', rateToUSD: 0.00024 },
  { code: 'CLP', symbol: 'CL$', name: 'Peso', country: 'Chile', flag: '🇨🇱', rateToUSD: 0.0011 },
  { code: 'PEN', symbol: 'S/', name: 'Sol', country: 'Peru', flag: '🇵🇪', rateToUSD: 0.27 },
  
  // Europe
  { code: 'EUR', symbol: '€', name: 'Euro', country: 'European Union', flag: '🇪🇺', rateToUSD: 1.08 },
  { code: 'GBP', symbol: '£', name: 'Pound', country: 'United Kingdom', flag: '🇬🇧', rateToUSD: 1.27 },
  { code: 'CHF', symbol: 'Fr', name: 'Franc', country: 'Switzerland', flag: '🇨🇭', rateToUSD: 1.13 },
  { code: 'SEK', symbol: 'kr', name: 'Krona', country: 'Sweden', flag: '🇸🇪', rateToUSD: 0.095 },
  { code: 'NOK', symbol: 'kr', name: 'Krone', country: 'Norway', flag: '🇳🇴', rateToUSD: 0.091 },
  { code: 'DKK', symbol: 'kr', name: 'Krone', country: 'Denmark', flag: '🇩🇰', rateToUSD: 0.14 },
  { code: 'PLN', symbol: 'zł', name: 'Złoty', country: 'Poland', flag: '🇵🇱', rateToUSD: 0.25 },
  { code: 'CZK', symbol: 'Kč', name: 'Koruna', country: 'Czech Republic', flag: '🇨🇿', rateToUSD: 0.043 },
  
  // Asia & Oceania
  { code: 'JPY', symbol: '¥', name: 'Yen', country: 'Japan', flag: '🇯🇵', rateToUSD: 0.0067 },
  { code: 'CNY', symbol: '¥', name: 'Yuan', country: 'China', flag: '🇨🇳', rateToUSD: 0.14 },
  { code: 'INR', symbol: '₹', name: 'Rupee', country: 'India', flag: '🇮🇳', rateToUSD: 0.012 },
  { code: 'KRW', symbol: '₩', name: 'Won', country: 'South Korea', flag: '🇰🇷', rateToUSD: 0.00074 },
  { code: 'SGD', symbol: 'S$', name: 'Dollar', country: 'Singapore', flag: '🇸🇬', rateToUSD: 0.74 },
  { code: 'HKD', symbol: 'HK$', name: 'Dollar', country: 'Hong Kong', flag: '🇭🇰', rateToUSD: 0.13 },
  { code: 'TWD', symbol: 'NT$', name: 'Dollar', country: 'Taiwan', flag: '🇹🇼', rateToUSD: 0.031 },
  { code: 'THB', symbol: '฿', name: 'Baht', country: 'Thailand', flag: '🇹🇭', rateToUSD: 0.029 },
  { code: 'MYR', symbol: 'RM', name: 'Ringgit', country: 'Malaysia', flag: '🇲🇾', rateToUSD: 0.22 },
  { code: 'IDR', symbol: 'Rp', name: 'Rupiah', country: 'Indonesia', flag: '🇮🇩', rateToUSD: 0.000063 },
  { code: 'PHP', symbol: '₱', name: 'Peso', country: 'Philippines', flag: '🇵🇭', rateToUSD: 0.018 },
  { code: 'VND', symbol: '₫', name: 'Dong', country: 'Vietnam', flag: '🇻🇳', rateToUSD: 0.000040 },
  { code: 'AUD', symbol: 'A$', name: 'Dollar', country: 'Australia', flag: '🇦🇺', rateToUSD: 0.65 },
  { code: 'NZD', symbol: 'NZ$', name: 'Dollar', country: 'New Zealand', flag: '🇳🇿', rateToUSD: 0.60 },
  
  // Middle East
  { code: 'AED', symbol: 'د.إ', name: 'Dirham', country: 'UAE', flag: '🇦🇪', rateToUSD: 0.27 },
  { code: 'SAR', symbol: '﷼', name: 'Riyal', country: 'Saudi Arabia', flag: '🇸🇦', rateToUSD: 0.27 },
  { code: 'ILS', symbol: '₪', name: 'Shekel', country: 'Israel', flag: '🇮🇱', rateToUSD: 0.27 },
  { code: 'TRY', symbol: '₺', name: 'Lira', country: 'Turkey', flag: '🇹🇷', rateToUSD: 0.031 },
];

// Base prices in USD
export const basePricesUSD = {
  free: 0,
  standard: 5,
  pro: 9.99,
};

// For backwards compatibility - convert USD to MZN
export const basePricesMZN = {
  free: 0,
  standard: Math.round(basePricesUSD.standard / 0.016), // ~312 MZN
  pro: Math.round(basePricesUSD.pro / 0.016), // ~624 MZN
};

// Convert from USD to target currency
export function convertPrice(priceUSD: number, currency: Currency): number {
  const priceInCurrency = priceUSD / currency.rateToUSD;
  // Round to 2 decimal places for most currencies, or 0 for currencies with large values
  if (currency.rateToUSD < 0.01) {
    return Math.round(priceInCurrency);
  }
  return Math.round(priceInCurrency * 100) / 100;
}

// Convert MZN prices to other currencies (for backwards compatibility)
export function convertFromMZN(priceMZN: number, targetCurrency: Currency): number {
  const mzn = currencies.find(c => c.code === 'MZN')!;
  const priceUSD = priceMZN * mzn.rateToUSD;
  return convertPrice(priceUSD, targetCurrency);
}

export function formatPrice(price: number, currency: Currency): string {
  if (price === 0) return `${currency.symbol} 0`;
  
  // Format with appropriate decimal places
  if (currency.rateToUSD < 0.01) {
    return `${currency.symbol} ${price.toLocaleString()}`;
  }
  return `${currency.symbol} ${price.toFixed(2)}`;
}

export function getCurrencyByCode(code: string): Currency | undefined {
  return currencies.find(c => c.code === code);
}

// Default currencies by region
export const defaultCurrencies = {
  mozambique: 'MZN',
  brazil: 'BRL',
  usa: 'USD',
  europe: 'EUR',
  southAfrica: 'ZAR',
};