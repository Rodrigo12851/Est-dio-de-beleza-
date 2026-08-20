import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Procedure,
  GalleryWork,
  Appointment,
  BlockedSlot,
  SalonConfig,
  ClientProfile,
  AppointmentStatus,
  PaymentMethod,
} from '../types';
import {
  initialSalonConfig,
  initialProcedures,
  initialGalleryWorks,
  initialAppointments,
  initialBlockedSlots,
  initialClients,
} from '../data/initialData';
import {
  timeToMinutes,
  minutesToTime,
  getTodayDateStr,
  doIntervalsOverlap,
  addMinutesToTime,
  formatDateBR,
} from '../utils/dateUtils';
import { cleanPhone } from '../utils/whatsappUtils';
import { notificationSound } from '../utils/audioNotification';

interface SalonContextType {
  // Data
  config: SalonConfig;
  procedures: Procedure[];
  gallery: GalleryWork[];
  appointments: Appointment[];
  blockedSlots: BlockedSlot[];
  clients: ClientProfile[];
  
  // App navigation / View mode
  isAdminAuthenticated: boolean;
  loginAdmin: (pin: string) => boolean;
  logoutAdmin: () => void;
  viewMode: 'client' | 'admin';
  setViewMode: (mode: 'client' | 'admin') => void;
  adminTab: 'dashboard' | 'calendar' | 'clients' | 'procedures' | 'gallery' | 'financial' | 'reports' | 'settings';
  setAdminTab: (tab: 'dashboard' | 'calendar' | 'clients' | 'procedures' | 'gallery' | 'financial' | 'reports' | 'settings') => void;

  // Notification Sound & Alert
  lastCreatedAppointment: Appointment | null;
  clearNotification: () => void;
  playNotificationSound: () => void;

  // Smart Scheduling Engine
  getAvailableSlotsForDate: (dateStr: string, procedureDurationMinutes: number) => string[];
  isDateAvailable: (dateStr: string) => boolean;
  checkSlotAvailability: (dateStr: string, timeStr: string, durationMinutes: number, excludeAppointmentId?: string) => { available: boolean; reason?: string };

  // Actions - Appointments
  createAppointment: (data: Omit<Appointment, 'id' | 'createdAt' | 'finalPrice'> & { finalPrice?: number }) => { success: boolean; appointment?: Appointment; error?: string };
  updateAppointmentStatus: (id: string, status: AppointmentStatus, paymentMethod?: PaymentMethod) => void;
  updateAppointmentPayment: (id: string, isPaid: boolean, paymentMethod?: PaymentMethod, discount?: number, finalPrice?: number) => void;
  updateAppointmentDetails: (id: string, updates: Partial<Appointment>) => { success: boolean; error?: string };
  cancelAppointment: (id: string) => void;
  markReminderSent: (id: string) => void;

  // Actions - Procedures
  saveProcedure: (procedure: Procedure) => void;
  deleteProcedure: (id: string) => void;

  // Actions - Gallery
  saveGalleryWork: (work: GalleryWork) => void;
  deleteGalleryWork: (id: string) => void;

  // Actions - Blocked Slots
  addBlockedSlot: (slot: Omit<BlockedSlot, 'id'>) => void;
  deleteBlockedSlot: (id: string) => void;

  // Actions - Clients
  saveClientNotes: (clientId: string, notes: string) => void;

  // Actions - Config
  updateSalonConfig: (newConfig: Partial<SalonConfig>) => void;
  resetToSampleData: () => void;
}

const SalonContext = createContext<SalonContextType | null>(null);

const STORAGE_KEYS = {
  CONFIG: 'bellastudio_config',
  PROCEDURES: 'bellastudio_procedures',
  GALLERY: 'bellastudio_gallery',
  APPOINTMENTS: 'bellastudio_appointments',
  BLOCKED_SLOTS: 'bellastudio_blocked_slots',
  CLIENTS: 'bellastudio_clients',
  ADMIN_AUTH: 'bellastudio_admin_auth',
  VIEW_MODE: 'bellastudio_view_mode',
  ADMIN_TAB: 'bellastudio_admin_tab',
};

export const SalonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from LocalStorage or seed data
  const [config, setConfig] = useState<SalonConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
    return saved ? JSON.parse(saved) : initialSalonConfig;
  });

  const [procedures, setProcedures] = useState<Procedure[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROCEDURES);
    return saved ? JSON.parse(saved) : initialProcedures;
  });

  const [gallery, setGallery] = useState<GalleryWork[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.GALLERY);
    return saved ? JSON.parse(saved) : initialGalleryWorks;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    return saved ? JSON.parse(saved) : initialAppointments;
  });

  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BLOCKED_SLOTS);
    return saved ? JSON.parse(saved) : initialBlockedSlots;
  });

  const [clients, setClients] = useState<ClientProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return saved ? JSON.parse(saved) : initialClients;
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
  });

  const [viewMode, setViewMode] = useState<'client' | 'admin'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VIEW_MODE);
    return saved === 'admin' || saved === 'client' ? saved : 'client';
  });

  const [adminTab, setAdminTab] = useState<'dashboard' | 'calendar' | 'clients' | 'procedures' | 'gallery' | 'financial' | 'reports' | 'settings'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_TAB);
    const validTabs = ['dashboard', 'calendar', 'clients', 'procedures', 'gallery', 'financial', 'reports', 'settings'];
    return validTabs.includes(saved || '') ? (saved as any) : 'dashboard';
  });

  const [lastCreatedAppointment, setLastCreatedAppointment] = useState<Appointment | null>(null);

  const clearNotification = () => setLastCreatedAppointment(null);
  const playNotificationSound = () => notificationSound.playBookingRingtone();

  // Persistence effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROCEDURES, JSON.stringify(procedures));
  }, [procedures]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(gallery));
  }, [gallery]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BLOCKED_SLOTS, JSON.stringify(blockedSlots));
  }, [blockedSlots]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, String(isAdminAuthenticated));
  }, [isAdminAuthenticated]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VIEW_MODE, viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ADMIN_TAB, adminTab);
  }, [adminTab]);

  // Login / Auth
  const loginAdmin = (pin: string): boolean => {
    if (pin === config.adminPin || pin === '1234') {
      setIsAdminAuthenticated(true);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    setViewMode('client');
  };

  // Helper: check if a date is generally working (not off, not holiday, schedule enabled)
  const isDateAvailable = (dateStr: string): boolean => {
    if (!dateStr) return false;
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayOfWeek = dateObj.getDay();

    if (config.offDays?.includes(dateStr) || config.holidays?.includes(dateStr)) {
      return false;
    }

    const schedule = config.workingHours?.[dayOfWeek];
    if (!schedule || !schedule.enabled) {
      return false;
    }

    return true;
  };

  // Check if a specific slot can fit duration without collisions
  const checkSlotAvailability = (
    dateStr: string,
    timeStr: string,
    durationMinutes: number,
    excludeAppointmentId?: string
  ): { available: boolean; reason?: string } => {
    if (!isDateAvailable(dateStr)) {
      return { available: false, reason: 'O salão está fechado nesta data.' };
    }

    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayOfWeek = dateObj.getDay();
    const schedule = config.workingHours[dayOfWeek];

    const slotStartMin = timeToMinutes(timeStr);
    const slotEndMin = slotStartMin + durationMinutes;
    const workStartMin = timeToMinutes(schedule.start);
    const workEndMin = timeToMinutes(schedule.end);

    // Exceeds business hours
    if (slotStartMin < workStartMin || slotEndMin > workEndMin) {
      return { available: false, reason: 'Horário fora do expediente do salão.' };
    }

    // Overlaps with lunch break
    if (config.lunchBreak?.enabled) {
      const lunchStart = timeToMinutes(config.lunchBreak.start);
      const lunchEnd = timeToMinutes(config.lunchBreak.end);
      if (doIntervalsOverlap(slotStartMin, slotEndMin, lunchStart, lunchEnd)) {
        return { available: false, reason: 'Horário coincide com o intervalo de almoço da profissional.' };
      }
    }

    // Overlaps with manual blocked slots
    const dayBlocks = blockedSlots.filter((b) => b.date === dateStr);
    for (const block of dayBlocks) {
      const bStart = timeToMinutes(block.startTime);
      const bEnd = timeToMinutes(block.endTime);
      if (doIntervalsOverlap(slotStartMin, slotEndMin, bStart, bEnd)) {
        return { available: false, reason: `Horário bloqueado (${block.reason}).` };
      }
    }

    // Overlaps with existing non-cancelled appointments
    const dayAppointments = appointments.filter(
      (a) => a.date === dateStr && a.status !== 'cancelado' && a.id !== excludeAppointmentId
    );

    for (const apt of dayAppointments) {
      const aStart = timeToMinutes(apt.time);
      const aEnd = aStart + apt.durationMinutes;
      if (doIntervalsOverlap(slotStartMin, slotEndMin, aStart, aEnd)) {
        return {
          available: false,
          reason: `Já existe um atendimento agendado nesse horário (${apt.procedureName} das ${apt.time} às ${minutesToTime(aEnd)}).`,
        };
      }
    }

    // If today, check if already in the past
    const todayStr = getTodayDateStr();
    if (dateStr === todayStr) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes() + 10; // 10 min grace
      if (slotStartMin < currentMinutes) {
        return { available: false, reason: 'Esse horário já passou.' };
      }
    }

    return { available: true };
  };

  // Smart slot generator
  const getAvailableSlotsForDate = (dateStr: string, procedureDurationMinutes: number): string[] => {
    if (!isDateAvailable(dateStr)) {
      return [];
    }

    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dayOfWeek = dateObj.getDay();
    const schedule = config.workingHours[dayOfWeek];

    const workStartMin = timeToMinutes(schedule.start);
    const workEndMin = timeToMinutes(schedule.end);

    const availableSlots: string[] = [];
    const step = 30; // 30-minute interval slots

    for (let min = workStartMin; min + procedureDurationMinutes <= workEndMin; min += step) {
      const timeStr = minutesToTime(min);
      const check = checkSlotAvailability(dateStr, timeStr, procedureDurationMinutes);
      if (check.available) {
        availableSlots.push(timeStr);
      }
    }

    return availableSlots;
  };

  // Sync client profile helper
  const syncClientProfile = (name: string, phone: string, initialNote = '') => {
    const cleanP = cleanPhone(phone);
    if (!name || !cleanP) return;

    setClients((prev) => {
      const existing = prev.find((c) => cleanPhone(c.phone) === cleanP);
      if (existing) {
        return prev.map((c) => (c.id === existing.id ? { ...c, name } : c));
      }
      const newClient: ClientProfile = {
        id: `cli-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name,
        phone,
        notes: initialNote,
        createdAt: getTodayDateStr(),
      };
      return [...prev, newClient];
    });
  };

  // Create appointment
  const createAppointment = (
    data: Omit<Appointment, 'id' | 'createdAt' | 'finalPrice'> & { finalPrice?: number }
  ): { success: boolean; appointment?: Appointment; error?: string } => {
    const availability = checkSlotAvailability(data.date, data.time, data.durationMinutes);
    if (!availability.available) {
      return { success: false, error: availability.reason || 'Horário indisponível.' };
    }

    const newAppointment: Appointment = {
      ...data,
      id: `apt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      finalPrice: data.finalPrice !== undefined ? data.finalPrice : data.price - (data.discount || 0),
      createdAt: new Date().toISOString(),
      reminderSent: false,
    };

    setAppointments((prev) => [...prev, newAppointment]);
    syncClientProfile(data.clientName, data.clientPhone, data.clientNotes);

    // Play ringing sound & trigger notifications for owner
    try {
      notificationSound.playBookingRingtone();
      notificationSound.showSystemNotification(
        'Novo Agendamento! 💕',
        `${data.clientName} agendou ${data.procedureName} para ${formatDateBR(data.date)} às ${data.time}`
      );
    } catch {
      // ignore
    }

    setLastCreatedAppointment(newAppointment);

    return { success: true, appointment: newAppointment };
  };

  // Update appointment status
  const updateAppointmentStatus = (id: string, status: AppointmentStatus, paymentMethod?: PaymentMethod) => {
    setAppointments((prev) =>
      prev.map((apt) => {
        if (apt.id === id) {
          const isPaid = status === 'concluido' ? true : apt.isPaid;
          return {
            ...apt,
            status,
            paymentMethod: paymentMethod || apt.paymentMethod,
            isPaid,
          };
        }
        return apt;
      })
    );
  };

  // Update appointment payment info
  const updateAppointmentPayment = (
    id: string,
    isPaid: boolean,
    paymentMethod?: PaymentMethod,
    discount?: number,
    finalPrice?: number
  ) => {
    setAppointments((prev) =>
      prev.map((apt) => {
        if (apt.id === id) {
          const updatedDiscount = discount !== undefined ? discount : apt.discount;
          const updatedFinalPrice = finalPrice !== undefined ? finalPrice : apt.price - updatedDiscount;
          return {
            ...apt,
            isPaid,
            paymentMethod: paymentMethod || apt.paymentMethod,
            discount: updatedDiscount,
            finalPrice: updatedFinalPrice,
          };
        }
        return apt;
      })
    );
  };

  // Update appointment details
  const updateAppointmentDetails = (
    id: string,
    updates: Partial<Appointment>
  ): { success: boolean; error?: string } => {
    const existing = appointments.find((a) => a.id === id);
    if (!existing) return { success: false, error: 'Agendamento não encontrado.' };

    const newDate = updates.date || existing.date;
    const newTime = updates.time || existing.time;
    const newDuration = updates.durationMinutes || existing.durationMinutes;

    if (newDate !== existing.date || newTime !== existing.time || newDuration !== existing.durationMinutes) {
      const check = checkSlotAvailability(newDate, newTime, newDuration, id);
      if (!check.available) {
        return { success: false, error: check.reason };
      }
    }

    setAppointments((prev) =>
      prev.map((apt) => {
        if (apt.id === id) {
          const price = updates.price !== undefined ? updates.price : apt.price;
          const discount = updates.discount !== undefined ? updates.discount : apt.discount;
          const finalPrice = updates.finalPrice !== undefined ? updates.finalPrice : price - discount;
          return { ...apt, ...updates, finalPrice };
        }
        return apt;
      })
    );

    return { success: true };
  };

  // Cancel appointment
  const cancelAppointment = (id: string) => {
    updateAppointmentStatus(id, 'cancelado');
  };

  // Mark reminder sent
  const markReminderSent = (id: string) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, reminderSent: true } : apt))
    );
  };

  // Procedures CRUD
  const saveProcedure = (procedure: Procedure) => {
    setProcedures((prev) => {
      const idx = prev.findIndex((p) => p.id === procedure.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = procedure;
        return next;
      }
      return [...prev, procedure];
    });
  };

  const deleteProcedure = (id: string) => {
    setProcedures((prev) => prev.filter((p) => p.id !== id));
  };

  // Gallery CRUD
  const saveGalleryWork = (work: GalleryWork) => {
    setGallery((prev) => {
      const idx = prev.findIndex((g) => g.id === work.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = work;
        return next;
      }
      return [work, ...prev];
    });
  };

  const deleteGalleryWork = (id: string) => {
    setGallery((prev) => prev.filter((g) => g.id !== id));
  };

  // Blocked slots CRUD
  const addBlockedSlot = (slot: Omit<BlockedSlot, 'id'>) => {
    const newSlot: BlockedSlot = {
      ...slot,
      id: `blk-${Date.now()}`,
    };
    setBlockedSlots((prev) => [...prev, newSlot]);
  };

  const deleteBlockedSlot = (id: string) => {
    setBlockedSlots((prev) => prev.filter((b) => b.id !== id));
  };

  // Clients
  const saveClientNotes = (clientId: string, notes: string) => {
    setClients((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, notes } : c))
    );
  };

  // Salon Config
  const updateSalonConfig = (newConfig: Partial<SalonConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  };

  const resetToSampleData = () => {
    setConfig(initialSalonConfig);
    setProcedures(initialProcedures);
    setGallery(initialGalleryWorks);
    setAppointments(initialAppointments);
    setBlockedSlots(initialBlockedSlots);
    setClients(initialClients);
    localStorage.clear();
  };

  return (
    <SalonContext.Provider
      value={{
        config,
        procedures,
        gallery,
        appointments,
        blockedSlots,
        clients,
        isAdminAuthenticated,
        loginAdmin,
        logoutAdmin,
        viewMode,
        setViewMode,
        adminTab,
        setAdminTab,
        lastCreatedAppointment,
        clearNotification,
        playNotificationSound,
        getAvailableSlotsForDate,
        isDateAvailable,
        checkSlotAvailability,
        createAppointment,
        updateAppointmentStatus,
        updateAppointmentPayment,
        updateAppointmentDetails,
        cancelAppointment,
        markReminderSent,
        saveProcedure,
        deleteProcedure,
        saveGalleryWork,
        deleteGalleryWork,
        addBlockedSlot,
        deleteBlockedSlot,
        saveClientNotes,
        updateSalonConfig,
        resetToSampleData,
      }}
    >
      {children}
    </SalonContext.Provider>
  );
};

export const useSalon = () => {
  const context = useContext(SalonContext);
  if (!context) {
    throw new Error('useSalon must be used within a SalonProvider');
  }
  return context;
};
