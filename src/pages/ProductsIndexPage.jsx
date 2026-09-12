import { Link } from 'react-router-dom';
import { PRODUCTS } from '../data/products.js';

export default function ProductsIndexPage() {
  return (
    <div className="container page-pad">
      <header className="page-hero page-hero--wide">
        <p className="eyebrow">Productos</p>
        <h1>Automatizaciones de PinkPurple Studio.</h1>
        <p>
          Cada producto resuelve un flujo concreto. Hoy está disponible PinkPurple SEO; iremos
          sumando más herramientas bajo la misma marca.
        </p>
      </header>

      <div className="product-catalog">
        {PRODUCTS.map((product) => (
          <article
            key={product.id}
            className={`product-feature${product.status !== 'live' ? ' product-feature--soon' : ''}`}
            id={product.slug}
          >
            <div className="product-feature__media" aria-hidden={false}>
              <div className="product-feature__visual">
                <img src={product.image} alt={product.imageAlt} width={160} height={200} />
              </div>
            </div>
            <div className="product-feature__body">
              <p className="product-feature__status">
                {product.status === 'live' ? 'Disponible' : 'Próximamente'}
              </p>
              <h2>{product.name}</h2>
              <p className="product-feature__tagline">{product.tagline}</p>
              <p className="product-feature__desc">{product.description}</p>
              {product.highlights?.length ? (
                <ul className="product-feature__list">
                  {product.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {product.status === 'live' ? (
                <Link className="btn btn-primary" to={product.href}>
                  Ver planes de {product.name}
                </Link>
              ) : (
                <span className="btn btn-ghost" aria-disabled="true">
                  Próximamente
                </span>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
