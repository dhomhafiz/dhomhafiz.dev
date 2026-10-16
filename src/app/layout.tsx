import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import { assetPath } from "@/lib/assetPath";
import { pageSeo, site } from "@/config/seo";

// SRP: optimized fonts and document-wide metadata are owned by the root layout.
const body = localFont({ src: "./fonts/InterVariable.woff2", weight: "100 900", variable: "--font-body", display: "swap" });
export const metadata: Metadata = {
  title: pageSeo.home.title,
  description: pageSeo.home.description,
  icons: { icon: assetPath("/favicon.svg") },
  metadataBase: new URL(site.url),
  alternates: { canonical: pageSeo.home.path },
  authors: [{ name: site.owner, url: site.url }],
  keywords: [...pageSeo.home.keywords],
  openGraph: {
    title: pageSeo.home.title,
    description: pageSeo.home.description,
    url: pageSeo.home.path,
    siteName: site.name,
    locale: site.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: pageSeo.home.title,
    description: pageSeo.home.description,
  },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning className={`${body.variable}`}>

    <body className="font-mono antialiased">
      <a href="#main" className="skip-link">Skip to content</a>{children}
    </body>
  </html>;
}
