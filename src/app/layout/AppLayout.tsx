import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import '../../styles/panel.css';

const LINKS = [
  { to: '/app', label: 'Resumen', icon: '◎', end: true },
  { to: '/app/proyectos', label: 'Proyectos', icon: '🗂', end: false },
  { to: '/app/generar', label: 'Generar', icon: '✨', end: false },
  { to: '/app/historial', label: 'Historial', icon: '🕓', end: false },
  { to: '/app/conexiones', label: 'Conexiones', icon: '🔌', end: false },
  { to: '/app/plan', label: 'Plan', icon: '💳', end: false },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function onLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="pp-app">
      <header className="pp-topbar">
        <NavLink to="/app" className="pp-topbar__brand">
          <img src="/brand/logo-mark.svg" alt="" />
          <span>PinkPurpleSEO</span>
        </NavLink>

        <div className="pp-topbar__right">
          <span className="pp-topbar__user">{user?.email}</span>
          <button type="button" className="pp-btn pp-btn--ghost pp-btn--sm" onClick={onLogout}>
            Salir
          </button>
        </div>
      </header>

      <nav className="pp-nav" aria-label="Secciones del panel">
        <p className="pp-nav__section">Tu operación</p>
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => `pp-nav__link${isActive ? ' is-active' : ''}`}
          >
            <span className="pp-nav__icon" aria-hidden="true">
              {link.icon}
            </span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <main className="pp-main">
        <div className="pp-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
