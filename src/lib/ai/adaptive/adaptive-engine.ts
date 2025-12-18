/**
 * Adaptive Learning Engine
 * Phase 5 Sprint 3: Extended Capabilities
 *
 * Provides personalized AI experience:
 * - User profile management
 * - Preference tracking
 * - Suggestion adaptation
 * - Learning path optimization
 * - Performance-based adjustments
 */

export interface AdaptiveUserProfile {
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  demographics: UserDemographics;
  preferences: AdaptivePreferences;
  learningStyle: LearningStyle;
  performance: PerformanceProfile;
  history: InteractionHistory;
  goals: UserGoals;
}

export interface UserDemographics {
  academicLevel: 'undergraduate' | 'graduate' | 'doctoral' | 'postdoctoral';
  fieldOfStudy: string;
  yearsExperience: number;
  primaryLanguage: string;
  institution?: string;
}

export interface AdaptivePreferences {
  feedbackStyle: FeedbackStylePreference;
  communicationTone: 'formal' | 'casual' | 'encouraging' | 'direct';
  detailLevel: 'brief' | 'moderate' | 'comprehensive';
  visualLearning: boolean;
  examplesPreferred: boolean;
  proactiveAssistance: boolean;
  notificationFrequency: 'minimal' | 'regular' | 'frequent';
  preferredTools: string[];
  avoidedFeatures: string[];
}

export interface FeedbackStylePreference {
  criticismLevel: 'gentle' | 'moderate' | 'direct';
  praiseFrequency: 'rare' | 'occasional' | 'frequent';
  suggestionApproach: 'ask-first' | 'suggest-inline' | 'auto-correct';
  explanationDepth: 'quick-tips' | 'detailed' | 'tutorial-style';
}

export interface LearningStyle {
  primary: LearningStyleType;
  secondary?: LearningStyleType;
  pacePreference: 'self-paced' | 'guided' | 'intensive';
  practiceMode: 'examples-first' | 'theory-first' | 'mixed';
  retentionStrategy: 'repetition' | 'application' | 'connection';
}

export type LearningStyleType =
  | 'visual'
  | 'auditory'
  | 'reading-writing'
  | 'kinesthetic';

export interface PerformanceProfile {
  overallScore: number;
  skillScores: SkillScores;
  improvementRate: number;
  consistencyScore: number;
  engagementLevel: number;
  recentTrend: 'improving' | 'stable' | 'declining';
}

export interface SkillScores {
  grammar: number;
  structure: number;
  argumentation: number;
  citations: number;
  clarity: number;
  vocabulary: number;
  criticalThinking: number;
  researchMethodology: number;
}

export interface InteractionHistory {
  totalSessions: number;
  totalTime: number; // minutes
  toolUsage: Record<string, ToolUsageStats>;
  feedbackResponses: FeedbackResponse[];
  completedTasks: CompletedTask[];
  milestones: Milestone[];
}

export interface ToolUsageStats {
  usageCount: number;
  lastUsed: Date;
  averageSessionTime: number;
  satisfactionScore: number;
  completionRate: number;
}

export interface FeedbackResponse {
  feedbackId: string;
  response: 'accepted' | 'rejected' | 'modified' | 'ignored';
  category: string;
  timestamp: Date;
  timeToRespond: number; // seconds
}

export interface CompletedTask {
  taskId: string;
  type: string;
  completedAt: Date;
  duration: number;
  quality: number;
  assistanceUsed: boolean;
}

export interface Milestone {
  id: string;
  name: string;
  achievedAt: Date;
  category: 'writing' | 'research' | 'engagement' | 'skill';
}

export interface UserGoals {
  shortTerm: Goal[];
  longTerm: Goal[];
  dailyTargets: DailyTargets;
  deadlines: Deadline[];
}

export interface Goal {
  id: string;
  description: string;
  targetDate?: Date;
  progress: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'paused';
  metrics: GoalMetric[];
}

export interface GoalMetric {
  name: string;
  current: number;
  target: number;
  unit: string;
}

export interface DailyTargets {
  wordsToWrite: number;
  timeToSpend: number; // minutes
  tasksToComplete: number;
  reviewSections: number;
}

export interface Deadline {
  id: string;
  title: string;
  date: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  associatedGoals: string[];
}

export interface AdaptedContent {
  originalContent: string;
  adaptedContent: string;
  adaptations: Adaptation[];
  confidence: number;
}

export interface Adaptation {
  type: AdaptationType;
  reason: string;
  before?: string;
  after?: string;
}

export type AdaptationType =
  | 'tone-adjustment'
  | 'detail-level'
  | 'example-addition'
  | 'simplification'
  | 'elaboration'
  | 'visual-addition'
  | 'pace-adjustment';

export interface PersonalizedRecommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  priority: number;
  relevanceScore: number;
  basedOn: string[];
  action?: RecommendedAction;
}

export type RecommendationType =
  | 'skill-improvement'
  | 'tool-suggestion'
  | 'resource'
  | 'practice'
  | 'break'
  | 'goal-reminder'
  | 'milestone-celebration';

export interface RecommendedAction {
  type: 'navigate' | 'start-task' | 'review' | 'practice';
  target: string;
  params?: Record<string, any>;
}

export class AdaptiveEngine {
  private profiles: Map<string, AdaptiveUserProfile> = new Map();
  private defaultProfile: Partial<AdaptiveUserProfile>;

  constructor() {
    this.defaultProfile = {
      preferences: {
        feedbackStyle: {
          criticismLevel: 'moderate',
          praiseFrequency: 'occasional',
          suggestionApproach: 'suggest-inline',
          explanationDepth: 'detailed'
        },
        communicationTone: 'encouraging',
        detailLevel: 'moderate',
        visualLearning: true,
        examplesPreferred: true,
        proactiveAssistance: true,
        notificationFrequency: 'regular',
        preferredTools: [],
        avoidedFeatures: []
      },
      learningStyle: {
        primary: 'reading-writing',
        pacePreference: 'self-paced',
        practiceMode: 'mixed',
        retentionStrategy: 'application'
      },
      performance: {
        overallScore: 50,
        skillScores: {
          grammar: 50,
          structure: 50,
          argumentation: 50,
          citations: 50,
          clarity: 50,
          vocabulary: 50,
          criticalThinking: 50,
          researchMethodology: 50
        },
        improvementRate: 0,
        consistencyScore: 50,
        engagementLevel: 50,
        recentTrend: 'stable'
      },
      history: {
        totalSessions: 0,
        totalTime: 0,
        toolUsage: {},
        feedbackResponses: [],
        completedTasks: [],
        milestones: []
      },
      goals: {
        shortTerm: [],
        longTerm: [],
        dailyTargets: {
          wordsToWrite: 500,
          timeToSpend: 60,
          tasksToComplete: 3,
          reviewSections: 1
        },
        deadlines: []
      }
    };
  }

  /**
   * Get or create user profile
   */
  async getProfile(userId: string): Promise<AdaptiveUserProfile> {
    let profile = this.profiles.get(userId);

    if (!profile) {
      profile = this.createDefaultProfile(userId);
      this.profiles.set(userId, profile);
    }

    return profile;
  }

  /**
   * Create default profile for new user
   */
  private createDefaultProfile(userId: string): AdaptiveUserProfile {
    return {
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      demographics: {
        academicLevel: 'graduate',
        fieldOfStudy: 'General',
        yearsExperience: 0,
        primaryLanguage: 'English'
      },
      preferences: this.defaultProfile.preferences!,
      learningStyle: this.defaultProfile.learningStyle!,
      performance: this.defaultProfile.performance!,
      history: this.defaultProfile.history!,
      goals: this.defaultProfile.goals!
    };
  }

  /**
   * Update user profile
   */
  async updateProfile(
    userId: string,
    updates: Partial<AdaptiveUserProfile>
  ): Promise<AdaptiveUserProfile> {
    const profile = await this.getProfile(userId);

    // Deep merge updates
    Object.assign(profile, {
      ...profile,
      ...updates,
      preferences: { ...profile.preferences, ...updates.preferences },
      learningStyle: { ...profile.learningStyle, ...updates.learningStyle },
      performance: { ...profile.performance, ...updates.performance },
      demographics: { ...profile.demographics, ...updates.demographics },
      updatedAt: new Date()
    });

    this.profiles.set(userId, profile);
    return profile;
  }

  /**
   * Record user interaction
   */
  async recordInteraction(
    userId: string,
    interaction: {
      type: 'tool-use' | 'feedback-response' | 'task-completion' | 'session';
      data: Record<string, any>;
    }
  ): Promise<void> {
    const profile = await this.getProfile(userId);

    switch (interaction.type) {
      case 'tool-use':
        this.recordToolUsage(profile, interaction.data);
        break;
      case 'feedback-response':
        this.recordFeedbackResponse(profile, interaction.data);
        break;
      case 'task-completion':
        this.recordTaskCompletion(profile, interaction.data);
        break;
      case 'session':
        this.recordSession(profile, interaction.data);
        break;
    }

    // Update performance metrics
    this.updatePerformanceMetrics(profile);

    profile.updatedAt = new Date();
    this.profiles.set(userId, profile);
  }

  /**
   * Record tool usage
   */
  private recordToolUsage(
    profile: AdaptiveUserProfile,
    data: Record<string, any>
  ): void {
    const toolId = data.toolId as string;
    const duration = data.duration as number || 0;
    const satisfaction = data.satisfaction as number || 3;

    const existing = profile.history.toolUsage[toolId] || {
      usageCount: 0,
      lastUsed: new Date(),
      averageSessionTime: 0,
      satisfactionScore: 3,
      completionRate: 1
    };

    existing.usageCount++;
    existing.lastUsed = new Date();
    existing.averageSessionTime =
      (existing.averageSessionTime * (existing.usageCount - 1) + duration) /
      existing.usageCount;
    existing.satisfactionScore =
      (existing.satisfactionScore * (existing.usageCount - 1) + satisfaction) /
      existing.usageCount;

    profile.history.toolUsage[toolId] = existing;

    // Update preferred tools
    if (existing.usageCount > 5 && existing.satisfactionScore > 3.5) {
      if (!profile.preferences.preferredTools.includes(toolId)) {
        profile.preferences.preferredTools.push(toolId);
      }
    }
  }

  /**
   * Record feedback response
   */
  private recordFeedbackResponse(
    profile: AdaptiveUserProfile,
    data: Record<string, any>
  ): void {
    const response: FeedbackResponse = {
      feedbackId: data.feedbackId as string,
      response: data.response as 'accepted' | 'rejected' | 'modified' | 'ignored',
      category: data.category as string,
      timestamp: new Date(),
      timeToRespond: data.timeToRespond as number || 0
    };

    profile.history.feedbackResponses.push(response);

    // Keep only last 200 responses
    if (profile.history.feedbackResponses.length > 200) {
      profile.history.feedbackResponses.shift();
    }

    // Adapt preferences based on patterns
    this.adaptPreferencesFromFeedback(profile);
  }

  /**
   * Record task completion
   */
  private recordTaskCompletion(
    profile: AdaptiveUserProfile,
    data: Record<string, any>
  ): void {
    const task: CompletedTask = {
      taskId: data.taskId as string,
      type: data.type as string,
      completedAt: new Date(),
      duration: data.duration as number || 0,
      quality: data.quality as number || 0.7,
      assistanceUsed: data.assistanceUsed as boolean || false
    };

    profile.history.completedTasks.push(task);

    // Check for milestones
    this.checkMilestones(profile, task);

    // Update goals progress
    this.updateGoalsProgress(profile, task);
  }

  /**
   * Record session data
   */
  private recordSession(
    profile: AdaptiveUserProfile,
    data: Record<string, any>
  ): void {
    profile.history.totalSessions++;
    profile.history.totalTime += data.duration as number || 0;
  }

  /**
   * Adapt content based on user profile
   */
  async adaptContent(userId: string, content: string): Promise<AdaptedContent> {
    const profile = await this.getProfile(userId);
    const adaptations: Adaptation[] = [];
    let adaptedContent = content;

    // Tone adjustment
    if (profile.preferences.communicationTone === 'encouraging') {
      adaptedContent = this.addEncouragingTone(adaptedContent);
      adaptations.push({
        type: 'tone-adjustment',
        reason: 'User prefers encouraging communication'
      });
    }

    // Detail level adjustment
    if (profile.preferences.detailLevel === 'brief') {
      adaptedContent = this.condenseContent(adaptedContent);
      adaptations.push({
        type: 'detail-level',
        reason: 'User prefers brief explanations'
      });
    } else if (profile.preferences.detailLevel === 'comprehensive') {
      adaptedContent = this.elaborateContent(adaptedContent, profile);
      adaptations.push({
        type: 'elaboration',
        reason: 'User prefers comprehensive explanations'
      });
    }

    // Add examples if preferred
    if (profile.preferences.examplesPreferred &&
        !content.includes('example') &&
        !content.includes('for instance')) {
      adaptedContent = this.addExamples(adaptedContent, profile);
      adaptations.push({
        type: 'example-addition',
        reason: 'User learns better with examples'
      });
    }

    // Simplify for lower skill levels
    if (profile.performance.overallScore < 40) {
      adaptedContent = this.simplifyContent(adaptedContent);
      adaptations.push({
        type: 'simplification',
        reason: 'Adjusted for current skill level'
      });
    }

    return {
      originalContent: content,
      adaptedContent,
      adaptations,
      confidence: 0.85
    };
  }

  /**
   * Get personalized recommendations
   */
  async getRecommendations(userId: string): Promise<PersonalizedRecommendation[]> {
    const profile = await this.getProfile(userId);
    const recommendations: PersonalizedRecommendation[] = [];

    // Skill improvement recommendations
    const weakestSkill = this.findWeakestSkill(profile);
    if (weakestSkill) {
      recommendations.push({
        id: `rec_skill_${Date.now()}`,
        type: 'skill-improvement',
        title: `Improve your ${weakestSkill.skill}`,
        description: `Your ${weakestSkill.skill} score is ${weakestSkill.score}. Practice can help improve this.`,
        priority: 1,
        relevanceScore: 0.9,
        basedOn: ['performance-data'],
        action: {
          type: 'practice',
          target: weakestSkill.skill
        }
      });
    }

    // Tool suggestions based on usage patterns
    const suggestedTool = this.suggestTool(profile);
    if (suggestedTool) {
      recommendations.push({
        id: `rec_tool_${Date.now()}`,
        type: 'tool-suggestion',
        title: `Try ${suggestedTool.name}`,
        description: suggestedTool.reason,
        priority: 2,
        relevanceScore: 0.8,
        basedOn: ['usage-patterns'],
        action: {
          type: 'navigate',
          target: `/tools/${suggestedTool.id}`
        }
      });
    }

    // Goal reminders
    const upcomingDeadlines = profile.goals.deadlines
      .filter(d => {
        const daysUntil = (d.date.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        return daysUntil > 0 && daysUntil <= 7;
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    if (upcomingDeadlines.length > 0) {
      const deadline = upcomingDeadlines[0];
      const daysUntil = Math.ceil(
        (deadline.date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      recommendations.push({
        id: `rec_deadline_${Date.now()}`,
        type: 'goal-reminder',
        title: `Upcoming deadline: ${deadline.title}`,
        description: `${daysUntil} day(s) remaining`,
        priority: deadline.priority === 'critical' ? 0 : 1,
        relevanceScore: 0.95,
        basedOn: ['deadlines']
      });
    }

    // Break recommendation based on session time
    if (profile.history.totalTime > 90) {
      const lastBreak = this.getLastBreakTime(profile);
      if (!lastBreak || Date.now() - lastBreak.getTime() > 60 * 60 * 1000) {
        recommendations.push({
          id: `rec_break_${Date.now()}`,
          type: 'break',
          title: 'Time for a break',
          description: 'Taking regular breaks improves focus and productivity.',
          priority: 2,
          relevanceScore: 0.7,
          basedOn: ['session-duration']
        });
      }
    }

    // Milestone celebration
    const recentMilestone = profile.history.milestones
      .filter(m => Date.now() - m.achievedAt.getTime() < 24 * 60 * 60 * 1000)
      .pop();

    if (recentMilestone) {
      recommendations.push({
        id: `rec_milestone_${Date.now()}`,
        type: 'milestone-celebration',
        title: `Congratulations: ${recentMilestone.name}`,
        description: 'Great progress! Keep up the excellent work.',
        priority: 3,
        relevanceScore: 0.6,
        basedOn: ['milestones']
      });
    }

    return recommendations.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Adapt preferences based on feedback patterns
   */
  private adaptPreferencesFromFeedback(profile: AdaptiveUserProfile): void {
    const recent = profile.history.feedbackResponses.slice(-50);
    if (recent.length < 10) return;

    // Calculate acceptance rate
    const accepted = recent.filter(r => r.response === 'accepted').length;
    const rejected = recent.filter(r => r.response === 'rejected').length;
    const acceptanceRate = accepted / recent.length;

    // Adjust proactive assistance based on acceptance
    if (acceptanceRate < 0.3) {
      profile.preferences.proactiveAssistance = false;
    } else if (acceptanceRate > 0.7) {
      profile.preferences.proactiveAssistance = true;
    }

    // Adjust suggestion approach
    if (rejected > accepted * 2) {
      profile.preferences.feedbackStyle.suggestionApproach = 'ask-first';
    } else if (accepted > rejected * 2) {
      profile.preferences.feedbackStyle.suggestionApproach = 'suggest-inline';
    }

    // Check response time patterns
    const avgResponseTime = recent.reduce((sum, r) => sum + r.timeToRespond, 0) / recent.length;
    if (avgResponseTime < 5) {
      // User responds quickly - they may want more suggestions
      profile.preferences.feedbackStyle.explanationDepth = 'quick-tips';
    } else if (avgResponseTime > 30) {
      // User takes time to consider - provide more detail
      profile.preferences.feedbackStyle.explanationDepth = 'detailed';
    }
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(profile: AdaptiveUserProfile): void {
    const recentTasks = profile.history.completedTasks.slice(-20);
    if (recentTasks.length < 5) return;

    // Calculate average quality
    const avgQuality = recentTasks.reduce((sum, t) => sum + t.quality, 0) / recentTasks.length;
    const oldScore = profile.performance.overallScore;
    profile.performance.overallScore = Math.round(oldScore * 0.7 + avgQuality * 100 * 0.3);

    // Calculate improvement rate
    const olderTasks = profile.history.completedTasks.slice(-40, -20);
    if (olderTasks.length > 0) {
      const olderAvg = olderTasks.reduce((sum, t) => sum + t.quality, 0) / olderTasks.length;
      profile.performance.improvementRate = (avgQuality - olderAvg) * 100;

      if (profile.performance.improvementRate > 5) {
        profile.performance.recentTrend = 'improving';
      } else if (profile.performance.improvementRate < -5) {
        profile.performance.recentTrend = 'declining';
      } else {
        profile.performance.recentTrend = 'stable';
      }
    }

    // Calculate engagement level
    const sessionsThisWeek = profile.history.completedTasks.filter(t => {
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      return t.completedAt.getTime() > weekAgo;
    }).length;
    profile.performance.engagementLevel = Math.min(100, sessionsThisWeek * 15);
  }

  /**
   * Check for milestone achievements
   */
  private checkMilestones(profile: AdaptiveUserProfile, task: CompletedTask): void {
    const milestones = [
      { count: 10, name: 'Getting Started', category: 'engagement' },
      { count: 50, name: 'Consistent Writer', category: 'engagement' },
      { count: 100, name: 'Dedicated Scholar', category: 'engagement' },
      { count: 500, name: 'Writing Master', category: 'writing' }
    ];

    const taskCount = profile.history.completedTasks.length;

    milestones.forEach(milestone => {
      if (taskCount === milestone.count) {
        const existingMilestone = profile.history.milestones.find(
          m => m.name === milestone.name
        );
        if (!existingMilestone) {
          profile.history.milestones.push({
            id: `milestone_${Date.now()}`,
            name: milestone.name,
            achievedAt: new Date(),
            category: milestone.category as 'writing' | 'engagement'
          });
        }
      }
    });
  }

  /**
   * Update goals progress
   */
  private updateGoalsProgress(profile: AdaptiveUserProfile, task: CompletedTask): void {
    // Update relevant goals
    profile.goals.shortTerm.forEach(goal => {
      if (goal.status === 'in-progress') {
        goal.metrics.forEach(metric => {
          if (task.type.includes(metric.name.toLowerCase())) {
            metric.current++;
            goal.progress = Math.min(100, (metric.current / metric.target) * 100);
          }
        });

        if (goal.progress >= 100) {
          goal.status = 'completed';
        }
      }
    });
  }

  /**
   * Add encouraging tone to content
   */
  private addEncouragingTone(content: string): string {
    const encouragingPhrases = [
      "Great question! ",
      "You're on the right track. ",
      "This is a common area to work on. ",
      "Here's something that can help: "
    ];

    const phrase = encouragingPhrases[Math.floor(Math.random() * encouragingPhrases.length)];
    return phrase + content;
  }

  /**
   * Condense content for brief preference
   */
  private condenseContent(content: string): string {
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [content];
    if (sentences.length <= 2) return content;

    // Keep first and last sentence, summarize middle
    return sentences.slice(0, 2).join(' ');
  }

  /**
   * Elaborate content with more detail
   */
  private elaborateContent(content: string, profile: AdaptiveUserProfile): string {
    // Add context based on user's field
    const fieldContext = `In the context of ${profile.demographics.fieldOfStudy}, `;
    return fieldContext + content.charAt(0).toLowerCase() + content.slice(1);
  }

  /**
   * Add examples to content
   */
  private addExamples(content: string, profile: AdaptiveUserProfile): string {
    return content + '\n\nFor example, you might consider...';
  }

  /**
   * Simplify content for lower skill levels
   */
  private simplifyContent(content: string): string {
    // Replace complex words with simpler alternatives
    const simplifications: Record<string, string> = {
      'utilize': 'use',
      'implement': 'do',
      'methodology': 'method',
      'subsequently': 'then',
      'facilitate': 'help'
    };

    let simplified = content;
    Object.entries(simplifications).forEach(([complex, simple]) => {
      simplified = simplified.replace(new RegExp(complex, 'gi'), simple);
    });

    return simplified;
  }

  /**
   * Find weakest skill
   */
  private findWeakestSkill(
    profile: AdaptiveUserProfile
  ): { skill: string; score: number } | null {
    const skills = profile.performance.skillScores;
    let weakest = { skill: '', score: 100 };

    Object.entries(skills).forEach(([skill, score]) => {
      if (score < weakest.score) {
        weakest = { skill, score };
      }
    });

    return weakest.score < 60 ? weakest : null;
  }

  /**
   * Suggest a tool based on patterns
   */
  private suggestTool(
    profile: AdaptiveUserProfile
  ): { id: string; name: string; reason: string } | null {
    const tools = [
      { id: 'grammar-check', name: 'Grammar Checker', forSkill: 'grammar' },
      { id: 'paraphraser', name: 'Paraphraser', forSkill: 'clarity' },
      { id: 'citation-helper', name: 'Citation Helper', forSkill: 'citations' },
      { id: 'structure-analyzer', name: 'Structure Analyzer', forSkill: 'structure' }
    ];

    // Find tool for weakest skill that user hasn't used much
    const weakSkill = this.findWeakestSkill(profile);
    if (!weakSkill) return null;

    const suggestedTool = tools.find(t => t.forSkill === weakSkill.skill);
    if (!suggestedTool) return null;

    const usage = profile.history.toolUsage[suggestedTool.id];
    if (usage && usage.usageCount > 10) return null;

    return {
      ...suggestedTool,
      reason: `This tool can help improve your ${weakSkill.skill} skills.`
    };
  }

  /**
   * Get last break time (placeholder)
   */
  private getLastBreakTime(profile: AdaptiveUserProfile): Date | null {
    // In a real implementation, this would track break times
    return null;
  }

  /**
   * Export profile for persistence
   */
  exportProfile(userId: string): AdaptiveUserProfile | undefined {
    return this.profiles.get(userId);
  }

  /**
   * Import profile from persistence
   */
  importProfile(profile: AdaptiveUserProfile): void {
    this.profiles.set(profile.userId, profile);
  }

  /**
   * Clear user profile
   */
  clearProfile(userId: string): void {
    this.profiles.delete(userId);
  }
}

// Singleton instance
export const adaptiveEngine = new AdaptiveEngine();
