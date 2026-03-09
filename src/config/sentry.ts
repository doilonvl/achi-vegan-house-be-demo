import type { Application } from "express";

export function initSentry(): void {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Sentry = require("@sentry/node") as typeof import("@sentry/node");
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: 1.0,
  });
}

export function setupSentryErrorHandler(app: Application): void {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return;

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Sentry = require("@sentry/node") as typeof import("@sentry/node");
  Sentry.setupExpressErrorHandler(app);
}
