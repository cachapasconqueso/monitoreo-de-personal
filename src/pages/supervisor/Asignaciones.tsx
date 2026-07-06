import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import * as usersApi from '../../api/users';
import * as clientsApi from '../../api/clients';
import * as assignmentsApi from '../../api/assignments';

interface Employee { id: string; name: string; email: string; }
interface Client { id: string; name: string; address: string; lat: number; lng: number; }
interface Assignment {
  id: string; order: number;
  client: Client;
  employee: { id: string; name: string };
  visits: any[];
}
interface RouteTemplate {
  id: string;
  daysOfWeek: number[];
  startDate: string;
  endDate: string | null;
  clients: { client: Client }[];
}

const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
const DAY_SHORT: Record<number, string> = { 0: 'D', 1: 'L', 2: 'M', 3: 'X', 4: 'J', 5: 'V', 6: 'S' };
const DAY_NAMES: Record<number, string> = { 0: 'domingos', 1: 'lunes', 2: 'martes', 3: 'miércoles', 4: 'jueves', 5: 'viernes', 6: 'sábados' };

function dateStrToLocalDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export default function SupervisorAsignaciones() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [templates, setTemplates] = useState<RouteTemplate[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [repeatEnabled, setRepeatEnabled] = useState(false);
  const [repeatDays, setRepeatDays] = useState<number[]>([]);

  useEffect(() => {
    Promise.all([usersApi.getMyEmployees(), clientsApi.getClients()])
      .then(([emps, cls]) => { setEmployees(emps); setClients(cls); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedEmployee && selectedDate) {
      assignmentsApi.getByEmployee(selectedEmployee, selectedDate).then(setAssignments);
    }
  }, [selectedEmployee, selectedDate]);

  useEffect(() => {
    if (selectedEmployee) {
      assignmentsApi.getRecurringByEmployee(selectedEmployee).then(setTemplates);
    } else {
      setTemplates([]);
    }
  }, [selectedEmployee]);

  const toggleRepeat = () => {
    setRepeatEnabled((prev) => {
      const next = !prev;
      if (next && repeatDays.length === 0) {
        setRepeatDays([dateStrToLocalDate(selectedDate).getDay()]);
      }
      return next;
    });
  };

  const toggleRepeatDay = (day: number) => {
    setRepeatDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort());
  };

  const handleAssign = async () => {
    if (!selectedEmployee || selectedClients.length === 0) {
      toast.error('Selecciona un empleado y al menos un cliente');
      return;
    }
    if (repeatEnabled && repeatDays.length === 0) {
      toast.error('Selecciona al menos un día de la semana para repetir');
      return;
    }
    setSaving(true);
    try {
      if (repeatEnabled) {
        await assignmentsApi.createRecurringRoute({
          employeeId: selectedEmployee,
          clients: selectedClients.map((id, i) => ({ clientId: id, order: i })),
          daysOfWeek: repeatDays,
          startDate: selectedDate,
        });
        toast.success('Ruta recurrente creada correctamente');
        assignmentsApi.getRecurringByEmployee(selectedEmployee).then(setTemplates);
      } else {
        await assignmentsApi.createAssignment({
          employeeId: selectedEmployee,
          date: selectedDate,
          clients: selectedClients.map((id, i) => ({ clientId: id, order: i })),
        });
        toast.success('Clientes asignados correctamente');
      }
      setSelectedClients([]);
      setRepeatEnabled(false);
      setRepeatDays([]);
      assignmentsApi.getByEmployee(selectedEmployee, selectedDate).then(setAssignments);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error al asignar');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await assignmentsApi.removeAssignment(id);
      toast.success('Asignación eliminada');
      setAssignments((prev) => prev.filter((a) => a.id !== id));
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const handleRemoveTemplate = async (id: string) => {
    try {
      await assignmentsApi.removeRecurringRoute(id);
      toast.success('Ruta recurrente cancelada');
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch {
      toast.error('Error al cancelar la ruta recurrente');
    }
  };

  const toggleClient = (id: string) => {
    setSelectedClients((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
  };

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.address.toLowerCase().includes(search.toLowerCase())
  );

  const assignedClientIds = assignments.map((a) => a.client.id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-role-supervisor border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div className="border-b border-border-subtle/10 pb-4">
        <h1 className="text-2xl font-bold text-on-surface">Asignación de Clientes</h1>
        <p className="text-sm text-on-surface-variant mt-1">Asigna y gestiona la ruta diaria de cada colaborador</p>
      </div>

      {/* Filters */}
      <div className="card p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase tracking-wider mb-2">Colaborador</label>
          <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)} className="input-field">
            <option value="">Seleccionar empleado...</option>
            {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase tracking-wider mb-2">Fecha</label>
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="input-field" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Client Pool */}
        <div className="card p-4 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-on-surface">Clientes Disponibles</h3>
            {selectedClients.length > 0 && (
              <button onClick={handleAssign} disabled={saving || !selectedEmployee} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">{repeatEnabled ? 'event_repeat' : 'add'}</span>
                {repeatEnabled ? 'Crear ruta recurrente' : `Asignar ${selectedClients.length}`}
              </button>
            )}
          </div>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-xl">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar cliente..."
              className="input-field pl-10"
            />
          </div>

          <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-container">
            <input
              type="checkbox"
              id="repeat-toggle"
              checked={repeatEnabled}
              onChange={toggleRepeat}
              className="w-4 h-4"
            />
            <label htmlFor="repeat-toggle" className="text-sm font-medium text-on-surface cursor-pointer flex-1">
              Repetir esta ruta semanalmente
            </label>
          </div>

          {repeatEnabled && (
            <div className="flex flex-col gap-3 p-3 rounded-lg bg-surface-container border border-outline-variant/20">
              <div>
                <p className="text-xs text-on-surface-variant mb-2">Días de la semana</p>
                <div className="flex flex-wrap gap-1.5">
                  {WEEK_ORDER.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleRepeatDay(day)}
                      className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${repeatDays.includes(day) ? 'bg-secondary text-on-secondary' : 'bg-surface text-on-surface-variant border border-outline-variant/30'}`}
                    >
                      {DAY_SHORT[day]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 overflow-y-auto max-h-80">
            {filteredClients.map((c) => {
              const isAssigned = assignedClientIds.includes(c.id);
              const isSelected = selectedClients.includes(c.id);
              return (
                <div
                  key={c.id}
                  onClick={() => !isAssigned && toggleClient(c.id)}
                  className={`p-3 rounded-lg border flex items-center gap-3 transition-all ${isAssigned ? 'opacity-40 bg-surface-container cursor-not-allowed border-outline-variant/30' : isSelected ? 'border-secondary bg-secondary/5 cursor-pointer' : 'border-outline-variant/30 hover:border-secondary/50 bg-surface cursor-pointer'}`}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${isSelected ? 'bg-secondary border-secondary' : 'border-outline-variant'}`}>
                    {isSelected && <span className="material-symbols-outlined text-on-secondary text-sm">check</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-on-surface">{c.name}</p>
                    <p className="text-xs text-on-surface-variant truncate">{c.address}</p>
                  </div>
                  {isAssigned && <span className="status-chip-onsite">Asignado</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Assignments */}
        <div className="card p-4 flex flex-col gap-3">
          <h3 className="font-bold text-on-surface">
            Ruta Asignada
            {selectedEmployee && <span className="text-on-surface-variant font-normal text-sm ml-2">· {employees.find((e) => e.id === selectedEmployee)?.name}</span>}
          </h3>

          {!selectedEmployee ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl opacity-30">person</span>
              <p className="text-sm">Selecciona un colaborador</p>
            </div>
          ) : assignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl opacity-30">route</span>
              <p className="text-sm">Sin clientes asignados para esta fecha</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2 overflow-y-auto max-h-80">
              {assignments.map((a, i) => {
                const hasVisit = a.visits?.length > 0;
                return (
                  <div key={a.id} className="p-3 rounded-lg border border-outline-variant/30 bg-surface flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center text-xs font-bold shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-on-surface">{a.client.name}</p>
                      <p className="text-xs text-on-surface-variant truncate">{a.client.address}</p>
                    </div>
                    {hasVisit && <span className="status-chip-onsite">Visitado</span>}
                    {!hasVisit && (
                      <button
                        onClick={() => handleRemove(a.id)}
                        className="p-1.5 text-error hover:bg-error/10 rounded-lg transition-colors"
                        title="Eliminar asignación"
                      >
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recurring Routes */}
      {selectedEmployee && templates.length > 0 && (
        <div className="card p-4 flex flex-col gap-3">
          <h3 className="font-bold text-on-surface">Rutas Recurrentes Activas</h3>
          <div className="flex flex-col gap-2">
            {templates.map((t) => (
              <div key={t.id} className="p-3 rounded-lg border border-outline-variant/30 bg-surface flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-xl shrink-0">event_repeat</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-on-surface truncate">
                    {t.clients.map((c) => c.client.name).join(', ')}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    Todos los {[...t.daysOfWeek].sort((a, b) => WEEK_ORDER.indexOf(a) - WEEK_ORDER.indexOf(b)).map((d) => DAY_NAMES[d]).join(', ')} · desde {t.startDate.slice(0, 10)}
                    {t.endDate ? ` hasta ${t.endDate.slice(0, 10)}` : ' · indefinido'}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveTemplate(t.id)}
                  className="p-1.5 text-error hover:bg-error/10 rounded-lg transition-colors"
                  title="Cancelar ruta recurrente"
                >
                  <span className="material-symbols-outlined text-xl">event_busy</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
