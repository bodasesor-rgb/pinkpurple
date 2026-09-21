/**
 * Datos que el cliente llena para personalizar su Nexus.
 * Flujo real: onboarding PinkPurple (`/onboarding`) + alta en entrada (Nueva empresa).
 * Este prototipo del sitio marketing sirve de referencia visual.
 */

import type { CountryCode } from './locations';
import { migratePublishTarget, type PublishTarget } from './publishPlatforms';

export type { PublishTarget } from './publishPlatforms';
export type NexusTone = 'formal' | 'cercano' | 'experto';

export type SocialNetworkId =
  | 'instagram'
  | 'facebook'
  | 'tiktok'
  | 'linkedin'
  | 'youtube'
  | 'x'
  | 'pinterest'
  | 'whatsapp'
  | 'other';

export interface SocialLink {
  id: string;
  network: SocialNetworkId;
  /** Si network === 'other', nombre libre (Threads, Behance…). */
  customName?: string;
  url: string;
}

export interface NexusClientConfig {
  siteHomeUrl: string;
  brandName: string;
  tagline: string;
  tone: NexusTone;
  /** Lista de hex de marca (#rrggbb). */
  brandColors: string[];
  logoUrl: string;
  whatsapp: string;
  contactEmail: string;
  phone: string;
  countryCode: CountryCode | '';
  /** División local (antes “estado”); en UI se muestra como “Ciudad”. */
  stateRegion: string;
  cityFocus: string;
  address: string;
  servicesOffered: string;
  idealClient: string;
  targetKeywords: string;
  hasOwnSite: boolean;
  publishTarget: PublishTarget;
  publishSlug: string;
  publishSiteUrl: string;
  publishApiKey: string;
  netlifySiteId: string;
  netlifyConnectToken: string;
  socialLinks: SocialLink[];
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
    blurb:
      'Pega la URL y lanza un escaneo extremo: home + páginas de contacto/nosotros/servicios. Rellena marca, contacto, ubicación, redes y keywords.',
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
    blurb: 'WhatsApp (obligatorio), correo y teléfono extra si lo necesitas — van a CTAs, footer y botón flotante.',
    requiredHint: 'Obligatorio: WhatsApp con código de país',
  },
  {
    id: 'ubicacion',
    title: '4 · Ubicación',
    blurb: 'País y ciudad (división local) para SEO local.',
    requiredHint: 'Obligatorio: país y ciudad',
  },
  {
    id: 'oferta',
    title: '5 · Oferta',
    blurb: 'Qué ofreces y a quién le hablas: alimentan H1, secciones y FAQ.',
    requiredHint: 'Obligatorio: oferta y cliente ideal',
  },
  {
    id: 'keywords',
    title: '6 · Keywords',
    blurb: 'Hasta ~15 frases de búsqueda; el motor las prioriza en títulos y cuerpos.',
  },
  {
    id: 'publicacion',
    title: '7 · Dónde publica',
    blurb:
      'Elige la plataforma (cada una aparte). Netlify despliega en su build; WordPress/Shopify/Wix/Webflow admiten push con API key.',
  },
  {
    id: 'redes',
    title: '8 · Redes (opcional)',
    blurb: 'Agrega las que uses. Puedes sumar más redes cuando quieras.',
  },
];

export const TONE_OPTIONS: { id: NexusTone; label: string; hint: string }[] = [
  { id: 'formal', label: 'Formal', hint: 'Corporativo, serio' },
  { id: 'cercano', label: 'Cercano-casual', hint: 'Amable, conversacional' },
  { id: 'experto', label: 'Técnico-profesional', hint: 'Autoridad, preciso' },
];

export const SOCIAL_NETWORK_OPTIONS: { id: SocialNetworkId; label: string }[] = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'x', label: 'X (Twitter)' },
  { id: 'pinterest', label: 'Pinterest' },
  { id: 'whatsapp', label: 'WhatsApp (canal)' },
  { id: 'other', label: 'Otra…' },
];

function newSocialId(): string {
  return `soc_${Math.random().toString(36).slice(2, 10)}`;
}

export function createSocialLink(
  network: SocialNetworkId = 'instagram',
  url = '',
): SocialLink {
  return { id: newSocialId(), network, url };
}

export const EMPTY_CONFIG: NexusClientConfig = {
  siteHomeUrl: '',
  brandName: '',
  tagline: '',
  tone: 'cercano',
  brandColors: [],
  logoUrl: '',
  whatsapp: '',
  contactEmail: '',
  phone: '',
  countryCode: 'MX',
  stateRegion: '',
  cityFocus: '',
  address: '',
  servicesOffered: '',
  idealClient: '',
  targetKeywords: '',
  hasOwnSite: false,
  publishTarget: 'preview',
  publishSlug: '',
  publishSiteUrl: '',
  publishApiKey: '',
  netlifySiteId: '',
  netlifyConnectToken: '',
  socialLinks: [
    createSocialLink('instagram'),
    createSocialLink('facebook'),
  ],
};

export const SAMPLE_CONFIG: NexusClientConfig = {
  ...EMPTY_CONFIG,
  siteHomeUrl: 'https://ejemplo-negocio.mx',
  brandName: 'Estudio Norte',
  tagline: 'Diseño y obra para casas en CDMX',
  tone: 'cercano',
  brandColors: ['#1e3a8a', '#f8fafc'],
  whatsapp: '+52 55 1234 5678',
  contactEmail: 'hola@estudionorte.mx',
  countryCode: 'MX',
  stateRegion: 'Ciudad de México',
  cityFocus: '',
  address: 'Col. Roma Norte',
  servicesOffered: 'Diseño interior, remodelación completa, asesoría de materiales',
  idealClient:
    'Familias que buscan un equipo completo para remodelar casa o departamento',
  targetKeywords:
    'remodelación residencial, diseño interior, remodelar departamento',
  hasOwnSite: true,
  publishTarget: 'wordpress',
  publishSiteUrl: 'https://ejemplo-negocio.mx',
  publishApiKey: '',
  publishSlug: 'estudio-norte',
  socialLinks: [
    createSocialLink('instagram', 'https://instagram.com/estudionorte'),
    createSocialLink('facebook', ''),
    { ...createSocialLink('other', 'https://threads.net/@estudionorte'), customName: 'Threads' },
  ],
};

export const STORAGE_KEY = 'pp_nexus_client_config_prototype_v3';

function parseColorList(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw
      .map((c) => String(c).trim())
      .filter((c) => /^#?[0-9a-f]{3,8}$/i.test(c))
      .map((c) => (c.startsWith('#') ? c.toLowerCase() : `#${c.toLowerCase()}`));
  }
  if (typeof raw === 'string' && raw.trim()) {
    return raw
      .split(/[,;\s]+/)
      .map((c) => c.trim())
      .filter((c) => /^#?[0-9a-f]{3,8}$/i.test(c))
      .map((c) => (c.startsWith('#') ? c.toLowerCase() : `#${c.toLowerCase()}`));
  }
  return [];
}

function migrateLegacy(raw: Record<string, unknown>): Partial<NexusClientConfig> {
  const next: Partial<NexusClientConfig> = { ...raw } as Partial<NexusClientConfig>;

  if (!Array.isArray(raw.socialLinks)) {
    const links: SocialLink[] = [];
    const map: [SocialNetworkId, string][] = [
      ['instagram', String(raw.socialInstagram || '')],
      ['facebook', String(raw.socialFacebook || '')],
      ['tiktok', String(raw.socialTiktok || '')],
      ['linkedin', String(raw.socialLinkedin || '')],
    ];
    for (const [network, url] of map) {
      if (url || network === 'instagram' || network === 'facebook') {
        links.push(createSocialLink(network, url));
      }
    }
    next.socialLinks = links.length ? links : EMPTY_CONFIG.socialLinks;
  }

  if (raw.publishTarget != null) {
    next.publishTarget = migratePublishTarget(raw.publishTarget);
  } else if (raw.hasOwnSite === false || raw.cmsPlatform === 'none') {
    next.publishTarget = 'preview';
  } else if (String(raw.cmsPlatform || '').includes('netlify')) {
    next.publishTarget = 'netlify';
  } else if (String(raw.cmsPlatform || '') === 'shopify') {
    next.publishTarget = 'shopify';
  } else if (String(raw.cmsPlatform || '') === 'wordpress' || raw.hasOwnSite) {
    next.publishTarget = 'wordpress';
  } else {
    next.publishTarget = 'preview';
  }

  if (!raw.countryCode) next.countryCode = 'MX';
  if (!raw.publishSiteUrl && raw.siteHomeUrl) next.publishSiteUrl = String(raw.siteHomeUrl);

  // Colores: string "a, b" o brandColors[]
  if (!Array.isArray(raw.brandColors)) {
    next.brandColors = parseColorList(raw.brandColors ?? raw.colors);
  }

  // Si había ciudad suelta y no estado, súbela a stateRegion (ahora “Ciudad” en UI)
  if (!String(raw.stateRegion || '').trim() && String(raw.cityFocus || '').trim()) {
    next.stateRegion = String(raw.cityFocus);
  }

  return next;
}

export function loadConfig(): NexusClientConfig {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEY) ||
      localStorage.getItem('pp_nexus_client_config_prototype_v2') ||
      localStorage.getItem('pp_nexus_client_config_prototype_v1');
    if (!raw) {
      return {
        ...EMPTY_CONFIG,
        brandColors: [],
        socialLinks: EMPTY_CONFIG.socialLinks.map((s) => ({ ...s })),
      };
    }
    const parsed = migrateLegacy(JSON.parse(raw) as Record<string, unknown>);
    return {
      ...EMPTY_CONFIG,
      ...parsed,
      brandColors: Array.isArray(parsed.brandColors) ? [...parsed.brandColors] : [],
      socialLinks: Array.isArray(parsed.socialLinks)
        ? parsed.socialLinks.map((s) => ({ ...s }))
        : EMPTY_CONFIG.socialLinks.map((s) => ({ ...s })),
    };
  } catch {
    return {
      ...EMPTY_CONFIG,
      brandColors: [],
      socialLinks: EMPTY_CONFIG.socialLinks.map((s) => ({ ...s })),
    };
  }
}

export function saveConfig(config: NexusClientConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function missingRequired(config: NexusClientConfig): string[] {
  const miss: string[] = [];
  if (!config.brandName.trim() || config.brandName.trim().length < 2) miss.push('Nombre de marca');
  if (!config.tone) miss.push('Tono de voz');
  if (!config.whatsapp.trim()) miss.push('WhatsApp');
  if (!config.countryCode) miss.push('País');
  if (!config.stateRegion.trim()) miss.push('Ciudad');
  if (!config.servicesOffered.trim()) miss.push('Oferta / servicios');
  if (!config.idealClient.trim()) miss.push('Cliente ideal');

  if (config.publishTarget === 'preview' && !config.publishSlug.trim() && !config.brandName.trim()) {
    miss.push('Slug de preview');
  }
  const apiTargets = new Set(['wordpress', 'shopify', 'wix', 'webflow', 'other']);
  if (apiTargets.has(config.publishTarget)) {
    if (!config.publishSiteUrl.trim()) miss.push('URL del sitio');
    if (
      (config.publishTarget === 'wordpress' ||
        config.publishTarget === 'shopify' ||
        config.publishTarget === 'wix' ||
        config.publishTarget === 'webflow') &&
      !config.publishApiKey.trim()
    ) {
      miss.push('API key / token');
    }
  }
  if (config.publishTarget === 'netlify') {
    if (!config.netlifySiteId.trim() && !config.publishSiteUrl.trim()) {
      miss.push('Site ID o URL Netlify');
    }
  }
  return miss;
}

export function socialLabel(link: SocialLink): string {
  if (link.network === 'other') return (link.customName || 'Otra red').trim() || 'Otra red';
  return SOCIAL_NETWORK_OPTIONS.find((o) => o.id === link.network)?.label || link.network;
}
