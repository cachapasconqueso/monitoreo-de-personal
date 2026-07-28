import { useEffect, useState } from 'react';
import { format, subDays } from 'date-fns';
import toast from 'react-hot-toast';
import * as attendanceApi from '../../api/attendance';
import * as visitsApi from '../../api/visits';
import * as usersApi from '../../api/users';
import { isVisitOffSite } from '../../lib/metrics';
import { dateOnlyToLocal } from '../../lib/date';

interface Employee { id: string; name: string; email: string; phone?: string; }

interface AttRecord { id: string; date: string; status: string; checkIn: string | null; checkOut: string | null; earlyDeparture: boolean; late: boolean; workedMinutes: number | null; }
interface VisitRecord { id: string; date: string; status: string; comment: string | null; checkIn: string | null; checkOut: string | null; lat: number | null; lng: number | null; client: { name: string; lat: number; lng: number }; }
interface ScheduleBlock { id: string; daysOfWeek: number[]; startTime: string; endTime: string; }

const RANGE_DAYS = 14;
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
const DAY_SHORT: Record<number, string> = { 0: 'D', 1: 'L', 2: 'M', 3: 'X', 4: 'J', 5: 'V', 6: 'S' };
const DAY_NAMES: Record<number, string> = { 0: 'dom', 1: 'lun', 2: 'mar', 3: 'mié', 4: 'jue', 5: 'vie', 6: 'sáb' };

export default function EmployeeProfileModal({ employee, onClose }: { employee: Employee; onClose: () => void }) {
  const [attendance, setAttendance] = useState<AttRecord[]>([]);
  const [visits, setVisits] = useState<VisitRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<ScheduleBlock[]>([]);
  const [newDays, setNewDays] = useState<number[]>([]);
  const [newStart, setNewStart] = useState('08:00');
  const [newEnd, setNewEnd] = useState('17:00');
  const [savingSchedule, setSavingSchedule] = useState(false);

  const loadSchedules = () => usersApi.getSchedules(employee.id).then(setSchedules);

  useEffect(() => {
    const from = format(subDays(new Date(), RANGE_DAYS), 'yyyy-MM-dd');
    const to = format(new Date(), 'yyyy-MM-dd');
    Promise.all([
      attendanceApi.getAllAttendance(employee.id, from, to),
      visitsApi.getVisitsByEmployeeRange(employee.id, from, to),
      loadSchedules(),
    ]).then(([a, v]) => { setAttendance(a); setVisits(v); }).finally(() => setLoading(false));
  }, [employee.id]);

  const completedDays = attendance.filter((a) => a.workedMinutes != null);
  const onTimeDays = completedDays.filter((a) => !a.earlyDeparture);
  const punctualityRate = completedDays.length > 0 ? Math.round((onTimeDays.length / completedDays.length) * 100) : 0;
  const avgWorked = completedDays.length
    ? Math.round(completedDays.reduce((s, a) => s + (a.workedMinutes || 0), 0) / completedDays.length)
    : 0;
  const visitsCompleted = visits.filter((v) => v.status === 'COMPLETED').length;
  const offSiteCount = visits.filter((v) => isVisitOffSite(v, v.client)).length;

  const lateCount = attendance.filter((a) => a.late).length;

  const fmt = (d: string | null) => d ? format(new Date(d), 'HH:mm') : '--';
  const fmtDate = (d: string) => format(dateOnlyToLocal(d), 'dd/MM');

  const toggleNewDay = (day: number) => {
    setNewDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()));
  };

  const handleAddSchedule = async () => {
    if (newDays.length === 0) { toast.error('Selecciona al menos un día'); return; }
    if (newStart >= newEnd) { toast.error('La hora de salida debe ser posterior a la de ingreso'); return; }
    setSavingSchedule(true);
    try {
      await usersApi.addSchedule(employee.id, { daysOfWeek: newDays, startTime: newStart, endTime: newEnd });
      toast.success('Horario agregado');
      setNewDays([]);
      loadSchedules();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error al guardar el horario');
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleRemoveSchedule = async (id: string) => {
    try {
      await usersApi.removeSchedule(id);
      setSchedules((prev) => prev.filter((s) => s.id !== id));
    } catch {
      toast.error('Error al eliminar el horario');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="card p-6 w-full max-w-2xl my-4 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-start mb-5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-lg shrink-0">
              {employee.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-lg text-on-surface">{employee.name}</h3>
              <p className="text-xs text-on-surface-variant">{employee.email}{employee.phone ? ` · ${employee.phone}` : ''}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin h-8 w-8 border-2 border-role-supervisor border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="overflow-y-auto flex flex-col gap-4">
            <p className="text-xs text-on-surface-variant -mt-2">Últimos {RANGE_DAYS} días</p>

            <div className="card p-3 flex flex-col gap-3 bg-secondary/5 border-secondary/20">
              <p className="text-xs font-mono font-bold text-on-surface-variant uppercase tracking-wider">Horario Laboral</p>

              {schedules.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  {schedules.map((s) => (
                    <div key={s.id} className="flex items-center gap-2 p-2 rounded-lg bg-surface border border-outline-variant/30 text-sm">
                      <span className="font-mono font-bold text-secondary shrink-0">
                        {[...s.daysOfWeek].sort((a, b) => WEEK_ORDER.indexOf(a) - WEEK_ORDER.indexOf(b)).map((d) => DAY_NAMES[d]).join(', ')}
                      </span>
                      <span className="text-on-surface-variant">{s.startTime} - {s.endTime}</span>
                      <button onClick={() => handleRemoveSchedule(s.id)} className="ml-auto p-1 text-error hover:bg-error/10 rounded transition-colors" title="Eliminar">
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {WEEK_ORDER.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleNewDay(day)}
                      className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${newDays.includes(day) ? 'bg-secondary text-on-secondary' : 'bg-surface text-on-surface-variant border border-outline-variant/30'}`}
                    >
                      {DAY_SHORT[day]}
                    </button>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Hora de Ingreso</label>
                    <input type="time" value={newStart} onChange={(e) => setNewStart(e.target.value)} className="input-field" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Hora de Salida</label>
                    <input type="time" value={newEnd} onChange={(e) => setNewEnd(e.target.value)} className="input-field" />
                  </div>
                  <button onClick={handleAddSchedule} disabled={savingSchedule} className="btn-primary text-sm px-4 py-2.5 disabled:opacity-60 flex items-center justify-center gap-2">
                    {savingSchedule && <div className="animate-spin h-4 w-4 border-2 border-on-primary border-t-transparent rounded-full" />}
                    Agregar
                  </button>
                </div>
              </div>
            </div>
            {lateCount > 0 && (
              <p className="text-xs text-status-late -mt-2">⏰ {lateCount} llegada{lateCount > 1 ? 's' : ''} tarde en los últimos {RANGE_DAYS} días</p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="card p-3 text-center">
                <p className="font-mono font-bold text-2xl text-status-onsite">{punctualityRate}%</p>
                <p className="text-xs text-on-surface-variant mt-1">Puntualidad</p>
              </div>
              <div className="card p-3 text-center">
                <p className="font-mono font-bold text-2xl text-secondary">{(avgWorked / 60).toFixed(1)}h</p>
                <p className="text-xs text-on-surface-variant mt-1">Prom. Trabajado</p>
              </div>
              <div className="card p-3 text-center">
                <p className="font-mono font-bold text-2xl text-role-supervisor">{visitsCompleted}</p>
                <p className="text-xs text-on-surface-variant mt-1">Visitas Completadas</p>
              </div>
              <div className="card p-3 text-center">
                <p className={`font-mono font-bold text-2xl ${offSiteCount > 0 ? 'text-status-late' : 'text-on-surface-variant'}`}>{offSiteCount}</p>
                <p className="text-xs text-on-surface-variant mt-1">Check-ins Fuera de Sitio</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-sm text-on-surface mb-2">Asistencia Reciente</h4>
              <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
                {attendance.length === 0 && <p className="text-sm text-on-surface-variant">Sin registros en el período</p>}
                {attendance.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg bg-surface border border-outline-variant/30 text-sm">
                    <span className="font-mono text-on-surface-variant w-12 shrink-0">{fmtDate(a.date)}</span>
                    <span className="font-mono text-status-onsite">{fmt(a.checkIn)}</span>
                    <span className="text-on-surface-variant">→</span>
                    <span className="font-mono text-error">{fmt(a.checkOut)}</span>
                    <span className="ml-auto flex items-center gap-2">
                      {a.late && <span className="text-xs text-status-late" title="Llegada tarde">⏰ tarde</span>}
                      {a.earlyDeparture && <span className="text-xs text-status-late" title="Salida temprana">⚠ temprano</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-sm text-on-surface mb-2">Visitas Recientes</h4>
              <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto">
                {visits.length === 0 && <p className="text-sm text-on-surface-variant">Sin visitas en el período</p>}
                {visits.map((v) => (
                  <div key={v.id} className="p-2 rounded-lg bg-surface border border-outline-variant/30 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-on-surface-variant w-12 shrink-0">{fmtDate(v.date)}</span>
                      <span className="font-bold text-on-surface truncate">{v.client.name}</span>
                      {isVisitOffSite(v, v.client) && <span className="text-xs text-status-late ml-auto shrink-0" title="Fuera de sitio">📍⚠</span>}
                    </div>
                    {v.comment && <p className="text-xs text-on-surface-variant mt-1 pl-14">{v.comment}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
