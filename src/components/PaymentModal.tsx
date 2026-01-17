import { useState } from 'react';
import { CreditCard, Loader2, Smartphone } from 'lucide-react';
import { PaypalHostedButton } from '@/components/PaypalHostedButton';

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

// ✅ Hosted Button IDs (PayPal)
const hostedButtonIds: Record<'standard' | 'pro', string> = {
  standard: '9DPBWAUG5X4JQ',
  pro: 'LGPRKFFJ7ADPC',
};

export function PaymentModal({ open, onOpenChange, plan, billingPeriod }: PaymentModalProps) {
  const { t, formatPriceFromMZN } = useLanguage();
  const [loading, setLoading] = useState<string | null>(null);

  const price = planPrices[billingPeriod][plan];
  const formattedPrice = formatPriceFromMZN(price);
  const periodLabel = billingPeriod === 'monthly' ? '/mês' : '/ano';

  // ---------- M-Pesa ----------
  const handleMpesaPayment = async () => {
    setLoading('mpesa');
    try {
      toast.info('Integração M-Pesa em breve!', {
        description: `Valor: ${formattedPrice}${periodLabel}`,
      });

      await new Promise(resolve => setTimeout(resolve, 120));
    } catch (error) {
      toast.error('Pagamento falhou. Tente novamente.');
    } finally {
      setLoading(null);
    }
  };

  // ✅ PayPal Hosted Button (sem Edge Function, sem packageIds)
  const paypalHostedButtonId = hostedButtonIds[plan];
  const paypalContainerId = `paypal-hosted-${plan}`; // ✅ container novo e limpo

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Escolha o método de pagamento
          </DialogTitle>
          <DialogDescription>
            Plano: <strong className="capitalize">{plan}</strong> - {formattedPrice}
            {periodLabel}
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
              <div className="text-xs text-muted-foreground">Pagamento móvel instantâneo</div>
            </div>
          </Button>

          {/* PayPal (Hosted Buttons) */}
          <div className="w-full border rounded-md p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-yellow-400 flex items-center justify-center font-bold">
                PP
              </div>
              <div>
                <div className="font-semibold">Pagar com PayPal</div>
                <div className="text-xs text-muted-foreground">
                  Visa, Mastercard ou saldo PayPal
                </div>
              </div>
            </div>

            <PaypalHostedButton
              hostedButtonId={paypalHostedButtonId}
              containerId={paypalContainerId}
            />
          </div>

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
