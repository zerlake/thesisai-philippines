# Font Assets

This directory contains font files used by the application. These fonts are referenced in the application's typography system.

## Available Fonts

- `outfit-variable.woff2` - Variable font for headings and display text
- `lora-variable.woff2` - Variable font for body text and reading content

These fonts are loaded via the Next.js font optimization system in `src/app/layout.tsx`:

```typescript
import { Outfit, Lora } from "next/font/google";
```

## Note

If these files are missing, ensure you have installed the Google Fonts locally or are referencing the hosted versions properly. The application may request these fonts from:

- `/fonts/outfit-variable.woff2`
- `/fonts/lora-variable.woff2`

The Next.js font optimization system should handle loading these automatically from Google Fonts.