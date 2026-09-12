import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Sparkles, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const { config, setSelectedCategory } = useStore();

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#181818] via-[#141414] to-[#121212] border-b border-[#2A2A2A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left Text Content */}
          <div className="md:col-span-7 space-y-3 sm:space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1F1F1F] text-[#D8A47F] text-[10px] sm:text-xs font-semibold tracking-wide border border-[#D8A47F]/40 shadow-xs">
              <Sparkles className="w-3 h-3 text-[#D8A47F]" />
              <span>ALLURE INTIMIDADES • LUXO ACESSÍVEL</span>
            </div>

            <h2 className="font-['Playfair_Display',serif] text-xl sm:text-3xl lg:text-4xl font-bold text-[#F8F5F2] tracking-tight leading-tight">
              Elegância, conforto e autoestima na <span className="italic text-[#D8A47F]">alta costura íntima</span>.
            </h2>

            <div className="pt-1 flex flex-wrap items-center justify-center md:justify-start gap-2">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('catalog-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-[#C75C5C] hover:bg-[#B34E4E] text-[#F8F5F2] font-bold text-xs sm:text-sm tracking-wide shadow-md transition-all cursor-pointer active:scale-95"
              >
                Comprar no Catálogo
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('conjuntos')}
                className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-[#1F1F1F] hover:bg-[#2A2A2A] text-[#F8F5F2] font-semibold text-xs sm:text-sm border border-[#2A2A2A] transition-all cursor-pointer hover:border-[#D8A47F]/50"
              >
                Conjuntos em Destaque
              </button>
            </div>

            {/* Value Props - Compact line */}
            <div className="pt-2 border-t border-[#2A2A2A]/80 flex items-center justify-center md:justify-start gap-3 sm:gap-6 text-[10px] sm:text-xs text-[#C0C0C0]">
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#D8A47F] shrink-0" />
                <span>Entrega Rápida</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D8A47F] shrink-0" />
                <span>Embalagem Discreta</span>
              </div>
              <div className="flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-[#D8A47F] shrink-0" />
                <span>1ª Troca Garantida</span>
              </div>
            </div>
          </div>

          {/* Right Image - hidden on small mobile to avoid excessive vertical scrolling */}
          <div className="hidden md:block md:col-span-5 relative">
            <div className="relative mx-auto max-w-xs sm:max-w-sm">
              <div className="aspect-4/5 rounded-2xl overflow-hidden shadow-xl border-2 border-[#2A2A2A]">
                <img
                  src={config.bannerImage || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1000'}
                  alt="Coleção Allure Intimidades"
                  className="w-full h-full object-cover object-center"
                />
              </div>

              {/* Floating Pill Badge */}
              <div className="absolute -bottom-2 -left-2 bg-[#1F1F1F]/95 backdrop-blur-md rounded-xl p-2.5 shadow-xl border border-[#2A2A2A] max-w-[190px]">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#D8A47F] animate-pulse"></span>
                  <p className="text-[9px] font-bold text-[#D8A47F] uppercase tracking-wider">
                    Atendimento Allure
                  </p>
                </div>
                <p className="text-[11px] font-semibold text-[#F8F5F2] leading-tight">
                  Consultoria de tamanhos no WhatsApp
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
