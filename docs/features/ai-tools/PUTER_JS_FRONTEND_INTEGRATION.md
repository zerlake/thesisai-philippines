# Puter.js Frontend Integration Guide

## Overview

The grammar-check feature now uses **Puter.js directly from the browser** instead of calling a Supabase Edge Function. This is a cleaner, simpler approach that leverages Puter.js's core design principle: **no API keys required**.

### Key Benefits
- ✅ No backend infrastructure needed for AI calls
- ✅ No API keys to manage or configure
- ✅ Direct browser-to-Puter communication
- ✅ User authentication handled by Puter.js
- ✅ Results still saved to Supabase database
- ✅ Simpler error handling and diagnostics

## Architecture

### Before (Supabase Edge Function Approach)
```
Browser → Supabase Function → Puter AI API
          (needs PUTER_API_KEY env var)
```

### After (Direct Puter.js Approach)
```
Browser → Puter.js SDK → Puter AI
          (no keys needed, uses browser auth)
```

## How It Works

### 1. Load Puter.js
```typescript
import { loadPuterSDK } from '@/lib/puter-sdk';

const puter = await loadPuterSDK();
```

**What happens:**
- Script tag `<script src="https://js.puter.com/v2/"></script>` is injected
- Puter.js initializes globally in `window.puter`
- Ready to use

### 2. Authenticate User
```typescript
// Check if user is signed in
try {
  await puter.auth.getUser();
} catch {
  // Not signed in, prompt sign-in
  await puter.auth.signIn();
}
```

**What happens:**
- Shows Puter's native sign-in dialog
- User logs in with their Puter account
- Session is maintained for future calls

### 3. Call AI
```typescript
const response = await puter.ai.chat(prompt);
```

**What happens:**
- Prompt is sent to Puter AI servers
- User's Puter credentials authenticate the request
- AI generates response
- Response returned directly to browser

### 4. Save Results
```typescript
// Optionally save to your database
await supabase.from('grammar_check_history').insert({
  user_id: user.id,
  scores: analysisData.scores,
  overall_feedback: analysisData.overallFeedback,
});
```

## Implementation Details

### Files Modified/Created

**New Files:**
- `src/lib/puter-sdk.ts` - Puter.js SDK loader and helpers

**Modified Files:**
- `src/components/grammar-checker.tsx` - Uses Puter.js directly

**Removed Dependencies:**
- No longer calls `supabase.functions.invoke('grammar-check')`
- No need for `PUTER_API_KEY` environment variable
- No backend function required for AI logic

### Component Flow

**Grammar Checker Component:**
```typescript
const handleCheck = async () => {
  // 1. Validate input
  if (wordCount < MINIMUM_WORD_COUNT) return;

  // 2. Load Puter and ensure auth
  const puter = await loadPuterSDK();
  try {
    await puter.auth.getUser();
  } catch {
    await puter.auth.signIn();
  }

  // 3. Call Puter AI
  const analysisData = await analyzeWithPuterAI(inputText);

  // 4. Save to database (optional)
  await supabase.from('grammar_check_history').insert({...});

  // 5. Display results
  setResults(analysisData);
}
```

## API Reference

### `loadPuterSDK()`
Loads Puter.js SDK from CDN and returns the Puter object.

**Usage:**
```typescript
const puter = await loadPuterSDK();
```

**Returns:** `Promise<Window['puter']>`

### `ensurePuterAuth()`
Ensures user is authenticated with Puter, prompts sign-in if needed.

**Usage:**
```typescript
await ensurePuterAuth();
```

### `signInWithPuter()`
Explicitly prompt Puter sign-in dialog.

**Usage:**
```typescript
await signInWithPuter();
```

### `getPuterUser()`
Get current authenticated Puter user.

**Usage:**
```typescript
const user = await getPuterUser();
console.log(user.name, user.email);
```

### `chatWithPuter(prompt, options?)`
Send prompt to Puter AI and get response.

**Usage:**
```typescript
const response = await chatWithPuter("Analyze this text: ...");
```

### `isPuterAuthenticated()`
Check if user is currently signed in to Puter.

**Usage:**
```typescript
const isAuth = await isPuterAuthenticated();
```

## Error Handling

### Common Error Scenarios

**SDK Load Failure:**
```typescript
try {
  const puter = await loadPuterSDK();
} catch (error) {
  console.error('Failed to load Puter.js SDK:', error);
  // Fallback: show message to user
  toast.error('AI service unavailable. Please try again.');
}
```

**Auth Failure:**
```typescript
try {
  await puter.auth.getUser();
} catch (error) {
  console.error('User not authenticated:', error);
  await puter.auth.signIn();
}
```

**AI Call Failure:**
```typescript
try {
  const response = await puter.ai.chat(prompt);
} catch (error) {
  console.error('AI analysis failed:', error);
  throw new Error('Could not analyze text. Please try again.');
}
```

## Advantages Over Previous Approach

| Aspect | Supabase Function | Direct Puter.js |
|--------|------------------|-----------------|
| API Keys Required | Yes (PUTER_API_KEY) | No |
| Backend Deployment | Needed | Not needed |
| Error Logging | Complex | Simple |
| User Auth | Via JWT | Built-in Puter auth |
| Latency | Longer (function → API) | Shorter (direct) |
| Configuration | Multiple env vars | None |
| Cost | Supabase function compute | Free |

## Best Practices

### 1. Load SDK Once
```typescript
// ✅ Good - SDK is cached in window
const puter = await loadPuterSDK();
const puter2 = await loadPuterSDK(); // Returns cached instance
```

### 2. Handle Auth Gracefully
```typescript
// ✅ Good - Check auth and prompt if needed
try {
  await puter.auth.getUser();
} catch {
  await puter.auth.signIn();
}
```

### 3. Provide User Feedback
```typescript
// ✅ Good - User knows what's happening
toast.info("Authenticating with Puter...");
await puter.auth.signIn();
toast.success("Authenticated!");
```

### 4. Validate Responses
```typescript
// ✅ Good - Check response is valid
const response = await puter.ai.chat(prompt);
if (!response) throw new Error('Empty response');

const json = JSON.parse(response);
// Validate structure
```

### 5. Save Results Asynchronously
```typescript
// ✅ Good - Don't block user waiting for database save
const analysisData = await analyzeWithPuterAI(text);
setResults(analysisData); // Show results immediately

// Fire and forget
supabase.from('grammar_check_history').insert({...}).catch(err => {
  console.error('Failed to save history:', err);
});
```

## Testing

### Manual Testing
1. Open Grammar Checker page
2. Enter text (25+ words)
3. Click "Analyze Text"
4. First time will show Puter sign-in dialog
5. Sign in with Puter account
6. Analysis runs and results display
7. Results saved to database

### Browser Console Debug
```javascript
// Check if SDK loaded
console.log(window.puter);

// Check auth
puter.auth.getUser().then(u => console.log('User:', u));

// Manual AI call
puter.ai.chat("Test prompt").then(r => console.log('Response:', r));
```

### Supabase Logs
```bash
# Still shows database saves
supabase db select * from grammar_check_history limit 5;
```

## Migration from Supabase Function

If you have other functions still calling Puter via Supabase Edge Functions, migrate them using the same pattern:

1. Create/update component using `loadPuterSDK()`
2. Call `puter.ai.chat()` directly
3. Save results to database if needed
4. Remove Supabase function (or keep for other purposes)
5. Remove `PUTER_API_KEY` from environment

## Troubleshooting

### Issue: "Puter AI not available"
**Cause:** SDK failed to load
**Solution:** Check network, verify CDN URL, check console for load errors

### Issue: "User not authenticated"
**Cause:** User closed sign-in dialog or auth failed
**Solution:** Call `puter.auth.signIn()` explicitly, check Puter service status

### Issue: Blank response from AI
**Cause:** Server issue or malformed prompt
**Solution:** Check prompt format, simplify request, check Puter service status

### Issue: JSON parse error on response
**Cause:** AI response not in expected JSON format
**Solution:** Add response validation, extract JSON from response text

## Related Documentation

- **Puter.js Docs:** https://docs.puter.com
- **Puter AI Tutorial:** https://developer.puter.com/tutorials/free-unlimited-ai-api/
- **Grammar Checker Component:** `src/components/grammar-checker.tsx`
- **Puter SDK Loader:** `src/lib/puter-sdk.ts`

## Performance Notes

- SDK loads on demand, not on page load
- Cached in memory after first load
- User auth persists across page reloads
- AI responses take 3-10 seconds typically
- No backend latency added

## Security Considerations

- ✅ No API keys exposed in code
- ✅ Auth handled by Puter's secure servers
- ✅ User credentials never sent to your backend
- ✅ All communication encrypted (HTTPS)
- ⚠️ Results saved to Supabase use your user's JWT

## Future Enhancements

1. **Streaming Responses:** Use Puter's streaming API for real-time feedback
2. **Custom Models:** Select different Puter AI models if available
3. **Caching:** Cache analyses to avoid duplicate calls
4. **Offline:** Store Puter responses locally for offline access
5. **Batch Processing:** Queue multiple analyses

---

**Last Updated:** 2025-11-28
**Status:** ✅ Live
**SDK Version:** Puter.js v2
