import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Order, OrderStatus } from '../../types';
import {
  Search,
  MessageCircle,
  Truck,
  Store,
  ChevronDown,
  ChevronUp,
  Trash2,
  Phone,
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { openWhatsAppChat } from '../../utils/whatsappOrder';

export const AdminOrders: React.FC = () => {
  const { orders, updateOrderStatus, deleteOrder, config } = useStore();

  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== 'todos' && order.status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesNum = order.orderNumber.toLowerCase().includes(q);
      const matchesClient = order.customerName.toLowerCase().includes(q);
      const matchesPhone = order.customerWhatsapp.includes(q);
      if (!matchesNum && !matchesClient && !matchesPhone) return false;
    }
    return true;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pendente':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'confirmado':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'enviado':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'concluido':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'cancelado':
        return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  const handleWhatsAppContact = (order: Order) => {
    let msg = `Olá ${order.customerName}! Aqui é a ${config.ownerName} da ${config.name}.`;
    if (order.status === 'pendente') {
      msg += ` Recebemos seu pedido #${order.orderNumber} no valor de R$ ${order.totalAmount.toFixed(2).replace('.', ',')}! Como gostaria de efetuar o pagamento?`;
    } else if (order.status === 'confirmado') {
      msg += ` Seu pedido #${order.orderNumber} foi confirmado com sucesso e já está sendo embalado com todo o carinho!`;
    } else if (order.status === 'enviado') {
      msg += ` Boas notícias! Seu pedido #${order.orderNumber} acabou de sair para entrega.`;
    } else {
      msg += ` Gostaria de saber como foi sua experiência com o pedido #${order.orderNumber}? Esperamos que tenha amado suas peças!`;
    }
    openWhatsAppChat(order.customerWhatsapp, msg);
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="bg-white p-5 rounded-3xl border border-[#EFE9E2] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-['Playfair_Display',serif] text-xl font-bold text-[#2D2926]">
              Gestão de Pedidos
            </h2>
            <p className="text-xs text-[#7D756D]">
              Acompanhe o status, endereço de entrega e chame clientes diretamente no WhatsApp
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por cliente, pedido..."
              className="w-full bg-[#FAF8F5] border border-[#E8DFD5] rounded-full py-2 pl-9 pr-4 text-xs text-[#2D2926] focus:outline-none focus:ring-2 focus:ring-[#9B4B5A]/30"
            />
            <Search className="w-3.5 h-3.5 text-[#8A7E76] absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'todos', label: 'Todos os Pedidos', count: orders.length },
            { id: 'pendente', label: 'Pendentes', count: orders.filter((o) => o.status === 'pendente').length },
            { id: 'confirmado', label: 'Confirmados', count: orders.filter((o) => o.status === 'confirmado').length },
            { id: 'enviado', label: 'Enviados', count: orders.filter((o) => o.status === 'enviado').length },
            { id: 'concluido', label: 'Concluídos', count: orders.filter((o) => o.status === 'concluido').length },
            { id: 'cancelado', label: 'Cancelados', count: orders.filter((o) => o.status === 'cancelado').length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-[#9B4B5A] text-white shadow-xs'
                  : 'bg-[#FAF8F5] text-[#59524C] hover:bg-[#F0EAE1]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  statusFilter === tab.id ? 'bg-white/25 text-white' : 'bg-[#EAE4DD] text-[#4A423D]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-[#EFE9E2] shadow-2xs overflow-hidden transition-all"
              >
                {/* Order Summary Bar */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                        order.deliveryType === 'delivery'
                          ? 'bg-[#FAF3F5] text-[#9B4B5A]'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {order.deliveryType === 'delivery' ? <Truck className="w-5 h-5" /> : <Store className="w-5 h-5" />}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-[#2D2926]">
                          #{order.orderNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-[#2D2926] truncate">
                        {order.customerName}
                      </h4>

                      <p className="text-[11px] text-[#7D756D] flex items-center gap-2 flex-wrap">
                        <span>📱 {order.customerWhatsapp}</span>
                        <span>•</span>
                        <span>{order.items.length} {order.items.length === 1 ? 'peça' : 'peças'}</span>
                        <span>•</span>
                        <span>{new Date(order.createdAt).toLocaleDateString('pt-BR')} às {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F5F0EA]">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-[#8A7E76] block">Total</span>
                      <span className="text-base sm:text-lg font-bold text-[#9B4B5A]">
                        R$ {order.totalAmount.toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    {/* Quick WhatsApp button */}
                    <button
                      type="button"
                      onClick={() => handleWhatsAppContact(order)}
                      className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                      title="Conversar com a cliente no WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </button>

                    {/* Expand/Collapse details */}
                    <button
                      type="button"
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      className="p-2 rounded-xl bg-[#FAF8F5] text-[#7D756D] hover:bg-[#EAE4DD] transition-colors cursor-pointer"
                      title={isExpanded ? 'Recolher detalhes' : 'Ver detalhes do pedido'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Detailed View */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 bg-[#FAF8F5] border-t border-[#EFE9E2] space-y-5 text-xs">
                    {/* Status Management Bar */}
                    <div className="bg-white p-3.5 rounded-xl border border-[#E8DFD5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#2D2926]">Alterar Status do Pedido:</span>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        {(['pendente', 'confirmado', 'enviado', 'concluido', 'cancelado'] as OrderStatus[]).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => updateOrderStatus(order.id, st)}
                            className={`px-3 py-1 rounded-lg font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border ${
                              order.status === st
                                ? 'bg-[#9B4B5A] text-white border-[#9B4B5A] shadow-xs'
                                : 'bg-white text-[#59524C] border-[#E8DFD5] hover:bg-[#F5F0EA]'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Items Table */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-[#2D2926] uppercase tracking-wider text-[11px]">
                        Itens do Pedido ({order.items.length})
                      </h4>
                      <div className="bg-white rounded-xl border border-[#E8DFD5] divide-y divide-[#F5F0EA] overflow-hidden">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="p-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt=""
                                  className="w-12 h-14 object-cover rounded-lg border border-[#EAE4DD]"
                                />
                              )}
                              <div>
                                <p className="font-bold text-[#2D2926]">{item.productName}</p>
                                <p className="text-[11px] text-[#7D756D]">
                                  Tamanho: <strong className="text-[#2D2926]">{item.size}</strong> • Cor: {item.color}
                                </p>
                                <p className="text-[11px] text-[#8A7E76]">
                                  {item.quantity}x de R$ {item.unitPrice.toFixed(2).replace('.', ',')}
                                </p>
                              </div>
                            </div>
                            <span className="font-bold text-sm text-[#9B4B5A]">
                              R$ {item.subtotal.toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery & Customer Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Address card */}
                      <div className="bg-white p-3.5 rounded-xl border border-[#E8DFD5] space-y-1.5">
                        <p className="font-bold text-[#2D2926] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-[#9B4B5A]" />
                          <span>Destino da Entrega</span>
                        </p>
                        {order.deliveryType === 'delivery' && order.address ? (
                          <div className="text-[#4A423D] leading-relaxed">
                            <p>{order.address.street}, nº {order.address.number} {order.address.complement && `(${order.address.complement})`}</p>
                            <p>{order.address.neighborhood} — {order.address.city}/{order.address.state}</p>
                            <p className="text-[11px] text-[#8A7E76]">CEP: {order.address.zipCode}</p>
                          </div>
                        ) : (
                          <p className="text-emerald-700 font-semibold">
                            Retirada Presencial na Loja / Boutique
                          </p>
                        )}
                      </div>

                      {/* Payment & Notes */}
                      <div className="bg-white p-3.5 rounded-xl border border-[#E8DFD5] space-y-1.5">
                        <p className="font-bold text-[#2D2926] uppercase tracking-wider text-[11px]">
                          Pagamento & Observações
                        </p>
                        <p className="text-[#4A423D]">
                          Método: <strong>{order.paymentMethod.toUpperCase()}</strong>
                        </p>
                        {order.notes && (
                          <p className="p-2 bg-[#FAF3F5] rounded-lg text-[#9B4B5A] font-medium text-[11px]">
                            Obs: "{order.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Delete Order Action */}
                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Deseja realmente excluir o pedido #${order.orderNumber}?`)) {
                            deleteOrder(order.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Excluir este pedido</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-[#EFE9E2] text-center space-y-3">
          <p className="font-['Playfair_Display',serif] text-lg font-bold text-[#2D2926]">
            Nenhum pedido encontrado com os filtros selecionados
          </p>
          <p className="text-xs text-[#7D756D]">
            Experimente alterar o filtro de status ou limpar a busca.
          </p>
        </div>
      )}
    </div>
  );
};
