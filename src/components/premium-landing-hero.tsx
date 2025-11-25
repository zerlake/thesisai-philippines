'use client'

import React from 'react'
import {
  DisplayHeading,
  Headline,
  SparklesIcon,
  AdvancedLighting,
  AmbientParticles,
} from '@/lib/visual-effects'
import { PremiumCTA, PremiumHero } from './premium-wrapper'

/**
 * Premium Landing Hero Section
 * Demonstrates world-class visual design
 */
export const PremiumLandingHero: React.FC = () => {
  return (
    <PremiumHero backgroundVariant="animated" className="py-24 sm:py-32">
      {/* Advanced lighting for depth */}
      <AdvancedLighting
        primaryColor="rgba(59, 130, 246, 0.5)"
        secondaryColor="rgba(168, 85, 247, 0.3)"
      />

      {/* Subtle ambient particles */}
      <div className="absolute inset-0 pointer-events-none">
        <AmbientParticles variant="accent" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-3xl mx-auto">
        {/* Icon accent */}
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-primary/10 rounded-lg">
            <SparklesIcon size={32} className="text-primary animate-pulse" />
          </div>
        </div>

        {/* Main headline */}
        <DisplayHeading className="mb-6">
          Enterprise-Grade Visual Excellence
        </DisplayHeading>

        {/* Subheading */}
        <Headline className="text-xl sm:text-2xl font-normal text-foreground/70 mb-8">
          Elevate your application with world-class design sophistication.
          Advanced lighting, glassmorphism, and premium animations
          worthy of Fortune 500 companies.
        </Headline>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <PremiumCTA variant="primary">Get Started Free</PremiumCTA>
          <PremiumCTA variant="secondary">Learn More</PremiumCTA>
        </div>

        {/* Trust indicators */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-sm text-foreground/60 mb-4">Trusted by leading organizations</p>
          <div className="flex justify-center items-center gap-8">
            {['Fortune 500', 'Top Universities', 'Enterprise'].map((text, i) => (
              <div key={i} className="text-xs font-semibold text-foreground/70">
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </PremiumHero>
  )
}
