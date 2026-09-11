import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="site-header site-header--light">
      <div className="container site-header__inner">
        <Link to="/" className="brand-link" onClick={close} aria-label="PinkPurple SEO">
          <img
            className="brand-link__logo"
            src="/brand/logo-original.png"
            alt="PinkPurple SEO"
            width={820}
            height={246}
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
          <NavLink to="/servicios" onClick={close}>
            Servicios
          </NavLink>
          <NavLink to="/blog" onClick={close}>
            Blog
          </NavLink>
          <a className="nav-cta" href="#contacto" onClick={close}>
            Cotizar proyecto
          </a>
        </nav>
      </div>
    </header>
  );
}
