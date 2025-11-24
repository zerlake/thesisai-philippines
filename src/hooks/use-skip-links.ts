import { useEffect } from "react";

export interface SkipLink {
  id: string;
  label: string;
  href: string; // CSS selector or "#id"
}

/**
 * Hook to manage skip links for keyboard navigation
 * Allows users to skip repetitive content (navigation, sidebars)
 */
export function useSkipLinks(skipLinks: SkipLink[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + S or Alt + Shift + S to show skip links
      if ((e.altKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        showSkipLinksMenu(skipLinks);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [skipLinks]);

  const skipTo = (href: string) => {
    const target = document.querySelector(href) as HTMLElement;
    if (target) {
      target.tabIndex = -1; // Make it focusable
      target.focus();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      
      // Remove tabIndex after focus
      target.addEventListener("blur", () => {
        target.tabIndex = 0;
      }, { once: true });
    }
  };

  return { skipTo };
}

/**
 * Display skip links menu (should be shown visually on keyboard focus)
 */
function showSkipLinksMenu(links: SkipLink[]): void {
  // This would typically be handled by a visible skip links component
  // This function is called when user presses Alt+S
  console.log("Skip Links Available:", links);
  
  // In a real implementation, this would show a modal/menu with skip links
  // For now, we log them for accessibility testing
  links.forEach((link, idx) => {
    console.log(`${idx + 1}. ${link.label} - Press: Alt+${idx + 1}`);
  });
}
