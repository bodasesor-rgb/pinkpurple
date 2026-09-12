import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo.jsx';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div>
          <Link to="/" aria-label="PinkPurple Studio">
            <BrandLogo className="brand-logo--footer" />
          </Link>
          <p className="site-footer__tag">
            PinkPurple Studio — automatizaciones para hacer crecer tu marca.
          </p>
        </div>
        <div className="site-footer__links">
          <Link to="/productos">Productos</Link>
          <Link to="/productos/seo">PinkPurple SEO</Link>
          <Link to="/blog">Blog</Link>
          <Link to="/login">Iniciar sesión</Link>
        </div>
      </div>
      <div className="container site-footer__copy">
        <p>© {new Date().getFullYear()} PinkPurple Studio</p>
      </div>
    </footer>
  );
}
