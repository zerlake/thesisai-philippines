'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface IconProps {
  className?: string
  size?: number
  strokeWidth?: number
  animated?: boolean
  variant?: 'default' | 'filled' | 'outlined'
}

/**
 * Base animated icon wrapper
 */
const AnimatedIconBase: React.FC<{
  children: React.ReactNode
  animated?: boolean
  className?: string
}> = ({ children, animated, className }) => {
  return (
    <svg
      className={cn(
        'inline-block',
        animated && 'animate-pulse',
        className
      )}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {children}
    </svg>
  )
}

// Icon Library with semantic meaning and animations

export const StarIcon: React.FC<IconProps> = ({
  className,
  size = 24,
  strokeWidth = 2,
  animated,
  variant = 'outlined',
}) => (
  <AnimatedIconBase
    animated={animated}
    className={cn(className, `w-${size} h-${size}`)}
  >
    {variant === 'filled' ? (
      <path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        fill="currentColor"
      />
    ) : (
      <path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )}
  </AnimatedIconBase>
)

export const SparklesIcon: React.FC<IconProps> = ({
  className,
  size = 24,
  animated,
}) => (
  <AnimatedIconBase
    animated={animated}
    className={cn(className, `w-${size} h-${size}`)}
  >
    <style>{`
      @keyframes sparkle {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }
      .sparkle-path { animation: sparkle 2s ease-in-out infinite; }
    `}</style>
    <path
      d="M12 2L13.5 8.5L20 10L14.5 14.5L16 21L12 17.5L8 21L9.5 14.5L4 10L10.5 8.5L12 2Z"
      className="sparkle-path"
      fill="currentColor"
    />
    <circle cx="2" cy="2" r="1.5" className="sparkle-path" fill="currentColor" />
    <circle cx="22" cy="6" r="1" className="sparkle-path" fill="currentColor" />
  </AnimatedIconBase>
)

export const CheckIcon: React.FC<IconProps> = ({
  className,
  size = 24,
  strokeWidth = 2,
  variant = 'outlined',
}) => (
  <AnimatedIconBase className={cn(className, `w-${size} h-${size}`)}>
    <path
      d="M5 13L9 17L19 7"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={variant === 'filled' ? 'currentColor' : 'none'}
    />
  </AnimatedIconBase>
)

export const ArrowIcon: React.FC<IconProps & { direction?: 'up' | 'down' | 'left' | 'right' }> = ({
  className,
  size = 24,
  strokeWidth = 2,
  direction = 'right',
  animated,
}) => {
  const rotationMap = {
    up: 'rotate-[-90deg]',
    down: 'rotate-90deg',
    left: 'rotate-180deg',
    right: 'rotate-0deg',
  }

  return (
    <AnimatedIconBase
      animated={animated}
      className={cn(className, `w-${size} h-${size}`, rotationMap[direction])}
    >
      <path
        d="M5 12H19M19 12L12 5M19 12L12 19"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </AnimatedIconBase>
  )
}

export const LoadingIcon: React.FC<IconProps> = ({
  className,
  size = 24,
}) => (
  <AnimatedIconBase className={cn(className, `w-${size} h-${size} animate-spin`)}>
    <style>{`
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .spin-path { animation: spin 1s linear infinite; }
    `}</style>
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeDasharray="15.7 62.8"
      className="spin-path"
    />
  </AnimatedIconBase>
)

export const PlusIcon: React.FC<IconProps> = ({
  className,
  size = 24,
  strokeWidth = 2,
}) => (
  <AnimatedIconBase className={cn(className, `w-${size} h-${size}`)}>
    <path
      d="M12 5V19M5 12H19"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </AnimatedIconBase>
)

export const CloseIcon: React.FC<IconProps> = ({
  className,
  size = 24,
  strokeWidth = 2,
}) => (
  <AnimatedIconBase className={cn(className, `w-${size} h-${size}`)}>
    <path
      d="M18 6L6 18M6 6L18 18"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </AnimatedIconBase>
)

/**
 * Icon Button with hover/active states
 */
export const IconButton: React.FC<{
  icon: React.ReactNode
  onClick?: () => void
  className?: string
  variant?: 'default' | 'subtle' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}> = ({ icon, onClick, className, variant = 'default', size = 'md' }) => {
  const sizeMap = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  }

  const variantMap = {
    default: 'bg-primary/10 hover:bg-primary/20 text-primary',
    subtle: 'hover:bg-secondary/10 text-secondary',
    ghost: 'hover:bg-transparent text-foreground hover:opacity-80',
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-lg transition-all duration-200',
        'hover:scale-105 active:scale-95',
        sizeMap[size],
        variantMap[variant],
        className
      )}
      aria-label="Icon button"
    >
      {icon}
    </button>
  )
}

/**
 * Animated status indicator
 */
export const StatusIndicator: React.FC<{
  status: 'success' | 'warning' | 'error' | 'loading'
  size?: 'sm' | 'md' | 'lg'
}> = ({ status, size = 'md' }) => {
  const sizeMap = { sm: 'w-2 h-2', md: 'w-3 h-3', lg: 'w-4 h-4' }
  const colorMap = {
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    loading: 'bg-blue-500',
  }

  return (
    <div className="relative inline-block">
      <div
        className={cn(
          'rounded-full',
          sizeMap[size],
          colorMap[status],
          status === 'loading' && 'animate-pulse'
        )}
      />
      {status === 'loading' && (
        <div
          className={cn(
            'absolute inset-0 rounded-full border-2 border-blue-500',
            'animate-spin',
            sizeMap[size]
          )}
        />
      )}
    </div>
  )
}
