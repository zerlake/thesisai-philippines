// src/services/recommendation-service.ts
export type { Recommendation } from '@/lib/ai/recommendation-engine';
import type { Recommendation } from '@/lib/ai/recommendation-engine';



export interface RecommendationPreferences {
  preferredTopics?: string[];
  learningStyle?: 'visual' | 'auditory' | 'reading' | 'kinesthetic';
  difficultyAdjustment?: number; // -1 to 1
  maxTimePerSession?: number; // in minutes
  focusAreas?: string[];
}

export interface RecommendationFilter {
  type?: 'content' | 'tool' | 'activity' | 'resource';
  priority?: 'high' | 'medium' | 'low';
  topic?: string;
  targetTool?: 'flashcard' | 'defense' | 'study_guide';
  limit?: number;
}

/**
 * Service class to handle recommendation-related operations
 */
export class RecommendationService {
  /**
   * Fetch personalized recommendations for the user
   */
  async fetchRecommendations(filter?: RecommendationFilter): Promise<Recommendation[]> {
    try {
      const params = new URLSearchParams();
      
      if (filter) {
        if (filter.type) params.append('type', filter.type);
        if (filter.priority) params.append('priority', filter.priority);
        if (filter.topic) params.append('topic', filter.topic);
        if (filter.targetTool) params.append('targetTool', filter.targetTool);
        if (filter.limit) params.append('limit', filter.limit.toString());
      }

      const url = `/api/learning/recommendations${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch recommendations: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.recommendations as Recommendation[];
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw error;
    }
  }

  /**
   * Fetch recommendations with specific context
   */
  async fetchRecommendationsWithContext(context: any, limit?: number): Promise<Recommendation[]> {
    try {
      const response = await fetch('/api/learning/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ context, limit }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch recommendations with context: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.recommendations as Recommendation[];
    } catch (error) {
      console.error('Error fetching recommendations with context:', error);
      throw error;
    }
  }

  /**
   * Track when a user interacts with a recommendation
   */
  async trackRecommendationInteraction(
    recommendationId: string, 
    action: 'viewed' | 'completed' | 'dismissed' | 'ignored'
  ): Promise<void> {
    try {
      // In a real implementation, we would track this in the database
      // For now, we'll just log the interaction
      console.log(`Recommendation ${recommendationId} was ${action}`);
      
      // Optionally send to an analytics endpoint
      await fetch('/api/analytics/recommendation-interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recommendationId,
          action,
          timestamp: new Date().toISOString()
        }),
      });
    } catch (error) {
      console.error('Error tracking recommendation interaction:', error);
      // Don't throw error as this is non-critical
    }
  }

  /**
   * Dismiss a recommendation to prevent future suggestions
   */
  async dismissRecommendation(recommendationId: string): Promise<boolean> {
    try {
      // In a real implementation, we would store this in a user's dismissed recommendations list
      console.log(`Recommendation ${recommendationId} was dismissed`);
      
      // This could be an API call to mark the recommendation as dismissed
      return true;
    } catch (error) {
      console.error('Error dismissing recommendation:', error);
      return false;
    }
  }

  /**
   * Get recommendation preferences for the current user
   */
  async getPreferences(): Promise<RecommendationPreferences> {
    try {
      // In a real implementation, we would fetch from user settings
      const response = await fetch('/api/users/preferences');
      
      if (!response.ok) {
        throw new Error('Failed to fetch user preferences');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching preferences:', error);
      // Return default preferences
      return {};
    }
  }

  /**
   * Update recommendation preferences for the user
   */
  async updatePreferences(preferences: RecommendationPreferences): Promise<boolean> {
    try {
      // In a real implementation, we would update user settings in the database
      const response = await fetch('/api/users/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error updating preferences:', error);
      return false;
    }
  }

  /**
   * Filter recommendations based on user preferences
   */
  filterRecommendations(
    recommendations: Recommendation[], 
    filter: RecommendationFilter
  ): Recommendation[] {
    return recommendations.filter(rec => {
      if (filter.type && rec.type !== filter.type) return false;
      if (filter.priority && rec.priority !== filter.priority) return false;
      if (filter.topic && !rec.topic.toLowerCase().includes(filter.topic.toLowerCase())) return false;
      if (filter.targetTool && rec.targetTool !== filter.targetTool) return false;
      return true;
    }).slice(0, filter.limit);
  }
}

// Singleton instance of the recommendation service
export const recommendationService = new RecommendationService();