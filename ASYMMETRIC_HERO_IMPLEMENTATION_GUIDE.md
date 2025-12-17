# Asymmetric Hero Section (60/40) - Implementation Guide

## Quick Start

This guide walks you through implementing the 60/40 asymmetric hero section with left-aligned text, rotating image carousel (5-second intervals), and digital brain background visualization.

---

## Step 1: Image Preparation

### Create Carousel Images

You need 3 images for the carousel. Optimize them to WebP format:

```bash
# If using macOS/Linux with ImageMagick
convert input.jpg -quality 80 -define webp:method=6 output.webp

# If using ffmpeg
ffmpeg -i input.jpg -c:v libwebp -quality 80 output.webp
```

### Image Specifications

```
Resolution:     1280x720px (16:9 aspect ratio)
Format:         WebP (primary), JPEG (fallback)
File Size:      150-200KB each (after optimization)
Color Space:    sRGB
Naming:         hero-carousel-research.webp
                hero-carousel-ai.webp
                hero-carousel-thesis.webp
Location:       public/ directory
```

### Place Images in Public Folder

```
project-root/
└── public/
    ├── hero-carousel-research.webp
    ├── hero-carousel-ai.webp
    └── hero-carousel-thesis.webp
```

---

## Step 2: Create Component Files

### 1. Create Hero Carousel Component

**File**: `src/components/landing/hero-carousel.tsx`

```tsx
"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const CAROUSEL_IMAGES = [
  {
    src: '/hero-carousel-research.webp',
    alt: 'Research papers and academic tools visualization'
  },
  {
    src: '/hero-carousel-ai.webp',
    alt: 'AI-powered analysis and intelligent recommendations'
  },
  {
    src: '/hero-carousel-thesis.webp',
    alt: 'Completed thesis and academic success achievement'
  }
];

const CAROUSEL_INTERVAL = 5000; // 5 seconds

export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Hydration fix
  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    if (!mounted) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % CAROUSEL_IMAGES.length);
    }, CAROUSEL_INTERVAL);

    return () => clearInterval(interval);
  }, [mounted]);

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  if (!mounted) {
    return (
      <div className="relative w-full h-full rounded-lg overflow-hidden bg-slate-800 animate-pulse" />
    );
  }

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      {/* Image Container */}
      <div className="relative w-full h-full">
        {CAROUSEL_IMAGES.map((img, idx) => (
          <Image
            key={idx}
            src={img.src}
            alt={img.alt}
            fill
            priority={idx === 0}
            quality={85}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw"
            className={`object-cover transition-opacity duration-500 ease-in-out ${
              idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            onError={(e) => {
              console.error(`Failed to load image: ${img.src}`);
            }}
          />
        ))}
      </div>

      {/* Gradient Overlay (optional, for text contrast if needed) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-transparent to-black/20 pointer-events-none z-5" />

      {/* Dot Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {CAROUSEL_IMAGES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToImage(idx)}
            aria-label={`Go to image ${idx + 1} of ${CAROUSEL_IMAGES.length}`}
            className={`transition-all duration-300 rounded-full cursor-pointer hover:opacity-100 ${
              idx === currentIndex
                ? 'w-3 h-2 bg-accent-cyan opacity-100'
                : 'w-2 h-2 bg-white/30 opacity-50'
            }`}
            aria-current={idx === currentIndex ? 'true' : 'false'}
          />
        ))}
      </div>

      {/* Image counter (optional) */}
      <div className="absolute top-4 right-4 text-white/70 text-sm font-medium z-20">
        {currentIndex + 1} / {CAROUSEL_IMAGES.length}
      </div>
    </div>
  );
}
```

### 2. Create Brain Visualization Component

**File**: `src/components/landing/hero-brain-visualization.tsx`

```tsx
"use client";

import React from 'react';

const PARTICLE_POSITIONS = [
  { top: '10%', left: '15%', size: '6px', delay: '0s' },
  { top: '20%', left: '85%', size: '4px', delay: '0.5s' },
  { top: '35%', left: '30%', size: '7px', delay: '1s' },
  { top: '50%', left: '70%', size: '5px', delay: '1.5s' },
  { top: '65%', left: '20%', size: '4px', delay: '0.8s' },
  { top: '80%', left: '80%', size: '6px', delay: '1.2s' },
  { top: '75%', left: '45%', size: '5px', delay: '0.3s' },
  { top: '40%', left: '55%', size: '8px', delay: '1.8s' },
  { top: '25%', left: '40%', size: '4px', delay: '0.7s' },
  { top: '15%', left: '65%', size: '6px', delay: '0.2s' },
  { top: '55%', left: '10%', size: '5px', delay: '1.4s' },
  { top: '90%', left: '50%', size: '7px', delay: '0.9s' },
];

export function HeroBrainVisualization() {
  return (
    <div className="absolute inset-0 flex items-center justify-end pr-10" aria-hidden="true">
      <div className="relative w-48 md:w-64 lg:w-72 h-48 md:h-64 lg:h-72">
        {/* Outer glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-3xl motion-safe:animate-pulse-slow" />

        {/* Main brain shape */}
        <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 backdrop-blur-sm border border-blue-500/20" />

        {/* Neural network lines */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-px h-8 bg-gradient-to-t from-blue-400/50 to-transparent motion-safe:animate-pulse"
              style={{
                top: '10%',
                left: `${(i + 1) * 12}%`,
                transform: `rotate(${i * 45}deg) translateY(-20px)`,
                transformOrigin: 'bottom center',
              }}
            />
          ))}
        </div>

        {/* Floating particles */}
        {PARTICLE_POSITIONS.map((pos, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-blue-400/30 motion-safe:animate-float"
            style={{
              width: pos.size,
              height: pos.size,
              top: pos.top,
              left: pos.left,
              animationDelay: pos.delay,
            }}
          />
        ))}
      </div>
    </div>
  );
}
```

### 3. Create Hero Stats Component

**File**: `src/components/landing/hero-stats.tsx`

```tsx
import React from 'react';
import { Users, TrendingUp, Sparkles } from 'lucide-react';

const STATS = [
  { value: '10K+', label: 'Students', icon: Users },
  { value: '98%', label: 'Approval Rate', icon: TrendingUp },
  { value: '24/7', label: 'Support', icon: Sparkles }
];

export function HeroStats() {
  return (
    <div className="grid grid-cols-3 gap-4 md:gap-8 mb-10 max-w-2xl opacity-0 animate-[fade-in_0.5s_ease-out_0.5s_forwards]">
      {STATS.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 hover:shadow-xl hover:shadow-purple-500/10 transition-all opacity-0 animate-[fade-in_0.5s_ease-out_0.6s_forwards]"
            style={{ animationDelay: `${500 + idx * 100}ms` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-electric-purple to-accent-cyan mb-1">
              {stat.value}
            </p>
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              {stat.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
```

### 4. Create Main Asymmetric Hero Component

**File**: `src/components/landing/asymmetric-hero-section.tsx`

```tsx
"use client";

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { ArrowRightIcon, Sparkles } from 'lucide-react';
import { useReducedMotion } from '@/hooks/use-reduced-motion';
import { HeroCarousel } from './hero-carousel';
import { HeroBrainVisualization } from './hero-brain-visualization';
import { HeroStats } from './hero-stats';

export function AsymmetricHeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);

  // Haptic feedback helper
  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen overflow-hidden"
      aria-labelledby="hero-title"
    >
      {/* Background Layer */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/60 to-slate-900 z-0" />

      {/* Animated Background Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-accent-electric-purple/10 rounded-full blur-3xl animate-pulse-slow z-0" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-accent-cyan/10 rounded-full blur-3xl animate-pulse-slower z-0" />

      {/* Brain Visualization */}
      <HeroBrainVisualization />

      {/* Content Container */}
      <div className="relative z-10 container flex flex-col md:flex-row items-center justify-between gap-8 py-16 md:py-24 lg:py-32">
        
        {/* Left Content (60% on desktop) */}
        <div className="w-full md:w-3/5 lg:w-3/5 flex flex-col">
          
          {/* Badge */}
          <div className="mb-6 inline-flex opacity-0 animate-[fade-in_0.5s_ease-out_0.2s_forwards] w-fit">
            <div className="px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-semibold text-blue-300">AI-Powered Academic Excellence</span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 
            id="hero-title"
            className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6 opacity-0 animate-[fade-in_0.5s_ease-out_0.3s_forwards] leading-tight"
          >
            Your Thesis,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-electric-purple via-accent-cyan to-pink-500">
              Perfected
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl lg:text-2xl text-slate-300 mb-8 max-w-2xl leading-relaxed opacity-0 animate-[fade-in_0.5s_ease-out_0.4s_forwards]">
            From research conceptualization to final defense, ThesisAI provides enterprise-grade tools to streamline every stage of your academic journey.
          </p>

          {/* Trust Stats */}
          <HeroStats />

          {/* CTA Buttons */}
          <div className="flex flex-col md:flex-row gap-4 mb-8 opacity-0 animate-[fade-in_0.5s_ease-out_0.8s_forwards]">
            <div
              onMouseEnter={triggerHaptic}
              className="motion-safe:transition-transform motion-safe:hover:scale-105 motion-safe:hover:-translate-y-0.5"
            >
              <Button
                size="lg"
                asChild
                className="bg-gradient-to-r from-accent-electric-purple to-accent-cyan text-white hover:shadow-2xl hover:shadow-purple-500/50 transition-all h-12 px-8 text-base font-semibold w-full md:w-auto"
              >
                <Link href="/register" className="flex items-center gap-2">
                  Get Started Free <ArrowRightIcon className="w-5 h-5" />
                </Link>
              </Button>
            </div>
            <div
              onMouseEnter={triggerHaptic}
              className="motion-safe:transition-transform motion-safe:hover:scale-105 motion-safe:hover:-translate-y-0.5"
            >
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border border-slate-600 text-white hover:bg-slate-800 h-12 px-8 text-base font-semibold w-full md:w-auto"
              >
                <Link href="#features">Explore Features</Link>
              </Button>
            </div>
          </div>

          {/* Trust Statement */}
          <p className="text-sm text-slate-400 opacity-0 animate-[fade-in_0.5s_ease-out_1s_forwards]">
            <strong className="text-slate-300">🚀 Ready to elevate your thesis?</strong> Join thousands of Filipino students and researchers using ThesisAI.
          </p>
        </div>

        {/* Right Carousel (40% on desktop) */}
        <div className="w-full md:w-2/5 lg:w-2/5 h-64 md:h-80 lg:h-96 opacity-0 animate-[fade-in_0.5s_ease-out_0.6s_forwards]">
          <HeroCarousel />
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 animate-[fade-in_0.5s_ease-out_1.2s_forwards] z-10">
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm text-slate-400">Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-slate-500 rounded-full flex items-center justify-center">
            <div className="w-1 h-3 bg-slate-400 rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
}
```

---

## Step 3: Update Tailwind Configuration

### Add Custom Animations

**File**: `tailwind.config.ts`

Add these animation keyframes to your tailwind config if not already present:

```ts
module.exports = {
  theme: {
    extend: {
      animation: {
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'pulse-slower': 'pulse 6s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        float: {
          '0%, 100%': { 
            transform: 'translate(0, 0px)',
            opacity: '0.5'
          },
          '50%': { 
            transform: 'translate(10px, -10px)',
            opacity: '1'
          },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(16px)'
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
      },
    },
  },
}
```

---

## Step 4: Update Color Variables

### Add Accent Colors

**File**: `tailwind.config.ts`

Ensure these colors are defined:

```ts
colors: {
  'accent': {
    'electric-purple': '#a366ff',  // Adjust to your brand
    'cyan': '#00d9ff',              // Adjust to your brand
  },
  // ... other colors
}
```

Or add to your CSS variables:

**File**: `src/app/globals.css`

```css
:root {
  --accent-electric-purple: #a366ff;
  --accent-cyan: #00d9ff;
}

@layer components {
  .accent-electric-purple {
    @apply text-[var(--accent-electric-purple)];
  }
  
  .accent-cyan {
    @apply text-[var(--accent-cyan)];
  }
}
```

---

## Step 5: Integrate Into Landing Page

### Update Landing Page Layout

**File**: `src/app/page.tsx` or `src/app/(landing)/page.tsx`

```tsx
import { AsymmetricHeroSection } from '@/components/landing/asymmetric-hero-section';
import { FeaturesSection } from '@/components/landing/features-section';
// ... other imports

export default function LandingPage() {
  return (
    <main>
      {/* Replace old hero with new asymmetric hero */}
      <AsymmetricHeroSection />
      
      {/* Other sections remain the same */}
      <FeaturesSection />
      {/* ... more sections */}
    </main>
  );
}
```

---

## Step 6: Test Implementation

### Testing Checklist

```
Mobile (< 768px):
  ☐ Content stacks vertically
  ☐ Carousel is full width
  ☐ Text is readable (font scaling)
  ☐ Buttons are full width
  ☐ Stats grid is 3 columns
  ☐ Brain visualization is visible

Tablet (768px - 1024px):
  ☐ 50/50 split layout
  ☐ Carousel visible
  ☐ Proper spacing
  ☐ No overflow

Desktop (> 1024px):
  ☐ 60/40 asymmetric layout
  ☐ Left content properly aligned
  ☐ Right carousel properly positioned
  ☐ Brain visualization visible

Carousel Functionality:
  ☐ Images rotate every 5 seconds
  ☐ Manual dot navigation works
  ☐ Smooth transitions
  ☐ Correct image display
  ☐ Indicator dots update correctly

Animations:
  ☐ Staggered load sequence
  ☐ Smooth fade-in transitions
  ☐ Brain particles animate
  ☐ Background orbs pulse
  ☐ No janky animations

Accessibility:
  ☐ Keyboard navigation (Tab, Enter)
  ☐ Focus indicators visible
  ☐ ARIA labels correct
  ☐ Color contrast sufficient (4.5:1)
  ☐ prefers-reduced-motion respected
  ☐ Alt text on images

Performance:
  ☐ Lighthouse score > 90
  ☐ No CLS issues
  ☐ Images load quickly
  ☐ Smooth scrolling
  ☐ No console errors
```

### Manual Testing Commands

```bash
# Start dev server
pnpm dev

# Run tests
pnpm test -- asymmetric-hero

# Check performance
pnpm build

# Run lighthouse
npm install -g lighthouse
lighthouse http://localhost:3000 --view
```

---

## Step 7: Optimize Images

### Image Conversion Script

**File**: `scripts/optimize-carousel-images.js`

```js
#!/usr/bin/env node

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const images = [
  'public/hero-carousel-research.jpg',
  'public/hero-carousel-ai.jpg',
  'public/hero-carousel-thesis.jpg'
];

async function optimizeImages() {
  for (const imagePath of images) {
    const fullPath = path.join(process.cwd(), imagePath);
    const outputPath = fullPath.replace('.jpg', '.webp');

    try {
      await sharp(fullPath)
        .webp({ quality: 80 })
        .resize(1280, 720, {
          fit: 'cover',
          position: 'center'
        })
        .toFile(outputPath);

      console.log(`✅ Optimized: ${outputPath}`);
    } catch (error) {
      console.error(`❌ Failed to optimize ${imagePath}:`, error);
    }
  }
}

optimizeImages();
```

Run with:
```bash
npm install sharp
node scripts/optimize-carousel-images.js
```

---

## Step 8: Performance Optimization

### Lazy Load Non-Critical Images

Update `hero-carousel.tsx`:

```tsx
<Image
  key={idx}
  src={img.src}
  alt={img.alt}
  fill
  priority={idx === 0}  // Only first image is high priority
  loading={idx === 0 ? 'eager' : 'lazy'}  // Lazy load others
  // ... rest of props
/>
```

### Add Image Preloading

**File**: `src/components/landing/asymmetric-hero-section.tsx`

```tsx
import Head from 'next/head';

// In component return:
<Head>
  <link rel="preload" as="image" href="/hero-carousel-research.webp" />
  <link rel="preload" as="image" href="/hero-carousel-ai.webp" />
  <link rel="preload" as="image" href="/hero-carousel-thesis.webp" />
</Head>
```

---

## Step 9: Add Analytics Tracking (Optional)

### Track Carousel Interaction

**File**: `src/components/landing/hero-carousel.tsx`

```tsx
import { useEffect } from 'react';

// Inside HeroCarousel component:
useEffect(() => {
  // Track carousel changes
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'carousel_change', {
      event_category: 'hero_section',
      image_index: currentIndex
    });
  }
}, [currentIndex]);

// Track dot clicks
const goToImage = (index: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'carousel_dot_click', {
      event_category: 'hero_section',
      image_index: index
    });
  }
  setCurrentIndex(index);
};
```

---

## Step 10: A/B Testing (Optional)

### Feature Flag Implementation

**File**: `src/lib/features.ts`

```ts
export const FEATURES = {
  ASYMMETRIC_HERO_ENABLED: process.env.NEXT_PUBLIC_ASYMMETRIC_HERO === 'true'
};
```

**File**: `src/app/page.tsx`

```tsx
import { FEATURES } from '@/lib/features';
import { HeroSection } from '@/components/landing/hero-section';
import { AsymmetricHeroSection } from '@/components/landing/asymmetric-hero-section';

export default function LandingPage() {
  return (
    <main>
      {FEATURES.ASYMMETRIC_HERO_ENABLED ? (
        <AsymmetricHeroSection />
      ) : (
        <HeroSection />
      )}
      {/* ... rest of page */}
    </main>
  );
}
```

**.env.local**:
```
NEXT_PUBLIC_ASYMMETRIC_HERO=true
```

---

## Troubleshooting

### Issue: Carousel Not Rotating

**Solution**:
```tsx
// Check interval is running
useEffect(() => {
  console.log('Carousel mounted, starting auto-advance');
  const interval = setInterval(() => {
    console.log('Advancing carousel...');
    setCurrentIndex(prev => (prev + 1) % CAROUSEL_IMAGES.length);
  }, CAROUSEL_INTERVAL);
  return () => clearInterval(interval);
}, []);
```

### Issue: Images Not Loading

**Solution**:
- Verify WebP support: `caniuse.com/webp`
- Add JPEG fallback in Next.js Image component
- Check file paths in `public/` directory
- Verify image dimensions: 1280x720px minimum

### Issue: Mobile Layout Broken

**Solution**:
- Check responsive classes: `md:`, `lg:` prefixes
- Test with DevTools device emulation
- Verify width percentages recalculate correctly
- Check gap and padding values on mobile

### Issue: Animations Choppy/Laggy

**Solution**:
```css
/* Use GPU acceleration */
.hero-carousel {
  transform: translateZ(0);
  will-change: opacity;
}
```

---

## Deployment Checklist

Before deploying to production:

- [ ] All images optimized to WebP
- [ ] Carousel rotates every 5 seconds
- [ ] Responsive design tested on all breakpoints
- [ ] Animations smooth at 60fps
- [ ] Accessibility compliance (WCAG AA)
- [ ] Performance audit (Lighthouse 90+)
- [ ] No console errors or warnings
- [ ] Images properly cached
- [ ] Analytics tracking verified
- [ ] A/B test (if applicable) configured
- [ ] Backup old hero component
- [ ] Deploy with feature flag (optional)

---

## Next Steps

1. **Phase 2**: Add video background variant
2. **Phase 3**: Implement 3D brain with Three.js
3. **Phase 4**: Add user testimonial carousel overlay
4. **Phase 5**: Parallax scroll effects

---

**Status**: Ready to implement
**Support**: Refer to ASYMMETRIC_HERO_60_40_SPECIFICATION.md for detailed specifications
**Last Updated**: December 17, 2025
