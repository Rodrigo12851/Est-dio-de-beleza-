import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { notificationSound } from '../../utils/audioNotification';
import { fileToDataUrl } from '../../utils/imageUpload';
import { getStoreCustomerUrl, getStoreAdminUrl } from '../../utils/storeRouting';
import { PasswordInput } from '../common/PasswordInput';
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
  Link as LinkIcon,
  Copy,
  ExternalLink,
  MessageCircle,
  Lock,
  AlertCircle,
} from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { config, updateConfig, currentStore, changeStorePassword } = useStore();

  const [formData, setFormData] = useState({ ...config });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<boolean>(
    notificationSound.isPermissionGranted()
  );
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // Link copy states
  const [copiedCustomerLink, setCopiedCustomerLink] = useState(false);
  const [copiedAdminLink, setCopiedAdminLink] = useState(false);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordFeedback, setPasswordFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const customerUrl = getStoreCustomerUrl(currentStore?.slug || config.slug || 'boutique');
  const adminUrl = getStoreAdminUrl(currentStore?.slug || config.slug || 'boutique');

  const copyToClipboard = async (text: string, type: 'customer' | 'admin') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'customer') {
        setCopiedCustomerLink(true);
        setTimeout(() => setCopiedCustomerLink(false), 2500);
      } else {
        setCopiedAdminLink(true);
        setTimeout(() => setCopiedAdminLink(false), 2500);
      }
    } catch {
      // Fallback
      alert(`Link copiado: ${text}`);
    }
  };

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (!currentPassword) {
      setPasswordFeedback({
        type: 'error',
        message: 'Por favor, digite a sua senha atual (de antes).',
      });
      return;
    }

    if (!newPassword || newPassword.length < 4) {
      setPasswordFeedback({
        type: 'error',
        message: 'A nova senha deve ter no mínimo 4 dígitos ou caracteres.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordFeedback({
        type: 'error',
        message: 'A confirmação não coincide com a nova senha. Digite a nova senha 2 vezes iguais.',
      });
      return;
    }

    const result = await changeStorePassword(currentPassword, newPassword);
    if (result.success) {
      setPasswordFeedback({
        type: 'success',
        message: 'Senha alterada com sucesso! Atualizada também na central do Intima Lab.',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setFormData((prev) => ({ ...prev, adminPin: newPassword }));
    } else {
      setPasswordFeedback({
        type: 'error',
        message: result.message,
      });
    }
  };

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
          Configurações da Boutique ({config.name})
        </h2>
        <p className="text-xs text-[#7D756D]">
          Configure seus links próprios, Logo da Loja, contatos, chave PIX, alarmes e alteração de senha
        </p>
      </div>

      {/* LINKS PRÓPRIOS DA LOJA (Conforme solicitado pelo usuário) */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#EFE9E2] shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#9B4B5A]/10 text-[#9B4B5A] flex items-center justify-center">
            <LinkIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#2D2926]">
              Links Oficiais & Exclusivos da Sua Loja
            </h3>
            <p className="text-[11px] text-[#7D756D]">
              Cada loja possui links únicos para divulgação às clientes e acesso ao painel de gerenciamento.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Link 1: Catálogo da Cliente */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8DFD5] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#9B4B5A] uppercase tracking-wider flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5" />
                <span>1. Link da Loja para a Cliente</span>
              </span>
              <span className="text-[10px] bg-[#9B4B5A]/10 text-[#9B4B5A] font-semibold px-2 py-0.5 rounded-full">
                Divulgação
              </span>
            </div>

            <p className="text-[11px] text-[#555555]">
              Envie este link para suas clientes pelo WhatsApp, Instagram e redes sociais:
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={customerUrl}
                className="flex-1 bg-white border border-[#DDD5CC] rounded-xl px-3 py-2 text-[11px] text-[#2D2926] font-mono select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(customerUrl, 'customer')}
                className="px-3 py-2 bg-[#9B4B5A] hover:bg-[#843A48] text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shrink-0"
              >
                {copiedCustomerLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCustomerLink ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Olá! Conheça as novidades e peças exclusivas da nossa boutique no link: ${customerUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Enviar pelo WhatsApp</span>
              </a>

              <a
                href={customerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-3 bg-[#EAE2D8] hover:bg-[#DFD6CB] text-[#2D2926] rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 cursor-pointer transition-all"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Testar Link</span>
              </a>
            </div>
          </div>

          {/* Link 2: Área Administrativa da Lojista */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8DFD5] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#2D2926] uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#D8A47F]" />
                <span>2. Link da Área Administrativa</span>
              </span>
              <span className="text-[10px] bg-zinc-200 text-zinc-700 font-semibold px-2 py-0.5 rounded-full">
                Uso da Lojista
              </span>
            </div>

            <p className="text-[11px] text-[#555555]">
              Salve nos seus favoritos para acessar direto a área de pedidos e estoque:
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={adminUrl}
                className="flex-1 bg-white border border-[#DDD5CC] rounded-xl px-3 py-2 text-[11px] text-[#2D2926] font-mono select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(adminUrl, 'admin')}
                className="px-3 py-2 bg-[#2D2926] hover:bg-[#1A1816] text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shrink-0"
              >
                {copiedAdminLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedAdminLink ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>

            <p className="text-[10px] text-[#888888] pt-1">
              🔒 O acesso exige sua senha cadastrada. Você pode alterá-la a qualquer momento abaixo.
            </p>
          </div>
        </div>
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

        {/* Botão de Salvar Configurações da Loja */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-3 bg-[#9B4B5A] hover:bg-[#843A48] text-white rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer active:scale-95"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Configurações Salvas com Sucesso!</span>
              </>
            ) : (
              <span>Salvar Alterações da Loja</span>
            )}
          </button>
        </div>
      </form>

      {/* SEGURANÇA: ALTERAÇÃO DE SENHA COM SENHA ANTERIOR E CONFIRMAÇÃO DUPLA (Conforme solicitado pelo usuário) */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#EFE9E2] shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#D8A47F]/20 text-[#2D2926] flex items-center justify-center">
            <KeyRound className="w-4 h-4 text-[#9B4B5A]" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#2D2926]">
              Segurança & Troca de Senha de Acesso da Boutique
            </h3>
            <p className="text-[11px] text-[#7D756D]">
              Para alterar sua senha, digite a senha de antes e confirme a nova senha duas vezes. A nova senha será sincronizada automaticamente com o dono do aplicativo.
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordChangeSubmit} className="space-y-4 pt-1 max-w-xl">
          {/* Senha Anterior (de antes) */}
          <div>
            <label className="block text-xs font-semibold text-[#4A423D] mb-1">
              1. Senha Atual ("Senha de antes")
            </label>
            <PasswordInput
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                setPasswordFeedback(null);
              }}
              placeholder="Digite sua senha atual"
              theme="light"
              autoComplete="current-password"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Nova Senha */}
            <div>
              <label className="block text-xs font-semibold text-[#4A423D] mb-1">
                2. Nova Senha
              </label>
              <PasswordInput
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setPasswordFeedback(null);
                }}
                placeholder="Digite a nova senha"
                theme="light"
                autoComplete="new-password"
              />
            </div>

            {/* Confirmar Nova Senha */}
            <div>
              <label className="block text-xs font-semibold text-[#4A423D] mb-1">
                3. Confirmar Nova Senha (2ª vez)
              </label>
              <PasswordInput
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordFeedback(null);
                }}
                placeholder="Repita a nova senha"
                theme="light"
                autoComplete="new-password"
              />
            </div>
          </div>

          {passwordFeedback && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                passwordFeedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}
            >
              {passwordFeedback.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{passwordFeedback.message}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <p className="text-[11px] text-[#888888]">
              🔒 Mínimo de 4 caracteres. A senha é atualizada para o Super Admin em tempo real.
            </p>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#2D2926] hover:bg-[#1A1816] text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <ShieldCheck className="w-4 h-4 text-[#D8A47F]" />
              <span>Atualizar Minha Senha</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
