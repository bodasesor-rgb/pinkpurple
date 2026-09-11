export default function BlogIndexPage() {
  return (
    <div className="container">
      <header className="page-hero">
        <h1>Blog</h1>
        <p>
          Aquí aparecerán los artículos SEO que genere Nexus. El front ya tiene la ruta lista.
        </p>
      </header>
      <div className="blog-empty">
        <p>
          Todavía no hay posts publicados. Cuando Nexus genere blogs, se sincronizarán en{' '}
          <code>public/blog/</code> (mismo patrón que Bodasesor).
        </p>
      </div>
    </div>
  );
}
