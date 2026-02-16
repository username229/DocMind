import { useState } from "react";
import { CreditCard, Loader2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

export function PaymentModal({ open, onOpenChange, plan, billingPeriod }: PaymentModalProps) {
  const { formatPriceFromMZN } = useLanguage();
  const [loadingMethod, setLoadingMethod] = useState<null | "card" | "mpesa" | "emola">(null);

  const price = planPrices[billingPeriod][plan];
  const formattedPrice = formatPriceFromMZN(price);
  const periodLabel = billingPeriod === "monthly" ? "/mês" : "/ano";

  const startCardCheckout = async () => {
    setLoadingMethod("card");
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { plan, billingPeriod, method: "card" },
      });

      if (error) throw error;
      if (!data?.url) throw new Error("Checkout de cartão indisponível.");

      onOpenChange(false);
      window.location.assign(data.url);
    } catch (err: any) {
      toast.error(err?.message || "Falha ao iniciar pagamento com cartão.");
    } finally {
      setLoadingMethod(null);
    }
  };

  const startMobileMoneyPayment = async (method: "mpesa" | "emola") => {
    setLoadingMethod(method);
    try {
      const { data, error } = await supabase.functions.invoke("create-mobile-money-payment", {
        body: { plan, billingPeriod, method },
      });

      if (error) throw error;

      if (data?.redirectUrl) {
        onOpenChange(false);
        window.location.assign(data.redirectUrl);
        return;
      }

      if (data?.message) {
        toast.success(data.message);
      } else {
        toast.success("Pedido de pagamento criado. Siga as instruções no seu telemóvel.");
      }

      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || `Falha ao iniciar pagamento via ${method.toUpperCase()}.`);
    } finally {
      setLoadingMethod(null);
    }
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
          {/* Visa/Mastercard */}
          <div className="w-full border rounded-md p-4">
            <div className="font-semibold mb-1">Visa / Mastercard</div>
            <div className="text-xs text-muted-foreground mb-3">
              Pagamento seguro por gateway (sem expor dados sensíveis no frontend).
            </div>
            <Button className="w-full" onClick={startCardCheckout} disabled={!!loadingMethod}>
              {loadingMethod === "card" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  A abrir checkout...
                </>
              ) : (
                "Pagar com cartão"
              )}
            </Button>
          </div>

          {/* M-Pesa / eMola */}
          <div className="w-full border rounded-md p-4">
            <div className="flex items-center gap-2 font-semibold mb-1">
              <Smartphone className="w-4 h-4" /> M-Pesa / eMola
            </div>
            <div className="text-xs text-muted-foreground mb-3">
              Pagamento iniciado no backend. O número de recebimento não é exposto no app.
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => startMobileMoneyPayment("mpesa")}
                disabled={!!loadingMethod}
              >
                {loadingMethod === "mpesa" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    A processar...
                  </>
                ) : (
                  "Pagar com M-Pesa"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => startMobileMoneyPayment("emola")}
                disabled={!!loadingMethod}
              >
                {loadingMethod === "emola" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    A processar...
                  </>
                ) : (
                  "Pagar com eMola"
                )}
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-center text-muted-foreground">
              🔒 Pagamentos via backend com credenciais em variáveis seguras.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
