import { useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
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
  const { formatPriceFromMZN } = useLanguage();
  const [loading, setLoading] = useState<string | null>(null);

  const price = planPrices[billingPeriod][plan];
  const formattedPrice = formatPriceFromMZN(price);
  const periodLabel = billingPeriod === 'monthly' ? '/mês' : '/ano';

  // ---------- PayPal ----------
  // IDs fixos dos pacotes PayPal
  const packageIds: Record<string, string> = {
    standard: 'QA9ZBWU6F8KUE',
    pro: 'LGPRKFFJ7ADPC', // substitua pelo ID real do Pro
  };

  const handlePaypalPayment = async () => {
    setLoading('paypal');
    try {
      const packageId = packageIds[plan]; // seleciona ID baseado no plano

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-paypal-order`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            amount: price,
            packageId, // envia pacote para a função
          }),
        }
      );

      const data = await res.json();

      const approvalUrl = data.links.find((link: any) => link.rel === 'approve')?.href;

      if (approvalUrl) {
        window.location.href = approvalUrl; // redireciona para PayPal
      } else {
        throw new Error('PayPal URL não encontrada');
      }
    } catch (err) {
      toast.error('Erro ao iniciar pagamento PayPal');
      console.error(err);
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
          {/* Cartão via PayPal */}
          <Button
            variant="outline"
            className="w-full h-16 justify-start gap-4"
            onClick={handlePaypalPayment}
            disabled={loading !== null}
          >
            {loading === 'paypal' ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
            )}
            <div className="text-left">
              <div className="font-semibold">Pagar com cartão</div>
              <div className="text-xs text-muted-foreground">
                Visa ou Mastercard via PayPal
              </div>
            </div>
          </Button>

          {/* PayPal */}
          <Button
            variant="outline"
            className="w-full h-16 justify-start gap-4"
            onClick={handlePaypalPayment}
            disabled={loading !== null}
          >
            {loading === 'paypal' ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-yellow-400 flex items-center justify-center font-bold">
                PP
              </div>
            )}
            <div className="text-left">
              <div className="font-semibold">Pagar com PayPal</div>
              <div className="text-xs text-muted-foreground">
                Use seu saldo PayPal
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
