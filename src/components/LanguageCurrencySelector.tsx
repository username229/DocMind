import { Globe, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/contexts/LanguageContext';
import { ScrollArea } from '@/components/ui/scroll-area';

export function LanguageCurrencySelector() {
  const { language, setLanguage, currency, setCurrency, currencies, t } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline">{language.toUpperCase()}</span>
          <span className="text-xs">{currency.flag}</span>
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Language</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => setLanguage('en')} className={language === 'en' ? 'bg-accent' : ''}>
          🇺🇸 English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setLanguage('pt')} className={language === 'pt' ? 'bg-accent' : ''}>
          🇧🇷 Português
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>{t('selectCurrency')}</DropdownMenuLabel>
        
        <ScrollArea className="h-64">
          {currencies.map((c) => (
            <DropdownMenuItem 
              key={c.code} 
              onClick={() => setCurrency(c.code)}
              className={currency.code === c.code ? 'bg-accent' : ''}
            >
              <span className="mr-2">{c.flag}</span>
              <span className="flex-1">{c.country}</span>
              <span className="text-muted-foreground text-sm">{c.code}</span>
            </DropdownMenuItem>
          ))}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
