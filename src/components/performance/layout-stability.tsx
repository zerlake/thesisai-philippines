'use client';

import { useEffect } from 'react';

/**
 * Layout Stability Component
 * Helps prevent Cumulative Layout Shift (CLS) by applying best practices
 */
export function LayoutStabilityOptimizer() {
  useEffect(() => {
    // Prevent layout shift by ensuring fonts load without swap behavior
    const style = document.createElement('style');
    style.textContent = `
      /* Prevent layout shift from web fonts */
      html {
        font-family: var(--font-sans), sans-serif;
      }
      
      /* Hide content until web fonts are loaded to prevent FOUT/FOIT */
      @media screen {
        @font-face {
          font-family: 'Outfit';
          font-display: swap; /* Use swap instead of optional to ensure text remains visible */
        }
        
        @font-face {
          font-family: 'Lora';
          font-display: swap;
        }
      }
      
      /* Reserve space for common elements to prevent layout shift */
      .aspect-video { aspect-ratio: 16/9; }
      .aspect-square { aspect-ratio: 1/1; }
      
      /* Ensure images don't cause layout shift */
      img[loading="lazy"] {
        content-visibility: auto;
        contain-intrinsic-size: 100px 200px;
      }
      
      /* Ensure iframe doesn't cause layout shift */
      iframe {
        display: block;
        width: 100%;
      }
    `;
    
    document.head.appendChild(style);
    
    // Add a class to body to indicate styles have been injected
    document.body.classList.add('layout-optimized');
    
    return () => {
      document.head.removeChild(style);
      document.body.classList.remove('layout-optimized');
    };
  }, []);

  return null;
}