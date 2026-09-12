import React from 'react';
import { Product } from '../../types';
import { ShoppingBag, Eye, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const hasPromo = product.promoPrice && product.promoPrice > 0 && product.promoPrice < product.price;
  const discountPercent = hasPromo
    ? Math.round(((product.price - (product.promoPrice || 0)) / product.price) * 100)
    : 0;

  // Compute unique colors and sizes
  const availableSizes = Array.from(new Set(product.variants.map((v) => v.size)));
  const availableColors = Array.from(
    new Map(product.variants.map((v) => [v.color, v.colorHex || '#1A1A1A'])).entries()
  );

  const totalStock = product.variants.reduce((acc, v) => acc + v.stockQuantity, 0);
  const isOutOfStock = totalStock <= 0;

  return (
    <div
      onClick={() => onSelect(product)}
      className="group bg-[#1F1F1F] rounded-2xl sm:rounded-3xl border border-[#2A2A2A] overflow-hidden shadow-sm hover:shadow-2xl hover:border-[#D8A47F]/50 transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Product Image Area */}
      <div className="relative aspect-3/4 w-full bg-[#141414] overflow-hidden">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&q=80&w=600'}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Badges on Top */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.isNewArrival && (!product.newArrivalUntil || new Date(product.newArrivalUntil) >= new Date()) && (
            <span className="px-2.5 py-0.5 rounded-full bg-[#D8A47F] text-[#121212] text-[10px] font-black tracking-wider uppercase shadow-md flex items-center gap-1 animate-pulse">
              <Sparkles className="w-2.5 h-2.5 text-[#121212]" />
              <span>{product.newArrivalBadge || 'Novidade no Estoque'}</span>
            </span>
          )}
          {hasPromo && (
            <span className="px-2.5 py-0.5 rounded-full bg-[#C75C5C] text-white text-[10px] font-black tracking-wider uppercase shadow-md">
              -{discountPercent}% OFF
            </span>
          )}
          {product.featured && (
            <span className="px-2.5 py-0.5 rounded-full bg-[#121212]/90 backdrop-blur-xs text-[#D8A47F] border border-[#D8A47F]/40 text-[10px] font-bold flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-[#D8A47F]" />
              <span>Destaque</span>
            </span>
          )}
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
            <span className="px-3 py-1 bg-[#2A2A2A] text-[#F8F5F2] border border-[#C75C5C] rounded-full text-xs font-bold tracking-wider uppercase">
              Esgotado
            </span>
          </div>
        )}

        {/* Quick View Button on Hover (Desktop) */}
        <div className="absolute inset-x-3 bottom-3 hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            type="button"
            className="w-full py-2.5 px-4 bg-[#1F1F1F]/95 border border-[#2A2A2A] hover:border-[#D8A47F] text-[#F8F5F2] rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all backdrop-blur-md"
          >
            <Eye className="w-3.5 h-3.5 text-[#D8A47F]" />
            <span>Ver Detalhes & Cores</span>
          </button>
        </div>
      </div>

      {/* Info Area */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          {/* Color Dots */}
          <div className="flex items-center gap-1.5 pb-1">
            {availableColors.slice(0, 4).map(([colorName, colorHex]) => (
              <span
                key={colorName}
                title={colorName}
                className="w-3 h-3 rounded-full border border-white/20 shrink-0"
                style={{ backgroundColor: colorHex }}
              />
            ))}
            {availableColors.length > 4 && (
              <span className="text-[10px] text-[#A0A0A0] font-medium">
                +{availableColors.length - 4}
              </span>
            )}
          </div>

          <h3 className="font-['Playfair_Display',serif] text-sm sm:text-base font-bold text-[#F8F5F2] line-clamp-2 leading-snug group-hover:text-[#D8A47F] transition-colors">
            {product.name}
          </h3>

          <p className="text-[11px] text-[#E0E0E0] line-clamp-1">
            {product.description}
          </p>
        </div>

        {/* Prices & Sizes */}
        <div className="pt-3 border-t border-[#2A2A2A] mt-3 space-y-2">
          {/* Sizes available preview */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[10px] font-medium text-[#A0A0A0] mr-1">Tam:</span>
            {availableSizes.slice(0, 5).map((size) => (
              <span
                key={size}
                className="px-1.5 py-0.5 rounded-md bg-[#2A2A2A] text-[#E0E0E0] text-[10px] font-semibold border border-[#333333]"
              >
                {size}
              </span>
            ))}
          </div>

          {/* Pricing Row */}
          <div className="flex items-baseline justify-between pt-0.5">
            <div className="flex items-baseline gap-1.5">
              {hasPromo ? (
                <>
                  <span className="text-base sm:text-lg font-bold text-[#D8A47F]">
                    R$ {product.promoPrice?.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-xs text-[#8A8A8A] line-through">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </span>
                </>
              ) : (
                <span className="text-base sm:text-lg font-bold text-[#F8F5F2]">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </span>
              )}
            </div>

            <button
              type="button"
              className="p-1.5 sm:px-3 sm:py-1 rounded-full bg-[#C75C5C] hover:bg-[#B34E4E] text-white transition-all text-xs font-semibold flex items-center gap-1 shadow-sm"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Comprar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
