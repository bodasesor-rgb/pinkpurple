import { Link } from 'react-router-dom';
import GrowthChartCarousel from '../components/GrowthChartCarousel.jsx';

const pillars = [
  {
    id: 'keywords',
    kicker: '01 · Demanda real',
    title: 'Investigación de palabras clave',
    text: 'PinkPurple SEO encuentra lo que tus compradores ya están buscando y define sobre qué escribir — sin adivinar temas ni rellenar con contenido vacío.',
    detail: 'Intención de compra · oportunidades · prioridades de redacción',
  },
  {
    id: 'score',
    kicker: '02 · Visibilidad',
    title: 'Optimización para Google + IA',
    text: 'Cada landing y blog sale afinado para posicionarse en Google y aparecer en buscadores con inteligencia artificial. El estándar PinkPurple SEO apunta a 100/100.',
    detail: 'SEO técnico · estructura · claridad para humanos y modelos de IA',
    score: '100/100',
  },
  {
    id: 'publish',
    kicker: '03 · Publicación',
    title: 'Funciona en tu servidor',
    text: 'Conectas tu sitio una sola vez y publicas sin copiar ni pegar. El mismo flujo corre en WordPress, Shopify, Netlify y otros servidores: el código de integración hace que funcione igual en cada plataforma.',
    detail: 'WordPress · Shopify · Netlify · más servidores compatibles',
  },
];

const showcase = [
  {
    id: 'seo-visual',
    title: 'Landings con tu diseño',
    text: 'El generador escribe páginas de venta que encajan con la marca de tu sitio — no plantillas sueltas.',
    image: '/brand/seo-product.jpg',
    alt: 'PinkPurple SEO — crecimiento en buscadores',
  },
  {
    id: 'panel',
    title: 'Panel Nexus listo',
    text: 'Keywords, Pulse, competidores y publicación en un solo lugar cuando abres tu cuenta.',
    image: '/brand/logo-studio-header.png',
    alt: 'PinkPurple Studio',
    imageClass: 'home-showcase__img--logo',
  },
];

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero__aurora" aria-hidden="true" />
        <div className="hero__grid" aria-hidden="true" />
        <div className="container hero__layout">
          <div className="hero__copy">
            <p className="hero__brand-name">
              <span className="hero__brand-pink">Pink</span>
              <span className="hero__brand-purple">
                <span className="hero__brand-p">P</span>
                urple
              </span>{' '}
              <span className="hero__brand-studio">Studio</span>
            </p>
            <h1>
              Automatizaciones que
              <span>hacen crecer tu marca.</span>
            </h1>
            <p className="hero__lead">
              PinkPurple Studio construye productos de automatización para negocios. El primero:
              PinkPurple SEO — landings, blogs y publicación en tu servidor.
            </p>
            <div className="hero__actions">
              <Link className="btn btn-primary" to="/productos/seo">
                Ver PinkPurple SEO
              </Link>
              <Link className="btn btn-ghost" to="/como-funciona">
                Cómo funciona
              </Link>
            </div>
          </div>

          <aside className="page-stage" aria-label="Producto destacado">
            <div className="page-stage__beam" aria-hidden="true" />
            <div className="page-stage__chrome">
              <div className="page-stage__dots">
                <span />
                <span />
                <span />
              </div>
              <p>producto · pinkpurple seo</p>
            </div>
            <div className="page-stage__body">
              <p className="page-stage__kicker">Producto destacado</p>
              <h2>PinkPurple SEO</h2>
              <p>
                Keywords, copy y publicación multi-servidor. De la búsqueda a la URL en vivo —
                sin copiar ni pegar.
              </p>
              <Link className="page-stage__cta" to="/productos/seo">
                Ver planes SEO
              </Link>
              <ul>
                <li>Investigación de demanda</li>
                <li>Optimización Google + IA</li>
                <li>Integración WordPress, Shopify, Netlify…</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <GrowthChartCarousel />

      <section className="section home-showcase" id="studio">
        <div className="container">
          <div className="section__intro section__intro--center">
            <p className="eyebrow">PinkPurple Studio</p>
            <h2>Una marca. Varias automatizaciones.</h2>
            <p>
              Studio es la casa de nuestros productos. Hoy el foco es SEO; mañana sumamos más
              flujos para operar y escalar tu negocio con la misma calidad.
            </p>
          </div>

          <div className="home-showcase__grid">
            {showcase.map((item) => (
              <article className="home-showcase__card" key={item.id}>
                <div className={`home-showcase__media${item.imageClass ? ` ${item.imageClass}` : ''}`}>
                  <img src={item.image} alt={item.alt} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
            <article className="home-showcase__card home-showcase__card--cta">
              <p className="eyebrow">Guía</p>
              <h3>Qué hace cada módulo</h3>
              <p>
                Landings, blogs, Pulse, competidores, SERP y publicación — explicados uno a uno.
              </p>
              <Link className="btn btn-primary" to="/como-funciona">
                Cómo funciona
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section className="section" id="pilares">
        <div className="container">
          <div className="section__intro">
            <p className="eyebrow">PinkPurple SEO</p>
            <h2>El producto para texto, páginas y posicionamiento.</h2>
            <p>
              Tres movimientos en un solo sistema: entender la demanda, escribir para rankear y
              publicar donde tu marca ya vive.
            </p>
          </div>

          <div className="pillar-stack">
            {pillars.map((item) => (
              <article className="pillar" key={item.id}>
                <div className="pillar__meta">
                  <p className="pillar__kicker">{item.kicker}</p>
                  {item.score ? <span className="score-chip">{item.score}</span> : null}
                </div>
                <h3>{item.title}</h3>
                <p className="pillar__text">{item.text}</p>
                <p className="pillar__detail">{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--host">
        <div className="container host-banner">
          <div className="host-banner__copy">
            <p className="eyebrow">Integraciones</p>
            <h2>Tu hosting. Nuestro código. Misma publicación.</h2>
            <p>
              No te armamos la web desde cero: nos conectamos a la que ya tienes. WordPress,
              Shopify, Netlify y muchos servidores más — el código de PinkPurple SEO publica
              igual en cada plataforma.
            </p>
          </div>
          <Link className="btn btn-primary" to="/productos/seo">
            Ver PinkPurple SEO
          </Link>
        </div>
      </section>

      <section className="section section--ink">
        <div className="container split">
          <div className="split__lead">
            <p className="eyebrow eyebrow--light">Studio</p>
            <h2>Automatizamos lo repetible. Tú te enfocas en vender.</h2>
          </div>
          <div className="split__body">
            <p>
              PinkPurple Studio nace para empaquetar automatizaciones serias: primero SEO de
              páginas y contenido; después, más productos bajo la misma marca.
            </p>
            <p>
              Cada producto mantiene un estándar claro — útil, publicable y medible — para que
              tu operación crezca sin perder control.
            </p>
          </div>
        </div>
      </section>

      <section className="section section--cta" id="contacto">
        <div className="container contact-block">
          <div className="contact-block__copy">
            <p className="eyebrow">PinkPurple SEO</p>
            <h2>Empieza con el plan que escala tu contenido.</h2>
            <p>
              Free para probar. Starter a Diamond para landings, blogs y tokens SEO.
            </p>
          </div>
          <Link className="btn btn-primary btn-lg" to="/productos/seo">
            Ver PinkPurple SEO
          </Link>
        </div>
      </section>
    </>
  );
}
