import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { generateWhatsAppOrderUrl } from '../../utils/whatsappOrder';
import {
  X,
  ShoppingBag,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Truck,
  Store,
  CreditCard,
  QrCode,
  CheckCircle2,
  Sparkles,
  Phone,
  User,
  MapPin,
} from 'lucide-react';

interface CartDrawerProps {
  onOrderCompleted: (orderNumber: string, whatsappUrl: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOrderCompleted }) => {
  const {
    config,
    cart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cartSubtotal,
    cartItemCount,
    isCartOpen,
    setIsCartOpen,
    createOrder,
  } = useStore();

  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'checkout'>('cart');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [customerName, setCustomerName] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [zipCode, setZipCode] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('SP');
  const [paymentMethod, setPaymentMethod] = useState<'whatsapp' | 'pix' | 'cartao_credito' | 'dinheiro'>('whatsapp');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isCartOpen) return null;

  // Free shipping goal (e.g. R$ 199)
  const freeShippingThreshold = 199.0;
  const missingForFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);
  const freeShippingPercent = Math.min(100, Math.round((cartSubtotal / freeShippingThreshold) * 100));

  // Phone mask
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    if (val.length > 6) {
      val = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`;
    } else if (val.length > 2) {
      val = `(${val.slice(0, 2)}) ${val.slice(2)}`;
    }
    setCustomerWhatsapp(val);
  };

  // CEP mask
  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 8) val = val.slice(0, 8);
    if (val.length > 5) {
      val = `${val.slice(0, 5)}-${val.slice(5)}`;
    }
    setZipCode(val);
  };

  const validateCheckout = () => {
    const errs: Record<string, string> = {};
    if (!customerName.trim()) errs.customerName = 'Informe seu nome completo';
    const cleanPhone = customerWhatsapp.replace(/\D/g, '');
    if (cleanPhone.length < 10) errs.customerWhatsapp = 'Informe seu WhatsApp com DDD';

    if (deliveryType === 'delivery') {
      if (!street.trim()) errs.street = 'Informe a rua / avenida';
      if (!number.trim()) errs.number = 'Informe o número';
      if (!neighborhood.trim()) errs.neighborhood = 'Informe o bairro';
      if (!city.trim()) errs.city = 'Informe a cidade';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFinishOrder = async () => {
    if (!validateCheckout()) return;

    setIsSubmitting(true);
    try {
      const created = await createOrder({
        customerName,
        customerWhatsapp,
        deliveryType,
        address:
          deliveryType === 'delivery'
            ? {
                zipCode,
                street,
                number,
                complement,
                neighborhood,
                city,
                state,
              }
            : undefined,
        paymentMethod: config.enableOnlinePayment ? paymentMethod : 'whatsapp',
        notes,
      });

      // Generate WhatsApp URL
      const waUrl = generateWhatsAppOrderUrl(created, config);

      setIsCartOpen(false);
      setCheckoutStep('cart');
      onOrderCompleted(created.orderNumber, waUrl);

      // Open WhatsApp automatically
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Erro ao finalizar pedido:', err);
      alert('Houve um erro ao processar o pedido. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-xs flex justify-end animate-fadeIn">
      {/* Click outside to close */}
      <div className="flex-1" onClick={() => setIsCartOpen(false)} />

      {/* Drawer Panel */}
      <div className="w-full max-w-lg bg-[#161616] text-[#F8F5F2] shadow-2xl flex flex-col h-full z-10 border-l border-[#2A2A2A]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#2A2A2A] flex items-center justify-between bg-[#1F1F1F]">
          <div className="flex items-center gap-2">
            {checkoutStep === 'checkout' && (
              <button
                type="button"
                onClick={() => setCheckoutStep('cart')}
                className="p-1 -ml-1 text-[#A0A0A0] hover:text-[#F8F5F2] cursor-pointer"
                title="Voltar aos itens"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="w-8 h-8 rounded-full bg-[#D8A47F] text-[#121212] flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-['Playfair_Display',serif] text-base sm:text-lg font-bold text-[#F8F5F2]">
                {checkoutStep === 'cart' ? 'Sua Sacola Allure' : 'Finalizar Pedido'}
              </h2>
              <p className="text-[11px] text-[#A0A0A0]">
                {checkoutStep === 'cart'
                  ? `${cartItemCount} ${cartItemCount === 1 ? 'peça' : 'peças'} selecionadas`
                  : 'Preencha seus dados para envio pelo WhatsApp'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 rounded-full text-[#A0A0A0] hover:bg-[#2A2A2A] hover:text-[#F8F5F2] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator (Cart step only) */}
        {checkoutStep === 'cart' && cart.length > 0 && (
          <div className="px-5 py-2.5 bg-[#1A1A1A] border-b border-[#2A2A2A]">
            <div className="flex items-center justify-between text-xs font-semibold mb-1 text-[#F8F5F2]">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#D8A47F]" />
                {missingForFreeShipping === 0 ? (
                  <strong className="text-emerald-400">Parabéns! Você ganhou FRETE GRÁTIS 🎉</strong>
                ) : (
                  <span>
                    Faltam <strong className="text-[#D8A47F]">R$ {missingForFreeShipping.toFixed(2).replace('.', ',')}</strong> para Frete Grátis!
                  </span>
                )}
              </span>
              <span className="text-[11px] text-[#D8A47F] font-bold">{freeShippingPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#2A2A2A] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#D8A47F] transition-all duration-300 rounded-full"
                style={{ width: `${freeShippingPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {checkoutStep === 'cart' ? (
            /* STEP 1: CART ITEMS REVIEW */
            cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#1F1F1F] border border-[#2A2A2A] flex items-center justify-center text-[#D8A47F]">
                  <ShoppingBag className="w-8 h-8 stroke-1" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-['Playfair_Display',serif] text-lg font-bold text-[#F8F5F2]">
                    Sua sacola está vazia
                  </h3>
                  <p className="text-xs text-[#A0A0A0] max-w-xs">
                    Explore nossos conjuntos de renda, robes e lingeries exclusivas e adicione suas peças favoritas.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="px-5 py-2.5 rounded-full bg-[#C75C5C] hover:bg-[#B34E4E] text-white font-bold text-xs tracking-wide transition-all shadow-xs cursor-pointer"
                >
                  Explorar Vitrine
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-[#1F1F1F] rounded-2xl border border-[#2A2A2A] flex items-center gap-3 shadow-md"
                  >
                    {/* Thumbnail */}
                    <div className="w-16 h-20 rounded-xl overflow-hidden bg-[#141414] shrink-0 border border-[#2A2A2A]">
                      <img
                        src={item.product.images[0] || 'https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?auto=format&fit=crop&q=80&w=300'}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="font-['Playfair_Display',serif] text-xs sm:text-sm font-bold text-[#F8F5F2] truncate">
                        {item.product.name}
                      </h4>

                      <div className="flex items-center gap-2 text-[11px] text-[#A0A0A0]">
                        <span className="px-1.5 py-0.2 bg-[#121212] border border-[#2A2A2A] rounded-md font-semibold text-[#F8F5F2]">
                          Tam: {item.variant.size}
                        </span>
                        <span className="flex items-center gap-1">
                          <span
                            className="w-2 h-2 rounded-full border border-white/20"
                            style={{ backgroundColor: item.variant.colorHex || '#000' }}
                          />
                          {item.variant.color}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs sm:text-sm font-bold text-[#D8A47F]">
                          R$ {(item.unitPrice * item.quantity).toFixed(2).replace('.', ',')}
                        </span>

                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-[#2A2A2A] rounded-lg bg-[#141414]">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-xs font-bold text-[#E0E0E0] hover:bg-[#2A2A2A] rounded-l-md cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-7 text-center text-xs font-bold text-[#F8F5F2]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-xs font-bold text-[#E0E0E0] hover:bg-[#2A2A2A] rounded-r-md cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="p-1.5 text-[#777777] hover:text-[#C75C5C] transition-colors cursor-pointer self-start"
                      title="Remover produto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* STEP 2: CHECKOUT FORM */
            <div className="space-y-5 text-xs">
              {/* Customer Info */}
              <div className="space-y-3 bg-[#1F1F1F] p-4 rounded-2xl border border-[#2A2A2A]">
                <h3 className="font-bold text-[#F8F5F2] text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#D8A47F]" />
                  <span>1. Seus Dados</span>
                </h3>

                <div>
                  <label className="block font-semibold text-[#E0E0E0] mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ex: Camila Rodrigues"
                    className="w-full bg-[#141414] border border-[#2A2A2A] rounded-xl px-3 py-2 text-xs text-[#F8F5F2] placeholder-[#666666] focus:outline-none focus:border-[#D8A47F]"
                  />
                  {errors.customerName && (
                    <p className="text-red-400 text-[10px] mt-1">{errors.customerName}</p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-[#E0E0E0] mb-1">WhatsApp com DDD *</label>
                  <input
                    type="tel"
                    value={customerWhatsapp}
                    onChange={handlePhoneChange}
                    placeholder="(11) 98765-4321"
                    className="w-full bg-[#141414] border border-[#2A2A2A] rounded-xl px-3 py-2 text-xs text-[#F8F5F2] placeholder-[#666666] focus:outline-none focus:border-[#D8A47F]"
                  />
                  {errors.customerWhatsapp && (
                    <p className="text-red-400 text-[10px] mt-1">{errors.customerWhatsapp}</p>
                  )}
                </div>
              </div>

              {/* Delivery Option */}
              <div className="space-y-3 bg-[#1F1F1F] p-4 rounded-2xl border border-[#2A2A2A]">
                <h3 className="font-bold text-[#F8F5F2] text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#D8A47F]" />
                  <span>2. Forma de Entrega</span>
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('delivery')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      deliveryType === 'delivery'
                        ? 'border-[#D8A47F] bg-[#D8A47F]/10 text-[#D8A47F] font-bold'
                        : 'border-[#2A2A2A] bg-[#141414] text-[#A0A0A0]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Truck className="w-4 h-4" />
                      {deliveryType === 'delivery' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-xs font-bold text-[#F8F5F2]">Receber em Casa</span>
                    <span className="text-[10px] font-normal text-[#A0A0A0]">Envio via Correios / Motoboy</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('pickup')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      deliveryType === 'pickup'
                        ? 'border-[#D8A47F] bg-[#D8A47F]/10 text-[#D8A47F] font-bold'
                        : 'border-[#2A2A2A] bg-[#141414] text-[#A0A0A0]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Store className="w-4 h-4" />
                      {deliveryType === 'pickup' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-xs font-bold text-[#F8F5F2]">Retirar na Loja</span>
                    <span className="text-[10px] font-normal text-emerald-400">Grátis & Imediato</span>
                  </button>
                </div>

                {deliveryType === 'delivery' ? (
                  <div className="space-y-2 pt-2 border-t border-[#2A2A2A]">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="block text-[11px] font-semibold text-[#E0E0E0] mb-0.5">Endereço (Rua/Av) *</label>
                        <input
                          type="text"
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          placeholder="Ex: Rua Oscar Freire"
                          className="w-full bg-[#141414] border border-[#2A2A2A] rounded-xl px-2.5 py-1.5 text-xs text-[#F8F5F2] placeholder-[#666666]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#E0E0E0] mb-0.5">Nº *</label>
                        <input
                          type="text"
                          value={number}
                          onChange={(e) => setNumber(e.target.value)}
                          placeholder="120"
                          className="w-full bg-[#141414] border border-[#2A2A2A] rounded-xl px-2.5 py-1.5 text-xs text-[#F8F5F2] placeholder-[#666666]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-[#E0E0E0] mb-0.5">Complemento</label>
                        <input
                          type="text"
                          value={complement}
                          onChange={(e) => setComplement(e.target.value)}
                          placeholder="Apto, bloco..."
                          className="w-full bg-[#141414] border border-[#2A2A2A] rounded-xl px-2.5 py-1.5 text-xs text-[#F8F5F2] placeholder-[#666666]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#E0E0E0] mb-0.5">Bairro *</label>
                        <input
                          type="text"
                          value={neighborhood}
                          onChange={(e) => setNeighborhood(e.target.value)}
                          placeholder="Bairro"
                          className="w-full bg-[#141414] border border-[#2A2A2A] rounded-xl px-2.5 py-1.5 text-xs text-[#F8F5F2] placeholder-[#666666]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="block text-[11px] font-semibold text-[#E0E0E0] mb-0.5">Cidade *</label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="São Paulo"
                          className="w-full bg-[#141414] border border-[#2A2A2A] rounded-xl px-2.5 py-1.5 text-xs text-[#F8F5F2] placeholder-[#666666]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[#E0E0E0] mb-0.5">CEP</label>
                        <input
                          type="text"
                          value={zipCode}
                          onChange={handleCepChange}
                          placeholder="00000-000"
                          className="w-full bg-[#141414] border border-[#2A2A2A] rounded-xl px-2.5 py-1.5 text-xs text-[#F8F5F2] placeholder-[#666666]"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-[#141414] rounded-xl border border-[#2A2A2A] text-[11px] text-[#A0A0A0] space-y-1">
                    <p className="font-semibold text-[#F8F5F2]">Endereço para Retirada:</p>
                    <p>{config.address}</p>
                    <p className="text-emerald-400 font-medium pt-1">
                      ✓ {config.pickupInstructions || 'Retirada em até 2h após a confirmação.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Payment Section (Estrutura mantida / Processamento ativo desativado) */}
              <div className="space-y-3 bg-[#1F1F1F] p-4 rounded-2xl border border-[#2A2A2A]">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[#F8F5F2] text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-[#D8A47F]" />
                    <span>3. Pagamento & Fechamento</span>
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#2A2A2A] text-[#D8A47F] border border-[#D8A47F]/30">
                    Processamento direto via WhatsApp
                  </span>
                </div>

                <div className="p-3 bg-[#141414] rounded-xl border border-[#2A2A2A] text-[11px] text-[#E0E0E0] space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-[#D8A47F]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Fechamento Direto no WhatsApp da Loja</span>
                  </div>
                  <p className="leading-relaxed text-[#A0A0A0]">
                    A estrutura de pagamentos online está mantida na plataforma, porém o <strong className="text-[#F8F5F2]">processamento automático foi desativado temporariamente</strong> conforme diretriz do sistema.
                  </p>
                  <p className="text-[#A0A0A0]">
                    Ao clicar em finalizar, o pedido é registrado com segurança e encaminhado diretamente ao <strong className="text-[#F8F5F2]">WhatsApp da proprietária</strong> para confirmação imediata (via PIX ou link de pagamento).
                  </p>
                  {config.pixKey && (
                    <div className="pt-2 border-t border-[#2A2A2A]">
                      <p className="font-bold text-[#F8F5F2] mb-0.5">Chave PIX da Boutique:</p>
                      <code className="bg-[#1F1F1F] px-2 py-1 rounded text-[11px] font-mono select-all text-[#D8A47F] block border border-[#2A2A2A]">
                        {config.pixKey}
                      </code>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-semibold text-[#E0E0E0] mb-1">
                  Observações para o Pedido (Opcional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Embalar para presente com laço, instruções para entrega..."
                  rows={2}
                  className="w-full bg-[#141414] border border-[#2A2A2A] rounded-xl p-2.5 text-xs text-[#F8F5F2] placeholder-[#666666] focus:outline-none focus:border-[#D8A47F]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 bg-[#1F1F1F] border-t border-[#2A2A2A] space-y-3">
            {/* Subtotal row */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[#A0A0A0]">
                <span>Subtotal dos itens:</span>
                <span>R$ {cartSubtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex items-center justify-between text-[#A0A0A0]">
                <span>Entrega:</span>
                <span>
                  {deliveryType === 'pickup'
                    ? 'Grátis (Retirada)'
                    : missingForFreeShipping === 0
                    ? 'Grátis'
                    : 'Calculado no WhatsApp'}
                </span>
              </div>
              <div className="flex items-center justify-between text-base font-bold text-[#F8F5F2] pt-1 border-t border-[#2A2A2A]">
                <span>Total:</span>
                <span className="text-xl text-[#D8A47F]">
                  R$ {cartSubtotal.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            {/* CTAs */}
            {checkoutStep === 'cart' ? (
              <button
                type="button"
                onClick={() => setCheckoutStep('checkout')}
                className="w-full py-3.5 px-4 bg-[#C75C5C] hover:bg-[#B34E4E] text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-98"
              >
                <span>Avançar para Entrega</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinishOrder}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-98 disabled:opacity-50"
              >
                <Phone className="w-4 h-4" />
                <span>
                  {isSubmitting ? 'Gerando Pedido...' : 'Enviar Pedido para o WhatsApp'}
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
