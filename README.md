# dmytro klochko — personal one-page site

A responsive, accessible personal portfolio built with Next.js, React, strict
TypeScript, and Tailwind CSS. It is intentionally frontend-only and has no
database, authentication, forms service, or other backend dependency.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production checks

```bash
npm run build
npm run lint
npm test
```

## Customize the content

- `app/page.tsx` contains the profile, project, about, and contact copy.
- `app/globals.css` contains the visual system and responsive behavior.
- `app/layout.tsx` contains metadata and social sharing configuration.
- `public/og.png` is the social preview card.

The source copy and links are taken from `contents/dk_reference_doc_simple.pdf`.
The bio language is intentionally preserved verbatim.
