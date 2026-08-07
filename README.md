# dmytro klochko — personal one-page site

A responsive, accessible personal portfolio built with Astro and strict
TypeScript. It is a purely static site — no database, authentication, forms
service, adapter, or other backend/runtime dependency. `npm run build`
produces a fully static `dist/` you can host anywhere (Cloudflare Pages,
Netlify, GitHub Pages, S3, etc.) with zero client-side JavaScript.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:4321`.

## Production checks

```bash
npm run build
npm run preview
```

## Customize the content

- `src/pages/index.astro` contains the page structure and copy, and holds the
  data arrays (upbringing timeline, vlog links, social links, books, records).
- `src/components/` holds the repeated markup patterns (section tags,
  outbound links, media cards, framed photos) used across the page.
- `src/layouts/Layout.astro` contains `<head>` metadata and social sharing
  configuration.
- `src/styles/global.css` contains the visual system and responsive behavior.
- `public/og.png` is the social preview card.

The source copy and links are taken from `contents/dk_reference_doc_simple.pdf`.
The bio language is intentionally preserved verbatim.

See [PRODUCT.md](PRODUCT.md) and [DESIGN.md](DESIGN.md) for the durable
product context and visual design system, captured with the `impeccable`
skill.
