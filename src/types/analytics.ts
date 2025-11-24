export interface WritingSession {
  id: string;
  userId: string;
  documentId?: string;
  startTime: Date;
  endTime?: Date;
  wordsWritten: number;
  focusScore?: number; // 0-100
  createdAt: Date;
}

export interface WritingGoal {
  id: string;
  userId: string;
  type: 'word_count' | 'time_based' | 'task_based';
  target: number; // words, minutes, or tasks
  achieved: number;
  deadline: Date;
  completed: boolean;
  createdAt: Date;
}

export interface Document {
  id: string;
  userId: string;
  title?: string;
  content?: string;
  wordCount: number;
  updatedAt: Date;
  createdAt: Date;
}

export interface Chapter {
  id: string;
  userId: string;
  title: string;
  wordCount: number;
  targetWordCount: number;
  status: 'not_started' | 'in_progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface ThesisProgress {
  userId: string;
  overallProgress: number; // 0-100
  checklistCompletion: number; // 0-100
  chaptersCompleted: number;
  totalChapters: number;
  currentWordCount: number;
  targetWordCount: number;
  daysUntilDeadline: number;
  updatedAt: Date;
}

export interface WritingAnalytics {
  userId: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  wordCountMetrics: {
    total: number;
    average: number;
    peak: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  productivityMetrics: {
    sessionsCount: number;
    averageSessionDuration: number; // in minutes
    totalWritingTime: number; // in minutes
    focusScore: number; // 0-100
  };
  chapterProgress: {
    chapterId: string;
    title: string;
    wordCount: number;
    targetWordCount: number;
    percentComplete: number;
  }[];
  velocityData: {
    date: string; // YYYY-MM-DD
    wordsWritten: number;
    cumulativeWords: number;
  }[];
  heatmapData: {
    day: number; // 0-6 (Sunday-Saturday)
    hour: number; // 0-23
    wordsWritten: number;
    intensity: number; // 0-100
  }[];
  predictions: {
    estimatedCompletionDate: Date | null;
    confidence: number; // 0-100
    daysRemaining: number | null;
  };
}

export interface ChapterAnalytics {
  chapterId: string;
  title: string;
  sections: {
    title: string;
    wordCount: number;
    status: 'not_started' | 'in_progress' | 'complete';
  }[];
  milestones: {
    date: Date;
    wordCount: number;
    event: string;
  }[];
  revisionHistory: {
    date: Date;
    wordsAdded: number;
    wordsRemoved: number;
    netChange: number;
  }[];
}

export interface DailyWritingStats {
  date: string; // YYYY-MM-DD
  wordsWritten: number;
  sessionsCount: number;
  totalMinutes: number;
  averageFocusScore: number;
}

export interface ProductivityPattern {
  mostProductiveDay: number; // 0-6
  mostProductiveHour: number; // 0-23
  averageWordsPerSession: number;
  averageWordsPerMinute: number;
  writingStreak: number; // consecutive days
}