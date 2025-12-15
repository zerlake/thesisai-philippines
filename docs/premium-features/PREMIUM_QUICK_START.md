# Premium Visual System - Quick Start

Fast reference for implementing enterprise-grade design.

## Import Essentials

```tsx
// Particle & Ambient Effects
import { AmbientParticles, ParticleCanvas } from '@/lib/visual-effects'

// Glass & Depth
import { Glassmorphic, GlassmorphicCard, NestedGlassmorphism } from '@/lib/visual-effects'

// Lighting & Shadows
import { LightingOrb, AdvancedLighting, ShadowSystem, DepthLayer } from '@/lib/visual-effects'

// Color & Effects
import { ColorGradingOverlay, colorGradePresets, BlendedContent, TexturedBackground } from '@/lib/visual-effects'

// Icons & UI
import { StarIcon, CheckIcon, ArrowIcon, LoadingIcon, IconButton, StatusIndicator } from '@/lib/visual-effects'

// Typography
import { DisplayHeading, Headline, BodyText, MagazineLayout, GradientText } from '@/lib/visual-effects'

// Premium Wrappers
import { PremiumSection, PremiumCard, PremiumHero, PremiumFeatureGrid, PremiumCTA } from '@/components/premium-wrapper'
```

---

## Common Patterns

### Hero Section

```tsx
<PremiumHero backgroundVariant="animated">
  <AdvancedLighting />
  <DisplayHeading>Your Title</DisplayHeading>
  <PremiumCTA variant="primary">Call to Action</PremiumCTA>
</PremiumHero>
```

### Feature Cards

```tsx
<PremiumCard hoverable>
  <h3 className="text-lg font-semibold">Feature Title</h3>
  <p>Description text</p>
</PremiumCard>
```

### Dashboard Card

```tsx
import { PremiumDashboardCard } from '@/components/premium-dashboard-card'

<PremiumDashboardCard
  title="Metric Name"
  value="1,234"
  trend={{ value: 15, direction: 'up' }}
  icon={<StarIcon />}
/>
```

### Glassmorphic Container

```tsx
<Glassmorphic intensity="medium" border>
  <div className="p-6">Content</div>
</Glassmorphic>
```

### With Lighting

```tsx
<div className="relative">
  <LightingOrb 
    config={{
      intensity: 'medium',
      direction: 'top-left',
      color: 'rgba(59, 130, 246, 0.4)'
    }}
  />
  <div className="relative z-10">Content</div>
</div>
```

### With Color Grade

```tsx
<ColorGradingOverlay config={colorGradePresets.elevated}>
  <img src="..." alt="..." />
</ColorGradingOverlay>
```

---

## Quick Component Reference

| Component | Use | Example |
|-----------|-----|---------|
| `AmbientParticles` | Brand personality | Hero sections |
| `Glassmorphic` | Cards, panels, modals | Dashboard, editor |
| `LightingOrb` | Depth, focus | Section backgrounds |
| `AdvancedLighting` | Sophisticated depth | Landing pages |
| `ShadowSystem` | Elevation | Card depth |
| `DisplayHeading` | Maximum impact | Page titles |
| `PremiumCard` | Feature cards | Anywhere |
| `PremiumHero` | Hero sections | Landing page |
| `PremiumCTA` | Call-to-action | Buttons |
| `IconButton` | Small actions | Toolbars |
| `StatusIndicator` | Status badges | Cards, headers |

---

## Tailwind Classes

### Animations
```tsx
className="animate-fade-in"      // Opacity fade
className="animate-slide-up"     // Slide from bottom
className="animate-scale-in"     // Pop entrance
className="animate-glow"         // Pulsing glow
className="animate-shimmer"      // Wave effect
```

### Effects
```tsx
className="shadow-glow"          // Glowing shadow
className="backdrop-blur-premium" // Premium blur
className="text-gradient"        // Gradient text
className="skeleton-loading"     // Loading state
```

---

## Dark Mode Support

Everything automatically adapts:

```tsx
// Automatically light in light mode, dark in dark mode
<Glassmorphic intensity="medium">
  Content adapts to theme
</Glassmorphic>

// Explicit dark mode class for specific elements
<div className="dark:bg-black/40">
  Dark mode background
</div>
```

---

## Performance Tips

1. **Particles**: Use `density="sparse"` on mobile
2. **Lighting**: Max 2-3 light sources per section
3. **Color Grading**: Use presets, not custom
4. **Animations**: Respect `prefers-reduced-motion`
5. **GPU**: Add `will-change` for animated elements

---

## Browser Support

✓ Chrome 76+  
✓ Safari 9+  
✓ Firefox 103+  
✓ Edge 79+  

Graceful fallbacks for older browsers.

---

## File Structure

```
src/
├── lib/visual-effects/
│   ├── particle-system.tsx
│   ├── glassmorphism.tsx
│   ├── lighting-system.tsx
│   ├── color-grading.tsx
│   ├── svg-icon-system.tsx
│   ├── typography-system.tsx
│   └── index.ts
├── components/
│   ├── premium-wrapper.tsx
│   ├── premium-landing-hero.tsx
│   ├── premium-features-showcase.tsx
│   ├── premium-dashboard-card.tsx
│   ├── premium-editor-toolbar.tsx
├── styles/
│   └── premium-effects.css
└── globals.css (imports premium-effects.css)
```

---

## Common Issues

**Glassmorphism not visible?**  
→ Ensure background color behind it  
→ Check browser supports backdrop-filter  

**Particles not animating?**  
→ Check canvas ref properly mounted  
→ Verify device has GPU acceleration  

**Dark mode looks wrong?**  
→ Check CSS custom properties  
→ Ensure contrast in dark theme  

**Performance sluggish?**  
→ Reduce particle count  
→ Disable animations on mobile  
→ Use `will-change: transform` on animated elements  

---

## Getting Started (5 Minutes)

1. **Install everything** - Already in `/lib/visual-effects`
2. **Import components** - Copy import statement above
3. **Wrap a section** - Use `<PremiumSection>`
4. **Add a card** - Use `<PremiumCard>`
5. **Test in browser** - Should see immediate enhancement

**That's it.** Start small, expand gradually.

---

## Next Level

- Combine lighting + particles + glassmorphism
- Layer multiple color grades
- Nest glass containers for depth
- Animate icon states
- Custom SVG patterns for textures

---

See [PREMIUM_VISUAL_SYSTEM.md](./PREMIUM_VISUAL_SYSTEM.md) for detailed documentation.
