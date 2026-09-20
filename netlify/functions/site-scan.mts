/**
 * Escaneo extremo de un sitio (prototipo Config Nexus).
 * Corre en Netlify Function para evitar CORS: baja HTML, sigue páginas clave
 * y extrae marca, contacto, ubicación, redes, servicios y keywords.
 */

const UA = 'PinkPurpleSiteScan/2.0 (+https://pinkpurple.seo; brand research)';

type SocialMap = Record<string, string>;

interface ScanPage {
  url: string;
  status: number;
  title: string;
  bytes: number;
}

interface ExtremeScanResult {
  ok: boolean;
  url: string;
  scannedAt: string;
  pages: ScanPage[];
  brandName: string;
  tagline: string;
  title: string;
  description: string;
  h1: string;
  h2s: string[];
  nav: string[];
  logoUrl: string;
  colors: string[];
  fonts: string[];
  tone: 'formal' | 'cercano' | 'experto';
  voiceNotes: string;
  phone: string;
  whatsapp: string;
  contactEmail: string;
  address: string;
  city: string;
  stateRegion: string;
  countryHint: string;
  countryCode: string;
  servicesOffered: string;
  idealClient: string;
  keywords: string[];
  social: SocialMap;
  cmsHints: string[];
  warnings: string[];
  rawSample: string;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

function stripTags(html: string): string {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function pick(html: string, re: RegExp): string {
  const m = String(html || '').match(re);
  return m ? String(m[1] || '').replace(/\s+/g, ' ').trim() : '';
}

function decode(text: string, max = 160): string {
  return stripTags(text).slice(0, max);
}

function absolutize(baseUrl: string, href: string): string {
  const h = String(href || '').trim();
  if (!h || h.startsWith('data:') || h.startsWith('javascript:')) return '';
  try {
    return new URL(h, baseUrl).toString();
  } catch {
    return '';
  }
}

function asHexColors(list: string[], max = 8): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of list) {
    const m = String(raw).match(/^#?(?:[0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (!m) continue;
    let hex = m[0].replace(/^#/, '');
    if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
    const full = `#${hex.toLowerCase()}`;
    if (seen.has(full)) continue;
    // skip near-white / near-black noise
    if (/^#(fff|ffffff|000|000000|fafafa|f5f5f5)$/i.test(full)) continue;
    seen.add(full);
    out.push(full);
    if (out.length >= max) break;
  }
  return out;
}

function normalizeWhatsapp(raw: string): string {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 15) return '';
  return digits;
}

function extractHeadings(html: string, tag: string, limit = 12): string[] {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) && out.length < limit) {
    const text = decode(m[1], 120);
    if (text && text.length > 2) out.push(text);
  }
  return out;
}

function extractNav(html: string): string[] {
  const nav = pick(html, /<nav[\s\S]*?<\/nav>/i) || '';
  const labels: string[] = [];
  const re = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(nav)) && labels.length < 14) {
    const label = decode(m[2], 40);
    if (label && label.length > 1 && label.length < 40) labels.push(label);
  }
  return [...new Set(labels)];
}

function parseJsonLd(html: string): Record<string, unknown>[] {
  const blocks: Record<string, unknown>[] = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    try {
      const parsed = JSON.parse(m[1].trim()) as unknown;
      if (Array.isArray(parsed)) blocks.push(...(parsed as Record<string, unknown>[]));
      else if (parsed && typeof parsed === 'object' && Array.isArray((parsed as { '@graph'?: unknown })['@graph'])) {
        blocks.push(...((parsed as { '@graph': Record<string, unknown>[] })['@graph']));
      } else if (parsed && typeof parsed === 'object') {
        blocks.push(parsed as Record<string, unknown>);
      }
    } catch {
      /* ignore */
    }
  }
  return blocks;
}

function typeIncludes(node: Record<string, unknown>, needle: string): boolean {
  const t = node['@type'];
  const arr = Array.isArray(t) ? t : t ? [t] : [];
  return arr.some((x) => String(x).toLowerCase().includes(needle));
}

function guessCountry(text: string): { code: string; name: string } {
  const t = text.toLowerCase();
  const map: [RegExp, string, string][] = [
    [/\bm[eé]xico\b|\bmx\b|\bcdmx\b|\bjalisco\b|\bnuevo le[oó]n\b/, 'MX', 'México'],
    [/\bcolombia\b|\bbogot[aá]\b|\bmedell[ií]n\b/, 'CO', 'Colombia'],
    [/\bargentina\b|\bbuenos aires\b|\bcaba\b/, 'AR', 'Argentina'],
    [/\bchile\b|\bsantiago\b/, 'CL', 'Chile'],
    [/\bper[uú]\b|\blima\b/, 'PE', 'Perú'],
    [/\bespa[nñ]a\b|\bmadrid\b|\bbarcelona\b/, 'ES', 'España'],
    [/\bguatemala\b/, 'GT', 'Guatemala'],
    [/\bcosta rica\b/, 'CR', 'Costa Rica'],
    [/\becuador\b|\bquito\b|\bguayaquil\b/, 'EC', 'Ecuador'],
    [/\bunited states\b|\busa\b|\bcalifornia\b|\btexas\b|\bflorida\b/, 'US', 'Estados Unidos'],
  ];
  for (const [re, code, name] of map) {
    if (re.test(t)) return { code, name };
  }
  return { code: '', name: '' };
}

async function fetchHtml(url: string): Promise<{ html: string; finalUrl: string; status: number }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 16000);
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': UA,
        Accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-MX,es;q=0.9,en;q=0.6',
      },
    });
    const html = await res.text();
    return { html, finalUrl: res.url || url, status: res.status };
  } finally {
    clearTimeout(timer);
  }
}

function extractLogo(html: string, baseUrl: string): string {
  const candidates: string[] = [];
  const push = (href: string) => {
    const abs = absolutize(baseUrl, href);
    if (abs) candidates.push(abs);
  };
  push(pick(html, /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)/i));
  push(pick(html, /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i));
  push(pick(html, /<link[^>]+rel=["'](?:apple-touch-icon|icon|shortcut icon)["'][^>]+href=["']([^"']+)/i));
  push(pick(html, /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:apple-touch-icon|icon|shortcut icon)["']/i));

  const header =
    pick(html, /<header[\s\S]*?<\/header>/i) ||
    pick(html, /<nav[\s\S]*?<\/nav>/i) ||
    html.slice(0, 18000);
  const imgRe = /<img[^>]+>/gi;
  let m: RegExpExecArray | null;
  while ((m = imgRe.exec(header)) && candidates.length < 10) {
    const tag = m[0];
    const src = pick(tag, /src=["']([^"']+)/i) || pick(tag, /data-src=["']([^"']+)/i);
    if (!src) continue;
    if (/logo|brand|site|marca/i.test(tag) || /logo|brand|marca/i.test(src)) push(src);
    else if (candidates.length < 4) push(src);
  }
  return candidates.find(Boolean) || '';
}

function extractSocial(html: string): SocialMap {
  const social: SocialMap = {};
  const re =
    /href=["'](https?:\/\/(?:www\.)?(?:instagram|facebook|fb\.com|tiktok|linkedin|youtube|youtu\.be|x\.com|twitter|pinterest|threads\.net)[^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const link = m[1];
    const u = link.toLowerCase();
    if (u.includes('instagram') && !social.instagram) social.instagram = link;
    else if ((u.includes('facebook') || u.includes('fb.com')) && !social.facebook) social.facebook = link;
    else if (u.includes('tiktok') && !social.tiktok) social.tiktok = link;
    else if (u.includes('linkedin') && !social.linkedin) social.linkedin = link;
    else if ((u.includes('youtube') || u.includes('youtu.be')) && !social.youtube) social.youtube = link;
    else if ((u.includes('x.com') || u.includes('twitter')) && !social.x) social.x = link;
    else if (u.includes('pinterest') && !social.pinterest) social.pinterest = link;
    else if (u.includes('threads.net') && !social.other) social.other = link;
  }
  return social;
}

function extractContact(html: string) {
  const contact = {
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    city: '',
    stateRegion: '',
    countryHint: '',
  };

  for (const node of parseJsonLd(html)) {
    if (!typeIncludes(node, 'localbusiness') && !typeIncludes(node, 'organization') && !typeIncludes(node, 'place')) {
      continue;
    }
    if (!contact.phone && node.telephone) contact.phone = String(node.telephone).slice(0, 40);
    if (!contact.email && node.email) contact.email = String(node.email).toLowerCase().slice(0, 120);
    const addr = node.address;
    if (addr && typeof addr === 'object') {
      const a = addr as Record<string, string>;
      contact.address = [a.streetAddress, a.addressLocality, a.addressRegion, a.addressCountry]
        .filter(Boolean)
        .join(', ')
        .slice(0, 200);
      contact.city = String(a.addressLocality || '').slice(0, 80);
      contact.stateRegion = String(a.addressRegion || '').slice(0, 80);
      contact.countryHint = String(a.addressCountry || '').slice(0, 80);
    } else if (typeof addr === 'string' && !contact.address) {
      contact.address = addr.slice(0, 200);
    }
    const sameAs = Array.isArray(node.sameAs) ? node.sameAs : [];
    void sameAs;
  }

  const footer = pick(html, /<footer[\s\S]*?<\/footer>/i) || html.slice(-12000);
  if (!contact.email) {
    const em = footer.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);
    if (em) contact.email = em[0].toLowerCase();
  }
  if (!contact.phone) {
    const tel = footer.match(/(?:\+?\d[\d\s().-]{8,}\d)/);
    if (tel) contact.phone = tel[0].trim().slice(0, 40);
  }
  const wa =
    html.match(/api\.whatsapp\.com\/send\/?\?[^"'>\s]*phone=(\d+)/i) ||
    html.match(/wa\.me\/(\d+)/i);
  if (wa) contact.whatsapp = normalizeWhatsapp(wa[1]);
  else if (contact.phone) contact.whatsapp = normalizeWhatsapp(contact.phone);

  return contact;
}

function suggestTone(sample: string): 'formal' | 'cercano' | 'experto' {
  const t = sample.toLowerCase();
  const usted = (t.match(/\busted\b|\bles ofrecemos\b|\bnuestro compromiso\b/g) || []).length;
  const tu = (t.match(/\btú\b|\bte ayudamos\b|\bdescubre\b/g) || []).length;
  if (usted > tu && usted > 0) return 'formal';
  if (/\bproceso\b|\bt[eé]cnic|\bcriterio\b|\bcompar|\berror|\bcómo elegir\b/.test(t)) return 'experto';
  return 'cercano';
}

function brandFromTitle(title: string, h1: string, hostname: string): string {
  const t = title.split(/[|\-–—·]/)[0].trim();
  if (t && t.length >= 2 && t.length <= 60) return t;
  if (h1 && h1.length <= 60) return h1;
  return hostname.replace(/^www\./, '').split('.')[0] || '';
}

function discoverExtraUrls(html: string, baseUrl: string): string[] {
  const wanted =
    /contacto|contact|about|nosotros|quienes|servicios|services|ubicacion|ubicaci[oó]n|sucursal|empresa|company/i;
  const found: string[] = [];
  const re = /href=["']([^"'#]+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) && found.length < 6) {
    const abs = absolutize(baseUrl, m[1]);
    if (!abs || !abs.startsWith('http')) continue;
    try {
      const u = new URL(abs);
      const base = new URL(baseUrl);
      if (u.hostname !== base.hostname) continue;
      if (wanted.test(u.pathname) || wanted.test(m[1])) {
        if (!found.includes(u.origin + u.pathname)) found.push(u.origin + u.pathname);
      }
    } catch {
      /* ignore */
    }
  }
  return found.slice(0, 4);
}

function detectCms(html: string): string[] {
  const hints: string[] = [];
  if (/wp-content|wordpress/i.test(html)) hints.push('wordpress');
  if (/cdn\.shopify\.com|Shopify\.theme/i.test(html)) hints.push('shopify');
  if (/wix\.com|X-Wix/i.test(html)) hints.push('wix');
  if (/squarespace/i.test(html)) hints.push('squarespace');
  if (/netlify/i.test(html)) hints.push('netlify');
  if (/webflow/i.test(html)) hints.push('webflow');
  return hints;
}

function mergeSocial(...maps: SocialMap[]): SocialMap {
  const out: SocialMap = {};
  for (const map of maps) {
    for (const [k, v] of Object.entries(map)) {
      if (v && !out[k]) out[k] = v;
    }
  }
  return out;
}

async function extremeScan(rawUrl: string): Promise<ExtremeScanResult> {
  const warnings: string[] = [];
  let url: string;
  try {
    const u = new URL(rawUrl.includes('://') ? rawUrl : `https://${rawUrl}`);
    if (!/^https?:$/i.test(u.protocol)) throw new Error('bad protocol');
    url = u.toString().replace(/\/$/, '');
  } catch {
    throw Object.assign(new Error('URL inválida'), { status: 400 });
  }

  const pages: ScanPage[] = [];
  const home = await fetchHtml(url);
  if (home.status >= 400) {
    warnings.push(`Home respondió HTTP ${home.status}`);
  }
  pages.push({
    url: home.finalUrl,
    status: home.status,
    title: pick(home.html, /<title[^>]*>([^<]+)<\/title>/i),
    bytes: home.html.length,
  });

  let html = home.html;
  const extras = discoverExtraUrls(home.html, home.finalUrl);
  for (const extra of extras) {
    try {
      const page = await fetchHtml(extra);
      pages.push({
        url: page.finalUrl,
        status: page.status,
        title: pick(page.html, /<title[^>]*>([^<]+)<\/title>/i),
        bytes: page.html.length,
      });
      if (page.status < 400) html += `\n<!-- page:${page.finalUrl} -->\n${page.html}`;
    } catch {
      warnings.push(`No se pudo leer ${extra}`);
    }
  }

  const title = pick(html, /<title[^>]*>([^<]+)<\/title>/i);
  const description =
    pick(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)/i) ||
    pick(html, /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i) ||
    pick(html, /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)/i);
  const h1s = extractHeadings(html, 'h1', 6);
  const h2s = extractHeadings(html, 'h2', 16);
  const nav = extractNav(html);
  const logoUrl = extractLogo(home.html, home.finalUrl);
  const contact = extractContact(html);
  const social = mergeSocial(extractSocial(html));

  for (const node of parseJsonLd(html)) {
    const sameAs = Array.isArray(node.sameAs) ? node.sameAs : [];
    const map: SocialMap = {};
    for (const link of sameAs) {
      const u = String(link || '').toLowerCase();
      if (u.includes('instagram')) map.instagram = String(link);
      if (u.includes('facebook')) map.facebook = String(link);
      if (u.includes('tiktok')) map.tiktok = String(link);
      if (u.includes('linkedin')) map.linkedin = String(link);
      if (u.includes('youtube')) map.youtube = String(link);
      if (u.includes('twitter') || u.includes('x.com')) map.x = String(link);
    }
    Object.assign(social, mergeSocial(social, map));
  }

  const fonts = [
    ...new Set(
      [
        ...[...html.matchAll(/fonts\.googleapis\.com\/css2?\?family=([^"'&]+)/gi)].map((m) =>
          decodeURIComponent(m[1]).replace(/\+/g, ' ').split(':')[0],
        ),
        ...[...html.matchAll(/font-family:\s*([^;}{]+)/gi)].map((m) =>
          m[1].split(',')[0].replace(/['"]/g, '').trim(),
        ),
      ].filter((f) => f && !/inherit|initial|sans-serif|serif|system-ui/i.test(f)),
    ),
  ].slice(0, 5);

  const cssVars = [...html.matchAll(/--[a-z0-9-]*(?:color|primary|brand|accent)[a-z0-9-]*\s*:\s*(#[0-9a-f]{3,8})/gi)].map(
    (m) => m[1],
  );
  const hexes = [...html.matchAll(/#(?:[0-9a-f]{6}|[0-9a-f]{3})\b/gi)].map((m) => m[0]);
  const colors = asHexColors([...cssVars, ...hexes], 8);

  const sample = stripTags(`${title}. ${description}. ${h1s[0] || ''}. ${stripTags(html).slice(0, 1400)}`).slice(
    0,
    700,
  );
  const tone = suggestTone(sample);
  let hostname = '';
  try {
    hostname = new URL(home.finalUrl).hostname;
  } catch {
    hostname = '';
  }
  const brandName = brandFromTitle(title, h1s[0] || '', hostname);

  const metaKeywords = pick(html, /<meta[^>]+name=["']keywords["'][^>]+content=["']([^"']+)/i);
  const keywords = [
    ...new Set(
      [
        ...metaKeywords.split(/[,;]+/).map((k) => k.trim()),
        ...h2s.slice(0, 8),
        ...nav.filter((n) => n.length > 3 && n.length < 40),
      ]
        .map((k) => k.replace(/\s+/g, ' ').trim())
        .filter((k) => k.length >= 3 && k.length <= 80),
    ),
  ].slice(0, 15);

  const serviceBits = [
    ...nav.filter((n) => /servicio|producto|soluci|paquete|plan/i.test(n) || n.length > 4),
    ...h2s.slice(0, 6),
  ];
  const servicesOffered = [...new Set(serviceBits)].slice(0, 8).join(', ');

  const geoText = `${contact.address} ${contact.city} ${contact.stateRegion} ${contact.countryHint} ${description} ${title}`;
  const country = guessCountry(geoText);

  const voiceNotes = [
    fonts.length ? `Fuentes: ${fonts.join(', ')}.` : '',
    colors.length ? `Colores: ${colors.join(', ')}.` : '',
    title ? `Title: ${title}.` : '',
    description ? `Meta: ${description}` : '',
    pages.length > 1 ? `Páginas leídas: ${pages.map((p) => p.url).join(' · ')}.` : '',
    'Escaneo extremo PinkPurple · confirma y corrige antes de guardar.',
  ]
    .filter(Boolean)
    .join(' ');

  return {
    ok: home.status < 400,
    url: home.finalUrl,
    scannedAt: new Date().toISOString(),
    pages,
    brandName,
    tagline: description.slice(0, 200),
    title,
    description,
    h1: h1s[0] || '',
    h2s,
    nav,
    logoUrl,
    colors,
    fonts,
    tone,
    voiceNotes,
    phone: contact.phone,
    whatsapp: contact.whatsapp ? `+${contact.whatsapp}` : '',
    contactEmail: contact.email,
    address: contact.address,
    city: contact.city,
    stateRegion: contact.stateRegion,
    countryHint: contact.countryHint || country.name,
    countryCode: country.code,
    servicesOffered,
    idealClient: description
      ? `Personas que buscan: ${description.slice(0, 160)}`
      : '',
    keywords,
    social,
    cmsHints: detectCms(html),
    warnings,
    rawSample: sample.slice(0, 320),
  };
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Usa POST con { url }' }, 405);
  }

  try {
    const body = (await req.json().catch(() => ({}))) as { url?: string };
    const url = String(body.url || '').trim();
    if (!url) return json({ error: 'Falta url' }, 400);
    const data = await extremeScan(url);
    return json({ success: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'No se pudo escanear';
    const status = (err as { status?: number })?.status || 500;
    return json({ success: false, error: message }, status);
  }
}
