'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

interface SpeakerNotesProps {
  notes?: string;
  slideTitle: string;
  slideIndex: number;
  totalSlides: number;
  theme?: 'light' | 'dark';
}

export function SpeakerNotes({
  notes,
  slideTitle,
  slideIndex,
  totalSlides,
  theme = 'light',
}: SpeakerNotesProps) {
  return (
    <div className={`flex flex-col h-full bg-background`}>
      <div className={`border-b p-3 bg-muted border-border`}>
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="h-4 w-4" />
          <h3 className={`text-sm font-semibold`}>
            Speaker Notes
          </h3>
        </div>
        <p className={`text-xs text-muted-foreground`}>
          Slide {slideIndex} of {totalSlides}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className={`text-xs leading-relaxed text-foreground`}>
          {notes ? (
            <p className="whitespace-pre-wrap">{notes}</p>
          ) : (
            <p className={`italic text-muted-foreground`}>
              No notes for this slide.
            </p>
          )}
        </div>
      </div>

      {/* Slide Title Reference */}
      <div className={`border-t p-3 bg-muted border-border`}>
        <p className={`text-xs font-medium text-muted-foreground`}>
          Slide Title
        </p>
        <p className={`text-sm font-semibold mt-1 text-foreground`}>
          {slideTitle}
        </p>
      </div>
    </div>
  );
}
