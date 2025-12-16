// src/services/thesis-feedback-service.ts

import { 
  ThesisSubmission, 
  ThesisFeedback, 
  AnalysisCriteria,
  FeedbackSuggestion 
} from '@/lib/ai/feedback/thesis-feedback-engine';

export interface FeedbackRequest {
  documentId: string;
  title?: string;
  content: string;
  section?: string;
  wordCount?: number;
  version?: number;
  criteria?: AnalysisCriteria;
}

export interface FeedbackHistoryParams {
  documentId: string;
  section?: string;
  limit?: number;
  offset?: number;
}

/**
 * Service class to handle thesis feedback-related operations
 */
export class ThesisFeedbackService {
  /**
   * Submits a thesis section for feedback analysis
   */
  async submitForFeedback(request: FeedbackRequest): Promise<ThesisFeedback> {
    try {
      const response = await fetch('/api/thesis-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: request.documentId,
          title: request.title,
          content: request.content,
          section: request.section || 'General',
          wordCount: request.wordCount,
          version: request.version || 1,
          criteria: request.criteria
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to submit for feedback: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.feedback as ThesisFeedback;
    } catch (error) {
      console.error('Error submitting for feedback:', error);
      throw error;
    }
  }

  /**
   * Gets feedback history for a specific document
   */
  async getFeedbackHistory(params: FeedbackHistoryParams): Promise<ThesisFeedback[]> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('documentId', params.documentId);
      
      if (params.section) {
        queryParams.append('section', params.section);
      }
      
      if (params.limit) {
        queryParams.append('limit', params.limit.toString());
      }
      
      if (params.offset) {
        queryParams.append('offset', params.offset.toString());
      }
      
      const response = await fetch(`/api/thesis-feedback?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch feedback history: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.feedbackHistory as ThesisFeedback[];
    } catch (error) {
      console.error('Error fetching feedback history:', error);
      throw error;
    }
  }

  /**
   * Gets the most recent feedback for a document
   */
  async getLatestFeedback(documentId: string, section?: string): Promise<ThesisFeedback | null> {
    try {
      const history = await this.getFeedbackHistory({
        documentId,
        section,
        limit: 1
      });
      
      return history.length > 0 ? history[0] : null;
    } catch (error) {
      console.error('Error fetching latest feedback:', error);
      return null;
    }
  }

  /**
   * Filters feedback by severity level
   */
  filterBySeverity(feedback: ThesisFeedback, severity: 'low' | 'medium' | 'high' | 'critical'): FeedbackSuggestion[] {
    return feedback.suggestions.filter(suggestion => suggestion.severity === severity);
  }

  /**
   * Filters feedback by category
   */
  filterByCategory(feedback: ThesisFeedback, category: string): FeedbackSuggestion[] {
    return feedback.suggestions.filter(suggestion => suggestion.category === category);
  }

  /**
   * Gets summary statistics for a feedback
   */
  getFeedbackSummary(feedback: ThesisFeedback): {
    totalSuggestions: number;
    criticalIssues: number;
    highPriorityIssues: number;
    strengthsCount: number;
  } {
    return {
      totalSuggestions: feedback.suggestions.length,
      criticalIssues: feedback.suggestions.filter(s => s.severity === 'critical').length,
      highPriorityIssues: feedback.suggestions.filter(s => s.severity === 'high').length,
      strengthsCount: feedback.strengths.length
    };
  }

  /**
   * Gets recommendations prioritized by severity
   */
  getPrioritizedRecommendations(feedback: ThesisFeedback): FeedbackSuggestion[] {
    return [...feedback.suggestions].sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  /**
   * Calculates improvement percentage based on feedback scores
   */
  calculateImprovementPotential(feedback: ThesisFeedback): number {
    // Calculate based on how many issues were identified vs strengths
    const totalIssues = feedback.suggestions.length;
    const totalStrengths = feedback.strengths.length;
    const totalPoints = totalIssues + totalStrengths;
    
    if (totalPoints === 0) return 0;
    
    // Calculate percentage of strengths
    return Math.round((totalStrengths / totalPoints) * 100);
  }
}

// Singleton instance of the thesis feedback service
export const thesisFeedbackService = new ThesisFeedbackService();