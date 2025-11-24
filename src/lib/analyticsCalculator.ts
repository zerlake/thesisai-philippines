import { 
  WritingAnalytics, 
  DailyWritingStats, 
  ProductivityPattern,
  WritingSession,
  ThesisProgress,
  Chapter
} from '@/types/analytics';
import { supabase } from '@/integrations/supabase/client';

export class AnalyticsCalculator {
  private supabase = supabase;

  /**
   * Calculate comprehensive writing analytics
   */
  async calculateAnalytics(
    userId: string,
    dateRange: { start: Date; end: Date }
  ): Promise<WritingAnalytics> {
    // Fetch all relevant data
    const [sessions, thesisProgress, chapters] = await Promise.all([
      this.getWritingSessions(userId, dateRange),
      this.getThesisProgress(userId),
      this.getChapters(userId)
    ]);

    // Calculate metrics
    const wordCountMetrics = this.calculateWordCountMetrics(sessions);
    const productivityMetrics = this.calculateProductivityMetrics(sessions);
    const chapterProgress = this.calculateChapterProgress(chapters);
    const velocityData = this.calculateVelocityData(sessions, dateRange);
    const heatmapData = this.generateHeatmapData(sessions);
    const predictions = await this.predictCompletion(userId, thesisProgress, velocityData);

    return {
      userId,
      dateRange,
      wordCountMetrics,
      productivityMetrics,
      chapterProgress,
      velocityData,
      heatmapData,
      predictions
    };
  }

  private async getWritingSessions(userId: string, dateRange: { start: Date; end: Date }): Promise<WritingSession[]> {
    const { data, error } = await this.supabase
      .from('writing_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', dateRange.start.toISOString())
      .lte('start_time', dateRange.end.toISOString())
      .order('start_time', { ascending: false });

    if (error) {
      console.error('Error fetching writing sessions:', error);
      return [];
    }

    return data?.map(session => ({
      ...session,
      startTime: new Date(session.start_time),
      endTime: session.end_time ? new Date(session.end_time) : undefined,
      createdAt: new Date(session.created_at)
    })) || [];
  }

  private async getThesisProgress(userId: string): Promise<ThesisProgress | null> {
    const { data, error } = await this.supabase
      .from('thesis_progress')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching thesis progress:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      ...data,
      updatedAt: new Date(data.updated_at)
    };
  }

  private async getChapters(userId: string): Promise<Chapter[]> {
    const { data, error } = await this.supabase
      .from('chapters')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching chapters:', error);
      return [];
    }

    return data?.map(chapter => ({
      ...chapter,
      createdAt: new Date(chapter.created_at),
      updatedAt: new Date(chapter.updated_at)
    })) || [];
  }

  private calculateWordCountMetrics(sessions: WritingSession[]) {
    if (sessions.length === 0) {
      return {
        total: 0,
        average: 0,
        peak: 0,
        trend: 'stable' as const
      };
    }

    const wordCounts = sessions.map(s => s.wordsWritten);
    const total = wordCounts.reduce((sum, wc) => sum + wc, 0);
    const average = total / wordCounts.length || 0;
    const peak = Math.max(...wordCounts);

    // Calculate trend (simple linear regression)
    const trend = this.calculateTrend(
      sessions.map((s, i) => ({ x: i, y: s.wordsWritten }))
    );

    return {
      total: Math.round(total),
      average: Math.round(average),
      peak,
      trend: (trend > 0.1 ? 'increasing' : trend < -0.1 ? 'decreasing' : 'stable') as 'increasing' | 'decreasing' | 'stable'
    };
  }

  private calculateProductivityMetrics(sessions: WritingSession[]) {
    if (sessions.length === 0) {
      return {
        sessionsCount: 0,
        averageSessionDuration: 0,
        totalWritingTime: 0,
        focusScore: 0
      };
    }

    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((sum, s) => {
      if (s.endTime) {
        const duration = (s.endTime.getTime() - s.startTime.getTime()) / (1000 * 60);
        return sum + duration;
      }
      return sum;
    }, 0);

    const avgSessionDuration = totalSessions > 0 ? totalMinutes / totalSessions : 0;
    const focusScore = sessions.reduce((sum, s) => sum + (s.focusScore || 0), 0) / totalSessions || 0;

    return {
      sessionsCount: totalSessions,
      averageSessionDuration: Math.round(avgSessionDuration),
      totalWritingTime: Math.round(totalMinutes),
      focusScore: Math.round(focusScore)
    };
  }

  private calculateChapterProgress(chapters: Chapter[]) {
    return chapters.map(chapter => ({
      chapterId: chapter.id,
      title: chapter.title,
      wordCount: chapter.wordCount || 0,
      targetWordCount: chapter.targetWordCount || 5000,
      percentComplete: Math.round(
        ((chapter.wordCount || 0) / (chapter.targetWordCount || 1000)) * 100
      )
    }));
  }

  private calculateVelocityData(sessions: WritingSession[], dateRange: { start: Date; end: Date }) {
    // Create a map to group words by date
    const dateMap = new Map<string, number>();
    
    // Initialize all dates in the range with 0
    const currentDate = new Date(dateRange.start);
    while (currentDate <= dateRange.end) {
      const dateStr = currentDate.toISOString().split('T')[0];
      dateMap.set(dateStr, 0);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Add actual sessions data
    sessions.forEach(session => {
      const date = session.startTime.toISOString().split('T')[0];
      if (dateMap.has(date)) {
        dateMap.set(date, (dateMap.get(date) || 0) + session.wordsWritten);
      }
    });

    // Sort and create cumulative data
    const sorted = Array.from(dateMap.entries()).sort((a, b) => 
      a[0].localeCompare(b[0])
    );

    let cumulative = 0;
    return sorted.map(([date, words]) => {
      cumulative += words;
      return {
        date,
        wordsWritten: words,
        cumulativeWords: cumulative
      };
    });
  }

  private generateHeatmapData(sessions: WritingSession[]) {
    // Create 7x24 grid (days x hours)
    const heatmap = Array.from({ length: 7 }, () =>
      Array.from({ length: 24 }, () => 0)
    );

    // Aggregate words by day/hour
    sessions.forEach(session => {
      const date = session.startTime;
      const day = date.getDay(); // Sunday = 0, Monday = 1, etc.
      const hour = date.getHours();
      heatmap[day][hour] += session.wordsWritten;
    });

    // Find max for normalization
    const max = Math.max(...heatmap.flat());

    // Convert to flat array with intensity
    const data: Array<{
      day: number;
      hour: number;
      wordsWritten: number;
      intensity: number;
    }> = [];
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const words = heatmap[day][hour];
        data.push({
          day,
          hour,
          wordsWritten: words,
          intensity: max > 0 ? Math.round((words / max) * 100) : 0
        });
      }
    }

    return data;
  }

  private async predictCompletion(
    userId: string,
    thesisProgress: ThesisProgress | null,
    velocityData: WritingAnalytics['velocityData']
  ): Promise<WritingAnalytics['predictions']> {
    if (!thesisProgress || velocityData.length < 7) {
      return {
        estimatedCompletionDate: null,
        confidence: 0,
        daysRemaining: null
      };
    }

    const remaining = thesisProgress.targetWordCount - thesisProgress.currentWordCount;
    
    // Calculate average daily velocity (last 14 days or all available)
    const recentVelocity = velocityData.slice(-14);
    if (recentVelocity.length === 0) {
      return {
        estimatedCompletionDate: null,
        confidence: 0,
        daysRemaining: null
      };
    }
    
    const avgDailyWords = recentVelocity.reduce((sum, v) => sum + v.wordsWritten, 0) / recentVelocity.length;

    if (avgDailyWords <= 0) {
      return {
        estimatedCompletionDate: null,
        confidence: 0,
        daysRemaining: null
      };
    }

    // Predict days remaining
    const daysRemaining = Math.ceil(remaining / avgDailyWords);
    const estimatedCompletionDate = new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000);

    // Calculate confidence based on velocity consistency
    const dailyValues = recentVelocity.map(v => v.wordsWritten);
    const avg = dailyValues.reduce((sum, val) => sum + val, 0) / dailyValues.length;
    const variance = dailyValues.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / dailyValues.length;
    const stdDev = Math.sqrt(variance);
    
    // Confidence is higher when daily word counts are more consistent
    let confidence = Math.max(0, 100 - (stdDev / avg) * 50);
    confidence = Math.min(100, confidence); // Cap at 100

    return {
      estimatedCompletionDate,
      confidence: Math.round(confidence),
      daysRemaining
    };
  }

  private calculateTrend(data: { x: number; y: number }[]): number {
    if (data.length < 2) return 0;
    
    const n = data.length;
    const sumX = data.reduce((sum, d) => sum + d.x, 0);
    const sumY = data.reduce((sum, d) => sum + d.y, 0);
    const sumXY = data.reduce((sum, d) => sum + d.x * d.y, 0);
    const sumX2 = data.reduce((sum, d) => sum + d.x * d.x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    return slope;
  }

  /**
   * Calculate daily writing statistics for a given date range
   */
  async calculateDailyStats(
    userId: string,
    dateRange: { start: Date; end: Date }
  ): Promise<DailyWritingStats[]> {
    const sessions = await this.getWritingSessions(userId, dateRange);

    // Group by date
    const dateMap = new Map<string, {
      wordsWritten: number;
      sessionsCount: number;
      totalMinutes: number;
      focusScores: number[];
    }>();

    sessions.forEach(session => {
      const date = session.startTime.toISOString().split('T')[0];
      
      if (!dateMap.has(date)) {
        dateMap.set(date, {
          wordsWritten: 0,
          sessionsCount: 0,
          totalMinutes: 0,
          focusScores: []
        });
      }

      const dayData = dateMap.get(date)!;
      dayData.wordsWritten += session.wordsWritten;
      dayData.sessionsCount += 1;
      
      if (session.endTime) {
        const minutes = (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60);
        dayData.totalMinutes += minutes;
      }

      if (session.focusScore !== undefined) {
        dayData.focusScores.push(session.focusScore);
      }
    });

    // Convert to DailyWritingStats array
    return Array.from(dateMap.entries()).map(([date, data]) => ({
      date,
      wordsWritten: data.wordsWritten,
      sessionsCount: data.sessionsCount,
      totalMinutes: Math.round(data.totalMinutes),
      averageFocusScore: data.focusScores.length > 0 
        ? Math.round(data.focusScores.reduce((sum, score) => sum + score, 0) / data.focusScores.length) 
        : 0
    }));
  }

  /**
   * Calculate productivity patterns for the user
   */
  async calculateProductivityPatterns(
    userId: string,
    dateRange: { start: Date; end: Date }
  ): Promise<ProductivityPattern> {
    const sessions = await this.getWritingSessions(userId, dateRange);

    if (sessions.length === 0) {
      return {
        mostProductiveDay: 0,
        mostProductiveHour: 0,
        averageWordsPerSession: 0,
        averageWordsPerMinute: 0,
        writingStreak: 0
      };
    }

    // Calculate most productive day
    const dayTotals = new Array(7).fill(0);
    sessions.forEach(session => {
      const day = session.startTime.getDay();
      dayTotals[day] += session.wordsWritten;
    });
    const mostProductiveDay = dayTotals.indexOf(Math.max(...dayTotals));

    // Calculate most productive hour
    const hourTotals = new Array(24).fill(0);
    sessions.forEach(session => {
      const hour = session.startTime.getHours();
      hourTotals[hour] += session.wordsWritten;
    });
    const mostProductiveHour = hourTotals.indexOf(Math.max(...hourTotals));

    // Calculate average words per session
    const totalWords = sessions.reduce((sum, s) => sum + s.wordsWritten, 0);
    const avgWordsPerSession = totalWords / sessions.length;

    // Calculate average words per minute
    const totalMinutes = sessions.reduce((sum, s) => {
      if (s.endTime) {
        return sum + (s.endTime.getTime() - s.startTime.getTime()) / (1000 * 60);
      }
      return sum;
    }, 0);
    const avgWordsPerMinute = totalMinutes > 0 ? totalWords / totalMinutes : 0;

    // Calculate writing streak
    const writingStreak = await this.calculateWritingStreak(userId);

    return {
      mostProductiveDay,
      mostProductiveHour,
      averageWordsPerSession: Math.round(avgWordsPerSession),
      averageWordsPerMinute: parseFloat(avgWordsPerMinute.toFixed(2)),
      writingStreak
    };
  }

  private async calculateWritingStreak(userId: string): Promise<number> {
    const { data, error } = await this.supabase
      .from('writing_sessions')
      .select('start_time')
      .eq('user_id', userId)
      .order('start_time', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error fetching sessions for streak calculation:', error);
      return 0;
    }

    if (!data || data.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Extract unique dates from sessions
    const sessionDates = Array.from(
      new Set(data.map(s => new Date(s.start_time).toISOString().split('T')[0]))
    ).map(d => new Date(d));

    // Sort dates from newest to oldest
    sessionDates.sort((a, b) => b.getTime() - a.getTime());

    for (const sessionDate of sessionDates) {
      const dateToCheck = new Date(sessionDate);
      dateToCheck.setHours(0, 0, 0, 0);

      const dayDiff = Math.floor(
        (currentDate.getTime() - dateToCheck.getTime()) / (1000 * 60 * 60 * 24)
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