// HTML Sanitizer utility to prevent XSS when using dangerouslySetInnerHTML
// This uses DOMPurify equivalent functionality but avoids using browser-specific APIs during SSR

export function sanitizeHtml(html: string): string {
  // For server-side rendering, return empty string to prevent issues
  if (typeof window === 'undefined') {
    return '';
  }

  // For client-side, create a temporary DOM element to parse the HTML
  const tempElement = document.createElement('div');
  tempElement.innerHTML = html;

  // Remove potentially dangerous elements and attributes
  removeDangerousElements(tempElement);
  removeDangerousAttributes(tempElement);

  return tempElement.innerHTML;
}

function removeDangerousElements(element: HTMLElement) {
  // List of potentially dangerous elements to remove
  const dangerousElements = ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'link', 'meta', 'base'];

  dangerousElements.forEach(tag => {
    const elements = element.getElementsByTagName(tag);
    // Convert to array since getElementsByTagName returns a live collection
    const elementsArray = Array.from(elements);
    elementsArray.forEach(el => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
  });

  // Remove any remaining dangerous elements recursively
  const allElements = element.getElementsByTagName('*');
  const allElementsArray = Array.from(allElements) as HTMLElement[];

  allElementsArray.forEach(el => {
    // Check for dangerous tag names
    if (dangerousElements.includes(el.tagName.toLowerCase())) {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    }
  });
}

function removeDangerousAttributes(element: HTMLElement) {
  const allElements = element.getElementsByTagName('*');
  const allElementsArray = Array.from(allElements) as HTMLElement[];

  allElementsArray.forEach(el => {
    // Remove dangerous attributes
    const dangerousAttributes = ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur', 'onchange', 'onsubmit'];

    dangerousAttributes.forEach(attr => {
      if (el.hasAttribute(attr)) {
        el.removeAttribute(attr);
      }
    });

    // Remove attributes that start with 'on' (event handlers)
    const attrs = Array.from(el.attributes);
    attrs.forEach(attr => {
      if (attr.name.toLowerCase().startsWith('on')) {
        el.removeAttribute(attr.name);
      }
    });

    // Remove javascript: hrefs
    if (el.tagName === 'A' || el.tagName === 'AREA') {
      const href = el.getAttribute('href');
      if (href && href.toLowerCase().startsWith('javascript:')) {
        el.removeAttribute('href');
      }
    }
  });
}

// React hook to safely handle HTML sanitization
export function useSanitizedHtml(html: string) {
  if (typeof window === 'undefined') {
    // Server-side rendering - return empty object to prevent hydration issues
    return { __html: '' };
  }

  return { __html: sanitizeHtml(html) };
}

// Alternative implementation that returns a sanitized HTML string more safely
export function createSanitizedHtml(html: string) {
  if (typeof window === 'undefined') {
    // Server-side rendering - return empty object to prevent hydration issues
    return { __html: '' };
  }

  return { __html: sanitizeHtml(html) };
}