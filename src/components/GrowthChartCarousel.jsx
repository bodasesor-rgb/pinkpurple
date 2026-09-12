import { useEffect, useId, useState } from 'react';
import { GROWTH_CASES } from '../data/growthCases.js';

const W = 640;
const H = 220;
const PAD = { top: 28, right: 48, bottom: 36, left: 44 };

function toPath(values, xOf, yOf) {
  return values
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${xOf(i).toFixed(1)} ${yOf(v).toFixed(1)}`)
    .join(' ');
}

function SearchConsoleChart({ caseData }) {
  const uid = useId().replace(/:/g, '');
  const [active, setActive] = useState({ clicks: true, impressions: true });

  const { clicks, impressions, dates, startAt, startLabel, metrics, period } = caseData;
  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;
  const xOf = (i) => PAD.left + (i / (clicks.length - 1)) * plotW;
  const yOf = (v) => PAD.top + (1 - v) * plotH;

  const clickPath = toPath(clicks, xOf, yOf);
  const impressionPath = toPath(impressions, xOf, yOf);

  const markerX = xOf(startAt);
  const markerY = yOf(clicks[startAt]);

  const tickIdx = [0, 3, 6, 9, 13].filter((i) => i < dates.length);

  return (
    <div className="gsc-card">
      <div className="gsc-card__top">
        <div className="gsc-metrics">
          <button
            type="button"
            className={`gsc-metric gsc-metric--clicks${active.clicks ? ' is-on' : ''}`}
            onClick={() => setActive((s) => ({ ...s, clicks: !s.clicks }))}
            aria-pressed={active.clicks}
          >
            <span className="gsc-metric__check" aria-hidden="true">
              {active.clicks ? '✓' : ''}
            </span>
            <span className="gsc-metric__label">Clics totales</span>
            <strong className="gsc-metric__value">{metrics.clicks}</strong>
          </button>
          <button
            type="button"
            className={`gsc-metric gsc-metric--impr${active.impressions ? ' is-on' : ''}`}
            onClick={() => setActive((s) => ({ ...s, impressions: !s.impressions }))}
            aria-pressed={active.impressions}
          >
            <span className="gsc-metric__check" aria-hidden="true">
              {active.impressions ? '✓' : ''}
            </span>
            <span className="gsc-metric__label">Impresiones totales</span>
            <strong className="gsc-metric__value">{metrics.impressions}</strong>
          </button>
          <div className="gsc-metric">
            <span className="gsc-metric__check" aria-hidden="true" />
            <span className="gsc-metric__label">CTR promedio</span>
            <strong className="gsc-metric__value">{metrics.ctr}</strong>
          </div>
          <div className="gsc-metric">
            <span className="gsc-metric__check" aria-hidden="true" />
            <span className="gsc-metric__label">Posición media</span>
            <strong className="gsc-metric__value">{metrics.position}</strong>
          </div>
        </div>
        <div className="gsc-period" aria-hidden="true">
          {period}
          <span>▾</span>
        </div>
      </div>

      <div className="gsc-chart-wrap">
        <svg className="gsc-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Crecimiento de ${caseData.business}`}>
          <defs>
            <linearGradient id={`pp-mag-${uid}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#F43CB0" />
              <stop offset="100%" stopColor="#e91e8c" />
            </linearGradient>
            <linearGradient id={`pp-lav-${uid}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8C3DF5" />
              <stop offset="100%" stopColor="#7a2fe0" />
            </linearGradient>
          </defs>

          {[0.25, 0.5, 0.75, 1].map((t) => (
            <line
              key={t}
              x1={PAD.left}
              x2={W - PAD.right}
              y1={yOf(t)}
              y2={yOf(t)}
              className="gsc-grid"
            />
          ))}

          <text x={PAD.left - 8} y={PAD.top + 4} className="gsc-axis-label" textAnchor="end">
            Clics
          </text>
          <text x={W - PAD.right + 8} y={PAD.top + 4} className="gsc-axis-label" textAnchor="start">
            Impresiones
          </text>

          {active.impressions ? (
            <path d={impressionPath} fill="none" stroke={`url(#pp-lav-${uid})`} strokeWidth="2.5" />
          ) : null}
          {active.clicks ? (
            <path d={clickPath} fill="none" stroke={`url(#pp-mag-${uid})`} strokeWidth="2.5" />
          ) : null}

          {tickIdx.map((i) => (
            <text key={i} x={xOf(i)} y={H - 10} className="gsc-tick" textAnchor="middle">
              {dates[i]}
            </text>
          ))}

          <line x1={markerX} x2={markerX} y1={markerY} y2={markerY - 52} className="gsc-marker-line" />
          <circle cx={markerX} cy={markerY} r="4.5" fill="#8C3DF5" stroke="#fff" strokeWidth="2" />

          <foreignObject x={markerX - 56} y={markerY - 108} width="112" height="56">
            <div xmlns="http://www.w3.org/1999/xhtml" className="gsc-annotation">
              <p className="gsc-annotation__tip">{startLabel}</p>
              <div className="gsc-annotation__logo">
                <img src="/brand/logo-mark.svg" alt="" width="28" height="34" />
              </div>
            </div>
          </foreignObject>
        </svg>
      </div>
    </div>
  );
}

export default function GrowthChartCarousel() {
  const [index, setIndex] = useState(0);
  const total = GROWTH_CASES.length;
  const current = GROWTH_CASES[index];

  useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % total);
    }, 7000);
    return () => window.clearInterval(id);
  }, [total]);

  const go = (dir) => setIndex((i) => (i + dir + total) % total);

  return (
    <section className="section growth-section" id="resultados" aria-labelledby="growth-title">
      <div className="container">
        <div className="section__intro section__intro--center">
          <p className="eyebrow">Resultados</p>
          <h2 id="growth-title">Así se ve el crecimiento en buscadores.</h2>
          <p>
            Ejemplos ilustrativos al estilo de Search Console: clics e impresiones suben cuando
            landings y blogs empiezan a rankear. Datos de demostración.
          </p>
        </div>

        <div className="growth-carousel">
          <div className="growth-carousel__meta">
            <p className="growth-carousel__niche">{current.niche}</p>
            <h3 className="growth-carousel__business">{current.business}</h3>
          </div>

          <SearchConsoleChart key={current.id} caseData={current} />

          <div className="growth-carousel__controls">
            <button type="button" className="growth-nav" onClick={() => go(-1)} aria-label="Anterior">
              ←
            </button>
            <div className="growth-dots" role="tablist" aria-label="Casos">
              {GROWTH_CASES.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  className={`growth-dot${i === index ? ' is-active' : ''}`}
                  onClick={() => setIndex(i)}
                  aria-label={item.business}
                />
              ))}
            </div>
            <button type="button" className="growth-nav" onClick={() => go(1)} aria-label="Siguiente">
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
