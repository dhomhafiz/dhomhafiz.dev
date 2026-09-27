import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { themeInitScript } from "@/config/theme";

// SRP: optimized fonts and document-wide metadata are owned by the root layout.
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap" });
const body = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", display: "swap" });
export const metadata: Metadata = {
  title: "Mohd Hafiz Abd Rahim",
  description: "Thoughtful web experiences, built with precision. Independent frontend development with React, Next.js, and TypeScript.",
  icons: { icon: "/favicon.svg" },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning className={`${display.variable} ${body.variable}`}>
    <head><script dangerouslySetInnerHTML={{ __html: themeInitScript }} /></head>
    <body className="bg-cyber-dark font-mono text-cyber-text antialiased">
      <a href="#main" className="skip-link">Skip to content</a>{children}
    </body>
  </html>;
}
