# PinkPurple SEO

Sitio público (front) de **PinkPurple SEO**: landings de venta, blogs y SEO.

## Arquitectura

- **pinkpurple** (este repo) → front en **Netlify**
- **Seo-Nexus-2.0** → generador (landings/blogs). Las claves de IA y panel viven en Nexus, no aquí.

## Marca

| Token   | Hex       |
|---------|-----------|
| Magenta | `#F43CB0` |
| Lavanda | `#8C3DF5` |
| Negro   | `#000000` |
| Blanco  | `#FFFFFF` |

Logos en `public/brand/`.

## Desarrollo

```bash
npm install
npm run dev
```

## Build / Netlify

```bash
npm run build
```

- Publish directory: `dist`
- Config: `netlify.toml`
- SPA fallback: `/* → /index.html` (200)
- **Bot shield** (edge): `netlify/edge-functions/bot-shield.ts` — mismo patrón que Bodasesor (403 scrapers/IA training, permite Google/Bing/social, rate limit HTML)

## Próximo con Nexus

1. Conectar este repo como sitio destino en Nexus (como Bodasesor).
2. Sincronizar landings a `public/{slug}/` y blogs a `public/blog/{slug}/`.
3. Añadir `build:nexus` + Build Hook de Netlify cuando el pipeline esté listo.
