import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, MessageCircle, ShoppingBag, Heart, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface OrderConfirmationModalProps {
  orderNumber: string;
  whatsappUrl: string;
  onClose: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  orderNumber,
  whatsappUrl,
  onClose,
}) => {
  const { config } = useStore();

  useEffect(() => {
    // Launch celebratory confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#9B4B5A', '#D9828B', '#E8DFD5', '#FFFFFF'],
      });
    } catch {
      // ignore
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-[#FDFBF9] w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#EAE4DD] text-center space-y-5 relative">
        {/* Decorative Success Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs animate-bounce">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9B4B5A]/10 text-[#9B4B5A] text-xs font-semibold">
            <Sparkles className="w-3 h-3" />
            <span>Pedido Registrado com Sucesso!</span>
          </div>

          <h2 className="font-['Playfair_Display',serif] text-2xl font-bold text-[#2D2926]">
            Obrigada pela preferência!
          </h2>

          <p className="text-xs sm:text-sm text-[#6B635B] leading-relaxed">
            Seu pedido <strong className="text-[#2D2926] font-bold">#{orderNumber}</strong> foi gerado e enviado diretamente para a nossa boutique.
          </p>
        </div>

        {/* WhatsApp Notice Card */}
        <div className="p-4 bg-[#FAF3F5] rounded-2xl border border-[#F0D5DC] text-xs text-[#4A3B3E] space-y-2 text-left">
          <div className="flex items-center gap-2 font-bold text-[#9B4B5A]">
            <MessageCircle className="w-4 h-4 shrink-0" />
            <span>Atendimento no WhatsApp</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Uma janela do WhatsApp foi iniciada com o resumo dos seus produtos, tamanhos e endereço. Caso não tenha aberto automaticamente, clique no botão abaixo:
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-98"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Abrir WhatsApp da Loja</span>
          </a>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-4 bg-[#2D2926] hover:bg-black text-white rounded-xl font-semibold text-xs transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Continuar Comprando</span>
          </button>
        </div>

        <p className="text-[11px] text-[#8A7E76] flex items-center justify-center gap-1">
          Feito com <Heart className="w-3 h-3 text-[#9B4B5A] fill-current" /> por {config.name}
        </p>
      </div>
    </div>
  );
};
