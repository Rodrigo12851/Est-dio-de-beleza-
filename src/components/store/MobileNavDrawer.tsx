import React, { useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { StorePalette } from '../../types';
import {
  X,
  Sparkles,
  Phone,
  Instagram,
  MapPin,
  Lock,
  Palette,
  Check,
  Flame,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdminLogin: () => void;
}

export const MobileNavDrawer: React.FC<MobileNavDrawerProps> = ({
  isOpen,
  onClose,
  onOpenAdminLogin,
}) => {
  const {
    config,
    categories,
    selectedCategory,
    setSelectedCategory,
    newArrivals,
    filterNovidadesOnly,
    setFilterNovidadesOnly,
    palette,
    setPalette,
    isMerchantAuthenticated,
    isSuperAdminAuthenticated,
    setAppRoute,
  } = useStore();

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const paletteOptions: {
    id: StorePalette;
    name: string;
    description: string;
    colors: string[];
    isPrevious?: boolean;
  }[] = [
    {
      id: 'dark-allure',
      name: 'Allure Dark & Ouro',
      description: 'Preto Noite, detalhes dourados e rosa',
      colors: ['#121212', '#2A2A2A', '#D8A47F', '#C75C5C'],
    },
    {
      id: 'light-rose',
      name: 'Rosé & Nude (Paleta Anterior)',
      description: 'Fundo claro/creme, rosé suave e alta costura',
      colors: ['#FAF7F5', '#FFFFFF', '#9B4B5A', '#E8E1DA'],
      isPrevious: true,
    },
    {
      id: 'champagne',
      name: 'Champanhe & Seda',
      description: 'Off-white, champanhe luminoso e acetinado',
      colors: ['#161412', '#201C19', '#E2BA8B', '#FAF6F0'],
    },
    {
      id: 'rouge',
      name: 'Sensual Rouge & Noite',
      description: 'Preto profundo, rubi intenso e tule',
      colors: ['#120A0C', '#1C1013', '#E54868', '#FFF0F2'],
    },
  ];

  const isLight = palette === 'light-rose';

  return (
    <div className="fixed inset-0 z-[9999] sm:hidden flex">
      {/* Solid Dark Backdrop - Click to Close */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/85 transition-opacity"
        aria-hidden="true"
      />

      {/* Drawer Content - 100% Opaque solid background to avoid any transparency leaks */}
      <div
        className={`relative z-10 w-[85%] max-w-[320px] h-full flex flex-col shadow-2xl border-r transition-transform duration-300 ${
          isLight
            ? 'bg-[#FAF7F5] border-[#E8E1DA] text-[#2D2926]'
            : 'bg-[#161616] border-[#2A2A2A] text-[#F8F5F2]'
        }`}
      >
        {/* Drawer Header */}
        <div
          className={`p-4 border-b flex items-center justify-between shrink-0 ${
            isLight ? 'border-[#E8E1DA] bg-white' : 'border-[#2A2A2A] bg-[#121212]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border shadow-sm overflow-hidden ${
                isLight
                  ? 'bg-white text-[#9B4B5A] border-[#9B4B5A]/40'
                  : 'bg-[#1F1F1F] text-[#D8A47F] border-[#D8A47F]/40'
              }`}
            >
              {config.logo ? (
                <img src={config.logo} alt={config.name} className="w-full h-full object-cover rounded-full" />
              ) : (
                config.name ? config.name.charAt(0).toUpperCase() : 'A'
              )}
            </div>
            <div>
              <h3 className="font-['Playfair_Display',serif] font-bold text-base leading-tight">
                {config.name || 'Allure Intimidades'}
              </h3>
              <p
                className={`text-[10px] tracking-wider uppercase font-semibold ${
                  isLight ? 'text-[#9B4B5A]' : 'text-[#D8A47F]'
                }`}
              >
                {config.tagline || 'Boutique Íntima'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-full border transition-colors cursor-pointer ${
              isLight
                ? 'bg-[#F0EBE6] text-[#2D2926] border-[#E8E1DA] hover:bg-[#E8E1DA]'
                : 'bg-[#1F1F1F] text-[#F8F5F2] border-[#2A2A2A] hover:bg-[#2A2A2A]'
            }`}
            aria-label="Fechar menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Palette / Theme Selector (Permite escolher a paleta de antes ou dark) */}
          <div
            className={`p-3 rounded-2xl border ${
              isLight ? 'bg-white border-[#E8E1DA]' : 'bg-[#1F1F1F] border-[#2A2A2A]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  isLight ? 'text-[#9B4B5A]' : 'text-[#D8A47F]'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                Escolha a Paleta da Loja
              </span>
            </div>
            <p className="text-[11px] text-[#888888] mb-2.5">
              Alterne entre o Dark Mode atual e a paleta anterior (Rosé Clara):
            </p>

            <div className="space-y-1.5">
              {paletteOptions.map((opt) => {
                const isSelected = palette === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPalette(opt.id)}
                    className={`w-full p-2 rounded-xl text-left transition-all border flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? isLight
                          ? 'bg-[#FAF7F5] border-[#9B4B5A] text-[#2D2926] font-bold shadow-xs'
                          : 'bg-[#2A2A2A] border-[#D8A47F] text-[#F8F5F2] font-bold shadow-xs'
                        : isLight
                        ? 'bg-transparent border-transparent text-[#666666] hover:bg-[#FAF7F5]'
                        : 'bg-transparent border-transparent text-[#AAAAAA] hover:bg-[#1A1A1A]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {/* Color swatch dots */}
                      <div className="flex items-center -space-x-1">
                        {opt.colors.map((c, idx) => (
                          <span
                            key={idx}
                            className="w-3 h-3 rounded-full border border-black/30 shrink-0"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold">{opt.name}</span>
                          {opt.isPrevious && (
                            <span className="px-1.5 py-0.2 rounded-full text-[8px] font-bold bg-[#C75C5C] text-white">
                              Anterior
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <Check
                        className={`w-3.5 h-3.5 ${
                          isLight ? 'text-[#9B4B5A]' : 'text-[#D8A47F]'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Nav: Novidades & Todos os Produtos */}
          <div className="space-y-1">
            <p
              className={`text-[11px] font-bold uppercase tracking-wider px-2 mb-1 ${
                isLight ? 'text-[#9B4B5A]' : 'text-[#D8A47F]'
              }`}
            >
              Navegação Rápida
            </p>

            <button
              type="button"
              onClick={() => {
                setSelectedCategory(null);
                setFilterNovidadesOnly(false);
                onClose();
              }}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                selectedCategory === null && !filterNovidadesOnly
                  ? 'bg-[#C75C5C] text-white font-bold shadow-xs'
                  : isLight
                  ? 'text-[#2D2926] hover:bg-white'
                  : 'text-[#E0E0E0] hover:bg-[#1F1F1F]'
              }`}
            >
              <span>Todos os Produtos da Loja</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </button>

            {newArrivals.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory(null);
                  setFilterNovidadesOnly(true);
                  onClose();
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  filterNovidadesOnly
                    ? 'bg-[#C75C5C] text-white font-bold shadow-xs'
                    : isLight
                    ? 'text-[#9B4B5A] bg-[#9B4B5A]/10 hover:bg-[#9B4B5A]/20'
                    : 'text-[#D8A47F] bg-[#D8A47F]/10 hover:bg-[#D8A47F]/20'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Catálogo de Novidades ({newArrivals.length})</span>
                </div>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-[#C75C5C] text-white">
                  Novo
                </span>
              </button>
            )}
          </div>

          {/* Categories List */}
          <div className="space-y-1">
            <p
              className={`text-[11px] font-bold uppercase tracking-wider px-2 mb-1 ${
                isLight ? 'text-[#9B4B5A]' : 'text-[#D8A47F]'
              }`}
            >
              Categorias
            </p>

            {categories
              .filter((c) => c.isActive)
              .map((cat) => {
                const isSelected =
                  !filterNovidadesOnly &&
                  (selectedCategory === cat.slug || selectedCategory === cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.slug);
                      setFilterNovidadesOnly(false);
                      onClose();
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#C75C5C] text-white font-bold shadow-xs'
                        : isLight
                        ? 'text-[#444444] hover:bg-white'
                        : 'text-[#CCCCCC] hover:bg-[#1F1F1F]'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <ChevronRight className="w-3 h-3 opacity-50" />
                  </button>
                );
              })}
          </div>

          {/* Admin Switcher / Access */}
          <div
            className={`pt-3 border-t ${
              isLight ? 'border-[#E8E1DA]' : 'border-[#2A2A2A]'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                onClose();
                if (isMerchantAuthenticated || isSuperAdminAuthenticated) {
                  setAppRoute(isSuperAdminAuthenticated ? 'superadmin' : 'merchant');
                } else {
                  onOpenAdminLogin();
                }
              }}
              className={`w-full p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                isLight
                  ? 'bg-white border-[#E8E1DA] text-[#9B4B5A] hover:bg-[#FAF7F5]'
                  : 'bg-[#1F1F1F] border-[#2A2A2A] text-[#D8A47F] hover:bg-[#2A2A2A]'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>
                {isSuperAdminAuthenticated
                  ? 'Painel Super Admin'
                  : isMerchantAuthenticated
                  ? 'Painel do Lojista'
                  : 'Acesso Administrativo (Lojista / Master)'}
              </span>
            </button>
          </div>
        </div>

        {/* Drawer Footer with Contacts */}
        <div
          className={`p-4 border-t space-y-2.5 text-xs shrink-0 ${
            isLight
              ? 'border-[#E8E1DA] bg-white text-[#555555]'
              : 'border-[#2A2A2A] bg-[#121212] text-[#A0A0A0]'
          }`}
        >
          <a
            href={`https://wa.me/${(config.whatsapp || config.phone).replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 transition-colors hover:underline ${
              isLight ? 'hover:text-[#9B4B5A]' : 'hover:text-[#D8A47F]'
            }`}
          >
            <Phone
              className={`w-3.5 h-3.5 ${
                isLight ? 'text-[#9B4B5A]' : 'text-[#D8A47F]'
              }`}
            />
            <span className="font-semibold">{config.phone || config.whatsapp}</span>
          </a>
          {config.instagram && (
            <a
              href={`https://instagram.com/${config.instagram.replace('@', '').trim()}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 transition-colors hover:underline ${
                isLight ? 'hover:text-[#9B4B5A]' : 'hover:text-[#D8A47F]'
              }`}
            >
              <Instagram
                className={`w-3.5 h-3.5 ${
                  isLight ? 'text-[#9B4B5A]' : 'text-[#D8A47F]'
                }`}
              />
              <span>{config.instagram}</span>
            </a>
          )}
          {config.address && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 transition-colors hover:underline ${
                isLight ? 'hover:text-[#9B4B5A]' : 'hover:text-[#D8A47F]'
              }`}
            >
              <MapPin
                className={`w-3.5 h-3.5 shrink-0 ${
                  isLight ? 'text-[#9B4B5A]' : 'text-[#D8A47F]'
                }`}
              />
              <span className="truncate">{config.address}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
