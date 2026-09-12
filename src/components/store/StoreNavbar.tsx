import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  ShoppingBag,
  Search,
  Lock,
  X,
  Sparkles,
  Phone,
  Instagram,
  MapPin,
  Menu,
  Shield,
  Store as StoreIcon,
  ChevronDown,
  MoreVertical,
  Palette,
} from 'lucide-react';
import { MobileNavDrawer } from './MobileNavDrawer';

interface StoreNavbarProps {
  onOpenAdminLogin: () => void;
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
    isMerchantAuthenticated,
    isSuperAdminAuthenticated,
    appRoute,
    setAppRoute,
    allStores,
    currentStoreId,
    selectStore,
    palette,
    setPalette,
  } = useStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isStorePickerOpen, setIsStorePickerOpen] = useState(false);

  const isLight = palette === 'light-rose';

  return (
    <>
      <header className={`sticky top-0 z-40 border-b transition-colors duration-200 ${
        isLight
          ? 'bg-[#FAF7F5]/95 backdrop-blur-md border-[#E8E1DA] text-[#2D2926]'
          : 'bg-[#121212]/95 backdrop-blur-md border-[#2A2A2A] text-[#F8F5F2]'
      }`}>
        {/* Top Announcement Bar & Route Tier Indicator */}
        <div className={`text-[11px] font-medium py-1.5 px-4 border-b ${
          isLight
            ? 'bg-white text-[#444444] border-[#E8E1DA]'
            : 'bg-[#1F1F1F] text-[#F8F5F2] border-[#2A2A2A]'
        }`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 truncate">
              <span className={`inline-flex items-center gap-1 font-semibold ${
                isLight ? 'text-[#9B4B5A]' : 'text-[#D8A47F]'
              }`}>
                <Sparkles className="w-3 h-3" />
                Allure Intimidades • @allure.intimidades
              </span>
              <span className="hidden md:inline text-white/20">|</span>
              <span className={`hidden md:inline truncate ${
                isLight ? 'text-[#666666]' : 'text-[#E0E0E0]'
              }`}>
                {config.announcementBar || 'Frete Grátis nas compras acima de R$ 199'}
              </span>
            </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Store Picker */}
            {allStores.length > 1 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsStorePickerOpen(!isStorePickerOpen)}
                  className="px-2 py-0.5 rounded bg-[#2A2A2A] hover:bg-[#333333] text-[#F8F5F2] text-[10px] font-medium flex items-center gap-1 transition-colors cursor-pointer border border-[#3A3A3A]"
                >
                  <StoreIcon className="w-3 h-3 text-[#D8A47F]" />
                  <span>Loja: {allStores.find((s) => s.id === currentStoreId)?.name || 'Allure'}</span>
                  <ChevronDown className="w-2.5 h-2.5 text-[#D8A47F]" />
                </button>

                {isStorePickerOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-[#1F1F1F] border border-[#2A2A2A] rounded-xl shadow-2xl z-50 p-1 divide-y divide-[#2A2A2A] text-xs">
                    {allStores.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          selectStore(s.id);
                          setIsStorePickerOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs cursor-pointer ${
                          s.id === currentStoreId
                            ? 'bg-[#C75C5C]/20 text-[#D8A47F] font-bold'
                            : 'text-[#E0E0E0] hover:bg-[#2A2A2A]'
                        }`}
                      >
                        <span>{s.name}</span>
                        {s.id === currentStoreId && <span className="text-[10px] text-[#D8A47F]">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Merchant Route Button */}
            <button
              type="button"
              onClick={() => {
                if (isMerchantAuthenticated) {
                  setAppRoute('merchant');
                } else {
                  onOpenAdminLogin();
                }
              }}
              className="text-[#E0E0E0] hover:text-[#D8A47F] hover:underline flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
              title="Acessar Área do Lojista da Loja Ativa"
            >
              <StoreIcon className="w-3 h-3 text-[#D8A47F]" />
              <span>Área do Lojista</span>
            </button>

            {/* Super Admin Route Button */}
            <button
              type="button"
              onClick={() => {
                if (isSuperAdminAuthenticated) {
                  setAppRoute('superadmin');
                } else {
                  onOpenAdminLogin();
                }
              }}
              className="text-[#D8A47F] hover:text-[#F8F5F2] hover:underline flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
              title="Acessar Área Master da Plataforma"
            >
              <Shield className="w-3 h-3 text-[#D8A47F]" />
              <span className="hidden sm:inline">Super Admin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 -ml-2 text-[#E0E0E0] hover:text-[#D8A47F] sm:hidden cursor-pointer"
            aria-label="Abrir menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory(null);
                setSearchQuery('');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-left cursor-pointer flex items-center gap-2.5 group"
            >
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#1F1F1F] text-[#D8A47F] flex items-center justify-center shadow-md border border-[#D8A47F]/40 group-hover:border-[#D8A47F] transition-all overflow-hidden">
                <span className="font-['Playfair_Display',serif] font-bold text-base sm:text-lg text-[#D8A47F]">
                  A
                </span>
              </div>
              <div>
                <h1 className="font-['Playfair_Display',serif] text-xl sm:text-2xl font-bold tracking-tight text-[#F8F5F2] leading-none">
                  {config.name}
                </h1>
                <p className="text-[10px] sm:text-xs text-[#D8A47F] font-medium tracking-widest uppercase mt-0.5">
                  Elegância • Conforto • Autoestima
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
                className="w-full bg-[#1F1F1F] border border-[#2A2A2A] rounded-full py-2 pl-10 pr-9 text-xs sm:text-sm text-[#F8F5F2] placeholder-[#8A8A8A] focus:outline-none focus:ring-2 focus:ring-[#D8A47F]/30 focus:border-[#D8A47F] transition-all"
              />
              <Search className="w-4 h-4 text-[#8A8A8A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8A8A] hover:text-[#F8F5F2] p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Mobile Search Icon Toggle */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-[#E0E0E0] hover:text-[#D8A47F] md:hidden cursor-pointer"
              aria-label="Buscar produtos"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Admin Switcher or Login Lock */}
            {isMerchantAuthenticated || isSuperAdminAuthenticated ? (
              <button
                type="button"
                onClick={() => setAppRoute(isSuperAdminAuthenticated ? 'superadmin' : 'merchant')}
                className="px-2.5 py-1.5 rounded-full text-xs font-semibold bg-[#1F1F1F] text-[#D8A47F] hover:bg-[#2A2A2A] transition-all flex items-center gap-1.5 cursor-pointer border border-[#D8A47F]/40"
                title="Acessar Painel Administrativo"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {isSuperAdminAuthenticated ? 'Super Admin' : 'Painel Allure'}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAdminLogin}
                className="p-2 text-[#A0A0A0] hover:text-[#D8A47F] transition-colors rounded-full hover:bg-[#1F1F1F] cursor-pointer"
                title="Acesso Administrativo (Lojista / Super Admin)"
                aria-label="Acesso Administrativo"
              >
                <Lock className="w-4 h-4" />
              </button>
            )}

            {/* Palette Switcher Button */}
            <button
              type="button"
              onClick={() => {
                const nextPalette = palette === 'dark-allure' ? 'light-rose' : 'dark-allure';
                setPalette(nextPalette);
              }}
              className={`p-2 rounded-full border transition-all cursor-pointer flex items-center gap-1 text-xs ${
                isLight
                  ? 'bg-white text-[#9B4B5A] border-[#E8E1DA] hover:bg-[#F5EFEB]'
                  : 'bg-[#1F1F1F] text-[#D8A47F] border-[#2A2A2A] hover:bg-[#2A2A2A]'
              }`}
              title={isLight ? 'Ativar Allure Dark Mode' : 'Ativar Paleta Rosé Clara Anterior'}
              aria-label="Alternar Paleta de Cores"
            >
              <Palette className="w-4 h-4" />
              <span className="hidden lg:inline text-[10px] font-bold">
                {isLight ? 'Paleta Rosé' : 'Allure Dark'}
              </span>
            </button>

            {/* Shopping Cart Button with Count Badge in Rosa Allure #C75C5C */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 sm:px-4 sm:py-2.5 rounded-full bg-[#C75C5C] hover:bg-[#B34E4E] text-white font-medium text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95"
              aria-label="Ver Sacola de Compras"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline font-semibold">Sacola</span>
              {cartItemCount > 0 && (
                <span className="bg-[#121212] text-[#F8F5F2] border border-[#D8A47F] font-bold text-[11px] px-1.5 py-0.2 rounded-full min-w-[18px] text-center shadow-xs">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Three Dots More Options Menu (Resolve o bug do três pontinho) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className={`p-2 rounded-full transition-colors cursor-pointer sm:hidden ${
                isLight
                  ? 'text-[#2D2926] hover:bg-white'
                  : 'text-[#E0E0E0] hover:text-[#D8A47F] hover:bg-[#1F1F1F]'
              }`}
              title="Mais opções, categorias e paletas"
              aria-label="Mais opções"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Expanded Search Bar */}
        {isSearchOpen && (
          <div className="pb-3 md:hidden">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar lingeries, conjuntos, cor..."
                className="w-full bg-[#1F1F1F] border border-[#2A2A2A] rounded-full py-2 pl-10 pr-9 text-xs text-[#F8F5F2] placeholder-[#8A8A8A] focus:outline-none focus:ring-2 focus:ring-[#D8A47F]/30"
                autoFocus
              />
              <Search className="w-4 h-4 text-[#8A8A8A] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8A8A] p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Category Navigation Pills (Horizontal Scroll) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2.5 border-t border-[#2A2A2A] text-xs font-medium">
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              selectedCategory === null
                ? 'bg-[#D8A47F] text-[#121212] font-bold shadow-xs'
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
      />
    </>
  );
};
