import React, { useState } from 'react';
import { useSalon } from '../../context/SalonContext';
import { Appointment, AppointmentStatus, PaymentMethod } from '../../types';
import {
  formatDateBR,
  formatCurrency,
  formatTimeFriendly,
  getRelativeDayLabel,
  addMinutesToTime,
} from '../../utils/dateUtils';
import {
  buildWhatsAppReminderUrl,
  buildWhatsAppDirectContactUrl,
} from '../../utils/whatsappUtils';
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  Edit2,
  Trash2,
  Check,
  Send,
  Sparkles,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import {
  syncAppointmentToGoogleCalendar,
  getCachedToken,
  requestGoogleCalendarAuth
} from '../../services/googleCalendarService';

interface AppointmentDetailsModalProps {
  appointment: Appointment | null;
  onClose: () => void;
}

const STATUS_OPTIONS: { label: string; value: AppointmentStatus; colorClass: string; icon: string }[] = [
  { label: 'Pendente', value: 'pendente', colorClass: 'bg-amber-100 text-amber-800 border-amber-300', icon: '🟡' },
  { label: 'Confirmado', value: 'confirmado', colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: '🟢' },
  { label: 'Concluído', value: 'concluido', colorClass: 'bg-blue-100 text-blue-800 border-blue-300', icon: '🔵' },
  { label: 'Cancelado', value: 'cancelado', colorClass: 'bg-red-100 text-red-800 border-red-300', icon: '🔴' },
  { label: 'Faltou', value: 'faltou', colorClass: 'bg-stone-200 text-stone-800 border-stone-400', icon: '⚫' },
];

const PAYMENT_METHODS: { label: string; value: PaymentMethod }[] = [
  { label: 'Pix', value: 'pix' },
  { label: 'Dinheiro', value: 'dinheiro' },
  { label: 'Cartão de Débito', value: 'debito' },
  { label: 'Cartão de Crédito', value: 'credito' },
  { label: 'Outro', value: 'outro' },
];

export const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  appointment: initialAppointment,
  onClose,
}) => {
  const {
    config,
    appointments,
    updateAppointmentStatus,
    updateAppointmentPayment,
    updateAppointmentDetails,
    markReminderSent,
  } = useSalon();

  // Always resolve the live, updated appointment instance from context state
  const liveAppointment = appointments.find((a) => a.id === initialAppointment?.id) || initialAppointment;

  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(liveAppointment?.paymentMethod || 'pix');
  const [isPaid, setIsPaid] = useState<boolean>(liveAppointment?.isPaid || false);
  const [discount, setDiscount] = useState<string>(String(liveAppointment?.discount || '0'));
  const [notes, setNotes] = useState<string>(liveAppointment?.clientNotes || '');
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editDate, setEditDate] = useState(liveAppointment?.date || '');
  const [editTime, setEditTime] = useState(liveAppointment?.time || '');
  const [errorMsg, setErrorMsg] = useState('');
  const [calendarSyncing, setCalendarSyncing] = useState(false);
  const [calendarSuccessMsg, setCalendarSuccessMsg] = useState('');

  if (!liveAppointment) return null;
  const appointment = liveAppointment;

  const endTime = addMinutesToTime(appointment.time, appointment.durationMinutes);
  const whatsappReminderUrl = buildWhatsAppReminderUrl(appointment, config);
  const whatsappChatUrl = buildWhatsAppDirectContactUrl(appointment.clientPhone);

  const handleStatusChange = async (newStatus: AppointmentStatus) => {
    updateAppointmentStatus(appointment.id, newStatus);

    // Auto sync to Google Calendar if enabled in settings and status is confirmed or completed
    if (
      config.googleCalendar?.enabled &&
      config.googleCalendar?.autoSyncConfirmed &&
      (newStatus === 'confirmado' || newStatus === 'concluido')
    ) {
      try {
        const res = await syncAppointmentToGoogleCalendar({ ...appointment, status: newStatus }, config);
        if (res.eventId && res.eventId !== appointment.googleCalendarEventId) {
          updateAppointmentDetails(appointment.id, { googleCalendarEventId: res.eventId });
        }
      } catch (e) {
        console.warn('Auto Google Calendar sync skipped/error:', e);
      }
    }
  };

  const handleManualCalendarSync = async () => {
    setCalendarSyncing(true);
    setCalendarSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await syncAppointmentToGoogleCalendar(appointment, config);
      if (res.eventId && res.eventId !== appointment.googleCalendarEventId) {
        updateAppointmentDetails(appointment.id, { googleCalendarEventId: res.eventId });
      }
      setCalendarSuccessMsg('Evento sincronizado com sucesso no Google Calendar!');
      setTimeout(() => setCalendarSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao sincronizar com o Google Calendar.');
    } finally {
      setCalendarSyncing(false);
    }
  };

  const handleSavePayment = () => {
    const discountNum = parseFloat(discount) || 0;
    const finalPrice = Math.max(0, appointment.price - discountNum);
    updateAppointmentPayment(appointment.id, isPaid, selectedMethod, discountNum, finalPrice);
    setIsEditingPayment(false);
  };

  const handleSendReminder = () => {
    markReminderSent(appointment.id);
    window.open(whatsappReminderUrl, '_blank');
  };

  const handleSaveReschedule = () => {
    if (!editDate || !editTime) {
      setErrorMsg('Data e horário são obrigatórios.');
      return;
    }
    const res = updateAppointmentDetails(appointment.id, {
      date: editDate,
      time: editTime,
      clientNotes: notes,
    });
    if (!res.success) {
      setErrorMsg(res.error || 'Horário indisponível.');
      return;
    }
    setIsEditingTime(false);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#EAE4DD] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EAE4DD] flex items-center justify-between bg-[#FDFBF9]">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-['Playfair_Display',serif] font-bold text-lg text-[#2D2926]">
                Detalhes do Atendimento
              </h3>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                STATUS_OPTIONS.find((s) => s.value === appointment.status)?.colorClass
              }`}>
                {STATUS_OPTIONS.find((s) => s.value === appointment.status)?.label}
              </span>
            </div>
            <p className="text-xs text-[#7D756D] mt-0.5">
              Origem: {appointment.source === 'online' ? '🌐 Site Online' : appointment.source === 'whatsapp' ? '💬 WhatsApp' : '🏢 Presencial'}
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
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {errorMsg && (
            <div className="p-3.5 bg-[#FDEAE8] border border-[#F7C5C0] rounded-2xl flex items-center gap-2 text-[#C93B2B] text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-[#C93B2B] shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Client Details & Quick WhatsApp Contact */}
          <div className="bg-[#FDFBF9] rounded-2xl p-4 border border-[#EAE4DD] flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[#7D756D] uppercase tracking-wider block">
                Cliente
              </span>
              <h4 className="font-bold text-base text-[#2D2926]">{appointment.clientName}</h4>
              <p className="text-xs text-[#59524C] flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#8E5D52]" />
                <span>{appointment.clientPhone}</span>
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <a
                href={whatsappChatUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 bg-[#EAF5EC] text-[#2F7D48] hover:bg-[#DDF0E0] border border-[#C2E4C9] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Abrir conversa no WhatsApp"
              >
                <MessageCircle className="w-4 h-4 text-[#2F7D48]" />
                <span>Conversar</span>
              </a>
            </div>
          </div>

          {/* WhatsApp 1-Click Confirmation Reminder (PRD section 12) */}
          <div className="p-4 bg-[#EAF5EC] rounded-2xl border border-[#C2E4C9] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-[#1B4D2C] flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-[#2F7D48]" />
                Confirmação por WhatsApp
              </p>
              <p className="text-[11px] text-[#2F7D48] mt-0.5">
                {appointment.reminderSent
                  ? '✅ Lembrete já foi enviado para a cliente.'
                  : 'Envie mensagem pré-pronta com 1 clique para confirmar o atendimento.'}
              </p>
            </div>

            <button
              onClick={handleSendReminder}
              className="px-3.5 py-2 bg-[#2F7D48] hover:bg-[#25683B] text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-white" />
              <span>{appointment.reminderSent ? 'Reenviar Lembrete' : 'Enviar Confirmação'}</span>
            </button>
          </div>

          {/* Google Calendar 1-Click Sync Card */}
          <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-blue-700" />
                <span className="text-xs font-bold text-blue-900">Google Calendar</span>
                {appointment.googleCalendarEventId ? (
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full border border-blue-200">
                    Sincronizado ✓
                  </span>
                ) : (
                  <span className="text-[10px] bg-stone-100 text-stone-600 font-medium px-2 py-0.5 rounded-full">
                    Pendente
                  </span>
                )}
              </div>
              <p className="text-[11px] text-blue-800/80">
                {calendarSuccessMsg || (appointment.googleCalendarEventId
                  ? 'Evento registrado no seu Google Calendar com alertas.'
                  : 'Sincronize este horário com a sua agenda do Google.')}
              </p>
            </div>

            <button
              type="button"
              id="sync-single-modal-appointment-btn"
              onClick={handleManualCalendarSync}
              disabled={calendarSyncing}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${calendarSyncing ? 'animate-spin' : ''}`} />
              <span>{calendarSyncing ? 'Sincronizando...' : appointment.googleCalendarEventId ? 'Atualizar no Google' : 'Enviar p/ Google Calendar'}</span>
            </button>
          </div>

          {/* Schedule info & Reschedule */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#2D2926] uppercase tracking-wider">
                Procedimento & Horário
              </span>
              <button
                onClick={() => setIsEditingTime(!isEditingTime)}
                className="text-xs text-[#8E5D52] hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>{isEditingTime ? 'Cancelar Edição' : 'Remarcar / Alterar'}</span>
              </button>
            </div>

            {!isEditingTime ? (
              <div className="p-4 bg-[#FDFBF9] rounded-2xl border border-[#EAE4DD] space-y-2.5 text-xs">
                <div>
                  <span className="text-[#7D756D] block mb-1">
                    {appointment.procedures && appointment.procedures.length > 1
                      ? `Procedimentos Selecionados (${appointment.procedures.length}):`
                      : 'Procedimento:'}
                  </span>
                  {appointment.procedures && appointment.procedures.length > 1 ? (
                    <div className="space-y-1.5 pl-1">
                      {appointment.procedures.map((p, idx) => (
                        <div key={p.id || idx} className="flex justify-between items-center bg-white p-2 rounded-xl border border-[#EAE4DD]">
                          <span className="font-bold text-[#2D2926]">
                            {p.name}{' '}
                            <span className="text-[#7D756D] font-normal text-[11px]">
                              ({formatTimeFriendly(p.durationMinutes)})
                            </span>
                          </span>
                          <span className="font-semibold text-[#8E5D52]">
                            {formatCurrency(p.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="font-bold text-[#2D2926] text-sm">{appointment.procedureName}</span>
                  )}
                </div>
                <div className="flex justify-between pt-1 border-t border-[#F0EAE4]">
                  <span className="text-[#7D756D]">Data:</span>
                  <span className="font-bold text-[#2D2926]">
                    {formatDateBR(appointment.date)} ({getRelativeDayLabel(appointment.date)})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7D756D]">Horário Contínuo:</span>
                  <span className="font-bold text-[#2D2926]">
                    {appointment.time} até {endTime} ({formatTimeFriendly(appointment.durationMinutes)})
                  </span>
                </div>
                {appointment.clientNotes && (
                  <div className="pt-2 border-t border-[#F0EAE4] text-[#59524C] italic">
                    "{appointment.clientNotes}"
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-[#FDFBF9] rounded-2xl border border-[#EAE4DD] space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-[#2D2926] mb-1">Nova Data</label>
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#EAE4DD] rounded-xl text-xs text-[#2D2926]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#2D2926] mb-1">Novo Horário</label>
                    <input
                      type="time"
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#EAE4DD] rounded-xl text-xs text-[#2D2926]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#2D2926] mb-1">Observações</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#EAE4DD] rounded-xl text-xs text-[#2D2926]"
                  />
                </div>

                <button
                  onClick={handleSaveReschedule}
                  className="w-full py-2.5 bg-[#8E5D52] hover:bg-[#784D43] text-white font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            )}
          </div>

          {/* Status Quick Buttons */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#2D2926] uppercase tracking-wider block">
              Alterar Status
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleStatusChange(opt.value)}
                  className={`py-2 px-1 rounded-2xl text-[11px] font-bold border transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                    appointment.status === opt.value
                      ? `${opt.colorClass} shadow-xs ring-2 ring-[#8E5D52]/40`
                      : 'bg-[#FDFBF9] text-[#7D756D] border-[#EAE4DD] hover:bg-[#F5F2ED]'
                  }`}
                >
                  <span>{opt.icon}</span>
                  <span className="truncate">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Payment & Financial control */}
          <div className="space-y-3 pt-2 border-t border-[#F0EAE4]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#2D2926] uppercase tracking-wider">
                Pagamento & Financeiro
              </span>
              <button
                onClick={() => setIsEditingPayment(!isEditingPayment)}
                className="text-xs text-[#8E5D52] hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>{isEditingPayment ? 'Fechar' : 'Editar Pagamento'}</span>
              </button>
            </div>

            {!isEditingPayment ? (
              <div className="p-4 bg-[#FDFBF9] rounded-2xl border border-[#EAE4DD] flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#7D756D]">Valor Final:</span>
                    <span className="font-extrabold text-[#2D2926] text-sm">
                      {formatCurrency(appointment.finalPrice || appointment.price)}
                    </span>
                    {appointment.discount > 0 && (
                      <span className="text-[10px] text-[#2F7D48] font-semibold bg-[#EAF5EC] px-1.5 py-0.5 rounded">
                        - {formatCurrency(appointment.discount)} desc.
                      </span>
                    )}
                  </div>
                  <div className="text-[#7D756D] mt-1">
                    Método: <strong>{appointment.paymentMethod ? appointment.paymentMethod.toUpperCase() : 'Não informado'}</strong>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    appointment.isPaid
                      ? 'bg-[#EAF5EC] text-[#2F7D48] border border-[#C2E4C9]'
                      : 'bg-[#FFF9E6] text-[#8C6D1F] border border-[#F2E0AA]'
                  }`}>
                    {appointment.isPaid ? '✅ Pago' : '⏳ Em aberto'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-[#FDFBF9] rounded-2xl border border-[#EAE4DD] space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-[#2D2926] mb-1">Desconto (R$)</label>
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#EAE4DD] rounded-xl text-xs text-[#2D2926]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#2D2926] mb-1">Forma de Pagamento</label>
                    <select
                      value={selectedMethod}
                      onChange={(e) => setSelectedMethod(e.target.value as PaymentMethod)}
                      className="w-full px-3 py-2 bg-white border border-[#EAE4DD] rounded-xl text-xs text-[#2D2926]"
                    >
                      {PAYMENT_METHODS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="paid-checkbox"
                    checked={isPaid}
                    onChange={(e) => setIsPaid(e.target.checked)}
                    className="w-4 h-4 text-[#8E5D52] rounded border-[#EAE4DD] focus:ring-[#8E5D52]"
                  />
                  <label htmlFor="paid-checkbox" className="font-bold text-[#2D2926] text-xs cursor-pointer">
                    Marcar como atendimento já pago
                  </label>
                </div>

                <button
                  onClick={handleSavePayment}
                  className="w-full py-2.5 bg-[#2F7D48] hover:bg-[#25683B] text-white font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Salvar Dados Financeiros
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#EAE4DD] bg-[#FDFBF9] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#2D2926] hover:bg-[#1A1816] text-white font-bold text-xs rounded-2xl transition-colors cursor-pointer"
          >
            Fechar Detalhes
          </button>
        </div>
      </div>
    </div>
  );
};
