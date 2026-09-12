/**
 * Intima Lab - Links, Roteamento e Suporte
 * Utilitários para geração de links próprios por loja,
 * roteamento via URL params e integração de suporte do Dono do App.
 */

export const SUPERADMIN_ACCESS_KEY = 'intimalab';
export const DEFAULT_SUPPORT_WHATSAPP = '5511999998888'; // WhatsApp do Dono do App / Suporte Intima Lab

/**
 * Obtém a URL base limpa da aplicação
 */
export const getAppBaseUrl = (): string => {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}${window.location.pathname}`;
};

/**
 * Link da Loja para Clientes (Catálogo Público)
 * Ex: https://meusite.com/?store=nome-da-loja
 */
export const getStoreClientUrl = (slugOrId: string): string => {
  const base = getAppBaseUrl();
  return `${base}?store=${encodeURIComponent(slugOrId)}`;
};

export const getStoreCustomerUrl = getStoreClientUrl;

/**
 * Link do Painel Administrativo da Loja (Área do Lojista)
 * Ex: https://meusite.com/?admin=nome-da-loja
 */
export const getStoreAdminUrl = (slugOrId: string): string => {
  const base = getAppBaseUrl();
  return `${base}?admin=${encodeURIComponent(slugOrId)}`;
};

/**
 * Link Exclusivo do Dono do App (Super Admin)
 * Ex: https://meusite.com/?superadmin=intimalab
 */
export const getSuperAdminUrl = (): string => {
  const base = getAppBaseUrl();
  return `${base}?superadmin=${SUPERADMIN_ACCESS_KEY}`;
};

/**
 * Lê os parâmetros da URL atual para determinar loja e rota
 */
export const parseInitialUrlRoute = (): {
  route: 'store' | 'merchant' | 'superadmin' | null;
  storeSlug: string | null;
} => {
  if (typeof window === 'undefined') {
    return { route: null, storeSlug: null };
  }

  const searchParams = new URLSearchParams(window.location.search);

  // 1. Super Admin (Dono do App)
  if (searchParams.has('superadmin') || searchParams.has('master')) {
    return { route: 'superadmin', storeSlug: null };
  }

  // 2. Admin Lojista
  const adminParam = searchParams.get('admin') || searchParams.get('painel');
  if (adminParam) {
    return { route: 'merchant', storeSlug: adminParam };
  }

  // 3. Catálogo do Cliente
  const storeParam = searchParams.get('store') || searchParams.get('loja');
  if (storeParam) {
    return { route: 'store', storeSlug: storeParam };
  }

  return { route: null, storeSlug: null };
};

/**
 * Sincroniza a barra de endereço com o estado atual sem recarregar a página
 */
export const syncUrlWithAppState = (
  route: 'store' | 'merchant' | 'superadmin',
  storeSlug?: string
) => {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  // Limpar parâmetros anteriores
  url.searchParams.delete('store');
  url.searchParams.delete('admin');
  url.searchParams.delete('superadmin');
  url.searchParams.delete('master');
  url.searchParams.delete('loja');
  url.searchParams.delete('painel');

  if (route === 'superadmin') {
    url.searchParams.set('superadmin', SUPERADMIN_ACCESS_KEY);
  } else if (route === 'merchant' && storeSlug) {
    url.searchParams.set('admin', storeSlug);
  } else if (storeSlug) {
    url.searchParams.set('store', storeSlug);
  }

  window.history.replaceState({}, '', url.toString());
};

/**
 * Gera o link direto para falar com o Suporte (Dono do App) no WhatsApp
 * em caso de bloqueio por tentativas excessivas de senha
 */
export const getWhatsAppSupportLink = (
  supportPhone: string,
  storeName: string,
  storeId: string,
  reason: 'blocked_password' | 'general' = 'blocked_password'
): string => {
  const cleanPhone = supportPhone.replace(/\D/g, '') || DEFAULT_SUPPORT_WHATSAPP;
  
  let message = '';
  if (reason === 'blocked_password') {
    message = `Olá Suporte do Intima Lab! 👋\n\nSou responsável pela loja *${storeName}* (ID: ${storeId}) e o meu acesso foi *BLOQUEADO* por limite de tentativas de senha.\n\nPreciso de auxílio para desbloquear e redefinir meu acesso.`;
  } else {
    message = `Olá Suporte do Intima Lab! Gostaria de tirar uma dúvida sobre a loja *${storeName}*.`;
  }

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};
