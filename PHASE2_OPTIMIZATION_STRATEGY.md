# Phase 2 Optimization Strategy - Execution Plan

**Current Baseline (Session 17):**
- Performance Score: 37/100
- FCP: 1.5s (acceptable)
- LCP: 10.2s (need <4s)
- **TBT: 9,070ms** ← CRITICAL (need <2,000ms)
- Speed Index: 5.3s (improved 27s from animation deferral)
- CLS: 0.0 (perfect)

---

## Root Cause Analysis

### Main Bottleneck: Total Blocking Time (9.07s)
- **Primary Source**: Framer Motion initialization + rendering blocking main thread
- **Secondary Issues**: 
  - Large JS bundles (React DOM, Sentry, Next.js client)
  - All animation libraries imported eagerly at page load
  - No code splitting between landing page and dashboard

### Impact on User Experience
- FCP is fine (1.5s) - initial paint happens quickly
- LCP delayed (10.2s) - hero image renders but content updates block
- **TBT causes 9s of unresponsiveness** - user interactions are sluggish

---

## Phase 2 Optimization Roadmap

### P0 - Critical (This Session) - Target: TBT <6,000ms
**Goal: Reduce TBT by 33% (from 9.07s to <6s)**

#### 1. Dynamic Framer Motion Import
**Files Affected**: 10 components using Framer Motion

**Strategy**: 
- Import motion/AnimatePresence dynamically only when animations are needed
- Keep non-animated components in critical path
- Defer animation library load until user interaction or scroll

**Implementation**:
```tsx
// BEFORE: Always imported
import { motion, AnimatePresence } from "framer-motion";

// AFTER: Lazy loaded
const motion = dynamic(() => import("framer-motion").then(m => ({ default: m.motion })));
const AnimatePresence = dynamic(() => import("framer-motion").then(m => ({ default: m.AnimatePresence })));
```

**Expected Benefit**: -2-3 seconds TBT (library parsing + initialization)

---

#### 2. Code Split Landing Page
**Files**: `src/app/page.tsx` and children components

**Strategy**:
- Separate landing page bundle from dashboard bundle
- Lazy load "below-fold" sections
- Don't load dashboard code on landing page

**Implementation**:
```tsx
const FeaturesSection = dynamic(() => import("@/components/landing/features-section"));
const CTASection = dynamic(() => import("@/components/landing/cta-section"));
```

**Expected Benefit**: -1-2 seconds TBT (removes unnecessary code from critical path)

---

#### 3. Remove Framer Motion from Non-Hero Animations
**Files**: Components that use motion for simple opacity/scale changes

**Strategy**:
- Use CSS-only transitions for simple effects
- Replace Framer Motion with CSS in:
  - CommandPalette hints
  - Button hover states
  - Basic fade-ins

**Expected Benefit**: -0.5-1 second TBT (fewer animations to parse)

---

### P1 - High Priority (Next Session) - Target: TBT <3,000ms + LCP <6s
**Goal: Achieve overall performance score 50+**

1. **Image Optimization**: Hero image lazy loading or priority hints
2. **CSS Minification**: Ensure all CSS is fully tree-shaken
3. **Sentry Configuration**: Load error tracking async, not in critical path
4. **Third-party Scripts**: Defer non-critical integrations

---

## Execution Timeline

### Session 18 (This Session)
- [ ] Implement dynamic Framer Motion in hero-section.tsx
- [ ] Implement dynamic Framer Motion in features-section.tsx
- [ ] Test 2 other high-use components
- [ ] Run Lighthouse audit to measure impact
- [ ] Target: TBT <7,000ms (20% improvement)

### Session 19 (Next)
- [ ] Complete code splitting for landing page
- [ ] Measure LCP impact
- [ ] Start CSS-only animation replacements
- [ ] Target: TBT <5,000ms, LCP <7s

### Session 20
- [ ] Final optimizations (Sentry async, lazy images)
- [ ] Target: TBT <3,000ms, Performance score 60+

---

## Success Criteria

| Metric | Current | Target | Session |
|--------|---------|--------|---------|
| TBT | 9,070ms | <6,000ms | 18 |
| TBT | 6,000ms | <3,000ms | 19-20 |
| LCP | 10.2s | <6s | 19-20 |
| Perf Score | 37/100 | 50/100 | 19 |
| Perf Score | 50/100 | 65+/100 | 20 |

---

## Files to Modify (Priority Order)

### Tier 1 (Immediate Impact)
1. `src/components/landing/hero-section.tsx` - Uses motion for SVG + text
2. `src/components/landing/features-section.tsx` - Heavy animation use
3. `src/app/page.tsx` - Root landing page

### Tier 2 (Moderate Impact)
4. `src/components/CommandPalette/CommandPalette.tsx`
5. `src/components/welcome-modal.tsx`
6. `src/components/intelligent-assistant.tsx`

### Tier 3 (Low Impact, Cleanup)
7. Dashboard components (only loaded on /dashboard anyway)

---

## Risk Mitigation

**Risk**: Breaking animations on landing page
**Mitigation**: Keep viewport detection + inView pattern, only make imports lazy

**Risk**: Worse initial load experience (longer time to interactive)
**Mitigation**: Monitor Speed Index and FCP - these should improve as animations defer

**Risk**: Users with motion preferences lose effects
**Mitigation**: Already handling `prefersReducedMotion` - no regression

---

## Monitoring Strategy

1. **Before Each Change**: Run `pnpm build && npx lighthouse http://localhost:3000`
2. **After Each File**: Check TBT metric specifically
3. **Cumulative**: Track total bundle size changes
4. **Final**: Compare Session 17 baseline to Session 18 target

---

**Status**: Ready to execute
**Next Step**: Start with hero-section.tsx dynamic import
**Estimated Time**: 2-3 hours for all Tier 1 changes
