import { CreditCard } from 'lucide-react';
import { PaypalHostedButton } from '@/components/PaypalHostedButton';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { formatPriceFromMZN } = useLanguage();

  const price = planPrices[billingPeriod][plan];
  const formattedPrice = formatPriceFromMZN(price);
  const periodLabel = billingPeriod === 'monthly' ? '/mês' : '/ano';

  // ✅ PayPal Hosted Button
  const paypalHostedButtonId = hostedButtonIds[plan];
  const paypalContainerId = `paypal-hosted-${plan}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Confirmar pagamento
          </DialogTitle>
          <DialogDescription>
            Plano: <strong className="capitalize">{plan}</strong> - {formattedPrice}
            {periodLabel}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* PayPal (Hosted Buttons) */}
          <div className="w-full border rounded-md p-4">
            <div className="flex items-center gap-3 mb-4">
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