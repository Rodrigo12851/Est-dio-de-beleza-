import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { notificationSound } from '../../utils/audioNotification';
import { fileToDataUrl } from '../../utils/imageUpload';
import {
  Settings,
  BellRing,
  CreditCard,
  Phone,
  Store,
  KeyRound,
  Check,
  Sparkles,
  Volume2,
  ShieldCheck,
  QrCode,
  Image as ImageIcon,
  Upload,
  Trash2,
  Camera,
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { config, updateConfig } = useStore();

  const [formData, setFormData] = useState({ ...config });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<boolean>(
    notificationSound.isPermissionGranted()
  );
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingLogo(true);
      const dataUrl = await fileToDataUrl(file, 400, 400, 0.9);
      setFormData((prev) => ({ ...prev, logo: dataUrl }));
    } catch (err) {
      alert('Não foi possível processar a foto da logo. Tente outra imagem.');
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const handleBannerFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingBanner(true);
      const dataUrl = await fileToDataUrl(file, 1200, 800, 0.85);
      setFormData((prev) => ({ ...prev, bannerImage: dataUrl }));
    } catch (err) {
      alert('Não foi possível processar a foto do banner. Tente outra imagem.');
    } finally {
      setUploadingBanner(false);
      if (bannerInputRef.current) bannerInputRef.current.value = '';
    }
  };

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
      'Mariana Siqueira acabou de fazer o pedido #PED-9999 (R$ 259,80) na Allure Intimidades!',
      formData.logo || '/icon.svg'
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
          Configure sua Logo da Loja, contatos, chave PIX, alarmes de novos pedidos e segurança
        </p>
      </div>

      {/* Notification Test Box */}
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
        {/* LOGO DA LOJA - Conforme pedido do lojista marcado em verde */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#EFE9E2] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#2D2926] uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#9B4B5A]" />
              <span>Foto da Logo da Loja</span>
            </h3>
            <span className="text-[11px] text-[#9B4B5A] font-semibold bg-[#FAF3F5] px-2.5 py-1 rounded-full border border-[#F0D5DC]">
              Aparece no Topo do Site, Rodapé e Gaveta
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8DFD5]">
            {/* Visual Preview */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border-2 border-dashed border-[#D8A47F] flex items-center justify-center overflow-hidden shrink-0 shadow-sm relative group">
              {formData.logo ? (
                <>
                  <img
                    src={formData.logo}
                    alt="Logo da Boutique"
                    className="w-full h-full object-contain p-1"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, logo: '' })}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                    title="Remover Logo"
                  >
                    <Trash2 className="w-5 h-5 text-red-400" />
                  </button>
                </>
              ) : (
                <div className="text-center p-2">
                  <ImageIcon className="w-6 h-6 text-[#9B4B5A]/40 mx-auto mb-1" />
                  <span className="text-[9px] text-[#7D756D] block leading-tight">Sem foto de logo</span>
                </div>
              )}
            </div>

            {/* Upload Buttons */}
            <div className="space-y-2 flex-1">
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoFileChange}
                className="hidden"
              />

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={uploadingLogo}
                  onClick={() => logoInputRef.current?.click()}
                  className="px-4 py-2.5 bg-[#9B4B5A] hover:bg-[#843A48] text-white rounded-xl font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                  <span>{uploadingLogo ? 'Carregando foto...' : 'Pegar Foto da Logo na Galeria'}</span>
                </button>

                {formData.logo && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, logo: '' })}
                    className="px-3 py-2.5 bg-white border border-[#E8DFD5] hover:border-red-300 text-red-600 rounded-xl font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remover Logo</span>
                  </button>
                )}
              </div>

              <div>
                <label className="block text-[10px] text-[#7D756D] mb-1">
                  Ou digite a URL da logo na web (opcional):
                </label>
                <input
                  type="text"
                  value={formData.logo || ''}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  placeholder="https://... ou escolha da galeria acima"
                  className="w-full bg-white border border-[#E8DFD5] rounded-xl px-3 py-2 text-xs"
                />
              </div>
            </div>
          </div>
        </div>

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
                placeholder="@allureintimidades.oficial"
                className="w-full bg-[#FAF8F5] border border-[#E8DFD5] rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-[#4A423D] mb-1">Chave PIX da Boutique</label>
              <input
                type="text"
                value={formData.pixKey || ''}
                onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
                placeholder="contato@allureintimidades.com.br"
                className="w-full bg-[#FAF8F5] border border-[#E8DFD5] rounded-xl px-3 py-2 text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-[#4A423D] mb-1">Endereço da Boutique Física (para Google Maps)</label>
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
                placeholder="Ex: ✨ BOUTIQUE ALLURE • ALTA COSTURA ÍNTIMA"
                className="w-full bg-[#FAF8F5] border border-[#E8DFD5] rounded-xl px-3 py-2 text-xs"
              />
            </div>

            {/* Foto do Banner da Loja */}
            <div className="sm:col-span-2 pt-2 border-t border-[#E8DFD5]">
              <label className="block font-bold text-[#4A423D] mb-1">Foto do Banner Principal</label>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                onChange={handleBannerFileChange}
                className="hidden"
              />
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  disabled={uploadingBanner}
                  onClick={() => bannerInputRef.current?.click()}
                  className="px-3.5 py-2 bg-[#FAF8F5] hover:bg-[#F3ECE4] text-[#4A423D] border border-[#E8DFD5] rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer text-xs"
                >
                  <Upload className="w-3.5 h-3.5 text-[#9B4B5A]" />
                  <span>{uploadingBanner ? 'Processando foto...' : 'Escolher Foto do Banner na Galeria'}</span>
                </button>
              </div>
              <input
                type="text"
                value={formData.bannerImage || ''}
                onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                placeholder="URL da imagem do banner..."
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
              <span>Módulo de Pagamento Online</span>
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
                <strong>Checkout via WhatsApp (PADRÃO RECOMENDADO):</strong> O checkout direciona as clientes diretamente para seu WhatsApp com o resumo formatado das peças, facilitando o atendimento humanizado e fechamento ágil.
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

        {/* Save Button (Removed the red marked "Restaurar Catálogo de Demonstração" button) */}
        <div className="flex items-center justify-end pt-2">
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
