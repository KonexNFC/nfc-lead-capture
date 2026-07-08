import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { db } from "./db";
import { sql } from "drizzle-orm";

const app = express();
app.use(compression());
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

// ── Permanent health endpoint — never depends on DB, always 200 ──────────────
// Registered before everything else so Replit health checks always pass.
app.get("/health", (_req, res) => res.status(200).send("ok"));

let appReady = false;
app.use((req, res, next) => {
  if (!appReady && (req.path === "/" || req.path === "/health")) {
    return res.status(200).send("ok");
  }
  next();
});

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

/** Wait for Neon DB to wake up (free-tier auto-suspend cold start).
 *  Retries with backoff; gives up after ~30 s but never throws. */
async function waitForDb(maxRetries = 12): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await db.execute(sql`SELECT 1`);
      if (i > 0) log(`DB ready after ${i + 1} attempt(s)`, "db");
      return;
    } catch (_) {
      const delay = Math.min(1000 * (i + 1), 5000);
      log(`DB not ready (attempt ${i + 1}/${maxRetries}), retrying in ${delay}ms…`, "db");
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  log("DB warmup timed out — continuing anyway", "db");
}

(async () => {
  const port = parseInt(process.env.PORT || "5000", 10);

  // Bind the port immediately so the proxy doesn't see "connection refused"
  // while we wait for Neon to wake up.
  httpServer.listen(
    { port, host: "0.0.0.0", reusePort: true },
    () => { log(`serving on port ${port}`); },
  );

  // ── Wait for Neon cold start ───────────────────────────────────────────────
  await waitForDb();

  // ── Startup migration: set Social Hub as default for all unthemed profiles ─
  try {
    const result = await db.execute(sql`
      UPDATE profiles
      SET branding = jsonb_set(
        COALESCE(branding::jsonb, '{}'::jsonb),
        '{selectedThemeId}',
        '"social_hub"'::jsonb
      )
      WHERE branding->>'selectedThemeId' IS NULL
         OR branding->>'selectedThemeId' = 'minimal_corporate'
    `);
    if (result.rowCount && result.rowCount > 0) {
      log(`Set social_hub theme on ${result.rowCount} profile(s)`, "migration");
    }
  } catch (err: any) {
    console.error("[migration] Theme default migration failed:", err.message);
  }

  await registerRoutes(httpServer, app);

  // ── Session-store error swallower ─────────────────────────────────────────
  // When Neon's cold-start causes express-session to call next(err), we catch
  // it here for page/asset routes and fall through to static serving instead
  // of returning 500.  API and NFC routes still propagate real errors.
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    const isPage =
      !req.path.startsWith("/api") &&
      !req.path.startsWith("/t/") &&
      !req.path.startsWith("/u/");
    if (isPage && !res.headersSent) {
      // swallow session/db cold-start errors for page routes
      return next();
    }
    next(err);
  });

  // ── Generic error handler ─────────────────────────────────────────────────
  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  appReady = true;
})();
