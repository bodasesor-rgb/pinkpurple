import { Link } from 'react-router-dom';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        <div>
          <Link to="/" aria-label="PinkPurple SEO">
            <img
              className="site-footer__logo"
              src="/brand/logo-wordmark-light.png"
              alt="PinkPurple SEO"
              width={820}
              height={246}
            />
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
