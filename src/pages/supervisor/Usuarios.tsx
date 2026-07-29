import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/auth';
import * as usersApi from '../../api/users';
import EmployeeProfileModal from '../../components/supervisor/EmployeeProfileModal';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  createdAt: string;
}

const emptyForm = { name: '', email: '', password: '', phone: '' };
const emptyEditForm = { name: '', email: '', phone: '' };

export default function SupervisorUsuarios() {
  const { user: me } = useAuthStore();
  const [employees, setEmployees] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileEmployee, setProfileEmployee] = useState<User | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<User | null>(null);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deactivatingEmployee, setDeactivatingEmployee] = useState<User | null>(null);
  const [deactivating, setDeactivating] = useState(false);

  const load = () =>
    usersApi.getMyEmployees()
      .then(setEmployees)
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.name || !form.email || !form.password) {
      toast.error('Nombre, correo y contraseña son obligatorios');
      return;
    }
    setSaving(true);
    try {
      await usersApi.createUser({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        role: 'EMPLEADO',
        supervisorId: me?.id,
      });
      toast.success(`Empleado ${form.name} creado`);
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error al crear usuario');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (emp: User) => {
    setEditingEmployee(emp);
    setEditForm({ name: emp.name, email: emp.email, phone: emp.phone || '' });
  };

  const handleSaveEdit = async () => {
    if (!editingEmployee) return;
    if (!editForm.name || !editForm.email) {
      toast.error('Nombre y correo son obligatorios');
      return;
    }
    setSavingEdit(true);
    try {
      await usersApi.updateUser(editingEmployee.id, {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone || undefined,
      });
      toast.success('Empleado actualizado');
      setEditingEmployee(null);
      load();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error al actualizar empleado');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivatingEmployee) return;
    setDeactivating(true);
    try {
      await usersApi.deactivateUser(deactivatingEmployee.id);
      toast.success(`${deactivatingEmployee.name} fue eliminado de tu equipo`);
      setDeactivatingEmployee(null);
      load();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error al eliminar empleado');
    } finally {
      setDeactivating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-role-supervisor border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-end border-b border-border-subtle/10 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Mis Colaboradores</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {employees.length} empleados bajo tu supervisión
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-xl">person_add</span>
          Nuevo Empleado
        </button>
      </div>

      {employees.length === 0 ? (
        <div className="card p-12 flex flex-col items-center gap-3 text-on-surface-variant">
          <span className="material-symbols-outlined text-6xl opacity-30">group</span>
          <p className="font-medium">No tienes empleados registrados aún</p>
          <p className="text-sm">Crea un empleado para que pueda ingresar al sistema</p>
          <button onClick={() => setShowForm(true)} className="btn-primary mt-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-xl">person_add</span>
            Crear primer empleado
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {employees.map((emp) => (
            <button
              key={emp.id}
              onClick={() => setProfileEmployee(emp)}
              className="card p-4 flex items-center gap-4 text-left hover:border-secondary/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-lg shrink-0">
                {emp.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-on-surface truncate">{emp.name}</p>
                <p className="text-xs text-on-surface-variant truncate">{emp.email}</p>
                {emp.phone && (
                  <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-sm">call</span>
                    {emp.phone}
                  </p>
                )}
              </div>
              <span className="status-chip-onsite shrink-0">Activo</span>
              <div className="flex items-center gap-1 shrink-0">
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); openEdit(emp); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); openEdit(emp); } }}
                  className="p-1.5 text-on-surface-variant hover:text-role-supervisor hover:bg-role-supervisor/10 rounded transition-colors"
                  title="Editar"
                >
                  <span className="material-symbols-outlined text-lg">edit</span>
                </span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); setDeactivatingEmployee(emp); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); setDeactivatingEmployee(emp); } }}
                  className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded transition-colors"
                  title="Eliminar"
                >
                  <span className="material-symbols-outlined text-lg">person_remove</span>
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Credenciales de acceso info */}
      <div className="card p-4 bg-sky-accent/40 border-sky-accent flex items-start gap-3 mt-2">
        <span className="material-symbols-outlined text-secondary text-xl mt-0.5">info</span>
        <div>
          <p className="text-sm font-bold text-on-surface">¿Cómo acceden los empleados?</p>
          <p className="text-sm text-on-surface-variant mt-1">
            Al crear un empleado, usa el <strong>correo</strong> y la <strong>contraseña</strong> que asignes para que puedan iniciar sesión en la app desde su celular o computadora.
          </p>
        </div>
      </div>

      {/* Modal crear empleado */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="font-bold text-lg text-on-surface">Nuevo Empleado</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Quedará asignado bajo tu supervisión
                </p>
              </div>
              <button onClick={() => { setShowForm(false); setForm(emptyForm); }} className="text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field"
                  placeholder="Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Correo electrónico *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field"
                  placeholder="empleado@empresa.com"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Contraseña *
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="input-field pr-10"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPass ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="input-field"
                  placeholder="09xxxxxxxx"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowForm(false); setForm(emptyForm); }} className="flex-1 btn-secondary">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving && <div className="animate-spin h-4 w-4 border-2 border-on-primary border-t-transparent rounded-full" />}
                Crear Empleado
              </button>
            </div>
          </div>
        </div>
      )}

      {profileEmployee && (
        <EmployeeProfileModal employee={profileEmployee} onClose={() => setProfileEmployee(null)} />
      )}

      {/* Modal editar empleado */}
      {editingEmployee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="font-bold text-lg text-on-surface">Editar Empleado</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">{editingEmployee.name}</p>
              </div>
              <button onClick={() => setEditingEmployee(null)} className="text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Nombre completo *</label>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="input-field" />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Correo electrónico *</label>
                <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="input-field" />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Teléfono</label>
                <input type="tel" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="input-field" placeholder="09xxxxxxxx" />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditingEmployee(null)} className="flex-1 btn-secondary">Cancelar</button>
              <button onClick={handleSaveEdit} disabled={savingEdit} className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-60">
                {savingEdit && <div className="animate-spin h-4 w-4 border-2 border-on-primary border-t-transparent rounded-full" />}
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar eliminación */}
      {deactivatingEmployee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl text-error">person_remove</span>
              </div>
              <div>
                <h3 className="font-bold text-on-surface">¿Eliminar a {deactivatingEmployee.name}?</h3>
                <p className="text-xs text-on-surface-variant">Perderá acceso al sistema de inmediato</p>
              </div>
            </div>
            <p className="text-sm text-on-surface-variant mb-5 bg-surface-container p-3 rounded-lg">
              Su historial de asistencia y visitas se conserva, pero ya no podrá iniciar sesión ni aparecerá en tu equipo.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeactivatingEmployee(null)} className="flex-1 btn-secondary">Cancelar</button>
              <button onClick={handleDeactivate} disabled={deactivating} className="flex-1 bg-error text-on-error rounded-lg px-4 py-2.5 font-semibold text-sm active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {deactivating && <div className="animate-spin h-4 w-4 border-2 border-on-error border-t-transparent rounded-full" />}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
