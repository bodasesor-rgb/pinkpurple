import type { Config, Context } from '@netlify/edge-functions'

// ═══════════════════════════════════════════════════════════════
// CAPA 0 — SONDEOS / EXPLOITS (respuesta minúscula, sin HTML SPA)
// ═══════════════════════════════════════════════════════════════
const PROBE_PATHS = new Set([
  '/products.json',
  '/collections.json',
  '/cart.json',
  '/cart.js',
  '/meta.json',
  '/services/meta.json',
  '/search/suggest.json',
  '/search/suggest.json/',
  '/wp-login.php',
  '/wp-admin',
  '/xmlrpc.php',
  '/.env',
  '/.git/config',
  '/composer.json',
  '/package.json',
  '/phpinfo.php',
  '/admin.php',
  '/actuator',
  '/actuator/health',
  '/wp-json',
  '/wp-config.php',
  '/xmlrpc',
  '/server-status',
  '/.ds_store',
])

const PROBE_PREFIXES = [
  '/products.json',
  '/collections.json',
  '/cart.js',
  '/cart.json',
  '/wp-admin/',
  '/wp-content/',
  '/wp-includes/',
  '/wp-json/',
  '/.git/',
  '/.env',
  '/vendor/phpunit/',
  '/phpmyadmin',
  '/admin/config',
  '/cgi-bin/',
  '/autodiscover/',
  '/owa/',
  '/.aws/',
]

const PROBE_EXTENSIONS = /\.(php|aspx?|jsp|cgi|env|bak|sql|py)$/i

function isProbePath(pathname: string): boolean {
  const p = pathname.replace(/\/+$/, '') || '/'
  if (PROBE_PATHS.has(pathname) || PROBE_PATHS.has(p)) return true
  const lower = p.toLowerCase()
  if (PROBE_EXTENSIONS.test(lower)) return true
  return PROBE_PREFIXES.some((prefix) => lower === prefix || lower.startsWith(prefix))
}

// ═══════════════════════════════════════════════════════════════
// CAPA 1 — SIEMPRE PERMITIR (SEO + previews sociales)
// Order matters: ALLOW runs BEFORE Netlify category / BLOCK / heuristics.
// Never put a JS challenge or "human-like" gate in front of these UAs.
// ═══════════════════════════════════════════════════════════════
const ALLOW = [
  // Google Search / Ads / tooling (indexing ≠ Google-Extended training)
  // Googlebot, Googlebot-Image, Googlebot-Video (inline comment breaks verify parser)
  /googlebot/i,
  /google-inspectiontool/i,
  /storebot-google/i,
  /adsbot-google/i,
  /apis-google/i,
  /mediapartners-google/i,
  /googleother/i,
  /google-site-verification/i,
  /feedfetcher-google/i,
  /google-read-aloud/i,
  /google-favicon/i,
  /googleproducer/i,
  /google-safety/i,
  // PageSpeed Insights / Lighthouse lab (otherwise Netlify marks tooling → 403)
  /chrome-lighthouse/i,
  /pagespeed.?insights/i,
  // Bing / Yahoo / DuckDuckGo / Yandex / Baidu / Apple (search, not Applebot-Extended)
  /bingbot/i,
  /bingpreview/i,
  /adidxbot/i,
  /msnbot/i,
  /duckduckbot/i,
  /yandex(bot|images)/i,
  /baiduspider/i,
  /applebot(?!-extended)/i,
  /slurp/i,
  // Social link previews
  /facebookexternalhit/i,
  /facebookcatalog/i,
  /twitterbot/i,
  /linkedinbot/i,
  /pinterest/i,
  /whatsapp/i,
  /telegrambot/i,
  /slackbot/i,
  /discordbot/i,
  // Ubersuggest / auditorías pedidas por el equipo
  /semrushbot/i,
  // Herramientas propias: Nexus sync, CI GitHub, Cursor, auditorías
  /PinkPurple/i,
  /Bodasesor/i,
  /Cursor/i,
  /CursorBrowser/i,
  // AI search / citations (not training — GPTBot stays in BLOCK)
  /OAI-SearchBot/i,
  /ChatGPT-User/i,
  /SearchGPT/i,
  /PerplexityBot/i,
  /Perplexity-User/i,
  /Claude-SearchBot/i,
  /Claude-User/i,
]

// ═══════════════════════════════════════════════════════════════
// CAPA 2 — BLOQUEAR (IA, SEO scrapers, headless, libraries)
// ═══════════════════════════════════════════════════════════════
const BLOCK = [
  // AI training crawlers (search bots are in ALLOW above)
  /GPTBot/i,
  /ClaudeBot/i,
  /anthropic-ai/i,
  /Claude-Web/i,
  /CCBot/i,
  /Google-Extended/i,
  /Bytespider/i,
  /Amazonbot/i,
  /Applebot-Extended/i,
  /cohere-ai/i,
  /Diffbot/i,
  /ImagesiftBot/i,
  /Omgili/i,
  /YouBot/i,
  /Meta-ExternalFetcher/i,
  /meta-externalagent/i,
  /Timpibot/i,
  /PetalBot/i,
  /DuckAssistBot/i,
  /AI2Bot/i,
  /Webzio-Extended/i,
  /ICC-Crawler/i,
  /Kangaroobot/i,
  /FriendlyCrawler/i,
  /MistralAI-User/i,
  /NovaAct/i,
  /Operator/i,
  /Google-CloudVertexBot/i,
  /xAI-Grok/i,
  /\bGrok\b/i,
  /DeepSeek/i,
  /TikTokSpider/i,
  /iaskspider/i,
  /img2dataset/i,
  /FacebookBot/i,

  // SEO / bandwidth scrapers (Semrush permitido arriba en ALLOW)
  /AhrefsBot/i,
  /AhrefsSiteAudit/i,
  /DotBot/i,
  /MJ12bot/i,
  /DataForSeoBot/i,
  /BLEXBot/i,
  /rogerbot/i,
  /screaming.?frog/i,
  /serpstatbot/i,
  /SeznamBot/i,
  /Seekport/i,
  /ZoominfoBot/i,
  /BomboraBot/i,
  /Awario(Smart)?Bot/i,
  /magpie-crawler/i,
  /VelenPublicWebCrawler/i,
  /Turnitin/i,
  /trendictionbot/i,
  /Blackboard\s?Safeassign/i,
  /SEOkicks/i,
  /Domains\s?Project/i,
  /Buck\/\d/i,
  /Barkrowler/i,
  /Grapeshot/i,
  /SiteAuditBot/i,
  /ContentKing/i,
  /OnCrawl/i,
  /Botify/i,
  /DeepCrawl/i,
  /Sitebulb/i,
  /Lumar/i,
  /YisouSpider/i,
  /Sogou/i,
  /360Spider/i,
  /archive\.org_bot/i,
  /ia_archiver/i,
  /MauiBot/i,
  /webprosbot/i,

  // Security scanners / internet census
  /CensysInspect/i,
  /Censys.io/i,
  /\bShodan\b/i,
  /InternetMeasurement/i,
  /paloaltonetworks/i,
  /Detectify/i,
  /Nuclei/i,
  /zgrab/i,
  /masscan/i,
  /Nmap\sScripting/i,
  /sqlmap/i,
  /nikto/i,
  /OpenVAS/i,
  /nessus/i,

  // Headless / automation / HTTP libs (not real browsers)
  /HeadlessChrome/i,
  /PhantomJS/i,
  /Selenium/i,
  /Puppeteer/i,
  /Playwright/i,
  /scrapy/i,
  /python-requests/i,
  /python-urllib/i,
  /aiohttp/i,
  /httpx\//i,
  /Go-http-client/i,
  /java\//i,
  /okhttp/i,
  /libwww-perl/i,
  /HTTPie/i,
  /PostmanRuntime/i,
  /Insomnia/i,
  /RestSharp/i,
  /node-fetch/i,
  /axios\//i,
  /undici/i,
  /Apache-HttpClient/i,
  /libcurl/i,
  /\bcurl\//i,
  /\bwget\b/i,
  /HTTrack/i,
  /Nutch/i,
  /heritrix/i,
  /Firefox\/.*Bot/i,
  /facebookscraper/i,
  /fasthttp/i,
  /colly/i,
  /crawler4j/i,
  /GuzzleHttp/i,
  /\bphp\//i,
  /\bgot\//i,
  /\bDeno\//i,
  /\bBun\//i,
  /jsoup/i,
]

const ASSET_PATH = /\.(js|css|map|webp|png|jpe?g|gif|svg|ico|woff2?|ttf|txt|xml|json)$/i

// HTML pages only — a real page load is 1 HTML + many assets. Counting assets
// at 30/min would 429 a normal visitor (and Googlebot, if we used Netlify's
// path rateLimit). ALLOW list (Google/Bing/social) bypasses this entirely.
const HTML_RATE_LIMIT = 30
const HTML_WINDOW_MS = 60_000
const MAX_TRACKED_IPS = 8_000
const htmlHits = new Map<string, { count: number; windowStart: number }>()

function isAssetPath(pathname: string): boolean {
  return ASSET_PATH.test(pathname)
}

function isOverHtmlRateLimit(ip: string): boolean {
  if (!ip) return false
  const now = Date.now()
  const rec = htmlHits.get(ip)
  if (!rec || now - rec.windowStart >= HTML_WINDOW_MS) {
    if (!rec && htmlHits.size >= MAX_TRACKED_IPS) {
      const oldest = htmlHits.keys().next().value
      if (oldest) htmlHits.delete(oldest)
    }
    htmlHits.set(ip, { count: 1, windowStart: now })
    return false
  }
  rec.count += 1
  return rec.count > HTML_RATE_LIMIT
}

/** Netlify sets Netlify-Agent-Category as `<category>[;<subcategory>]`. */
function parseAgentCategory(header: string | null): { category: string; subcategory: string } {
  const raw = (header || '').toLowerCase().trim()
  if (!raw) return { category: '', subcategory: '' }
  const semi = raw.indexOf(';')
  if (semi === -1) return { category: raw, subcategory: '' }
  return {
    category: raw.slice(0, semi).trim(),
    subcategory: raw.slice(semi + 1).trim(),
  }
}

/**
 * Block non-human Netlify categories after ALLOW list.
 * Legacy `ai` / `ads` kept in case older edge metadata still appears.
 * Never block tooling;netlify-service (Netlify internals).
 * Search crawlers must match ALLOW by UA first — do not rely on category alone.
 */
function shouldBlockCategory(category: string, subcategory: string): string | null {
  if (!category) return null
  if (category === 'tooling' && subcategory === 'netlify-service') return null
  // Netlify may tag Google/Bing as crawler;search — allow that subcategory.
  // AI search agents (ChatGPT Search, Perplexity, etc.) — allow citation crawlers.
  if (category === 'crawler' && /^search$/i.test(subcategory)) {
    return null
  }
  if (category === 'ai-agent' && /^search$/i.test(subcategory)) {
    return null
  }

  if (category === 'none') return 'categoria:none'
  if (category === 'ai-agent' || category === 'ai') return `categoria:${category}`
  if (category === 'ads') return 'categoria:ads'
  if (category === 'crawler') return `categoria:crawler${subcategory ? ';' + subcategory : ''}`
  if (category === 'tooling') return `categoria:tooling${subcategory ? ';' + subcategory : ''}`
  if (category === 'other') return 'categoria:other'
  return null
}

/** Obvious non-browser UAs that still burn bandwidth */
function isSuspiciousUa(ua: string): boolean {
  const t = ua.trim()
  if (t.length < 12) return true
  if (/^(Mozilla\/4\.0)$/i.test(t)) return true
  // Match Bot/Crawler even inside tokens like SomeRandomBot/1.0
  if (
    /bot|crawler|spider|scraper|fetch\/\d|scanner/i.test(t) &&
    !ALLOW.some((rx) => rx.test(t))
  ) {
    return true
  }
  return false
}

/** HTML navigations without typical browser client hints are often scrapers spoofing Chrome. */
function isLikelySpoofedBrowser(request: Request, pathname: string, ua: string): boolean {
  // Only apply to document-like paths (not assets / api probes already handled)
  if (isAssetPath(pathname)) {
    return false
  }
  if (!/Mozilla\/5\.0/i.test(ua)) return false
  if (!/Chrome\/|Firefox\/|Safari\/|Edg\//i.test(ua)) return false
  // Real browsers send Sec-Fetch-* on navigations; most scrapers omit all of them.
  const secFetchSite = request.headers.get('sec-fetch-site')
  const secFetchMode = request.headers.get('sec-fetch-mode')
  const secFetchDest = request.headers.get('sec-fetch-dest')
  if (!secFetchSite && !secFetchMode && !secFetchDest) {
    return true
  }
  // Chrome-impersonators now copy Sec-Fetch but still omit Accept-Language.
  const lang = request.headers.get('accept-language')
  if (!lang || !lang.trim()) {
    return true
  }
  // Document navigations send Accept: text/html. Scrapers often send */* or nothing.
  const accept = (request.headers.get('accept') || '').toLowerCase()
  const dest = (secFetchDest || '').toLowerCase()
  const mode = (secFetchMode || '').toLowerCase()
  const isDocumentNav = dest === 'document' || mode === 'navigate'
  if (isDocumentNav) {
    if (!accept || accept === '*/*') return true
    if (!accept.includes('text/html') && !accept.includes('application/xhtml')) return true
  }
  return false
}

export default async (request: Request, context: Context) => {
  const url = new URL(request.url)
  const pathname = url.pathname

  if (isProbePath(pathname)) {
    console.log(`PROBE-404 ip=${context.ip} path=${pathname}`)
    return new Response('Not found.', {
      status: 404,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'public, max-age=86400',
        'x-robots-tag': 'noindex',
      },
    })
  }

  const ua = request.headers.get('user-agent') || ''
  const { category, subcategory } = parseAgentCategory(
    request.headers.get('netlify-agent-category'),
  )

  // SEO / social previews always pass (HTML + assets)
  if (ALLOW.some((rx) => rx.test(ua))) return context.next()

  // page-preview (WhatsApp/Slack/etc.) — allow even if not in ALLOW regex
  if (category === 'page-preview') return context.next()

  const categoryReason = shouldBlockCategory(category, subcategory)
  if (categoryReason) {
    return block(context, ua, categoryReason)
  }

  if (BLOCK.some((rx) => rx.test(ua))) {
    return block(context, ua, 'lista-negra')
  }

  if (ua.trim() === '' || isSuspiciousUa(ua)) {
    return block(context, ua, ua.trim() === '' ? 'sin-user-agent' : 'ua-sospechoso')
  }

  if (isLikelySpoofedBrowser(request, pathname, ua)) {
    return block(context, ua, 'spoof-headers')
  }

  // Scrapers spoofing Chrome still chew Analytics/bandwidth. Cap HTML pages
  // (not assets) at 30/min per IP. Googlebot never reaches here (ALLOW).
  if (!isAssetPath(pathname) && isOverHtmlRateLimit(context.ip || '')) {
    return block(context, ua, 'rate-30-html', 429)
  }

  return context.next()
}

function block(context: Context, ua: string, reason: string, status = 403) {
  console.log(`BLOQUEADO [${reason}] ip=${context.ip} ua="${ua.slice(0, 180)}"`)
  return new Response(status === 429 ? 'Too many requests.' : 'Access denied.', {
    status,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': status === 429 ? 'public, max-age=60' : 'public, max-age=3600',
      'x-robots-tag': 'noindex',
      ...(status === 429 ? { 'retry-after': '60' } : {}),
    },
  })
}

export const config: Config = {
  path: '/*',
  // Keep robots/sitemap reachable without edge (crawlers + monitors).
  // Assets ARE shielded so scrapers cannot burn bandwidth on JS/CSS/images.
  excludedPath: [
    '/robots.txt',
    '/.well-known/*',
    '/sitemap.xml',
    '/llms.txt',
    '/.netlify/*',
  ],
  onError: 'bypass',
}
