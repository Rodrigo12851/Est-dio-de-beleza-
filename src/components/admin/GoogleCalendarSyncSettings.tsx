import React, { useState, useEffect } from 'react';
import { useSalon } from '../../context/SalonContext';
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  LogOut,
  ShieldCheck,
  Sparkles,
  Clock,
  Send,
  CalendarCheck
} from 'lucide-react';
import {
  getCachedToken,
  requestGoogleCalendarAuth,
  clearToken,
  batchSyncConfirmedAppointments,
  syncAppointmentToGoogleCalendar,
} from '../../services/googleCalendarService';
import { formatDateBR } from '../../utils/dateUtils';

export const GoogleCalendarSyncSettings: React.FC = () => {
  const { config, updateSalonConfig, appointments } = useSalon();

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>(config.googleCalendar?.connectedEmail || '');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const gcalConfig = config.googleCalendar || {
    enabled: false,
    autoSyncConfirmed: true,
    connectedEmail: '',
    calendarId: 'primary',
  };

  useEffect(() => {
    const token = getCachedToken();
    if (token) {
      setIsConnected(true);
      if (config.googleCalendar?.connectedEmail) {
        setUserEmail(config.googleCalendar.connectedEmail);
      }
    } else {
      setIsConnected(false);
    }
  }, [config.googleCalendar]);

  const handleConnect = async () => {
    setConnecting(true);
    setStatusMessage(null);
    try {
      const result = await requestGoogleCalendarAuth();
      setIsConnected(true);
      const email = result.email || config.googleCalendar?.connectedEmail || 'Conta Google Conectada';
      setUserEmail(email);

      updateSalonConfig({
        googleCalendar: {
          ...gcalConfig,
          enabled: true,
          connectedEmail: email,
          lastSyncAt: new Date().toISOString(),
        },
      });

      setStatusMessage({
        type: 'success',
        text: 'Conta Google Calendar conectada com sucesso! Você já pode sincronizar seus horários.',
      });
    } catch (err: any) {
      console.error('Google Calendar Auth error:', err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Falha ao conectar com o Google Calendar. Tente novamente.',
      });
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    clearToken();
    setIsConnected(false);
    setUserEmail('');
    updateSalonConfig({
      googleCalendar: {
        ...gcalConfig,
        enabled: false,
        connectedEmail: undefined,
      },
    });
    setStatusMessage({
      type: 'info',
      text: 'Google Calendar desconectado.',
    });
  };

  const handleToggleAutoSync = (checked: boolean) => {
    updateSalonConfig({
      googleCalendar: {
        ...gcalConfig,
        autoSyncConfirmed: checked,
      },
    });
  };

  const handleSyncAllNow = async () => {
    if (!isConnected) {
      await handleConnect();
      return;
    }

    setSyncing(true);
    setStatusMessage(null);

    try {
      const result = await batchSyncConfirmedAppointments(appointments, config);
      updateSalonConfig({
        googleCalendar: {
          ...gcalConfig,
          lastSyncAt: new Date().toISOString(),
        },
      });

      if (result.errors === 0) {
        setStatusMessage({
          type: 'success',
          text: `Sincronização concluída! ${result.synced} agendamento(s) confirmado(s) atualizado(s) no seu Google Calendar.`,
        });
      } else {
        setStatusMessage({
          type: 'info',
          text: `${result.synced} agendamento(s) sincronizado(s). ${result.errors} com erro de permissão.`,
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Erro ao sincronizar com o Google Calendar.',
      });
    } finally {
      setSyncing(false);
    }
  };

  const confirmedCount = appointments.filter(
    (a) => a.status === 'confirmado' || a.status === 'concluido'
  ).length;

  return (
    <div className="bg-white rounded-3xl border border-[#EAE4DD] p-6 shadow-xs space-y-5">
      {/* Header with badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#F5F2ED] pb-4 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-['Playfair_Display',serif] text-base font-bold text-[#2D2926] flex items-center gap-2">
              <span>Sincronização com Google Calendar</span>
            </h3>
            <p className="text-xs text-[#7D756D] mt-0.5">
              Envie automaticamente os horários e atendimentos confirmados para a sua agenda do Google
            </p>
          </div>
        </div>

        <div>
          {isConnected ? (
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Google Calendar Conectado
            </span>
          ) : (
            <span className="text-[11px] font-bold text-[#7D756D] bg-[#F9F5F2] px-3 py-1.5 rounded-full border border-[#EAE4DD]">
              Não conectado
            </span>
          )}
        </div>
      </div>

      {/* Feedback status message */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-2xl border flex items-start gap-2.5 text-xs font-medium ${
            statusMessage.type === 'success'
              ? 'bg-[#EAF5EC] border-[#C2E4C9] text-[#2F7D48]'
              : statusMessage.type === 'error'
              ? 'bg-[#FDEAE8] border-[#F7C5C0] text-[#C93B2B]'
              : 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF]'
          }`}
        >
          {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#2F7D48] shrink-0 mt-0.5" />}
          {statusMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-[#C93B2B] shrink-0 mt-0.5" />}
          {statusMessage.type === 'info' && <Sparkles className="w-4 h-4 text-[#1E40AF] shrink-0 mt-0.5" />}
          <div className="flex-1">{statusMessage.text}</div>
        </div>
      )}

      {/* Connection & Auth Block */}
      <div className="bg-[#FDFBF9] rounded-2xl p-5 border border-[#EAE4DD] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-[#2D2926] uppercase tracking-wider">
              Conta do Google
            </h4>
            {isConnected ? (
              <p className="text-xs text-[#2D2926]">
                Conectado como <strong className="text-blue-700">{userEmail || 'Conta Google Principal'}</strong>
              </p>
            ) : (
              <p className="text-xs text-[#7D756D]">
                Conecte a conta do Google em que você gostaria de visualizar a agenda de clientes do salão.
              </p>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {isConnected ? (
              <>
                <a
                  href="https://calendar.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-white hover:bg-[#F5F2ED] text-[#2D2926] border border-[#EAE4DD] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[#8E5D52]" />
                  <span>Abrir Google Agenda</span>
                </a>
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Desconectar conta Google"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Desconectar</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                id="connect-google-calendar-btn"
                onClick={handleConnect}
                disabled={connecting}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Calendar className="w-4 h-4 fill-white" />
                <span>{connecting ? 'Conectando...' : 'Conectar com o Google Calendar'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Sync preferences when connected */}
        {isConnected && (
          <div className="pt-4 border-t border-[#EAE4DD] space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label htmlFor="auto-sync-toggle" className="text-xs font-bold text-[#2D2926] cursor-pointer block">
                  Sincronização Automática ao Confirmar Agendamento
                </label>
                <p className="text-[11px] text-[#7D756D]">
                  Cria ou atualiza automaticamente o evento no Google Calendar sempre que um atendimento for confirmado no painel.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  id="auto-sync-toggle"
                  checked={gcalConfig.autoSyncConfirmed ?? true}
                  onChange={(e) => handleToggleAutoSync(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-[#EAE4DD] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#EAE4DD] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Manual Bulk Sync Action Card */}
      <div className="border border-[#EAE4DD] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-[#8E5D52]" />
            <h4 className="text-xs font-bold text-[#2D2926]">Sincronizar Agendamentos Existentes</h4>
          </div>
          <p className="text-xs text-[#7D756D]">
            Existem <strong>{confirmedCount}</strong> agendamento(s) com status Confirmado/Concluído registrados no sistema.
            {gcalConfig.lastSyncAt && (
              <span className="block text-[11px] text-[#A8A099] mt-0.5">
                Última sincronização: {new Date(gcalConfig.lastSyncAt).toLocaleString('pt-BR')}
              </span>
            )}
          </p>
        </div>

        <button
          type="button"
          id="sync-all-calendar-events-btn"
          onClick={handleSyncAllNow}
          disabled={syncing}
          className="px-4 py-2.5 bg-[#8E5D52] hover:bg-[#784D43] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
          <span>{syncing ? 'Sincronizando Agenda...' : 'Sincronizar Todos Agora'}</span>
        </button>
      </div>

      {/* Informative Security & Details Box */}
      <div className="p-3.5 bg-[#F9F7F5] rounded-2xl border border-[#EAE4DD] text-[11px] text-[#7D756D] space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-[#2D2926]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Como funciona a integração com o Google Agenda</span>
        </div>
        <ul className="list-disc pl-4 space-y-1 text-[#59524C]">
          <li>Cada agendamento sincronizado inclui: Nome da Cliente, Telefone/WhatsApp, Procedimento(s), Duração, Endereço do Salão e Lembretes 30 min antes.</li>
          <li>Você pode receber alertas de notificação nativos do Google Calendar no seu celular Android ou iPhone.</li>
          <li>Os dados são enviados com segurança usando a API oficial do Google com autorização restrita apenas a eventos de agenda.</li>
        </ul>
      </div>
    </div>
  );
};
