// El sistema opera en Ecuador (America/Guayaquil, UTC-5, sin horario de verano).
// El servidor puede correr en cualquier zona horaria (Railway/Fly usan UTC por defecto),
// así que toda fecha "de negocio" se calcula desplazando el instante UTC y anclándola
// con Date.UTC, para que sea independiente de la zona horaria del proceso.
const BUSINESS_OFFSET_MS = -5 * 60 * 60 * 1000;

export function toBusinessDateOnly(instant: Date = new Date()): Date {
  const shifted = new Date(instant.getTime() + BUSINESS_OFFSET_MS);
  return new Date(Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()));
}

export function parseDateOnly(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatDateOnly(d: Date): string {
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function businessDayOfWeek(instant: Date = new Date()): number {
  return new Date(instant.getTime() + BUSINESS_OFFSET_MS).getUTCDay();
}

export function businessMinutesOfDay(instant: Date): number {
  const shifted = new Date(instant.getTime() + BUSINESS_OFFSET_MS);
  return shifted.getUTCHours() * 60 + shifted.getUTCMinutes();
}

export function addDaysUTC(d: Date, days: number): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + days));
}

export function mondayOfUTC(d: Date): Date {
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDaysUTC(d, diff);
}
