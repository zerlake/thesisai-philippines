'use client';

import { useEffect } from 'react';

/**
 * Performance Optimization Component
 * Implements optimizations for Core Web Vitals (LCP, FID, CLS)
 */
export function PerformanceOptimizer() {
  useEffect(() => {
    // Optimize for Largest Contentful Paint (LCP)
    // Preload critical resources
    const preloadLCPResources = () => {
      // Preconnect to critical origins
      const preconnectLinks = [
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
        'https://cdn.jsdelivr.net',
        'https://unpkg.com'
      ];
      
      preconnectLinks.forEach(href => {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = href;
        document.head.appendChild(link);
      });
      
      // Prefetch critical fonts
      const fontLink = document.createElement('link');
      fontLink.rel = 'preload';
      fontLink.as = 'font';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
      fontLink.crossOrigin = 'anonymous';
      document.head.appendChild(fontLink);
    };

    // Optimize for Cumulative Layout Shift (CLS)
    const optimizeCLS = () => {
      // Reserve space for images and iframes to prevent layout shifts
      const reserveSpaceForElements = () => {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
          if (!img.hasAttribute('width') || !img.hasAttribute('height')) {
            // If no explicit dimensions, set aspect ratio based on natural size when loaded
            if (img.complete && img.naturalWidth && img.naturalHeight) {
              img.style.aspectRatio = `${img.naturalWidth}/${img.naturalHeight}`;
            } else {
              img.onload = () => {
                img.style.aspectRatio = `${img.naturalWidth}/${img.naturalHeight}`;
              };
            }
          }
        });
        
        // Reserve space for iframes
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
          if (!iframe.width || !iframe.height) {
            iframe.style.aspectRatio = '16/9';
          }
        });
      };

      // Add style rules for consistent spacing
      const style = document.createElement('style');
      style.textContent = `
        /* Prevent layout shifts from dynamic content */
        .animate-in {
          animation-fill-mode: both;
        }
        
        /* Reserve space for elements that may cause CLS */
        .reserve-space {
          content-visibility: auto;
          contain-intrinsic-size: auto 200px;
        }
        
        /* Optimize for font loading */
        .wf-loading body {
          visibility: hidden;
        }
        
        /* Improve loading performance */
        img, svg, canvas, video {
          content-visibility: auto;
          contain-intrinsic-size: auto;
        }
      `;
      document.head.appendChild(style);

      reserveSpaceForElements();

      return () => {
        document.head.removeChild(style);
      };
    };

    // Optimize for First Input Delay (FID)
    const optimizeFID = () => {
      // Reduce JavaScript execution time during initial load
      // Defer non-critical JavaScript
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Process elements only when they come into view
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '100px'
      });

      // Observe elements that should be processed on scroll
      document.querySelectorAll('[data-animate-on-scroll]').forEach(el => {
        observer.observe(el);
      });

      return () => {
        observer.disconnect();
      };
    };

    // Apply optimizations
    preloadLCPResources();
    optimizeCLS();
    optimizeFID();
    
    // Additional optimization: defer non-critical CSS
    const optimizeCSS = () => {
      // Move non-critical CSS to after initial render
      const nonCriticalCSS = document.querySelectorAll('link[rel="stylesheet"][media="print"]');
      nonCriticalCSS.forEach(link => {
        setTimeout(() => {
          (link as HTMLLinkElement).media = 'all';
        }, 2000); // Load non-critical CSS after 2 seconds
      });
    };
    
    optimizeCSS();
  }, []);

  return null;
}