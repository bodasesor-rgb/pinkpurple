import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ApiError, projects as projectsApi } from '../../api/client';
import { ErrorState, LoadingState } from '../../components/states/States';
import type { Language, ProjectInput } from '../../api/types';

const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'Inglés' },
  { value: 'pt', label: 'Portugués' },
];

const EMPTY: ProjectInput = {
  name: '',
  domain: '',
  city: '',
  services: [],
  language: 'es',
};

export default function ProjectFormPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(projectId);

  const [form, setForm] = useState<ProjectInput>(EMPTY);
  const [servicesText, setServicesText] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    const controller = new AbortController();
    let alive = true;

    setLoading(true);
    setLoadError('');

    projectsApi
      .get(projectId, controller.signal)
      .then((project) => {
        if (!alive) return;
        setForm({
          name: project.name,
          domain: project.domain,
          city: project.city,
          services: project.services,
          language: project.language,
        });
        setServicesText(project.services.join(', '));
      })
      .catch((err: unknown) => {
        if (!alive || (err as Error)?.name === 'AbortError') return;
        setLoadError(err instanceof ApiError ? err.message : 'No se pudo cargar el proyecto.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
      controller.abort();
    };
  }, [projectId]);

  function update<K extends keyof ProjectInput>(key: K, value: ProjectInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveError('');
    setSaving(true);

    const payload: ProjectInput = {
      ...form,
      name: form.name.trim(),
      domain: form.domain.trim().replace(/^https?:\/\//, '').replace(/\/$/, ''),
      city: form.city.trim(),
      services: servicesText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };

    try {
      if (isEdit && projectId) {
        await projectsApi.update(projectId, payload);
      } else {
        await projectsApi.create(payload);
      }
      navigate('/app/seo/proyectos', { replace: true });
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : 'No se pudo guardar el proyecto.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingState label="Cargando proyecto…" />;

  if (loadError) {
    return (
      <ErrorState
        title="No pudimos abrir el proyecto"
        description={loadError}
        onRetry={() => navigate(0)}
      />
    );
  }

  return (
    <>
      <div className="pp-page-head">
        <div>
          <h1>{isEdit ? 'Editar proyecto' : 'Nuevo proyecto'}</h1>
          <p>
            Estos datos alimentan al generador: ciudad y servicios definen de qué va cada landing.
          </p>
        </div>
        <Link className="pp-btn pp-btn--ghost" to="/app/seo/proyectos">
          Volver
        </Link>
      </div>

      <section className="pp-card">
        {saveError ? (
          <p className="pp-alert pp-alert--error" role="alert">
            {saveError}
          </p>
        ) : null}

        <form className="pp-form" onSubmit={onSubmit}>
          <div className="pp-form__row pp-form__row--2">
            <label className="pp-field">
              <span>Nombre del proyecto</span>
              <input
                className="pp-input"
                required
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="Clínica Dental Centro"
              />
            </label>

            <label className="pp-field">
              <span>Dominio</span>
              <input
                className="pp-input"
                required
                value={form.domain}
                onChange={(e) => update('domain', e.target.value)}
                placeholder="miclinica.mx"
              />
            </label>
          </div>

          <div className="pp-form__row pp-form__row--2">
            <label className="pp-field">
              <span>Ciudad principal</span>
              <input
                className="pp-input"
                required
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
                placeholder="Ciudad de México"
              />
            </label>

            <label className="pp-field">
              <span>Idioma</span>
              <select
                className="pp-select"
                value={form.language}
                onChange={(e) => update('language', e.target.value as Language)}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="pp-field">
            <span>
              Servicios <span className="pp-field__hint">— sepáralos con comas</span>
            </span>
            <textarea
              className="pp-textarea"
              value={servicesText}
              onChange={(e) => setServicesText(e.target.value)}
              placeholder="Implantes, Ortodoncia, Blanqueamiento"
            />
          </label>

          <div className="pp-form__actions">
            <button className="pp-btn pp-btn--primary" type="submit" disabled={saving}>
              {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear proyecto'}
            </button>
            <Link className="pp-btn pp-btn--ghost" to="/app/seo/proyectos">
              Cancelar
            </Link>
          </div>
        </form>
      </section>
    </>
  );
}
