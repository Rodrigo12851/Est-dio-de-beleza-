export type DeliveryType = 'delivery' | 'pickup';

export type OrderStatus = 'pendente' | 'confirmado' | 'enviado' | 'concluido' | 'cancelado';

export type PaymentMethod = 'whatsapp' | 'pix' | 'cartao_credito' | 'dinheiro';

export type AppRoute = 'store' | 'merchant' | 'superadmin';

export type StorePalette = 'dark-allure' | 'light-rose' | 'champagne' | 'rouge';

export interface Category {
  id: string;
  storeId?: string; // Multi-tenant isolation
  name: string;
  slug: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
}

export interface ProductVariant {
  id: string;
  productId: string;
  size: string; // P, M, G, GG, 40, 42, 44, 46, Único
  color: string; // Preto Clássico, Branco Noiva, Romance Rose, Vermelho Rubi, etc.
  colorHex?: string; // #000000, #FFFFFF, #E3A857, etc.
  colorImage?: string; // Foto ou amostra da cor/tecido da galeria
  stockQuantity: number;
  sku?: string;
}

export interface Product {
  id: string;
  storeId?: string; // Multi-tenant isolation
  categoryId: string;
  name: string;
  description: string;
  price: number;
  promoPrice?: number;
  images: string[];
  variants: ProductVariant[];
  isActive: boolean;
  featured: boolean;
  createdAt: string;

  // New Arrivals (Novidades no Catálogo)
  isNewArrival?: boolean; // Marcar como novidade
  newArrivalDays?: number; // Dias determinados que deve permanecer nas novidades
  newArrivalUntil?: string; // Data limite calculada (ISO)
  newArrivalBadge?: string; // Ex: 'Acabou de chegar no estoque', 'Lançamento'
}

export interface CartItem {
  id: string; // unique hash (productId + variantId)
  product: Product;
  variant: ProductVariant;
  quantity: number;
  unitPrice: number;
}

export interface DeliveryAddress {
  zipCode: string; // CEP
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  variantId: string;
  size: string;
  color: string;
  colorHex?: string;
  colorImage?: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  image: string;
}

export interface Order {
  id: string;
  storeId?: string; // Multi-tenant isolation
  orderNumber: string; // ex: PED-8492
  customerName: string;
  customerWhatsapp: string;
  deliveryType: DeliveryType;
  address?: DeliveryAddress;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
}

export interface StoreConfig {
  name: string;
  tagline: string;
  ownerName: string;
  phone: string;
  whatsapp: string; // digits only for wa.me, e.g. 5511999998888
  instagram: string;
  address: string;
  pickupInstructions: string;
  pixKey: string;
  enableOnlinePayment: boolean; // Flag de Controle Global
  announcementBar: string;
  adminPin: string;
  logo?: string;
  bannerImage?: string;
  isBlocked?: boolean;
  failedLoginAttempts?: number;
}

export interface Store {
  id: string;
  slug: string;
  name: string;
  ownerName: string;
  email?: string;
  phone: string;
  whatsapp: string;
  adminPin: string;
  status: 'active' | 'suspended' | 'trial' | 'blocked';
  plan: 'standard' | 'pro' | 'enterprise';
  createdAt: string;
  config: StoreConfig;
  failedLoginAttempts?: number;
  isBlocked?: boolean;
}

export interface PlatformMetrics {
  totalStores: number;
  activeStores: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

