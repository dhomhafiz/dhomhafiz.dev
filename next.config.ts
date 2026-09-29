import type { NextConfig } from "next";

// Static export keeps the initial portfolio deployable on any static host.
const config: NextConfig = {
  output: "export",
  trailingSlash: true,
  devIndicators: false,
  basePath: "",
};
export default config;
