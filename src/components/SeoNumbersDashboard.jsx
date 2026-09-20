/**
 * Captura original Ubersuggest + cifras demo con más movimiento DOWN.
 */
export default function SeoNumbersDashboard() {
  return (
    <section className="seo-dash seo-dash--photo" aria-labelledby="seo-dash-title">
      <header className="seo-dash__head">
        <h2 id="seo-dash-title">Tu sitio web en números</h2>
        <span className="seo-dash__chev" aria-hidden="true">
          ▾
        </span>
      </header>

      <figure className="seo-dash__photo">
        <img
          src="/brand/ubersuggest-seo-numbers.png"
          alt="Ubersuggest · Tu sitio web en números (captura original)"
          width={1024}
          height={484}
          loading="lazy"
        />
        <figcaption>Foto original · Ubersuggest</figcaption>
      </figure>

      <div className="seo-dash__highlights" aria-label="Cifras demo reforzadas">
        <p className="seo-dash__col-label">Versión demo reforzada (ejemplo)</p>
        <ul className="seo-dash__pills-row">
          <li>
            <span className="seo-dash__k">Keywords</span>
            <strong>25.4K</strong>
            <span className="seo-dash__pill seo-dash__pill--up">↗ +45.8%</span>
          </li>
          <li>
            <span className="seo-dash__k">Rastreadas</span>
            <span className="seo-dash__pill seo-dash__pill--up">↗ 850 UP</span>
            <span className="seo-dash__pill seo-dash__pill--down">↘ 420 DOWN</span>
          </li>
          <li>
            <span className="seo-dash__k">Tráfico</span>
            <strong>85.2K</strong>
            <span className="seo-dash__pill seo-dash__pill--up">↗ +520.4%</span>
          </li>
          <li>
            <span className="seo-dash__k">Backlinks</span>
            <strong>15.2K</strong>
            <span className="seo-dash__pill seo-dash__pill--up">↗ +12.5%</span>
          </li>
          <li>
            <span className="seo-dash__k">Valor</span>
            <strong>$12,450</strong>
            <span className="seo-dash__pill seo-dash__pill--up">↗ +85.2%</span>
          </li>
        </ul>
      </div>
    </section>
  );
}
