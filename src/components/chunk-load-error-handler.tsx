import { createSanitizedHtml } from "@/lib/html-sanitizer";

export function ChunkLoadErrorHandler() {
  const scriptContent = `
    (function() {
      const CHUNK_ERROR_RELOAD_KEY = 'chunk-error-reload-time';
      const handleError = (event) => {
        const error = event.reason || event.error;
        if (error && typeof error.message === 'string') {
          const isChunkLoadError = 
            error.message.includes('Loading chunk') ||
            error.message.includes('Failed to fetch dynamically imported module') ||
            error.message.includes('ChunkLoadError');

          if (isChunkLoadError) {
            const lastReloadTime = sessionStorage.getItem(CHUNK_ERROR_RELOAD_KEY);
            const now = Date.now();
            // Only reload if it's been more than 10 seconds since the last reload
            if (!lastReloadTime || now - parseInt(lastReloadTime) > 10000) {
              sessionStorage.setItem(CHUNK_ERROR_RELOAD_KEY, now.toString());
              window.location.reload(true); // Force reload from server
            } else {
            }
          }
        }
      };

      window.addEventListener('unhandledrejection', handleError);
      window.addEventListener('error', handleError);
    })();
  `;

  return <script dangerouslySetInnerHTML={createSanitizedHtml(scriptContent)} />;
}