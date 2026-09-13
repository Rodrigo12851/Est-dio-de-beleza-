import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  ShoppingBag,
  Search,
  X,
  Sparkles,
  Phone,
  Instagram,
  MapPin,
  Menu,
  Palette,
  PackageCheck,
} from 'lucide-react';
import { MobileNavDrawer } from './MobileNavDrawer';
import { ClientOrderTrackingModal } from './ClientOrderTrackingModal';

interface StoreNavbarProps {
  onOpenAdminLogin?: () => void;
  onOpenPwaPrompt?: () => void;
}

export const StoreNavbar: React.FC<StoreNavbarProps> = ({
  onOpenAdminLogin,
}) => {
  const {
    config,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    cartItemCount,
    setIsCartOpen,
    palette,
    setPalette,
    newArrivals,
    setFilterNovidadesOnly,
  } = useStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);

  const isLight = palette === 'light-rose';

  return (
    <>
      <header className={`sticky top-0 z-40 border-b transition-colors duration-200 ${
        isLight
          ? 'bg-[#FAF7F5]/95 backdrop-blur-md border-[#E8E1DA] text-[#2D2926]'
          : 'bg-[#121212]/95 backdrop-blur-md border-[#2A2A2A] text-[#F8F5F2]'
      }`}>
        {/* Top Announcement Bar / Linha Verde com Nome da Loja em destaque */}
        <div className={`text-[11px] font-medium py-1.5 px-3 sm:px-4 border-b ${
          isLight
            ? 'bg-[#F7F2ED] text-[#444444] border-[#E8E1DA]'
            : 'bg-[#1F1F1F] text-[#F8F5F2] border-[#2A2A2A]'
        }`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3">
            {/* Nome da Loja em destaque no topo (Linha Verde solicitada) */}
            <div className="flex items-center gap-1.5 min-w-0">
              <Sparkles className="w-3.5 h-3.5 text-[#C75C5C] shrink-0" />
              <span className={`font-['Playfair_Display',serif] font-bold text-xs sm:text-sm tracking-tight truncate ${
                isLight ? 'text-[#9B4B5A]' : 'text-[#D8A47F]'
              }`}>
                {config.name || 'Allure Intimidades'}
              </span>
              {config.announcementBar && (
                <>
                  <span className={isLight ? 'text-zinc-300' : 'text-white/20'}>|</span>
                  <span className={`hidden md:inline truncate ${
                    isLight ? 'text-[#555555]' : 'text-[#E0E0E0]'
                  }`}>
                    {config.announcementBar}
                  </span>
                </>
              )}
            </div>

            {/* Atendimento Direto da Loja para a Cliente */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
              <a
                href={`https://wa.me/${(config.whatsapp || config.phone || '').replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-1 text-[11px] font-semibold hover:underline cursor-pointer ${
                  isLight ? 'text-[#9B4B5A] hover:text-[#843A48]' : 'text-[#D8A47F] hover:text-[#FAF8F5]'
                }`}
              >
                <Phone className="w-3 h-3 text-emerald-500 shrink-0" />
                <span className="hidden xs:inline sm:inline">Atendimento</span>
                <span>WhatsApp</span>
              </a>

              {config.instagram && (
                <a
                  href={`https://instagram.com/${config.instagram.replace('@', '').trim()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`hidden sm:flex items-center gap-1 text-[11px] hover:underline cursor-pointer ${
                    isLight ? 'text-[#555555]' : 'text-[#A0A0A0]'
                  }`}
                >
                  <Instagram className="w-3 h-3" />
                  <span>{config.instagram}</span>
                </a>
              )}
            </div>
          </div>
        </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-20 gap-2 sm:gap-6">
          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`p-1.5 sm:p-2 -ml-1 sm:-ml-2 sm:hidden cursor-pointer shrink-0 ${
              isLight ? 'text-[#2D2926] hover:text-[#9B4B5A]' : 'text-[#E0E0E0] hover:text-[#D8A47F]'
            }`}
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 sm:flex-none">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory(null);
                setSearchQuery('');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-left cursor-pointer flex items-center gap-2 sm:gap-2.5 group min-w-0"
            >
              <div className={`w-8 h-8 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shadow-md transition-all overflow-hidden border shrink-0 ${
                isLight
                  ? 'bg-white border-[#E8E1DA] group-hover:border-[#9B4B5A]'
                  : 'bg-[#1F1F1F] text-[#D8A47F] border-[#D8A47F]/40 group-hover:border-[#D8A47F]'
              }`}>
                {config.logo ? (
                  <img
                    src={config.logo}
                    alt={config.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className={`font-['Playfair_Display',serif] font-bold text-sm sm:text-lg ${
                    isLight ? 'text-[#9B4B5A]' : 'text-[#D8A47F]'
                  }`}>
                    {config.name ? config.name.charAt(0).toUpperCase() : 'A'}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <h1 className={`font-['Playfair_Display',serif] text-base sm:text-2xl font-bold tracking-tight leading-tight truncate ${
                  isLight ? 'text-[#2D2926]' : 'text-[#F8F5F2]'
                }`}>
                  {config.name}
                </h1>
                <p className={`text-[9px] sm:text-xs font-bold tracking-widest uppercase mt-0.5 truncate hidden sm:block ${
                  isLight ? 'text-[#9B4B5A]' : 'text-[#D8A47F]'
                }`}>
                  {config.tagline || 'Elegância • Conforto • Autoestima'}
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por lingerie, conjunto, cor, tamanho..."
                className={`w-full rounded-full py-2 pl-10 pr-9 text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 ${
                  isLight
                    ? 'bg-white border border-[#E8E1DA] text-[#2D2926] placeholder-[#888888] focus:ring-[#9B4B5A]/20 focus:border-[#9B4B5A]'
                    : 'bg-[#1F1F1F] border border-[#2A2A2A] text-[#F8F5F2] placeholder-[#8A8A8A] focus:ring-[#D8A47F]/30 focus:border-[#D8A47F]'
                }`}
              />
              <Search className="w-4 h-4 text-[#8A8A8A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8A8A] hover:text-[#2D2926] p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Action Icons (sem botão 3 pontinhos e sem ícone de lupa solto no mobile) */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Palette Switcher Button */}
            <button
              type="button"
              onClick={() => {
                const nextPalette = palette === 'dark-allure' ? 'light-rose' : 'dark-allure';
                setPalette(nextPalette);
              }}
              className={`p-2 sm:px-2.5 sm:py-2 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 text-xs ${
                isLight
                  ? 'bg-white text-[#9B4B5A] border-[#E8E1DA] hover:bg-[#F5EFEB]'
                  : 'bg-[#1F1F1F] text-[#D8A47F] border-[#2A2A2A] hover:bg-[#2A2A2A]'
              }`}
              title={isLight ? 'Ativar Allure Dark Mode' : 'Ativar Paleta Rosé Clara'}
              aria-label="Alternar Tema de Cores"
            >
              <Palette className="w-4 h-4 shrink-0" />
              <span className="hidden lg:inline text-[10px] font-bold">
                {isLight ? 'Paleta Rosé' : 'Allure Dark'}
              </span>
            </button>

            {/* Client Order History Button */}
            <button
              type="button"
              onClick={() => setIsTrackingOpen(true)}
              className={`p-2 sm:px-3 sm:py-2 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 text-xs ${
                isLight
                  ? 'bg-white text-[#2D2926] border-[#E8E1DA] hover:border-[#9B4B5A] hover:text-[#9B4B5A]'
                  : 'bg-[#1F1F1F] text-[#F8F5F2] border-[#2A2A2A] hover:border-[#D8A47F] hover:text-[#D8A47F]'
              }`}
              title="Acompanhar meus pedidos e status"
              aria-label="Meus Pedidos"
            >
              <PackageCheck className="w-4 h-4 text-[#C75C5C] shrink-0" />
              <span className="hidden sm:inline font-semibold">Meus Pedidos</span>
            </button>

            {/* Shopping Cart Button with Count Badge in Rosa Allure #C75C5C */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 sm:px-4 sm:py-2.5 rounded-full bg-[#C75C5C] hover:bg-[#B34E4E] text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 shadow-lg transition-all cursor-pointer active:scale-95"
              aria-label="Ver Sacola de Compras"
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline font-semibold">Sacola</span>
              {cartItemCount > 0 && (
                <span className="bg-[#121212] text-[#F8F5F2] border border-[#D8A47F] font-bold text-[10px] sm:text-[11px] px-1 sm:px-1.5 py-0.2 rounded-full min-w-[17px] text-center shadow-xs">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Lupa de Pesquisa no Mobile (Linha Azul desenhada pelo usuário) */}
        <div className="md:hidden pb-2.5 pt-0.5">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por lingerie, conjunto, cor, tamanho..."
              className={`w-full rounded-full py-2 pl-9 pr-9 text-xs transition-all focus:outline-none focus:ring-2 ${
                isLight
                  ? 'bg-white border border-[#E8E1DA] text-[#2D2926] placeholder-[#888888] focus:ring-[#9B4B5A]/20 focus:border-[#9B4B5A]'
                  : 'bg-[#1F1F1F] border border-[#2A2A2A] text-[#F8F5F2] placeholder-[#8A8A8A] focus:ring-[#D8A47F]/30 focus:border-[#D8A47F]'
              }`}
            />
            <Search className="w-4 h-4 text-[#8A8A8A] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8A8A8A] hover:text-[#2D2926] p-1 cursor-pointer"
                title="Limpar busca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Navigation Pills (Horizontal Scroll) */}
        <div className={`flex items-center gap-2 overflow-x-auto no-scrollbar py-2.5 border-t text-xs font-medium ${
          isLight ? 'border-[#E8E1DA]' : 'border-[#2A2A2A]'
        }`}>
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              selectedCategory === null
                ? isLight
                  ? 'bg-[#9B4B5A] text-white font-bold shadow-xs'
                  : 'bg-[#D8A47F] text-[#121212] font-bold shadow-xs'
                : isLight
                  ? 'bg-white text-[#444444] hover:bg-[#FAF5F0] hover:text-[#2D2926] border border-[#E8E1DA]'
                  : 'bg-[#1F1F1F] text-[#E0E0E0] hover:bg-[#2A2A2A] hover:text-[#F8F5F2] border border-[#2A2A2A]'
            }`}
          >
            Todos os Produtos
          </button>
          {categories
            .filter((c) => c.isActive)
            .map((cat) => {
              const isSelected = selectedCategory === cat.slug || selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(isSelected ? null : cat.slug)}
                  className={`whitespace-nowrap px-3.5 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#C75C5C] text-white font-bold shadow-xs'
                      : isLight
                        ? 'bg-white text-[#444444] hover:bg-[#FAF5F0] hover:text-[#2D2926] border border-[#E8E1DA]'
                        : 'bg-[#1F1F1F] text-[#E0E0E0] hover:bg-[#2A2A2A] hover:text-[#F8F5F2] border border-[#2A2A2A]'
                  }`}
                >
                  <span>{cat.name}</span>
                </button>
              );
            })}
        </div>
      </div>

      </header>

      {/* Mobile Nav Drawer (Isolated from header backdrop-blur to eliminate glitches) */}
      <MobileNavDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpenAdminLogin={onOpenAdminLogin}
        onOpenOrderTracking={() => setIsTrackingOpen(true)}
      />

      {/* Client Order Tracking & Status Modal */}
      <ClientOrderTrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
      />
    </>
  );
};
