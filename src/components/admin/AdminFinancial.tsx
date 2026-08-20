import React, { useState, useMemo } from 'react';
import { useSalon } from '../../context/SalonContext';
import { Appointment, PaymentMethod } from '../../types';
import {
  formatCurrency,
  formatDateBR,
  getTodayDateStr,
} from '../../utils/dateUtils';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  Clock,
  Filter,
  Calendar,
  Sparkles,
  ArrowUpRight,
  PieChart
} from 'lucide-react';
import { AppointmentDetailsModal } from './AppointmentDetailsModal';

type PeriodFilter = 'today' | 'week' | 'month' | 'all';

export const AdminFinancial: React.FC = () => {
  const { appointments, updateAppointmentPayment } = useSalon();
  const [period, setPeriod] = useState<PeriodFilter>('month');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const todayStr = getTodayDateStr();

  // Helper date filters
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const startOfWeekStr = startOfWeek.toISOString().slice(0, 10);

  const startOfMonthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;

  // Filtered appointments for table
  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      if (a.status === 'cancelado') return false;
      if (period === 'today') return a.date === todayStr;
      if (period === 'week') return a.date >= startOfWeekStr;
      if (period === 'month') return a.date >= startOfMonthStr;
      return true;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [appointments, period, todayStr, startOfWeekStr, startOfMonthStr]);

  // Overall Financial KPIs (PRD Section 14)
  const revenueToday = useMemo(() => {
    return appointments
      .filter((a) => a.date === todayStr && (a.status === 'concluido' || a.isPaid))
      .reduce((sum, a) => sum + (a.finalPrice || a.price), 0);
  }, [appointments, todayStr]);

  const revenueWeek = useMemo(() => {
    return appointments
      .filter((a) => a.date >= startOfWeekStr && (a.status === 'concluido' || a.isPaid))
      .reduce((sum, a) => sum + (a.finalPrice || a.price), 0);
  }, [appointments, startOfWeekStr]);

  const revenueMonth = useMemo(() => {
    return appointments
      .filter((a) => a.date >= startOfMonthStr && (a.status === 'concluido' || a.isPaid))
      .reduce((sum, a) => sum + (a.finalPrice || a.price), 0);
  }, [appointments, startOfMonthStr]);

  const totalCompletedAppointments = useMemo(() => {
    return appointments.filter((a) => a.status === 'concluido' || a.isPaid).length;
  }, [appointments]);

  // Payment methods breakdown (PRD Section 16)
  const paymentMethodsSummary = useMemo(() => {
    const summary: Record<string, { count: number; total: number }> = {
      pix: { count: 0, total: 0 },
      credito: { count: 0, total: 0 },
      debito: { count: 0, total: 0 },
      dinheiro: { count: 0, total: 0 },
      outro: { count: 0, total: 0 },
    };

    filteredAppointments.forEach((a) => {
      if (a.isPaid || a.status === 'concluido') {
        const method = a.paymentMethod || 'outro';
        if (!summary[method]) summary[method] = { count: 0, total: 0 };
        summary[method].count += 1;
        summary[method].total += a.finalPrice || a.price;
      }
    });

    return summary;
  }, [filteredAppointments]);

  const handleTogglePaid = (apt: Appointment, e: React.MouseEvent) => {
    e.stopPropagation();
    updateAppointmentPayment(apt.id, !apt.isPaid, apt.paymentMethod || 'pix');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#EAE4DD] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-['Playfair_Display',serif] text-xl font-bold text-[#2D2926] flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#2F7D48]" />
            <span>Painel de Faturamento & Financeiro</span>
          </h2>
          <p className="text-xs text-[#7D756D] mt-1">
            Acompanhe a receita, pagamentos recebidos e métodos de pagamento
          </p>
        </div>

        {/* Period Selector Filter */}
        <div className="bg-[#FDFBF9] p-1.5 rounded-2xl border border-[#EAE4DD] flex gap-1 self-start sm:self-auto">
          <button
            onClick={() => setPeriod('today')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              period === 'today' ? 'bg-[#8E5D52] text-white shadow-xs' : 'text-[#7D756D] hover:text-[#2D2926]'
            }`}
          >
            Hoje
          </button>
          <button
            onClick={() => setPeriod('week')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              period === 'week' ? 'bg-[#8E5D52] text-white shadow-xs' : 'text-[#7D756D] hover:text-[#2D2926]'
            }`}
          >
            Semana
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              period === 'month' ? 'bg-[#8E5D52] text-white shadow-xs' : 'text-[#7D756D] hover:text-[#2D2926]'
            }`}
          >
            Mês
          </button>
          <button
            onClick={() => setPeriod('all')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              period === 'all' ? 'bg-[#8E5D52] text-white shadow-xs' : 'text-[#7D756D] hover:text-[#2D2926]'
            }`}
          >
            Todos
          </button>
        </div>
      </div>

      {/* KPI Cards (PRD Section 14) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Hoje */}
        <div className="bg-white p-5 rounded-3xl border border-[#EAE4DD] shadow-xs space-y-2">
          <span className="text-[11px] font-bold text-[#7D756D] uppercase tracking-wider block">Faturamento Hoje</span>
          <div className="text-xl sm:text-2xl font-extrabold text-[#2D2926]">
            {formatCurrency(revenueToday)}
          </div>
          <span className="text-[11px] text-[#2F7D48] font-bold flex items-center gap-0.5">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Recebido hoje</span>
          </span>
        </div>

        {/* Semana */}
        <div className="bg-white p-5 rounded-3xl border border-[#EAE4DD] shadow-xs space-y-2">
          <span className="text-[11px] font-bold text-[#7D756D] uppercase tracking-wider block">Faturamento Semana</span>
          <div className="text-xl sm:text-2xl font-extrabold text-[#2D2926]">
            {formatCurrency(revenueWeek)}
          </div>
          <span className="text-[11px] text-[#7D756D]">Esta semana</span>
        </div>

        {/* Mês */}
        <div className="bg-white p-5 rounded-3xl border border-[#EAE4DD] shadow-xs space-y-2">
          <span className="text-[11px] font-bold text-[#7D756D] uppercase tracking-wider block">Faturamento do Mês</span>
          <div className="text-xl sm:text-2xl font-extrabold text-[#2F7D48]">
            {formatCurrency(revenueMonth)}
          </div>
          <span className="text-[11px] text-[#7D756D]">Mês atual</span>
        </div>

        {/* Atendimentos Realizados */}
        <div className="bg-white p-5 rounded-3xl border border-[#EAE4DD] shadow-xs space-y-2">
          <span className="text-[11px] font-bold text-[#7D756D] uppercase tracking-wider block">Atendimentos Concluídos</span>
          <div className="text-xl sm:text-2xl font-extrabold text-[#2D2926]">
            {totalCompletedAppointments}
          </div>
          <span className="text-[11px] text-[#7D756D]">serviços finalizados</span>
        </div>
      </div>

      {/* Payment Methods Breakdown & Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Methods Cards */}
        <div className="bg-white rounded-3xl border border-[#EAE4DD] p-6 shadow-xs space-y-4">
          <h3 className="font-['Playfair_Display',serif] text-base font-bold text-[#2D2926] flex items-center gap-2 border-b border-[#F5F2ED] pb-3">
            <CreditCard className="w-4 h-4 text-[#8E5D52]" />
            <span>Formas de Pagamento ({period.toUpperCase()})</span>
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="p-3.5 bg-[#EAF5EC] rounded-2xl border border-[#D8EEDD] flex items-center justify-between">
              <div>
                <span className="font-bold text-[#1D4F2C] block">⚡ Pix</span>
                <span className="text-[#2F7D48] text-[11px]">{paymentMethodsSummary.pix.count} recebimentos</span>
              </div>
              <span className="font-extrabold text-[#1D4F2C] text-sm">
                {formatCurrency(paymentMethodsSummary.pix.total)}
              </span>
            </div>

            <div className="p-3.5 bg-[#EBF3FB] rounded-2xl border border-[#D5E6F7] flex items-center justify-between">
              <div>
                <span className="font-bold text-[#1B3F63] block">💳 Cartão de Crédito</span>
                <span className="text-[#2C689F] text-[11px]">{paymentMethodsSummary.credito.count} recebimentos</span>
              </div>
              <span className="font-extrabold text-[#1B3F63] text-sm">
                {formatCurrency(paymentMethodsSummary.credito.total)}
              </span>
            </div>

            <div className="p-3.5 bg-[#F0F5FA] rounded-2xl border border-[#DCE7F2] flex items-center justify-between">
              <div>
                <span className="font-bold text-[#204360] block">💳 Cartão de Débito</span>
                <span className="text-[#366B95] text-[11px]">{paymentMethodsSummary.debito.count} recebimentos</span>
              </div>
              <span className="font-extrabold text-[#204360] text-sm">
                {formatCurrency(paymentMethodsSummary.debito.total)}
              </span>
            </div>

            <div className="p-3.5 bg-[#FEF6EC] rounded-2xl border border-[#FCE6CE] flex items-center justify-between">
              <div>
                <span className="font-bold text-[#6D4213] block">💵 Dinheiro</span>
                <span className="text-[#965E21] text-[11px]">{paymentMethodsSummary.dinheiro.count} recebimentos</span>
              </div>
              <span className="font-extrabold text-[#6D4213] text-sm">
                {formatCurrency(paymentMethodsSummary.dinheiro.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Transactions List (PRD Section 16) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-[#EAE4DD] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F5F2ED] pb-3">
            <h3 className="font-['Playfair_Display',serif] text-base font-bold text-[#2D2926]">
              Extrato de Atendimentos ({filteredAppointments.length})
            </h3>
            <span className="text-xs text-[#7D756D]">Clique para editar valores e pagamento</span>
          </div>

          <div className="divide-y divide-[#F5F2ED] max-h-[420px] overflow-y-auto">
            {filteredAppointments.length === 0 ? (
              <p className="text-xs text-[#7D756D] text-center py-10">Nenhuma transação encontrada no período.</p>
            ) : (
              filteredAppointments.map((apt) => (
                <div
                  key={apt.id}
                  onClick={() => setSelectedAppointment(apt)}
                  className="py-3 px-3 hover:bg-[#FDFBF9] rounded-2xl transition-colors cursor-pointer flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#2D2926]">{apt.clientName}</span>
                      <span className="text-[#7D756D]">• {formatDateBR(apt.date)}</span>
                    </div>
                    <p className="text-[#8E5D52] font-semibold">{apt.procedureName}</p>
                    <p className="text-[#7D756D] text-[11px]">
                      Método: {apt.paymentMethod ? apt.paymentMethod.toUpperCase() : 'Não informado'}
                      {apt.discount > 0 && ` (Desconto: ${formatCurrency(apt.discount)})`}
                    </p>
                  </div>

                  <div className="text-right flex items-center gap-3">
                    <div>
                      <span className="font-extrabold text-[#2D2926] text-sm block">
                        {formatCurrency(apt.finalPrice || apt.price)}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        apt.isPaid ? 'bg-[#EAF5EC] text-[#2F7D48]' : 'bg-[#FEF6EC] text-[#965E21]'
                      }`}>
                        {apt.isPaid ? 'Pago' : 'Pendente'}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleTogglePaid(apt, e)}
                      className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                        apt.isPaid
                          ? 'bg-[#EAF5EC] text-[#2F7D48] border-[#D8EEDD] hover:bg-[#D8EEDD]'
                          : 'bg-[#FDFBF9] text-[#7D756D] border-[#EAE4DD] hover:bg-[#EAE4DD]'
                      }`}
                      title={apt.isPaid ? 'Marcar como não pago' : 'Marcar como pago'}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Appointment Details Modal */}
      <AppointmentDetailsModal
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
      />
    </div>
  );
};
