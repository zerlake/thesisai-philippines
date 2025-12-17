# Hero Section Background Image Prompt

## Overview
This document contains image generation prompts for the hero section background image. These prompts are designed to create professional, inspiring visuals that represent AI-powered thesis generation without relying on brain imagery.

## Primary Prompt

### Abstract Digital Landscape - Premium Edition

```
Abstract digital landscape of flowing light streams and geometric patterns in deep blue and purple tones, 
representing data and information flow. Elegant handwriting or manuscript pages subtly merging with soft 
glowing holographic text and code floating in the background. Modern, minimalist design with luminous gradients 
suggesting intellectual growth and academic knowledge. Floating papers and pages with soft depth of field, 
creating a sophisticated atmosphere of writing and research. No figures, no brains. Professional, inspiring, 
and suitable for an educational technology platform. High-end, premium aesthetic with soft lighting and 
elegant visual hierarchy.
```

**Best For:** Primary hero background, premium feel
**Color Palette:** Deep blue, purple, soft gold accents
**Style:** Modern, elegant, sophisticated
**Tone:** Inspiring, professional, academic

---

## Alternative Prompt

### Minimalist Ethereal Design

```
Sophisticated digital artwork: soft gradient background transitioning from midnight blue to deep purple. 
Delicate lines of light form abstract pathways suggesting knowledge connections and research progression. 
Subtle manuscript and document shapes dissolve into particles of light. Elegant, modern, and inspiring. 
Perfect for academic AI platform hero section. Ethereal quality without being cluttered. Professional 
and premium feel.
```

**Best For:** Clean, minimalist alternative
**Color Palette:** Midnight blue, purple, white/silver
**Style:** Ethereal, minimalist, abstract
**Tone:** Calming, aspirational, sophisticated

---

## Key Design Elements

### ✓ Included Themes
- Academic/thesis writing concepts
- AI and technology elements
- Data flow and information visualization
- Light, glow, and luminosity effects
- Manuscript and document imagery
- Knowledge growth and progression
- Professional, premium aesthetic
- Soft depth and layering

### ✗ Excluded Elements
- Brain imagery
- Human figures or faces
- Realistic people or avatars
- Overly technical/code-heavy visuals
- Cluttered or busy compositions
- Dark, ominous tones

---

## Recommended Image Generation Tools

### Tier 1 (Premium Quality)
- **Midjourney** - Best for artistic, premium results
- **DALL-E 3** - Excellent text-to-image understanding
- **Stable Diffusion (professional)** - High control and customization

### Tier 2 (Good Quality)
- **Adobe Firefly** - Integrated with design tools
- **Microsoft Designer** (Bing Image Creator) - Reliable quality

---

## Implementation Guidelines

### Dimensions & Resolution
- **Recommended Size:** 1920 x 1080px (or larger)
- **Format:** WebP, PNG, or JPEG
- **Compression:** Optimize for web without quality loss

### Integration Tips
1. Use as full-width background with overlay
2. Add semi-transparent dark overlay (30-40% opacity) for text readability
3. Ensure text contrast is sufficient (WCAG AA compliant)
4. Consider parallax effect for depth
5. Test on mobile devices for responsiveness

### Overlay Suggestion
```css
/* Optional overlay to enhance text readability */
background: linear-gradient(135deg, 
  rgba(15, 23, 42, 0.4) 0%, 
  rgba(30, 27, 75, 0.3) 100%);
```

---

## Customization Options

### If You Want More Emphasis On:

#### AI Elements
Add to prompt: "With subtle code snippets and algorithm visualizations"

#### Academic Writing
Add to prompt: "With elegant typography and handwritten text elements"

#### Data Flow
Add to prompt: "With interconnected nodes and flowing particle systems"

#### Minimalism
Remove: "Floating papers and pages" → "Subtle, sparse manuscript elements"

#### Warmth
Change colors: "Deep blue and purple" → "Warm gold, amber, and rose tones"

---

## Generation Parameters (if applicable)

### For Midjourney
```
--ar 16:9 --niji 6 --quality 2
```

### For DALL-E
- Model: DALL-E 3
- Size: 1792 x 1024 (16:9)
- Quality: HD
- Style: Natural

### For Stable Diffusion
- Steps: 30-50
- CFG Scale: 7-9
- Sampler: DPM++ 2M Karras

---

## Expected Outcomes

When generated properly, your hero background should feature:

✓ **Visual Hierarchy:** Subtle elements that don't compete with foreground content
✓ **Color Harmony:** Cool tones (blue/purple) creating professional atmosphere
✓ **Motion Feeling:** Even static images convey flow and progress
✓ **Depth:** Layering creates dimensionality
✓ **Elegance:** Premium, sophisticated feel without being overdone
✓ **Clarity:** Text overlay remains readable
✓ **Accessibility:** Sufficient contrast for all users

---

## File Naming Convention

When saving the generated image, use:
```
hero-background-ai-thesis-[version]-[date].webp
```

Example: `hero-background-ai-thesis-v1-2025-12-17.webp`

---

## Testing Checklist

- [ ] Generated image at correct dimensions (1920x1080+)
- [ ] Exported in optimized format (WebP preferred)
- [ ] Text overlay maintains WCAG AA contrast ratio
- [ ] Background doesn't distract from hero content
- [ ] Loads quickly (< 300KB for 1920x1080)
- [ ] Looks good on mobile devices
- [ ] No brain imagery or human figures
- [ ] Consistent with brand color palette (blue/purple)
- [ ] Tested with different text colors
- [ ] Verified on multiple browsers

---

## Alternative Approaches

If generated images don't meet expectations, consider:

1. **Hybrid Approach:** Generate multiple versions and combine
2. **Manual Design:** Use Figma/Adobe XD with gradients and shapes
3. **SVG Animation:** Create animated background with SVG
4. **Video Background:** Short looping video instead of static image

---

## References

- Landing Page Hero: `/src/components/landing/` folder
- Next.js Image Optimization: https://nextjs.org/docs/app/api-reference/components/image
- WebP Format Benefits: Better compression while maintaining quality

---

**Status:** Ready for image generation
**Last Updated:** 2025-12-17
**Version:** 1.0
