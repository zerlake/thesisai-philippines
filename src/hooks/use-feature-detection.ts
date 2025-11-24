import { useEffect, useState } from "react";

export interface FeatureFlags {
  // Storage
  localStorage: boolean;
  sessionStorage: boolean;
  indexedDB: boolean;

  // Media
  webCamera: boolean;
  webMicrophone: boolean;
  webAudio: boolean;

  // APIs
  serviceWorker: boolean;
  pushNotifications: boolean;
  vibration: boolean;
  notification: boolean;
  geolocation: boolean;
  clipboard: boolean;
  share: boolean;

  // Performance
  intersectionObserver: boolean;
  requestIdleCallback: boolean;
  performanceAPI: boolean;

  // CSS
  cssGrid: boolean;
  cssFlexbox: boolean;
  cssCustomProperties: boolean;
  cssMasking: boolean;

  // Graphics
  webGL: boolean;
  webGL2: boolean;
  canvas: boolean;

  // Other
  webWorkers: boolean;
  sharedArrayBuffer: boolean;
  bigInt: boolean;
}

/**
 * Hook for feature detection and graceful degradation
 * Detects browser capabilities and disables unsupported features
 */
export function useFeatureDetection(): FeatureFlags {
  const [features, setFeatures] = useState<FeatureFlags>({
    localStorage: false,
    sessionStorage: false,
    indexedDB: false,
    webCamera: false,
    webMicrophone: false,
    webAudio: false,
    serviceWorker: false,
    pushNotifications: false,
    vibration: false,
    notification: false,
    geolocation: false,
    clipboard: false,
    share: false,
    intersectionObserver: false,
    requestIdleCallback: false,
    performanceAPI: false,
    cssGrid: false,
    cssFlexbox: false,
    cssCustomProperties: false,
    cssMasking: false,
    webGL: false,
    webGL2: false,
    canvas: false,
    webWorkers: false,
    sharedArrayBuffer: false,
    bigInt: false,
  });

  useEffect(() => {
    const detected: FeatureFlags = {
      // Storage
      localStorage: !!detectLocalStorage(),
      sessionStorage: !!detectSessionStorage(),
      indexedDB: !!detectIndexedDB(),

      // Media
      webCamera: detectMediaDevices("camera"),
      webMicrophone: detectMediaDevices("microphone"),
      webAudio: !!detectWebAudio(),

      // APIs
      serviceWorker: !!detectServiceWorker(),
      pushNotifications: detectPushNotifications(),
      vibration: detectVibration(),
      notification: detectNotification(),
      geolocation: detectGeolocation(),
      clipboard: detectClipboard(),
      share: detectShare(),

      // Performance
      intersectionObserver: !!detectIntersectionObserver(),
      requestIdleCallback: !!detectRequestIdleCallback(),
      performanceAPI: !!detectPerformanceAPI(),

      // CSS
      cssGrid: detectCSSFeature("display", "grid"),
      cssFlexbox: detectCSSFeature("display", "flex"),
      cssCustomProperties: detectCSSCustomProperties(),
      cssMasking: detectCSSFeature("mask", "url(#)"),

      // Graphics
      webGL: detectWebGL(),
      webGL2: detectWebGL2(),
      canvas: detectCanvas(),

      // Other
      webWorkers: !!detectWebWorkers(),
      sharedArrayBuffer: !!detectSharedArrayBuffer(),
      bigInt: detectBigInt(),
    };

    setFeatures(detected);
  }, []);

  return features;
}

// Detection functions

function detectLocalStorage(): boolean {
  try {
    const test = "__test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

function detectSessionStorage(): boolean {
  try {
    const test = "__test__";
    sessionStorage.setItem(test, test);
    sessionStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

function detectIndexedDB(): boolean {
  return (
    !!window.indexedDB &&
    !!window.IDBDatabase &&
    !!window.IDBKeyRange &&
    !!window.IDBObjectStore &&
    !!window.IDBTransaction
  );
}

function detectMediaDevices(type: "camera" | "microphone"): boolean {
  if (!navigator.mediaDevices?.enumerateDevices) return false;

  try {
    const constraint = type === "camera" ? { video: true } : { audio: true };
    return !!navigator.mediaDevices.getUserMedia;
  } catch {
    return false;
  }
}

function detectWebAudio(): boolean {
  const audioContext =
    (window as any).AudioContext || (window as any).webkitAudioContext;
  return !!audioContext;
}

function detectServiceWorker(): boolean {
  return !!navigator.serviceWorker;
}

function detectPushNotifications(): boolean {
  return (
    !!navigator.serviceWorker &&
    "PushManager" in window &&
    "Notification" in window
  );
}

function detectVibration(): boolean {
  return !!navigator.vibrate;
}

function detectNotification(): boolean {
  return !!window.Notification;
}

function detectGeolocation(): boolean {
  return !!navigator.geolocation;
}

function detectClipboard(): boolean {
  return !!navigator.clipboard;
}

function detectShare(): boolean {
  return !!navigator.share;
}

function detectIntersectionObserver(): boolean {
  return !!window.IntersectionObserver;
}

function detectRequestIdleCallback(): boolean {
  return !!window.requestIdleCallback;
}

function detectPerformanceAPI(): boolean {
  return !!window.performance && !!window.performance.now;
}

function detectCSSFeature(property: string, value: string): boolean {
  const el = document.createElement("div");
  el.style.cssText = `${property}: ${value}`;
  return el.style[property as any] !== "";
}

function detectCSSCustomProperties(): boolean {
  const el = document.createElement("div");
  el.style.setProperty("--test", "1px");
  return el.style.getPropertyValue("--test") !== "";
}

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    return !!gl;
  } catch {
    return false;
  }
}

function detectWebGL2(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    return !!gl;
  } catch {
    return false;
  }
}

function detectCanvas(): boolean {
  const canvas = document.createElement("canvas");
  return !!canvas.getContext;
}

function detectWebWorkers(): boolean {
  return typeof Worker !== "undefined";
}

function detectSharedArrayBuffer(): boolean {
  return typeof SharedArrayBuffer !== "undefined";
}

function detectBigInt(): boolean {
  try {
    // eslint-disable-next-line no-eval
    eval("BigInt(1)");
    return true;
  } catch {
    return false;
  }
}

/**
 * Graceful degradation: provide fallbacks for unsupported features
 */
export const fallbacks = {
  localStorage: () => {
    // Use in-memory storage as fallback
    const storage: Record<string, string> = {};
    return {
      getItem: (key: string) => storage[key] || null,
      setItem: (key: string, value: string) => {
        storage[key] = value;
      },
      removeItem: (key: string) => {
        delete storage[key];
      },
      clear: () => {
        Object.keys(storage).forEach((key) => delete storage[key]);
      },
    };
  },

  indexedDB: async () => {
    // Use localStorage as fallback
    return {
      open: () => ({
        createObjectStore: () => {},
      }),
    };
  },

  intersectionObserver: () => {
    // Fallback to simple visibility check
    return class FallbackObserver {
      constructor(callback: Function) {}
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  },

  canvas: (fallback: string) => {
    // Fallback to static image
    return fallback;
  },
};
