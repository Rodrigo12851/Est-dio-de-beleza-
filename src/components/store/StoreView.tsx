import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { HeroBanner } from './HeroBanner';
import { ProductCard } from './ProductCard';
import { ProductDetailModal } from './ProductDetailModal';
import { AiColorMatchingBar, ColorMood } from './AiColorMatchingBar';
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
  } = useStore();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeMood, setActiveMood] = useState<ColorMood>('noite');

  const activeCategoryObj = categories.find(
    (c) => c.slug === selectedCategory || c.id === selectedCategory
  );

  return (
    <div className="min-h-screen bg-[#121212] text-[#F8F5F2] flex flex-col">
      {/* Hero Banner (Only shown when not actively filtering by search) */}
      {!searchQuery && !selectedCategory && !filterNovidadesOnly && <HeroBanner />}

      {/* AI Color Matching Bar (Color psychology & moods: Noite Allure, Champanhe Rosé, Conforto Diário, Sedução Marcante) */}
      {!searchQuery && (
        <AiColorMatchingBar
          activeMood={activeMood}
          onSelectMood={setActiveMood}
        />
      )}

      {/* Catálogo de Novidades Showcase (quando houver peças marcadas como novidade) */}
      {!searchQuery && newArrivals.length > 0 && (
        <section className="bg-gradient-to-r from-[#181818] via-[#1F1F1F] to-[#181818] border-y border-[#2A2A2A] py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D8A47F] text-[#121212] text-xs font-black uppercase tracking-wider shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-[#121212] animate-pulse" />
                    Acabaram de Chegar
                  </span>
                  <span className="text-xs text-[#E0E0E0] font-medium hidden sm:inline">
                    Disponíveis por tempo determinado no catálogo de novidades
                  </span>
                </div>
                <h3 className="font-['Playfair_Display',serif] text-2xl sm:text-3xl font-bold text-[#F8F5F2] mt-1">
                  Catálogo de Novidades & Lançamentos
                </h3>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFilterNovidadesOnly(!filterNovidadesOnly);
                  const el = document.getElementById('catalog-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  filterNovidadesOnly
                    ? 'bg-[#C75C5C] text-white shadow-md'
                    : 'bg-[#1F1F1F] border border-[#2A2A2A] text-[#F8F5F2] hover:border-[#D8A47F]'
                }`}
              >
                <span>{filterNovidadesOnly ? 'Mostrando Somente Novidades' : 'Ver Todas as Novidades'}</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#D8A47F]" />
              </button>
            </div>

            {/* Horizontal scroll of novidades cards */}
            <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x scrollbar-thin">
              {newArrivals.map((prod) => (
                <div
                  key={`novidade-${prod.id}`}
                  onClick={() => setSelectedProduct(prod)}
                  className="min-w-[220px] sm:min-w-[260px] max-w-[260px] snap-start bg-[#1F1F1F] rounded-2xl border border-[#2A2A2A] hover:border-[#D8A47F]/60 p-3 shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="relative aspect-3/4 rounded-xl overflow-hidden bg-[#141414] mb-3">
                    <img
                      src={prod.images[0] || 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&q=80&w=400'}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2 bg-[#D8A47F] text-[#121212] text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                      <Sparkles className="w-2.5 h-2.5 text-[#121212]" />
                      <span>{prod.newArrivalBadge || 'Recém-chegado'}</span>
                    </div>
                    {prod.newArrivalDays && (
                      <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-xs text-[#F8F5F2] text-[9px] font-medium px-2 py-1 rounded-lg text-center border border-white/10">
                        ⏳ Mantido por {prod.newArrivalDays} dias em estoque novo
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-['Playfair_Display',serif] text-sm font-bold text-[#F8F5F2] line-clamp-1 group-hover:text-[#D8A47F] transition-colors">
                      {prod.name}
                    </h4>
                    <p className="text-xs font-bold text-[#D8A47F] mt-1">
                      R$ {(prod.promoPrice || prod.price).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories Visual Highlights Section */}
      {!searchQuery && !selectedCategory && !filterNovidadesOnly && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-['Playfair_Display',serif] text-xl sm:text-2xl font-bold text-[#F8F5F2]">
                Compre por Categoria
              </h3>
              <p className="text-xs text-[#A0A0A0]">
                Encontre a peça de lingerie ideal para o seu momento
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.slug);
                  const el = document.getElementById('catalog-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group relative rounded-2xl overflow-hidden aspect-4/5 bg-[#1F1F1F] border border-[#2A2A2A] hover:border-[#D8A47F]/60 shadow-md transition-all cursor-pointer text-left"
              >
                <img
                  src={cat.imageUrl || 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&q=80&w=400'}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-3">
                  <span className="text-xs sm:text-sm font-bold text-[#F8F5F2] leading-tight">
                    {cat.name}
                  </span>
                  <span className="text-[10px] text-[#D8A47F] flex items-center gap-0.5 mt-0.5 group-hover:translate-x-1 transition-transform">
                    Ver peças <ChevronRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Catalog Grid Section */}
      <section id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Section Header */}
        <div className="space-y-4 pb-6 border-b border-[#2A2A2A]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-['Playfair_Display',serif] text-2xl sm:text-3xl font-bold text-[#F8F5F2]">
                  {filterNovidadesOnly
                    ? 'Catálogo de Novidades'
                    : activeCategoryObj
                    ? activeCategoryObj.name
                    : searchQuery
                    ? `Busca: "${searchQuery}"`
                    : 'Catálogo Allure Intimidades'}
                </h2>
                {(selectedCategory || filterNovidadesOnly) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory(null);
                      setFilterNovidadesOnly(false);
                    }}
                    className="text-xs text-[#D8A47F] hover:underline font-semibold cursor-pointer"
                  >
                    (Limpar filtros)
                  </button>
                )}
              </div>
              <p className="text-xs text-[#A0A0A0] mt-1">
                Mostrando {filteredProducts.length} {filteredProducts.length === 1 ? 'peça exclusiva' : 'peças exclusivas'} com grade completa
              </p>
            </div>

            {/* WhatsApp Support CTA */}
            <button
              type="button"
              onClick={() => openWhatsAppChat(config.whatsapp, `Olá! Gostaria de consultoria no catálogo da ${config.name || 'Allure Intimidades'}.`)}
              className="self-start sm:self-auto px-4 py-2 rounded-full bg-[#1F1F1F] text-[#D8A47F] border border-[#D8A47F]/40 hover:bg-[#2A2A2A] transition-all text-xs font-semibold flex items-center gap-2 cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-[#D8A47F]" />
              <span>Consultoria Allure no WhatsApp</span>
            </button>
          </div>

          {/* Quick Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory(null);
                setFilterNovidadesOnly(false);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                !selectedCategory && !filterNovidadesOnly
                  ? 'bg-[#D8A47F] text-[#121212] font-bold shadow-xs'
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
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all flex items-center gap-1 cursor-pointer ${
                  filterNovidadesOnly
                    ? 'bg-[#C75C5C] text-white shadow-xs'
                    : 'bg-[#1F1F1F] border border-[#2A2A2A] text-[#D8A47F] hover:bg-[#2A2A2A]'
                }`}
              >
                <Sparkles className="w-3 h-3 text-[#D8A47F]" />
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
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#C75C5C] text-white shadow-xs font-semibold'
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
      <footer className="bg-[#161616] text-[#A0A0A0] mt-16 border-t border-[#2A2A2A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[#F8F5F2]">
                <div className="w-8 h-8 rounded-full bg-[#1F1F1F] border border-[#D8A47F]/40 flex items-center justify-center text-[#D8A47F] font-bold">
                  A
                </div>
                <span className="font-['Playfair_Display',serif] font-bold text-lg text-[#F8F5F2]">
                  {config.name}
                </span>
              </div>
              <p className="text-xs text-[#A0A0A0] leading-relaxed">
                {config.tagline || 'Elegância, conforto e sensualidade em cada detalhe da nossa alta costura íntima.'}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#F8F5F2] uppercase tracking-wider">
                Atendimento
              </h4>
              <ul className="space-y-1.5 text-xs text-[#A0A0A0]">
                <li className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#D8A47F]" />
                  <span>{config.phone}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Instagram className="w-3.5 h-3.5 text-[#D8A47F]" />
                  <span>{config.instagram}</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#D8A47F] shrink-0 mt-0.5" />
                  <span>{config.address}</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#F8F5F2] uppercase tracking-wider">
                Categorias
              </h4>
              <ul className="space-y-1 text-xs text-[#A0A0A0]">
                {categories.slice(0, 4).map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory(c.slug);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="hover:text-[#D8A47F] transition-colors cursor-pointer"
                    >
                      {c.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#F8F5F2] uppercase tracking-wider">
                Segurança & Garantia
              </h4>
              <p className="text-xs text-[#A0A0A0] leading-relaxed">
                Embalagens 100% discretas sem identificação do conteúdo externo. Primeira troca garantida em até 7 dias corridos.
              </p>
              <div className="pt-1">
                <span className="inline-block px-2.5 py-1 rounded-md bg-[#1F1F1F] border border-[#2A2A2A] text-[#D8A47F] text-[10px] font-semibold">
                  Compra Segura via WhatsApp
                </span>
              </div>
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-[#2A2A2A] text-center text-xs text-[#777777] flex flex-col sm:flex-row items-center justify-between gap-2">
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
