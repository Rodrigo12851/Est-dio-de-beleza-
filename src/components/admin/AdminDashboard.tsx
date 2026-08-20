import React, { useState, useMemo } from 'react';
import { useSalon } from '../../context/SalonContext';
import { Appointment } from '../../types';
import {
  formatCurrency,
  formatDateBR,
  formatTimeFriendly,
  getTodayDateStr,
  getTomorrowDateStr,
  addMinutesToTime,
} from '../../utils/dateUtils';
import { buildWhatsAppReminderUrl } from '../../utils/whatsappUtils';
import {
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  XCircle,
  MessageCircle,
  Plus,
  Send,
  Sparkles,
  ArrowRight,
  TrendingUp,
  User,
  Phone
} from 'lucide-react';
import { AppointmentDetailsModal } from './AppointmentDetailsModal';
import { NewManualAppointmentModal } from './NewManualAppointmentModal';

export const AdminDashboard: React.FC = () => {
  const {
    appointments,
    config,
    setAdminTab,
    updateAppointmentStatus,
    markReminderSent,
  } = useSalon();

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  const today = getTodayDateStr();
  const tomorrow = getTomorrowDateStr();

  // Filter today's appointments
  const todayAppointments = useMemo(() => {
    return appointments
      .filter((a) => a.date === today)
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, today]);

  // Today metrics
  const todayTotalCount = todayAppointments.length;
  const todayRevenueExpected = todayAppointments
    .filter((a) => a.status !== 'cancelado')
    .reduce((acc, a) => acc + (a.finalPrice || a.price), 0);
  const todayConfirmedCount = todayAppointments.filter((a) => a.status === 'confirmado' || a.status === 'concluido').length;
  const todayPendingCount = todayAppointments.filter((a) => a.status === 'pendente').length;
  const todayCancelledCount = todayAppointments.filter((a) => a.status === 'cancelado').length;

  // Tomorrow's appointments needing WhatsApp reminder confirmation
  const tomorrowAppointments = useMemo(() => {
    return appointments
      .filter((a) => a.date === tomorrow && a.status !== 'cancelado')
      .sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments, tomorrow]);

  const handleSendReminder = (apt: Appointment, e: React.MouseEvent) => {
    e.stopPropagation();
    markReminderSent(apt.id);
    const url = buildWhatsAppReminderUrl(apt, config);
    window.open(url, '_blank');
  };

  const handleQuickConfirm = (apt: Appointment, e: React.MouseEvent) => {
    e.stopPropagation();
    updateAppointmentStatus(apt.id, 'confirmado');
  };

  return (
    <div className="space-y-6">
      {/* Bento Grid Header / Top Banner */}
      <div className="bg-[#2D2926] text-[#FDFBF9] rounded-3xl p-6 sm:p-7 shadow-xs border border-[#443E3A] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#8E5D52]/40 text-[#D48D80] border border-[#8E5D52]/50 font-bold text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Painel do Dia
            </span>
            <span className="text-[#A8A099] text-xs">• {formatDateBR(today)} (Hoje)</span>
          </div>
          <h2 className="font-['Playfair_Display',serif] text-2xl sm:text-3xl font-bold mt-2 text-white">
            Resumo & Operação do Salão
          </h2>
          <p className="text-xs sm:text-sm text-[#D8D2CB] mt-1">
            Você tem <strong className="text-[#D48D80]">{todayTotalCount} agendamentos</strong> programados para hoje.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="px-5 py-3 bg-[#8E5D52] hover:bg-[#784D43] active:scale-95 text-white font-bold text-xs rounded-2xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Agendamento</span>
          </button>
        </div>
      </div>

      {/* Bento KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Agendamentos */}
        <div className="bg-white p-5 rounded-3xl border border-[#EAE4DD] shadow-xs flex flex-col justify-between space-y-2 hover:border-[#D48D80]/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#7D756D] uppercase tracking-wider">Agendamentos</span>
            <div className="w-8 h-8 rounded-xl bg-[#F5F2ED] text-[#8E5D52] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#2D2926]">{todayTotalCount}</div>
            <p className="text-[11px] text-[#A8A099] mt-0.5">atendimentos hoje</p>
          </div>
        </div>

        {/* Faturamento Previsto */}
        <div className="bg-white p-5 rounded-3xl border border-[#EAE4DD] shadow-xs flex flex-col justify-between space-y-2 hover:border-[#D48D80]/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#7D756D] uppercase tracking-wider">Previsto Hoje</span>
            <div className="w-8 h-8 rounded-xl bg-[#EAF5EC] text-[#2F7D48] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-extrabold text-[#2F7D48]">
              {formatCurrency(todayRevenueExpected)}
            </div>
            <p className="text-[11px] text-[#A8A099] mt-0.5">faturamento do dia</p>
          </div>
        </div>

        {/* Confirmados */}
        <div className="bg-white p-5 rounded-3xl border border-[#EAE4DD] shadow-xs flex flex-col justify-between space-y-2 hover:border-[#D48D80]/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#7D756D] uppercase tracking-wider">Confirmados</span>
            <div className="w-8 h-8 rounded-xl bg-[#EAF5EC] text-[#2F7D48] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#2F7D48]">{todayConfirmedCount}</div>
            <p className="text-[11px] text-[#A8A099] mt-0.5">horários garantidos</p>
          </div>
        </div>

        {/* Pendentes */}
        <div className="bg-white p-5 rounded-3xl border border-[#EAE4DD] shadow-xs flex flex-col justify-between space-y-2 hover:border-[#D48D80]/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#7D756D] uppercase tracking-wider">Aguardando</span>
            <div className="w-8 h-8 rounded-xl bg-[#FFF6E5] text-[#B87A00] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#B87A00]">{todayPendingCount}</div>
            <p className="text-[11px] text-[#A8A099] mt-0.5">pendentes de confirmação</p>
          </div>
        </div>

        {/* Cancelados */}
        <div className="col-span-2 lg:col-span-1 bg-white p-5 rounded-3xl border border-[#EAE4DD] shadow-xs flex flex-col justify-between space-y-2 hover:border-[#D48D80]/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#7D756D] uppercase tracking-wider">Cancelados</span>
            <div className="w-8 h-8 rounded-xl bg-[#FDEAE8] text-[#C93B2B] flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#C93B2B]">{todayCancelledCount}</div>
            <p className="text-[11px] text-[#A8A099] mt-0.5">horários liberados</p>
          </div>
        </div>
      </div>

      {/* Main Bento Structure: Today's Schedule & Tomorrow's WhatsApp Confirmations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Appointments List (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-[#EAE4DD] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F0EAE4] pb-3.5">
            <div>
              <h3 className="font-['Playfair_Display',serif] text-xl font-bold text-[#2D2926] flex items-center gap-2">
                <span>Agenda de Atendimentos</span>
                <span className="text-xs font-normal text-[#8E5D52] bg-[#F7F2EE] px-2.5 py-0.5 rounded-full border border-[#EAE4DD]">
                  {todayAppointments.length} hoje
                </span>
              </h3>
              <p className="text-xs text-[#7D756D] mt-0.5">
                Clique em qualquer horário para ver detalhes, registrar pagamento ou alterar status
              </p>
            </div>

            <button
              onClick={() => setAdminTab('calendar')}
              className="text-xs text-[#8E5D52] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Ver Calendário</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {todayAppointments.length === 0 ? (
            <div className="text-center py-12 text-[#A8A099] space-y-2">
              <div className="w-12 h-12 bg-[#F7F2EE] text-[#8E5D52] rounded-2xl flex items-center justify-center mx-auto">
                <Calendar className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-[#7D756D]">Nenhum atendimento marcado para hoje.</p>
              <button
                onClick={() => setIsManualModalOpen(true)}
                className="text-xs text-[#8E5D52] font-bold hover:underline cursor-pointer"
              >
                + Cadastrar agendamento agora
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#F5EFE9]">
              {todayAppointments.map((apt) => {
                const endTime = addMinutesToTime(apt.time, apt.durationMinutes);
                return (
                  <div
                    key={apt.id}
                    id={`dashboard-apt-${apt.id}`}
                    onClick={() => setSelectedAppointment(apt)}
                    className="py-4 px-2 hover:bg-[#FDFBF9] rounded-2xl transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    {/* Time & Client */}
                    <div className="flex items-start gap-3.5">
                      <div className="text-center bg-[#F7F2EE] group-hover:bg-[#EAE4DD] rounded-2xl px-3.5 py-2 shrink-0 border border-[#EAE4DD] transition-colors">
                        <span className="text-sm font-extrabold text-[#2D2926] block">{apt.time}</span>
                        <span className="text-[10px] text-[#7D756D] font-medium block">até {endTime}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-[#2D2926] text-sm">{apt.clientName}</h4>
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            apt.status === 'confirmado' ? 'bg-[#EAF5EC] text-[#2F7D48] border-[#C2E4C9]' :
                            apt.status === 'pendente' ? 'bg-[#FFF6E5] text-[#B87A00] border-[#FBE3B5]' :
                            apt.status === 'concluido' ? 'bg-[#EBF2FC] text-[#285EA8] border-[#BED6F7]' :
                            apt.status === 'cancelado' ? 'bg-[#FDEAE8] text-[#C93B2B] border-[#F7C5C0]' :
                            'bg-[#F0ECE7] text-[#6E665E] border-[#DED7CF]'
                          }`}>
                            {apt.status.toUpperCase()}
                          </span>
                        </div>

                        <p className="text-xs text-[#8E5D52] font-semibold">
                          {apt.procedureName} ({formatTimeFriendly(apt.durationMinutes)})
                        </p>

                        <p className="text-[11px] text-[#A8A099] flex items-center gap-1.5">
                          <Phone className="w-3 h-3 text-[#A8A099]" />
                          <span>{apt.clientPhone}</span>
                          {apt.clientNotes && (
                            <span className="italic text-[#7D756D]">• "{apt.clientNotes}"</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F5EFE9]">
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-[#2D2926] block">
                          {formatCurrency(apt.finalPrice || apt.price)}
                        </span>
                        <span className="text-[10px] font-semibold block text-[#7D756D]">
                          {apt.isPaid ? '✅ Pago' : '⏳ A pagar'}
                        </span>
                      </div>

                      {apt.status === 'pendente' && (
                        <button
                          onClick={(e) => handleQuickConfirm(apt, e)}
                          className="px-3 py-1.5 bg-[#2F7D48] hover:bg-[#256639] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                          title="Confirmar atendimento"
                        >
                          Confirmar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: WhatsApp Confirmations for Tomorrow (PRD Section 12) */}
        <div className="bg-white rounded-3xl border border-[#EAE4DD] p-6 shadow-xs space-y-4">
          <div className="border-b border-[#F0EAE4] pb-3.5">
            <h3 className="font-['Playfair_Display',serif] text-xl font-bold text-[#2D2926] flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-[#2F7D48]" />
              <span>Confirmar Amanhã</span>
            </h3>
            <p className="text-xs text-[#7D756D] mt-0.5">
              Notifique as clientes com horário marcado para amanhã ({formatDateBR(tomorrow)})
            </p>
          </div>

          {tomorrowAppointments.length === 0 ? (
            <div className="text-center py-10 text-[#A8A099] space-y-1">
              <p className="text-xs font-medium">Nenhum agendamento para amanhã até o momento.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tomorrowAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="p-4 bg-[#FDFBF9] border border-[#EAE4DD] rounded-2xl space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-[#2D2926] text-sm">
                        {apt.time} — {apt.clientName}
                      </div>
                      <p className="text-[#8E5D52] font-semibold text-xs mt-0.5">
                        💄 {apt.procedureName}
                      </p>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      apt.reminderSent
                        ? 'bg-[#EAF5EC] text-[#2F7D48]'
                        : 'bg-[#FFF6E5] text-[#B87A00]'
                    }`}>
                      {apt.reminderSent ? 'Enviado' : 'A Enviar'}
                    </span>
                  </div>

                  <div className="pt-1 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-[#7D756D]">{apt.clientPhone}</span>

                    <button
                      id={`send-whatsapp-confirm-${apt.id}`}
                      onClick={(e) => handleSendReminder(apt, e)}
                      className="px-3.5 py-2 bg-[#2F7D48] hover:bg-[#256639] text-white font-bold text-[11px] rounded-xl transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>{apt.reminderSent ? 'Reenviar' : 'ENVIAR WHATSAPP'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Appointment Details Modal */}
      <AppointmentDetailsModal
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
      />

      <NewManualAppointmentModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
      />
    </div>
  );
};
