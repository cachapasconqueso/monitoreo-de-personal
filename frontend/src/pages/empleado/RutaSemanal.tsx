import { useEffect, useState } from 'react';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import * as assignmentsApi from '../../api/assignments';

interface Client { id: string; name: string; address: string; }
interface Assignment {
  id: string; order: number;
  client: Client;
  visits: Array<{ status: string }>;
}
interface DayRoute {
  date: string;
  dayOfWeek: number;
  assignments: Assignment[];
}

function dateStrToLocalDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function toDateStr(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function EmpleadoRutaSemanal() {
  const [weekAnchor, setWeekAnchor] = useState(() => toDateStr(new Date()));
  const [days, setDays] = useState<DayRoute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    assignmentsApi.getMyWeek(weekAnchor)
      .then(setDays)
      .finally(() => setLoading(false));
  }, [weekAnchor]);

  const todayStr = toDateStr(new Date());

  const goPrevWeek = () => setWeekAnchor(toDateStr(addDays(dateStrToLocalDate(weekAnchor), -7)));
  const goNextWeek = () => setWeekAnchor(toDateStr(addDays(dateStrToLocalDate(weekAnchor), 7)));
  const goToday = () => setWeekAnchor(todayStr);

  const rangeLabel = days.length > 0
    ? `${format(dateStrToLocalDate(days[0].date), 'd MMM', { locale: es })} – ${format(dateStrToLocalDate(days[6].date), 'd MMM', { locale: es })}`
    : '';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-secondary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-4xl mx-auto">
      <div className="border-b border-border-subtle/10 pb-4">
        <h1 className="text-2xl font-bold text-on-surface">Mi Ruta Semanal</h1>
        <p className="text-sm text-on-surface-variant mt-1">Clientes asignados por día de la semana</p>
      </div>

      <div className="flex items-center justify-between card p-3">
        <button onClick={goPrevWeek} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">chevron_left</span>Anterior
        </button>
        <div className="flex flex-col items-center">
          <span className="text-sm font-bold font-mono text-on-surface capitalize">{rangeLabel}</span>
          <button onClick={goToday} className="text-xs text-secondary font-semibold hover:underline">Ir a hoy</button>
        </div>
        <button onClick={goNextWeek} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
          Siguiente<span className="material-symbols-outlined text-sm">chevron_right</span>
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {days.map((day) => {
          const isToday = day.date === todayStr;
          const dateObj = dateStrToLocalDate(day.date);
          return (
            <div key={day.date} className={`card p-4 ${isToday ? 'border-secondary/50 shadow-sm' : ''}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div>
                    <p className="font-bold text-on-surface capitalize">{format(dateObj, 'EEEE', { locale: es })}</p>
                    <p className="text-xs text-on-surface-variant font-mono">{format(dateObj, 'dd/MM/yyyy')}</p>
                  </div>
                  {isToday && <span className="status-chip-late">Hoy</span>}
                </div>
                <span className="bg-primary-fixed text-on-primary-fixed px-2 py-1 rounded text-xs font-mono font-bold">
                  {day.assignments.length} {day.assignments.length === 1 ? 'punto' : 'puntos'}
                </span>
              </div>

              {day.assignments.length === 0 ? (
                <p className="text-sm text-on-surface-variant py-2">Sin clientes asignados</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {day.assignments.map((a, i) => {
                    const visitStatus = a.visits[0]?.status ?? 'PENDING';
                    return (
                      <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg bg-surface-container">
                        <div className="w-7 h-7 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center text-xs font-bold shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-on-surface">{a.client.name}</p>
                          <p className="text-xs text-on-surface-variant truncate">{a.client.address}</p>
                        </div>
                        {visitStatus === 'COMPLETED' && <span className="status-chip-onsite">Completado</span>}
                        {visitStatus === 'IN_PROGRESS' && <span className="status-chip-late">En Visita</span>}
                        {visitStatus === 'PENDING' && <span className="status-chip-pending">Pendiente</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
