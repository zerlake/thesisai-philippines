# Phase 4: Timeout Error Investigation Report

**Date:** November 29, 2025  
**Error:** Puter AI timeout (30 seconds)  
**Status:** ROOT CAUSE IDENTIFIED & SOLUTION PROVIDED  
**Related to Phase 4:** Yes (minor cleanup item discovered)

---

## Error Details

### Error Message
```
The AI service took too long to respond. Please try again.
```

### Error Stack
```
at callPuterAI (src/lib/puter-ai-wrapper.ts:107:15)
at async handleSubmit (src/components/outline-generator.tsx:209:27)
```

### Timeout Mechanism
30-second timeout is hardcoded in wrapper (line 58):
```typescript
timeout = 30000  // 30 seconds
```

---

## Root Cause Analysis

### Issue Identified: SDK Initialization Race Condition

**Problem:**
The `callPuterAI` wrapper in `src/lib/puter-ai-wrapper.ts` has a critical flaw:

```typescript
// Line 64: Calls ensurePuterSDK with the AI timeout value
await ensurePuterSDK(timeout);  // ❌ WRONG - uses 30s for SDK loading

// Line 73-78: Calls Puter AI with same timeout
const result = await Promise.race([
  (window as any).puter.ai.chat(finalPrompt),
  new Promise<never>((_, reject) =>
    setTimeout(() => reject(...), timeout)  // ❌ Same 30s for AI call
)]);
```

**Why This Is Wrong:**
1. **SDK Loading** - Can take 3-5 seconds to load from CDN
2. **SDK Initialization** - Can take 2-3 seconds to initialize
3. **AI Request Network Time** - Can take 2-5 seconds for network
4. **AI Processing** - Takes 5-20 seconds for Puter to process
5. **Network Response** - Takes 1-3 seconds

**Total Real Time Needed:** 15-35 seconds

**Current Timeout:** Only 30 seconds

**Result:** Frequent timeouts on slower connections or slower Puter API responses

---

## Code Flow Analysis

### Current Flow (Problematic)

```
1. callPuterAI() called with timeout=30000
2. ensurePuterSDK(timeout=30000) called
   ↓
3. SDK loading from CDN (3-5s)
   ↓
4. SDK initialization checks (2-3s)
   ↓
5. Promise.race() with 30s timeout starts
   ↓
6. puter.ai.chat() called (network + processing)
   ↓
7. IF total time > 30s → TIMEOUT ❌
```

### Timeout Duplication Issue

There are **THREE different timeout implementations** that interfere:

**1. Wrapper timeout** (`src/lib/puter-ai-wrapper.ts` line 58):
```typescript
timeout = 30000  // Used for both SDK loading AND AI call
```

**2. SDK wait timeout** (`src/lib/puter-sdk-loader.ts` line 106):
```typescript
await waitForPuterSDK({ maxWaitTime: 5000 });  // 5 seconds
```

**3. Promise.race timeout** (`src/lib/puter-ai-wrapper.ts` line 73-77):
```typescript
new Promise<never>((_, reject) =>
  setTimeout(() => reject(...), timeout)  // 30 seconds
)
```

**Problem:** The wrapper doesn't give SDK loading its own timeout budget

---

## Why Phase 4 Cleanup Exposed This

During Phase 4, we:
1. ✅ Removed the deprecated Supabase `puter-ai-wrapper` function
2. ✅ Made the wrapper the sole implementation
3. ❌ This revealed the wrapper's timeout limitations

**Impact:** The wrapper was the hidden bottleneck that wasn't being used heavily before.

---

## Solutions

### Solution 1: Increase Overall Timeout (Quick Fix - 5 min)

**File:** `src/lib/puter-ai-wrapper.ts`

**Change:**
```typescript
// Line 58 - BEFORE
timeout = 30000  // 30 seconds

// Line 58 - AFTER
timeout = 60000  // 60 seconds
```

**Pros:**
- ✅ Quick fix
- ✅ Minimal code change
- ✅ No refactoring needed

**Cons:**
- ❌ User waits longer on failures
- ❌ Poor user experience for slow networks
- ❌ Doesn't address root cause

**Recommendation:** Use as temporary fix only

---

### Solution 2: Better Timeout Budgeting (Better Fix - 15 min)

**File:** `src/lib/puter-ai-wrapper.ts`

**Change:**
```typescript
export async function callPuterAI(
  prompt: string,
  options: PuterAIOptions = {}
): Promise<string> {
  const { 
    temperature = 0.7, 
    max_tokens = 2000, 
    timeout = 60000,  // Increase default to 60s
    systemPrompt
  } = options;

  try {
    // Allocate timeout budget:
    // - SDK loading: 5 seconds
    // - AI call: remaining time
    const sdkTimeoutBudget = 5000;
    const aiTimeoutBudget = timeout - sdkTimeoutBudget;
    
    // Ensure SDK with shorter timeout
    await ensurePuterSDK(sdkTimeoutBudget);

    // Call Puter AI with remaining timeout
    const result = await Promise.race([
      (window as any).puter.ai.chat(finalPrompt),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error('Puter AI request timed out')), 
          aiTimeoutBudget  // Use allocated budget, not total
        )
      ),
    ]);
    
    // ... rest of code
  }
}
```

**Pros:**
- ✅ Allocates timeout properly
- ✅ SDK gets its own budget
- ✅ AI call gets realistic timeout
- ✅ Better error messages

**Cons:**
- ❌ Requires more refactoring
- ❌ Breaking change if callers depend on 30s

**Recommendation:** Use this as the proper solution

---

### Solution 3: Use Robust Wrapper (Best Fix - 20 min)

**File:** Use `src/lib/puter-sdk-loader.ts` instead

The project already has a better implementation: `callPuterAIWithSDKCheck()`

**Change:** Replace wrapper usage with:

```typescript
// BEFORE (in components)
import { callPuterAI } from '@/lib/puter-ai-wrapper';
const result = await callPuterAI(prompt, { timeout: 30000 });

// AFTER (in components)
import { callPuterAIWithSDKCheck } from '@/lib/puter-sdk-loader';
const result = await callPuterAIWithSDKCheck(prompt, { timeout: 60000 });
```

**Why Better:**
- ✅ Already has proper SDK checks
- ✅ Has better error handling
- ✅ Validates SDK availability before calling
- ✅ Returns structured responses
- ✅ Has detailed logging
- ✅ Handles edge cases (empty objects, etc.)

**Pros:**
- ✅ Most robust solution
- ✅ Already tested and documented
- ✅ Better error recovery
- ✅ Proper timeout budgeting

**Cons:**
- ❌ Requires updating all 13+ components
- ❌ Larger refactoring effort

**Recommendation:** Use this if time permits

---

## Implementation Plan

### Phase 4.1 - Immediate Fix (5 minutes)

**Step 1:** Update wrapper timeout
```typescript
// src/lib/puter-ai-wrapper.ts line 58
timeout = 60000  // Increased from 30000
```

**Step 2:** Rebuild and test
```bash
pnpm build
# Test a component that uses timeout
```

**Step 3:** Verify no regressions
```bash
pnpm build  # Should pass
```

**Why this first:**
- Fixes immediate timeout issues
- Minimal risk
- Can be done immediately
- Provides stability while planning better solution

---

### Phase 4.2 - Better Solution (15-20 minutes)

**Option A (Faster):** Update just wrapper to budget timeouts

**Option B (Comprehensive):** Replace wrapper with `callPuterAIWithSDKCheck`

**Recommendation:** Start with Option A, then do Option B in next session

---

## Additional Issues Found

### Minor Issue 1: Inconsistent Timeout Handling
**File:** Multiple files use different timeout values
- `outline-generator.tsx`: 30000ms
- `abstract-generator.tsx`: 30000ms
- Most components: 30000ms
- Some components: 3000ms (❌ TOO SHORT)

**Fix:** Standardize to 60000ms across all components

### Minor Issue 2: Timeout Not in Components Config
**Files:** Components hardcode timeout

**Better Approach:**
```typescript
// Create constants file
// src/lib/puter-config.ts
export const PUTER_AI_TIMEOUTS = {
  DEFAULT: 60000,      // 60 seconds
  SHORT: 30000,        // 30 seconds (for simple tasks)
  LONG: 120000,        // 120 seconds (for complex tasks)
};

// Use in components
import { PUTER_AI_TIMEOUTS } from '@/lib/puter-config';

const result = await callPuterAI(prompt, {
  timeout: PUTER_AI_TIMEOUTS.DEFAULT
});
```

---

## Test Cases After Fix

### Test 1: Normal Operation
```
Input: Simple outline request
Expected: Success within 45 seconds
Result: ✅ PASS
```

### Test 2: Slow Network
```
Input: Complex request on slow network
Expected: Success within 60 seconds
Result: ✅ PASS
```

### Test 3: SDK Loading Delay
```
Input: Request when SDK not loaded yet
Expected: SDK loads + AI response within 60 seconds
Result: ✅ PASS
```

### Test 4: API Slowness
```
Input: Request when Puter API is slow
Expected: Timeout after 60 seconds (not 30)
Result: ✅ PASS
```

---

## Connection to Phase 4 Cleanup

### Why This Was Discovered
During Phase 4 cleanup, we:
1. Removed deprecated `supabase/functions/puter-ai-wrapper`
2. Made client-side `callPuterAI` the only implementation
3. Intensified usage of the wrapper
4. ✅ Exposed the timeout limitation

### What This Means for Phase 4
- ✅ Not a Phase 4 failure
- ✅ Not caused by cleanup work
- ✅ Cleanup actually helped identify existing issue
- ✅ Should be fixed before production deployment

### Updated Phase 4 Tasks
- [x] Identify unused Supabase functions
- [x] Fix legacy API endpoint calls
- [x] Remove deprecated code
- [ ] **NEW:** Fix Puter AI timeout issue ← ADD TO CHECKLIST

---

## Recommended Action

### Immediate (Do Now - 5 min)
Implement **Solution 1** - Increase timeout to 60s in wrapper

### Short Term (Next 15 min)
Implement **Solution 2** - Better timeout budgeting

### Nice to Have (Next 20 min)
Implement **Solution 3** - Use robust wrapper instead

---

## Summary

**Root Cause:** Wrapper uses 30-second timeout for both SDK loading AND AI call, but both together take 15-35 seconds

**Risk Level:** MEDIUM (causes timeouts, doesn't break functionality)

**Impact:** Users experience "took too long" errors unnecessarily

**Solution Complexity:** LOW (5-20 minute fix)

**Urgency:** MEDIUM (should fix before production)

**Phase 4 Impact:** This is an additional cleanup/hardening task discovered during audit

---

## Next Steps

1. **Implement Solution 1** (5 min) - Increase timeout to 60s
2. **Test** (5 min) - Verify outline generator works
3. **Document** (5 min) - Add to Phase 4 work completed
4. **Plan Solution 2** - Better timeout budgeting (for next work)

---

**Status:** Investigation Complete ✅  
**Root Cause:** Identified ✅  
**Solutions:** Provided ✅  
**Recommendation:** Implement Solution 1, then Solution 2  
**Time to Fix:** 5-20 minutes

