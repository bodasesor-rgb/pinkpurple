import { Link } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo.jsx';

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero__aurora" aria-hidden="true" />
        <div className="hero__grid" aria-hidden="true" />
        <div className="container hero__layout">
          <div className="hero__copy">
            <BrandLogo className="brand-logo--hero" />
            <h1>
              Texto que posiciona.
              <span>Páginas que cierran.</span>
            </h1>
            <p className="hero__lead">
              Diseñamos landings, blogs y páginas SEO con redacción precisa: cada URL existe para
              atraer la búsqueda correcta y convertirla en clientes.
            </p>
            <div className="hero__actions">
              <a className="btn btn-primary" href="#contacto">
                Solicitar propuesta
              </a>
              <Link className="btn btn-ghost" to="/servicios">
                Ver servicios
              </Link>
            </div>
          </div>

          <aside className="page-stage" aria-label="Vista previa de una landing">
            <div className="page-stage__beam" aria-hidden="true" />
            <div className="page-stage__chrome">
              <div className="page-stage__dots">
                <span />
                <span />
                <span />
              </div>
              <p>pinkpurple · landing live</p>
            </div>
            <div className="page-stage__body">
              <p className="page-stage__kicker">Oferta · Intención comercial</p>
              <h2>La búsqueda termina en tu página</h2>
              <p>
                Headline nítido. Prueba social. CTA sin fricción. Así se ve una landing hecha para
                rankear y vender — no para decorar.
              </p>
              <div className="page-stage__cta">Cotizar ahora</div>
              <ul>
                <li>Copy orientado a conversión</li>
                <li>Estructura lista para Google</li>
                <li>Publicación lista para tráfico</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section className="section" id="oficio">
        <div className="container">
          <div className="section__intro">
            <p className="eyebrow">Lo que creamos</p>
            <h2>Contenido con oficio. Páginas con intención.</h2>
            <p>
              No entregamos reportes eternos. Entregamos texto publicado: landings, blogs y hubs
              SEO que trabajan mientras tú vendes.
            </p>
          </div>

          <div className="craft-list">
            <article className="craft-item">
              <span className="craft-item__n">01</span>
              <div>
                <h3>Landings de venta</h3>
                <p>
                  Una promesa, una página, un cierre. Redacción comercial y diseño limpio para ads
                  y búsqueda de alta intención.
                </p>
              </div>
            </article>
            <article className="craft-item">
              <span className="craft-item__n">02</span>
              <div>
                <h3>Blogs que abren mercado</h3>
                <p>
                  Artículos con intención real de búsqueda: educan, posicionan y alimentan
                  autoridad sin relleno vacío.
                </p>
              </div>
            </article>
            <article className="craft-item">
              <span className="craft-item__n">03</span>
              <div>
                <h3>Páginas SEO de servicio</h3>
                <p>
                  Cobertura por oferta y ciudad con copy único — páginas que Google puede indexar
                  y el cliente entiende al instante.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section section--ink">
        <div className="container split">
          <div className="split__lead">
            <p className="eyebrow eyebrow--light">El estándar PinkPurple</p>
            <h2>Si el texto no vende la oferta, el SEO solo amplifica el silencio.</h2>
          </div>
          <div className="split__body">
            <p>
              Empezamos por lo esencial: qué vendes, a quién y por qué deberían elegirte. Con eso
              escribimos y publicamos páginas que merecen traffic — landings, blogs y arquitectura
              SEO alineada a tu negocio.
            </p>
            <p>
              El entregable no es una carpeta de consejos. Es presencia digital activa: URLs vivas,
              indexables, con mensaje claro y llamada a la acción.
            </p>
          </div>
        </div>
      </section>

      <section className="section section--cta" id="contacto">
        <div className="container contact-block">
          <div className="contact-block__copy">
            <p className="eyebrow">Siguiente paso</p>
            <h2>Cuéntanos qué ofreces. Nosotros lo convertimos en páginas.</h2>
            <p>
              Propuesta clara, alcance definido y foco en resultados: más visibilidad, mejor
              mensaje, más conversiones.
            </p>
          </div>
          <a className="btn btn-primary btn-lg" href="mailto:hola@pinkpurple.seo">
            Escribir a hola@pinkpurple.seo
          </a>
        </div>
      </section>
    </>
  );
}
