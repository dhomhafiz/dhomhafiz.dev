import localFont from "next/font/local";

export const displayFont = localFont({
  src: "../app/fonts/anton-display.ttf",
  weight: "400",
  display: "swap",
  variable: "--font-display",
});
