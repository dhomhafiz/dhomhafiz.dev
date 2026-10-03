# Signal — Frontend portfolio starter

A hero-first Next.js App Router portfolio with TypeScript and Tailwind CSS 3. The initial scope includes the video hero, a small supporting approach section, and reusable primitives. Project grids, experience timelines and contact forms can be added as independent feature modules later.

## Run

Requires Node.js 20.9+.

```sh
npm install
npm run dev
npm run typecheck
npm run build
npm start
```

`npm run build` exports the site to `out/`. `npm start` serves that export. Google fonts are downloaded during the build by `next/font/google`; build machines need network access to Google Fonts.

## GitHub Pages deployment

The `.github/workflows/nextjs.yml` workflow builds and publishes `out/` for the root custom domain `dhomhafiz.dev`. Next.js `basePath` is empty, and public assets use root-relative paths. Do not set `NEXT_PUBLIC_BASE_PATH` for this deployment.

Build locally with `npm.cmd run build` and serve the export from the domain root. Ensure the workflow, `src/lib/assetPath.ts`, `next.config.ts`, updated content/layout, and the tracked files in `public/` are included in your commit.

## Edit your content

Edit `src/config/portfolio.ts` to update brand, contact email, content, services, and media. Direct email links open the visitor's mail client. The Contact Us form sends through EmailJS using the public service configuration in `src/lib/contact.ts`, with template variables `name`, `email`, and `message`. In the EmailJS template, set To Email to `dhomhafiz@gmail.com` and Reply-To to `{{email}}`; the recipient is managed in EmailJS, not by the form. Fields clear only after a successful response, and remain available after an error. Production build and mocked request checks do not verify live email delivery.

The hero uses a compressed local copy of the Pexels footage at `public/videos/hero-720p.mp4`, with a 21 KB WebP still frame. Its Pexels source credit stays in `media.sourceUrl`. The video is requested after the initial page load during browser idle time, is omitted for reduced motion, Save-Data, or reported 2G/3G connections, and pauses off-screen or in a hidden tab. The original downloaded footage is retained in the ignored `.media-source/` directory, outside the deployed `out/` folder.

The portrait uses responsive AVIF/WebP variants (480, 640, 768, and 1024 pixels); its original PNG is preserved but is no longer requested by the page. The project image also has responsive WebP variants.

`npm start` loads `serve.json`: hashed Next.js assets cache for one year, images/video for 30 days, and HTML revalidates. Configure equivalent response headers on your deployment host; this local server configuration is not automatically applied by other hosts. Rename media files and update their URLs when replacing cached assets.

Lighthouse reports and media checks are in `audits/`, with the environment, results, and remaining limitations in `audits/README.md`.

## Configure Service Tier promotional pricing

1. Open `src/config/portfolio.ts` and find the tier you want to promote in `services.tiers`. For Tier 1, look for `id: "essential"`.
2. Keep `price` as the original/base price. Set `promotionEnabled` to `true`, then add `promotionalPrice` and `promotionEndDate` if they are missing. These two fields are optional, so they may not already appear in the configuration.
3. Enter the promotional price as a number without `RM` or commas, and the end date as a string in `YYYY-MM-DD` format.

Example for Tier 1: original price **RM799**, promotional price **RM399**, ending on **31 October 2026**. Set the following fields in the existing `essential` tier object and keep all other fields unchanged:

```ts
price: "RM 799",
promotionEnabled: true,
promotionalPrice: 399,
promotionEndDate: "2026-10-31",
```

The correct date field name is `promotionEndDate`, not `promotionalEndDate`. The promotional price is configured manually; the system does not calculate discount percentages.

When a promotion is active, the website displays the original price with strikethrough, the promotional price below it, and the text `Promo until 31 October 2026`. The promotion remains active throughout the end date in the visitor's local timezone. After that date, the original price returns automatically without changing the configuration or rebuilding. The display refreshes at local midnight, when the tab becomes visible again, and when the window receives focus.

To disable a promotion before its end date, set:

```ts
promotionEnabled: false,
```

Each tier is controlled independently. Changing Tier 1 does not enable promotions for other tiers. The promotional price must be a finite number, at least `0`, and lower than the original price. Incomplete configurations, invalid dates, expired promotions, and `Custom quote` prices fall back to the normal price display.

After changing the configuration, save the file and run:

```sh
npm run typecheck
npm run build
```

Deploy the changes through the existing GitHub Pages workflow so the new settings appear on the live website. In Windows PowerShell, use `npm.cmd` if the execution policy blocks `npm`.

## Architecture

```text
src/
  app/                     Route composition, fonts, metadata, global styles
  components/
    common/                Native button/link, video and surface primitives
    features/              Portfolio boundary, header, approach and hero modules
  hooks/                   Media state and reduced-motion preference
  types/                   Lean content and provider contracts
  config/                  Replaceable local content adapter
```

- **SRP:** media behavior lives in `useBackgroundVideo`; media, copy, toolkit and composition each have their own component. The async server boundary loads content.
- **OCP:** Hero accepts children; primitives accept children; repeated content is data driven. Extend theme tokens without editing features.
- **LSP:** Button, ButtonLink and VideoPlayer forward native element attributes and refs. Anchors remain anchors. GlassCard preserves native div attributes.
- **ISP:** leaf components receive small contracts or primitive fields instead of the whole portfolio.
- **DIP:** PortfolioPage receives a PortfolioProvider interface. Only app/page.tsx chooses the local adapter. Swap for a CMS adapter implementing getPortfolio without editing presentation components. With static export, providers run at build time; dynamic content requires rebuilding or changing the hosting model.

## Accessibility and media

Keyboard focus, a skip link, semantic headings, responsive type, readable overlay, and explicit motion controls are included. Reduced-motion users do not load the video. Autoplay is muted and inline; blocked autoplay retains a play control when media is ready. Failed media leaves the gradient/grid fallback intact. Motion CSS also respects reduced-motion preferences. Decorative video is hidden from assistive technology.

## Themes

RGB color values live in `src/app/globals.css`, are exposed through `tailwind.config.js`, and support Tailwind opacity modifiers. `next/font/google` exposes Space Grotesk and JetBrains Mono as CSS variables. Utilities include `glass-panel`, `radial-grid` and `shadow-neon-cyan`.

## References

- https://nextjs.org/docs/app/api-reference/components/font
- https://nextjs.org/docs/app/guides/static-exports
- https://www.pexels.com/video/a-computer-screen-with-the-word-target-on-it-6037155/
