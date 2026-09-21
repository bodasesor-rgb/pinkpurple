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
      'PinkPurple SEO escribe y publica landings de venta, blogs y páginas SEO con el diseño de tus sitios. Incluye keywords, SEO 100/100 para Google e IA, y publicación en WordPress, Shopify, Netlify y más — en una o varias páginas web según tu plan (Mini 1, Starter 2, Growth 5, Pro 10, Diamond ilimitadas).',
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
    image: '/brand/product-ads.jpg',
    imageAlt: 'PinkPurple Ads — automatización de campañas',
    highlights: [
      'Campañas asistidas por IA',
      'Creatividades y testing',
      'Misma cuenta Studio',
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
    image: '/brand/product-crm.png',
    imageAlt: 'PinkPurple CRM — panel de leads y clientes',
    highlights: [
      'Leads en un solo lugar',
      'Pipeline y seguimiento',
      'Conexión con el panel',
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
    image: '/brand/product-social.jpg',
    imageAlt: 'PinkPurple Social — calendario de contenido',
    highlights: [
      'Calendario de contenido',
      'Publicación programada',
      'Misma marca Studio',
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
    image: '/brand/product-ops.jpg',
    imageAlt: 'PinkPurple Ops — dashboards y reportes',
    highlights: [
      'Reportes y dashboards',
      'Operación unificada',
      'Panel Studio',
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
