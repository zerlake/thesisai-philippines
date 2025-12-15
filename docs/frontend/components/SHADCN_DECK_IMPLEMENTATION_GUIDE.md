# shadcn-deck Integration Guide

## Overview

This project now includes a complete presentation deck system inspired by [shadcn-deck](https://github.com/consentdotio/shadcn-deck). It provides a modern, component-based presentation framework for the Defense PPT Coach and other tools.

## Features

✅ **Component-based slides** - Build presentations with reusable React components  
✅ **Multiple slide types** - Title, Content, and extensible template system  
✅ **Speaker notes** - Keep track of talking points for each slide  
✅ **Responsive design** - Presentations look great on any device  
✅ **Dark mode support** - Light/dark theme options  
✅ **Keyboard navigation** - Navigate with arrow keys, space, and shortcuts  
✅ **Fullscreen mode** - Immersive presentation experience  
✅ **Auto-advance** - Optional automatic slide progression  
✅ **Presentation mode** - Focused presentation view without UI chrome  

## Architecture

### Core Files

#### `src/lib/presentation-deck.ts`
Core type definitions and utilities:
- `PresentationSlide` - Slide definition interface
- `DeckConfig` - Presentation configuration
- `PresentationState` - Navigation and UI state
- Helper functions for slide management

#### `src/components/presentation-deck/`
Main presentation components:

- **`deck.tsx`** - Main deck component with full features
  - Manages slide navigation and state
  - Handles keyboard shortcuts
  - Provides UI controls and speaker notes
  
- **`slide-renderer.tsx`** - Renders individual slides
  - Applies theme styling
  - Shows slide counter
  
- **`speaker-notes.tsx`** - Speaker notes sidebar
  - Displays presenter notes
  - Shows current slide context
  
- **`slide-navigation.tsx`** - Slide navigation controls
  - Jump to specific slide
  - Shows current/total slides
  
- **`presentation-controls.tsx`** - Control buttons
  - Toggle notes, fullscreen, presentation mode
  - Auto-advance toggle

#### `src/components/presentation-deck/slides/`
Reusable slide templates:

- **`title-slide.tsx`** - Title slide with optional subtitle
- **`content-slide.tsx`** - Content slide with bullets and sections

### Integration with Defense PPT Coach

#### `src/components/defense-ppt/presentation-mode.tsx`
Converts Defense Plan data to presentation slides:
- Maps defense plan slides to presentation slides
- Handles title slide creation
- Manages theme and metadata

#### Updated `src/app/defense-ppt-coach/page.tsx`
New "Present" tab that launches full presentation mode with:
- Full-screen presentation view
- Speaker notes
- Keyboard controls
- Auto-advance support

### Hooks

#### `src/hooks/usePresentationDeck.ts`
Custom hook for managing presentation state:
- Add/remove slides
- Update slide content
- Reorder slides
- Export deck configuration

## Usage

### Basic Implementation

```typescript
import { Deck } from '@/components/presentation-deck/deck';
import { createSlideDefinition } from '@/lib/presentation-deck';
import { TitleSlide, ContentSlide } from '@/components/presentation-deck/slides';

// Create slide definitions
const slides = [
  createSlideDefinition({
    slug: 'title',
    title: 'My Presentation',
    component: TitleSlide,
    notes: 'Opening remarks',
    metadata: {
      subtitle: 'A great presentation',
      duration: 60,
    },
  }),
  createSlideDefinition({
    slug: 'content-1',
    title: 'Key Points',
    component: ContentSlide,
    notes: 'Discuss these points in detail',
    metadata: {
      duration: 120,
      bullets: [
        'First important point',
        'Second important point',
        'Third important point',
      ],
    },
  }),
];

// Render the deck
export function MyPresentation() {
  return (
    <Deck
      slides={slides}
      title="My Presentation"
      subtitle="Q4 2024"
      showNotes={true}
      theme="light"
    />
  );
}
```

### Creating Custom Slide Components

```typescript
// src/components/presentation-deck/slides/custom-slide.tsx
import type { PresentationSlide } from '@/lib/presentation-deck';

interface CustomSlideProps {
  slide: PresentationSlide;
  theme?: 'light' | 'dark';
}

export function CustomSlide({ slide, theme = 'light' }: CustomSlideProps) {
  const { data } = slide.metadata as any;

  return (
    <div className={`p-12 ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
      <h1 className="text-4xl font-bold">{slide.title}</h1>
      <div className="mt-8">
        {/* Custom content */}
        {data && <CustomContent data={data} />}
      </div>
    </div>
  );
}
```

Then use it:

```typescript
createSlideDefinition({
  slug: 'custom',
  title: 'Custom Slide',
  component: CustomSlide,
  metadata: {
    duration: 120,
    data: { /* your data */ },
  },
})
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `→` or `Space` | Next slide |
| `←` | Previous slide |
| `N` | Toggle speaker notes |
| `P` | Toggle presentation mode |
| `Ctrl+F` / `Cmd+F` | Toggle fullscreen |

## Integration Points

### Defense PPT Coach

The "Present" tab now provides:
1. Full presentation view with slides from your Defense Plan
2. Speaker notes from your slide notes
3. Keyboard shortcuts for easy navigation
4. Auto-advance timer (optional)
5. Fullscreen presentation mode

### Other Tools

The presentation deck system can be used in:
- **Research Gap Analyzer** - Present research findings
- **Topic Ideas Generator** - Pitch ideas with slide decks
- **Literature Review Tool** - Present review structures
- **Statistical Analysis** - Show analysis results with visualizations
- **General QA Framework** - Practice presentations with Q&A

## Extending the System

### Adding New Slide Types

1. Create a new slide component:
```typescript
// src/components/presentation-deck/slides/code-slide.tsx
export function CodeSlide({ slide, theme }: Props) {
  const { code, language } = slide.metadata;
  return (
    <div>
      <h2>{slide.title}</h2>
      <CodeBlock code={code} language={language} />
    </div>
  );
}
```

2. Use it in slide definitions:
```typescript
createSlideDefinition({
  slug: 'code-example',
  title: 'Code Example',
  component: CodeSlide,
  metadata: {
    code: 'const x = 5;',
    language: 'typescript',
  },
})
```

### Customizing Themes

Edit the Deck component's theme handling or extend it:

```typescript
<Deck
  slides={slides}
  theme="dark"  // Built-in: 'light' | 'dark'
  customTheme={{
    background: '#1a1a1a',
    text: '#ffffff',
    accent: '#3b82f6',
  }}
/>
```

### Adding Animations

The system uses Tailwind CSS transitions. Extend slide components:

```typescript
<div className="animate-fade-in">
  {/* Animated content */}
</div>
```

## Files Created

```
src/
├── lib/
│   └── presentation-deck.ts              (Core types and utilities)
├── components/
│   └── presentation-deck/
│       ├── deck.tsx                      (Main deck component)
│       ├── slide-renderer.tsx            (Slide rendering)
│       ├── speaker-notes.tsx             (Notes sidebar)
│       ├── slide-navigation.tsx          (Navigation controls)
│       ├── presentation-controls.tsx     (Control buttons)
│       └── slides/
│           ├── title-slide.tsx           (Title slide template)
│           └── content-slide.tsx         (Content slide template)
│   ├── defense-ppt/
│   │   └── presentation-mode.tsx         (Defense plan integration)
│   └── ui/
│       └── tooltip.tsx                   (UI tooltip component)
└── hooks/
    └── usePresentationDeck.ts            (State management hook)
```

## Keyboard Shortcuts Explained

### Navigation
- **Arrow Right / Space** - Move to next slide
- **Arrow Left** - Move to previous slide
- Click slide number to jump directly to that slide

### Controls
- **N** - Toggle speaker notes sidebar
- **P** - Toggle presentation mode (removes UI, shows only slide)
- **Ctrl+F / Cmd+F** - Toggle fullscreen
- Auto-advance button - Enable/disable automatic progression

### Presentation Mode
In presentation mode:
- Keyboard shortcuts still work
- UI controls are hidden
- Only the slide is visible
- Perfect for presenting on a projector

## Performance Considerations

- Slides are lazy-loaded only when navigating to them
- Speaker notes are optional and can be toggled off
- Theme changes are CSS-based for smooth transitions
- No heavy animations or re-renders on navigation

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Future Enhancements

Potential additions:
- [ ] Slide transitions (fade, slide, zoom)
- [ ] Custom animations per slide
- [ ] Video/audio integration
- [ ] Live polling/Q&A during presentation
- [ ] Presenter console with timer
- [ ] Slide thumbnails sidebar
- [ ] Export to PDF/video
- [ ] Multi-display support (presenter view)
- [ ] Touch gesture controls
- [ ] Slide themes gallery

## Troubleshooting

### Slides not showing
- Ensure slide component is properly exported
- Check metadata structure matches slide component props
- Verify slides array is not empty

### Keyboard shortcuts not working
- Check that window has focus
- Browser may intercept some shortcuts (Ctrl+F, etc.)
- Some keyboard layouts may affect key detection

### Theme not applying
- Verify theme prop is passed to Deck
- Check Tailwind CSS is configured correctly
- Clear Next.js cache: `rm -rf .next`

### Presentation mode issues
- Fullscreen may be blocked by browser
- Check browser console for errors
- Ensure slide components are properly typed

## Related Documentation

- [Defense PPT Coach Guide](./DEFENSE_PPT_COACH_GUIDE.md)
- [shadcn-deck GitHub](https://github.com/consentdotio/shadcn-deck)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Radix UI Primitives](https://www.radix-ui.com/)
