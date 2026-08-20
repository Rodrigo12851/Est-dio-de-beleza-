import React, { useState, useMemo, useEffect } from 'react';
import { useSalon } from '../../context/SalonContext';
import { Procedure, ProcedureCategory, Appointment } from '../../types';
import {
  formatCurrency,
  formatTimeFriendly,
  formatDateBR,
  getTodayDateStr,
  getTomorrowDateStr,
  getRelativeDayLabel,
} from '../../utils/dateUtils';
import { formatPhoneMask, cleanPhone, buildClientConfirmationShareUrl } from '../../utils/whatsappUtils';
import confetti from 'canvas-confetti';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Scissors
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
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(null);
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
        setSelectedProcedure(preselectedProcedure);
        setStep(2); // Jump directly to date selection
      } else {
        setStep(1);
      }
      setErrorMessage('');
      setConfirmedAppointment(null);
    }
  }, [isOpen, preselectedProcedure]);

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
  }, [config, isDateAvailable]);

  // Compute available time slots whenever date or procedure changes
  const availableSlots = useMemo(() => {
    if (!selectedDate || !selectedProcedure) return [];
    return getAvailableSlotsForDate(selectedDate, selectedProcedure.durationMinutes);
  }, [selectedDate, selectedProcedure, getAvailableSlotsForDate]);

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

  const handleSelectProcedure = (proc: Procedure) => {
    setSelectedProcedure(proc);
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
    if (!selectedProcedure || !selectedDate || !selectedTime) return;

    const res = createAppointment({
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientNotes: clientNotes.trim(),
      procedureId: selectedProcedure.id,
      procedureName: selectedProcedure.name,
      procedureCategory: selectedProcedure.category,
      date: selectedDate,
      time: selectedTime,
      durationMinutes: selectedProcedure.durationMinutes,
      price: selectedProcedure.price,
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

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#ec4899', '#fb7185', '#fda4af', '#fbbf24'],
      });
    } catch {
      // ignore
    }
  };

  const activeProcedures = procedures.filter((p) => p.active);
  const filteredProcedures = selectedCategory === 'Todos'
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
                {step === 1 && '1. Escolha o Procedimento'}
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

          {/* STEP 1: Select Procedure */}
          {step === 1 && (
            <div className="space-y-4">
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

              {/* Procedure list */}
              <div className="space-y-2.5">
                {filteredProcedures.map((proc) => (
                  <div
                    key={proc.id}
                    id={`select-proc-${proc.id}`}
                    onClick={() => handleSelectProcedure(proc)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 hover:border-[#8E5D52] hover:bg-[#FDFBF9] ${
                      selectedProcedure?.id === proc.id
                        ? 'border-[#8E5D52] bg-[#FDFBF9] ring-2 ring-[#8E5D52]/20'
                        : 'border-[#EAE4DD] bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={proc.photo}
                        alt={proc.name}
                        referrerPolicy="no-referrer"
                        className="w-13 h-13 rounded-xl object-cover shrink-0 border border-[#EAE4DD]"
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
                      <span className="text-sm font-extrabold text-[#2D2926] block">
                        {formatCurrency(proc.price)}
                      </span>
                      <span className="text-[11px] font-bold text-[#8E5D52]">
                        Escolher &rarr;
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Select Date */}
          {step === 2 && selectedProcedure && (
            <div className="space-y-4">
              {/* Selected procedure mini reminder */}
              <div className="p-3.5 bg-[#FDFBF9] rounded-2xl border border-[#EAE4DD] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#7D756D] block">Procedimento selecionado:</span>
                  <span className="font-bold text-[#2D2926]">{selectedProcedure.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-[#8E5D52]">{formatCurrency(selectedProcedure.price)}</span>
                  <span className="text-[#7D756D] block">{formatTimeFriendly(selectedProcedure.durationMinutes)}</span>
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
                        {day.label.startsWith('Hoje') ? 'Hoje' : day.label.startsWith('Amanhã') ? 'Amanhã' : day.dateStr.split('-')[1] + '/' + day.dateStr.split('-')[0].slice(2)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Select Time */}
          {step === 3 && selectedProcedure && selectedDate && (
            <div className="space-y-4">
              <div className="p-3.5 bg-[#FDFBF9] rounded-2xl border border-[#EAE4DD] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#7D756D] block">Data escolhida:</span>
                  <span className="font-bold text-[#2D2926]">{formatDateBR(selectedDate)} ({getRelativeDayLabel(selectedDate)})</span>
                </div>
                <div className="text-right">
                  <span className="text-[#7D756D] block">Duração necessária:</span>
                  <span className="font-bold text-[#2D2926]">{formatTimeFriendly(selectedProcedure.durationMinutes)}</span>
                </div>
              </div>

              {availableSlots.length === 0 ? (
                <div className="text-center py-8 bg-[#FDFBF9] rounded-2xl border border-dashed border-[#EAE4DD] space-y-2">
                  <Clock className="w-8 h-8 text-[#A8A099] mx-auto" />
                  <p className="text-xs text-[#2D2926] font-semibold">Nenhum horário livre para esta data.</p>
                  <p className="text-[11px] text-[#7D756D]">Todos os horários já estão agendados ou bloqueados.</p>
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
                        {groupedSlots.morning.map((slot) => (
                          <button
                            key={slot}
                            id={`time-slot-${slot}`}
                            onClick={() => handleSelectTime(slot)}
                            className={`py-2.5 px-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                              selectedTime === slot
                                ? 'bg-[#8E5D52] text-white border-[#8E5D52] shadow-xs'
                                : 'bg-white text-[#2D2926] border-[#EAE4DD] hover:border-[#8E5D52] hover:bg-[#FDFBF9]'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
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
                        {groupedSlots.afternoon.map((slot) => (
                          <button
                            key={slot}
                            id={`time-slot-${slot}`}
                            onClick={() => handleSelectTime(slot)}
                            className={`py-2.5 px-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                              selectedTime === slot
                                ? 'bg-[#8E5D52] text-white border-[#8E5D52] shadow-xs'
                                : 'bg-white text-[#2D2926] border-[#EAE4DD] hover:border-[#8E5D52] hover:bg-[#FDFBF9]'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
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
                        {groupedSlots.evening.map((slot) => (
                          <button
                            key={slot}
                            id={`time-slot-${slot}`}
                            onClick={() => handleSelectTime(slot)}
                            className={`py-2.5 px-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                              selectedTime === slot
                                ? 'bg-[#8E5D52] text-white border-[#8E5D52] shadow-xs'
                                : 'bg-white text-[#2D2926] border-[#EAE4DD] hover:border-[#8E5D52] hover:bg-[#FDFBF9]'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
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
                  Usaremos este número para enviar o lembrete de confirmação.
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
                    placeholder="Ex: Tenho alergia a esmalte comum, evento às 19h..."
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
          {step === 5 && selectedProcedure && (
            <div className="space-y-4">
              <div className="bg-[#FDFBF9] border border-[#EAE4DD] rounded-3xl p-5 space-y-3">
                <h3 className="font-bold text-[#2D2926] text-sm border-b border-[#EAE4DD] pb-2">
                  Resumo do seu agendamento:
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-[#F0EAE4] gap-2">
                    <span className="text-[#7D756D] shrink-0">Procedimento:</span>
                    <span className="font-bold text-[#2D2926] text-right break-words">{selectedProcedure.name}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-[#F0EAE4] gap-2">
                    <span className="text-[#7D756D] shrink-0">Data:</span>
                    <span className="font-bold text-[#2D2926] text-right">
                      {formatDateBR(selectedDate)} ({getRelativeDayLabel(selectedDate)})
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-[#F0EAE4] gap-2">
                    <span className="text-[#7D756D] shrink-0">Horário:</span>
                    <span className="font-bold text-[#2D2926] text-right">{selectedTime}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-[#F0EAE4] gap-2">
                    <span className="text-[#7D756D] shrink-0">Duração estimada:</span>
                    <span className="font-semibold text-[#2D2926] text-right">
                      {formatTimeFriendly(selectedProcedure.durationMinutes)}
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
                      {formatCurrency(selectedProcedure.price)}
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
              <div className="bg-[#FDFBF9] border border-[#EAE4DD] rounded-3xl p-5 text-left text-xs space-y-2">
                <div className="flex justify-between gap-2">
                  <span className="text-[#7D756D] shrink-0">Procedimento:</span>
                  <span className="font-bold text-[#2D2926] text-right break-words">{confirmedAppointment.procedureName}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-[#7D756D] shrink-0">Data & Horário:</span>
                  <span className="font-bold text-[#8E5D52] text-right">
                    {formatDateBR(confirmedAppointment.date)} às {confirmedAppointment.time}
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
