import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { goToNexusPanel } from '../lib/nexusPanel.js';

const PLAN_META = {
  free: { name: 'Prueba gratis', landings: 5, blogs: 5, tokens: 0 },
  trial: { name: 'Prueba gratis', landings: 5, blogs: 5, tokens: 0 },
  starter: { name: 'Starter', landings: 150, blogs: 100, tokens: 250 },
  growth: { name: 'Growth', landings: 400, blogs: 150, tokens: 550 },
  pro: { name: 'Pro', landings: 1000, blogs: 250, tokens: 1250 },
  diamond: { name: 'Diamond', landings: 2500, blogs: 400, tokens: 2900 },
};

export default function AccountPage() {
  const { user, logout } = useAuth();
  const meta = user?.user_metadata || {};
  const planKey = String(meta.plan || 'free').toLowerCase();
  const plan = PLAN_META[planKey] || PLAN_META.free;
  const billing = meta.billing === 'annual' ? 'Anual' : 'Mensual';
  const displayName = meta.full_name || user?.email || 'Usuario';

  async function onLogout() {
    await logout();
  }

  return (
    <div className="container page-pad">
      <header className="page-hero page-hero--wide">
        <p className="eyebrow">Mi cuenta</p>
        <h1>Hola, {displayName}</h1>
        <p>Este es tu espacio en PinkPurple Studio. El trabajo SEO se abre en tu panel.</p>
      </header>

      <div className="account-grid">
        <section className="account-panel">
          <h2>Plan actual</h2>
          <p className="account-plan-name">{plan.name}</p>
          <p className="auth-muted">
            Facturación: {planKey === 'free' || planKey === 'trial' ? '—' : billing}
          </p>
          <ul className="plan-card__pages">
            <li>
              <strong>{plan.landings.toLocaleString('es-MX')}</strong> landings
            </li>
            <li>
              <strong>{plan.blogs.toLocaleString('es-MX')}</strong> blogs
            </li>
            {plan.tokens > 0 ? (
              <li>
                <strong>{plan.tokens.toLocaleString('es-MX')}</strong> tokens / herramienta
              </li>
            ) : (
              <li>Una sola vez · sin renovación mensual</li>
            )}
          </ul>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => goToNexusPanel('/pp')}
          >
            Abrir mi panel SEO
          </button>
          <Link className="btn btn-ghost" to="/productos/seo" style={{ marginTop: '0.75rem' }}>
            Ver planes
          </Link>
        </section>

        <section className="account-panel">
          <h2>Tu espacio</h2>
          <p className="auth-muted">
            Generación de landings, blogs y herramientas SEO viven en el panel. Usa el botón para
            entrar.
          </p>
          <p className="account-email">
            Sesión: <strong>{user?.email}</strong>
          </p>
          <button type="button" className="btn btn-ghost" onClick={onLogout}>
            Cerrar sesión
          </button>
        </section>
      </div>
    </div>
  );
}
