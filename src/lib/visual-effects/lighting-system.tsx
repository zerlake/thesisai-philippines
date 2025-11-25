import React from 'react'
import { cn } from '@/lib/utils'

interface LightingConfig {
  intensity: 'subtle' | 'medium' | 'strong'
  direction: 'top-left' | 'top' | 'top-right' | 'left' | 'center' | 'right' | 'bottom-left' | 'bottom' | 'bottom-right'
  color?: string
  blur?: number
}

const directionMap = {
  'top-left': '-top-1/4 -left-1/4',
  'top': '-top-1/3 left-1/2 -translate-x-1/2',
  'top-right': '-top-1/4 -right-1/4',
  'left': 'top-1/2 -left-1/4 -translate-y-1/2',
  'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
  'right': 'top-1/2 -right-1/4 -translate-y-1/2',
  'bottom-left': '-bottom-1/4 -left-1/4',
  'bottom': '-bottom-1/3 left-1/2 -translate-x-1/2',
  'bottom-right': '-bottom-1/4 -right-1/4',
}

const intensityMap = {
  subtle: {
    size: 'w-96 h-96',
    opacity: 'opacity-20',
    blur: 'blur-3xl',
  },
  medium: {
    size: 'w-full h-full',
    opacity: 'opacity-30',
    blur: 'blur-2xl',
  },
  strong: {
    size: 'w-full h-full',
    opacity: 'opacity-40',
    blur: 'blur-3xl',
  },
}

/**
 * Dynamic lighting orb - creates depth and focus
 */
export const LightingOrb: React.FC<{
  config: LightingConfig
  className?: string
}> = ({ config, className }) => {
  const intensityConfig = intensityMap[config.intensity]

  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      <div
        className={cn(
          'absolute rounded-full mix-blend-screen',
          intensityConfig.size,
          intensityConfig.opacity,
          intensityConfig.blur,
          directionMap[config.direction]
        )}
        style={{
          background: `radial-gradient(circle, ${config.color || 'rgba(59, 130, 246, 0.4)'}, transparent)`,
        }}
      />
    </div>
  )
}

/**
 * Multi-light setup for sophisticated depth
 */
export const AdvancedLighting: React.FC<{
  primaryColor?: string
  secondaryColor?: string
  className?: string
}> = ({
  primaryColor = 'rgba(59, 130, 246, 0.5)',
  secondaryColor = 'rgba(168, 85, 247, 0.3)',
  className,
}) => {
  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      {/* Primary light source */}
      <div
        className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full mix-blend-screen blur-3xl opacity-30"
        style={{
          background: `radial-gradient(circle, ${primaryColor}, transparent)`,
        }}
      />

      {/* Secondary light source */}
      <div
        className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full mix-blend-screen blur-3xl opacity-20"
        style={{
          background: `radial-gradient(circle, ${secondaryColor}, transparent)`,
        }}
      />

      {/* Accent light */}
      <div
        className="absolute top-1/3 right-0 w-96 h-96 rounded-full mix-blend-overlay blur-2xl opacity-15"
        style={{
          background: `radial-gradient(circle, rgba(255, 255, 255, 0.3), transparent)`,
        }}
      />
    </div>
  )
}

/**
 * Realistic shadow casting with depth
 */
export const ShadowSystem: React.FC<{
  depth?: number
  direction?: 'x' | 'y' | 'both'
  className?: string
  children: React.ReactNode
}> = ({ depth = 1, direction = 'both', className, children }) => {
  const depthMap = {
    1: 'drop-shadow-sm',
    2: 'drop-shadow-md',
    3: 'drop-shadow-lg',
    4: 'drop-shadow-2xl',
  }

  return (
    <div
      className={cn(depthMap[Math.min(4, Math.max(1, depth)) as keyof typeof depthMap], className)}
      style={{
        filter:
          direction === 'x'
            ? `drop-shadow(${depth * 2}px 0 ${depth * 3}px rgba(0, 0, 0, 0.15))`
            : direction === 'y'
              ? `drop-shadow(0 ${depth * 2}px ${depth * 3}px rgba(0, 0, 0, 0.15))`
              : `drop-shadow(${depth}px ${depth}px ${depth * 3}px rgba(0, 0, 0, 0.15))`,
      }}
    >
      {children}
    </div>
  )
}

/**
 * Context-aware depth perception
 */
export const DepthLayer: React.FC<{
  level: 0 | 1 | 2 | 3 | 4
  children: React.ReactNode
  className?: string
}> = ({ level, children, className }) => {
  const depthStyles = {
    0: { zIndex: 0, transform: 'translateZ(0)' },
    1: { zIndex: 10, transform: 'translateZ(20px)' },
    2: { zIndex: 20, transform: 'translateZ(40px)' },
    3: { zIndex: 30, transform: 'translateZ(60px)' },
    4: { zIndex: 40, transform: 'translateZ(80px)' },
  }

  return (
    <div
      className={cn('relative', className)}
      style={depthStyles[level] as React.CSSProperties}
    >
      {children}
    </div>
  )
}
