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
  Sun,
  Moon,
  Camera,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

type LightCondition = 'natural' | 'warm' | 'studio';

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
  const [lightCondition, setLightCondition] = useState<LightCondition>('natural');

  // When product opens, set initial selections
  useEffect(() => {
    if (product && product.variants.length > 0) {
      setActiveImageIndex(0);
      setQuantity(1);
      setAddedFeedback(false);
      setLightCondition('natural');

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

  // AI color insight text
  const aiLightInsight = useMemo(() => {
    if (lightCondition === 'warm') {
      return `IA Allure Match: Sob luz âmbar noturna (2700K), o tom ${selectedColor || 'selecionado'} ganha reflexos dourados profundos, realçando rendas e momentos especiais.`;
    }
    if (lightCondition === 'studio') {
      return `IA Allure Match: Sob luz de estúdio (4000K), o acabamento acetinado do ${selectedColor || 'modelo'} exibe alta nitidez de tramas e máxima sofisticação.`;
    }
    return `IA Allure Match: Sob luz natural (5500K), o tom ${selectedColor || 'selecionado'} exibe 100% de fidelidade cromática e harmonia para o dia a dia.`;
  }, [lightCondition, selectedColor]);

  const lightFilterStyle = useMemo(() => {
    switch (lightCondition) {
      case 'warm':
        return { filter: 'sepia(0.28) saturate(1.25) brightness(0.96) hue-rotate(-8deg)' };
      case 'studio':
        return { filter: 'contrast(1.12) brightness(1.05) saturate(1.1)' };
      default:
        return { filter: 'brightness(1.02) contrast(1.02) saturate(1.04)' };
    }
  }, [lightCondition]);

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-0 sm:p-4 overflow-y-auto animate-fadeIn">
      {/* Modal Container */}
      <div className="bg-[#161616] w-full max-w-4xl rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#2A2A2A] overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[90vh] relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-[#1F1F1F]/90 backdrop-blur-md shadow-lg hover:bg-[#2A2A2A] text-[#F8F5F2] border border-[#2A2A2A] flex items-center justify-center transition-all cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Body: Two columns on desktop */}
        <div className="overflow-y-auto grid grid-cols-1 md:grid-cols-12 flex-1">
          {/* Left Column: Image Gallery & AI Lighting Simulation */}
          <div className="md:col-span-6 bg-[#121212] flex flex-col p-4 sm:p-6 border-b md:border-b-0 md:border-r border-[#2A2A2A]">
            {/* Main Stage Image with dynamic filter */}
            <div className="relative aspect-3/4 rounded-2xl overflow-hidden bg-[#181818] shadow-lg border border-[#2A2A2A]">
              <img
                src={images[activeImageIndex] || images[0]}
                alt={product.name}
                style={lightFilterStyle}
                className="w-full h-full object-cover object-center transition-all duration-500"
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
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#1F1F1F]/80 hover:bg-[#1F1F1F] text-[#F8F5F2] flex items-center justify-center shadow-md cursor-pointer border border-[#2A2A2A]"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#1F1F1F]/80 hover:bg-[#1F1F1F] text-[#F8F5F2] flex items-center justify-center shadow-md cursor-pointer border border-[#2A2A2A]"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Promo Badge */}
              {hasPromo && (
                <div className="absolute top-3 left-3 bg-[#C75C5C] text-[#F8F5F2] text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                  -{discountPercent}% OFF
                </div>
              )}
            </div>

            {/* AI Lighting Simulator Bar */}
            <div className="mt-3 p-3 bg-[#1F1F1F] border border-[#2A2A2A] rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-[#D8A47F] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D8A47F]" />
                  Simulação de Luz IA
                </span>
                <span className="text-[10px] text-[#A0A0A0]">Provador Virtual</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setLightCondition('natural')}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    lightCondition === 'natural'
                      ? 'bg-[#D8A47F] text-[#121212] font-bold shadow-xs'
                      : 'bg-[#2A2A2A] text-[#E0E0E0] hover:bg-[#333333]'
                  }`}
                >
                  <Sun className="w-3 h-3" />
                  <span>Dia (5500K)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLightCondition('warm')}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    lightCondition === 'warm'
                      ? 'bg-[#D8A47F] text-[#121212] font-bold shadow-xs'
                      : 'bg-[#2A2A2A] text-[#E0E0E0] hover:bg-[#333333]'
                  }`}
                >
                  <Moon className="w-3 h-3" />
                  <span>Noite (2700K)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLightCondition('studio')}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    lightCondition === 'studio'
                      ? 'bg-[#D8A47F] text-[#121212] font-bold shadow-xs'
                      : 'bg-[#2A2A2A] text-[#E0E0E0] hover:bg-[#333333]'
                  }`}
                >
                  <Camera className="w-3 h-3" />
                  <span>Estúdio (4000K)</span>
                </button>
              </div>
              <p className="text-[10px] text-[#D8A47F] mt-2 leading-tight">
                {aiLightInsight}
              </p>
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
                      activeImageIndex === idx ? 'border-[#D8A47F] scale-105' : 'border-[#2A2A2A] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Details & Variant Selection */}
          <div className="md:col-span-6 p-5 sm:p-8 flex flex-col justify-between space-y-6 bg-[#161616]">
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#D8A47F]">
                    Allure Intimidades • Luxo Acessível
                  </span>
                  {product.isNewArrival && (!product.newArrivalUntil || new Date(product.newArrivalUntil) >= new Date()) && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#D8A47F] text-[#121212] text-[10px] font-black flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#121212]" />
                      <span>{product.newArrivalBadge || 'Novidade no Estoque'}</span>
                      {product.newArrivalDays && (
                        <span className="bg-[#121212]/30 text-[#121212] px-1.5 py-0.2 rounded text-[9px]">
                          {product.newArrivalDays}d no catálogo
                        </span>
                      )}
                    </span>
                  )}
                </div>
                <h2 className="font-['Playfair_Display',serif] text-2xl sm:text-3xl font-bold text-[#F8F5F2] mt-1 leading-snug">
                  {product.name}
                </h2>
              </div>

              {/* Price Row */}
              <div className="flex items-baseline gap-3 pb-3 border-b border-[#2A2A2A]">
                {hasPromo ? (
                  <>
                    <span className="text-2xl sm:text-3xl font-bold text-[#D8A47F]">
                      R$ {product.promoPrice?.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-sm text-[#888888] line-through">
                      R$ {product.price.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-xs font-semibold text-[#D8A47F] bg-[#D8A47F]/15 px-2 py-0.5 rounded-full border border-[#D8A47F]/30">
                      Economize R$ {(product.price - product.promoPrice!).toFixed(2).replace('.', ',')}
                    </span>
                  </>
                ) : (
                  <span className="text-2xl sm:text-3xl font-bold text-[#F8F5F2]">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-[#E0E0E0] leading-relaxed">
                {product.description}
              </p>

              {/* Dynamic Color Selector */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#F8F5F2] uppercase tracking-wider">
                    Cor: <span className="font-semibold normal-case text-[#D8A47F]">{selectedColor}</span>
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
                            ? 'border-[#D8A47F] bg-[#1F1F1F] text-[#D8A47F] font-bold shadow-xs'
                            : 'border-[#2A2A2A] bg-[#1F1F1F] text-[#E0E0E0] hover:border-[#3A3A3A]'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                          style={{ backgroundColor: opt.colorHex || '#1A1A1A' }}
                        />
                        <span>{opt.color}</span>
                        {isSelected && <Check className="w-3 h-3 text-[#D8A47F]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Size Selector */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#F8F5F2] uppercase tracking-wider">
                    Tamanho: <span className="font-semibold normal-case text-[#D8A47F]">{selectedSize}</span>
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
                            ? 'bg-[#1F1F1F] text-[#555555] border-[#2A2A2A] line-through cursor-not-allowed opacity-50'
                            : isSelected
                            ? 'bg-[#C75C5C] text-white border-[#C75C5C] shadow-md scale-105'
                            : 'bg-[#1F1F1F] text-[#F8F5F2] border-[#2A2A2A] hover:border-[#D8A47F]'
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
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#D8A47F] bg-[#1F1F1F] px-3 py-2 rounded-xl border border-[#2A2A2A]">
                    <Check className="w-4 h-4 text-[#D8A47F] shrink-0" />
                    <span>
                      {currentStock <= 3
                        ? `Apenas ${currentStock} unidades restantes em estoque!`
                        : `Em estoque (${currentStock} peças disponíveis)`}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#C75C5C] bg-[#1F1F1F] px-3 py-2 rounded-xl border border-[#C75C5C]/40">
                    <AlertCircle className="w-4 h-4 text-[#C75C5C] shrink-0" />
                    <span>Esgotado nesta combinação de cor e tamanho. Escolha outra opção!</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quantity and Add to Cart Button */}
            <div className="pt-4 border-t border-[#2A2A2A] space-y-3">
              <div className="flex items-center gap-3">
                {/* Quantity Stepper */}
                <div className="flex items-center border border-[#2A2A2A] rounded-xl bg-[#1F1F1F] p-1">
                  <button
                    type="button"
                    disabled={quantity <= 1 || !isAvailable}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 flex items-center justify-center text-[#E0E0E0] hover:bg-[#2A2A2A] rounded-lg disabled:opacity-30 cursor-pointer font-bold"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-xs sm:text-sm text-[#F8F5F2]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    disabled={quantity >= currentStock || !isAvailable}
                    onClick={() => setQuantity((q) => Math.min(currentStock, q + 1))}
                    className="w-9 h-9 flex items-center justify-center text-[#E0E0E0] hover:bg-[#2A2A2A] rounded-lg disabled:opacity-30 cursor-pointer font-bold"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart CTA */}
                <button
                  type="button"
                  disabled={!isAvailable}
                  onClick={handleAddToCart}
                  className={`flex-1 h-12 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-98 ${
                    addedFeedback
                      ? 'bg-emerald-600 text-white'
                      : isAvailable
                      ? 'bg-[#C75C5C] hover:bg-[#B34E4E] text-[#F8F5F2]'
                      : 'bg-[#2A2A2A] text-[#777777] cursor-not-allowed shadow-none'
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
              <div className="flex items-center justify-between text-[11px] text-[#A0A0A0] pt-1">
                <span className="flex items-center gap-1">
                  <Truck className="w-3 h-3 text-[#D8A47F]" /> Envio para todo o Brasil
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#D8A47F]" /> Compra 100% Segura
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
