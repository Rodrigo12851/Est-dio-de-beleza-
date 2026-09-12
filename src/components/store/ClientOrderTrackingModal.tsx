import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus } from '../../types';
import {
  PackageCheck,
  X,
  Clock,
  CheckCircle2,
  Truck,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  MessageCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { openWhatsAppChat } from '../../utils/whatsappOrder';

interface ClientOrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClientOrderTrackingModal: React.FC<ClientOrderTrackingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { orders, currentStoreId, currentStore, config, palette } = useStore();
  const [customerPhoneQuery, setCustomerPhoneQuery] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Armazena no localStorage os números de pedidos gerados neste aparelho
  const [myOrderIds, setMyOrderIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`intimalab_client_orders_${currentStoreId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const isLight = palette === 'light-rose';

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`intimalab_client_orders_${currentStoreId}`);
      if (saved) {
        setMyOrderIds(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, [currentStoreId, isOpen]);

  if (!isOpen) return null;

  // Filtra os pedidos da cliente nesta loja
  const clientOrders = orders.filter((o) => {
    // 1. Se o pedido foi feito deste dispositivo
    const isFromThisDevice = myOrderIds.includes(o.id) || myOrderIds.includes(o.orderNumber);

    // 2. Ou se a cliente digitou o telefone dela para buscar os pedidos
    const cleanQuery = customerPhoneQuery.replace(/\D/g, '');
    const matchesPhone = cleanQuery.length >= 4 && o.customerWhatsapp.includes(cleanQuery);

    return isFromThisDevice || matchesPhone;
  });

  const getStatusConfig = (status: OrderStatus) => {
    switch (status) {
      case 'pendente':
        return {
          label: 'Aguardando Confirmação',
          color: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
          dotColor: 'bg-amber-500',
          desc: 'Seu pedido foi enviado para a lojista e está aguardando confirmação.',
          step: 1,
        };
      case 'confirmado':
        return {
          label: 'Pedido Confirmado',
          color: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
          dotColor: 'bg-blue-500',
          desc: 'A dona da loja já confirmou seu pedido e está separando suas peças com carinho!',
          step: 2,
        };
      case 'enviado':
        return {
          label: 'Saiu para Entrega / Pronto p/ Retirada',
          color: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
          dotColor: 'bg-purple-500',
          desc: 'Suas peças estão a caminho ou já prontas no balcão da boutique!',
          step: 3,
        };
      case 'concluido':
        return {
          label: 'Pedido Entregue e Concluído',
          color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          dotColor: 'bg-emerald-500',
          desc: 'Pedido entregue com sucesso! Esperamos que ame suas peças.',
          step: 4,
        };
      case 'cancelado':
        return {
          label: 'Cancelado',
          color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30',
          dotColor: 'bg-zinc-500',
          desc: 'Este pedido foi cancelado.',
          step: 0,
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      {/* Click outside to close */}
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div
        className={`relative w-full max-w-xl rounded-3xl shadow-2xl border overflow-hidden z-10 flex flex-col max-h-[90vh] transition-colors ${
          isLight
            ? 'bg-[#FAF7F5] border-[#E8E1DA] text-[#2D2926]'
            : 'bg-[#181818] border-[#2A2A2A] text-[#F8F5F2]'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between shrink-0 ${
            isLight ? 'bg-white border-[#E8E1DA]' : 'bg-[#1F1F1F] border-[#2A2A2A]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#C75C5C]/15 text-[#C75C5C] flex items-center justify-center font-bold">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-['Playfair_Display',serif] font-bold text-base sm:text-lg leading-tight">
                Meus Pedidos & Rastreamento
              </h3>
              <p className="text-xs text-[#888888]">
                Acompanhe o status atualizado em tempo real pela dona da loja
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              isLight
                ? 'text-[#666666] hover:bg-[#FAF7F5] hover:text-[#2D2926]'
                : 'text-[#AAAAAA] hover:bg-[#2A2A2A] hover:text-[#F8F5F2]'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search by WhatsApp input if customer ordered from another device */}
        <div
          className={`px-4 py-3 border-b text-xs shrink-0 ${
            isLight ? 'bg-[#F2ECE6] border-[#E8E1DA]' : 'bg-[#141414] border-[#2A2A2A]'
          }`}
        >
          <label className="block text-[11px] font-semibold text-[#888888] mb-1">
            Fez o pedido por outro aparelho? Busque pelo seu WhatsApp com DDD:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customerPhoneQuery}
              onChange={(e) => setCustomerPhoneQuery(e.target.value)}
              placeholder="Digite seu número de WhatsApp com DDD..."
              className={`flex-1 rounded-xl px-3 py-2 text-xs border focus:outline-none transition-all ${
                isLight
                  ? 'bg-white border-[#E8E1DA] text-[#2D2926] placeholder-[#AAAAAA] focus:border-[#C75C5C]'
                  : 'bg-[#1C1C1C] border-[#2A2A2A] text-[#F8F5F2] placeholder-[#666666] focus:border-[#D8A47F]'
              }`}
            />
            {customerPhoneQuery && (
              <button
                type="button"
                onClick={() => setCustomerPhoneQuery('')}
                className="px-3 py-2 text-xs rounded-xl bg-zinc-700 text-white cursor-pointer"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {/* Orders List / Timeline */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {clientOrders.length > 0 ? (
            clientOrders.map((order) => {
              const statusCfg = getStatusConfig(order.status);
              const isExpanded = expandedOrderId === order.id;

              return (
                <div
                  key={order.id}
                  className={`rounded-2xl border transition-all overflow-hidden shadow-xs ${
                    isLight
                      ? 'bg-white border-[#E8E1DA]'
                      : 'bg-[#1F1F1F] border-[#2A2A2A]'
                  }`}
                >
                  {/* Order Top Bar */}
                  <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-[#C75C5C]">
                          #{order.orderNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border flex items-center gap-1.5 ${statusCfg.color}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotColor} animate-pulse`} />
                          {statusCfg.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#888888]">
                        Realizado em {new Date(order.createdAt).toLocaleDateString('pt-BR')} às{' '}
                        {new Date(order.createdAt).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-inherit">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-[#888888] block">Total</span>
                        <span
                          className={`text-base font-bold ${
                            isLight ? 'text-[#9B4B5A]' : 'text-[#D8A47F]'
                          }`}
                        >
                          R$ {order.totalAmount.toFixed(2).replace('.', ',')}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                        className={`p-2 rounded-xl transition-colors cursor-pointer ${
                          isLight ? 'bg-[#F2ECE6] text-[#666666]' : 'bg-[#141414] text-[#AAAAAA]'
                        }`}
                        title="Ver detalhes do pedido"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Status Progress Tracker Bar */}
                  <div
                    className={`px-4 py-3 border-t text-xs ${
                      isLight ? 'bg-[#FAF7F5] border-[#E8E1DA]' : 'bg-[#181818] border-[#2A2A2A]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#C75C5C]" />
                        <span>{statusCfg.desc}</span>
                      </p>
                    </div>

                    {/* 4-Step Visual Progress */}
                    {order.status !== 'cancelado' && (
                      <div className="grid grid-cols-4 gap-1 pt-1">
                        {[
                          { step: 1, label: 'Enviado' },
                          { step: 2, label: 'Confirmado' },
                          { step: 3, label: 'A Caminho' },
                          { step: 4, label: 'Entregue' },
                        ].map((s) => (
                          <div key={s.step} className="space-y-1">
                            <div
                              className={`h-1.5 rounded-full transition-all ${
                                statusCfg.step >= s.step
                                  ? 'bg-[#C75C5C]'
                                  : isLight
                                  ? 'bg-zinc-200'
                                  : 'bg-[#2A2A2A]'
                              }`}
                            />
                            <p
                              className={`text-[9px] text-center truncate ${
                                statusCfg.step >= s.step
                                  ? 'font-bold text-[#C75C5C]'
                                  : 'text-[#888888]'
                              }`}
                            >
                              {s.label}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Expanded Items & Info */}
                  {isExpanded && (
                    <div
                      className={`p-4 border-t space-y-3 text-xs ${
                        isLight ? 'border-[#E8E1DA] bg-white' : 'border-[#2A2A2A] bg-[#141414]'
                      }`}
                    >
                      <h4 className="font-bold uppercase tracking-wider text-[10px] text-[#888888]">
                        Itens Solicitados ({order.items.length})
                      </h4>

                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 ${
                              isLight
                                ? 'bg-[#FAF7F5] border-[#E8E1DA]'
                                : 'bg-[#1F1F1F] border-[#2A2A2A]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt=""
                                  className="w-10 h-12 object-cover rounded-lg border border-inherit shrink-0"
                                />
                              )}
                              <div>
                                <p className="font-bold leading-tight">{item.productName}</p>
                                <p className="text-[11px] text-[#888888]">
                                  Tam: <strong>{item.size}</strong> • Cor: {item.color} • {item.quantity}x
                                </p>
                              </div>
                            </div>
                            <span className="font-bold text-xs">
                              R$ {item.subtotal.toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Delivery and contact with store */}
                      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-inherit">
                        <span className="text-[11px] text-[#888888]">
                          Forma de Entrega:{' '}
                          <strong className="text-inherit">
                            {order.deliveryType === 'delivery' ? 'Receber em Casa' : 'Retirar na Boutique'}
                          </strong>
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            const msg = `Olá! Gostaria de acompanhar o status do meu pedido #${order.orderNumber} feito na ${config.name}.`;
                            openWhatsAppChat(config.whatsapp || config.phone, msg);
                          }}
                          className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Falar sobre este pedido no WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#C75C5C]/10 text-[#C75C5C] flex items-center justify-center mx-auto">
                <ShoppingBag className="w-7 h-7 stroke-1" />
              </div>
              <div className="space-y-1">
                <h4 className="font-['Playfair_Display',serif] text-base font-bold">
                  Nenhum pedido encontrado neste dispositivo
                </h4>
                <p className="text-xs text-[#888888] max-w-sm mx-auto">
                  Quando você fizer um pedido na loja, ele aparecerá aqui automaticamente com o status atualizado em tempo real pela lojista!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
