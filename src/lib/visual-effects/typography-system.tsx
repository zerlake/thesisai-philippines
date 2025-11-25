import React from 'react'
import { cn } from '@/lib/utils'

/**
 * Magazine-quality typography system
 * Implements advanced grid systems and typographic layouts
 */

interface TypographyProps {
  className?: string
  children: React.ReactNode
  variant?: string
}

// Display Heading - Maximum visual impact
export const DisplayHeading: React.FC<TypographyProps> = ({
  children,
  className,
}) => (
  <h1
    className={cn(
      'text-display font-bold tracking-tight',
      'bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent',
      'leading-[1.1] sm:leading-[1.2]',
      className
    )}
  >
    {children}
  </h1>
)

// Headline - Strong visual hierarchy
export const Headline: React.FC<TypographyProps> = ({
  children,
  className,
}) => (
  <h2
    className={cn(
      'text-heading font-bold tracking-tight',
      'text-foreground',
      'leading-[1.2] sm:leading-[1.3]',
      className
    )}
  >
    {children}
  </h2>
)

// Subheading - Supporting visual hierarchy
export const Subheading: React.FC<TypographyProps> = ({
  children,
  className,
}) => (
  <h3
    className={cn(
      'text-lg sm:text-xl font-semibold tracking-wide',
      'text-foreground/80',
      'leading-[1.3]',
      className
    )}
  >
    {children}
  </h3>
)

// Body text - Primary content
export const BodyText: React.FC<TypographyProps> = ({
  children,
  className,
}) => (
  <p
    className={cn(
      'text-body font-normal',
      'text-foreground/85',
      'leading-relaxed',
      'max-w-prose',
      className
    )}
  >
    {children}
  </p>
)

// Caption text - Secondary information
export const Caption: React.FC<TypographyProps> = ({
  children,
  className,
}) => (
  <p
    className={cn(
      'text-caption font-normal',
      'text-foreground/65',
      'leading-relaxed',
      className
    )}
  >
    {children}
  </p>
)

/**
 * Magazine-style grid layout for typography
 */
export const MagazineLayout: React.FC<{
  children: React.ReactNode
  columns?: 1 | 2 | 3
  gap?: 'tight' | 'normal' | 'loose'
  className?: string
}> = ({ children, columns = 2, gap = 'normal', className }) => {
  const gapMap = {
    tight: 'gap-4 sm:gap-6',
    normal: 'gap-6 sm:gap-8',
    loose: 'gap-8 sm:gap-12',
  }

  const columnMap = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  }

  return (
    <div
      className={cn(
        'grid',
        columnMap[columns],
        gapMap[gap],
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * Advanced baseline grid system
 * Ensures perfect vertical rhythm
 */
export const BaselineGrid: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className }) => (
  <div
    className={cn('relative', className)}
    style={{
      backgroundImage: `
        linear-gradient(
          to right,
          transparent 24%,
          rgba(59, 130, 246, 0.05) 25%,
          rgba(59, 130, 246, 0.05) 26%,
          transparent 27%,
          transparent 74%,
          rgba(59, 130, 246, 0.05) 75%,
          rgba(59, 130, 246, 0.05) 76%,
          transparent 77%,
          transparent
        ),
        linear-gradient(
          to bottom,
          transparent 98%,
          rgba(59, 130, 246, 0.05) 99%,
          rgba(59, 130, 246, 0.05) 100%
        )
      `,
      backgroundSize: '100% 1.5rem',
    }}
  >
    {children}
  </div>
)

/**
 * Text gradient effect
 */
export const GradientText: React.FC<{
  children: React.ReactNode
  from?: string
  to?: string
  className?: string
}> = ({ children, from = 'from-primary', to = 'to-purple-600', className }) => (
  <span
    className={cn(
      `bg-gradient-to-r ${from} ${to} bg-clip-text text-transparent`,
      className
    )}
  >
    {children}
  </span>
)

/**
 * Highlight component for emphasis
 */
export const HighlightedText: React.FC<{
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'accent'
  className?: string
}> = ({ children, variant = 'primary', className }) => {
  const variantMap = {
    primary: 'bg-primary/20 px-1 py-0.5 rounded',
    secondary: 'bg-secondary/20 px-1 py-0.5 rounded',
    accent: 'bg-accent/30 px-1 py-0.5 rounded font-semibold',
  }

  return <mark className={cn(variantMap[variant], 'no-underline', className)}>{children}</mark>
}

/**
 * Feature text - Standout typography
 */
export const FeatureText: React.FC<{
  children: React.ReactNode
  icon?: React.ReactNode
  className?: string
}> = ({ children, icon, className }) => (
  <div className={cn('flex items-start gap-3', className)}>
    {icon && <div className="flex-shrink-0 mt-1">{icon}</div>}
    <span className="font-semibold text-foreground leading-relaxed">
      {children}
    </span>
  </div>
)

/**
 * Letter spacing utilities
 */
export const TightLetterSpacing: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className }) => (
  <span className={cn('tracking-tighter', className)}>{children}</span>
)

export const WideLetterSpacing: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className }) => (
  <span className={cn('tracking-wide', className)}>{children}</span>
)

/**
 * Small caps variant
 */
export const SmallCaps: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className }) => (
  <span
    className={cn('text-sm uppercase', className)}
    style={{ fontVariant: 'small-caps' }}
  >
    {children}
  </span>
)
