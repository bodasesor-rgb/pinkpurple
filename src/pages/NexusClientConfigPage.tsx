import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import {
  CONFIG_SECTIONS,
  EMPTY_CONFIG,
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
import {
  PUBLISH_PLATFORMS,
  getPublishPlatform,
  isApiKeyPublish,
} from '../app/config/publishPlatforms';

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

  let locality = (data.city?.trim() || data.stateRegion?.trim() || prev.stateRegion).trim();
  if (countryCode && locality) {
    const list = statesForCountry(countryCode);
    const match = list.find((s) => s.toLowerCase() === locality.toLowerCase());
    if (match) locality = match;
    else {
      const fuzzy = list.find(
        (s) =>
          s.toLowerCase().includes(locality.toLowerCase()) ||
          locality.toLowerCase().includes(s.toLowerCase()),
      );
      if (fuzzy) locality = fuzzy;
    }
  }

  const publishHint = String((data.cmsHints || [])[0] || '').toLowerCase();
  let publishTarget = prev.publishTarget;
  if (publishHint.includes('netlify')) publishTarget = 'netlify';
  else if (publishHint.includes('shopify')) publishTarget = 'shopify';
  else if (publishHint.includes('wix')) publishTarget = 'wix';
  else if (publishHint.includes('webflow')) publishTarget = 'webflow';
  else if (publishHint.includes('squarespace')) publishTarget = 'squarespace';
  else if (publishHint.includes('hostinger')) publishTarget = 'hostinger';
  else if (publishHint.includes('wordpress') || publishHint.includes('wp')) {
    publishTarget = 'wordpress';
  }

  return {
    ...prev,
    siteHomeUrl: data.url || prev.siteHomeUrl,
    brandName: data.brandName?.trim() || prev.brandName,
    tagline: data.tagline?.trim() || prev.tagline,
    tone: data.tone || prev.tone,
    brandColors: Array.isArray(data.colors) && data.colors.length ? data.colors : prev.brandColors,
    logoUrl: data.logoUrl?.trim() || prev.logoUrl,
    whatsapp: data.whatsapp?.trim() || prev.whatsapp,
    contactEmail: data.contactEmail?.trim() || prev.contactEmail,
    phone: data.phone?.trim() || prev.phone,
    countryCode: countryCode || prev.countryCode,
    stateRegion: locality || prev.stateRegion,
    cityFocus: '',
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
  const [countryQuery, setCountryQuery] = useState('');
  const [countryOpen, setCountryOpen] = useState(false);
  const [draftColor, setDraftColor] = useState('#8c3df5');
  const [draftHex, setDraftHex] = useState('#8c3df5');
  const [howToOpen, setHowToOpen] = useState(false);
  const [logoDragOver, setLogoDragOver] = useState(false);
  const [logoError, setLogoError] = useState('');

  const missing = useMemo(() => missingRequired(config), [config]);
  const country = getCountry(config.countryCode);
  const states = statesForCountry(config.countryCode);

  const filteredCountries = useMemo(() => {
    const q = countryQuery.trim().toLowerCase();
    if (!q) return COUNTRIES;
    // Letra inicial → sección de esa letra; texto más largo → contiene
    if (q.length === 1) {
      return COUNTRIES.filter((c) => c.name.toLowerCase().startsWith(q));
    }
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.flag.includes(countryQuery.trim()),
    );
  }, [countryQuery]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      saveConfig(config);
      setSavedAt(new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }));
    }, 400);
    return () => window.clearTimeout(id);
  }, [config]);

  useEffect(() => {
    if (country) setCountryQuery(`${country.flag} ${country.name}`);
  }, [country?.code]);

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
    const c = getCountry(code);
    setCountryQuery(c ? `${c.flag} ${c.name}` : '');
    setCountryOpen(false);
  }

  function normalizeHex(raw: string): string | null {
    const m = String(raw || '').trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (!m) return null;
    let hex = m[1].toLowerCase();
    if (hex.length === 3) hex = hex.split('').map((ch) => ch + ch).join('');
    return `#${hex}`;
  }

  function addBrandColor(raw?: string) {
    const hex = normalizeHex(raw ?? draftHex ?? draftColor);
    if (!hex) return;
    setConfig((prev) => {
      if (prev.brandColors.includes(hex)) return prev;
      return { ...prev, brandColors: [...prev.brandColors, hex] };
    });
    setDraftColor(hex);
    setDraftHex(hex);
  }

  function removeBrandColor(hex: string) {
    setConfig((prev) => ({
      ...prev,
      brandColors: prev.brandColors.filter((c) => c !== hex),
    }));
  }

  function applyLogoFile(file: File | null | undefined) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setLogoError('Solo imágenes (PNG, SVG, WebP o JPG).');
      return;
    }
    if (file.size > 2.5 * 1024 * 1024) {
      setLogoError('Máximo 2.5 MB. Usa PNG/SVG sin fondo.');
      return;
    }
    setLogoError('');
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      if (!dataUrl) return;
      setConfig((prev) => ({ ...prev, logoUrl: dataUrl }));
    };
    reader.onerror = () => setLogoError('No se pudo leer el archivo.');
    reader.readAsDataURL(file);
  }

  function clearLogo() {
    setConfig((prev) => ({ ...prev, logoUrl: '' }));
    setLogoError('');
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
    setHowToOpen(false);
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
                <div className="nx-field">
                  <span className="nx-field__label">Colores de marca</span>
                  <div className="nx-color-add">
                    <input
                      type="color"
                      className="nx-color-swatch-input"
                      value={normalizeHex(draftColor) || '#8c3df5'}
                      onChange={(e) => {
                        setDraftColor(e.target.value);
                        setDraftHex(e.target.value);
                      }}
                      aria-label="Elegir color"
                    />
                    <input
                      type="text"
                      className="nx-color-hex"
                      value={draftHex}
                      onChange={(e) => setDraftHex(e.target.value)}
                      placeholder="#8c3df5"
                      spellCheck={false}
                    />
                    <button type="button" className="btn btn-ghost" onClick={() => addBrandColor()}>
                      Agregar color
                    </button>
                  </div>
                  <small className="nx-field__hint">
                    Usa el selector (tabla de colores) o escribe el código hex y agrégalo a la lista.
                  </small>
                  {config.brandColors.length ? (
                    <ul className="nx-color-list">
                      {config.brandColors.map((hex) => (
                        <li key={hex}>
                          <span className="nx-color-chip" style={{ background: hex }} aria-hidden />
                          <code>{hex}</code>
                          <button type="button" className="btn btn-ghost" onClick={() => removeBrandColor(hex)}>
                            Quitar
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="nx-field__hint">Sin colores aún.</p>
                  )}
                </div>
                <div className="nx-field">
                  <span className="nx-field__label">Logo</span>
                  <div
                    className={`nx-logo-drop${logoDragOver ? ' is-over' : ''}${config.logoUrl ? ' has-preview' : ''}`}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setLogoDragOver(true);
                    }}
                    onDragLeave={() => setLogoDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setLogoDragOver(false);
                      applyLogoFile(e.dataTransfer.files?.[0]);
                    }}
                  >
                    {config.logoUrl ? (
                      <div className="nx-logo-preview">
                        <img src={config.logoUrl} alt="Vista previa del logo" />
                      </div>
                    ) : (
                      <p className="nx-logo-drop__hint">
                        Arrastra tu logo aquí o elige un archivo
                      </p>
                    )}
                    <div className="nx-logo-drop__actions">
                      <label className="btn btn-ghost nx-logo-file-btn">
                        Cargar imagen
                        <input
                          type="file"
                          accept="image/png,image/svg+xml,image/webp,image/jpeg"
                          hidden
                          onChange={(e) => {
                            applyLogoFile(e.target.files?.[0]);
                            e.target.value = '';
                          }}
                        />
                      </label>
                      {config.logoUrl ? (
                        <button type="button" className="btn btn-ghost" onClick={clearLogo}>
                          Quitar
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <small className="nx-field__hint">
                    Debe ser imagen <strong>sin fondo</strong> (PNG o SVG preferible). Máx. 2.5 MB.
                  </small>
                  {logoError ? <p className="nx-scan-error">{logoError}</p> : null}
                  <Field
                    label="O pega una URL"
                    hint="Opcional si ya subiste el archivo."
                  >
                    <input
                      type="url"
                      placeholder="https://…/logo.png"
                      value={config.logoUrl.startsWith('data:') ? '' : config.logoUrl}
                      onChange={onText('logoUrl')}
                    />
                  </Field>
                </div>
              </div>
            </section>

            {/* 3 · Contacto */}
            <section className="nx-card" id="cfg-contacto">
              <h2>{CONFIG_SECTIONS[2].title}</h2>
              <p className="nx-blurb">{CONFIG_SECTIONS[2].blurb}</p>
              <Field label="WhatsApp" required hint="Con código de país, ej. +52 55 1234 5678">
                <input
                  type="tel"
                  placeholder="+52 55 1234 5678"
                  value={config.whatsapp}
                  onChange={onText('whatsapp')}
                />
              </Field>
            </section>

            {/* 4 · Ubicación */}
            <section className="nx-card" id="cfg-ubicacion">
              <h2>{CONFIG_SECTIONS[3].title}</h2>
              <p className="nx-blurb">{CONFIG_SECTIONS[3].blurb}</p>
              <div className="nx-row">
                <div className="nx-field nx-country-field">
                  <span className="nx-field__label">
                    País <em className="nx-req">*</em>
                  </span>
                  <input
                    type="text"
                    role="combobox"
                    aria-expanded={countryOpen}
                    aria-autocomplete="list"
                    placeholder="Escribe una letra (ej. M) o el nombre…"
                    value={countryQuery}
                    onChange={(e) => {
                      setCountryQuery(e.target.value);
                      setCountryOpen(true);
                      if (!e.target.value.trim()) setCountry('');
                    }}
                    onFocus={() => setCountryOpen(true)}
                    onBlur={() => window.setTimeout(() => setCountryOpen(false), 160)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setCountryOpen(false);
                      if (e.key === 'Enter' && filteredCountries[0]) {
                        e.preventDefault();
                        setCountry(filteredCountries[0].code);
                      }
                    }}
                  />
                  {countryOpen ? (
                    <ul className="nx-country-list" role="listbox">
                      {filteredCountries.length ? (
                        filteredCountries.map((c) => (
                          <li key={c.code}>
                            <button
                              type="button"
                              className={config.countryCode === c.code ? 'is-active' : ''}
                              onMouseDown={(ev) => {
                                ev.preventDefault();
                                setCountry(c.code);
                              }}
                            >
                              <span className="nx-country-flag" aria-hidden>
                                {c.flag}
                              </span>
                              <span>{c.name}</span>
                            </button>
                          </li>
                        ))
                      ) : (
                        <li className="nx-country-empty">Sin países con esa letra</li>
                      )}
                    </ul>
                  ) : null}
                  <small className="nx-field__hint">
                    Escribe la letra inicial para saltar a esa sección (M → México, Brasil…).
                  </small>
                </div>
                <Field label="Ciudad" required hint="División local del país (estado, provincia, región…).">
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
              </div>
              <Field label="Dirección" hint="Opcional.">
                <input value={config.address} onChange={onText('address')} />
              </Field>
            </section>

            {/* 5 · Oferta */}
            <section className="nx-card" id="cfg-oferta">
              <h2>{CONFIG_SECTIONS[4].title}</h2>
              <p className="nx-blurb">{CONFIG_SECTIONS[4].blurb}</p>
              <Field label="¿Qué ofreces?" required>
                <textarea
                  rows={3}
                  placeholder="Ej. Consultoría, productos, clases, instalación, soporte…"
                  value={config.servicesOffered}
                  onChange={onText('servicesOffered')}
                />
              </Field>
              <Field label="¿A quién le hablas?" required>
                <textarea
                  rows={3}
                  placeholder="Ej. Dueños de negocio local, familias, equipos de marketing…"
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
                  placeholder="servicio + ciudad, producto principal, intención de compra…"
                  value={config.targetKeywords}
                  onChange={onText('targetKeywords')}
                />
              </Field>
            </section>

            {/* 7 · Publicación */}
            <section className="nx-card" id="cfg-publicacion">
              <h2>{CONFIG_SECTIONS[6].title}</h2>
              <p className="nx-blurb">{CONFIG_SECTIONS[6].blurb}</p>

              <div className="nx-publish-list" role="listbox" aria-label="Plataformas de publicación">
                {PUBLISH_PLATFORMS.map((opt) => {
                  const open = config.publishTarget === opt.id;
                  return (
                    <div
                      key={opt.id}
                      className={`nx-publish-row${open ? ' is-open' : ''}`}
                      role="option"
                      aria-selected={open}
                    >
                      <button
                        type="button"
                        className="nx-publish-row__head"
                        onClick={() => setPublishTarget(opt.id)}
                        aria-expanded={open}
                      >
                        <span className="nx-publish-row__title">
                          <strong>{opt.label}</strong>
                          <small>{opt.hint}</small>
                        </span>
                        {opt.howTo.canPushWithApiKey ? (
                          <em className="nx-publish-badge nx-publish-badge--ok">Push con API key</em>
                        ) : opt.mode === 'netlify_build' ? (
                          <em className="nx-publish-badge">Deploy en build</em>
                        ) : opt.mode === 'preview' ? (
                          <em className="nx-publish-badge">Sin API</em>
                        ) : (
                          <em className="nx-publish-badge nx-publish-badge--warn">Revisar caso</em>
                        )}
                        <span className="nx-publish-row__chev" aria-hidden>
                          {open ? '▾' : '▸'}
                        </span>
                      </button>

                      {open ? (
                        <div
                          className={`nx-publish-row__body${
                            opt.mode === 'netlify_build'
                              ? ' nx-callout--netlify'
                              : opt.howTo.canPushWithApiKey
                                ? ' nx-callout--api'
                                : ''
                          }`}
                        >
                          <p>
                            <strong>{opt.label}:</strong> {opt.howTo.summary}
                          </p>

                          {opt.id === 'preview' ? (
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

                          {opt.id === 'netlify' ? (
                            <>
                              <div className="nx-row">
                                <Field
                                  label="Site ID o URL Netlify"
                                  required
                                  hint="Site configuration → General → Site details"
                                >
                                  <input
                                    placeholder="mi-sitio o UUID"
                                    value={config.netlifySiteId}
                                    onChange={onText('netlifySiteId')}
                                  />
                                </Field>
                                <Field label="URL pública del sitio" hint="Dominio que ve el cliente.">
                                  <input
                                    type="url"
                                    placeholder="https://tu-dominio.com"
                                    value={config.publishSiteUrl}
                                    onChange={onText('publishSiteUrl')}
                                  />
                                </Field>
                              </div>
                              <Field
                                label="Build hook / token de conexión"
                                hint="Build & deploy → Build hooks. Netlify ejecuta el deploy."
                              >
                                <input
                                  type="password"
                                  autoComplete="off"
                                  placeholder="Build hook o token"
                                  value={config.netlifyConnectToken}
                                  onChange={onText('netlifyConnectToken')}
                                />
                              </Field>
                            </>
                          ) : null}

                          {isApiKeyPublish(opt.id) ||
                          opt.id === 'squarespace' ||
                          opt.id === 'hostinger' ? (
                            <div className="nx-row">
                              <Field label="URL del sitio" required={opt.id !== 'hostinger'}>
                                <input
                                  type="url"
                                  placeholder="https://tu-dominio.com"
                                  value={config.publishSiteUrl}
                                  onChange={onText('publishSiteUrl')}
                                />
                              </Field>
                              <Field
                                label={
                                  opt.howTo.canPushWithApiKey
                                    ? 'API key / token'
                                    : 'API key (si existe)'
                                }
                                required={opt.howTo.canPushWithApiKey}
                                hint={opt.howTo.fieldsNote || 'No se muestra en el HTML público.'}
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
                          ) : null}

                          <button
                            type="button"
                            className="btn btn-ghost nx-howto-btn"
                            onClick={() => setHowToOpen((v) => !v)}
                            aria-expanded={howToOpen}
                          >
                            {howToOpen ? 'Ocultar guía' : '¿Cómo lo hago?'}
                          </button>

                          {howToOpen ? (
                            <div className="nx-howto">
                              <h3>{opt.howTo.title}</h3>
                              <p className="nx-howto__push">
                                {opt.howTo.canPushWithApiKey
                                  ? 'Sí se puede publicar con API key / token.'
                                  : 'No basta solo con API key (o no aplica).'}
                              </p>
                              <ol>
                                {opt.howTo.steps.map((step) => (
                                  <li key={step}>{step}</li>
                                ))}
                              </ol>
                              {opt.howTo.fieldsNote ? (
                                <p className="nx-howto__note">{opt.howTo.fieldsNote}</p>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
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
    colors: config.brandColors,
    logoUrl: config.logoUrl.trim(),
    whatsapp: config.whatsapp.trim(),
    countryCode: config.countryCode,
    countryName: country?.name || '',
    countryFlag: country?.flag || '',
    city: config.stateRegion.trim(),
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
      hasApiKey: Boolean(config.publishApiKey.trim()),
      netlifySiteId: config.netlifySiteId.trim(),
      hasNetlifyToken: Boolean(config.netlifyConnectToken.trim()),
      pushBy:
        config.publishTarget === 'netlify'
          ? 'netlify_build'
          : getPublishPlatform(config.publishTarget)?.mode === 'nexus_api'
            ? 'nexus_api'
            : getPublishPlatform(config.publishTarget)?.mode === 'manual_review'
              ? 'manual_review'
              : 'none',
      platformLabel: getPublishPlatform(config.publishTarget)?.label || config.publishTarget,
      canPushWithApiKey: Boolean(getPublishPlatform(config.publishTarget)?.howTo.canPushWithApiKey),
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
