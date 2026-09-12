import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { StoreNavbar } from './components/store/StoreNavbar';
import { StoreView } from './components/store/StoreView';
import { CartDrawer } from './components/store/CartDrawer';
import { OrderConfirmationModal } from './components/store/OrderConfirmationModal';
import { AdminLoginModal } from './components/store/AdminLoginModal';
import { OrderNotificationBanner } from './components/store/OrderNotificationBanner';
import { PwaInstallBanner } from './components/store/PwaInstallBanner';
import { AdminLayout } from './components/admin/AdminLayout';
import { SuperAdminDashboard } from './components/superadmin/SuperAdminDashboard';
import { Lock, Store, Shield, ArrowLeft } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    appRoute,
    setAppRoute,
    isMerchantAuthenticated,
    isSuperAdminAuthenticated,
    currentStore,
    currentStoreId,
  } = useStore();

  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [adminLoginInitialType, setAdminLoginInitialType] = useState<'merchant' | 'superadmin'>('merchant');
  const [confirmedOrderData, setConfirmedOrderData] = useState<{
    orderNumber: string;
    whatsappUrl: string;
  } | null>(null);

  const handleOrderCompleted = (orderNumber: string, whatsappUrl: string) => {
    setConfirmedOrderData({ orderNumber, whatsappUrl });
  };

  const handleOpenLogin = (type: 'merchant' | 'superadmin' = 'merchant') => {
    setAdminLoginInitialType(type);
    setIsAdminLoginOpen(true);
  };

  return (
    <>
      {/* Real-time Order Notification Banner (Owner Alert on Top) */}
      <OrderNotificationBanner />

      {/* ROTA 3: SUPER ADMIN PLATAFORMA (Master Governance) */}
      {appRoute === 'superadmin' && (
        isSuperAdminAuthenticated ? (
          <SuperAdminDashboard />
        ) : (
          <div className="min-h-screen bg-[#1F1B18] text-[#EDE7DF] flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-[#2A2522] border border-amber-500/30 rounded-3xl p-8 shadow-2xl text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                <Shield className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full">
                  Área 3 • Super Admin
                </span>
                <h2 className="text-xl font-bold font-['Playfair_Display',serif] text-white">
                  Controle Geral da Plataforma
                </h2>
                <p className="text-xs text-[#A89F91]">
                  Acesso master reservado para você gerenciar todos os lojistas, limites e métricas globais.
                </p>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => handleOpenLogin('superadmin')}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Inserir Chave Master</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAppRoute('store')}
                  className="w-full py-2.5 text-xs text-[#A89F91] hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar para o Catálogo Público</span>
                </button>
              </div>
            </div>
          </div>
        )
      )}

      {/* ROTA 2: ÁREA ADMINISTRATIVA DO LOJISTA (Store-Scoped Merchant) */}
      {appRoute === 'merchant' && (
        isMerchantAuthenticated ? (
          <AdminLayout />
        ) : (
          <div className="min-h-screen bg-[#FDFBF9] text-[#2D2926] flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white border border-[#E8DFD5] rounded-3xl p-8 shadow-xl text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-[#FAF3F5] border border-[#F0D5DC] flex items-center justify-center mx-auto text-[#9B4B5A]">
                <Store className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#9B4B5A] bg-[#FAF3F5] px-2.5 py-0.5 rounded-full">
                  Área 2 • Lojista
                </span>
                <h2 className="text-xl font-bold font-['Playfair_Display',serif] text-[#2D2926]">
                  Painel da Boutique ({currentStore?.name || 'Loja Ativa'})
                </h2>
                <p className="text-xs text-[#7D756D]">
                  Acesso restrito ao proprietário da loja (ID: <strong className="font-mono text-[#9B4B5A]">{currentStoreId}</strong>). Ele enxerga somente os dados da própria loja.
                </p>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => handleOpenLogin('merchant')}
                  className="w-full py-3 bg-[#9B4B5A] hover:bg-[#843A48] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Digitar PIN da Loja</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAppRoute('store')}
                  className="w-full py-2.5 text-xs text-[#7D756D] hover:text-[#2D2926] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar para o Catálogo do Cliente</span>
                </button>
              </div>
            </div>
          </div>
        )
      )}

      {/* ROTA 1: ROTA PÚBLICA DO CLIENTE (Public E-Commerce & Catálogo de Novidades) */}
      {appRoute === 'store' && (
        <div className="min-h-screen bg-[#FDFBF9] text-[#2D2926] flex flex-col font-sans selection:bg-[#FAF3F5] selection:text-[#9B4B5A]">
          {/* Top Navbar */}
          <StoreNavbar onOpenAdminLogin={() => handleOpenLogin('merchant')} />

          {/* PWA Install Banner */}
          <PwaInstallBanner />

          {/* Main Storefront & Catalog with Novidades */}
          <StoreView />
        </div>
      )}

      {/* Cart & Checkout Drawer */}
      <CartDrawer onOrderCompleted={handleOrderCompleted} />

      {/* Order Confirmation Celebratory Modal */}
      {confirmedOrderData && (
        <OrderConfirmationModal
          orderNumber={confirmedOrderData.orderNumber}
          whatsappUrl={confirmedOrderData.whatsappUrl}
          onClose={() => setConfirmedOrderData(null)}
        />
      )}

      {/* 2-Tier Admin Login Modal (Merchant vs Super Admin) */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => {
          // Handled within modal by calling setAppRoute
        }}
      />
    </>
  );
};

export function App() {
  return (
    <StoreProvider>
      <MainAppContent />
    </StoreProvider>
  );
}

export default App;
