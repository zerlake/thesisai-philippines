# Quick Start: Puter Integration Tests

**Want to test Puter connection right now?** Follow this quick guide.

## 30-Second Quick Test

### Option A: Browser (No Setup Required)
```
1. Open file in browser: __tests__/manual/puter-connection-test.html
2. Wait for status (should show "Connected")
3. Click "Standard Sample"
4. Click "Paraphrase (Standard)"
5. Wait 2-10 seconds
6. See output below
✓ Done!
```

### Option B: Command Line (1 minute)
```bash
# Windows
run-puter-tests.bat

# macOS/Linux
bash run-puter-tests.sh

# Or directly with npm
npm run test -- puter-paraphraser.integration.test --run
```

## What You're Testing

✓ Puter SDK is loaded  
✓ You're authenticated  
✓ AI can paraphrase text  
✓ Error handling works  

## Expected Results

### Success
```
✓ Puter SDK Availability - PASSED
✓ Puter Authentication - PASSED
✓ Paraphrase Standard Text - PASSED
✓ Make Text Formal - PASSED
✓ Simplify Text - PASSED
✓ Expand Text - PASSED

Result: All tests passed! ✓
```

### Failure (Common Causes)

| Error | Fix |
|-------|-----|
| SDK not loaded | Reload page, wait 5 seconds |
| Not authenticated | Sign in with Puter account |
| Empty response | Check internet, retry |
| Network error | Check Puter service status |

## Sample Data Included

Four realistic academic text samples:
- **Standard**: AI advancement essay (300+ words)
- **Formal**: Casual AI description → formal version
- **Technical**: Neural network explanation
- **Short**: Globalization excerpt

## Test Coverage

| Feature | Status |
|---------|--------|
| SDK Loading | ✓ Tested |
| Authentication | ✓ Tested |
| Standard Paraphrase | ✓ Tested |
| Make Formal | ✓ Tested |
| Simplify | ✓ Tested |
| Expand | ✓ Tested |
| Error Handling | ✓ Tested |

## Files

| File | Purpose |
|------|---------|
| `__tests__/integration/puter-paraphraser.integration.test.ts` | Automated tests |
| `__tests__/manual/puter-connection-test.html` | Browser test (no build) |
| `run-puter-tests.bat` | Windows runner |
| `run-puter-tests.sh` | Unix runner |
| `PUTER_CONNECTION_TEST_GUIDE.md` | Full documentation |

## Common Issues

### "Puter SDK not loaded"
→ Reload page and wait 5+ seconds for SDK to load

### "User not authenticated"  
→ Sign in with your Puter account first

### "Empty response from Puter"
→ Temporary service issue - wait and retry

### "Network error"
→ Check your internet connection

## Performance

Typical timing:
- SDK check: ~250ms
- Auth check: ~150ms
- Paraphrase: 2-10 seconds
- Total test suite: ~15 seconds

## Next Steps

After successful test:
1. ✓ Paraphrasing tool is ready to use
2. ✓ Error handling is in place
3. ✓ Deploy with confidence

## Still Having Issues?

1. Check detailed guide: `PUTER_CONNECTION_TEST_GUIDE.md`
2. Check console errors (F12 → Console)
3. Verify internet connection
4. Try different browser
5. Check Puter service status

## TL;DR

```bash
# Windows
run-puter-tests.bat

# Mac/Linux  
bash run-puter-tests.sh

# Expected: All 7 tests pass ✓
```

That's it! 🚀
