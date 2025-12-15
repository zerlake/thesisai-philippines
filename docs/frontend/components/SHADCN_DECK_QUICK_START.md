# shadcn-deck Quick Start

## What's New?

Defense PPT Coach now has a full **"Present"** tab with:
- Professional presentation view
- Speaker notes on the side
- Keyboard navigation
- Fullscreen mode
- Auto-advance timer

## How to Use in Defense PPT Coach

1. Create or open a Defense Plan
2. Click the **"Present"** tab
3. Use:
   - **Arrow keys** or **Space** to navigate
   - **N** to show/hide notes
   - **P** for presentation mode
   - **Ctrl+F** for fullscreen

## Creating a Custom Presentation

```typescript
import { Deck } from '@/components/presentation-deck/deck';
import { createSlideDefinition } from '@/lib/presentation-deck';
import { TitleSlide, ContentSlide } from '@/components/presentation-deck/slides';

const slides = [
  createSlideDefinition({
    slug: 'intro',
    title: 'My Topic',
    component: TitleSlide,
    notes: 'Start with a hook',
    metadata: { subtitle: 'Subtitle here', duration: 60 },
  }),
  createSlideDefinition({
    slug: 'main',
    title: 'Key Points',
    component: ContentSlide,
    notes: 'Elaborate on each point',
    metadata: {
      bullets: ['Point 1', 'Point 2', 'Point 3'],
      duration: 120,
    },
  }),
];

export function MyPresentation() {
  return (
    <Deck
      slides={slides}
      title="My Presentation"
      showNotes={true}
      theme="light"
    />
  );
}
```

## Key Functions

### `createSlideDefinition(config)`
Creates a typed slide definition.

**Parameters:**
- `slug` - Unique identifier
- `title` - Slide title
- `component` - React component to render
- `notes` - Speaker notes (optional)
- `metadata` - Custom data passed to component

**Returns:** `PresentationSlide`

### `Deck` Component
Main presentation component.

**Props:**
- `slides` - Array of PresentationSlide
- `title` - Presentation title
- `subtitle` - Optional subtitle
- `showNotes` - Show speaker notes (default: false)
- `theme` - 'light' or 'dark'
- `autoAdvance` - Auto-advance slides (default: false)
- `autoAdvanceDelay` - Delay in ms (default: 5000)

## Built-in Slide Types

### TitleSlide
For opening slides.

```typescript
createSlideDefinition({
  component: TitleSlide,
  metadata: {
    subtitle: 'Optional subtitle',
  },
})
```

### ContentSlide
For content with bullets.

```typescript
createSlideDefinition({
  component: ContentSlide,
  metadata: {
    bullets: ['Point 1', 'Point 2', 'Point 3'],
    // OR
    sections: [
      {
        title: 'Section 1',
        items: ['Item 1', 'Item 2'],
      },
    ],
  },
})
```

## Making Custom Slides

1. Create a component:

```typescript
// slides/my-slide.tsx
export function MySlide({ slide, theme }: Props) {
  const { customData } = slide.metadata;
  return (
    <div className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}>
      <h1>{slide.title}</h1>
      {/* Your content */}
    </div>
  );
}
```

2. Use it:

```typescript
createSlideDefinition({
  component: MySlide,
  metadata: { customData: 'value' },
})
```

## Keyboard Commands

| Key | Action |
|-----|--------|
| `→` or `Space` | Next slide |
| `←` | Previous slide |
| `N` | Toggle notes |
| `P` | Presentation mode |
| `Ctrl+F` | Fullscreen |
| Click number | Jump to slide |

## Using `usePresentationDeck` Hook

```typescript
import { usePresentationDeck } from '@/hooks/usePresentationDeck';

function MyEditor() {
  const {
    slides,
    addSlide,
    removeSlide,
    updateSlide,
    reorderSlides,
    exportDeck,
  } = usePresentationDeck([]);

  return (
    <>
      {slides.map((slide) => (
        <button key={slide.id} onClick={() => removeSlide(slide.id)}>
          Remove {slide.title}
        </button>
      ))}
      <button
        onClick={() =>
          addSlide(
            createSlideDefinition({
              slug: 'new',
              title: 'New Slide',
              component: ContentSlide,
            })
          )
        }
      >
        Add Slide
      </button>
    </>
  );
}
```

## Integration Checklist

- [x] Defense PPT Coach "Present" tab
- [ ] Research Gap Analyzer presentations
- [ ] Topic Ideas Generator pitches
- [ ] Literature Review structures
- [ ] Statistical Analysis results
- [ ] Custom tool presentations

## Files to Know

```
src/lib/presentation-deck.ts         ← Types and utilities
src/components/presentation-deck/    ← Main deck system
src/components/defense-ppt/presentation-mode.tsx  ← Defense integration
src/hooks/usePresentationDeck.ts     ← State management
```

## Tips

1. **Speaker Notes**: Add detailed notes for each slide
2. **Timing**: Set duration metadata for time-aware presentations
3. **Reusability**: Create custom slide components once, use everywhere
4. **Themes**: Use 'dark' theme for projector presentations
5. **Keyboard**: Keyboard shortcuts work even in presentation mode

## Examples in Codebase

- **Defense PPT Coach**: `/defense-ppt-coach` → "Present" tab
- **Sample Presentations**: Check `/src/lib/defense-ppt-samples.ts`

## Need Help?

See `SHADCN_DECK_IMPLEMENTATION_GUIDE.md` for detailed docs and examples.
