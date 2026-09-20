import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PRODUCTS, getLiveProducts } from '../data/products.js';

/**
 * Carrusel de productos Studio.
 * Prioriza productos live (el existente se ve primero); los “soon” entran después.
 */
export default function ProductServicesCarousel() {
  const items = useMemo(() => {
    const live = getLiveProducts();
    const soon = PRODUCTS.filter((p) => p.status !== 'live');
    // Mientras haya pocos live, se ven primero; al crear más, el carrusel crece solo.
    return [...live, ...soon];
  }, []);

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
        <p>producto · {String(current.name || '').toLowerCase()}</p>
      </div>

      {current.image ? (
        <div className="product-carousel__visual">
          <img src={current.image} alt={current.imageAlt || current.name} />
        </div>
      ) : null}

      <div className="page-stage__body" key={current.id}>
        <p className="page-stage__kicker">{isLive ? 'Producto destacado' : 'Próximamente'}</p>
        <h2>{current.name}</h2>
        <p>{current.tagline || current.description}</p>
        {isLive ? (
          <Link className="page-stage__cta" to={current.href}>
            Ver {current.name}
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
                className={`growth-dot${i === index ? ' is-active' : ''}${item.status === 'live' ? ' is-live' : ''}`}
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
