# Puter Paraphraser - Debugging Guide

## Issue: "Paraphrasing error: {}"

If you see an empty error object `{}` in the console, this guide will help you diagnose and fix the issue.

## Step 1: Check Browser Console (F12)

Open your browser's developer tools and look for detailed logs:

### What To Look For:

```javascript
// If you see these logs, Puter is working:
✓ "Calling Puter AI with mode: Paraphrase"
✓ "Puter AI returned result: { ... }"
✓ "Puter response type: string" or "object"

// If you see these, there's an issue:
✗ "Puter SDK not found on window object"
✗ "Puter AI service not found"
✗ "Chat API error:"
✗ "Failed to extract text"
```

### Copy the Full Error Details

When you see "Paraphrasing error details:", expand the object and note:
```javascript
{
  error: {},           // The actual error
  message: "...",      // Error message
  status: ...,         // HTTP status code
  code: "...",         // Error code (like ETIMEDOUT)
  keys: [...]          // What properties the error has
}
```

## Step 2: Common Issues & Solutions

### Issue 1: "Puter SDK not found on window object"

**Cause**: Puter SDK hasn't loaded yet

**Solutions**:
1. **Reload the page** - Give Puter time to load
2. **Check Puter is installed** - In console, type:
   ```javascript
   typeof window.puter !== 'undefined' ? '✓ Loaded' : '✗ Not loaded'
   ```
3. **Check browser console** - Look for Puter loading errors
4. **Clear cache** - `Ctrl+Shift+Delete` → Clear cache → Reload

### Issue 2: "Puter AI service not found"

**Cause**: Puter loaded but `puter.ai` doesn't exist

**Solutions**:
1. **Puter not fully initialized** - Wait a few seconds and try again
2. **Check what's in Puter** - In console:
   ```javascript
   console.log('Puter keys:', Object.keys(window.puter || {}))
   ```
3. **Reload page** - Fresh load often fixes this

### Issue 3: "Chat API error"

**Cause**: Puter API returned an error

**Check the full error**:
```javascript
// In console, you'll see detailed error info
// Note the code and message
```

**Common error codes**:
- `401` = Authentication failed (need to sign in)
- `429` = Rate limited (wait a moment)
- `500+` = Server error (Puter service down)
- `ETIMEDOUT` = Request took too long
- `ECONNREFUSED` = Can't connect to Puter

### Issue 4: "Failed to extract text"

**Cause**: Response format not recognized

**What to check**:
1. Look for "Puter response:" log
2. Check if response is one of these formats:
   ```javascript
   // Expected formats:
   - String: "..." 
   - Object with choices: { choices: [{ message: { content: "..." } }] }
   - Object with text: { text: "..." }
   - Object with response: { response: "..." }
   ```
3. If it's `{}` (empty object), Puter returned invalid response

## Step 3: Enable Debug Logging

The component now includes detailed logging. Check console for:

```
┌─ SDK Availability Check
├─ Calling Puter AI with mode: [MODE]
├─ Puter response type: [TYPE]
├─ Puter response: [RESPONSE]
├─ Puter response type: string/object
├─ Puter AI returned result: [RESULT]
├─ Paraphrasing error details: [ERROR]
└─ Final error message: [MESSAGE]
```

## Step 4: Test Puter Directly

Test if Puter API works independently:

```javascript
// 1. Check if Puter is ready
const ready = window.puter?.ai?.chat ? true : false;
console.log('Puter ready:', ready);

// 2. Make a test request
if (ready) {
  window.puter.ai.chat({
    prompt: 'Say hello',
    max_tokens: 10
  }).then(result => {
    console.log('✓ Response:', result);
  }).catch(error => {
    console.error('✗ Error:', error);
  });
}
```

## Step 5: Check Network Tab

1. Open DevTools → Network tab
2. Try to paraphrase
3. Look for requests to Puter API
4. Check response:
   - Status code (200 = good, 4xx/5xx = error)
   - Response body (what did Puter return?)

## Step 6: Authentication Check

```javascript
// Check if you're authenticated with Puter
window.puter?.auth?.getUser().then(user => {
  if (user && user.username) {
    console.log('✓ Authenticated as:', user.username);
  } else {
    console.error('✗ Not authenticated');
  }
}).catch(error => {
  console.error('✗ Auth check failed:', error);
});
```

## Step 7: Response Format Test

If you get an empty response `{}`, try this:

```javascript
// Log what Puter actually returns
const testResponse = {};  // This would be what Puter returned

// Check which format it matches
const formats = {
  isString: typeof testResponse === 'string',
  hasChoices: !!testResponse.choices?.[0]?.message?.content,
  hasResponse: !!testResponse.response,
  hasText: !!testResponse.text,
  hasContent: !!testResponse.content,
  hasAnswer: !!testResponse.answer,
  hasResult: !!testResponse.result,
  hasData: !!testResponse.data,
  hasOutput: !!testResponse.output,
  isEmpty: Object.keys(testResponse).length === 0
};

console.log('Response format check:', formats);
```

## Troubleshooting Flowchart

```
User clicks "Rewrite Text"
        ↓
  Is text empty? → YES → Error: "Please enter text"
        ↓ NO
  Is text > 8000 chars? → YES → Error: "Text too long"
        ↓ NO
  Is Puter loaded? → NO → Error: "SDK not available"
        ↓ YES
  Is Puter.ai available? → NO → Error: "AI not available"
        ↓ YES
  Call puter.ai.chat() 
        ↓
  Timeout after 30s? → YES → Error: "Request timeout"
        ↓ NO
  Got response? → NO → Error: "Network error"
        ↓ YES
  Can extract text? → NO → Error: "Empty response"
        ↓ YES
  Show result ✓
```

## Error Messages Reference

| Error Message | Likely Cause | Fix |
|---------------|-------------|-----|
| "Please enter some text" | Empty input | Add text |
| "Text is too long" | > 8000 chars | Use shorter text |
| "SDK is not available" | Puter not loaded | Reload page |
| "AI service is not available" | puter.ai missing | Wait, reload |
| "Chat is not available" | puter.ai.chat missing | Reload, check auth |
| "Request timeout" | API took > 30s | Try again, check connection |
| "Request failed" | Network error | Check internet |
| "Empty response" | Invalid response format | Try again later |
| "Authentication failed" | 401 status | Re-sign in |
| "Rate limited" | 429 status | Wait a moment |
| "Service unavailable" | 500+ status | Wait, try later |

## Performance Monitoring

Expected times:
```
Text length | Expected time | If slower = issue
< 500 chars | 2-5 sec      | Network slow or Puter slow
500-2000    | 5-10 sec     | Normal
2000-8000   | 10-15 sec    | Normal
```

If consistently slower:
- Check internet connection
- Check browser performance (CPU/memory)
- Try different time of day (Puter may be busy)

## Network Analysis

1. **Open Network tab** (F12 → Network)
2. **Filter** to show XHR/Fetch requests
3. **Look for** requests to `api.puter.com` or similar
4. **Check response**:
   - Green = 200 OK (good)
   - Yellow = 400s (client error)
   - Red = 500s (server error)

## Browser Compatibility

Make sure you're using a supported browser:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

If on unsupported browser, upgrade or use different browser.

## Cache Issues

If same error persists:

1. **Hard refresh**: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. **Clear site data**:
   - Settings → Privacy → Cookies and site data
   - Search for your domain
   - Delete all data
3. **Incognito mode**: Test in private/incognito window
4. **Different browser**: Test in Chrome, Firefox, Safari, Edge

## Still Stuck?

Collect this info and seek help:

```javascript
// Run in browser console, copy output
{
  userAgent: navigator.userAgent,
  puterAvailable: typeof window.puter !== 'undefined',
  puterAIAvailable: typeof window.puter?.ai !== 'undefined',
  puterChatAvailable: typeof window.puter?.ai?.chat === 'function',
  location: window.location.href,
  localStorage_keys: Object.keys(localStorage),
  sessionStorage_keys: Object.keys(sessionStorage)
}
```

## Console Commands Reference

```javascript
// Check Puter status
window.puter ? '✓ Loaded' : '✗ Not loaded'

// Check AI availability
window.puter?.ai?.chat ? '✓ AI ready' : '✗ AI not ready'

// Check auth
window.puter?.auth?.getUser().then(u => console.log('User:', u))

// Test API
window.puter.ai.chat({
  prompt: 'Hello',
  max_tokens: 10
}).then(r => console.log('OK:', r)).catch(e => console.error('Error:', e))

// Check response format
const result = {}; // Replace with actual response
console.log({
  type: typeof result,
  keys: Object.keys(result),
  hasText: !!result.text,
  hasContent: !!result.content,
  hasResponse: !!result.response
})
```

## Next Steps

Once you identify the issue:

1. **SDK loading issue** → Reload page, clear cache
2. **Authentication issue** → Sign out and sign in
3. **Network issue** → Check internet, try different network
4. **Puter API issue** → Wait for Puter to recover
5. **Response parsing issue** → Note exact response format

Document the exact error and response format if seeking help.
