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
import {
  SalonConfig,
  Procedure,
  GalleryWork,
  Appointment,
  BlockedSlot,
  ClientProfile,
} from '../types';
import {
  initialSalonConfig,
  initialProcedures,
  initialGalleryWorks,
  initialAppointments,
  initialBlockedSlots,
  initialClients,
} from '../data/initialData';

// Firestore Collection Names
export const COLLECTIONS = {
  CONFIG: 'salon_config',
  PROCEDURES: 'procedures',
  GALLERY: 'gallery',
  APPOINTMENTS: 'appointments',
  BLOCKED_SLOTS: 'blocked_slots',
  CLIENTS: 'clients',
};

const CONFIG_DOC_ID = 'settings';

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

// 1. Config Sync
export function subscribeToSalonConfig(
  onData: (config: SalonConfig) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const configDocRef = doc(db, COLLECTIONS.CONFIG, CONFIG_DOC_ID);
  
  return onSnapshot(
    configDocRef,
    (snap) => {
      if (snap.exists()) {
        onData(snap.data() as SalonConfig);
      } else {
        // Seed initial config to database if it doesn't exist
        setDoc(configDocRef, sanitizeData(initialSalonConfig)).catch(console.error);
        onData(initialSalonConfig);
      }
    },
    (err) => {
      console.warn('Firestore config subscription error:', err);
      if (onError) onError(err);
    }
  );
}

export async function saveSalonConfigToDb(newConfig: SalonConfig): Promise<void> {
  const configDocRef = doc(db, COLLECTIONS.CONFIG, CONFIG_DOC_ID);
  await setDoc(configDocRef, sanitizeData(newConfig), { merge: true });
}

// 2. Procedures Sync
export function subscribeToProcedures(
  onData: (procedures: Procedure[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const colRef = collection(db, COLLECTIONS.PROCEDURES);

  return onSnapshot(
    colRef,
    (snap) => {
      if (snap.empty) {
        // Seed initial procedures
        seedProcedures().catch(console.error);
        onData(initialProcedures);
      } else {
        const list: Procedure[] = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as Omit<Procedure, 'id'>) });
        });
        onData(list);
      }
    },
    (err) => {
      console.warn('Firestore procedures subscription error:', err);
      if (onError) onError(err);
    }
  );
}

export async function seedProcedures(): Promise<void> {
  const batch = writeBatch(db);
  for (const proc of initialProcedures) {
    const docRef = doc(db, COLLECTIONS.PROCEDURES, proc.id);
    batch.set(docRef, sanitizeData(proc));
  }
  await batch.commit();
}

export async function saveProcedureToDb(procedure: Procedure): Promise<void> {
  const docRef = doc(db, COLLECTIONS.PROCEDURES, procedure.id);
  await setDoc(docRef, sanitizeData(procedure));
}

export async function deleteProcedureFromDb(id: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.PROCEDURES, id);
  await deleteDoc(docRef);
}

// 3. Gallery Sync
export function subscribeToGallery(
  onData: (gallery: GalleryWork[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const colRef = collection(db, COLLECTIONS.GALLERY);

  return onSnapshot(
    colRef,
    (snap) => {
      if (snap.empty) {
        seedGallery().catch(console.error);
        onData(initialGalleryWorks);
      } else {
        const list: GalleryWork[] = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as Omit<GalleryWork, 'id'>) });
        });
        onData(list);
      }
    },
    (err) => {
      console.warn('Firestore gallery subscription error:', err);
      if (onError) onError(err);
    }
  );
}

export async function seedGallery(): Promise<void> {
  const batch = writeBatch(db);
  for (const work of initialGalleryWorks) {
    const docRef = doc(db, COLLECTIONS.GALLERY, work.id);
    batch.set(docRef, sanitizeData(work));
  }
  await batch.commit();
}

export async function saveGalleryWorkToDb(work: GalleryWork): Promise<void> {
  const docRef = doc(db, COLLECTIONS.GALLERY, work.id);
  await setDoc(docRef, sanitizeData(work));
}

export async function deleteGalleryWorkFromDb(id: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.GALLERY, id);
  await deleteDoc(docRef);
}

// 4. Appointments Sync
export function subscribeToAppointments(
  onData: (appointments: Appointment[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const colRef = collection(db, COLLECTIONS.APPOINTMENTS);

  return onSnapshot(
    colRef,
    (snap) => {
      if (snap.empty) {
        seedAppointments().catch(console.error);
        onData(initialAppointments);
      } else {
        const list: Appointment[] = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as Omit<Appointment, 'id'>) });
        });
        // Sort by date and time descending
        list.sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
        onData(list);
      }
    },
    (err) => {
      console.warn('Firestore appointments subscription error:', err);
      if (onError) onError(err);
    }
  );
}

export async function seedAppointments(): Promise<void> {
  const batch = writeBatch(db);
  for (const apt of initialAppointments) {
    const docRef = doc(db, COLLECTIONS.APPOINTMENTS, apt.id);
    batch.set(docRef, sanitizeData(apt));
  }
  await batch.commit();
}

export async function saveAppointmentToDb(appointment: Appointment): Promise<void> {
  const docRef = doc(db, COLLECTIONS.APPOINTMENTS, appointment.id);
  await setDoc(docRef, sanitizeData(appointment));
}

export async function updateAppointmentInDb(id: string, updates: Partial<Appointment>): Promise<void> {
  const docRef = doc(db, COLLECTIONS.APPOINTMENTS, id);
  await updateDoc(docRef, sanitizeData(updates));
}

export async function deleteAppointmentFromDb(id: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.APPOINTMENTS, id);
  await deleteDoc(docRef);
}

// 5. Blocked Slots Sync
export function subscribeToBlockedSlots(
  onData: (slots: BlockedSlot[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const colRef = collection(db, COLLECTIONS.BLOCKED_SLOTS);

  return onSnapshot(
    colRef,
    (snap) => {
      if (snap.empty) {
        seedBlockedSlots().catch(console.error);
        onData(initialBlockedSlots);
      } else {
        const list: BlockedSlot[] = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as Omit<BlockedSlot, 'id'>) });
        });
        onData(list);
      }
    },
    (err) => {
      console.warn('Firestore blocked slots subscription error:', err);
      if (onError) onError(err);
    }
  );
}

export async function seedBlockedSlots(): Promise<void> {
  const batch = writeBatch(db);
  for (const slot of initialBlockedSlots) {
    const docRef = doc(db, COLLECTIONS.BLOCKED_SLOTS, slot.id);
    batch.set(docRef, sanitizeData(slot));
  }
  await batch.commit();
}

export async function saveBlockedSlotToDb(slot: BlockedSlot): Promise<void> {
  const docRef = doc(db, COLLECTIONS.BLOCKED_SLOTS, slot.id);
  await setDoc(docRef, sanitizeData(slot));
}

export async function deleteBlockedSlotFromDb(id: string): Promise<void> {
  const docRef = doc(db, COLLECTIONS.BLOCKED_SLOTS, id);
  await deleteDoc(docRef);
}

// 6. Clients Sync
export function subscribeToClients(
  onData: (clients: ClientProfile[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  const colRef = collection(db, COLLECTIONS.CLIENTS);

  return onSnapshot(
    colRef,
    (snap) => {
      if (snap.empty) {
        seedClients().catch(console.error);
        onData(initialClients);
      } else {
        const list: ClientProfile[] = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as Omit<ClientProfile, 'id'>) });
        });
        onData(list);
      }
    },
    (err) => {
      console.warn('Firestore clients subscription error:', err);
      if (onError) onError(err);
    }
  );
}

export async function seedClients(): Promise<void> {
  const batch = writeBatch(db);
  for (const client of initialClients) {
    const docRef = doc(db, COLLECTIONS.CLIENTS, client.id);
    batch.set(docRef, sanitizeData(client));
  }
  await batch.commit();
}

export async function saveClientToDb(client: ClientProfile): Promise<void> {
  const docRef = doc(db, COLLECTIONS.CLIENTS, client.id);
  await setDoc(docRef, sanitizeData(client));
}

// Reset / Re-seed all collections
export async function resetAllDataInDb(): Promise<void> {
  await saveSalonConfigToDb(initialSalonConfig);
  await seedProcedures();
  await seedGallery();
  await seedAppointments();
  await seedBlockedSlots();
  await seedClients();
}
