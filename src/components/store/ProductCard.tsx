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
      className="group bg-white rounded-2xl sm:rounded-3xl border border-[#EFE9E2] overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Product Image Area */}
      <div className="relative aspect-3/4 w-full bg-[#F5F1EC] overflow-hidden">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&q=80&w=600'}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Badges on Top */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.isNewArrival && (!product.newArrivalUntil || new Date(product.newArrivalUntil) >= new Date()) && (
            <span className="px-2 py-0.5 rounded-full bg-[#10B981] text-white text-[10px] font-extrabold tracking-wider uppercase shadow-xs flex items-center gap-1 animate-pulse">
              <Sparkles className="w-2.5 h-2.5 text-white" />
              <span>{product.newArrivalBadge || 'Novidade no Estoque'}</span>
            </span>
          )}
          {hasPromo && (
            <span className="px-2 py-0.5 rounded-full bg-[#9E1B32] text-white text-[10px] font-extrabold tracking-wider uppercase shadow-xs">
              -{discountPercent}% OFF
            </span>
          )}
          {product.featured && (
            <span className="px-2 py-0.5 rounded-full bg-[#2D2926]/85 backdrop-blur-xs text-white text-[10px] font-semibold flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-[#F5C7D0]" />
              <span>Destaque</span>
            </span>
          )}
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center p-4">
            <span className="px-3 py-1 bg-[#2D2926] text-white rounded-full text-xs font-bold tracking-wider uppercase">
              Esgotado
            </span>
          </div>
        )}

        {/* Quick View Button on Hover (Desktop) */}
        <div className="absolute inset-x-3 bottom-3 hidden sm:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            type="button"
            className="w-full py-2.5 px-4 bg-white/95 backdrop-blur-xs hover:bg-white text-[#2D2926] rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Eye className="w-3.5 h-3.5 text-[#9B4B5A]" />
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
                className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                style={{ backgroundColor: colorHex }}
              />
            ))}
            {availableColors.length > 4 && (
              <span className="text-[10px] text-[#8A7E76] font-medium">
                +{availableColors.length - 4}
              </span>
            )}
          </div>

          <h3 className="font-['Playfair_Display',serif] text-sm sm:text-base font-bold text-[#2D2926] line-clamp-2 leading-snug group-hover:text-[#9B4B5A] transition-colors">
            {product.name}
          </h3>

          <p className="text-[11px] text-[#7D756D] line-clamp-1">
            {product.description}
          </p>
        </div>

        {/* Prices & Sizes */}
        <div className="pt-3 border-t border-[#F5F0EA] mt-3 space-y-2">
          {/* Sizes available preview */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[10px] font-medium text-[#8A7E76] mr-1">Tam:</span>
            {availableSizes.slice(0, 5).map((size) => (
              <span
                key={size}
                className="px-1.5 py-0.5 rounded-md bg-[#F5F0EA] text-[#4A423D] text-[10px] font-semibold"
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
                  <span className="text-base sm:text-lg font-bold text-[#9B4B5A]">
                    R$ {product.promoPrice?.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-xs text-[#9E948C] line-through">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </span>
                </>
              ) : (
                <span className="text-base sm:text-lg font-bold text-[#2D2926]">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </span>
              )}
            </div>

            <button
              type="button"
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-full bg-[#FAF3F5] text-[#9B4B5A] hover:bg-[#9B4B5A] hover:text-white transition-all text-xs font-semibold flex items-center gap-1"
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
