import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import * as attendanceApi from '../../api/attendance';
import * as visitsApi from '../../api/visits';
import * as usersApi from '../../api/users';
import * as assignmentsApi from '../../api/assignments';

interface TeamMember {
  id: string;
  checkIn: string | null;
  checkOut: string | null;
  lunchStart: string | null;
  lunchEnd: string | null;
  status: string;
  scheduledToday: boolean;
  user: { id: string; name: string; role: string; avatarUrl: string | null };
}

interface Visit {
  id: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  client: { name: string };
  employee: { name: string; avatarUrl: string | null };
}

interface EarlyAlert {
  id: string; checkOut: string; workedMinutes: number;
  user: { id: string; name: string; supervisedBy: { name: string } | null };
}

function minutesToHM(min: number) {
  return `${Math.floor(min / 60)}h ${min % 60}m`;
}

export default function JefeDashboard() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [earlyAlerts, setEarlyAlerts] = useState<EarlyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    Promise.all([
      attendanceApi.getTeamAttendance(today),
      visitsApi.getAllVisits(today),
      usersApi.getUsers(),
      attendanceApi.getEarlyDepartures(today),
      assignmentsApi.getAllAssignments(today),
    ])
      .then(([t, v, u, e, a]) => { setTeam(t); setVisits(v); setUsers(u); setEarlyAlerts(e); setAssignments(a); })
      .finally(() => setLoading(false));
  }, []);

  const employees = users.filter((u) => u.role === 'EMPLEADO');
  const supervisors = users.filter((u) => u.role === 'SUPERVISOR');
  const present = team.filter((t) => t.checkIn);
  const completedVisits = visits.filter((v) => v.status === 'COMPLETED');
  const completedAssignments = assignments.filter((a) => a.visits?.some((v: { status: string }) => v.status === 'COMPLETED'));

  const kpis = [
    { label: 'Total Empleados', value: employees.length, icon: 'badge', color: 'border-primary-fixed-dim' },
    { label: 'Supervisores', value: supervisors.length, icon: 'admin_panel_settings', color: 'border-role-supervisor', textColor: 'text-role-supervisor' },
    { label: 'Presentes Hoy', value: present.length, icon: 'where_to_vote', color: 'border-status-onsite', textColor: 'text-status-onsite' },
    { label: 'Visitas Completadas', value: completedVisits.length, icon: 'store', color: 'border-secondary', textColor: 'text-secondary' },
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <section className="border-b border-border-subtle/10 pb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-on-surface">Panel de Dirección</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          {format(new Date(), "EEEE d 'de' MMMM yyyy", { locale: es })} · Vista del Jefe
        </p>
      </section>

      {earlyAlerts.length > 0 && (
        <div className="bg-status-late/10 border border-status-late/50 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-status-late text-2xl">warning</span>
            <div>
              <p className="font-bold text-on-surface">
                {earlyAlerts.length === 1 ? '1 empleado salió antes de tiempo hoy' : `${earlyAlerts.length} empleados salieron antes de tiempo hoy`}
              </p>
              <p className="text-xs text-on-surface-variant">Jornada estándar: 8 horas (descontando almuerzo)</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {earlyAlerts.map((a) => (
              <div key={a.id} className="bg-surface rounded-lg p-3 flex items-center gap-3 border border-status-late/30">
                <span className="material-symbols-outlined text-status-late text-xl">running_with_errors</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-on-surface">{a.user.name}</p>
                  <p className="text-xs text-on-surface-variant">
                    Salió a las {format(new Date(a.checkOut), 'HH:mm')} · {minutesToHM(a.workedMinutes)} trabajados
                  </p>
                  {a.user.supervisedBy && (
                    <p className="text-xs text-on-surface-variant">Supervisor: {a.user.supervisedBy.name}</p>
                  )}
                </div>
                <p className="text-xs font-mono font-bold text-status-late shrink-0">-{minutesToHM(480 - a.workedMinutes)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className={`card p-4 flex flex-col justify-between h-28 border-b-2 ${k.color}`}>
            <p className="text-sm text-on-surface-variant">{k.label}</p>
            <div className="flex justify-between items-end">
              <p className={`font-mono font-bold text-4xl ${k.textColor || 'text-primary'}`}>{k.value}</p>
              <span className={`material-symbols-outlined mb-1 ${k.textColor || 'text-on-surface-variant'}`}>{k.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Team Overview */}
        <div className="card p-4 flex flex-col gap-3">
          <h2 className="font-bold text-lg text-on-surface card-header">Equipo Completo Hoy</h2>
          <div className="flex flex-col gap-2 overflow-y-auto max-h-72">
            {team.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-on-surface-variant gap-2">
                <span className="material-symbols-outlined text-4xl opacity-30">group</span>
                <p className="text-sm">Sin registros hoy</p>
              </div>
            ) : (
              team.map((m) => (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg bg-surface border border-outline-variant/30">
                  <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-bold text-xs shrink-0">
                    {m.user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-on-surface truncate">{m.user.name}</p>
                    <p className="text-xs font-mono text-on-surface-variant">
                      {m.checkIn ? `${format(new Date(m.checkIn), 'HH:mm')} → ${m.checkOut ? format(new Date(m.checkOut), 'HH:mm') : 'activo'}` : 'Sin entrada'}
                    </p>
                    {(m.lunchStart || m.lunchEnd) && (
                      <p className="text-xs font-mono text-status-late">
                        Almuerzo: {m.lunchStart ? format(new Date(m.lunchStart), 'HH:mm') : '--'}
                        {' → '}
                        {m.lunchEnd ? format(new Date(m.lunchEnd), 'HH:mm') : 'en curso'}
                      </p>
                    )}
                  </div>
                  <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${m.status === 'ACTIVE' ? 'bg-status-onsite/20 text-on-surface' : m.status === 'COMPLETED' ? 'bg-surface-container text-on-surface-variant' : m.status === 'ON_LUNCH' ? 'bg-status-late/20 text-on-surface' : m.scheduledToday ? 'bg-status-absent/20 text-on-surface' : 'bg-primary-fixed-dim/40 text-on-primary-fixed-variant'}`}>
                    {m.status === 'ACTIVE' ? 'ACTIVO' : m.status === 'COMPLETED' ? 'TERMINÓ' : m.status === 'ON_LUNCH' ? 'ALMUERZO' : m.scheduledToday ? 'AUSENTE' : 'SIN HORARIO'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Today's Visits */}
        <div className="card p-4 flex flex-col gap-3">
          <h2 className="font-bold text-lg text-on-surface card-header">Visitas del Día</h2>
          <div className="flex flex-col gap-2 overflow-y-auto max-h-72">
            {visits.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-on-surface-variant gap-2">
                <span className="material-symbols-outlined text-4xl opacity-30">store</span>
                <p className="text-sm">Sin visitas registradas hoy</p>
              </div>
            ) : (
              visits.map((v) => (
                <div key={v.id} className="flex items-center gap-3 p-3 rounded-lg bg-surface border border-outline-variant/30">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${v.status === 'COMPLETED' ? 'bg-status-onsite' : v.status === 'IN_PROGRESS' ? 'bg-status-late' : 'bg-outline'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-on-surface truncate">{v.client.name}</p>
                    <p className="text-xs text-on-surface-variant">{v.employee.name}</p>
                  </div>
                  <div className="text-right text-xs font-mono text-on-surface-variant shrink-0">
                    {v.checkIn && <p>{format(new Date(v.checkIn), 'HH:mm')}</p>}
                    {v.checkOut && <p className="text-error">→ {format(new Date(v.checkOut), 'HH:mm')}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 bg-status-onsite/5 border-status-onsite/30">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-status-onsite">trending_up</span>
            <h3 className="font-bold text-on-surface">Productividad</h3>
          </div>
          <p className="text-3xl font-mono font-bold text-status-onsite">
            {assignments.length > 0 ? Math.round((completedAssignments.length / assignments.length) * 100) : 0}%
          </p>
          <p className="text-xs text-on-surface-variant mt-1">Visitas completadas vs programadas</p>
        </div>
        <div className="card p-4 bg-secondary/5 border-secondary/30">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-secondary">schedule</span>
            <h3 className="font-bold text-on-surface">Asistencia</h3>
          </div>
          <p className="text-3xl font-mono font-bold text-secondary">
            {employees.length > 0 ? Math.round((present.length / Math.max(employees.length, 1)) * 100) : 0}%
          </p>
          <p className="text-xs text-on-surface-variant mt-1">Colaboradores presentes hoy</p>
        </div>
        <div className="card p-4 bg-role-supervisor/5 border-role-supervisor/30">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-role-supervisor">store</span>
            <h3 className="font-bold text-on-surface">Total Visitas</h3>
          </div>
          <p className="text-3xl font-mono font-bold text-role-supervisor">{visits.length}</p>
          <p className="text-xs text-on-surface-variant mt-1">Registradas hoy en total</p>
        </div>
      </div>
    </div>
  );
}
