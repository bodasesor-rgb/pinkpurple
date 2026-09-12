/**
 * Catálogo de productos PinkPurple Studio.
 * Agregar nuevos items aquí; el submenú y /productos se actualizan solos.
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
      'PinkPurple SEO escribe y publica landings de venta, blogs y páginas SEO con diseño idéntico al de tu sitio. Incluye investigación de keywords, optimización SEO 100/100 para Google e IA, y publicación directa en WordPress, Shopify, Netlify y otros servidores — sin copiar ni pegar. Genera landings de campaña listas para convertir, blogs con intención de búsqueda y cobertura escalable por servicio o zona.',
    image: '/brand/seo-product.jpg',
    imageAlt: 'PinkPurple SEO — cohete y crecimiento en buscadores',
    highlights: [
      'SEO 100/100 (Google + IA)',
      'Páginas con diseño idéntico a tu web',
      'Generador de landings de venta',
      'Blogs y páginas SEO escalables',
      'Publicación multi-servidor (WordPress, Shopify, Netlify…)',
    ],
  },
];

export function getProductBySlug(slug) {
  return PRODUCTS.find((p) => p.slug === slug) || null;
}

export function getLiveProducts() {
  return PRODUCTS.filter((p) => p.status === 'live');
}
