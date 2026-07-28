// El backend devuelve los campos "date" (@db.Date en Prisma) como medianoche UTC.
// Si se formatean con `new Date(iso)` + date-fns (que usa la hora local del navegador),
// en timezones detrás de UTC (como Ecuador, UTC-5) el día se muestra un día antes.
// Esta función reconstruye la fecha en hora LOCAL a partir de los componentes año-mes-día,
// evitando el corrimiento de zona horaria.
export function dateOnlyToLocal(value: string | Date): Date {
  const iso = typeof value === 'string' ? value : value.toISOString();
  const datePart = iso.split('T')[0];
  const [y, m, d] = datePart.split('-').map(Number);
  return new Date(y, m - 1, d);
}
