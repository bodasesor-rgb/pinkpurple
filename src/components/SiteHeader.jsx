import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.tsx';
import { PRODUCTS } from '../data/products.js';

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const location = useLocation();
  const close = () => {
    setOpen(false);
    setProductsOpen(false);
  };
  const { isAuthenticated } = useAuth();
  const dropdownRef = useRef(null);
  const leaveTimer = useRef(null);

  const clearLeaveTimer = () => {
    if (leaveTimer.current) {
      window.clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
  };

  useEffect(() => {
    setOpen(false);
    setProductsOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    function onDocPointer(e) {
      if (!dropdownRef.current?.contains(e.target)) {
        setProductsOpen(false);
      }
    }
    function onKey(e) {
      if (e.key === 'Escape') {
        setProductsOpen(false);
        setOpen(false);
      }
    }
    document.addEventListener('pointerdown', onDocPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDocPointer);
      document.removeEventListener('keydown', onKey);
      clearLeaveTimer();
    };
  }, []);

  const isFinePointer = () =>
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  return (
    <header className="site-header site-header--light">
      <div className="container site-header__inner">
        <Link to="/" className="brand-link" onClick={close} aria-label="PinkPurple Studio">
          <img
            className="brand-link__logo"
            src="/brand/logo-studio-header.png"
            alt="PinkPurple Studio"
            width={836}
            height={271}
          />
        </Link>

        <button
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-label="Abrir menú"
          onClick={() => {
            setOpen((v) => !v);
            setProductsOpen(false);
          }}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`nav${open ? ' is-open' : ''}`} aria-label="Principal">
          <div
            className={`nav-dropdown${productsOpen ? ' is-open' : ''}`}
            ref={dropdownRef}
            onMouseEnter={() => {
              if (!isFinePointer()) return;
              clearLeaveTimer();
              setProductsOpen(true);
            }}
            onMouseLeave={() => {
              if (!isFinePointer()) return;
              clearLeaveTimer();
              // Pequeño delay: el gap entre trigger y menú no cierra el clic
              leaveTimer.current = window.setTimeout(() => setProductsOpen(false), 180);
            }}
          >
            <button
              type="button"
              className="nav-dropdown__trigger"
              aria-expanded={productsOpen}
              aria-haspopup="true"
              onClick={() => setProductsOpen((v) => !v)}
            >
              Productos
              <span className="nav-dropdown__caret" aria-hidden="true">
                ▾
              </span>
            </button>
            <div className="nav-dropdown__menu" role="menu">
              <NavLink to="/productos" role="menuitem" onClick={close}>
                Todos los productos
              </NavLink>
              {PRODUCTS.map((product) => (
                <NavLink
                  key={product.id}
                  to={product.status === 'live' ? product.href : `/productos#${product.slug}`}
                  role="menuitem"
                  onClick={close}
                >
                  {product.name}
                  {product.status !== 'live' ? (
                    <span className="nav-dropdown__soon">Pronto</span>
                  ) : null}
                </NavLink>
              ))}
              <NavLink to="/configuracion-nexus" role="menuitem" onClick={close}>
                Configuración Nexus
              </NavLink>
            </div>
          </div>

          <NavLink to="/como-funciona" onClick={close}>
            Cómo funciona
          </NavLink>
          <NavLink to="/blog" onClick={close}>
            Blog
          </NavLink>
          <NavLink
            to="/configuracion-nexus"
            className="nav-link--config"
            title="Configuración Nexus cliente"
            onClick={close}
          >
            Config Nexus
          </NavLink>
          {isAuthenticated ? (
            <NavLink className="btn-nav-brand" to="/app" onClick={close}>
              Mi panel
            </NavLink>
          ) : (
            <NavLink className="btn-nav-brand" to="/login" onClick={close}>
              Iniciar sesión
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
