/** Planes PinkPurple SEO (marketing + checkout demo). */
export const ANNUAL_DISCOUNT = 0.25;

export const PLANS = [
  {
    id: 'free',
    name: 'Prueba gratis',
    price: 0,
    landings: 5,
    blogs: 5,
    tokens: 0,
    sites: 1,
    featured: false,
    oneShot: true,
  },
  {
    id: 'mini',
    name: 'Mini',
    price: 20,
    landings: 50,
    blogs: 50,
    sites: 1,
    featured: false,
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    landings: 150,
    blogs: 100,
    sites: 3,
    featured: false,
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 99,
    landings: 400,
    blogs: 150,
    sites: 6,
    featured: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 199,
    landings: 1000,
    blogs: 250,
    sites: 15,
    featured: false,
  },
  {
    id: 'diamond',
    name: 'Diamond',
    price: 349,
    landings: 2500,
    blogs: 400,
    sites: null, // ilimitadas
    featured: false,
  },
];

export function getPlanById(id) {
  const key = String(id || 'free').toLowerCase();
  return PLANS.find((p) => p.id === key) || PLANS[0];
}

export function getPlanPricing(monthlyPrice) {
  if (!monthlyPrice) {
    return { monthly: 0, annualPerMonth: 0, annualTotal: 0, savings: 0 };
  }
  const yearlyIfMonthly = monthlyPrice * 12;
  const annualTotal = Math.round(yearlyIfMonthly * (1 - ANNUAL_DISCOUNT));
  const annualPerMonth = Math.round(annualTotal / 12);
  return {
    monthly: monthlyPrice,
    annualPerMonth,
    annualTotal,
    savings: yearlyIfMonthly - annualTotal,
  };
}

export function formatPrice(price) {
  if (!price) return 'Gratis';
  return `$${price}`;
}

export function formatNum(n) {
  return Number(n || 0).toLocaleString('es-MX');
}

/** Sitios / páginas web conectables por plan. */
export function formatSites(sites) {
  if (sites == null || sites === Infinity) return 'Ilimitadas';
  if (Number(sites) === 1) return '1 página web';
  return `${formatNum(sites)} páginas web`;
}
