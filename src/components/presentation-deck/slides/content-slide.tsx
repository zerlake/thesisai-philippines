'use client';

import React from 'react';
import type { PresentationSlide } from '@/lib/presentation-deck';

interface ContentSlideProps {
  slide: PresentationSlide;
  theme?: 'light' | 'dark';
}

export function ContentSlide({ slide, theme = 'light' }: ContentSlideProps) {
  const { bullets, sections } = slide.metadata as any;

  return (
    <div className="w-full space-y-6">
      <h2
        className={`text-4xl font-bold text-white`}
      >
        {slide.title}
      </h2>

      {bullets && (
        <ul className="space-y-3">
          {bullets.map((bullet: string, index: number) => (
            <li
              key={index}
              className={`text-xl leading-relaxed text-white`}
            >
              <span className="mr-3">•</span>
              {bullet}
            </li>
          ))}
        </ul>
      )}

      {sections && (
        <div className="space-y-4">
          {sections.map(
            (section: { title: string; items: string[] }, index: number) => (
              <div key={index}>
                <h3
                   className={`text-2xl font-semibold mb-2 text-white`}
                 >
                   {section.title}
                 </h3>
                 <ul className="space-y-2">
                   {section.items.map((item: string, itemIndex: number) => (
                     <li
                       key={itemIndex}
                       className={`text-lg text-white`}
                     >
                      <span className="mr-2">-</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
