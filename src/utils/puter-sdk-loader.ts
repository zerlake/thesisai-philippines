/**
 * Utility to dynamically load Puter SDK only when needed
 * This avoids continuous API calls when Puter features aren't in use
 */
let sdkLoaded = false;
let sdkLoadingPromise: Promise<void> | null = null;

export async function loadPuterSDK(): Promise<void> {
  if (sdkLoaded) {
    return Promise.resolve();
  }
  
  if (sdkLoadingPromise) {
    return sdkLoadingPromise;
  }
  
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Puter SDK can only be loaded in browser'));
  }
  
  // Check if SDK is already loaded
  if ((window as any).puter) {
    sdkLoaded = true;
    return Promise.resolve();
  }
  
  sdkLoadingPromise = new Promise((resolve, reject) => {
    // Check if already loaded
    if ((window as any).puter) {
      sdkLoaded = true;
      resolve();
      return;
    }
    
    // Create script element
    const script = document.createElement('script');
    script.src = 'https://js.puter.com/v2/?autoload=false'; // autoload=false to prevent automatic session checks
    script.async = true;
    
    script.onload = () => {
      sdkLoaded = true;
      resolve();
    };
    
    script.onerror = (error) => {
      console.error('Failed to load Puter SDK:', error);
      reject(new Error('Failed to load Puter SDK'));
    };
    
    document.head.appendChild(script);
  });
  
  return sdkLoadingPromise;
}

export function isPuterSDKLoaded(): boolean {
  return sdkLoaded && !!(window as any).puter;
}