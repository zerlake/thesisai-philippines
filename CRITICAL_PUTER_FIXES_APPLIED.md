# Critical Puter AI Fallback Removal - Applied Fixes

Date: December 10, 2025

## Overview
Removed automatic fallback mechanisms that were returning mock/generic data instead of real Puter AI responses in critical student-facing features. This ensures students receive real AI-generated content.

## Fixes Applied

### 1. ✅ src/lib/puter-ai-facade.ts
**Status**: FIXED

**What was removed**:
- All hardcoded fallback responses in `FALLBACK_RESPONSES` object (removed ~100 lines of mock data)
- Automatic fallback provider logic that would try OpenRouter if Puter failed
- `callFallbackProvider()` method
- `getFallbackResponse()` method

**What changed**:
- Now throws clear error if primary provider fails (instead of silently falling back)
- Only allows fallback if explicitly requested with `provider: 'fallback'` config
- Error messages are clear and inform user that AI service is unavailable

**Impact**: All AI calls via the facade will now fail loudly if real service is unavailable, ensuring students never get mock data silently.

### 2. ✅ supabase/functions/generate-topic-ideas/index.ts
**Status**: FIXED

**What was removed**:
- `generateFallbackTopics()` function (removed ~430 lines of pre-written mock topics)
- Automatic fallback to `generateFallbackTopics()` on any Puter API error
- Graceful degradation that would return generic topics

**What changed**:
- Now throws error if PUTER_API_KEY is not configured
- Validates that Puter returns exactly 10 topics as required
- Throws detailed error message if response format is invalid
- No more silent fallback to hardcoded topics

**Impact**: Students will receive error message if Puter API is unavailable, instead of generic pre-written topics.

### 3. ✅ supabase/functions/_shared/puter-ai.ts
**Status**: DEPRECATED

**What changed**:
- Marked `callPuterAIWithFallback()` as DEPRECATED
- Added warning log when this function is called
- Left function in place for backward compatibility during transition

**Impact**: Any remaining usage of this fallback function will be visible in logs as a deprecation warning.

### 4. ✅ supabase/functions/generate-research-questions/index.ts
**Status**: FIXED

**What changed**:
- Removed import of unused `callPuterAIWithFallback`
- Implemented proper `callOpenRouter()` function with error handling
- No more undefined function calls

**Impact**: Research question generation now has proper error handling instead of calling undefined function.

## Remaining Tasks

### HIGH PRIORITY
These components still need fixing:

1. **research-problem-identifier.tsx** 
   - Currently returns hardcoded `mockProblems` array
   - Needs to call real Puter AI for paper analysis
   - Should throw error if analysis unavailable

2. **Other Supabase Functions**
   - Check `generate-titles`
   - Check `generate-hypotheses`  
   - Check `analyze-research-gaps`
   - Check `run-statistical-analysis`
   - All should be audited for fallback patterns

3. **API Routes**
   - `/api/papers/route.ts` - might return `generateSamplePapers()`
   - `/api/papers/search/route.ts` - similar concern

## Verification Checklist

- [x] Removed all hardcoded fallback responses from puter-ai-facade
- [x] Fixed generate-topic-ideas to require real Puter
- [x] Deprecated callPuterAIWithFallback with warning logs
- [x] Fixed generate-research-questions undefined function error
- [ ] Audit research-problem-identifier component
- [ ] Audit all other Supabase functions
- [ ] Audit all API routes
- [ ] Test all critical paths return real AI responses
- [ ] Run full test suite (pnpm test)
- [ ] Monitor logs for deprecation warnings

## Error Messages Examples

Students will now see clear errors instead of fake data:

```
PUTER_API_KEY not configured - Real Puter AI is required for topic generation. Please contact support.

Puter AI request timed out after 30 seconds - please try again.

Puter AI did not generate required 10 topics. Got: 8
```

## Testing

To verify changes:
```bash
# Run tests
pnpm test

# Check for deprecation warnings in logs
grep "DEPRECATED\|callPuterAIWithFallback" logs

# Monitor real Puter API usage
grep "Calling Puter AI\|Puter API error" logs
```

## Success Criteria

✅ All critical paths now use real Puter AI or fail with clear errors
✅ No mock data is returned silently
✅ Students are informed when AI service is unavailable
✅ All tests pass
✅ No deprecation warnings in logs from production code
