import { Link } from 'react-router-dom';

const TOOLS = [
  'Ranking Pulse',
  'Competidores',
  'Búsqueda de palabra clave',
  'SERP',
];

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    landings: 150,
    blogs: 100,
    featured: false,
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 99,
    landings: 400,
    blogs: 150,
    featured: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 199,
    landings: 1000,
    blogs: 250,
    featured: false,
  },
  {
    id: 'diamond',
    name: 'Diamond',
    price: 349,
    landings: 2500,
    blogs: 400,
    featured: false,
  },
];

function formatNum(n) {
  return n.toLocaleString('es-MX');
}

export default function ProductsPage() {
  return (
    <div className="container page-pad">
      <header className="page-hero page-hero--wide">
        <p className="eyebrow">Productos</p>
        <h1>Paquetes de landings, blogs y tokens SEO.</h1>
        <p>
          Cada plan incluye generación de páginas y tokens para Ranking Pulse, Competidores,
          Búsqueda de palabra clave y SERP. Los tokens por herramienta equivalen a landings +
          blogs del paquete.
        </p>
      </header>

      <div className="plans-grid">
        {PLANS.map((plan) => {
          const tokens = plan.landings + plan.blogs;
          return (
            <article
              key={plan.id}
              className={`plan-card${plan.featured ? ' plan-card--featured' : ''}`}
            >
              {plan.featured ? <p className="plan-card__badge">Más popular</p> : null}
              <h2>{plan.name}</h2>
              <p className="plan-card__price">
                <span>${plan.price}</span>
                <small>USD</small>
              </p>
              <ul className="plan-card__pages">
                <li>
                  <strong>{formatNum(plan.landings)}</strong> landings
                </li>
                <li>
                  <strong>{formatNum(plan.blogs)}</strong> blogs
                </li>
              </ul>
              <div className="plan-card__tokens">
                <p className="plan-card__tokens-title">
                  {formatNum(tokens)} tokens por herramienta
                </p>
                <ul>
                  {TOOLS.map((tool) => (
                    <li key={tool}>
                      {tool}: <strong>{formatNum(tokens)}</strong>
                    </li>
                  ))}
                </ul>
              </div>
              <a
                className={`btn ${plan.featured ? 'btn-primary' : 'btn-ghost'} plan-card__cta`}
                href={`mailto:hola@pinkpurple.seo?subject=${encodeURIComponent(`Interés en plan ${plan.name}`)}`}
              >
                Elegir {plan.name}
              </a>
            </article>
          );
        })}
      </div>

      <p className="plans-note">
        Todos los paquetes incluyen tokens para Ranking Pulse, Competidores, Búsqueda de palabra
        clave y SERP. Ejemplo: Starter = 150 landings + 100 blogs → <strong>250 tokens</strong> en
        cada herramienta.
      </p>

      <p className="page-cta-line">
        <Link className="btn btn-ghost" to="/servicios">
          Ver cómo trabajamos
        </Link>
      </p>
    </div>
  );
}
