# Adding a Project

Project records are the single source of truth for the selected-work reel and
static case-study pages. Add assets and one typed entry to `projects` in
`src/config/portfolio.ts`; the reel frame, route, metadata, sitemap entry, and
previous/next links are generated from that record at build time.

## 1. Add project assets

Put cover, gallery, and video files under `public/` (for example,
`public/images/new-project-cover.webp` or
`public/videos/new-project-demo.mp4`). Reference local files through
`assetPath("/images/new-project-cover.webp")`, as the existing records do.
Provide accurate image alt text and dimensions. Use `srcSet` and
`assetSrcSet(...)` for responsive image variants when available.

## 2. Add one project record

Add a record to `content.projects` in `src/config/portfolio.ts`. The
discriminated `PersonalProject` type in `src/types/portfolio.ts` checks the
required fields. Keep `id` and `slug` unique. Slugs must be lowercase kebab-case; the project
list rejects duplicate IDs/slugs and non-finite order values during build.
`displayOrder` sets reel and case-study navigation order (ascending).

```ts
{
  id: "new-project",
  slug: "new-project",
  displayOrder: 3,
  category: "enterprise",
  context: "Client project",
  title: "New Project",
  description: "Project description used in the reel.",
  introduction: "Short case-study introduction.",
  location: "Kuala Lumpur",
  technologies: ["TypeScript", "Next.js"],
  image: {
    src: assetPath("/images/new-project-cover.webp"),
    alt: "A descriptive summary of the project image",
    width: 1600,
    height: 900,
    objectPosition: "center 50%",
  },
}
```

Use `category: "template"` for a template project; that variant also requires
`demoHref`. Existing optional `sourceHref` remains available for source-code
links. To show a different reel or case-study label without changing the
project's main title/context, set `displayTitle`, `displayCategory`,
`caseStudyTitle`, or `caseStudyCategory`. These are data fields, not component
switches.

## 3. Add case-study sections

Add `sections` to the same record. Each section needs a non-empty `title` and
`text`; the shared case-study page numbers and renders them in order.

```ts
sections: [
  { title: "Overview", text: "What the project does and who it serves." },
  { title: "My contribution", text: "The work delivered for this project." },
],
```

Omit `sections` when there is no case-study narrative. No empty story container
is rendered.

## 4. Configure image positioning

Set `image.objectPosition` to a CSS object-position value such as
`"center 58%"` or `"left top"` when the cover needs a specific crop. The value
is used consistently in the reel and case-study hero; omit it for the default
center crop. Gallery images can set their own `objectPosition`.

## 5. Add galleries or videos

An optional `gallery` is an array of images with `src`, `alt`, `width`, and
`height`. A `caption` is optional. For attribution, provide both `credit` and
`sourceUrl`; the credit link appears only when both values are present.

An optional `videos` array accepts a local or HTTP(S) `src` and a `title`.
`type` (for example `"video/mp4"`), `poster`, `caption`, and the paired
`credit`/`sourceUrl` are optional. Videos render with native controls. Invalid
or incomplete entries are omitted; no empty section is shown.

## 6. Add external links

Add general case-study links with `externalLinks`:

```ts
externalLinks: [
  { label: "Visit the live website", href: "https://example.com/" },
],
```

Links may be HTTP(S), root-relative paths, or in-page fragments. HTTP(S) links
open in a new tab with `noopener noreferrer`. Template `demoHref` and optional
`sourceHref` are also rendered in the shared case-study facts area.

## 7. Validate and deploy

From the project root, run:

```powershell
npm.cmd run typecheck
npm.cmd run build
npm.cmd run test:release -- tests/film-reel.spec.mjs tests/seo.spec.mjs
```

Review the generated project route and sitemap entry in the build output, then
deploy the static export using the project's existing release process. Each
route is statically generated during the build; adding a project does not
require changes to the reel, animation, routing, or case-study components.
