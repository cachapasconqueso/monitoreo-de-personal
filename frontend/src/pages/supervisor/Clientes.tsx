import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as clientsApi from '../../api/clients';
import MapPicker from '../../components/ui/MapPicker';

interface Client { id: string; name: string; address: string; lat: number; lng: number; phone?: string; email?: string; notes?: string; }
interface PinPos { lat: number; lng: number; }

const emptyForm = { name: '', address: '', phone: '', email: '', notes: '' };

export default function SupervisorClientes() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [pinPos, setPinPos] = useState<PinPos | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadClients = (s?: string) => clientsApi.getClients(s).then(setClients);
  useEffect(() => { loadClients().finally(() => setLoading(false)); }, []);

  const handleSearch = (s: string) => { setSearch(s); loadClients(s || undefined); };

  const handlePinChange = (pos: PinPos, address: string) => {
    if (pos.lat === 0 && pos.lng === 0) {
      setPinPos(null);
      return;
    }
    setPinPos(pos);
    if (address && !form.address) setForm((f) => ({ ...f, address }));
    else if (address) setForm((f) => ({ ...f, address }));
  };

  const handleSave = async () => {
    if (!form.name) { toast.error('El nombre es obligatorio'); return; }
    if (!pinPos) { toast.error('Coloca el pin en el mapa para ubicar al cliente'); return; }
    if (!form.address) { toast.error('La dirección es obligatoria'); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        address: form.address,
        lat: pinPos.lat,
        lng: pinPos.lng,
        phone: form.phone || undefined,
        email: form.email || undefined,
        notes: form.notes || undefined,
      };
      if (editingId) {
        await clientsApi.updateClient(editingId, payload);
        toast.success('Cliente actualizado');
      } else {
        await clientsApi.createClient(payload);
        toast.success('Cliente creado');
      }
      closeForm();
      loadClients(search || undefined);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const openEditForm = (client: Client) => {
    setEditingId(client.id);
    setForm({
      name: client.name,
      address: client.address,
      phone: client.phone || '',
      email: client.email || '',
      notes: client.notes || '',
    });
    setPinPos({ lat: client.lat, lng: client.lng });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este cliente?')) return;
    try {
      await clientsApi.deleteClient(id);
      toast.success('Cliente eliminado');
      setClients((prev) => prev.filter((c) => c.id !== id));
    } catch { toast.error('Error al eliminar'); }
  };

  const closeForm = () => { setShowForm(false); setEditingId(null); setForm(emptyForm); setPinPos(null); };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-2 border-role-supervisor border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="flex flex-col gap-4 max-w-5xl mx-auto">
      <div className="flex justify-between items-end border-b border-border-subtle/10 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Gestión de Clientes</h1>
          <p className="text-sm text-on-surface-variant mt-1">{clients.length} clientes activos</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-xl">add</span>
          Nuevo Cliente
        </button>
      </div>

      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-xl">search</span>
        <input type="text" value={search} onChange={(e) => handleSearch(e.target.value)} placeholder="Buscar por nombre o dirección..." className="input-field pl-10" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {clients.length === 0 && (
          <div className="col-span-2 card p-10 flex flex-col items-center gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl opacity-30">store</span>
            <p>No hay clientes registrados</p>
            <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
              <span className="material-symbols-outlined">add</span> Crear primer cliente
            </button>
          </div>
        )}
        {clients.map((c) => (
          <div key={c.id} className="card p-4 flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-secondary">store</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-on-surface">{c.name}</p>
              <p className="text-xs text-on-surface-variant mt-0.5 truncate flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">location_on</span>{c.address}
              </p>
              {c.phone && <p className="text-xs text-on-surface-variant mt-0.5 flex items-center gap-1"><span className="material-symbols-outlined text-sm">call</span>{c.phone}</p>}
              <p className="text-xs font-mono text-on-surface-variant/60 mt-1">{c.lat.toFixed(4)}, {c.lng.toFixed(4)}</p>
            </div>
            <div className="flex flex-col gap-1 shrink-0">
              <button onClick={() => openEditForm(c)} className="p-1.5 text-secondary hover:bg-secondary/10 rounded-lg transition-colors" title="Editar ubicación y datos">
                <span className="material-symbols-outlined text-xl">edit_location_alt</span>
              </button>
              <button onClick={() => handleDelete(c.id)} className="p-1.5 text-error hover:bg-error/10 rounded-lg transition-colors" title="Eliminar cliente">
                <span className="material-symbols-outlined text-xl">delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal crear cliente */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="card p-6 w-full max-w-lg my-4">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="font-bold text-lg text-on-surface">{editingId ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {editingId ? 'Ajusta el pin en el mapa si la ubicación no es correcta' : 'Coloca el pin en el mapa para la ubicación exacta'}
                </p>
              </div>
              <button onClick={closeForm} className="text-on-surface-variant hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {/* Nombre */}
              <div>
                <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Nombre del cliente *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field"
                  placeholder="Supermercado El Centro"
                />
              </div>

              {/* Mapa picker */}
              <div>
                <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                  Ubicación en mapa *
                  <span className="ml-2 text-secondary normal-case font-normal">Busca o toca el mapa para colocar el pin</span>
                </label>
                <MapPicker value={pinPos} onChange={handlePinChange} initialCenter={editingId && pinPos ? [pinPos.lat, pinPos.lng] : undefined} />
              </div>

              {/* Dirección (se llena sola al pinear, editable) */}
              <div>
                <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Dirección *</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="input-field"
                  placeholder="Se completa automáticamente al poner el pin"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Teléfono</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" placeholder="07x-xxxxxx" />
                </div>
                <div>
                  <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Correo</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" placeholder="email@cliente.com" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Notas</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="input-field resize-none" placeholder="Notas adicionales..." />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={closeForm} className="flex-1 btn-secondary">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-60">
                {saving && <div className="animate-spin h-4 w-4 border-2 border-on-primary border-t-transparent rounded-full" />}
                {editingId ? 'Guardar Cambios' : 'Guardar Cliente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
