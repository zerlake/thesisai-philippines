# Puter AI Search Integration - Complete Guide

## ✨ What's New

Your paper search now has **two buttons**:

### 1. **AI Search Button** (Primary - Purple/Blue Gradient)
- 🤖 Connects directly to Puter AI
- 🎯 Intelligent paper search
- ⚡ AI-powered results
- 💡 Smart ranking and suggestions

### 2. **Search Button** (Secondary - Outlined)
- 🔍 Standard API search
- ⚙️ Reliable fallback
- 🌐 CrossRef, arXiv, PubMed
- ⏱️ Consistent results

## How It Works

### UI Layout

```
┌─────────────────────────────────────────┐
│  🔍 [Search box]     [AI Search] [Search] │
│                      (Primary) (Fallback) │
└─────────────────────────────────────────┘
```

### User Flow

1. **Type your query** in the search box
2. **Click "AI Search"** (purple/blue button)
   - Connects to Puter AI
   - Uses AI to understand your query
   - Returns intelligent results
3. **Or click "Search"** if Puter unavailable
   - Falls back to standard APIs
   - Same reliable results

## Files Modified

### 1. `src/components/paper-search/paper-search-bar.tsx`
**Changes:**
- ✅ Added AI Search button (primary)
- ✅ Kept Search button (secondary/fallback)
- ✅ Auto-detects Puter availability
- ✅ Graceful fallback if Puter unavailable
- ✅ Loading states for both buttons
- ✅ Toast notifications

### 2. `src/lib/puter-ai-search.ts` (New)
**Features:**
- ✅ PuterAISearchService class
- ✅ Initialize Puter connection
- ✅ Execute AI searches
- ✅ Parse AI responses
- ✅ Get search suggestions
- ✅ Enhance paper details

## Setup & Configuration

### Step 1: Ensure Puter is Loaded

Make sure Puter.js is loaded in your `_document.tsx` or layout:

```typescript
// In your layout or _document
import Script from 'next/script';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <head>
        {/* Puter.js SDK */}
        <Script
          src="https://js.puter.com/v2/"
          strategy="beforeInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### Step 2: Use in Your Components

The search bar automatically handles Puter detection:

```typescript
'use client';

import { PaperSearchBar } from '@/components/paper-search/paper-search-bar';
import { usePaperSearch } from '@/hooks/usePaperSearch';

export function SearchPage() {
  const { search } = usePaperSearch();

  return (
    <PaperSearchBar
      onSearch={async (query) => {
        // Standard search
        await search(query);
      }}
      onAISearch={async (results) => {
        // AI search results
        console.log('AI Results:', results);
      }}
    />
  );
}
```

## Feature Details

### AI Search Button Behavior

#### When Puter is Available ✅
- Button is **enabled** with gradient color
- Shows **"AI Search"** label
- On click: Connects to Puter AI
- Returns: AI-ranked papers
- Shows: Success toast with count

#### When Puter is Unavailable ❌
- Button is **disabled** (still visible)
- Shows **tooltip**: "Puter AI not available"
- Console logs: Why it's unavailable
- Fallback: Uses standard search

### Loading States

```
IDLE:          [AI Search] [Search]
SEARCHING:     [🔄 AI Searching...] [Search]
BOTH:          [AI Search] [🔄 Searching...]
LOADING_API:   [AI Search] [🔄 Searching...]
```

### Error Handling

If AI search fails:
1. Shows **error toast** with reason
2. Logs details to console
3. **Automatically falls back** to standard search
4. User still gets results

## Code Example

### Basic Implementation

```typescript
import { PaperSearchBar } from '@/components/paper-search/paper-search-bar';

export function MySearchComponent() {
  const handleSearch = async (query: string) => {
    // Standard search
    console.log('Searching:', query);
  };

  const handleAISearch = async (results: any) => {
    // AI search results
    console.log('AI found:', results.papers.length, 'papers');
    // Update UI with AI results
  };

  return (
    <PaperSearchBar
      onSearch={handleSearch}
      onAISearch={handleAISearch}
      placeholder="Find research papers..."
    />
  );
}
```

### Advanced: Custom AI Context

```typescript
// Get user context for better AI results
const userInterests = ['machine learning', 'neural networks'];

const handleAISearch = async (query: string) => {
  const context = userInterests.join(', ');
  const results = await puterAISearchService.searchWithAI(
    query,
    `User interests: ${context}`
  );
  // Use results...
};
```

## API Reference

### PuterAISearchService

```typescript
// Initialize
await puterAISearchService.initialize(): Promise<boolean>

// Check availability
puterAISearchService.isAvailable(): boolean

// Search with AI
await puterAISearchService.searchWithAI(
  query: string,
  context?: string
): Promise<PaperSearchResult>

// Get suggestions
await puterAISearchService.getSuggestions(
  query: string
): Promise<string[]>

// Enhance paper details
await puterAISearchService.enhancePaperDetails(
  paper: Paper
): Promise<Paper>
```

## Console Logging

The implementation includes detailed logging for debugging:

```
[PuterAI] Searching for: machine learning
[PuterAI] Got response: {...}
[PuterAI] Parsed 25 papers
[PuterAI] Connected successfully
[PaperSearch] Starting AI search: neural networks
[PaperSearch] AI search error: ...
```

## Styling

### AI Search Button (Primary)
- **Background:** Gradient (Purple → Blue)
- **Hover:** Darker gradient
- **Icon:** ✨ Sparkles
- **Label:** "AI Search" (or "AI Searching...")

### Search Button (Secondary)
- **Background:** Outlined/transparent
- **Hover:** Subtle background
- **Icon:** 🔍 Search
- **Label:** "Search" (or "Searching...")

Customize in the component:
```typescript
className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
```

## Troubleshooting

### AI Search button is disabled?
1. Check Puter.js is loaded
2. Check browser console for `[PuterAI]` logs
3. Verify Puter account is logged in
4. Try standard "Search" button as fallback

### AI Search returns no results?
1. Check query is specific enough
2. Review console for error messages
3. Try more specific terms
4. Use standard search as alternative

### No [PuterAI] logs?
1. Puter.js not loaded - add Script tag
2. Window.puter.ai not available - check Puter version
3. Component not mounted - check rendering

### Fallback happening automatically?
1. This is **normal** if Puter unavailable
2. Standard search will be used
3. Users still get results
4. Check console for "not available" message

## Testing

### Manual Testing

1. **Test AI Search:**
   ```
   Visit your page with search bar
   Type: "neural networks"
   Click: "AI Search"
   Result: Should show AI results or fallback
   ```

2. **Test Fallback:**
   ```
   Disconnect internet or disable Puter
   Type: "machine learning"
   Click: "AI Search"
   Result: Should auto-fallback to standard search
   ```

3. **Check Logs:**
   ```
   Open DevTools Console
   Filter: [PuterAI]
   Should see initialization and search logs
   ```

### Browser DevTools

- **Console:** Filter for `[PuterAI]` or `[PaperSearch]`
- **Network:** Check Puter API calls
- **Elements:** Inspect AI Search button styling

## Production Deployment

### Pre-deployment Checklist

- [ ] Puter.js script is loaded
- [ ] Both buttons render correctly
- [ ] AI button is styled properly
- [ ] Console logs are appropriate
- [ ] Fallback works if Puter unavailable
- [ ] Error handling works
- [ ] Toast notifications display

### Environment Configuration

No special environment variables needed. The component:
- Auto-detects Puter availability
- Gracefully degrades
- No config required

### Performance Considerations

- **First render:** Puter check (~100ms)
- **AI search:** Depends on Puter (~1-5 seconds)
- **Standard search:** ~1-3 seconds
- **Memory:** Minimal overhead

## Security & Privacy

- ✅ Puter handles authentication
- ✅ Queries sent to Puter (if connected)
- ✅ Standard search uses public APIs
- ✅ No local storage of credentials
- ✅ HTTPS recommended

## Future Enhancements

Possible improvements:
- [ ] Custom AI model selection
- [ ] Save favorite searches
- [ ] Search history with AI
- [ ] Personalized AI ranking
- [ ] Advanced Puter features
- [ ] A/B testing AI vs standard

## Support

### Getting Help

1. **Check logs:** `[PuterAI]` in console
2. **Check button state:** Enabled/disabled/loading
3. **Test fallback:** Does standard search work?
4. **Check Puter:** Is Puter.js loaded?

### Common Issues

| Issue | Solution |
|-------|----------|
| Button disabled | Check Puter.js loaded |
| No AI results | Try standard search |
| No logs | Check console filter |
| Slow search | Normal for Puter AI |
| Fallback happening | Puter unavailable - normal |

---

## Summary

Your paper search now features:

✨ **AI Search** (Primary) → Intelligent results via Puter
🔍 **Standard Search** (Secondary) → Reliable fallback

Both work seamlessly with automatic fallback.

**Ready to use!** 🚀
