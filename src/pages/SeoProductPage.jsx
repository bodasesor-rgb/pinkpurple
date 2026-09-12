import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getProductBySlug } from '../data/products.js';
import {
  PLANS,
  formatNum,
  formatPrice,
  getPlanPricing,
} from '../data/plans.js';

const INCLUDES = [
  {
    id: 'landings',
    label: 'Landings',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="4" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3 9h18" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 13h8M8 16h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'blogs',
    label: 'Blogs',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M5 5h10a2 2 0 0 1 2 2v12l-3-2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path d="M9 9h6M9 12h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'pulse',
    label: 'Ranking Pulse',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M3 12h4l2.5-6 3 12L15 9h6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 'competitors',
    label: 'Competidores',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="8" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="16" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M3.5 18c.8-2.4 2.7-3.8 4.5-3.8S11.5 15.6 12.3 18M11.7 18c.8-2.4 2.7-3.8 4.5-3.8s3.7 1.4 4.5 3.8"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: 'keywords',
    label: 'Palabra clave',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="10.5" cy="10.5" r="5.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M15 15l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'serp',
    label: 'SERP',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 7h14M5 12h10M5 17h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="18" cy="12" r="1.6" fill="currentColor" />
      </svg>
    ),
  },
];

export default function SeoProductPage() {
  const [billing, setBilling] = useState('monthly');
  const isAnnual = billing === 'annual';
  const product = getProductBySlug('seo');

  return (
    <div className="container page-pad">
      <header className="page-hero page-hero--wide">
        <p className="eyebrow">PinkPurple SEO</p>
        <h1>{product?.tagline || 'Paquetes de landings, blogs y tokens SEO.'}</h1>
        <p>{product?.description}</p>
        {product?.highlights?.length ? (
          <ul className="product-feature__list product-feature__list--hero">
            {product.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
      </header>

      <div className="billing-toggle" role="group" aria-label="Periodo de pago">
        <button
          type="button"
          className={`billing-toggle__btn${!isAnnual ? ' is-active' : ''}`}
          onClick={() => setBilling('monthly')}
        >
          Mensual
        </button>
        <button
          type="button"
          className={`billing-toggle__btn${isAnnual ? ' is-active' : ''}`}
          onClick={() => setBilling('annual')}
        >
          Anual
          <span className="billing-toggle__save">-25%</span>
        </button>
      </div>

      <div className="plans-grid plans-grid--five">
        {PLANS.map((plan) => {
          const tokens = plan.tokens ?? plan.landings + plan.blogs;
          const pricing = getPlanPricing(plan.price);
          const displayPrice = isAnnual ? pricing.annualPerMonth : pricing.monthly;
          const periodLabel = plan.price === 0 ? null : isAnnual ? 'USD / mes' : 'USD / mes';

          return (
            <article
              key={plan.id}
              className={`plan-card${plan.featured ? ' plan-card--featured' : ''}${plan.price === 0 ? ' plan-card--free' : ''}`}
            >
              {plan.featured ? <p className="plan-card__badge">Más popular</p> : null}
              <h2>{plan.name}</h2>
              <p className="plan-card__price">
                <span>{formatPrice(displayPrice)}</span>
                {periodLabel ? <small>{periodLabel}</small> : null}
              </p>
              {plan.price > 0 && isAnnual ? (
                <p className="plan-card__annual-meta">
                  ${formatNum(pricing.annualTotal)} al año · ahorras ${formatNum(pricing.savings)}
                </p>
              ) : null}
              {plan.price > 0 && !isAnnual ? (
                <p className="plan-card__annual-meta plan-card__annual-meta--muted">
                  o ${formatNum(pricing.annualPerMonth)}/mes en plan anual
                </p>
              ) : null}
              {plan.price === 0 ? (
                <p className="plan-card__annual-meta">5 landings + 5 blogs, una sola vez, sin tarjeta.</p>
              ) : null}
              <ul className="plan-card__pages">
                <li>
                  <strong>{formatNum(plan.landings)}</strong> landings
                </li>
                <li>
                  <strong>{formatNum(plan.blogs)}</strong> blogs
                </li>
                {plan.oneShot ? (
                  <li>Sin renovación mensual</li>
                ) : (
                  <li>
                    <strong>{formatNum(tokens)}</strong> tokens / herramienta
                  </li>
                )}
              </ul>

              <div className="plan-card__includes">
                <p className="plan-card__includes-title">Incluye</p>
                <ul className="plan-icons" aria-label={`Incluye ${plan.name}`}>
                  {INCLUDES.map((item) => (
                    <li key={item.id} title={item.label}>
                      <span className="plan-icons__icon">{item.icon}</span>
                      <span className="plan-icons__label">{item.label}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                className={`btn ${plan.featured || plan.price === 0 ? 'btn-primary' : 'btn-ghost'} plan-card__cta`}
                to={`/pago?plan=${plan.id}&billing=${isAnnual ? 'annual' : 'monthly'}`}
              >
                {plan.price === 0 ? 'Activar prueba' : `Pagar ${plan.name} (demo)`}
              </Link>
            </article>
          );
        })}
      </div>

      <p className="plans-note">
        Los tokens de cada herramienta igualan tus landings + blogs del plan. El plan anual
        aplica 25% de ahorro frente a pagar 12 meses sueltos (precios redondeados).
      </p>

      <p className="page-cta-line">
        <Link className="btn btn-ghost" to="/productos">
          Ver todos los productos
        </Link>
      </p>
    </div>
  );
}
