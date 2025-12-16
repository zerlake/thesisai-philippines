// src/services/analytics-service.ts

// API service for analytics data

export interface ProgressData {
  estimatedReadiness: number;
  learningVelocity: number;
  daysSinceStart: number;
  totalReviews: number;
  averageSuccess: number;
  consistencyScore: number;
  sessionFrequency: number;
  avgSessionLength: number;
  topicsMastered: number;
  areasNeedingWork: number;
}

export interface FlashcardData {
  masteryByDeck: Array<{ deck: string; mastery: number }>;
  retentionCurve: Array<{ day: number; retention: number }>;
  nextReviewForecast: Array<{ date: string; count: number }>;
}

export interface DefenseData {
  difficultyProgression: Array<{ date: string; moderate: number; challenging: number; expert: number }>;
  avgResponseTime: Array<{ category: string; time: number }>;
  performanceByCategory: Array<{ category: string; score: number }>;
}

export interface StudyGuideData {
  completionByGuide: Array<{ guide: string; completion: number }>;
  pagesRead: number;
  notesTaken: number;
}

export interface Insight {
  id: number;
  type: 'opportunity' | 'achievement' | 'warning' | 'recommendation';
  title: string;
  description: string;
  actionItems: string[];
  createdAt: string;
}

// API functions
export const fetchProgressData = async (): Promise<ProgressData> => {
  const response = await fetch('/api/learning/progress');
  if (!response.ok) {
    throw new Error('Failed to fetch progress data');
  }
  return response.json();
};

export const fetchFlashcardData = async (): Promise<FlashcardData> => {
  const response = await fetch('/api/learning/flashcards');
  if (!response.ok) {
    throw new Error('Failed to fetch flashcard data');
  }
  return response.json();
};

export const fetchDefenseData = async (): Promise<DefenseData> => {
  const response = await fetch('/api/learning/defense');
  if (!response.ok) {
    throw new Error('Failed to fetch defense data');
  }
  return response.json();
};

export const fetchStudyGuideData = async (): Promise<StudyGuideData> => {
  const response = await fetch('/api/learning/study-guides');
  if (!response.ok) {
    throw new Error('Failed to fetch study guide data');
  }
  return response.json();
};

export const fetchInsights = async (): Promise<Insight[]> => {
  const response = await fetch('/api/learning/insights');
  if (!response.ok) {
    throw new Error('Failed to fetch insights');
  }
  return response.json();
};

export const dismissInsight = async (id: number): Promise<boolean> => {
  const response = await fetch('/api/learning/insights', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ insightId: id, action: 'dismiss' }),
  });

  if (!response.ok) {
    throw new Error('Failed to dismiss insight');
  }

  const result = await response.json();
  return result.success;
};