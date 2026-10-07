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
2. Keep `price` as the original/base price. Numeric MYR prices are recommended (`799`, without quotes, `RM`, or commas). Existing formatted RM strings remain supported; `"Custom quote"` remains a display label without promotions.
3. Set `promotionEnabled` to `true`, choose `promotionType: "fixed"` or `promotionType: "percentage"`, and add the relevant price field and `promotionEndDate` if missing. Configure each tier independently; no React component changes are needed.

### Fixed promotional price

Example for Tier 1: original price **RM799**, promotional price **RM399**, ending on **31 October 2026**. Set the following fields in the existing `essential` tier object and keep all other fields unchanged:

```ts
price: 799,
promotionEnabled: true,
promotionType: "fixed",
promotionalPrice: 399,
promotionEndDate: "2026-10-31",
```

In fixed mode, `promotionalPrice` is the exact selling price, entered as a number. For example, `399.5` displays as `RM 399.50`. No percentage badge is calculated for fixed promotions.

### Percentage discount

For example, to give the existing Business tier (base price RM2,499) a 20% discount, use:

```ts
price: 2499,
promotionEnabled: true,
promotionType: "percentage",
discountPercent: 20,
promotionEndDate: "2026-11-30",
```

The system calculates `price * (1 - discountPercent / 100)`, rounds to cents, and displays **RM 1,999.20**, a supporting **20% OFF** label, and the expiry date. Changing `discountPercent` to `30` automatically recalculates the price to **RM 1,749.30**. Do not store a calculated `promotionalPrice` in percentage mode; that field is ignored. Likewise, fixed mode ignores `discountPercent`.

### Validation, expiry, and manual control

The correct date field name is `promotionEndDate`, not `promotionalEndDate`. Use a real calendar date in `YYYY-MM-DD` format.

When a promotion is active, the website displays the original price with strikethrough, the promotional price below it, and the text `Valid until 31 October 2026`. The promotion remains active throughout the end date in the visitor's local timezone. After that date, the original price returns automatically without changing the configuration or rebuilding. The display refreshes at local midnight, when the tab becomes visible again, and when the window receives focus.

To disable a promotion before its end date, set:

```ts
promotionEnabled: false,
```

Each tier is controlled independently. Changing Tier 1 does not enable promotions for other tiers. Both modes require a finite, positive base price and a valid, unexpired end date.

- **Fixed:** `promotionalPrice` must be a finite number, at least `0`, and lower than the base price.
- **Percentage:** `discountPercent` must be a finite number strictly greater than `0` and less than `100`. Values such as `0`, `-20`, `100`, or `120` are invalid.
- **Currency:** amounts are rounded to cents. Whole Ringgit values display without decimals; fractional amounts display two decimals (for example, `RM 399.50` or `RM 1,039.20`). A discount that rounds back to the base price is not shown as a promotion.
- **Fallback:** incomplete configurations, unknown promotion types, invalid dates, expired promotions, and `Custom quote` prices display the normal price with no promotion label or reserved promotion spacing.
- **Compatibility:** omitting `promotionType` uses fixed mode so older fixed-price configurations continue to work. Set the type explicitly for new promotions.

### Check and publish changes

After changing the configuration, save the file and run:

```sh
npm run typecheck
npm test
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
