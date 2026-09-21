import { Link, useNavigate } from 'react-router-dom';
import { account, jobs as jobsApi } from '../../api/client';
import { EmptyState, ErrorState, SkeletonRows } from '../../components/states/States';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../auth/AuthContext';
import { loadDemoConfig } from '../../auth/demoSession';
import { JobStatusBadge, UsageMeter, formatDateTime } from '../shared/ui';

const APPS = [
  {
    id: 'seo',
    name: 'Pink Purple SEO',
    blurb: 'Landings, blogs y publicación con el motor Nexus.',
    to: '/app/seo/proyectos',
    icon: '✦',
    enabled: true,
  },
  {
    id: 'ads',
    name: 'Pink Purple Ads',
    blurb: 'Automatización de campañas. Próximamente.',
    to: '',
    icon: '◈',
    enabled: false,
  },
];

export default function ProfilePage() {
  const { user, isDemo, deleteDemoCompany } = useAuth();
  const navigate = useNavigate();
  const demo = isDemo ? loadDemoConfig() : null;
  const usage = useAsync((signal) => account.usage(signal), []);
  const recent = useAsync((signal) => jobsApi.list({ pageSize: 5 }, signal), []);

  const displayName =
    demo?.fullName?.split(' ')[0] || user?.fullName?.split(' ')[0] || 'Hola';

  function onDeleteCompany() {
    const label = demo?.brandName || demo?.company || 'esta empresa de prueba';
    if (
      !window.confirm(
        `¿Borrar ${label}? Se elimina la sesión de simulación y todos sus proyectos de este navegador.`,
      )
    ) {
      return;
    }
    deleteDemoCompany();
    navigate('/#simulador', { replace: true });
  }

  return (
    <>
      {isDemo ? (
        <div className="pp-demo-banner" role="status">
          <p>
            Empresa de prueba — mismo panel que un usuario real. Edita el perfil en Configuración o
            bórrala aquí.
          </p>
          <button type="button" className="pp-btn pp-btn--danger pp-btn--sm" onClick={onDeleteCompany}>
            Borrar empresa
          </button>
        </div>
      ) : null}

      <div className="pp-page-head">
        <div>
          <h1>Hola, {displayName}</h1>
          <p>
            {demo?.brandName
              ? `${demo.brandName} · elige una app para trabajar.`
              : 'Tu hub en Pink Purple Studio. Elige una app para empezar.'}
          </p>
        </div>
        <Link className="pp-btn pp-btn--ghost" to="/app/configuracion/perfil">
          Editar perfil
        </Link>
      </div>

      <section className="pp-card" aria-labelledby="mis-apps">
        <h2 className="pp-card__title" id="mis-apps">
          Mis apps
        </h2>
        <p className="pp-item__meta" style={{ marginBottom: '0.85rem' }}>
          Productos activos en tu cuenta Studio.
        </p>
        <div className="pp-tool-cards">
          {APPS.map((app) =>
            app.enabled ? (
              <Link key={app.id} className="pp-tool-card" to={app.to}>
                <span className="pp-tool-card__icon" aria-hidden="true">
                  {app.icon}
                </span>
                <strong>{app.name}</strong>
                <p>{app.blurb}</p>
                <span className="pp-tool-card__cta">Abrir</span>
              </Link>
            ) : (
              <div key={app.id} className="pp-tool-card pp-tool-card--soon" aria-disabled="true">
                <span className="pp-tool-card__icon" aria-hidden="true">
                  {app.icon}
                </span>
                <strong>{app.name}</strong>
                <p>{app.blurb}</p>
                <span className="pp-tool-card__cta">Pronto</span>
              </div>
            ),
          )}
        </div>
      </section>

      <div className="pp-grid pp-grid--profile" style={{ marginTop: '1rem' }}>
        <section className="pp-card" aria-labelledby="perfil-plan">
          <h2 className="pp-card__title" id="perfil-plan">
            Consumo del plan
          </h2>
          {usage.loading ? <SkeletonRows rows={3} /> : null}
          {!usage.loading && usage.error ? (
            <ErrorState description={usage.error} onRetry={usage.reload} />
          ) : null}
          {!usage.loading && usage.data ? (
            <>
              <p className="pp-item__meta" style={{ marginBottom: '0.85rem' }}>
                Plan <strong>{usage.data.planName}</strong>
                {demo?.extraTokens ? ` · +${demo.extraTokens} tokens extra` : ''} · renueva el{' '}
                {formatDateTime(usage.data.periodEnd)}
              </p>
              <div className="pp-usage">
                <UsageMeter label="Landings" counter={usage.data.landings} />
                <UsageMeter label="Blogs" counter={usage.data.blogs} />
                <UsageMeter label="Sitios" counter={usage.data.sites} />
              </div>
              <Link
                className="pp-link"
                to="/app/configuracion/plan"
                style={{ marginTop: '0.85rem', display: 'inline-block' }}
              >
                Plan, tokens y facturación
              </Link>
            </>
          ) : null}
        </section>

        <section className="pp-card" aria-labelledby="ultimos-trabajos">
          <div className="pp-item__head" style={{ marginBottom: '0.75rem' }}>
            <h2 className="pp-card__title" id="ultimos-trabajos" style={{ marginBottom: 0 }}>
              Últimos trabajos
            </h2>
            <Link className="pp-link" to="/app/seo/historial">
              Ver historial
            </Link>
          </div>
          {recent.loading ? <SkeletonRows rows={3} /> : null}
          {!recent.loading && recent.error ? (
            <ErrorState description={recent.error} onRetry={recent.reload} />
          ) : null}
          {!recent.loading && !recent.error && recent.data?.items.length === 0 ? (
            <EmptyState
              title="Todavía no generas nada"
              description="Abre Pink Purple SEO y genera tu primera landing o blog."
              action={
                <Link className="pp-btn pp-btn--primary" to="/app/seo/proyectos">
                  Ir a SEO
                </Link>
              }
            />
          ) : null}
          {!recent.loading && recent.data && recent.data.items.length > 0 ? (
            <ul className="pp-list">
              {recent.data.items.map((job) => (
                <li className="pp-item" key={job.id}>
                  <div className="pp-item__head">
                    <p className="pp-item__title">{job.title || job.keyword}</p>
                    <JobStatusBadge status={job.status} />
                  </div>
                  <p className="pp-item__meta">
                    {job.type === 'landing' ? 'Landing' : 'Blog'} · {job.city || 'Sin ciudad'} ·{' '}
                    {formatDateTime(job.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </div>
    </>
  );
}
