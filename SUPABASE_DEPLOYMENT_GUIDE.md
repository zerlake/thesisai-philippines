# Supabase Functions Deployment Guide

## Deploying the Research Gap Identifier Functions

### Prerequisites
- Supabase CLI installed (`npm install -g supabase`)
- Logged into your Supabase account (`supabase login`)
- Project connected to your Supabase project (`supabase link --project-ref <project-id>`)

### Deployment Steps

1. **Prepare the functions directory structure**:
   ```bash
   # Ensure your functions are in the correct location
   ls supabase/functions/
   # You should see:
   # analyze-research-gaps/
   # puter-ai-wrapper/
   # _shared/
   ```

2. **Deploy the functions**:
   ```bash
   # Deploy all functions at once
   supabase functions deploy
   
   # Or deploy specific functions
   supabase functions deploy puter-ai-wrapper
   supabase functions deploy analyze-research-gaps
   ```

3. **Verify deployment**:
   ```bash
   # List deployed functions
   supabase functions list
   
   # Test a function (replace FUNCTION_NAME with actual function name)
   supabase functions invoke puter-ai-wrapper --data '{"researchTopic":"Test topic", "fieldOfStudy":"Computer Science", "keywords":["test", "keyword"]}'
   ```

### Function Descriptions

1. **puter-ai-wrapper**:
   - Purpose: Serves as a wrapper to simulate Puter.js AI integration
   - In a real implementation, this would eventually call Puter.js AI services directly
   - Currently provides mock research gap analysis results
   - Input: researchTopic, fieldOfStudy, keywords, existingLiterature
   - Output: structured analysis with research gaps, recommendations, and opportunities

2. **analyze-research-gaps**:
   - Purpose: Primary function for comprehensive research gap analysis
   - Performs detailed literature gap identification and novel research opportunity detection
   - Input: Same parameters as puter-ai-wrapper
   - Output: Detailed analysis with multiple research gaps and related opportunities

### Puter.js Integration Notes

The current implementation simulates Puter.js functionality. For actual Puter.js integration:

1. Once deployed, the Supabase functions would need to be updated to include the Puter.js library
2. The runtime would need to support Node.js packages or have a mechanism to call Puter.js services
3. The functions should authenticate with the user's Puter account to access AI services

### Troubleshooting

- If deployments fail, check function quotas in your Supabase project settings
- Ensure all required dependencies are bundled correctly
- Check the Supabase dashboard for error logs if functions don't work as expected
- Remember to update CORS settings if needed for your domain

### Post-deployment Setup

After successful deployment, ensure the frontend API route correctly calls the deployed Supabase function:

1. Check that `src/app/api/analyze-research-gaps/route.ts` calls the correct deployed function name
2. Verify authentication settings if your functions require authentication
3. Test the complete flow from the ResearchGapIdentifier component