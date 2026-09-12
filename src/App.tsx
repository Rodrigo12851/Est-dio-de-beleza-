import React, { useState } from 'react';
import { StoreProvider, useStore, MAX_LOGIN_ATTEMPTS } from './context/StoreContext';
import { StoreNavbar } from './components/store/StoreNavbar';
import { StoreView } from './components/store/StoreView';
import { CartDrawer } from './components/store/CartDrawer';
import { OrderConfirmationModal } from './components/store/OrderConfirmationModal';
import { AdminLoginModal } from './components/store/AdminLoginModal';
import { OrderNotificationBanner } from './components/store/OrderNotificationBanner';
import { PwaInstallBanner } from './components/store/PwaInstallBanner';
import { AdminLayout } from './components/admin/AdminLayout';
import { SuperAdminDashboard } from './components/superadmin/SuperAdminDashboard';
import { PasswordInput } from './components/common/PasswordInput';
import { Lock, Store, Shield, ArrowLeft, MessageCircle, AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';
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
    getRemainingAttempts,
    merchantLogin,
    superAdminLogin,
    supportWhatsapp,
  } = useStore();

  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [adminLoginInitialType, setAdminLoginInitialType] = useState<'merchant' | 'superadmin'>('merchant');
  
  // Estados para formulários de login direto
  const [merchantPinInput, setMerchantPinInput] = useState('');
  const [merchantError, setMerchantError] = useState<string | null>(null);

  const [superAdminPinInput, setSuperAdminPinInput] = useState('');
  const [superAdminError, setSuperAdminError] = useState<string | null>(null);

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
  const remainingMerchantAttempts = getRemainingAttempts(currentStoreId);

  const handleDirectMerchantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMerchantError(null);

    if (isCurrentStoreBlocked) return;

    const result = merchantLogin(merchantPinInput, currentStoreId);
    if (result.success) {
      setMerchantError(null);
      setMerchantPinInput('');
      setAppRoute('merchant');
    } else {
      if (result.blocked) {
        setMerchantError('Limite de 4 tentativas excedido! O acesso desta loja foi bloqueado por segurança.');
      } else {
        setMerchantError(
          `Senha incorreta! Você tem mais ${result.remaining} tentativa(s) antes do bloqueio da sua boutique.`
        );
      }
    }
  };

  const handleDirectSuperAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuperAdminError(null);

    if (superAdminLogin(superAdminPinInput)) {
      setSuperAdminError(null);
      setSuperAdminPinInput('');
      setAppRoute('superadmin');
    } else {
      setSuperAdminError('Chave mestre de Super Admin incorreta.');
    }
  };

  const supportLink = getWhatsAppSupportLink(
    supportWhatsapp,
    currentStore?.name || 'Minha Loja',
    currentStoreId,
    'blocked_password'
  );

  return (
    <>
      {/* Real-time Order Notification Banner - Visível APENAS para o Lojista ou Super Admin */}
      {(appRoute === 'merchant' || appRoute === 'superadmin') && (
        <OrderNotificationBanner />
      )}

      {/* ROTA 3: SUPER ADMIN PLATAFORMA (Master Governance - 100% Exclusivo) */}
      {appRoute === 'superadmin' && (
        isSuperAdminAuthenticated ? (
          <SuperAdminDashboard />
        ) : (
          <div className="min-h-screen bg-[#121212] text-[#F8F5F2] flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-[#161616] border border-[#D8A47F]/40 rounded-3xl p-7 sm:p-8 shadow-2xl space-y-6">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-[#1F1F1F] border border-[#D8A47F]/40 flex items-center justify-center mx-auto text-[#D8A47F]">
                  <Shield className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#D8A47F] bg-[#1F1F1F] border border-[#D8A47F]/30 px-2.5 py-0.5 rounded-full">
                    Acesso Exclusivo • Super Admin
                  </span>
                  <h2 className="text-2xl font-bold font-['Playfair_Display',serif] text-[#F8F5F2]">
                    Intima Lab Master
                  </h2>
                  <p className="text-xs text-[#A0A0A0]">
                    Controle geral da plataforma, lojistas cadastrados e governança de segurança.
                  </p>
                </div>
              </div>

              {/* Form de Acesso Direto Super Admin */}
              <form onSubmit={handleDirectSuperAdminSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#E0E0E0] mb-1.5">
                    Chave Mestre Super Admin
                  </label>
                  <PasswordInput
                    value={superAdminPinInput}
                    onChange={(e) => {
                      setSuperAdminPinInput(e.target.value);
                      setSuperAdminError(null);
                    }}
                    placeholder="Digite a chave master do Intima Lab"
                    theme="dark"
                    autoFocus
                    autoComplete="current-password"
                    leftIcon={<Lock className="w-4 h-4 text-[#D8A47F]" />}
                  />
                  {superAdminError && (
                    <p className="text-red-400 text-xs text-center mt-2 flex items-center justify-center gap-1.5 bg-red-950/30 p-2 rounded-xl border border-red-500/20">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                      <span>{superAdminError}</span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#D8A47F] hover:bg-[#C8946F] text-[#121212] font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer active:scale-98"
                >
                  <Lock className="w-4 h-4" />
                  <span>Acessar Central Master</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => setAppRoute('store')}
                  className="text-xs text-[#A0A0A0] hover:text-[#F8F5F2] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Ir para Catálogo da Loja</span>
                </button>
              </div>
            </div>
          </div>
        )
      )}

      {/* ROTA 2: ÁREA ADMINISTRATIVA DO LOJISTA (Store-Scoped Merchant - 100% Exclusivo da Loja) */}
      {appRoute === 'merchant' && (
        isMerchantAuthenticated ? (
          <AdminLayout />
        ) : (
          <div className="min-h-screen bg-[#121212] text-[#F8F5F2] flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-[#161616] border border-[#2A2A2A] rounded-3xl p-7 sm:p-8 shadow-xl space-y-6">
              <div className="text-center space-y-3">
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
                    {isCurrentStoreBlocked ? 'Segurança • Acesso Bloqueado' : 'Acesso da Boutique'}
                  </span>
                  <h2 className="text-2xl font-bold font-['Playfair_Display',serif] text-[#F8F5F2]">
                    {currentStore?.name || 'Boutique'}
                  </h2>
                  <p className="text-xs text-[#A0A0A0]">
                    {isCurrentStoreBlocked
                      ? 'O acesso desta loja foi bloqueado por tentativas consecutivas incorretas.'
                      : `Área restrita à equipe de ${currentStore?.name || 'sua loja'} para gestão de peças, pedidos e estoque.`}
                  </p>
                </div>
              </div>

              {isCurrentStoreBlocked ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 text-left text-xs text-red-200 space-y-1.5">
                    <p className="font-semibold text-red-100 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      Limite de 4 tentativas atingido
                    </p>
                    <p className="text-[11px] text-red-300/80 leading-relaxed">
                      Por segurança, seu acesso foi suspenso. Fale diretamente com o suporte e proprietário do Intima Lab via WhatsApp para solicitar o desbloqueio.
                    </p>
                  </div>

                  <a
                    href={supportLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Falar com o Suporte no WhatsApp (Desbloquear)</span>
                  </a>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setAppRoute('store')}
                      className="text-xs text-[#A0A0A0] hover:text-[#F8F5F2] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Voltar para o Catálogo da Loja</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Formulário direto de login da loja - Sem modal e sem seletor */
                <form onSubmit={handleDirectMerchantSubmit} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-[#E0E0E0]">
                        Senha / PIN de {currentStore?.name}
                      </label>
                      {remainingMerchantAttempts < MAX_LOGIN_ATTEMPTS && (
                        <span className="text-[11px] text-amber-400 font-semibold">
                          {remainingMerchantAttempts} tentativa(s) restante(s)
                        </span>
                      )}
                    </div>

                    <PasswordInput
                      value={merchantPinInput}
                      onChange={(e) => {
                        setMerchantPinInput(e.target.value);
                        setMerchantError(null);
                      }}
                      placeholder="Digite a senha de acesso da sua loja"
                      theme="dark"
                      autoFocus
                      autoComplete="current-password"
                      leftIcon={<Lock className="w-4 h-4 text-[#D8A47F]" />}
                    />

                    {merchantError && (
                      <p className="text-red-400 text-xs text-center mt-2 flex items-center justify-center gap-1.5 bg-red-950/30 p-2 rounded-xl border border-red-500/20">
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                        <span>{merchantError}</span>
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#9B4B5A] hover:bg-[#843A48] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-98"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Entrar no Painel da Loja</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setAppRoute('store')}
                      className="text-xs text-[#A0A0A0] hover:text-[#F8F5F2] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Voltar para o Catálogo do Cliente</span>
                    </button>
                  </div>
                </form>
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
