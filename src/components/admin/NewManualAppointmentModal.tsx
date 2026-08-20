import React, { useState, useEffect, useMemo } from 'react';
import { useSalon } from '../../context/SalonContext';
import { Procedure, AppointmentStatus, AppointmentProcedureItem } from '../../types';
import {
  formatCurrency,
  formatTimeFriendly,
  getTodayDateStr,
  timeToMinutes,
  minutesToTime,
} from '../../utils/dateUtils';
import { formatPhoneMask } from '../../utils/whatsappUtils';
import { X, Clock, User, Phone, CheckCircle2, AlertCircle, Check, Layers } from 'lucide-react';

interface NewManualAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
  initialTime?: string;
}

export const NewManualAppointmentModal: React.FC<NewManualAppointmentModalProps> = ({
  isOpen,
  onClose,
  initialDate,
  initialTime,
}) => {
  const { procedures, clients, createAppointment } = useSalon();

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [selectedProcedureIds, setSelectedProcedureIds] = useState<string[]>([]);
  const [date, setDate] = useState(initialDate || getTodayDateStr());
  const [time, setTime] = useState(initialTime || '10:00');
  const [customPrice, setCustomPrice] = useState<string>('');
  const [discount, setDiscount] = useState<string>('0');
  const [clientNotes, setClientNotes] = useState('');
  const [status, setStatus] = useState<AppointmentStatus>('confirmado');
  const [source, setSource] = useState<'whatsapp' | 'presencial'>('whatsapp');
  const [errorMessage, setErrorMessage] = useState('');

  // Active procedures list
  const activeProcedures = procedures.filter((p) => p.active);

  // Selected procedures objects
  const selectedProcedures = useMemo(() => {
    return procedures.filter((p) => selectedProcedureIds.includes(p.id));
  }, [procedures, selectedProcedureIds]);

  const defaultCombinedPrice = useMemo(() => {
    return selectedProcedures.reduce((acc, p) => acc + p.price, 0);
  }, [selectedProcedures]);

  const totalDurationMinutes = useMemo(() => {
    return selectedProcedures.reduce((acc, p) => acc + p.durationMinutes, 0);
  }, [selectedProcedures]);

  const proceduresTitle = useMemo(() => {
    if (selectedProcedures.length === 0) return '';
    return selectedProcedures.map((p) => p.name).join(' + ');
  }, [selectedProcedures]);

  useEffect(() => {
    if (isOpen) {
      if (initialDate) setDate(initialDate);
      if (initialTime) setTime(initialTime);
      if (procedures.length > 0 && selectedProcedureIds.length === 0) {
        setSelectedProcedureIds([procedures[0].id]);
        setCustomPrice(String(procedures[0].price));
      }
      setErrorMessage('');
    }
  }, [isOpen, initialDate, initialTime, procedures]);

  const handleToggleProcedure = (id: string) => {
    setSelectedProcedureIds((prev) => {
      let next: string[];
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // keep at least 1
        next = prev.filter((pId) => pId !== id);
      } else {
        next = [...prev, id];
      }
      const sum = procedures.filter((p) => next.includes(p.id)).reduce((acc, p) => acc + p.price, 0);
      setCustomPrice(String(sum));
      return next;
    });
  };

  // Quick auto-complete from existing clients
  const handleClientSelect = (cName: string) => {
    setClientName(cName);
    const existing = clients.find((c) => c.name.toLowerCase() === cName.toLowerCase());
    if (existing) {
      setClientPhone(existing.phone);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProcedures.length === 0) {
      setErrorMessage('Selecione ao menos um procedimento.');
      return;
    }
    if (!clientName.trim()) {
      setErrorMessage('Informe o nome da cliente.');
      return;
    }
    if (!date || !time) {
      setErrorMessage('Informe data e horário.');
      return;
    }

    const priceNum = parseFloat(customPrice) || defaultCombinedPrice;
    const discountNum = parseFloat(discount) || 0;
    const finalPriceNum = Math.max(0, priceNum - discountNum);

    const procedureItems: AppointmentProcedureItem[] = selectedProcedures.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      durationMinutes: p.durationMinutes,
      photo: p.photo,
    }));

    const res = createAppointment({
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim() || '(11) 99999-9999',
      clientNotes: clientNotes.trim(),
      procedureId: selectedProcedures[0].id,
      procedureName: proceduresTitle,
      procedureCategory: selectedProcedures[0].category,
      procedureIds: selectedProcedureIds,
      procedures: procedureItems,
      date,
      time,
      durationMinutes: totalDurationMinutes,
      price: priceNum,
      discount: discountNum,
      finalPrice: finalPriceNum,
      status,
      isPaid: false,
      source,
    });

    if (!res.success) {
      setErrorMessage(res.error || 'Horário indisponível devido a conflito de agenda.');
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#EAE4DD] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EAE4DD] flex items-center justify-between bg-[#FDFBF9]">
          <div>
            <h3 className="font-['Playfair_Display',serif] font-bold text-lg text-[#2D2926]">
              Novo Agendamento Manual
            </h3>
            <p className="text-xs text-[#8E5D52] font-semibold">
              Cadastre agendamentos recebidos pelo WhatsApp ou presencialmente
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#A8A099] hover:text-[#2D2926] rounded-xl hover:bg-[#F5F2ED] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4">
          {errorMessage && (
            <div className="p-3.5 bg-[#FDEAE8] border border-[#F7C5C0] rounded-2xl flex items-start gap-2 text-[#C93B2B] text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-[#C93B2B] shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Source Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#7D756D] uppercase">Origem:</span>
            <button
              type="button"
              onClick={() => setSource('whatsapp')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                source === 'whatsapp' ? 'bg-[#2F7D48] text-white shadow-xs' : 'bg-[#F5F2ED] text-[#59524C] hover:bg-[#EAE4DD]'
              }`}
            >
              💬 WhatsApp
            </button>
            <button
              type="button"
              onClick={() => setSource('presencial')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                source === 'presencial' ? 'bg-[#8E5D52] text-white shadow-xs' : 'bg-[#F5F2ED] text-[#59524C] hover:bg-[#EAE4DD]'
              }`}
            >
              🏢 Presencial / Balcão
            </button>
          </div>

          {/* Client Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2D2926] uppercase tracking-wider mb-1">
                Nome da Cliente *
              </label>
              <input
                id="manual-client-name"
                type="text"
                required
                list="existing-clients"
                placeholder="Ex: Maria Silva"
                value={clientName}
                onChange={(e) => handleClientSelect(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FDFBF9] border border-[#EAE4DD] rounded-xl text-sm text-[#2D2926] placeholder-[#A8A099] focus:bg-white focus:border-[#8E5D52] focus:outline-none"
              />
              <datalist id="existing-clients">
                {clients.map((c) => (
                  <option key={c.id} value={c.name} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D2926] uppercase tracking-wider mb-1">
                WhatsApp
              </label>
              <input
                id="manual-client-phone"
                type="tel"
                placeholder="(11) 99999-9999"
                value={clientPhone}
                onChange={(e) => setClientPhone(formatPhoneMask(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-[#FDFBF9] border border-[#EAE4DD] rounded-xl text-sm text-[#2D2926] placeholder-[#A8A099] focus:bg-white focus:border-[#8E5D52] focus:outline-none"
              />
            </div>
          </div>

          {/* Procedure Selection (Multi-select list) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-[#2D2926] uppercase tracking-wider">
                Procedimentos Selecionados *
              </label>
              <span className="text-[11px] text-[#8E5D52] font-semibold">
                {selectedProcedureIds.length} selecionado(s)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 bg-[#FDFBF9] border border-[#EAE4DD] rounded-2xl">
              {activeProcedures.map((proc) => {
                const isSelected = selectedProcedureIds.includes(proc.id);
                return (
                  <button
                    key={proc.id}
                    type="button"
                    onClick={() => handleToggleProcedure(proc.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? 'border-[#8E5D52] bg-white ring-1 ring-[#8E5D52] shadow-xs'
                        : 'border-[#EAE4DD] bg-white/60 hover:bg-white hover:border-[#8E5D52]/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-[#8E5D52] border-[#8E5D52] text-white' : 'border-[#A8A099]'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-[#2D2926] truncate">{proc.name}</p>
                        <p className="text-[10px] text-[#7D756D]">
                          {formatTimeFriendly(proc.durationMinutes)} • {formatCurrency(proc.price)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2D2926] uppercase tracking-wider mb-1">
                Data *
              </label>
              <input
                id="manual-date-input"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FDFBF9] border border-[#EAE4DD] rounded-xl text-sm text-[#2D2926] focus:bg-white focus:border-[#8E5D52] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D2926] uppercase tracking-wider mb-1">
                Horário de Início *
              </label>
              <input
                id="manual-time-input"
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FDFBF9] border border-[#EAE4DD] rounded-xl text-sm text-[#2D2926] focus:bg-white focus:border-[#8E5D52] focus:outline-none"
              />
            </div>
          </div>

          {/* Duration info notice */}
          {selectedProcedures.length > 0 && (
            <div className="p-3 bg-[#F5F2ED] rounded-2xl text-xs text-[#59524C] border border-[#EAE4DD] flex items-center justify-between">
              <span>⏱️ Duração Total: <strong className="text-[#2D2926]">{formatTimeFriendly(totalDurationMinutes)}</strong></span>
              <span>🔒 Bloqueará até <strong className="text-[#2D2926]">{time ? minutesToTime(timeToMinutes(time) + totalDurationMinutes) : '--:--'}</strong></span>
            </div>
          )}

          {/* Price & Discount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#2D2926] uppercase tracking-wider mb-1">
                Valor Total (R$)
              </label>
              <input
                type="number"
                step="0.5"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FDFBF9] border border-[#EAE4DD] rounded-xl text-sm text-[#2D2926] focus:bg-white focus:border-[#8E5D52] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D2926] uppercase tracking-wider mb-1">
                Desconto (R$)
              </label>
              <input
                type="number"
                step="0.5"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FDFBF9] border border-[#EAE4DD] rounded-xl text-sm text-[#2D2926] focus:bg-white focus:border-[#8E5D52] focus:outline-none"
              />
            </div>
          </div>

          {/* Initial Status */}
          <div>
            <label className="block text-xs font-bold text-[#2D2926] uppercase tracking-wider mb-1">
              Status Inicial
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStatus('confirmado')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  status === 'confirmado'
                    ? 'bg-[#2F7D48] text-white border-[#2F7D48] shadow-xs'
                    : 'bg-[#FDFBF9] text-[#59524C] border-[#EAE4DD] hover:bg-[#F5F2ED]'
                }`}
              >
                🟢 Confirmado
              </button>
              <button
                type="button"
                onClick={() => setStatus('pendente')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                  status === 'pendente'
                    ? 'bg-[#C98B2B] text-white border-[#C98B2B] shadow-xs'
                    : 'bg-[#FDFBF9] text-[#59524C] border-[#EAE4DD] hover:bg-[#F5F2ED]'
                }`}
              >
                🟡 Pendente
              </button>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-xs font-bold text-[#2D2926] uppercase tracking-wider mb-1">
              Observações
            </label>
            <input
              type="text"
              placeholder="Ex: Pediu para adiantar se vagar"
              value={clientNotes}
              onChange={(e) => setClientNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FDFBF9] border border-[#EAE4DD] rounded-xl text-sm text-[#2D2926] placeholder-[#A8A099] focus:bg-white focus:border-[#8E5D52] focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              id="manual-booking-submit-btn"
              type="submit"
              className="w-full py-3.5 bg-[#8E5D52] hover:bg-[#784D43] active:scale-98 text-white font-bold text-sm rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Salvar na Agenda</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
