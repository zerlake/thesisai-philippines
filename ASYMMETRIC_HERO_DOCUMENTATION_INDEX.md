# Asymmetric Hero 60/40 - Complete Documentation Index

## Overview

This index provides a complete guide to the Asymmetric Hero Section (60/40 layout) with left-aligned text, rotating image carousel (5-second intervals), and digital brain background visualization.

**Created**: December 17, 2025  
**Status**: Ready for Implementation  
**Version**: 1.0

---

## Documentation Files

### 1. **ASYMMETRIC_HERO_60_40_SPECIFICATION.md**
   **Purpose**: Comprehensive technical specification document  
   **Length**: ~800 lines  
   **Covers**:
   - Complete design specifications
   - Layout structure and responsive breakpoints
   - Typography, spacing, and color system
   - Carousel mechanics and 5-second interval details
   - Brain visualization specifications
   - Animation sequences and timing
   - Component implementation details
   - Code examples (React/TypeScript)
   - Accessibility requirements (WCAG AA)
   - Performance considerations
   - Testing specifications
   - Browser compatibility matrix
   - Troubleshooting guide
   - Future enhancements roadmap

   **When to Use**: For detailed design decisions, exact specifications, and technical reference

---

### 2. **ASYMMETRIC_HERO_IMPLEMENTATION_GUIDE.md**
   **Purpose**: Step-by-step implementation walkthrough  
   **Length**: ~500 lines  
   **Covers**:
   - Step 1: Image preparation (WebP optimization)
   - Step 2: Create 4 component files
     - `hero-carousel.tsx` (5-second auto-advance)
     - `hero-brain-visualization.tsx` (digital brain)
     - `hero-stats.tsx` (trust metrics)
     - `asymmetric-hero-section.tsx` (main container)
   - Step 3: Update Tailwind configuration
   - Step 4: Update color variables
   - Step 5: Integration into landing page
   - Step 6: Testing checklist (comprehensive)
   - Step 7: Image optimization script
   - Step 8: Performance optimization
   - Step 9: Analytics tracking (Google Analytics)
   - Step 10: A/B testing setup (feature flags)
   - Troubleshooting common issues
   - Deployment checklist

   **When to Use**: For actual implementation, follow steps sequentially

---

### 3. **ASYMMETRIC_HERO_QUICK_REFERENCE.md**
   **Purpose**: Quick lookup card for common tasks  
   **Length**: ~300 lines  
   **Covers**:
   - Layout summary (ASCII diagram)
   - File structure
   - Key CSS classes (layout, animations, colors)
   - Carousel logic (5000ms interval)
   - Responsive breakpoints
   - Component props
   - Image requirements
   - Performance targets
   - Accessibility checklist
   - Customization guide (7 common tasks)
   - Common commands (npm/pnpm)
   - Browser support matrix
   - Key variables
   - Testing commands
   - Troubleshooting quick fixes table
   - Feature flag configuration

   **When to Use**: For quick lookups, common customizations, or when you need a specific value

---

### 4. **ASYMMETRIC_HERO_VISUAL_DIAGRAM.md**
   **Purpose**: Visual ASCII diagrams and layout references  
   **Length**: ~400 lines  
   **Covers**:
   - Desktop layout (1024px+) ASCII diagram
   - Tablet layout (768px - 1024px) ASCII diagram
   - Mobile layout (< 768px) ASCII diagram
   - Component hierarchy tree
   - Animation sequence timeline (0ms - 5000ms+)
   - Carousel image transition diagram
   - Responsive width calculations
   - Z-index layering diagram
   - Color palette visualization
   - Spacing grid (8px base unit)
   - Text size progression by breakpoint
   - Hover state transitions
   - Performance metrics timeline
   - Accessibility focus path (TAB order)

   **When to Use**: To understand layout structure visually, for presentations, or design discussions

---

## Quick Navigation

### By Task

**I want to...**

- **Understand the design concept**  
  → Start with ASYMMETRIC_HERO_60_40_SPECIFICATION.md (Design Specifications section)

- **Implement this from scratch**  
  → Follow ASYMMETRIC_HERO_IMPLEMENTATION_GUIDE.md (Steps 1-10)

- **Change the carousel interval (5 seconds to 3 seconds)**  
  → ASYMMETRIC_HERO_QUICK_REFERENCE.md (Customization Guide)

- **Understand responsive behavior**  
  → ASYMMETRIC_HERO_VISUAL_DIAGRAM.md (Layouts section)

- **See code examples**  
  → ASYMMETRIC_HERO_60_40_SPECIFICATION.md (Code Examples section)

- **Check accessibility requirements**  
  → ASYMMETRIC_HERO_60_40_SPECIFICATION.md (Accessibility Requirements section)

- **Optimize images**  
  → ASYMMETRIC_HERO_IMPLEMENTATION_GUIDE.md (Step 7)

- **Test the implementation**  
  → ASYMMETRIC_HERO_IMPLEMENTATION_GUIDE.md (Step 6: Testing Checklist)

- **Deploy to production**  
  → ASYMMETRIC_HERO_IMPLEMENTATION_GUIDE.md (Deployment Checklist)

- **Troubleshoot an issue**  
  → ASYMMETRIC_HERO_QUICK_REFERENCE.md (Troubleshooting Quick Fixes table)

- **See CSS class names**  
  → ASYMMETRIC_HERO_QUICK_REFERENCE.md (Key CSS Classes)

- **Understand the component structure**  
  → ASYMMETRIC_HERO_VISUAL_DIAGRAM.md (Component Hierarchy)

---

### By Document Type

**Technical Specification**  
→ ASYMMETRIC_HERO_60_40_SPECIFICATION.md

**Implementation Steps**  
→ ASYMMETRIC_HERO_IMPLEMENTATION_GUIDE.md

**Quick Lookup**  
→ ASYMMETRIC_HERO_QUICK_REFERENCE.md

**Visual Diagrams**  
→ ASYMMETRIC_HERO_VISUAL_DIAGRAM.md

---

## Key Features Checklist

### Layout
- [x] 60/40 asymmetric split (desktop)
- [x] 50/50 tablet layout
- [x] 100% stacked mobile layout
- [x] Responsive container sizing
- [x] Proper gap and padding system

### Left Content (60%)
- [x] Badge with icon
- [x] Large headline with gradient accent
- [x] Subheading text
- [x] 3-column stats grid
- [x] Two CTA buttons
- [x] Trust statement

### Right Content (40%)
- [x] Image carousel container
- [x] 3 rotating images
- [x] 5-second auto-advance interval
- [x] Manual dot navigation
- [x] Image counter display
- [x] Gradient overlay (optional)

### Background
- [x] Digital brain visualization
- [x] 8 neural network lines
- [x] 12 floating particles
- [x] Animated orbs (2x)
- [x] Gradient overlay
- [x] Glow effects

### Animations
- [x] Staggered load sequence (0-1.2s)
- [x] Fade-in transitions
- [x] Carousel auto-rotation (5s interval)
- [x] Brain particle floats
- [x] Orb pulsing animations
- [x] Hover effects on interactive elements
- [x] Smooth 60fps performance

### Accessibility
- [x] Semantic HTML
- [x] ARIA labels
- [x] Keyboard navigation (Tab, Enter, Arrow keys)
- [x] Color contrast (4.5:1 minimum)
- [x] Focus indicators
- [x] Alt text on images
- [x] prefers-reduced-motion support

### Performance
- [x] WebP image optimization
- [x] Lazy loading for carousel images
- [x] GPU-accelerated animations
- [x] No layout shift (CLS friendly)
- [x] Fast image transitions
- [x] Efficient CSS (Tailwind)

---

## File Structure Created

```
Project Root/
├── ASYMMETRIC_HERO_60_40_SPECIFICATION.md
├── ASYMMETRIC_HERO_IMPLEMENTATION_GUIDE.md
├── ASYMMETRIC_HERO_QUICK_REFERENCE.md
├── ASYMMETRIC_HERO_VISUAL_DIAGRAM.md
├── ASYMMETRIC_HERO_DOCUMENTATION_INDEX.md (this file)
│
├── src/
│   └── components/
│       └── landing/
│           ├── asymmetric-hero-section.tsx (to create)
│           ├── hero-carousel.tsx (to create)
│           ├── hero-brain-visualization.tsx (to create)
│           └── hero-stats.tsx (to create)
│
└── public/
    ├── hero-carousel-research.webp (to add)
    ├── hero-carousel-ai.webp (to add)
    └── hero-carousel-thesis.webp (to add)
```

---

## Implementation Timeline

### Phase 1: Setup (1-2 hours)
- [ ] Prepare carousel images (optimization)
- [ ] Create component files
- [ ] Update Tailwind config
- [ ] Update color variables

### Phase 2: Development (2-3 hours)
- [ ] Implement carousel component
- [ ] Implement brain visualization
- [ ] Implement stats component
- [ ] Implement main hero section
- [ ] Integrate into landing page

### Phase 3: Testing (1-2 hours)
- [ ] Mobile responsiveness
- [ ] Tablet responsiveness
- [ ] Desktop responsiveness
- [ ] Carousel functionality
- [ ] Animation sequences
- [ ] Accessibility compliance
- [ ] Performance audit

### Phase 4: Optimization (1 hour)
- [ ] Image optimization
- [ ] CSS minification
- [ ] Lazy loading
- [ ] Caching setup

### Phase 5: Deployment (30 mins)
- [ ] Feature flag setup (optional)
- [ ] A/B testing configuration
- [ ] Analytics tracking
- [ ] Deploy to staging
- [ ] Deploy to production

**Total Estimated Time**: 5-8 hours

---

## Browser & Device Support

### Desktop Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Mobile Browsers
- iOS Safari 14+
- Chrome Android 90+
- Firefox Android 88+
- Samsung Internet 14+

### Device Sizes
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+
- Large Desktop: 1280px+

---

## Performance Targets

```
Metric                    Target      How to Measure
─────────────────────────────────────────────────────
Lighthouse Score          > 90        npm run lighthouse
First Contentful Paint    < 2.0s      DevTools → Lighthouse
Largest Contentful Paint  < 2.5s      DevTools → Lighthouse
Cumulative Layout Shift   < 0.1       DevTools → Lighthouse
Time to Interactive       < 4.0s      DevTools → Lighthouse
Animation Frame Rate      60fps       DevTools → Performance
Image Load Time           < 500ms     DevTools → Network
Carousel Transition       500ms       Manual observation
```

---

## Related Documentation

### In This Project
- [LANDING_PAGE_DESIGN_REFERENCE.md](./LANDING_PAGE_DESIGN_REFERENCE.md) - Color palette and component styles
- [ENTERPRISE_DESIGN_GUIDE.md](./ENTERPRISE_DESIGN_GUIDE.md) - Design system and hero specifications
- [LANDING_PAGE_SPEC_UPDATED.md](./LANDING_PAGE_SPEC_UPDATED.md) - Original 60/40 layout reference
- [AGENTS.md](./AGENTS.md) - Build & test commands

### External References
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [React Documentation](https://react.dev)
- [Web Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/WCAG21/quickref/)
- [Responsive Design Patterns](https://web.dev/responsive-web-design-basics/)

---

## Support & Troubleshooting

### Common Issues & Solutions

**Carousel images not rotating?**
```
1. Check CAROUSEL_INTERVAL = 5000ms
2. Verify useState works in console
3. Ensure CSS classes are correct
4. Check z-index layering
→ See: ASYMMETRIC_HERO_QUICK_REFERENCE.md (Troubleshooting)
```

**Mobile layout broken?**
```
1. Verify responsive classes (md:, lg:)
2. Test with DevTools device emulation
3. Check width calculations
4. Verify touch target sizes (44px+)
→ See: ASYMMETRIC_HERO_IMPLEMENTATION_GUIDE.md (Step 6: Testing)
```

**Animations laggy?**
```
1. Use transform & opacity only
2. Check for background changes
3. Verify GPU acceleration
4. Check prefers-reduced-motion
→ See: ASYMMETRIC_HERO_60_40_SPECIFICATION.md (Performance Considerations)
```

**Images not loading?**
```
1. Verify WebP format and paths
2. Check file sizes (< 200KB)
3. Ensure dimensions: 1280x720px
4. Check browser support
→ See: ASYMMETRIC_HERO_IMPLEMENTATION_GUIDE.md (Step 1)
```

---

## Next Steps

### Immediate (Next Session)
1. Review ASYMMETRIC_HERO_60_40_SPECIFICATION.md
2. Prepare carousel images
3. Start implementing components (Step 2)

### Short Term (1-2 Days)
1. Complete component implementation
2. Run full testing suite
3. Performance optimization
4. Deploy to staging

### Medium Term (1-2 Weeks)
1. Gather user feedback
2. A/B test vs. centered hero
3. Analyze analytics
4. Iterate based on results

### Long Term (1-2 Months)
1. Add video background variant
2. Implement 3D brain visualization
3. Add parallax effects
4. Create advanced animations

---

## Version History

```
v1.0 - December 17, 2025
├─ Initial specification and implementation guide
├─ 4 component files defined
├─ Full responsive design (mobile, tablet, desktop)
├─ 5-second carousel interval
├─ Digital brain visualization
├─ Complete accessibility support
└─ Ready for implementation
```

---

## Document Maintenance

### Update Checklist
- [ ] All code examples tested
- [ ] All file paths verified
- [ ] All specifications current
- [ ] All links working
- [ ] Screenshots up-to-date
- [ ] Browser compatibility verified
- [ ] Performance metrics accurate

### Last Updated
**Date**: December 17, 2025  
**By**: AI Assistant (Amp)  
**Status**: Complete & Ready for Implementation

---

## Quick Start (TL;DR)

```
1. READ:   ASYMMETRIC_HERO_60_40_SPECIFICATION.md (overview)
2. FOLLOW: ASYMMETRIC_HERO_IMPLEMENTATION_GUIDE.md (step-by-step)
3. USE:    ASYMMETRIC_HERO_QUICK_REFERENCE.md (lookups)
4. VIEW:   ASYMMETRIC_HERO_VISUAL_DIAGRAM.md (diagrams)
5. IMPLEMENT: 4 components in src/components/landing/
6. ADD: 3 carousel images to public/
7. TEST: Follow Step 6 checklist
8. DEPLOY: Follow deployment checklist
```

---

## Contact & Support

For questions or issues:
1. Check the relevant documentation file
2. Review troubleshooting section
3. Consult AGENTS.md for command reference
4. Refer to related project documentation

---

**This documentation set is comprehensive and ready for immediate implementation. No further specifications are needed.**

---

**Documentation Version**: 1.0  
**Last Updated**: December 17, 2025  
**Status**: ✅ Complete & Ready for Implementation
