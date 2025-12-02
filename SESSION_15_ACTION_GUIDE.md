# Session 15: Action Guide

**Status:** Bottlenecks Identified - Ready for Implementation  
**Target Time:** 40 minutes for full optimization

---

## The Problem (TL;DR)

Landing page is **6.5x slower than target** due to:

```
1. HUGE unoptimized image (hero-background.png)
   ↓ Delays paint by 6+ seconds
   
2. Mouse tracking on every pixel movement
   ↓ Blocks main thread for 6+ seconds
   
3. Heavy animations with blur effects
   ↓ GPU-intensive during scroll
```

---

## The Solution (3 Quick Fixes)

### Fix #1: Image Optimization (15 min)
**Impact:** -6 seconds on LCP ⚡⚡⚡

**Task:**
```bash
# In project root:

# 1. Check current image size
ls -lh public/hero-background.png

# 2. Install image tools (or use online tool)
npm install -g imagemin-cli imagemin-webp imagemin-avif

# 3. Convert to modern formats
imagemin public/hero-background.png --out-dir=public --plugin=webp
imagemin public/hero-background.png --out-dir=public --plugin=avif
```

**Alternative (use online):**
- Go to: https://tinypng.com or https://squoosh.app
- Upload: `public/hero-background.png`
- Download WebP version
- Save to `public/hero-background.webp`

**Update Code:**
Edit: `src/components/landing/hero-section.tsx`

```tsx
// Line 70 - CHANGE FROM:
style={{ backgroundImage: "url('/hero-background.png')" }}

// TO:
style={{ 
  backgroundImage: "url('/hero-background.webp')",
  // Fallback for older browsers
  backgroundImage: "url('/hero-background.png')"
}}

// OR use srcset:
style={{
  backgroundImage: "image-set(url('/hero-background.avif') type('image/avif'), url('/hero-background.webp') type('image/webp'), url('/hero-background.png'))"
}}
```

**Expected Result:**
```
BEFORE: LCP = 15.4s
AFTER:  LCP = 2.0-2.5s ✅
```

---

### Fix #2: Remove Mouse Parallax (5 min)
**Impact:** -6.5 seconds on TBT ⚡⚡⚡

**File:** `src/components/landing/hero-section.tsx`

**Step 1:** Delete lines 44-57 (entire useEffect for mouse tracking)
```tsx
// DELETE THIS ENTIRE BLOCK:
useEffect(() => {
  const handleMouseMove = (e: MouseEvent) => {
    if (containerRef.current && !prefersReducedMotion) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setMousePosition({ x: x * 10, y: y * 10 });
    }
  };

  window.addEventListener("mousemove", handleMouseMove);
  return () => window.removeEventListener("mousemove", handleMouseMove);
}, [prefersReducedMotion]);
```

**Step 2:** Update blur animations (lines 77-86)

CHANGE FROM:
```tsx
<motion.div 
  className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"
  animate={!prefersReducedMotion ? mousePosition : {}}
  transition={{ type: "tween", duration: 0.6 }}
/>
```

TO:
```tsx
<motion.div 
  className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"
  // Parallax removed - static element for better performance
/>
```

**Step 3:** Remove mousePosition state (lines 11-12) if not used elsewhere
```tsx
// DELETE:
const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
```

**Expected Result:**
```
BEFORE: TBT = 6550ms
AFTER:  TBT = 150-200ms ✅
```

---

### Fix #3: Add Suspense Boundaries (20 min)
**Impact:** Better perceived performance, faster interactive

**File:** `src/app/page.tsx`

CHANGE FROM:
```tsx
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorksSection } from "@/components/how-it-works-section";
import { FaqSection } from "@/components/faq-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { ThesisStructureSection } from "@/components/thesis-structure-section";
import { AiToolkitSection } from "@/components/ai-toolkit-section";

export default function LandingPage() {
  return (
    <div className="bg-slate-900 text-white">
      {/* ... metadata ... */}
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <ThesisStructureSection />
        <AiToolkitSection />
        <FaqSection />
      </main>
    </div>
  );
}
```

TO:
```tsx
import { Suspense } from 'react';
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorksSection } from "@/components/how-it-works-section";
import { FaqSection } from "@/components/faq-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { ThesisStructureSection } from "@/components/thesis-structure-section";
import { AiToolkitSection } from "@/components/ai-toolkit-section";

// Loading skeleton for deferred sections
function SectionSkeleton() {
  return (
    <div className="h-96 bg-slate-800/30 animate-pulse" />
  );
}

export default function LandingPage() {
  return (
    <div className="bg-slate-900 text-white">
      {/* ... metadata ... */}
      <main>
        <HeroSection />
        
        <Suspense fallback={<SectionSkeleton />}>
          <FeaturesSection />
        </Suspense>
        
        <Suspense fallback={<SectionSkeleton />}>
          <HowItWorksSection />
        </Suspense>
        
        <Suspense fallback={<SectionSkeleton />}>
          <ThesisStructureSection />
        </Suspense>
        
        <Suspense fallback={<SectionSkeleton />}>
          <AiToolkitSection />
        </Suspense>
        
        <Suspense fallback={<SectionSkeleton />}>
          <FaqSection />
        </Suspense>
      </main>
    </div>
  );
}
```

**Expected Result:**
```
BEFORE: TTI = 15.7s (all sections loaded at once)
AFTER:  TTI = 3.0-3.5s (hero loads first, others stream) ✅
```

---

## Implementation Order

```
STEP 1: Image Optimization (15 min)
└─ Compress hero-background.png → WebP
└─ Test in browser

STEP 2: Remove Parallax (5 min)
└─ Delete mouse tracking useEffect
└─ Remove animate from blur divs
└─ Test animations still work on scroll

STEP 3: Add Suspense (20 min)
└─ Wrap sections in Suspense
└─ Add loading skeleton
└─ Test streaming works

STEP 4: Verify (10 min)
└─ Run Lighthouse audit
└─ Check metrics meet targets
└─ Document results

TOTAL: ~50 minutes
```

---

## Verification Checklist

After each fix, run:
```bash
pnpm dev
# Open http://localhost:3000/
# Check in DevTools Performance tab
```

**Fix #1 (Image):**
- [ ] Image loads faster visually
- [ ] No layout shift
- [ ] FCP unchanged (~1.0s)
- [ ] LCP improved (target: <2.5s)

**Fix #2 (Parallax):**
- [ ] Blur animations still visible on scroll
- [ ] No jank when scrolling
- [ ] TBT improved (target: <200ms)
- [ ] Haptic feedback still works (if available)

**Fix #3 (Suspense):**
- [ ] Hero loads immediately
- [ ] Other sections load as user scrolls
- [ ] Skeleton shows while loading
- [ ] TTI improved (target: <3.5s)

---

## Expected Final Results

```
METRICS AFTER ALL FIXES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FCP:    0.9s      ✅ (was 1.0s)
LCP:    2.2s      ✅ (was 15.4s) ← 7x faster!
TBT:    150ms     ✅ (was 6550ms) ← 44x faster!
CLS:    0.08      ✅ (was 0.149)
TTI:    3.2s      ✅ (was 15.7s) ← 5x faster!

LIGHTHOUSE SCORE:  85-95/100
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Troubleshooting

**Q: After removing parallax, blur is gone?**  
A: Blur divs are still there, just static. They should be visible.

**Q: Image not loading after WebP conversion?**  
A: Make sure file is in `public/` folder with correct name.

**Q: Suspense not working?**  
A: Check if components are async. If not, wrap in dynamic():
```tsx
import dynamic from 'next/dynamic';
const HowItWorks = dynamic(() => import('@/components/how-it-works'));
```

**Q: Lighthouse still showing slow?**  
A: Make sure running production build:
```bash
pnpm build
pnpm start
```

---

## Next: Run Audit

Once all 3 fixes are done:

```bash
# Start dev server
pnpm dev

# In another terminal, run audit
node audit-landing-page.js
```

Compare results to baseline in `SESSION_15_LIGHTHOUSE_AUDIT.md`

---

## Time Budget

| Task | Time | Priority |
|------|------|----------|
| Image optimization | 15 min | 🔴 P0 |
| Remove parallax | 5 min | 🔴 P0 |
| Add Suspense | 20 min | 🟡 P0 |
| Run audit | 5 min | 🟡 P1 |
| Document | 10 min | 🟢 P2 |
| **TOTAL** | **~55 min** | - |

**Ready to start? Pick Fix #1 first! ⚡**

