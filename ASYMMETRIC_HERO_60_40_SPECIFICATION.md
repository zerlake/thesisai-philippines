# Asymmetric Hero Section (60/40 Layout) - Specification & Implementation Guide

## Overview

This document specifies a premium asymmetric hero section with a 60/40 split layout featuring:
- **Left Side (60%)**: Left-aligned headline, subtitle, and CTAs
- **Right Side (40%)**: Rotating image carousel with digital brain visualization background
- **Background**: Digital brain particle effects and animated gradient overlay
- **Image Rotation**: 3 images rotating automatically every 5 seconds

---

## Design Specifications

### Section Layout

**Container Structure**:
```
Hero Section (min-height: 100vh)
├── Background Layer
│   ├── Digital Brain Visualization
│   ├── Gradient Overlay
│   └── Animated Particle Effects
├── Left Content (60% width)
│   ├── Badge
│   ├── Main Headline
│   ├── Subheading
│   ├── CTA Buttons
│   ├── Trust Stats
│   └── Trust Statement
└── Right Content (40% width)
    ├── Rotating Image Carousel
    │   ├── Image 1
    │   ├── Image 2
    │   └── Image 3
    └── Digital Brain Background
```

### Responsive Breakpoints

```
Mobile (< 768px):     100% width, stacked vertically
                      - Left content: 100%
                      - Images below content
                      - Full width carousel

Tablet (768px - 1024px): 50/50 split
                         - Slightly adjusted proportions
                         - Images above fold
                         - Touch-optimized carousel

Desktop (> 1024px):   60/40 split
                      - Left: 60%
                      - Right: 40%
                      - Full asymmetric layout
                      - Optimal for large screens
```

---

## Left Content (60%) Specifications

### Visual Hierarchy

```
1. Badge (Top)           - "AI-Powered Academic Excellence"
2. Main Headline         - Large, bold, left-aligned
3. Subheading           - Supporting text, left-aligned
4. CTA Buttons          - Two primary actions (stacked on mobile)
5. Trust Stats          - 3-column metrics grid
6. Trust Statement      - Secondary reassurance text
```

### Typography

#### Badge
```
Font Size:     text-sm
Font Weight:   font-semibold
Text Color:    text-blue-300
Background:    bg-blue-500/10
Border:        border border-blue-500/30
Padding:       px-4 py-2
Border Radius: rounded-full
Icon:          Sparkles (w-4 h-4)
```

#### Main Headline
```
Text:          "Your Thesis, Perfected"
               (or custom copy)
Font Size:     clamp(2.5rem, 6vw, 4.5rem)
               Mobile: text-4xl
               Tablet: text-5xl
               Desktop: text-6xl to text-7xl
Font Weight:   font-black (800)
Text Color:    text-white
Line Height:   leading-tight
Letter Spacing: tracking-tight
Alignment:     text-left
Gradient Text: Optional accent word with gradient
```

**Gradient Accent Example**:
```jsx
"Your Thesis, "
<span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-electric-purple via-accent-cyan to-pink-500">
  Perfected
</span>
```

#### Subheading
```
Font Size:     text-lg md:text-xl lg:text-2xl
Font Weight:   font-normal
Text Color:    text-slate-300
Max Width:     max-w-2xl
Line Height:   leading-relaxed
Margin Bottom: mb-8
Alignment:     text-left
```

#### Body Text
```
Font Size:     text-base
Font Weight:   font-normal
Text Color:    text-slate-400
Line Height:   leading-normal
```

### Spacing

```
Section Padding:  px-6 md:px-12 py-20 md:py-32 lg:py-40
Left Content:     pl-6 md:pl-12 lg:pl-16
Element Gaps:     mb-6 (badge to headline)
                  mb-6 (headline to subheading)
                  mb-8 (subheading to buttons)
                  mb-10 (buttons to stats)
                  mt-8 (stats to trust)
```

### CTA Buttons

#### Primary Button (Get Started)
```
Variant:       Gradient
Background:    bg-gradient-to-r from-accent-electric-purple to-accent-cyan
Text Color:    text-white
Font Size:     text-base
Font Weight:   font-semibold
Height:        h-12
Padding:       px-8
Border Radius: rounded-lg
Hover Effect:  hover:shadow-2xl hover:shadow-purple-500/50
Hover Scale:   motion-safe:hover:scale-105 motion-safe:hover:-translate-y-0.5
Icon:          ArrowRightIcon (w-5 h-5)
Icon Gap:      gap-2
Transition:    transition-all duration-300
Haptic:        navigator.vibrate(10) on hover
```

#### Secondary Button (Explore Features)
```
Variant:       Outline
Border:        border border-slate-600
Text Color:    text-white
Background:    transparent / hover:bg-slate-800
Font Size:     text-base
Font Weight:   font-semibold
Height:        h-12
Padding:       px-8
Border Radius: rounded-lg
Hover Effect:  hover:border-slate-500 transition-colors
Transition:    transition-all duration-300
```

#### Button Container
```
Layout:        flex flex-col md:flex-row
Gap:           gap-4
Width:         w-full md:w-auto (primary), w-full md:w-auto (secondary)
Max Width:     max-w-sm (mobile), auto (desktop)
Opacity:       opacity-0 animate-[fade-in_0.5s_ease-out_0.8s_forwards]
```

### Trust Stats

#### Stats Grid
```
Layout:        grid grid-cols-3
Gap:           gap-4 md:gap-8
Max Width:     max-w-2xl
Margin:        mb-10
Opacity Anim:  opacity-0 animate-[fade-in_0.5s_ease-out_0.5s_forwards]
```

#### Individual Stat Card
```
Background:    bg-slate-800/50
Border:        border border-slate-700/50
Padding:       p-4
Border Radius: rounded-lg
Hover:         hover:border-slate-600/50 hover:shadow-xl hover:shadow-purple-500/10
Transition:    transition-all

Value:
  Font Size:   text-2xl
  Font Weight: font-bold
  Color:       text-transparent bg-clip-text 
               bg-gradient-to-r from-accent-electric-purple to-accent-cyan
  Margin:      mb-1

Label:
  Font Size:   text-xs
  Font Weight: font-semibold
  Color:       text-slate-300
  Text Trans:  uppercase
  Letter Sp:   tracking-wider
```

### Trust Statement

```
Text:          "🚀 Ready to elevate your thesis? 
                Join thousands of Filipino students..."
Font Size:     text-sm
Text Color:    text-slate-400
Bold Portion:  strong text-slate-300
Alignment:     text-left
Opacity Anim:  opacity-0 animate-[fade-in_0.5s_ease-out_1s_forwards]
```

---

## Right Content (40%) - Rotating Image Carousel

### Carousel Container

```
Width:         40% (desktop), 100% (mobile), 50% (tablet)
Height:        100% of section (maintain aspect ratio)
Position:      absolute right-0 top-0 (desktop)
               relative full-width (mobile)
Border Radius: rounded-lg (optional, adjust as needed)
Overflow:      overflow-hidden
Background:    Digital brain visualization (see below)
```

### Image Carousel Specifications

#### Image Rotation Mechanics
```
Total Images:           3
Rotation Interval:      5000ms (5 seconds)
Transition Duration:    500ms to 800ms
Transition Type:        Fade + Slide (recommended)
Auto-play:              Enabled by default
Loop:                   Infinite
Pause on Hover:         Optional (motion-safe)
Navigation Controls:    Dots/Indicators below carousel
```

#### Image 1: Research Visualization
```
File:          /public/hero-carousel-research.webp
Alt Text:      "Research papers and academic tools"
Aspect Ratio:  16/9 or 4/3
Optimization:  WebP format, lazy loaded
Size:          1280x720px minimum
Content:       Academic research papers, books, digital interface
```

#### Image 2: AI Integration
```
File:          /public/hero-carousel-ai.webp
Alt Text:      "AI-powered analysis and recommendations"
Aspect Ratio:  16/9 or 4/3
Optimization:  WebP format, lazy loaded
Size:          1280x720px minimum
Content:       AI brain, neural network, digital visualization
```

#### Image 3: Thesis Completion
```
File:          /public/hero-carousel-thesis.webp
Alt Text:      "Completed thesis and academic success"
Aspect Ratio:  16/9 or 4/3
Optimization:  WebP format, lazy loaded
Size:          1280x720px minimum
Content:       Thesis document, celebration, achievement
```

### Carousel Navigation

#### Dot Indicators
```
Position:      Absolute bottom of carousel
Count:         3 dots (one per image)
Active Dot:    bg-accent-cyan opacity-100 w-2 h-2 rounded-full
Inactive Dot:  bg-white/30 opacity-50 w-2 h-2 rounded-full
Gap:           gap-2
Transition:    transition-all duration-300
Hover:         Cursor pointer, highlight on hover
```

#### Auto-advance Timer
```
Default Interval:  5000ms
Reset on Click:    Yes (when user clicks dot)
Visible Feedback:  Optional: progress bar or counting indicator
```

### Image Container

```
Width:         100%
Height:        100% or auto (maintain carousel height)
Position:      relative
Overflow:      hidden
Background:    Dark gradient (fallback while loading)
Display:       flex items-center justify-center
```

### Individual Image Styling

```
Position:      absolute inset-0
Width:         100%
Height:        100%
Object Fit:    cover
Object Pos:    center
Opacity Anim:  opacity-0 (inactive)
               opacity-100 (active)
Transition:    transition-opacity duration-500
Z-Index:       z-0 (inactive)
               z-10 (active)
Loading:       Skeleton / placeholder during load
```

---

## Background Layer

### Digital Brain Visualization

#### Brain Container
```
Position:      absolute inset-0 (full section)
Z-Index:       z-0
Width:         100%
Height:        100%
Pointer Events: pointer-events-none
ARIA:          aria-hidden="true"
```

#### Brain Core
```
Width:         w-48 md:w-64 (desktop: w-72 to w-80)
Height:        h-48 md:h-64 (desktop: h-72 to h-80)
Position:      right-10% top-1/2 -translate-y-1/2 (desktop)
               center (mobile)
Border Radius: rounded-full
```

#### Outer Glow
```
Background:    bg-gradient-to-r from-blue-600/20 to-purple-600/20
Blur:          blur-3xl
Animation:     motion-safe:animate-pulse-slow (4s cycle)
Z-Index:       z-0
```

#### Brain Shape
```
Background:    bg-gradient-to-br from-blue-500/30 to-purple-500/30
Backdrop:      backdrop-blur-sm
Border:        border border-blue-500/20
Border Radius: rounded-full
Z-Index:       z-1
```

#### Neural Network Lines
```
Count:         8 lines
Arrangement:   Radiating at 45° intervals
Height:        h-8
Width:         w-px (1px)
Color:         bg-gradient-to-t from-blue-400/50 to-transparent
Animation:     motion-safe:animate-pulse
Transform:     rotate(${i * 45}deg) translateY(-20px)
Transform Ori: bottom center
Z-Index:       z-2
```

#### Floating Particles
```
Count:         12 particles
Size Range:    4px to 8px
Color:         bg-blue-400/30
Shape:         rounded-full
Animation:     motion-safe:animate-float
Positions:     Scattered throughout brain area
Animation Del: Staggered 0s to 1.8s
Z-Index:       z-3
```

### Gradient Overlay

```
Position:      absolute inset-0
Z-Index:       z-5
Background:    bg-gradient-to-b 
               from-black/50 via-black/60 to-slate-900
Mix Blend:     mix-blend-multiply (optional)
Pointer Events: pointer-events-none
```

### Animated Background Elements

#### Top-Left Orb
```
Position:      absolute top-20 left-10
Width:         w-72
Height:        h-72
Background:    bg-accent-electric-purple/10
Blur:          blur-3xl
Border Radius: rounded-full
Animation:     animate-pulse-slow (4s cycle)
Z-Index:       z-0
```

#### Bottom-Right Orb
```
Position:      absolute bottom-0 right-10
Width:         w-96
Height:        h-96
Background:    bg-accent-cyan/10
Blur:          blur-3xl
Border Radius: rounded-full
Animation:     animate-pulse-slower (6s cycle)
Z-Index:       z-0
```

---

## Animation Specifications

### Load Sequence

```
Timeline (all easing: cubic-bezier(0.4, 0, 0.2, 1))

0ms     - Badge starts fading in
200ms   - Badge opacity 100%
300ms   - Headline fades in
400ms   - Subheading fades in
500ms   - Stats begin staggered fade-in
600ms   - First stat fully visible
700ms   - Buttons fade in
800ms   - All content visible
900ms   - Trust statement fades in
1000ms  - Carousel images start rotation
1200ms  - Scroll indicator appears
```

### Animation Classes

#### Fade In
```
opacity-0 animate-[fade-in_0.5s_ease-out_0.3s_forwards]
```

#### Fade In with Delay
```
opacity-0 animate-[fade-in_0.5s_ease-out_${delay}s_forwards]
```

#### Slide + Fade (Badges/Buttons)
```
opacity-0 translate-y-4 animate-[fade-in-up_0.5s_ease-out_0.3s_forwards]
```

### Continuous Animations

#### Pulse Slow (4 second cycle)
```
@keyframes pulse-slow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
animation: pulse-slow 4s ease-in-out infinite;
```

#### Pulse Slower (6 second cycle)
```
@keyframes pulse-slower {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
animation: pulse-slower 6s ease-in-out infinite;
```

#### Float (Particle drift)
```
@keyframes float {
  0%, 100% { 
    transform: translate(0, 0px);
    opacity: 0.5;
  }
  50% { 
    transform: translate(10px, -10px);
    opacity: 1;
  }
}
animation: float 6s ease-in-out infinite;
animation-delay: ${delay};
```

#### Carousel Auto-advance
```
Every 5000ms (5 seconds):
1. Current image opacity: 100% → 0%
2. Next image opacity: 0% → 100%
3. Transition duration: 500ms
4. Dot indicator updates
5. Repeat infinitely
```

### Hover Effects

#### Button Hover
```
transform: scale(1.05) translateY(-2px)
box-shadow: 0 20px 25px -5px rgba(59, 130, 246, 0.3)
transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1)
```

#### Stat Card Hover
```
border-color: rgba(71, 85, 105, 0.5)
box-shadow: 0 20px 25px -5px rgba(168, 85, 247, 0.1)
transition: all 300ms
```

#### Carousel Dot Hover
```
Scale: 1.2
Opacity: 1
Cursor: pointer
```

---

## Component Implementation

### File Structure

```
src/
├── components/
│   └── landing/
│       ├── asymmetric-hero-section.tsx
│       ├── hero-carousel.tsx
│       ├── brain-visualization.tsx
│       └── hero-stats.tsx
├── lib/
│   └── animations.ts (custom animation utils)
└── public/
    ├── hero-carousel-research.webp
    ├── hero-carousel-ai.webp
    └── hero-carousel-thesis.webp
```

### Main Component Structure

```tsx
export function AsymmetricHeroSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % IMAGES.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background Layer */}
      <BrainVisualization />
      <GradientOverlay />
      <BackgroundOrbs />
      
      {/* Content Container */}
      <div className="relative container flex items-center justify-between">
        {/* Left Content (60%) */}
        <LeftHeroContent />
        
        {/* Right Carousel (40%) */}
        <HeroCarousel 
          currentIndex={currentImageIndex}
          onImageChange={setCurrentImageIndex}
        />
      </div>
      
      {/* Scroll Indicator */}
      <ScrollIndicator />
    </section>
  );
}
```

### Carousel Component Structure

```tsx
interface HeroCarouselProps {
  currentIndex: number;
  onImageChange: (index: number) => void;
}

export function HeroCarousel({ currentIndex, onImageChange }: HeroCarouselProps) {
  const images = [
    { src: '/hero-carousel-research.webp', alt: 'Research' },
    { src: '/hero-carousel-ai.webp', alt: 'AI Integration' },
    { src: '/hero-carousel-thesis.webp', alt: 'Thesis Completion' }
  ];
  
  return (
    <div className="relative w-full md:w-2/5 h-full">
      {/* Images Container */}
      <div className="relative w-full h-full overflow-hidden rounded-lg">
        {images.map((img, idx) => (
          <Image
            key={idx}
            src={img.src}
            alt={img.alt}
            fill
            className={`object-cover transition-opacity duration-500 ${
              idx === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
      </div>
      
      {/* Dot Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => onImageChange(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentIndex 
                ? 'bg-accent-cyan opacity-100 w-3' 
                : 'bg-white/30 opacity-50'
            }`}
            aria-label={`Go to image ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## Responsive Design Details

### Mobile Layout (< 768px)

```
Hero Section Height:    min-h-screen (full viewport)
Content Flow:           Vertical stack
Left Content:           100% width
Images:                 100% width, below text on scroll
Padding:                px-4 py-16
Typography:             Scaled down
Badge:                  Hidden on very small screens
Stats Grid:             2 columns instead of 3
CTA Buttons:            Full width, stacked vertically
Carousel:               Full width carousel
Brain Visual:           Smaller, centered behind content
```

### Tablet Layout (768px - 1024px)

```
Content Flow:           Side by side (50/50)
Left Content:           50% width
Right Carousel:         50% width
Images:                 Same as desktop
Padding:                px-8 py-24
Typography:             Intermediate sizes
Stats Grid:             3 columns
CTA Buttons:            Flex row, responsive width
Brain Visual:           Medium size, positioned right
```

### Desktop Layout (> 1024px)

```
Content Flow:           Asymmetric (60/40)
Left Content:           60% width
Right Carousel:         40% width
Padding:                px-12 lg:px-16 py-32 lg:py-40
Typography:             Full sizes
Stats Grid:             3 columns, larger gaps
CTA Buttons:            Flex row with proper spacing
Brain Visual:           Large, positioned right
```

---

## Performance Considerations

### Image Optimization

```
Format:           WebP (primary), JPEG (fallback)
Dimensions:       1280x720px minimum
Size:             < 200KB per image (compressed)
Lazy Load:        Only load visible + 1 next image
Preload:          First image priority, others lazy
Aspect Ratio:     Maintain 16:9 or 4:3
Responsive Sizes: srcSet for mobile/tablet/desktop
```

### Animation Performance

```
GPU Acceleration:     transform & opacity only
60fps Target:         All animations smooth
Reduced Motion:       Respect prefers-reduced-motion
Layout Shifts:        No CLS issues (fixed dimensions)
Paint Performance:    Minimal repaints
Composite Layers:     Separate carousel layer
```

### Browser Compatibility

```
Chrome:    90+ (CSS Grid, Modern animations)
Firefox:   88+ (Gradient text, Backdrop filter)
Safari:    14+ (WebP, CSS features)
Edge:      90+ (Full feature parity)
Mobile:    iOS 14+, Android 10+
```

---

## Accessibility Requirements

### Semantic HTML

```
<section>           Main hero section
<h1>                Main headline (only once per page)
<p>                 Subheading and descriptions
<button>            CTA buttons
<div role="region"> Carousel region
<figure>            Images with captions
```

### ARIA Labels

```
aria-labelledby="hero-title"       Section label
aria-hidden="true"                 Decorative elements
aria-label="Go to image X"          Carousel dots
role="region"                       Carousel region
aria-live="polite"                  Image change announcements
```

### Keyboard Navigation

```
Tab Order:  Badge → Headline → Subheading → Buttons → Carousel dots → Scroll indicator
Focus:      Visible focus rings (2px, rgba(59, 130, 246))
Enter:      Activate buttons and carousel dots
Arrow Keys: Next/previous carousel image
```

### Color Contrast

```
Headline on Background:     4.5:1 (AA standard)
Body Text on Background:    4.5:1 (AA standard)
Button Text:                7:1 or higher
Focus Indicators:           4.5:1 minimum
Hover States:               Clear visual feedback
```

### Motion Preferences

```
prefers-reduced-motion: reduce
├── Disable all animations
├── Keep transitions subtle (opacity only)
├── Carousel: No auto-advance (user controlled)
└── Particles: Fade to static positions
```

---

## Content Specifications

### Headline Examples

```
Primary: "Your Thesis, Perfected"
With Accent: "Your Thesis, [Perfected]" (gradient on accent)

Alternative Options:
- "Research Made Intelligent"
- "From Research to Published"
- "Your Academic Partner"
- "Thesis Excellence, Simplified"
```

### Subheading Examples

```
"From research conceptualization to final defense, ThesisAI 
provides enterprise-grade tools to streamline every stage of 
your academic journey."

Alternative:
"Empower your academic research with AI-driven insights, 
intelligent writing assistance, and comprehensive research 
organization tools—all in one platform."
```

### Trust Stats Examples

```
Stat 1: Value: "10K+", Label: "Students"
Stat 2: Value: "98%", Label: "Approval Rate"
Stat 3: Value: "24/7", Label: "Support"

Alternative Set:
Stat 1: Value: "50+", Label: "Institutions"
Stat 2: Value: "4.8/5", Label: "Rating"
Stat 3: Value: "15+", Label: "Hours Saved"
```

---

## Integration Checklist

### Pre-Implementation

- [ ] Create 3 carousel images and optimize to WebP
- [ ] Update tailwind.config.ts with animation definitions
- [ ] Create color variables for accent colors
- [ ] Prepare brand messaging and headlines
- [ ] Design digital brain visualization mockup

### Component Development

- [ ] Create `asymmetric-hero-section.tsx`
- [ ] Create `hero-carousel.tsx` with 5-second interval
- [ ] Create `brain-visualization.tsx` with particles
- [ ] Create `hero-stats.tsx` component
- [ ] Add animation utility functions
- [ ] Implement haptic feedback for buttons
- [ ] Test keyboard navigation

### Testing

- [ ] Mobile responsiveness (< 768px)
- [ ] Tablet responsiveness (768px - 1024px)
- [ ] Desktop responsiveness (> 1024px)
- [ ] Carousel auto-advance (5 second intervals)
- [ ] Carousel manual navigation (dots)
- [ ] Animation sequences
- [ ] Accessibility (WCAG AA)
- [ ] Keyboard navigation
- [ ] Touch interactions
- [ ] Performance (Lighthouse scores)
- [ ] Image loading and fallbacks
- [ ] Browser compatibility

### Optimization

- [ ] Image compression and WebP conversion
- [ ] Lazy loading implementation
- [ ] CSS animation optimization
- [ ] Remove unused Tailwind classes
- [ ] Minify and bundle code
- [ ] Set up image CDN delivery

### Deployment

- [ ] Update landing page routing
- [ ] Add feature flag (optional)
- [ ] A/B test vs. centered hero
- [ ] Monitor performance metrics
- [ ] Gather user feedback
- [ ] Iterate based on analytics

---

## Code Examples

### Carousel with 5-Second Auto-Advance

```tsx
import { useState, useEffect } from 'react';
import Image from 'next/image';

const CAROUSEL_IMAGES = [
  { src: '/hero-carousel-research.webp', alt: 'Research' },
  { src: '/hero-carousel-ai.webp', alt: 'AI Integration' },
  { src: '/hero-carousel-thesis.webp', alt: 'Thesis Completion' }
];

const CAROUSEL_INTERVAL = 5000; // 5 seconds

export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % CAROUSEL_IMAGES.length);
    }, CAROUSEL_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      {/* Images */}
      {CAROUSEL_IMAGES.map((img, idx) => (
        <Image
          key={idx}
          src={img.src}
          alt={img.alt}
          fill
          priority={idx === 0}
          sizes="(max-width: 768px) 100vw, 40vw"
          className={`object-cover transition-opacity duration-500 ${
            idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        />
      ))}

      {/* Dot Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {CAROUSEL_IMAGES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToImage(idx)}
            aria-label={`Go to image ${idx + 1} of ${CAROUSEL_IMAGES.length}`}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              idx === currentIndex
                ? 'w-3 h-2 bg-accent-cyan opacity-100'
                : 'w-2 h-2 bg-white/30 opacity-50 hover:opacity-70'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
```

### Brain Visualization with Particles

```tsx
import React from 'react';

export function BrainVisualization() {
  const particlePositions = [
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

  return (
    <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
      <div className="relative w-48 md:w-64 lg:w-72">
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
        {particlePositions.map((pos, i) => (
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

---

## Future Enhancements

### Phase 2 Features

- [ ] Video background instead of image carousel
- [ ] 3D brain visualization (Three.js)
- [ ] Parallax effect on scroll
- [ ] Real-time stats updates (from API)
- [ ] User testimonial carousel overlay
- [ ] Interactive element tooltips
- [ ] Personalized content based on user segment

### Analytics Integration

- [ ] Track carousel interaction rates
- [ ] Monitor button click-through rates
- [ ] Measure time-on-hero metric
- [ ] A/B test carousel interval (3s vs 5s vs 7s)
- [ ] Heatmap of hero section interactions

### Performance Improvements

- [ ] Dynamic image loading based on network speed
- [ ] Skeleton screens during image loading
- [ ] Service worker caching
- [ ] Image WebP with JPEG fallback system
- [ ] Progressive enhancement for slow networks

---

## Troubleshooting

### Common Issues

**Images not rotating:**
```
Check: carousel interval is 5000ms
Check: state updates are working (console.log currentIndex)
Check: CSS classes are correct (opacity transitions)
Check: z-index layering is correct
```

**Brain visualization not visible:**
```
Check: z-index of background layer vs content
Check: pointer-events: none on decorative elements
Check: opacity of gradient overlay
Check: particle positions are scattered (not clustered)
```

**Mobile layout broken:**
```
Check: responsive classes (md:, lg: prefixes)
Check: width calculations (60% → 100% on mobile)
Check: image aspect ratio on small screens
Check: touch target sizes (44px minimum)
```

**Animations laggy:**
```
Check: using transform and opacity only
Check: no background changes mid-animation
Check: GPU acceleration enabled
Check: prefers-reduced-motion respected
Check: no excessive shadow calculations
```

---

## References

- [LANDING_PAGE_SPEC_UPDATED.md](./LANDING_PAGE_SPEC_UPDATED.md) - Original 60/40 layout reference
- [ENTERPRISE_DESIGN_GUIDE.md](./ENTERPRISE_DESIGN_GUIDE.md) - Design system and color palette
- [LANDING_PAGE_DESIGN_REFERENCE.md](./LANDING_PAGE_DESIGN_REFERENCE.md) - Component styling reference
- Tailwind CSS Documentation: https://tailwindcss.com
- Web Accessibility Guidelines: https://www.w3.org/WAI/WCAG21/quickref/

---

**Status**: Ready for implementation
**Last Updated**: December 17, 2025
**Version**: 1.0
