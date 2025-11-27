import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config').catch((e) => {
      console.error('Failed to initialize server Sentry config:', e);
    });
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config').catch((e) => {
      console.error('Failed to initialize edge Sentry config:', e);
    });
  }
}

export const onRequestError = Sentry.captureRequestError;
