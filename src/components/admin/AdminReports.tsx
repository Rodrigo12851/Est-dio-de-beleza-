import React, { useMemo } from 'react';
import { useSalon } from '../../context/SalonContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { formatCurrency, formatDateBR } from '../../utils/dateUtils';
import {
  TrendingUp,
  Award,
  Users,
  CalendarCheck,
  Percent,
  Sparkles,
  PieChart as PieChartIcon
} from 'lucide-react';

const STATUS_CHART_COLORS = ['#3B749E', '#2F7D48', '#C98B2B', '#C93B2B', '#7D756D'];

export const AdminReports: React.FC = () => {
  const { appointments, procedures, clients } = useSalon();

  // 1. Procedimentos mais realizados & que mais faturaram
  const procedureStats = useMemo(() => {
    const map: Record<string, { name: string; count: number; revenue: number; category: string }> = {};

    procedures.forEach((p) => {
      map[p.name] = { name: p.name, count: 0, revenue: 0, category: p.category };
    });

    appointments.forEach((a) => {
      if (a.status !== 'cancelado') {
        if (a.procedures && a.procedures.length > 0) {
          a.procedures.forEach((pItem) => {
            if (!map[pItem.name]) {
              map[pItem.name] = { name: pItem.name, count: 0, revenue: 0, category: pItem.category || 'Outros' };
            }
            map[pItem.name].count += 1;
            if (a.status === 'concluido' || a.isPaid) {
              map[pItem.name].revenue += pItem.price || 0;
            }
          });
        } else {
          if (!map[a.procedureName]) {
            map[a.procedureName] = { name: a.procedureName, count: 0, revenue: 0, category: a.procedureCategory || 'Outros' };
          }
          map[a.procedureName].count += 1;
          if (a.status === 'concluido' || a.isPaid) {
            map[a.procedureName].revenue += a.finalPrice || a.price;
          }
        }
      }
    });

    const list = Object.values(map);
    const topByCount = [...list].sort((a, b) => b.count - a.count);
    const topByRevenue = [...list].sort((a, b) => b.revenue - a.revenue);

    return { topByCount, topByRevenue, chartData: topByCount.slice(0, 6) };
  }, [appointments, procedures]);

  // 2. Status dos agendamentos
  const statusStats = useMemo(() => {
    const counts = {
      concluido: 0,
      confirmado: 0,
      pendente: 0,
      cancelado: 0,
      faltou: 0,
    };

    appointments.forEach((a) => {
      if (counts[a.status] !== undefined) {
        counts[a.status] += 1;
      }
    });

    return [
      { name: 'Concluídos', value: counts.concluido, color: '#3B749E' },
      { name: 'Confirmados', value: counts.confirmado, color: '#2F7D48' },
      { name: 'Pendentes', value: counts.pendente, color: '#C98B2B' },
      { name: 'Cancelados', value: counts.cancelado, color: '#C93B2B' },
      { name: 'Faltas', value: counts.faltou, color: '#7D756D' },
    ].filter((s) => s.value > 0);
  }, [appointments]);

  // 3. Cliente metrics (Novas vs Recorrentes)
  const clientRetention = useMemo(() => {
    const totalClients = clients.length;
    let recurrentCount = 0;
    let newCount = 0;

    clients.forEach((c) => {
      const clientApts = appointments.filter((a) => a.clientName.toLowerCase() === c.name.toLowerCase());
      if (clientApts.length > 1) {
        recurrentCount += 1;
      } else {
        newCount += 1;
      }
    });

    const recurrenceRate = totalClients > 0 ? Math.round((recurrentCount / totalClients) * 100) : 0;

    return { totalClients, recurrentCount, newCount, recurrenceRate };
  }, [clients, appointments]);

  // 4. Revenue by category
  const categoryRevenue = useMemo(() => {
    const map: Record<string, number> = {
      Cabelo: 0,
      Maquiagem: 0,
      Unhas: 0,
      Sobrancelhas: 0,
    };

    appointments.forEach((a) => {
      if (a.status === 'concluido' || a.isPaid) {
        const cat = a.procedureCategory || 'Cabelo';
        map[cat] = (map[cat] || 0) + (a.finalPrice || a.price);
      }
    });

    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [appointments]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#EAE4DD] p-6 shadow-xs">
        <h2 className="font-['Playfair_Display',serif] text-xl font-bold text-[#2D2926] flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#8E5D52]" />
          <span>Relatórios & Métricas de Desempenho</span>
        </h2>
        <p className="text-xs text-[#7D756D] mt-1">
          Estatísticas detalhadas de faturamento, procedimentos e fidelidade de clientes
        </p>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Top 1 Procedimento */}
        <div className="bg-white p-5 rounded-3xl border border-[#EAE4DD] shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-[#7D756D]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Mais Realizado</span>
            <Award className="w-4 h-4 text-[#8E5D52]" />
          </div>
          <div className="font-bold text-[#2D2926] text-sm truncate">
            {procedureStats.topByCount[0]?.name || 'N/A'}
          </div>
          <p className="text-xs text-[#8E5D52] font-bold">
            {procedureStats.topByCount[0]?.count || 0} atendimentos realizados
          </p>
        </div>

        {/* Top 1 Receita */}
        <div className="bg-white p-5 rounded-3xl border border-[#EAE4DD] shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-[#7D756D]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Maior Faturamento</span>
            <TrendingUp className="w-4 h-4 text-[#2F7D48]" />
          </div>
          <div className="font-bold text-[#2D2926] text-sm truncate">
            {procedureStats.topByRevenue[0]?.name || 'N/A'}
          </div>
          <p className="text-xs text-[#2F7D48] font-extrabold">
            {formatCurrency(procedureStats.topByRevenue[0]?.revenue || 0)} gerados
          </p>
        </div>

        {/* Taxa de Recorrência */}
        <div className="bg-white p-5 rounded-3xl border border-[#EAE4DD] shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-[#7D756D]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Clientes Recorrentes</span>
            <Users className="w-4 h-4 text-[#3B749E]" />
          </div>
          <div className="font-extrabold text-[#2D2926] text-2xl">
            {clientRetention.recurrenceRate}%
          </div>
          <p className="text-xs text-[#7D756D]">
            {clientRetention.recurrentCount} de {clientRetention.totalClients} clientes fiéis
          </p>
        </div>

        {/* Total Atendimentos */}
        <div className="bg-white p-5 rounded-3xl border border-[#EAE4DD] shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-[#7D756D]">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Histórico</span>
            <CalendarCheck className="w-4 h-4 text-[#8E5D52]" />
          </div>
          <div className="font-extrabold text-[#2D2926] text-2xl">
            {appointments.length}
          </div>
          <p className="text-xs text-[#7D756D]">
            agendamentos registrados
          </p>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Procedure Breakdown Bar Chart (Recharts) */}
        <div className="bg-white p-6 rounded-3xl border border-[#EAE4DD] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F5F2ED] pb-3">
            <div>
              <h3 className="font-['Playfair_Display',serif] text-base font-bold text-[#2D2926]">
                Procedimentos Mais Realizados
              </h3>
              <p className="text-xs text-[#7D756D]">Volume de agendamentos por serviço</p>
            </div>
            <span className="text-[11px] font-bold text-[#8E5D52] bg-[#F5F2ED] px-2.5 py-1 rounded-xl border border-[#EAE4DD]">
              Gráfico de Barras
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={procedureStats.chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EAE4" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#7D756D', fontSize: 11 }}
                  interval={0}
                  tickFormatter={(val) => (val.length > 13 ? `${val.slice(0, 11)}...` : val)}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: '#7D756D', fontSize: 11 }}
                />
                <Tooltip
                  formatter={(val: any) => [`${val} atendimentos`, 'Realizados']}
                  labelFormatter={(label) => `Procedimento: ${label}`}
                  contentStyle={{
                    borderRadius: '16px',
                    fontSize: '12px',
                    border: '1px solid #EAE4DD',
                    backgroundColor: '#FDFBF9',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <Bar
                  dataKey="count"
                  name="Atendimentos"
                  fill="#8E5D52"
                  radius={[8, 8, 0, 0]}
                >
                  {procedureStats.chartData.map((_, index) => (
                    <Cell
                      key={`bar-cell-${index}`}
                      fill={
                        index === 0
                          ? '#8E5D52'
                          : index === 1
                          ? '#A87165'
                          : index === 2
                          ? '#C4887C'
                          : '#D8A096'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick ranking list below the chart */}
          <div className="pt-2 border-t border-[#F5F2ED] space-y-2 max-h-40 overflow-y-auto">
            {procedureStats.chartData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-xs text-[#59524C]">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-[#F5F2ED] text-[#8E5D52] font-bold text-[10px] flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-[#2D2926] truncate max-w-[180px]">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#8E5D52]">{item.count} un.</span>
                  <span className="text-[#2F7D48] font-medium">({formatCurrency(item.revenue)})</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Breakdown Pie Chart */}
        <div className="bg-white p-6 rounded-3xl border border-[#EAE4DD] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-['Playfair_Display',serif] text-base font-bold text-[#2D2926]">
              Status dos Agendamentos
            </h3>
            <span className="text-[11px] font-bold text-[#7D756D] bg-[#FDFBF9] px-2.5 py-1 rounded-xl border border-[#EAE4DD]">
              Distribuição Geral
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusStats}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={3}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val} agendamentos`, 'Total']}
                  contentStyle={{ borderRadius: '16px', fontSize: '12px', border: '1px solid #EAE4DD', backgroundColor: '#FDFBF9' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
