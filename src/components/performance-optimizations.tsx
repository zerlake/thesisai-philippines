"use client";

/**
 * Performance Optimizations Component
 * Implements critical loading optimizations to reduce LCP and TBT
 */

export function PerformanceOptimizations() {
  return (
    <>
      {/* Preload critical fonts */}
      <link
        rel="preload"
        href="/fonts/outfit-variable.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      <link
        rel="preload"
        href="/fonts/lora-variable.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />

      {/* Preload hero background image in WebP format */}
      <link
        rel="preload"
        href="/hero-background.webp"
        as="image"
        type="image/webp"
        media="(min-width: 1024px)"
      />

      {/* Preload hero background for mobile/tablet */}
      <link
        rel="preload"
        href="/hero-background.webp"
        as="image"
        type="image/webp"
        media="(max-width: 1023px)"
      />

      {/* DNS Prefetch for external services */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//cdn.jsdelivr.net" />

      {/* Preconnect to critical origins */}
      <link
        rel="preconnect"
        href="https://fonts.googleapis.com"
        crossOrigin="anonymous"
      />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />

      {/* Optimize Google Fonts loading */}
      <link
        rel="preload"
        as="style"
        href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Lora:wght@400;500;600;700&display=swap"
      />
    </>
  );
}
