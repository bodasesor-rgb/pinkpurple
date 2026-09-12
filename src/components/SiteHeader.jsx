import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { getLiveProducts } from '../data/products.js';

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const location = useLocation();
  const close = () => {
    setOpen(false);
    setProductsOpen(false);
  };
  const { isAuthenticated } = useAuth();
  const products = getLiveProducts();
  const dropdownRef = useRef(null);

  // Al cambiar de ruta, cierra menú móvil y dropdown (evita navbar trabada)
  useEffect(() => {
    setOpen(false);
    setProductsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function onDocPointer(e) {
      if (!dropdownRef.current?.contains(e.target)) {
        setProductsOpen(false);
      }
    }
    document.addEventListener('pointerdown', onDocPointer);
    return () => document.removeEventListener('pointerdown', onDocPointer);
  }, []);

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
              if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
                setProductsOpen(true);
              }
            }}
            onMouseLeave={() => {
              if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
                setProductsOpen(false);
              }
            }}
          >
            <NavLink
              to="/productos"
              className="nav-dropdown__trigger"
              aria-expanded={productsOpen}
              onClick={(e) => {
                // Móvil: abre/cierra el submenú. Desktop: navega a /productos.
                if (window.matchMedia('(max-width: 760px)').matches) {
                  e.preventDefault();
                  setProductsOpen((v) => !v);
                }
              }}
            >
              Productos
              <span className="nav-dropdown__caret" aria-hidden="true">
                ▾
              </span>
            </NavLink>
            <div className="nav-dropdown__menu" role="menu">
              <NavLink to="/productos" role="menuitem" onClick={close}>
                Todos los productos
              </NavLink>
              {products.map((product) => (
                <NavLink key={product.id} to={product.href} role="menuitem" onClick={close}>
                  {product.name}
                </NavLink>
              ))}
            </div>
          </div>

          <NavLink to="/blog" onClick={close}>
            Blog
          </NavLink>
          <NavLink to="/entrar-panel" onClick={close}>
            Mi panel
          </NavLink>
          {isAuthenticated ? (
            <NavLink className="btn-nav-brand" to="/cuenta" onClick={close}>
              Cuenta
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
