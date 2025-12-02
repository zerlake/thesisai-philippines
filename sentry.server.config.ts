// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

// Only initialize during runtime, not during build
const isProduction = process.env.NODE_ENV === 'production';
const isBuilding = process.env.NEXT_PHASE === 'phase-production-build';

if (SENTRY_DSN && isProduction && !isBuilding) {
  try {
    Sentry.init({
      dsn: SENTRY_DSN,

      // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
      tracesSampleRate: 0.5, // Reduced from 1.0 to avoid performance impact

      // Enable profiling sampling
      profilesSampleRate: 0.5,

      // Setting this option to true will print useful information to the console while you're setting up Sentry.
      debug: false,

      // Filter out errors that shouldn't be reported
      beforeSend: (event) => {
        // Don't send errors during development or if they're from the local environment
        if (!isProduction || process.env.NODE_ENV === 'development') {
          return null;
        }
        return event;
      },
    });
  } catch (error) {
    console.warn('Sentry initialization failed:', error);
  }
}
