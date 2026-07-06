import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import * as assignmentsApi from '../../api/assignments';
import { useGeolocation, haversineDistance } from '../../hooks/useGeolocation';
import type { GeoPosition } from '../../hooks/useGeolocation';
import toast from 'react-hot-toast';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const clientIcon = (color: string, num: number) =>
  L.divIcon({
    html: `<div style="background:${color};color:white;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:15px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35)">${num}</div>`,
    iconSize: [34, 34], iconAnchor: [17, 17], className: '',
  });

const myIcon = L.divIcon({
  html: `<div style="background:#006a67;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 0 0 3px #006a6750"></div>`,
  iconSize: [20, 20], iconAnchor: [10, 10], className: '',
});

interface Assignment {
  id: string; order: number;
  client: { id: string; name: string; address: string; lat: number; lng: number };
  visits: Array<{ status: string }>;
}

function FitBounds({ assignments, position }: { assignments: Assignment[]; position: GeoPosition | null }) {
  const map = useMap();
  useEffect(() => {
    const points: [number, number][] = assignments.map((a) => [a.client.lat, a.client.lng]);
    if (position) points.push([position.lat, position.lng]);
    if (points.length > 0) {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
    }
  }, [assignments, position, map]);
  return null;
}

export default function EmpleadoMapa() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [myPosition, setMyPosition] = useState<GeoPosition | null>(null);
  const { getCurrentPosition, startWatching, stopWatching } = useGeolocation();

  useEffect(() => {
    assignmentsApi.getMyRoute()
      .then(setAssignments)
      .catch(() => toast.error('Error al cargar ruta'))
      .finally(() => setLoading(false));

    getCurrentPosition().then(setMyPosition).catch(() => {});
    startWatching((pos) => setMyPosition(pos));
    return () => stopWatching();
  }, []);

  const routeCoords: [number, number][] = assignments.map((a) => [a.client.lat, a.client.lng]);
  const center: [number, number] = myPosition
    ? [myPosition.lat, myPosition.lng]
    : assignments[0]
    ? [assignments[0].client.lat, assignments[0].client.lng]
    : [-2.9, -79.0];

  const getColor = (a: Assignment) => {
    const s = a.visits[0]?.status;
    if (s === 'COMPLETED') return '#38D47A';
    if (s === 'IN_PROGRESS') return '#F5C030';
    return '#76777d';
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin h-8 w-8 border-2 border-secondary border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="flex flex-col gap-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-end border-b border-border-subtle/10 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Mapa de Ruta</h1>
          <p className="text-sm text-on-surface-variant mt-1">{assignments.length} puntos hoy · Ruta optimizada</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono flex-wrap">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-secondary inline-block" /> Tú</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-status-onsite inline-block" /> Completado</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-status-late inline-block" /> En visita</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-outline inline-block" /> Pendiente</span>
        </div>
      </div>

      {assignments.length === 0 && !myPosition ? (
        <div className="card p-12 flex flex-col items-center gap-3 text-on-surface-variant">
          <span className="material-symbols-outlined text-6xl opacity-30">map</span>
          <p>No tienes clientes asignados para hoy</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 card overflow-hidden h-[520px]">
            <MapContainer center={center} zoom={14} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <FitBounds assignments={assignments} position={myPosition} />

              {/* Mi posición */}
              {myPosition && (
                <>
                  <Marker position={[myPosition.lat, myPosition.lng]} icon={myIcon}>
                    <Popup>
                      <div className="text-sm">
                        <p className="font-bold text-secondary">📍 Tu ubicación actual</p>
                        <p className="text-gray-500 text-xs">Precisión: ±{Math.round(myPosition.accuracy)}m</p>
                      </div>
                    </Popup>
                  </Marker>
                  <Circle
                    center={[myPosition.lat, myPosition.lng]}
                    radius={myPosition.accuracy}
                    pathOptions={{ color: '#006a67', fillColor: '#006a6720', weight: 1 }}
                  />
                </>
              )}

              {/* Línea de ruta */}
              {routeCoords.length > 1 && (
                <Polyline positions={routeCoords} color="#006a67" weight={3} dashArray="8 4" opacity={0.6} />
              )}

              {/* Clientes con radio de 10m */}
              {assignments.map((a, i) => (
                <div key={a.id}>
                  <Marker position={[a.client.lat, a.client.lng]} icon={clientIcon(getColor(a), i + 1)}>
                    <Popup>
                      <div className="text-sm font-sans">
                        <p className="font-bold">{a.client.name}</p>
                        <p className="text-gray-600 text-xs">{a.client.address}</p>
                        {myPosition && (
                          <p className="text-xs mt-1 font-mono">
                            Distancia: <span className="font-bold">
                              {Math.round(haversineDistance(myPosition.lat, myPosition.lng, a.client.lat, a.client.lng))}m
                            </span>
                          </p>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                  <Circle
                    center={[a.client.lat, a.client.lng]}
                    radius={10}
                    pathOptions={{ color: getColor(a), fillColor: `${getColor(a)}15`, weight: 1, dashArray: '4 4' }}
                  />
                </div>
              ))}
            </MapContainer>
          </div>

          <div className="flex flex-col gap-3">
            {/* Mi ubicación */}
            {myPosition && (
              <div className="card p-4 bg-secondary/5 border-secondary/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-3 h-3 rounded-full bg-secondary animate-pulse" />
                  <p className="text-sm font-bold text-on-surface">Tu ubicación</p>
                </div>
                <p className="text-xs font-mono text-on-surface-variant">
                  {myPosition.lat.toFixed(5)}, {myPosition.lng.toFixed(5)}
                </p>
                <p className="text-xs text-on-surface-variant mt-0.5">Precisión: ±{Math.round(myPosition.accuracy)}m</p>
              </div>
            )}

            {/* Orden de ruta */}
            <div className="card p-4">
              <p className="text-xs font-mono font-bold text-on-surface-variant uppercase mb-3 tracking-wider">Orden de Ruta</p>
              <div className="flex flex-col gap-2">
                {assignments.map((a, i) => {
                  const visitStatus = a.visits[0]?.status ?? 'PENDING';
                  const dist = myPosition
                    ? Math.round(haversineDistance(myPosition.lat, myPosition.lng, a.client.lat, a.client.lng))
                    : null;
                  const inRange = dist !== null && dist <= 300;
                  return (
                    <div key={a.id} className={`flex items-center gap-3 p-3 rounded-lg border ${inRange && visitStatus === 'PENDING' ? 'border-status-onsite/50 bg-status-onsite/5' : 'border-outline-variant/30 bg-surface'}`}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: getColor(a) }}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-on-surface truncate">{a.client.name}</p>
                        {dist !== null && (
                          <p className={`text-xs font-mono ${inRange ? 'text-status-onsite font-bold' : 'text-on-surface-variant'}`}>
                            {inRange ? '✓ En rango · ' : ''}{dist < 1000 ? `${dist}m` : `${(dist / 1000).toFixed(1)}km`}
                          </p>
                        )}
                      </div>
                      {visitStatus === 'COMPLETED' && <span className="material-symbols-outlined text-status-onsite text-lg">check_circle</span>}
                      {visitStatus === 'IN_PROGRESS' && <span className="material-symbols-outlined text-status-late text-lg animate-pulse">pending</span>}
                    </div>
                  );
                })}
                {assignments.length === 0 && (
                  <p className="text-sm text-on-surface-variant text-center py-4">Sin clientes asignados hoy</p>
                )}
              </div>
            </div>

            <div className="card p-3 bg-sky-accent/50">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-secondary text-lg mt-0.5">info</span>
                <p className="text-xs text-on-surface-variant">
                  El círculo punteado alrededor de cada cliente indica el radio de <strong>10m</strong> para verificación de llegada. Cuando estés dentro, el cliente se marcará en verde.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
