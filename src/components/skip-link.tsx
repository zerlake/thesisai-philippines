/**
 * Skip Link Component
 * Provides keyboard users with ability to skip to main content
 * 
 * Accessibility: WCAG 2.1 Success Criterion 2.4.1 Bypass Blocks (Level A)
 * 
 * Usage:
 *   <SkipLink href="#main-content" />
 *   
 * The link is hidden visually but visible to screen readers
 * Press Tab on page load to see it
 */

import Link from 'next/link';

interface SkipLinkProps {
  href?: string;
  label?: string;
}

export function SkipLink({ 
  href = '#main-content', 
  label = 'Skip to main content' 
}: SkipLinkProps) {
  return (
    <Link
      href={href}
      className={`
        absolute
        -top-full
        left-0
        z-50
        bg-primary
        text-primary-foreground
        px-4
        py-2
        text-sm
        font-medium
        rounded-md
        no-underline
        
        /* Focus visible shows the link */
        focus:top-0
        focus:outline-none
        focus:ring-2
        focus:ring-offset-2
        focus:ring-ring
        
        /* Screen reader only by default */
        sr-only
        focus:not-sr-only
      `}
    >
      {label}
    </Link>
  );
}

export default SkipLink;
