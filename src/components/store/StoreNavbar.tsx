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
    newArrivals,
    setFilterNovidadesOnly,
  } = useStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isStorePickerOpen, setIsStorePickerOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

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
            ? 'bg-[#F7F2ED] text-[#444444] border-[#E8E1DA]'
            : 'bg-[#1F1F1F] text-[#F8F5F2] border-[#2A2A2A]'
        }`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 truncate">
              <span className={`inline-flex items-center gap-1 font-bold ${
                isLight ? 'text-[#9B4B5A]' : 'text-[#D8A47F]'
              }`}>
                <Sparkles className="w-3 h-3" />
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

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Store Picker */}
            {allStores.length > 1 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsStorePickerOpen(!isStorePickerOpen)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 transition-colors cursor-pointer border ${
                    isLight
                      ? 'bg-white hover:bg-zinc-50 text-[#2D2926] border-[#E8E1DA]'
                      : 'bg-[#2A2A2A] hover:bg-[#333333] text-[#F8F5F2] border-[#3A3A3A]'
                  }`}
                >
                  <StoreIcon className={`w-3 h-3 ${isLight ? 'text-[#9B4B5A]' : 'text-[#D8A47F]'}`} />
                  <span>Loja: {allStores.find((s) => s.id === currentStoreId)?.name || 'Allure'}</span>
                  <ChevronDown className={`w-2.5 h-2.5 ${isLight ? 'text-[#9B4B5A]' : 'text-[#D8A47F]'}`} />
                </button>

                {isStorePickerOpen && (
                  <div className={`absolute right-0 mt-1 w-48 rounded-xl shadow-2xl z-50 p-1 divide-y text-xs border ${
                    isLight
                      ? 'bg-white border-[#E8E1DA] divide-[#F0EBE6]'
                      : 'bg-[#1F1F1F] border-[#2A2A2A] divide-[#2A2A2A]'
                  }`}>
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
                            ? isLight ? 'bg-[#FAF2F4] text-[#9B4B5A] font-bold' : 'bg-[#C75C5C]/20 text-[#D8A47F] font-bold'
                            : isLight ? 'text-[#444444] hover:bg-[#FAF7F5]' : 'text-[#E0E0E0] hover:bg-[#2A2A2A]'
                        }`}
                      >
                        <span>{s.name}</span>
                        {s.id === currentStoreId && <span className="text-[10px]">✓</span>}
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
              className={`hover:underline flex items-center gap-1 text-[11px] font-semibold cursor-pointer ${
                isLight ? 'text-[#555555] hover:text-[#9B4B5A]' : 'text-[#E0E0E0] hover:text-[#D8A47F]'
              }`}
              title="Acessar Área do Lojista da Loja Ativa"
            >
              <StoreIcon className={`w-3 h-3 ${isLight ? 'text-[#9B4B5A]' : 'text-[#D8A47F]'}`} />
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
              className={`hover:underline flex items-center gap-1 text-[11px] font-semibold cursor-pointer ${
                isLight ? 'text-[#9B4B5A] hover:text-[#7A3644]' : 'text-[#D8A47F] hover:text-[#F8F5F2]'
              }`}
              title="Acessar Área Master da Plataforma"
            >
              <Shield className={`w-3 h-3 ${isLight ? 'text-[#9B4B5A]' : 'text-[#D8A47F]'}`} />
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
            className={`p-2 -ml-2 sm:hidden cursor-pointer ${
              isLight ? 'text-[#2D2926] hover:text-[#9B4B5A]' : 'text-[#E0E0E0] hover:text-[#D8A47F]'
            }`}
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
              <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shadow-md transition-all overflow-hidden border ${
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
                  <span className={`font-['Playfair_Display',serif] font-bold text-base sm:text-lg ${
                    isLight ? 'text-[#9B4B5A]' : 'text-[#D8A47F]'
                  }`}>
                    {config.name ? config.name.charAt(0).toUpperCase() : 'A'}
                  </span>
                )}
              </div>
              <div>
                <h1 className={`font-['Playfair_Display',serif] text-xl sm:text-2xl font-bold tracking-tight leading-none ${
                  isLight ? 'text-[#2D2926]' : 'text-[#F8F5F2]'
                }`}>
                  {config.name}
                </h1>
                <p className={`text-[10px] sm:text-xs font-bold tracking-widest uppercase mt-0.5 ${
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

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Mobile Search Icon Toggle */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`p-2 md:hidden cursor-pointer ${
                isLight ? 'text-[#2D2926] hover:text-[#9B4B5A]' : 'text-[#E0E0E0] hover:text-[#D8A47F]'
              }`}
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

            {/* Three Dots More Options Menu - Popover Direto sem Bug */}
            <div className="relative sm:hidden">
              <button
                type="button"
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                className={`p-2 rounded-full transition-colors cursor-pointer ${
                  isLight
                    ? 'text-[#2D2926] hover:bg-[#F0EBE6]'
                    : 'text-[#E0E0E0] hover:text-[#D8A47F] hover:bg-[#1F1F1F]'
                }`}
                title="Mais opções e configurações"
                aria-label="Mais opções"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {/* Dropdown Menu Flutuante */}
              {isMoreMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-50 bg-black/40"
                    onClick={() => setIsMoreMenuOpen(false)}
                    aria-hidden="true"
                  />
                  <div
                    className={`absolute right-0 top-full mt-2 w-56 rounded-2xl shadow-2xl border p-2 z-50 transition-all ${
                      isLight
                        ? 'bg-white border-[#E8E1DA] text-[#2D2926]'
                        : 'bg-[#1C1C1C] border-[#2A2A2A] text-[#F8F5F2]'
                    }`}
                  >
                    <div className="px-3 py-2 border-b border-inherit mb-1">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-[#9B4B5A]">
                        Configurações Rápidas
                      </p>
                    </div>

                    {/* Alternar Paleta de Cores (Paleta de antes vs Dark) */}
                    <button
                      type="button"
                      onClick={() => {
                        setPalette(palette === 'dark-allure' ? 'light-rose' : 'dark-allure');
                        setIsMoreMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                        isLight ? 'hover:bg-[#FAF7F5]' : 'hover:bg-[#252525]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Palette className="w-4 h-4 text-[#C75C5C]" />
                        <span>{isLight ? 'Mudar p/ Allure Dark' : 'Voltar p/ Paleta Rosé'}</span>
                      </div>
                    </button>

                    {/* Ver Novidades */}
                    {newArrivals.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setFilterNovidadesOnly(true);
                          setSelectedCategory(null);
                          setIsMoreMenuOpen(false);
                          const el = document.getElementById('catalog-section');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                          isLight ? 'hover:bg-[#FAF7F5]' : 'hover:bg-[#252525]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[#D8A47F]" />
                          <span>Ver Novidades ({newArrivals.length})</span>
                        </div>
                      </button>
                    )}

                    {/* Ver Menu Completo / Categorias */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        setIsMobileMenuOpen(true);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                        isLight ? 'hover:bg-[#FAF7F5]' : 'hover:bg-[#252525]'
                      }`}
                    >
                      <Menu className="w-4 h-4 text-[#A0A0A0]" />
                      <span>Todas as Categorias</span>
                    </button>

                    {/* WhatsApp */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        window.open(`https://wa.me/${config.whatsapp || '5500000000000'}`, '_blank');
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                        isLight ? 'hover:bg-[#FAF7F5]' : 'hover:bg-[#252525]'
                      }`}
                    >
                      <Phone className="w-4 h-4 text-emerald-500" />
                      <span>Falar no WhatsApp</span>
                    </button>

                    <div className="my-1 border-t border-inherit" />

                    {/* Admin */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        if (isMerchantAuthenticated || isSuperAdminAuthenticated) {
                          setAppRoute(isSuperAdminAuthenticated ? 'superadmin' : 'merchant');
                        } else {
                          onOpenAdminLogin();
                        }
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                        isLight ? 'hover:bg-[#FAF7F5] text-[#9B4B5A]' : 'hover:bg-[#252525] text-[#D8A47F]'
                      }`}
                    >
                      <Lock className="w-4 h-4" />
                      <span>Área do Lojista</span>
                    </button>
                  </div>
                </>
              )}
            </div>
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
                className={`w-full rounded-full py-2 pl-10 pr-9 text-xs transition-all focus:outline-none focus:ring-2 ${
                  isLight
                    ? 'bg-white border border-[#E8E1DA] text-[#2D2926] placeholder-[#888888] focus:ring-[#9B4B5A]/20'
                    : 'bg-[#1F1F1F] border border-[#2A2A2A] text-[#F8F5F2] placeholder-[#8A8A8A] focus:ring-[#D8A47F]/30'
                }`}
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
      />
    </>
  );
};
