// src/services/completion-prediction-service.ts
export type { CompletionPrediction, CompletionTrend } from '@/lib/ai/predictive/completion-predictor';
import type { CompletionPrediction, CompletionTrend } from '@/lib/ai/predictive/completion-predictor';



/**
 * Service class to handle completion prediction-related operations
 */
export class CompletionPredictionService {
  /**
   * Fetch the current completion prediction for the user
   */
  async fetchCurrentPrediction(): Promise<CompletionPrediction> {
    try {
      const response = await fetch('/api/learning/completion-predictions');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch completion prediction: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.prediction as CompletionPrediction;
    } catch (error) {
      console.error('Error fetching completion prediction:', error);
      throw error;
    }
  }

  /**
   * Fetch the prediction history for the user
   */
  async fetchPredictionHistory(): Promise<CompletionTrend[]> {
    try {
      const response = await fetch('/api/learning/completion-predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'history' }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch prediction history: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.history as CompletionTrend[];
    } catch (error) {
      console.error('Error fetching prediction history:', error);
      throw error;
    }
  }

  /**
   * Get a summary of the prediction for dashboard display
   */
  async getPredictionSummary(): Promise<{
    predictedDaysRemaining: number;
    completionDate: string;
    confidence: number;
    riskLevel: 'low' | 'medium' | 'high';
    nextMilestone: string;
  }> {
    try {
      const prediction = await this.fetchCurrentPrediction();
      
      // Calculate risk level based on risk factors
      let riskCount = 0;
      if (prediction.riskFactors.lowPace) riskCount++;
      if (prediction.riskFactors.inconsistent) riskCount++;
      if (prediction.riskFactors.disengaged) riskCount++;
      if (prediction.riskFactors.manyInterruptions) riskCount++;
      if (prediction.riskFactors.insufficientSupport) riskCount++;
      
      let riskLevel: 'low' | 'medium' | 'high';
      if (riskCount <= 1) riskLevel = 'low';
      else if (riskCount <= 3) riskLevel = 'medium';
      else riskLevel = 'high';
      
      return {
        predictedDaysRemaining: prediction.predictedDaysRemaining,
        completionDate: prediction.completionDate.toLocaleDateString(),
        confidence: Math.round(prediction.confidence * 100),
        riskLevel,
        nextMilestone: "Data Analysis" // This would be determined based on actual progress
      };
    } catch (error) {
      console.error('Error getting prediction summary:', error);
      // Return default values in case of error
      return {
        predictedDaysRemaining: 60,
        completionDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        confidence: 50,
        riskLevel: 'medium',
        nextMilestone: "Literature Review"
      };
    }
  }

  /**
   * Get recommendations to improve completion timeline
   */
  async getRecommendations(): Promise<string[]> {
    try {
      const prediction = await this.fetchCurrentPrediction();
      return prediction.recommendations;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }

  /**
   * Calculate if the user is on track for their target completion date
   */
  async isOnTrack(targetDate: Date): Promise<boolean> {
    try {
      const prediction = await this.fetchCurrentPrediction();
      const predictedDate = new Date(prediction.completionDate);
      
      // Check if predicted date is before or equal to target date
      return predictedDate <= targetDate;
    } catch (error) {
      console.error('Error checking if on track:', error);
      return false; // Default to false if there's an error
    }
  }

  /**
   * Get a formatted message about the completion status
   */
  getCompletionMessage(prediction: CompletionPrediction): string {
    const { predictedDaysRemaining, confidence, riskFactors } = prediction;
    
    if (predictedDaysRemaining <= 0) {
      return "Congratulations! Your thesis is predicted to be completed soon.";
    }
    
    // Calculate risk level to customize message
    const riskCount = Object.values(riskFactors).filter(Boolean).length;
    const confidencePercent = Math.round(confidence * 100);
    
    if (riskCount === 0) {
      return `At your current pace, you should complete your thesis in ${predictedDaysRemaining} days. Keep up the good work!`;
    } else if (riskCount <= 2) {
      return `Your thesis should be completed in approximately ${predictedDaysRemaining} days. Consider addressing the recommendations to stay on track.`;
    } else {
      return `Your current trajectory suggests completion in ${predictedDaysRemaining} days, which is beyond your target. Address the recommendations to improve your timeline.`;
    }
  }
}

// Singleton instance of the completion prediction service
export const completionPredictionService = new CompletionPredictionService();