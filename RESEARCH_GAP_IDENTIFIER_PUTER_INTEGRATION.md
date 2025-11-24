# Research Gap Identifier with Puter.js AI Integration

This feature provides students with an AI-powered tool to identify research gaps and novel opportunities in their field of study. The system integrates with Puter.js AI capabilities to analyze literature and suggest potential research directions.

## Features

- **Research Gap Analysis**: Identifies potential research gaps based on topic, field of study, and existing literature
- **Literature Integration**: Allows importing references from the literature review system
- **Gap Scoring**: Rates gaps based on novelty, feasibility, and significance
- **Recommendations**: Provides prioritized recommendations for pursuing research gaps
- **Opportunity Tracking**: Lists related conferences and funding opportunities
- **Export Capabilities**: Generates gap statements for thesis proposals

## Architecture

### Frontend Components
- `ResearchGapIdentifier.tsx`: Main UI component with input forms and visualization
- API route: `/api/analyze-research-gaps` - Connects to Supabase functions

### Backend Functions (Supabase Edge Functions)
- `puter-ai-wrapper`: Wraps Puter.js AI functionality (simulated in current implementation)
- `analyze-research-gaps`: Performs detailed gap analysis (simulated in current implementation)

### Data Models
Located in `src/types/researchGap.ts`:
- `ResearchGap`: Defines structure for identified research gaps
- `GapAnalysisResponse`: Structure for complete analysis response
- `GapLiterature`: Model for literature references related to gaps

## Current Implementation Status

### Completed
✅ ResearchGapIdentifier component with comprehensive UI  
✅ Literature integration functionality  
✅ Tabbed interface for gap analysis, opportunities, and exports  
✅ API route connecting to Supabase functions  
✅ Integration tests defined  

### Puter.js Integration (Planned Enhancement)

The current implementation uses simulated AI responses for demonstration. For full Puter.js integration:

1. **Backend Integration**: 
   - Update Supabase functions to import and use `@puter/js`
   - Configure runtime to support Node.js packages or HTTP API calls to Puter services
   - Implement proper user authentication for AI service access

2. **Frontend Integration**:
   - Add Puter.js library to frontend bundle
   - Implement direct AI calls from browser (where appropriate)
   - Update error handling for AI service connectivity

## How to Complete Puter.js Integration

### Step 1: Update Supabase Functions
Replace the mock functions with actual Puter.js integration:

```typescript
// In supabase/functions/analyze-research-gaps/index.ts
import puter from '@puter/js';

const analysis = await puter.ai.chat({
  prompt: fullPrompt,
  temperature: 0.7,
  max_tokens: 2000,
});
```

### Step 2: Deploy Updated Functions
```bash
supabase functions deploy analyze-research-gaps
supabase functions deploy puter-ai-wrapper
```

### Step 3: Frontend Puter.js Integration (Optional)
For direct browser integration, add Puter.js to your HTML head:
```html
<script src="https://js.puter.com/v2/"></script>
```

## Running Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env.local
   # Add your Supabase configuration
   ```

3. **Run the application**:
   ```bash
   npm run dev
   ```

4. **Access the feature**:
   Navigate to `/research-gap` in your browser

## Testing

Run the integration tests:
```bash
npm run test:integration
# or
vitest
```

## Deployment to Supabase

1. **Login to Supabase CLI**:
   ```bash
   supabase login
   ```

2. **Link your project**:
   ```bash
   supabase link --project-ref your-project-id
   ```

3. **Deploy functions**:
   ```bash
   supabase functions deploy
   ```

4. **Deploy the application** (for Vercel):
   Push changes to your connected GitHub repository

## Future Improvements

- Direct Puter.js AI integration for real AI-powered analysis
- Advanced filtering and sorting of identified gaps
- Integration with citation managers
- Export to various academic formats (APA, MLA, Chicago, etc.)
- Collaboration features for group research projects
- Integration with calendar and task management tools

## Troubleshooting

### Common Issues
- **API Connection Errors**: Verify Supabase functions are properly deployed
- **CORS Issues**: Check Supabase project settings for CORS configuration
- **Authentication Problems**: Ensure proper session management

### Debugging
Enable debugging in your Supabase dashboard to view function logs and monitor AI service usage.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/puter-integration`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'Add Puter.js integration'`)
6. Push to the branch (`git push origin feature/puter-integration`)
7. Open a Pull Request