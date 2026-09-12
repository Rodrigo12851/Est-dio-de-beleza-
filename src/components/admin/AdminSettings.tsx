import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { notificationSound } from '../../utils/audioNotification';
import {
  Settings,
  BellRing,
  CreditCard,
  Phone,
  Store,
  KeyRound,
  RotateCcw,
  Check,
  Sparkles,
  Volume2,
  ShieldCheck,
  QrCode,
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { config, updateConfig, resetToDefaults } = useStore();

  const [formData, setFormData] = useState({ ...config });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<boolean>(
    notificationSound.isPermissionGranted()
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateConfig(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleTestNotification = async () => {
    // Request permission if not granted
    const granted = await notificationSound.requestNotificationPermission();
    setNotificationPermission(granted);

    // Play chime audio ringtone
    notificationSound.playBookingRingtone();

    // Trigger native mobile top bar notification
    notificationSound.showSystemNotification(
      '🔔 Teste de Notificação: Novo Pedido!',
      'Mariana Siqueira acabou de fazer o pedido #PED-9999 (R$ 259,80) na Bella Lingerie!',
      '/icon.svg'
    );
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-[#EFE9E2] shadow-2xs space-y-1">
        <h2 className="font-['Playfair_Display',serif] text-xl font-bold text-[#2D2926]">
          Configurações da Boutique
        </h2>
        <p className="text-xs text-[#7D756D]">
          Configure contatos, chave PIX, gateways de pagamento, alarmes de pedidos e segurança
        </p>
      </div>

      {/* Notification Test Box (Specifically fulfilling the user's top-priority feature!) */}
      <div className="bg-gradient-to-r from-[#FAF3F5] to-white p-5 sm:p-6 rounded-3xl border border-[#F0D5DC] shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#9B4B5A] text-white flex items-center justify-center">
            <BellRing className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#2D2926]">
              Alarme de Novo Pedido no Topo do Celular
            </h3>
            <p className="text-[11px] text-[#6B5A5E]">
              Toque sonoro com vibração e notificação na barra de status superior do smartphone quando uma cliente enviar um pedido
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handleTestNotification}
            className="px-4 py-2 bg-[#9B4B5A] hover:bg-[#843A48] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <Volume2 className="w-4 h-4" />
            <span>Testar Alarme & Notificação no Celular Agora</span>
          </button>

          <span
            className={`text-xs px-3 py-1 rounded-full font-semibold border ${
              notificationPermission
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            {notificationPermission ? '✓ Notificações do Navegador Ativas' : '⚠️ Clique no botão para autorizar'}
          </span>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Store & Owner identity */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#EFE9E2] shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-[#2D2926] uppercase tracking-wider flex items-center gap-2">
            <Store className="w-4 h-4 text-[#9B4B5A]" />
            <span>Identidade & Contato</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-[#4A423D] mb-1">Nome da Loja</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-[#E8DFD5] rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-[#4A423D] mb-1">Nome da Proprietária</label>
              <input
                type="text"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-[#E8DFD5] rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-[#4A423D] mb-1">WhatsApp para Pedidos (com DDD)</label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="5511987654321"
                className="w-full bg-[#FAF8F5] border border-[#E8DFD5] rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-[#4A423D] mb-1">Telefone / Fixo de Contato</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-[#E8DFD5] rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-[#4A423D] mb-1">Instagram da Loja</label>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                placeholder="@bellalingerie.oficial"
                className="w-full bg-[#FAF8F5] border border-[#E8DFD5] rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-[#4A423D] mb-1">Chave PIX da Boutique</label>
              <input
                type="text"
                value={formData.pixKey || ''}
                onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
                placeholder="contato@bellalingerie.com.br"
                className="w-full bg-[#FAF8F5] border border-[#E8DFD5] rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-[#4A423D] mb-1">Endereço da Boutique Física</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-[#FAF8F5] border border-[#E8DFD5] rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-[#4A423D] mb-1">Instruções para Retirada no Local</label>
              <input
                type="text"
                value={formData.pickupInstructions || ''}
                onChange={(e) => setFormData({ ...formData, pickupInstructions: e.target.value })}
                placeholder="Ex: Retirada gratuita em nossa boutique em até 2 horas úteis."
                className="w-full bg-[#FAF8F5] border border-[#E8DFD5] rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-[#4A423D] mb-1">Barra de Avisos no Topo do Site</label>
              <input
                type="text"
                value={formData.announcementBar || ''}
                onChange={(e) => setFormData({ ...formData, announcementBar: e.target.value })}
                placeholder="Ex: ✨ FRETE GRÁTIS EM COMPRAS ACIMA DE R$ 199"
                className="w-full bg-[#FAF8F5] border border-[#E8DFD5] rounded-xl px-3 py-2 text-xs"
              />
            </div>
          </div>
        </div>

        {/* PRD 3.2: Flag de Controle Global (enableOnlinePayment) */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#EFE9E2] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#2D2926] uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#9B4B5A]" />
              <span>Módulo de Pagamento Online (PRD 3.2)</span>
            </h3>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableOnlinePayment}
                onChange={(e) => setFormData({ ...formData, enableOnlinePayment: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#9B4B5A]"></div>
            </label>
          </div>

          <div
            className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
              formData.enableOnlinePayment
                ? 'bg-blue-50 text-blue-900 border-blue-200'
                : 'bg-[#FAF3F5] text-[#4A3B3E] border-[#F0D5DC]'
            }`}
          >
            {formData.enableOnlinePayment ? (
              <p>
                <strong>Módulo Online ATIVADO:</strong> O checkout exibirá opções imediatas de pagamento via PIX (com cópia de chave/QR Code) e cartão de crédito antes do envio.
              </p>
            ) : (
              <p>
                <strong>Checkout via WhatsApp (PADRÃO RECOMENDADO):</strong> O checkout oculta gateways e direciona os clientes diretamente para seu WhatsApp com o resumo formatado das peças, facilitando o atendimento humanizado e fechamento ágil.
              </p>
            )}
          </div>
        </div>

        {/* Security & PIN */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#EFE9E2] shadow-2xs space-y-3">
          <h3 className="font-bold text-sm text-[#2D2926] uppercase tracking-wider flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#9B4B5A]" />
            <span>PIN de Segurança Administrativo</span>
          </h3>

          <div className="max-w-xs">
            <label className="block font-bold text-[#4A423D] mb-1">PIN Atual</label>
            <input
              type="password"
              maxLength={6}
              value={formData.adminPin}
              onChange={(e) => setFormData({ ...formData, adminPin: e.target.value })}
              className="w-full bg-[#FAF8F5] border border-[#E8DFD5] rounded-xl px-3 py-2 text-xs font-mono font-bold tracking-widest text-center"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => {
              if (confirm('Deseja resetar o catálogo e dados para o padrão inicial?')) {
                resetToDefaults();
                alert('Dados redefinidos com sucesso.');
              }
            }}
            className="text-zinc-500 hover:text-zinc-800 text-xs flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Catálogo de Demonstração</span>
          </button>

          <button
            type="submit"
            className="px-6 py-3 bg-[#9B4B5A] hover:bg-[#843A48] text-white rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer active:scale-95"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Salvo com Sucesso!</span>
              </>
            ) : (
              <span>Salvar Alterações</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
