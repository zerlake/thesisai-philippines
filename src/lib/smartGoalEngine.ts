import { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface WritingGoal {
  id: string;
  userId: string;
  type: 'word_count' | 'time_based' | 'task_based';
  target: number; // words or minutes
  achieved: number;
  deadline: Date;
  completed: boolean;
  createdAt: Date;
}

export interface WritingSession {
  id: string;
  userId: string;
  documentId: string;
  startTime: Date;
  endTime: Date;
  wordsWritten: number;
  focusScore: number; // 0-100, based on activity patterns
}

export interface UserWritingPattern {
  userId: string;
  averageWordsPerSession: number;
  averageSessionDuration: number; // minutes
  mostProductiveTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  mostProductiveDayOfWeek: number; // 0-6
  averageWordsPerMinute: number;
  writingStreakDays: number;
  lastSessionDate: Date;
}

export interface GoalRecommendation {
  type: 'word_count' | 'time_based' | 'task_based';
  target: number;
  reasoning: string;
  difficulty: 'easy' | 'moderate' | 'challenging';
  estimatedCompletionTime: number; // minutes
  alternativeGoals: {
    type: string;
    target: number;
    reasoning: string;
  }[];
}

export interface ThesisProgress {
  overallProgress: number; // 0-100
  checklistCompletion: number; // 0-100
  chaptersCompleted: number;
  totalChapters: number;
  wordCount: number;
  targetWordCount: number;
  daysUntilDeadline: number;
}

export class SmartGoalEngine {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = supabase;
  }

  /**
   * Generate personalized goal recommendations
   */
  async recommendGoal(
    userId: string,
    context: {
      upcomingDeadline?: Date;
      currentChapter?: string;
      recentFeedback?: string[];
      timeAvailable?: number; // minutes
    } = {}
  ): Promise<GoalRecommendation> {
    try {
      // 1. Get user's writing patterns
      const pattern = await this.getUserPattern(userId);
      
      // 2. Get thesis progress
      const progress = await this.getThesisProgress();
      
      // 3. Calculate urgency score
      const urgency = this.calculateUrgency(progress, context.upcomingDeadline);
      
      // 4. Determine base target
      let baseTarget = pattern.averageWordsPerSession;
      
      // Adjust for urgency
      if (urgency === 'high') {
        baseTarget *= 1.3; // 30% increase
      } else if (urgency === 'low') {
        baseTarget *= 0.8; // Sustainable pace
      }
      
      // Adjust for time available
      if (context.timeAvailable) {
        const maxPossible = pattern.averageWordsPerMinute * context.timeAvailable;
        baseTarget = Math.min(baseTarget, maxPossible);
      }
      
      // 5. Round to friendly number
      const target = this.roundToFriendlyNumber(baseTarget);
      
      // 6. Generate reasoning
      const reasoning = this.generateReasoning(pattern, urgency);
      
      // 7. Calculate difficulty
      const difficulty = this.assessDifficulty(target, pattern);
      
      // 8. Generate alternatives
      const alternativeGoals = this.generateAlternatives(target);
      
      return {
        type: 'word_count',
        target,
        reasoning,
        difficulty,
        estimatedCompletionTime: Math.ceil(target / pattern.averageWordsPerMinute),
        alternativeGoals
      };
    } catch (error) {
      console.error('Failed to generate goal recommendation:', error);
      // Return default recommendation in case of error
      return {
        type: 'word_count',
        target: 300,
        reasoning: "Set a daily goal to maintain writing momentum.",
        difficulty: 'moderate',
        estimatedCompletionTime: 45,
        alternativeGoals: [
          {
            type: 'word_count',
            target: 200,
            reasoning: 'A lighter goal for a quick win'
          },
          {
            type: 'time_based',
            target: 30,
            reasoning: 'Focus on time instead of word count'
          }
        ]
      };
    }
  }

  private async getUserPattern(userId: string): Promise<UserWritingPattern> {
    // Query last 30 days of sessions
    const { data: sessions, error } = await this.supabase
      .from('writing_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('start_time', { ascending: false });

    if (error) {
      console.error('Error fetching writing sessions:', error);
    }

    if (!sessions || sessions.length === 0) {
      // Return defaults for new users
      return {
        userId,
        averageWordsPerSession: 300,
        averageSessionDuration: 45,
        mostProductiveTimeOfDay: 'morning',
        mostProductiveDayOfWeek: 2, // Tuesday
        averageWordsPerMinute: 8,
        writingStreakDays: 0,
        lastSessionDate: new Date()
      };
    }

    // Calculate patterns
    const totalWords = sessions.reduce((sum, s) => sum + (s.words_written || 0), 0);
    const totalMinutes = sessions.reduce((sum, s) => {
      if (s.start_time && s.end_time) {
        const duration = (new Date(s.end_time).getTime() - new Date(s.start_time).getTime()) / 60000;
        return sum + duration;
      }
      return sum;
    }, 0);

    const avgWordsPerSession = totalWords / sessions.length;
    const avgSessionDuration = totalMinutes / sessions.length;
    const avgWordsPerMinute = totalMinutes > 0 ? totalWords / totalMinutes : 8;

    // Find most productive time
    const timeDistribution = this.analyzeTimeDistribution(sessions);
    const dayDistribution = this.analyzeDayDistribution(sessions);

    return {
      userId,
      averageWordsPerSession: Math.round(avgWordsPerSession),
      averageSessionDuration: Math.round(avgSessionDuration),
      mostProductiveTimeOfDay: timeDistribution.peak,
      mostProductiveDayOfWeek: dayDistribution.peak,
      averageWordsPerMinute: Math.round(avgWordsPerMinute * 10) / 10,
      writingStreakDays: await this.calculateStreak(userId),
      lastSessionDate: new Date(sessions[0].start_time)
    };
  }

  private async getThesisProgress(): Promise<ThesisProgress> {
     // In a real implementation, we would fetch thesis progress from the database
     // For now, return sample data
    return {
      overallProgress: 25, // Example: 25% complete
      checklistCompletion: 40, // Example: 40% of checklist items completed
      chaptersCompleted: 1, // Example: 1 out of 5 chapters completed
      totalChapters: 5,
      wordCount: 1500, // Example: 1,500 words written
      targetWordCount: 10000, // Example: 10,000 words target
      daysUntilDeadline: 90 // Example: 90 days until deadline
    };
  }

  private calculateUrgency(
    progress: ThesisProgress,
    deadline?: Date
  ): 'low' | 'medium' | 'high' {
    if (!deadline) return 'medium';

    const daysUntil = Math.ceil(
      (deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    const progressRatio = progress.overallProgress / 100;
    const timeRatio = daysUntil / 365; // Assume 1-year thesis

    // Behind schedule
    if (progressRatio < timeRatio * 0.7) return 'high';
    // Ahead of schedule
    if (progressRatio > timeRatio * 1.3) return 'low';
    // On track
    return 'medium';
  }

  private roundToFriendlyNumber(value: number): number {
    // Round to nearest 50 for values under 500
    if (value < 500) return Math.round(value / 50) * 50;
    // Round to nearest 100 for larger values
    return Math.round(value / 100) * 100;
  }

  private generateReasoning(
    pattern: UserWritingPattern,
    urgency: string
  ): string {
    const reasons: string[] = [];

    // Base reasoning
    reasons.push(
      `Based on your writing history, you typically write ${pattern.averageWordsPerSession} words per session.`
    );

    // Urgency adjustment
    if (urgency === 'high') {
      reasons.push(
        "With your upcoming deadline, I'm suggesting a slightly higher goal to keep you on track."
      );
    } else if (urgency === 'low') {
      reasons.push(
        "You're ahead of schedule, so let's maintain a sustainable pace."
      );
    }

    // Productivity insights
    if (pattern.mostProductiveTimeOfDay) {
      const timeLabel = {
        morning: 'morning (6am-12pm)',
        afternoon: 'afternoon (12pm-6pm)',
        evening: 'evening (6pm-10pm)',
        night: 'night (10pm-2am)'
      }[pattern.mostProductiveTimeOfDay];
      
      reasons.push(`You're most productive in the ${timeLabel}.`);
    }

    // Streak encouragement
    if (pattern.writingStreakDays >= 3) {
      reasons.push(
        `Great job maintaining a ${pattern.writingStreakDays}-day writing streak! 🔥`
      );
    }

    return reasons.join(' ');
  }

  private assessDifficulty(
    target: number,
    pattern: UserWritingPattern
  ): 'easy' | 'moderate' | 'challenging' {
    const ratio = target / pattern.averageWordsPerSession;
    
    if (ratio < 0.8) return 'easy';
    if (ratio > 1.2) return 'challenging';
    return 'moderate';
  }

  private generateAlternatives(
    baseTarget: number
  ): Array<{ type: string; target: number; reasoning: string }> {
    return [
      {
        type: 'word_count',
        target: Math.round(baseTarget * 0.7),
        reasoning: 'A lighter goal for a quick win'
      },
      {
        type: 'time_based',
        target: 30,
        reasoning: 'Focus on time instead of word count'
      },
      {
        type: 'task_based',
        target: 1,
        reasoning: 'Complete one specific section or paragraph'
      }
    ];
  }

  private analyzeTimeDistribution(sessions: any[]): { peak: "morning" | "afternoon" | "evening" | "night" } {
    const distribution = {
      morning: 0, // 6am-12pm
      afternoon: 0, // 12pm-6pm
      evening: 0, // 6pm-10pm
      night: 0 // 10pm-6am
    };

    sessions.forEach(session => {
      if (session.start_time) {
        const hour = new Date(session.start_time).getHours();
        if (hour >= 6 && hour < 12) distribution.morning += (session.words_written || 0);
        else if (hour >= 12 && hour < 18) distribution.afternoon += (session.words_written || 0);
        else if (hour >= 18 && hour < 22) distribution.evening += (session.words_written || 0);
        else distribution.night += (session.words_written || 0);
      }
    });

    const peak = Object.entries(distribution).sort((a, b) => (b[1] as number) - (a[1] as number))[0][0] as "morning" | "afternoon" | "evening" | "night";
    return { peak };
  }

  private analyzeDayDistribution(sessions: any[]): { peak: number } {
    const distribution = Array(7).fill(0);
    
    sessions.forEach(session => {
      if (session.start_time) {
        const day = new Date(session.start_time).getDay();
        distribution[day] += (session.words_written || 0);
      }
    });

    const peakDay = distribution.indexOf(Math.max(...distribution));
    return { peak: peakDay };
  }

  private async calculateStreak(userId: string): Promise<number> {
    const { data: sessions, error } = await this.supabase
      .from('writing_sessions')
      .select('start_time')
      .eq('user_id', userId)
      .order('start_time', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching writing sessions for streak calculation:', error);
      return 0;
    }

    if (!sessions || sessions.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const session of sessions) {
      if (!session.start_time) continue;
      
      const sessionDate = new Date(session.start_time);
      sessionDate.setHours(0, 0, 0, 0);

      const dayDiff = Math.floor(
        (currentDate.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (dayDiff === streak) {
        streak++;
      } else if (dayDiff > streak) {
        break;
      }
    }

    return streak;
  }
}