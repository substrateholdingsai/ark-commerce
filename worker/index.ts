import { Hono } from "hono";
import { serveStatic } from "hono/cloudflare-workers";
import { config, getConfig } from "../config/config";

type Bindings = {
  ASSETS: Fetcher;
  DB: D1Database;
  KV: KVNamespace;
  R2: R2Bucket;
  QUEUE: Queue;
  SESSION: DurableObjectNamespace;
  VECTORIZE: VectorizeIndex;
  AI: Ai;
};

type Variables = {
  config: ReturnType<typeof getConfig>;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

app.use("*", async (c, next) => {
  c.set("config", getConfig());
  await next();
});

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    service: config.site.name,
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/config", (c) => {
  const cfg = c.get("config");
  return c.json({
    site: cfg.site,
    features: cfg.features,
    integrations: Object.keys(cfg.integrations).filter(
      (k) => cfg.integrations[k as keyof typeof cfg.integrations].enabled
    ),
  });
});

app.get("/api/python/execute", async (c) => {
  const cfg = c.get("config");
  if (!cfg.python.enabled) {
    return c.json({ error: "Python execution not enabled" }, 400);
  }

  const code = c.req.query("code");
  if (!code) {
    return c.json({ error: "Code parameter required" }, 400);
  }

  try {
    const response = await c.env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
      messages: [
        {
          role: "system",
          content: "You are a Python code executor. Execute the code and return only the result.",
        },
        { role: "user", content: code },
      ],
    });

    return c.json({ result: response });
  } catch (error) {
    return c.json({ error: String(error) }, 500);
  }
});

app.get("*", serveStatic({ root: "./dist" }));
app.get("*", serveStatic({ path: "./dist/index.html" }));

export default app;
export type AppType = typeof app;

// Required export: Wrangler expects this class to be exported from the entrypoint
// because it is listed under [[durable_objects.bindings]] in wrangler.toml.
export class SessionDurableObject implements DurableObject {
  private state: DurableObjectState;

  constructor(state: DurableObjectState, _env: Bindings) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const sessionKey = url.searchParams.get("key") ?? "session";

    if (request.method === "GET") {
      const value = await this.state.storage.get<string>(sessionKey);
      return new Response(JSON.stringify({ [sessionKey]: value ?? null }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (request.method === "PUT") {
      const body = await request.json<Record<string, unknown>>();
      await this.state.storage.put(sessionKey, JSON.stringify(body));
      return new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (request.method === "DELETE") {
      await this.state.storage.delete(sessionKey);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Method not allowed", { status: 405 });
  }
}