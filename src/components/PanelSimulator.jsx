import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { COUNTRIES, statesForCountry } from '../app/config/locations.ts';
import { TONE_OPTIONS } from '../app/config/nexusClientConfig.ts';
import { PUBLISH_PLATFORMS } from '../app/config/publishPlatforms.ts';
import { useAuth } from '../auth/AuthContext.tsx';
import { PLANS } from '../data/plans.js';

/**
 * Mismos pasos que el flujo real:
 * plan (/productos/seo → /pago) → cuenta (/registro) → onboarding 8 pasos → panel (/app)
 * Fuente: frontend/views/onboarding/index.html + RegisterPage
 */
const STEPS = [
  { id: 'plan', title: 'Plan', blurb: 'Elige el plan como en /productos/seo → /pago.' },
  { id: 'cuenta', title: 'Crear cuenta', blurb: 'Los mismos campos que /registro.' },
  { id: 'url', title: '1 · Sitio web', blurb: 'Si aún no tienes sitio, déjalo vacío y sigue.' },
  { id: 'brand', title: '2 · Marca y voz', blurb: 'Identidad que verá el cliente en landings, blogs y panel.' },
  { id: 'contact', title: '3 · Contacto', blurb: 'WhatsApp obligatorio. Correo y teléfono extra si los necesitas.' },
  { id: 'geo', title: '4 · Ubicación', blurb: 'País y ciudad para SEO local.' },
  { id: 'offer', title: '5 · Oferta', blurb: 'Qué ofreces y a quién le hablas.' },
  { id: 'keywords', title: '6 · Keywords', blurb: 'Frases de búsqueda; puedes dejarlas y seguir.' },
  { id: 'publish', title: '7 · Dónde publica', blurb: 'Misma lista de plataformas que el onboarding real.' },
  { id: 'social', title: '8 · Redes (opcional)', blurb: 'Agrega las que uses.' },
];

const EMPTY = {
  planId: 'starter',
  billing: 'monthly',
  fullName: '',
  email: '',
  password: '',
  siteHomeUrl: '',
  brandName: '',
  tagline: '',
  tone: 'cercano',
  whatsapp: '',
  contactEmail: '',
  phone: '',
  countryCode: 'MX',
  cityFocus: '',
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
  socialInstagram: '',
  socialFacebook: '',
  socialTiktok: '',
  socialLinkedin: '',
};

function isEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim());
}

function slugify(v) {
  return String(v || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
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

/** Validación por paso — misma lógica que onboarding/index.html + registro. */
function validateStep(step, form) {
  if (step === 0) {
    if (!form.planId) return 'Elige un plan';
  }
  if (step === 1) {
    if (form.fullName.trim().length < 2) return 'Indica tu nombre';
    if (!isEmail(form.email)) return 'Correo inválido';
    if (form.password.trim().length < 8) return 'La contraseña necesita al menos 8 caracteres';
  }
  if (step === 3) {
    if (form.brandName.trim().length < 2) return 'Indica el nombre de tu marca';
    if (!form.tone) return 'Elige un tono de voz';
  }
  if (step === 4) {
    if (!form.whatsapp.trim()) return 'WhatsApp es obligatorio (con código de país)';
    if (!/^\+?\d[\d\s()-]{8,}$/.test(form.whatsapp.trim())) {
      return 'WhatsApp inválido. Ej: +52 55 1234 5678';
    }
    if (form.contactEmail.trim() && !isEmail(form.contactEmail)) {
      return 'Correo de contacto inválido';
    }
  }
  if (step === 5) {
    if (form.cityFocus.trim().length < 2) return 'La ciudad es obligatoria';
    if (!form.countryCode) return 'Elige un país';
  }
  if (step === 6) {
    if (form.servicesOffered.trim().length < 8) return 'Describe qué ofreces (unas líneas)';
    if (form.idealClient.trim().length < 8) return 'Describe tu cliente ideal';
  }
  if (step === 8) {
    const own = form.publishTarget !== 'preview';
    if (own && !form.siteHomeUrl.trim() && !form.publishSiteUrl.trim()) {
      return 'Indica la URL de tu sitio';
    }
    if (form.publishTarget === 'preview' && !form.publishSlug.trim() && form.brandName.trim()) {
      /* slug se autocompleta al terminar */
    }
    if (['wordpress', 'shopify', 'wix', 'webflow'].includes(form.publishTarget)) {
      if (!form.publishSiteUrl.trim() && !form.siteHomeUrl.trim()) return 'Indica la URL del sitio';
      if (form.publishApiKey.trim().length < 6) return 'Pega la API key / token';
    }
    if (form.publishTarget === 'netlify') {
      if (!form.netlifySiteId.trim() && !form.publishSiteUrl.trim() && !form.siteHomeUrl.trim()) {
        return 'Indica Site ID o URL Netlify';
      }
    }
  }
  return '';
}

export default function PanelSimulator() {
  const navigate = useNavigate();
  const { enterDemoFromSimulator } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(EMPTY);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [scanNote, setScanNote] = useState('');

  const plan = PLANS.find((p) => p.id === form.planId) || PLANS[2];
  const cities = form.countryCode ? statesForCountry(form.countryCode) : [];
  const progress = useMemo(() => ((step + 1) / STEPS.length) * 100, [step]);

  function patch(partial) {
    setForm((prev) => {
      const next = { ...prev, ...partial };
      if (partial.brandName != null) {
        const prevSlug = slugify(prev.brandName);
        if (!prev.publishSlug || prev.publishSlug === prevSlug) {
          next.publishSlug = slugify(partial.brandName);
        }
      }
      return next;
    });
    setErr('');
  }

  async function runScan() {
    const url = form.siteHomeUrl.trim();
    if (!url) {
      setStep(3);
      return;
    }
    setBusy(true);
    setScanNote('Analizando tu sitio…');
    setErr('');
    try {
      const res = await fetch('/api/site-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json().catch(() => ({}));
      if (data && typeof data === 'object') {
        patch({
          brandName: data.brandName || form.brandName,
          tagline: data.tagline || form.tagline,
          whatsapp: data.whatsapp || form.whatsapp,
          contactEmail: data.contactEmail || form.contactEmail,
          phone: data.phone || form.phone,
          cityFocus: data.city || data.stateRegion || form.cityFocus,
          stateRegion: data.stateRegion || form.stateRegion,
          countryCode: data.countryCode || form.countryCode,
          address: data.address || form.address,
          servicesOffered: data.servicesOffered || form.servicesOffered,
          idealClient: data.idealClient || form.idealClient,
          targetKeywords: Array.isArray(data.keywords)
            ? data.keywords.join(', ')
            : form.targetKeywords,
          siteHomeUrl: data.url || url,
          tone: data.tone || form.tone,
          socialInstagram: data.social?.instagram || form.socialInstagram,
          socialFacebook: data.social?.facebook || form.socialFacebook,
        });
      }
      if (!res.ok && data?.error) setScanNote(String(data.error));
      else setScanNote('Escaneo listo — revisa y corrige lo que haga falta.');
    } catch {
      setScanNote('No se pudo escanear; continúa a mano (igual que el onboarding real).');
    } finally {
      setBusy(false);
      setStep(3);
    }
  }

  async function onNext() {
    const v = validateStep(step, form);
    if (v) {
      setErr(v);
      return;
    }
    if (step === 2) {
      await runScan();
      return;
    }
    if (step >= STEPS.length - 1) {
      await onFinish();
      return;
    }
    setStep((s) => s + 1);
  }

  function onBack() {
    setErr('');
    setStep((s) => Math.max(0, s - 1));
  }

  async function onFinish() {
    const v = validateStep(step, form);
    if (v) {
      setErr(v);
      return;
    }
    // Revalida pasos críticos del onboarding real
    for (const s of [1, 3, 4, 5, 6, 8]) {
      const msg = validateStep(s, form);
      if (msg) {
        setErr(msg);
        setStep(s);
        return;
      }
    }
    setBusy(true);
    try {
      const city = form.cityFocus.trim() || form.stateRegion.trim();
      enterDemoFromSimulator({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        company: form.brandName.trim() || form.fullName.trim(),
        password: form.password,
        planId: form.planId,
        brandName: form.brandName.trim(),
        tagline: form.tagline.trim(),
        tone: form.tone,
        siteHomeUrl: form.siteHomeUrl.trim() || form.publishSiteUrl.trim(),
        whatsapp: form.whatsapp.trim(),
        contactEmail: form.contactEmail.trim() || form.email.trim(),
        phone: form.phone.trim(),
        countryCode: form.countryCode,
        stateRegion: city,
        address: form.address.trim(),
        servicesOffered: form.servicesOffered.trim(),
        idealClient: form.idealClient.trim(),
        targetKeywords: form.targetKeywords.trim(),
        publishTarget: form.publishTarget,
        publishSlug: form.publishSlug.trim() || slugify(form.brandName),
        publishSiteUrl: form.publishSiteUrl.trim() || form.siteHomeUrl.trim(),
        publishApiKey: form.publishApiKey,
        netlifySiteId: form.netlifySiteId,
        createdAt: new Date().toISOString(),
      });
      // Mismo destino que onboarding real: panel hub
      navigate('/app', { replace: true });
    } finally {
      setBusy(false);
    }
  }

  const current = STEPS[step];

  return (
    <section className="section sim" id="simulador">
      <div className="container">
        <div className="section__intro section__intro--center">
          <p className="eyebrow">Simulador · flujo real</p>
          <h2>Los mismos pasos que un cliente nuevo.</h2>
          <p>
            Plan → registro → onboarding de marca (8 pasos) → panel Studio. Puedes borrar la
            empresa de prueba cuando quieras.
          </p>
        </div>

        <div className="sim__layout sim__layout--single">
          <div className="sim__main">
            <div className="sim__dots" aria-hidden="true">
              {STEPS.map((s, i) => (
                <span
                  key={s.id}
                  className={`sim__dot${i === step ? ' is-on' : ''}${i < step ? ' is-done' : ''}`}
                />
              ))}
            </div>
            <p className="sim__progress-label">
              Paso {step + 1} de {STEPS.length} · {Math.round(progress)}%
            </p>

            <div className="sim__card">
              <h3>{current.title}</h3>
              <p className="sim__blurb">{current.blurb}</p>

              {step === 0 ? (
                <div className="sim__plan-grid">
                  {PLANS.map((p) => (
                    <label
                      key={p.id}
                      className={`sim__plan${form.planId === p.id ? ' is-on' : ''}`}
                    >
                      <input
                        type="radio"
                        name="plan"
                        checked={form.planId === p.id}
                        onChange={() => patch({ planId: p.id })}
                      />
                      <strong>{p.name}</strong>
                      <span>
                        {p.price === 0 ? 'Prueba' : `$${p.price}/mes`} · {p.landings} landings
                      </span>
                    </label>
                  ))}
                </div>
              ) : null}

              {step === 1 ? (
                <div className="sim__grid">
                  <Field label="Nombre" required>
                    <input
                      value={form.fullName}
                      onChange={(e) => patch({ fullName: e.target.value })}
                      placeholder="Tu nombre"
                      autoComplete="name"
                    />
                  </Field>
                  <Field label="Correo" required>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => patch({ email: e.target.value })}
                      placeholder="tu@correo.com"
                      autoComplete="email"
                    />
                  </Field>
                  <Field label="Contraseña" required hint="Mínimo 8 caracteres (igual que /registro).">
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => patch({ password: e.target.value })}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      minLength={8}
                    />
                  </Field>
                  <p className="sim__blurb">
                    Plan seleccionado: <strong>{plan.name}</strong> (como si vinieras de{' '}
                    <code>/pago?plan={form.planId}</code>).
                  </p>
                </div>
              ) : null}

              {step === 2 ? (
                <div className="sim__grid">
                  <Field label="URL de tu página" hint="Opcional. Si la pegas, intentamos escanear como el onboarding real.">
                    <input
                      type="url"
                      value={form.siteHomeUrl}
                      onChange={(e) => patch({ siteHomeUrl: e.target.value })}
                      placeholder="https://tu-negocio.com"
                    />
                  </Field>
                  {scanNote || busy ? <p className="sim__scan">{busy ? 'Analizando tu sitio…' : scanNote}</p> : null}
                </div>
              ) : null}

              {step === 3 ? (
                <>
                  <div className="sim__grid">
                    <Field label="Nombre de marca" required>
                      <input
                        value={form.brandName}
                        onChange={(e) => patch({ brandName: e.target.value })}
                        placeholder="Tu marca"
                      />
                    </Field>
                    <Field label="Tagline (opcional)">
                      <input
                        value={form.tagline}
                        onChange={(e) => patch({ tagline: e.target.value })}
                        placeholder="Tu promesa en una frase"
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
                </>
              ) : null}

              {step === 4 ? (
                <div className="sim__grid">
                  <Field label="WhatsApp" required hint="+52 …">
                    <input
                      type="tel"
                      value={form.whatsapp}
                      onChange={(e) => patch({ whatsapp: e.target.value })}
                      placeholder="+52 55 1234 5678"
                    />
                  </Field>
                  <Field label="Correo de contacto">
                    <input
                      type="email"
                      value={form.contactEmail}
                      onChange={(e) => patch({ contactEmail: e.target.value })}
                      placeholder="hola@tu-negocio.com"
                    />
                  </Field>
                  <Field label="Teléfono extra (opcional)">
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => patch({ phone: e.target.value })}
                      placeholder="+52 55 0000 0000"
                    />
                  </Field>
                </div>
              ) : null}

              {step === 5 ? (
                <div className="sim__grid">
                  <Field label="País" required>
                    <select
                      value={form.countryCode}
                      onChange={(e) => patch({ countryCode: e.target.value, cityFocus: '' })}
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
                        value={form.cityFocus}
                        onChange={(e) => patch({ cityFocus: e.target.value, stateRegion: e.target.value })}
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
                        value={form.cityFocus}
                        onChange={(e) => patch({ cityFocus: e.target.value })}
                        placeholder="Ciudad de México"
                      />
                    )}
                  </Field>
                  <Field label="Estado / región (opcional)">
                    <input
                      value={form.stateRegion}
                      onChange={(e) => patch({ stateRegion: e.target.value })}
                      placeholder="CDMX"
                    />
                  </Field>
                  <Field label="Dirección (opcional)">
                    <input
                      value={form.address}
                      onChange={(e) => patch({ address: e.target.value })}
                    />
                  </Field>
                </div>
              ) : null}

              {step === 6 ? (
                <>
                  <Field label="¿Qué servicios/productos ofreces?" required>
                    <textarea
                      rows={3}
                      value={form.servicesOffered}
                      onChange={(e) => patch({ servicesOffered: e.target.value })}
                      placeholder="Ej. Catering para bodas y eventos corporativos…"
                    />
                  </Field>
                  <Field label="¿Quién es tu cliente ideal?" required>
                    <textarea
                      rows={3}
                      value={form.idealClient}
                      onChange={(e) => patch({ idealClient: e.target.value })}
                      placeholder="Ej. Parejas que planean boda en Jalisco…"
                    />
                  </Field>
                </>
              ) : null}

              {step === 7 ? (
                <Field label="Keywords (separadas por coma)" hint="Opcional. Si dejas vacío, igual puedes seguir.">
                  <textarea
                    rows={3}
                    value={form.targetKeywords}
                    onChange={(e) => patch({ targetKeywords: e.target.value })}
                    placeholder="catering guadalajara, banquetes jalisco…"
                  />
                </Field>
              ) : null}

              {step === 8 ? (
                <>
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
                    <Field label="Slug de preview" hint="tu-marca.pinkpurple.site">
                      <input
                        value={form.publishSlug}
                        onChange={(e) =>
                          patch({
                            publishSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                          })
                        }
                        placeholder="tu-marca"
                      />
                    </Field>
                  ) : null}
                  {form.publishTarget === 'netlify' ? (
                    <div className="sim__grid">
                      <Field label="Netlify Site ID">
                        <input
                          value={form.netlifySiteId}
                          onChange={(e) => patch({ netlifySiteId: e.target.value })}
                        />
                      </Field>
                      <Field label="URL Netlify">
                        <input
                          type="url"
                          value={form.publishSiteUrl}
                          onChange={(e) => patch({ publishSiteUrl: e.target.value })}
                        />
                      </Field>
                    </div>
                  ) : null}
                  {['wordpress', 'shopify', 'wix', 'webflow', 'hostinger', 'squarespace', 'other'].includes(
                    form.publishTarget,
                  ) ? (
                    <div className="sim__grid">
                      <Field label="URL del sitio" required>
                        <input
                          type="url"
                          value={form.publishSiteUrl || form.siteHomeUrl}
                          onChange={(e) => patch({ publishSiteUrl: e.target.value })}
                        />
                      </Field>
                      {['wordpress', 'shopify', 'wix', 'webflow'].includes(form.publishTarget) ? (
                        <Field label="API key / token" required>
                          <input
                            value={form.publishApiKey}
                            onChange={(e) => patch({ publishApiKey: e.target.value })}
                          />
                        </Field>
                      ) : null}
                    </div>
                  ) : null}
                </>
              ) : null}

              {step === 9 ? (
                <div className="sim__grid">
                  <Field label="Instagram">
                    <input
                      value={form.socialInstagram}
                      onChange={(e) => patch({ socialInstagram: e.target.value })}
                      placeholder="https://instagram.com/…"
                    />
                  </Field>
                  <Field label="Facebook">
                    <input
                      value={form.socialFacebook}
                      onChange={(e) => patch({ socialFacebook: e.target.value })}
                    />
                  </Field>
                  <Field label="TikTok">
                    <input
                      value={form.socialTiktok}
                      onChange={(e) => patch({ socialTiktok: e.target.value })}
                    />
                  </Field>
                  <Field label="LinkedIn">
                    <input
                      value={form.socialLinkedin}
                      onChange={(e) => patch({ socialLinkedin: e.target.value })}
                    />
                  </Field>
                </div>
              ) : null}

              {err ? (
                <p className="sim__error" role="alert">
                  {err}
                </p>
              ) : null}

              <div className="sim__nav">
                <button type="button" className="btn btn-ghost" onClick={onBack} disabled={step === 0 || busy}>
                  Atrás
                </button>
                <button type="button" className="btn btn-primary" onClick={onNext} disabled={busy}>
                  {busy
                    ? 'Un momento…'
                    : step >= STEPS.length - 1
                      ? 'Completar y abrir panel'
                      : step === 2
                        ? form.siteHomeUrl.trim()
                          ? 'Escanear y seguir'
                          : 'Continuar sin sitio'
                        : 'Siguiente'}
                </button>
              </div>
            </div>

            <p className="sim__footnote">
              Cuenta real (Nexus):{' '}
              <Link to={`/pago?plan=${form.planId}&billing=${form.billing}`}>/pago → /registro</Link>
              . Este simulador guarda la empresa solo en este navegador y se puede borrar desde el
              panel.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
