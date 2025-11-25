'use client'

import React from 'react'
import {
  Headline,
  BodyText,
  StarIcon,
  CheckIcon,
  Glassmorphic,
  LightingOrb,
} from '@/lib/visual-effects'
import { PremiumSection, PremiumFeatureGrid } from './premium-wrapper'

/**
 * Premium Features Showcase Section
 * Magazine-quality layout with sophisticated visual hierarchy
 */
export const PremiumFeaturesShowcase: React.FC = () => {
  const features = [
    {
      icon: <StarIcon size={28} className="text-primary" />,
      title: 'Particle Systems',
      description:
        'Subtle ambient animations that reinforce brand personality without distraction. Fully configurable density and appearance.',
    },
    {
      icon: <CheckIcon size={28} className="text-success" />,
      title: 'Glassmorphism',
      description:
        'Sophisticated frosted glass effects with proper backdrop-filter support and graceful fallbacks for all modern browsers.',
    },
    {
      icon: <StarIcon size={28} className="text-accent" />,
      title: 'Advanced Lighting',
      description:
        'Realistic shadow casting and depth perception through dynamic multi-light systems that guide user attention.',
    },
    {
      icon: <CheckIcon size={28} className="text-primary" />,
      title: 'Color Grading',
      description:
        'Professional color manipulation with CSS filters, blend modes, and preset cinematographic effects.',
    },
    {
      icon: <StarIcon size={28} className="text-secondary" />,
      title: 'SVG Icons',
      description:
        'Semantic, animated icon system with interactive states. Pixel-perfect at any resolution.',
    },
    {
      icon: <CheckIcon size={28} className="text-info" />,
      title: 'Typography System',
      description:
        'Magazine-quality layouts with perfect baseline grid, advanced visual hierarchy, and professional spacing.',
    },
  ]

  return (
    <PremiumSection variant="featured" lighting gradePreset="elevated" className="py-20">
      {/* Section header */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <Headline className="mb-4">Premium Visual System</Headline>
        <BodyText className="text-lg text-foreground/70">
          Six pillars of enterprise-grade design excellence, working in harmony to create
          world-class user experiences.
        </BodyText>
      </div>

      {/* Features grid */}
      <div className="max-w-6xl mx-auto">
        <PremiumFeatureGrid items={features} columns={3} />
      </div>

      {/* Integration example card */}
      <div className="max-w-4xl mx-auto mt-16">
        <Glassmorphic intensity="medium" className="p-8 relative overflow-hidden">
          {/* Subtle lighting in card */}
          <LightingOrb
            config={{
              intensity: 'subtle',
              direction: 'top-right',
              color: 'rgba(59, 130, 246, 0.3)',
            }}
          />

          <div className="relative z-10">
            <h3 className="text-xl font-semibold mb-4 text-foreground">
              All systems work together seamlessly
            </h3>
            <p className="text-foreground/70 leading-relaxed mb-4">
              These visual components aren't isolated—they're designed to work in concert
              across your entire application. From landing pages to dashboards to editor
              interfaces, apply consistent premium aesthetics with simple component wrappers.
            </p>
            <p className="text-sm text-foreground/60">
              Performance-optimized, browser-compatible, and built on modern standards.
            </p>
          </div>
        </Glassmorphic>
      </div>
    </PremiumSection>
  )
}
