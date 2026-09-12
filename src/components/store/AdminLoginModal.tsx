import React, { useState, useEffect } from 'react';
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
  lockToCurrentStore?: boolean;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialType = 'merchant',
  lockToCurrentStore = true,
}) => {
  const {
    merchantLogin,
    superAdminLogin,
    allStores,
    currentStoreId,
    currentStore,
    setAppRoute,
    isStoreBlocked,
    getRemainingAttempts,
    supportWhatsapp,
  } = useStore();

  const [loginType, setLoginType] = useState<'merchant' | 'superadmin'>(initialType);
  const [pin, setPin] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sincronizar loginType se initialType mudar
  useEffect(() => {
    setLoginType(initialType);
    setPin('');
    setErrorMessage(null);
  }, [initialType]);

  if (!isOpen) return null;

  const targetStore = allStores.find((s) => s.id === currentStoreId) || currentStore || allStores[0];
  const isBlocked = loginType === 'merchant' && isStoreBlocked(targetStore.id);
  const remainingAttempts = loginType === 'merchant' ? getRemainingAttempts(targetStore.id) : MAX_LOGIN_ATTEMPTS;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (loginType === 'merchant') {
      if (isBlocked) return;

      const result = merchantLogin(pin, targetStore.id);
      if (result.success) {
        setErrorMessage(null);
        setPin('');
        setAppRoute('merchant');
        onSuccess();
        onClose();
      } else {
        if (result.blocked) {
          setErrorMessage('Limite de 4 tentativas excedido! O acesso desta loja foi bloqueado por segurança.');
        } else {
          setErrorMessage(
            `Senha incorreta! Você tem mais ${result.remaining} tentativa(s) antes do bloqueio da sua loja.`
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
        setErrorMessage('Chave mestre de Super Admin incorreta.');
      }
    }
  };

  const supportLink = getWhatsAppSupportLink(
    supportWhatsapp,
    targetStore?.name || 'Minha Loja',
    targetStore?.id || currentStoreId,
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

        {/* NUNCA exibir abas nem alternância de perfis: cada link é 100% isolado */}
        <div className="text-center space-y-1.5 pt-2">
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
              <StoreIcon className="w-6 h-6" />
            ) : (
              <ShieldCheck className="w-6 h-6" />
            )}
          </div>
          
          <h3 className="font-['Playfair_Display',serif] text-xl font-bold text-[#F8F5F2]">
            {isBlocked
              ? 'Acesso Bloqueado por Segurança'
              : loginType === 'merchant'
              ? (targetStore?.name || 'Painel da Boutique')
              : 'Painel Master Intima Lab'}
          </h3>
          <p className="text-xs text-[#A0A0A0]">
            {isBlocked
              ? `Limite de tentativas atingido na boutique ${targetStore?.name}.`
              : loginType === 'merchant'
              ? `Acesso administrativo restrito à equipe da loja ${targetStore?.name}.`
              : 'Acesso restrito ao proprietário da plataforma Intima Lab.'}
          </p>
        </div>

        {/* Identificação FIXA da Loja (Sem nenhum dropdown ou lista de outras lojas) */}
        {loginType === 'merchant' && (
          <div className="p-3 bg-[#1B1B1B] border border-[#2B2B2B] rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#9B4B5A]/20 border border-[#9B4B5A]/30 flex items-center justify-center text-[#D8A47F] shrink-0">
              <StoreIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#A0A0A0] block">
                Boutique Conectada
              </span>
              <p className="text-xs font-bold text-[#F8F5F2] truncate">
                {targetStore?.name || 'Loja Parceira'}
              </p>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
              Link Exclusivo
            </span>
          </div>
        )}

        {/* CENÁRIO DE BLOQUEIO POR TENTATIVAS */}
        {isBlocked ? (
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 space-y-4 text-center">
            <div className="space-y-1">
              <p className="text-xs text-red-200 font-medium">
                Por medidas de proteção contra invasões, o acesso da loja{' '}
                <strong className="text-white font-bold">{targetStore?.name}</strong> foi bloqueado temporariamente após 4 tentativas incorretas.
              </p>
              <p className="text-[11px] text-red-300/80">
                Fale diretamente com o Suporte Oficial no WhatsApp para realizar a liberação:
              </p>
            </div>

            <a
              href={supportLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Solicitar Desbloqueio no WhatsApp</span>
            </a>
          </div>
        ) : (
          /* FORMULÁRIO DE LOGIN NORMAL */
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <span>{loginType === 'merchant' ? 'Entrar no Painel da Loja' : 'Acessar Painel Master'}</span>
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

