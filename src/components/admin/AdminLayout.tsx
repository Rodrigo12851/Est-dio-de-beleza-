import React, { useState } from 'react';
import { useSalon } from '../../context/SalonContext';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  Image,
  DollarSign,
  TrendingUp,
  Settings,
  Plus,
  Lock,
  ExternalLink,
  LogOut,
  Sparkles,
  Menu,
  X,
  Send
} from 'lucide-react';
import { NewManualAppointmentModal } from './NewManualAppointmentModal';
import { BlockTimeModal } from './BlockTimeModal';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const {
    config,
    adminTab,
    setAdminTab,
    setViewMode,
    logoutAdmin,
    appointments,
  } = useSalon();

  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pendingCount = appointments.filter((a) => a.status === 'pendente').length;

  const NAV_ITEMS: {
    id: 'dashboard' | 'calendar' | 'clients' | 'procedures' | 'gallery' | 'financial' | 'reports' | 'settings';
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }[] = [
    { id: 'dashboard', label: 'Visão Geral', icon: <LayoutDashboard className="w-4 h-4 shrink-0" /> },
    { id: 'calendar', label: 'Agenda & Horários', icon: <Calendar className="w-4 h-4 shrink-0" />, badge: pendingCount > 0 ? pendingCount : undefined },
    { id: 'clients', label: 'Clientes', icon: <Users className="w-4 h-4 shrink-0" /> },
    { id: 'procedures', label: 'Serviços', icon: <Scissors className="w-4 h-4 shrink-0" /> },
    { id: 'gallery', label: 'Galeria & Portfólio', icon: <Image className="w-4 h-4 shrink-0" /> },
    { id: 'financial', label: 'Faturamento', icon: <DollarSign className="w-4 h-4 shrink-0" /> },
    { id: 'reports', label: 'Relatórios', icon: <TrendingUp className="w-4 h-4 shrink-0" /> },
    { id: 'settings', label: 'Configurações', icon: <Settings className="w-4 h-4 shrink-0" /> },
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF9] text-[#2D2926] flex flex-col w-full max-w-full overflow-x-hidden">
      {/* Top Admin Bar */}
      <header className="sticky top-0 z-40 bg-[#231F1C] text-[#FDFBF9] shadow-md border-b border-[#3D3631] w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-15 sm:h-16 flex items-center justify-between gap-2">
          {/* Left: Logo & Salon Name */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-[#C4BDB7] hover:text-white rounded-lg cursor-pointer shrink-0"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#8E5D52] text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-sm overflow-hidden border border-[#D48D80] shrink-0">
                {config.avatar ? (
                  <img src={config.avatar} alt={config.ownerName} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                ) : (
                  <span>B</span>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <h1 className="font-bold text-xs sm:text-base text-white truncate max-w-[110px] xs:max-w-[160px] sm:max-w-xs">
                    {config.name}
                  </h1>
                  <span className="hidden xs:inline-block bg-[#8E5D52]/30 text-[#D48D80] text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full border border-[#8E5D52]/40 uppercase tracking-wider font-semibold shrink-0">
                    Painel
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-[#A8A099] truncate hidden sm:block">
                  Olá, {config.ownerName} 💕
                </p>
              </div>
            </div>
          </div>

          {/* Right: Quick Action CTAs */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* View Client Site */}
            <button
              id="admin-view-client-site-btn"
              onClick={() => setViewMode('client')}
              className="p-2 sm:px-3 sm:py-1.5 bg-[#332C28] hover:bg-[#413934] text-[#EAE4DD] text-xs font-semibold rounded-xl border border-[#4D433D] transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Ver vitrine e agendamento como cliente"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#D48D80] shrink-0" />
              <span className="hidden md:inline">Ver Site</span>
            </button>

            {/* Block Time Slot */}
            <button
              id="admin-block-time-btn"
              onClick={() => setIsBlockModalOpen(true)}
              className="p-2 sm:px-3 sm:py-1.5 bg-[#332C28] hover:bg-[#413934] text-[#EAE4DD] text-xs font-semibold rounded-xl border border-[#4D433D] transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Bloquear horários manualmente"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden lg:inline">Bloquear</span>
            </button>

            {/* New Manual Appointment Button */}
            <button
              id="admin-new-appointment-btn"
              onClick={() => setIsManualModalOpen(true)}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-[#8E5D52] hover:bg-[#784D43] active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Novo Agendamento"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden xs:inline">Novo</span>
            </button>

            {/* Logout */}
            <button
              onClick={logoutAdmin}
              className="p-2 text-[#A8A099] hover:text-white rounded-lg hover:bg-[#332C28] transition-colors cursor-pointer shrink-0"
              title="Sair do painel"
            >
              <LogOut className="w-4 h-4 shrink-0" />
            </button>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <div className="hidden lg:block border-t border-[#332C28] bg-[#1C1816]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setAdminTab(item.id)}
                className={`px-3.5 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  adminTab === item.id
                    ? 'text-[#D48D80] border-[#8E5D52] bg-[#2D2622]'
                    : 'text-[#A8A099] border-transparent hover:text-white hover:bg-[#26201D]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#8E5D52] text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-15 z-50 bg-black/80 backdrop-blur-xs flex">
          <div className="bg-[#231F1C] w-72 max-w-[80vw] h-full p-4 space-y-1 shadow-2xl border-r border-[#3D3631] overflow-y-auto pb-24">
            <div className="pb-3 mb-2 border-b border-[#332C28]">
              <p className="text-xs font-bold text-[#D48D80] uppercase tracking-wider">Navegação do Painel</p>
            </div>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setAdminTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full px-3.5 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                  adminTab === item.id
                    ? 'text-[#D48D80] bg-[#332C28] font-bold border border-[#8E5D52]/40'
                    : 'text-[#C4BDB7] hover:bg-[#2E2723]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#8E5D52] text-white shrink-0">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-6 lg:p-8 pb-24 lg:pb-12 min-w-0">
        {children}
      </main>

      {/* Mobile Quick Bottom Navigation Bar for Admin */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#231F1C] border-t border-[#3D3631] px-2 py-1.5 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setAdminTab('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-semibold transition-colors ${
            adminTab === 'dashboard' ? 'text-[#D48D80] font-bold' : 'text-[#A8A099]'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Início</span>
        </button>

        <button
          onClick={() => setAdminTab('calendar')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-semibold relative transition-colors ${
            adminTab === 'calendar' ? 'text-[#D48D80] font-bold' : 'text-[#A8A099]'
          }`}
        >
          <div className="relative">
            <Calendar className="w-4 h-4" />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-2 w-2.5 h-2.5 bg-[#8E5D52] rounded-full"></span>
            )}
          </div>
          <span>Agenda</span>
        </button>

        <button
          onClick={() => setIsManualModalOpen(true)}
          className="flex flex-col items-center gap-1 py-1 px-3 bg-[#8E5D52] text-white rounded-2xl text-[10px] font-bold shadow-xs active:scale-95 transition-all -mt-3"
        >
          <Plus className="w-5 h-5" />
          <span>Agendar</span>
        </button>

        <button
          onClick={() => setAdminTab('clients')}
          className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-semibold transition-colors ${
            adminTab === 'clients' ? 'text-[#D48D80] font-bold' : 'text-[#A8A099]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Clientes</span>
        </button>

        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-semibold text-[#A8A099]"
        >
          <Menu className="w-4 h-4" />
          <span>Mais</span>
        </button>
      </div>

      {/* Modals */}
      <NewManualAppointmentModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
      />

      <BlockTimeModal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
      />
    </div>
  );
};
