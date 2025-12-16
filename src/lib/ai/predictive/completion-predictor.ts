// src/lib/ai/predictive/completion-predictor.ts

import { createServerClient } from '@/lib/supabase-server';
import { UserLearningProfile, PerformanceRecord } from '../recommendation-engine';

export interface ThesisProgressData {
  userId: string;
  sectionsCompleted: number;
  totalSections: number;
  wordsWritten: number;
  targetWords: number;
  daysSinceStart: number;
  currentMilestone: string;
  milestones: string[];
  weeklyProgress: number[]; // Words written per week
  timePerDay: number; // Average time spent per day in minutes
  engagementScore: number; // 0-100 score based on activity
  interruptions: number; // Number of days with no activity
  helpRequests: number; // Number of times user sought help
  feedbackReceived: number; // Number of feedback sessions
  resourcesUsed: string[]; // Tools/resources used (flashcards, defense, study guides)
}

export interface CompletionPrediction {
  id: string;
  userId: string;
  predictedDaysRemaining: number; // Number of days to completion
  confidence: number; // Confidence level (0-1)
  completionDate: Date; // Predicted completion date
  factors: {
    pace: number; // Current writing pace (words/day)
    consistency: number; // Consistency score (0-1)
    engagement: number; // Engagement level (0-1)
    interruptions: number; // Effect of work interruptions
    support: number; // Effect of support utilization
  };
  riskFactors: {
    lowPace: boolean; // Writing pace below threshold
    inconsistent: boolean; // Inconsistent writing patterns
    disengaged: boolean; // Low engagement score
    manyInterruptions: boolean; // Frequent interruptions
    insufficientSupport: boolean; // Low help utilization
  };
  recommendations: string[]; // Suggestions to improve timeline
  updatedAt: Date;
}

export interface CompletionTrend {
  userId: string;
  date: Date;
  predictedDaysRemaining: number;
  actualProgress: number; // Actual completion percentage
  confidence: number;
}

export class CompletionPredictor {
  private supabase: any;

  constructor() {
    // The supabase client will be initialized per request
  }

  /**
   * Predicts the time to thesis completion based on user's progress data
   */
  async predictCompletion(userId: string): Promise<CompletionPrediction> {
    try {
      // Fetch user's thesis progress data
      const progressData = await this.getUserProgressData(userId);
      
      // Calculate the prediction using multiple factors
      const prediction = this.calculateCompletionPrediction(progressData);
      
      return prediction;
    } catch (error) {
      console.error('Error predicting completion:', error);
      throw new Error('Failed to predict completion');
    }
  }

  /**
   * Fetches user's thesis progress data from the database
   */
  private async getUserProgressData(userId: string): Promise<ThesisProgressData> {
    this.supabase = await createServerClient();

    // Fetch user's thesis progress from the database
    // This is a simplified version - in a real implementation, we would have specific thesis progress tables
    const { data: thesisProgress, error: thesisError } = await this.supabase
      .from('thesis_progress')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (thesisError) {
      console.error('Error fetching thesis progress:', thesisError);
      // If no thesis progress data exists, create default values
    }

    // Fetch user's activity data to calculate other metrics
    const { data: writingSessions, error: writingError } = await this.supabase
      .from('writing_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

    if (writingError) {
      console.error('Error fetching writing sessions:', writingError);
    }

    const { data: activity, error: activityError } = await this.supabase
      .from('daily_learning_activity')
      .select('*')
      .eq('user_id', userId)
      .gte('activity_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Last 30 days

    if (activityError) {
      console.error('Error fetching activity data:', activityError);
    }

    // Calculate metrics from available data
    let wordsWritten = 0;
    let totalDaysActive = 0;
    let totalMinutesSpent = 0;
    let interruptions = 0; // Days with no writing activity
    
    // Calculate from writing sessions
    if (writingSessions && writingSessions.length > 0) {
      wordsWritten = writingSessions.reduce((sum: number, session: { words_written?: number }) => sum + (session.words_written || 0), 0);
      totalMinutesSpent = writingSessions.reduce((sum: number, session: { duration_minutes?: number }) => sum + (session.duration_minutes || 0), 0);
      
      // Calculate interruptions (days with no writing)
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30); // Last 30 days
      
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        
        const hasActivity = writingSessions.some((session: { created_at: string }) =>
          session.created_at.includes(dateString)
        );
        
        if (!hasActivity) {
          interruptions++;
        } else {
          totalDaysActive++;
        }
      }
    }

    // Calculate engagement score based on activity
    let engagementScore = 50; // Default score
    if (activity && activity.length > 0) {
      // Calculate engagement based on variety of activities and consistency
      const toolUsage = new Set();
      activity.forEach((session: { tool_used?: string }) => {
        if (session.tool_used) toolUsage.add(session.tool_used);
      });
      
      // Higher engagement for using multiple tools
      engagementScore = Math.min(100, 30 + (toolUsage.size * 15) + (totalDaysActive * 0.5));
    }

    // Get user's learning profile to factor in learning patterns
    const { data: profile, error: profileError } = await this.supabase
      .from('user_learning_profiles') // This would be populated by the recommendation system
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
    }

    // Get recent help requests and feedback
    const { data: helpRequests, error: helpError } = await this.supabase
      .from('help_requests') // Hypothetical table for help requests
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (helpError) {
      console.error('Error fetching help requests:', helpError);
    }

    const { data: feedback, error: feedbackError } = await this.supabase
      .from('feedback_sessions') // Hypothetical table for feedback sessions
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (feedbackError) {
      console.error('Error fetching feedback sessions:', feedbackError);
    }

    // Calculate weekly progress (words per week)
    const weeklyProgress: number[] = [];
    for (let week = 0; week < 4; week++) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (week * 7 + 7)); // Start of week
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - (week * 7)); // End of week
      
      const weekSessions = writingSessions?.filter((session: { created_at: string }) => {
        const sessionDate = new Date(session.created_at);
        return sessionDate >= startDate && sessionDate <= endDate;
      }) || [];

      const weekWords = weekSessions.reduce((sum: number, session: { words_written?: number }) => sum + (session.words_written || 0), 0);
      weeklyProgress.push(weekWords);
    }

    // Determine current milestone based on progress
    const milestones = [
      'Proposal', 'Literature Review', 'Methodology',
      'Data Collection', 'Analysis', 'Results', 'Discussion', 'Conclusion'
    ];
    
    // Simplified milestone calculation based on word count
    const progressPercentage = wordsWritten / 10000; // Assuming 10k word thesis for example
    const currentMilestoneIndex = Math.min(Math.floor(progressPercentage * milestones.length), milestones.length - 1);
    const currentMilestone = milestones[currentMilestoneIndex] || 'Proposal';

    return {
      userId,
      sectionsCompleted: currentMilestoneIndex,
      totalSections: milestones.length,
      wordsWritten,
      targetWords: 10000, // Example target
      daysSinceStart: 30, // Example value
      currentMilestone,
      milestones,
      weeklyProgress,
      timePerDay: totalMinutesSpent / totalDaysActive || 0,
      engagementScore,
      interruptions,
      helpRequests: helpRequests?.length || 0,
      feedbackReceived: feedback?.length || 0,
      resourcesUsed: ['flashcards', 'study_guides'] // Example resources used
    };
  }

  /**
   * Calculates the completion prediction using multiple factors
   */
  private calculateCompletionPrediction(progressData: ThesisProgressData): CompletionPrediction {
    // Calculate current writing pace (words per day)
    const avgWordsPerDay = progressData.wordsWritten / progressData.daysSinceStart || 0;
    
    // Calculate days remaining based on current pace
    const remainingWords = progressData.targetWords - progressData.wordsWritten;
    let predictedDaysRemaining = avgWordsPerDay > 0 ? Math.ceil(remainingWords / avgWordsPerDay) : 90; // Default to 90 if no pace
    
    // Apply adjustments based on various factors
    let consistencyAdjustment = 1.0;
    let engagementAdjustment = 1.0;
    let interruptionAdjustment = 1.0;
    let supportAdjustment = 1.0;
    
    // Consistency factor (if user has many interruptions)
    if (progressData.interruptions > 5) {
      consistencyAdjustment = 1.5; // More interruptions = longer time
    } else if (progressData.interruptions === 0) {
      consistencyAdjustment = 0.9; // Perfect consistency = faster
    }
    
    // Engagement factor
    if (progressData.engagementScore < 50) {
      engagementAdjustment = 1.3; // Lower engagement = slower progress
    } else if (progressData.engagementScore > 80) {
      engagementAdjustment = 0.9; // High engagement = faster progress
    }
    
    // Interruption factor
    if (progressData.interruptions > 10) {
      interruptionAdjustment = 2.0; // Many interruptions = much slower
    } else if (progressData.interruptions < 3) {
      interruptionAdjustment = 0.9; // Few interruptions = faster
    }
    
    // Support factor (using help increases chance of success)
    if (progressData.helpRequests < 2 && progressData.feedbackReceived < 2) {
      supportAdjustment = 1.2; // Low support utilization = slower progress
    } else if (progressData.helpRequests > 5 || progressData.feedbackReceived > 3) {
      supportAdjustment = 0.85; // High support utilization = faster progress
    }
    
    // Apply adjustments
    predictedDaysRemaining = Math.round(predictedDaysRemaining * 
      consistencyAdjustment * 
      engagementAdjustment * 
      interruptionAdjustment * 
      supportAdjustment);
    
    // Calculate confidence based on available data
    let confidence = 0.5; // Base confidence
    if (progressData.daysSinceStart > 14) confidence += 0.2; // More data = higher confidence
    if (progressData.weeklyProgress.length > 2) confidence += 0.15; // Consistent weekly data
    if (progressData.engagementScore > 60) confidence += 0.15; // Higher engagement = more predictable
    
    // Cap confidence at 0.95
    confidence = Math.min(0.95, confidence);
    
    // Calculate completion date
    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + predictedDaysRemaining);
    
    // Determine risk factors
    const riskFactors = {
      lowPace: avgWordsPerDay < 100, // Less than 100 words per day
      inconsistent: progressData.interruptions > 7, // More than 1 week of interruptions
      disengaged: progressData.engagementScore < 50, // Engagement below 50%
      manyInterruptions: progressData.interruptions > 10, // Many interruptions
      insufficientSupport: progressData.helpRequests < 1 && progressData.feedbackReceived < 1 // Low support
    };
    
    // Generate recommendations based on risk factors
    const recommendations: string[] = [];
    if (riskFactors.lowPace) {
      recommendations.push("Increase your daily writing pace to at least 200 words per day");
    }
    if (riskFactors.inconsistent) {
      recommendations.push("Try to write daily to build a consistent habit");
    }
    if (riskFactors.disengaged) {
      recommendations.push("Use more learning tools to increase engagement");
    }
    if (riskFactors.manyInterruptions) {
      recommendations.push("Reduce interruptions by setting aside dedicated writing time");
    }
    if (riskFactors.insufficientSupport) {
      recommendations.push("Schedule more feedback sessions with your advisor");
    }
    
    // Add generic recommendation if no specific risk factors
    if (recommendations.length === 0) {
      recommendations.push("Continue your current pace to meet your timeline");
    }
    
    // Calculate factor scores for the prediction
    const factors = {
      pace: Math.min(1.0, avgWordsPerDay / 300), // Normalize against target pace of 300 words/day
      consistency: Math.max(0.1, 1.0 - (progressData.interruptions / 30)), // 30 days in sample
      engagement: progressData.engagementScore / 100,
      interruptions: Math.max(0.1, 1.0 - (progressData.interruptions / 20)), // Normalize against 20 threshold
      support: Math.min(1.0, (progressData.helpRequests + progressData.feedbackReceived) / 5) // Normalize against 5 threshold
    };
    
    return {
      id: `completion-pred-${progressData.userId}-${Date.now()}`,
      userId: progressData.userId,
      predictedDaysRemaining,
      confidence,
      completionDate,
      factors,
      riskFactors,
      recommendations,
      updatedAt: new Date()
    };
  }

  /**
   * Updates the completion prediction trend for a user
   */
  async updatePredictionTrend(userId: string, prediction: CompletionPrediction) {
    this.supabase = await createServerClient();
    
    // In a real implementation, this would store the prediction in a database
    // For now, this is a placeholder for the functionality
    
    try {
      // Save the prediction to the database
      const trendData: CompletionTrend = {
        userId: prediction.userId,
        date: prediction.updatedAt,
        predictedDaysRemaining: prediction.predictedDaysRemaining,
        actualProgress: 0, // This would be populated later as progress is made
        confidence: prediction.confidence
      };
      
      // Store in the database (this would require creating a table)
      console.log("Would save prediction trend:", trendData);
    } catch (error) {
      console.error("Error updating prediction trend:", error);
    }
  }

  /**
   * Gets historical prediction trends for a user
   */
  async getPredictionHistory(userId: string): Promise<CompletionTrend[]> {
    this.supabase = await createServerClient();
    
    // In a real implementation, this would fetch from a database
    // For now, return mock data to show the functionality
    
    return [
      {
        userId,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        predictedDaysRemaining: 45,
        actualProgress: 15,
        confidence: 0.7
      },
      {
        userId,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        predictedDaysRemaining: 52,
        actualProgress: 18,
        confidence: 0.75
      },
      {
        userId,
        date: new Date(), // Today
        predictedDaysRemaining: 48,
        actualProgress: 22, // This would be calculated from actual progress
        confidence: 0.8
      }
    ];
  }
}

// Singleton instance of the completion predictor
export const completionPredictor = new CompletionPredictor();