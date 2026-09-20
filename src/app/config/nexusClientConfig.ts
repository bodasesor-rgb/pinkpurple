/**
 * Prototipo: datos que el cliente llena para personalizar su Nexus.
 * Espejo del onboarding Hostinger (`/onboarding`) — solo UI local para corregir copy y flujo.
 * No llama a Nexus todavía; guarda en localStorage.
 */

export type NexusTone = 'formal' | 'cercano' | 'experto';
export type CmsPlatform = 'wordpress' | 'shopify' | 'other' | 'none';

export interface NexusClientConfig {
  // 1 · Sitio / escaneo
  siteHomeUrl: string;
  // 2 · Marca
  brandName: string;
  tagline: string;
  tone: NexusTone;
  colors: string;
  logoUrl: string;
  // 3 · Contacto
  whatsapp: string;
  contactEmail: string;
  phone: string;
  // 4 · Ubicación
  cityFocus: string;
  stateRegion: string;
  address: string;
  // 5 · Oferta
  servicesOffered: string;
  idealClient: string;
  // 6 · Keywords
  targetKeywords: string;
  // 7 · Publicación
  hasOwnSite: boolean;
  cmsPlatform: CmsPlatform;
  publishSlug: string;
  // 8 · Redes
  socialInstagram: string;
  socialFacebook: string;
  socialTiktok: string;
  socialLinkedin: string;
}

export interface ConfigSection {
  id: string;
  title: string;
  blurb: string;
  requiredHint?: string;
}

export const CONFIG_SECTIONS: ConfigSection[] = [
  {
    id: 'sitio',
    title: '1 · Sitio web',
    blurb: 'Si ya tiene página, la usamos para prellenar marca y tono. Si no, se salta.',
  },
  {
    id: 'marca',
    title: '2 · Marca y voz',
    blurb: 'Identidad que ve el cliente en landings, blogs y panel.',
    requiredHint: 'Obligatorio: nombre de marca y tono',
  },
  {
    id: 'contacto',
    title: '3 · Contacto',
    blurb: 'WhatsApp y correo salen en CTAs, footer y botón flotante.',
    requiredHint: 'Obligatorio: WhatsApp con código de país',
  },
  {
    id: 'ubicacion',
    title: '4 · Ubicación',
    blurb: 'Ciudad / región para SEO local y copy (“en Guadalajara…”).',
    requiredHint: 'Obligatorio: ciudad',
  },
  {
    id: 'oferta',
    title: '5 · Oferta',
    blurb: 'Servicios y cliente ideal: alimentan H1, secciones y FAQ.',
    requiredHint: 'Obligatorio: servicios y cliente ideal',
  },
  {
    id: 'keywords',
    title: '6 · Keywords',
    blurb: 'Hasta ~15 frases; el motor las prioriza en títulos y cuerpos.',
  },
  {
    id: 'publicacion',
    title: '7 · Dónde publica',
    blurb: 'Dominio propio + CMS, o preview en *.pinkpurple.site.',
  },
  {
    id: 'redes',
    title: '8 · Redes (opcional)',
    blurb: 'Enlaces sociales para footer y schema cuando existan.',
  },
];

export const TONE_OPTIONS: { id: NexusTone; label: string; hint: string }[] = [
  { id: 'formal', label: 'Formal', hint: 'Corporativo, serio' },
  { id: 'cercano', label: 'Cercano-casual', hint: 'Amable, conversacional' },
  { id: 'experto', label: 'Técnico-profesional', hint: 'Autoridad, preciso' },
];

export const CMS_OPTIONS: { id: CmsPlatform; label: string }[] = [
  { id: 'wordpress', label: 'WordPress' },
  { id: 'shopify', label: 'Shopify' },
  { id: 'other', label: 'Otro / custom' },
  { id: 'none', label: 'Sin CMS (solo preview Nexus)' },
];

export const EMPTY_CONFIG: NexusClientConfig = {
  siteHomeUrl: '',
  brandName: '',
  tagline: '',
  tone: 'cercano',
  colors: '',
  logoUrl: '',
  whatsapp: '',
  contactEmail: '',
  phone: '',
  cityFocus: '',
  stateRegion: '',
  address: '',
  servicesOffered: '',
  idealClient: '',
  targetKeywords: '',
  hasOwnSite: false,
  cmsPlatform: 'none',
  publishSlug: '',
  socialInstagram: '',
  socialFacebook: '',
  socialTiktok: '',
  socialLinkedin: '',
};

/** Ejemplo rellenable para revisar el diseño con datos reales. */
export const SAMPLE_CONFIG: NexusClientConfig = {
  siteHomeUrl: 'https://ejemplo-negocio.mx',
  brandName: 'Estudio Norte',
  tagline: 'Diseño y obra para casas en CDMX',
  tone: 'cercano',
  colors: '#1e3a8a, #f8fafc',
  logoUrl: '',
  whatsapp: '+52 55 1234 5678',
  contactEmail: 'hola@estudionorte.mx',
  phone: '',
  cityFocus: 'Ciudad de México',
  stateRegion: 'CDMX',
  address: 'Col. Roma Norte',
  servicesOffered: 'Diseño interior, remodelación completa, asesoría de materiales',
  idealClient: 'Familias que remodelan casa o depto en CDMX y quieren un solo equipo de principio a fin',
  targetKeywords:
    'remodelación CDMX, diseño interior Roma Norte, remodelar departamento Ciudad de México',
  hasOwnSite: true,
  cmsPlatform: 'wordpress',
  publishSlug: 'estudio-norte',
  socialInstagram: 'https://instagram.com/estudionorte',
  socialFacebook: '',
  socialTiktok: '',
  socialLinkedin: '',
};

export const STORAGE_KEY = 'pp_nexus_client_config_prototype_v1';

export function loadConfig(): NexusClientConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_CONFIG };
    return { ...EMPTY_CONFIG, ...JSON.parse(raw) };
  } catch {
    return { ...EMPTY_CONFIG };
  }
}

export function saveConfig(config: NexusClientConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

/** Checklist rápida de campos obligatorios (misma lógica que onboarding Nexus). */
export function missingRequired(config: NexusClientConfig): string[] {
  const miss: string[] = [];
  if (!config.brandName.trim() || config.brandName.trim().length < 2) miss.push('Nombre de marca');
  if (!config.tone) miss.push('Tono de voz');
  if (!config.whatsapp.trim()) miss.push('WhatsApp');
  if (!config.cityFocus.trim()) miss.push('Ciudad');
  if (!config.servicesOffered.trim()) miss.push('Servicios / productos');
  if (!config.idealClient.trim()) miss.push('Cliente ideal');
  if (config.hasOwnSite && !config.siteHomeUrl.trim()) miss.push('URL del sitio propio');
  return miss;
}
