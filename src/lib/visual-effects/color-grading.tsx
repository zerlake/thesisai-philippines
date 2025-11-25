import React from 'react'
import { cn } from '@/lib/utils'

interface ColorGradingConfig {
  contrast?: number
  brightness?: number
  saturation?: number
  hueRotate?: number
  sepia?: number
  blur?: number
  opacity?: number
}

/**
 * Generate CSS filter string from config
 */
export const generateFilterString = (config: ColorGradingConfig): string => {
  const filters = []

  if (config.contrast !== undefined) filters.push(`contrast(${config.contrast}%)`)
  if (config.brightness !== undefined) filters.push(`brightness(${config.brightness}%)`)
  if (config.saturation !== undefined) filters.push(`saturate(${config.saturation}%)`)
  if (config.hueRotate !== undefined) filters.push(`hue-rotate(${config.hueRotate}deg)`)
  if (config.sepia !== undefined) filters.push(`sepia(${config.sepia}%)`)
  if (config.blur !== undefined) filters.push(`blur(${config.blur}px)`)

  return filters.join(' ')
}

/**
 * Elevated color grading overlay
 */
export const ColorGradingOverlay: React.FC<{
  config: ColorGradingConfig
  children: React.ReactNode
  className?: string
}> = ({ config, children, className }) => {
  return (
    <div
      className={cn('relative', className)}
      style={{
        filter: generateFilterString(config),
        opacity: config.opacity !== undefined ? config.opacity / 100 : 1,
      }}
    >
      {children}
    </div>
  )
}

/**
 * Preset color grades for consistency
 */
export const colorGradePresets = {
  // Professional/Cinematic
  cinematic: {
    contrast: 120,
    brightness: 100,
    saturation: 110,
    hueRotate: 0,
  } as ColorGradingConfig,

  // Modern/Elevated
  elevated: {
    contrast: 110,
    brightness: 105,
    saturation: 130,
    hueRotate: 2,
  } as ColorGradingConfig,

  // Warm/Inviting
  warm: {
    contrast: 105,
    brightness: 110,
    saturation: 115,
    hueRotate: 5,
  } as ColorGradingConfig,

  // Cool/Professional
  cool: {
    contrast: 115,
    brightness: 105,
    saturation: 120,
    hueRotate: -5,
  } as ColorGradingConfig,

  // Dreamlike/Soft
  dreamlike: {
    contrast: 95,
    brightness: 110,
    saturation: 110,
    blur: 1,
  } as ColorGradingConfig,

  // High contrast/Bold
  bold: {
    contrast: 130,
    brightness: 100,
    saturation: 140,
    hueRotate: 0,
  } as ColorGradingConfig,

  // Vintage
  vintage: {
    contrast: 100,
    brightness: 105,
    saturation: 80,
    sepia: 20,
  } as ColorGradingConfig,
} as const

/**
 * Blend mode utilities
 */
export const BlendedContent: React.FC<{
  blendMode: 'multiply' | 'screen' | 'overlay' | 'color-dodge' | 'color-burn' | 'lighten' | 'darken'
  children: React.ReactNode
  className?: string
}> = ({ blendMode, children, className }) => {
  const blendModeMap = {
    'multiply': 'mix-blend-multiply',
    'screen': 'mix-blend-screen',
    'overlay': 'mix-blend-overlay',
    'color-dodge': 'mix-blend-color-dodge',
    'color-burn': 'mix-blend-color-burn',
    'lighten': 'mix-blend-lighten',
    'darken': 'mix-blend-darken',
  }

  return (
    <div className={cn(blendModeMap[blendMode], className)}>
      {children}
    </div>
  )
}

/**
 * Advanced texture creation with gradients and patterns
 */
export const TexturedBackground: React.FC<{
  pattern?: 'grain' | 'noise' | 'fabric' | 'metal'
  opacity?: number
  children?: React.ReactNode
  className?: string
}> = ({ pattern = 'grain', opacity = 0.05, children, className }) => {
  const patterns = {
    grain: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
    noise: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.5' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)'/%3E%3C/svg%3E")`,
    fabric: `linear-gradient(45deg, rgba(0,0,0,0.03) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.03) 75%, rgba(0,0,0,0.03)), linear-gradient(45deg, rgba(0,0,0,0.03) 25%, transparent 25%, transparent 75%, rgba(0,0,0,0.03) 75%, rgba(0,0,0,0.03))`,
    metal: `repeating-linear-gradient(90deg, rgba(255,255,255,0.03), rgba(255,255,255,0.03) 1px, transparent 1px, transparent 2px)`,
  }

  return (
    <div
      className={cn('relative', className)}
      style={{
        backgroundImage: patterns[pattern] as string,
        backgroundSize: pattern === 'grain' ? '200px 200px' : 'auto',
        opacity: opacity,
      }}
    >
      {children}
    </div>
  )
}

/**
 * CSS mask support for sophisticated shapes
 */
export const MaskedContent: React.FC<{
  maskShape?: 'radial' | 'linear' | 'custom'
  children: React.ReactNode
  className?: string
}> = ({ maskShape = 'radial', children, className }) => {
  const maskPatterns = {
    radial: 'radial-gradient(circle, black 0%, transparent 100%)',
    linear: 'linear-gradient(to right, black 0%, transparent 100%)',
    custom: 'linear-gradient(135deg, black 0%, black 50%, transparent 100%)',
  }

  return (
    <div
      className={cn('relative', className)}
      style={{
        WebkitMaskImage: maskPatterns[maskShape],
        maskImage: maskPatterns[maskShape],
      } as React.CSSProperties}
    >
      {children}
    </div>
  )
}
