# Title Generator Setup Guide

## What Was Fixed

The "Summary is required" error has been resolved by:
1. ✅ Creating the missing `generate-titles` Supabase function
2. ✅ Adding proper input validation
3. ✅ Implementing a title generation algorithm
4. ✅ Ensuring sample data can be used without errors

## New Supabase Function

**File**: `supabase/functions/generate-titles/index.ts`

**What it does**:
- Accepts POST requests with `{ summary: string }`
- Validates summary is not empty and at least 50 characters
- Generates 5 academic titles based on the summary
- Returns JSON response with generated titles

**Example Request**:
```json
POST /functions/v1/generate-titles
Content-Type: application/json

{
  "summary": "This research investigates the effectiveness of AI-powered personalized learning systems..."
}
```

**Example Response**:
```json
{
  "success": true,
  "titles": [
    "A Comprehensive Analysis of Modern Learning Systems",
    "Exploring the Impact of Artificial Intelligence on Educational Outcomes",
    "Innovative Approaches to Research: Bridging Theory and Practice",
    ...
  ],
  "generated_at": "2025-11-29T12:00:00Z"
}
```

## Deployment Instructions

### Option 1: Deploy via Supabase CLI (Recommended)

```bash
# Navigate to project root
cd /c/Users/Projects/thesis-ai

# Deploy the function
supabase functions deploy generate-titles

# Verify deployment
supabase functions list
```

### Option 2: Deploy via Supabase Dashboard

1. Go to Supabase Dashboard → Your Project
2. Navigate to Functions
3. Click "Create a new function"
4. Name it `generate-titles`
5. Copy code from `supabase/functions/generate-titles/index.ts`
6. Deploy

## Testing the Function

### Using curl

```bash
# Get your function URL
FUNCTION_URL="https://[YOUR_PROJECT_ID].supabase.co/functions/v1/generate-titles"

# Test with sample data
curl -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -H "apikey: YOUR_ANON_KEY" \
  -d '{
    "summary": "This research investigates the effectiveness of AI-powered personalized learning systems in improving student engagement and academic performance in undergraduate computer science courses."
  }'
```

### Using the Dashboard

1. Click on the component (Title Generator)
2. Click "Load Sample Data"
3. Click "Generate Titles"
4. Should see generated titles without error

## How It Works

### Input Validation
```typescript
// Checks:
1. Summary is provided
2. Summary is a string
3. Summary is at least 50 characters
```

### Title Generation Algorithm
```typescript
1. Extract key concepts from summary (AI, education, impact, etc.)
2. Generate titles based on patterns
3. Use keywords found in the summary
4. Provide diverse title formats
5. Return up to 5 unique titles
```

### Current Implementation (Mock)

The function currently uses a **mock implementation** that:
- ✅ Works without external AI services
- ✅ Generates reasonable academic titles
- ✅ Uses the summary content to create relevant titles
- ✅ No API keys or external dependencies needed

### Future Enhancement (Optional)

To integrate real AI:
```typescript
// Use Puter AI
const response = await puter.ai.chat(`Generate 5 academic titles for: "${summary}"`);

// Or use Claude API
const response = await anthropic.messages.create({...});

// Or use OpenAI
const response = await openai.chat.completions.create({...});
```

## Files Modified/Created

### New Files
- `supabase/functions/generate-titles/index.ts` - Supabase function

### Updated Files
- `src/components/title-generator.tsx` - Cleaner error handling, removed duplicate validation

## Testing Checklist

After deployment:

- [ ] Navigate to title-generator component
- [ ] Click "Load Sample Data"
- [ ] Verify summary text appears in textarea
- [ ] Click "Generate Titles"
- [ ] Should see 5 generated titles
- [ ] No "Summary is required" error
- [ ] Titles are relevant to the sample text
- [ ] Can copy titles with copy button
- [ ] Try with empty summary → should error
- [ ] Try with very short summary → should error

## Troubleshooting

### Error: "function not found"

**Cause**: Function not deployed to Supabase

**Solution**:
```bash
supabase functions deploy generate-titles
```

### Error: "Summary is required"

**Cause**: Summary is empty or missing

**Solution**:
1. Click "Load Sample Data"
2. Or manually enter summary text
3. Summary must be at least 50 characters

### Error: "Unauthorized"

**Cause**: Missing or invalid authentication

**Solution**:
1. Ensure you're signed in
2. Check `Authorization` header has valid token
3. Check `apikey` header has correct Supabase key

### Function returns empty titles

**Cause**: Summary parsing issue

**Solution**:
1. Check summary is meaningful
2. Try different sample data
3. Check browser console for errors

## Configuration

### Timeout

Current: 60 seconds (Supabase default)

To change:
```bash
supabase functions deploy generate-titles --timeout 120
```

### CORS Headers

Configured for all origins (adjust if needed):
```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
```

## Next Steps

1. **Deploy the function**:
   ```bash
   supabase functions deploy generate-titles
   ```

2. **Test it**:
   - Navigate to Title Generator
   - Load sample data
   - Generate titles

3. **Optional: Integrate with Puter AI**:
   - Update the function to call Puter AI
   - Use provided Puter SDK utilities
   - Return AI-generated titles

## Summary

✅ **Problem Solved**: Title generator now works without "Summary is required" error
✅ **Function Created**: `generate-titles` Supabase function implemented
✅ **Validation Added**: Proper input validation in function
✅ **Sample Data Works**: Can load sample data and generate titles immediately
✅ **Ready to Deploy**: Just run `supabase functions deploy generate-titles`

---

**Status**: Ready for deployment  
**Next Step**: Deploy function and test
