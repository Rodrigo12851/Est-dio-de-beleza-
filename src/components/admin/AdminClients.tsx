import React, { useState, useMemo } from 'react';
import { useSalon } from '../../context/SalonContext';
import { ClientProfile, Appointment } from '../../types';
import { formatDateBR, formatCurrency } from '../../utils/dateUtils';
import { cleanPhone, buildWhatsAppDirectContactUrl } from '../../utils/whatsappUtils';
import {
  Users,
  Search,
  Phone,
  Calendar,
  DollarSign,
  MessageCircle,
  FileText,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  X,
  Edit2
} from 'lucide-react';

export const AdminClients: React.FC = () => {
  const { clients, appointments, saveClientNotes } = useSalon();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
  const [editingNotes, setEditingNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  // Compute enriched client data with statistics from appointments
  const enrichedClients = useMemo(() => {
    return clients.map((client) => {
      const cleanP = cleanPhone(client.phone);
      const clientApts = appointments.filter(
        (a) => cleanPhone(a.clientPhone) === cleanP || a.clientName.toLowerCase() === client.name.toLowerCase()
      ).sort((a, b) => b.date.localeCompare(a.date));

      const completedApts = clientApts.filter((a) => a.status === 'concluido' || a.status === 'confirmado');
      const totalSpent = clientApts
        .filter((a) => a.status === 'concluido' || a.isPaid)
        .reduce((sum, a) => sum + (a.finalPrice || a.price), 0);

      const firstVisit = clientApts.length > 0 ? clientApts[clientApts.length - 1].date : client.createdAt;
      const lastVisit = clientApts.length > 0 ? clientApts[0].date : client.createdAt;

      return {
        ...client,
        appointments: clientApts,
        visitsCount: clientApts.length,
        totalSpent,
        firstVisit,
        lastVisit,
      };
    });
  }, [clients, appointments]);

  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return enrichedClients;
    const term = searchTerm.toLowerCase();
    return enrichedClients.filter(
      (c) => c.name.toLowerCase().includes(term) || c.phone.includes(term)
    );
  }, [enrichedClients, searchTerm]);

  const handleOpenClientDrawer = (client: typeof enrichedClients[0]) => {
    setSelectedClient(client);
    setEditingNotes(client.notes || '');
    setIsEditingNotes(false);
  };

  const handleSaveNotes = () => {
    if (selectedClient) {
      saveClientNotes(selectedClient.id, editingNotes);
      setSelectedClient((prev) => (prev ? { ...prev, notes: editingNotes } : null));
      setIsEditingNotes(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="bg-white rounded-3xl border border-[#EAE4DD] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-['Playfair_Display',serif] text-xl font-bold text-[#2D2926] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#8E5D52]" />
            <span>Cadastro & Histórico de Clientes</span>
          </h2>
          <p className="text-xs text-[#7D756D] mt-1">
            Total de <strong>{clients.length} clientes</strong> registradas no salão
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#7D756D] absolute left-3.5 top-3" />
          <input
            id="client-search-input"
            type="text"
            placeholder="Buscar por nome ou WhatsApp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 bg-[#FDFBF9] border border-[#EAE4DD] rounded-2xl text-xs text-[#2D2926] focus:bg-white focus:border-[#8E5D52] focus:outline-none"
          />
        </div>
      </div>

      {/* Clients Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => {
          const whatsappUrl = buildWhatsAppDirectContactUrl(client.phone);
          return (
            <div
              key={client.id}
              onClick={() => handleOpenClientDrawer(client)}
              className="bg-white rounded-3xl border border-[#EAE4DD] p-5 shadow-xs hover:border-[#8E5D52]/50 transition-all cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FDFBF9] text-[#8E5D52] font-bold flex items-center justify-center text-sm shrink-0 border border-[#EAE4DD]">
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#2D2926] text-sm leading-tight hover:text-[#8E5D52]">
                      {client.name}
                    </h3>
                    <p className="text-xs text-[#7D756D] flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-[#7D756D]" />
                      <span>{client.phone}</span>
                    </p>
                  </div>
                </div>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-2.5 text-[#2F7D48] hover:bg-[#EAF5EC] rounded-xl transition-colors"
                  title="Abrir WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 bg-[#FDFBF9] rounded-2xl p-3 text-center text-xs border border-[#F5F2ED]">
                <div>
                  <span className="text-[10px] text-[#7D756D] block">Atendimentos</span>
                  <span className="font-bold text-[#2D2926]">{client.visitsCount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#7D756D] block">Total Gasto</span>
                  <span className="font-extrabold text-[#2F7D48]">{formatCurrency(client.totalSpent)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#7D756D] block">Última Visita</span>
                  <span className="font-semibold text-[#2D2926]">{formatDateBR(client.lastVisit).slice(0, 5)}</span>
                </div>
              </div>

              {client.notes && (
                <p className="text-[11px] text-[#7D756D] italic line-clamp-1">
                  "{client.notes}"
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Client Modal / Detailed CRM Drawer (PRD Section 13) */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#2D2926]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#EAE4DD] overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#EAE4DD] flex items-center justify-between bg-[#FDFBF9]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#8E5D52] text-white font-bold text-lg flex items-center justify-center shadow-xs">
                  {selectedClient.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-['Playfair_Display',serif] font-bold text-lg text-[#2D2926]">
                    {selectedClient.name}
                  </h3>
                  <p className="text-xs text-[#7D756D] flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#8E5D52]" />
                    <span>{selectedClient.phone}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedClient(null)}
                className="p-1.5 text-[#7D756D] hover:text-[#2D2926] rounded-xl hover:bg-[#F5F2ED] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {/* Financial & Visits Summary */}
              <div className="grid grid-cols-3 gap-3 bg-[#FDFBF9] rounded-2xl p-4 border border-[#EAE4DD] text-center">
                <div>
                  <span className="text-[11px] text-[#7D756D] block">Total Gasto</span>
                  <span className="text-base font-extrabold text-[#2F7D48]">
                    {formatCurrency(selectedClient.totalSpent)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[#7D756D] block">Atendimentos</span>
                  <span className="text-base font-extrabold text-[#2D2926]">
                    {selectedClient.visitsCount}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-[#7D756D] block">Primeira Visita</span>
                  <span className="text-xs font-bold text-[#2D2926] mt-1 block">
                    {formatDateBR(selectedClient.firstVisit)}
                  </span>
                </div>
              </div>

              {/* Personal Client Notes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2D2926] uppercase tracking-wider flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-[#8E5D52]" />
                    <span>Notas & Preferências da Cliente</span>
                  </span>
                  <button
                    onClick={() => setIsEditingNotes(!isEditingNotes)}
                    className="text-xs text-[#8E5D52] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>{isEditingNotes ? 'Cancelar' : 'Editar Notas'}</span>
                  </button>
                </div>

                {!isEditingNotes ? (
                  <div className="p-3.5 bg-[#FDFBF9] rounded-2xl border border-[#EAE4DD] text-xs text-[#2D2926] leading-relaxed min-h-[50px]">
                    {selectedClient.notes || <span className="text-[#7D756D] italic">Nenhuma anotação registrada ainda.</span>}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      rows={3}
                      value={editingNotes}
                      onChange={(e) => setEditingNotes(e.target.value)}
                      placeholder="Ex: Prefere tons quentes, sensibilidade no couro cabeludo..."
                      className="w-full p-3 bg-[#FDFBF9] border border-[#EAE4DD] rounded-xl text-xs text-[#2D2926] focus:bg-white focus:border-[#8E5D52] focus:outline-none resize-none"
                    />
                    <button
                      onClick={handleSaveNotes}
                      className="px-4 py-2 bg-[#8E5D52] hover:bg-[#784D43] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Salvar Anotação
                    </button>
                  </div>
                )}
              </div>

              {/* Complete Service History (PRD Section 13) */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-[#2D2926] uppercase tracking-wider flex items-center justify-between">
                  <span>Histórico de Atendimentos</span>
                  <span className="text-xs text-[#7D756D] font-normal">{selectedClient.appointments?.length || 0} registros</span>
                </h4>

                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {selectedClient.appointments && selectedClient.appointments.length > 0 ? (
                    selectedClient.appointments.map((apt) => (
                      <div
                        key={apt.id}
                        className="p-3.5 bg-[#FDFBF9] border border-[#EAE4DD] rounded-2xl flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-[#2D2926]">{apt.procedureName}</div>
                          <div className="text-[#7D756D] text-[11px]">
                            {formatDateBR(apt.date)} às {apt.time}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-extrabold text-[#2D2926] block">
                            {formatCurrency(apt.finalPrice || apt.price)}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            apt.status === 'concluido' ? 'bg-[#EAF5EC] text-[#2F7D48]' :
                            apt.status === 'confirmado' ? 'bg-[#EBF3FB] text-[#2C689F]' :
                            apt.status === 'cancelado' ? 'bg-[#FDEDED] text-[#C93B2B]' : 'bg-[#FEF6EC] text-[#965E21]'
                          }`}>
                            {apt.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[#7D756D] text-center py-4">Sem histórico anterior registrado.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 px-6 border-t border-[#EAE4DD] bg-[#FDFBF9] flex items-center justify-between">
              <a
                href={buildWhatsAppDirectContactUrl(selectedClient.phone)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-[#2F7D48] hover:bg-[#256339] text-white font-bold text-xs rounded-2xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Conversar no WhatsApp</span>
              </a>

              <button
                onClick={() => setSelectedClient(null)}
                className="px-4 py-2.5 bg-[#2D2926] hover:bg-[#1A1817] text-white font-bold text-xs rounded-2xl transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
