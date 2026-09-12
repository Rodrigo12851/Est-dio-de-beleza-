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
} from 'lucide-react';

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
  } = useStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isStorePickerOpen, setIsStorePickerOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#FDFBF9]/95 backdrop-blur-md border-b border-[#F0EAE1]">
      {/* Top Announcement Bar & Route Tier Indicator */}
      <div className="bg-[#2D2926] text-[#FDF7F8] text-[11px] font-medium py-1.5 px-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 truncate">
            <span className="inline-flex items-center gap-1 text-[#F5C7D0] font-semibold">
              <Sparkles className="w-3 h-3 text-[#F5C7D0]" />
              Rota Pública do Cliente
            </span>
            <span className="hidden md:inline text-white/40">|</span>
            <span className="hidden md:inline text-white/80 truncate">
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
                  className="px-2 py-0.5 rounded bg-white/10 hover:bg-white/15 text-white text-[10px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <StoreIcon className="w-3 h-3 text-amber-300" />
                  <span>Loja: {allStores.find((s) => s.id === currentStoreId)?.name || 'Bella'}</span>
                  <ChevronDown className="w-2.5 h-2.5" />
                </button>

                {isStorePickerOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-[#282523] border border-white/20 rounded-xl shadow-xl z-50 p-1 divide-y divide-white/10 text-xs">
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
                            ? 'bg-amber-500/20 text-amber-300 font-bold'
                            : 'text-[#EDE7DF] hover:bg-white/5'
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
              className="text-white/80 hover:text-white hover:underline flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
              title="Acessar Área do Lojista da Loja Ativa"
            >
              <StoreIcon className="w-3 h-3 text-[#F5C7D0]" />
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
              className="text-amber-300/90 hover:text-amber-200 hover:underline flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
              title="Acessar Área Master da Plataforma"
            >
              <Shield className="w-3 h-3 text-amber-400" />
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
            className="p-2 -ml-2 text-[#4A423D] hover:text-[#9B4B5A] sm:hidden cursor-pointer"
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
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#9B4B5A] text-white flex items-center justify-center shadow-xs group-hover:bg-[#843A48] transition-colors overflow-hidden border border-[#DDA8B3]">
                <img
                  src="/icon.svg"
                  alt={config.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="font-['Playfair_Display',serif] text-xl sm:text-2xl font-bold tracking-tight text-[#2D2926] leading-none">
                  {config.name}
                </h1>
                <p className="text-[10px] sm:text-xs text-[#8A7E76] font-medium tracking-widest uppercase mt-0.5">
                  Lingerie & Moda Íntima
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
                placeholder="Buscar por conjunto, calcinha, sutiã, cor..."
                className="w-full bg-[#F5F0EA] border border-[#E8DFD5] rounded-full py-2 pl-10 pr-9 text-xs sm:text-sm text-[#2D2926] placeholder-[#9E948C] focus:outline-none focus:ring-2 focus:ring-[#9B4B5A]/30 focus:border-[#9B4B5A] transition-all"
              />
              <Search className="w-4 h-4 text-[#8A7E76] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A7E76] hover:text-[#2D2926] p-1 cursor-pointer"
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
              className="p-2 text-[#4A423D] hover:text-[#9B4B5A] md:hidden cursor-pointer"
              aria-label="Buscar produtos"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Admin Switcher or Login Lock */}
            {isMerchantAuthenticated || isSuperAdminAuthenticated ? (
              <button
                type="button"
                onClick={() => setAppRoute(isSuperAdminAuthenticated ? 'superadmin' : 'merchant')}
                className="px-2.5 py-1.5 rounded-full text-xs font-semibold bg-[#9B4B5A]/10 text-[#9B4B5A] hover:bg-[#9B4B5A]/20 transition-all flex items-center gap-1.5 cursor-pointer border border-[#9B4B5A]/20"
                title="Acessar Painel Administrativo"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {isSuperAdminAuthenticated ? 'Super Admin' : 'Painel da Dona'}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAdminLogin}
                className="p-2 text-[#7D756D] hover:text-[#9B4B5A] transition-colors rounded-full hover:bg-[#F5F0EA] cursor-pointer"
                title="Acesso Administrativo (Lojista / Super Admin)"
                aria-label="Acesso Administrativo"
              >
                <Lock className="w-4 h-4" />
              </button>
            )}

            {/* Shopping Cart Button with Count Badge */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 sm:px-4 sm:py-2.5 rounded-full bg-[#9B4B5A] hover:bg-[#843A48] text-white font-medium text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
              aria-label="Ver Carrinho de Compras"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline font-semibold">Sacola</span>
              {cartItemCount > 0 && (
                <span className="bg-white text-[#9B4B5A] font-bold text-[11px] px-1.5 py-0.2 rounded-full min-w-[18px] text-center shadow-xs">
                  {cartItemCount}
                </span>
              )}
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
                placeholder="Buscar produtos..."
                className="w-full bg-[#F5F0EA] border border-[#E8DFD5] rounded-full py-2 pl-10 pr-9 text-xs text-[#2D2926] placeholder-[#9E948C] focus:outline-none focus:ring-2 focus:ring-[#9B4B5A]/30"
                autoFocus
              />
              <Search className="w-4 h-4 text-[#8A7E76] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A7E76] p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Category Navigation Pills (Horizontal Scroll) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2.5 border-t border-[#F5F0EA] text-xs font-medium">
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
              selectedCategory === null
                ? 'bg-[#2D2926] text-white shadow-xs'
                : 'bg-[#F5F0EA] text-[#59524C] hover:bg-[#EAE4DD] hover:text-[#2D2926]'
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
                      ? 'bg-[#9B4B5A] text-white shadow-xs'
                      : 'bg-[#F5F0EA] text-[#59524C] hover:bg-[#EAE4DD] hover:text-[#2D2926]'
                  }`}
                >
                  <span>{cat.name}</span>
                </button>
              );
            })}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs sm:hidden">
          <div className="absolute inset-y-0 left-0 w-4/5 max-w-xs bg-[#FDFBF9] shadow-xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#F0EAE1]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#9B4B5A] text-white flex items-center justify-center">
                    <img src="/icon.svg" alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <span className="font-['Playfair_Display',serif] font-bold text-lg text-[#2D2926]">
                    {config.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 text-[#7D756D] hover:text-[#2D2926]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#8A7E76] px-3 mb-2">
                  Categorias
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory(null);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    selectedCategory === null ? 'bg-[#9B4B5A] text-white' : 'text-[#4A423D] hover:bg-[#F5F0EA]'
                  }`}
                >
                  Todos os Produtos
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.slug);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      selectedCategory === cat.slug ? 'bg-[#9B4B5A] text-white' : 'text-[#4A423D] hover:bg-[#F5F0EA]'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#F0EAE1] space-y-3 text-xs text-[#7D756D]">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#9B4B5A]" />
                <span>{config.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Instagram className="w-4 h-4 text-[#9B4B5A]" />
                <span>{config.instagram}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#9B4B5A]" />
                <span className="truncate">{config.address}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
