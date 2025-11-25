import React from 'react'
import { cn } from '@/lib/utils'

interface GlassmorphismProps {
  className?: string
  children: React.ReactNode
  variant?: 'light' | 'dark' | 'ultra'
  intensity?: 'subtle' | 'medium' | 'strong'
  border?: boolean
}

const variantStyles = {
  light: 'bg-white/30 dark:bg-white/10',
  dark: 'bg-black/20 dark:bg-black/40',
  ultra: 'bg-white/10 dark:bg-white/5 backdrop-blur-xl',
}

const intensityStyles = {
  subtle: 'backdrop-blur-md shadow-sm',
  medium: 'backdrop-blur-lg shadow-md',
  strong: 'backdrop-blur-2xl shadow-xl',
}

const borderStyles = 'border border-white/20 dark:border-white/10'

/**
 * Glassmorphism Container - Premium frosted glass effect
 * Works with backdrop-filter support detection
 */
export const Glassmorphic: React.FC<GlassmorphismProps> = ({
  className,
  children,
  variant = 'light',
  intensity = 'medium',
  border = true,
}) => {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg',
        variantStyles[variant],
        intensityStyles[intensity],
        border && borderStyles,
        'supports-[backdrop-filter]:backdrop-blur-md',
        'supports-[backdrop-filter]:bg-opacity-30',
        className
      )}
      style={{
        backdropFilter: 'blur(10px) saturate(180%)',
        WebkitBackdropFilter: 'blur(10px) saturate(180%)',
      } as React.CSSProperties}
    >
      {/* Subtle inner border for depth */}
      <div className="absolute inset-0 rounded-lg border border-white/10 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

/**
 * Glassmorphic Card with gradient overlay
 */
export const GlassmorphicCard: React.FC<
  GlassmorphismProps & {
    gradientFrom?: string
    gradientTo?: string
  }
> = ({
  className,
  children,
  variant = 'light',
  intensity = 'medium',
  border = true,
  gradientFrom = 'from-blue-500/10',
  gradientTo = 'to-purple-500/10',
}) => {
  return (
    <Glassmorphic variant={variant} intensity={intensity} border={border} className={className}>
      {/* Gradient overlay */}
      <div className={cn('absolute inset-0 bg-gradient-to-br', gradientFrom, gradientTo, 'pointer-events-none')} />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </Glassmorphic>
  )
}

/**
 * Nested glass layers for depth
 */
export const NestedGlassmorphism: React.FC<{
  children: React.ReactNode
  className?: string
  layers?: number
}> = ({ children, className, layers = 2 }) => {
  return (
    <div className={cn('relative', className)}>
      {Array.from({ length: layers }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'absolute inset-0 rounded-lg',
            'border border-white/10 dark:border-white/5',
            `scale-[${1 + (layers - i - 1) * 0.02}]`,
            `opacity-${50 - i * 15}`
          )}
          style={{
            transform: `scale(${1 + (layers - i - 1) * 0.02})`,
            opacity: (50 - i * 15) / 100,
          }}
        />
      ))}

      <div className="relative z-10">{children}</div>
    </div>
  )
}
