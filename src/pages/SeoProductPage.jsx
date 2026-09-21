import { useState } from 'react';
import { Link } from 'react-router-dom';
import GrowthChartCarousel from '../components/GrowthChartCarousel.jsx';
import SeoNumbersDashboard from '../components/SeoNumbersDashboard.jsx';
import { getProductBySlug } from '../data/products.js';
import {
  PLANS,
  formatNum,
  formatPrice,
  formatSites,
  getPlanPricing,
} from '../data/plans.js';

const INCLUDES = [
  {
    id: 'landings',
    label: 'Landings',
    short: 'Landings',
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
    short: 'Blogs',
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
    short: 'Pulse',
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
    short: 'Comp.',
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
    short: 'Keywords',
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
    short: 'SERP',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 7h14M5 12h10M5 17h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="18" cy="12" r="1.6" fill="currentColor" />
      </svg>
    ),
  },
];

const pillars = [
  {
    id: 'keywords',
    kicker: '01 · Demanda real',
    title: 'Investigación de palabras clave',
    text: 'Encuentra lo que tus compradores ya buscan y define sobre qué escribir — sin adivinar temas.',
    detail: 'Intención de compra · oportunidades · prioridades de redacción',
  },
  {
    id: 'score',
    kicker: '02 · Visibilidad',
    title: 'Optimización para Google + IA',
    text: 'Cada landing y blog sale afinado para posicionarse en Google y en buscadores con IA. Estándar 100/100.',
    detail: 'SEO técnico · estructura · claridad para humanos y modelos',
    score: '100/100',
  },
  {
    id: 'publish',
    kicker: '03 · Multi-sitio',
    title: 'Conecta varias páginas web',
    text: 'Publica en WordPress, Shopify, Netlify y más. Según el plan conectas 1, 2, 5, 10 o sitios ilimitados.',
    detail: 'Mini 1 · Starter 2 · Growth 5 · Pro 10 · Diamond ilimitadas',
  },
];

export default function SeoProductPage() {
  const [billing, setBilling] = useState('monthly');
  const [showFreeTrial, setShowFreeTrial] = useState(false);
  const isAnnual = billing === 'annual';
  const product = getProductBySlug('seo');
  const freePlan = PLANS.find((p) => p.price === 0) || PLANS[0];
  const paidPlans = PLANS.filter((p) => p.price > 0);

  function renderPlanCard(plan) {
    const isFree = plan.price === 0;
    const tokens = plan.tokens ?? plan.landings + plan.blogs;
    const pricing = isFree ? null : getPlanPricing(plan.price);
    const displayPrice = isFree
      ? null
      : isAnnual
        ? pricing.annualPerMonth
        : pricing.monthly;

    return (
      <article
        key={plan.id}
        className={`plan-card${plan.featured ? ' plan-card--featured' : ''}${
          isFree ? ' plan-card--free' : ''
        }`}
      >
        {plan.featured ? <p className="plan-card__badge">Más popular</p> : null}
        <h2>{plan.name}</h2>
        {isFree ? (
          <>
            <p className="plan-card__price">
              <span>Gratis</span>
            </p>
            <p className="plan-card__annual-meta plan-card__annual-meta--muted">
              Una sola vez · sin tarjeta
            </p>
          </>
        ) : (
          <>
            <p className="plan-card__price">
              <span>{formatPrice(displayPrice)}</span>
              <small>USD / mes</small>
            </p>
            {isAnnual ? (
              <p className="plan-card__annual-meta">
                ${formatNum(pricing.annualTotal)} al año · ahorras $
                {formatNum(pricing.savings)}
              </p>
            ) : (
              <p className="plan-card__annual-meta plan-card__annual-meta--muted">
                o ${formatNum(pricing.annualPerMonth)}/mes anual
              </p>
            )}
          </>
        )}
        <ul className="plan-card__pages">
          {isFree ? (
            <li>
              <strong>
                {formatNum(plan.landings)} + {formatNum(plan.blogs)}
              </strong>{' '}
              landings y blogs (una vez)
            </li>
          ) : (
            <>
              <li>
                <strong>{formatNum(plan.landings)}</strong> landings
              </li>
              <li>
                <strong>{formatNum(plan.blogs)}</strong> blogs
              </li>
            </>
          )}
          <li>
            <strong>{formatSites(plan.sites)}</strong>
          </li>
          {!isFree ? (
            <li>
              <strong>{formatNum(tokens)}</strong> tokens / herramienta
            </li>
          ) : (
            <li>Sin renovación mensual</li>
          )}
        </ul>

        <div className="plan-card__includes">
          <p className="plan-card__includes-title">Incluye</p>
          <ul className="plan-icons" aria-label={`Incluye ${plan.name}`}>
            {INCLUDES.map((item) => (
              <li key={item.id} title={item.label}>
                <span className="plan-icons__icon">{item.icon}</span>
                <span className="plan-icons__label">{item.short || item.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <Link
          className={`btn ${
            plan.featured || isFree ? 'btn-primary' : 'btn-ghost'
          } plan-card__cta`}
          to={`/pago?plan=${plan.id}&billing=${
            isFree ? 'monthly' : isAnnual ? 'annual' : 'monthly'
          }`}
        >
          {isFree ? 'Activar prueba' : `Elegir ${plan.name}`}
        </Link>
      </article>
    );
  }

  return (
    <>
      <div className="container page-pad">
        <header className="page-hero page-hero--wide">
          <p className="eyebrow">Producto · PinkPurple SEO</p>
          <h1>{product?.tagline || 'Landings, blogs y SEO 100/100.'}</h1>
          <p>{product?.description}</p>
          {product?.highlights?.length ? (
            <ul className="product-feature__list product-feature__list--hero">
              {product.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </header>

        <figure className="seo-proof">
          <img
            src="/brand/pagespeed-seo-100.png"
            alt="PageSpeed Insights · SEO 100 en móvil (captura real)"
            width={720}
            height={480}
            loading="lazy"
          />
          <figcaption>
            Captura real · Google PageSpeed Insights · SEO <strong>100</strong> (móvil) · bodasesor.com
          </figcaption>
        </figure>

        <SeoNumbersDashboard />

        <div className="plans-toolbar">
          <div className="billing-toggle" role="group" aria-label="Periodo de pago">
            <button
              type="button"
              className={`billing-toggle__btn${!showFreeTrial && !isAnnual ? ' is-active' : ''}`}
              onClick={() => {
                setShowFreeTrial(false);
                setBilling('monthly');
              }}
            >
              Mensual
            </button>
            <button
              type="button"
              className={`billing-toggle__btn${!showFreeTrial && isAnnual ? ' is-active' : ''}`}
              onClick={() => {
                setShowFreeTrial(false);
                setBilling('annual');
              }}
            >
              Anual
              <span className="billing-toggle__save">-25%</span>
            </button>
            <button
              type="button"
              className={`billing-toggle__btn billing-toggle__btn--free${
                showFreeTrial ? ' is-active' : ''
              }`}
              onClick={() => setShowFreeTrial(true)}
              aria-expanded={showFreeTrial}
            >
              Prueba gratis
            </button>
          </div>
        </div>

        {showFreeTrial ? (
          <div className="plans-free-panel" id="plan-prueba-gratis">
            <p className="plans-free-panel__lead">
              Suficiente para ver la magia de la herramienta · una sola vez · sin tarjeta
            </p>
            <div className="plans-free-panel__card">{renderPlanCard(freePlan)}</div>
            <button
              type="button"
              className="btn btn-ghost plans-free-panel__back"
              onClick={() => {
                setShowFreeTrial(false);
                setBilling('monthly');
              }}
            >
              Ver paquetes de pago
            </button>
          </div>
        ) : (
          <div className="plans-grid plans-grid--paid">{paidPlans.map((plan) => renderPlanCard(plan))}</div>
        )}

        <p className="plans-note plans-note--strong">
          <strong>Varias páginas web:</strong> puedes conectar más de un sitio. Mini = 1 · Starter
          = 2 · Growth = 5 · Pro = 10 · Diamond = ilimitadas. Prueba gratis = 1 sitio.
        </p>

        <p className="plans-note">
          Los tokens de cada herramienta igualan landings + blogs del plan. El anual aplica 25% de
          ahorro frente a 12 meses sueltos.
        </p>
      </div>

      <section className="section" id="pilares-seo">
        <div className="container">
          <div className="section__intro">
            <p className="eyebrow">PinkPurple SEO</p>
            <h2>El producto para texto, páginas y posicionamiento.</h2>
            <p>
              Tres movimientos: demanda, contenido que rankea y publicación en las webs que
              conectes.
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

      <GrowthChartCarousel
        eyebrow="PinkPurple SEO · resultados"
        title="Así se ve el crecimiento en buscadores."
        lead="Ejemplos ilustrativos: clics e impresiones suben cuando landings y blogs empiezan a rankear. Datos de demostración."
      />

      <div className="container page-pad" style={{ paddingTop: 0 }}>
        <section className="contact-block how-cta">
          <div className="contact-block__copy">
            <p className="eyebrow">Integraciones</p>
            <h2>Tu hosting. Nuestro código. Misma publicación.</h2>
            <p>
              Nos conectamos a las webs que ya tienes — una o varias según tu plan — en WordPress,
              Shopify, Netlify y más.
            </p>
          </div>
          <Link className="btn btn-primary btn-lg" to="/pago?plan=mini&billing=monthly">
            Empezar con Mini
          </Link>
        </section>

        <p className="page-cta-line">
          <Link className="btn btn-ghost" to="/productos">
            Ver todos los productos Studio
          </Link>
        </p>
      </div>
    </>
  );
}
