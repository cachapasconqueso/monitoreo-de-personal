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

// Formatea un instante pasado como "hace X min/h/días", subiendo de unidad
// para no mostrar números grandes de minutos cuando alguien lleva rato sin moverse.
export function timeAgo(from: Date | string): string {
  const ms = Date.now() - new Date(from).getTime();
  const minutes = Math.round(ms / 60000);
  if (minutes < 1) return 'menos de 1 min';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.round(hours / 24);
  return `${days} d`;
}
