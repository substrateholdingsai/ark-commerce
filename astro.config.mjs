import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import { config } from "./config/config";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
        "@config": path.resolve(__dirname, "config"),
      },
    },
    ssr: {
      external: ["@cloudflare/workers-types"],
    },
  },
});