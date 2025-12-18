/**
 * Learning Adapter for Personalized AI Assistance
 * Phase 5 Week 2: Advanced AI Features
 *
 * Adapts AI behavior based on user learning patterns:
 * - Writing style preferences
 * - Common mistakes and corrections
 * - Preferred feedback styles
 * - Learning pace adaptation
 */

export interface UserLearningPattern {
  userId: string;
  writingPatterns: WritingPatterns;
  feedbackHistory: FeedbackHistoryItem[];
  interactionStyles: InteractionStyles;
  skillLevels: SkillLevels;
  preferences: LearningPreferences;
  updatedAt: Date;
}

export interface WritingPatterns {
  averageSentenceLength: number;
  vocabularyLevel: 'basic' | 'intermediate' | 'advanced' | 'academic';
  commonStructures: string[];
  frequentWords: WordFrequency[];
  commonErrors: ErrorPattern[];
  writingSpeed: number; // words per minute
  sessionDuration: number; // average session in minutes
  preferredSections: string[];
}

export interface WordFrequency {
  word: string;
  count: number;
  context: 'formal' | 'informal' | 'technical' | 'common';
}

export interface ErrorPattern {
  type: ErrorType;
  pattern: string;
  frequency: number;
  corrected: boolean;
  examples: string[];
}

export type ErrorType =
  | 'spelling'
  | 'grammar'
  | 'punctuation'
  | 'structure'
  | 'citation'
  | 'consistency'
  | 'clarity'
  | 'formality';

export interface FeedbackHistoryItem {
  id: string;
  type: 'accepted' | 'rejected' | 'modified' | 'ignored';
  category: string;
  originalSuggestion: string;
  userAction: string;
  timestamp: Date;
  contextSection: string;
}

export interface InteractionStyles {
  preferredFeedbackTone: 'direct' | 'encouraging' | 'detailed' | 'concise';
  explanationDepth: 'brief' | 'moderate' | 'comprehensive';
  examplePreference: 'show-examples' | 'rules-only' | 'mixed';
  correctionStyle: 'immediate' | 'batch' | 'on-request';
  aiInteractionFrequency: 'minimal' | 'moderate' | 'frequent';
}

export interface SkillLevels {
  overall: number; // 0-100
  grammar: number;
  structure: number;
  argumentation: number;
  citations: number;
  clarity: number;
  academicTone: number;
  researchMethodology: number;
}

export interface LearningPreferences {
  pacePreference: 'steady' | 'intensive' | 'flexible';
  goalOrientation: 'deadline-driven' | 'quality-focused' | 'balanced';
  supportLevel: 'independent' | 'guided' | 'collaborative';
  notificationFrequency: 'minimal' | 'regular' | 'frequent';
  preferredLearningTime: string[]; // hours of day
}

export interface AdaptedResponse {
  content: string;
  tone: string;
  complexity: number;
  includesExamples: boolean;
  explanationLevel: string;
  customizations: ResponseCustomization[];
}

export interface ResponseCustomization {
  type: 'simplify' | 'elaborate' | 'add-example' | 'change-tone' | 'add-context';
  applied: boolean;
  reason: string;
}

export class LearningAdapter {
  private userPatterns: Map<string, UserLearningPattern> = new Map();
  private defaultPattern: Partial<UserLearningPattern> = {
    writingPatterns: {
      averageSentenceLength: 20,
      vocabularyLevel: 'intermediate',
      commonStructures: [],
      frequentWords: [],
      commonErrors: [],
      writingSpeed: 30,
      sessionDuration: 45,
      preferredSections: []
    },
    interactionStyles: {
      preferredFeedbackTone: 'encouraging',
      explanationDepth: 'moderate',
      examplePreference: 'mixed',
      correctionStyle: 'immediate',
      aiInteractionFrequency: 'moderate'
    },
    skillLevels: {
      overall: 50,
      grammar: 50,
      structure: 50,
      argumentation: 50,
      citations: 50,
      clarity: 50,
      academicTone: 50,
      researchMethodology: 50
    },
    preferences: {
      pacePreference: 'flexible',
      goalOrientation: 'balanced',
      supportLevel: 'guided',
      notificationFrequency: 'regular',
      preferredLearningTime: ['09:00', '14:00', '20:00']
    }
  };

  /**
   * Get or initialize user learning pattern
   */
  async getUserPattern(userId: string): Promise<UserLearningPattern> {
    if (this.userPatterns.has(userId)) {
      return this.userPatterns.get(userId)!;
    }

    // Initialize new pattern for user
    const pattern: UserLearningPattern = {
      userId,
      writingPatterns: this.defaultPattern.writingPatterns!,
      feedbackHistory: [],
      interactionStyles: this.defaultPattern.interactionStyles!,
      skillLevels: this.defaultPattern.skillLevels!,
      preferences: this.defaultPattern.preferences!,
      updatedAt: new Date()
    };

    this.userPatterns.set(userId, pattern);
    return pattern;
  }

  /**
   * Update user pattern based on new writing sample
   */
  async updateFromWritingSample(
    userId: string,
    content: string,
    sectionType: string
  ): Promise<void> {
    const pattern = await this.getUserPattern(userId);

    // Analyze writing patterns
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
    const words = content.split(/\s+/).filter(w => w.length > 0);

    // Update average sentence length
    if (sentences.length > 0) {
      const avgLength = words.length / sentences.length;
      pattern.writingPatterns.averageSentenceLength =
        (pattern.writingPatterns.averageSentenceLength + avgLength) / 2;
    }

    // Update vocabulary level based on word complexity
    const complexWords = words.filter(w => w.length > 8).length;
    const complexityRatio = complexWords / words.length;
    if (complexityRatio > 0.15) {
      pattern.writingPatterns.vocabularyLevel = 'academic';
    } else if (complexityRatio > 0.1) {
      pattern.writingPatterns.vocabularyLevel = 'advanced';
    } else if (complexityRatio > 0.05) {
      pattern.writingPatterns.vocabularyLevel = 'intermediate';
    }

    // Track word frequency
    this.updateWordFrequency(pattern, words);

    // Track preferred sections
    if (!pattern.writingPatterns.preferredSections.includes(sectionType)) {
      pattern.writingPatterns.preferredSections.push(sectionType);
    }

    // Analyze common errors
    this.analyzeErrors(pattern, content);

    pattern.updatedAt = new Date();
    this.userPatterns.set(userId, pattern);
  }

  /**
   * Update word frequency tracking
   */
  private updateWordFrequency(pattern: UserLearningPattern, words: string[]): void {
    const wordMap = new Map<string, number>();

    words.forEach(word => {
      const normalized = word.toLowerCase().replace(/[^a-z]/g, '');
      if (normalized.length > 3) {
        wordMap.set(normalized, (wordMap.get(normalized) || 0) + 1);
      }
    });

    // Update existing frequency tracking
    wordMap.forEach((count, word) => {
      const existing = pattern.writingPatterns.frequentWords.find(w => w.word === word);
      if (existing) {
        existing.count += count;
      } else if (count > 2) {
        pattern.writingPatterns.frequentWords.push({
          word,
          count,
          context: this.classifyWord(word)
        });
      }
    });

    // Keep top 100 words
    pattern.writingPatterns.frequentWords.sort((a, b) => b.count - a.count);
    pattern.writingPatterns.frequentWords = pattern.writingPatterns.frequentWords.slice(0, 100);
  }

  /**
   * Classify word context
   */
  private classifyWord(word: string): WordFrequency['context'] {
    const technicalWords = [
      'methodology', 'hypothesis', 'correlation', 'analysis',
      'framework', 'paradigm', 'empirical', 'quantitative',
      'qualitative', 'longitudinal', 'theoretical', 'construct'
    ];

    const formalWords = [
      'therefore', 'however', 'furthermore', 'consequently',
      'nevertheless', 'moreover', 'thus', 'hence', 'whereby'
    ];

    if (technicalWords.includes(word)) return 'technical';
    if (formalWords.includes(word)) return 'formal';
    return 'common';
  }

  /**
   * Analyze common errors in writing
   */
  private analyzeErrors(pattern: UserLearningPattern, content: string): void {
    const errorPatterns: { type: ErrorType; regex: RegExp; message: string }[] = [
      { type: 'grammar', regex: /\b(their|there|they're)\b/gi, message: 'their/there/they\'re confusion' },
      { type: 'grammar', regex: /\b(your|you're)\b/gi, message: 'your/you\'re confusion' },
      { type: 'grammar', regex: /\b(its|it's)\b/gi, message: 'its/it\'s confusion' },
      { type: 'formality', regex: /\b(gonna|wanna|kinda|sorta)\b/gi, message: 'informal contractions' },
      { type: 'punctuation', regex: /[,;]\s*[,;]/g, message: 'double punctuation' },
      { type: 'clarity', regex: /\b(very|really|basically|actually)\b/gi, message: 'vague intensifiers' },
      { type: 'structure', regex: /^(And|But|So)\s/gm, message: 'sentence starting with conjunction' },
      { type: 'citation', regex: /\b(studies show|research indicates|experts say)\b/gi, message: 'uncited claims' }
    ];

    errorPatterns.forEach(({ type, regex, message }) => {
      const matches = content.match(regex) || [];
      if (matches.length > 0) {
        const existing = pattern.writingPatterns.commonErrors.find(
          e => e.type === type && e.pattern === message
        );
        if (existing) {
          existing.frequency += matches.length;
          existing.examples = [...new Set([...existing.examples, ...matches])].slice(0, 5);
        } else {
          pattern.writingPatterns.commonErrors.push({
            type,
            pattern: message,
            frequency: matches.length,
            corrected: false,
            examples: matches.slice(0, 5)
          });
        }
      }
    });
  }

  /**
   * Record feedback response
   */
  async recordFeedbackResponse(
    userId: string,
    feedbackItem: Omit<FeedbackHistoryItem, 'id' | 'timestamp'>
  ): Promise<void> {
    const pattern = await this.getUserPattern(userId);

    pattern.feedbackHistory.push({
      ...feedbackItem,
      id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date()
    });

    // Keep last 200 feedback items
    if (pattern.feedbackHistory.length > 200) {
      pattern.feedbackHistory = pattern.feedbackHistory.slice(-200);
    }

    // Update interaction styles based on feedback patterns
    this.updateInteractionStyles(pattern);

    pattern.updatedAt = new Date();
    this.userPatterns.set(userId, pattern);
  }

  /**
   * Update interaction styles based on feedback history
   */
  private updateInteractionStyles(pattern: UserLearningPattern): void {
    const recentFeedback = pattern.feedbackHistory.slice(-50);

    if (recentFeedback.length < 10) return;

    // Analyze acceptance rate by category
    const acceptanceByCategory: Record<string, { accepted: number; total: number }> = {};

    recentFeedback.forEach(fb => {
      if (!acceptanceByCategory[fb.category]) {
        acceptanceByCategory[fb.category] = { accepted: 0, total: 0 };
      }
      acceptanceByCategory[fb.category].total++;
      if (fb.type === 'accepted') {
        acceptanceByCategory[fb.category].accepted++;
      }
    });

    // Adjust interaction styles based on patterns
    const overallAcceptance = recentFeedback.filter(fb => fb.type === 'accepted').length / recentFeedback.length;

    if (overallAcceptance > 0.8) {
      // User accepts most suggestions - they may want more
      pattern.interactionStyles.aiInteractionFrequency = 'frequent';
    } else if (overallAcceptance < 0.3) {
      // User rejects most suggestions - reduce frequency
      pattern.interactionStyles.aiInteractionFrequency = 'minimal';
    }

    // Check if user modifies suggestions often
    const modificationRate = recentFeedback.filter(fb => fb.type === 'modified').length / recentFeedback.length;
    if (modificationRate > 0.4) {
      // User often modifies - provide more options
      pattern.interactionStyles.explanationDepth = 'comprehensive';
      pattern.interactionStyles.examplePreference = 'show-examples';
    }
  }

  /**
   * Update skill levels based on performance
   */
  async updateSkillLevels(
    userId: string,
    category: keyof SkillLevels,
    score: number
  ): Promise<void> {
    const pattern = await this.getUserPattern(userId);

    // Use exponential moving average for smooth updates
    const alpha = 0.3;
    const currentScore = pattern.skillLevels[category];
    pattern.skillLevels[category] = Math.round(currentScore * (1 - alpha) + score * alpha);

    // Update overall score
    const skills = Object.entries(pattern.skillLevels)
      .filter(([key]) => key !== 'overall')
      .map(([_, value]) => value);

    pattern.skillLevels.overall = Math.round(
      skills.reduce((sum, s) => sum + s, 0) / skills.length
    );

    pattern.updatedAt = new Date();
    this.userPatterns.set(userId, pattern);
  }

  /**
   * Adapt AI response based on user patterns
   */
  async adaptResponse(
    userId: string,
    baseResponse: string,
    context: { type: string; section: string }
  ): Promise<AdaptedResponse> {
    const pattern = await this.getUserPattern(userId);
    const customizations: ResponseCustomization[] = [];

    let adaptedContent = baseResponse;
    const { interactionStyles, skillLevels, writingPatterns } = pattern;

    // Adapt complexity based on vocabulary level
    if (writingPatterns.vocabularyLevel === 'basic' || skillLevels.overall < 40) {
      adaptedContent = this.simplifyLanguage(adaptedContent);
      customizations.push({
        type: 'simplify',
        applied: true,
        reason: 'User vocabulary level or skill suggests simpler explanations'
      });
    }

    // Add examples if user prefers them
    if (interactionStyles.examplePreference === 'show-examples') {
      const exampleAdded = this.maybeAddExample(adaptedContent, context.type);
      if (exampleAdded !== adaptedContent) {
        adaptedContent = exampleAdded;
        customizations.push({
          type: 'add-example',
          applied: true,
          reason: 'User prefers explanations with examples'
        });
      }
    }

    // Adjust explanation depth
    if (interactionStyles.explanationDepth === 'brief') {
      adaptedContent = this.condenseFeedback(adaptedContent);
      customizations.push({
        type: 'simplify',
        applied: true,
        reason: 'User prefers brief explanations'
      });
    } else if (interactionStyles.explanationDepth === 'comprehensive') {
      adaptedContent = this.elaborateFeedback(adaptedContent, context);
      customizations.push({
        type: 'elaborate',
        applied: true,
        reason: 'User prefers comprehensive explanations'
      });
    }

    // Adjust tone
    const tone = this.getToneForUser(interactionStyles.preferredFeedbackTone);

    return {
      content: adaptedContent,
      tone,
      complexity: this.calculateComplexity(adaptedContent),
      includesExamples: customizations.some(c => c.type === 'add-example' && c.applied),
      explanationLevel: interactionStyles.explanationDepth,
      customizations
    };
  }

  /**
   * Simplify language in response
   */
  private simplifyLanguage(content: string): string {
    const simplifications: Record<string, string> = {
      'utilize': 'use',
      'implement': 'do',
      'subsequently': 'then',
      'consequently': 'so',
      'demonstrate': 'show',
      'facilitate': 'help',
      'endeavor': 'try',
      'commence': 'start',
      'terminate': 'end',
      'ascertain': 'find out'
    };

    let simplified = content;
    Object.entries(simplifications).forEach(([complex, simple]) => {
      simplified = simplified.replace(new RegExp(`\\b${complex}\\b`, 'gi'), simple);
    });

    return simplified;
  }

  /**
   * Maybe add example to response
   */
  private maybeAddExample(content: string, type: string): string {
    // Only add examples for certain types of feedback
    const exampleTypes = ['grammar', 'structure', 'citation', 'clarity'];

    if (!exampleTypes.includes(type)) {
      return content;
    }

    // Check if content already has an example
    if (content.includes('For example') || content.includes('e.g.')) {
      return content;
    }

    // Add a generic prompt for examples
    return `${content}\n\nWould you like to see an example of how to apply this suggestion?`;
  }

  /**
   * Condense feedback to be more brief
   */
  private condenseFeedback(content: string): string {
    // Remove filler phrases
    const fillers = [
      'It is important to note that ',
      'Please be aware that ',
      'You may want to consider ',
      'It would be beneficial to ',
      'One approach might be to '
    ];

    let condensed = content;
    fillers.forEach(filler => {
      condensed = condensed.replace(new RegExp(filler, 'gi'), '');
    });

    // Truncate very long content
    const sentences = condensed.match(/[^.!?]+[.!?]+/g) || [];
    if (sentences.length > 3) {
      condensed = sentences.slice(0, 3).join(' ');
    }

    return condensed;
  }

  /**
   * Elaborate feedback with more detail
   */
  private elaborateFeedback(
    content: string,
    context: { type: string; section: string }
  ): string {
    // Add context-specific elaboration
    const elaborations: Record<string, string> = {
      grammar: '\n\nRemember: Consistent grammar strengthens your academic credibility and makes your argument clearer.',
      structure: '\n\nGood structure helps readers follow your logic. Each paragraph should have a clear purpose.',
      citation: '\n\nProper citations not only give credit but also strengthen your argument by showing scholarly support.',
      clarity: '\n\nClear writing demonstrates clear thinking. Aim for precision in every sentence.'
    };

    const elaboration = elaborations[context.type] || '';
    return content + elaboration;
  }

  /**
   * Get appropriate tone description
   */
  private getToneForUser(preference: InteractionStyles['preferredFeedbackTone']): string {
    const tones: Record<string, string> = {
      direct: 'straightforward and action-oriented',
      encouraging: 'supportive and positive',
      detailed: 'thorough and explanatory',
      concise: 'brief and to-the-point'
    };
    return tones[preference] || 'neutral';
  }

  /**
   * Calculate content complexity score
   */
  private calculateComplexity(content: string): number {
    const words = content.split(/\s+/);
    const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
    const sentenceCount = (content.match(/[.!?]+/g) || []).length;
    const avgSentenceLength = words.length / Math.max(sentenceCount, 1);

    // Flesch-Kincaid approximation
    const complexity = (avgWordLength - 4) * 10 + (avgSentenceLength - 15) * 2;
    return Math.max(0, Math.min(100, Math.round(50 + complexity)));
  }

  /**
   * Get personalized recommendations based on patterns
   */
  async getPersonalizedRecommendations(userId: string): Promise<string[]> {
    const pattern = await this.getUserPattern(userId);
    const recommendations: string[] = [];

    // Based on common errors
    const topErrors = pattern.writingPatterns.commonErrors
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 3);

    topErrors.forEach(error => {
      recommendations.push(
        `Focus on ${error.type}: You frequently have issues with ${error.pattern}`
      );
    });

    // Based on skill levels
    const weakestSkill = Object.entries(pattern.skillLevels)
      .filter(([key]) => key !== 'overall')
      .sort(([, a], [, b]) => a - b)[0];

    if (weakestSkill && weakestSkill[1] < 50) {
      recommendations.push(
        `Consider practicing ${weakestSkill[0]} - it's currently your lowest-scoring area`
      );
    }

    // Based on writing patterns
    if (pattern.writingPatterns.averageSentenceLength > 30) {
      recommendations.push(
        'Try breaking up your longer sentences for improved readability'
      );
    }

    // Based on feedback history
    const recentRejections = pattern.feedbackHistory
      .filter(fb => fb.type === 'rejected')
      .slice(-10);

    if (recentRejections.length > 5) {
      recommendations.push(
        'Consider reviewing AI suggestions more carefully - many have been rejected recently'
      );
    }

    return recommendations.slice(0, 5);
  }

  /**
   * Export user pattern for persistence
   */
  exportPattern(userId: string): UserLearningPattern | undefined {
    return this.userPatterns.get(userId);
  }

  /**
   * Import user pattern from persistence
   */
  importPattern(pattern: UserLearningPattern): void {
    this.userPatterns.set(pattern.userId, pattern);
  }

  /**
   * Clear user pattern
   */
  clearPattern(userId: string): void {
    this.userPatterns.delete(userId);
  }
}

// Singleton instance
export const learningAdapter = new LearningAdapter();
