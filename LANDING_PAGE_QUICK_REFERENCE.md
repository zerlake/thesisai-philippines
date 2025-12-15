# Landing Page - Quick Reference

## Color Palette (Copy-Paste Ready)

```css
/* Primary Colors */
--primary-blue: #0A2540;
--navy-dark: #1B3A52;
--electric-purple: #7C3AED;
--bright-cyan: #06B6D4;

/* Neutral Colors */
--dark-bg: #0F172A;
--card-bg: #1E293B;
--text-primary: #F1F5F9;
--text-secondary: #CBD5E1;
--text-tertiary: #94A3B8;
--border: #334155;

/* Status Colors */
--success: #10B981;
--warning: #F59E0B;
--error: #EF4444;
--info: #3B82F6;
```

## Tailwind Classes

```tailwind
/* Colors */
from-accent-electric-purple to-accent-cyan
bg-gradient-to-r from-slate-800 to-slate-900

/* Animations */
animate-pulse-slow
animate-[fade-in_0.5s_ease-out_0.3s_forwards]

/* Sizing */
container mx-auto px-4
py-20 lg:py-32
rounded-2xl
```

## Component Usage

### Social Proof Section
```tsx
import { SocialProofSectionEnhanced } from '@/components/landing/social-proof-section-enhanced';

<SocialProofSectionEnhanced />
```

### Premium CTA Section
```tsx
import { PremiumCTAEnhanced } from '@/components/landing/premium-cta-enhanced';

<PremiumCTAEnhanced />
```

### Animation Variants
```tsx
import { fadeInUp, scaleIn, buttonHover } from '@/lib/landing/animation-variants';
import { motion } from 'framer-motion';

<motion.div variants={fadeInUp}>Content</motion.div>
```

### Scroll Animation Hook
```tsx
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const { elementRef, isVisible } = useScrollAnimation();

<div ref={elementRef}>
  {isVisible && <AnimatedContent />}
</div>
```

### Counter Animation Hook
```tsx
import { useCounterAnimation } from '@/hooks/useScrollAnimation';

const count = useCounterAnimation(50000, 2000);

<p>{count}+</p>
```

## Files Created/Updated

| File | Type | Purpose |
|------|------|---------|
| `LANDING_PAGE_SPEC_UPDATED.md` | Spec | Design system & specs |
| `LANDING_PAGE_IMPLEMENTATION_SUMMARY.md` | Doc | Integration guide |
| `src/lib/landing/animation-variants.ts` | Code | Animation presets |
| `src/hooks/useScrollAnimation.ts` | Code | Animation hooks |
| `src/components/landing/social-proof-section-enhanced.tsx` | Code | Social proof section |
| `src/components/landing/premium-cta-enhanced.tsx` | Code | CTA section |

## Integration Checklist

```
[ ] Copy animation-variants.ts to src/lib/landing/
[ ] Copy useScrollAnimation.ts to src/hooks/
[ ] Copy enhanced component files to src/components/landing/
[ ] Update src/app/page.tsx with new imports
[ ] Run pnpm install (verify dependencies)
[ ] Test with pnpm dev
[ ] Run Lighthouse audit
[ ] Test on mobile, tablet, desktop
[ ] Deploy to staging
```

## Typography Scale

| Component | Size | Weight |
|-----------|------|--------|
| H1 | 56px | 700 |
| H2 | 42px | 700 |
| H3 | 32px | 700 |
| H4 | 24px | 600 |
| Body Large | 18px | 400 |
| Body Regular | 16px | 400 |
| Body Small | 14px | 400 |
| Button | 16px | 600 |

## Animation Timing

| Type | Duration | Easing |
|------|----------|--------|
| Micro-interactions | 150-300ms | easeOut |
| Section transitions | 500-600ms | easeOut |
| Complex sequences | 800-1200ms | easeOut |
| Looping effects | 4-6s | easeInOut |

## Performance Targets

```
LCP:  < 2.5s
FID:  < 100ms
CLS:  < 0.1
Lighthouse Performance: 90+
Lighthouse Accessibility: 95+
Lighthouse Best Practices: 95+
Lighthouse SEO: 100
```

## Responsive Breakpoints

```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

## Key Commands

```bash
# Development
pnpm dev

# Build
pnpm build

# Lint
pnpm lint

# Test
pnpm test

# Lighthouse audit
npm run lighthouse

# Bundle analyzer
pnpm run analyze
```

## Common Patterns

### Staggered Animation
```tsx
<motion.div variants={staggerContainer} initial="initial" whileInView="animate">
  {items.map((item, i) => (
    <motion.div key={i} variants={cardVariant}>{item}</motion.div>
  ))}
</motion.div>
```

### Scroll-Triggered Animation
```tsx
<motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-100px" }}
  transition={{ duration: 0.6 }}
>
  Content
</motion.div>
```

### Counter with Hook
```tsx
const count = useCounterAnimation(50000, 2000, 0);
return <p>{count}+</p>
```

### Hover Effects
```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.98 }}
  transition={{ duration: 0.2 }}
>
  Click me
</motion.button>
```

## Styling Convention

```tsx
// Button with Tailwind + Framer Motion
<motion.div variants={buttonHover}>
  <Button 
    className="bg-gradient-to-r from-accent-electric-purple to-accent-cyan"
  >
    Start Free Trial
  </Button>
</motion.div>
```

## Accessibility Checklist

- [ ] Semantic HTML (h1, h2, button, a)
- [ ] Color contrast WCAG AA
- [ ] Keyboard navigation (Tab, Enter)
- [ ] prefers-reduced-motion support
- [ ] ARIA labels where needed
- [ ] Alt text on images
- [ ] Focus indicators visible

## Mobile Optimization

```tsx
// Font sizes scale on mobile
<h1 className="text-5xl md:text-7xl">Heading</h1>

// Spacing reduces on mobile
<div className="px-4 md:px-6 lg:px-8">Content</div>

// Grid stacks on mobile
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">Items</div>

// Images use next/image
<Image src="/hero.webp" alt="Hero" width={1200} height={600} />
```

## Deployment Checklist

```
[ ] Lighthouse all scores 90+
[ ] Mobile responsiveness verified
[ ] Cross-browser tested
[ ] Accessibility audit passed
[ ] Analytics configured
[ ] Meta tags correct
[ ] SSL/TLS enabled
[ ] CDN configured
[ ] Performance baseline established
```

## Support

For detailed implementation info, see:
- **Spec:** `LANDING_PAGE_SPEC_UPDATED.md`
- **Integration:** `LANDING_PAGE_IMPLEMENTATION_SUMMARY.md`
- **Animations:** `src/lib/landing/animation-variants.ts`
- **Hooks:** `src/hooks/useScrollAnimation.ts`

---

**Last Updated:** December 15, 2025  
**Status:** Production Ready ✅
