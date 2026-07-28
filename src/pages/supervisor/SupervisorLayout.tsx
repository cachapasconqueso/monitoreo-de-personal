import { Outlet } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';

const navItems = [
  { to: '/supervisor', icon: 'dashboard', label: 'Dashboard' },
  { to: '/supervisor/usuarios', icon: 'group', label: 'Empleados' },
  { to: '/supervisor/asignaciones', icon: 'assignment', label: 'Asignaciones' },
  { to: '/supervisor/clientes', icon: 'store', label: 'Clientes' },
  { to: '/supervisor/reportes', icon: 'bar_chart', label: 'Reportes' },
];

export default function SupervisorLayout() {
  return (
    <AppLayout navItems={navItems} accentColor="bg-role-supervisor/20 text-on-surface font-bold">
      <Outlet />
    </AppLayout>
  );
}
