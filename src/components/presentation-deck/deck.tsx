'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Volume2, VolumeX, BookOpen, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { PresentationSlide, PresentationState } from '@/lib/presentation-deck';
import { SlideRenderer } from './slide-renderer';
import { SpeakerNotes } from './speaker-notes';
import { SlideNavigation } from './slide-navigation';
import { PresentationControls } from './presentation-controls';

interface DeckProps {
  slides: PresentationSlide[];
  title: string;
  subtitle?: string;
  autoAdvance?: boolean;
  autoAdvanceDelay?: number;
  showNotes?: boolean;
  theme?: 'light' | 'dark';
}

export function Deck({
  slides,
  title,
  subtitle,
  autoAdvance = false,
  autoAdvanceDelay = 5000,
  showNotes: initialShowNotes = false,
  theme = 'light',
}: DeckProps) {
  const [state, setState] = useState<PresentationState>({
    currentSlideIndex: 0,
    isPresentationMode: false,
    isFullscreen: false,
    showNotes: initialShowNotes,
    speed: 'normal',
  });

  const [autoAdvanceEnabled, setAutoAdvanceEnabled] = useState(autoAdvance);

  const goToSlide = useCallback((index: number) => {
    const newIndex = Math.max(0, Math.min(index, slides.length - 1));
    setState(prev => ({ ...prev, currentSlideIndex: newIndex }));
  }, [slides.length]);

  const goToNextSlide = useCallback(() => {
    if (state.currentSlideIndex < slides.length - 1) {
      goToSlide(state.currentSlideIndex + 1);
    }
  }, [state.currentSlideIndex, slides.length, goToSlide]);

  const goToPreviousSlide = useCallback(() => {
    if (state.currentSlideIndex > 0) {
      goToSlide(state.currentSlideIndex - 1);
    }
  }, [state.currentSlideIndex, goToSlide]);

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
        setState(prev => ({ ...prev, isFullscreen: true }));
      } catch (err) {
        console.error('Fullscreen request failed:', err);
      }
    } else {
      await document.exitFullscreen();
      setState(prev => ({ ...prev, isFullscreen: false }));
    }
  }, []);

  const toggleNotes = useCallback(() => {
    setState(prev => ({ ...prev, showNotes: !prev.showNotes }));
  }, []);

  const togglePresentationMode = useCallback(() => {
    setState(prev => ({ ...prev, isPresentationMode: !prev.isPresentationMode }));
  }, []);

  // Auto-advance slides
  useEffect(() => {
    if (!autoAdvanceEnabled || state.isPresentationMode) return;

    const timer = setTimeout(() => {
      if (state.currentSlideIndex < slides.length - 1) {
        setState(prev => ({ ...prev, currentSlideIndex: prev.currentSlideIndex + 1 }));
      }
    }, autoAdvanceDelay);

    return () => clearTimeout(timer);
  }, [state.currentSlideIndex, autoAdvanceEnabled, autoAdvanceDelay, slides.length, state.isPresentationMode]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          goToNextSlide();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          goToPreviousSlide();
          break;
        case 'f':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            toggleFullscreen();
          }
          break;
        case 'n':
          toggleNotes();
          break;
        case 'p':
          togglePresentationMode();
          break;
        case 'Escape':
          if (state.isPresentationMode) {
            e.preventDefault();
            togglePresentationMode();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.currentSlideIndex, state.isPresentationMode, goToNextSlide, goToPreviousSlide, toggleFullscreen, toggleNotes, togglePresentationMode]);

  const currentSlide = slides[state.currentSlideIndex];

  if (!currentSlide) {
    return <div className="text-center py-8">No slides available</div>;
  }

  return (
    <div className={`flex flex-col w-full h-full bg-background`}>
      {/* Header - Always visible */}
      <div className={`border-b px-4 py-3 bg-background border-border flex items-center justify-between flex-shrink-0`}>
        <div className="flex-1">
          <h1 className={`text-xl font-bold`}>
            {title}
          </h1>
          {subtitle && (
            <p className={`text-sm text-muted-foreground`}>
              {subtitle}
            </p>
          )}
        </div>
        
        {/* Exit presentation mode button */}
        {state.isPresentationMode && (
          <Button
            size="sm"
            variant="ghost"
            onClick={togglePresentationMode}
            className="ml-auto"
            title="Exit presentation mode (Esc)"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 overflow-hidden px-4 py-4">
        {/* Slide */}
        <div className="flex-1 flex items-center justify-center">
          <Card className={`w-full h-full overflow-hidden shadow-lg bg-background border-border`}>
            <SlideRenderer
              slide={currentSlide}
              isActive={true}
              index={state.currentSlideIndex}
              totalSlides={slides.length}
              theme={theme}
            />
          </Card>
        </div>

        {/* Notes Sidebar */}
        {state.showNotes && !state.isPresentationMode && (
          <div className="w-96 border-l overflow-hidden flex flex-col">
            <SpeakerNotes
              notes={currentSlide.notes}
              slideTitle={currentSlide.title}
              slideIndex={state.currentSlideIndex + 1}
              totalSlides={slides.length}
              theme={theme}
            />
          </div>
        )}
      </div>

      {/* Controls - Always visible */}
      <div className={`border-t px-4 py-4 flex items-center justify-between bg-background border-border flex-shrink-0`}>
        <SlideNavigation
          currentSlide={state.currentSlideIndex + 1}
          totalSlides={slides.length}
          onGoToSlide={(index) => goToSlide(index - 1)}
        />

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={goToPreviousSlide}
            disabled={state.currentSlideIndex === 0}
            title="Previous slide (← arrow)"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <PresentationControls
            showNotes={state.showNotes}
            isFullscreen={state.isFullscreen}
            isPresentationMode={state.isPresentationMode}
            autoAdvance={autoAdvanceEnabled}
            onToggleNotes={toggleNotes}
            onToggleFullscreen={toggleFullscreen}
            onTogglePresentationMode={togglePresentationMode}
            onToggleAutoAdvance={() => setAutoAdvanceEnabled(!autoAdvanceEnabled)}
          />

          <Button
            size="sm"
            variant="outline"
            onClick={goToNextSlide}
            disabled={state.currentSlideIndex === slides.length - 1}
            title="Next slide (→ arrow or space)"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
