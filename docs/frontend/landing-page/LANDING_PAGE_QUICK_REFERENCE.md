# Landing Page Quick Reference

## Files Modified

| File | Changes | Purpose |
|------|---------|---------|
| `src/components/landing-header.tsx` | Mobile menu, gradient logo, enhanced nav | Professional header with mobile support |
| `src/components/landing-footer.tsx` | Multi-column layout, social links, trust badges | Enterprise footer structure |
| `src/components/landing/hero-section.tsx` | Badge, stats, improved animations | Stronger value proposition |
| `src/components/landing/features-section.tsx` | Card redesign, stats section | Showcase 13+ features |
| `src/components/how-it-works-section.tsx` | 4-step journey, benefits, CTA | Clear research journey |
| `src/components/faq-section.tsx` | Search, category badges, Q&A formatting | Professional FAQ section |
| `src/components/ai-toolkit-section.tsx` | Security section, stats, benefits | Trust + AI positioning |

---

## Design Quick Copy-Paste

### Primary CTA Button
```jsx
<Button
  size="lg"
  asChild
  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-2xl hover:shadow-purple-500/50 transition-all h-12 px-8 text-base font-semibold"
>
  <Link href="/register">Get Started Free</Link>
</Button>
```

### Secondary Button
```jsx
<Button
  size="lg"
  variant="outline"
  asChild
  className="border border-slate-600 text-white hover:bg-slate-800 h-12 px-8 text-base font-semibold"
>
  <Link href="#features">Explore Features</Link>
</Button>
```

### Feature Card
```jsx
<div className="group relative overflow-hidden rounded-xl bg-slate-800/50 border border-slate-700/50 p-8 hover:border-slate-600/50 transition-all hover:shadow-xl hover:shadow-purple-500/10">
  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
  <div className="relative">
    {/* Content here */}
  </div>
</div>
```

### Icon Container
```jsx
<div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 group-hover:from-blue-500/40 group-hover:to-purple-600/40 transition-colors">
  <span className="text-blue-400 group-hover:text-blue-300 transition-colors">
    <Icon className="h-8 w-8" />
  </span>
</div>
```

### Section Header
```jsx
<div className="mx-auto mb-16 max-w-3xl text-center">
  <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
    Your Heading
  </h2>
  <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto">
    Your description
  </p>
</div>
```

### CTA Section
```jsx
<div className="mt-16 p-8 md:p-12 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-blue-500/20 text-center">
  <h3 className="text-2xl font-bold text-white mb-3">Heading</h3>
  <p className="text-slate-300 mb-6">Description</p>
  <Button asChild>
    <Link href="#">Action</Link>
  </Button>
</div>
```

---

## Colors Reference

```
Gradients:
  from-blue-500 to-purple-600     (Primary)
  from-blue-400 via-purple-500 to-pink-500   (Heading)
  from-blue-500/20 to-purple-600/20   (Icon background)
  from-blue-500/10 to-purple-600/10   (Section background)

Text:
  text-white              (Primary)
  text-slate-300          (Secondary)
  text-slate-400          (Tertiary)
  text-blue-400           (Accent)

Background:
  bg-slate-900            (Darkest)
  bg-slate-800/50         (Semi-transparent)
  bg-slate-900/50         (More transparent)

Borders:
  border-slate-700/50     (Subtle)
  border-slate-600/50     (Hover)
  border-blue-500/20      (Accent)

Shadows:
  shadow-purple-500/50    (On hover)
  shadow-purple-500/10    (Card hover)
```

---

## Spacing Cheat Sheet

```
Sections:        py-12  |  py-16  |  py-20  |  py-24
Cards:           p-6    |  p-8    |  p-12
Gaps:            gap-3  |  gap-4  |  gap-6  |  gap-8
Margins:         mt-4   |  mt-6   |  mb-12  |  mb-16
Button Height:   h-12 (48px)
Icon Size:       w-6 h-6  |  w-8 h-8  |  w-16 h-16
```

---

## Responsive Classes

```
Mobile First:
  Default = Mobile (320px)
  md:      = Tablet (768px)
  lg:      = Desktop (1024px)
  xl:      = Large (1280px)

Common Patterns:
  text-sm md:text-base          // Text size progression
  grid-cols-1 md:grid-cols-2 lg:grid-cols-3   // Grid progression
  py-12 md:py-16 lg:py-24       // Padding progression
  px-4 lg:px-8                  // Horizontal padding
```

---

## Hover & Animation

```
Hover Classes:
  hover:border-slate-600/50       (Border change)
  hover:text-white                (Text color)
  hover:bg-slate-800              (Background)
  hover:text-blue-400             (Accent color)
  hover:from-blue-500/40          (Gradient change)
  group-hover:opacity-100         (Parent hover effect)

Transitions:
  transition-all              (All properties)
  transition-colors           (Color only)
  transition-opacity          (Opacity only)
  duration-300                (Default 300ms)

Shadows:
  hover:shadow-xl hover:shadow-purple-500/50   (Large colored shadow)
  hover:shadow-lg hover:shadow-purple-500/10   (Subtle colored shadow)
```

---

## Common Patterns

### Badge
```jsx
<span className="text-sm font-semibold text-blue-300 bg-blue-500/10 px-4 py-2 rounded-full">
  Label
</span>
```

### Gradient Text
```jsx
className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500"
```

### Stat Box
```jsx
<div>
  <p className="text-sm text-slate-400">Label</p>
  <p className="text-3xl font-bold text-blue-400">123</p>
  <p className="text-xs text-slate-500">Description</p>
</div>
```

### List Item with Icon
```jsx
<li className="flex items-center gap-3 text-slate-300">
  <Icon className="w-5 h-5 text-green-400 flex-shrink-0" />
  Text
</li>
```

### Group Hover Gradient Text
```jsx
className="group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-500 transition-all"
```

---

## Section Padding Standards

```
Hero:         py-20 md:py-32 lg:py-40
Features:     py-16 md:py-24
How It Works:  py-16 md:py-24
FAQ:          py-16 md:py-24
Footer:       py-12 md:py-16 lg:py-20
```

---

## Typography Standards

```
H1 (Main):     text-5xl md:text-7xl font-black
H2 (Section):  text-3xl md:text-5xl font-bold
H3 (Card):     text-xl font-bold
H4 (Small):    text-lg font-semibold
P (Body):      text-base text-slate-300
P (Small):     text-sm text-slate-400
P (Tiny):      text-xs text-slate-500
```

---

## Grid Patterns

```
3-Column:     grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
2-Column:     grid-cols-1 md:grid-cols-2 gap-8
4-Column:     grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6
2x2 Cols:     md:grid-cols-2 gap-8
```

---

## Adding New Sections

Template:
```jsx
export function SectionName() {
  return (
    <section className="py-16 md:py-24 bg-slate-900">
      <div className="container">
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
            Title
          </h2>
          <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto">
            Description
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Card/Item */}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Button>Action</Button>
        </div>
      </div>
    </section>
  );
}
```

---

## Common Updates

### Change Section Background
```
bg-slate-900    →  bg-slate-800
bg-slate-800    →  bg-gradient-to-b from-slate-900 to-slate-800
```

### Change Button Style
Replace the entire className with:
```jsx
Primary:    bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-2xl hover:shadow-purple-500/50
Secondary:  border border-slate-600 text-white hover:bg-slate-800
Ghost:      text-slate-300 hover:text-white hover:bg-slate-800
```

### Change Grid Columns
```
gap-6 md:grid-cols-2 lg:grid-cols-3    →  gap-8 md:grid-cols-2 lg:grid-cols-4
grid-cols-1 md:grid-cols-2              →  grid-cols-1 md:grid-cols-2 lg:grid-cols-3
```

### Add Hover Effect
```
border border-slate-700/50    →    border border-slate-700/50 hover:border-slate-600/50 hover:shadow-lg hover:shadow-purple-500/10
```

---

## Testing Checklist

- [ ] All links work
- [ ] Buttons are clickable
- [ ] Mobile responsive (320px, 768px, 1024px)
- [ ] Hover effects visible
- [ ] Animations smooth
- [ ] Colors have proper contrast
- [ ] Text is readable
- [ ] Images load properly
- [ ] No console errors
- [ ] Accessibility check (keyboard nav)

---

## Performance Tips

1. **Lazy load images**: Use Next.js Image component
2. **Optimize animations**: Use Framer Motion with proper config
3. **Code split sections**: Import dynamically if needed
4. **Use CSS over JS**: Leverage Tailwind for styling
5. **Responsive images**: Proper srcSet and sizes attributes

---

## Browser Support

✅ Chrome 90+  
✅ Firefox 88+  
✅ Safari 14+  
✅ Edge 90+  
✅ Mobile browsers (iOS Safari, Chrome Mobile)  

---

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Text not visible | Add text-white or text-slate-300 |
| Button not clickable | Check z-index or pointer-events |
| Border not showing | Use border border-color, not just border-color |
| Hover effect not working | Ensure parent has group class if using group-hover |
| Mobile layout broken | Check responsive classes (md:, lg:) |
| Animation laggy | Reduce animation duration or complexity |
| Colors not matching | Use exact Tailwind class names |

---

## Quick Update Commands

### To modify a section color:
Find: `bg-slate-900`
Replace: `bg-slate-800`

### To add margin:
`className="mt-6"` → `className="mt-8"`

### To change button text:
Look for button text between `<>` and update

### To add new link:
```jsx
<Link href="/path" className="...">Label</Link>
```

---

## Resource Links

- Tailwind CSS: https://tailwindcss.com
- Framer Motion: https://www.framer.com/motion/
- Lucide Icons: https://lucide.dev/
- Color Tools: https://chir.ps/

---

This quick reference is designed for rapid updates and maintenance. Keep it handy for all landing page modifications!
