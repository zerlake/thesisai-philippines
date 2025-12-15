# AI Integration Test Execution Guide

## To run actual AI connectivity tests:

1. First, authenticate with Puter by visiting:
   ```
   http://localhost:3000/admin/puter-auth
   ```
   Click "Sign in to Puter.js" to complete the authentication

2. After successful authentication, the token will be stored in localStorage as 'puter.auth.token'

3. Then run the tests using one of these commands:
   ```bash
   # Run all AI integration tests
   npm run test:integration
   
   # Run specific test
   npx vitest run __tests__/integration/paraphrasing-ai-integration.test.ts
   
   # Run in watch mode to see live results
   npx vitest __tests__/integration/paraphrasing-ai-integration.test.ts
   ```

## Sample Test Execution (with valid token):

When a valid Puter token is present, here's what happens:

### Test Input:
```javascript
const sampleText = "The impact of social media on academic performance has been a topic of considerable debate in recent years. Educational institutions are increasingly integrating digital technologies into learning processes, making digital literacy a critical skill for academic success.";
```

### AI Service Call:
```javascript
const response = await supabase.functions.invoke('paraphrase-text', {
  body: { 
    text: sampleText,
    mode: 'standard'
  }
});
```

### Expected AI Response:
The test verifies that the AI service returns:
- A response with `paraphrasedText` property
- Text that is different from the input but preserves meaning
- Content of reasonable length (not empty)
- Academic-appropriate terminology

## Test Results Format:
When run with authentication, you'll see results like:
```
✅ Paraphrasing AI connected successfully!
Input text: The impact of social media on academic performance...
Output text: The influence of social media platforms on scholastic...
```

## Verification Steps:
The test confirms:
- ✅ Successful connection to Supabase function
- ✅ Valid response from AI service
- ✅ Proper token authentication
- ✅ Meaningful AI-generated output
- ✅ Different output from input (actual paraphrasing)

## Troubleshooting:
If tests fail with authentication errors:
1. Verify you've authenticated at /admin/puter-auth
2. Check that localStorage contains 'puter.auth.token'
3. Ensure your Puter subscription is active
4. Verify network connectivity to Puter services