import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import {
  Category,
  Product,
  ProductVariant,
  Order,
  OrderStatus,
  CartItem,
  StoreConfig,
  Store,
  AppRoute,
  StorePalette,
} from '../types';
import {
  subscribeToStores,
  saveStoreToDb,
  subscribeToStoreConfig,
  saveStoreConfigToDb,
  subscribeToCategories,
  saveCategoryToDb,
  deleteCategoryFromDb,
  subscribeToProducts,
  saveProductToDb,
  deleteProductFromDb,
  subscribeToOrders,
  saveOrderToDb,
  updateOrderStatusInDb,
  deleteOrderFromDb,
  resetAllDataInDb,
  DEFAULT_STORE_ID,
} from '../services/firestoreService';
import {
  initialStores,
  initialStoreConfig,
  initialCategories,
  initialProducts,
  initialOrders,
} from '../data/initialData';
import { notificationSound } from '../utils/audioNotification';
import {
  parseInitialUrlRoute,
  syncUrlWithAppState,
  DEFAULT_SUPPORT_WHATSAPP,
} from '../utils/storeRouting';

export type AdminTab = 'dashboard' | 'orders' | 'products' | 'categories' | 'settings';
export type SuperAdminTab = 'stores' | 'metrics' | 'audit' | 'settings';

export const MAX_LOGIN_ATTEMPTS = 4;

export interface MerchantLoginResult {
  success: boolean;
  blocked: boolean;
  remaining: number;
}

interface StoreContextType {
  // 3-Tier Routing
  appRoute: AppRoute;
  setAppRoute: (route: AppRoute) => void;

  // Stores (Multi-tenancy)
  allStores: Store[];
  currentStoreId: string;
  currentStore: Store;
  selectStore: (storeId: string) => void;
  saveStore: (store: Store) => Promise<void>;
  createNewStore: (storeData: Partial<Store>) => Promise<Store>;
  updateStoreStatus: (storeId: string, status: Store['status']) => Promise<void>;

  // Current Store Data
  config: StoreConfig;
  categories: Category[];
  products: Product[];
  orders: Order[];

  // Novidades / New Arrivals
  newArrivals: Product[];
  filterNovidadesOnly: boolean;
  setFilterNovidadesOnly: (active: boolean) => void;

  // Catalog Navigation & Filters
  selectedCategory: string | null;
  setSelectedCategory: (slug: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredProducts: Product[];

  // Cart Management
  cart: CartItem[];
  addToCart: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  cartItemCount: number;
  cartSubtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;

  // Checkout & Order creation
  createOrder: (orderInput: {
    customerName: string;
    customerWhatsapp: string;
    deliveryType: 'delivery' | 'pickup';
    address?: {
      zipCode: string;
      street: string;
      number: string;
      complement?: string;
      neighborhood: string;
      city: string;
      state: string;
    };
    paymentMethod: 'whatsapp' | 'pix' | 'cartao_credito' | 'dinheiro';
    notes?: string;
  }) => Promise<Order>;

  // Merchant Admin (Lojista)
  adminTab: AdminTab;
  setAdminTab: (tab: AdminTab) => void;
  isMerchantAuthenticated: boolean;
  merchantLogin: (pin: string, storeId?: string) => MerchantLoginResult;
  merchantLogout: () => void;
  changeStorePassword: (
    currentPin: string,
    newPin: string,
    storeId?: string
  ) => Promise<{ success: boolean; message: string }>;

  // Super Admin & Governance
  superAdminTab: SuperAdminTab;
  setSuperAdminTab: (tab: SuperAdminTab) => void;
  isSuperAdminAuthenticated: boolean;
  superAdminLogin: (pin: string) => boolean;
  superAdminLogout: () => void;
  adminResetStorePassword: (storeId: string, newPin: string) => Promise<void>;

  // Security & Brute-force block controls
  isStoreBlocked: (storeId: string) => boolean;
  getRemainingAttempts: (storeId: string) => number;
  unblockStore: (storeId: string) => Promise<void>;
  supportWhatsapp: string;
  setSupportWhatsapp: (phone: string) => void;

  // Legacy compatibility mappings
  viewMode: 'store' | 'admin';
  setViewMode: (mode: 'store' | 'admin') => void;
  isAdminAuthenticated: boolean;
  adminLogin: (pin: string) => boolean;
  adminLogout: () => void;

  // Store Management Actions (Scoped to currentStoreId)
  saveProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  saveCategory: (category: Category) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  updateConfig: (newConfig: Partial<StoreConfig>) => Promise<void>;
  resetToDefaults: () => Promise<void>;

  // Theme & Color Palette Selection
  palette: StorePalette;
  setPalette: (palette: StorePalette) => void;

  // Live order alert for owner
  lastCreatedOrder: Order | null;
  clearOrderNotification: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const LOCAL_STORAGE_KEYS = {
  CURRENT_STORE_ID: 'lingerie_current_store_id',
  APP_ROUTE: 'lingerie_app_route',
  CART: 'bella_cart',
  CONFIG: 'bella_store_config',
  MERCHANT_AUTH: 'bella_merchant_auth',
  SUPER_ADMIN_AUTH: 'bella_super_admin_auth',
  FAILED_ATTEMPTS: 'intimalab_failed_attempts',
  SUPPORT_WHATSAPP: 'intimalab_support_whatsapp',
};

export const SUPER_ADMIN_PIN = '9999';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 3-Tier Routing state
  const [appRoute, setAppRouteState] = useState<AppRoute>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.APP_ROUTE);
    if (saved === 'store' || saved === 'merchant' || saved === 'superadmin') {
      return saved as AppRoute;
    }
    return 'store';
  });

  const setAppRoute = (route: AppRoute) => {
    setAppRouteState(route);
    localStorage.setItem(LOCAL_STORAGE_KEYS.APP_ROUTE, route);
  };

  // Multi-tenancy Stores
  const [allStores, setAllStores] = useState<Store[]>(initialStores);
  const [currentStoreId, setCurrentStoreId] = useState<string>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CURRENT_STORE_ID);
    return saved || DEFAULT_STORE_ID;
  });

  // Security: Failed Login Attempts per Store (Brute Force Protection)
  const [failedAttempts, setFailedAttempts] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.FAILED_ATTEMPTS);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Support WhatsApp for App Owner / Intima Lab Central
  const [supportWhatsapp, setSupportWhatsappState] = useState<string>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.SUPPORT_WHATSAPP) || DEFAULT_SUPPORT_WHATSAPP;
  });

  const setSupportWhatsapp = (phone: string) => {
    const clean = phone.replace(/\D/g, '');
    setSupportWhatsappState(clean);
    localStorage.setItem(LOCAL_STORAGE_KEYS.SUPPORT_WHATSAPP, clean);
  };

  // URL Routing detection on startup
  useEffect(() => {
    const initialUrl = parseInitialUrlRoute();
    if (initialUrl.route === 'superadmin') {
      setAppRouteState('superadmin');
      localStorage.setItem(LOCAL_STORAGE_KEYS.APP_ROUTE, 'superadmin');
    } else if (initialUrl.route === 'merchant') {
      setAppRouteState('merchant');
      localStorage.setItem(LOCAL_STORAGE_KEYS.APP_ROUTE, 'merchant');
      if (initialUrl.storeSlug) {
        const found = allStores.find(
          (s) => s.slug === initialUrl.storeSlug || s.id === initialUrl.storeSlug
        );
        if (found) {
          selectStore(found.id);
        }
      }
    } else if (initialUrl.route === 'store' && initialUrl.storeSlug) {
      const found = allStores.find(
        (s) => s.slug === initialUrl.storeSlug || s.id === initialUrl.storeSlug
      );
      if (found) {
        selectStore(found.id);
        setAppRouteState('store');
        localStorage.setItem(LOCAL_STORAGE_KEYS.APP_ROUTE, 'store');
      }
    }
  }, [allStores]);

  // User Theme / Palette state (Dark Allure, Boutique Rosé & Nude de antes, Champanhe, Sensual Rouge)
  const [palette, setPaletteState] = useState<StorePalette>(() => {
    const saved = localStorage.getItem('allure_selected_palette');
    if (saved === 'dark-allure' || saved === 'light-rose' || saved === 'champagne' || saved === 'rouge') {
      return saved as StorePalette;
    }
    return 'dark-allure';
  });

  const setPalette = (newPalette: StorePalette) => {
    setPaletteState(newPalette);
    localStorage.setItem('allure_selected_palette', newPalette);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', palette);
  }, [palette]);

  const selectStore = (storeId: string) => {
    setCurrentStoreId(storeId);
    localStorage.setItem(LOCAL_STORAGE_KEYS.CURRENT_STORE_ID, storeId);
  };

  // Find active store object
  const currentStore = useMemo(() => {
    return allStores.find((s) => s.id === currentStoreId) || initialStores[0];
  }, [allStores, currentStoreId]);

  // Config for current store
  const [config, setConfig] = useState<StoreConfig>(() => {
    return currentStore?.config || initialStoreConfig;
  });

  // Data collections for current store
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  // Filters & Novidades toggle
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filterNovidadesOnly, setFilterNovidadesOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Admin tabs & Auth
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [superAdminTab, setSuperAdminTab] = useState<SuperAdminTab>('stores');

  const [isMerchantAuthenticated, setIsMerchantAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.MERCHANT_AUTH) === 'true';
  });

  const [isSuperAdminAuthenticated, setIsSuperAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.SUPER_ADMIN_AUTH) === 'true';
  });

  // Live Notification for store owner
  const [lastCreatedOrder, setLastCreatedOrder] = useState<Order | null>(null);
  const knownOrderIdsRef = useRef<Set<string>>(new Set());
  const isFirstLoadRef = useRef<boolean>(true);

  // Persist cart
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  // Subscribe to Stores list
  useEffect(() => {
    const unsubStores = subscribeToStores((storesList) => {
      if (storesList && storesList.length > 0) {
        setAllStores(storesList);
      }
    });
    return () => unsubStores();
  }, []);

  // Subscribe to Current Store specific Data (Multi-Tenant isolation)
  useEffect(() => {
    // When currentStore changes, update config
    if (currentStore?.config) {
      setConfig(currentStore.config);
    }

    const unsubConfig = subscribeToStoreConfig(currentStoreId, (data) => {
      if (data) {
        setConfig(data);
      }
    });

    const unsubCategories = subscribeToCategories(currentStoreId, (data) => {
      if (data) {
        setCategories(data);
      }
    });

    const unsubProducts = subscribeToProducts(currentStoreId, (data) => {
      if (data) {
        setProducts(data);
      }
    });

    const unsubOrders = subscribeToOrders(currentStoreId, (data) => {
      if (data) {
        // Detect incoming order in real-time
        if (!isFirstLoadRef.current && knownOrderIdsRef.current.size > 0) {
          const newOrds = data.filter((o) => !knownOrderIdsRef.current.has(o.id));
          if (newOrds.length > 0 && (appRoute === 'merchant' || appRoute === 'superadmin')) {
            const newest = newOrds[0];
            notificationSound.playBookingRingtone();
            notificationSound.showSystemNotification(
              `Novo Pedido! 🛍️ ${currentStore.name}`,
              `${newest.customerName} fez o pedido #${newest.orderNumber} no valor de R$ ${newest.totalAmount.toFixed(2).replace('.', ',')}`,
              '/icon.svg',
              { orderId: newest.id }
            );
            setLastCreatedOrder(newest);
          }
        }

        data.forEach((o) => knownOrderIdsRef.current.add(o.id));
        isFirstLoadRef.current = false;
        setOrders(data);
      }
    });

    return () => {
      unsubConfig();
      unsubCategories();
      unsubProducts();
      unsubOrders();
    };
  }, [currentStoreId, currentStore.name]);

  // Novidades (New Arrivals) active list
  const newArrivals = useMemo(() => {
    const now = new Date();
    return products.filter((p) => {
      if (!p.isActive || !p.isNewArrival) return false;
      if (p.newArrivalUntil) {
        return new Date(p.newArrivalUntil) >= now;
      }
      return true;
    });
  }, [products]);

  // Filtered Products computation
  const filteredProducts = useMemo(() => {
    const now = new Date();
    return products.filter((p) => {
      if (!p.isActive) return false;

      // Novidades filter
      if (filterNovidadesOnly) {
        if (!p.isNewArrival) return false;
        if (p.newArrivalUntil && new Date(p.newArrivalUntil) < now) return false;
      }

      // Category filter
      if (selectedCategory && selectedCategory !== 'all') {
        const catObj = categories.find((c) => c.slug === selectedCategory || c.id === selectedCategory);
        if (catObj && p.categoryId !== catObj.id) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        const matchesVariant = p.variants.some((v) =>
          v.color.toLowerCase().includes(q) || v.size.toLowerCase().includes(q)
        );
        if (!matchesName && !matchesDesc && !matchesVariant) {
          return false;
        }
      }

      return true;
    });
  }, [products, categories, selectedCategory, filterNovidadesOnly, searchQuery]);

  // Cart operations
  const addToCart = (product: Product, variant: ProductVariant, quantity = 1) => {
    const cartItemId = `${product.id}-${variant.id}`;
    const unitPrice = product.promoPrice && product.promoPrice > 0 ? product.promoPrice : product.price;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.id === cartItemId
            ? { ...item, quantity: Math.min(item.quantity + quantity, variant.stockQuantity || 99) }
            : item
        );
      }
      return [
        ...prev,
        {
          id: cartItemId,
          product,
          variant,
          quantity,
          unitPrice,
        },
      ];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === cartItemId
          ? { ...item, quantity: Math.min(quantity, item.variant.stockQuantity || 99) }
          : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const cartItemCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

  const cartSubtotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0),
    [cart]
  );

  // URL Sync whenever route or currentStore changes
  useEffect(() => {
    syncUrlWithAppState(appRoute, currentStore?.slug || currentStore?.id);
  }, [appRoute, currentStore?.slug, currentStore?.id]);

  // Security: Brute Force & Block Controls
  const isStoreBlocked = (storeId: string): boolean => {
    const attempts = failedAttempts[storeId] || 0;
    const store = allStores.find((s) => s.id === storeId);
    return attempts >= MAX_LOGIN_ATTEMPTS || store?.isBlocked === true || store?.status === 'blocked';
  };

  const getRemainingAttempts = (storeId: string): number => {
    const attempts = failedAttempts[storeId] || 0;
    return Math.max(0, MAX_LOGIN_ATTEMPTS - attempts);
  };

  const unblockStore = async (storeId: string) => {
    const updated = { ...failedAttempts, [storeId]: 0 };
    setFailedAttempts(updated);
    localStorage.setItem(LOCAL_STORAGE_KEYS.FAILED_ATTEMPTS, JSON.stringify(updated));

    const store = allStores.find((s) => s.id === storeId);
    if (store && (store.isBlocked || store.status === 'blocked')) {
      const unblockedStore: Store = {
        ...store,
        isBlocked: false,
        failedLoginAttempts: 0,
        status: store.status === 'blocked' ? 'active' : store.status,
      };
      await saveStoreToDb(unblockedStore);
      setAllStores((prev) => prev.map((s) => (s.id === storeId ? unblockedStore : s)));
    }
  };

  // Merchant PIN / Password Auth with Lockout Protection
  const merchantLogin = (pin: string, storeId?: string): MerchantLoginResult => {
    const targetStoreId = storeId || currentStoreId;
    const targetStore = allStores.find((s) => s.id === targetStoreId) || currentStore;
    const storePin = targetStore?.adminPin || config.adminPin || '4321';

    // Check if store is already locked
    if (isStoreBlocked(targetStoreId)) {
      return { success: false, blocked: true, remaining: 0 };
    }

    // Success check
    if (pin.trim() === storePin.trim()) {
      unblockStore(targetStoreId);
      if (storeId) {
        selectStore(storeId);
      }
      setIsMerchantAuthenticated(true);
      localStorage.setItem(LOCAL_STORAGE_KEYS.MERCHANT_AUTH, 'true');
      return { success: true, blocked: false, remaining: MAX_LOGIN_ATTEMPTS };
    }

    // Failure: increment attempt count
    const currentAttempts = (failedAttempts[targetStoreId] || 0) + 1;
    const updatedAttempts = { ...failedAttempts, [targetStoreId]: currentAttempts };
    setFailedAttempts(updatedAttempts);
    localStorage.setItem(LOCAL_STORAGE_KEYS.FAILED_ATTEMPTS, JSON.stringify(updatedAttempts));

    const isNowBlocked = currentAttempts >= MAX_LOGIN_ATTEMPTS;
    const remaining = Math.max(0, MAX_LOGIN_ATTEMPTS - currentAttempts);

    if (isNowBlocked) {
      const blockedStore: Store = {
        ...targetStore,
        isBlocked: true,
        failedLoginAttempts: currentAttempts,
      };
      saveStoreToDb(blockedStore);
      setAllStores((prev) => prev.map((s) => (s.id === targetStoreId ? blockedStore : s)));
    }

    return {
      success: false,
      blocked: isNowBlocked,
      remaining,
    };
  };

  // Change Password Flow: Requires Previous Password ("senha de antes") + Confirmation
  // Synchronizes immediately with App Owner (Super Admin)
  const changeStorePassword = async (
    currentPin: string,
    newPin: string,
    storeId?: string
  ): Promise<{ success: boolean; message: string }> => {
    const targetStoreId = storeId || currentStoreId;
    const targetStore = allStores.find((s) => s.id === targetStoreId) || currentStore;
    const expectedCurrentPin = targetStore?.adminPin || config.adminPin || '4321';

    if (currentPin.trim() !== expectedCurrentPin.trim()) {
      return {
        success: false,
        message: 'A senha atual informada está incorreta.',
      };
    }

    const cleanNewPin = newPin.trim();
    if (cleanNewPin.length < 4) {
      return {
        success: false,
        message: 'A nova senha deve possuir pelo menos 4 caracteres.',
      };
    }

    // 1. Atualizar config da loja ativa
    if (targetStoreId === currentStoreId) {
      const updatedConfig = { ...config, adminPin: cleanNewPin, isBlocked: false };
      setConfig(updatedConfig);
      await saveStoreConfigToDb(updatedConfig, currentStoreId);
    }

    // 2. Atualizar o objeto Store central no banco e no estado multi-tenancy
    // Isso garante que no painel do Dono do App (Super Admin) a nova senha seja refletida instantaneamente!
    const updatedStore: Store = {
      ...targetStore,
      adminPin: cleanNewPin,
      isBlocked: false,
      failedLoginAttempts: 0,
      status: targetStore.status === 'blocked' ? 'active' : targetStore.status,
      config: {
        ...(targetStore.config || {}),
        adminPin: cleanNewPin,
        isBlocked: false,
      },
    };

    await saveStoreToDb(updatedStore);
    setAllStores((prev) => prev.map((s) => (s.id === targetStoreId ? updatedStore : s)));

    // 3. Desbloquear tentativas
    await unblockStore(targetStoreId);

    return {
      success: true,
      message: 'Senha alterada com sucesso! Atualizada também na central do Intima Lab.',
    };
  };

  // Super Admin can reset password of any store
  const adminResetStorePassword = async (storeId: string, newPin: string) => {
    const targetStore = allStores.find((s) => s.id === storeId);
    if (!targetStore) return;

    const cleanNewPin = newPin.trim();
    const updatedStore: Store = {
      ...targetStore,
      adminPin: cleanNewPin,
      isBlocked: false,
      failedLoginAttempts: 0,
      status: targetStore.status === 'blocked' ? 'active' : targetStore.status,
      config: {
        ...(targetStore.config || {}),
        adminPin: cleanNewPin,
        isBlocked: false,
      },
    };

    await saveStoreToDb(updatedStore);
    setAllStores((prev) => prev.map((s) => (s.id === storeId ? updatedStore : s)));

    if (storeId === currentStoreId) {
      const updatedConfig = { ...config, adminPin: cleanNewPin, isBlocked: false };
      setConfig(updatedConfig);
      await saveStoreConfigToDb(updatedConfig, storeId);
    }

    await unblockStore(storeId);
  };

  const merchantLogout = () => {
    setIsMerchantAuthenticated(false);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.MERCHANT_AUTH);
    setAppRoute('store');
  };

  // Super Admin Auth
  const superAdminLogin = (pin: string) => {
    if (pin.trim() === SUPER_ADMIN_PIN || pin === '9999') {
      setIsSuperAdminAuthenticated(true);
      localStorage.setItem(LOCAL_STORAGE_KEYS.SUPER_ADMIN_AUTH, 'true');
      return true;
    }
    return false;
  };

  const superAdminLogout = () => {
    setIsSuperAdminAuthenticated(false);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.SUPER_ADMIN_AUTH);
    setAppRoute('store');
  };

  // Legacy mappings for backwards-compatibility
  const viewMode: 'store' | 'admin' = appRoute === 'merchant' ? 'admin' : 'store';
  const setViewMode = (mode: 'store' | 'admin') => {
    setAppRoute(mode === 'admin' ? 'merchant' : 'store');
  };
  const isAdminAuthenticated = isMerchantAuthenticated;
  const adminLogin = (pin: string) => {
    const res = merchantLogin(pin);
    return res.success;
  };
  const adminLogout = () => merchantLogout();

  // Multi-Store Management actions
  const saveStore = async (store: Store) => {
    await saveStoreToDb(store);
    setAllStores((prev) => {
      const idx = prev.findIndex((s) => s.id === store.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = store;
        return updated;
      }
      return [...prev, store];
    });
  };

  const createNewStore = async (storeData: Partial<Store>): Promise<Store> => {
    const slug = storeData.slug || storeData.name?.toLowerCase().replace(/\s+/g, '-') || `loja-${Date.now()}`;
    const id = `store-${slug}`;
    const phone = storeData.phone || storeData.whatsapp || '11999999999';
    const whatsapp = storeData.whatsapp || phone;
    const adminPin = storeData.adminPin || '4321';
    const storeName = storeData.name || 'Nova Loja Parceira';

    const newStore: Store = {
      id,
      name: storeName,
      slug,
      ownerName: storeData.ownerName || 'Lojista',
      email: storeData.email || `${slug}@lingerie.com.br`,
      phone,
      whatsapp,
      adminPin,
      status: storeData.status || 'active',
      plan: (storeData.plan as any) || 'pro',
      createdAt: new Date().toISOString(),
      config: {
        ...initialStoreConfig,
        name: storeName,
        ownerName: storeData.ownerName || 'Lojista',
        phone,
        whatsapp,
        adminPin,
        enableOnlinePayment: false, // Inativo conforme requisito
      },
    };

    await saveStoreToDb(newStore);
    setAllStores((prev) => [...prev, newStore]);
    return newStore;
  };

  const updateStoreStatus = async (storeId: string, status: Store['status']) => {
    const existing = allStores.find((s) => s.id === storeId);
    if (existing) {
      const updated = { ...existing, status };
      await saveStoreToDb(updated);
      setAllStores((prev) => prev.map((s) => (s.id === storeId ? updated : s)));
    }
  };

  // Order creation (Checkout)
  const createOrder = async (orderInput: {
    customerName: string;
    customerWhatsapp: string;
    deliveryType: 'delivery' | 'pickup';
    address?: {
      zipCode: string;
      street: string;
      number: string;
      complement?: string;
      neighborhood: string;
      city: string;
      state: string;
    };
    paymentMethod: 'whatsapp' | 'pix' | 'cartao_credito' | 'dinheiro';
    notes?: string;
  }): Promise<Order> => {
    const orderNumber = `PED-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderId = `ord-${Date.now()}`;

    const orderItems = cart.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      variantId: item.variant.id,
      size: item.variant.size,
      color: item.variant.color,
      colorHex: item.variant.colorHex,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.unitPrice * item.quantity,
      image: item.product.images[0] || '',
    }));

    const subtotal = cartSubtotal;
    const discount = 0;
    const totalAmount = subtotal - discount;

    const newOrder: Order = {
      id: orderId,
      storeId: currentStoreId,
      orderNumber,
      customerName: orderInput.customerName.trim(),
      customerWhatsapp: orderInput.customerWhatsapp.replace(/\D/g, ''),
      deliveryType: orderInput.deliveryType,
      address: orderInput.deliveryType === 'delivery' ? orderInput.address : undefined,
      items: orderItems,
      subtotal,
      discount,
      totalAmount,
      status: 'pendente',
      paymentMethod: orderInput.paymentMethod,
      notes: orderInput.notes,
      createdAt: new Date().toISOString(),
    };

    // Save to Firestore with storeId isolation
    await saveOrderToDb(newOrder, currentStoreId);

    // Salvar ID do pedido no localStorage deste dispositivo para histórico do cliente
    try {
      const storageKey = `intimalab_client_orders_${currentStoreId}`;
      const savedOrders = JSON.parse(localStorage.getItem(storageKey) || '[]');
      if (!savedOrders.includes(newOrder.id)) {
        savedOrders.unshift(newOrder.id);
        localStorage.setItem(storageKey, JSON.stringify(savedOrders));
      }
    } catch {
      // ignore
    }

    // Decrement stock for ordered product variants
    for (const item of cart) {
      const prod = products.find((p) => p.id === item.product.id);
      if (prod) {
        const updatedVariants = prod.variants.map((v) => {
          if (v.id === item.variant.id) {
            return {
              ...v,
              stockQuantity: Math.max(0, v.stockQuantity - item.quantity),
            };
          }
          return v;
        });
        await saveProductToDb({ ...prod, variants: updatedVariants }, currentStoreId);
      }
    }

    // Trigger ringtone and notification ONLY for merchant or superadmin
    if (appRoute === 'merchant' || appRoute === 'superadmin') {
      notificationSound.playBookingRingtone();
      notificationSound.showSystemNotification(
        `Novo Pedido Recebido! 🛍️ ${currentStore.name}`,
        `${newOrder.customerName} fez o pedido #${newOrder.orderNumber} (R$ ${totalAmount.toFixed(2).replace('.', ',')})`,
        '/icon.svg',
        { orderId: newOrder.id }
      );
      setLastCreatedOrder(newOrder);
    }

    clearCart();

    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    await updateOrderStatusInDb(orderId, status);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
  };

  const deleteOrder = async (orderId: string) => {
    await deleteOrderFromDb(orderId);
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  // Product management with Novidades calculations
  const saveProduct = async (product: Product) => {
    const updatedProd = { ...product, storeId: product.storeId || currentStoreId };

    // Novidades calculation: if marked as newArrival with days specified, compute expiry date
    if (updatedProd.isNewArrival) {
      const days = updatedProd.newArrivalDays || 15;
      updatedProd.newArrivalDays = days;
      if (!updatedProd.newArrivalUntil) {
        const untilDate = new Date();
        untilDate.setDate(untilDate.getDate() + days);
        updatedProd.newArrivalUntil = untilDate.toISOString();
      }
      if (!updatedProd.newArrivalBadge) {
        updatedProd.newArrivalBadge = 'Novidade no Estoque';
      }
    }

    await saveProductToDb(updatedProd, currentStoreId);
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === updatedProd.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = updatedProd;
        return updated;
      }
      return [updatedProd, ...prev];
    });
  };

  const deleteProduct = async (productId: string) => {
    await deleteProductFromDb(productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const saveCategory = async (category: Category) => {
    const updatedCat = { ...category, storeId: category.storeId || currentStoreId };
    await saveCategoryToDb(updatedCat, currentStoreId);
    setCategories((prev) => {
      const idx = prev.findIndex((c) => c.id === updatedCat.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = updatedCat;
        return updated;
      }
      return [...prev, updatedCat];
    });
  };

  const deleteCategory = async (categoryId: string) => {
    await deleteCategoryFromDb(categoryId);
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
  };

  const updateConfig = async (newConfig: Partial<StoreConfig>) => {
    const merged = { ...config, ...newConfig };
    setConfig(merged);
    await saveStoreConfigToDb(merged, currentStoreId);

    // Se a senha foi atualizada no config, sincroniza imediatamente no Store central
    // para que o Dono do App (Super Admin) veja a nova senha instantaneamente!
    if (newConfig.adminPin) {
      const existing = allStores.find((s) => s.id === currentStoreId);
      if (existing) {
        const updatedStore: Store = {
          ...existing,
          adminPin: newConfig.adminPin,
          config: merged,
        };
        await saveStoreToDb(updatedStore);
        setAllStores((prev) => prev.map((s) => (s.id === currentStoreId ? updatedStore : s)));
      }
    }
  };

  const resetToDefaults = async () => {
    await resetAllDataInDb();
    setConfig(initialStoreConfig);
    setCategories(initialCategories);
    setProducts(initialProducts);
    setOrders(initialOrders);
    setAllStores(initialStores);
  };

  const clearOrderNotification = () => setLastCreatedOrder(null);

  return (
    <StoreContext.Provider
      value={{
        appRoute,
        setAppRoute,
        allStores,
        currentStoreId,
        currentStore,
        selectStore,
        saveStore,
        createNewStore,
        updateStoreStatus,
        config,
        categories,
        products,
        orders,
        newArrivals,
        filterNovidadesOnly,
        setFilterNovidadesOnly,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        filteredProducts,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartItemCount,
        cartSubtotal,
        isCartOpen,
        setIsCartOpen,
        createOrder,
        adminTab,
        setAdminTab,
        isMerchantAuthenticated,
        merchantLogin,
        merchantLogout,
        changeStorePassword,
        adminResetStorePassword,
        isStoreBlocked,
        getRemainingAttempts,
        unblockStore,
        supportWhatsapp,
        setSupportWhatsapp,
        superAdminTab,
        setSuperAdminTab,
        isSuperAdminAuthenticated,
        superAdminLogin,
        superAdminLogout,
        viewMode,
        setViewMode,
        isAdminAuthenticated,
        adminLogin,
        adminLogout,
        saveProduct,
        deleteProduct,
        saveCategory,
        deleteCategory,
        updateOrderStatus,
        deleteOrder,
        updateConfig,
        resetToDefaults,
        lastCreatedOrder,
        clearOrderNotification,
        palette,
        setPalette,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
