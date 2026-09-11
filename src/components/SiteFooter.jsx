import { Link } from 'react-router-dom';
import BrandLogo from './BrandLogo.jsx';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div>
          <Link to="/" aria-label="PinkPurple SEO">
            <BrandLogo className="brand-logo--footer" />
          </Link>
          <p className="site-footer__tag">Texto y páginas para vender y posicionar.</p>
        </div>
        <div className="site-footer__links">
          <Link to="/servicios">Servicios</Link>
          <Link to="/blog">Blog</Link>
          <a href="mailto:hola@pinkpurple.seo">hola@pinkpurple.seo</a>
        </div>
      </div>
      <div className="container site-footer__copy">
        <p>© {new Date().getFullYear()} PinkPurple SEO</p>
      </div>
    </footer>
  );
}
