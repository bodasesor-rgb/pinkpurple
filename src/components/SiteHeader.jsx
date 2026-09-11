import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const { isAuthenticated } = useAuth();

  return (
    <header className="site-header site-header--light">
      <div className="container site-header__inner">
        <Link to="/" className="brand-link" onClick={close} aria-label="PinkPurple SEO">
          <img
            className="brand-link__logo"
            src="/brand/logo-header.png"
            alt="PinkPurple SEO"
            width={844}
            height={263}
          />
        </Link>

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-label="Abrir menú"
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`nav${open ? ' is-open' : ''}`} aria-label="Principal">
          <NavLink to="/productos" onClick={close}>
            Productos
          </NavLink>
          <NavLink to="/servicios" onClick={close}>
            Servicios
          </NavLink>
          <NavLink to="/blog" onClick={close}>
            Blog
          </NavLink>
          {isAuthenticated ? (
            <NavLink className="nav-login" to="/cuenta" onClick={close}>
              Mi cuenta
            </NavLink>
          ) : (
            <NavLink className="nav-login" to="/login" onClick={close}>
              Iniciar sesión
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
