import React from 'react';
import { useStore } from '../../context/StoreContext';
import { ShoppingBag, X, ArrowRight, BellRing } from 'lucide-react';

export const OrderNotificationBanner: React.FC = () => {
  const { lastCreatedOrder, clearOrderNotification, setViewMode, setAdminTab } = useStore();

  if (!lastCreatedOrder) return null;

  const handleOpenOrder = () => {
    setViewMode('admin');
    setAdminTab('orders');
    clearOrderNotification();
  };

  return (
    <aside
      aria-label="Alerta de novo pedido"
      className="fixed top-3 inset-x-3 sm:top-5 sm:right-5 sm:left-auto sm:max-w-md z-50 bg-[#1F1F1F] text-[#F8F5F2] p-4 rounded-2xl shadow-2xl border border-[#2A2A2A] flex items-start gap-3 animate-slideDown"
    >
      <div className="w-10 h-10 rounded-xl bg-[#D8A47F] text-[#121212] flex items-center justify-center shrink-0 shadow-md animate-bounce font-bold">
        <BellRing className="w-5 h-5 text-[#121212]" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#D8A47F]">
            Novo Pedido Recebido!
          </h4>
        </div>

        <p className="text-sm font-semibold text-[#F8F5F2] truncate mt-0.5">
          {lastCreatedOrder.customerName} • #{lastCreatedOrder.orderNumber}
        </p>

        <p className="text-xs text-[#A0A0A0] mt-0.5">
          Total: <strong className="text-[#D8A47F]">R$ {lastCreatedOrder.totalAmount.toFixed(2).replace('.', ',')}</strong> ({lastCreatedOrder.items.length} itens)
        </p>

        <div className="pt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenOrder}
            className="px-3 py-1.5 bg-[#C75C5C] hover:bg-[#B34E4E] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <span>Ver no Painel</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={clearOrderNotification}
            className="px-2.5 py-1.5 text-xs text-[#A0A0A0] hover:text-[#F8F5F2] transition-colors cursor-pointer"
          >
            Dispensar
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={clearOrderNotification}
        className="text-[#A69C94] hover:text-white p-1 cursor-pointer"
        aria-label="Fechar notificação"
      >
        <X className="w-4 h-4" />
      </button>
    </aside>
  );
};
