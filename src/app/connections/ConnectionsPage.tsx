import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ApiError, connections as connectionsApi, projects as projectsApi } from '../../api/client';
import { EmptyState, ErrorState, SkeletonRows } from '../../components/states/States';
import { useAsync } from '../../hooks/useAsync';
import type { Connection, ConnectionTestResult } from '../../api/types';
import { ConnectionStatusBadge, formatDateTime } from '../shared/ui';

interface Draft {
  projectId: string;
  siteUrl: string;
  username: string;
  applicationPassword: string;
}

const EMPTY_DRAFT: Draft = {
  projectId: '',
  siteUrl: '',
  username: '',
  applicationPassword: '',
};

export default function ConnectionsPage() {
  const projects = useAsync((signal) => projectsApi.list(signal), []);
  const list = useAsync((signal) => connectionsApi.list(signal), []);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [rowResults, setRowResults] = useState<Record<string, ConnectionTestResult>>({});

  const items = list.data?.items ?? [];
  const projectItems = projects.data?.items ?? [];

  useEffect(() => {
    if (!draft.projectId && projectItems.length > 0) {
      setDraft((prev) => ({ ...prev, projectId: projectItems[0].id }));
    }
  }, [projectItems, draft.projectId]);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function startEdit(connection: Connection) {
    setEditingId(connection.id);
    setFormError('');
    setTestResult(null);
    // La contraseña nunca vuelve desde Nexus: se deja vacía y solo se envía si la cambian.
    setDraft({
      projectId: connection.projectId,
      siteUrl: connection.siteUrl,
      username: connection.username,
      applicationPassword: '',
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setFormError('');
    setTestResult(null);
    setDraft({ ...EMPTY_DRAFT, projectId: projectItems[0]?.id ?? '' });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    setSaving(true);

    const payload = {
      projectId: draft.projectId,
      provider: 'wordpress' as const,
      siteUrl: draft.siteUrl.trim().replace(/\/$/, ''),
      username: draft.username.trim(),
      applicationPassword: draft.applicationPassword.trim(),
    };

    try {
      if (editingId) {
        await connectionsApi.update(editingId, {
          ...payload,
          // Sin contraseña nueva, Nexus conserva la guardada.
          applicationPassword: payload.applicationPassword || undefined,
        });
      } else {
        await connectionsApi.create(payload);
      }
      cancelEdit();
      list.reload();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'No se pudo guardar la conexión.');
    } finally {
      setSaving(false);
    }
  }

  async function testDraft() {
    setFormError('');
    setTestResult(null);
    setTestingId('draft');
    try {
      const result = await connectionsApi.testDraft({
        projectId: draft.projectId,
        provider: 'wordpress',
        siteUrl: draft.siteUrl.trim().replace(/\/$/, ''),
        username: draft.username.trim(),
        applicationPassword: draft.applicationPassword.trim(),
      });
      setTestResult(result);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'No se pudo probar la conexión.');
    } finally {
      setTestingId(null);
    }
  }

  async function testSaved(connection: Connection) {
    setTestingId(connection.id);
    try {
      const result = await connectionsApi.test(connection.id);
      setRowResults((prev) => ({ ...prev, [connection.id]: result }));
      list.reload();
    } catch (err) {
      setRowResults((prev) => ({
        ...prev,
        [connection.id]: {
          ok: false,
          message: err instanceof ApiError ? err.message : 'No se pudo probar la conexión.',
          checkedAt: new Date().toISOString(),
        },
      }));
    } finally {
      setTestingId(null);
    }
  }

  async function remove(connection: Connection) {
    if (!window.confirm(`¿Quitar la conexión con ${connection.siteUrl}?`)) return;
    try {
      await connectionsApi.remove(connection.id);
      list.reload();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'No se pudo eliminar la conexión.');
    }
  }

  return (
    <>
      <div className="pp-page-head">
        <div>
          <h1>Conexiones</h1>
          <p>
            Conecta el WordPress de cada proyecto para que PinkPurpleSEO publique por ti. Guardamos
            la contraseña de aplicación cifrada y nunca la mostramos de vuelta.
          </p>
        </div>
      </div>

      <section className="pp-card" aria-labelledby="form-conexion">
        <h2 className="pp-card__title" id="form-conexion">
          {editingId ? 'Editar conexión' : 'Nueva conexión WordPress'}
        </h2>

        {projects.loading ? <SkeletonRows rows={2} /> : null}

        {!projects.loading && projectItems.length === 0 ? (
          <EmptyState
            icon="🗂"
            title="Necesitas un proyecto primero"
            description="Las conexiones se asocian a un proyecto."
            action={
              <Link className="pp-btn pp-btn--primary" to="/app/seo/proyectos/nuevo">
                Crear proyecto
              </Link>
            }
          />
        ) : null}

        {!projects.loading && projectItems.length > 0 ? (
          <>
            {formError ? (
              <p className="pp-alert pp-alert--error" role="alert">
                {formError}
              </p>
            ) : null}

            {testResult ? (
              <p
                className={`pp-alert ${testResult.ok ? 'pp-alert--success' : 'pp-alert--error'}`}
                role="status"
              >
                {testResult.message}
              </p>
            ) : null}

            <form className="pp-form" onSubmit={onSubmit}>
              <div className="pp-form__row pp-form__row--2">
                <label className="pp-field">
                  <span>Proyecto</span>
                  <select
                    className="pp-select"
                    value={draft.projectId}
                    onChange={(e) => update('projectId', e.target.value)}
                    required
                  >
                    {projectItems.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="pp-field">
                  <span>URL del sitio</span>
                  <input
                    className="pp-input"
                    type="url"
                    required
                    value={draft.siteUrl}
                    onChange={(e) => update('siteUrl', e.target.value)}
                    placeholder="https://misitio.com"
                  />
                </label>
              </div>

              <div className="pp-form__row pp-form__row--2">
                <label className="pp-field">
                  <span>Usuario de WordPress</span>
                  <input
                    className="pp-input"
                    required
                    autoComplete="off"
                    value={draft.username}
                    onChange={(e) => update('username', e.target.value)}
                    placeholder="editor"
                  />
                </label>

                <label className="pp-field">
                  <span>
                    Application password
                    {editingId ? (
                      <span className="pp-field__hint"> — déjala vacía para no cambiarla</span>
                    ) : null}
                  </span>
                  <input
                    className="pp-input"
                    type="password"
                    autoComplete="new-password"
                    required={!editingId}
                    value={draft.applicationPassword}
                    onChange={(e) => update('applicationPassword', e.target.value)}
                    placeholder="xxxx xxxx xxxx xxxx"
                  />
                </label>
              </div>

              <p className="pp-item__meta">
                En WordPress: Usuarios → Perfil → Contraseñas de aplicación. No uses tu contraseña
                normal.
              </p>

              <div className="pp-form__actions">
                <button className="pp-btn pp-btn--primary" type="submit" disabled={saving}>
                  {saving ? 'Guardando…' : editingId ? 'Guardar cambios' : 'Guardar conexión'}
                </button>
                <button
                  type="button"
                  className="pp-btn pp-btn--ghost"
                  disabled={testingId === 'draft' || !draft.siteUrl || !draft.username}
                  onClick={testDraft}
                >
                  {testingId === 'draft' ? 'Probando…' : 'Probar conexión'}
                </button>
                {editingId ? (
                  <button type="button" className="pp-btn pp-btn--ghost" onClick={cancelEdit}>
                    Cancelar
                  </button>
                ) : null}
              </div>
            </form>
          </>
        ) : null}
      </section>

      <h2 className="pp-card__title" style={{ margin: '1.5rem 0 0.75rem' }}>
        Conexiones guardadas
      </h2>

      {list.loading ? <SkeletonRows rows={2} /> : null}

      {!list.loading && list.error ? (
        <ErrorState description={list.error} onRetry={list.reload} />
      ) : null}

      {!list.loading && !list.error && items.length === 0 ? (
        <EmptyState
          icon="🔌"
          title="Ninguna conexión todavía"
          description="Agrega el WordPress de un proyecto para poder publicar sin copiar y pegar."
        />
      ) : null}

      {items.length > 0 ? (
        <ul className="pp-list">
          {items.map((connection) => {
            const result = rowResults[connection.id];
            return (
              <li className="pp-item" key={connection.id}>
                <div className="pp-item__head">
                  <p className="pp-item__title">{connection.siteUrl}</p>
                  <ConnectionStatusBadge status={connection.status} />
                </div>

                <p className="pp-item__meta">
                  WordPress · usuario <strong>{connection.username}</strong> · última prueba{' '}
                  {formatDateTime(connection.lastCheckedAt)}
                </p>

                {connection.status === 'error' && connection.lastError ? (
                  <p className="pp-alert pp-alert--error" style={{ margin: 0 }}>
                    {connection.lastError}
                  </p>
                ) : null}

                {result ? (
                  <p
                    className={`pp-alert ${result.ok ? 'pp-alert--success' : 'pp-alert--error'}`}
                    style={{ margin: 0 }}
                    role="status"
                  >
                    {result.message}
                  </p>
                ) : null}

                <div className="pp-item__actions">
                  <button
                    type="button"
                    className="pp-btn pp-btn--ghost pp-btn--sm"
                    disabled={testingId === connection.id}
                    onClick={() => testSaved(connection)}
                  >
                    {testingId === connection.id ? 'Probando…' : 'Probar conexión'}
                  </button>
                  <button
                    type="button"
                    className="pp-btn pp-btn--ghost pp-btn--sm"
                    onClick={() => startEdit(connection)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="pp-btn pp-btn--danger pp-btn--sm"
                    onClick={() => remove(connection)}
                  >
                    Quitar
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </>
  );
}
