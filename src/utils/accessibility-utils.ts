/**
 * Comprehensive accessibility utilities for screen readers, keyboard navigation,
 * and inclusive design patterns
 */

/**
 * Create proper ARIA label combinations
 */
export function createAriaLabel(...parts: (string | undefined | null)[]): string {
  return parts.filter(Boolean).join(": ");
}

/**
 * Add descriptive text for screen readers using aria-describedby
 */
export function createDescription(
  baseText: string,
  additionalContext?: string
): string {
  if (!additionalContext) return baseText;
  return `${baseText}. ${additionalContext}`;
}

/**
 * Validate semantic HTML and ARIA usage
 */
export function validateA11yElement(element: HTMLElement): {
  isValid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  // Check for proper heading hierarchy
  const headingLevel = getHeadingLevel(element);
  if (headingLevel && !isValidHeadingHierarchy(element)) {
    warnings.push("Heading hierarchy is not sequential");
  }

  // Check for alternative text
  if (element.tagName === "IMG" && !element.getAttribute("alt")) {
    warnings.push("Image missing alt text");
  }

  // Check button accessibility
  if (element.tagName === "BUTTON" || element.tagName === "A") {
    const label = getAccessibleName(element);
    if (!label) {
      warnings.push("Button/Link missing accessible name");
    }
  }

  // Check form labels
  if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
    const label = document.querySelector(`label[for="${element.id}"]`);
    if (!label && !element.getAttribute("aria-label")) {
      warnings.push("Form control missing label");
    }
  }

  // Check for keyboard accessibility
  if (isInteractive(element) && !isKeyboardAccessible(element)) {
    warnings.push("Interactive element not keyboard accessible");
  }

  return {
    isValid: warnings.length === 0,
    warnings,
  };
}

/**
 * Get the accessible name of an element (how screen readers read it)
 */
export function getAccessibleName(element: HTMLElement): string {
  // 1. Check aria-labelledby
  const labelledBy = element.getAttribute("aria-labelledby");
  if (labelledBy) {
    return labelledBy
      .split(" ")
      .map((id) => document.getElementById(id)?.textContent || "")
      .join(" ");
  }

  // 2. Check aria-label
  const ariaLabel = element.getAttribute("aria-label");
  if (ariaLabel) return ariaLabel;

  // 3. Check associated label
  if (element.id) {
    const label = document.querySelector(`label[for="${element.id}"]`);
    if (label) return label.textContent || "";
  }

  // 4. Use element's text content
  if (element.textContent) return element.textContent.trim();

  // 5. Check title attribute
  return element.getAttribute("title") || "";
}

/**
 * Check if element is keyboard accessible
 */
export function isKeyboardAccessible(element: HTMLElement): boolean {
  const tag = element.tagName.toLowerCase();
  const tabindex = element.getAttribute("tabindex");
  const isNaturallyFocusable = [
    "a",
    "button",
    "input",
    "select",
    "textarea",
  ].includes(tag);

  return (
    isNaturallyFocusable ||
    (tabindex !== null && parseInt(tabindex) >= 0)
  );
}

/**
 * Check if element is interactive
 */
export function isInteractive(element: HTMLElement): boolean {
  const tag = element.tagName.toLowerCase();
  const role = element.getAttribute("role");

  return (
    ["a", "button", "input", "select", "textarea"].includes(tag) ||
    ["button", "link", "menuitem", "tab"].includes(role || "")
  );
}

/**
 * Get heading level (1-6)
 */
export function getHeadingLevel(element: HTMLElement): number | null {
  const match = element.tagName.match(/h([1-6])/i);
  return match ? parseInt(match[1]) : null;
}

/**
 * Check if heading hierarchy is valid
 */
export function isValidHeadingHierarchy(element: HTMLElement): boolean {
  const headings = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"));
  let previousLevel = 0;

  for (const heading of headings) {
    const level = getHeadingLevel(heading as HTMLElement) || 0;
    // Levels should not skip more than one level up
    if (level - previousLevel > 1) {
      return false;
    }
    previousLevel = level;
  }

  return true;
}

/**
 * Create accessible tooltip
 */
export function createAccessibleTooltip(
  triggerElement: HTMLElement,
  content: string
): HTMLDivElement {
  const tooltip = document.createElement("div");
  const id = `tooltip-${Math.random().toString(36).substr(2, 9)}`;

  tooltip.id = id;
  tooltip.setAttribute("role", "tooltip");
  tooltip.className = "accessible-tooltip";
  tooltip.textContent = content;

  triggerElement.setAttribute("aria-describedby", id);

  return tooltip;
}

/**
 * Make content visible only to screen readers
 */
export function createScreenReaderOnlyText(text: string): HTMLSpanElement {
  const span = document.createElement("span");
  span.className = "sr-only";
  span.setAttribute("aria-hidden", "false");
  span.textContent = text;

  // Add CSS class definition if not exists
  if (!document.querySelector("style[data-sr-only]")) {
    const style = document.createElement("style");
    style.setAttribute("data-sr-only", "");
    style.textContent = `
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
      }
    `;
    document.head.appendChild(style);
  }

  return span;
}

/**
 * Announce to screen readers immediately
 */
export function announceToScreenReaders(
  text: string,
  polarity: "polite" | "assertive" = "polite"
): void {
  const id = `announcement-${Date.now()}`;
  const announcement = document.createElement("div");

  announcement.id = id;
  announcement.setAttribute("aria-live", polarity);
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = text;

  document.body.appendChild(announcement);

  // Clean up after announcement
  setTimeout(() => {
    announcement.remove();
  }, 1000);
}

/**
 * Check color contrast ratio (WCAG)
 */
export function getContrastRatio(
  foreground: string,
  background: string
): number {
  const fgLum = getLuminance(foreground);
  const bgLum = getLuminance(background);

  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Calculate relative luminance for contrast ratio
 */
function getLuminance(color: string): number {
  const rgb = getRGB(color);
  const [r, g, b] = rgb.map((val) => {
    val = val / 255;
    return val <= 0.03928
      ? val / 12.92
      : Math.pow((val + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Parse color to RGB
 */
function getRGB(color: string): number[] {
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return [0, 0, 0];

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const imageData = ctx.getImageData(0, 0, 1, 1).data;
  return [imageData[0], imageData[1], imageData[2]];
}

/**
 * Check if contrast ratio meets WCAG standards
 */
export function meetsWCAGContrast(
  contrastRatio: number,
  level: "AA" | "AAA" = "AA",
  isLargeText: boolean = false
): boolean {
  if (level === "AAA") {
    return isLargeText ? contrastRatio >= 4.5 : contrastRatio >= 7;
  }
  // Level AA
  return isLargeText ? contrastRatio >= 3 : contrastRatio >= 4.5;
}

/**
 * Generate high-contrast color scheme
 */
export function getHighContrastColors(isDark: boolean = false) {
  return isDark
    ? {
        foreground: "#FFFF00", // Bright yellow text
        background: "#000000", // Pure black background
        accent: "#00FFFF", // Cyan
        link: "#00FF00", // Bright green
        error: "#FF6B6B", // Red
        success: "#00FF00", // Green
      }
    : {
        foreground: "#000000", // Pure black text
        background: "#FFFF00", // Bright yellow background
        accent: "#0000FF", // Blue
        link: "#0000FF", // Blue
        error: "#FF0000", // Red
        success: "#008000", // Green
      };
}

/**
 * Calm color palette for neurodiversity
 */
export function getCalmColorPalette() {
  return {
    primary: "#6366F1", // Soft indigo
    secondary: "#A78BFA", // Light purple
    success: "#6EE7B7", // Soft mint
    error: "#F87171", // Soft red
    warning: "#FBBF24", // Soft amber
    background: "#F9FAFB", // Very light gray
    surface: "#FFFFFF", // White
    text: "#374151", // Dark gray
  };
}

/**
 * Clear, simple language patterns
 */
export const CLEAR_LANGUAGE = {
  SUCCESS: "Done. Your work was saved.",
  ERROR: "Something went wrong. Try again.",
  LOADING: "Loading...",
  CONFIRM: "Are you sure?",
  CLOSE: "Close",
  SAVE: "Save",
  CANCEL: "Cancel",
  DELETE: "Delete",
  EDIT: "Edit",
  DOWNLOAD: "Download",
  UPLOAD: "Upload",
  SEARCH: "Search",
  FILTER: "Filter",
  SORT: "Sort",
};
