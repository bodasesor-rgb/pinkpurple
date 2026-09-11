import { Link } from 'react-router-dom';

export default function ServicesPage() {
  return (
    <div className="container page-pad">
      <header className="page-hero">
        <p className="eyebrow">Servicios</p>
        <h1>Redacción y páginas con estándar de conversión.</h1>
        <p>
          Tres formatos. Un criterio: claridad para el cliente, estructura para Google, publicación
          lista para tráfico.
        </p>
      </header>

      <div className="craft-list">
        <article className="craft-item">
          <span className="craft-item__n">01</span>
          <div>
            <h3>Landings de venta</h3>
            <p>
              Páginas de campaña o servicio con promesa, prueba y CTA. Pensadas para ads y
              búsquedas comerciales de alta intención.
            </p>
          </div>
        </article>
        <article className="craft-item">
          <span className="craft-item__n">02</span>
          <div>
            <h3>Blogs SEO</h3>
            <p>
              Contenido editorial con intención de búsqueda: títulos precisos, jerarquía clara y
              lectura que sostiene autoridad.
            </p>
          </div>
        </article>
        <article className="craft-item">
          <span className="craft-item__n">03</span>
          <div>
            <h3>Páginas SEO escalables</h3>
            <p>
              Arquitectura por servicio y zona, copy único por URL y base técnica limpia para
              indexación.
            </p>
          </div>
        </article>
      </div>

      <p className="page-cta-line">
        <Link className="btn btn-primary" to="/#contacto">
          Solicitar propuesta
        </Link>
      </p>
    </div>
  );
}
