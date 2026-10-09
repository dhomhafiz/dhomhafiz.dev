import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { themeInitScript } from "@/config/theme";
import { assetPath } from "@/lib/assetPath";

// SRP: optimized fonts and document-wide metadata are owned by the root layout.
const display = localFont({ src: [{ path: "./fonts/BarlowCondensed-SemiBold.ttf", weight: "600" }, { path: "./fonts/BarlowCondensed-ExtraBold.ttf", weight: "800" }], variable: "--font-display", display: "swap" });
const body = localFont({ src: "./fonts/space-grotesk-latin.woff2", variable: "--font-body", display: "swap" });
export const metadata: Metadata = {
  title: "Mohd Hafiz Abd Rahim",
  description: "Thoughtful web experiences, built with precision. Independent frontend development with React, Next.js, and TypeScript.",
  icons: { icon: assetPath("/favicon.svg") },
  metadataBase: new URL("https://dhomhafiz.dev"),
  alternates: { canonical: "/" },
  keywords: [
    "Mohd Hafiz Abd Rahim",
    "dhomhafiz",
    "dhomhafiz.dev",
    "Freelance Web Developer Malaysia",
    "Next.js Developer Malaysia",
    "Java Spring Boot Developer",
    "AI Developer Kuala Lumpur",
  ],
  openGraph: {
    title: "Mohd Hafiz Abd Rahim | Independent Frontend Developer",
    description: "Thoughtful web experiences, built with precision. Independent frontend development with React, Next.js, and TypeScript.",
    url: "https://dhomhafiz.dev",
    siteName: "dhomhafiz.dev",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mohd Hafiz Abd Rahim | Independent Frontend Developer",
    description: "Thoughtful web experiences, built with precision.",
  },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning className={`${display.variable} ${body.variable}`}>
    <head><script dangerouslySetInnerHTML={{ __html: themeInitScript }} /></head>
    <body className="bg-cyber-dark font-mono text-cyber-text antialiased">
      <a href="#main" className="skip-link">Skip to content</a>{children}
    </body>
  </html>;
}
