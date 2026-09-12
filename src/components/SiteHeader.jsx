import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { getLiveProducts } from '../data/products.js';

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const close = () => {
    setOpen(false);
    setProductsOpen(false);
  };
  const { isAuthenticated } = useAuth();
  const products = getLiveProducts();
  const dropdownRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (!dropdownRef.current?.contains(e.target)) {
        setProductsOpen(false);
      }
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
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
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`nav${open ? ' is-open' : ''}`} aria-label="Principal">
          <div
            className={`nav-dropdown${productsOpen ? ' is-open' : ''}`}
            ref={dropdownRef}
            onMouseEnter={() => setProductsOpen(true)}
            onMouseLeave={() => setProductsOpen(false)}
          >
            <NavLink
              to="/productos"
              className="nav-dropdown__trigger"
              onClick={(e) => {
                if (window.matchMedia('(max-width: 760px)').matches) {
                  e.preventDefault();
                  setProductsOpen((v) => !v);
                } else {
                  close();
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
          {isAuthenticated ? (
            <NavLink className="btn-nav-brand" to="/cuenta" onClick={close}>
              Mi cuenta
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
