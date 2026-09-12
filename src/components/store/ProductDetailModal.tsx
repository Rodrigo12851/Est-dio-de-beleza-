import React, { useState, useMemo, useEffect } from 'react';
import { Product, ProductVariant } from '../../types';
import { useStore } from '../../context/StoreContext';
import {
  X,
  ShoppingBag,
  Check,
  ShieldCheck,
  Truck,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
}) => {
  const { addToCart } = useStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [addedFeedback, setAddedFeedback] = useState(false);

  // When product opens, set initial selections
  useEffect(() => {
    if (product && product.variants.length > 0) {
      setActiveImageIndex(0);
      setQuantity(1);
      setAddedFeedback(false);

      // Pick first in-stock variant or first variant
      const firstInStock = product.variants.find((v) => v.stockQuantity > 0) || product.variants[0];
      setSelectedColor(firstInStock.color);
      setSelectedSize(firstInStock.size);
    }
  }, [product]);

  // Unique colors in this product
  const colorOptions = useMemo(() => {
    if (!product) return [];
    const map = new Map<string, { color: string; colorHex?: string }>();
    product.variants.forEach((v) => {
      if (!map.has(v.color)) {
        map.set(v.color, { color: v.color, colorHex: v.colorHex });
      }
    });
    return Array.from(map.values());
  }, [product]);

  // Sizes available for the chosen color
  const sizeOptionsForColor = useMemo(() => {
    if (!product || !selectedColor) return [];
    return product.variants
      .filter((v) => v.color === selectedColor)
      .map((v) => ({
        size: v.size,
        stock: v.stockQuantity,
        variantId: v.id,
      }));
  }, [product, selectedColor]);

  // Exact matching variant
  const selectedVariant: ProductVariant | undefined = useMemo(() => {
    if (!product || !selectedColor || !selectedSize) return undefined;
    return product.variants.find(
      (v) => v.color === selectedColor && v.size === selectedSize
    );
  }, [product, selectedColor, selectedSize]);

  if (!product) return null;

  const hasPromo = product.promoPrice && product.promoPrice > 0 && product.promoPrice < product.price;
  const currentPrice = hasPromo ? product.promoPrice! : product.price;
  const discountPercent = hasPromo
    ? Math.round(((product.price - product.promoPrice!) / product.price) * 100)
    : 0;

  const currentStock = selectedVariant ? selectedVariant.stockQuantity : 0;
  const isAvailable = Boolean(selectedVariant && currentStock > 0);

  const handleAddToCart = () => {
    if (!selectedVariant || !isAvailable) return;
    addToCart(product, selectedVariant, quantity);
    setAddedFeedback(true);
    setTimeout(() => {
      setAddedFeedback(false);
      onClose();
    }, 900);
  };

  const images = product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&q=80&w=800'];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto animate-fadeIn">
      {/* Modal Container */}
      <div className="bg-[#FDFBF9] w-full max-w-4xl rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#E8DFD5] overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md shadow-md hover:bg-white text-[#2D2926] flex items-center justify-center transition-all cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Body: Two columns on desktop */}
        <div className="overflow-y-auto grid grid-cols-1 md:grid-cols-12 flex-1">
          {/* Left Column: Image Gallery */}
          <div className="md:col-span-6 bg-[#F5F1EC] flex flex-col p-4 sm:p-6 border-b md:border-b-0 md:border-r border-[#EFE9E2]">
            {/* Main Stage Image */}
            <div className="relative aspect-3/4 rounded-2xl overflow-hidden bg-white shadow-xs">
              <img
                src={images[activeImageIndex] || images[0]}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />

              {/* Prev / Next Arrows if multiple images */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#2D2926] flex items-center justify-center shadow-xs cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-[#2D2926] flex items-center justify-center shadow-xs cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Promo Badge */}
              {hasPromo && (
                <div className="absolute top-3 left-3 bg-[#9E1B32] text-white text-xs font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                  -{discountPercent}% OFF
                </div>
              )}
            </div>

            {/* Gallery Thumbnails */}
            {images.length > 1 && (
              <div className="flex items-center gap-2.5 mt-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-14 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      activeImageIndex === idx ? 'border-[#9B4B5A] scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details & Variant Selection */}
          <div className="md:col-span-6 p-5 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#9B4B5A]">
                    Bella Lingerie
                  </span>
                  {product.isNewArrival && (!product.newArrivalUntil || new Date(product.newArrivalUntil) >= new Date()) && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-white" />
                      <span>{product.newArrivalBadge || 'Novidade no Estoque'}</span>
                      {product.newArrivalDays && (
                        <span className="bg-emerald-700/60 px-1.5 py-0.2 rounded text-[9px]">
                          {product.newArrivalDays}d no catálogo de novidades
                        </span>
                      )}
                    </span>
                  )}
                </div>
                <h2 className="font-['Playfair_Display',serif] text-2xl sm:text-3xl font-bold text-[#2D2926] mt-1 leading-snug">
                  {product.name}
                </h2>
              </div>

              {/* Price Row */}
              <div className="flex items-baseline gap-3 pb-3 border-b border-[#F0EAE1]">
                {hasPromo ? (
                  <>
                    <span className="text-2xl sm:text-3xl font-bold text-[#9B4B5A]">
                      R$ {product.promoPrice?.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-sm text-[#9E948C] line-through">
                      R$ {product.price.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Economize R$ {(product.price - product.promoPrice!).toFixed(2).replace('.', ',')}
                    </span>
                  </>
                ) : (
                  <span className="text-2xl sm:text-3xl font-bold text-[#2D2926]">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-[#59524C] leading-relaxed">
                {product.description}
              </p>

              {/* Dynamic Color Selector */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#2D2926] uppercase tracking-wider">
                    Cor: <span className="font-semibold normal-case text-[#9B4B5A]">{selectedColor}</span>
                  </label>
                </div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  {colorOptions.map((opt) => {
                    const isSelected = selectedColor === opt.color;
                    return (
                      <button
                        key={opt.color}
                        type="button"
                        onClick={() => {
                          setSelectedColor(opt.color);
                          // reset or adapt size
                          const matchedSize = product.variants.find(
                            (v) => v.color === opt.color && v.size === selectedSize
                          );
                          if (!matchedSize) {
                            const firstSize = product.variants.find((v) => v.color === opt.color);
                            if (firstSize) setSelectedSize(firstSize.size);
                          }
                        }}
                        className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#9B4B5A] bg-[#FAF3F5] text-[#9B4B5A] font-bold shadow-xs'
                            : 'border-[#EAE4DD] bg-white text-[#4A423D] hover:border-[#D9D0C5]'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: opt.colorHex || '#1A1A1A' }}
                        />
                        <span>{opt.color}</span>
                        {isSelected && <Check className="w-3 h-3 text-[#9B4B5A]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Size Selector */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#2D2926] uppercase tracking-wider">
                    Tamanho: <span className="font-semibold normal-case text-[#9B4B5A]">{selectedSize}</span>
                  </label>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {sizeOptionsForColor.map((s) => {
                    const isSelected = selectedSize === s.size;
                    const inStock = s.stock > 0;
                    return (
                      <button
                        key={s.size}
                        type="button"
                        disabled={!inStock}
                        onClick={() => setSelectedSize(s.size)}
                        className={`min-w-[48px] h-11 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer border ${
                          !inStock
                            ? 'bg-[#F5F0EA] text-[#A69C94] border-transparent line-through cursor-not-allowed opacity-50'
                            : isSelected
                            ? 'bg-[#9B4B5A] text-white border-[#9B4B5A] shadow-xs scale-105'
                            : 'bg-white text-[#2D2926] border-[#EAE4DD] hover:border-[#9B4B5A]'
                        }`}
                      >
                        {s.size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stock Status Indicator */}
              <div className="pt-2">
                {isAvailable ? (
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      {currentStock <= 3
                        ? `Apenas ${currentStock} unidades restantes em estoque!`
                        : `Em estoque (${currentStock} peças disponíveis)`}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 bg-amber-50 px-3 py-2 rounded-xl border border-amber-200">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Esgotado nesta combinação de cor e tamanho. Escolha outra opção!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quantity and Add to Cart Button */}
            <div className="pt-4 border-t border-[#F0EAE1] space-y-3">
              <div className="flex items-center gap-3">
                {/* Quantity Stepper */}
                <div className="flex items-center border border-[#EAE4DD] rounded-xl bg-white p-1">
                  <button
                    type="button"
                    disabled={quantity <= 1 || !isAvailable}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center text-[#4A423D] hover:bg-[#F5F0EA] rounded-lg disabled:opacity-30 cursor-pointer font-bold"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-xs sm:text-sm text-[#2D2926]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    disabled={quantity >= currentStock || !isAvailable}
                    onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                    className="w-9 h-9 flex items-center justify-center text-[#4A423D] hover:bg-[#F5F0EA] rounded-lg disabled:opacity-30 cursor-pointer font-bold"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart CTA */}
                <button
                  type="button"
                  disabled={!isAvailable}
                  onClick={handleAddToCart}
                  className={`flex-1 h-12 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-98 ${
                    addedFeedback
                      ? 'bg-emerald-600 text-white'
                      : isAvailable
                      ? 'bg-[#9B4B5A] hover:bg-[#843A48] text-white'
                      : 'bg-[#D9D0C5] text-[#7D756D] cursor-not-allowed shadow-none'
                  }`}
                >
                  {addedFeedback ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Adicionado à Sacola!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Adicionar à Sacola • R$ {(currentPrice * quantity).toFixed(2).replace('.', ',')}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Micro Perks */}
              <div className="flex items-center justify-between text-[11px] text-[#7D756D] pt-1">
                <span className="flex items-center gap-1">
                  <Truck className="w-3 h-3 text-[#9B4B5A]" /> Envio para todo o Brasil
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#9B4B5A]" /> Compra 100% Segura
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
