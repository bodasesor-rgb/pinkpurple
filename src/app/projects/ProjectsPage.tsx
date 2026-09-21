import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError, projects as projectsApi } from '../../api/client';
import { EmptyState, ErrorState, SkeletonRows } from '../../components/states/States';
import { useAsync } from '../../hooks/useAsync';
import { formatDate } from '../shared/ui';

export default function ProjectsPage() {
  const { data, loading, error, reload } = useAsync((signal) => projectsApi.list(signal), []);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  async function onRemove(id: string, name: string) {
    if (!window.confirm(`¿Eliminar el proyecto "${name}"? Esta acción no se puede deshacer.`)) {
      return;
    }
    setActionError('');
    setRemovingId(id);
    try {
      await projectsApi.remove(id);
      reload();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'No se pudo eliminar el proyecto.');
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <>
      <div className="pp-page-head">
        <div>
          <h1>Proyectos</h1>
          <p>Cada proyecto es un sitio con su ciudad, servicios e idioma para generar contenido.</p>
        </div>
        <Link className="pp-btn pp-btn--primary" to="/app/seo/proyectos/nuevo">
          Nuevo proyecto
        </Link>
      </div>

      {actionError ? (
        <p className="pp-alert pp-alert--error" role="alert">
          {actionError}
        </p>
      ) : null}

      {loading ? <SkeletonRows rows={3} /> : null}

      {!loading && error ? <ErrorState description={error} onRetry={reload} /> : null}

      {!loading && !error && data?.items.length === 0 ? (
        <EmptyState
          icon="🗂"
          title="Aún no tienes proyectos"
          description="Crea el primero con el dominio y la ciudad del negocio; después podrás generar landings y blogs."
          action={
            <Link className="pp-btn pp-btn--primary" to="/app/seo/proyectos/nuevo">
              Crear proyecto
            </Link>
          }
        />
      ) : null}

      {!loading && data && data.items.length > 0 ? (
        <ul className="pp-list">
          {data.items.map((project) => (
            <li className="pp-item" key={project.id}>
              <div className="pp-item__head">
                <p className="pp-item__title">{project.name}</p>
                <span className="pp-badge pp-badge--generating">{project.language.toUpperCase()}</span>
              </div>
              <p className="pp-item__meta">
                {project.domain} · {project.city} · creado el {formatDate(project.createdAt)}
              </p>
              {project.services.length > 0 ? (
                <ul className="pp-chips">
                  {project.services.map((service) => (
                    <li className="pp-chip" key={service}>
                      {service}
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="pp-item__actions">
                <Link
                  className="pp-btn pp-btn--ghost pp-btn--sm"
                  to={`/app/seo/proyectos/${project.id}`}
                >
                  Editar
                </Link>
                <Link
                  className="pp-btn pp-btn--ghost pp-btn--sm"
                  to={`/app/seo/generar?projectId=${project.id}`}
                >
                  Generar
                </Link>
                <Link
                  className="pp-btn pp-btn--ghost pp-btn--sm"
                  to={`/app/seo/historial?projectId=${project.id}`}
                >
                  Historial
                </Link>
                <button
                  type="button"
                  className="pp-btn pp-btn--danger pp-btn--sm"
                  disabled={removingId === project.id}
                  onClick={() => onRemove(project.id, project.name)}
                >
                  {removingId === project.id ? 'Eliminando…' : 'Eliminar'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
