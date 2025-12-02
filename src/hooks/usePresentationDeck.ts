import { useState, useCallback } from 'react';
import type { PresentationSlide, DeckConfig } from '@/lib/presentation-deck';
import { createSlideDefinition } from '@/lib/presentation-deck';

interface UsePresentationDeckReturn {
  slides: PresentationSlide[];
  addSlide: (slide: PresentationSlide) => void;
  removeSlide: (slideId: string) => void;
  updateSlide: (slideId: string, updates: Partial<PresentationSlide>) => void;
  reorderSlides: (from: number, to: number) => void;
  clearSlides: () => void;
  exportDeck: () => DeckConfig;
}

export function usePresentationDeck(
  initialSlides: PresentationSlide[] = []
): UsePresentationDeckReturn {
  const [slides, setSlides] = useState<PresentationSlide[]>(initialSlides);

  const addSlide = useCallback((slide: PresentationSlide) => {
    setSlides(prev => [...prev, slide]);
  }, []);

  const removeSlide = useCallback((slideId: string) => {
    setSlides(prev => prev.filter(s => s.id !== slideId));
  }, []);

  const updateSlide = useCallback((slideId: string, updates: Partial<PresentationSlide>) => {
    setSlides(prev =>
      prev.map(s => (s.id === slideId ? { ...s, ...updates } : s))
    );
  }, []);

  const reorderSlides = useCallback((from: number, to: number) => {
    setSlides(prev => {
      const newSlides = [...prev];
      const [removed] = newSlides.splice(from, 1);
      newSlides.splice(to, 0, removed);
      return newSlides;
    });
  }, []);

  const clearSlides = useCallback(() => {
    setSlides([]);
  }, []);

  const exportDeck = useCallback((): DeckConfig => {
    return {
      slides,
      title: 'Presentation',
      theme: 'light',
      transition: 'slide',
    };
  }, [slides]);

  return {
    slides,
    addSlide,
    removeSlide,
    updateSlide,
    reorderSlides,
    clearSlides,
    exportDeck,
  };
}
