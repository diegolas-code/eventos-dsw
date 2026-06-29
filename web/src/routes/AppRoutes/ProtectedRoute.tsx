import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

/**
 * Componente que protege rutas basándose en la sesión local.
 * Si no hay sesión, redirige al perfil (login).
 * Si hay roles permitidos definidos y el rol actual no es compatible, redirige al inicio.
 */
export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('demo_session_rol');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/perfil" replace />;
  }

  if (allowedRoles && (!userRole || !allowedRoles.includes(userRole))) {
    return <Navigate to="/perfil" state={{ emitirRegistroEntidad: true }} replace />;
  }

  return <>{children}</>;
}
