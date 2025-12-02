# Phase 2 Session 17 Quick Start

**TL;DR:** Animation deferral working, Speed Index improved 27s, but TBT still 9s. Need bundle analysis next.

---

## 📊 Current Status

```
Performance: 37/100 🔴
FCP: 1.5s ⚠️
LCP: 10.2s 🔴 (target: <4s)
TBT: 9,070ms 🔴 (target: <2s)
Speed Index: 5.3s ✅ (was 32s!)
CLS: 0.0 ✅
```

---

## ✅ What Just Got Fixed

1. **Animation Deferral** - Features section animations now wait until visible
   - File: `src/components/landing/features-section.tsx`
   - Pattern: `{inView && <AnimatePresence>...`
   
2. **Speed Index** - Dropped from 32s → 5.3s (27-second improvement!)
   - Users see content much faster
   - Animations don't block initial render

---

## 🔴 What Still Needs Work

1. **Total Blocking Time** - 9,070ms (need < 2,000ms)
   - Framer Motion is heavy
   - Likely needs dynamic import or removal
   - Profile with DevTools to confirm

2. **Largest Contentful Paint** - 10.2s (need < 4s)
   - Hero image loading delay
   - May need image format optimization or priority hints

---

## 🎯 Priority Tasks (In Order)

### P0 - This Week
- [ ] Run: `ANALYZE=true pnpm build`
- [ ] Check bundle for large chunks
- [ ] Identify non-Framer Motion JS bottlenecks
- [ ] Consider removing Framer Motion from landing page

### P1 - Next Week
- [ ] Implement Framer Motion lazy loading
- [ ] Code-split landing page components
- [ ] Optimize hero image (WebP/AVIF)

---

## 🛠️ Commands for Phase 2

```bash
# Analyze bundle size
ANALYZE=true pnpm build

# Start dev server
pnpm dev

# Run Lighthouse
npx lighthouse http://localhost:3000 --output=json

# Check which files import Framer Motion
grep -r "framer-motion" src/

# Profile performance (then use Chrome DevTools Performance tab)
# Open localhost:3000 → DevTools → Performance → Record page load
```

---

## 📈 Success Metrics

| Metric | Current | Target | Effort |
|--------|---------|--------|---------|
| TBT | 9s | <2s | 🔴 Hard |
| LCP | 10.2s | <4s | 🟡 Medium |
| Perf Score | 37 | 60+ | 🟡 Medium |

---

## 💡 Key Insights

1. **Speed Index hugely improved** - viewport deferral working great
2. **Animation deferral doesn't fix TBT** - JS execution still happens at import time
3. **Framer Motion is the bottleneck** - 7+ components using it on landing
4. **Bundle analysis is critical** - need data-driven optimization

---

## 📍 Files to Focus On

**High Priority:**
- `src/components/landing/hero-section.tsx` - Also has Framer Motion
- `src/components/landing/features-section.tsx` - Just modified ✅
- `package.json` - Check dependencies for optimization opportunities

**Medium Priority:**
- `src/components/landing/deferred-sections.tsx` - Load below-fold components
- `src/app/page.tsx` - Landing page root

---

## 🧪 Testing Strategy

1. **Build & Audit**
   ```bash
   pnpm build
   npx lighthouse http://localhost:3000 --output=json --output-path=phase2-test-X.json
   ```

2. **Compare Metrics**
   - TBT target: 9,070 → < 6,000 (first step)
   - LCP target: 10.2 → < 6 seconds (easier with image optimization)

3. **Profile JavaScript**
   - DevTools → Performance tab
   - Record page load
   - Look for tasks > 50ms
   - Identify which functions block

---

## 🚀 Quick Wins (If Time Allows)

1. **Unused imports removal** - Check all files for dead code
2. **CSS minification** - Ensure Tailwind is fully optimized
3. **Image preloading** - Already done in S16
4. **Font optimization** - Already done in S16

---

## ❓ Questions to Answer

1. Is Framer Motion the only JS bottleneck?
2. What's the actual JS that's executing during TBT?
3. Can we replace Framer Motion with lighter library?
4. Is any third-party code (Puter, analytics) blocking?

---

**Next Session:** Bundle analysis & Framer Motion optimization  
**Estimated Time:** 2-3 hours  
**Difficulty:** Medium  

