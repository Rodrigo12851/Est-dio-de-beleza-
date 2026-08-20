import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Appointment } from '../../types';
import { formatDateBR, formatTimeFriendly } from '../../utils/dateUtils';
import { notificationSound } from '../../utils/audioNotification';
import { Bell, Volume2, X, Calendar, User, Phone, CheckCircle2, MessageCircle } from 'lucide-react';

interface AppointmentNotificationBannerProps {
  appointment: Appointment | null;
  onClose: () => void;
  onViewAppointment?: (appointment: Appointment) => void;
}

export const AppointmentNotificationBanner: React.FC<AppointmentNotificationBannerProps> = ({
  appointment,
  onClose,
  onViewAppointment,
}) => {
  useEffect(() => {
    if (appointment) {
      const timer = setTimeout(() => {
        onClose();
      }, 12000); // 12 seconds auto-hide
      return () => clearTimeout(timer);
    }
  }, [appointment, onClose]);

  if (!appointment) return null;

  const handleReplay = (e: React.MouseEvent) => {
    e.stopPropagation();
    notificationSound.playBookingRingtone();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -30, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="fixed top-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-[#231F1C] text-white rounded-3xl p-4 sm:p-5 shadow-2xl border border-[#4D443D] backdrop-blur-md"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-2xl bg-[#8E5D52] flex items-center justify-center text-white shrink-0 shadow-xs animate-bounce">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#231F1C]" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-[#D48D80] uppercase tracking-wider bg-[#8E5D52]/30 px-2 py-0.5 rounded-full border border-[#8E5D52]/40">
                  Novo Agendamento!
                </span>
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Recebido agora</span>
                </span>
              </div>
              <h4 className="font-bold text-sm text-white mt-0.5">
                {appointment.clientName}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleReplay}
              title="Tocar som novamente"
              className="p-1.5 text-[#D8D2CB] hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <Volume2 className="w-4 h-4 text-emerald-400" />
            </button>
            <button
              onClick={onClose}
              title="Fechar notificação"
              className="p-1.5 text-[#A8A099] hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Appointment snippet */}
        <div className="mt-3 p-3 bg-white/5 rounded-2xl border border-white/10 space-y-1.5 text-xs text-[#D8D2CB]">
          <div className="flex items-center justify-between font-semibold text-white">
            <span>{appointment.procedureName}</span>
            <span className="text-emerald-400">R$ {appointment.finalPrice.toFixed(2).replace('.', ',')}</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-[#A8A099]">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#D48D80]" />
              {formatDateBR(appointment.date)} às {appointment.time}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-[#A8A099]" />
              {appointment.clientPhone}
            </span>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={handleReplay}
            className="text-[11px] text-[#D8D2CB] hover:text-white flex items-center gap-1 font-medium cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Tocou no celular</span>
          </button>

          {onViewAppointment && (
            <button
              type="button"
              onClick={() => {
                onViewAppointment(appointment);
                onClose();
              }}
              className="px-3 py-1.5 bg-[#8E5D52] hover:bg-[#784D43] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Ver Detalhes
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
