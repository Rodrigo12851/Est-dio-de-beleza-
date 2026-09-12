import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  onSnapshot,
  deleteDoc,
  updateDoc,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { StoreConfig, Category, Product, Order, Store } from '../types';
import {
  initialStoreConfig,
  initialStores,
  initialCategories,
  initialProducts,
  initialOrders,
} from '../data/initialData';

// Firestore Collection Names
export const COLLECTIONS = {
  STORES: 'stores',
  STORE_CONFIG: 'store_config',
  CATEGORIES: 'categories',
  PRODUCTS: 'products',
  ORDERS: 'orders',
};

const CONFIG_DOC_ID = 'settings';
export const DEFAULT_STORE_ID = 'store-bella';

// Helper to remove undefined properties before saving to Firestore
export function sanitizeData<T extends Record<string, any>>(data: T): T {
  const clean = { ...data };
  Object.keys(clean).forEach((key) => {
    if (clean[key] === undefined) {
      delete clean[key];
    }
  });
  return clean;
}

// ==========================================
// 0. Multi-Tenant Stores Management
// ==========================================
export function subscribeToStores(
  onData: (stores: Store[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const colRef = collection(db, COLLECTIONS.STORES);

  return onSnapshot(
    colRef,
    (snap) => {
      if (snap.empty) {
        seedStores().catch(console.error);
        onData(initialStores);
      } else {
        const list: Store[] = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as Omit<Store, 'id'>) });
        });
        list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        onData(list);
      }
    },
    (err) => {
      console.warn('Firestore stores subscription error (offline fallback):', err);
      onData(initialStores);
      if (onError) onError(err);
    }
  );
}

export async function seedStores(): Promise<void> {
  const batch = writeBatch(db);
  for (const store of initialStores) {
    const docRef = doc(db, COLLECTIONS.STORES, store.id);
    batch.set(docRef, sanitizeData(store));
  }
  await batch.commit();
}

export async function saveStoreToDb(store: Store): Promise<void> {
  const docRef = doc(db, COLLECTIONS.STORES, store.id);
  await setDoc(docRef, sanitizeData(store), { merge: true });
}

export async function deleteStoreFromDb(id: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.STORES, id);
  await deleteDoc(docRef);
}

// ==========================================
// 1. Store Config Sync (Per-Store or Legacy)
// ==========================================
export function subscribeToStoreConfig(
  storeId: string = DEFAULT_STORE_ID,
  onData: (config: StoreConfig) => void,
  onError?: (err: any) => void
): Unsubscribe {
  // If store-bella, maintain backwards-compatibility with legacy doc
  const configDocRef =
    storeId === DEFAULT_STORE_ID
      ? doc(db, COLLECTIONS.STORE_CONFIG, CONFIG_DOC_ID)
      : doc(db, COLLECTIONS.STORE_CONFIG, storeId);

  return onSnapshot(
    configDocRef,
    (snap) => {
      if (snap.exists()) {
        onData(snap.data() as StoreConfig);
      } else {
        const fallbackConfig =
          initialStores.find((s) => s.id === storeId)?.config || initialStoreConfig;
        setDoc(configDocRef, sanitizeData(fallbackConfig)).catch(console.error);
        onData(fallbackConfig);
      }
    },
    (err) => {
      console.warn('Firestore config subscription error:', err);
      const fallbackConfig =
        initialStores.find((s) => s.id === storeId)?.config || initialStoreConfig;
      onData(fallbackConfig);
      if (onError) onError(err);
    }
  );
}

export async function saveStoreConfigToDb(
  newConfig: StoreConfig,
  storeId: string = DEFAULT_STORE_ID
): Promise<void> {
  const configDocRef =
    storeId === DEFAULT_STORE_ID
      ? doc(db, COLLECTIONS.STORE_CONFIG, CONFIG_DOC_ID)
      : doc(db, COLLECTIONS.STORE_CONFIG, storeId);

  await setDoc(configDocRef, sanitizeData(newConfig), { merge: true });

  // Also update store document config if exists
  const storeDocRef = doc(db, COLLECTIONS.STORES, storeId);
  try {
    await setDoc(storeDocRef, { config: sanitizeData(newConfig) }, { merge: true });
  } catch {
    // optional sync
  }
}

// ==========================================
// 2. Categories Sync (Multi-Tenant)
// ==========================================
export function subscribeToCategories(
  storeId: string = DEFAULT_STORE_ID,
  onData: (categories: Category[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const colRef = collection(db, COLLECTIONS.CATEGORIES);

  return onSnapshot(
    colRef,
    (snap) => {
      if (snap.empty) {
        seedCategories().catch(console.error);
        onData(initialCategories.filter((c) => !c.storeId || c.storeId === storeId));
      } else {
        const list: Category[] = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as Omit<Category, 'id'>) });
        });

        // Filter by storeId or allow all if superadmin ('*')
        const filtered =
          storeId === '*'
            ? list
            : list.filter(
                (c) =>
                  c.storeId === storeId || (!c.storeId && storeId === DEFAULT_STORE_ID)
              );

        filtered.sort((a, b) => a.order - b.order);
        onData(filtered);
      }
    },
    (err) => {
      console.warn('Firestore categories subscription error:', err);
      onData(initialCategories.filter((c) => !c.storeId || c.storeId === storeId));
      if (onError) onError(err);
    }
  );
}

export async function seedCategories(): Promise<void> {
  const batch = writeBatch(db);
  for (const cat of initialCategories) {
    const docRef = doc(db, COLLECTIONS.CATEGORIES, cat.id);
    batch.set(docRef, sanitizeData({ ...cat, storeId: cat.storeId || DEFAULT_STORE_ID }));
  }
  await batch.commit();
}

export async function saveCategoryToDb(category: Category, storeId: string = DEFAULT_STORE_ID): Promise<void> {
  const docRef = doc(db, COLLECTIONS.CATEGORIES, category.id);
  const data = sanitizeData({
    ...category,
    storeId: category.storeId || storeId,
  });
  await setDoc(docRef, data);
}

export async function deleteCategoryFromDb(id: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.CATEGORIES, id);
  await deleteDoc(docRef);
}

// ==========================================
// 3. Products Sync (Multi-Tenant + Novidades)
// ==========================================
export function subscribeToProducts(
  storeId: string = DEFAULT_STORE_ID,
  onData: (products: Product[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const colRef = collection(db, COLLECTIONS.PRODUCTS);

  return onSnapshot(
    colRef,
    (snap) => {
      if (snap.empty) {
        seedProducts().catch(console.error);
        onData(initialProducts.filter((p) => !p.storeId || p.storeId === storeId));
      } else {
        const list: Product[] = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as Omit<Product, 'id'>) });
        });

        // Multi-tenant store isolation filter
        const filtered =
          storeId === '*'
            ? list
            : list.filter(
                (p) =>
                  p.storeId === storeId || (!p.storeId && storeId === DEFAULT_STORE_ID)
              );

        onData(filtered);
      }
    },
    (err) => {
      console.warn('Firestore products subscription error:', err);
      onData(initialProducts.filter((p) => !p.storeId || p.storeId === storeId));
      if (onError) onError(err);
    }
  );
}

export async function seedProducts(): Promise<void> {
  const batch = writeBatch(db);
  for (const prod of initialProducts) {
    const docRef = doc(db, COLLECTIONS.PRODUCTS, prod.id);
    batch.set(docRef, sanitizeData({ ...prod, storeId: prod.storeId || DEFAULT_STORE_ID }));
  }
  await batch.commit();
}

export async function saveProductToDb(product: Product, storeId: string = DEFAULT_STORE_ID): Promise<void> {
  const docRef = doc(db, COLLECTIONS.PRODUCTS, product.id);
  const data = sanitizeData({
    ...product,
    storeId: product.storeId || storeId,
  });
  await setDoc(docRef, data);
}

export async function deleteProductFromDb(id: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.PRODUCTS, id);
  await deleteDoc(docRef);
}

// ==========================================
// 4. Orders Sync (Multi-Tenant Isolation)
// ==========================================
export function subscribeToOrders(
  storeId: string = DEFAULT_STORE_ID,
  onData: (orders: Order[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const colRef = collection(db, COLLECTIONS.ORDERS);

  return onSnapshot(
    colRef,
    (snap) => {
      if (snap.empty) {
        seedOrders().catch(console.error);
        onData(initialOrders.filter((o) => !o.storeId || o.storeId === storeId));
      } else {
        const list: Order[] = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as Omit<Order, 'id'>) });
        });

        // Multi-tenant store isolation filter
        const filtered =
          storeId === '*'
            ? list
            : list.filter(
                (o) =>
                  o.storeId === storeId || (!o.storeId && storeId === DEFAULT_STORE_ID)
              );

        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onData(filtered);
      }
    },
    (err) => {
      console.warn('Firestore orders subscription error:', err);
      onData(initialOrders.filter((o) => !o.storeId || o.storeId === storeId));
      if (onError) onError(err);
    }
  );
}

export async function seedOrders(): Promise<void> {
  const batch = writeBatch(db);
  for (const ord of initialOrders) {
    const docRef = doc(db, COLLECTIONS.ORDERS, ord.id);
    batch.set(docRef, sanitizeData({ ...ord, storeId: ord.storeId || DEFAULT_STORE_ID }));
  }
  await batch.commit();
}

export async function saveOrderToDb(order: Order, storeId: string = DEFAULT_STORE_ID): Promise<void> {
  const docRef = doc(db, COLLECTIONS.ORDERS, order.id);
  const data = sanitizeData({
    ...order,
    storeId: order.storeId || storeId,
  });
  await setDoc(docRef, data);
}

export async function updateOrderStatusInDb(id: string, status: Order['status']): Promise<void> {
  const docRef = doc(db, COLLECTIONS.ORDERS, id);
  await updateDoc(docRef, { status });
}

export async function deleteOrderFromDb(id: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.ORDERS, id);
  await deleteDoc(docRef);
}

// Reset data in DB for testing
export async function resetAllDataInDb(): Promise<void> {
  await seedStores();
  await saveStoreConfigToDb(initialStoreConfig, DEFAULT_STORE_ID);
  await seedCategories();
  await seedProducts();
  await seedOrders();
}
