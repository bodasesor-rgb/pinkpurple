import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import type { ReactNode } from 'react';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return (
      <div className="container page-pad">
        <p className="auth-muted">Cargando sesión…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
