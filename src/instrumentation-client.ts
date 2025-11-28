// This file configures the initialization of Sentry on the client.
// Deferred initialization: Sentry loads AFTER page becomes interactive
// to avoid blocking critical rendering paths
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// Initialize Sentry only after the page is interactive
// This prevents Sentry from blocking the main thread during initial page load
const initSentry = () => {
  Sentry.init({
    dsn: "https://d1e235fa48e5d919100103a13c0d2754@o4510045051748352.ingest.us.sentry.io/4510045132029952",

    // Reduce sample rate to 10% in production (adjust as needed)
    // This reduces the amount of data sent to Sentry while maintaining error tracking
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1,
    
    // Enable logs only in development
    enableLogs: process.env.NODE_ENV !== 'production',

    // Disable debug in production
    debug: false,
  });
};

// Defer Sentry initialization until after page is interactive
if (typeof window !== 'undefined') {
  // Use requestIdleCallback if available, otherwise defer with setTimeout
  if ('requestIdleCallback' in window) {
    requestIdleCallback(initSentry, { timeout: 5000 });
  } else {
    // Fallback: defer by 3 seconds to let initial paint complete
    setTimeout(initSentry, 3000);
  }
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
