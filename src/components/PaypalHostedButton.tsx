import { useEffect, useRef } from "react";

declare global {
  interface Window {
    paypal?: any;
  }
}

interface Props {
  hostedButtonId: string;
  containerId: string;
}

export function PaypalHostedButton({ hostedButtonId, containerId }: Props) {
  const isRendered = useRef(false);

  useEffect(() => {
    // Resetar o estado se o ID do botão mudar
    isRendered.current = false;

    const renderButton = () => {
      const container = document.getElementById(containerId);
      
      if (!container) return;

      // Limpa o contêiner para evitar duplicados
      container.innerHTML = "";

      if (window.paypal?.HostedButtons) {
        window.paypal
          .HostedButtons({
            hostedButtonId,
          })
          .render(`#${containerId}`)
          .then(() => {
            isRendered.current = true;
          })
          .catch((err: any) => {
            console.error("Erro ao renderizar PayPal Hosted Button:", err);
          });
      } else {
        console.error("PayPal SDK não encontrado.");
      }
    };

    // Pequeno delay para garantir que o Dialog do Radix/shadcn terminou de montar
    const timeoutId = setTimeout(renderButton, 50);

    return () => {
      clearTimeout(timeoutId);
      const container = document.getElementById(containerId);
      if (container) container.innerHTML = "";
    };
  }, [hostedButtonId, containerId]);

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[100px]">
      <div id={containerId} className="w-full" />
      {/* Fallback visual enquanto o SDK carrega */}
      <style>{`
        #${containerId}:empty::before {
          content: "Carregando opções de pagamento...";
          display: block;
          text-align: center;
          font-size: 14px;
          color: #666;
          padding: 20px;
        }
      `}</style>
    </div>
  );
}