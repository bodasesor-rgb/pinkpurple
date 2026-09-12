import { Link } from 'react-router-dom';
import { HOW_IT_FLOW, HOW_IT_WORKS } from '../data/howItWorks.js';

export default function HowItWorksPage() {
  return (
    <div className="page-pad how-page">
      <div className="container">
        <header className="page-hero page-hero--wide">
          <p className="eyebrow">PinkPurple SEO</p>
          <h1>Cómo funciona cada pieza del producto</h1>
          <p>
            PinkPurple SEO abre el panel Nexus: generación de landings y blogs, research,
            rankings, competidores y publicación en tu servidor. Aquí va qué hace cada módulo —
            sin humo.
          </p>
          <div className="how-page__actions">
            <Link className="btn btn-primary" to="/productos/seo">
              Ver planes
            </Link>
            <Link className="btn btn-ghost" to="/registro">
              Empezar gratis
            </Link>
          </div>
        </header>

        <section className="how-flow" aria-label="Flujo general">
          {HOW_IT_FLOW.map((item) => (
            <article className="how-flow__item" key={item.step}>
              <p className="how-flow__step">{item.step}</p>
              <h2>{item.title}</h2>
              <p>{item.text}</p>
            </article>
          ))}
        </section>

        <section className="how-tools" aria-label="Herramientas">
          <div className="section__intro">
            <p className="eyebrow">Módulos del panel</p>
            <h2>Cada herramienta, en claro.</h2>
            <p>
              El catálogo de marketing muestra un producto; dentro del panel tienes estas
              capacidades conectadas.
            </p>
          </div>

          <div className="how-tools__grid">
            {HOW_IT_WORKS.map((tool) => (
              <article className="how-tool" key={tool.id} id={tool.id}>
                <p className="how-tool__kicker">{tool.kicker}</p>
                <h3>{tool.name}</h3>
                <p className="how-tool__summary">{tool.summary}</p>
                <p className="how-tool__body">{tool.body}</p>
                <ul className="how-tool__list">
                  {tool.does.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="how-cta contact-block">
          <div className="contact-block__copy">
            <p className="eyebrow">Listo para probar</p>
            <h2>Elige plan y entra al panel.</h2>
            <p>Free one-shot para probar; planes de pago para escalar landings y blogs.</p>
          </div>
          <Link className="btn btn-primary btn-lg" to="/productos/seo">
            Ver PinkPurple SEO
          </Link>
        </section>
      </div>
    </div>
  );
}
