import React, { useState, useMemo, useEffect } from 'react';
import { useSalon } from '../../context/SalonContext';
import { Procedure, ProcedureCategory, Appointment, AppointmentProcedureItem } from '../../types';
import {
  formatCurrency,
  formatPriceOrConsult,
  formatTimeFriendly,
  formatDateBR,
  getRelativeDayLabel,
  addMinutesToTime,
} from '../../utils/dateUtils';
import { formatPhoneMask, cleanPhone, buildClientConfirmationShareUrl } from '../../utils/whatsappUtils';
import { getSafeImageUrl, DEFAULT_PROCEDURE_PHOTO } from '../../utils/imageUtils';
import {
  X,
  ChevronLeft,
  Clock,
  User,
  Phone,
  FileText,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Plus,
  Check,
  Sparkles,
  Layers,
  Calendar as CalendarIcon,
} from 'lucide-react';

interface BookingFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedProcedure?: Procedure | null;
}

type Step = 1 | 2 | 3 | 4 | 5 | 6; // 6 = Success

export const BookingFlowModal: React.FC<BookingFlowModalProps> = ({
  isOpen,
  onClose,
  preselectedProcedure,
}) => {
  const {
    procedures,
    config,
    getAvailableSlotsForDate,
    isDateAvailable,
    createAppointment,
  } = useSalon();

  const [step, setStep] = useState<Step>(1);
  const [selectedCategory, setSelectedCategory] = useState<ProcedureCategory | 'Todos'>('Todos');
  const [selectedProcedures, setSelectedProcedures] = useState<Procedure[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientNotes, setClientNotes] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  // Initialize with preselected procedure if provided
  useEffect(() => {
    if (isOpen) {
      if (preselectedProcedure) {
        setSelectedProcedures([preselectedProcedure]);
        setStep(1); // Allow user to see selection or add more procedures, or proceed directly
      } else {
        setSelectedProcedures([]);
        setStep(1);
      }
      setSelectedDate('');
      setSelectedTime('');
      setErrorMessage('');
      setConfirmedAppointment(null);
    }
  }, [isOpen, preselectedProcedure]);

  // Derived calculations for multiple procedures
  const totalDurationMinutes = useMemo(() => {
    return selectedProcedures.reduce((acc, p) => acc + (p.durationMinutes || 0), 0);
  }, [selectedProcedures]);

  const totalPrice = useMemo(() => {
    return selectedProcedures.reduce((acc, p) => acc + (p.price || 0), 0);
  }, [selectedProcedures]);

  const proceduresTitle = useMemo(() => {
    if (selectedProcedures.length === 0) return '';
    return selectedProcedures.map((p) => p.name).join(' + ');
  }, [selectedProcedures]);

  // Toggle procedure selection
  const handleToggleProcedure = (proc: Procedure) => {
    setErrorMessage('');
    setSelectedProcedures((prev) => {
      const exists = prev.some((p) => p.id === proc.id);
      if (exists) {
        return prev.filter((p) => p.id !== proc.id);
      } else {
        return [...prev, proc];
      }
    });
  };

  // Generate next 21 calendar days for selection
  const upcomingDays = useMemo(() => {
    const days: { dateStr: string; dayNum: number; weekDay: string; available: boolean; label: string }[] = [];
    const base = new Date();
    const weekDaysShort = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    for (let i = 0; i < 21; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const dayNum = d.getDate();
      const weekDay = weekDaysShort[d.getDay()];
      const available = isDateAvailable(dateStr);
      const label = getRelativeDayLabel(dateStr);

      days.push({ dateStr, dayNum, weekDay, available, label });
    }
    return days;
  }, [isDateAvailable]);

  // Compute available time slots considering total combined duration
  const availableSlots = useMemo(() => {
    if (!selectedDate || totalDurationMinutes <= 0) return [];
    return getAvailableSlotsForDate(selectedDate, totalDurationMinutes);
  }, [selectedDate, totalDurationMinutes, getAvailableSlotsForDate]);

  // Group slots into Morning (before 12h), Afternoon (12h-17h), Evening (17h+)
  const groupedSlots = useMemo(() => {
    const morning: string[] = [];
    const afternoon: string[] = [];
    const evening: string[] = [];

    availableSlots.forEach((slot) => {
      const hour = parseInt(slot.split(':')[0], 10);
      if (hour < 12) morning.push(slot);
      else if (hour < 17) afternoon.push(slot);
      else evening.push(slot);
    });

    return { morning, afternoon, evening };
  }, [availableSlots]);

  if (!isOpen) return null;

  const handleProceedToDate = () => {
    if (selectedProcedures.length === 0) {
      setErrorMessage('Por favor, selecione ao menos um procedimento.');
      return;
    }
    setErrorMessage('');
    setStep(2);
  };

  const handleSelectDate = (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedTime('');
    setErrorMessage('');
    setStep(3);
  };

  const handleSelectTime = (timeStr: string) => {
    setSelectedTime(timeStr);
    setErrorMessage('');
    setStep(4);
  };

  const handleGoToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      setErrorMessage('Por favor, informe seu nome.');
      return;
    }
    const digits = cleanPhone(clientPhone);
    if (digits.length < 10) {
      setErrorMessage('Por favor, informe um número de WhatsApp válido.');
      return;
    }
    setErrorMessage('');
    setStep(5);
  };

  const handleConfirmBooking = () => {
    if (selectedProcedures.length === 0 || !selectedDate || !selectedTime) return;

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
      clientPhone: clientPhone.trim(),
      clientNotes: clientNotes.trim(),
      procedureId: selectedProcedures[0].id,
      procedureName: proceduresTitle,
      procedureCategory: selectedProcedures[0].category,
      procedureIds: selectedProcedures.map((p) => p.id),
      procedures: procedureItems,
      date: selectedDate,
      time: selectedTime,
      durationMinutes: totalDurationMinutes,
      price: totalPrice,
      discount: 0,
      status: 'pendente',
      isPaid: false,
      source: 'online',
    });

    if (!res.success) {
      setErrorMessage(res.error || 'Não foi possível confirmar o agendamento.');
      return;
    }

    setConfirmedAppointment(res.appointment || null);
    setStep(6);
  };

  const activeProcedures = procedures.filter((p) => p.active);
  const filteredProcedures =
    selectedCategory === 'Todos'
      ? activeProcedures
      : activeProcedures.filter((p) => p.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#EAE4DD] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#EAE4DD] flex items-center justify-between bg-[#FDFBF9]">
          <div className="flex items-center gap-2">
            {step > 1 && step < 6 && (
              <button
                id="booking-back-btn"
                onClick={() => setStep((prev) => (prev - 1) as Step)}
                className="p-1.5 -ml-1 text-[#7D756D] hover:text-[#2D2926] rounded-xl hover:bg-[#F5F2ED] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h2 className="font-['Playfair_Display',serif] font-bold text-lg text-[#2D2926] leading-tight">
                {step === 1 && '1. Escolha os Procedimentos'}
                {step === 2 && '2. Escolha a Data'}
                {step === 3 && '3. Escolha o Horário'}
                {step === 4 && '4. Seus Dados'}
                {step === 5 && '5. Confirmar Agendamento'}
                {step === 6 && 'Agendamento Realizado! 💕'}
              </h2>
              {step < 6 && (
                <p className="text-xs text-[#8E5D52] font-semibold">
                  Etapa {step} de 5
                </p>
              )}
            </div>
          </div>

          <button
            id="booking-close-btn"
            onClick={onClose}
            className="p-1.5 text-[#A8A099] hover:text-[#2D2926] rounded-xl hover:bg-[#F5F2ED] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {errorMessage && (
            <div className="p-3.5 bg-[#FDEAE8] border border-[#F7C5C0] rounded-2xl flex items-start gap-2 text-[#C93B2B] text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-[#C93B2B] shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: Select One or Multiple Procedures */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="p-3.5 bg-[#F9F5F2] rounded-2xl border border-[#EAE4DD] text-xs text-[#59524C] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#8E5D52] shrink-0" />
                  <span>Você pode selecionar <strong>um ou mais serviços</strong> para o mesmo atendimento.</span>
                </div>
              </div>

              {/* Category pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {(['Todos', 'Cabelo', 'Maquiagem', 'Unhas', 'Sobrancelhas'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#8E5D52] text-white shadow-xs'
                        : 'bg-[#F5F2ED] text-[#7D756D] hover:bg-[#EAE4DD]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Procedure multi-select list */}
              <div className="space-y-2.5">
                {filteredProcedures.map((proc) => {
                  const isSelected = selectedProcedures.some((p) => p.id === proc.id);
                  return (
                    <div
                      key={proc.id}
                      id={`select-proc-${proc.id}`}
                      onClick={() => handleToggleProcedure(proc)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 hover:border-[#8E5D52] ${
                        isSelected
                          ? 'border-[#8E5D52] bg-[#FDFBF9] ring-2 ring-[#8E5D52]/20 shadow-xs'
                          : 'border-[#EAE4DD] bg-white hover:bg-[#FDFBF9]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Checkbox indicator */}
                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                            isSelected
                              ? 'bg-[#8E5D52] border-[#8E5D52] text-white'
                              : 'border-[#A8A099] bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        <img
                          src={getSafeImageUrl(proc.photo, DEFAULT_PROCEDURE_PHOTO)}
                          alt={proc.name}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[#EAE4DD]"
                        />

                        <div className="min-w-0">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E5D52]">
                            {proc.category}
                          </span>
                          <h4 className="font-bold text-[#2D2926] text-sm truncate">
                            {proc.name}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-[#7D756D] mt-0.5">
                            <span className="flex items-center gap-0.5">
                              <Clock className="w-3 h-3" />
                              {formatTimeFriendly(proc.durationMinutes)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`text-sm block ${proc.price && proc.price > 0 ? 'font-extrabold text-[#2D2926]' : 'font-bold text-[#8E5D52]'}`}>
                          {formatPriceOrConsult(proc.price, 'Sob consulta')}
                        </span>
                        <span
                          className={`text-[11px] font-bold ${
                            isSelected ? 'text-[#8E5D52]' : 'text-[#7D756D]'
                          }`}
                        >
                          {isSelected ? '✓ Selecionado' : '+ Adicionar'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Summary Sticky Footer in Step 1 */}
              <div className="pt-2 border-t border-[#EAE4DD] space-y-3">
                <div className="bg-[#FDFBF9] p-3.5 rounded-2xl border border-[#EAE4DD] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[#7D756D] block">
                      {selectedProcedures.length === 0
                        ? 'Nenhum procedimento selecionado'
                        : `${selectedProcedures.length} ${
                            selectedProcedures.length === 1
                              ? 'serviço selecionado'
                              : 'serviços selecionados'
                          }`}
                    </span>
                    <span className="font-bold text-[#2D2926]">
                      {selectedProcedures.length > 0
                        ? `Duração total: ${formatTimeFriendly(totalDurationMinutes)}`
                        : 'Clique nos serviços acima para escolher'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#7D756D] block">Total:</span>
                    <span className="font-extrabold text-[#8E5D52] text-sm">
                      {formatPriceOrConsult(totalPrice, 'A combinar')}
                    </span>
                  </div>
                </div>

                <button
                  id="booking-proceed-date-btn"
                  onClick={handleProceedToDate}
                  disabled={selectedProcedures.length === 0}
                  className={`w-full py-3.5 rounded-2xl text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    selectedProcedures.length > 0
                      ? 'bg-[#8E5D52] hover:bg-[#784D43] text-white shadow-xs'
                      : 'bg-[#EAE4DD] text-[#A8A099] cursor-not-allowed'
                  }`}
                >
                  <span>Continuar para Data e Horário</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Select Date */}
          {step === 2 && selectedProcedures.length > 0 && (
            <div className="space-y-4">
              {/* Selected procedures mini reminder */}
              <div className="p-3.5 bg-[#FDFBF9] rounded-2xl border border-[#EAE4DD] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#7D756D] font-semibold">
                    Procedimentos Selecionados ({selectedProcedures.length}):
                  </span>
                  <button
                    onClick={() => setStep(1)}
                    className="text-[11px] font-bold text-[#8E5D52] hover:underline cursor-pointer"
                  >
                    + Adicionar / Alterar
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {selectedProcedures.map((p) => (
                    <span
                      key={p.id}
                      className="inline-flex items-center gap-1 bg-white border border-[#EAE4DD] px-2.5 py-1 rounded-xl text-[11px] font-semibold text-[#2D2926]"
                    >
                      <span>{p.name}</span>
                      <span className="text-[#8E5D52]">({formatTimeFriendly(p.durationMinutes)})</span>
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[#F0EAE4] text-[11px]">
                  <span className="text-[#7D756D]">
                    Tempo total contínuo necessário: <strong>{formatTimeFriendly(totalDurationMinutes)}</strong>
                  </span>
                  <span className="font-bold text-[#8E5D52]">{formatCurrency(totalPrice)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D2926] uppercase tracking-wider mb-2">
                  Selecione o Dia Desejado:
                </label>

                {/* Interactive Day Selector Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {upcomingDays.map((day) => (
                    <button
                      key={day.dateStr}
                      id={`day-btn-${day.dateStr}`}
                      disabled={!day.available}
                      onClick={() => handleSelectDate(day.dateStr)}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                        !day.available
                          ? 'opacity-40 bg-[#F5F2ED] border-[#EAE4DD] cursor-not-allowed text-[#A8A099]'
                          : selectedDate === day.dateStr
                          ? 'border-[#8E5D52] bg-[#8E5D52] text-white shadow-xs'
                          : 'border-[#EAE4DD] bg-white hover:border-[#8E5D52] hover:bg-[#FDFBF9] text-[#2D2926]'
                      }`}
                    >
                      <span className="text-[11px] font-semibold uppercase">
                        {day.weekDay}
                      </span>
                      <span className="text-lg font-extrabold my-0.5">
                        {day.dayNum}
                      </span>
                      <span className="text-[10px] font-medium opacity-90">
                        {day.label.startsWith('Hoje')
                          ? 'Hoje'
                          : day.label.startsWith('Amanhã')
                          ? 'Amanhã'
                          : day.dateStr.split('-')[1] + '/' + day.dateStr.split('-')[0].slice(2)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Select Time (Calculated for Total Combined Duration) */}
          {step === 3 && selectedProcedures.length > 0 && selectedDate && (
            <div className="space-y-4">
              <div className="p-3.5 bg-[#FDFBF9] rounded-2xl border border-[#EAE4DD] space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#7D756D]">Data escolhida:</span>
                  <span className="font-bold text-[#2D2926]">
                    {formatDateBR(selectedDate)} ({getRelativeDayLabel(selectedDate)})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#7D756D]">Duração contínua necessária:</span>
                  <span className="font-bold text-[#8E5D52]">
                    {formatTimeFriendly(totalDurationMinutes)} ({selectedProcedures.length} {selectedProcedures.length === 1 ? 'serviço' : 'serviços'})
                  </span>
                </div>
                {config.lunchBreak?.enabled && (
                  <p className="text-[10px] text-[#7D756D] pt-1 border-t border-[#F0EAE4]">
                    ☕ O sistema garante que o tempo total não colida com o almoço ({config.lunchBreak.start} às {config.lunchBreak.end}) nem com outros agendamentos.
                  </p>
                )}
              </div>

              {availableSlots.length === 0 ? (
                <div className="text-center py-8 bg-[#FDFBF9] rounded-2xl border border-dashed border-[#EAE4DD] space-y-2">
                  <Clock className="w-8 h-8 text-[#A8A099] mx-auto" />
                  <p className="text-xs text-[#2D2926] font-semibold">
                    Nenhum horário contínuo de {formatTimeFriendly(totalDurationMinutes)} disponível nesta data.
                  </p>
                  <p className="text-[11px] text-[#7D756D]">
                    Os horários livres restantes não comportam o tempo total dos procedimentos selecionados.
                  </p>
                  <button
                    onClick={() => setStep(2)}
                    className="mt-2 text-xs font-bold text-[#8E5D52] hover:underline cursor-pointer"
                  >
                    Escolher outro dia &rarr;
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Morning Slots */}
                  {groupedSlots.morning.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-[#7D756D] uppercase tracking-wider flex items-center gap-1">
                        <span>☀️ Manhã</span>
                      </span>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {groupedSlots.morning.map((slot) => {
                          const slotEnd = addMinutesToTime(slot, totalDurationMinutes);
                          return (
                            <button
                              key={slot}
                              id={`time-slot-${slot}`}
                              onClick={() => handleSelectTime(slot)}
                              className={`py-2 px-2 rounded-2xl border transition-all cursor-pointer text-center ${
                                selectedTime === slot
                                  ? 'bg-[#8E5D52] text-white border-[#8E5D52] shadow-xs'
                                  : 'bg-white text-[#2D2926] border-[#EAE4DD] hover:border-[#8E5D52] hover:bg-[#FDFBF9]'
                              }`}
                            >
                              <span className="text-xs font-bold block">{slot}</span>
                              <span className={`text-[9px] block ${selectedTime === slot ? 'text-white/80' : 'text-[#7D756D]'}`}>
                                até {slotEnd}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Afternoon Slots */}
                  {groupedSlots.afternoon.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-[#7D756D] uppercase tracking-wider flex items-center gap-1">
                        <span>🌤️ Tarde</span>
                      </span>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {groupedSlots.afternoon.map((slot) => {
                          const slotEnd = addMinutesToTime(slot, totalDurationMinutes);
                          return (
                            <button
                              key={slot}
                              id={`time-slot-${slot}`}
                              onClick={() => handleSelectTime(slot)}
                              className={`py-2 px-2 rounded-2xl border transition-all cursor-pointer text-center ${
                                selectedTime === slot
                                  ? 'bg-[#8E5D52] text-white border-[#8E5D52] shadow-xs'
                                  : 'bg-white text-[#2D2926] border-[#EAE4DD] hover:border-[#8E5D52] hover:bg-[#FDFBF9]'
                              }`}
                            >
                              <span className="text-xs font-bold block">{slot}</span>
                              <span className={`text-[9px] block ${selectedTime === slot ? 'text-white/80' : 'text-[#7D756D]'}`}>
                                até {slotEnd}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Evening Slots */}
                  {groupedSlots.evening.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-[#7D756D] uppercase tracking-wider flex items-center gap-1">
                        <span>🌙 Noite</span>
                      </span>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {groupedSlots.evening.map((slot) => {
                          const slotEnd = addMinutesToTime(slot, totalDurationMinutes);
                          return (
                            <button
                              key={slot}
                              id={`time-slot-${slot}`}
                              onClick={() => handleSelectTime(slot)}
                              className={`py-2 px-2 rounded-2xl border transition-all cursor-pointer text-center ${
                                selectedTime === slot
                                  ? 'bg-[#8E5D52] text-white border-[#8E5D52] shadow-xs'
                                  : 'bg-white text-[#2D2926] border-[#EAE4DD] hover:border-[#8E5D52] hover:bg-[#FDFBF9]'
                              }`}
                            >
                              <span className="text-xs font-bold block">{slot}</span>
                              <span className={`text-[9px] block ${selectedTime === slot ? 'text-white/80' : 'text-[#7D756D]'}`}>
                                até {slotEnd}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Client Info Form */}
          {step === 4 && (
            <form onSubmit={handleGoToReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2D2926] uppercase tracking-wider mb-1.5">
                  Seu Nome Completo *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#A8A099] absolute left-3.5 top-3.5" />
                  <input
                    id="client-name-input"
                    type="text"
                    required
                    placeholder="Ex: Maria Silva"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-3 bg-[#FDFBF9] border border-[#EAE4DD] rounded-2xl text-sm text-[#2D2926] focus:bg-white focus:border-[#8E5D52] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D2926] uppercase tracking-wider mb-1.5">
                  Seu WhatsApp (com DDD) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#A8A099] absolute left-3.5 top-3.5" />
                  <input
                    id="client-phone-input"
                    type="tel"
                    required
                    placeholder="(11) 99999-9999"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(formatPhoneMask(e.target.value))}
                    className="w-full pl-10 pr-3.5 py-3 bg-[#FDFBF9] border border-[#EAE4DD] rounded-2xl text-sm text-[#2D2926] focus:bg-white focus:border-[#8E5D52] focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-[#7D756D] mt-1">
                  Usaremos este número para enviar a confirmação do agendamento.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D2926] uppercase tracking-wider mb-1.5">
                  Observações ou Preferências (Opcional)
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-[#A8A099] absolute left-3.5 top-3.5" />
                  <textarea
                    id="client-notes-input"
                    rows={2}
                    placeholder="Ex: Alergia a algum produto, preferência de tom..."
                    value={clientNotes}
                    onChange={(e) => setClientNotes(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#FDFBF9] border border-[#EAE4DD] rounded-2xl text-sm text-[#2D2926] focus:bg-white focus:border-[#8E5D52] focus:outline-none resize-none"
                  />
                </div>
              </div>

              <button
                id="booking-goto-review-btn"
                type="submit"
                className="w-full py-3.5 bg-[#8E5D52] hover:bg-[#784D43] text-white font-bold text-sm rounded-2xl shadow-xs transition-all cursor-pointer"
              >
                Avançar para Resumo &rarr;
              </button>
            </form>
          )}

          {/* STEP 5: Review & Confirm */}
          {step === 5 && selectedProcedures.length > 0 && (
            <div className="space-y-4">
              <div className="bg-[#FDFBF9] border border-[#EAE4DD] rounded-3xl p-5 space-y-3">
                <h3 className="font-bold text-[#2D2926] text-sm border-b border-[#EAE4DD] pb-2 flex items-center justify-between">
                  <span>Resumo do seu agendamento:</span>
                  <span className="text-xs text-[#8E5D52] font-semibold">
                    {selectedProcedures.length} {selectedProcedures.length === 1 ? 'procedimento' : 'procedimentos'}
                  </span>
                </h3>

                {/* Procedure Breakdown List */}
                <div className="space-y-2 text-xs">
                  <div className="py-1 border-b border-[#F0EAE4] space-y-1.5">
                    <span className="text-[#7D756D] block font-semibold">Serviços escolhidos:</span>
                    <div className="space-y-1 pl-1">
                      {selectedProcedures.map((proc, idx) => (
                        <div key={proc.id} className="flex justify-between items-center text-[#2D2926]">
                          <span className="flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-[#F5F2ED] text-[#8E5D52] text-[10px] font-bold flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="font-bold">{proc.name}</span>
                            <span className="text-[10px] text-[#7D756D]">({formatTimeFriendly(proc.durationMinutes)})</span>
                          </span>
                          <span className="font-semibold text-[#8E5D52]">{formatPriceOrConsult(proc.price, 'Sob consulta')}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between py-1 border-b border-[#F0EAE4] gap-2">
                    <span className="text-[#7D756D] shrink-0">Data:</span>
                    <span className="font-bold text-[#2D2926] text-right">
                      {formatDateBR(selectedDate)} ({getRelativeDayLabel(selectedDate)})
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-[#F0EAE4] gap-2">
                    <span className="text-[#7D756D] shrink-0">Horário:</span>
                    <span className="font-bold text-[#2D2926] text-right">
                      {selectedTime} às {addMinutesToTime(selectedTime, totalDurationMinutes)}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-[#F0EAE4] gap-2">
                    <span className="text-[#7D756D] shrink-0">Duração Total:</span>
                    <span className="font-semibold text-[#2D2926] text-right">
                      {formatTimeFriendly(totalDurationMinutes)}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-[#F0EAE4] gap-2">
                    <span className="text-[#7D756D] shrink-0">Cliente:</span>
                    <span className="font-semibold text-[#2D2926] text-right break-words">{clientName}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-[#F0EAE4] gap-2">
                    <span className="text-[#7D756D] shrink-0">WhatsApp:</span>
                    <span className="font-semibold text-[#2D2926] text-right">{clientPhone}</span>
                  </div>

                  <div className="flex justify-between pt-2 text-sm gap-2">
                    <span className="font-bold text-[#2D2926] shrink-0">Valor Total:</span>
                    <span className="font-extrabold text-[#8E5D52] text-base text-right">
                      {formatPriceOrConsult(totalPrice, 'A combinar')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-[#FFF9E6] rounded-2xl border border-[#F2E0AA] text-[#8C6D1F] text-[11px] leading-relaxed">
                ℹ️ O pagamento é realizado diretamente no salão no dia do atendimento (Pix, Cartão ou Dinheiro).
              </div>

              <button
                id="booking-confirm-final-btn"
                onClick={handleConfirmBooking}
                className="w-full py-4 bg-[#8E5D52] hover:bg-[#784D43] active:scale-98 text-white font-extrabold text-base rounded-2xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>CONFIRMAR AGENDAMENTO</span>
              </button>
            </div>
          )}

          {/* STEP 6: Success */}
          {step === 6 && confirmedAppointment && (
            <div className="text-center space-y-4 py-2">
              <div className="w-16 h-16 bg-[#EAF5EC] text-[#2F7D48] rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="font-['Playfair_Display',serif] text-2xl font-bold text-[#2D2926]">
                  Agendamento Confirmado!
                </h3>
                <p className="text-xs text-[#7D756D] mt-1 max-w-xs mx-auto">
                  Seu horário foi reservado com sucesso com {config.ownerName}.
                </p>
              </div>

              {/* Summary Card */}
              <div className="bg-[#FDFBF9] border border-[#EAE4DD] rounded-3xl p-5 text-left text-xs space-y-2.5">
                <div>
                  <span className="text-[#7D756D] block font-semibold mb-1">Procedimentos:</span>
                  {confirmedAppointment.procedures && confirmedAppointment.procedures.length > 1 ? (
                    <div className="space-y-1">
                      {confirmedAppointment.procedures.map((p, idx) => (
                        <div key={p.id} className="flex justify-between text-[#2D2926]">
                          <span>• {p.name} ({formatTimeFriendly(p.durationMinutes)})</span>
                          <span className="font-semibold text-[#8E5D52]">{formatPriceOrConsult(p.price, 'Sob consulta')}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="font-bold text-[#2D2926]">{confirmedAppointment.procedureName}</span>
                  )}
                </div>

                <div className="flex justify-between gap-2 pt-2 border-t border-[#F0EAE4]">
                  <span className="text-[#7D756D] shrink-0">Data & Horário:</span>
                  <span className="font-bold text-[#8E5D52] text-right">
                    {formatDateBR(confirmedAppointment.date)} às {confirmedAppointment.time} (duração de {formatTimeFriendly(confirmedAppointment.durationMinutes)})
                  </span>
                </div>

                <div className="flex justify-between gap-2">
                  <span className="text-[#7D756D] shrink-0">Valor Total:</span>
                  <span className="font-bold text-[#2D2926] text-right">
                    {formatPriceOrConsult(confirmedAppointment.finalPrice || confirmedAppointment.price, 'A combinar')}
                  </span>
                </div>

                <div className="flex justify-between gap-2">
                  <span className="text-[#7D756D] shrink-0">Local:</span>
                  <span className="text-[#2D2926] text-right break-words">{config.address}</span>
                </div>
              </div>

              {/* Direct WhatsApp Share Button */}
              <div className="space-y-2 pt-2">
                <a
                  id="whatsapp-receipt-share-btn"
                  href={buildClientConfirmationShareUrl(confirmedAppointment, config)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 bg-[#2F7D48] hover:bg-[#25683B] text-white text-xs font-bold rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Notificar o Salão pelo WhatsApp</span>
                </a>

                <button
                  id="booking-finish-btn"
                  onClick={onClose}
                  className="w-full py-3 text-xs font-bold text-[#7D756D] hover:text-[#2D2926] hover:bg-[#F5F2ED] rounded-2xl transition-colors cursor-pointer"
                >
                  Concluir e Voltar ao Início
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
