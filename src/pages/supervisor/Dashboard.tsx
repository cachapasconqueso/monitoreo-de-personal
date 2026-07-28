import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import * as attendanceApi from '../../api/attendance';
import * as assignmentsApi from '../../api/assignments';
import * as usersApi from '../../api/users';
import * as visitsApi from '../../api/visits';
import { isVisitOffSite } from '../../lib/metrics';
import { dateOnlyToLocal } from '../../lib/date';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const statusIcon = (status: string) =>
  L.divIcon({
    html: `<div style="background:${status === 'ACTIVE' ? '#38D47A' : status === 'ON_LUNCH' ? '#F5C030' : '#EF5757'};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
    iconSize: [14, 14], iconAnchor: [7, 7], className: '',
  });

interface TeamMember {
  id: string; checkIn: string | null; checkOut: string | null;
  lunchStart: string | null; lunchEnd: string | null; status: string; workedMinutes: number | null; earlyDeparture: boolean;
  scheduledToday: boolean;
  user: { id: string; name: string; email: string; role: string; avatarUrl: string | null };
}

interface EarlyAlert {
  id: string; checkOut: string; workedMinutes: number;
  user: { id: string; name: string; supervisedBy: { name: string } | null };
}

interface IncompleteRouteAlert {
  checkOut: string; totalAssigned: number;
  user: { id: string; name: string; avatarUrl: string | null };
  pendingClients: { id: string; name: string }[];
}

interface EmployeeLocation {
  id: string; name: string; avatarUrl: string | null;
  lastLat: number; lastLng: number; lastLocationAt: string;
}

const employeeIcon = (initials: string) =>
  L.divIcon({
    html: `<div style="background:#A888F0;color:white;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:12px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)">${initials}</div>`,
    iconSize: [34, 34], iconAnchor: [17, 17], className: '',
  });

function minutesToHM(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m}m`;
}

export default function SupervisorDashboard() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [earlyAlerts, setEarlyAlerts] = useState<EarlyAlert[]>([]);
  const [incompleteRouteAlerts, setIncompleteRouteAlerts] = useState<IncompleteRouteAlert[]>([]);
  const [empLocations, setEmpLocations] = useState<EmployeeLocation[]>([]);
  const [recentVisits, setRecentVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const today = format(new Date(), 'yyyy-MM-dd');

  const loadData = () => Promise.all([
    attendanceApi.getTeamAttendance(today),
    assignmentsApi.getBySupervisor(today),
    attendanceApi.getEarlyDepartures(today),
    usersApi.getTeamLocations(),
    visitsApi.getAllVisits(),
    attendanceApi.getIncompleteRoutes(today),
  ]).then(([t, a, e, locs, v, ir]) => { setTeam(t); setAssignments(a); setEarlyAlerts(e); setEmpLocations(locs); setRecentVisits(v); setIncompleteRouteAlerts(ir); });

  useEffect(() => {
    loadData().finally(() => setLoading(false));
    // Refrescar ubicaciones cada 30 segundos
    const interval = setInterval(() => usersApi.getTeamLocations().then(setEmpLocations), 30000);
    return () => clearInterval(interval);
  }, []);

  const present = team.filter((t) => t.status === 'ACTIVE' || t.status === 'ON_LUNCH' || t.status === 'COMPLETED');
  const absent = team.filter((t) => t.scheduledToday && !t.checkIn);
  const pendingAssignments = assignments.filter((a) => !a.visits || a.visits.length === 0);
  const commentedVisits = recentVisits.filter((v) => v.comment).slice(0, 6);

  const kpis = [
    { label: 'Equipo Total', value: team.length, icon: 'groups', color: 'border-primary-fixed-dim' },
    { label: 'Presentes', value: present.length, icon: 'where_to_vote', color: 'border-status-onsite', textColor: 'text-status-onsite' },
    { label: 'Ausentes', value: absent.length, icon: 'person_off', color: 'border-status-absent', textColor: 'text-status-absent' },
    { label: 'Visitas Pendientes', value: pendingAssignments.length, icon: 'pending_actions', color: 'border-secondary', textColor: 'text-secondary' },
    { label: 'Salidas Tempranas', value: earlyAlerts.length, icon: 'running_with_errors', color: 'border-status-late', textColor: 'text-status-late' },
  ];

  const mapPoints = assignments.filter((a) => a.client?.lat).map((a) => ({
    lat: a.client.lat, lng: a.client.lng, name: a.client.name,
    employee: a.employee?.name, visit: a.visits?.[0],
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-role-supervisor border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <section className="border-l-4 border-role-supervisor pl-4 border-b border-border-subtle/10 pb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-on-surface">Resumen de Turno</h1>
        <p className="text-sm text-on-surface-variant mt-1 flex items-center gap-1">
          <span className="material-symbols-outlined text-role-supervisor text-base">admin_panel_settings</span>
          Vista de Supervisor · {format(new Date(), 'dd/MM/yyyy')}
        </p>
      </section>

      {/* Alerta prominente de salidas tempranas */}
      {earlyAlerts.length > 0 && (
        <div className="bg-status-late/10 border border-status-late/50 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-status-late text-2xl">warning</span>
            <div>
              <p className="font-bold text-on-surface">
                {earlyAlerts.length === 1 ? '1 empleado salió antes de completar su jornada' : `${earlyAlerts.length} empleados salieron antes de completar su jornada`}
              </p>
              <p className="text-xs text-on-surface-variant">Jornada estándar: 8 horas (sin almuerzo)</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {earlyAlerts.map((a) => {
              const missing = 480 - a.workedMinutes;
              return (
                <div key={a.id} className="bg-surface rounded-lg p-3 flex items-center gap-3 border border-status-late/30">
                  <div className="w-9 h-9 rounded-full bg-status-late/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-status-late text-lg">person</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-on-surface">{a.user.name}</p>
                    <p className="text-xs text-on-surface-variant">
                      Salió a las {format(new Date(a.checkOut), 'HH:mm')} · Trabajó {minutesToHM(a.workedMinutes)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-mono font-bold text-status-late">-{minutesToHM(missing)}</p>
                    <p className="text-[10px] text-on-surface-variant">faltantes</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Alerta de rutas incompletas al finalizar jornada */}
      {incompleteRouteAlerts.length > 0 && (
        <div className="bg-error/10 border border-error/50 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-error text-2xl">report</span>
            <div>
              <p className="font-bold text-on-surface">
                {incompleteRouteAlerts.length === 1
                  ? '1 colaborador finalizó su jornada sin completar la ruta'
                  : `${incompleteRouteAlerts.length} colaboradores finalizaron su jornada sin completar la ruta`}
              </p>
              <p className="text-xs text-on-surface-variant">Marcaron salida con clientes pendientes por visitar</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {incompleteRouteAlerts.map((a) => (
              <div key={a.user.id} className="bg-surface rounded-lg p-3 flex items-center gap-3 border border-error/30">
                <div className="w-9 h-9 rounded-full bg-error/20 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-error text-lg">person</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-on-surface">{a.user.name}</p>
                  <p className="text-xs text-on-surface-variant">
                    Salió a las {format(new Date(a.checkOut), 'HH:mm')} · {a.pendingClients.length} de {a.totalAssigned} clientes sin visitar
                  </p>
                  <p className="text-xs text-on-surface-variant truncate">{a.pendingClients.map((c) => c.name).join(', ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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

      {/* Map + Team */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card overflow-hidden h-[380px]">
          <div className="p-4 border-b border-border-subtle/10 flex justify-between items-center">
            <h2 className="font-bold text-lg text-primary">Mapa del Equipo</h2>
            {empLocations.length > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-mono bg-role-supervisor/10 border border-role-supervisor/30 text-on-surface px-2 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-role-supervisor animate-pulse" />
                {empLocations.length} empleado{empLocations.length > 1 ? 's' : ''} en vivo
              </span>
            )}
          </div>
          <div style={{ height: 'calc(100% - 57px)' }}>
            <MapContainer center={[-2.9, -79.0]} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {/* Ubicaciones de clientes */}
              {mapPoints.map((p, i) => (
                <Marker key={`c-${i}`} position={[p.lat, p.lng]} icon={statusIcon(p.visit?.status ?? 'ABSENT')}>
                  <Popup>
                    <div className="text-sm">
                      <p className="font-bold">{p.name}</p>
                      <p className="text-gray-600 text-xs">{p.employee}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
              {/* Ubicaciones en tiempo real de empleados */}
              {empLocations.map((emp) => {
                const initials = emp.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
                const minsAgo = Math.round((Date.now() - new Date(emp.lastLocationAt).getTime()) / 60000);
                return (
                  <Marker key={`e-${emp.id}`} position={[emp.lastLat, emp.lastLng]} icon={employeeIcon(initials)}>
                    <Popup>
                      <div className="text-sm">
                        <p className="font-bold text-role-supervisor">{emp.name}</p>
                        <p className="text-gray-500 text-xs">Hace {minsAgo < 1 ? 'menos de 1 min' : `${minsAgo} min`}</p>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>

        {/* Team List */}
        <div className="card flex flex-col h-[380px]">
          <div className="p-4 border-b border-border-subtle/10">
            <h2 className="font-bold text-lg text-primary">Estado del Equipo</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {team.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl opacity-30">group</span>
                <p className="text-sm">Sin empleados registrados hoy</p>
              </div>
            )}
            {team.map((m) => (
              <div key={m.id} className={`p-3 bg-surface rounded-lg border flex items-center gap-3 ${m.earlyDeparture ? 'border-status-late/50 bg-status-late/5' : 'border-outline-variant/30'}`}>
                <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-bold text-sm shrink-0">
                  {m.user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-on-surface truncate">{m.user.name}</p>
                  <p className="text-xs text-on-surface-variant">
                    {m.checkIn ? `Entrada: ${format(new Date(m.checkIn), 'HH:mm')}` : m.scheduledToday ? 'Sin registro' : 'Sin horario hoy'}
                    {m.workedMinutes ? ` · ${minutesToHM(m.workedMinutes)}` : ''}
                  </p>
                  {(m.lunchStart || m.lunchEnd) && (
                    <p className="text-xs text-status-late font-mono">
                      Almuerzo: {m.lunchStart ? format(new Date(m.lunchStart), 'HH:mm') : '--'}
                      {' → '}
                      {m.lunchEnd ? format(new Date(m.lunchEnd), 'HH:mm') : 'en curso'}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`w-2.5 h-2.5 rounded-full ${m.status === 'ACTIVE' ? 'bg-status-onsite' : m.status === 'ON_LUNCH' ? 'bg-status-late' : m.status === 'COMPLETED' ? 'bg-outline' : m.scheduledToday ? 'bg-status-absent' : 'bg-outline-variant'}`} />
                  {m.earlyDeparture && (
                    <span className="material-symbols-outlined text-status-late text-sm" title="Salida temprana">running_with_errors</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visitas Pendientes + Comentarios Recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card flex flex-col h-[340px]">
          <div className="p-4 border-b border-border-subtle/10 flex items-center justify-between">
            <h2 className="font-bold text-lg text-secondary">Visitas Pendientes Hoy</h2>
            {pendingAssignments.length > 0 && (
              <span className="text-xs font-mono font-bold text-secondary bg-secondary/10 px-2 py-0.5 rounded-full">{pendingAssignments.length}</span>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {pendingAssignments.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl opacity-30">task_alt</span>
                <p className="text-sm">Todas las rutas del día están cubiertas</p>
              </div>
            )}
            {pendingAssignments.map((a) => (
              <div key={a.id} className="p-3 bg-surface rounded-lg border border-outline-variant/30 flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary shrink-0">store</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-on-surface truncate">{a.client.name}</p>
                  <p className="text-xs text-on-surface-variant truncate">{a.employee?.name}</p>
                </div>
                <span className="status-chip-pending shrink-0">Pendiente</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card flex flex-col h-[340px]">
          <div className="p-4 border-b border-border-subtle/10">
            <h2 className="font-bold text-lg text-primary">Comentarios Recientes de Visitas</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {commentedVisits.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl opacity-30">chat</span>
                <p className="text-sm">Sin comentarios recientes</p>
              </div>
            )}
            {commentedVisits.map((v) => (
              <div key={v.id} className="p-3 bg-surface rounded-lg border border-outline-variant/30">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-on-surface truncate">{v.employee.name} · {v.client.name}</p>
                  {isVisitOffSite(v, v.client) && (
                    <span className="text-xs text-status-late shrink-0" title="Check-in fuera del sitio del cliente">📍⚠</span>
                  )}
                </div>
                <p className="text-xs text-on-surface-variant mt-1">{v.comment}</p>
                <p className="text-[10px] font-mono text-on-surface-variant/60 mt-1">{format(dateOnlyToLocal(v.date), 'dd/MM/yyyy')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
