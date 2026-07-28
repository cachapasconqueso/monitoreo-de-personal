import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import * as attendanceApi from '../../api/attendance';
import * as visitsApi from '../../api/visits';
import { dateOnlyToLocal } from '../../lib/date';

interface Attendance {
  id: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  lunchStart: string | null;
  lunchEnd: string | null;
  status: string;
}

interface Visit {
  id: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  comment: string | null;
  status: string;
  client: { name: string; address: string };
}

export default function EmpleadoHistorial() {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [tab, setTab] = useState<'asistencia' | 'visitas'>('asistencia');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([attendanceApi.getMyHistory(), visitsApi.getMyVisitHistory()])
      .then(([att, vis]) => {
        setAttendance(att);
        setVisits(vis);
      })
      .finally(() => setLoading(false));
  }, []);

  const fmt = (d: string | null) => d ? format(new Date(d), 'HH:mm') : '--:--';
  const fmtDate = (d: string) => format(dateOnlyToLocal(d), "EEE dd/MM", { locale: es });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-secondary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-5xl mx-auto">
      <div className="border-b border-border-subtle/10 pb-4">
        <h1 className="text-2xl font-bold text-on-surface">Mi Historial</h1>
        <p className="text-sm text-on-surface-variant mt-1">Últimos 30 días de actividad</p>
      </div>

      <div className="flex gap-1 bg-surface-container rounded-xl p-1 w-fit">
        {(['asistencia', 'visitas'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all capitalize ${tab === t ? 'bg-surface-container-lowest shadow-sm text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            {t === 'asistencia' ? 'Asistencia' : 'Visitas a Clientes'}
          </button>
        ))}
      </div>

      {tab === 'asistencia' && (
        <div className="flex flex-col gap-3">
          {attendance.length === 0 && (
            <div className="card p-12 flex flex-col items-center gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl opacity-30">event_available</span>
              <p>Sin registros de asistencia</p>
            </div>
          )}
          {attendance.map((a) => (
            <div key={a.id} className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="shrink-0">
                <p className="text-sm font-bold font-mono text-on-surface capitalize">{fmtDate(a.date)}</p>
                <p className="text-xs text-on-surface-variant">{format(dateOnlyToLocal(a.date), 'yyyy')}</p>
              </div>
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="bg-surface-container p-2 rounded-lg">
                  <span className="block text-status-onsite font-bold">ENTRADA</span>
                  {fmt(a.checkIn)}
                </div>
                <div className="bg-surface-container p-2 rounded-lg">
                  <span className="block text-status-late font-bold">ALM. INI</span>
                  {fmt(a.lunchStart)}
                </div>
                <div className="bg-surface-container p-2 rounded-lg">
                  <span className="block text-secondary font-bold">ALM. FIN</span>
                  {fmt(a.lunchEnd)}
                </div>
                <div className="bg-surface-container p-2 rounded-lg">
                  <span className="block text-error font-bold">SALIDA</span>
                  {fmt(a.checkOut)}
                </div>
              </div>
              <div>
                {a.status === 'COMPLETED' && <span className="status-chip-onsite">Completo</span>}
                {a.status === 'ACTIVE' && <span className="status-chip-late">Activo</span>}
                {a.status === 'ON_LUNCH' && <span className="bg-status-late/20 border border-status-late px-2 py-0.5 rounded-full text-xs font-bold uppercase">Almuerzo</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'visitas' && (
        <div className="flex flex-col gap-3">
          {visits.length === 0 && (
            <div className="card p-12 flex flex-col items-center gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl opacity-30">store</span>
              <p>Sin visitas registradas</p>
            </div>
          )}
          {visits.map((v) => (
            <div key={v.id} className="card p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-on-surface">{v.client.name}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{v.client.address}</p>
                </div>
                <span className="text-xs font-mono text-on-surface-variant">{fmtDate(v.date)}</span>
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs font-mono">
                <span className="text-status-onsite">↓ {fmt(v.checkIn)}</span>
                <span className="text-error">↑ {fmt(v.checkOut)}</span>
                {v.status === 'COMPLETED' && <span className="status-chip-onsite">Completada</span>}
                {v.status === 'IN_PROGRESS' && <span className="status-chip-late">En curso</span>}
              </div>
              {v.comment && (
                <div className="mt-3 bg-surface-container p-3 rounded-lg">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">Comentario</p>
                  <p className="text-sm text-on-surface">{v.comment}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
