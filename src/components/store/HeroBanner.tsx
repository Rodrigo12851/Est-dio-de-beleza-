import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Sparkles, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const { config, setSelectedCategory } = useStore();

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#181818] via-[#141414] to-[#121212] border-b border-[#2A2A2A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text Content */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1F1F1F] text-[#D8A47F] text-xs font-semibold tracking-wide border border-[#D8A47F]/40 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#D8A47F]" />
              <span>ALLURE INTIMIDADES • LUXO ACESSÍVEL</span>
            </div>

            <h2 className="font-['Playfair_Display',serif] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F8F5F2] tracking-tight leading-[1.15]">
              Elegância, conforto e autoestima na <span className="italic text-[#D8A47F]">alta costura íntima</span>.
            </h2>

            <p className="text-sm sm:text-base text-[#E0E0E0] max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Feed escuro, sofisticado e acolhedor. Modelagens anatômicas, rendas macias e acabamentos em banho ouro. Selecione sua cor e tamanho com auxílio da nossa IA e finalize diretamente no WhatsApp.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('catalog-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3 rounded-full bg-[#C75C5C] hover:bg-[#B34E4E] text-[#F8F5F2] font-bold text-xs sm:text-sm tracking-wide shadow-lg hover:shadow-xl transition-all cursor-pointer active:scale-95"
              >
                Comprar Agora no Catálogo
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('conjuntos')}
                className="px-6 py-3 rounded-full bg-[#1F1F1F] hover:bg-[#2A2A2A] text-[#F8F5F2] font-semibold text-xs sm:text-sm border border-[#2A2A2A] transition-all cursor-pointer shadow-xs hover:border-[#D8A47F]/50"
              >
                Ver Conjuntos em Destaque
              </button>
            </div>

            {/* Value Props */}
            <div className="pt-4 border-t border-[#2A2A2A] grid grid-cols-3 gap-2 text-center lg:text-left">
              <div className="flex items-center gap-2 text-[#E0E0E0]">
                <Truck className="w-4 h-4 text-[#D8A47F] shrink-0" />
                <span className="text-[11px] font-medium leading-tight">Entrega Rápida & Segura</span>
              </div>
              <div className="flex items-center gap-2 text-[#E0E0E0]">
                <ShieldCheck className="w-4 h-4 text-[#D8A47F] shrink-0" />
                <span className="text-[11px] font-medium leading-tight">Embalagem Discreta</span>
              </div>
              <div className="flex items-center gap-2 text-[#E0E0E0]">
                <RefreshCw className="w-4 h-4 text-[#D8A47F] shrink-0" />
                <span className="text-[11px] font-medium leading-tight">1ª Troca Garantida</span>
              </div>
            </div>
          </div>

          {/* Right Image Collage / Hero Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-sm sm:max-w-md lg:max-w-none">
              <div className="aspect-4/5 rounded-3xl overflow-hidden shadow-2xl border-4 border-[#2A2A2A]">
                <img
                  src={config.bannerImage || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1000'}
                  alt="Coleção Allure Intimidades"
                  className="w-full h-full object-cover object-center"
                />
              </div>

              {/* Floating Pill Badge */}
              <div className="absolute -bottom-3 -left-3 sm:-left-6 bg-[#1F1F1F]/95 backdrop-blur-md rounded-2xl p-3.5 shadow-2xl border border-[#2A2A2A] max-w-[210px]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#D8A47F] animate-pulse"></span>
                  <p className="text-[10px] font-bold text-[#D8A47F] uppercase tracking-wider">
                    Atendimento Allure
                  </p>
                </div>
                <p className="text-xs font-semibold text-[#F8F5F2] leading-tight">
                  Consultoria de cores & tamanhos no WhatsApp
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
