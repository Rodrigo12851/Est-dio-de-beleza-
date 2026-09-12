import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  MessageCircle,
  Package,
  Sparkles,
} from 'lucide-react';
import { openWhatsAppChat } from '../../utils/whatsappOrder';

export const AdminDashboard: React.FC = () => {
  const { orders, products, setAdminTab, config } = useStore();

  const totalRevenue = orders.reduce((acc, o) => {
    if (o.status !== 'cancelado') return acc + o.totalAmount;
    return acc;
  }, 0);

  const pendingOrders = orders.filter((o) => o.status === 'pendente');
  const confirmedOrders = orders.filter((o) => o.status === 'confirmado');
  const deliveredOrders = orders.filter((o) => o.status === 'concluido');

  // Low stock check across product variants
  const lowStockVariants: { productName: string; size: string; color: string; stock: number }[] = [];
  products.forEach((p) => {
    p.variants.forEach((v) => {
      if (v.stockQuantity <= 3) {
        lowStockVariants.push({
          productName: p.name,
          size: v.size,
          color: v.color,
          stock: v.stockQuantity,
        });
      }
    });
  });

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#FAF3F5] via-white to-[#FDFBF9] p-5 sm:p-6 rounded-3xl border border-[#F0D5DC] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold text-[#9B4B5A] uppercase tracking-wider">
              Painel em Tempo Real
            </span>
          </div>
          <h2 className="font-['Playfair_Display',serif] text-xl sm:text-2xl font-bold text-[#2D2926]">
            Bem-vinda, {config.ownerName}! ✨
          </h2>
          <p className="text-xs text-[#7D756D]">
            Aqui você acompanha os pedidos recebidos pelo WhatsApp, estoque por tamanho/cor e faturamento da {config.name}.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setAdminTab('orders')}
            className="px-4 py-2 bg-[#9B4B5A] hover:bg-[#843A48] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>Ver Pedidos Pendentes ({pendingOrders.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Total Faturado */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EFE9E2] shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8A7E76] uppercase tracking-wider">
              Faturamento
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[#2D2926]">
            R$ {totalRevenue.toFixed(2).replace('.', ',')}
          </p>
          <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>{orders.length} pedidos registrados</span>
          </p>
        </div>

        {/* Pedidos Pendentes */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EFE9E2] shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8A7E76] uppercase tracking-wider">
              Aguardando Confirmação
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[#2D2926]">
            {pendingOrders.length}
          </p>
          <p className="text-[11px] text-amber-700 font-medium">
            {pendingOrders.length > 0 ? 'Requer atenção no WhatsApp' : 'Tudo em dia!'}
          </p>
        </div>

        {/* Pedidos Concluídos */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EFE9E2] shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8A7E76] uppercase tracking-wider">
              Entregues / Concluídos
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF3F5] text-[#9B4B5A] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[#2D2926]">
            {deliveredOrders.length}
          </p>
          <p className="text-[11px] text-[#7D756D]">
            {confirmedOrders.length} em preparação/envio
          </p>
        </div>

        {/* Alerta de Estoque Baixo */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EFE9E2] shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#8A7E76] uppercase tracking-wider">
              Estoque Baixo (≤3)
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[#2D2926]">
            {lowStockVariants.length} <span className="text-xs font-normal text-[#8A7E76]">grades</span>
          </p>
          <button
            type="button"
            onClick={() => setAdminTab('products')}
            className="text-[11px] text-[#9B4B5A] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>Gerenciar estoque</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Two Columns: Recent Orders & Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Orders List */}
        <div className="lg:col-span-8 bg-white p-5 rounded-3xl border border-[#EFE9E2] shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1]">
            <h3 className="font-['Playfair_Display',serif] text-base sm:text-lg font-bold text-[#2D2926]">
              Últimos Pedidos Recebidos
            </h3>
            <button
              type="button"
              onClick={() => setAdminTab('orders')}
              className="text-xs text-[#9B4B5A] hover:underline font-semibold cursor-pointer"
            >
              Ver todos os pedidos ({orders.length})
            </button>
          </div>

          {recentOrders.length > 0 ? (
            <div className="divide-y divide-[#F5F0EA]">
              {recentOrders.map((ord) => (
                <div key={ord.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#2D2926]">
                        #{ord.orderNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          ord.status === 'pendente'
                            ? 'bg-amber-100 text-amber-800'
                            : ord.status === 'confirmado'
                            ? 'bg-blue-100 text-blue-800'
                            : ord.status === 'enviado'
                            ? 'bg-purple-100 text-purple-800'
                            : ord.status === 'concluido'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-zinc-100 text-zinc-800'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-[#4A423D] truncate">
                      {ord.customerName}
                    </p>

                    <p className="text-[11px] text-[#8A7E76]">
                      {ord.items.length} {ord.items.length === 1 ? 'item' : 'itens'} • {ord.deliveryType === 'delivery' ? 'Entrega' : 'Retirada'} • {new Date(ord.createdAt).toLocaleDateString('pt-BR')} às {new Date(ord.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <span className="text-sm font-bold text-[#9B4B5A] mr-2">
                      R$ {ord.totalAmount.toFixed(2).replace('.', ',')}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        openWhatsAppChat(
                          ord.customerWhatsapp,
                          `Olá ${ord.customerName}, tudo bem? Aqui é a ${config.ownerName} da ${config.name}! Estou entrando em contato sobre seu pedido #${ord.orderNumber}.`
                        )
                      }
                      className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer border border-emerald-200"
                      title="Chamar cliente no WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminTab('orders')}
                      className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] text-[#2D2926] hover:bg-[#EAE4DD] text-xs font-semibold cursor-pointer border border-[#EAE4DD]"
                    >
                      Detalhes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#8A7E76] text-center py-8">
              Nenhum pedido recebido ainda.
            </p>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-[#EFE9E2] shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0EAE1]">
            <h3 className="font-['Playfair_Display',serif] text-base font-bold text-[#2D2926] flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Atenção ao Estoque</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">
              {lowStockVariants.length} grades
            </span>
          </div>

          {lowStockVariants.length > 0 ? (
            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {lowStockVariants.slice(0, 6).map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-[#FAF8F5] rounded-xl border border-[#EFE9E2] text-xs flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-[#2D2926] truncate">{item.productName}</p>
                    <p className="text-[11px] text-[#7D756D]">
                      Tam: <strong>{item.size}</strong> • Cor: {item.color}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md font-bold text-[11px] shrink-0 ${
                      item.stock === 0 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {item.stock === 0 ? 'Esgotado' : `${item.stock} un`}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 space-y-1">
              <p className="text-xs font-semibold text-emerald-700">Tudo em estoque!</p>
              <p className="text-[11px] text-[#8A7E76]">Nenhuma variação com estoque crítico.</p>
            </div>
          )}

          <button
            type="button"
            onClick={() => setAdminTab('products')}
            className="w-full py-2.5 rounded-xl bg-[#FAF3F5] text-[#9B4B5A] hover:bg-[#9B4B5A] hover:text-white transition-all text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Gerenciar Todos os Produtos</span>
          </button>
        </div>
      </div>
    </div>
  );
};
