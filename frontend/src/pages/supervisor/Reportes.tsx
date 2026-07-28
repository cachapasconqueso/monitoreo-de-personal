import { useEffect, useMemo, useState } from 'react';
import { format, subDays, differenceInCalendarDays } from 'date-fns';
import * as attendanceApi from '../../api/attendance';
import * as visitsApi from '../../api/visits';
import * as usersApi from '../../api/users';
import { buildRanking, downloadCsv, isVisitOffSite } from '../../lib/metrics';
import { dateOnlyToLocal } from '../../lib/date';

interface AttRecord {
  id: string; date: string; status: string; checkIn: string | null; checkOut: string | null;
  lunchStart: string | null; lunchEnd: string | null;
  userId: string; earlyDeparture: boolean; late: boolean; workedMinutes: number | null;
  user: { id: string; name: string; role: string };
}
interface VisitRecord {
  id: string; date: string; status: string; comment: string | null; checkIn: string | null; checkOut: string | null;
  employeeId: string; lat: number | null; lng: number | null;
  client: { name: string; lat: number; lng: number }; employee: { name: string };
}
interface Employee { id: string; name: string; }

export default function SupervisorReportes() {
  const [attendance, setAttendance] = useState<AttRecord[]>([]);
  const [visits, setVisits] = useState<VisitRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tab, setTab] = useState<'asistencia' | 'visitas' | 'ranking'>('asistencia');
  const [from, setFrom] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [to, setTo] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [filterUser, setFilterUser] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { usersApi.getMyEmployees().then(setEmployees); }, []);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      attendanceApi.getAllAttendance(filterUser || undefined, from, to),
      visitsApi.getAllVisits(undefined, filterUser || undefined, from, to),
    ]).then(([a, v]) => { setAttendance(a); setVisits(v); }).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [from, to, filterUser]);

  const fmt = (d: string | null) => d ? format(new Date(d), 'HH:mm') : '--';
  const fmtDate = (d: string) => format(dateOnlyToLocal(d), 'dd/MM/yyyy');

  const totalDays = Math.max(differenceInCalendarDays(new Date(to), new Date(from)) + 1, 1);
  const ranking = useMemo(
    () => buildRanking(employees, attendance, visits, totalDays),
    [employees, attendance, visits, totalDays],
  );

  const exportCsv = () => {
    if (tab === 'ranking') {
      downloadCsv(
        `ranking_equipo_${from}_a_${to}.csv`,
        ['Colaborador', 'Días Presente', '% Asistencia', '% Puntualidad', 'Horas Prom.', 'Visitas Completadas'],
        ranking.map((r) => [r.name, r.daysPresent, r.attendanceRate, r.punctualityRate, (r.avgWorkedMinutes / 60).toFixed(1), r.visitsCompleted]),
      );
    } else if (tab === 'asistencia') {
      downloadCsv(
        `asistencia_${from}_a_${to}.csv`,
        ['Colaborador', 'Fecha', 'Entrada', 'Tarde', 'Alm. Ini', 'Alm. Fin', 'Salida', 'Estado'],
        attendance.map((a) => [a.user.name, fmtDate(a.date), fmt(a.checkIn), a.late ? 'Sí' : 'No', fmt(a.lunchStart), fmt(a.lunchEnd), fmt(a.checkOut), a.status]),
      );
    } else {
      downloadCsv(
        `visitas_${from}_a_${to}.csv`,
        ['Colaborador', 'Cliente', 'Fecha', 'Entrada', 'Salida', 'Estado', 'Fuera de sitio', 'Comentario'],
        visits.map((v) => [v.employee.name, v.client.name, fmtDate(v.date), fmt(v.checkIn), fmt(v.checkOut), v.status, isVisitOffSite(v, v.client) ? 'Sí' : 'No', v.comment || '']),
      );
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-end border-b border-border-subtle/10 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Reportes de mi Equipo</h1>
          <p className="text-sm text-on-surface-variant mt-1">Análisis de asistencia, visitas y desempeño de tus colaboradores</p>
        </div>
        <button onClick={exportCsv} className="btn-secondary flex items-center gap-2 text-sm">
          <span className="material-symbols-outlined text-lg">download</span>
          Exportar CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Desde</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Hasta</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Colaborador</label>
          <select value={filterUser} onChange={(e) => setFilterUser(e.target.value)} className="input-field">
            <option value="">Todos</option>
            {employees.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Registros Asistencia', value: attendance.length, color: 'text-primary' },
          { label: 'Total Visitas', value: visits.length, color: 'text-secondary' },
          { label: 'Visitas Completadas', value: visits.filter((v) => v.status === 'COMPLETED').length, color: 'text-status-onsite' },
          { label: 'Fuera de Sitio', value: visits.filter((v) => isVisitOffSite(v, v.client)).length, color: 'text-status-late' },
        ].map((s) => (
          <div key={s.label} className="card p-3 text-center">
            <p className={`font-mono font-bold text-2xl ${s.color}`}>{s.value}</p>
            <p className="text-xs text-on-surface-variant mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 bg-surface-container rounded-xl p-1 w-fit">
        {(['asistencia', 'visitas', 'ranking'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all capitalize ${tab === t ? 'bg-surface-container-lowest shadow-sm text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            {t === 'asistencia' ? 'Asistencia' : t === 'visitas' ? 'Visitas' : 'Ranking'}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin h-6 w-6 border-2 border-role-supervisor border-t-transparent rounded-full" />
        </div>
      )}

      {!loading && tab === 'asistencia' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-container-low border-b border-outline-variant/30">
                <tr>
                  {['Colaborador', 'Fecha', 'Entrada', 'Alm. Ini', 'Alm. Fin', 'Salida', 'Estado'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-mono font-bold text-on-surface-variant uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {attendance.map((a) => (
                  <tr key={a.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-4 py-3 font-medium text-on-surface">{a.user.name}</td>
                    <td className="px-4 py-3 font-mono text-on-surface-variant">{fmtDate(a.date)}</td>
                    <td className="px-4 py-3 font-mono text-status-onsite">{fmt(a.checkIn)}</td>
                    <td className="px-4 py-3 font-mono text-status-late">{fmt(a.lunchStart)}</td>
                    <td className="px-4 py-3 font-mono text-secondary">{fmt(a.lunchEnd)}</td>
                    <td className="px-4 py-3 font-mono text-error">{fmt(a.checkOut)}</td>
                    <td className="px-4 py-3">
                      {a.status === 'COMPLETED' ? <span className="status-chip-onsite">Completo</span> : a.status === 'ACTIVE' ? <span className="status-chip-late">Activo</span> : <span className="status-chip-pending">Pendiente</span>}
                      {a.late && <span className="ml-1 text-xs text-status-late" title="Llegada tarde">⏰</span>}
                      {a.earlyDeparture && <span className="ml-1 text-xs text-status-late" title="Salida temprana">⚠</span>}
                    </td>
                  </tr>
                ))}
                {attendance.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-on-surface-variant">Sin registros para el período seleccionado</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && tab === 'visitas' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-container-low border-b border-outline-variant/30">
                <tr>
                  {['Colaborador', 'Cliente', 'Fecha', 'Entrada', 'Salida', 'Estado', 'Comentario'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-mono font-bold text-on-surface-variant uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {visits.map((v) => {
                  const offSite = isVisitOffSite(v, v.client);
                  return (
                    <tr key={v.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-4 py-3 font-medium text-on-surface">{v.employee.name}</td>
                      <td className="px-4 py-3 text-on-surface">
                        {v.client.name}
                        {offSite && <span className="ml-1.5 text-xs text-status-late" title="Check-in fuera del sitio del cliente">📍⚠</span>}
                      </td>
                      <td className="px-4 py-3 font-mono text-on-surface-variant">{fmtDate(v.date)}</td>
                      <td className="px-4 py-3 font-mono text-status-onsite">{fmt(v.checkIn)}</td>
                      <td className="px-4 py-3 font-mono text-error">{fmt(v.checkOut)}</td>
                      <td className="px-4 py-3">
                        {v.status === 'COMPLETED' ? <span className="status-chip-onsite">OK</span> : v.status === 'IN_PROGRESS' ? <span className="status-chip-late">En curso</span> : <span className="status-chip-pending">Pendiente</span>}
                      </td>
                      <td className="px-4 py-3 text-on-surface-variant text-xs max-w-xs truncate">{v.comment || '-'}</td>
                    </tr>
                  );
                })}
                {visits.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-on-surface-variant">Sin visitas para el período seleccionado</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && tab === 'ranking' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-container-low border-b border-outline-variant/30">
                <tr>
                  {['#', 'Colaborador', 'Días Presente', '% Asistencia', '% Puntualidad', 'Horas Prom./Día', 'Visitas Completadas'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-mono font-bold text-on-surface-variant uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {ranking.map((r, i) => (
                  <tr key={r.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-4 py-3 font-mono text-on-surface-variant">{i + 1}</td>
                    <td className="px-4 py-3 font-bold text-on-surface">{r.name}</td>
                    <td className="px-4 py-3 font-mono text-on-surface-variant">{r.daysPresent}</td>
                    <td className="px-4 py-3 font-mono text-status-onsite">{r.attendanceRate}%</td>
                    <td className="px-4 py-3 font-mono text-secondary">{r.punctualityRate}%</td>
                    <td className="px-4 py-3 font-mono text-on-surface-variant">{(r.avgWorkedMinutes / 60).toFixed(1)}h</td>
                    <td className="px-4 py-3 font-mono font-bold text-role-supervisor">{r.visitsCompleted}</td>
                  </tr>
                ))}
                {ranking.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-on-surface-variant">Sin colaboradores para mostrar</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
