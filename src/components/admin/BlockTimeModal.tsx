import React, { useState } from 'react';
import { useSalon } from '../../context/SalonContext';
import { formatDateBR, getTodayDateStr } from '../../utils/dateUtils';
import { X, Lock, Trash2, Plus, Calendar, Clock, AlertCircle, Sparkles } from 'lucide-react';

interface BlockTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
}

export const BlockTimeModal: React.FC<BlockTimeModalProps> = ({
  isOpen,
  onClose,
  defaultDate,
}) => {
  const { blockedSlots, addBlockedSlot, deleteBlockedSlot } = useSalon();

  const [date, setDate] = useState(defaultDate || getTodayDateStr());
  const [startTime, setStartTime] = useState('13:00');
  const [endTime, setEndTime] = useState('15:00');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAddBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !startTime || !endTime) {
      setError('Data, horário inicial e final são obrigatórios.');
      return;
    }
    if (startTime >= endTime) {
      setError('O horário final deve ser maior que o horário inicial.');
      return;
    }

    addBlockedSlot({
      date,
      startTime,
      endTime,
      reason: reason.trim() || 'Compromisso Pessoal / Indisponível',
    });

    setReason('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#EAE4DD] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EAE4DD] flex items-center justify-between bg-[#FDFBF9]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#2D2926] text-white flex items-center justify-center shadow-xs">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-['Playfair_Display',serif] font-bold text-lg text-[#2D2926]">
                Bloqueio de Horários
              </h3>
              <p className="text-xs text-[#7D756D]">
                Impeça novos agendamentos em períodos específicos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#A8A099] hover:text-[#2D2926] rounded-xl hover:bg-[#F5F2ED] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {error && (
            <div className="p-3.5 bg-[#FDEAE8] border border-[#F7C5C0] rounded-2xl flex items-center gap-2 text-[#C93B2B] text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-[#C93B2B] shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* New Block Form */}
          <form onSubmit={handleAddBlock} className="bg-[#FDFBF9] rounded-3xl p-5 border border-[#EAE4DD] space-y-3.5">
            <h4 className="font-bold text-[#2D2926] text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-[#8E5D52]" />
              Adicionar Novo Bloqueio
            </h4>

            <div>
              <label className="block text-[11px] font-bold text-[#2D2926] mb-1">Data</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-[#EAE4DD] rounded-xl text-xs text-[#2D2926] focus:outline-none focus:border-[#8E5D52]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-[#2D2926] mb-1">Início</label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-[#EAE4DD] rounded-xl text-xs text-[#2D2926] focus:outline-none focus:border-[#8E5D52]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#2D2926] mb-1">Término</label>
                <input
                  type="time"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-[#EAE4DD] rounded-xl text-xs text-[#2D2926] focus:outline-none focus:border-[#8E5D52]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#2D2926] mb-1">Motivo (Opcional)</label>
              <input
                type="text"
                placeholder="Ex: Curso de aperfeiçoamento, Consulta médica..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-[#EAE4DD] rounded-xl text-xs text-[#2D2926] placeholder-[#A8A099] focus:outline-none focus:border-[#8E5D52]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#8E5D52] hover:bg-[#784D43] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Confirmar Bloqueio
            </button>
          </form>

          {/* List of current blocks */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-[#2D2926] text-xs uppercase tracking-wider">
              Bloqueios Cadastrados ({blockedSlots.length})
            </h4>

            {blockedSlots.length === 0 ? (
              <p className="text-xs text-[#A8A099] py-3 text-center">Nenhum horário bloqueado manualmente.</p>
            ) : (
              <div className="space-y-2">
                {blockedSlots.map((block) => (
                  <div
                    key={block.id}
                    className="p-3.5 bg-[#FDFBF9] border border-[#EAE4DD] rounded-2xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-[#2D2926] flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-[#8E5D52]" />
                        <span>{formatDateBR(block.date)}</span>
                        <span className="text-[#7D756D] font-normal">
                          das {block.startTime} às {block.endTime}
                        </span>
                      </div>
                      <p className="text-[#7D756D] text-[11px] mt-0.5">{block.reason}</p>
                    </div>

                    <button
                      onClick={() => deleteBlockedSlot(block.id)}
                      className="p-2 text-[#C93B2B] hover:text-[#9E2B1E] hover:bg-[#FDEAE8] rounded-xl transition-colors cursor-pointer"
                      title="Remover bloqueio"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
