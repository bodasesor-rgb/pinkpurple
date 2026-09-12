/**
 * Casos de crecimiento inventados (estilo Search Console) para el home.
 * Cada serie muestra curva plana → subida tras empezar con PinkPurple.
 */

function buildSeries({ points = 14, flat = 0.18, rise = 0.92, startAt = 6, noise = 0.04 }) {
  const clicks = [];
  const impressions = [];
  for (let i = 0; i < points; i += 1) {
    const t = i < startAt ? flat + (i / startAt) * 0.06 : flat + 0.08 + ((i - startAt) / (points - startAt - 1)) * (rise - flat);
    const wobble = Math.sin(i * 1.7 + noise * 20) * noise;
    const c = Math.max(0.05, Math.min(1, t + wobble));
    const im = Math.max(0.08, Math.min(1, t * 0.95 + wobble * 0.6 + 0.05));
    clicks.push(c);
    impressions.push(im);
  }
  return { clicks, impressions, startAt };
}

const dateLabels = [
  '07/07',
  '14/07',
  '21/07',
  '28/07',
  '04/08',
  '11/08',
  '18/08',
  '25/08',
  '01/09',
  '08/09',
  '15/09',
  '22/09',
  '29/09',
  '04/10',
];

export const GROWTH_CASES = [
  {
    id: 'dental',
    business: 'Clínica dental · CDMX',
    niche: 'Salud local',
    startLabel: 'Empecé a usar PinkPurple',
    period: 'A diario',
    metrics: {
      clicks: '12,4 mil',
      impressions: '410.000',
      ctr: '3,0%',
      position: '8,2',
    },
    dates: dateLabels,
    ...buildSeries({ flat: 0.14, rise: 0.94, startAt: 6, noise: 0.03 }),
  },
  {
    id: 'inmobiliaria',
    business: 'Inmobiliaria · Guadalajara',
    niche: 'Bienes raíces',
    startLabel: 'Empecé a usar PinkPurple',
    period: 'A diario',
    metrics: {
      clicks: '28 mil',
      impressions: '890.000',
      ctr: '3,1%',
      position: '6,4',
    },
    dates: dateLabels,
    ...buildSeries({ flat: 0.2, rise: 0.98, startAt: 5, noise: 0.035 }),
  },
  {
    id: 'ecommerce',
    business: 'Tienda online · moda',
    niche: 'Ecommerce',
    startLabel: 'Empecé a usar PinkPurple',
    period: 'A diario',
    metrics: {
      clicks: '89 mil',
      impressions: '980.000',
      ctr: '9,1%',
      position: '7,9',
    },
    dates: dateLabels,
    ...buildSeries({ flat: 0.16, rise: 0.96, startAt: 6, noise: 0.025 }),
  },
  {
    id: 'legal',
    business: 'Despacho legal · Monterrey',
    niche: 'Servicios profesionales',
    startLabel: 'Empecé a usar PinkPurple',
    period: 'A diario',
    metrics: {
      clicks: '6,8 mil',
      impressions: '215.000',
      ctr: '3,2%',
      position: '5,1',
    },
    dates: dateLabels,
    ...buildSeries({ flat: 0.12, rise: 0.88, startAt: 7, noise: 0.04 }),
  },
  {
    id: 'restaurante',
    business: 'Cadena de restaurantes · LATAM',
    niche: 'Hostelería',
    startLabel: 'Empecé a usar PinkPurple',
    period: 'A diario',
    metrics: {
      clicks: '41 mil',
      impressions: '1,2 M',
      ctr: '3,4%',
      position: '9,3',
    },
    dates: dateLabels,
    ...buildSeries({ flat: 0.18, rise: 0.91, startAt: 6, noise: 0.045 }),
  },
];
