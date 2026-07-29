import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as usersApi from '../../api/users';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  createdAt: string;
  supervisedBy?: { id: string; name: string };
}

type RoleFilter = 'TODOS' | 'SUPERVISOR' | 'EMPLEADO';
const emptyForm = { name: '', email: '', password: '', phone: '', role: 'EMPLEADO', supervisorId: '' };
const emptyEditForm = { name: '', email: '', phone: '', role: 'EMPLEADO', supervisorId: '' };

export default function JefeUsuarios() {
  const [users, setUsers] = useState<User[]>([]);
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const [filter, setFilter] = useState<RoleFilter>('TODOS');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deactivatingUser, setDeactivatingUser] = useState<User | null>(null);
  const [deactivating, setDeactivating] = useState(false);

  const load = () =>
    usersApi.getUsers()
      .then((all) => {
        setUsers(all);
        setSupervisors(all.filter((u: User) => u.role === 'SUPERVISOR'));
      })
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.name || !form.email || !form.password) {
      toast.error('Nombre, correo y contraseña son obligatorios');
      return;
    }
    if (form.role === 'EMPLEADO' && !form.supervisorId) {
      toast.error('Debes asignar un supervisor al empleado');
      return;
    }
    setSaving(true);
    try {
      await usersApi.createUser({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        role: form.role,
        supervisorId: form.role === 'EMPLEADO' ? form.supervisorId : undefined,
      });
      toast.success(`${form.role === 'SUPERVISOR' ? 'Supervisor' : 'Empleado'} ${form.name} creado`);
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error al crear usuario');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (u: User) => {
    setEditingUser(u);
    setEditForm({
      name: u.name,
      email: u.email,
      phone: u.phone || '',
      role: u.role,
      supervisorId: u.supervisedBy?.id || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    if (!editForm.name || !editForm.email) {
      toast.error('Nombre y correo son obligatorios');
      return;
    }
    if (editForm.role === 'EMPLEADO' && !editForm.supervisorId) {
      toast.error('Debes asignar un supervisor al empleado');
      return;
    }
    setSavingEdit(true);
    try {
      const payload: Record<string, unknown> = {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone || undefined,
        role: editForm.role,
      };
      if (editForm.role === 'EMPLEADO') {
        payload.supervisorId = editForm.supervisorId;
      } else if (editingUser.role === 'EMPLEADO') {
        // Se está ascendiendo de empleado a supervisor: ya no depende de un supervisor.
        payload.supervisorId = null;
      }
      await usersApi.updateUser(editingUser.id, payload);
      toast.success('Usuario actualizado');
      setEditingUser(null);
      load();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error al actualizar usuario');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivatingUser) return;
    setDeactivating(true);
    try {
      await usersApi.deactivateUser(deactivatingUser.id);
      toast.success(`${deactivatingUser.name} fue eliminado del sistema`);
      setDeactivatingUser(null);
      load();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error al eliminar usuario');
    } finally {
      setDeactivating(false);
    }
  };

  const filtered = users.filter((u) => filter === 'TODOS' || u.role === filter);

  const roleLabel = (r: string) =>
    r === 'JEFE' ? 'Jefe' : r === 'SUPERVISOR' ? 'Supervisor' : 'Empleado';

  const roleColor = (r: string) =>
    r === 'JEFE'
      ? 'bg-primary text-on-primary'
      : r === 'SUPERVISOR'
      ? 'bg-role-supervisor/20 text-on-surface border border-role-supervisor'
      : 'bg-secondary/10 text-secondary border border-secondary/30';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const empleados = users.filter((u) => u.role === 'EMPLEADO');

  return (
    <div className="flex flex-col gap-4 max-w-5xl mx-auto">
      <div className="flex justify-between items-end border-b border-border-subtle/10 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Gestión de Usuarios</h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {supervisors.length} supervisores · {empleados.length} empleados
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-xl">person_add</span>
          Nuevo Usuario
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Supervisores', value: supervisors.length, icon: 'admin_panel_settings', color: 'text-role-supervisor' },
          { label: 'Empleados', value: empleados.length, icon: 'badge', color: 'text-secondary' },
          { label: 'Total', value: users.length, icon: 'group', color: 'text-primary' },
        ].map((s) => (
          <div key={s.label} className="card p-3 text-center">
            <span className={`material-symbols-outlined text-2xl ${s.color}`}>{s.icon}</span>
            <p className={`font-mono font-bold text-2xl mt-1 ${s.color}`}>{s.value}</p>
            <p className="text-xs text-on-surface-variant">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-surface-container rounded-xl p-1 w-fit">
        {(['TODOS', 'SUPERVISOR', 'EMPLEADO'] as RoleFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === f ? 'bg-surface-container-lowest shadow-sm text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            {f === 'TODOS' ? 'Todos' : f === 'SUPERVISOR' ? 'Supervisores' : 'Empleados'}
          </button>
        ))}
      </div>

      {/* Users list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((u) => (
          <div key={u.id} className="card p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-on-surface-variant shrink-0">
              {u.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-on-surface truncate">{u.name}</p>
              <p className="text-xs text-on-surface-variant truncate">{u.email}</p>
              {u.supervisedBy && (
                <p className="text-xs text-on-surface-variant mt-0.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">supervisor_account</span>
                  {u.supervisedBy.name}
                </p>
              )}
            </div>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shrink-0 ${roleColor(u.role)}`}>
              {roleLabel(u.role)}
            </span>
            {u.role !== 'JEFE' && (
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openEdit(u)} className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded transition-colors" title="Editar">
                  <span className="material-symbols-outlined text-lg">edit</span>
                </button>
                <button onClick={() => setDeactivatingUser(u)} className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded transition-colors" title="Eliminar">
                  <span className="material-symbols-outlined text-lg">person_remove</span>
                </button>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 card p-10 flex flex-col items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl opacity-30">group_off</span>
            <p>Sin usuarios en esta categoría</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="font-bold text-lg text-on-surface">Nuevo Usuario</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">Recibirá acceso al sistema</p>
              </div>
              <button onClick={() => { setShowForm(false); setForm(emptyForm); }} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {/* Rol */}
              <div>
                <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Rol *</label>
                <div className="grid grid-cols-2 gap-2">
                  {['SUPERVISOR', 'EMPLEADO'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setForm({ ...form, role: r, supervisorId: '' })}
                      className={`p-3 rounded-lg border-2 text-sm font-bold transition-all ${form.role === r ? (r === 'SUPERVISOR' ? 'border-role-supervisor bg-role-supervisor/10 text-on-surface' : 'border-secondary bg-secondary/10 text-secondary') : 'border-outline-variant text-on-surface-variant hover:border-outline'}`}
                    >
                      <span className="material-symbols-outlined block text-2xl mb-1">
                        {r === 'SUPERVISOR' ? 'admin_panel_settings' : 'badge'}
                      </span>
                      {r === 'SUPERVISOR' ? 'Supervisor' : 'Empleado'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Nombre completo *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Juan Pérez" />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Correo electrónico *</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" placeholder="usuario@empresa.com" />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Contraseña *</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="input-field pr-10"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface">
                    <span className="material-symbols-outlined text-xl">{showPass ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Teléfono</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" placeholder="09xxxxxxxx" />
              </div>

              {form.role === 'EMPLEADO' && (
                <div>
                  <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Supervisor *</label>
                  <select value={form.supervisorId} onChange={(e) => setForm({ ...form, supervisorId: e.target.value })} className="input-field">
                    <option value="">Seleccionar supervisor...</option>
                    {supervisors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowForm(false); setForm(emptyForm); }} className="flex-1 btn-secondary">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-60">
                {saving && <div className="animate-spin h-4 w-4 border-2 border-on-primary border-t-transparent rounded-full" />}
                Crear Usuario
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Editar usuario */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="font-bold text-lg text-on-surface">Editar Usuario</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">{editingUser.name}</p>
              </div>
              <button onClick={() => setEditingUser(null)} className="text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Rol *</label>
                <div className="grid grid-cols-2 gap-2">
                  {['SUPERVISOR', 'EMPLEADO'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setEditForm({ ...editForm, role: r, supervisorId: r === 'SUPERVISOR' ? '' : editForm.supervisorId })}
                      className={`p-3 rounded-lg border-2 text-sm font-bold transition-all ${editForm.role === r ? (r === 'SUPERVISOR' ? 'border-role-supervisor bg-role-supervisor/10 text-on-surface' : 'border-secondary bg-secondary/10 text-secondary') : 'border-outline-variant text-on-surface-variant hover:border-outline'}`}
                    >
                      <span className="material-symbols-outlined block text-2xl mb-1">
                        {r === 'SUPERVISOR' ? 'admin_panel_settings' : 'badge'}
                      </span>
                      {r === 'SUPERVISOR' ? 'Supervisor' : 'Empleado'}
                    </button>
                  ))}
                </div>
                {editingUser.role === 'EMPLEADO' && editForm.role === 'SUPERVISOR' && (
                  <p className="text-xs text-status-late mt-1.5">⚠ Esto asciende a {editingUser.name} de empleado a supervisor</p>
                )}
              </div>

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

              {editForm.role === 'EMPLEADO' && (
                <div>
                  <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Supervisor *</label>
                  <select value={editForm.supervisorId} onChange={(e) => setEditForm({ ...editForm, supervisorId: e.target.value })} className="input-field">
                    <option value="">Seleccionar supervisor...</option>
                    {supervisors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditingUser(null)} className="flex-1 btn-secondary">Cancelar</button>
              <button onClick={handleSaveEdit} disabled={savingEdit} className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-60">
                {savingEdit && <div className="animate-spin h-4 w-4 border-2 border-on-primary border-t-transparent rounded-full" />}
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmar eliminación */}
      {deactivatingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-2xl text-error">person_remove</span>
              </div>
              <div>
                <h3 className="font-bold text-on-surface">¿Eliminar a {deactivatingUser.name}?</h3>
                <p className="text-xs text-on-surface-variant">Perderá acceso al sistema de inmediato</p>
              </div>
            </div>
            <p className="text-sm text-on-surface-variant mb-5 bg-surface-container p-3 rounded-lg">
              Su historial de asistencia y visitas se conserva, pero ya no podrá iniciar sesión ni aparecerá en los paneles de equipo.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeactivatingUser(null)} className="flex-1 btn-secondary">Cancelar</button>
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
