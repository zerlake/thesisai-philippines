export function ChunkLoadErrorHandler() {
  const scriptContent = `
    (function() {
      const CHUNK_ERROR_RELOAD_KEY = 'chunk-error-reload-time';
      const handleError = (event) => {
        const error = event.reason || event.error;
        if (error && typeof error.message === 'string') {
          const isChunkLoadError = 
            error.message.includes('Loading chunk') ||
            error.message.includes('Failed to fetch dynamically imported module');

          if (isChunkLoadError) {
            const lastReloadTime = sessionStorage.getItem(CHUNK_ERROR_RELOAD_KEY);
            const now = Date.now();
            if (!lastReloadTime || now - parseInt(lastReloadTime) > 10000) {
              sessionStorage.setItem(CHUNK_ERROR_RELOAD_KEY, now.toString());
              console.error('DYAD: Detected chunk load error via inline script. Forcing a hard refresh.');
              window.location.reload();
            } else {
              console.error('DYAD: Chunk load error detected, but a recent reload was already attempted. Aborting to prevent a loop.');
            }
          }
        }
      };

      window.addEventListener('unhandledrejection', handleError);
      window.addEventListener('error', handleError);
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: scriptContent }} />;
}