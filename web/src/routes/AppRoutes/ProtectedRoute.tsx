import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Componente que protege rutas basándose en la sesión local (demo).
 * Si no hay sesión, redirige al perfil (login).
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isLoggedIn = localStorage.getItem('demo_session_email');

  if (!isLoggedIn) {
    return <Navigate to="/perfil" replace />;
  }

  return <>{children}</>;
}
