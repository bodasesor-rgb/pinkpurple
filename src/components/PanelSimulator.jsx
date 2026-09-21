import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { COUNTRIES, statesForCountry } from '../app/config/locations.ts';
import { TONE_OPTIONS } from '../app/config/nexusClientConfig.ts';
import { PUBLISH_PLATFORMS } from '../app/config/publishPlatforms.ts';
import { PLANS } from '../data/plans.js';

const STEPS = [
  { id: 'cuenta', label: '1 · Cuenta Studio' },
  { id: 'marca', label: '2 · Marca' },
  { id: 'contacto', label: '3 · Contacto' },
  { id: 'ubicacion', label: '4 · Ubicación' },
  { id: 'oferta', label: '5 · Oferta SEO' },
  { id: 'publicacion', label: '6 · Publicación' },
  { id: 'chequeos', label: '7 · Chequeos' },
];

const EMPTY = {
  fullName: '',
  email: '',
  company: '',
  password: '',
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

function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function isUrl(v) {
  try {
    const u = new URL(v.trim());
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function slugify(v) {
  return v
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

/** Chequeos literales: cada ítem debe estar completo para “crear” el panel. */
function buildChecks(form) {
  const apiTargets = new Set(['wordpress', 'shopify', 'wix', 'webflow']);
  const cityOptions = form.countryCode ? statesForCountry(form.countryCode) : [];
  const cityOk =
    Boolean(form.stateRegion.trim()) &&
    (cityOptions.length === 0 || cityOptions.includes(form.stateRegion));

  return [
    { id: 'fullName', label: 'Nombre completo', ok: form.fullName.trim().length >= 3 },
    { id: 'email', label: 'Email de cuenta (válido)', ok: isEmail(form.email) },
    { id: 'company', label: 'Empresa / negocio', ok: form.company.trim().length >= 2 },
    {
      id: 'password',
      label: 'Contraseña (mín. 8 caracteres)',
      ok: form.password.trim().length >= 8,
    },
    { id: 'plan', label: 'Plan elegido', ok: Boolean(form.planId) },
    { id: 'brandName', label: 'Nombre de marca', ok: form.brandName.trim().length >= 2 },
    { id: 'tagline', label: 'Tagline / promesa', ok: form.tagline.trim().length >= 8 },
    { id: 'tone', label: 'Tono de voz', ok: Boolean(form.tone) },
    {
      id: 'siteHomeUrl',
      label: 'URL del sitio (https://…)',
      ok: isUrl(form.siteHomeUrl),
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp con código de país',
      ok: /^\+?\d[\d\s-]{8,}$/.test(form.whatsapp.trim()),
    },
    {
      id: 'contactEmail',
      label: 'Email de contacto de marca',
      ok: isEmail(form.contactEmail),
    },
    { id: 'phone', label: 'Teléfono', ok: form.phone.trim().replace(/\D/g, '').length >= 8 },
    { id: 'country', label: 'País', ok: Boolean(form.countryCode) },
    { id: 'city', label: 'Ciudad / división local', ok: cityOk },
    { id: 'address', label: 'Dirección o colonia', ok: form.address.trim().length >= 4 },
    {
      id: 'services',
      label: 'Servicios / oferta',
      ok: form.servicesOffered.trim().length >= 12,
    },
    {
      id: 'ideal',
      label: 'Cliente ideal',
      ok: form.idealClient.trim().length >= 12,
    },
    {
      id: 'keywords',
      label: 'Keywords (al menos 2 frases)',
      ok: form.targetKeywords
        .split(/[,;\n]+/)
        .map((k) => k.trim())
        .filter(Boolean).length >= 2,
    },
    {
      id: 'publishTarget',
      label: 'Plataforma de publicación',
      ok: Boolean(form.publishTarget),
    },
    {
      id: 'publishSlug',
      label: 'Slug de preview',
      ok:
        form.publishTarget !== 'preview' ||
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.publishSlug.trim()),
    },
    {
      id: 'publishSiteUrl',
      label: 'URL de publicación',
      ok:
        form.publishTarget === 'preview' ||
        form.publishTarget === 'hostinger' ||
        form.publishTarget === 'squarespace' ||
        isUrl(form.publishSiteUrl) ||
        (form.publishTarget === 'netlify' &&
          (isUrl(form.publishSiteUrl) || form.netlifySiteId.trim().length >= 4)),
    },
    {
      id: 'publishApiKey',
      label: 'API key / token (si aplica)',
      ok: !apiTargets.has(form.publishTarget) || form.publishApiKey.trim().length >= 8,
    },
    {
      id: 'netlifySiteId',
      label: 'Netlify Site ID (si Netlify)',
      ok:
        form.publishTarget !== 'netlify' ||
        form.netlifySiteId.trim().length >= 4 ||
        isUrl(form.publishSiteUrl),
    },
  ];
}

function Field({ label, required, hint, children }) {
  return (
    <label className="sim-field">
      <span className="sim-field__label">
        {label}
        {required ? <em> *</em> : null}
      </span>
      {children}
      {hint ? <small className="sim-field__hint">{hint}</small> : null}
    </label>
  );
}

export default function PanelSimulator() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const checks = useMemo(() => buildChecks(form), [form]);
  const passed = checks.filter((c) => c.ok).length;
  const allOk = passed === checks.length;
  const cities = form.countryCode ? statesForCountry(form.countryCode) : [];
  const plan = PLANS.find((p) => p.id === form.planId) || PLANS[2];
  const displayBrand = form.brandName.trim() || 'Tu marca';
  const displayUser = form.fullName.trim() || 'Tu nombre';

  function patch(partial) {
    setForm((prev) => {
      const next = { ...prev, ...partial };
      if (partial.brandName != null && !prev.publishSlug.trim()) {
        next.publishSlug = slugify(partial.brandName);
      }
      if (partial.brandName != null && prev.publishSlug === slugify(prev.brandName)) {
        next.publishSlug = slugify(partial.brandName);
      }
      return next;
    });
    setSubmitted(false);
  }

  function goNext() {
    setAttempted(true);
    if (step < STEPS.length - 1) setStep((s) => s + 1);
  }

  function goPrev() {
    setAttempted(false);
    setStep((s) => Math.max(0, s - 1));
  }

  function onCreatePanel(e) {
    e.preventDefault();
    setAttempted(true);
    if (!allOk) {
      setStep(STEPS.length - 1);
      return;
    }
    try {
      localStorage.setItem(
        'pp_studio_simulator_v1',
        JSON.stringify({ ...form, createdAt: new Date().toISOString() }),
      );
      localStorage.setItem(
        'pp_studio_profile_v1:sim',
        JSON.stringify({ fullName: form.fullName, company: form.company }),
      );
    } catch {
      /* ignore */
    }
    setSubmitted(true);
  }

  return (
    <section className="section sim" id="simulador">
      <div className="container">
        <div className="section__intro section__intro--center">
          <p className="eyebrow">Simulador · chequeo</p>
          <h2>Crea el panel escribiendo todo literal.</h2>
          <p>
            Sin atajos: llena cada campo como en el onboarding real. El preview del Studio se arma
            con tus datos y la lista de chequeos marca qué falta antes de “crear” el panel.
          </p>
        </div>

        <div className="sim__layout">
          <div className="sim__main">
            <ol className="sim__steps" aria-label="Pasos del simulador">
              {STEPS.map((s, i) => (
                <li key={s.id}>
                  <button
                    type="button"
                    className={`sim__step${i === step ? ' is-active' : ''}${i < step ? ' is-done' : ''}`}
                    onClick={() => {
                      setStep(i);
                      setAttempted(false);
                    }}
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ol>

            <form className="sim__form" onSubmit={onCreatePanel}>
              {step === 0 ? (
                <div className="sim__card">
                  <h3>Cuenta Pink Purple Studio</h3>
                  <p className="sim__blurb">Datos de acceso al hub (perfil post-login).</p>
                  <div className="sim__grid">
                    <Field label="Nombre completo" required>
                      <input
                        value={form.fullName}
                        onChange={(e) => patch({ fullName: e.target.value })}
                        placeholder="Alex García"
                        autoComplete="name"
                        required
                      />
                    </Field>
                    <Field label="Email de cuenta" required hint="Será el login del panel.">
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => patch({ email: e.target.value })}
                        placeholder="tu@negocio.com"
                        autoComplete="email"
                        required
                      />
                    </Field>
                    <Field label="Empresa" required>
                      <input
                        value={form.company}
                        onChange={(e) => patch({ company: e.target.value })}
                        placeholder="Nombre del negocio"
                        autoComplete="organization"
                        required
                      />
                    </Field>
                    <Field label="Contraseña" required hint="Mínimo 8 caracteres (solo simulación).">
                      <input
                        type="password"
                        value={form.password}
                        onChange={(e) => patch({ password: e.target.value })}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        minLength={8}
                        required
                      />
                    </Field>
                  </div>
                  <fieldset className="sim__plans">
                    <legend>
                      Plan SEO <em>*</em>
                    </legend>
                    <div className="sim__plan-grid">
                      {PLANS.filter((p) => p.id !== 'free').map((p) => (
                        <label
                          key={p.id}
                          className={`sim__plan${form.planId === p.id ? ' is-on' : ''}`}
                        >
                          <input
                            type="radio"
                            name="plan"
                            value={p.id}
                            checked={form.planId === p.id}
                            onChange={() => patch({ planId: p.id })}
                          />
                          <strong>{p.name}</strong>
                          <span>
                            {p.price === 0 ? 'Gratis' : `$${p.price}/mes`} · {p.landings} landings
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>
              ) : null}

              {step === 1 ? (
                <div className="sim__card">
                  <h3>Marca y voz</h3>
                  <p className="sim__blurb">Identidad que verás en el hub y en landings.</p>
                  <div className="sim__grid">
                    <Field label="Nombre de marca" required>
                      <input
                        value={form.brandName}
                        onChange={(e) => patch({ brandName: e.target.value })}
                        placeholder="Estudio Norte"
                        required
                      />
                    </Field>
                    <Field label="Tagline" required>
                      <input
                        value={form.tagline}
                        onChange={(e) => patch({ tagline: e.target.value })}
                        placeholder="Diseño y obra para casas en CDMX"
                        required
                      />
                    </Field>
                    <Field label="URL del sitio" required hint="Incluye https://">
                      <input
                        type="url"
                        value={form.siteHomeUrl}
                        onChange={(e) => patch({ siteHomeUrl: e.target.value })}
                        placeholder="https://tu-negocio.com"
                        required
                      />
                    </Field>
                  </div>
                  <fieldset className="sim__tones">
                    <legend>
                      Tono de voz <em>*</em>
                    </legend>
                    <div className="sim__tone-grid">
                      {TONE_OPTIONS.map((opt) => (
                        <label
                          key={opt.id}
                          className={`sim__tone${form.tone === opt.id ? ' is-on' : ''}`}
                        >
                          <input
                            type="radio"
                            name="tone"
                            checked={form.tone === opt.id}
                            onChange={() => patch({ tone: opt.id })}
                          />
                          <strong>{opt.label}</strong>
                          <span>{opt.hint}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="sim__card">
                  <h3>Contacto</h3>
                  <p className="sim__blurb">CTAs, footer y botón flotante del panel de marca.</p>
                  <div className="sim__grid">
                    <Field label="WhatsApp" required hint="+52 …">
                      <input
                        value={form.whatsapp}
                        onChange={(e) => patch({ whatsapp: e.target.value })}
                        placeholder="+52 55 1234 5678"
                        required
                      />
                    </Field>
                    <Field label="Email de contacto" required>
                      <input
                        type="email"
                        value={form.contactEmail}
                        onChange={(e) => patch({ contactEmail: e.target.value })}
                        placeholder="hola@tu-marca.com"
                        required
                      />
                    </Field>
                    <Field label="Teléfono" required>
                      <input
                        value={form.phone}
                        onChange={(e) => patch({ phone: e.target.value })}
                        placeholder="55 1234 5678"
                        required
                      />
                    </Field>
                  </div>
                </div>
              ) : null}

              {step === 3 ? (
                <div className="sim__card">
                  <h3>Ubicación</h3>
                  <p className="sim__blurb">SEO local: país + ciudad obligatorios.</p>
                  <div className="sim__grid">
                    <Field label="País" required>
                      <select
                        value={form.countryCode}
                        onChange={(e) =>
                          patch({ countryCode: e.target.value, stateRegion: '' })
                        }
                        required
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Ciudad" required>
                      {cities.length ? (
                        <select
                          value={form.stateRegion}
                          onChange={(e) => patch({ stateRegion: e.target.value })}
                          required
                        >
                          <option value="">Elige ciudad…</option>
                          {cities.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          value={form.stateRegion}
                          onChange={(e) => patch({ stateRegion: e.target.value })}
                          placeholder="Ciudad"
                          required
                        />
                      )}
                    </Field>
                    <Field label="Dirección / colonia" required>
                      <input
                        value={form.address}
                        onChange={(e) => patch({ address: e.target.value })}
                        placeholder="Col. Roma Norte"
                        required
                      />
                    </Field>
                  </div>
                </div>
              ) : null}

              {step === 4 ? (
                <div className="sim__card">
                  <h3>Oferta y keywords</h3>
                  <p className="sim__blurb">Alimentan H1, secciones, FAQ y generación SEO.</p>
                  <Field label="Servicios / oferta" required>
                    <textarea
                      rows={3}
                      value={form.servicesOffered}
                      onChange={(e) => patch({ servicesOffered: e.target.value })}
                      placeholder="Diseño interior, remodelación, asesoría…"
                      required
                    />
                  </Field>
                  <Field label="Cliente ideal" required>
                    <textarea
                      rows={3}
                      value={form.idealClient}
                      onChange={(e) => patch({ idealClient: e.target.value })}
                      placeholder="Familias que buscan remodelar casa o depto…"
                      required
                    />
                  </Field>
                  <Field
                    label="Keywords"
                    required
                    hint="Separa con comas. Mínimo 2 frases."
                  >
                    <textarea
                      rows={2}
                      value={form.targetKeywords}
                      onChange={(e) => patch({ targetKeywords: e.target.value })}
                      placeholder="remodelación residencial, diseño interior CDMX"
                      required
                    />
                  </Field>
                </div>
              ) : null}

              {step === 5 ? (
                <div className="sim__card">
                  <h3>Dónde publica</h3>
                  <p className="sim__blurb">Elige plataforma y completa los campos que pide.</p>
                  <div className="sim__publish-list">
                    {PUBLISH_PLATFORMS.map((opt) => (
                      <label
                        key={opt.id}
                        className={`sim__publish${form.publishTarget === opt.id ? ' is-on' : ''}`}
                      >
                        <input
                          type="radio"
                          name="publish"
                          checked={form.publishTarget === opt.id}
                          onChange={() => patch({ publishTarget: opt.id })}
                        />
                        <strong>{opt.label}</strong>
                        <span>{opt.hint}</span>
                      </label>
                    ))}
                  </div>
                  {form.publishTarget === 'preview' ? (
                    <Field label="Slug de preview" required hint="tu-marca.pinkpurple.site">
                      <input
                        value={form.publishSlug}
                        onChange={(e) =>
                          patch({
                            publishSlug: e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9-]/g, ''),
                          })
                        }
                        placeholder="tu-marca"
                        required
                      />
                    </Field>
                  ) : null}
                  {form.publishTarget === 'netlify' ? (
                    <div className="sim__grid">
                      <Field label="Netlify Site ID" required>
                        <input
                          value={form.netlifySiteId}
                          onChange={(e) => patch({ netlifySiteId: e.target.value })}
                          placeholder="abc123-site-id"
                        />
                      </Field>
                      <Field label="URL Netlify" hint="Opcional si ya pusiste Site ID">
                        <input
                          type="url"
                          value={form.publishSiteUrl}
                          onChange={(e) => patch({ publishSiteUrl: e.target.value })}
                          placeholder="https://tu-sitio.netlify.app"
                        />
                      </Field>
                    </div>
                  ) : null}
                  {['wordpress', 'shopify', 'wix', 'webflow'].includes(form.publishTarget) ? (
                    <div className="sim__grid">
                      <Field label="URL del sitio" required>
                        <input
                          type="url"
                          value={form.publishSiteUrl}
                          onChange={(e) => patch({ publishSiteUrl: e.target.value })}
                          placeholder="https://tu-sitio.com"
                          required
                        />
                      </Field>
                      <Field label="API key / token" required>
                        <input
                          value={form.publishApiKey}
                          onChange={(e) => patch({ publishApiKey: e.target.value })}
                          placeholder="Pega el token aquí"
                          required
                        />
                      </Field>
                    </div>
                  ) : null}
                  {['hostinger', 'squarespace', 'other'].includes(form.publishTarget) ? (
                    <Field label="URL del sitio" required>
                      <input
                        type="url"
                        value={form.publishSiteUrl}
                        onChange={(e) => patch({ publishSiteUrl: e.target.value })}
                        placeholder="https://tu-sitio.com"
                        required
                      />
                    </Field>
                  ) : null}
                </div>
              ) : null}

              {step === 6 ? (
                <div className="sim__card">
                  <h3>Chequeos antes de crear el panel</h3>
                  <p className="sim__blurb">
                    {passed} / {checks.length} listos. Todos deben ir en verde.
                  </p>
                  <ul className="sim__checks" aria-live="polite">
                    {checks.map((c) => (
                      <li key={c.id} className={c.ok ? 'is-ok' : 'is-miss'}>
                        <span aria-hidden="true">{c.ok ? '✓' : '○'}</span>
                        {c.label}
                      </li>
                    ))}
                  </ul>
                  {attempted && !allOk ? (
                    <p className="sim__error" role="alert">
                      Faltan campos. Vuelve a los pasos anteriores y completa todo literalmente.
                    </p>
                  ) : null}
                  {submitted && allOk ? (
                    <div className="sim__success">
                      <p>
                        Panel simulado listo para <strong>{displayBrand}</strong> · plan{' '}
                        <strong>{plan.name}</strong>.
                      </p>
                      <div className="sim__success-actions">
                        <Link className="btn btn-primary" to="/app">
                          Abrir panel Studio
                        </Link>
                        <Link className="btn btn-ghost" to="/configuracion-nexus">
                          Ver Config Nexus completa
                        </Link>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="sim__nav">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={goPrev}
                  disabled={step === 0}
                >
                  Atrás
                </button>
                {step < STEPS.length - 1 ? (
                  <button type="button" className="btn btn-primary" onClick={goNext}>
                    Siguiente
                  </button>
                ) : (
                  <button type="submit" className="btn btn-primary">
                    {allOk ? 'Crear panel (simulación)' : 'Revisar chequeos'}
                  </button>
                )}
              </div>
            </form>
          </div>

          <aside className="sim__preview" aria-label="Vista previa del panel Studio">
            <div className="sim__preview-head">
              <p className="eyebrow">Preview en vivo</p>
              <h3>Así se arma tu Studio</h3>
              <p className="sim__progress">
                Chequeos <strong>{passed}</strong>/{checks.length}
              </p>
              <div className="sim__meter" aria-hidden="true">
                <span style={{ width: `${(passed / checks.length) * 100}%` }} />
              </div>
            </div>

            <div className="sim-panel">
              <header className="sim-panel__top">
                <div className="sim-panel__brand">
                  <strong>Pink Purple</strong>
                  <em>Studio</em>
                </div>
                <span className="sim-panel__user">{displayUser}</span>
              </header>
              <div className="sim-panel__body">
                <nav className="sim-panel__side" aria-hidden="true">
                  <span className="is-active">◎ Perfil</span>
                  <span>✦ Pink Purple SEO</span>
                  <span className="sim-panel__child">Proyectos</span>
                  <span className="sim-panel__child">Generar</span>
                  <span className="sim-panel__child">Historial</span>
                  <span className="sim-panel__child">Conexiones</span>
                  <span>⚙ Configuración</span>
                  <span className="sim-panel__soon">◈ Ads · pronto</span>
                </nav>
                <div className="sim-panel__content">
                  <p className="sim-panel__kicker">Hola, {displayUser.split(' ')[0]}</p>
                  <h4>{displayBrand}</h4>
                  <p className="sim-panel__meta">
                    {form.company || 'Empresa'} · {plan.name}
                    {form.stateRegion ? ` · ${form.stateRegion}` : ''}
                  </p>
                  <p className="sim-panel__tag">
                    {form.tagline || 'Tu tagline aparecerá aquí cuando lo escribas.'}
                  </p>
                  <div className="sim-panel__cards">
                    <div>
                      <strong>SEO</strong>
                      <span>{form.servicesOffered ? 'Oferta lista' : 'Falta oferta'}</span>
                    </div>
                    <div>
                      <strong>Publicación</strong>
                      <span>
                        {PUBLISH_PLATFORMS.find((p) => p.id === form.publishTarget)?.label ||
                          '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <ul className="sim__mini-checks">
              {checks.slice(0, 8).map((c) => (
                <li key={c.id} className={c.ok ? 'is-ok' : ''}>
                  {c.ok ? '✓' : '·'} {c.label}
                </li>
              ))}
              {checks.length > 8 ? (
                <li className={allOk ? 'is-ok' : ''}>
                  {allOk ? '✓' : '·'} +{checks.length - 8} chequeos más…
                </li>
              ) : null}
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}
