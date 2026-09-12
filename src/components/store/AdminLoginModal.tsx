import React, { useState } from 'react';
import { useStore, SUPER_ADMIN_PIN, MAX_LOGIN_ATTEMPTS } from '../../context/StoreContext';
import {
  Lock,
  X,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  Store as StoreIcon,
  Shield,
  MessageCircle,
  AlertTriangle,
} from 'lucide-react';
import { PasswordInput } from '../common/PasswordInput';
import { getWhatsAppSupportLink } from '../../utils/storeRouting';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialType?: 'merchant' | 'superadmin';
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialType = 'merchant',
}) => {
  const {
    merchantLogin,
    superAdminLogin,
    allStores,
    currentStoreId,
    selectStore,
    setAppRoute,
    isStoreBlocked,
    getRemainingAttempts,
    supportWhatsapp,
  } = useStore();

  const [loginType, setLoginType] = useState<'merchant' | 'superadmin'>(initialType);
  const [selectedStoreId, setSelectedStoreId] = useState<string>(currentStoreId);
  const [pin, setPin] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const targetStore = allStores.find((s) => s.id === selectedStoreId) || allStores[0];
  const isBlocked = loginType === 'merchant' && isStoreBlocked(selectedStoreId);
  const remainingAttempts = loginType === 'merchant' ? getRemainingAttempts(selectedStoreId) : MAX_LOGIN_ATTEMPTS;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (loginType === 'merchant') {
      if (isBlocked) return;

      const result = merchantLogin(pin, selectedStoreId);
      if (result.success) {
        setErrorMessage(null);
        setPin('');
        setAppRoute('merchant');
        onSuccess();
        onClose();
      } else {
        if (result.blocked) {
          setErrorMessage('Limite de tentativas excedido! Sua loja foi bloqueada por segurança.');
        } else {
          setErrorMessage(
            `Senha incorreta! Você tem mais ${result.remaining} tentativa(s) antes do bloqueio de segurança.`
          );
        }
      }
    } else {
      if (superAdminLogin(pin)) {
        setErrorMessage(null);
        setPin('');
        setAppRoute('superadmin');
        onSuccess();
        onClose();
      } else {
        setErrorMessage('Senha mestre de Super Admin incorreta.');
      }
    }
  };

  const supportLink = getWhatsAppSupportLink(
    supportWhatsapp,
    targetStore?.name || 'Minha Loja',
    targetStore?.id || selectedStoreId,
    'blocked_password'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-[#161616] text-[#F8F5F2] w-full max-w-md rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#2A2A2A] space-y-5 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-[#A0A0A0] hover:text-[#F8F5F2] rounded-full hover:bg-[#2A2A2A] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab switch between Lojista and Super Admin */}
        <div className="flex rounded-xl bg-[#1F1F1F] border border-[#2A2A2A] p-1 gap-1">
          <button
            type="button"
            onClick={() => {
              setLoginType('merchant');
              setErrorMessage(null);
              setPin('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              loginType === 'merchant'
                ? 'bg-[#9B4B5A] text-white shadow-xs'
                : 'text-[#A0A0A0] hover:text-[#F8F5F2]'
            }`}
          >
            <StoreIcon className="w-3.5 h-3.5" />
            <span>Área do Lojista</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginType('superadmin');
              setErrorMessage(null);
              setPin('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              loginType === 'superadmin'
                ? 'bg-[#D8A47F] text-[#121212] font-black shadow-xs'
                : 'text-[#A0A0A0] hover:text-[#F8F5F2]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Super Admin</span>
          </button>
        </div>

        <div className="text-center space-y-1.5">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto border ${
              isBlocked
                ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse'
                : loginType === 'merchant'
                ? 'bg-[#9B4B5A]/20 text-[#D8A47F] border-[#9B4B5A]/30'
                : 'bg-[#D8A47F]/20 text-[#D8A47F] border-[#D8A47F]/40'
            }`}
          >
            {isBlocked ? (
              <AlertTriangle className="w-6 h-6 text-red-400" />
            ) : loginType === 'merchant' ? (
              <Lock className="w-6 h-6" />
            ) : (
              <ShieldCheck className="w-6 h-6" />
            )}
          </div>
          <h3 className="font-['Playfair_Display',serif] text-xl font-bold text-[#F8F5F2]">
            {isBlocked
              ? 'Acesso Bloqueado por Segurança'
              : loginType === 'merchant'
              ? 'Acesso da Boutique'
              : 'Painel Master Intima Lab'}
          </h3>
          <p className="text-xs text-[#A0A0A0]">
            {isBlocked
              ? 'Limite de tentativas incorretas atingido nesta loja.'
              : loginType === 'merchant'
              ? `Acesso administrativo restrito à boutique parceira.`
              : 'Controle central do ecossistema e gerenciamento de boutiques.'}
          </p>
        </div>

        {/* CENÁRIO DE BLOQUEIO POR TENTATIVAS */}
        {isBlocked ? (
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 space-y-4 text-center">
            <div className="space-y-1">
              <p className="text-xs text-red-200 font-medium">
                Por medidas de segurança, o login da loja{' '}
                <strong className="text-white font-bold">{targetStore?.name}</strong> foi bloqueado.
              </p>
              <p className="text-[11px] text-red-300/80">
                Para redefinir sua senha com segurança, fale diretamente com o suporte e proprietário do Intima Lab via WhatsApp:
              </p>
            </div>

            <a
              href={supportLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Falar com o Suporte no WhatsApp (Desbloquear)</span>
            </a>

            <p className="text-[10px] text-[#888888]">
              Você também pode selecionar outra loja acima ou aguardar o desbloqueio pelo Super Admin.
            </p>
          </div>
        ) : (
          /* FORMULÁRIO DE LOGIN NORMAL */
          <form onSubmit={handleSubmit} className="space-y-4">
            {loginType === 'merchant' && (
              <div>
                <label className="block text-xs font-semibold text-[#E0E0E0] mb-1">
                  Selecione a Loja
                </label>
                <select
                  value={selectedStoreId}
                  onChange={(e) => {
                    setSelectedStoreId(e.target.value);
                    setErrorMessage(null);
                    setPin('');
                  }}
                  className="w-full py-2.5 px-3 bg-[#141414] border border-[#2A2A2A] rounded-xl text-xs text-[#F8F5F2] focus:outline-none focus:border-[#D8A47F]"
                >
                  {allStores.map((store) => (
                    <option key={store.id} value={store.id} className="bg-[#1F1F1F] text-[#F8F5F2]">
                      {store.name} ({store.ownerName})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#E0E0E0]">
                  {loginType === 'merchant' ? 'Senha / PIN da Loja' : 'Chave Master Super Admin'}
                </label>
                {loginType === 'merchant' && remainingAttempts < MAX_LOGIN_ATTEMPTS && (
                  <span className="text-[11px] text-amber-400 font-semibold">
                    {remainingAttempts} tentativa(s) restante(s)
                  </span>
                )}
              </div>

              {/* Password Input with Show/Hide toggle */}
              <PasswordInput
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder={loginType === 'merchant' ? 'Digite a senha da sua loja' : 'Digite a chave master'}
                theme="dark"
                autoFocus
                autoComplete="current-password"
                leftIcon={<Lock className="w-4 h-4 text-[#D8A47F]" />}
              />

              {errorMessage && (
                <p className="text-red-400 text-xs text-center mt-2 flex items-center justify-center gap-1.5 bg-red-950/30 p-2 rounded-xl border border-red-500/20">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMessage}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-98 ${
                loginType === 'merchant'
                  ? 'bg-[#9B4B5A] hover:bg-[#843A48] text-white'
                  : 'bg-[#D8A47F] hover:bg-[#C8946F] text-[#121212]'
              }`}
            >
              <span>{loginType === 'merchant' ? 'Entrar no Painel da Loja' : 'Acessar Central Intima Lab'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="p-3 rounded-xl bg-[#141414] border border-[#222222] text-[11px] text-[#888888] text-center">
          <p>
            Plataforma <strong>Intima Lab</strong> • Ambiente Seguro em Produção
          </p>
        </div>
      </div>
    </div>
  );
};

