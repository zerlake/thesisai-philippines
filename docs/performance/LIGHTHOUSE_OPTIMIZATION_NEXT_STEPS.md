# Lighthouse Optimization - Next Steps & Testing

**Last Update:** November 28, 2025  
**Status:** Code optimizations complete, testing in progress

## Optimizations Applied ✅

### 1. Framer Motion SSR Disabled
**Files Modified:**
- `src/components/landing/hero-section.tsx`
  - MotionDiv: `ssr: true` → `ssr: false`
  - MotionH1: `ssr: true` → `ssr: false`
  - MotionP: `ssr: true` → `ssr: false`

- `src/components/landing/features-section.tsx`
  - MotionDiv: `ssr: true` → `ssr: false`
  - MotionButton: `ssr: true` → `ssr: false`

**Why This Helps:**
- Framer Motion library (28.3 KB) no longer loads during server-side rendering
- Library loads lazily after client hydration completes
- Reduces blocking JavaScript and Total Blocking Time (TBT)

### 2. Static Components Created
**New Files:**
- `src/components/landing/features-section-static.tsx`
  - Pure CSS version without Framer Motion
  - Zero JS overhead alternative
  - CSS transitions instead of motion library

### 3. Build Verification
```
✓ Compiled successfully in 46s
✓ 99 static pages generated
✓ No TypeScript errors
✓ No build warnings
```

## Expected Performance Improvements

### Before (Current)
```
TBT: 150-200ms (excessive)
FCP: ~1.2s
LCP: ~2.1s
CLS: 0.05
```

### After (Post-Optimization)
```
TBT: 50-100ms (40-60% reduction) ← PRIMARY GOAL
FCP: ~1.1s (minor improvement due to less JS blocking)
LCP: ~2.0s (slight improvement)
CLS: 0.05 (no change)
```

## How to Test Improvements

### Option 1: Local Lighthouse (When Server Running)
```bash
# Start dev server
pnpm dev

# In another terminal, run audit
npx lighthouse http://localhost:3000/ \
  --chrome-flags="--headless" \
  --output html \
  --output-path "lighthouse-landing-final.html" \
  --view
```

**Key Metrics to Watch:**
- Total Blocking Time (TBT) - should be < 100ms
- JavaScript Execution Time - should be reduced
- Main Thread Work Breakdown - Framer Motion chunk should be smaller or deferred

### Option 2: Chrome DevTools Profiling
1. Open landing page in Chrome
2. Open DevTools → Performance tab
3. Record page load (5 seconds)
4. Look for "long tasks" in the Main thread track
5. Should see fewer tasks from Framer Motion now

### Option 3: Lighthouse CI (Production)
```bash
# Test production deployment
npx lighthouse https://yourdomain.com/ \
  --output json \
  --output-path report.json

# Check TBT in results
jq '.audits."total-blocking-time".numericValue' report.json
```

## What Changed in Bundle

### Framer Motion Import Pattern
**Before (SSR enabled):**
```typescript
// This caused Framer Motion to be included in initial server bundle
const MotionDiv = dynamic(
  () => import("framer-motion").then(m => ({ default: m.motion.div })),
  { ssr: true } // ← PROBLEM
);
```

**After (SSR disabled):**
```typescript
// Framer Motion only loads after client hydration
const MotionDiv = dynamic(
  () => import("framer-motion").then(m => ({ default: m.motion.div })),
  { ssr: false } // ← SOLUTION
);
```

### Bundle Size Impact
- Main bundle: Same (Next.js still downloads Framer Motion)
- **Execution timing:** Framer Motion now loads AFTER initial page render
- **TBT:** Reduced because JS execution deferred to after interactive

## Additional Recommendations

### Priority 1: Verify TBT Improvement
- [ ] Run Lighthouse audit after deployment
- [ ] Confirm TBT < 100ms (< 150ms is good)
- [ ] Monitor Web Vitals in production

### Priority 2: Remove Unused Dependencies
Review these packages for usage:
- [ ] Audit all @radix-ui/react-* packages
- [ ] Check if all TipTap extensions are used
- [ ] Verify @sentry integration necessity
- [ ] Review pdfjs-dist usage

### Priority 3: Code Split Landing from App
- [ ] Move landing page to separate bundle
- [ ] Use dynamic imports for app-specific code
- [ ] Only load auth code when needed

### Priority 4: Consider Static Version
- [ ] Test features-section-static.tsx alternative
- [ ] May provide better core metrics if animations less critical
- [ ] Hybrid approach: static on load, animated after hydration

## Monitoring

### Core Web Vitals to Track
1. **FCP (First Contentful Paint)** - Target < 1.8s
2. **LCP (Largest Contentful Paint)** - Target < 2.5s
3. **CLS (Cumulative Layout Shift)** - Target < 0.1
4. **TBT (Total Blocking Time)** - Target < 100ms ← **PRIMARY FOCUS**
5. **INP (Interaction to Next Paint)** - Target < 200ms

### Tools for Production Monitoring
1. **Google Analytics** - Enable Web Vitals reporting
2. **PageSpeed Insights** - Monitor regularly
3. **WebPageTest** - Detailed waterfall analysis
4. **Sentry** - Already integrated for error tracking

## References

### Documentation
- [Next.js Dynamic Imports](https://nextjs.org/docs/advanced-features/dynamic-import)
- [Framer Motion Optimization](https://www.framer.com/motion/)
- [Lighthouse - TBT Guide](https://web.dev/tbt/)
- [Core Web Vitals](https://web.dev/vitals/)

## Files for Reference

**Optimization Documentation:**
- `LIGHTHOUSE_AUDIT_OPTIMIZATION_SESSION.md` - Detailed changes
- `lighthouse-landing-final.html` - Latest Lighthouse report

**Modified Components:**
- `src/components/landing/hero-section.tsx`
- `src/components/landing/features-section.tsx`

**New Components:**
- `src/components/landing/features-section-static.tsx` (CSS-only alternative)
- `src/components/landing/features-section-animated.tsx` (template)
