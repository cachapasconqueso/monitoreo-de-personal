import { Outlet } from 'react-router-dom';
import AppLayout from '../../components/layout/AppLayout';

const navItems = [
  { to: '/jefe', icon: 'dashboard', label: 'Dashboard' },
  { to: '/jefe/usuarios', icon: 'manage_accounts', label: 'Usuarios' },
  { to: '/jefe/reportes', icon: 'analytics', label: 'Reportes' },
];

export default function JefeLayout() {
  return (
    <AppLayout navItems={navItems} accentColor="bg-primary text-on-primary font-bold">
      <Outlet />
    </AppLayout>
  );
}
