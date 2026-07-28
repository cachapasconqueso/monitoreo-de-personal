import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';

interface NavItem {
  to: string;
  icon: string;
  label: string;
}

interface SideNavProps {
  items: NavItem[];
  accentColor?: string;
}

export default function SideNav({ items, accentColor = 'bg-secondary-container text-on-secondary-container' }: SideNavProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <nav className="hidden md:flex flex-col h-screen border-r border-outline-variant/20 bg-surface-container-lowest w-64 fixed left-0 top-0 pt-20 z-40 justify-between shadow-sm">
      <div className="px-4 py-4 flex flex-col gap-1">
        <div className="px-3 pb-4 mb-2 border-b border-outline-variant/20">
          <p className="font-bold text-primary">Panel de Control</p>
          <p className="text-xs text-on-surface-variant mt-0.5">
            {user?.role === 'EMPLEADO' ? 'Colaborador' : user?.role === 'SUPERVISOR' ? 'Supervisor' : 'Jefe'}
          </p>
        </div>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 mx-1 rounded-lg transition-all duration-150 text-sm font-medium ${
                isActive ? accentColor : 'text-on-surface-variant hover:bg-surface-container-high'
              }`
            }
          >
            <span className="material-symbols-outlined text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
      <div className="px-4 pb-6 flex flex-col gap-1">
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="flex items-center gap-3 px-4 py-3 mx-1 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-all text-sm font-medium w-full"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </nav>
  );
}
