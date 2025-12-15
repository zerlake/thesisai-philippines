# Troubleshooting Phase Mismatch

## Problem
Phase 1 (doc-1) still showing Phase 3 guide content.

## Added Detailed Logging

Restart dev server and open browser console (F12), then navigate to doc-1. You should see these logs in order:

### Expected Console Output

```
[NewDocumentPage] Processing documentId: doc-1
[NewDocumentPage] isUUID check: false matches UUID pattern: false
[NewDocumentPage] Not a UUID - checking demo doc mappings
[NewDocumentPage] Matched doc-1 -> conceptualize
[NewDocumentPage] Setting phase state to: conceptualize

[Editor] Rendering with phase prop: conceptualize documentId: doc-1 type: string
[Editor] useEffect - Phase prop received: conceptualize for documentId: doc-1

[PhaseAwarenessGuide] Rendering with phase: conceptualize type: string
[PhaseAwarenessGuide] phaseContent keys: ['conceptualize', 'research', 'write', 'submit']
[PhaseAwarenessGuide] content for phase: conceptualize = Phase 1: Conceptualize - Research Planning
[PhaseAwarenessGuide] phaseIndex: 1 phase value: conceptualize
```

## What to Check

### 1. Phase Detection
- [ ] "Matched doc-1 -> conceptualize" appears in console
- [ ] If not, check what documentId is being passed

### 2. Phase Propagation
- [ ] "[Editor] Rendering with phase prop: conceptualize" appears
- [ ] If it shows "write" instead, phase isn't being set correctly

### 3. Guide Rendering
- [ ] "[PhaseAwarenessGuide] content for phase: conceptualize = Phase 1..." appears
- [ ] If it shows "Phase 3: Write & Refine" instead, the phase object isn't matching

### 4. Visual Check
- [ ] Guide background is BLUE (not purple)
- [ ] Title says "Phase 1: Conceptualize - Research Planning"
- [ ] Badge says "You're here!"
- [ ] Progress bar shows: █░░░ (1 of 4)
- [ ] Duration shows: ~2-4 weeks

## If Still Wrong

Run this in browser console to manually test:
```javascript
// Check what phase value is stored
const phaseGuideElement = document.querySelector('[class*="bg-blue"]');
console.log('Blue background found:', !!phaseGuideElement);

// Check the guide title
const titleElement = document.querySelector('h2');
console.log('Guide title:', titleElement?.textContent);
```

## Next Steps

1. Restart dev server: `pnpm dev`
2. Navigate to: `http://localhost:3001/drafts/doc-1`
3. Open browser console (F12)
4. Check logs match expected output
5. Verify visual appearance (color, title, progress bar)
6. Report back with console logs if still showing Phase 3

---

The logging will help identify exactly where the phase value is being lost or not set correctly.
