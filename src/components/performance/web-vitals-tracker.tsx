'use client';

import { useEffect } from 'react';

/**
 * Web Vitals Performance Tracker
 * Monitors and reports Core Web Vitals metrics to optimize user experience
 */
export function WebVitalsTracker() {
  useEffect(() => {
    // Function to send metrics to analytics
    const sendToAnalytics = (metric: any) => {
      // Log metrics to console for development
      console.log(`${metric.name}: ${metric.value}`);

      // In production, you would send these metrics to your analytics endpoint
      // Example: send to GA4 or other analytics service
      /*
      const body = JSON.stringify({
        name: metric.name,
        value: metric.value,
        id: metric.id,
        delta: metric.delta,
        navigationType: metric.navigationType,
        rating: metric.rating,
      });

      // Using sendBeacon to ensure delivery even if user navigates away
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/analytics/web-vitals', body);
      } else {
        // Fallback if sendBeacon is not supported
        fetch('/analytics/web-vitals', {
          method: 'POST',
          body,
          keepalive: true,
        }).catch(console.error);
      }
      */
    };

    try {
      // Dynamically import web-vitals library for performance tracking
      import('web-vitals').then((module: any) => {
        // Call the web-vitals functions to start tracking if they exist
        if (module.getCLS) module.getCLS(sendToAnalytics);
        if (module.getFID) module.getFID(sendToAnalytics);
        if (module.getFCP) module.getFCP(sendToAnalytics);
        if (module.getLCP) module.getLCP(sendToAnalytics);
        if (module.getTTFB) module.getTTFB(sendToAnalytics);
      }).catch(error => {
        console.warn('web-vitals library not available:', error);
      });
    } catch (error) {
      console.warn('Error importing web-vitals:', error);
    }
  }, []);

  return null; // This component only runs effects, doesn't render UI
}