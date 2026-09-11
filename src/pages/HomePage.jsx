import { Link } from 'react-router-dom';

const services = [
  {
    index: '01',
    title: 'Landings de venta',
    text: 'Páginas de oferta con mensaje directo, prueba y CTA. Hechas para ads y orgánico.',
    tag: 'Conversión',
  },
  {
    index: '02',
    title: 'Blogs SEO',
    text: 'Artículos que responden búsquedas reales y refuerzan la autoridad de tu marca.',
    tag: 'Contenido',
  },
  {
    index: '03',
    title: 'SEO de crecimiento',
    text: 'Arquitectura, indexación y páginas escalables generadas con Nexus.',
    tag: 'Posicionamiento',
  },
];

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero__mesh" aria-hidden="true" />
        <div className="container hero__grid">
          <div>
            <img
              className="hero__brand"
              src="/brand/logo-wordmark.png"
              alt="PinkPurple SEO"
              width={380}
              height={120}
            />
            <h1>
              Landings y SEO que <em>venden</em>
            </h1>
            <p className="hero__lead">
              Creamos landings de venta, blogs y posicionamiento para que tu marca crezca en
              Google — y convierta.
            </p>
            <div className="hero__actions">
              <a className="btn btn-primary" href="#contacto">
                Hablar de tu proyecto
              </a>
              <Link className="btn btn-ghost" to="/servicios">
                Ver servicios
              </Link>
            </div>
          </div>
          <div className="hero__mark" aria-hidden="true">
            <img src="/brand/logo-mark.png" alt="" width={300} height={300} />
          </div>
        </div>
      </section>

      <section className="section section--dark" id="servicios">
        <div className="container">
          <div className="section__head">
            <h2>Lo que hacemos</h2>
            <p>Tres piezas: captar demanda, educar con contenido y rankear tu oferta.</p>
          </div>
          <div className="service-rows">
            {services.map((item) => (
              <article className="service-row" key={item.index}>
                <div className="service-row__index">{item.index}</div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
                <div className="service-row__tag">{item.tag}</div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section__head">
            <h2>Cómo se publica</h2>
            <p>
              Front en Netlify. Generación masiva en Nexus. Scrapers bloqueados en el edge.
            </p>
          </div>
          <div className="flow">
            <div className="flow__step">
              <strong>1. Marca y keywords</strong>
              <p>Definimos oferta, mensajes y términos que importan para vender.</p>
            </div>
            <div className="flow__step">
              <strong>2. Nexus genera</strong>
              <p>Landings y blogs salen del motor; el sitio los recibe listos.</p>
            </div>
            <div className="flow__step">
              <strong>3. Netlify publica</strong>
              <p>Deploy limpio, URLs indexables y bot-shield contra basura.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container" id="contacto">
        <div className="cta-band">
          <div className="cta-band__inner">
            <div>
              <h2>¿Armamos tu siguiente landing?</h2>
              <p>Cuéntanos el nicho y dejamos el sitio + pipeline Nexus listos.</p>
            </div>
            <a className="btn btn-ghost" href="mailto:hola@pinkpurple.seo">
              Escribir a PinkPurple
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
