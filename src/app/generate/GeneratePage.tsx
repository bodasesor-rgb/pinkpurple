import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ApiError, jobs as jobsApi, projects as projectsApi } from '../../api/client';
import { EmptyState, ErrorState, SkeletonRows, Spinner } from '../../components/states/States';
import { useAsync } from '../../hooks/useAsync';
import { useJobPolling } from '../../hooks/useJobPolling';
import type { ContentType, Tone } from '../../api/types';
import { JobStatusBadge } from '../shared/ui';

const TONES: { value: Tone; label: string }[] = [
  { value: 'profesional', label: 'Profesional' },
  { value: 'cercano', label: 'Cercano' },
  { value: 'directo', label: 'Directo' },
  { value: 'inspirador', label: 'Inspirador' },
  { value: 'tecnico', label: 'Técnico' },
];

export default function GeneratePage() {
  const [searchParams] = useSearchParams();
  const projects = useAsync((signal) => projectsApi.list(signal), []);

  const [projectId, setProjectId] = useState(searchParams.get('projectId') ?? '');
  const [type, setType] = useState<ContentType>('landing');
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const [tone, setTone] = useState<Tone>('profesional');
  const [notes, setNotes] = useState('');
  const [autoPublish, setAutoPublish] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const items = projects.data?.items ?? [];
  const selectedProject = useMemo(
    () => items.find((p) => p.id === projectId) ?? null,
    [items, projectId],
  );

  // Preselecciona proyecto y hereda su ciudad mientras el campo esté vacío.
  useEffect(() => {
    if (!projectId && items.length > 0) setProjectId(items[0].id);
  }, [items, projectId]);

  useEffect(() => {
    if (selectedProject && !city) setCity(selectedProject.city);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProject?.id]);

  const { job, error: pollError, isPolling, timedOut } = useJobPolling(activeJobId);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError('');
    setActiveJobId(null);
    setSubmitting(true);

    try {
      const created = await jobsApi.create({
        projectId,
        type,
        keyword: keyword.trim(),
        city: city.trim(),
        tone,
        notes: notes.trim() || undefined,
        autoPublish,
      });
      setActiveJobId(created.id);
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message : 'No se pudo crear el trabajo de generación.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setActiveJobId(null);
    setKeyword('');
    setNotes('');
  }

  if (projects.loading) return <SkeletonRows rows={4} />;

  if (projects.error) {
    return <ErrorState description={projects.error} onRetry={projects.reload} />;
  }

  if (items.length === 0) {
    return (
      <>
        <div className="pp-page-head">
          <div>
            <h1>Generar</h1>
            <p>Primero necesitas un proyecto: de ahí salen el dominio, la ciudad y los servicios.</p>
          </div>
        </div>
        <EmptyState
          icon="🗂"
          title="Sin proyectos todavía"
          description="Crea un proyecto y vuelve aquí para generar tu primera landing o blog."
          action={
            <Link className="pp-btn pp-btn--primary" to="/app/seo/proyectos/nuevo">
              Crear proyecto
            </Link>
          }
        />
      </>
    );
  }

  return (
    <>
      <div className="pp-page-head">
        <div>
          <h1>Generar</h1>
          <p>
            Pides una landing o un blog y Nexus lo produce en segundo plano. Puedes cerrar esta
            pantalla: el trabajo sigue en el historial.
          </p>
        </div>
      </div>

      <section className="pp-card">
        {submitError ? (
          <p className="pp-alert pp-alert--error" role="alert">
            {submitError}
          </p>
        ) : null}

        <form className="pp-form" onSubmit={onSubmit}>
          <div className="pp-form__row pp-form__row--2">
            <label className="pp-field">
              <span>Proyecto</span>
              <select
                className="pp-select"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                required
              >
                {items.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name} — {project.domain}
                  </option>
                ))}
              </select>
            </label>

            <label className="pp-field">
              <span>Tipo de contenido</span>
              <select
                className="pp-select"
                value={type}
                onChange={(e) => setType(e.target.value as ContentType)}
              >
                <option value="landing">Landing de venta</option>
                <option value="blog">Blog informativo</option>
              </select>
            </label>
          </div>

          <label className="pp-field">
            <span>
              Palabra clave{' '}
              <span className="pp-field__hint">— lo que busca tu cliente en Google</span>
            </span>
            <input
              className="pp-input"
              required
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="implantes dentales"
            />
          </label>

          <div className="pp-form__row pp-form__row--2">
            <label className="pp-field">
              <span>Ciudad</span>
              <input
                className="pp-input"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={selectedProject?.city || 'Ciudad de México'}
              />
            </label>

            <label className="pp-field">
              <span>Tono</span>
              <select
                className="pp-select"
                value={tone}
                onChange={(e) => setTone(e.target.value as Tone)}
              >
                {TONES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="pp-field">
            <span>
              Notas para el generador <span className="pp-field__hint">— opcional</span>
            </span>
            <textarea
              className="pp-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Menciona financiamiento a 12 meses y el teléfono de contacto."
            />
          </label>

          <label className="pp-checkbox">
            <input
              type="checkbox"
              checked={autoPublish}
              onChange={(e) => setAutoPublish(e.target.checked)}
            />
            <span>
              Publicar automáticamente al terminar (necesita una conexión activa del proyecto)
            </span>
          </label>

          <div className="pp-form__actions">
            <button className="pp-btn pp-btn--primary" type="submit" disabled={submitting || isPolling}>
              {submitting ? 'Enviando…' : isPolling ? 'Generando…' : 'Generar'}
            </button>
            {activeJobId ? (
              <button type="button" className="pp-btn pp-btn--ghost" onClick={resetForm}>
                Generar otro
              </button>
            ) : null}
          </div>
        </form>
      </section>

      {activeJobId ? (
        <section className="pp-card" style={{ marginTop: '1rem' }} aria-live="polite">
          <h2 className="pp-card__title">Progreso del trabajo</h2>

          <div className="pp-job-live">
            <div className="pp-job-live__row">
              {isPolling ? <Spinner label="Generando" /> : null}
              {job ? <JobStatusBadge status={job.status} /> : <span>Creando el trabajo…</span>}
              {typeof job?.progress === 'number' ? (
                <span className="pp-item__meta">{job.progress}%</span>
              ) : null}
            </div>

            {typeof job?.progress === 'number' ? (
              <div className="pp-bar">
                <div className="pp-bar__fill" style={{ width: `${job.progress}%` }} />
              </div>
            ) : null}

            {pollError ? (
              <p className="pp-alert pp-alert--error" role="alert">
                {pollError}
              </p>
            ) : null}

            {timedOut ? (
              <p className="pp-alert pp-alert--info">
                Está tardando más de lo normal. El trabajo sigue en cola: revisa el historial en un
                rato.
              </p>
            ) : null}

            {job?.status === 'error' ? (
              <p className="pp-alert pp-alert--error">
                {job.errorMessage || 'La generación falló. Puedes reintentar desde el historial.'}
              </p>
            ) : null}

            {job && (job.status === 'published' || job.status === 'ready') ? (
              <div className="pp-job-live__row">
                <p className="pp-alert pp-alert--success" style={{ margin: 0 }}>
                  {job.status === 'published' ? '¡Publicado!' : 'Contenido listo para publicar.'}
                </p>
                {job.publishedUrl ? (
                  <a
                    className="pp-btn pp-btn--ghost pp-btn--sm"
                    href={job.publishedUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    Ver publicada
                  </a>
                ) : null}
                <Link className="pp-btn pp-btn--ghost pp-btn--sm" to="/app/seo/historial">
                  Ir al historial
                </Link>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
    </>
  );
}
