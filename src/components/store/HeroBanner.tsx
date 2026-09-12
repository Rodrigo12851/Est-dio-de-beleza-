import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Sparkles, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const { config, setSelectedCategory } = useStore();

  return (
    <div className="relative overflow-hidden bg-[#F7F2EE] border-b border-[#EAE3DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text Content */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9B4B5A]/10 text-[#9B4B5A] text-xs font-semibold tracking-wide border border-[#9B4B5A]/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>COLEÇÃO EXCLUSIVA 2026</span>
            </div>

            <h2 className="font-['Playfair_Display',serif] text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2D2926] tracking-tight leading-[1.15]">
              Sinta-se única com o toque da verdadeira <span className="italic text-[#9B4B5A]">alta costura íntima</span>.
            </h2>

            <p className="text-sm sm:text-base text-[#6B635B] max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Modelagens anatômicas, rendas francesas macias e acabamentos banhados a ouro. Escolha seu tamanho e cor, e finalize seu pedido diretamente pelo WhatsApp.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('catalog-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-6 py-3 rounded-full bg-[#9B4B5A] hover:bg-[#843A48] text-white font-bold text-xs sm:text-sm tracking-wide shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
              >
                Explorar Catálogo Completo
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('conjuntos')}
                className="px-6 py-3 rounded-full bg-white hover:bg-[#FDFBF9] text-[#2D2926] font-semibold text-xs sm:text-sm border border-[#D9D0C5] transition-all cursor-pointer shadow-xs"
              >
                Ver Conjuntos em Destaque
              </button>
            </div>

            {/* Value Props */}
            <div className="pt-4 border-t border-[#E8DFD5] grid grid-cols-3 gap-2 text-center lg:text-left">
              <div className="flex items-center gap-2 text-[#4A423D]">
                <Truck className="w-4 h-4 text-[#9B4B5A] shrink-0" />
                <span className="text-[11px] font-medium leading-tight">Entrega Rápida & Segura</span>
              </div>
              <div className="flex items-center gap-2 text-[#4A423D]">
                <ShieldCheck className="w-4 h-4 text-[#9B4B5A] shrink-0" />
                <span className="text-[11px] font-medium leading-tight">Embalagem Discreta</span>
              </div>
              <div className="flex items-center gap-2 text-[#4A423D]">
                <RefreshCw className="w-4 h-4 text-[#9B4B5A] shrink-0" />
                <span className="text-[11px] font-medium leading-tight">1ª Troca Garantida</span>
              </div>
            </div>
          </div>

          {/* Right Image Collage / Hero Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-sm sm:max-w-md lg:max-w-none">
              <div className="aspect-4/5 rounded-3xl overflow-hidden shadow-xl border-4 border-white">
                <img
                  src={config.bannerImage || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1000'}
                  alt="Coleção Bella Lingerie"
                  className="w-full h-full object-cover object-center"
                />
              </div>

              {/* Floating Pill Badge */}
              <div className="absolute -bottom-3 -left-3 sm:-left-6 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-lg border border-[#EAE4DD] max-w-[200px]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                    Atendimento Online
                  </p>
                </div>
                <p className="text-xs font-semibold text-[#2D2926] leading-tight">
                  Tire dúvidas de medidas pelo WhatsApp
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
