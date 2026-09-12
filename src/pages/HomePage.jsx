import { Link } from 'react-router-dom';
import ProductServicesCarousel from '../components/ProductServicesCarousel.jsx';
import { getLiveProducts } from '../data/products.js';

const studioPillars = [
  {
    id: 'panel',
    kicker: '01 · Un panel',
    title: 'Un solo acceso para todos los productos',
    text: 'PinkPurple Studio es la casa: entras una vez y usas cada producto desde el mismo panel. Hoy SEO; mañana más automatizaciones bajo la misma cuenta.',
    detail: 'Cuenta única · productos modulares · panel compartido',
  },
  {
    id: 'sites',
    kicker: '02 · Multi-sitio',
    title: 'Conecta las páginas que necesites',
    text: 'No estás limitado a un solo sitio: conectas WordPress, Shopify, Netlify u otros servidores según el plan de cada producto.',
    detail: 'Varias webs · un flujo · publicación directa',
  },
  {
    id: 'grow',
    kicker: '03 · Escala',
    title: 'Automatiza lo repetible',
    text: 'Cada producto empaqueta trabajo pesado para que tu equipo se enfoque en vender y operar.',
    detail: 'Útil · publicable · medible',
  },
];

export default function HomePage() {
  const live = getLiveProducts();

  return (
    <>
      <section className="hero">
        <div className="hero__aurora" aria-hidden="true" />
        <div className="hero__grid" aria-hidden="true" />
        <div className="container hero__layout">
          <div className="hero__copy">
            <p className="hero__brand-name">
              <span className="hero__brand-pink">Pink</span>
              <span className="hero__brand-purple">Purple</span>{' '}
              <span className="hero__brand-studio">Studio</span>
            </p>
            <h1>
              El panel de automatizaciones
              <span>para tu marca.</span>
            </h1>
            <p className="hero__lead">
              PinkPurple Studio agrupa productos que trabajan juntos. Un acceso, un panel — y un
              carrusel de servicios que crece cuando lanzamos cada producto nuevo.
            </p>
            <div className="hero__actions">
              <Link className="btn btn-primary" to="/productos">
                Ver productos
              </Link>
              <Link className="btn btn-ghost" to="/entrar-panel">
                Abrir mi panel
              </Link>
            </div>
          </div>

          <ProductServicesCarousel />
        </div>
      </section>

      <section className="section home-showcase" id="studio">
        <div className="container">
          <div className="section__intro section__intro--center">
            <p className="eyebrow">PinkPurple Studio</p>
            <h2>Una marca. Varias automatizaciones.</h2>
            <p>
              El detalle de landings, blogs y SEO está en el producto PinkPurple SEO. El home es
              Studio: el panel general para todo lo que vayamos sumando.
            </p>
          </div>

          <div className="home-showcase__grid">
            {live.map((product) => (
              <article className="home-showcase__card" key={product.id}>
                <div className="home-showcase__media">
                  <img src={product.image} alt={product.imageAlt} />
                </div>
                <h3>{product.name}</h3>
                <p>{product.tagline}</p>
                <Link className="btn btn-primary" to={product.href}>
                  Ver {product.name}
                </Link>
              </article>
            ))}
            <article className="home-showcase__card home-showcase__card--cta">
              <p className="eyebrow">Carrusel</p>
              <h3>Más productos en camino</h3>
              <p>
                Al crear un producto nuevo en el catálogo, aparece solo en el carrusel del hero y
                en /productos.
              </p>
              <Link className="btn btn-ghost" to="/productos">
                Catálogo
              </Link>
            </article>
            <article className="home-showcase__card home-showcase__card--cta">
              <p className="eyebrow">Guía</p>
              <h3>Cómo entra cada pieza</h3>
              <p>Flujo del panel y módulos de los productos activos.</p>
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
            <p className="eyebrow">Studio</p>
            <h2>Pensado como plataforma, no como un solo tool.</h2>
            <p>
              Entras al panel una vez. Activas productos. Conectas páginas. Escalas sin reinventar
              el acceso.
            </p>
          </div>

          <div className="pillar-stack">
            {studioPillars.map((item) => (
              <article className="pillar" key={item.id}>
                <div className="pillar__meta">
                  <p className="pillar__kicker">{item.kicker}</p>
                </div>
                <h3>{item.title}</h3>
                <p className="pillar__text">{item.text}</p>
                <p className="pillar__detail">{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--ink">
        <div className="container split">
          <div className="split__lead">
            <p className="eyebrow eyebrow--light">Panel</p>
            <h2>Tu operación en un solo lugar.</h2>
          </div>
          <div className="split__body">
            <p>
              PinkPurple Studio es el acceso general. Planes y límites de landings, blogs y sitios
              conectados se definen en cada producto — empieza por PinkPurple SEO si quieres
              contenido y posicionamiento.
            </p>
            <p>
              <Link to="/productos/seo">Ver PinkPurple SEO →</Link>
            </p>
          </div>
        </div>
      </section>

      <section className="section section--cta" id="contacto">
        <div className="container contact-block">
          <div className="contact-block__copy">
            <p className="eyebrow">Empieza</p>
            <h2>Elige un producto y abre tu panel.</h2>
            <p>Misma cuenta Studio. Herramientas según lo que actives.</p>
          </div>
          <Link className="btn btn-primary btn-lg" to="/productos">
            Ver productos
          </Link>
        </div>
      </section>
    </>
  );
}
