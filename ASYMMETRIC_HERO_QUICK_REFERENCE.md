# Asymmetric Hero 60/40 - Quick Reference Card

## Layout Summary

```
Desktop (60/40 Split):
┌─────────────────────────────────────┬──────────────────────┐
│                                     │                      │
│  LEFT CONTENT (60%)                 │  CAROUSEL (40%)      │
│  ├─ Badge                           │  ├─ Rotating Images  │
│  ├─ Headline                        │  │  (5s interval)    │
│  ├─ Subheading                      │  ├─ Dot Navigation   │
│  ├─ CTA Buttons                     │  └─ Brain Viz BG     │
│  ├─ Trust Stats (3 cols)            │                      │
│  └─ Trust Statement                 │                      │
│                                     │                      │
└─────────────────────────────────────┴──────────────────────┘
```

---

## File Structure

```
src/components/landing/
├── asymmetric-hero-section.tsx      (Main container)
├── hero-carousel.tsx                 (Image carousel, 5s interval)
├── hero-brain-visualization.tsx      (Digital brain background)
└── hero-stats.tsx                    (Trust metrics grid)

public/
├── hero-carousel-research.webp       (Image 1)
├── hero-carousel-ai.webp             (Image 2)
└── hero-carousel-thesis.webp         (Image 3)
```

---

## Key CSS Classes

### Layout
```
Container:      relative min-h-screen overflow-hidden
Content:        relative z-10 container flex flex-col md:flex-row
Left (60%):     w-full md:w-3/5 lg:w-3/5
Right (40%):    w-full md:w-2/5 lg:w-2/5
Carousel:       w-full h-64 md:h-80 lg:h-96
```

### Animations (5s total sequence)
```
Badge:          opacity-0 animate-[fade-in_0.5s_ease-out_0.2s_forwards]
Headline:       opacity-0 animate-[fade-in_0.5s_ease-out_0.3s_forwards]
Subheading:     opacity-0 animate-[fade-in_0.5s_ease-out_0.4s_forwards]
Stats:          opacity-0 animate-[fade-in_0.5s_ease-out_0.5s_forwards]
Buttons:        opacity-0 animate-[fade-in_0.5s_ease-out_0.8s_forwards]
Carousel:       opacity-0 animate-[fade-in_0.5s_ease-out_0.6s_forwards]
Trust:          opacity-0 animate-[fade-in_0.5s_ease-out_1s_forwards]
Scroll Indicator: opacity-0 animate-[fade-in_0.5s_ease-out_1.2s_forwards]
```

### Colors
```
Background:     bg-gradient-to-b from-black/50 via-black/60 to-slate-900
Text Primary:   text-white
Text Secondary: text-slate-300
Text Tertiary:  text-slate-400
Accent 1:       from-accent-electric-purple
Accent 2:       to-accent-cyan
Button Primary: bg-gradient-to-r from-accent-electric-purple to-accent-cyan
Button Hover:   hover:shadow-2xl hover:shadow-purple-500/50
Card Bg:        bg-slate-800/50
Card Border:    border-slate-700/50
```

---

## Carousel Logic

### 5-Second Auto-Advance

```ts
const CAROUSEL_INTERVAL = 5000; // milliseconds

useEffect(() => {
  const interval = setInterval(() => {
    setCurrentIndex(prev => (prev + 1) % CAROUSEL_IMAGES.length);
  }, CAROUSEL_INTERVAL);
  
  return () => clearInterval(interval);
}, []);
```

### Image Transitions

```ts
// Inactive → Active
opacity-0 → opacity-100
duration: 500ms
easing: ease-in-out

// Active → Inactive
opacity-100 → opacity-0
duration: 500ms
easing: ease-in-out
```

### Navigation

- **Auto**: Every 5000ms
- **Manual**: Click dot indicators (resets timer)
- **Keyboard**: Arrow keys (if implemented)

---

## Responsive Breakpoints

```
Mobile (<768px):      100% stacked, full-width carousel
Tablet (768-1024px):  50/50 split
Desktop (>1024px):    60/40 asymmetric
```

### Tailwind Prefixes
```
Base:     Mobile first
md:       Tablet (768px+)
lg:       Desktop (1024px+)
xl:       Large (1280px+)
```

---

## Component Props

### HeroCarousel
```ts
// No props - uses internal state
<HeroCarousel />
```

### HeroBrainVisualization
```ts
// No props - decorative element
<HeroBrainVisualization />
```

### HeroStats
```ts
// No props - uses static stat data
<HeroStats />
```

---

## Image Requirements

```
Format:       WebP (primary), JPEG (fallback)
Dimensions:   1280x720px (16:9)
File Size:    150-200KB each
Count:        3 images (rotate every 5s)
Quality:      85% compression
Naming:       hero-carousel-{name}.webp
Location:     /public directory

Image 1: Research visualization
Image 2: AI integration concept
Image 3: Thesis completion celebration
```

---

## Performance Targets

```
Lighthouse Score:     >90
First Contentful Paint: <2s
Largest Contentful Paint: <3s
Cumulative Layout Shift: <0.1
Time to Interactive: <4s
Image Load Time: <500ms
Carousel Transition: 500ms smooth
Animation FPS: 60fps
```

---

## Accessibility Checklist

```
✓ Semantic HTML (<section>, <h1>, <button>)
✓ ARIA labels (aria-label, aria-current, role)
✓ Color contrast: 4.5:1 minimum
✓ Focus indicators: Visible and clear
✓ Keyboard navigation: Tab, Enter, Arrow keys
✓ Alt text: All images have descriptive alt
✓ prefers-reduced-motion: Respected
✓ Touch targets: 44px minimum height
✓ Screen reader: Proper announcements
✓ Page structure: Clear hierarchy
```

---

## Customization Guide

### Change Carousel Interval
```ts
// In hero-carousel.tsx
const CAROUSEL_INTERVAL = 3000; // 3 seconds instead of 5
```

### Change Colors
```tsx
// Update Tailwind config
accent-electric-purple: '#your-color-here'
accent-cyan: '#your-color-here'

// Or inline in components
bg-gradient-to-r from-blue-500 to-purple-600
```

### Change Headline
```tsx
// In asymmetric-hero-section.tsx, line ~60
<h1>Your Custom Headline, <span>Highlighted</span></h1>
```

### Add/Remove Stats
```tsx
// In hero-stats.tsx
const STATS = [
  // Add or remove items from array
  { value: '10K+', label: 'Students', icon: Users },
];
```

### Modify Brain Visualization
```tsx
// In hero-brain-visualization.tsx
// Adjust particle positions, colors, sizes, or animation speeds
```

---

## Common Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Run tests
pnpm test -- asymmetric-hero

# Type check
pnpm exec tsc --noEmit

# Lint code
pnpm lint

# Optimize images
node scripts/optimize-carousel-images.js

# Lighthouse audit
lighthouse http://localhost:3000
```

---

## Browser Support

```
Chrome:     90+  ✓
Firefox:    88+  ✓
Safari:     14+  ✓
Edge:       90+  ✓
iOS Safari: 14+  ✓
Android:    10+  ✓
```

---

## Key Variables

```ts
// Carousel
const CAROUSEL_IMAGES = [...]      // 3 images array
const CAROUSEL_INTERVAL = 5000     // 5 seconds

// Animations
fade-in:      0.5s ease-out
delay steps:  0.2s, 0.3s, 0.4s, etc.
stagger gap:  0.1s between items

// Spacing
padding:      px-6 md:px-12 lg:px-16
margin gaps:  mb-6, mb-8, mb-10
gaps:         gap-4, gap-8
```

---

## Testing Commands

```bash
# Visual regression
pnpm test -- --update

# Component isolation
pnpm exec vitest src/components/landing/hero-carousel.test.ts

# Accessibility
pnpm exec jest-axe asymmetric-hero-section

# Performance
npm run lighthouse
```

---

## Troubleshooting Quick Fixes

| Issue | Solution |
|-------|----------|
| Carousel not rotating | Check `CAROUSEL_INTERVAL` = 5000ms |
| Images not loading | Verify `/public/` paths and WebP format |
| Mobile layout broken | Check `md:` and `lg:` Tailwind prefixes |
| Animations laggy | Use `transform` and `opacity` only |
| Brain visualization missing | Check z-index layering |
| Text contrast poor | Verify 4.5:1 ratio or add text shadow |

---

## Documentation References

- **Full Specification**: ASYMMETRIC_HERO_60_40_SPECIFICATION.md
- **Implementation Guide**: ASYMMETRIC_HERO_IMPLEMENTATION_GUIDE.md
- **Design System**: LANDING_PAGE_DESIGN_REFERENCE.md
- **Enterprise Design**: ENTERPRISE_DESIGN_GUIDE.md

---

## Feature Flags

```env
# .env.local
NEXT_PUBLIC_ASYMMETRIC_HERO=true    # Enable/disable feature
```

---

**Last Updated**: December 17, 2025  
**Version**: 1.0  
**Status**: Ready for Implementation
