# dmytro klochko — personal site

Astro static build for [dmklochko.com](https://dmklochko.com). The public
site is a foyer: the homepage, learning, press, and say hi. Extra rooms
still live in the repo and stay reachable by url. They are not linked from
header, hamburger, footer, or the sitemap.

## Public foyer

- `/` — homepage: hero, experience, how i work, upbringing, other roles, literally me, say hi
- `/learning` — what he is studying, plus the field guides
- `/press` — verified press ledger
- `/#contact` — say hi

## Hidden rooms

Kept on disk, unlinked, and marked unlisted / noindex:
`/writing`, `/eidos`, `/today`, `/taste`, `/basho`, `/hokku`, `/pond`,
`/dance`, `/curate`, `/vault`, `/map`. Studio doors already behind a
password or Access stay that way (`/names`, `/ask`, `/scout`; `/curate`
when Access is configured).

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

`npm run build` compiles the vault, checks image derivatives, builds Astro,
then writes `dist/sitemap.xml` from what actually shipped and is not noindex.

## Customize the content

- `src/pages/index.astro` is the homepage.
- `src/layouts/Layout.astro` is the public header and footer.
- `src/styles/` is the visual system.
- `src/data/` is build-time json. Do not edit `map.json` or `today.json` by
  hand; they come from `vault/`.

See [PRODUCT.md](PRODUCT.md), [DESIGN.md](DESIGN.md), [AGENTS.md](AGENTS.md)
and [CHECKLIST.md](CHECKLIST.md).
