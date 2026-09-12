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
import { Lock, Store, Shield, ArrowLeft, MessageCircle, AlertTriangle } from 'lucide-react';
import { getWhatsAppSupportLink } from './utils/storeRouting';

const MainAppContent: React.FC = () => {
  const {
    appRoute,
    setAppRoute,
    isMerchantAuthenticated,
    isSuperAdminAuthenticated,
    currentStore,
    currentStoreId,
    isStoreBlocked,
    supportWhatsapp,
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

  const isCurrentStoreBlocked = isStoreBlocked(currentStoreId);
  const supportLink = getWhatsAppSupportLink(
    supportWhatsapp,
    currentStore?.name || 'Minha Loja',
    currentStoreId,
    'blocked_password'
  );

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
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto border ${
                  isCurrentStoreBlocked
                    ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                    : 'bg-[#1F1F1F] border-[#9B4B5A]/40 text-[#D8A47F]'
                }`}
              >
                {isCurrentStoreBlocked ? <AlertTriangle className="w-8 h-8" /> : <Store className="w-8 h-8" />}
              </div>

              <div className="space-y-1">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    isCurrentStoreBlocked
                      ? 'bg-red-950/60 text-red-300 border-red-500/40'
                      : 'bg-[#1F1F1F] text-[#D8A47F] border-[#9B4B5A]/30'
                  }`}
                >
                  {isCurrentStoreBlocked ? 'Segurança • Acesso Bloqueado' : 'Painel Administrativo do Lojista'}
                </span>
                <h2 className="text-xl font-bold font-['Playfair_Display',serif] text-[#F8F5F2]">
                  {currentStore?.name || 'Boutique'}
                </h2>
                <p className="text-xs text-[#A0A0A0]">
                  {isCurrentStoreBlocked
                    ? 'Esta boutique foi bloqueada por tentativas excessivas de senha incorreta.'
                    : `Área exclusiva para gerenciar pedidos, catálogo de peças e fotos da sua boutique.`}
                </p>
              </div>

              {isCurrentStoreBlocked ? (
                <div className="pt-2 space-y-3">
                  <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/30 text-left text-xs text-red-200 space-y-1">
                    <p className="font-semibold">⚠️ Limite de 4 tentativas atingido</p>
                    <p className="text-[11px] text-red-300/80 leading-relaxed">
                      Entre em contato com o suporte e proprietário do Intima Lab via WhatsApp para solicitar o desbloqueio com segurança.
                    </p>
                  </div>

                  <a
                    href={supportLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Falar com o Suporte no WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setAppRoute('store')}
                    className="w-full py-2.5 text-xs text-[#A0A0A0] hover:text-[#F8F5F2] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Voltar para o Catálogo da Loja</span>
                  </button>
                </div>
              ) : (
                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={() => handleOpenLogin('merchant')}
                    className="w-full py-3 bg-[#9B4B5A] hover:bg-[#843A48] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Digitar Senha de Acesso</span>
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
              )}
            </div>
          </div>
        )
      )}

      {/* ROTA 1: ROTA PÚBLICA DO CLIENTE (Public E-Commerce & Catálogo de Novidades) */}
      {appRoute === 'store' && (
        <div className="min-h-screen bg-[#121212] text-[#F8F5F2] flex flex-col font-sans selection:bg-[#9B4B5A] selection:text-white">
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
        initialType={adminLoginInitialType}
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
