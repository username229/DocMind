import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  checkoutUrl: string;
  onBeforeRedirect?: () => void; // opcional: fechar modal, etc.
  label?: string; // opcional: texto do botão
}

export function DodoCheckoutButton({ checkoutUrl, onBeforeRedirect, label }: Props) {
  const handleClick = () => {
    onBeforeRedirect?.();
    window.location.assign(checkoutUrl);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[100px]">
      <Button className="w-full" onClick={handleClick}>
        {label ?? "Ir para o checkout"}
        <ExternalLink className="w-4 h-4 ml-2" />
      </Button>

      <p className="text-xs text-muted-foreground mt-3 text-center">
        Você será redirecionado para o checkout do Dodo.
      </p>
    </div>
  );
}
