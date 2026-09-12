import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Check } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PwaInstallBanner: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      // Fallback instruction for iOS / Chrome
      alert('Para instalar no seu celular:\n1. Toque no botão de opções/compartilhar do navegador.\n2. Escolha "Adicionar à Tela de Início" ou "Instalar Aplicativo".');
      return;
    }
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setInstallPrompt(null);
  };

  if (isInstalled || isDismissed) return null;

  return (
    <div className="bg-[#1F1F1F] border-b border-[#2A2A2A] px-4 py-2.5 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-full bg-[#C75C5C] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Smartphone className="w-3.5 h-3.5" />
          </div>
          <p className="text-[#A0A0A0] truncate">
            <strong className="font-semibold text-[#F8F5F2]">Instale o App Allure Intimidades:</strong> Acesso instantâneo com experiência exclusiva de boutique.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleInstallClick}
            className="px-3 py-1 bg-[#D8A47F] hover:bg-[#C8946F] text-[#121212] font-black rounded-full text-[11px] flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Download className="w-3 h-3" />
            <span>Instalar App</span>
          </button>
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1 text-[#8A8A8A] hover:text-[#F8F5F2] cursor-pointer"
            aria-label="Fechar aviso"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
