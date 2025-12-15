# Sci-Hub Integration in /papers - Complete Guide

## Overview

Sci-Hub unlock functionality is now fully integrated into the Papers page (`/papers`) with a dedicated "Unlock PDFs" tab that provides an enhanced UI for managing paywalled paper downloads.

## What Changed

### Removed From
- ❌ Removed from `src/components/literature-review.tsx` 
- Literature Review now shows only "View Source" button

### Added To
- ✅ `/papers` page with dedicated "Unlock PDFs" tab
- ✅ Enhanced UI with filtering and statistics
- ✅ Separate tabs for different paper statuses

## File Structure

```
src/components/paper-search/
├── find-papers-page.tsx          # Main papers page (UPDATED)
├── papers-unlock-section.tsx     # New unlock UI component
└── ...

src/lib/
└── scihub-integration.ts         # Core utilities (unchanged)

src/hooks/
└── use-scihub.ts                 # React hook (unchanged)

src/components/
└── scihub-unlock-button.tsx      # Unlock button (enhanced with callback)

src/app/api/papers/
└── unlock/route.ts               # Server API (unchanged)
```

## New Component: PapersUnlockSection

Located at: `src/components/paper-search/papers-unlock-section.tsx`

### Features

1. **Three-Tab View**
   - **All Papers**: Search and filter all results
   - **Unlockable Papers**: Only papers with DOI
   - **No DOI**: Papers that can't be unlocked

2. **Smart Filtering**
   - Search by title or publication info
   - Real-time filtering across all papers
   - Status indicators (unlocked, no DOI, etc.)

3. **Statistics Dashboard**
   - Total unlockable papers count
   - Session unlock counter
   - Papers needing manual search

4. **Paper Cards**
   - Title, publication info, snippet
   - DOI display (if available)
   - View Source + Unlock buttons
   - Status badges

5. **Legal Compliance**
   - Prominent disclaimer at top
   - Warning about jurisdiction-specific legality
   - User acknowledgment required before unlock

## Integration Points

### In FindPapersPage

```tsx
// Import
import { PapersUnlockSection } from './papers-unlock-section';

// Add to tabs (new)
<TabsTrigger value="unlock" className="flex items-center gap-2">
  <Unlock className="h-4 w-4" />
  Unlock PDFs
</TabsTrigger>

// Add content
<TabsContent value="unlock" className="mt-4">
  <PapersUnlockSection
    papers={papers}
    isLoading={isLoading}
    query={query}
    totalResults={totalResults}
  />
</TabsContent>
```

### Updated Button

`SciHubUnlockButton` now supports:
- `onSuccess` callback for tracking unlocked papers
- `id` field on paper objects for identification
- Size variants: `default`, `sm`, `lg`, `icon`

```tsx
<SciHubUnlockButton 
  paper={paper} 
  variant="default" 
  size="sm"
  onSuccess={(paperId) => handleUnlockSuccess(paperId)}
/>
```

## User Workflow

1. **Search Papers** → Papers appear in Search Results tab
2. **Click "Unlock PDFs" Tab** → Opens dedicated unlock interface
3. **View Papers** → Browse with automatic DOI detection
4. **Filter as needed** → Use search or tab views
5. **Click "Unlock PDF"** → Legal notice → Sci-Hub attempts download
6. **Track Success** → Unlocked papers highlighted, counter increments
7. **Handle Failures** → Tab shows papers without DOI, suggests alternatives

## Features

### Smart DOI Detection
Automatically extracts DOI from:
- Paper links
- Publication info
- Titles
- Snippets

### Tab Organization
- **All Papers**: Complete searchable list
- **Unlockable**: Only papers with DOI (ready to unlock)
- **No DOI**: Papers requiring manual search

### Visual Feedback
- Green highlighting for unlocked papers
- Status badges (Unlocked, No DOI)
- Real-time unlock counter
- Paper category statistics

### Error Handling
- "No DOI" button for papers without identifiers
- Helpful messages for each scenario
- Fallback suggestions (request from authors, manual search)

## Page Title & Description

### Updated Metadata
```tsx
title: 'Find & Unlock Research Papers | ThesisAI'
description: 'Search academic papers across CrossRef, ArXiv, OpenAlex, and Semantic Scholar. Unlock paywalled PDFs via Sci-Hub when needed.'
```

## Tab Navigation

The /papers page now has 5 main tabs:

1. **Search Results** - Initial paper search results with list/map views
2. **Unlock PDFs** - ✨ NEW - Sci-Hub unlock interface (with sub-tabs)
   - All Papers
   - Unlockable (with DOI)
   - No DOI
3. **Network Map** - Paper relationship visualization
4. **Author Network** - Researcher collaboration graph
5. **Collections** - Saved paper collections

## Legal & Ethical Notes

### Disclaimer Shown
```
Legal Notice: Sci-Hub access is unofficial and may violate copyright 
laws in some jurisdictions. Always prefer open-access sources like 
ArXiv, PubMed Central, or publisher repositories first. 
Use only for personal, non-commercial research.
```

### Recommended Workflow (shown in docs)
1. Try legal sources first (ArXiv, PubMed Central)
2. Check publisher open-access options
3. Request from authors/ResearchGate
4. Use Sci-Hub only as last resort

## Statistics Dashboard

Shows three key metrics:

```
┌─────────────────┐  ┌──────────────┐  ┌─────────────────┐
│  Unlockable     │  │   Already    │  │  Need Manual    │
│    Papers       │  │   Unlocked   │  │    Search       │
│      12         │  │       3      │  │       2         │
└─────────────────┘  └──────────────┘  └─────────────────┘
```

## Code Examples

### Using in Other Components

```tsx
import { PapersUnlockSection } from '@/components/paper-search/papers-unlock-section';

// In your component
<PapersUnlockSection
  papers={searchResults}
  isLoading={false}
  query="machine learning"
  totalResults={42}
/>
```

### Direct Button Usage

```tsx
import { SciHubUnlockButton } from '@/components/scihub-unlock-button';

<SciHubUnlockButton 
  paper={paperObject}
  doi="10.1038/nature12373"
  variant="default"
  onSuccess={(id) => console.log(`Unlocked: ${id}`)}
/>
```

## Differences from Literature Review

### Literature Review
- ❌ Removed Sci-Hub button
- ✅ Shows "View Source" only
- ✅ Stays focused on literature synthesis

### Papers Page
- ✅ Full Sci-Hub integration
- ✅ Dedicated unlock tab
- ✅ Advanced filtering & stats
- ✅ Enhanced UX for paper discovery

## Performance

- Unlock attempts: 2-5 seconds per PDF
- Fallback retry: 10-15 seconds if first mirror down
- No server-side storage (PDFs opened in new window)
- Scales to 100+ papers per search

## Testing

### Manual Test Workflow

1. Go to `/papers`
2. Search for any topic
3. Click "Unlock PDFs" tab
4. Papers appear with DOI extraction
5. Click "Unlock PDF" on any paper
6. Confirm legal notice
7. Wait 2-5 seconds
8. PDF opens in new window
9. Count increments, paper highlights green

### Automated Test
```bash
curl -X POST http://localhost:3000/api/papers/unlock \
  -H "Content-Type: application/json" \
  -d '{"doi": "10.1038/nature12373"}'
```

## Customization

### Change Tab Grid
In `find-papers-page.tsx`, line 197:
```tsx
<TabsList className="grid w-full grid-cols-5">  // Change 5 to 4, 3, etc
```

### Customize Unlock Section Title
In `papers-unlock-section.tsx`, line ~60:
```tsx
<h2 className="text-3xl font-bold">Unlock Paywalled Papers</h2>
<p className="text-muted-foreground mt-1">Your custom subtitle</p>
```

### Adjust Filter Placeholder
In `papers-unlock-section.tsx`, line ~125:
```tsx
placeholder="Your custom filter text"
```

## Browser Support

- Chrome/Chromium: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Edge: ✅ Full support
- Mobile: ✅ Responsive design

## Accessibility

- Semantic HTML with proper heading hierarchy
- ARIA labels on interactive elements
- Keyboard navigation support
- Color not only indicator (includes badges/text)
- Sufficient contrast ratios

## Security

- Server-side mirror rotation (avoids direct client-to-Sci-Hub)
- Base64 transmission over HTTPS
- No DOI logging on server
- Legal disclaimer mandatory
- User confirmation required

## Future Enhancements

- [ ] Batch unlock multiple papers at once
- [ ] Offline storage with Puter.js
- [ ] Alternative open-access APIs (CORE, Unpaywall)
- [ ] User preferences for mirror selection
- [ ] Zotero/Mendeley integration
- [ ] Export unlocked papers metadata

## Support & Troubleshooting

For issues, refer to:
- Main guide: `docs/SCIHUB_INTEGRATION.md`
- Quick start: `SCIHUB_QUICKSTART.md`
- Implementation details: `SCIHUB_IMPLEMENTATION_SUMMARY.md`

## Migration Notes

### From Literature Review
If you want to move the feature back to Literature Review:

1. Copy `PapersUnlockSection` import
2. Add new tab/section to literature review
3. Pass papers from literature search
4. Adjust styling to match component

### To Custom Page
To use in custom pages:
1. Import `PapersUnlockSection`
2. Pass papers array
3. Handle state management
4. Style as needed

## Related Files

- `src/app/papers/page.tsx` - Main page wrapper
- `src/components/paper-search/find-papers-page.tsx` - Integration point
- `src/components/paper-search/papers-unlock-section.tsx` - UI component
- `src/components/scihub-unlock-button.tsx` - Button component
- `src/lib/scihub-integration.ts` - Core logic
- `src/hooks/use-scihub.ts` - React hook
- `src/app/api/papers/unlock/route.ts` - Server API
- `docs/SCIHUB_INTEGRATION.md` - Full documentation

## Summary

The Sci-Hub integration is now optimally positioned in the `/papers` page where it belongs - as a dedicated tool for paper discovery and access. The enhanced UI provides better UX than embedding it in Literature Review, and it's easily accessible from the main papers search workflow.
