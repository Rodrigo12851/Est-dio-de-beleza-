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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-[#161616] text-[#F8F5F2] w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#2A2A2A] text-center space-y-5 relative">
        {/* Decorative Success Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-md animate-bounce">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1F1F1F] border border-[#D8A47F]/40 text-[#D8A47F] text-xs font-semibold">
            <Sparkles className="w-3 h-3 text-[#D8A47F]" />
            <span>Pedido Registrado com Sucesso!</span>
          </div>

          <h2 className="font-['Playfair_Display',serif] text-2xl font-bold text-[#F8F5F2]">
            Obrigada pela preferência!
          </h2>

          <p className="text-xs sm:text-sm text-[#A0A0A0] leading-relaxed">
            Seu pedido <strong className="text-[#D8A47F] font-bold">#{orderNumber}</strong> foi gerado e enviado diretamente para a nossa boutique.
          </p>
        </div>

        {/* WhatsApp Notice Card */}
        <div className="p-4 bg-[#1F1F1F] rounded-2xl border border-[#2A2A2A] text-xs text-[#E0E0E0] space-y-2 text-left">
          <div className="flex items-center gap-2 font-bold text-[#D8A47F]">
            <MessageCircle className="w-4 h-4 shrink-0" />
            <span>Atendimento Personalizado Allure</span>
          </div>
          <p className="text-[11px] text-[#A0A0A0] leading-relaxed">
            Uma janela do WhatsApp foi iniciada com o resumo dos seus produtos, tamanhos e endereço. Caso não tenha aberto automaticamente, clique no botão abaixo:
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-98"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Abrir WhatsApp da Boutique</span>
          </a>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-4 bg-[#C75C5C] hover:bg-[#B34E4E] text-white rounded-xl font-semibold text-xs transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Continuar Explorando a Vitrine</span>
          </button>
        </div>

        <p className="text-[11px] text-[#777777] flex items-center justify-center gap-1">
          Feito com <Heart className="w-3 h-3 text-[#C75C5C] fill-current" /> por {config.name}
        </p>
      </div>
    </div>
  );
};
