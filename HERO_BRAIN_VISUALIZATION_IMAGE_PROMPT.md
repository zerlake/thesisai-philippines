# Hero Brain Visualization - Image Generation Guide

## Overview
This guide provides detailed prompts and instructions for generating a professional 3D brain visualization background image for the hero section.

## Image Generation Prompt

### Primary Prompt (Recommended)
```
A stunning 3D brain visualization positioned on the LEFT side of the image. 
The brain is rendered in vibrant electric blue and purple gradients 
with bright cyan accents at the core. Multiple interconnected neural 
pathways flow through the brain with luminescent nodes and synapses. 
Surrounding the brain are floating particles and energy fields with 
soft blue and purple glows. The brain appears to be rotating 
or floating in space with a sense of depth and dimensionality. 
The RIGHT SIDE of the image is left CLEAR and EMPTY to accommodate 
carousel images. The background is deep dark navy/black with subtle 
gradient transitions. High-tech, futuristic, modern aesthetic suitable 
for an academic technology platform. Professional, sophisticated lighting 
with volumetric effects. Transparent/translucent elements showing neural 
activity. LEFT-ALIGNED composition with significant empty space on the 
right for content overlay. 16:9 aspect ratio, 2560x1440 pixels or higher 
resolution. Style: modern, clean, minimalist tech design with rich gradients.
```

### Alternative Prompt (Artistic)
```
Futuristic glowing brain with neural networks positioned on the left side, 
electric blue and purple neon aesthetic, dark space background, floating 
particles, volumetric lighting, cyberpunk technology theme, high resolution, 
professional scientific visualization, transparent gradient elements, 
synaptic activity visualization, modern academic design, right side clear 
for overlay content
```

### Alternative Prompt (Minimal)
```
3D glowing brain neural network positioned on LEFT, electric blue purple 
cyan gradients, dark background, floating particles, professional tech 
aesthetic, high resolution, clear right side for carousel images, 
suitable for academic platform header
```

### Ultra-Specific Prompt (Best for Precision)
```
LEFT-ALIGNED 3D brain visualization on a dark navy background. 
The brain occupies the LEFT 50% of the image, glowing with electric blue 
(#3B82F6) and purple (#A855F7) gradients, with cyan (#06B6D4) highlights 
at the core. The RIGHT 50% is completely clear dark space with no brain 
elements, reserved for carousel/carousel content overlay. 
Neural pathways, synapses, and floating particles surround the brain. 
Volumetric lighting, glowing effects, floating particles with halos. 
Background: pure dark navy (#0F172A) with subtle purple/blue gradient 
overlays. Cinematic, professional, modern tech aesthetic. 
2560x1440 resolution, 16:9 aspect ratio. Suitable for hero section background 
with carousel images overlaid on the clear right side.
```

## Recommended Tools

### 1. DALL-E 3 (OpenAI)
- **Pros**: Best quality, understands complex prompts, consistent results
- **Access**: ChatGPT Plus subscription or OpenAI API
- **Cost**: $0.10-0.20 per image
- **Time**: ~30 seconds per generation

### 2. Midjourney
- **Pros**: Excellent for technical/architectural visuals, high artistic quality
- **Access**: Discord bot, subscription required
- **Cost**: $10-120/month depending on usage
- **Time**: 1-5 minutes per generation
- **Command**: `/imagine [prompt]`

### 3. Stable Diffusion
- **Pros**: Free, open-source, runs locally or via web
- **Access**: HuggingFace, RunwayML, or local installation
- **Cost**: Free (or paid cloud services)
- **Time**: 30-120 seconds depending on hardware
- **Tools**: WebUI, ComfyUI, or cloud services

### 4. Adobe Firefly
- **Pros**: Integrated with Creative Cloud, good quality
- **Access**: Adobe Creative Cloud subscription
- **Cost**: Included with subscription or $4.99/month
- **Time**: ~30 seconds per generation

## Step-by-Step Instructions

### Step 1: Generate the Image
1. Choose your preferred tool from the list above
2. Copy one of the prompts provided
3. Adjust the prompt if desired (color preferences, style, etc.)
4. Generate 3-5 variations and select the best one
5. Ensure the generated image is at least 2560x1440 pixels

### Step 2: Process the Image
1. Download the image
2. Open in an image editor (Photoshop, GIMP, or online editor)
3. Crop/resize to exact 2560x1440 if needed
4. Adjust brightness/contrast if necessary
5. Ensure it fits a 16:9 aspect ratio

### Step 3: Convert to WebP Format
**Using ImageMagick:**
```bash
convert hero-brain.png -quality 85 hero-brain.webp
```

**Using online converter:**
- Visit: https://convertio.co/png-webp/ or https://image.online-convert.com/
- Upload PNG
- Download as WebP (quality 85)

### Step 4: Deploy the Image
1. Save converted image as `hero-brain-bg.webp`
2. Place in `/public/` directory
3. Update component file (see below)

## Implementation

### Update Component File
Replace the contents of `src/components/landing/hero-brain-visualization.tsx`:

```tsx
"use client";

import Image from 'next/image';

export function HeroBrainVisualization() {
  return (
    <Image
      src="/hero-brain-bg.webp"
      alt="3D brain visualization background"
      fill
      priority
      quality={85}
      className="absolute inset-0 object-cover z-0"
      sizes="100vw"
      style={{ objectPosition: 'left center' }}
    />
  );
}
```

## Image Specifications

| Specification | Value |
|---|---|
| **Resolution** | 2560x1440 pixels minimum |
| **Aspect Ratio** | 16:9 |
| **Format** | WebP (preferred) or PNG |
| **File Size** | < 500KB (WebP) or < 1.5MB (PNG) |
| **Color Profile** | sRGB |
| **Quality** | 85% compression |
| **Placement** | Right-aligned, positioned right |

## File Locations

```
project-root/
├── public/
│   └── hero-brain-bg.webp          ← Save generated image here
└── src/
    └── components/
        └── landing/
            └── hero-brain-visualization.tsx  ← Update this file
```

## Color Reference

If you want to specify exact colors in your prompt:

- **Primary Blue**: `#3B82F6` (rgb: 59, 130, 246)
- **Purple**: `#A855F7` (rgb: 168, 85, 247)
- **Cyan**: `#06B6D4` (rgb: 6, 182, 212)
- **Dark Background**: `#0F172A` (rgb: 15, 23, 42)

Include in prompt: *"Use color palette: electric blue (#3B82F6), purple (#A855F7), and cyan (#06B6D4) on dark navy background (#0F172A)"*

## Optimization Tips

1. **Use WebP format** for 30-40% smaller file sizes than PNG
2. **Target 85% quality** - balances quality and performance
3. **Optimize for right-side positioning** - brightest elements should be on the right
4. **Ensure dark background** - matches the overlay and gradient
5. **Keep particles/glows subtle** - should not obscure content on left side

## Testing Checklist

After implementation:
- [ ] Image displays on landing page
- [ ] Loads quickly (< 1 second)
- [ ] No distortion on different screen sizes
- [ ] Carousel content on right side is visible
- [ ] Text on left side is readable
- [ ] Gradient overlay properly darkens the image
- [ ] Works on mobile, tablet, and desktop

## Troubleshooting

### Image Not Showing
- Verify file is in `/public/` directory
- Check filename matches exactly in component
- Clear browser cache (Ctrl+Shift+Delete)
- Rebuild project: `pnpm build`

### Image Quality Issues
- Re-generate with higher resolution
- Adjust WebP quality to 90 instead of 85
- Ensure source image is at least 2560x1440

### File Size Too Large
- Reduce quality to 75-80 in WebP conversion
- Use image compression tool: https://tinypng.com
- Resize image to exactly 2560x1440

## References

- [DALL-E Documentation](https://platform.openai.com/docs/guides/images)
- [Midjourney Guide](https://docs.midjourney.com)
- [Stable Diffusion Prompting](https://github.com/openart-ai/stable-diffusion-prompts)
- [WebP Format Benefits](https://developers.google.com/speed/webp)
- [Next.js Image Optimization](https://nextjs.org/docs/api-reference/next/image)

## Timeline

- **Generate Image**: 5-10 minutes
- **Process/Convert**: 5 minutes
- **Deploy**: 2 minutes
- **Test**: 5 minutes
- **Total**: ~20 minutes

## Support

If the generated image needs adjustment:
1. Download the image file
2. Edit with feedback (e.g., "brighter core", "more particles")
3. Re-generate 2-3 variations
4. Compare and select best result
5. Deploy updated version

---

**Created**: December 17, 2025
**Purpose**: Hero Section Brain Visualization Background
**Status**: Ready for implementation
