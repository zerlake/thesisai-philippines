"use client";

import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";
import { ChunkLoadErrorHandler } from "@/components/chunk-load-error-handler";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    try {
      Sentry.captureException(error);
    } catch (e) {
      // Sentry might not be initialized yet
      console.error("Global error:", error);
    }
  }, [error]);

  return (
    <html>
      <body>
        <ChunkLoadErrorHandler />
        <NextError statusCode={0} />
      </body>
    </html>
  );
}