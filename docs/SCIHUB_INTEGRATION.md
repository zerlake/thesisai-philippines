# Sci-Hub Integration Guide

## Overview

ThesisAI includes an optional Sci-Hub integration that allows users to unlock paywalled research papers when official sources are unavailable. This feature is designed to support academic research while respecting legal and ethical guidelines.

## Features

- **Domain Rotation**: Automatically tries multiple Sci-Hub mirrors (sci-hub.se, sci-hub.st, sci-hub.ru)
- **DOI Extraction**: Automatically extracts DOI from paper metadata when available
- **Legal Disclaimer**: Users must acknowledge a legal notice before accessing papers
- **Server-Side Processing**: Handles CORS issues and domain rotation server-side for reliability
- **Error Handling**: Graceful fallback when mirrors are unavailable

## Architecture

### Components

1. **`src/lib/scihub-integration.ts`** - Core utility functions
   - `unlockPDFFromSciHub()` - Main unlock function
   - `extractDOI()` - Parse DOI from text
   - `extractDOIFromPaper()` - Extract DOI from paper object
   - `downloadPDF()` - Download PDF locally

2. **`src/hooks/use-scihub.ts`** - React hook
   - `useScihub()` - Hook for managing unlock operations

3. **`src/components/scihub-unlock-button.tsx`** - UI Component
   - `SciHubUnlockButton` - Interactive unlock button with legal disclaimer

4. **`src/app/api/papers/unlock/route.ts`** - Server API
   - Handles domain rotation and CORS
   - Converts PDF to base64 for transmission
   - Implements mirror fallback logic

### Data Flow

```
User clicks "Unlock PDF" button
    ↓
Legal disclaimer dialog appears
    ↓
User confirms
    ↓
Sends DOI to /api/papers/unlock
    ↓
Server tries mirrors in sequence
    ↓
Returns base64-encoded PDF
    ↓
Client converts to blob and opens in new window
```

## Usage

### In Literature Review Component

```tsx
import { SciHubUnlockButton } from '@/components/scihub-unlock-button';

// In your paper card:
<SciHubUnlockButton paper={paper} variant="outline" />
```

### In Custom Components

```tsx
import { useScihub } from '@/hooks/use-scihub';

function MyComponent() {
  const { isUnlocking, error, unlockPDF, extractDOI } = useScihub();
  
  const handleUnlock = async () => {
    const result = await unlockPDF(doi);
    if (result.success) {
      window.open(result.url, '_blank');
    }
  };
  
  return (
    <button onClick={handleUnlock} disabled={isUnlocking}>
      {isUnlocking ? 'Unlocking...' : 'Unlock PDF'}
    </button>
  );
}
```

## Legal & Ethical Considerations

⚠️ **Important**: Before using this integration, understand:

1. **Jurisdiction-Specific**: Sci-Hub access legality varies by country
2. **Copyright**: Using Sci-Hub may violate copyright in some regions
3. **Fair Use**: This feature should be used for personal, non-commercial research only
4. **Disclaimer Required**: Users must see and acknowledge the legal notice

### Recommended Workflow

1. **Try legal sources first**:
   - Check if paper is open-access on ArXiv
   - Search PubMed Central
   - Check publisher's open-access options
   - Request from ResearchGate or authors

2. **Use Sci-Hub as fallback**: Only when legal options are unavailable

3. **Respect copyright**: Use for personal research only

## Configuration

### Mirror List

Edit `SCI_HUB_MIRRORS` in:
- `src/lib/scihub-integration.ts` (client-side)
- `src/app/api/papers/unlock/route.ts` (server-side)

```ts
const SCI_HUB_MIRRORS = [
  'https://sci-hub.se',      // Primary
  'https://sci-hub.st',      // Backup 1
  'https://sci-hub.ru',      // Backup 2
  // Add more as needed
];
```

## Error Handling

The system handles several failure scenarios:

| Scenario | Handling |
|----------|----------|
| Invalid DOI | Shows "No DOI" button, disabled |
| Mirror down | Tries next mirror automatically |
| All mirrors down | Shows error toast with helpful message |
| Network error | Displays error with retry option |
| CAPTCHA block | Error message with manual option |

## Troubleshooting

### "No DOI" on papers

Some papers may not have DOI in metadata. Users should:
1. Check paper directly for DOI
2. Use manual entry if supported
3. Fall back to manual download from legal sources

### Mirror timeouts

If Sci-Hub mirrors are slow or blocked:
1. Check `src/app/api/papers/unlock/route.ts`
2. Add faster mirrors to `SCI_HUB_MIRRORS`
3. Consider increasing fetch timeout

### CORS errors in browser

The integration uses server-side API to avoid CORS issues. If you still see CORS errors:
1. Check network tab in DevTools
2. Verify `/api/papers/unlock` is accessible
3. Check server logs for errors

## Testing

### Manual Testing

1. Open Literature Review
2. Search for any paper
3. Click "Unlock PDF" on a result
4. Confirm legal notice
5. Wait for unlock attempt
6. Verify PDF opens or error displays

### Automated Testing

```bash
# Test the unlock API
curl -X POST http://localhost:3000/api/papers/unlock \
  -H "Content-Type: application/json" \
  -d '{"doi": "10.1038/nature12373"}'
```

## Performance Notes

- **Server-side processing**: ~2-5 seconds per PDF
- **Mirror fallback**: ~10-15 seconds if first mirror is down
- **PDF blob conversion**: ~1 second for typical papers
- **Browser memory**: PDFs opened in new window, no local storage

## Security Considerations

1. **No server storage**: PDFs are not stored on server
2. **Base64 transmission**: PDFs transmitted as base64 in HTTPS
3. **User confirmation**: Legal disclaimer required before access
4. **No tracking**: No logging of DOIs or papers accessed
5. **Client-side deletion**: Blob URLs are revoked after use

## Future Enhancements

- [ ] Multiple PDF format support (EPUB, MOBI)
- [ ] Batch unlock for multiple papers
- [ ] Offline PDF storage (with Puter.js)
- [ ] Direct integration with reference managers (Zotero, Mendeley)
- [ ] Alternative open-access APIs (CORE, Unpaywall)
- [ ] Automatic paper classification (open-access vs paywall)
- [ ] Custom mirror configuration per user

## Related Resources

- [Sci-Hub Official](https://sci-hub.se)
- [Open Access Button](https://www.openaccessbutton.org)
- [Unpaywall API](https://unpaywall.org)
- [CORE API](https://core.ac.uk)
- [ThesisAI Documentation](./README.md)

## Support

For issues or questions:
1. Check this guide's Troubleshooting section
2. Review browser console for error messages
3. Check server logs: `pnpm dev` output
4. File an issue on GitHub with error details
