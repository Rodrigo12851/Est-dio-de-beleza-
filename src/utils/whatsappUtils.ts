import { Appointment, SalonConfig } from '../types';
import { formatDateBR, formatCurrency } from './dateUtils';

export function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function formatPhoneMask(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export function buildWhatsAppReminderUrl(appointment: Appointment, salonConfig: SalonConfig): string {
  const phoneDigits = cleanPhone(appointment.clientPhone);
  const targetPhone = phoneDigits.startsWith('55') ? phoneDigits : `55${phoneDigits}`;
  
  let message = salonConfig.whatsappConfirmationTemplate || 
    'Olá, {cliente}! 💕 Passando para confirmar seu horário em {data} às {horario} para {procedimento} no {salao}. Podemos confirmar seu atendimento?';

  message = message
    .replace(/{cliente}/g, appointment.clientName)
    .replace(/{procedimento}/g, appointment.procedureName)
    .replace(/{data}/g, formatDateBR(appointment.date))
    .replace(/{horario}/g, appointment.time)
    .replace(/{salao}/g, salonConfig.name)
    .replace(/{valor}/g, formatCurrency(appointment.finalPrice || appointment.price));

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}

export function buildWhatsAppDirectContactUrl(salonPhone: string, initialText?: string): string {
  const phoneDigits = cleanPhone(salonPhone);
  const targetPhone = phoneDigits.startsWith('55') ? phoneDigits : `55${phoneDigits}`;
  const text = initialText || 'Olá! Gostaria de tirar uma dúvida sobre os procedimentos do salão.';
  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
}

export function buildClientConfirmationShareUrl(appointment: Appointment, salonConfig: SalonConfig): string {
  const phoneDigits = cleanPhone(salonConfig.whatsapp);
  const targetPhone = phoneDigits.startsWith('55') ? phoneDigits : `55${phoneDigits}`;
  
  const text = `Olá, ${salonConfig.ownerName}! 💕 Acabei de agendar meu horário pelo site:\n\n` +
    `✨ *Procedimento:* ${appointment.procedureName}\n` +
    `📅 *Data:* ${formatDateBR(appointment.date)}\n` +
    `⏰ *Horário:* ${appointment.time}\n` +
    `💰 *Valor:* ${formatCurrency(appointment.finalPrice || appointment.price)}\n` +
    `👤 *Cliente:* ${appointment.clientName}\n\n` +
    `Aguardo a confirmação! ✨`;

  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(text)}`;
}
