import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import { config } from "./config/config";

export default defineConfig({
  site: config.site.url,
  output: config.astro.output,
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
      configPath: "./wrangler.toml",
    },
  }),
  compressHTML: config.astro.compressHTML,
  build: {
    inlineStylesheets: config.astro.build.inlineStylesheets,
  },
  integrations: [],
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      external: ["@cloudflare/workers-types"],
    },
  },
});