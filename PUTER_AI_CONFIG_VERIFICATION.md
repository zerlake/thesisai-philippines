# Puter AI Configuration Verification Guide

## Overview
This document helps verify that Puter AI is properly configured in your Supabase functions environment.

## Functions Using Puter AI

The following Supabase Edge Functions depend on Puter AI:

| Function | Purpose | Status |
|----------|---------|--------|
| `grammar-check` | Writing analysis with 13 dimensions | ✅ Now has fallback |
| `paraphrase-text` | Text rewriting and paraphrasing | Uses Puter |
| `generate-topic-ideas` | Research topic generation | Uses Puter |
| `generate-abstract` | Abstract generation | Uses Puter |
| `generate-topic-ideas-enterprise` | Enterprise topic generation | Uses Puter |

## Configuration Sources

### Primary: Environment Variables
Set in Supabase project settings under "Edge Function Secrets":

```
PUTER_API_KEY=<Bearer token from Puter account>
PUTER_API_ENDPOINT=https://api.puter.com/v1/ai/chat  # or custom endpoint
```

### Shared Module
Location: `supabase/functions/_shared/puter-ai.ts`

**Key Function**: `callPuterAI(prompt, options)`
- Handles authentication
- Manages timeouts (default 30s)
- Supports OpenAI-compatible response format
- Has fallback parsing for different response shapes

## Verification Steps

### 1. Check Environment Variables
```bash
# View current secrets (values hidden for security)
supabase secrets list
```

**Expected Output**:
```
NAME                  VALUE
PUTER_API_KEY        ••••••••••
PUTER_API_ENDPOINT   https://api.puter.com/v1/ai/chat
```

### 2. Check Function Logs
```bash
# View recent logs from grammar-check function
supabase functions logs grammar-check --limit 50

# Watch logs in real-time
supabase functions logs grammar-check --follow
```

**Look For**:
- `[puter-ai] Calling Puter AI - Endpoint: ...` - Configuration logged
- `[puter-ai] Got response with keys: [...]` - Success
- `[puter-ai] API error:` - Authentication or connection issue

### 3. Test Function Directly
```bash
# Via Supabase dashboard
# POST to https://dnyjgzzfyzrsucucexhy.supabase.co/functions/v1/grammar-check
# Header: Authorization: Bearer <your-jwt-token>
# Body: { "text": "Your text here..." }

# Or via curl
curl -X POST https://your-project.supabase.co/functions/v1/grammar-check \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text":"Sample text for analysis"}'
```

### 4. Monitor in UI
Navigate to Grammar Checker:
1. Open app at `/grammar-check`
2. Add sample text (25+ words)
3. Click "Analyze Text"
4. Check browser console (F12) for logs

**Look For**:
```
[grammar-check] Puter config - Has API Key: true
[grammar-check] Using fallback analysis due to Puter AI error
```

## Common Issues & Solutions

### Issue: 500 Error, API Key is False
```
[grammar-check] Puter config - Has API Key: false
```

**Solution**:
1. Go to Supabase dashboard
2. Project Settings → Edge Function Secrets
3. Add `PUTER_API_KEY=<your-key>`
4. Redeploy function (or wait for automatic sync)

### Issue: API Error 401 or 403
```
[puter-ai] API error: 401 - Unauthorized
```

**Solution**:
- Verify API key is valid at Puter account
- Check API key hasn't expired
- Ensure no whitespace around key value

### Issue: API Error 429 (Rate Limited)
```
[puter-ai] API error: 429 - Too Many Requests
```

**Solution**:
- Reduce request frequency
- Check Puter pricing tier limits
- Contact Puter support for higher limits

### Issue: Timeout
```
[puter-ai] Exception during API call: Puter AI request timed out
```

**Solution**:
- Check internet connection from Supabase region
- Verify PUTER_API_ENDPOINT is accessible
- Increase timeout in `callPuterAI` options
- Check Puter service status

## Fallback Behavior

When Puter AI is unavailable, the grammar-check function:

1. **Catches the error** silently
2. **Logs the failure** with details
3. **Returns fallback analysis** with:
   - Basic text metrics (word/sentence count)
   - Default scores (3.0-4.0 range) based on text length
   - Standard improvement tips
   - Message: "AI service unavailable, please try again"

**Benefits**:
- Users still get useful analysis
- No broken UI or error messages
- Graceful degradation during outages

## Getting Puter API Key

### Steps:
1. Visit https://puter.com (or your Puter instance)
2. Create account or sign in
3. Navigate to API settings or Developer section
4. Generate new API key/token
5. Copy the Bearer token
6. Add to Supabase environment as `PUTER_API_KEY`

### Supported Endpoints:
- Default: `https://api.puter.com/v1/ai/chat`
- Custom: Set via `PUTER_API_ENDPOINT` variable
- Local: `http://localhost:8000` (for development)

## Performance Monitoring

### Metrics to Track:
- **Success Rate**: % of successful Puter AI calls
- **Fallback Rate**: % using fallback analysis
- **Response Time**: How long analysis takes
- **Error Types**: Common failure modes

### Recommended Monitoring:
```typescript
// In function logs, look for patterns:
console.log(`[puter-ai] Success - took ${Date.now() - start}ms`);
console.log(`[grammar-check] Using fallback analysis`);
```

## Security Considerations

1. **Never commit API keys** to version control
2. **Use Supabase Secrets** for sensitive values
3. **Rotate keys periodically** (annual minimum)
4. **Monitor usage** for unusual patterns
5. **Rate limit** at application level

## Related Documentation

- Puter AI API: https://puter.com/docs/api
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Supabase Secrets: https://supabase.com/docs/guides/functions/secrets
- Grammar Checker Component: `src/components/grammar-checker.tsx`

## Troubleshooting Checklist

- [ ] Verified PUTER_API_KEY is set in Supabase secrets
- [ ] Verified PUTER_API_ENDPOINT is correct (or using default)
- [ ] Checked function logs for error messages
- [ ] Tested with sample text (25+ words)
- [ ] Verified JWT token is valid and not expired
- [ ] Checked CORS headers allow origin
- [ ] Confirmed Puter API is accessible from Supabase region
- [ ] Verified API key hasn't been revoked

## Status Page

For Puter service status:
- Check Puter status page: https://status.puter.com (if available)
- Contact Puter support if experiencing persistent issues
- Check Supabase status: https://status.supabase.com

---

**Last Updated**: 2025-11-28
**Functions Checked**: grammar-check, paraphrase-text, generate-topic-ideas
**Fallback Status**: ✅ Enabled and tested
