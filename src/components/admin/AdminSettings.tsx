import React, { useState, useEffect } from 'react';
import { useSalon } from '../../context/SalonContext';
import { SalonConfig, DaySchedule } from '../../types';
import {
  Settings,
  Store,
  Clock,
  MessageCircle,
  Shield,
  Save,
  CheckCircle2,
  Lock,
  Sparkles,
  Phone,
  MapPin,
  Instagram,
  User,
  Coffee
} from 'lucide-react';
import { ImageUploadPicker } from '../common/ImageUploadPicker';

const DAYS_NAMES = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

export const AdminSettings: React.FC = () => {
  const { config, updateSalonConfig } = useSalon();

  // Local state initialized with current config
  const [formData, setFormData] = useState<SalonConfig>(config);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'hours' | 'whatsapp' | 'security'>('profile');

  useEffect(() => {
    setFormData(config);
  }, [config]);

  const handleWorkingHourChange = (
    dayIndex: number,
    field: keyof DaySchedule,
    value: any
  ) => {
    setFormData((prev) => {
      const currentDay = prev.workingHours?.[dayIndex] || {
        enabled: false,
        start: '09:00',
        end: '18:00',
      };
      return {
        ...prev,
        workingHours: {
          ...prev.workingHours,
          [dayIndex]: {
            ...currentDay,
            [field]: value,
          },
        },
      };
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSalonConfig(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-[#EAE4DD] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-['Playfair_Display',serif] text-xl font-bold text-[#2D2926] flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#8E5D52]" />
            <span>Configurações do Salão & Sistema</span>
          </h2>
          <p className="text-xs text-[#7D756D] mt-1">
            Personalize informações públicas, horários de atendimento e mensagens automáticas
          </p>
        </div>

        {saveSuccess && (
          <div className="p-3 bg-[#EAF5EC] border border-[#C2E4C9] text-[#2F7D48] text-xs rounded-2xl flex items-center gap-2 font-bold animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-[#2F7D48]" />
            <span>Configurações salvas com sucesso!</span>
          </div>
        )}
      </div>

      {/* Sub Tabs */}
      <div className="flex border-b border-[#EAE4DD] gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSubTab('profile')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'profile'
              ? 'border-[#8E5D52] text-[#8E5D52]'
              : 'border-transparent text-[#7D756D] hover:text-[#2D2926]'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Perfil & Salão</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('hours')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'hours'
              ? 'border-[#8E5D52] text-[#8E5D52]'
              : 'border-transparent text-[#7D756D] hover:text-[#2D2926]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Horários de Atendimento</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('whatsapp')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'whatsapp'
              ? 'border-[#8E5D52] text-[#8E5D52]'
              : 'border-transparent text-[#7D756D] hover:text-[#2D2926]'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>WhatsApp & Avisos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('security')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'security'
              ? 'border-[#8E5D52] text-[#8E5D52]'
              : 'border-transparent text-[#7D756D] hover:text-[#2D2926]'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Segurança & PIN</span>
        </button>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* SUBTAB: PROFILE & SALON */}
        {activeSubTab === 'profile' && (
          <div className="bg-white rounded-3xl border border-[#EAE4DD] p-6 shadow-xs space-y-4">
            <h3 className="font-['Playfair_Display',serif] text-base font-bold text-[#2D2926] border-b border-[#F5F2ED] pb-3">
              Informações do Salão e da Profissional
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#2D2926] uppercase tracking-wider mb-1">
                  Nome do Salão / Estúdio *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FDFBF9] border border-[#EAE4DD] rounded-xl text-sm text-[#2D2926] focus:bg-white focus:border-[#8E5D52] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D2926] uppercase tracking-wider mb-1">
                  Nome da Profissional / Proprietária *
                </label>
                <input
                  type="text"
                  required
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FDFBF9] border border-[#EAE4DD] rounded-xl text-sm text-[#2D2926] focus:bg-white focus:border-[#8E5D52] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D2926] uppercase tracking-wider mb-1">
                  WhatsApp Oficial (com DDD) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FDFBF9] border border-[#EAE4DD] rounded-xl text-sm text-[#2D2926] focus:bg-white focus:border-[#8E5D52] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D2926] uppercase tracking-wider mb-1">
                  Instagram (@usuario)
                </label>
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FDFBF9] border border-[#EAE4DD] rounded-xl text-sm text-[#2D2926] focus:bg-white focus:border-[#8E5D52] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#2D2926] uppercase tracking-wider mb-1">
                  Endereço Completo do Salão *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FDFBF9] border border-[#EAE4DD] rounded-xl text-sm text-[#2D2926] focus:bg-white focus:border-[#8E5D52] focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <ImageUploadPicker
                  label="Foto de Perfil / Logo do Salão"
                  value={formData.avatar || ''}
                  onChange={(val) => setFormData({ ...formData, avatar: val })}
                  placeholder="https://..."
                  helpText="Escolha uma imagem do seu celular ou informe um link de imagem."
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#2D2926] uppercase tracking-wider mb-1">
                  Biografia / Apresentação no Site
                </label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full p-3 bg-[#FDFBF9] border border-[#EAE4DD] rounded-xl text-xs text-[#2D2926] focus:bg-white focus:border-[#8E5D52] focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB: WORKING HOURS & LUNCH BREAK (PRD Section 18) */}
        {activeSubTab === 'hours' && (
          <div className="space-y-4">
            {/* Lunch break configuration */}
            <div className="bg-white rounded-3xl border border-[#EAE4DD] p-6 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[#F5F2ED] pb-3">
                <div className="flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-[#8E5D52]" />
                  <h3 className="font-bold text-[#2D2926] text-sm">Intervalo de Almoço</h3>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.lunchBreak?.enabled ?? true}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lunchBreak: {
                          enabled: e.target.checked,
                          start: formData.lunchBreak?.start || '12:00',
                          end: formData.lunchBreak?.end || '13:00',
                        },
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-[#EAE4DD] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#EAE4DD] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8E5D52]"></div>
                </label>
              </div>

              {formData.lunchBreak?.enabled && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-[#2D2926] mb-1">Início do Almoço</label>
                    <input
                      type="time"
                      value={formData.lunchBreak.start}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          lunchBreak: { ...formData.lunchBreak, start: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2 bg-[#FDFBF9] border border-[#EAE4DD] rounded-xl text-xs text-[#2D2926]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#2D2926] mb-1">Fim do Almoço</label>
                    <input
                      type="time"
                      value={formData.lunchBreak.end}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          lunchBreak: { ...formData.lunchBreak, end: e.target.value },
                        })
                      }
                      className="w-full px-3.5 py-2 bg-[#FDFBF9] border border-[#EAE4DD] rounded-xl text-xs text-[#2D2926]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Daily Working Schedule */}
            <div className="bg-white rounded-3xl border border-[#EAE4DD] p-6 shadow-xs space-y-4">
              <h3 className="font-['Playfair_Display',serif] text-base font-bold text-[#2D2926] border-b border-[#F5F2ED] pb-3">
                Escala Semanal de Atendimento
              </h3>

              <div className="divide-y divide-[#F5F2ED]">
                {DAYS_NAMES.map((dayName, idx) => {
                  const schedule = formData.workingHours?.[idx] || {
                    enabled: false,
                    start: '09:00',
                    end: '18:00',
                  };
                  return (
                    <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3 w-36">
                        <input
                          type="checkbox"
                          id={`day-en-${idx}`}
                          checked={schedule.enabled}
                          onChange={(e) => handleWorkingHourChange(idx, 'enabled', e.target.checked)}
                          className="w-4 h-4 text-[#8E5D52] rounded border-[#EAE4DD] focus:ring-[#8E5D52] cursor-pointer"
                        />
                        <label htmlFor={`day-en-${idx}`} className="font-bold text-[#2D2926] cursor-pointer">
                          {dayName}
                        </label>
                      </div>

                      {schedule.enabled ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={schedule.start}
                            onChange={(e) => handleWorkingHourChange(idx, 'start', e.target.value)}
                            className="px-3 py-2 bg-[#FDFBF9] border border-[#EAE4DD] rounded-xl text-xs text-[#2D2926]"
                          />
                          <span className="text-[#7D756D]">até</span>
                          <input
                            type="time"
                            value={schedule.end}
                            onChange={(e) => handleWorkingHourChange(idx, 'end', e.target.value)}
                            className="px-3 py-2 bg-[#FDFBF9] border border-[#EAE4DD] rounded-xl text-xs text-[#2D2926]"
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-[#A8A099] italic">Fechado (Folga)</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB: WHATSAPP & NOTIFICATIONS (PRD Section 12 & 18) */}
        {activeSubTab === 'whatsapp' && (
          <div className="bg-white rounded-3xl border border-[#EAE4DD] p-6 shadow-xs space-y-4">
            <h3 className="font-['Playfair_Display',serif] text-base font-bold text-[#2D2926] border-b border-[#F5F2ED] pb-3">
              Templates de Mensagem e Políticas
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#2D2926] uppercase tracking-wider mb-1">
                  Mensagem Automática de Lembrete / Confirmação no WhatsApp
                </label>
                <textarea
                  rows={4}
                  value={formData.whatsappConfirmationTemplate || ''}
                  onChange={(e) => setFormData({ ...formData, whatsappConfirmationTemplate: e.target.value })}
                  className="w-full p-3 bg-[#FDFBF9] border border-[#EAE4DD] rounded-xl text-xs text-[#2D2926] focus:bg-white focus:border-[#8E5D52] focus:outline-none font-mono"
                />
                <p className="text-[11px] text-[#7D756D] mt-1">
                  Tags suportadas: <code className="bg-[#F5F2ED] px-1.5 py-0.5 rounded text-[#2D2926]">{`{cliente}`}</code>, <code className="bg-[#F5F2ED] px-1.5 py-0.5 rounded text-[#2D2926]">{`{procedimento}`}</code>, <code className="bg-[#F5F2ED] px-1.5 py-0.5 rounded text-[#2D2926]">{`{data}`}</code>, <code className="bg-[#F5F2ED] px-1.5 py-0.5 rounded text-[#2D2926]">{`{hora}`}</code>, <code className="bg-[#F5F2ED] px-1.5 py-0.5 rounded text-[#2D2926]">{`{salao}`}</code>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D2926] uppercase tracking-wider mb-1">
                  Política de Cancelamento (exibida às clientes no agendamento)
                </label>
                <textarea
                  rows={2}
                  value={formData.cancellationPolicy}
                  onChange={(e) => setFormData({ ...formData, cancellationPolicy: e.target.value })}
                  className="w-full p-3 bg-[#FDFBF9] border border-[#EAE4DD] rounded-xl text-xs text-[#2D2926] focus:bg-white focus:border-[#8E5D52] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB: SECURITY & PIN */}
        {activeSubTab === 'security' && (
          <div className="bg-white rounded-3xl border border-[#EAE4DD] p-6 shadow-xs space-y-4">
            <h3 className="font-['Playfair_Display',serif] text-base font-bold text-[#2D2926] border-b border-[#F5F2ED] pb-3">
              Controle de Acesso ao Painel
            </h3>

            <div className="max-w-md space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#2D2926] uppercase tracking-wider mb-1">
                  PIN de Acesso da Proprietária *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#A8A099] absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    maxLength={10}
                    required
                    value={formData.adminPin}
                    onChange={(e) => setFormData({ ...formData, adminPin: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#FDFBF9] border border-[#EAE4DD] rounded-xl text-sm font-mono text-[#2D2926] focus:bg-white focus:border-[#8E5D52] focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-[#7D756D] mt-1">
                  Este PIN é solicitado sempre que você acessa o painel administrativo.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            id="admin-save-settings-btn"
            className="px-6 py-3.5 bg-[#8E5D52] hover:bg-[#784D43] text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4 text-white" />
            <span>Salvar Todas as Configurações</span>
          </button>
        </div>
      </form>
    </div>
  );
};
