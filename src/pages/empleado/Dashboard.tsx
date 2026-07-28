import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { useClock } from '../../hooks/useClock';
import { useGeolocation, haversineDistance } from '../../hooks/useGeolocation';
import type { GeoPosition } from '../../hooks/useGeolocation';
import { useAuthStore } from '../../store/auth';
import * as attendanceApi from '../../api/attendance';
import * as assignmentsApi from '../../api/assignments';
import * as visitsApi from '../../api/visits';

const MAX_VISIT_RADIUS = 30; // metros

interface Attendance {
  id: string; checkIn: string | null; checkOut: string | null;
  lunchStart: string | null; lunchEnd: string | null; status: string;
}

interface Assignment {
  id: string; order: number;
  client: { id: string; name: string; address: string; lat: number; lng: number };
  visits: Array<{ id: string; checkIn: string | null; checkOut: string | null; status: string; comment: string | null }>;
}

type ConfirmAction = 'check-in' | 'check-out' | 'lunch-start' | 'lunch-end' | null;

interface GeoAlert { distance: number; clientName: string; }

export default function EmpleadoDashboard() {
  const { user } = useAuthStore();
  const clock = useClock();
  const { getCurrentPosition, startWatching, stopWatching } = useGeolocation();
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState<ConfirmAction>(null);
  const [visitModal, setVisitModal] = useState<Assignment | null>(null);
  const [geoAlert, setGeoAlert] = useState<GeoAlert | null>(null);
  const [pendingCheckIn, setPendingCheckIn] = useState<Assignment | null>(null);
  const [comment, setComment] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const [myPosition, setMyPosition] = useState<GeoPosition | null>(null);

  const loadData = async () => {
    try {
      const [att, route] = await Promise.all([
        attendanceApi.getToday(),
        assignmentsApi.getMyRoute(),
      ]);
      setAttendance(att);
      setAssignments(route);
    } catch {
      //
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Iniciar seguimiento GPS cuando el componente carga
    startWatching((pos) => setMyPosition(pos));
    return () => stopWatching();
  }, []);

  const handleAttendanceAction = async (action: ConfirmAction) => {
    const now = new Date().toISOString();
    try {
      let result;
      if (action === 'check-in') result = await attendanceApi.checkIn(now);
      else if (action === 'check-out') result = await attendanceApi.checkOut(now);
      else if (action === 'lunch-start') result = await attendanceApi.lunchStart(now);
      else if (action === 'lunch-end') result = await attendanceApi.lunchEnd(now);
      setAttendance(result);
      toast.success('Registro exitoso');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error al registrar');
    } finally {
      setConfirm(null);
    }
  };

  const handleVisitCheckIn = async (assignment: Assignment) => {
    setGeoLoading(true);
    try {
      const pos = await getCurrentPosition();
      setMyPosition(pos);
      const dist = haversineDistance(pos.lat, pos.lng, assignment.client.lat, assignment.client.lng);

      if (dist > MAX_VISIT_RADIUS) {
        // Fuera del rango — pedir confirmación
        setGeoAlert({ distance: Math.round(dist), clientName: assignment.client.name });
        setPendingCheckIn(assignment);
        return;
      }

      await doVisitCheckIn(assignment, pos);
    } catch {
      // GPS no disponible → permitir sin verificación
      await doVisitCheckIn(assignment, null);
    } finally {
      setGeoLoading(false);
    }
  };

  const doVisitCheckIn = async (assignment: Assignment, pos: GeoPosition | null) => {
    try {
      await visitsApi.visitCheckIn({
        clientId: assignment.client.id,
        assignmentId: assignment.id,
        lat: pos?.lat,
        lng: pos?.lng,
      });
      toast.success(`Entrada registrada en ${assignment.client.name}`);
      loadData();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error');
    }
  };

  const handleGeoOverride = async () => {
    if (!pendingCheckIn) return;
    setGeoAlert(null);
    await doVisitCheckIn(pendingCheckIn, myPosition);
    setPendingCheckIn(null);
  };

  const handleVisitCheckOut = async (assignment: Assignment) => {
    const activeVisit = assignment.visits.find((v) => v.status === 'IN_PROGRESS');
    if (!activeVisit) return;
    let pos: GeoPosition | null = null;
    try { pos = await getCurrentPosition(); } catch { /* opcional */ }
    try {
      await visitsApi.visitCheckOut({ visitId: activeVisit.id, comment, lat: pos?.lat, lng: pos?.lng });
      toast.success(`Salida registrada de ${assignment.client.name}`);
      setVisitModal(null);
      setComment('');
      loadData();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error');
    }
  };

  const getVisitStatus = (a: Assignment) => a.visits[0]?.status ?? 'PENDING';

  const timeStr = format(clock, 'HH:mm:ss');
  const dateStr = format(clock, "EEEE, d 'de' MMMM", { locale: es });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-secondary border-t-transparent rounded-full" />
      </div>
    );
  }

  const status = attendance?.status ?? 'PENDING';
  const canCheckIn = !attendance?.checkIn;
  const canCheckOut = !!attendance?.checkIn && !attendance?.checkOut;
  const canLunchStart = !!attendance?.checkIn && !attendance?.lunchStart && !attendance?.checkOut;
  const canLunchEnd = !!attendance?.lunchStart && !attendance?.lunchEnd;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 border-b border-border-subtle/10 pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-on-surface">Hola, {user?.name?.split(' ')[0]}</h1>
          <p className="text-on-surface-variant text-sm mt-1">Colaborador · {format(new Date(), 'dd/MM/yyyy')}</p>
        </div>
        <div className="flex items-center gap-2">
          {myPosition && (
            <div className="flex items-center gap-1 bg-status-onsite/10 border border-status-onsite/30 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-status-onsite animate-pulse" />
              <span className="text-xs font-mono font-bold text-on-surface">GPS Activo</span>
            </div>
          )}
          <div className={`flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded-full border border-outline-variant/30`}>
            <span className={`w-2 h-2 rounded-full ${status === 'ACTIVE' ? 'bg-status-onsite' : status === 'ON_LUNCH' ? 'bg-status-late' : status === 'COMPLETED' ? 'bg-outline' : 'bg-status-absent'}`} />
            <span className="text-xs font-mono font-bold text-on-surface">
              {status === 'ACTIVE' ? 'Turno Activo' : status === 'ON_LUNCH' ? 'En Almuerzo' : status === 'COMPLETED' ? 'Jornada Finalizada' : 'Sin Jornada'}
            </span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Clock & Actions */}
        <div className="col-span-1 md:col-span-5 card p-6 flex flex-col justify-between min-h-[320px]">
          <div className="text-center">
            <p className="text-xs font-mono text-on-surface-variant uppercase tracking-wider mb-2">Hora Actual</p>
            <div className="font-mono text-5xl font-bold text-primary tracking-tight tabular-nums">{timeStr}</div>
            <p className="text-on-surface-variant text-sm mt-2 capitalize">{dateStr}</p>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            {canCheckIn && (
              <button onClick={() => setConfirm('check-in')} className="w-full btn-teal py-4 flex flex-col items-center gap-1">
                <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>fingerprint</span>
                <span className="text-lg font-bold">Iniciar Jornada</span>
              </button>
            )}
            {canCheckOut && (
              <button onClick={() => setConfirm('check-out')} className="w-full bg-error text-on-error rounded-xl py-4 flex flex-col items-center gap-1 font-bold text-lg active:scale-95 transition-all">
                <span className="material-symbols-outlined text-3xl">logout</span>
                Finalizar Jornada
              </button>
            )}
            {canLunchStart && (
              <button onClick={() => setConfirm('lunch-start')} className="w-full bg-status-late text-on-surface rounded-xl py-3 flex items-center justify-center gap-2 font-bold active:scale-95 transition-all">
                <span className="material-symbols-outlined">restaurant</span>Inicio Almuerzo
              </button>
            )}
            {canLunchEnd && (
              <button onClick={() => setConfirm('lunch-end')} className="w-full bg-secondary/10 border border-secondary text-secondary rounded-xl py-3 flex items-center justify-center gap-2 font-bold active:scale-95 transition-all">
                <span className="material-symbols-outlined">restaurant</span>Fin Almuerzo
              </button>
            )}
            {attendance?.checkIn && (
              <div className="grid grid-cols-2 gap-2 text-xs font-mono text-on-surface-variant mt-2">
                {attendance.checkIn && <div className="bg-surface-container p-2 rounded-lg"><span className="block text-status-onsite font-bold">ENTRADA</span>{format(new Date(attendance.checkIn), 'HH:mm')}</div>}
                {attendance.lunchStart && <div className="bg-surface-container p-2 rounded-lg"><span className="block text-status-late font-bold">ALM. INI</span>{format(new Date(attendance.lunchStart), 'HH:mm')}</div>}
                {attendance.lunchEnd && <div className="bg-surface-container p-2 rounded-lg"><span className="block text-secondary font-bold">ALM. FIN</span>{format(new Date(attendance.lunchEnd), 'HH:mm')}</div>}
                {attendance.checkOut && <div className="bg-surface-container p-2 rounded-lg"><span className="block text-error font-bold">SALIDA</span>{format(new Date(attendance.checkOut), 'HH:mm')}</div>}
              </div>
            )}
          </div>
        </div>

        {/* Route */}
        <div className="col-span-1 md:col-span-7 card p-6 flex flex-col">
          <div className="card-header flex justify-between items-center">
            <h3 className="font-bold text-lg text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">checklist</span>Ruta del Día
            </h3>
            <span className="bg-primary-fixed text-on-primary-fixed px-2 py-1 rounded text-xs font-mono font-bold">{assignments.length} Puntos</span>
          </div>
          {assignments.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-2 text-on-surface-variant py-8">
              <span className="material-symbols-outlined text-5xl opacity-30">route</span>
              <p className="text-sm">No tienes clientes asignados hoy</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto pr-1">
              {assignments.map((a, i) => {
                const visitStatus = getVisitStatus(a);
                const distToClient = myPosition
                  ? Math.round(haversineDistance(myPosition.lat, myPosition.lng, a.client.lat, a.client.lng))
                  : null;
                return (
                  <div key={a.id} className={`flex items-start gap-3 p-4 rounded-lg bg-surface border relative overflow-hidden transition-colors ${visitStatus === 'COMPLETED' ? 'border-status-onsite/30' : visitStatus === 'IN_PROGRESS' ? 'border-secondary/50 shadow-sm' : 'border-outline-variant/30 opacity-80'}`}>
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${visitStatus === 'COMPLETED' ? 'bg-status-onsite' : visitStatus === 'IN_PROGRESS' ? 'bg-status-late' : 'bg-surface-container-high'}`} />
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ml-1 ${visitStatus === 'IN_PROGRESS' ? 'bg-secondary text-on-secondary' : 'bg-surface-container-high text-on-surface-variant'}`}>{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-on-surface font-mono">{a.client.name}</p>
                      <p className="text-xs text-on-surface-variant mt-0.5 truncate">{a.client.address}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {visitStatus === 'COMPLETED' && <span className="status-chip-onsite">Completado</span>}
                        {visitStatus === 'IN_PROGRESS' && <span className="status-chip-late">En Visita</span>}
                        {visitStatus === 'PENDING' && <span className="status-chip-pending">Pendiente</span>}
                        {distToClient !== null && visitStatus === 'PENDING' && (
                          <span className={`text-xs font-mono flex items-center gap-0.5 ${distToClient <= MAX_VISIT_RADIUS ? 'text-status-onsite' : 'text-on-surface-variant'}`}>
                            <span className="material-symbols-outlined text-sm">near_me</span>
                            {distToClient < 1000 ? `${distToClient}m` : `${(distToClient / 1000).toFixed(1)}km`}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      {visitStatus === 'PENDING' && attendance?.checkIn && !attendance?.checkOut && (
                        <button
                          onClick={() => handleVisitCheckIn(a)}
                          disabled={geoLoading}
                          className="btn-teal text-xs px-3 py-1.5 flex items-center gap-1 disabled:opacity-60"
                        >
                          {geoLoading ? <div className="animate-spin h-3 w-3 border-2 border-on-secondary border-t-transparent rounded-full" /> : <span className="material-symbols-outlined text-sm">login</span>}
                          Entrada
                        </button>
                      )}
                      {visitStatus === 'IN_PROGRESS' && (
                        <button onClick={() => { setVisitModal(a); setComment(''); }} className="bg-error text-on-error rounded-lg text-xs px-3 py-1.5 font-bold flex items-center gap-1 active:scale-95">
                          <span className="material-symbols-outlined text-sm">logout</span>Salida
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Confirm Modal */}
      {confirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${confirm === 'check-in' ? 'bg-secondary/10' : confirm === 'check-out' ? 'bg-error/10' : 'bg-status-late/10'}`}>
                <span className={`material-symbols-outlined text-2xl ${confirm === 'check-in' ? 'text-secondary' : confirm === 'check-out' ? 'text-error' : 'text-status-late'}`}>
                  {confirm === 'check-in' ? 'fingerprint' : confirm === 'check-out' ? 'logout' : 'restaurant'}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-on-surface">¿Confirmar registro?</h3>
                <p className="text-xs text-on-surface-variant">
                  {confirm === 'check-in' ? 'Iniciar jornada laboral' : confirm === 'check-out' ? 'Finalizar jornada laboral' : confirm === 'lunch-start' ? 'Iniciar almuerzo' : 'Finalizar almuerzo'}
                </p>
              </div>
            </div>
            <p className="text-sm text-on-surface-variant mb-5 bg-surface-container p-3 rounded-lg font-mono">
              {format(clock, 'HH:mm:ss · dd/MM/yyyy')}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)} className="flex-1 btn-secondary">Cancelar</button>
              <button onClick={() => handleAttendanceAction(confirm)} className="flex-1 btn-primary">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* Geo Alert Modal - fuera de rango */}
      {geoAlert && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-status-late/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl text-status-late">location_off</span>
              </div>
              <div>
                <h3 className="font-bold text-on-surface">Fuera de rango</h3>
                <p className="text-xs text-on-surface-variant">Verificación de ubicación</p>
              </div>
            </div>
            <div className="bg-surface-container p-3 rounded-lg mb-4">
              <p className="text-sm text-on-surface">
                Estás a <span className="font-mono font-bold text-status-late">{geoAlert.distance}m</span> de <strong>{geoAlert.clientName}</strong>.
              </p>
              <p className="text-xs text-on-surface-variant mt-1">El radio máximo permitido es {MAX_VISIT_RADIUS}m.</p>
            </div>
            <p className="text-sm text-on-surface-variant mb-4">¿Deseas registrar la entrada de todas formas?</p>
            <div className="flex gap-3">
              <button onClick={() => { setGeoAlert(null); setPendingCheckIn(null); }} className="flex-1 btn-secondary">Cancelar</button>
              <button onClick={handleGeoOverride} className="flex-1 bg-status-late text-on-surface rounded-lg px-4 py-2.5 font-semibold text-sm active:scale-95 transition-all">
                Registrar igual
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visit Checkout Modal */}
      {visitModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-sm">
            <h3 className="font-bold text-on-surface mb-1">Registrar Salida</h3>
            <p className="text-sm text-secondary font-mono mb-4">{visitModal.client.name}</p>
            <div className="mb-4">
              <label className="block text-xs font-bold font-mono text-on-surface-variant mb-2 uppercase tracking-wider">Comentario de la Visita</label>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="input-field resize-none" rows={3} placeholder="¿Cómo fue la visita? (opcional)" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setVisitModal(null)} className="flex-1 btn-secondary">Cancelar</button>
              <button onClick={() => handleVisitCheckOut(visitModal)} className="flex-1 bg-error text-on-error rounded-lg px-4 py-2.5 font-semibold text-sm active:scale-95 transition-all">
                Registrar Salida
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
