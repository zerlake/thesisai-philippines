'use client';

import React from 'react';
import type { PresentationSlide } from '@/lib/presentation-deck';

interface TitleSlideProps {
  slide: PresentationSlide;
  theme?: 'light' | 'dark';
}

export function TitleSlide({ slide, theme = 'light' }: TitleSlideProps) {
  const { title, subtitle } = slide.metadata as any;

  return (
    <div className="text-center space-y-4">
      <h1
        className={`text-5xl font-bold text-white`}
      >
        {slide.title}
      </h1>
      {subtitle && (
        <p
          className={`text-2xl text-gray-200`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
