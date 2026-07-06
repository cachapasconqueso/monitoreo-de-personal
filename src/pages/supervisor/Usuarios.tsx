import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/auth';
import * as usersApi from '../../api/users';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  createdAt: string;
}

const emptyForm = { name: '', email: '', password: '', phone: '' };

export default function SupervisorUsuarios() {
  const { user: me } = useAuthStore();
  const [employees, setEmployees] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

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
            <div key={emp.id} className="card p-4 flex items-center gap-4">
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
            </div>
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
    </div>
  );
}
