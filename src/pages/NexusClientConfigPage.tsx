import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import {
  CONFIG_SECTIONS,
  EMPTY_CONFIG,
  PUBLISH_TARGET_OPTIONS,
  SAMPLE_CONFIG,
  SOCIAL_NETWORK_OPTIONS,
  TONE_OPTIONS,
  createSocialLink,
  loadConfig,
  missingRequired,
  saveConfig,
  socialLabel,
  type NexusClientConfig,
  type NexusTone,
  type PublishTarget,
  type SocialLink,
  type SocialNetworkId,
} from '../app/config/nexusClientConfig';
import { COUNTRIES, getCountry, statesForCountry, type CountryCode } from '../app/config/locations';

type FieldProps = {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
};

type ScanData = {
  ok: boolean;
  url: string;
  pages?: { url: string; status: number; title: string }[];
  brandName?: string;
  tagline?: string;
  logoUrl?: string;
  colors?: string[];
  tone?: NexusTone;
  phone?: string;
  whatsapp?: string;
  contactEmail?: string;
  address?: string;
  city?: string;
  stateRegion?: string;
  countryCode?: string;
  servicesOffered?: string;
  idealClient?: string;
  keywords?: string[];
  social?: Record<string, string>;
  cmsHints?: string[];
  warnings?: string[];
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

function applyScanToConfig(prev: NexusClientConfig, data: ScanData): NexusClientConfig {
  const socialLinks: SocialLink[] = [];
  const social = data.social || {};
  const networkMap: [SocialNetworkId, string][] = [
    ['instagram', social.instagram || ''],
    ['facebook', social.facebook || ''],
    ['tiktok', social.tiktok || ''],
    ['linkedin', social.linkedin || ''],
    ['youtube', social.youtube || ''],
    ['x', social.x || ''],
    ['pinterest', social.pinterest || ''],
  ];
  for (const [network, url] of networkMap) {
    if (url) socialLinks.push(createSocialLink(network, url));
  }
  if (social.other) {
    socialLinks.push({
      ...createSocialLink('other', social.other),
      customName: 'Threads / otra',
    });
  }
  if (!socialLinks.length) {
    socialLinks.push(createSocialLink('instagram'), createSocialLink('facebook'));
  }

  const countryCode = (COUNTRIES.some((c) => c.code === data.countryCode)
    ? data.countryCode
    : prev.countryCode) as CountryCode | '';

  let stateRegion = data.stateRegion?.trim() || prev.stateRegion;
  if (countryCode && stateRegion) {
    const list = statesForCountry(countryCode);
    const match = list.find((s) => s.toLowerCase() === stateRegion.toLowerCase());
    if (match) stateRegion = match;
    else {
      const fuzzy = list.find(
        (s) =>
          s.toLowerCase().includes(stateRegion.toLowerCase()) ||
          stateRegion.toLowerCase().includes(s.toLowerCase()),
      );
      if (fuzzy) stateRegion = fuzzy;
    }
  }

  const publishHint = (data.cmsHints || [])[0];
  let publishTarget = prev.publishTarget;
  if (publishHint === 'netlify') publishTarget = 'netlify';
  else if (publishHint === 'wordpress' || publishHint === 'shopify' || publishHint === 'wix') {
    publishTarget = 'api';
  }

  return {
    ...prev,
    siteHomeUrl: data.url || prev.siteHomeUrl,
    brandName: data.brandName?.trim() || prev.brandName,
    tagline: data.tagline?.trim() || prev.tagline,
    tone: data.tone || prev.tone,
    colors: Array.isArray(data.colors) && data.colors.length ? data.colors.join(', ') : prev.colors,
    logoUrl: data.logoUrl?.trim() || prev.logoUrl,
    whatsapp: data.whatsapp?.trim() || prev.whatsapp,
    contactEmail: data.contactEmail?.trim() || prev.contactEmail,
    phone: data.phone?.trim() || prev.phone,
    countryCode: countryCode || prev.countryCode,
    stateRegion: stateRegion || prev.stateRegion,
    cityFocus: data.city?.trim() || prev.cityFocus,
    address: data.address?.trim() || prev.address,
    servicesOffered: data.servicesOffered?.trim() || prev.servicesOffered,
    idealClient: data.idealClient?.trim() || prev.idealClient,
    targetKeywords:
      Array.isArray(data.keywords) && data.keywords.length
        ? data.keywords.join(', ')
        : prev.targetKeywords,
    socialLinks,
    publishTarget,
    hasOwnSite: publishTarget !== 'preview',
    publishSiteUrl: data.url || prev.publishSiteUrl,
  };
}

export default function NexusClientConfigPage() {
  const [config, setConfig] = useState<NexusClientConfig>(() => loadConfig());
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState('');
  const [scanReport, setScanReport] = useState<ScanData | null>(null);

  const missing = useMemo(() => missingRequired(config), [config]);
  const country = getCountry(config.countryCode);
  const states = statesForCountry(config.countryCode);

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

  function setCountry(code: CountryCode | '') {
    setConfig((prev) => ({
      ...prev,
      countryCode: code,
      stateRegion: '',
    }));
  }

  function patchSocial(id: string, patch: Partial<SocialLink>) {
    setConfig((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  }

  function addSocial() {
    setConfig((prev) => ({
      ...prev,
      socialLinks: [...prev.socialLinks, createSocialLink('other', '')],
    }));
  }

  function removeSocial(id: string) {
    setConfig((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((s) => s.id !== id),
    }));
  }

  async function runExtremeScan() {
    const url = config.siteHomeUrl.trim();
    if (!url) {
      setScanError('Pega primero la URL del sitio.');
      return;
    }
    setScanning(true);
    setScanError('');
    setScanReport(null);
    try {
      const res = await fetch('/api/site-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
        data?: ScanData;
      };
      if (!res.ok || !body.success || !body.data) {
        throw new Error(body.error || `Escaneo falló (HTTP ${res.status})`);
      }
      setScanReport(body.data);
      setConfig((prev) => applyScanToConfig(prev, body.data as ScanData));
      const pages = body.data.pages?.length || 1;
      setNote(
        `Escaneo extremo listo: ${pages} página(s) leída(s). Revisa marca, ubicación y redes — corrige lo que falte.`,
      );
    } catch (err) {
      setScanError(err instanceof Error ? err.message : 'No se pudo escanear el sitio');
    } finally {
      setScanning(false);
    }
  }

  function loadSample() {
    setConfig({
      ...SAMPLE_CONFIG,
      socialLinks: SAMPLE_CONFIG.socialLinks.map((s) => ({ ...s })),
    });
    setScanReport(null);
    setNote('Ejemplo cargado para revisar el layout con datos llenos.');
  }

  function resetAll() {
    if (!window.confirm('¿Vaciar el borrador local?')) return;
    setConfig({
      ...EMPTY_CONFIG,
      socialLinks: EMPTY_CONFIG.socialLinks.map((s) => ({ ...s })),
    });
    setScanReport(null);
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

  function setPublishTarget(target: PublishTarget) {
    setConfig((prev) => ({
      ...prev,
      publishTarget: target,
      hasOwnSite: target !== 'preview',
    }));
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
            {/* 1 · Sitio */}
            <section className="nx-card" id="cfg-sitio">
              <h2>{CONFIG_SECTIONS[0].title}</h2>
              <p className="nx-blurb">{CONFIG_SECTIONS[0].blurb}</p>
              <div className="nx-scan-row">
                <Field
                  label="URL de tu página"
                  hint="Home del negocio. El escaneo también entra a contacto / nosotros / servicios si existen."
                >
                  <input
                    type="url"
                    placeholder="https://tu-negocio.com"
                    value={config.siteHomeUrl}
                    onChange={onText('siteHomeUrl')}
                  />
                </Field>
                <button
                  type="button"
                  className="btn btn-primary nx-scan-btn"
                  onClick={runExtremeScan}
                  disabled={scanning}
                >
                  {scanning ? 'Escaneando…' : 'Escaneo extremo'}
                </button>
              </div>
              {scanError ? (
                <p className="nx-scan-error" role="alert">
                  {scanError}
                </p>
              ) : null}
              {scanReport ? (
                <div className="nx-scan-report">
                  <p className="nx-scan-report__title">
                    Hallazgos · {scanReport.pages?.length || 1} página(s)
                    {scanReport.cmsHints?.length
                      ? ` · CMS: ${scanReport.cmsHints.join(', ')}`
                      : ''}
                  </p>
                  <ul className="nx-scan-report__list">
                    {(scanReport.pages || []).map((p) => (
                      <li key={p.url}>
                        <code>{p.status}</code> {p.title || p.url}
                      </li>
                    ))}
                  </ul>
                  {scanReport.warnings?.length ? (
                    <p className="nx-scan-report__warn">{scanReport.warnings.join(' · ')}</p>
                  ) : null}
                  <p className="nx-scan-report__hint">
                    Se rellenaron marca, contacto, ubicación (si se detectó), redes, servicios y
                    keywords. Revisa cada sección y corrige a mano lo que falte.
                  </p>
                </div>
              ) : null}
            </section>

            {/* 2 · Marca */}
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

            {/* 3 · Contacto */}
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

            {/* 4 · Ubicación */}
            <section className="nx-card" id="cfg-ubicacion">
              <h2>{CONFIG_SECTIONS[3].title}</h2>
              <p className="nx-blurb">{CONFIG_SECTIONS[3].blurb}</p>
              <div className="nx-row nx-row--3">
                <Field label="País" required>
                  <select
                    value={config.countryCode}
                    onChange={(e) => setCountry(e.target.value as CountryCode | '')}
                    required
                  >
                    <option value="">Elige un país…</option>
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={country?.stateLabel || 'Estado / provincia'} required>
                  <select
                    value={config.stateRegion}
                    onChange={onText('stateRegion')}
                    disabled={!config.countryCode}
                    required
                  >
                    <option value="">
                      {config.countryCode ? 'Elige…' : 'Primero elige país'}
                    </option>
                    {states.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Ciudad" required>
                  <input
                    placeholder="Guadalajara"
                    value={config.cityFocus}
                    onChange={onText('cityFocus')}
                    required
                  />
                </Field>
              </div>
              <Field label="Dirección" hint="Opcional.">
                <input value={config.address} onChange={onText('address')} />
              </Field>
            </section>

            {/* 5 · Oferta */}
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

            {/* 6 · Keywords */}
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

            {/* 7 · Publicación */}
            <section className="nx-card" id="cfg-publicacion">
              <h2>{CONFIG_SECTIONS[6].title}</h2>
              <p className="nx-blurb">{CONFIG_SECTIONS[6].blurb}</p>

              <fieldset className="nx-radios">
                <legend>¿Cómo se conecta el sitio?</legend>
                {PUBLISH_TARGET_OPTIONS.map((opt) => (
                  <label key={opt.id} className="nx-radio nx-radio--block">
                    <input
                      type="radio"
                      name="publishTarget"
                      checked={config.publishTarget === opt.id}
                      onChange={() => setPublishTarget(opt.id)}
                    />
                    <span>
                      <strong>{opt.label}</strong>
                      <small>{opt.hint}</small>
                    </span>
                  </label>
                ))}
              </fieldset>

              {config.publishTarget === 'preview' ? (
                <Field
                  label="Slug de preview"
                  hint="Se usará como tu-marca.pinkpurple.site"
                >
                  <input
                    placeholder="tu-marca"
                    value={config.publishSlug}
                    onChange={onText('publishSlug')}
                  />
                </Field>
              ) : null}

              {config.publishTarget === 'netlify' ? (
                <div className="nx-callout nx-callout--netlify">
                  <p>
                    <strong>Netlify (modelo Bodasesor):</strong> Nexus no hace push de HTML a su
                    sitio. Se conecta el proyecto Netlify; en el <em>build</em> de Netlify se baja el
                    SEO y se despliega desde <strong>su código / su repo</strong>. Así no se borra
                    la página principal.
                  </p>
                  <div className="nx-row">
                    <Field
                      label="Site ID o URL Netlify"
                      required
                      hint="Ej. site id o https://app.netlify.com/sites/…"
                    >
                      <input
                        placeholder="mi-sitio o UUID"
                        value={config.netlifySiteId}
                        onChange={onText('netlifySiteId')}
                      />
                    </Field>
                    <Field
                      label="URL pública del sitio"
                      hint="Dominio que ve el cliente."
                    >
                      <input
                        type="url"
                        placeholder="https://tu-dominio.com"
                        value={config.publishSiteUrl}
                        onChange={onText('publishSiteUrl')}
                      />
                    </Field>
                  </div>
                  <Field
                    label="Token / build hook (conexión)"
                    hint="Prototipo: aquí irá el secreto de conexión. Netlify ejecuta el deploy."
                  >
                    <input
                      type="password"
                      autoComplete="off"
                      placeholder="Build hook o token de conexión"
                      value={config.netlifyConnectToken}
                      onChange={onText('netlifyConnectToken')}
                    />
                  </Field>
                </div>
              ) : null}

              {config.publishTarget === 'api' ? (
                <div className="nx-callout nx-callout--api">
                  <p>
                    <strong>WordPress, Wix, Shopify, Hostinger y similares:</strong> el cliente pega
                    la <em>API key</em> (o application password) de su página. Ahí sí Nexus puede
                    publicar / hacer push por API sin pisar un repo Git ajeno.
                  </p>
                  <div className="nx-row">
                    <Field label="URL del sitio / CMS" required>
                      <input
                        type="url"
                        placeholder="https://tu-dominio.com"
                        value={config.publishSiteUrl}
                        onChange={onText('publishSiteUrl')}
                      />
                    </Field>
                    <Field
                      label="API key / application password"
                      required
                      hint="No se muestra en el HTML público; solo en el panel."
                    >
                      <input
                        type="password"
                        autoComplete="off"
                        placeholder="••••••••"
                        value={config.publishApiKey}
                        onChange={onText('publishApiKey')}
                      />
                    </Field>
                  </div>
                </div>
              ) : null}
            </section>

            {/* 8 · Redes */}
            <section className="nx-card" id="cfg-redes">
              <h2>{CONFIG_SECTIONS[7].title}</h2>
              <p className="nx-blurb">{CONFIG_SECTIONS[7].blurb}</p>

              <div className="nx-social-list">
                {config.socialLinks.map((link) => (
                  <div key={link.id} className="nx-social-row">
                    <Field label="Red">
                      <select
                        value={link.network}
                        onChange={(e) =>
                          patchSocial(link.id, {
                            network: e.target.value as SocialNetworkId,
                            customName:
                              e.target.value === 'other' ? link.customName || '' : undefined,
                          })
                        }
                      >
                        {SOCIAL_NETWORK_OPTIONS.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                    {link.network === 'other' ? (
                      <Field label="Nombre de la red">
                        <input
                          placeholder="Threads, Behance…"
                          value={link.customName || ''}
                          onChange={(e) => patchSocial(link.id, { customName: e.target.value })}
                        />
                      </Field>
                    ) : (
                      <Field label=" ">
                        <p className="nx-social-name">{socialLabel(link)}</p>
                      </Field>
                    )}
                    <Field label="URL o @">
                      <input
                        type="url"
                        placeholder="https://…"
                        value={link.url}
                        onChange={(e) => patchSocial(link.id, { url: e.target.value })}
                      />
                    </Field>
                    <button
                      type="button"
                      className="btn btn-ghost nx-social-remove"
                      onClick={() => removeSocial(link.id)}
                      disabled={config.socialLinks.length <= 1}
                      aria-label={`Quitar ${socialLabel(link)}`}
                    >
                      Quitar
                    </button>
                  </div>
                ))}
              </div>

              <button type="button" className="btn btn-ghost" onClick={addSocial}>
                + Agregar otra red
              </button>
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
  const country = getCountry(config.countryCode);
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
    countryCode: config.countryCode,
    countryName: country?.name || '',
    stateRegion: config.stateRegion.trim(),
    cityFocus: config.cityFocus.trim(),
    address: config.address.trim(),
    servicesOffered: config.servicesOffered.trim(),
    idealClient: config.idealClient.trim(),
    targetKeywords: config.targetKeywords
      .split(/[,;\n]+/)
      .map((k) => k.trim())
      .filter(Boolean),
    publish: {
      target: config.publishTarget,
      slug: config.publishSlug.trim(),
      siteUrl: config.publishSiteUrl.trim() || config.siteHomeUrl.trim(),
      // secretos: en payload real irían cifrados / solo servidor
      hasApiKey: Boolean(config.publishApiKey.trim()),
      netlifySiteId: config.netlifySiteId.trim(),
      hasNetlifyToken: Boolean(config.netlifyConnectToken.trim()),
      pushBy:
        config.publishTarget === 'netlify'
          ? 'netlify_build'
          : config.publishTarget === 'api'
            ? 'nexus_api'
            : 'none',
    },
    social: config.socialLinks
      .filter((s) => s.url.trim())
      .map((s) => ({
        network: s.network,
        name: socialLabel(s),
        url: s.url.trim(),
      })),
  };
}
