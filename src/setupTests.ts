// src/setupTests.ts
import '@testing-library/jest-dom';

// Polyfill for HTMLElement and Element if not present (e.g., in some JSDOM setups)
if (typeof window !== 'undefined' && !window.HTMLElement) {
  window.HTMLElement = class HTMLElement extends window.Element {};
}
if (typeof window !== 'undefined' && !window.Element) {
  window.Element = class Element extends window.Node {};
}