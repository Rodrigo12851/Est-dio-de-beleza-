import React, { useState } from 'react';
import { useSalon } from '../../context/SalonContext';
import { Lock, X, KeyRound, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { loginAdmin, config } = useSalon();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginAdmin(pin.trim());
    if (success) {
      onClose();
      setPin('');
      setError(false);
    } else {
      setError(true);
    }
  };

  const handleQuickDemo = () => {
    loginAdmin(config.adminPin);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-[#EAE4DD] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-[#231F1C] text-[#FDFBF9] flex items-center justify-between border-b border-[#3D3631]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#8E5D52] flex items-center justify-center">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Acesso Administrativo</h3>
              <p className="text-[11px] text-[#A8A099]">Painel de Gestão e Agenda</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#A8A099] hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-center space-y-1">
            <p className="text-xs text-[#7D756D]">
              Digite o PIN de segurança para gerenciar agendamentos, procedimentos e finanças do <strong>{config.name}</strong>.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-[#FDEAE8] border border-[#F7C5C0] rounded-2xl flex items-center gap-2 text-[#C93B2B] text-xs font-semibold">
              <AlertCircle className="w-4 h-4 text-[#C93B2B] shrink-0" />
              <span>PIN incorreto. Tente novamente ou use o PIN padrão ({config.adminPin}).</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#2D2926] uppercase tracking-wider mb-1.5 text-center">
              PIN de 4 dígitos
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#A8A099] absolute left-3.5 top-3.5" />
              <input
                id="admin-pin-input"
                type="password"
                maxLength={6}
                autoFocus
                placeholder="••••"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  if (error) setError(false);
                }}
                className="w-full pl-10 pr-4 py-3 bg-[#FDFBF9] border border-[#EAE4DD] rounded-2xl text-center text-lg font-mono tracking-widest text-[#2D2926] focus:bg-white focus:border-[#8E5D52] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            id="admin-submit-pin-btn"
            className="w-full py-3.5 bg-[#8E5D52] hover:bg-[#784D43] active:scale-98 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-xs transition-all cursor-pointer"
          >
            Acessar Painel
          </button>

          {/* Quick Demo Access Helper */}
          <div className="pt-2 text-center border-t border-[#F0EAE4]">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="text-[11px] text-[#7D756D] hover:text-[#8E5D52] font-medium transition-colors cursor-pointer flex items-center justify-center gap-1 mx-auto"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#2F7D48]" />
              <span>Entrar com PIN padrão ({config.adminPin})</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
