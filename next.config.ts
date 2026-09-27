import type { NextConfig } from "next";

// Static export keeps the initial portfolio deployable on any static host.
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
const config: NextConfig = {
  output: "export",
  trailingSlash: true,
  devIndicators: false,
  basePath,
};
export default config;
