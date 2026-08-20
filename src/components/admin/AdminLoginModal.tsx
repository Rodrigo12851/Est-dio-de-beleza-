import React, { useState } from 'react';
import { useSalon } from '../../context/SalonContext';
import { Shield, KeyRound, X, AlertCircle, Sparkles } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose }) => {
  const { loginAdmin, setViewMode, config } = useSalon();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginAdmin(pin.trim());
    if (success) {
      setViewMode('admin');
      onClose();
    } else {
      setError('PIN incorreto. O PIN padrão é 1234.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-rose-100 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <h3 className="font-['Playfair_Display',serif] text-xl font-bold text-stone-900">
            Painel da Profissional
          </h3>
          <p className="text-xs text-stone-500 mt-1">
            Digite seu PIN de segurança para acessar o controle da agenda e financeiro.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-800 text-xs">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
              PIN de Acesso
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                id="admin-pin-input"
                type="password"
                maxLength={6}
                autoFocus
                placeholder="Ex: 1234"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError('');
                }}
                className="w-full pl-10 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-center text-lg tracking-widest font-mono font-bold text-stone-900 focus:bg-white focus:border-rose-500 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-stone-400 mt-1.5 text-center">
              Dica: O PIN inicial de demonstração é <strong>1234</strong>
            </p>
          </div>

          <button
            id="admin-login-submit-btn"
            type="submit"
            className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
          >
            Acessar Painel
          </button>
        </form>
      </div>
    </div>
  );
};
