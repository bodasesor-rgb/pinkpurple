import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

const PLAN_META = {
  free: { name: 'Free', landings: 2, blogs: 2, tokens: 2 },
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
        <p>Este es tu espacio en PinkPurple Studio. Aquí verás tu plan de PinkPurple SEO.</p>
      </header>

      <div className="account-grid">
        <section className="account-panel">
          <h2>Plan actual</h2>
          <p className="account-plan-name">{plan.name}</p>
          <p className="auth-muted">Facturación: {planKey === 'free' ? '—' : billing}</p>
          <ul className="plan-card__pages">
            <li>
              <strong>{plan.landings.toLocaleString('es-MX')}</strong> landings
            </li>
            <li>
              <strong>{plan.blogs.toLocaleString('es-MX')}</strong> blogs
            </li>
            <li>
              <strong>{plan.tokens.toLocaleString('es-MX')}</strong> tokens / herramienta
            </li>
          </ul>
          <Link className="btn btn-ghost" to="/productos/seo">
            Cambiar de plan
          </Link>
        </section>

        <section className="account-panel">
          <h2>Tu espacio</h2>
          <p className="auth-muted">
            Próximo: panel para generar y revisar landings/blogs con tu cuota. Mientras, tu cuenta
            ya está lista con acceso seguro.
          </p>
          <p className="account-email">
            Sesión: <strong>{user?.email}</strong>
          </p>
          <button type="button" className="btn btn-primary" onClick={onLogout}>
            Cerrar sesión
          </button>
        </section>
      </div>
    </div>
  );
}
