import React, { useState } from 'react';
import { useStore, SUPER_ADMIN_PIN } from '../../context/StoreContext';
import { Lock, X, KeyRound, ShieldAlert, ArrowRight, ShieldCheck, Store as StoreIcon, Shield } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const {
    merchantLogin,
    superAdminLogin,
    allStores,
    currentStoreId,
    selectStore,
    currentStore,
    setAppRoute,
  } = useStore();

  const [loginType, setLoginType] = useState<'merchant' | 'superadmin'>('merchant');
  const [selectedStoreId, setSelectedStoreId] = useState<string>(currentStoreId);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginType === 'merchant') {
      if (merchantLogin(pin, selectedStoreId)) {
        setError(false);
        setPin('');
        setAppRoute('merchant');
        onSuccess();
        onClose();
      } else {
        setError(true);
      }
    } else {
      if (superAdminLogin(pin)) {
        setError(false);
        setPin('');
        setAppRoute('superadmin');
        onSuccess();
        onClose();
      } else {
        setError(true);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fadeIn">
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
              setError(false);
              setPin('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              loginType === 'merchant'
                ? 'bg-[#C75C5C] text-white shadow-xs'
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
              setError(false);
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
              loginType === 'merchant'
                ? 'bg-[#C75C5C]/20 text-[#C75C5C] border-[#C75C5C]/30'
                : 'bg-[#D8A47F]/20 text-[#D8A47F] border-[#D8A47F]/40'
            }`}
          >
            {loginType === 'merchant' ? <Lock className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          </div>
          <h3 className="font-['Playfair_Display',serif] text-xl font-bold text-[#F8F5F2]">
            {loginType === 'merchant' ? 'Acesso do Lojista' : 'Painel Super Administrador'}
          </h3>
          <p className="text-xs text-[#A0A0A0]">
            {loginType === 'merchant'
              ? `Acesso restrito para gerenciamento exclusivo da sua loja.`
              : 'Controle mestre da plataforma, gestão de lojistas e métricas globais.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {loginType === 'merchant' && (
            <div>
              <label className="block text-xs font-semibold text-[#E0E0E0] mb-1">
                Selecione a Loja
              </label>
              <select
                value={selectedStoreId}
                onChange={(e) => setSelectedStoreId(e.target.value)}
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
            <label className="block text-xs font-semibold text-[#E0E0E0] mb-1.5 text-center">
              {loginType === 'merchant' ? 'PIN de Acesso da Loja' : 'PIN Mestre do Super Admin'}
            </label>
            <div className="relative">
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(false);
                }}
                placeholder="••••"
                autoFocus
                className="w-full text-center tracking-widest text-2xl font-bold py-3 bg-[#141414] border border-[#2A2A2A] rounded-2xl text-[#F8F5F2] placeholder-[#555555] focus:outline-none focus:border-[#D8A47F]"
              />
              <KeyRound className="w-4 h-4 text-[#A0A0A0] absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
            {error && (
              <p className="text-red-400 text-xs text-center mt-2 flex items-center justify-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>
                  {loginType === 'merchant'
                    ? 'PIN incorreto para esta loja. Use 4321 ou 1234.'
                    : 'PIN de Super Admin incorreto. Use 9999.'}
                </span>
              </p>
            )}
          </div>

          <button
            type="submit"
            className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-98 ${
              loginType === 'merchant'
                ? 'bg-[#C75C5C] hover:bg-[#B34E4E] text-white'
                : 'bg-[#D8A47F] hover:bg-[#C8946F] text-[#121212]'
            }`}
          >
            <span>{loginType === 'merchant' ? 'Entrar na Minha Loja' : 'Acessar Gestão da Plataforma'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="p-2.5 rounded-xl bg-[#1F1F1F] border border-[#2A2A2A] text-[11px] text-[#A0A0A0] text-center space-y-0.5">
          <p>
            {loginType === 'merchant' ? (
              <>
                PIN de Lojista padrão: <span className="font-mono font-bold text-[#D8A47F]">4321</span> (ou 1234)
              </>
            ) : (
              <>
                PIN Mestre Super Admin: <span className="font-mono font-bold text-[#D8A47F]">9999</span>
              </>
            )}
          </p>
          <p className="text-[10px] text-[#777777]">
            {loginType === 'merchant'
              ? 'Lojistas só enxergam e alteram pedidos e produtos da própria loja'
              : 'Super admin gerencia todos os lojistas, permissões e status'}
          </p>
        </div>
      </div>
    </div>
  );
};
