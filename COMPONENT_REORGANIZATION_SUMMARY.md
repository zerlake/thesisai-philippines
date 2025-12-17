# Component Reorganization Summary

## Objective
Move all landing page components from `src/components/` to `src/components/landing/` and remove duplicates.

## Files to Move (Copy to landing/ folder and update imports)

### Files in Root Components Folder that Belong in Landing:
1. **`src/components/how-it-works-section.tsx`** → `src/components/landing/how-it-works-section-updated.tsx` ✅ DONE
2. **`src/components/thesis-structure-section.tsx`** → Need to copy to landing/
3. **`src/components/faq-section.tsx`** → Need to copy to landing/
4. **`src/components/landing-header.tsx`** → Already has "landing-" prefix, may already be in landing/
5. **`src/components/landing-footer.tsx`** → Already in landing/ ✅
6. **`src/components/premium-landing-hero.tsx`** → Need to copy to landing/
7. **`src/components/ai-toolkit-section.tsx`** → Need to copy to landing/

## Files to Delete (Duplicates)

### Already Identified:
1. **`src/components/landing/how-it-works-section.tsx`** ❌ DELETE (duplicate of root version)

## Import Updates Required

### Updated Files:
- **`src/components/landing/deferred-sections.tsx`** ✅ DONE
  - HowItWorksSection → `@/components/landing/how-it-works-section-updated`
  - ThesisStructureSection → `@/components/landing/thesis-structure-section`
  - AiToolkitSection → `@/components/landing/ai-toolkit-section`
  - FaqSection → `@/components/landing/faq-section`

### Files Still Needing Updates:
- **`src/app/page.tsx`** - Check for any landing component imports
- **`src/app/features/page.tsx`** - May use FeaturesSection
- Any other files importing these landing components

## Current Status

✅ **Completed:**
- Created `how-it-works-section-updated.tsx` in landing/ folder
- Updated deferred-sections.tsx import paths
- Added correct import path adjustments (e.g., `./ui/button` → `../ui/button`)

⏳ **Still TODO:**
1. Copy remaining files to landing/ folder
2. Delete duplicate landing/how-it-works-section.tsx
3. Delete old root component files (once confirmed landing versions work)
4. Search all files for remaining imports of moved components
5. Update those imports to point to landing/ folder
6. Final verification build and test

## Next Steps

1. Copy these files to `src/components/landing/`:
   - thesis-structure-section.tsx
   - faq-section.tsx
   - ai-toolkit-section.tsx
   - premium-landing-hero.tsx (if not already in landing/)

2. Update all import paths in those copied files (adjust relative paths)

3. Search codebase for all imports and update:
   ```bash
   grep -r "from.*how-it-works-section" src/
   grep -r "from.*thesis-structure-section" src/
   grep -r "from.*faq-section" src/
   grep -r "from.*ai-toolkit-section" src/
   ```

4. Delete old root component files after confirming landing versions work

5. Delete duplicate `src/components/landing/how-it-works-section.tsx`

6. Rebuild and test
