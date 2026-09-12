/**
 * Catálogo de productos PinkPurple Studio.
 * Agregar nuevos items aquí; el carrusel del home y /productos se actualizan solos.
 * status: 'live' | 'soon'
 */
export const PRODUCTS = [
  {
    id: 'seo',
    name: 'PinkPurple SEO',
    slug: 'seo',
    href: '/productos/seo',
    status: 'live',
    tagline: 'Generador de landings de venta, blogs y SEO 100/100',
    description:
      'PinkPurple SEO escribe y publica landings de venta, blogs y páginas SEO con el diseño de tus sitios. Incluye keywords, SEO 100/100 para Google e IA, y publicación en WordPress, Shopify, Netlify y más — en una o varias páginas web según tu plan (Mini 1, Starter 3, Growth 6, Pro 15, Diamond ilimitadas).',
    image: '/brand/seo-product.jpg',
    imageAlt: 'PinkPurple SEO — cohete y crecimiento en buscadores',
    highlights: [
      'Investigación de demanda',
      'Optimización Google + IA',
      'Integración WordPress, Shopify, Netlify…',
      'SEO 100/100 (Google + IA)',
      'Conecta varias páginas web por plan',
      'Generador de landings de venta',
    ],
  },
  {
    id: 'ads',
    name: 'PinkPurple Ads',
    slug: 'ads',
    href: '/productos',
    status: 'soon',
    tagline: 'Automatización de campañas y creatividades (próximamente).',
    description: 'Próximo producto en el mismo panel Studio.',
    image: '/brand/seo-product.jpg',
    imageAlt: 'PinkPurple Ads — próximamente',
    highlights: [
      'Misma cuenta Studio',
      'Aparecerá en tu panel',
      'Aviso al lanzar',
    ],
  },
  {
    id: 'crm',
    name: 'PinkPurple CRM',
    slug: 'crm',
    href: '/productos',
    status: 'soon',
    tagline: 'Seguimiento de leads orgánicos y de campaña (próximamente).',
    description: 'Próximo producto en el mismo panel Studio.',
    image: '/brand/seo-product.jpg',
    imageAlt: 'PinkPurple CRM — próximamente',
    highlights: [
      'Leads en un solo lugar',
      'Conexión con el panel',
      'Aviso al lanzar',
    ],
  },
  {
    id: 'social',
    name: 'PinkPurple Social',
    slug: 'social',
    href: '/productos',
    status: 'soon',
    tagline: 'Contenido y publicación en redes (próximamente).',
    description: 'Próximo producto en el mismo panel Studio.',
    image: '/brand/seo-product.jpg',
    imageAlt: 'PinkPurple Social — próximamente',
    highlights: [
      'Calendario de contenido',
      'Misma marca Studio',
      'Aviso al lanzar',
    ],
  },
  {
    id: 'ops',
    name: 'PinkPurple Ops',
    slug: 'ops',
    href: '/productos',
    status: 'soon',
    tagline: 'Operaciones y reportes automáticos (próximamente).',
    description: 'Próximo producto en el mismo panel Studio.',
    image: '/brand/seo-product.jpg',
    imageAlt: 'PinkPurple Ops — próximamente',
    highlights: [
      'Reportes listos',
      'Panel unificado',
      'Aviso al lanzar',
    ],
  },
];

export function getProductBySlug(slug) {
  return PRODUCTS.find((p) => p.slug === slug) || null;
}

export function getLiveProducts() {
  return PRODUCTS.filter((p) => p.status === 'live');
}

export function getCatalogProducts() {
  return PRODUCTS;
}
