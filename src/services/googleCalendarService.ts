import { Appointment, SalonConfig } from '../types';
import { addMinutesToTime } from '../utils/dateUtils';

const CLIENT_ID = '60245837027-client.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';
const TOKEN_STORAGE_KEY = 'studio_bella_gcal_token';

interface TokenData {
  access_token: string;
  expires_at: number; // timestamp in ms
  email?: string;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string; expires_in?: number }) => void;
            error_callback?: (err: any) => void;
          }) => {
            requestAccessToken: (options?: { prompt?: string }) => void;
          };
        };
      };
    };
  }
}

/**
 * Returns the currently cached OAuth access token if not expired.
 */
export function getCachedToken(): string | null {
  try {
    const raw = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!raw) return null;
    const tokenData: TokenData = JSON.parse(raw);
    // Add 60s safety buffer
    if (Date.now() < tokenData.expires_at - 60000) {
      return tokenData.access_token;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Saves access token with expiration time in milliseconds.
 */
export function saveToken(token: string, expiresInSec: number = 3599, email?: string): void {
  const tokenData: TokenData = {
    access_token: token,
    expires_at: Date.now() + expiresInSec * 1000,
    email,
  };
  localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokenData));
}

/**
 * Clears stored OAuth token
 */
export function clearToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

/**
 * Retrieves the connected account email from Google's userinfo endpoint.
 */
export async function fetchUserEmail(accessToken: string): Promise<string | null> {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (res.ok) {
      const data = await res.json();
      return data.email || null;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Requests OAuth access token via Google Identity Services popup client.
 */
export function requestGoogleCalendarAuth(): Promise<{ accessToken: string; email?: string }> {
  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.oauth2) {
      reject(
        new Error(
          'Google Identity Services ainda não foi carregado. Verifique sua conexão com a internet e recarregue a página.'
        )
      );
      return;
    }

    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: async (response) => {
          if (response.error) {
            reject(new Error(response.error));
            return;
          }
          if (response.access_token) {
            const expiresIn = response.expires_in || 3599;
            const email = (await fetchUserEmail(response.access_token)) || undefined;
            saveToken(response.access_token, expiresIn, email);
            resolve({ accessToken: response.access_token, email });
          } else {
            reject(new Error('Token de acesso não retornado pelo Google.'));
          }
        },
        error_callback: (err) => {
          reject(err || new Error('Erro na autenticação do Google.'));
        },
      });

      tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Helper to ensure a valid access token or request one if needed.
 */
export async function getValidAccessToken(): Promise<string> {
  const cached = getCachedToken();
  if (cached) return cached;
  const { accessToken } = await requestGoogleCalendarAuth();
  return accessToken;
}

/**
 * Formats a local date and time string into RFC3339 ISO string for Google Calendar.
 * e.g. date: "2026-08-22", time: "14:30" => "2026-08-22T14:30:00-03:00"
 */
function toCalendarDateTime(date: string, time: string): { dateTime: string; timeZone: string } {
  // Use Brazilian timezone or local system timezone
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo';
  const startIso = `${date}T${time.length === 5 ? time + ':00' : time}`;
  return {
    dateTime: startIso,
    timeZone,
  };
}

/**
 * Builds Google Calendar event payload from an Appointment.
 */
function buildEventPayload(appointment: Appointment, config: SalonConfig) {
  const endTime = addMinutesToTime(appointment.time, appointment.durationMinutes);
  const start = toCalendarDateTime(appointment.date, appointment.time);
  const end = toCalendarDateTime(appointment.date, endTime);

  const proceduresList =
    appointment.procedures && appointment.procedures.length > 1
      ? appointment.procedures.map((p) => `• ${p.name} (${p.durationMinutes} min)`).join('\n')
      : `• ${appointment.procedureName} (${appointment.durationMinutes} min)`;

  const summary = `💇 Studio Bella: ${appointment.clientName} - ${appointment.procedureName}`;
  const description = [
    `Cliente: ${appointment.clientName}`,
    `Telefone/WhatsApp: ${appointment.clientPhone}`,
    `Procedimento(s):\n${proceduresList}`,
    `Duração total: ${appointment.durationMinutes} minutos`,
    `Valor: R$ ${(appointment.finalPrice || appointment.price).toFixed(2)} (${appointment.isPaid ? 'Pago' : 'Pendente'})`,
    `Status: ${appointment.status.toUpperCase()}`,
    appointment.clientNotes ? `Observações: ${appointment.clientNotes}` : '',
    `Origem: ${appointment.source}`,
    `Endereço: ${config.address}`,
  ]
    .filter(Boolean)
    .join('\n');

  return {
    summary,
    description,
    location: config.address,
    start,
    end,
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 30 },
        { method: 'popup', minutes: 120 },
      ],
    },
  };
}

/**
 * Creates or updates an event in Google Calendar for a confirmed appointment.
 * Returns the created or updated Google Calendar event ID.
 */
export async function syncAppointmentToGoogleCalendar(
  appointment: Appointment,
  config: SalonConfig,
  token?: string
): Promise<{ success: boolean; eventId?: string; error?: string }> {
  try {
    const accessToken = token || (await getValidAccessToken());
    const payload = buildEventPayload(appointment, config);

    // If event already exists in Google Calendar, update it (PUT)
    if (appointment.googleCalendarEventId) {
      const updateUrl = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${appointment.googleCalendarEventId}`;
      const updateRes = await fetch(updateUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (updateRes.ok) {
        const data = await updateRes.json();
        return { success: true, eventId: data.id };
      } else if (updateRes.status === 404) {
        // Event was deleted in Google Calendar, recreate it
      } else {
        const err = await updateRes.json().catch(() => ({}));
        throw new Error(err?.error?.message || `Erro ao atualizar evento: ${updateRes.statusText}`);
      }
    }

    // Insert new event (POST)
    const insertUrl = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
    const insertRes = await fetch(insertUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!insertRes.ok) {
      const err = await insertRes.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Erro ao criar evento: ${insertRes.statusText}`);
    }

    const data = await insertRes.json();
    return { success: true, eventId: data.id };
  } catch (error: any) {
    return { success: false, error: error.message || 'Erro ao sincronizar com o Google Calendar' };
  }
}

/**
 * Deletes an event from Google Calendar if the appointment was cancelled or deleted.
 */
export async function deleteAppointmentFromGoogleCalendar(
  eventId: string,
  token?: string
): Promise<{ success: boolean; error?: string }> {
  if (!eventId) return { success: true };
  try {
    const accessToken = token || getCachedToken();
    if (!accessToken) return { success: false, error: 'Token não disponível' };

    const deleteUrl = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`;
    const res = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (res.ok || res.status === 404) {
      return { success: true };
    }
    return { success: false, error: `Erro ao remover evento: ${res.statusText}` };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Batch syncs all eligible confirmed appointments with Google Calendar.
 */
export async function batchSyncConfirmedAppointments(
  appointments: Appointment[],
  config: SalonConfig,
  token?: string
): Promise<{ total: number; synced: number; errors: number }> {
  const confirmedApts = appointments.filter(
    (a) => a.status === 'confirmado' || a.status === 'concluido'
  );

  const accessToken = token || (await getValidAccessToken());
  let synced = 0;
  let errors = 0;

  for (const apt of confirmedApts) {
    const res = await syncAppointmentToGoogleCalendar(apt, config, accessToken);
    if (res.success) {
      synced++;
    } else {
      errors++;
    }
  }

  return { total: confirmedApts.length, synced, errors };
}
