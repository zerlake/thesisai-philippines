/**
 * Presentation Deck System
 * A component-based presentation framework for Defense PPT Coach
 * Inspired by shadcn-deck architecture
 */

export interface PresentationSlide {
  id: string;
  slug: string;
  title: string;
  component: React.ComponentType<any>;
  notes?: string;
  metadata?: {
    duration?: number;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    tags?: string[];
  };
}

export interface DeckConfig {
  slides: PresentationSlide[];
  title: string;
  subtitle?: string;
  author?: string;
  theme?: 'light' | 'dark';
  transition?: 'fade' | 'slide' | 'zoom';
}

export interface PresentationSlideProps {
  slide: PresentationSlide;
  isActive: boolean;
  isNext: boolean;
  isPrevious: boolean;
  index: number;
  totalSlides: number;
}

/**
 * Navigation state for the presentation
 */
export interface PresentationState {
  currentSlideIndex: number;
  isPresentationMode: boolean;
  isFullscreen: boolean;
  showNotes: boolean;
  speed: 'slow' | 'normal' | 'fast';
}

/**
 * Create a slide definition for the presentation deck
 */
export function createSlideDefinition<T extends Record<string, any>>(
  config: {
    slug: string;
    title: string;
    component: React.ComponentType<any>;
    notes?: string;
    metadata?: T;
  }
): PresentationSlide {
  return {
    id: `slide-${config.slug}`,
    slug: config.slug,
    title: config.title,
    component: config.component,
    notes: config.notes,
    metadata: config.metadata as any,
  };
}

/**
 * Helper to get slide by index
 */
export function getSlideByIndex(slides: PresentationSlide[], index: number): PresentationSlide | undefined {
  return slides[index];
}

/**
 * Helper to get slide by slug
 */
export function getSlideBySlug(slides: PresentationSlide[], slug: string): PresentationSlide | undefined {
  return slides.find(slide => slide.slug === slug);
}

/**
 * Helper to get slide index by slug
 */
export function getSlideIndexBySlug(slides: PresentationSlide[], slug: string): number {
  return slides.findIndex(slide => slide.slug === slug);
}

/**
 * Calculate total presentation time
 */
export function calculateTotalTime(slides: PresentationSlide[]): number {
  return slides.reduce((total, slide) => total + (slide.metadata?.duration || 60), 0);
}
