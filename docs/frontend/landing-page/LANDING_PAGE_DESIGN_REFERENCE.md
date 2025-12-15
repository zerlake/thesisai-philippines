# Landing Page Design Reference Guide

## Design System Overview

### Color Palette
```
Primary Gradient: blue-500 → purple-600
Secondary Gradient: blue-500 → pink-500
Accent Colors: 
  - Blue: #3B82F6 (blue-500)
  - Purple: #9333EA (purple-600)
  - Green: #4ADE80 (green-400)
  - Yellow: #FACC15 (yellow-400)

Background:
  - Dark: #0F172A (slate-900)
  - Medium: #1E293B (slate-800)
  - Light: #334155 (slate-700)

Text:
  - Primary: #FFFFFF (white)
  - Secondary: #CBD5E1 (slate-300)
  - Tertiary: #94A3B8 (slate-400)
```

---

## Component Styles

### Buttons

#### Primary CTA Button
```jsx
className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-2xl hover:shadow-purple-500/50 transition-all h-12 px-8 text-base font-semibold"
```
- Gradient background
- Large shadow on hover
- Rounded corners
- Full height 48px

#### Secondary Button
```jsx
className="border border-slate-600 text-white hover:bg-slate-800 h-12 px-8 text-base font-semibold"
```
- Outline style
- Slate border
- Subtle background on hover
- Same sizing as primary

#### Ghost Button
```jsx
className="text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
```
- Transparent background
- Color change on hover
- Light text with good contrast

---

### Cards

#### Feature Card
```jsx
className="group relative overflow-hidden rounded-xl bg-slate-800/50 border border-slate-700/50 p-8 hover:border-slate-600/50 transition-all hover:shadow-xl hover:shadow-purple-500/10"
```
- Semi-transparent background
- Subtle border
- 32px padding
- Purple shadow on hover
- Group hover for children effects

#### Step Card
```jsx
className="p-6 md:p-8 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:border-slate-600/50 transition-all h-full flex flex-col"
```
- Responsive padding
- Full height for alignment
- Flex column for content flow
- Proper spacing between elements

#### FAQ Category Card
```jsx
className="bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/50 transition-colors overflow-hidden"
```
- Subtle hover effects
- No shadow, just border change
- Clean overflow hidden

---

### Icons

#### Icon Background
```jsx
className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 group-hover:from-blue-500/40 group-hover:to-purple-600/40 transition-colors"
```
- Square with rounded corners (xl)
- Size: 64px × 64px
- Semi-transparent gradient
- Darker on hover
- Color transition for smooth effect

#### Icon Wrapper
```jsx
className="text-blue-400 group-hover:text-blue-300 transition-colors"
```
- Standard icon size
- Blue color with slightly brighter hover
- Smooth color transition

---

### Badges

#### Feature Badge
```jsx
className="inline-block text-xs font-semibold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full"
```
- Tiny text (xs)
- Full rounded corners
- Blue text on blue background (transparent)
- Used for premium labels

#### Category Badge
```jsx
className="text-sm font-semibold text-blue-300 bg-blue-500/10 px-4 py-2 rounded-full"
```
- Slightly larger
- Lighter text
- Typical padding
- Used for section labels

---

### Sections

#### Light Section
```jsx
className="bg-slate-900"
```
- Darkest background

#### Dark Section
```jsx
className="bg-slate-800"
```
- Medium dark background

#### Gradient Section
```jsx
className="bg-gradient-to-b from-slate-900 to-slate-800"
```
- Gradient flow for visual interest

#### Accent Section
```jsx
className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-blue-500/20"
```
- Subtle gradient
- Colored border for emphasis
- Used for CTAs and highlights

---

### Typography

#### Page Title
```jsx
className="text-3xl md:text-5xl font-bold tracking-tight text-white"
```
- 30px mobile → 48px desktop
- Bold weight
- Tight letter spacing
- Full white

#### Heading
```jsx
className="text-2xl font-bold text-white"
```
- 24px
- Bold weight
- White text

#### Subheading
```jsx
className="text-xl font-semibold text-white"
```
- 20px
- Semibold weight
- White text

#### Body Text
```jsx
className="text-base text-slate-300"
```
- 16px
- Normal weight
- Slate-300 color

#### Small Text
```jsx
className="text-sm text-slate-400"
```
- 14px
- Normal weight
- Lighter slate color

#### Extra Small Text
```jsx
className="text-xs text-slate-500"
```
- 12px
- Normal weight
- Even lighter slate

---

## Layout Patterns

### Section Header (Centered)
```jsx
<div className="mx-auto mb-16 max-w-3xl text-center">
  <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
    Heading
  </h2>
  <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto">
    Description
  </p>
</div>
```
- Max-width 48rem for title
- Margin-bottom 64px
- Center aligned
- Spacing: mt-6 for description

### 3-Column Grid
```jsx
className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
```
- 1 column mobile
- 2 columns tablet
- 3 columns desktop
- 24px gap between items

### 2-Column Grid
```jsx
className="grid md:grid-cols-2 gap-8"
```
- 1 column mobile
- 2 columns desktop
- 32px gap

---

## Spacing System

```
Section Padding:
  - Small: py-12
  - Medium: py-16 md:py-20
  - Large: py-16 md:py-24

Component Padding:
  - Cards: p-6 to p-12
  - Buttons: px-8 (horizontal) / h-12 (height)

Gaps:
  - Tight: gap-3
  - Normal: gap-4 to gap-6
  - Loose: gap-8
```

---

## Animation Guidelines

### Hover Effects
```jsx
transition-all          // Smooth all changes
transition-colors       // Only color changes
transition-opacity      // Only opacity changes
duration-300           // 300ms duration (default)
```

### Shadow Effects
```jsx
hover:shadow-xl hover:shadow-purple-500/50    // Large colored shadow
hover:shadow-lg hover:shadow-purple-500/20    // Medium colored shadow
```

### Group Hover
```jsx
group hover:text-blue-400              // Change text color on parent hover
group-hover:from-blue-500/40           // Change gradient on parent hover
```

---

## Responsive Breakpoints

```
Mobile First Approach:
  Default: Mobile (320px+)
  md:      Tablet (768px+)
  lg:      Desktop (1024px+)
  xl:      Large Desktop (1280px+)

Examples:
  text-sm md:text-base           // Small on mobile, normal on tablet+
  p-6 md:p-8 lg:p-12            // Progressive padding increase
  grid-cols-1 md:grid-cols-2    // 1 column mobile, 2 columns tablet+
```

---

## Visual Hierarchy

### Hero Section
1. Badge (smallest)
2. Headline (largest, gradient)
3. Subheading (large)
4. Stats (medium)
5. CTA buttons (prominent)
6. Trust statement (small)

### Feature Cards
1. Icon (center focus)
2. Title (headline)
3. Description (body)
4. Badge (bottom emphasis)

### FAQ Section
1. Section title (large)
2. Search bar (prominent)
3. Category cards (organized)
4. Q&A content (readable)
5. CTA section (strong finish)

---

## Best Practices Applied

### Contrast
- Text: Always 4.5:1 minimum ratio
- Icons: Proper contrast with backgrounds
- Borders: Subtle but visible

### Spacing
- Consistent gutters (gaps)
- Breathing room around content
- Hierarchical white space

### Interactive States
- Hover: Color change or shadow
- Focus: Clear visual indication
- Active: Distinct styling

### Color Usage
- Primary: Brand colors (blue/purple)
- Secondary: Accent colors
- Neutrals: Slate for backgrounds
- Success: Green for affirmations

### Typography
- Hierarchy: Clear size progression
- Readability: Proper line heights
- Contrast: Dark text on light, light text on dark

---

## Implementation Tips

### For Developers
1. Use Tailwind classes as shown
2. Maintain the gradient system
3. Keep spacing consistent
4. Use hover effects strategically
5. Test responsive behavior

### For Designers
1. Respect the color palette
2. Maintain visual hierarchy
3. Use the grid system
4. Apply consistent spacing
5. Test accessibility

### For Content
1. Keep headlines concise
2. Use descriptive subheadings
3. Break text into chunks
4. Use bullet points for lists
5. Include strong CTAs

---

## Common Patterns Used

### Button with Icon and Arrow
```jsx
<Link href="#" className="flex items-center gap-2">
  Text
  <Icon className="w-5 h-5" />
</Link>
```

### Gradient Text
```jsx
className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500"
```

### Badge with Icon
```jsx
<div className="flex items-center gap-2">
  <Icon className="w-4 h-4" />
  <span>Label</span>
</div>
```

### Stat Box
```jsx
<div>
  <p className="text-sm text-slate-400">Label</p>
  <p className="text-3xl font-bold text-blue-400">Value</p>
  <p className="text-xs text-slate-500">Description</p>
</div>
```

---

## Accessibility Checklist

✅ Color contrast ratios  
✅ Semantic HTML  
✅ ARIA labels  
✅ Keyboard navigation  
✅ Focus indicators  
✅ Alt text for images  
✅ Motion preferences respected  
✅ Touch targets 44px+ height  

---

## Testing Specifications

### Colors
- Primary gradient visible and distinct
- Text readable on all backgrounds
- Icons clearly visible

### Layout
- Mobile: Single column, proper stacking
- Tablet: Multi-column, balanced spacing
- Desktop: Full width usage, proper alignment

### Interactions
- Buttons clickable and responsive
- Hover states visible
- Transitions smooth
- No janky animations

### Typography
- Headings scale properly
- Body text readable
- Line heights appropriate

---

## Future Customization

To customize colors globally:
1. Update the color variables in the `tailwind.config.ts`
2. Replace gradient instances throughout components
3. Test all sections for proper contrast
4. Verify animations still look smooth

To adjust spacing:
1. Modify padding values (p-6, p-8, p-12)
2. Update gap values between grid items
3. Adjust section padding (py-12, py-16, py-24)
4. Maintain responsive scaling with md: and lg: prefixes

---

This design system provides a professional, modern, enterprise-grade aesthetic that builds trust and guides users through the customer journey effectively.
