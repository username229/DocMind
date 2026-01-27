import { CreditCard, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: "standard" | "pro";
  billingPeriod: "monthly" | "yearly";
}

const planPrices = {
  monthly: { standard: 319.31, pro: 637.98 },
  yearly: { standard: 3832.86, pro: 7665.73 },
};

// ✅ Dodo checkout links (os que você mandou)
const DODO_LINKS: Record<"standard" | "pro", string> = {
  standard:
    "https://checkout.dodopayments.com/buy/pdt_0NXBlp8QKAqSCyBOwvAbB?quantity=1&redirect_url=https://docmind.co",
  pro:
    "https://checkout.dodopayments.com/buy/pdt_0NXCGSxnwR3uZ3A897lLH?quantity=1&redirect_url=https://docmind.co",
};

export function PaymentModal({ open, onOpenChange, plan, billingPeriod }: PaymentModalProps) {
  const { formatPriceFromMZN } = useLanguage();

  const price = planPrices[billingPeriod][plan];
  const formattedPrice = formatPriceFromMZN(price);
  const periodLabel = billingPeriod === "monthly" ? "/mês" : "/ano";

  const checkoutUrl = DODO_LINKS[plan];

  const handleCheckout = () => {
    // fecha o modal e redireciona para o checkout do Dodo
    onOpenChange(false);
    window.location.href = checkoutUrl;
  };

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
          {/* ✅ Dodo */}
          <div className="w-full border rounded-md p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-foreground text-background flex items-center justify-center font-bold">
                D
              </div>
              <div>
                <div className="font-semibold">Pagar com Dodo</div>
                <div className="text-xs text-muted-foreground">
                  Checkout externo (cartão, etc.)
                </div>
              </div>
            </div>

            <Button className="w-full" onClick={handleCheckout}>
              Ir para o checkout
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
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
