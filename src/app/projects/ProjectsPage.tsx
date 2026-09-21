import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError, projects as projectsApi } from '../../api/client';
import { EmptyState, ErrorState, SkeletonRows } from '../../components/states/States';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../auth/AuthContext';
import { loadDemoSession, removeDemoProject } from '../../auth/demoSession';
import { formatDate } from '../shared/ui';

export default function ProjectsPage() {
  const { isDemo, deleteDemoCompany } = useAuth();
  const navigate = useNavigate();
  const { data, loading, error, reload } = useAsync((signal) => projectsApi.list(signal), []);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');
  const demo = isDemo ? loadDemoSession() : null;

  async function onRemove(id: string, name: string) {
    const isLastDemo = isDemo && (data?.items.length ?? 0) <= 1;
    const msg = isLastDemo
      ? `¿Eliminar "${name}"? Es el último proyecto: también se borrará la empresa de prueba.`
      : `¿Eliminar el proyecto "${name}"? Esta acción no se puede deshacer.`;
    if (!window.confirm(msg)) return;

    setActionError('');
    setRemovingId(id);
    try {
      if (isDemo) {
        const result = removeDemoProject(id);
        if (result.companyDeleted) {
          deleteDemoCompany();
          navigate('/#simulador', { replace: true });
          return;
        }
        reload();
      } else {
        await projectsApi.remove(id);
        reload();
      }
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : 'No se pudo eliminar el proyecto.');
    } finally {
      setRemovingId(null);
    }
  }

  function onDeleteCompany() {
    const label = demo?.config.brandName || demo?.config.company || 'esta empresa';
    if (
      !window.confirm(
        `¿Borrar ${label} por completo? Se cierran todos los proyectos de prueba de este navegador.`,
      )
    ) {
      return;
    }
    deleteDemoCompany();
    navigate('/#simulador', { replace: true });
  }

  return (
    <>
      <div className="pp-page-head">
        <div>
          <h1>Proyectos</h1>
          <p>
            {isDemo
              ? 'Empresa de prueba: crea, edita o borra proyectos como en una cuenta real.'
              : 'Cada proyecto es un sitio con su ciudad, servicios e idioma para generar contenido.'}
          </p>
        </div>
        <div className="pp-page-head__actions">
          {isDemo ? (
            <button type="button" className="pp-btn pp-btn--danger" onClick={onDeleteCompany}>
              Borrar empresa
            </button>
          ) : null}
          <Link className="pp-btn pp-btn--primary" to="/app/seo/proyectos/nuevo">
            Nuevo proyecto
          </Link>
        </div>
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
