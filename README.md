# PinkPurple Studio

Sitio de **PinkPurple Studio**: automatizaciones para hacer crecer marcas.

## Marca

| Nivel | Nombre | Rol |
|-------|--------|-----|
| Empresa | **PinkPurple Studio** | Marca paraguas (sitio general) |
| Producto | **PinkPurple SEO** | Landings, blogs, SEO y publicación multi-servidor |

## Arquitectura

- **pinkpurple** (este repo) → front en **Netlify** (Studio + producto SEO)
- **Seo-Nexus-2.0** → generador (landings/blogs). Las claves de IA viven en Nexus.

## Colores

| Token   | Hex       |
|---------|-----------|
| Magenta | `#F43CB0` |
| Lavanda | `#8C3DF5` |
| Negro   | `#000000` |
| Blanco  | `#FFFFFF` |

Logo de barra: `public/brand/logo-studio-header.png`.

## Desarrollo

```bash
npm install
npm run dev
```

## Build / Netlify

```bash
npm run build
```

- Publish: `dist`
- Bot shield: `netlify/edge-functions/bot-shield.ts`

## Auth

Netlify Identity (correo + Google; Apple/Facebook en UI).

Rutas clave: `/login`, `/registro`, `/cuenta`, `/productos` (planes PinkPurple SEO).

**No hacer push a Netlify hasta confirmación explícita del usuario.**
