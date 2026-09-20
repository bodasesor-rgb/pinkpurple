/**
 * Plataformas de publicación del prototipo Config Nexus.
 * Cada marca en su zona; tutorial “Cómo lo hago” para obtener API key / conexión.
 */

export type PublishTarget =
  | 'preview'
  | 'netlify'
  | 'wordpress'
  | 'shopify'
  | 'wix'
  | 'webflow'
  | 'squarespace'
  | 'hostinger'
  | 'other';

export type PublishMode = 'preview' | 'netlify_build' | 'nexus_api' | 'manual_review';

export interface PublishHowTo {
  title: string;
  canPushWithApiKey: boolean;
  summary: string;
  steps: string[];
  fieldsNote?: string;
}

export interface PublishPlatformOption {
  id: PublishTarget;
  label: string;
  hint: string;
  mode: PublishMode;
  howTo: PublishHowTo;
}

export const PUBLISH_PLATFORMS: PublishPlatformOption[] = [
  {
    id: 'preview',
    label: 'Preview PinkPurple',
    hint: 'Sin sitio propio. Solo *.pinkpurple.site',
    mode: 'preview',
    howTo: {
      title: 'Preview PinkPurple',
      canPushWithApiKey: false,
      summary: 'No necesitas API key. Te asignamos un subdominio de vista previa.',
      steps: [
        'Elige un slug corto (ej. mi-marca).',
        'Tu preview quedará en mi-marca.pinkpurple.site.',
        'Cuando tengas dominio o CMS, cambia a WordPress, Netlify, etc.',
      ],
    },
  },
  {
    id: 'netlify',
    label: 'Netlify',
    hint: 'Como Bodasesor: el deploy lo hace Netlify en su build',
    mode: 'netlify_build',
    howTo: {
      title: 'Conectar Netlify (sin que Nexus pise tu sitio)',
      canPushWithApiKey: false,
      summary:
        'Nexus no hace push de HTML a tu repo. Netlify baja el SEO en el build y publica desde tu código.',
      steps: [
        'Entra a app.netlify.com e inicia sesión.',
        'Abre tu sitio → Site configuration → General → Site details (copia el Site ID).',
        'Opcional: Site configuration → Build & deploy → Build hooks → Add build hook. Copia la URL del hook.',
        'Pega aquí el Site ID (o URL del sitio) y el build hook / token.',
        'En el build de Netlify se sincroniza el SEO; el push lo hace Netlify, no Nexus.',
      ],
      fieldsNote: 'Site ID + build hook. No uses un “API key” genérico de CMS.',
    },
  },
  {
    id: 'wordpress',
    label: 'WordPress',
    hint: 'Application Password / REST API — Nexus puede publicar',
    mode: 'nexus_api',
    howTo: {
      title: 'API key en WordPress (Application Password)',
      canPushWithApiKey: true,
      summary:
        'Sí: con Application Password Nexus publica por la REST API sin tocar tu tema a mano.',
      steps: [
        'Entra al escritorio de WordPress (tu-dominio.com/wp-admin).',
        'Ve a Usuarios → Perfil (o Usuarios → Tu perfil).',
        'Baja hasta “Contraseñas de aplicación” / Application Passwords.',
        'Pon un nombre (ej. PinkPurple Nexus) → Añadir contraseña de aplicación.',
        'Copia la contraseña que aparece una sola vez (formato xxxx xxxx xxxx…).',
        'Aquí pegas: URL del sitio + usuario WP + esa Application Password como “API key”.',
        'Si no ves Application Passwords: activa HTTPS y WordPress 5.6+, o un plugin de Application Passwords.',
      ],
      fieldsNote: 'URL del sitio + Application Password (y usuario en el backend real).',
    },
  },
  {
    id: 'shopify',
    label: 'Shopify',
    hint: 'Admin API access token — Nexus puede publicar',
    mode: 'nexus_api',
    howTo: {
      title: 'API key en Shopify (Admin API)',
      canPushWithApiKey: true,
      summary: 'Sí: con un Custom App y Admin API access token Nexus puede crear/actualizar contenido.',
      steps: [
        'Entra a tu admin de Shopify (tu-tienda.myshopify.com/admin).',
        'Ve a Settings → Apps and sales channels → Develop apps.',
        'Create an app → ponle nombre (ej. PinkPurple).',
        'Configure Admin API scopes: al menos write_content / write_products / read_products según lo que publiques.',
        'Install app → revela Admin API access token (shpat_…).',
        'Copia el token y pégalo aquí junto con la URL de la tienda.',
        'Guarda el token en un lugar seguro; Shopify solo lo muestra una vez.',
      ],
      fieldsNote: 'URL de la tienda + Admin API access token.',
    },
  },
  {
    id: 'wix',
    label: 'Wix',
    hint: 'API key de cuenta — Nexus puede publicar (con límites)',
    mode: 'nexus_api',
    howTo: {
      title: 'API key en Wix',
      canPushWithApiKey: true,
      summary:
        'Sí, con API Key de cuenta (y a veces OAuth de app). Hay límites según el plan Wix.',
      steps: [
        'Entra a manage.wix.com con tu cuenta.',
        'Ve a Account Settings → API Keys (o Account → Developer settings → API Keys).',
        'Generate API Key → elige los permisos de sitio / contenido que necesites.',
        'Copia la clave y el Site ID del sitio (Dashboard → Settings → Site info, o en la URL del editor).',
        'Pega aquí la URL pública del sitio y la API key.',
        'Si Wix pide OAuth de app en vez de API Key, contacta soporte PinkPurple para el flujo guiado.',
      ],
      fieldsNote: 'URL del sitio + API Key (Site ID se puede inferir o pedir en el panel real).',
    },
  },
  {
    id: 'webflow',
    label: 'Webflow',
    hint: 'Site token / API v2 — Nexus puede publicar',
    mode: 'nexus_api',
    howTo: {
      title: 'API key en Webflow',
      canPushWithApiKey: true,
      summary: 'Sí: con Site API token Nexus puede crear CMS items y disparar publish.',
      steps: [
        'Entra a webflow.com → abre tu sitio en el Dashboard.',
        'Site settings → Apps & integrations → API access.',
        'Generate API token (o Site token) con permisos de CMS / sites.',
        'Copia el token y el Site ID si aparece.',
        'Pega aquí la URL del sitio publicado y el token.',
        'Tras publicar por API, Webflow puede requerir “Publish” al hosting (staging/prod).',
      ],
      fieldsNote: 'URL del sitio + API / Site token.',
    },
  },
  {
    id: 'squarespace',
    label: 'Squarespace',
    hint: 'API limitada — revisar caso a caso',
    mode: 'manual_review',
    howTo: {
      title: 'Squarespace y API key',
      canPushWithApiKey: false,
      summary:
        'Hoy no siempre se puede hacer push completo solo con API key. Squarespace restringe escritura según plan/producto.',
      steps: [
        'Revisa en developers.squarespace.com si tu plan incluye Commerce/API.',
        'Si tienes API key de Commerce, úsala solo para catálogo (no landings SEO genéricas).',
        'Para SEO multi-página suele convenir exportar o un flujo manual / Netlify espejo.',
        'Déjanos la URL del sitio; en onboarding real marcamos si tu cuenta admite push o no.',
      ],
      fieldsNote: 'URL del sitio. API key opcional si tu plan la tiene.',
    },
  },
  {
    id: 'hostinger',
    label: 'Hostinger (u otro hosting PHP)',
    hint: 'Si hay WordPress → usa WordPress. Si es HTML estático, revisar',
    mode: 'manual_review',
    howTo: {
      title: 'Hostinger / hosting clásico',
      canPushWithApiKey: false,
      summary:
        'Hostinger no tiene una sola “API key de página”. Si el sitio es WordPress, usa la opción WordPress.',
      steps: [
        'Si instalaste WordPress en Hostinger: vuelve atrás y elige WordPress (Application Password).',
        'Si es HTML/PHP suelto: hace falta FTP/SFTP o Git — no basta un API key del panel.',
        'En hPanel puedes crear cuenta FTP; eso no es API key web y no va en este campo.',
        'Para push automático sin WP, conviene migrar a Netlify o WordPress.',
      ],
      fieldsNote: 'Preferimos WordPress Application Password si aplica.',
    },
  },
  {
    id: 'other',
    label: 'Otro CMS / custom',
    hint: 'Revisamos si admite API de escritura',
    mode: 'manual_review',
    howTo: {
      title: 'Otro CMS',
      canPushWithApiKey: false,
      summary:
        'Solo hacemos push con API key si el CMS tiene API de escritura documentada (REST/GraphQL).',
      steps: [
        'Indica la URL del sitio y el nombre del CMS (Ghost, Contao, custom, etc.).',
        'Busca en su docs: “API token”, “Personal access token” o “Application password”.',
        'Si la API permite crear páginas/posts, pégala aquí y en onboarding real la validamos.',
        'Si solo hay FTP/SSH, no usamos este campo: se define otro flujo (como Netlify o WP).',
      ],
      fieldsNote: 'URL + API key solo si existe API de escritura.',
    },
  },
];

export function getPublishPlatform(id: PublishTarget): PublishPlatformOption | undefined {
  return PUBLISH_PLATFORMS.find((p) => p.id === id);
}

export function isApiKeyPublish(id: PublishTarget): boolean {
  const p = getPublishPlatform(id);
  return p?.mode === 'nexus_api' || (p?.mode === 'manual_review' && id === 'other');
}

export function migratePublishTarget(raw: unknown): PublishTarget {
  const v = String(raw || '');
  if (PUBLISH_PLATFORMS.some((p) => p.id === v)) return v as PublishTarget;
  if (v === 'api') return 'wordpress';
  return 'preview';
}
