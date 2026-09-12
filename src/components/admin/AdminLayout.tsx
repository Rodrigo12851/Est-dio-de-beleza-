import React, { useState } from 'react';
import { useStore, AdminTab } from '../../context/StoreContext';
import { AdminDashboard } from './AdminDashboard';
import { AdminOrders } from './AdminOrders';
import { AdminProducts } from './AdminProducts';
import { AdminCategories } from './AdminCategories';
import { AdminSettings } from './AdminSettings';
import { ShareStoreModal } from './ShareStoreModal';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Settings,
  Eye,
  LogOut,
  Sparkles,
  Share2,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const {
    adminTab,
    setAdminTab,
    merchantLogout,
    orders,
    config,
    currentStore,
    currentStoreId,
    setAppRoute,
  } = useStore();

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const pendingCount = orders.filter((o) => o.status === 'pendente').length;

  const tabs: { id: AdminTab; label: string; icon: React.FC<any>; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Pedidos', icon: ShoppingBag, badge: pendingCount },
    { id: 'products', label: 'Produtos & Estoque', icon: Package },
    { id: 'categories', label: 'Categorias', icon: Layers },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const handleLogout = () => {
    merchantLogout();
    setAppRoute('store');
  };

  return (
    <div className="min-h-screen bg-[#FDFBF9] flex flex-col text-[#2D2926]">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EFE9E2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
            {/* Title & Brand */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#9B4B5A] text-white flex items-center justify-center shadow-xs">
                <img src="/icon.svg" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-['Playfair_Display',serif] text-base sm:text-xl font-bold leading-tight">
                    {currentStore?.name || config.name}
                  </h1>
                  <span className="px-2 py-0.2 bg-[#9B4B5A]/10 text-[#9B4B5A] rounded-full text-[10px] font-bold uppercase tracking-wider">
                    Lojista
                  </span>
                  <span className="hidden sm:inline-block px-2 py-0.2 bg-[#FAF3F5] text-[#8A7E76] rounded text-[10px] font-mono">
                    ID: {currentStoreId}
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-[#8A7E76]">
                  Painel restrito da loja ({currentStore?.ownerName || config.ownerName})
                </p>
              </div>
            </div>

            {/* Top Right Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                title="Compartilhar link da loja para as clientes"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Link da Loja</span>
                <span className="sm:hidden">Compartilhar</span>
              </button>

              <button
                type="button"
                onClick={() => setAppRoute('store')}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#FAF3F5] text-[#9B4B5A] hover:bg-[#9B4B5A] hover:text-white rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-[#F0D5DC]"
                title="Visualizar a loja como cliente"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ver Loja Pública</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="p-2 text-[#8A7E76] hover:text-red-600 rounded-full hover:bg-red-50 transition-colors cursor-pointer"
                title="Sair do painel administrativo"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <nav aria-label="Navegação administrativa" className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-2 border-t border-[#F5F0EA] text-xs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = adminTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setAdminTab(tab.id)}
                  className={`whitespace-nowrap px-3.5 py-2 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#9B4B5A] text-white shadow-xs'
                      : 'bg-[#FAF8F5] text-[#59524C] hover:bg-[#F0EAE1] hover:text-[#2D2926]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-white text-[#9B4B5A]' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Admin Content Canvas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full">
        {adminTab === 'dashboard' && <AdminDashboard />}
        {adminTab === 'orders' && <AdminOrders />}
        {adminTab === 'products' && <AdminProducts />}
        {adminTab === 'categories' && <AdminCategories />}
        {adminTab === 'settings' && <AdminSettings />}
      </main>

      {/* Share Store Modal */}
      <ShareStoreModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
};
