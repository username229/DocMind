import { useState } from 'react';
import { CreditCard, Loader2, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: 'standard' | 'pro';
  billingPeriod: 'monthly' | 'yearly';
}

const planPrices = {
  monthly: {
    standard: 85,
    pro: 120,
  },
  yearly: {
    standard: 1020,
    pro: 1440,
  },
};

export function PaymentModal({ open, onOpenChange, plan, billingPeriod }: PaymentModalProps) {
  const { t, formatPriceFromMZN } = useLanguage();
  const [loading, setLoading] = useState<string | null>(null);

  const price = planPrices[billingPeriod][plan];
  const formattedPrice = formatPriceFromMZN(price);
  const periodLabel = billingPeriod === 'monthly' ? '/mês' : '/ano';

  const handleMpesaPayment = async () => {
    setLoading('mpesa');
    try {
      // M-Pesa integration - will call edge function
      toast.info('Integração M-Pesa em breve!', {
        description: `Valor: ${formattedPrice}${periodLabel}`,
      });
      
      await new Promise(resolve => setTimeout(resolve, 120));
      
      // TODO: Implement M-Pesa edge function
      // const response = await supabase.functions.invoke('create-mpesa-payment', {
      //   body: { amount: price, plan, billingPeriod }
      // });
      
    } catch (error) {
      toast.error('Pagamento falhou. Tente novamente.');
    } finally {
      setLoading(null);
    }
  };

  const handleStripePayment = async () => {
    setLoading('stripe');
    try {
      // Stripe integration - will call edge function
      toast.info('Integração Stripe em breve!', {
        description: `Valor: ${formattedPrice}${periodLabel}`,
      });
      
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // TODO: Implement Stripe edge function
      // const response = await supabase.functions.invoke('create-stripe-checkout', {
      //   body: { amount: price, plan, billingPeriod }
      // });
      // window.location.href = response.data.url;
      
    } catch (error) {
      toast.error('Pagamento falhou. Tente novamente.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Escolha o método de pagamento
          </DialogTitle>
          <DialogDescription>
            Plano: <strong className="capitalize">{plan}</strong> - {formattedPrice}{periodLabel}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* M-Pesa */}
          <Button
            variant="outline"
            className="w-full h-16 justify-start gap-4"
            onClick={handleMpesaPayment}
            disabled={loading !== null}
          >
            {loading === 'mpesa' ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
            )}
            <div className="text-left">
              <div className="font-semibold">Pagar com M-Pesa</div>
              <div className="text-xs text-muted-foreground">
                Pagamento móvel instantâneo
              </div>
            </div>
          </Button>

          {/* Stripe */}
          <Button
            variant="outline"
            className="w-full h-16 justify-start gap-4"
            onClick={handleStripePayment}
            disabled={loading !== null}
          >
            {loading === 'stripe' ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-700 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
            )}
            <div className="text-left">
              <div className="font-semibold">Pagar com Cartão</div>
              <div className="text-xs text-muted-foreground">
                Visa, Mastercard, American Express
              </div>
            </div>
          </Button>

          <div className="pt-4 border-t">
            <p className="text-xs text-center text-muted-foreground">
              🔒 Pagamento seguro. Seus dados são criptografados.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}