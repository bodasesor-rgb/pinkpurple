import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { loadDemoConfig } from '../../auth/demoSession';

export default function SettingsPage() {
  const { user } = useAuth();
  const location = useLocation();
  const demo = loadDemoConfig();
  const nested =
    location.pathname.includes('/configuracion/plan') ||
    location.pathname.includes('/configuracion/perfil');

  if (nested) {
    return <Outlet />;
  }

  return (
    <>
      <div className="pp-page-head">
        <div>
          <h1>Configuración</h1>
          <p>Cuenta, datos del alta, seguridad y plan.</p>
        </div>
      </div>

      <div className="pp-grid pp-grid--profile">
        <section className="pp-card">
          <h2 className="pp-card__title">Editar perfil</h2>
          <p className="pp-item__meta">
            <strong>{demo?.fullName || user?.fullName || '—'}</strong>
            <br />
            {demo?.email || user?.email}
            {demo?.brandName ? (
              <>
                <br />
                Marca: {demo.brandName}
              </>
            ) : null}
          </p>
          <p className="pp-field__hint" style={{ marginTop: '0.55rem' }}>
            Modifica lo que llenaste al registrarte y en el onboarding (marca, contacto, oferta,
            publicación…).
          </p>
          <Link
            className="pp-btn pp-btn--primary"
            to="/app/configuracion/perfil"
            style={{ marginTop: '0.85rem' }}
          >
            Editar perfil
          </Link>
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
          <p className="pp-item__meta">
            Cambiar o cancelar plan, ver consumo y comprar tokens extra.
          </p>
          <Link
            className="pp-btn pp-btn--primary"
            to="/app/configuracion/plan"
            style={{ marginTop: '0.85rem' }}
          >
            Ver plan
          </Link>
        </section>
      </div>
    </>
  );
}
