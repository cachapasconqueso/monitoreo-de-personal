import { Outlet } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';

const navItems = [
  { to: '/empleado', icon: 'home', label: 'Inicio' },
  { to: '/empleado/mapa', icon: 'map', label: 'Mapa' },
  { to: '/empleado/semana', icon: 'calendar_view_week', label: 'Semana' },
  { to: '/empleado/historial', icon: 'history', label: 'Historial' },
];

export default function EmpleadoLayout() {
  return (
    <AppLayout navItems={navItems}>
      <Outlet />
    </AppLayout>
  );
}
