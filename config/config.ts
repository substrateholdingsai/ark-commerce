export const config = {
  site: {
    name: "Temozonia",
    description: "E-commerce platform powered by Cloudflare Workers",
    url: "https://temozonia.example.com",
    language: "es",
    timezone: "America/Mexico_City",
  },

  astro: {
    output: "static",
    adapter: "cloudflare",
    compressHTML: true,
    build: {
      inlineStylesheets: "auto",
    },
  },

  cloudflare: {
    worker: {
      name: "temozonia",
      routes: [
        { pattern: "temozonia.example.com/*", zone_name: "example.com" },
      ],
    },
    bindings: {
      d1: "DB",
      kv: "KV",
      r2: "R2",
      queues: "QUEUE",
      durableObjects: "SESSION",
      vectorize: "VECTORIZE",
      ai: "AI",
    },
  },

  features: {
    staticSite: true,
    interactiveIslands: true,
    pythonScripts: true,
    edgeFunctions: true,
    realtime: false,
    analytics: true,
  },

  integrations: {
    stripe: {
      enabled: false,
      publishableKey: "",
      webhookSecret: "",
    },
    sentry: {
      enabled: false,
      dsn: "",
    },
    vercel: {
      enabled: false,
    },
  },

  python: {
    enabled: true,
    runtime: "pyodide",
    packages: ["numpy", "pandas", "requests"],
    entryPoint: "scripts/python/main.py",
  },

  security: {
    cors: {
      origins: ["https://temozonia.example.com"],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      headers: ["Content-Type", "Authorization"],
    },
    csp: {
      "default-src": ["'self'"],
      "script-src": ["'self'", "'unsafe-inline'"],
      "style-src": ["'self'", "'unsafe-inline'"],
      "img-src": ["'self'", "data:", "https:"],
      "connect-src": ["'self'", "https://api.stripe.com"],
    },
  },

  performance: {
    cache: {
      static: "public, max-age=31536000, immutable",
      html: "public, max-age=0, must-revalidate",
      api: "private, max-age=0, no-cache",
    },
    compression: "gzip",
    minify: true,
  },
} as const;

export type Config = typeof config;

export function getConfig(): Config {
  return config;
}

export function getBinding<T extends keyof Config["cloudflare"]["bindings"]>(
  binding: T
): Config["cloudflare"]["bindings"][T] {
  return config.cloudflare.bindings[binding];
}