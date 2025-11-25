'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import {
  Glassmorphic,
  AdvancedLighting,
  colorGradePresets,
  ColorGradingOverlay,
} from '@/lib/visual-effects'

/**
 * Premium Section Wrapper
 * Applies enterprise-grade visual effects to any section
 */
export const PremiumSection: React.FC<{
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'featured' | 'hero'
  lighting?: boolean
  gradePreset?: keyof typeof colorGradePresets
}> = ({
  children,
  className,
  variant = 'default',
  lighting = true,
  gradePreset = 'elevated',
}) => {
  const variantStyles = {
    default: 'bg-background',
    featured: 'bg-gradient-to-br from-background via-background to-secondary/5',
    hero: 'bg-gradient-to-br from-primary/5 via-background to-secondary/10',
  }

  return (
    <section className={cn('relative overflow-hidden', variantStyles[variant], className)}>
      {/* Background lighting effects */}
      {lighting && <AdvancedLighting />}

      {/* Color grading overlay */}
      <ColorGradingOverlay config={colorGradePresets[gradePreset]}>
        <div className="relative z-10">{children}</div>
      </ColorGradingOverlay>
    </section>
  )
}

/**
 * Premium Card - Glassmorphic with lighting
 */
export const PremiumCard: React.FC<{
  children: React.ReactNode
  className?: string
  hoverable?: boolean
}> = ({ children, className, hoverable = true }) => (
  <Glassmorphic
    variant="light"
    intensity="medium"
    border
    className={cn(
      hoverable && 'hover:shadow-2xl hover:scale-105 transition-all duration-300',
      className
    )}
  >
    {children}
  </Glassmorphic>
)

/**
 * Premium Hero Container
 * Maximum visual impact for landing pages and hero sections
 */
export const PremiumHero: React.FC<{
  children: React.ReactNode
  className?: string
  backgroundVariant?: 'gradient' | 'pattern' | 'animated'
}> = ({ children, className, backgroundVariant = 'gradient' }) => {
  const bgVariants = {
    gradient: 'bg-gradient-to-br from-primary/10 via-background to-secondary/10',
    pattern: 'bg-[linear-gradient(45deg,transparent_25%,rgba(59,130,246,0.05)_25%,rgba(59,130,246,0.05)_50%,transparent_50%,transparent_75%,rgba(59,130,246,0.05)_75%,rgba(59,130,246,0.05))] bg-[length:40px_40px]',
    animated: 'bg-gradient-to-r from-primary/10 via-secondary/5 to-primary/10 bg-[length:200%_100%] animate-shimmer',
  }

  return (
    <div
      className={cn(
        'relative min-h-screen flex items-center justify-center overflow-hidden',
        bgVariants[backgroundVariant],
        className
      )}
    >
      <AdvancedLighting />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {children}
      </div>
    </div>
  )
}

/**
 * Premium Feature Grid
 * Magazine-quality layout with visual hierarchy
 */
export const PremiumFeatureGrid: React.FC<{
  items: Array<{
    icon?: React.ReactNode
    title: string
    description: string
  }>
  columns?: 1 | 2 | 3
  className?: string
}> = ({ items, columns = 3, className }) => {
  return (
    <div
      className={cn(
        'grid gap-6',
        {
          'grid-cols-1': columns === 1,
          'grid-cols-1 md:grid-cols-2': columns === 2,
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-3': columns === 3,
        },
        className
      )}
    >
      {items.map((item, idx) => (
        <PremiumCard key={idx} className="p-6">
          {item.icon && (
            <div className="mb-4 text-primary">
              {item.icon}
            </div>
          )}
          <h3 className="text-lg font-semibold mb-2 text-foreground">
            {item.title}
          </h3>
          <p className="text-sm text-foreground/70 leading-relaxed">
            {item.description}
          </p>
        </PremiumCard>
      ))}
    </div>
  )
}

/**
 * Premium Call-to-Action
 * Button with sophisticated visual effects
 */
export const PremiumCTA: React.FC<{
  children: React.ReactNode
  onClick?: () => void
  className?: string
  variant?: 'primary' | 'secondary'
}> = ({ children, onClick, className, variant = 'primary' }) => {
  const variantStyles = {
    primary: 'bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/50 text-primary-foreground',
    secondary: 'bg-secondary/20 border border-secondary hover:bg-secondary/30 text-foreground',
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'px-8 py-3 rounded-lg font-semibold',
        'transition-all duration-300',
        'hover:scale-105 active:scale-95',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </button>
  )
}
