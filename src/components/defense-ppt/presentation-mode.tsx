'use client';

import React, { useMemo } from 'react';
import { Deck } from '@/components/presentation-deck/deck';
import { TitleSlide } from '@/components/presentation-deck/slides/title-slide';
import { ContentSlide } from '@/components/presentation-deck/slides/content-slide';
import type { PresentationSlide } from '@/lib/presentation-deck';
import { createSlideDefinition } from '@/lib/presentation-deck';

interface Slide {
  id: string;
  title: string;
  bullets: string[];
  notes: string;
  timeEstimate: number;
  order: number;
}

interface DefensePlan {
  id: string;
  defenseType: 'proposal' | 'final';
  totalTime: number;
  slideCount: number;
  chaptersToInclude: number[];
  slides: Slide[];
  createdAt: Date;
  updatedAt: Date;
}

interface PresentationModeProps {
  plan: DefensePlan;
}

export function PresentationMode({ plan }: PresentationModeProps) {
  const presentationSlides: PresentationSlide[] = useMemo(() => {
    return plan.slides.map((slide, index) => {
      // First slide is a title slide
      if (index === 0) {
        return createSlideDefinition({
          slug: `slide-${slide.id}`,
          title: slide.title,
          component: TitleSlide,
          notes: slide.notes,
          metadata: {
            duration: slide.timeEstimate,
            subtitle: plan.defenseType === 'proposal' ? 'Proposal Defense' : 'Final Defense',
          },
        });
      }

      // Other slides are content slides
      return createSlideDefinition({
        slug: `slide-${slide.id}`,
        title: slide.title,
        component: ContentSlide,
        notes: slide.notes,
        metadata: {
          duration: slide.timeEstimate,
          bullets: slide.bullets,
        },
      });
    });
  }, [plan]);

  const subtitle = `${plan.defenseType === 'proposal' ? 'Proposal' : 'Final'} Defense • ${plan.totalTime} minutes`;

  return (
    <div className="w-full h-full overflow-hidden bg-background">
      <Deck
        slides={presentationSlides}
        title={plan.slides[0]?.title || 'Presentation'}
        subtitle={subtitle}
        showNotes={false}
        theme="dark"
      />
    </div>
  );
}
