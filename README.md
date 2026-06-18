# landing-page-meproind

Landing page de **MEPROIND** — mesas gravimétricas de alta precisión para la recuperación
de oro sin mercurio. **Next.js 14 (App Router) + TypeScript**, light-mode con hero oscuro,
sobre el MEPROIND Design System (Industrial-Tech Premium).

## Stack

- **Next.js 14** (App Router, SSG — la home se pre-renderiza estática para SEO y para
  responder bajo baja conectividad).
- **TypeScript**, CSS del Design System en `app/globals.css` (tokens canónicos).
- **next/font** auto-aloja Archivo (eje `wdth` para el look display expandido, sin red externa).
- **lucide-react** para iconografía outline.
- **three** — visor 3D procedural de la mesa con simulación de separación (`components/Viewer3D.tsx`).
- SEO: metadata + Open Graph + JSON-LD (Organization, LocalBusiness, WebSite, Product), `sitemap.ts`, `robots.ts`.

## Estructura

```
app/
  layout.tsx        # html, fuentes, metadata SEO, JSON-LD, Header/Footer
  page.tsx          # compone las secciones de la home
  globals.css       # Design System (tokens + estilos de secciones)
  sitemap.ts · robots.ts · icon.png · apple-icon.png
components/          # una sección por componente (Hero, Models, Viewer3D, Anatomy, ...)
lib/
  content.ts        # contenido data-driven (modelos, testimonios, tabla, anatomía)
  whatsapp.ts       # números de contacto + constructor de enlaces
public/
  img/landing · planos · video
```

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de producción (SSG)
npm start        # sirve el build
```

## Deploy

- **Vercel** (importar el repo → framework Next.js detectado → build automático).
- Dominio: cutover DNS de WIX → Vercel conservando el ranking (mismo dominio + redirects 301
  + reenvío de sitemap). Detalle del plan en `LANDING-REDESIGN.md` (repo del dashboard).
- **`public/video/presentacion.mp4` (~89 MB)** → mover a CDN / Git LFS antes de producción.
