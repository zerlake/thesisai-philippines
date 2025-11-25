'use client'

import React from 'react'
import {
  Headline,
  BodyText,
  Glassmorphic,
  ShadowSystem,
  AdvancedLighting,
} from '@/lib/visual-effects'

/**
 * Premium Dashboard Card Component
 * Enterprise-grade card for dashboards and overview screens
 */
export const PremiumDashboardCard: React.FC<{
  title: string
  value?: string | number
  description?: string
  trend?: { value: number; direction: 'up' | 'down' }
  icon?: React.ReactNode
  children?: React.ReactNode
}> = ({ title, value, description, trend, icon, children }) => {
  return (
    <ShadowSystem depth={2} className="h-full">
      <Glassmorphic
        intensity="medium"
        variant="light"
        border
        className="h-full relative overflow-hidden p-6"
      >
        {/* Subtle lighting */}
        <AdvancedLighting />

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            {icon && (
              <div className="p-3 bg-primary/10 rounded-lg">
                {icon}
              </div>
            )}
            {trend && (
              <div
                className={`text-sm font-semibold ${
                  trend.direction === 'up' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.direction === 'up' ? '+' : '-'}{trend.value}%
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="text-sm font-medium text-foreground/70 mb-2">
            {title}
          </h3>

          {/* Value */}
          {value !== undefined && (
            <Headline className="text-3xl font-bold mb-2">
              {value}
            </Headline>
          )}

          {/* Description */}
          {description && (
            <BodyText className="text-sm text-foreground/60 mb-4">
              {description}
            </BodyText>
          )}

          {/* Custom content */}
          {children && <div className="mt-4">{children}</div>}
        </div>
      </Glassmorphic>
    </ShadowSystem>
  )
}

/**
 * Dashboard Grid Layout
 */
export const PremiumDashboardGrid: React.FC<{
  cards: Array<React.ComponentProps<typeof PremiumDashboardCard>>
  className?: string
}> = ({ cards, className = '' }) => {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}
    >
      {cards.map((card, idx) => (
        <PremiumDashboardCard key={idx} {...card} />
      ))}
    </div>
  )
}

/**
 * Example usage:
 * 
 * <PremiumDashboardGrid
 *   cards={[
 *     {
 *       title: 'Total Users',
 *       value: '2,543',
 *       trend: { value: 12, direction: 'up' },
 *       icon: <UsersIcon />,
 *     },
 *     {
 *       title: 'Revenue',
 *       value: '$45,231',
 *       trend: { value: 8, direction: 'up' },
 *       icon: <DollarIcon />,
 *     },
 *   ]}
 * />
 */
