import { useAuthStore } from '../../store/auth';
import { useNavigate } from 'react-router-dom';

interface TopNavProps {
  title?: string;
}

export default function TopNav({ title = 'Geopoint' }: TopNavProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="hidden md:flex justify-between items-center px-6 h-16 w-full fixed top-0 z-50 bg-surface border-b border-outline-variant/30 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-primary text-on-primary rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>fingerprint</span>
          </div>
          <span className="font-bold text-xl text-primary">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-on-surface-variant font-mono">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant"
            title="Cerrar sesión"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </header>

      <header className="flex md:hidden justify-between items-center px-4 h-14 w-full fixed top-0 z-50 bg-surface border-b border-outline-variant/30 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary text-on-primary rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>fingerprint</span>
          </div>
          <span className="font-bold text-lg text-primary">{title}</span>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant"
          title="Cerrar sesión"
        >
          <span className="material-symbols-outlined">logout</span>
        </button>
      </header>
    </>
  );
}
