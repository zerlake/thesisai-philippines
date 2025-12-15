# Sci-Hub Integration - Quick Start

## What You Get

An "Unlock PDF" button on every paper in the Literature Review that lets users access paywalled research via Sci-Hub with a legal disclaimer.

## For Users

### Using the Feature

1. **Search for papers** in Literature Review
2. **Click "Unlock PDF"** next to "View Source"
3. **Read & confirm** the legal notice
4. **Wait** ~2-5 seconds for unlock
5. **PDF opens** in new window

### Legal Notice

The system shows this before each unlock:
- ⚠️ Sci-Hub is unofficial
- Legal implications vary by jurisdiction
- Use only for personal research
- Prefer legal sources first

## For Developers

### File Structure

```
src/
├── lib/
│   └── scihub-integration.ts          # Core utilities
├── hooks/
│   └── use-scihub.ts                  # React hook
├── components/
│   ├── scihub-unlock-button.tsx       # UI component
│   └── literature-review.tsx          # Already integrated
├── app/api/papers/
│   └── unlock/route.ts                # Server endpoint
└── __tests__/scihub/
    └── scihub-integration.test.ts     # Unit tests

docs/
├── SCIHUB_INTEGRATION.md              # Full documentation
└── ...
```

### Integration Checklist

✅ Utilities created
✅ Hook created  
✅ Component created
✅ Server API created
✅ Literature Review integrated
✅ Documentation written
✅ Tests created
✅ Ready for deployment

### How to Use in Other Components

```tsx
import { useScihub } from '@/hooks/use-scihub';

export function MyPaperViewer({ paper }) {
  const { isUnlocking, error, unlockPDF, extractDOI } = useScihub();
  
  const handleUnlock = async () => {
    const doi = extractDOI(paper);
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

## Quick Test

### Manual
1. Run `pnpm dev`
2. Go to Literature Review
3. Search for any topic
4. Click "Unlock PDF" on a result
5. Confirm legal notice
6. Verify PDF opens or error shows

### Automated
```bash
# Test the API directly
curl -X POST http://localhost:3000/api/papers/unlock \
  -H "Content-Type: application/json" \
  -d '{"doi": "10.1038/nature12373"}'
```

## Configuration

### Change Mirrors (if needed)

Edit these two files with new mirror URLs:

**`src/lib/scihub-integration.ts`**
```ts
const SCI_HUB_MIRRORS = [
  'https://sci-hub.se',    // Change these
  'https://sci-hub.st',
  'https://sci-hub.ru',
];
```

**`src/app/api/papers/unlock/route.ts`**
```ts
const SCI_HUB_MIRRORS = [
  'https://sci-hub.se',    // Change these
  'https://sci-hub.st',
  'https://sci-hub.ru',
];
```

## Common Issues

### "No DOI" button showing

Some papers don't have DOI in metadata. Users can:
- Check the paper directly for DOI
- Use "View Source" to access it legally

### PDF won't unlock

If all mirrors are down:
- Check error message in browser console
- Try later (mirrors have uptime issues)
- Update mirror URLs if domains changed

### CORS errors

This should NOT happen because we use server API. If it does:
1. Check `/api/papers/unlock` is working
2. Check browser Network tab
3. Check server logs

## Performance

- Typical unlock: 2-5 seconds
- If first mirror down: 10-15 seconds
- PDF opens in new window (no storage)
- Works on all devices (desktop/mobile)

## Legal Notes

⚠️ **Before using in production:**

1. Understand Sci-Hub legality in your jurisdiction
2. Review terms of service implications
3. Legal disclaimer is mandatory (already included)
4. Use only for personal research (already stated)
5. Consider adding to privacy policy

## Documentation

For complete documentation:
- **Full guide**: `docs/SCIHUB_INTEGRATION.md`
- **Implementation details**: `SCIHUB_IMPLEMENTATION_SUMMARY.md`
- **Architecture**: See diagram in full guide

## Support Resources

- **Error troubleshooting**: `docs/SCIHUB_INTEGRATION.md#troubleshooting`
- **Code examples**: `docs/SCIHUB_INTEGRATION.md#usage`
- **Security info**: `docs/SCIHUB_INTEGRATION.md#security-considerations`
- **Testing guide**: `docs/SCIHUB_INTEGRATION.md#testing`

## Next Steps

1. Run `pnpm dev` and test manually
2. Review `docs/SCIHUB_INTEGRATION.md` for details
3. Run tests: `pnpm exec vitest src/__tests__/scihub/`
4. Deploy when ready
5. Monitor for mirror availability changes

## Support

For issues:
1. Check troubleshooting section above
2. Review browser console errors
3. Check API response: `curl http://localhost:3000/api/papers/unlock -X POST -H "Content-Type: application/json" -d '{"doi":"10.1038/nature12373"}'`
4. Review full documentation in `docs/SCIHUB_INTEGRATION.md`
