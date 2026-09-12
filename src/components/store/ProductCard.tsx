import React from 'react';
import { Product } from '../../types';
import { ShoppingBag, Eye, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { palette } = useStore();
  const isLight = palette === 'light-rose';

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
      className={`group rounded-xl sm:rounded-2xl border overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer ${
        isLight
          ? 'bg-white border-[#E8E1DA] hover:border-[#9B4B5A]/60'
          : 'bg-[#1F1F1F] border-[#2A2A2A] hover:border-[#D8A47F]/50'
      }`}
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
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.isNewArrival && (!product.newArrivalUntil || new Date(product.newArrivalUntil) >= new Date()) && (
            <span className="px-2 py-0.2 rounded-full bg-[#D8A47F] text-[#121212] text-[9px] font-black tracking-wider uppercase shadow-md flex items-center gap-0.5">
              <Sparkles className="w-2 h-2 text-[#121212]" />
              <span>{product.newArrivalBadge || 'Novidade'}</span>
            </span>
          )}
          {hasPromo && (
            <span className="px-2 py-0.2 rounded-full bg-[#C75C5C] text-white text-[9px] font-black tracking-wider uppercase shadow-md">
              -{discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2">
            <span className="px-2.5 py-0.5 bg-[#2A2A2A] text-[#F8F5F2] border border-[#C75C5C] rounded-full text-[10px] font-bold tracking-wider uppercase">
              Esgotado
            </span>
          </div>
        )}

        {/* Quick View Button on Hover (Desktop) */}
        <div className="absolute inset-x-2.5 bottom-2.5 hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            type="button"
            className="w-full py-2 px-3 bg-[#1F1F1F]/95 border border-[#2A2A2A] hover:border-[#D8A47F] text-[#F8F5F2] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg transition-all backdrop-blur-md"
          >
            <Eye className="w-3.5 h-3.5 text-[#D8A47F]" />
            <span>Ver Detalhes</span>
          </button>
        </div>
      </div>

      {/* Info Area - Compact on mobile */}
      <div className="p-2.5 sm:p-3.5 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          {/* Color Dots */}
          <div className="flex items-center gap-1 pb-0.5">
            {availableColors.slice(0, 4).map(([colorName, colorHex]) => (
              <span
                key={colorName}
                title={colorName}
                className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border border-black/20 shrink-0"
                style={{ backgroundColor: colorHex }}
              />
            ))}
            {availableColors.length > 4 && (
              <span
                className={`text-[9px] font-medium ${
                  isLight ? 'text-[#888888]' : 'text-[#A0A0A0]'
                }`}
              >
                +{availableColors.length - 4}
              </span>
            )}
          </div>

          <h3
            className={`font-['Playfair_Display',serif] text-xs sm:text-sm font-bold line-clamp-2 leading-snug transition-colors ${
              isLight
                ? 'text-[#2D2926] group-hover:text-[#9B4B5A]'
                : 'text-[#F8F5F2] group-hover:text-[#D8A47F]'
            }`}
          >
            {product.name}
          </h3>
        </div>

        {/* Prices & Sizes */}
        <div
          className={`pt-2 border-t mt-2 space-y-1.5 ${
            isLight ? 'border-[#E8E1DA]' : 'border-[#2A2A2A]'
          }`}
        >
          {/* Sizes available preview */}
          <div className="flex items-center gap-1 flex-wrap">
            <span
              className={`text-[9px] font-medium ${
                isLight ? 'text-[#888888]' : 'text-[#A0A0A0]'
              }`}
            >
              Tam:
            </span>
            {availableSizes.slice(0, 4).map((size) => (
              <span
                key={size}
                className={`px-1.5 py-0.2 rounded text-[9px] font-semibold border ${
                  isLight
                    ? 'bg-[#FAF7F5] text-[#555555] border-[#E8E1DA]'
                    : 'bg-[#2A2A2A] text-[#E0E0E0] border-[#333333]'
                }`}
              >
                {size}
              </span>
            ))}
          </div>

          {/* Pricing Row */}
          <div className="flex items-baseline justify-between pt-0.5">
            <div className="flex items-baseline gap-1">
              {hasPromo ? (
                <>
                  <span
                    className={`text-xs sm:text-base font-bold ${
                      isLight ? 'text-[#9B4B5A]' : 'text-[#D8A47F]'
                    }`}
                  >
                    R$ {product.promoPrice?.toFixed(2).replace('.', ',')}
                  </span>
                  <span
                    className={`text-[10px] line-through ${
                      isLight ? 'text-[#999999]' : 'text-[#8A8A8A]'
                    }`}
                  >
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </span>
                </>
              ) : (
                <span
                  className={`text-xs sm:text-base font-bold ${
                    isLight ? 'text-[#2D2926]' : 'text-[#F8F5F2]'
                  }`}
                >
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </span>
              )}
            </div>

            <button
              type="button"
              className="p-1 sm:px-2.5 sm:py-1 rounded-full bg-[#C75C5C] hover:bg-[#B34E4E] text-white transition-all text-xs font-semibold flex items-center gap-1 shadow-xs active:scale-95"
            >
              <ShoppingBag className="w-3 h-3" />
              <span className="hidden sm:inline text-[11px]">Ver</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
