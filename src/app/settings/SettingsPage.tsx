import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

export default function SettingsPage() {
  const { user } = useAuth();
  const location = useLocation();
  const isPlan = location.pathname.includes('/configuracion/plan');

  if (isPlan) {
    return <Outlet />;
  }

  return (
    <>
      <div className="pp-page-head">
        <div>
          <h1>Configuración</h1>
          <p>Cuenta, seguridad y plan de Pink Purple Studio.</p>
        </div>
      </div>

      <div className="pp-grid pp-grid--profile">
        <section className="pp-card">
          <h2 className="pp-card__title">Cuenta</h2>
          <p className="pp-item__meta">
            <strong>{user?.fullName || '—'}</strong>
            <br />
            {user?.email}
          </p>
          <p className="pp-field__hint" style={{ marginTop: '0.75rem' }}>
            Edita nombre y empresa desde{' '}
            <Link className="pp-link" to="/app">
              Perfil
            </Link>
            .
          </p>
        </section>

        <section className="pp-card">
          <h2 className="pp-card__title">Seguridad</h2>
          <p className="pp-item__meta">
            Cambia tu contraseña con el flujo de recuperación por correo.
          </p>
          <Link className="pp-btn pp-btn--ghost" to="/recuperar" style={{ marginTop: '0.85rem' }}>
            Recuperar contraseña
          </Link>
        </section>

        <section className="pp-card">
          <h2 className="pp-card__title">Plan y facturación</h2>
          <p className="pp-item__meta">Consulta uso, renovación y límites de tu plan.</p>
          <Link className="pp-btn pp-btn--primary" to="/app/configuracion/plan" style={{ marginTop: '0.85rem' }}>
            Ver plan
          </Link>
        </section>
      </div>
    </>
  );
}
