import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/auth';

import Login from './pages/Login';
import EmpleadoLayout from './pages/empleado/EmpleadoLayout';
import EmpleadoDashboard from './pages/empleado/Dashboard';
import EmpleadoMapa from './pages/empleado/Mapa';
import EmpleadoRutaSemanal from './pages/empleado/RutaSemanal';
import EmpleadoHistorial from './pages/empleado/Historial';
import SupervisorLayout from './pages/supervisor/SupervisorLayout';
import SupervisorDashboard from './pages/supervisor/Dashboard';
import SupervisorAsignaciones from './pages/supervisor/Asignaciones';
import SupervisorClientes from './pages/supervisor/Clientes';
import SupervisorUsuarios from './pages/supervisor/Usuarios';
import SupervisorReportes from './pages/supervisor/Reportes';
import JefeLayout from './pages/jefe/JefeLayout';
import JefeDashboard from './pages/jefe/Dashboard';
import JefeReportes from './pages/jefe/Reportes';
import JefeUsuarios from './pages/jefe/Usuarios';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) {
    if (user.role === 'EMPLEADO') return <Navigate to="/empleado" replace />;
    if (user.role === 'SUPERVISOR') return <Navigate to="/supervisor" replace />;
    return <Navigate to="/jefe" replace />;
  }
  return <>{children}</>;
}

export default function App() {
  const { user } = useAuthStore();
  const home = user?.role === 'EMPLEADO' ? '/empleado' : user?.role === 'SUPERVISOR' ? '/supervisor' : user ? '/jefe' : '/login';

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { borderRadius: '12px', fontFamily: 'Inter, sans-serif', fontSize: '14px' },
          duration: 3000,
        }}
      />
      <Routes>
        <Route path="/login" element={user ? <Navigate to={home} replace /> : <Login />} />

        <Route path="/empleado" element={<ProtectedRoute allowedRoles={['EMPLEADO']}><EmpleadoLayout /></ProtectedRoute>}>
          <Route index element={<EmpleadoDashboard />} />
          <Route path="mapa" element={<EmpleadoMapa />} />
          <Route path="semana" element={<EmpleadoRutaSemanal />} />
          <Route path="historial" element={<EmpleadoHistorial />} />
        </Route>

        <Route path="/supervisor" element={<ProtectedRoute allowedRoles={['SUPERVISOR']}><SupervisorLayout /></ProtectedRoute>}>
          <Route index element={<SupervisorDashboard />} />
          <Route path="usuarios" element={<SupervisorUsuarios />} />
          <Route path="asignaciones" element={<SupervisorAsignaciones />} />
          <Route path="clientes" element={<SupervisorClientes />} />
          <Route path="reportes" element={<SupervisorReportes />} />
        </Route>

        <Route path="/jefe" element={<ProtectedRoute allowedRoles={['JEFE']}><JefeLayout /></ProtectedRoute>}>
          <Route index element={<JefeDashboard />} />
          <Route path="usuarios" element={<JefeUsuarios />} />
          <Route path="reportes" element={<JefeReportes />} />
        </Route>

        <Route path="/" element={<Navigate to={home} replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
