import React, { useState, useMemo } from 'react';
import { useSalon } from '../../context/SalonContext';
import { Appointment, BlockedSlot } from '../../types';
import {
  formatDateBR,
  formatCurrency,
  formatTimeFriendly,
  getTodayDateStr,
  timeToMinutes,
  minutesToTime,
  addMinutesToTime,
  getDayOfWeekName,
} from '../../utils/dateUtils';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Lock,
  User,
  Phone,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { AppointmentDetailsModal } from './AppointmentDetailsModal';
import { NewManualAppointmentModal } from './NewManualAppointmentModal';

type CalendarView = 'day' | 'week' | 'month';

export const AdminCalendar: React.FC = () => {
  const {
    appointments,
    blockedSlots,
    config,
    getAvailableSlotsForDate,
  } = useSalon();

  const [currentDate, setCurrentDate] = useState<string>(getTodayDateStr());
  const [view, setView] = useState<CalendarView>('day');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [manualSlotModal, setManualSlotModal] = useState<{ open: boolean; date: string; time: string }>({
    open: false,
    date: '',
    time: '',
  });

  // Calculate dates for week view
  const weekDays = useMemo(() => {
    const [y, m, d] = currentDate.split('-').map(Number);
    const curr = new Date(y, m - 1, d);
    const dayOfWeek = curr.getDay(); // 0 is Sunday
    const startOfWeek = new Date(curr);
    startOfWeek.setDate(curr.getDate() - dayOfWeek);

    const days: { dateStr: string; label: string; dayNum: number; isToday: boolean }[] = [];
    const todayStr = getTodayDateStr();

    for (let i = 0; i < 7; i++) {
      const dObj = new Date(startOfWeek);
      dObj.setDate(startOfWeek.getDate() + i);
      const year = dObj.getFullYear();
      const month = String(dObj.getMonth() + 1).padStart(2, '0');
      const day = String(dObj.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      days.push({
        dateStr,
        label: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][i],
        dayNum: dObj.getDate(),
        isToday: dateStr === todayStr,
      });
    }
    return days;
  }, [currentDate]);

  // Navigate date
  const handlePrev = () => {
    const [y, m, d] = currentDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    if (view === 'day') dateObj.setDate(dateObj.getDate() - 1);
    else if (view === 'week') dateObj.setDate(dateObj.getDate() - 7);
    else dateObj.setMonth(dateObj.getMonth() - 1);

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    setCurrentDate(`${year}-${month}-${day}`);
  };

  const handleNext = () => {
    const [y, m, d] = currentDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    if (view === 'day') dateObj.setDate(dateObj.getDate() + 1);
    else if (view === 'week') dateObj.setDate(dateObj.getDate() + 7);
    else dateObj.setMonth(dateObj.getMonth() + 1);

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    setCurrentDate(`${year}-${month}-${day}`);
  };

  // Day View timeline generation
  const dayTimeline = useMemo(() => {
    const [y, m, d] = currentDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayOfWeek = dateObj.getDay();
    const schedule = config.workingHours?.[dayOfWeek];

    if (!schedule || !schedule.enabled) {
      return { isClosed: true, items: [] };
    }

    const startMin = timeToMinutes(schedule.start);
    const endMin = timeToMinutes(schedule.end);

    const dayApts = appointments.filter((a) => a.date === currentDate && a.status !== 'cancelado');
    const dayBlocks = blockedSlots.filter((b) => b.date === currentDate);

    // Lunch break as block
    if (config.lunchBreak?.enabled) {
      dayBlocks.push({
        id: 'lunch-auto',
        date: currentDate,
        startTime: config.lunchBreak.start,
        endTime: config.lunchBreak.end,
        reason: 'Intervalo de Almoço',
      });
    }

    // Generate 30 min intervals
    const items: {
      time: string;
      appointment?: Appointment;
      blocked?: BlockedSlot;
      isAvailable: boolean;
    }[] = [];

    for (let min = startMin; min < endMin; min += 30) {
      const timeStr = minutesToTime(min);

      // Check if an appointment starts at this time
      const apt = dayApts.find((a) => a.time === timeStr);

      // Check if time is covered by an ongoing appointment
      const ongoingApt = dayApts.find((a) => {
        const aStart = timeToMinutes(a.time);
        const aEnd = aStart + a.durationMinutes;
        return min >= aStart && min < aEnd;
      });

      // Check if time is covered by a blocked slot
      const block = dayBlocks.find((b) => {
        const bStart = timeToMinutes(b.startTime);
        const bEnd = timeToMinutes(b.endTime);
        return min >= bStart && min < bEnd;
      });

      if (apt) {
        items.push({ time: timeStr, appointment: apt, isAvailable: false });
      } else if (ongoingApt) {
        // occupied by ongoing appointment
      } else if (block) {
        if (min === timeToMinutes(block.startTime)) {
          items.push({ time: timeStr, blocked: block, isAvailable: false });
        }
      } else {
        items.push({ time: timeStr, isAvailable: true });
      }
    }

    return { isClosed: false, items };
  }, [currentDate, appointments, blockedSlots, config]);

  return (
    <div className="space-y-4 sm:space-y-5 w-full min-w-0">
      {/* Calendar Header Control Bar */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#EAE4DD] p-3.5 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        {/* Date Navigator */}
        <div className="flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2 min-w-0">
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <button
              onClick={handlePrev}
              className="p-1.5 sm:p-2 text-[#7D756D] hover:text-[#2D2926] hover:bg-[#F5F2ED] rounded-xl transition-colors cursor-pointer"
              title="Anterior"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <button
              onClick={() => setCurrentDate(getTodayDateStr())}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-[#FDFBF9] hover:bg-[#EAE4DD] text-[#2D2926] font-bold text-xs rounded-xl border border-[#EAE4DD] transition-colors cursor-pointer"
            >
              Hoje
            </button>

            <button
              onClick={handleNext}
              className="p-1.5 sm:p-2 text-[#7D756D] hover:text-[#2D2926] hover:bg-[#F5F2ED] rounded-xl transition-colors cursor-pointer"
              title="Próximo"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <div className="px-1.5 sm:px-2 min-w-0 text-right sm:text-left">
            <h2 className="font-['Playfair_Display',serif] text-sm sm:text-base md:text-lg font-bold text-[#2D2926] leading-tight truncate">
              {formatDateBR(currentDate)}
            </h2>
            <p className="text-[11px] sm:text-xs text-[#8E5D52] font-semibold truncate">
              {getDayOfWeekName(new Date(currentDate.replace(/-/g, '/')).getDay())}
            </p>
          </div>
        </div>

        {/* View Switcher: Dia, Semana, Mês & New Action */}
        <div className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-[#F5F2ED]">
          <div className="bg-[#FDFBF9] p-1 rounded-2xl border border-[#EAE4DD] flex gap-1 shrink-0">
            <button
              onClick={() => setView('day')}
              className={`px-3 py-1 sm:px-3.5 sm:py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                view === 'day' ? 'bg-[#8E5D52] text-white shadow-xs' : 'text-[#7D756D] hover:text-[#2D2926]'
              }`}
            >
              Dia
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-3 py-1 sm:px-3.5 sm:py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                view === 'week' ? 'bg-[#8E5D52] text-white shadow-xs' : 'text-[#7D756D] hover:text-[#2D2926]'
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setView('month')}
              className={`px-3 py-1 sm:px-3.5 sm:py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                view === 'month' ? 'bg-[#8E5D52] text-white shadow-xs' : 'text-[#7D756D] hover:text-[#2D2926]'
              }`}
            >
              Mês
            </button>
          </div>

          <button
            onClick={() => setManualSlotModal({ open: true, date: currentDate, time: '10:00' })}
            className="px-3 sm:px-4 py-1.5 sm:py-2.5 bg-[#8E5D52] hover:bg-[#784D43] text-white rounded-xl sm:rounded-2xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Agendar</span>
          </button>
        </div>
      </div>

      {/* VIEW: DAY TIMELINE */}
      {view === 'day' && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#EAE4DD] p-3.5 sm:p-6 shadow-xs space-y-3.5 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-[#F5F2ED] pb-3">
            <h3 className="font-bold text-[#2D2926] text-xs sm:text-sm flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-[#8E5D52] shrink-0" />
              <span>Linha do Tempo de {formatDateBR(currentDate)}</span>
            </h3>
            <span className="text-[11px] sm:text-xs text-[#7D756D]">
              Toque em um horário vago para agendar
            </span>
          </div>

          {dayTimeline.isClosed ? (
            <div className="text-center py-14 sm:py-16 bg-[#FDFBF9] rounded-2xl sm:rounded-3xl border border-dashed border-[#EAE4DD] space-y-2 px-4">
              <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-[#7D756D] mx-auto" />
              <h4 className="font-bold text-[#2D2926] text-sm">Salão Fechado nesta data</h4>
              <p className="text-xs text-[#7D756D]">Dia de folga ou fora da escala de funcionamento configurada.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#F5F2ED]">
              {dayTimeline.items.map((slot) => {
                if (slot.appointment) {
                  const apt = slot.appointment;
                  const endTime = addMinutesToTime(apt.time, apt.durationMinutes);
                  return (
                    <div
                      key={apt.id}
                      onClick={() => setSelectedAppointment(apt)}
                      className="py-3 px-3 sm:py-3.5 sm:px-4 hover:bg-[#FDFBF9] rounded-2xl transition-all cursor-pointer flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-2.5 sm:gap-3.5 bg-white border border-[#EAE4DD] shadow-2xs my-1.5"
                    >
                      <div className="flex items-start xs:items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                        <div className="bg-[#F5F2ED] text-[#2D2926] rounded-xl px-2.5 py-1 sm:px-3 sm:py-1.5 text-center font-bold text-xs shrink-0 border border-[#EAE4DD]">
                          <span>{apt.time}</span>
                          <span className="block text-[9px] sm:text-[10px] text-[#8E5D52] font-semibold">às {endTime}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-bold text-[#2D2926] text-xs sm:text-sm truncate max-w-[140px] xs:max-w-xs">{apt.clientName}</span>
                            <span className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              apt.status === 'confirmado' ? 'bg-[#EAF5EC] text-[#2F7D48]' :
                              apt.status === 'pendente' ? 'bg-[#FEF6EC] text-[#965E21]' :
                              apt.status === 'concluido' ? 'bg-[#EBF3FB] text-[#2C689F]' :
                              'bg-[#EAE4DD] text-[#2D2926]'
                            }`}>
                              {apt.status.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-[11px] sm:text-xs text-[#8E5D52] font-semibold mt-0.5 truncate">
                            {apt.procedureName} ({formatTimeFriendly(apt.durationMinutes)})
                          </p>
                        </div>
                      </div>

                      <div className="flex xs:flex-col items-center xs:items-end justify-between xs:justify-center border-t xs:border-t-0 pt-1.5 xs:pt-0 border-[#F5F2ED] shrink-0 text-right">
                        <span className="font-extrabold text-[#2D2926] text-xs sm:text-sm">
                          {formatCurrency(apt.finalPrice || apt.price)}
                        </span>
                        <span className="text-[10px] text-[#8E5D52] font-bold">Ver Detalhes &rarr;</span>
                      </div>
                    </div>
                  );
                }

                if (slot.blocked) {
                  return (
                    <div
                      key={slot.blocked.id}
                      className="py-2.5 px-3 bg-[#FDFBF9] rounded-2xl border border-[#EAE4DD] flex flex-col xs:flex-row xs:items-center justify-between gap-1.5 text-xs text-[#7D756D] my-1"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="bg-[#EAE4DD] rounded-xl px-2 py-0.5 font-bold text-[#2D2926] text-[11px] shrink-0">
                          {slot.blocked.startTime} - {slot.blocked.endTime}
                        </div>
                        <div className="font-semibold flex items-center gap-1 text-[#2D2926] truncate text-xs">
                          <Lock className="w-3.5 h-3.5 text-[#7D756D] shrink-0" />
                          <span className="truncate">Bloqueado: {slot.blocked.reason}</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-[#7D756D] shrink-0">Indisponível</span>
                    </div>
                  );
                }

                return (
                  <div
                    key={slot.time}
                    onClick={() => setManualSlotModal({ open: true, date: currentDate, time: slot.time })}
                    className="py-2 px-2.5 sm:py-2.5 sm:px-3 hover:bg-[#FDFBF9] rounded-xl transition-colors cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <span className="font-mono text-xs font-semibold text-[#7D756D] w-11 shrink-0">
                        {slot.time}
                      </span>
                      <span className="text-xs text-[#2F7D48] font-semibold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#2F7D48] shrink-0"></span>
                        <span className="truncate">Horário Disponível</span>
                      </span>
                    </div>

                    <button className="text-[11px] sm:text-xs font-bold text-[#8E5D52] bg-[#F5F2ED] hover:bg-[#EAE4DD] px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 shrink-0">
                      <Plus className="w-3 h-3" />
                      <span className="hidden xs:inline">Agendar</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW: WEEK VIEW */}
      {view === 'week' && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#EAE4DD] p-3.5 sm:p-5 shadow-xs overflow-x-auto w-full">
          <div className="grid grid-cols-7 gap-2 min-w-[620px] sm:min-w-[700px]">
            {weekDays.map((wDay) => {
              const dayApts = appointments.filter((a) => a.date === wDay.dateStr && a.status !== 'cancelado');
              return (
                <div
                  key={wDay.dateStr}
                  onClick={() => {
                    setCurrentDate(wDay.dateStr);
                    setView('day');
                  }}
                  className={`border rounded-2xl p-2.5 sm:p-3 flex flex-col min-h-[260px] sm:min-h-[280px] transition-all cursor-pointer ${
                    wDay.isToday
                      ? 'border-[#8E5D52] bg-[#FDFBF9] ring-2 ring-[#8E5D52]/20'
                      : 'border-[#EAE4DD] bg-white hover:border-[#8E5D52]/50'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-[#F5F2ED] pb-2 mb-2">
                    <span className="text-[10px] sm:text-xs font-bold uppercase text-[#7D756D]">{wDay.label}</span>
                    <span className={`text-xs sm:text-sm font-extrabold px-2 py-0.5 rounded-full ${
                      wDay.isToday ? 'bg-[#8E5D52] text-white' : 'text-[#2D2926]'
                    }`}>
                      {wDay.dayNum}
                    </span>
                  </div>

                  {/* Appointments in this day */}
                  <div className="flex-1 space-y-1.5 overflow-y-auto">
                    {dayApts.map((apt) => (
                      <div
                        key={apt.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAppointment(apt);
                        }}
                        className="p-1.5 sm:p-2 rounded-xl text-[10px] sm:text-[11px] font-semibold bg-[#F5F2ED] text-[#2D2926] border border-[#EAE4DD] truncate hover:bg-[#EAE4DD] transition-colors"
                      >
                        <span className="font-bold text-[#8E5D52]">{apt.time}</span> - {apt.clientName.split(' ')[0]}
                      </div>
                    ))}

                    {dayApts.length === 0 && (
                      <p className="text-[10px] sm:text-[11px] text-[#7D756D] text-center py-6">Sem horários</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW: MONTH VIEW */}
      {view === 'month' && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-[#EAE4DD] p-3.5 sm:p-6 shadow-xs text-center space-y-3.5 sm:space-y-4 overflow-x-auto w-full">
          <div className="text-xs text-[#7D756D]">
            Visualização rápida do mês de <strong>{formatDateBR(currentDate).slice(3)}</strong>
          </div>
          <div className="grid grid-cols-7 gap-1 sm:gap-2 min-w-[300px]">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((h) => (
              <div key={h} className="text-[10px] sm:text-xs font-bold text-[#7D756D] py-1">{h}</div>
            ))}
            {/* Generate current month days */}
            {Array.from({ length: 31 }).map((_, idx) => {
              const [y, m] = currentDate.split('-').map(Number);
              const dayNum = idx + 1;
              const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayApts = appointments.filter((a) => a.date === dateStr && a.status !== 'cancelado');
              const isToday = dateStr === getTodayDateStr();

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setCurrentDate(dateStr);
                    setView('day');
                  }}
                  className={`p-1.5 sm:p-3 rounded-xl sm:rounded-2xl border min-h-[54px] sm:min-h-[68px] flex flex-col justify-between transition-colors cursor-pointer ${
                    isToday ? 'border-[#8E5D52] bg-[#FDFBF9] ring-2 ring-[#8E5D52]/20' : 'border-[#EAE4DD] hover:bg-[#FDFBF9]'
                  }`}
                >
                  <span className={`text-[10px] sm:text-xs font-bold text-left ${isToday ? 'text-[#8E5D52]' : 'text-[#2D2926]'}`}>
                    {dayNum}
                  </span>
                  {dayApts.length > 0 && (
                    <span className="text-[8px] sm:text-[10px] font-bold bg-[#8E5D52] text-white px-1 sm:px-2 py-0.2 sm:py-0.5 rounded-full self-end truncate max-w-full">
                      {dayApts.length}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modals */}
      <AppointmentDetailsModal
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
      />

      <NewManualAppointmentModal
        isOpen={manualSlotModal.open}
        onClose={() => setManualSlotModal({ open: false, date: '', time: '' })}
        initialDate={manualSlotModal.date}
        initialTime={manualSlotModal.time}
      />
    </div>
  );
};
