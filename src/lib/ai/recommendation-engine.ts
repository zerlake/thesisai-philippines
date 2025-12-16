// src/lib/ai/recommendation-engine.ts

import { createServerClient } from '@/lib/supabase-server';
import { callPuterAI } from '@/lib/puter-ai-wrapper';
import { advancedLearningAlgorithms } from './advanced-algorithms';

// Define types for our recommendation system
export interface UserLearningProfile {
  userId: string;
  learningStyle: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
  preferredTopics: string[];
  difficultyPreferences: Record<string, number>; // topic -> preferred difficulty level
  timeSpent: Record<string, number>; // topic -> minutes spent
  performanceHistory: PerformanceRecord[];
  lastActive: Date;
  engagementScore: number;
}

export interface PerformanceRecord {
  date: Date;
  toolType: 'flashcard' | 'defense' | 'study_guide';
  topic: string;
  score: number;
  timeSpent: number;
  difficulty: number;
}

export interface Recommendation {
  id: string;
  type: 'content' | 'tool' | 'activity' | 'resource';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  targetTool?: 'flashcard' | 'defense' | 'study_guide';
  topic: string;
  difficultyAdjustment?: number; // -1 for easier, 0 for same, 1 for harder
  estimatedTime: number; // in minutes
  createdAt: Date;
}

export interface RecommendationContext {
  userLearningProfile: UserLearningProfile;
  recentActivity: any[];
  currentTool?: 'flashcard' | 'defense' | 'study_guide';
  currentTopic?: string;
  performanceTrends: PerformanceTrend[];
}

export interface PerformanceTrend {
  topic: string;
  trend: 'improving' | 'declining' | 'stable';
  confidence: number; // 0-1
  lastUpdated: Date;
}

export class RecommendationEngine {
  private supabase: any;

  constructor() {
    // The supabase client will be initialized per request
  }

  /**
   * Generates personalized recommendations for a user based on their learning profile
   * and recent activity
   */
  async generateRecommendations(userId: string): Promise<Recommendation[]> {
    try {
      // Fetch user's learning profile from database
      const userLearningProfile = await this.getUserLearningProfile(userId);

      // Fetch recent activity
      const recentActivity = await this.getRecentActivity(userId);

      // Analyze performance trends using advanced algorithms
      const performanceTrends = await this.analyzePerformanceTrends(userId, userLearningProfile.performanceHistory);

      // Create context for recommendation generation
      const context: RecommendationContext = {
        userLearningProfile,
        recentActivity,
        performanceTrends
      };

      // Generate various types of recommendations
      const recommendations: Recommendation[] = [];

      // Add recommendations based on weak areas
      recommendations.push(...await this.getWeakAreaRecommendations(context));

      // Add recommendations based on learning style
      recommendations.push(...await this.getStyleBasedRecommendations(context));

      // Add recommendations based on performance trends
      recommendations.push(...await this.getTrendBasedRecommendations(context));

      // Add spaced repetition recommendations
      recommendations.push(...await this.getSpacedRepetitionRecommendations(context));

      // Add difficulty adjustment recommendations
      recommendations.push(...await this.getDifficultyAdjustmentRecommendations(context));

      // Add knowledge gap recommendations using advanced algorithms
      recommendations.push(...await this.getKnowledgeGapRecommendations(context));

      // Rank and prioritize recommendations
      return this.rankRecommendations(recommendations, context);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw new Error('Failed to generate recommendations');
    }
  }

  private async getUserLearningProfile(userId: string): Promise<UserLearningProfile> {
    // In a real implementation, this would fetch from the database
    // For now, we'll create a mock profile based on available data
    
    this.supabase = await createServerClient();
    
    // Fetch user's activity data to build a learning profile
    const { data: flashcardReviews, error: fcError } = await this.supabase
      .from('card_review_sessions')
      .select('*')
      .eq('user_id', userId)
      .limit(50)
      .order('created_at', { ascending: false });

    if (fcError) {
      console.error('Error fetching flashcard reviews:', fcError);
    }

    const { data: defensePractice, error: defError } = await this.supabase
      .from('defense_practice_sessions')
      .select('*')
      .eq('user_id', userId)
      .limit(50)
      .order('created_at', { ascending: false });

    if (defError) {
      console.error('Error fetching defense practice:', defError);
    }

    const { data: studyNotes, error: noteError } = await this.supabase
      .from('study_guide_notes')
      .select('*')
      .eq('user_id', userId)
      .limit(50)
      .order('created_at', { ascending: false });

    if (noteError) {
      console.error('Error fetching study notes:', noteError);
    }

    // Calculate basic profile from activity
    // This is a simplified version - in a real implementation, we'd have more sophisticated analytics
    const topics = new Set<string>();
    let totalEngagement = 0;
    const topicTime: Record<string, number> = {};
    const topicPerformance: Record<string, number[]> = {};

    // Process flashcard data
    if (flashcardReviews) {
      flashcardReviews.forEach((review: any) => {
        // Extract topics from the review session
        // For now, we'll use a generic topic
        const topic = 'Thesis Content'; // In reality, this would come from the deck
        topics.add(topic);
        topicTime[topic] = (topicTime[topic] || 0) + (review.time_spent || 5);
        if (review.score !== undefined) {
          if (!topicPerformance[topic]) topicPerformance[topic] = [];
          topicPerformance[topic].push(review.score);
        }
      });
    }

    // Calculate average performance per topic
    const avgPerformance: Record<string, number> = {};
    Object.entries(topicPerformance).forEach(([topic, scores]) => {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      avgPerformance[topic] = avg;
      totalEngagement += scores.length;
    });

    // Determine learning style based on tools used most
    const toolUsage = {
      flashcard: flashcardReviews?.length || 0,
      defense: defensePractice?.length || 0,
      study: studyNotes?.length || 0
    };
    
    const maxTool = Object.entries(toolUsage).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    const learningStyleMap: Record<string, UserLearningProfile['learningStyle']> = {
      flashcard: 'visual',
      defense: 'auditory',
      study: 'reading'
    };
    
    const learningStyle = learningStyleMap[maxTool] || 'reading';

    return {
      userId,
      learningStyle,
      preferredTopics: Array.from(topics),
      difficultyPreferences: {}, // Would be calculated from user's chosen difficulty levels
      timeSpent: topicTime,
      performanceHistory: [], // Would be populated from actual performance records
      lastActive: new Date(),
      engagementScore: totalEngagement
    };
  }

  private async getRecentActivity(userId: string): Promise<any[]> {
    // Fetch recent activity from all tools
    this.supabase = await createServerClient();
    
    const { data: activity, error } = await this.supabase.rpc('get_user_recent_activity', { 
      user_id_input: userId,
      days_back: 7 
    });

    if (error) {
      console.error('Error fetching recent activity:', error);
      // Fallback to manual query
      return [];
    }

    return activity || [];
  }

  private async analyzePerformanceTrends(userId: string, performanceHistory: PerformanceRecord[]): Promise<PerformanceTrend[]> {
    // Analyze the user's performance to find improving/declining/neutral trends
    // Using advanced algorithms for more accurate analysis

    if (!performanceHistory || performanceHistory.length === 0) {
      // Fetch performance history if not provided
      this.supabase = await createServerClient();

      // In a real implementation, this would fetch from the database
      // For now, we'll return mock data based on available information

      return [
        {
          topic: 'Research Methodology',
          trend: 'improving',
          confidence: 0.85,
          lastUpdated: new Date()
        },
        {
          topic: 'Literature Review',
          trend: 'declining',
          confidence: 0.70,
          lastUpdated: new Date()
        },
        {
          topic: 'Data Analysis',
          trend: 'stable',
          confidence: 0.65,
          lastUpdated: new Date()
        }
      ];
    }

    // Get unique topics
    const topics = [...new Set(performanceHistory.map(record => record.topic))];

    // Analyze trend for each topic using advanced algorithms
    const trends: PerformanceTrend[] = [];
    for (const topic of topics) {
      const topicRecords = performanceHistory.filter(record => record.topic === topic);
      const trend = await advancedLearningAlgorithms.analyzePerformanceTrend(topicRecords, topic);
      trends.push(trend);
    }

    return trends;
  }

  private async getWeakAreaRecommendations(context: RecommendationContext): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];
    const { userLearningProfile, performanceTrends } = context;

    // Identify declining performance trends
    const decliningTrends = performanceTrends.filter(trend => trend.trend === 'declining');
    
    for (const trend of decliningTrends) {
      recommendations.push({
        id: `weak-area-${trend.topic}-${Date.now()}`,
        type: 'content',
        title: `Focus on ${trend.topic}`,
        description: `Your performance in ${trend.topic} has been declining. Additional practice is recommended.`,
        priority: 'high',
        reason: `Analysis shows declining performance in this area`,
        topic: trend.topic,
        targetTool: 'flashcard', // Recommend flashcards for focused practice
        difficultyAdjustment: -1, // Start with easier material
        estimatedTime: 20,
        createdAt: new Date()
      });
    }

    return recommendations;
  }

  private async getStyleBasedRecommendations(context: RecommendationContext): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];
    const { userLearningProfile } = context;

    // Generate recommendations based on preferred learning style
    switch (userLearningProfile.learningStyle) {
      case 'visual':
        recommendations.push({
          id: `visual-recommendation-${Date.now()}`,
          type: 'tool',
          title: 'Use Flashcards More',
          description: `Based on your visual learning preference, flashcards will help you retain information better`,
          priority: 'medium',
          reason: `Your learning style is visual-oriented`,
          topic: 'General',
          targetTool: 'flashcard',
          estimatedTime: 15,
          createdAt: new Date()
        });
        break;
        
      case 'auditory':
        recommendations.push({
          id: `auditory-recommendation-${Date.now()}`,
          type: 'activity',
          title: 'Practice Defense Questions',
          description: `As an auditory learner, practicing defense questions out loud will improve retention`,
          priority: 'medium',
          reason: `Your learning style is auditory-oriented`,
          topic: 'General',
          targetTool: 'defense',
          estimatedTime: 25,
          createdAt: new Date()
        });
        break;
        
      case 'reading':
        recommendations.push({
          id: `reading-recommendation-${Date.now()}`,
          type: 'resource',
          title: 'Create Study Guides',
          description: `As a reading/writing learner, creating detailed study guides will help consolidate knowledge`,
          priority: 'medium',
          reason: `Your learning style is reading-oriented`,
          topic: 'General',
          targetTool: 'study_guide',
          estimatedTime: 30,
          createdAt: new Date()
        });
        break;
        
      case 'kinesthetic':
        recommendations.push({
          id: `kinesthetic-recommendation-${Date.now()}`,
          type: 'activity',
          title: 'Interactive Practice',
          description: `Try creating interactive exercises and practicing with hands-on applications`,
          priority: 'medium',
          reason: `Your learning style is kinesthetic-oriented`,
          topic: 'General',
          targetTool: 'defense', // Defense practice is more interactive
          estimatedTime: 20,
          createdAt: new Date()
        });
        break;
    }

    return recommendations;
  }

  private async getTrendBasedRecommendations(context: RecommendationContext): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];
    const { performanceTrends } = context;

    // Identify improving trends to encourage continuation
    const improvingTrends = performanceTrends.filter(trend => trend.trend === 'improving');
    
    for (const trend of improvingTrends) {
      recommendations.push({
        id: `trend-continue-${trend.topic}-${Date.now()}`,
        type: 'activity',
        title: `Continue with ${trend.topic}`,
        description: `Your performance in ${trend.topic} is improving significantly. Keep up the good work!`,
        priority: 'medium',
        reason: `Positive performance trend detected`,
        topic: trend.topic,
        targetTool: 'flashcard', // Continue with current successful approach
        estimatedTime: 15,
        createdAt: new Date()
      });
    }

    return recommendations;
  }

  private async getSpacedRepetitionRecommendations(context: RecommendationContext): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];
    
    // Identify flashcards that are due for review according to spaced repetition
    this.supabase = await createServerClient();
    
    const { data: dueCards, error } = await this.supabase
      .from('flashcard_cards')
      .select('*, deck:flashcard_decks(*)')
      .eq('deck.user_id', context.userLearningProfile.userId)
      .lt('next_review', new Date().toISOString());
    
    if (error) {
      console.error('Error fetching due cards for spaced repetition:', error);
    }
    
    if (dueCards && dueCards.length > 0) {
      recommendations.push({
        id: `spaced-repetition-${Date.now()}`,
        type: 'activity',
        title: `Review ${dueCards.length} Flashcards`,
        description: `According to spaced repetition algorithm, ${dueCards.length} cards are due for review`,
        priority: 'high',
        reason: `Spaced repetition schedule`,
        topic: 'Various Topics',
        targetTool: 'flashcard',
        estimatedTime: dueCards.length * 2, // 2 minutes per card
        createdAt: new Date()
      });
    }

    return recommendations;
  }

  private async getDifficultyAdjustmentRecommendations(context: RecommendationContext): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // Analyze if user is struggling with current difficulty level
    // This would be based on user's recent performance
    // For now, we'll implement a simplified version

    // If user is having trouble, recommend easier content; if doing well, recommend harder
    // This would be more sophisticated in a real implementation
    return recommendations;
  }

  private async getKnowledgeGapRecommendations(context: RecommendationContext): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];
    const { userLearningProfile } = context;

    // Define concept dependencies for thesis writing (simplified example)
    const conceptDependencies: Record<string, string[]> = {
      'Thesis Defense': ['Research Methodology', 'Literature Review', 'Data Analysis'],
      'Data Analysis': ['Research Methodology', 'Statistics'],
      'Literature Review': ['Research Methodology'],
      'Research Methodology': [],
      'Statistics': []
    };

    // Identify knowledge gaps using advanced algorithms
    const knowledgeGaps = await advancedLearningAlgorithms.identifyKnowledgeGaps(
      userLearningProfile.performanceHistory,
      conceptDependencies
    );

    // Create recommendations for each identified gap
    for (const gap of knowledgeGaps) {
      recommendations.push({
        id: `knowledge-gap-${gap}-${Date.now()}`,
        type: 'content',
        title: `Strengthen Skills in ${gap}`,
        description: `Analysis shows ${gap} is a prerequisite for other topics you're struggling with. Focusing on this area will improve your overall performance.`,
        priority: 'high',
        reason: `Knowledge gap identified in prerequisite concept`,
        topic: gap,
        targetTool: 'flashcard', // Recommend flashcards for foundational knowledge
        estimatedTime: 25,
        createdAt: new Date()
      });
    }

    return recommendations;
  }

  private rankRecommendations(recommendations: Recommendation[], context: RecommendationContext): Recommendation[] {
    // Sort recommendations by priority and relevance
    return recommendations.sort((a, b) => {
      // Priority ranking: high > medium > low
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      
      // If same priority, rank by relevance to current activity
      if (context.currentTool && a.targetTool === context.currentTool && b.targetTool !== context.currentTool) {
        return -1;
      }
      if (context.currentTool && b.targetTool === context.currentTool && a.targetTool !== context.currentTool) {
        return 1;
      }
      
      return 0;
    });
  }
}

// Singleton instance of the recommendation engine
export const recommendationEngine = new RecommendationEngine();