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
          <div className="min-h-screen bg-[#121212] text-[#F8F5F2] flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-[#161616] border border-[#D8A47F]/40 rounded-3xl p-8 shadow-2xl text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-[#1F1F1F] border border-[#D8A47F]/40 flex items-center justify-center mx-auto text-[#D8A47F]">
                <Shield className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D8A47F] bg-[#1F1F1F] border border-[#D8A47F]/30 px-2.5 py-0.5 rounded-full">
                  Área 3 • Super Admin
                </span>
                <h2 className="text-xl font-bold font-['Playfair_Display',serif] text-[#F8F5F2]">
                  Controle Geral da Plataforma
                </h2>
                <p className="text-xs text-[#A0A0A0]">
                  Acesso master reservado para gerenciar todos os lojistas, permissões e métricas globais.
                </p>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => handleOpenLogin('superadmin')}
                  className="w-full py-3 bg-[#D8A47F] hover:bg-[#C8946F] text-[#121212] font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Inserir Chave Master</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAppRoute('store')}
                  className="w-full py-2.5 text-xs text-[#A0A0A0] hover:text-[#F8F5F2] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
          <div className="min-h-screen bg-[#121212] text-[#F8F5F2] flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-[#161616] border border-[#2A2A2A] rounded-3xl p-8 shadow-xl text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-[#1F1F1F] border border-[#C75C5C]/40 flex items-center justify-center mx-auto text-[#C75C5C]">
                <Store className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C75C5C] bg-[#1F1F1F] border border-[#C75C5C]/30 px-2.5 py-0.5 rounded-full">
                  Área 2 • Lojista
                </span>
                <h2 className="text-xl font-bold font-['Playfair_Display',serif] text-[#F8F5F2]">
                  Painel da Boutique ({currentStore?.name || 'Loja Ativa'})
                </h2>
                <p className="text-xs text-[#A0A0A0]">
                  Acesso restrito ao proprietário da loja (ID: <strong className="font-mono text-[#D8A47F]">{currentStoreId}</strong>). Ele enxerga somente os dados da própria loja.
                </p>
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => handleOpenLogin('merchant')}
                  className="w-full py-3 bg-[#C75C5C] hover:bg-[#B34E4E] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Digitar PIN da Loja</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAppRoute('store')}
                  className="w-full py-2.5 text-xs text-[#A0A0A0] hover:text-[#F8F5F2] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
        <div className="min-h-screen bg-[#121212] text-[#F8F5F2] flex flex-col font-sans selection:bg-[#C75C5C] selection:text-white">
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
