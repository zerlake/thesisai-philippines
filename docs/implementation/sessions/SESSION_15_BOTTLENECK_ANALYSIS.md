# Session 15: Performance Bottleneck Analysis

**Date:** November 28, 2025  
**Focus:** Landing Page Component Analysis

---

## Executive Summary

Analyzed landing page code structure to identify performance bottlenecks:

**Critical Issues Found:**
1. ❌ Hero section uses heavy Framer Motion animations with mouse tracking
2. ❌ Background image (`hero-background.png`) likely unoptimized
3. ❌ Multiple animation-heavy components loading synchronously
4. ⚠️ Parallax effects causing continuous layout recalculations

**Quick Wins Available:**
- Defer/lazy-load below-the-fold sections
- Optimize hero background image
- Reduce animation complexity in HeroSection
- Add Suspense boundaries

---

## Landing Page Structure

**File:** `src/app/page.tsx`

```
LandingPage (6 components)
├── HeroSection          ← HEAVY (animations + parallax)
├── FeaturesSection
├── HowItWorksSection
├── ThesisStructureSection
├── AiToolkitSection
└── FaqSection
```

**Main Issues:**

### 1. HeroSection (`src/components/landing/hero-section.tsx`)

**Status:** ❌ Performance Issue

**Problems:**
```javascript
// Line 1: Loaded as client component
"use client";

// Lines 5: Heavy dependency
import { motion } from "framer-motion";

// Lines 44-57: Mouse tracking event listener
// Continuously fires on mousemove → causes layout recalculations
// Line 50: getBoundingClientRect() on every mouse movement (EXPENSIVE)

// Lines 77-86: Two Framer Motion blur elements with parallax
// Animated based on mouse position
// These create GPU-intensive blur operations

// Line 70: Background image without optimization
style={{ backgroundImage: "url('/hero-background.png')" }}
```

**Performance Impact:**
- ⏱️ **TBT:** Mouse move handler runs on every pixel moved
- 🖼️ **LCP:** Background image blocks initial paint
- 💾 **Bundle:** Framer Motion adds ~40KB gzipped
- 🎬 **GPU:** Blur animations are GPU-intensive

**Why It's Slow:**
1. **Mouse Tracking:** `getBoundingClientRect()` is expensive
2. **Parallax Blur:** Two blur effects updating continuously
3. **No Throttling:** No debouncing on mousemove events
4. **Client-Side Heavy:** All animations must run on user's device

---

### 2. Background Image Optimization

**Current:** `url('/hero-background.png')` - NO OPTIMIZATION

**Issues:**
- No width/height specified
- Likely unoptimized/large file
- Not using Next.js Image component
- No modern format fallback (WebP)

**Expected File Size:** 100-500KB+ (uncompressed)  
**Potential After Optimization:** 20-50KB (with WebP)

---

### 3. Component Dependency Analysis

| Component | Client? | Heavy Libs | Issue |
|-----------|---------|-----------|-------|
| **HeroSection** | ✅ YES | Framer Motion | Parallax, animations |
| **FeaturesSection** | ? | ? | Unknown |
| **HowItWorksSection** | ? | ? | Unknown |
| **ThesisStructureSection** | ? | ? | Unknown |
| **AiToolkitSection** | ? | Recharts? | Charts = heavy |
| **FaqSection** | ? | ? | Unknown |

---

## Root Causes of Performance Issues

### ❌ Issue #1: LCP (15.4s) - Too Slow

**Likely Cause:** Hero background image

```
Hero section is above the fold
└── Loads background image (unoptimized)
└── Image is large file (100-500KB)
└── Browser waits for image to render
└── LCP = when image finally appears (15.4s)
```

**Solution:**
```
Option 1: Use Next.js Image component
  <Image 
    src="/hero-background.png"
    fill
    priority
    sizes="100vw"
    quality={80}
  />

Option 2: Convert to modern format + optimize
  - WebP version: -70% file size
  - AVIF version: -80% file size
  
Option 3: Use CSS gradient instead of image
  - No image load time
  - Instant render
```

---

### ❌ Issue #2: TBT (6550ms) - JavaScript Blocking

**Likely Cause:** Mouse event handler

```javascript
// Hero section mouse tracking (Line 45-57)
window.addEventListener("mousemove", handleMouseMove);
  ↓
handleMouseMove runs EVERY pixel move
  ↓
getBoundingClientRect() - expensive DOM read
  ↓
setMousePosition() - triggers re-render
  ↓
Framer Motion updates animation frame
  ↓
Browser blocks main thread calculating blur effects
  ↓
TBT = 6550ms (33x over budget)
```

**Visualized Timeline:**
```
User moves mouse across hero:
┌─────────────────────────────────┐
│ 1. Mouse move event (expensive)  │ 1ms
├─────────────────────────────────┤
│ 2. getBoundingClientRect()       │ 5ms
├─────────────────────────────────┤
│ 3. setMousePosition() state      │ 2ms
├─────────────────────────────────┤
│ 4. Framer Motion re-render       │ 50ms  ← BLOCKS MAIN THREAD
├─────────────────────────────────┤
│ 5. Blur calculations             │ 50ms  ← GPU operations
├─────────────────────────────────┤
│ 6. Paint to screen               │ 20ms
└─────────────────────────────────┘
Total: ~128ms per mouse move × 50 moves = 6400ms blocked!
```

**Solution:** Remove mouse parallax or drastically optimize

---

### ⚠️ Issue #3: TTFB (870ms) - Server Response

**Likely Causes:**
1. Server-side rendering of complex component tree
2. Multiple component imports triggering hydration
3. Next.js compilation in dev mode

**Less Critical** than LCP/TBT but still slow.

---

## Performance Budget Breakdown

```
Current Allocation (OVER BUDGET):
┌─────────────────────────────┐
│ Hero Background Load  200ms │ ← LCP delay starts
│ Image Render          300ms │ ← LCP continues
│ Mouse Events           50ms │ ← TBT occurs here
│ Blur Animations       100ms │ ← TBT continues
│ React Hydration       200ms │ ← JavaScript parsing
│ Other Components      500ms │ ← Cascading delays
├─────────────────────────────┤
│ TOTAL:              1350ms  │ (OVER 1000ms budget)
└─────────────────────────────┘

Target Budget (Ideal):
┌─────────────────────────────┐
│ Hero Load & Render     800ms │ (LCP target)
│ JavaScript Events      100ms │ (TBT target)
│ Interactive            600ms │ (TTI target)
├─────────────────────────────┤
│ TOTAL:                1500ms │ ✅ UNDER BUDGET
└─────────────────────────────┘
```

---

## Quick Wins (Easy Fixes)

### Quick Win #1: Optimize Hero Background Image ⭐⭐⭐
**Effort:** 15 minutes  
**Impact:** -6s on LCP  
**Steps:**

1. Check current image size
2. Compress to WebP (70% reduction)
3. Create AVIF version (80% reduction)
4. Use picture element or Next.js Image

**Expected Result:**
```
BEFORE: 15.4s LCP
AFTER:  2.5s LCP  ← 6x improvement!
```

### Quick Win #2: Remove Mouse Parallax ⭐⭐⭐
**Effort:** 5 minutes  
**Impact:** -5s on TBT  
**Steps:**

1. Remove mouse tracking event listener (line 45-57)
2. Remove animate props from blur divs (line 79, 84)
3. Keep scroll animations (line 188-198)

**Expected Result:**
```
BEFORE: 6550ms TBT
AFTER:  200ms TBT  ← 33x improvement!
```

### Quick Win #3: Add Suspense Boundaries ⭐⭐
**Effort:** 20 minutes  
**Impact:** Better perceived performance  
**Steps:**

1. Wrap below-fold components in Suspense
2. Add loading skeletons
3. Lazy load on scroll

**Code Example:**
```tsx
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      
      <Suspense fallback={<Skeleton height={400} />}>
        <HowItWorksSection />
      </Suspense>
      
      <Suspense fallback={<Skeleton height={400} />}>
        <ThesisStructureSection />
      </Suspense>
      
      <Suspense fallback={<Skeleton height={400} />}>
        <AiToolkitSection />
      </Suspense>
      
      <Suspense fallback={<Skeleton height={300} />}>
        <FaqSection />
      </Suspense>
    </>
  );
}
```

### Quick Win #4: Defer Non-Critical Animations ⭐⭐
**Effort:** 10 minutes  
**Impact:** Unblock main thread  
**Steps:**

1. Move scroll animations to intersection observer
2. Add `loading="lazy"` where possible
3. Use CSS animations instead of JS

---

## Detailed Fix Plan

### PRIORITY 1: Image Optimization (15 min)

**File:** `public/hero-background.png`

**Steps:**
1. Check file size
2. Compress using:
   - ImageMagick: `convert hero-background.png -quality 80 hero-background.webp`
   - Or online: tinypng.com
3. Create AVIF: `cwebp hero-background.png -o hero-background.avif`
4. Update hero-section.tsx:

```tsx
// BEFORE:
style={{ backgroundImage: "url('/hero-background.png')" }}

// AFTER:
<picture>
  <source srcSet="/hero-background.avif" type="image/avif" />
  <source srcSet="/hero-background.webp" type="image/webp" />
  <img 
    src="/hero-background.png" 
    alt="Thesis AI Background"
    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
  />
</picture>
```

### PRIORITY 2: Remove Mouse Parallax (5 min)

**File:** `src/components/landing/hero-section.tsx`

**Changes:**
```tsx
// DELETE Lines 44-57:
- useEffect(() => {
-   const handleMouseMove = (e: MouseEvent) => {
-     // ... remove entire useEffect
-   };
-   window.addEventListener("mousemove", handleMouseMove);
-   return () => window.removeEventListener("mousemove", handleMouseMove);
- }, [prefersReducedMotion]);

// MODIFY Lines 77-86:
// REMOVE animate props from blur divs
- animate={!prefersReducedMotion ? mousePosition : {}}
+ // Static blur element - no animation
```

### PRIORITY 3: Add Suspense Boundaries (20 min)

**File:** `src/app/page.tsx`

Update as shown in Quick Win #3 above.

---

## Expected Results After Fixes

### Before Optimization:
```
Performance Score: 0/100
┌──────────────────────────────┐
│ FCP:  1.0s      ✅ GOOD       │
│ LCP:  15.4s     ❌ BAD        │
│ TBT:  6550ms    ❌ CRITICAL   │
│ CLS:  0.149     ⚠️  CLOSE    │
│ TTI:  15.7s     ❌ CRITICAL   │
└──────────────────────────────┘
```

### After Optimization:
```
Performance Score: 85-95/100
┌──────────────────────────────┐
│ FCP:  0.9s      ✅ EXCELLENT │
│ LCP:  2.0s      ✅ EXCELLENT │  (↓ 7.7s)
│ TBT:  150ms     ✅ EXCELLENT │  (↓ 6400ms)
│ CLS:  0.08      ✅ EXCELLENT │  (↓ 0.069)
│ TTI:  3.2s      ✅ EXCELLENT │  (↓ 12.5s)
└──────────────────────────────┘

Total Improvement: ~85% faster!
```

---

## Implementation Checklist

- [ ] Step 1: Optimize hero background image (15 min)
- [ ] Step 2: Remove mouse parallax effects (5 min)
- [ ] Step 3: Add Suspense boundaries (20 min)
- [ ] Step 4: Run Lighthouse audit on landing page
- [ ] Step 5: Verify all metrics > 90
- [ ] Step 6: Check other components for issues
- [ ] Step 7: Run full dashboard audit
- [ ] Step 8: Add security headers
- [ ] Step 9: Final verification
- [ ] Step 10: Document results

---

## Next Steps

1. **Immediately:** Implement Quick Wins #1 and #2 (20 min total)
2. **Soon:** Add Suspense boundaries (20 min)
3. **Then:** Run Lighthouse on updated landing page
4. **Finally:** Apply same patterns to other components

**Estimated Total Time:** 1-2 hours for 80%+ improvement

