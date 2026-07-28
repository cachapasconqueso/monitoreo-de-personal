import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const pinIcon = L.divIcon({
  html: `<div style="background:#006a67;width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  className: '',
});

interface LatLng { lat: number; lng: number; }

function ClickHandler({ onPick }: { onPick: (pos: LatLng) => void }) {
  useMapEvents({
    click(e) { onPick({ lat: e.latlng.lat, lng: e.latlng.lng }); },
  });
  return null;
}

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.setView(center, map.getZoom()); }, [center]);
  return null;
}

interface MapPickerProps {
  value: LatLng | null;
  onChange: (pos: LatLng, address: string) => void;
  initialCenter?: [number, number];
}

export default function MapPicker({ value, onChange, initialCenter }: MapPickerProps) {
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [center, setCenter] = useState<[number, number]>(initialCenter ?? [-2.9, -79.0]);

  const handlePick = async (pos: LatLng) => {
    // Reverse geocoding con Nominatim (OSM, gratis)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${pos.lat}&lon=${pos.lng}&format=json`,
        { headers: { 'Accept-Language': 'es' } }
      );
      const data = await res.json();
      const address = data.display_name || `${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`;
      onChange(pos, address);
    } catch {
      onChange(pos, `${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}`);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=ec`,
        { headers: { 'Accept-Language': 'es' } }
      );
      const data = await res.json();
      setSearchResults(data);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectResult = (r: any) => {
    const pos = { lat: parseFloat(r.lat), lng: parseFloat(r.lon) };
    setCenter([pos.lat, pos.lng]);
    setSearchResults([]);
    setQuery(r.display_name);
    onChange(pos, r.display_name);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Buscador */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Buscar dirección en Cuenca..."
            className="input-field pr-10 text-sm"
          />
          {searching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin h-4 w-4 border-2 border-secondary border-t-transparent rounded-full" />
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={handleSearch}
          className="btn-primary px-3 flex items-center gap-1 text-sm"
        >
          <span className="material-symbols-outlined text-lg">search</span>
        </button>
      </div>

      {/* Resultados de búsqueda */}
      {searchResults.length > 0 && (
        <div className="bg-surface border border-outline-variant rounded-lg shadow-modal overflow-hidden">
          {searchResults.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelectResult(r)}
              className="w-full text-left px-3 py-2.5 text-sm hover:bg-surface-container border-b border-outline-variant/20 last:border-0 transition-colors flex items-start gap-2"
            >
              <span className="material-symbols-outlined text-secondary text-base mt-0.5 shrink-0">location_on</span>
              <span className="text-on-surface line-clamp-2">{r.display_name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Mapa */}
      <div className="relative rounded-xl overflow-hidden border border-outline-variant/30" style={{ height: 280 }}>
        <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPick={handlePick} />
          <RecenterMap center={center} />
          {value && <Marker position={[value.lat, value.lng]} icon={pinIcon} />}
        </MapContainer>

        {/* Instrucción */}
        {!value && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-surface/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-on-surface shadow-sm border border-outline-variant/30 pointer-events-none whitespace-nowrap">
            <span className="material-symbols-outlined text-secondary text-sm align-middle mr-1">touch_app</span>
            Toca el mapa para colocar el pin
          </div>
        )}
      </div>

      {/* Coordenadas */}
      {value && (
        <div className="flex items-center gap-2 bg-secondary/5 border border-secondary/20 rounded-lg px-3 py-2">
          <span className="material-symbols-outlined text-secondary text-lg">location_on</span>
          <div className="text-xs font-mono text-on-surface-variant">
            <span className="text-secondary font-bold">Pin colocado · </span>
            {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
          </div>
          <button
            type="button"
            onClick={() => onChange({ lat: 0, lng: 0 }, '')}
            className="ml-auto text-on-surface-variant hover:text-error transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
      )}
    </div>
  );
}
