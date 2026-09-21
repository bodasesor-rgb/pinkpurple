import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { account, jobs as jobsApi } from '../../api/client';
import { EmptyState, ErrorState, SkeletonRows } from '../../components/states/States';
import { useAsync } from '../../hooks/useAsync';
import { useAuth } from '../../auth/AuthContext';
import { loadDemoConfig } from '../../auth/demoSession';
import { JobStatusBadge, UsageMeter, formatDateTime } from '../shared/ui';

const PROFILE_LS_KEY = 'pp_studio_profile_v1';

type LocalProfile = {
  fullName: string;
  company: string;
};

function loadLocalProfile(userId: string | undefined): LocalProfile {
  try {
    const raw = localStorage.getItem(`${PROFILE_LS_KEY}:${userId || 'anon'}`);
    if (!raw) return { fullName: '', company: '' };
    const parsed = JSON.parse(raw) as Partial<LocalProfile>;
    return {
      fullName: String(parsed.fullName || ''),
      company: String(parsed.company || ''),
    };
  } catch {
    return { fullName: '', company: '' };
  }
}

function saveLocalProfile(userId: string | undefined, data: LocalProfile) {
  localStorage.setItem(`${PROFILE_LS_KEY}:${userId || 'anon'}`, JSON.stringify(data));
}

export default function ProfilePage() {
  const { user, isDemo, deleteDemoCompany } = useAuth();
  const navigate = useNavigate();
  const demo = isDemo ? loadDemoConfig() : null;
  const usage = useAsync((signal) => account.usage(signal), []);
  const recent = useAsync((signal) => jobsApi.list({ pageSize: 5 }, signal), []);

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [company, setCompany] = useState('');
  const [savedNote, setSavedNote] = useState('');

  useEffect(() => {
    const local = loadLocalProfile(user?.id);
    setFullName(local.fullName || user?.fullName || '');
    setCompany(local.company || demo?.company || '');
  }, [user?.id, user?.fullName, demo?.company]);

  function onSaveProfile(e: FormEvent) {
    e.preventDefault();
    saveLocalProfile(user?.id, {
      fullName: fullName.trim(),
      company: company.trim(),
    });
    setSavedNote('Guardado en este dispositivo. La sync con servidor llega con la API de cuenta.');
  }

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

  const displayName = fullName.trim() || user?.fullName?.split(' ')[0] || 'Hola';

  return (
    <>
      {isDemo ? (
        <div className="pp-demo-banner" role="status">
          <p>
            Empresa de prueba — mismo panel que un usuario real. Puedes crear/editar proyectos y
            borrarlos.
          </p>
          <button type="button" className="pp-btn pp-btn--danger pp-btn--sm" onClick={onDeleteCompany}>
            Borrar empresa
          </button>
        </div>
      ) : null}

      <div className="pp-page-head">
        <div>
          <h1>Hola, {displayName.split(' ')[0]}</h1>
          <p>
            {demo?.brandName
              ? `Hub de ${demo.brandName}. Abre SEO → Proyectos para ver el sitio que acabas de crear.`
              : 'Tu hub en Pink Purple Studio. Elige una herramienta o revisa tu plan.'}
          </p>
        </div>
        {isDemo ? (
          <Link className="pp-btn pp-btn--primary" to="/app/seo/proyectos">
            Ver proyectos
          </Link>
        ) : null}
      </div>

      <div className="pp-grid pp-grid--profile">
        <section className="pp-card" aria-labelledby="perfil-datos">
          <h2 className="pp-card__title" id="perfil-datos">
            Tu perfil
          </h2>
          <form className="pp-form" onSubmit={onSaveProfile}>
            <label className="pp-field">
              <span className="pp-field__label">Nombre</span>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Tu nombre"
                autoComplete="name"
              />
            </label>
            <label className="pp-field">
              <span className="pp-field__label">Email</span>
              <input type="email" value={user?.email || ''} readOnly disabled />
              <small className="pp-field__hint">El correo de la cuenta no se edita aquí.</small>
            </label>
            <label className="pp-field">
              <span className="pp-field__label">Empresa</span>
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Nombre de tu negocio"
                autoComplete="organization"
              />
            </label>
            <button type="submit" className="pp-btn pp-btn--primary">
              Guardar cambios
            </button>
            {savedNote ? <p className="pp-field__hint">{savedNote}</p> : null}
          </form>
        </section>

        <section className="pp-card" aria-labelledby="perfil-plan">
          <h2 className="pp-card__title" id="perfil-plan">
            Plan y uso
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
                <UsageMeter label="Landings" counter={usage.data.landings} />
                <UsageMeter label="Blogs" counter={usage.data.blogs} />
                <UsageMeter label="Sitios" counter={usage.data.sites} />
              </div>
              <Link className="pp-link" to="/app/configuracion/plan" style={{ marginTop: '0.85rem', display: 'inline-block' }}>
                Ver plan y facturación
              </Link>
            </>
          ) : null}
        </section>
      </div>

      <section className="pp-card" style={{ marginTop: '1rem' }} aria-labelledby="herramientas">
        <h2 className="pp-card__title" id="herramientas">
          Herramientas
        </h2>
        <div className="pp-tool-cards">
          <Link className="pp-tool-card" to="/app/seo/proyectos">
            <span className="pp-tool-card__icon" aria-hidden="true">
              ✦
            </span>
            <strong>Pink Purple SEO</strong>
            <p>Landings, blogs y publicación con el motor Nexus.</p>
            <span className="pp-tool-card__cta">Abrir herramienta</span>
          </Link>
          <div className="pp-tool-card pp-tool-card--soon" aria-disabled="true">
            <span className="pp-tool-card__icon" aria-hidden="true">
              ◈
            </span>
            <strong>Pink Purple Ads</strong>
            <p>Próximamente en Studio.</p>
            <span className="pp-tool-card__cta">Pronto</span>
          </div>
        </div>
      </section>

      <section className="pp-card" style={{ marginTop: '1rem' }} aria-labelledby="ultimos-trabajos">
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
            description="Abre Pink Purple SEO, crea un proyecto y genera tu primera landing o blog."
            action={
              <Link className="pp-btn pp-btn--primary" to="/app/seo/proyectos/nuevo">
                Ir a Proyectos
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
    </>
  );
}
