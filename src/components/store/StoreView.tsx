import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { HeroBanner } from './HeroBanner';
import { ProductCard } from './ProductCard';
import { ProductDetailModal } from './ProductDetailModal';
import { Product } from '../../types';
import {
  Sparkles,
  Filter,
  Instagram,
  Phone,
  MapPin,
  Heart,
  ChevronRight,
} from 'lucide-react';
import { openWhatsAppChat } from '../../utils/whatsappOrder';

export const StoreView: React.FC = () => {
  const {
    config,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    filteredProducts,
    newArrivals,
    filterNovidadesOnly,
    setFilterNovidadesOnly,
    palette,
  } = useStore();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const activeCategoryObj = categories.find(
    (c) => c.slug === selectedCategory || c.id === selectedCategory
  );

  const isLight = palette === 'light-rose';

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        isLight ? 'bg-[#FAF7F5] text-[#2D2926]' : 'bg-[#121212] text-[#F8F5F2]'
      }`}
    >
      {/* Hero Banner (Only shown when not actively filtering by search) */}
      {!searchQuery && !selectedCategory && !filterNovidadesOnly && <HeroBanner />}

      {/* Catálogo de Novidades Showcase (quando houver peças marcadas como novidade) */}
      {!searchQuery && newArrivals.length > 0 && (
        <section
          className={`border-y py-3 sm:py-6 px-3 sm:px-6 lg:px-8 transition-colors ${
            isLight
              ? 'bg-white border-[#E8E1DA]'
              : 'bg-gradient-to-r from-[#181818] via-[#1F1F1F] to-[#181818] border-[#2A2A2A]'
          }`}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between gap-2 mb-2 sm:mb-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#C75C5C] text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider shadow-xs">
                  <Sparkles className="w-3 h-3" />
                  Novidades
                </span>
                <h3
                  className={`font-['Playfair_Display',serif] text-base sm:text-2xl font-bold ${
                    isLight ? 'text-[#2D2926]' : 'text-[#F8F5F2]'
                  }`}
                >
                  Lançamentos Recentes
                </h3>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFilterNovidadesOnly(!filterNovidadesOnly);
                  const el = document.getElementById('catalog-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  filterNovidadesOnly
                    ? 'bg-[#C75C5C] text-white shadow-xs'
                    : isLight
                    ? 'bg-[#FAF7F5] border border-[#E8E1DA] text-[#9B4B5A] hover:bg-[#F0EAE4]'
                    : 'bg-[#1F1F1F] border border-[#2A2A2A] text-[#F8F5F2] hover:border-[#D8A47F]'
                }`}
              >
                <span>{filterNovidadesOnly ? 'Ver Todos' : 'Filtrar'}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Compact Horizontal scroll of novidades cards */}
            <div className="flex gap-2.5 sm:gap-4 overflow-x-auto pb-2 pt-0.5 snap-x no-scrollbar">
              {newArrivals.map((prod) => (
                <div
                  key={`novidade-${prod.id}`}
                  onClick={() => setSelectedProduct(prod)}
                  className={`min-w-[145px] sm:min-w-[220px] max-w-[160px] sm:max-w-[240px] snap-start rounded-xl sm:rounded-2xl border p-2 sm:p-3 shadow-xs transition-all cursor-pointer group flex flex-col justify-between shrink-0 ${
                    isLight
                      ? 'bg-[#FAF7F5] border-[#E8E1DA] hover:border-[#9B4B5A]'
                      : 'bg-[#1F1F1F] border-[#2A2A2A] hover:border-[#D8A47F]/60'
                  }`}
                >
                  <div className="relative aspect-3/4 rounded-lg overflow-hidden bg-[#141414] mb-2">
                    <img
                      src={prod.images[0] || 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&q=80&w=400'}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-1.5 left-1.5 bg-[#C75C5C] text-white text-[9px] font-black px-2 py-0.2 rounded-full flex items-center gap-0.5 shadow-sm">
                      <Sparkles className="w-2 h-2" />
                      <span>{prod.newArrivalBadge || 'Novo'}</span>
                    </div>
                  </div>

                  <div>
                    <h4
                      className={`font-['Playfair_Display',serif] text-xs sm:text-sm font-bold line-clamp-1 transition-colors ${
                        isLight
                          ? 'text-[#2D2926] group-hover:text-[#9B4B5A]'
                          : 'text-[#F8F5F2] group-hover:text-[#D8A47F]'
                      }`}
                    >
                      {prod.name}
                    </h4>
                    <p
                      className={`text-xs font-bold mt-0.5 ${
                        isLight ? 'text-[#9B4B5A]' : 'text-[#D8A47F]'
                      }`}
                    >
                      R$ {(prod.promoPrice || prod.price).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories Visual Highlights Section - Compact 3-col on mobile */}
      {!searchQuery && !selectedCategory && !filterNovidadesOnly && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-5 w-full">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3
                className={`font-['Playfair_Display',serif] text-base sm:text-xl font-bold ${
                  isLight ? 'text-[#2D2926]' : 'text-[#F8F5F2]'
                }`}
              >
                Compre por Categoria
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.slug);
                  const el = document.getElementById('catalog-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`group relative rounded-xl sm:rounded-2xl overflow-hidden aspect-4/5 border transition-all cursor-pointer text-left shadow-xs ${
                  isLight
                    ? 'bg-white border-[#E8E1DA] hover:border-[#9B4B5A]'
                    : 'bg-[#1F1F1F] border-[#2A2A2A] hover:border-[#D8A47F]/60'
                }`}
              >
                <img
                  src={cat.imageUrl || 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&q=80&w=400'}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-1.5 sm:p-2.5">
                  <span className="text-[11px] sm:text-xs font-bold text-[#F8F5F2] leading-tight line-clamp-1">
                    {cat.name}
                  </span>
                  <span className="hidden sm:flex text-[9px] text-[#D8A47F] items-center gap-0.5 mt-0.5">
                    Ver <ChevronRight className="w-2 h-2" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Catalog Grid Section */}
      <section id="catalog-section" className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 flex-1 w-full">
        {/* Section Header */}
        <div
          className={`space-y-2.5 pb-3 border-b ${
            isLight ? 'border-[#E8E1DA]' : 'border-[#2A2A2A]'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h2
                  className={`font-['Playfair_Display',serif] text-lg sm:text-2xl font-bold ${
                    isLight ? 'text-[#2D2926]' : 'text-[#F8F5F2]'
                  }`}
                >
                  {filterNovidadesOnly
                    ? 'Catálogo de Novidades'
                    : activeCategoryObj
                    ? activeCategoryObj.name
                    : searchQuery
                    ? `Busca: "${searchQuery}"`
                    : 'Catálogo de Peças'}
                </h2>
                {(selectedCategory || filterNovidadesOnly) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory(null);
                      setFilterNovidadesOnly(false);
                    }}
                    className={`text-xs font-semibold cursor-pointer underline ${
                      isLight ? 'text-[#9B4B5A]' : 'text-[#D8A47F]'
                    }`}
                  >
                    (Limpar filtros)
                  </button>
                )}
              </div>
              <p
                className={`text-[11px] sm:text-xs mt-0.5 ${
                  isLight ? 'text-[#7A7067]' : 'text-[#A0A0A0]'
                }`}
              >
                {filteredProducts.length} {filteredProducts.length === 1 ? 'peça disponível' : 'peças disponíveis'}
              </p>
            </div>

            {/* WhatsApp Support CTA */}
            <button
              type="button"
              onClick={() => openWhatsAppChat(config.whatsapp, `Olá! Gostaria de consultoria no catálogo da ${config.name || 'Allure Intimidades'}.`)}
              className={`self-start sm:self-auto px-3 py-1.5 rounded-full border transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                isLight
                  ? 'bg-white text-[#9B4B5A] border-[#E8E1DA] hover:bg-[#FAF7F5]'
                  : 'bg-[#1F1F1F] text-[#D8A47F] border-[#D8A47F]/40 hover:bg-[#2A2A2A]'
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Consultoria no WhatsApp</span>
            </button>
          </div>

          {/* Quick Filter Pills (Horizontal & Compact) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory(null);
                setFilterNovidadesOnly(false);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                !selectedCategory && !filterNovidadesOnly
                  ? 'bg-[#C75C5C] text-white font-bold shadow-xs'
                  : isLight
                  ? 'bg-white border border-[#E8E1DA] text-[#666666] hover:bg-[#FAF7F5]'
                  : 'bg-[#1F1F1F] border border-[#2A2A2A] text-[#E0E0E0] hover:bg-[#2A2A2A]'
              }`}
            >
              Todas as Peças
            </button>

            {newArrivals.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory(null);
                  setFilterNovidadesOnly(!filterNovidadesOnly);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all flex items-center gap-1 cursor-pointer ${
                  filterNovidadesOnly
                    ? 'bg-[#C75C5C] text-white shadow-xs'
                    : isLight
                    ? 'bg-white border border-[#E8E1DA] text-[#9B4B5A] hover:bg-[#FAF7F5]'
                    : 'bg-[#1F1F1F] border border-[#2A2A2A] text-[#D8A47F] hover:bg-[#2A2A2A]'
                }`}
              >
                <Sparkles className="w-3 h-3" />
                <span>Novidades ({newArrivals.length})</span>
              </button>
            )}

            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.slug || selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setFilterNovidadesOnly(false);
                    setSelectedCategory(isSelected ? null : cat.slug);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#C75C5C] text-white shadow-xs font-semibold'
                      : isLight
                      ? 'bg-white border border-[#E8E1DA] text-[#444444] hover:bg-[#FAF7F5]'
                      : 'bg-[#1F1F1F] border border-[#2A2A2A] text-[#E0E0E0] hover:bg-[#2A2A2A]'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 pt-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={(p) => setSelectedProduct(p)}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#1F1F1F] border border-[#2A2A2A] flex items-center justify-center mx-auto text-[#D8A47F]">
              <Filter className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-['Playfair_Display',serif] text-lg font-bold text-[#F8F5F2]">
                Nenhum produto encontrado
              </h3>
              <p className="text-xs text-[#A0A0A0] max-w-sm mx-auto">
                Não encontramos produtos para esta combinação de busca ou categoria. Experimente limpar os filtros.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory(null);
                setSearchQuery('');
              }}
              className="px-5 py-2.5 rounded-full bg-[#C75C5C] text-white text-xs font-bold hover:bg-[#B34E4E] transition-all cursor-pointer"
            >
              Ver Todas as Peças
            </button>
          </div>
        )}
      </section>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Footer */}
      <footer
        className={`mt-10 sm:mt-16 border-t transition-colors ${
          isLight
            ? 'bg-white text-[#666666] border-[#E8E1DA]'
            : 'bg-[#161616] text-[#A0A0A0] border-[#2A2A2A]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold overflow-hidden ${
                    isLight
                      ? 'bg-white text-[#9B4B5A] border-[#E8E1DA]'
                      : 'bg-[#1F1F1F] text-[#D8A47F] border-[#D8A47F]/40'
                  }`}
                >
                  {config.logo ? (
                    <img src={config.logo} alt={config.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    config.name ? config.name.charAt(0).toUpperCase() : 'A'
                  )}
                </div>
                <span
                  className={`font-['Playfair_Display',serif] font-bold text-base sm:text-lg ${
                    isLight ? 'text-[#2D2926]' : 'text-[#F8F5F2]'
                  }`}
                >
                  {config.name}
                </span>
              </div>
              <p className="text-xs leading-relaxed opacity-80">
                {config.tagline || 'Elegância, conforto e sensualidade em cada detalhe da nossa alta costura íntima.'}
              </p>
            </div>

            <div className="space-y-2">
              <h4
                className={`text-xs font-bold uppercase tracking-wider ${
                  isLight ? 'text-[#2D2926]' : 'text-[#F8F5F2]'
                }`}
              >
                Atendimento
              </h4>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <a
                    href={`https://wa.me/${(config.whatsapp || config.phone).replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 transition-colors hover:text-[#C75C5C] hover:underline"
                    title="Conversar pelo WhatsApp"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#C75C5C]" />
                    <span className="font-semibold">{config.phone || config.whatsapp}</span>
                  </a>
                </li>
                {config.instagram && (
                  <li>
                    <a
                      href={`https://instagram.com/${config.instagram.replace('@', '').trim()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 transition-colors hover:text-[#C75C5C] hover:underline"
                      title="Visitar nosso Instagram"
                    >
                      <Instagram className="w-3.5 h-3.5 text-[#C75C5C]" />
                      <span>{config.instagram}</span>
                    </a>
                  </li>
                )}
                {config.address && (
                  <li>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2 transition-colors hover:text-[#C75C5C] hover:underline"
                      title="Ver endereço no Google Maps"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#C75C5C] shrink-0 mt-0.5" />
                      <span className="truncate">{config.address}</span>
                    </a>
                  </li>
                )}
              </ul>
            </div>

            <div className="space-y-2 hidden sm:block">
              <h4
                className={`text-xs font-bold uppercase tracking-wider ${
                  isLight ? 'text-[#2D2926]' : 'text-[#F8F5F2]'
                }`}
              >
                Categorias
              </h4>
              <ul className="space-y-1 text-xs">
                {categories.slice(0, 4).map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory(c.slug);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="hover:text-[#C75C5C] transition-colors cursor-pointer"
                    >
                      {c.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h4
                className={`text-xs font-bold uppercase tracking-wider ${
                  isLight ? 'text-[#2D2926]' : 'text-[#F8F5F2]'
                }`}
              >
                Segurança & Garantia
              </h4>
              <p className="text-xs leading-relaxed opacity-80">
                Embalagens discretas sem identificação do conteúdo externo.
              </p>
              <div className="pt-0.5">
                <span
                  className={`inline-block px-2.5 py-1 rounded-md border text-[10px] font-semibold ${
                    isLight
                      ? 'bg-[#FAF7F5] border-[#E8E1DA] text-[#9B4B5A]'
                      : 'bg-[#1F1F1F] border-[#2A2A2A] text-[#D8A47F]'
                  }`}
                >
                  Compra Segura via WhatsApp
                </span>
              </div>
            </div>
          </div>

          <div
            className={`pt-6 mt-6 border-t text-center text-xs flex flex-col sm:flex-row items-center justify-between gap-2 ${
              isLight
                ? 'border-[#E8E1DA] text-[#888888]'
                : 'border-[#2A2A2A] text-[#777777]'
            }`}
          >
            <p>© 2026 {config.name}. Todos os direitos reservados.</p>
            <p className="flex items-center gap-1">
              Desenvolvido com <Heart className="w-3 h-3 text-[#C75C5C] fill-current" /> para {config.ownerName}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
