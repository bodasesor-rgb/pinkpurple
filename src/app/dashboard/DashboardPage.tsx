import { Link } from 'react-router-dom';
import { account, jobs as jobsApi, projects as projectsApi } from '../../api/client';
import { EmptyState, ErrorState, SkeletonRows } from '../../components/states/States';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../auth/AuthContext';
import { JobStatusBadge, UsageMeter, formatDateTime } from '../shared/ui';

export default function DashboardPage() {
  const { user } = useAuth();
  const usage = useAsync((signal) => account.usage(signal), []);
  const recent = useAsync((signal) => jobsApi.list({ pageSize: 5 }, signal), []);
  const projects = useAsync((signal) => projectsApi.list(signal), []);

  const firstName = user?.fullName?.split(' ')[0] || 'Hola';
  const projectCount = projects.data?.items.length ?? 0;

  return (
    <>
      <div className="pp-page-head">
        <div>
          <h1>Hola, {firstName}</h1>
          <p>Resumen de tu plan y de lo último que generó PinkPurpleSEO.</p>
        </div>
        <Link className="pp-btn pp-btn--primary" to="/app/seo/generar">
          Generar contenido
        </Link>
      </div>

      <section className="pp-card" aria-labelledby="uso-plan">
        <h2 className="pp-card__title" id="uso-plan">
          Uso del plan
        </h2>

        {usage.loading ? <SkeletonRows rows={3} /> : null}

        {!usage.loading && usage.error ? (
          <ErrorState description={usage.error} onRetry={usage.reload} />
        ) : null}

        {!usage.loading && usage.data ? (
          <>
            <p className="pp-item__meta" style={{ marginBottom: '0.85rem' }}>
              Plan <strong>{usage.data.planName}</strong> · renueva el{' '}
              {formatDateTime(usage.data.periodEnd)}
            </p>
            <div className="pp-usage">
              <UsageMeter label="Landings generadas" counter={usage.data.landings} />
              <UsageMeter label="Blogs generados" counter={usage.data.blogs} />
              <UsageMeter label="Sitios conectados" counter={usage.data.sites} />
            </div>
          </>
        ) : null}
      </section>

      <div className="pp-grid" style={{ marginTop: '1rem' }}>
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
              description={
                projectCount === 0
                  ? 'Crea tu primer proyecto y después genera una landing o un blog.'
                  : 'Genera tu primera landing o blog para verlo aquí.'
              }
              action={
                <Link
                  className="pp-btn pp-btn--primary"
                  to={projectCount === 0 ? '/app/seo/proyectos/nuevo' : '/app/seo/generar'}
                >
                  {projectCount === 0 ? 'Crear proyecto' : 'Generar contenido'}
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
                  {job.publishedUrl ? (
                    <a
                      className="pp-link"
                      href={job.publishedUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {job.publishedUrl}
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </div>
    </>
  );
}
