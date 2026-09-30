import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { themeInitScript } from "@/config/theme";
import { assetPath } from "@/lib/assetPath";

// SRP: optimized fonts and document-wide metadata are owned by the root layout.
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap" });
const body = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", display: "swap" });
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
