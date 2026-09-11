import { Link } from 'react-router-dom';

export default function ServicesPage() {
  return (
    <div className="container">
      <header className="page-hero">
        <h1>Servicios PinkPurple</h1>
        <p>
          Landings de venta, blogs y SEO — el stack completo para atraer, educar y convertir.
        </p>
      </header>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="service-rows">
          <article className="service-row">
            <div className="service-row__index">01</div>
            <div>
              <h3>Landings de venta</h3>
              <p>
                Páginas de servicio y campaña con estructura SEO, copy orientado a conversión y
                CTAs claros. Ideales para ads y orgánico.
              </p>
            </div>
            <div className="service-row__tag">Venta</div>
          </article>
          <article className="service-row">
            <div className="service-row__index">02</div>
            <div>
              <h3>Blogs</h3>
              <p>
                Artículos pensados para ranking y lectura: títulos, FAQ, schema y ritmo editorial
                que alimenta el sitio.
              </p>
            </div>
            <div className="service-row__tag">Contenido</div>
          </article>
          <article className="service-row">
            <div className="service-row__index">03</div>
            <div>
              <h3>SEO</h3>
              <p>
                Arquitectura de URLs, indexación, sitemaps y páginas escalables generadas con
                Nexus para crecer sin reescribir el front cada vez.
              </p>
            </div>
            <div className="service-row__tag">Crecimiento</div>
          </article>
        </div>

        <p style={{ marginTop: '2.5rem' }}>
          <Link className="btn btn-primary" to="/#contacto">
            Hablar del proyecto
          </Link>
        </p>
      </section>
    </div>
  );
}
