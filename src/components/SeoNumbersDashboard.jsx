/**
 * Panel estilo Ubersuggest — HTML nítido (sin pixelar) con cifras demo reforzadas.
 */
export default function SeoNumbersDashboard() {
  return (
    <section className="seo-dash" aria-labelledby="seo-dash-title">
      <header className="seo-dash__head">
        <h2 id="seo-dash-title">Tu sitio web en números</h2>
        <span className="seo-dash__chev" aria-hidden="true">
          ▾
        </span>
      </header>

      <div className="seo-dash__grid">
        <div className="seo-dash__col">
          <p className="seo-dash__col-label">Indicador principal</p>

          <article className="seo-dash__card seo-dash__card--score">
            <h3>
              Puntuación SEO on-page
              <span className="seo-dash__q">?</span>
            </h3>
            <div className="seo-dash__score-row">
              <div>
                <p className="seo-dash__value">100</p>
                <span className="seo-dash__pill seo-dash__pill--up">↗ +5%</span>
              </div>
              <div className="seo-dash__gauge" aria-hidden="true">
                <svg viewBox="0 0 120 72" className="seo-dash__gauge-svg">
                  <defs>
                    <linearGradient id="seoGaugeGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="45%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#22c55e" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M10 62 A50 50 0 0 1 110 62"
                    fill="none"
                    stroke="url(#seoGaugeGrad)"
                    strokeWidth="10"
                    strokeLinecap="round"
                  />
                  <line
                    x1="60"
                    y1="62"
                    x2="102"
                    y2="28"
                    stroke="#1f2937"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <circle cx="60" cy="62" r="5" fill="#1f2937" />
                </svg>
                <span className="seo-dash__gauge-label">Alta</span>
              </div>
            </div>
          </article>

          <article className="seo-dash__card">
            <h3>
              Problemas de SEO encontrados
              <span className="seo-dash__q">?</span>
            </h3>
            <p className="seo-dash__value">0</p>
            <span className="seo-dash__pill seo-dash__pill--neutral">− 0%</span>
            <button type="button" className="seo-dash__cta" tabIndex={-1}>
              ¿Qué hacer ahora?
            </button>
          </article>
        </div>

        <div className="seo-dash__col">
          <p className="seo-dash__col-label">Indicadores SEO clave</p>

          <div className="seo-dash__split">
            <article className="seo-dash__card">
              <h3>
                Palabras clave orgánicas
                <span className="seo-dash__q">?</span>
              </h3>
              <p className="seo-dash__value">25.4K</p>
              <span className="seo-dash__pill seo-dash__pill--up">↗ +45.8%</span>
            </article>
            <article className="seo-dash__card">
              <h3>
                Palabras clave rastreadas
                <span className="seo-dash__q">?</span>
              </h3>
              <div className="seo-dash__tracked">
                <span className="seo-dash__pill seo-dash__pill--up">↗ 850 UP</span>
                <span className="seo-dash__pill seo-dash__pill--down">↘ 420 DOWN</span>
              </div>
            </article>
          </div>

          <div className="seo-dash__split">
            <article className="seo-dash__card">
              <h3>
                Tráfico orgánico
                <span className="seo-dash__q">?</span>
              </h3>
              <p className="seo-dash__value">85.2K</p>
              <span className="seo-dash__pill seo-dash__pill--up seo-dash__pill--lg">↗ +520.4%</span>
            </article>
            <article className="seo-dash__card">
              <h3>
                Backlinks
                <span className="seo-dash__q">?</span>
              </h3>
              <p className="seo-dash__value">15.2K</p>
              <span className="seo-dash__pill seo-dash__pill--up">↗ +12.5%</span>
            </article>
          </div>

          <article className="seo-dash__card">
            <h3>
              Valor estimado
              <span className="seo-dash__q">?</span>
            </h3>
            <p className="seo-dash__value">$ 12,450.00</p>
            <span className="seo-dash__pill seo-dash__pill--up">↗ +85.2%</span>
          </article>
        </div>
      </div>

      <p className="seo-dash__note">Captura Ubersuggest</p>
    </section>
  );
}
