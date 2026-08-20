export type ProcedureCategory = 'Cabelo' | 'Maquiagem' | 'Unhas' | 'Sobrancelhas' | 'Outros';

export type AppointmentStatus = 'pendente' | 'confirmado' | 'concluido' | 'cancelado' | 'faltou';

export type PaymentMethod = 'pix' | 'dinheiro' | 'debito' | 'credito' | 'outro';

export interface Procedure {
  id: string;
  name: string;
  category: ProcedureCategory;
  description: string;
  price: number;
  durationMinutes: number;
  photo: string;
  active: boolean;
}

export interface GalleryWork {
  id: string;
  title: string;
  category: ProcedureCategory;
  description: string;
  date: string;
  photo: string;
  photos?: string[];
  featured: boolean;
  procedureId?: string;
}

export interface AppointmentProcedureItem {
  id: string;
  name: string;
  category: ProcedureCategory;
  price: number;
  durationMinutes: number;
  photo?: string;
}

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  clientNotes?: string;
  procedureId: string;
  procedureName: string;
  procedureCategory?: ProcedureCategory;
  procedureIds?: string[];
  procedures?: AppointmentProcedureItem[];
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  durationMinutes: number;
  price: number;
  discount: number;
  finalPrice: number;
  status: AppointmentStatus;
  paymentMethod?: PaymentMethod;
  isPaid: boolean;
  source: 'online' | 'whatsapp' | 'presencial';
  createdAt: string;
  reminderSent?: boolean;
}

export interface BlockedSlot {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  reason: string;
}

export interface ClientProfile {
  id: string;
  name: string;
  phone: string;
  notes: string;
  createdAt: string;
}

export interface DaySchedule {
  enabled: boolean;
  start: string; // "08:00"
  end: string;   // "19:00"
}

export interface SalonConfig {
  name: string;
  tagline: string;
  ownerName: string;
  bio: string;
  avatar: string;
  coverPhoto: string;
  phone: string;
  whatsapp: string;
  address: string;
  instagram: string;
  workingHours: {
    [dayOfWeek: number]: DaySchedule; // 0=Sunday, 1=Monday, ..., 6=Saturday
  };
  lunchBreak: {
    enabled: boolean;
    start: string; // "12:00"
    end: string;   // "13:00"
  };
  offDays: string[]; // specific dates YYYY-MM-DD
  holidays: string[]; // specific dates YYYY-MM-DD
  cancellationPolicy: string;
  whatsappConfirmationTemplate: string;
  adminPin: string;
}
