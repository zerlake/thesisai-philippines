'use client';

import React from 'react';
import type { PresentationSlide } from '@/lib/presentation-deck';

interface SlideRendererProps {
  slide: PresentationSlide;
  isActive: boolean;
  index: number;
  totalSlides: number;
  theme?: 'light' | 'dark';
}

export function SlideRenderer({
  slide,
  isActive,
  index,
  totalSlides,
  theme = 'light',
}: SlideRendererProps) {
  const SlideComponent = slide.component;

  return (
    <div
      className={`
        w-full h-full flex flex-col items-center justify-center p-12
        bg-background text-foreground
        transition-all duration-300
        ${isActive ? 'opacity-100' : 'opacity-50'}
      `}
    >
      <SlideComponent
        slide={slide}
        index={index}
        totalSlides={totalSlides}
        theme={theme}
      />

      {/* Slide Counter */}
      <div
        className={`
          absolute bottom-4 right-4 text-xs font-medium
          text-muted-foreground
        `}
      >
        {index + 1} / {totalSlides}
      </div>
    </div>
  );
}
