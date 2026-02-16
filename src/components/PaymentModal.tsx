import { Copy, CreditCard, ExternalLink, Smartphone } from "lucide-react";
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
"https://checkout.dodopayments.com/buy/pdt_0NXBlp8QKAqSCyBOwvAbB?quantity=1",
  pro:
    "https://checkout.dodopayments.com/buy/pdt_0NXCGSxnwR3uZ3A897lLH?quantity=1&redirect_url=https://docmind.co",
};

const MOZ_PAYMENT_NUMBER = "258842206751";

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

  const copyMozNumber = async () => {
    try {
      await navigator.clipboard.writeText(MOZ_PAYMENT_NUMBER);
      alert("Número copiado: " + MOZ_PAYMENT_NUMBER);
    } catch {
      alert("Não foi possível copiar automaticamente. Use: " + MOZ_PAYMENT_NUMBER);
    }
  };

  const openWhatsAppConfirmation = () => {
    const message = encodeURIComponent(
      `Olá, paguei o plano ${plan.toUpperCase()} (${formattedPrice}${periodLabel}) via M-Pesa/eMola para ${MOZ_PAYMENT_NUMBER}. Segue o comprovativo.`
    );
    window.open(`https://wa.me/${MOZ_PAYMENT_NUMBER}?text=${message}`, "_blank");
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
                <div className="font-semibold">Pagar AGORAA</div>
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

          <div className="w-full border rounded-md p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold">M-Pesa / eMola (Moçambique)</div>
                <div className="text-xs text-muted-foreground">
                  Pagamento manual com confirmação por WhatsApp
                </div>
              </div>
            </div>

            <div className="text-sm mb-3">
              Número de recebimento: <strong>{MOZ_PAYMENT_NUMBER}</strong>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button variant="outline" onClick={copyMozNumber}>
                <Copy className="w-4 h-4 mr-2" />
                Copiar número
              </Button>
              <Button onClick={openWhatsAppConfirmation}>
                Confirmar no WhatsApp
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
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
