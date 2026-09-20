import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ApiError, jobs as jobsApi, projects as projectsApi } from '../../api/client';
import { EmptyState, ErrorState, SkeletonRows } from '../../components/states/States';
import { useAsync } from '../../hooks/useAsync';
import { ACTIVE_JOB_STATUSES, type Job, type JobStatus } from '../../api/types';
import { JobStatusBadge, formatDateTime } from '../shared/ui';
import JobPreviewModal from './JobPreviewModal';

const STATUS_OPTIONS: { value: '' | JobStatus; label: string }[] = [
  { value: '', label: 'Todos los estados' },
  { value: 'queued', label: 'En cola' },
  { value: 'generating', label: 'Generando' },
  { value: 'ready', label: 'Listos' },
  { value: 'published', label: 'Publicados' },
  { value: 'error', label: 'Con error' },
];

/** Refresco suave mientras haya trabajos activos en la lista. */
const REFRESH_MS = 6000;

export default function HistoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const projectId = searchParams.get('projectId') ?? '';
  const status = (searchParams.get('status') ?? '') as '' | JobStatus;

  const projects = useAsync((signal) => projectsApi.list(signal), []);
  const { data, loading, error, reload } = useAsync(
    (signal) =>
      jobsApi.list(
        { projectId: projectId || undefined, status: status || undefined, pageSize: 50 },
        signal,
      ),
    [projectId, status],
  );

  const [preview, setPreview] = useState<Job | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  const items = data?.items ?? [];
  const hasActive = items.some((job) => ACTIVE_JOB_STATUSES.includes(job.status));

  useEffect(() => {
    if (!hasActive) return undefined;
    const timer = window.setInterval(reload, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [hasActive, reload]);

  function setFilter(key: 'projectId' | 'status', value: string) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next, { replace: true });
  }

  async function runAction(job: Job, action: 'retry' | 'publish') {
    setActionError('');
    setActionId(job.id);
    try {
      if (action === 'retry') await jobsApi.retry(job.id);
      else await jobsApi.publish(job.id);
      reload();
    } catch (err) {
      setActionError(
        err instanceof ApiError
          ? err.message
          : action === 'retry'
            ? 'No se pudo reintentar el trabajo.'
            : 'No se pudo publicar el contenido.',
      );
    } finally {
      setActionId(null);
    }
  }

  return (
    <>
      <div className="pp-page-head">
        <div>
          <h1>Historial</h1>
          <p>Todo lo que has pedido, con su estado y el enlace a la página publicada.</p>
        </div>
        <Link className="pp-btn pp-btn--primary" to="/app/generar">
          Generar contenido
        </Link>
      </div>

      <div className="pp-filters">
        <label className="pp-field">
          <span>Proyecto</span>
          <select
            className="pp-select"
            value={projectId}
            onChange={(e) => setFilter('projectId', e.target.value)}
          >
            <option value="">Todos los proyectos</option>
            {(projects.data?.items ?? []).map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </label>

        <label className="pp-field">
          <span>Estado</span>
          <select
            className="pp-select"
            value={status}
            onChange={(e) => setFilter('status', e.target.value)}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="pp-filters__action">
          <button type="button" className="pp-btn pp-btn--ghost" onClick={reload}>
            Actualizar
          </button>
        </div>
      </div>

      {actionError ? (
        <p className="pp-alert pp-alert--error" role="alert">
          {actionError}
        </p>
      ) : null}

      {hasActive ? (
        <p className="pp-alert pp-alert--info">
          Hay trabajos en curso. Esta lista se actualiza sola cada pocos segundos.
        </p>
      ) : null}

      {loading && items.length === 0 ? <SkeletonRows rows={4} /> : null}

      {!loading && error ? <ErrorState description={error} onRetry={reload} /> : null}

      {!loading && !error && items.length === 0 ? (
        <EmptyState
          icon="🕓"
          title="Sin trabajos por aquí"
          description={
            projectId || status
              ? 'Ningún trabajo coincide con los filtros. Prueba a quitarlos.'
              : 'Cuando generes tu primera landing o blog aparecerá en esta lista.'
          }
          action={
            <Link className="pp-btn pp-btn--primary" to="/app/generar">
              Generar contenido
            </Link>
          }
        />
      ) : null}

      {items.length > 0 ? (
        <ul className="pp-list">
          {items.map((job) => (
            <li className="pp-item" key={job.id}>
              <div className="pp-item__head">
                <p className="pp-item__title">{job.title || job.keyword}</p>
                <JobStatusBadge status={job.status} />
              </div>

              <p className="pp-item__meta">
                {job.type === 'landing' ? 'Landing' : 'Blog'}
                {job.projectName ? ` · ${job.projectName}` : ''} · {job.city || 'Sin ciudad'} ·{' '}
                {formatDateTime(job.createdAt)}
              </p>

              {job.status === 'error' && job.errorMessage ? (
                <p className="pp-alert pp-alert--error" style={{ margin: 0 }}>
                  {job.errorMessage}
                </p>
              ) : null}

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

              <div className="pp-item__actions">
                {job.status === 'ready' || job.status === 'published' ? (
                  <button
                    type="button"
                    className="pp-btn pp-btn--ghost pp-btn--sm"
                    onClick={() => setPreview(job)}
                  >
                    Vista previa
                  </button>
                ) : null}

                {job.status === 'ready' ? (
                  <button
                    type="button"
                    className="pp-btn pp-btn--primary pp-btn--sm"
                    disabled={actionId === job.id}
                    onClick={() => runAction(job, 'publish')}
                  >
                    {actionId === job.id ? 'Publicando…' : 'Publicar'}
                  </button>
                ) : null}

                {job.status === 'error' ? (
                  <button
                    type="button"
                    className="pp-btn pp-btn--ghost pp-btn--sm"
                    disabled={actionId === job.id}
                    onClick={() => runAction(job, 'retry')}
                  >
                    {actionId === job.id ? 'Reintentando…' : 'Reintentar'}
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {preview ? <JobPreviewModal job={preview} onClose={() => setPreview(null)} /> : null}
    </>
  );
}
