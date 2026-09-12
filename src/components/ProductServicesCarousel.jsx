import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PRODUCTS, getLiveProducts } from '../data/products.js';

/**
 * Carrusel de productos Studio (page-stage).
 * Live + “próximamente” del catálogo; al agregar items en products.js aparecen solos.
 */
export default function ProductServicesCarousel() {
  const items = PRODUCTS.length ? PRODUCTS : getLiveProducts();
  const [index, setIndex] = useState(0);
  const total = items.length;
  const current = items[index] || items[0];

  useEffect(() => {
    if (total < 2) return undefined;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % total);
    }, 6500);
    return () => window.clearInterval(id);
  }, [total]);

  if (!current) return null;

  const isLive = current.status === 'live';
  const go = (dir) => setIndex((i) => (i + dir + total) % total);

  return (
    <aside className="page-stage product-carousel" aria-label="Productos PinkPurple Studio">
      <div className="page-stage__beam" aria-hidden="true" />
      <div className="page-stage__chrome">
        <div className="page-stage__dots">
          <span />
          <span />
          <span />
        </div>
        <p>
          producto · {String(current.name || '').toLowerCase()}
        </p>
      </div>

      <div className="page-stage__body" key={current.id}>
        <p className="page-stage__kicker">
          {isLive ? 'Producto destacado' : 'Próximamente'}
        </p>
        <h2>{current.name}</h2>
        <p>{current.tagline || current.description}</p>
        {isLive ? (
          <Link className="page-stage__cta" to={current.href}>
            Ver planes {current.name.replace(/^PinkPurple\s+/i, '')}
          </Link>
        ) : (
          <span className="page-stage__cta page-stage__cta--soon">Aviso al lanzar</span>
        )}
        {current.highlights?.length ? (
          <ul>
            {current.highlights.slice(0, 3).map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : null}
      </div>

      {total > 1 ? (
        <div className="product-carousel__controls">
          <button type="button" className="growth-nav" onClick={() => go(-1)} aria-label="Producto anterior">
            ←
          </button>
          <div className="growth-dots" role="tablist" aria-label="Productos">
            {items.map((item, i) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                className={`growth-dot${i === index ? ' is-active' : ''}`}
                onClick={() => setIndex(i)}
                aria-label={item.name}
              />
            ))}
          </div>
          <button type="button" className="growth-nav" onClick={() => go(1)} aria-label="Producto siguiente">
            →
          </button>
        </div>
      ) : null}
    </aside>
  );
}
