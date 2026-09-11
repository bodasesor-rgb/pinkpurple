import { Link } from 'react-router-dom';

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <Link to="/" aria-label="PinkPurple SEO">
          <img src="/brand/logo-wordmark.png" alt="PinkPurple SEO" />
        </Link>
        <p>Landings · Blogs · SEO — © {new Date().getFullYear()} PinkPurple</p>
      </div>
    </footer>
  );
}
