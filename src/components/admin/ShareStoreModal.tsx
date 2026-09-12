import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  Share2,
  Copy,
  Check,
  MessageCircle,
  ExternalLink,
  QrCode,
  Sparkles,
  X,
} from 'lucide-react';

interface ShareStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareStoreModal: React.FC<ShareStoreModalProps> = ({ isOpen, onClose }) => {
  const { currentStore, config } = useStore();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Monta o link exclusivo da loja para as clientes
  const storeSlug = currentStore?.slug || currentStore?.id || 'allure';
  const origin = window.location.origin;
  const storeUrl = `${origin}/?store=${storeSlug}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(storeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = `Olá! Venha conferir as novidades e peças exclusivas da nossa boutique ${config.name} no nosso catálogo online:\n\n${storeUrl}\n\nFaça sua sacola e envie direto no nosso WhatsApp! 💕`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#EFE9E2] overflow-hidden z-10 text-[#2D2926]">
        {/* Header */}
        <div className="p-5 border-b border-[#EFE9E2] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#9B4B5A]/10 text-[#9B4B5A] flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-['Playfair_Display',serif] text-base sm:text-lg font-bold">
                Link da Loja para Clientes
              </h3>
              <p className="text-xs text-[#7D756D]">
                Envie para suas clientes pelo WhatsApp ou copie o link
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#8A7E76] hover:bg-[#F0EAE1] hover:text-[#2D2926] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#EAE4DD] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#59524C]">Link Exclusivo do seu Catálogo:</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                100% Pronto
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={storeUrl}
                className="flex-1 bg-white border border-[#E8DFD5] rounded-xl px-3 py-2 text-xs font-mono text-[#2D2926] select-all focus:outline-none"
              />

              <button
                type="button"
                onClick={handleCopy}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#9B4B5A] hover:bg-[#843A48] text-white'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          {/* Quick Share via WhatsApp */}
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-98"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Compartilhar Catálogo no WhatsApp</span>
          </button>

          {/* Informative Note */}
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-[11px] text-blue-800 space-y-1">
            <p className="font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Experiência Limpa para a Cliente:
            </p>
            <p className="leading-relaxed text-blue-700">
              Ao abrir este link, sua cliente vê apenas o catálogo da sua loja com suas peças, suas fotos e preços. Nenhuma área ou botão de admin é visível para ela!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
