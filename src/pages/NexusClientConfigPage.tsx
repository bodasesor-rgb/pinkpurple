import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import {
  CMS_OPTIONS,
  CONFIG_SECTIONS,
  EMPTY_CONFIG,
  SAMPLE_CONFIG,
  TONE_OPTIONS,
  loadConfig,
  missingRequired,
  saveConfig,
  type CmsPlatform,
  type NexusClientConfig,
  type NexusTone,
} from '../app/config/nexusClientConfig';

type FieldProps = {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
};

function Field({ label, hint, required, children }: FieldProps) {
  return (
    <label className="nx-field">
      <span className="nx-field__label">
        {label}
        {required ? <em className="nx-req"> *</em> : null}
      </span>
      {children}
      {hint ? <small className="nx-field__hint">{hint}</small> : null}
    </label>
  );
}

/**
 * Prototipo público en el sitio principal.
 * Aquí se corrige el formulario; cuando quede bien, se manda al panel de clientes.
 */
export default function NexusClientConfigPage() {
  const [config, setConfig] = useState<NexusClientConfig>(() => loadConfig());
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const missing = useMemo(() => missingRequired(config), [config]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      saveConfig(config);
      setSavedAt(new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }));
    }, 400);
    return () => window.clearTimeout(id);
  }, [config]);

  function update<K extends keyof NexusClientConfig>(key: K, value: NexusClientConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  function onText(key: keyof NexusClientConfig) {
    return (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      update(key, e.target.value as never);
    };
  }

  function loadSample() {
    setConfig({ ...SAMPLE_CONFIG });
    setNote('Ejemplo cargado para revisar el layout con datos llenos.');
  }

  function resetAll() {
    if (!window.confirm('¿Vaciar el borrador local?')) return;
    setConfig({ ...EMPTY_CONFIG });
    setNote('Borrador vacío. Solo se guarda en este navegador.');
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    saveConfig(config);
    setNote(
      missing.length
        ? `Guardado local. Faltan: ${missing.join(', ')}.`
        : 'Guardado local. Checklist completo — listo para revisar.',
    );
  }

  return (
    <div className="page-pad nx-page">
      <div className="container">
        <header className="page-hero page-hero--wide">
          <p className="eyebrow">Prototipo interno · no es el panel de clientes</p>
          <h1>Configuración Nexus cliente</h1>
          <p>
            Datos que el cliente llena para armar su Nexus a medida. Edita aquí copy, orden y
            campos; cuando quede como quieres, lo pasamos al flujo real de onboarding.
          </p>
          <div className="nx-page__actions">
            <button type="button" className="btn btn-ghost" onClick={loadSample}>
              Cargar ejemplo
            </button>
            <button type="button" className="btn btn-ghost" onClick={resetAll}>
              Vaciar
            </button>
          </div>
        </header>

        <div className="nx-meta">
          <span className={missing.length ? 'nx-status is-warn' : 'nx-status is-ok'}>
            {missing.length
              ? `${missing.length} obligatorio(s) pendientes`
              : 'Checklist de mínimos completo'}
          </span>
          {savedAt ? <span className="nx-autosave">Autoguardado {savedAt}</span> : null}
        </div>
        {note ? <p className="nx-note">{note}</p> : null}

        <div className="nx-layout">
          <aside className="nx-toc" aria-label="Secciones">
            {CONFIG_SECTIONS.map((section) => (
              <a key={section.id} className="nx-toc__link" href={`#cfg-${section.id}`}>
                {section.title}
              </a>
            ))}
          </aside>

          <form className="nx-form" onSubmit={onSubmit}>
            <section className="nx-card" id="cfg-sitio">
              <h2>{CONFIG_SECTIONS[0].title}</h2>
              <p className="nx-blurb">{CONFIG_SECTIONS[0].blurb}</p>
              <Field
                label="URL de tu página"
                hint="Opcional. Si la pone, Nexus intenta escanear marca y colores."
              >
                <input
                  type="url"
                  placeholder="https://tu-negocio.com"
                  value={config.siteHomeUrl}
                  onChange={onText('siteHomeUrl')}
                />
              </Field>
            </section>

            <section className="nx-card" id="cfg-marca">
              <h2>{CONFIG_SECTIONS[1].title}</h2>
              <p className="nx-blurb">{CONFIG_SECTIONS[1].blurb}</p>
              <div className="nx-row">
                <Field label="Nombre de marca" required>
                  <input
                    required
                    placeholder="Ej. Estudio Norte"
                    value={config.brandName}
                    onChange={onText('brandName')}
                  />
                </Field>
                <Field label="Tagline" hint="Opcional.">
                  <input
                    placeholder="Diseño y obra para casas en CDMX"
                    value={config.tagline}
                    onChange={onText('tagline')}
                  />
                </Field>
              </div>

              <fieldset className="nx-tones">
                <legend>
                  Tono de voz <em className="nx-req">*</em>
                </legend>
                <div className="nx-tone-grid">
                  {TONE_OPTIONS.map((opt) => (
                    <label
                      key={opt.id}
                      className={`nx-tone${config.tone === opt.id ? ' is-on' : ''}`}
                    >
                      <input
                        type="radio"
                        name="tone"
                        value={opt.id}
                        checked={config.tone === opt.id}
                        onChange={() => update('tone', opt.id as NexusTone)}
                      />
                      <strong>{opt.label}</strong>
                      <span>{opt.hint}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="nx-row">
                <Field label="Colores" hint="Hex separados por coma.">
                  <input
                    placeholder="#1e3a8a, #ffffff"
                    value={config.colors}
                    onChange={onText('colors')}
                  />
                </Field>
                <Field label="Logo (URL)" hint="En producción: upload de imagen.">
                  <input
                    type="url"
                    placeholder="https://…/logo.png"
                    value={config.logoUrl}
                    onChange={onText('logoUrl')}
                  />
                </Field>
              </div>
            </section>

            <section className="nx-card" id="cfg-contacto">
              <h2>{CONFIG_SECTIONS[2].title}</h2>
              <p className="nx-blurb">{CONFIG_SECTIONS[2].blurb}</p>
              <div className="nx-row">
                <Field label="WhatsApp Business" required hint="Con código de país.">
                  <input
                    type="tel"
                    placeholder="+52 55 1234 5678"
                    value={config.whatsapp}
                    onChange={onText('whatsapp')}
                  />
                </Field>
                <Field label="Correo de contacto">
                  <input
                    type="email"
                    placeholder="hola@tu-marca.com"
                    value={config.contactEmail}
                    onChange={onText('contactEmail')}
                  />
                </Field>
              </div>
              <Field label="Teléfono" hint="Opcional si es distinto al WhatsApp.">
                <input type="tel" value={config.phone} onChange={onText('phone')} />
              </Field>
            </section>

            <section className="nx-card" id="cfg-ubicacion">
              <h2>{CONFIG_SECTIONS[3].title}</h2>
              <p className="nx-blurb">{CONFIG_SECTIONS[3].blurb}</p>
              <div className="nx-row">
                <Field label="Ciudad" required>
                  <input
                    placeholder="Guadalajara"
                    value={config.cityFocus}
                    onChange={onText('cityFocus')}
                  />
                </Field>
                <Field label="Estado / región">
                  <input
                    placeholder="Jalisco"
                    value={config.stateRegion}
                    onChange={onText('stateRegion')}
                  />
                </Field>
              </div>
              <Field label="Dirección" hint="Opcional.">
                <input value={config.address} onChange={onText('address')} />
              </Field>
            </section>

            <section className="nx-card" id="cfg-oferta">
              <h2>{CONFIG_SECTIONS[4].title}</h2>
              <p className="nx-blurb">{CONFIG_SECTIONS[4].blurb}</p>
              <Field label="¿Qué servicios o productos ofreces?" required>
                <textarea
                  rows={3}
                  placeholder="Ej. Catering para bodas y eventos corporativos…"
                  value={config.servicesOffered}
                  onChange={onText('servicesOffered')}
                />
              </Field>
              <Field label="¿Quién es tu cliente ideal?" required>
                <textarea
                  rows={3}
                  placeholder="Ej. Parejas que planean boda en Jalisco…"
                  value={config.idealClient}
                  onChange={onText('idealClient')}
                />
              </Field>
            </section>

            <section className="nx-card" id="cfg-keywords">
              <h2>{CONFIG_SECTIONS[5].title}</h2>
              <p className="nx-blurb">{CONFIG_SECTIONS[5].blurb}</p>
              <Field label="Keywords" hint="Separadas por coma.">
                <textarea
                  rows={3}
                  placeholder="catering guadalajara, banquetes jalisco…"
                  value={config.targetKeywords}
                  onChange={onText('targetKeywords')}
                />
              </Field>
            </section>

            <section className="nx-card" id="cfg-publicacion">
              <h2>{CONFIG_SECTIONS[6].title}</h2>
              <p className="nx-blurb">{CONFIG_SECTIONS[6].blurb}</p>
              <fieldset className="nx-radios">
                <legend>¿Ya tienes sitio web?</legend>
                <label className="nx-radio">
                  <input
                    type="radio"
                    name="hasOwnSite"
                    checked={config.hasOwnSite}
                    onChange={() => update('hasOwnSite', true)}
                  />
                  <span>Sí — usaré mi dominio / CMS</span>
                </label>
                <label className="nx-radio">
                  <input
                    type="radio"
                    name="hasOwnSite"
                    checked={!config.hasOwnSite}
                    onChange={() => {
                      update('hasOwnSite', false);
                      update('cmsPlatform', 'none');
                    }}
                  />
                  <span>No — asignen un subdominio *.pinkpurple.site</span>
                </label>
              </fieldset>

              {config.hasOwnSite ? (
                <div className="nx-row">
                  <Field label="URL del sitio" required>
                    <input
                      type="url"
                      placeholder="https://tu-dominio.com"
                      value={config.siteHomeUrl}
                      onChange={onText('siteHomeUrl')}
                    />
                  </Field>
                  <Field label="Plataforma">
                    <select
                      value={config.cmsPlatform}
                      onChange={(e) => update('cmsPlatform', e.target.value as CmsPlatform)}
                    >
                      {CMS_OPTIONS.filter((o) => o.id !== 'none').map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              ) : (
                <Field label="Slug de preview" hint="tu-marca.pinkpurple.site">
                  <input
                    placeholder="tu-marca"
                    value={config.publishSlug}
                    onChange={onText('publishSlug')}
                  />
                </Field>
              )}
            </section>

            <section className="nx-card" id="cfg-redes">
              <h2>{CONFIG_SECTIONS[7].title}</h2>
              <p className="nx-blurb">{CONFIG_SECTIONS[7].blurb}</p>
              <div className="nx-row">
                <Field label="Instagram">
                  <input
                    type="url"
                    value={config.socialInstagram}
                    onChange={onText('socialInstagram')}
                  />
                </Field>
                <Field label="Facebook">
                  <input
                    type="url"
                    value={config.socialFacebook}
                    onChange={onText('socialFacebook')}
                  />
                </Field>
                <Field label="TikTok">
                  <input type="url" value={config.socialTiktok} onChange={onText('socialTiktok')} />
                </Field>
                <Field label="LinkedIn">
                  <input
                    type="url"
                    value={config.socialLinkedin}
                    onChange={onText('socialLinkedin')}
                  />
                </Field>
              </div>
            </section>

            <div className="nx-actions">
              <button type="submit" className="btn btn-primary">
                Guardar borrador local
              </button>
              <p className="nx-footer-hint">
                Prototipo del sitio principal. Cuando lo apruebes, se manda al onboarding de
                clientes.
              </p>
            </div>
          </form>

          <aside className="nx-preview" aria-label="Vista previa del payload">
            <h2>Payload hacia Nexus</h2>
            <p className="nx-blurb">JSON que enviaría el onboarding al completar.</p>
            <pre className="nx-json">{JSON.stringify(toPayload(config), null, 2)}</pre>
            {missing.length ? (
              <ul className="nx-missing">
                {missing.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            ) : (
              <p className="nx-ready">Listo para completar onboarding.</p>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

function toPayload(config: NexusClientConfig) {
  return {
    brandName: config.brandName.trim(),
    tagline: config.tagline.trim(),
    tone: config.tone,
    colors: config.colors
      .split(/[,;\s]+/)
      .map((c) => c.trim())
      .filter(Boolean),
    logoUrl: config.logoUrl.trim(),
    whatsapp: config.whatsapp.trim(),
    contactEmail: config.contactEmail.trim(),
    phone: config.phone.trim(),
    cityFocus: config.cityFocus.trim(),
    stateRegion: config.stateRegion.trim(),
    address: config.address.trim(),
    servicesOffered: config.servicesOffered.trim(),
    idealClient: config.idealClient.trim(),
    targetKeywords: config.targetKeywords
      .split(/[,;\n]+/)
      .map((k) => k.trim())
      .filter(Boolean),
    hasOwnSite: config.hasOwnSite,
    siteHomeUrl: config.hasOwnSite ? config.siteHomeUrl.trim() : '',
    cmsPlatform: config.hasOwnSite ? config.cmsPlatform : 'none',
    publishSlug: config.publishSlug.trim(),
    social: {
      instagram: config.socialInstagram.trim(),
      facebook: config.socialFacebook.trim(),
      tiktok: config.socialTiktok.trim(),
      linkedin: config.socialLinkedin.trim(),
    },
  };
}
