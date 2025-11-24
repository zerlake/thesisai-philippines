# Puter Connection Testing Guide

## Overview

This guide explains how to test whether the Puter AI service is properly connected and functional for the paraphrasing tool.

## What Is Being Tested

The integration tests verify:

1. **Puter SDK Availability** - Is the Puter JavaScript SDK loaded?
2. **Puter Authentication** - Is the user authenticated with Puter?
3. **Paraphrasing Functionality** - Does the AI service paraphrase text correctly?
4. **Text Transformation Modes** - Do all modes work (formal, simple, expand)?
5. **Error Handling** - Are errors handled gracefully?
6. **Response Formats** - Can the system handle different response formats from Puter?

## Test Files Created

### 1. Automated Test Suite
**File**: `__tests__/integration/puter-paraphraser.integration.test.ts`

**Run with**:
```bash
npm run test -- puter-paraphraser.integration.test
```

**Tests**:
- ✓ SDK loads
- ✓ User is authenticated
- ✓ Paraphrase standard text
- ✓ Make text formal
- ✓ Simplify text
- ✓ Expand text
- ✓ Error handling

### 2. Manual Browser Test
**File**: `__tests__/manual/puter-connection-test.html`

**How to Use**:
1. Open the file in a browser (or copy-paste the HTML locally)
2. Wait for initial status checks (SDK and authentication)
3. Load sample data using buttons
4. Click transformation buttons to test paraphrasing
5. View results in the output area

**No build/npm required** - Just open in browser!

## Sample Test Data

All tests use realistic academic content:

### Standard Sample
```
The rapid advancement of artificial intelligence has transformed 
multiple sectors of society, including healthcare, finance, and education...
```

### Formal Sample
```
AI is changing things. It's used in many areas like hospitals and schools...
```

### Technical Sample
```
Neural networks process data through interconnected layers of artificial neurons...
```

### Short Sample
```
Globalization has increased cultural exchange between nations through technology...
```

## Running the Tests

### Option 1: Automated Tests (Vitest)

```bash
# Run the integration test
npm run test -- puter-paraphraser.integration.test

# Run with watch mode
npm run test -- puter-paraphraser.integration.test --watch

# Run all tests
npm run test
```

**Expected Output**:
```
✓ puter-paraphraser.integration.test.ts (7)
  ✓ should have Puter SDK loaded
  ✓ should have user authenticated with Puter
  ✓ should paraphrase standard text successfully
  ✓ should make text more formal
  ✓ should simplify text successfully
  ✓ should expand text successfully
  ✓ should handle Puter service errors gracefully

Test Files  1 passed (1)
```

### Option 2: Manual Browser Test

#### Quick Setup
```bash
# Copy to local directory
cp __tests__/manual/puter-connection-test.html ~/Desktop/

# Open in browser
# Firefox: Open file dialog → Select file
# Chrome: Drag file to browser window
# Safari: Open → Select file
```

#### Or Create a Test Page in Your App
```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://puter.com/puter.js"></script>
</head>
<body>
    <!-- Copy HTML from puter-connection-test.html here -->
</body>
</html>
```

### Option 3: Real App Testing

Open `/paraphraser` page in the app and:

1. Click "Add Sample" button
2. Select paraphrasing mode
3. Click "Rewrite Text"
4. Check console for errors

## Interpreting Results

### All Tests Pass ✓

**Meaning**: Puter is fully connected and working
- SDK is loaded
- User is authenticated  
- AI service is responsive
- All transformation modes work

**Next Steps**: The paraphrasing tool is ready to use

### Some Tests Fail ✗

**Check These**:

1. **SDK Not Loaded**
   - Solution: Reload the page
   - Check: Puter script is included in HTML
   - Action: Wait 5+ seconds for SDK to load

2. **Not Authenticated**
   - Solution: Sign in with Puter
   - Action: Click Puter login button
   - Check: User account is active

3. **Paraphrasing Fails**
   - Solution: Check internet connection
   - Action: Verify Puter service is not down
   - Debug: Check browser console for error details

4. **Empty Responses**
   - Meaning: Puter API returned empty object
   - Cause: Server-side issue (our error handler catches this)
   - Solution: Retry in a few moments

### Tests Won't Run ✗

**Likely Causes**:
1. Puter SDK not loaded (check console)
2. Browser doesn't support required APIs
3. Network blocked Puter domain
4. JavaScript disabled

**Troubleshooting**:
```javascript
// Check in browser console
console.log(typeof window.puter); // Should be 'object'
console.log(window.puter.ai); // Should have 'chat' method
console.log(window.puter.auth); // Should have 'getUser' method
```

## Console Output Guide

### During Test Execution

```
✓ Puter SDK Availability
  Puter SDK loaded and AI service is available
  Duration: 234.50ms

✓ Puter Authentication  
  Authenticated as user: john_doe
  Duration: 156.20ms

✓ Paraphrase Standard Text
  Successfully paraphrased text (324 chars)
  Duration: 2345.67ms
```

### Error Messages and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `window.puter is undefined` | SDK not loaded | Reload page, wait 5s |
| `Cannot read properties of undefined (reading 'map')` | Puter server error | Error handler catches, retry |
| `Empty response from Puter` | Empty error object `{}` | Retry, check internet |
| `User not authenticated` | Not signed in | Sign in with Puter |
| `Network error connecting to AI service` | Connection issue | Check internet, retry |
| `AI service temporarily unavailable` | Puter service down | Wait and retry |

## Performance Expectations

### Response Times

| Operation | Expected Time | Note |
|-----------|---------------|------|
| SDK Load | 0-5 seconds | First time only |
| Auth Check | 100-500ms | Quick lookup |
| Paraphrase | 2-10 seconds | Depends on text length |
| Format Change | 2-10 seconds | Similar to paraphrase |

### Sample Completion Times

```
SDK Availability:    234ms   ✓ Very fast
Authentication:      156ms   ✓ Very fast
Standard Paraphrase: 2.3s    ✓ Good
Make Formal:         2.1s    ✓ Good
Simplify Text:       2.5s    ✓ Good
Expand Text:         2.8s    ✓ Good
Error Handling:      150ms   ✓ Very fast
```

## Debugging

### Enable Verbose Logging

In browser console:
```javascript
// See all Puter AI calls
localStorage.debug = 'puter:*';

// Or set in code
window.DEBUG_PUTER = true;
```

### Check Error Details

```javascript
// Run in console after error
const error = window.lastError;
console.log('Type:', error.type);           // ErrorType
console.log('Message:', error.message);     // User message
console.log('Context:', error.context);     // Debugging info
console.log('Original:', error.originalError); // Raw error
```

### Monitor Network

1. Open DevTools (F12)
2. Go to Network tab
3. Test paraphrasing
4. Look for requests to Puter API
5. Check response status and payload

### Check Puter Service Status

```bash
# In browser console
await window.puter.ai.chat({
  prompt: 'Hello, are you working?',
  max_tokens: 10
});

# If this works, Puter is up
# If it returns empty {}, Puter has issue
```

## Common Issues & Solutions

### Issue 1: "Puter SDK not loaded after 5 seconds"

**Cause**: Puter script didn't load or network is slow

**Solutions**:
- [ ] Reload page
- [ ] Check internet speed
- [ ] Check if Puter domain is blocked (firewall/proxy)
- [ ] Try from different network
- [ ] Check browser console for script errors

### Issue 2: "User not authenticated"

**Cause**: Not signed in to Puter

**Solutions**:
- [ ] Sign in with Puter account
- [ ] Check account is active
- [ ] Sign out and back in
- [ ] Clear browser cookies
- [ ] Try incognito/private mode

### Issue 3: "Empty response from Puter"

**Cause**: Puter API returned empty object `{}`

**Solutions**:
- [ ] Wait a moment and retry
- [ ] Check Puter service status
- [ ] Try with simpler text
- [ ] Check error logs in console
- [ ] Report issue with sample text

### Issue 4: Tests Run but All Fail

**Cause**: Critical infrastructure issue

**Solutions**:
- [ ] Restart browser
- [ ] Clear browser cache
- [ ] Try different browser
- [ ] Check your internet connection
- [ ] Contact Puter support

### Issue 5: Slow Paraphrasing (>30 seconds)

**Cause**: Network congestion or Puter overload

**Solutions**:
- [ ] Check internet speed
- [ ] Close other apps using network
- [ ] Try shorter text first
- [ ] Wait and retry during off-peak
- [ ] Check Puter service status

## Testing Checklist

Before deploying:

- [ ] Run automated test suite: `npm run test`
- [ ] Manual test in browser on desktop
- [ ] Manual test on mobile devices
- [ ] Test all four transformation modes
- [ ] Test with different text lengths
- [ ] Test error scenarios (offline, etc.)
- [ ] Check console for warnings/errors
- [ ] Verify response times acceptable
- [ ] Check error messages are helpful

## Advanced Testing

### Load Testing

```javascript
// Test with many requests
async function loadTest(count = 10) {
  const text = "Sample text to paraphrase.";
  const results = [];
  
  for (let i = 0; i < count; i++) {
    const start = performance.now();
    try {
      const result = await window.puter.ai.chat({
        prompt: `Paraphrase: "${text}"`,
        max_tokens: 100
      });
      results.push({
        success: true,
        duration: performance.now() - start
      });
    } catch (error) {
      results.push({
        success: false,
        error: error.message
      });
    }
  }
  
  console.log(`Completed: ${results.filter(r => r.success).length}/${count}`);
  console.log('Avg time:', results.reduce((a, b) => a + (b.duration || 0), 0) / count + 'ms');
}

// Run
loadTest(5);
```

### Network Throttling Test

1. Open DevTools (F12)
2. Go to Network tab
3. Select throttle: "Slow 3G"
4. Run paraphrasing test
5. Verify it still works (slower but functional)

## Success Criteria

✓ **Test is successful if**:
- [x] SDK loads within 5 seconds
- [x] User authenticates successfully
- [x] Paraphrasing completes in <15 seconds
- [x] All transformation modes work
- [x] Error responses are handled
- [x] Console shows no critical errors
- [x] User gets helpful error messages

## Getting Help

If tests fail:

1. **Check the specific error message** - It should be descriptive
2. **Review the console logs** - Look for stack traces
3. **Try the manual HTML test** - Isolates browser testing
4. **Check internet connection** - Ping google.com
5. **Wait a few minutes** - Puter service might be temporarily down
6. **Report with details**:
   - Error message
   - Timestamp
   - Browser/OS
   - Console logs
   - Network logs

## Files Reference

| File | Purpose | How to Use |
|------|---------|-----------|
| `__tests__/integration/puter-paraphraser.integration.test.ts` | Automated tests | `npm run test` |
| `__tests__/manual/puter-connection-test.html` | Browser-based tests | Open in browser |
| `ERROR_HANDLING_GUIDE.md` | Error handling system | Reference |
| `src/utils/error-utilities.ts` | Error normalization | Development |

## Next Steps

After successful testing:
1. ✓ Puter connection is verified
2. ✓ Paraphrasing tool is ready to use
3. ✓ Error handling works correctly
4. Deploy with confidence
