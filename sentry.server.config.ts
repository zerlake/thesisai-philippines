// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// Only initialize during runtime, not during build
const isProduction = process.env.NODE_ENV === 'production';
const isBuilding = process.env.BUILDING === 'true';

if (isProduction && !isBuilding) {
  Sentry.init({
    dsn: "https://d1e235fa48e5d919100103a13c0d2754@o4510045051748352.ingest.us.sentry.io/4510045132029952",

    // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
    tracesSampleRate: 1,

    // Enable logs to be sent to Sentry
    enableLogs: true,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,
  });
}
