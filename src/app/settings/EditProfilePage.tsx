import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { COUNTRIES, statesForCountry } from '../config/locations';
import { TONE_OPTIONS } from '../config/nexusClientConfig';
import { PUBLISH_PLATFORMS } from '../config/publishPlatforms';
import { useAuth } from '../../auth/AuthContext';
import {
  buildNexusPayload,
  loadDemoConfig,
  updateDemoConfig,
  type DemoConfig,
} from '../../auth/demoSession';

const EMPTY: DemoConfig = {
  fullName: '',
  email: '',
  company: '',
  planId: 'starter',
  brandName: '',
  tagline: '',
  tone: 'cercano',
  siteHomeUrl: '',
  whatsapp: '',
  contactEmail: '',
  phone: '',
  countryCode: 'MX',
  stateRegion: '',
  address: '',
  servicesOffered: '',
  idealClient: '',
  targetKeywords: '',
  publishTarget: 'preview',
  publishSlug: '',
  publishSiteUrl: '',
  publishApiKey: '',
  netlifySiteId: '',
};

export default function EditProfilePage() {
  const { user, isDemo } = useAuth();
  const [form, setForm] = useState<DemoConfig>(EMPTY);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const demo = loadDemoConfig();
    if (demo) {
      setForm({ ...EMPTY, ...demo });
      return;
    }
    setForm({
      ...EMPTY,
      fullName: user?.fullName || '',
      email: user?.email || '',
      planId: user?.planId || 'starter',
    });
  }, [user?.id, user?.fullName, user?.email, user?.planId]);

  const cities = form.countryCode ? statesForCountry(form.countryCode) : [];

  function patch<K extends keyof DemoConfig>(key: K, value: DemoConfig[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setNote('');
    setError('');
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (form.brandName.trim().length < 2) {
      setError('El nombre de marca es obligatorio.');
      return;
    }
    if (!form.whatsapp.trim()) {
      setError('WhatsApp es obligatorio.');
      return;
    }
    try {
      if (isDemo) {
        updateDemoConfig({
          ...form,
          nexusPayload: buildNexusPayload(form),
        });
        setNote('Perfil y datos de marca guardados. El payload Nexus se actualizó en este navegador.');
      } else {
        localStorage.setItem(
          `pp_studio_profile_v1:${user?.id || 'anon'}`,
          JSON.stringify({ fullName: form.fullName, company: form.company || form.brandName }),
        );
        localStorage.setItem(
          `pp_studio_onboarding_v1:${user?.id || 'anon'}`,
          JSON.stringify(buildNexusPayload(form)),
        );
        setNote('Guardado localmente. Cuando la API de cuenta esté lista se sincroniza con Nexus.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar.');
    }
  }

  return (
    <>
      <div className="pp-page-head">
        <div>
          <h1>Editar perfil</h1>
          <p>Cuenta y los mismos datos que llenaste al darte de alta / onboarding.</p>
        </div>
        <Link className="pp-btn pp-btn--ghost" to="/app/configuracion">
          Volver
        </Link>
      </div>

      <form className="pp-form" onSubmit={onSubmit}>
        <section className="pp-card">
          <h2 className="pp-card__title">Cuenta</h2>
          <label className="pp-field">
            <span className="pp-field__label">Nombre</span>
            <input value={form.fullName} onChange={(e) => patch('fullName', e.target.value)} />
          </label>
          <label className="pp-field">
            <span className="pp-field__label">Email</span>
            <input type="email" value={form.email} onChange={(e) => patch('email', e.target.value)} />
          </label>
          <label className="pp-field">
            <span className="pp-field__label">Empresa</span>
            <input value={form.company} onChange={(e) => patch('company', e.target.value)} />
          </label>
        </section>

        <section className="pp-card" style={{ marginTop: '1rem' }}>
          <h2 className="pp-card__title">Marca (onboarding)</h2>
          <label className="pp-field">
            <span className="pp-field__label">Nombre de marca</span>
            <input value={form.brandName} onChange={(e) => patch('brandName', e.target.value)} required />
          </label>
          <label className="pp-field">
            <span className="pp-field__label">Tagline</span>
            <input value={form.tagline} onChange={(e) => patch('tagline', e.target.value)} />
          </label>
          <label className="pp-field">
            <span className="pp-field__label">URL del sitio</span>
            <input
              type="url"
              value={form.siteHomeUrl}
              onChange={(e) => patch('siteHomeUrl', e.target.value)}
            />
          </label>
          <fieldset className="pp-field">
            <span className="pp-field__label">Tono</span>
            <div className="pp-chips" style={{ marginTop: '0.45rem' }}>
              {TONE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`pp-chip${form.tone === opt.id ? ' is-on' : ''}`}
                  onClick={() => patch('tone', opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </fieldset>
        </section>

        <section className="pp-card" style={{ marginTop: '1rem' }}>
          <h2 className="pp-card__title">Contacto y ubicación</h2>
          <label className="pp-field">
            <span className="pp-field__label">WhatsApp</span>
            <input value={form.whatsapp} onChange={(e) => patch('whatsapp', e.target.value)} required />
          </label>
          <label className="pp-field">
            <span className="pp-field__label">Email de contacto</span>
            <input
              type="email"
              value={form.contactEmail}
              onChange={(e) => patch('contactEmail', e.target.value)}
            />
          </label>
          <label className="pp-field">
            <span className="pp-field__label">Teléfono</span>
            <input value={form.phone} onChange={(e) => patch('phone', e.target.value)} />
          </label>
          <label className="pp-field">
            <span className="pp-field__label">País</span>
            <select
              value={form.countryCode}
              onChange={(e) => patch('countryCode', e.target.value)}
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="pp-field">
            <span className="pp-field__label">Ciudad</span>
            {cities.length ? (
              <select value={form.stateRegion} onChange={(e) => patch('stateRegion', e.target.value)}>
                <option value="">Elige…</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            ) : (
              <input value={form.stateRegion} onChange={(e) => patch('stateRegion', e.target.value)} />
            )}
          </label>
          <label className="pp-field">
            <span className="pp-field__label">Dirección</span>
            <input value={form.address} onChange={(e) => patch('address', e.target.value)} />
          </label>
        </section>

        <section className="pp-card" style={{ marginTop: '1rem' }}>
          <h2 className="pp-card__title">Oferta y publicación</h2>
          <label className="pp-field">
            <span className="pp-field__label">Servicios</span>
            <textarea
              rows={3}
              value={form.servicesOffered}
              onChange={(e) => patch('servicesOffered', e.target.value)}
            />
          </label>
          <label className="pp-field">
            <span className="pp-field__label">Cliente ideal</span>
            <textarea
              rows={3}
              value={form.idealClient}
              onChange={(e) => patch('idealClient', e.target.value)}
            />
          </label>
          <label className="pp-field">
            <span className="pp-field__label">Keywords</span>
            <textarea
              rows={2}
              value={form.targetKeywords}
              onChange={(e) => patch('targetKeywords', e.target.value)}
            />
          </label>
          <label className="pp-field">
            <span className="pp-field__label">Plataforma</span>
            <select
              value={form.publishTarget}
              onChange={(e) => patch('publishTarget', e.target.value)}
            >
              {PUBLISH_PLATFORMS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
        </section>

        {error ? (
          <p className="pp-alert pp-alert--error" role="alert">
            {error}
          </p>
        ) : null}
        {note ? <p className="pp-alert pp-alert--info">{note}</p> : null}

        <div className="pp-item__actions" style={{ marginTop: '1rem' }}>
          <button type="submit" className="pp-btn pp-btn--primary">
            Guardar cambios
          </button>
        </div>
      </form>
    </>
  );
}
