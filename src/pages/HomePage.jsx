import { Link } from 'react-router-dom';

const services = [
  {
    index: '01',
    title: 'Landings de venta',
    text: 'Páginas pensadas para convertir: mensaje claro, prueba social y CTA que llevan al cierre.',
    tag: 'Conversión',
  },
  {
    index: '02',
    title: 'Blogs SEO',
    text: 'Contenido que responde búsquedas reales y alimenta autoridad temática de tu marca.',
    tag: 'Contenido',
  },
  {
    index: '03',
    title: 'SEO técnico y de crecimiento',
    text: 'Estructura, indexación y páginas de servicio listas para rankear y escalar con Nexus.',
    tag: 'Posicionamiento',
  },
];

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="container hero__grid">
          <div>
            <img
              className="hero__brand"
              src="/brand/logo-wordmark.png"
              alt="PinkPurple SEO"
            />
            <h1>
              Landings, blogs y SEO que <span>hacen crecer</span>
            </h1>
            <p className="hero__lead">
              Construimos páginas de venta y contenido que Google entiende — y que tus clientes
              eligen.
            </p>
            <div className="hero__actions">
              <a className="btn btn-primary" href="#contacto">
                Quiero crecer
              </a>
              <Link className="btn btn-ghost" to="/servicios">
                Ver servicios
              </Link>
            </div>
          </div>
          <div className="hero__visual" aria-hidden="true">
            <img src="/brand/logo-mark.png" alt="" />
          </div>
        </div>
      </section>

      <section className="section" id="servicios">
        <div className="container">
          <div className="section__head">
            <h2>Lo que hacemos</h2>
            <p>
              Tres piezas del mismo sistema: captar demanda, educar con contenido y posicionar tu
              oferta donde se busca.
            </p>
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

      <section className="section section--fog">
        <div className="container">
          <div className="section__head">
            <h2>Cómo trabajamos</h2>
            <p>
              El sitio vive en Netlify. La generación masiva de landings y blogs la hace Nexus —
              tú operas el crecimiento, nosotros el front.
            </p>
          </div>
          <div className="flow">
            <div className="flow__step">
              <strong>1. Marca y oferta</strong>
              <p>Definimos mensaje, servicios y keywords que importan para vender.</p>
            </div>
            <div className="flow__step">
              <strong>2. Generación Nexus</strong>
              <p>Landings y blogs SEO salen del motor; el front los recibe listos para publicar.</p>
            </div>
            <div className="flow__step">
              <strong>3. Publicar en Netlify</strong>
              <p>Deploy limpio, URLs indexables y sitio listo para tráfico orgánico.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container" id="contacto">
        <div className="cta-band">
          <div className="cta-band__inner" style={{ paddingInline: '1.75rem' }}>
            <div>
              <h2>¿Listo para tu siguiente landing?</h2>
              <p>
                Cuéntanos tu nicho y armamos la base del sitio + el pipeline con Nexus.
              </p>
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
