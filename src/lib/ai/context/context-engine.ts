/**
 * Context Engine for Thesis Understanding
 * Phase 5 Week 2: Advanced AI Features
 *
 * Provides contextual awareness for AI operations:
 * - Section-aware suggestions
 * - Document structure understanding
 * - User behavior tracking
 * - Personalized recommendations
 */

export interface ThesisContext {
  documentId: string;
  currentSection: ThesisSection;
  documentStructure: DocumentStructure;
  userProgress: UserProgress;
  recentActivity: ActivityItem[];
  preferences: UserPreferences;
}

export interface ThesisSection {
  id: string;
  type: SectionType;
  title: string;
  content: string;
  wordCount: number;
  completionPercentage: number;
  lastModified: Date;
  parentSection?: string;
  childSections?: string[];
}

export type SectionType =
  | 'title-page'
  | 'abstract'
  | 'introduction'
  | 'literature-review'
  | 'methodology'
  | 'results'
  | 'discussion'
  | 'conclusion'
  | 'references'
  | 'appendix'
  | 'chapter'
  | 'subsection';

export interface DocumentStructure {
  totalSections: number;
  completedSections: number;
  currentChapter: number;
  totalChapters: number;
  estimatedCompletion: number;
  outline: OutlineItem[];
}

export interface OutlineItem {
  id: string;
  title: string;
  type: SectionType;
  level: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'needs-revision';
  children?: OutlineItem[];
}

export interface UserProgress {
  totalWords: number;
  targetWords: number;
  sessionsCompleted: number;
  averageSessionLength: number;
  productiveHours: number[];
  streakDays: number;
  lastActive: Date;
}

export interface ActivityItem {
  type: 'edit' | 'ai-request' | 'export' | 'review' | 'comment';
  section: string;
  timestamp: Date;
  duration?: number;
  metadata?: Record<string, any>;
}

export interface UserPreferences {
  writingStyle: 'formal' | 'academic' | 'conversational';
  citationFormat: 'apa7' | 'mla' | 'chicago' | 'harvard';
  language: string;
  aiAssistanceLevel: 'minimal' | 'moderate' | 'comprehensive';
  focusAreas: string[];
}

export interface ContextualSuggestion {
  id: string;
  type: SuggestionType;
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  actionable: boolean;
  action?: SuggestionAction;
  relevanceScore: number;
  basedOn: string[];
}

export type SuggestionType =
  | 'content'
  | 'structure'
  | 'citation'
  | 'grammar'
  | 'style'
  | 'research'
  | 'methodology'
  | 'next-step';

export interface SuggestionAction {
  type: 'navigate' | 'edit' | 'generate' | 'review' | 'external';
  target: string;
  params?: Record<string, any>;
}

export class ContextEngine {
  private contextCache: Map<string, ThesisContext> = new Map();
  private activityBuffer: ActivityItem[] = [];
  private maxActivityHistory = 100;

  /**
   * Build context for a thesis document
   */
  async buildContext(
    documentId: string,
    currentSectionId: string,
    sections: ThesisSection[],
    userPreferences: UserPreferences
  ): Promise<ThesisContext> {
    const currentSection = sections.find(s => s.id === currentSectionId) || sections[0];
    const documentStructure = this.analyzeStructure(sections);
    const userProgress = this.calculateProgress(sections);
    const recentActivity = this.getRecentActivity(documentId);

    const context: ThesisContext = {
      documentId,
      currentSection,
      documentStructure,
      userProgress,
      recentActivity,
      preferences: userPreferences
    };

    this.contextCache.set(documentId, context);
    return context;
  }

  /**
   * Get contextual suggestions based on current state
   */
  async getSuggestions(context: ThesisContext): Promise<ContextualSuggestion[]> {
    const suggestions: ContextualSuggestion[] = [];

    // Section-specific suggestions
    suggestions.push(...this.getSectionSuggestions(context));

    // Progress-based suggestions
    suggestions.push(...this.getProgressSuggestions(context));

    // Activity-based suggestions
    suggestions.push(...this.getActivitySuggestions(context));

    // Structure suggestions
    suggestions.push(...this.getStructureSuggestions(context));

    // Sort by relevance and priority
    return suggestions
      .sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return b.relevanceScore - a.relevanceScore;
      })
      .slice(0, 10); // Return top 10 suggestions
  }

  /**
   * Get suggestions specific to the current section type
   */
  private getSectionSuggestions(context: ThesisContext): ContextualSuggestion[] {
    const { currentSection, preferences } = context;
    const suggestions: ContextualSuggestion[] = [];

    const sectionGuidance: Record<SectionType, ContextualSuggestion[]> = {
      'title-page': [
        {
          id: 'title-check',
          type: 'content',
          priority: 'medium',
          title: 'Title Optimization',
          description: 'Consider if your title clearly reflects your research focus and methodology',
          actionable: true,
          action: { type: 'generate', target: 'title-suggestions' },
          relevanceScore: 85,
          basedOn: ['section-type']
        }
      ],
      'abstract': [
        {
          id: 'abstract-length',
          type: 'content',
          priority: 'high',
          title: 'Abstract Length Check',
          description: `Your abstract has ${currentSection.wordCount} words. Most institutions require 150-300 words.`,
          actionable: currentSection.wordCount < 150 || currentSection.wordCount > 300,
          relevanceScore: 90,
          basedOn: ['word-count', 'section-type']
        },
        {
          id: 'abstract-structure',
          type: 'structure',
          priority: 'medium',
          title: 'Abstract Structure',
          description: 'Ensure your abstract covers: background, objective, methods, results, and conclusion',
          actionable: true,
          action: { type: 'review', target: 'abstract-checklist' },
          relevanceScore: 85,
          basedOn: ['section-type']
        }
      ],
      'introduction': [
        {
          id: 'intro-hook',
          type: 'content',
          priority: 'medium',
          title: 'Opening Hook',
          description: 'Start with a compelling statement that establishes the significance of your research',
          actionable: true,
          action: { type: 'generate', target: 'intro-hooks' },
          relevanceScore: 80,
          basedOn: ['section-type']
        },
        {
          id: 'research-gap',
          type: 'research',
          priority: 'high',
          title: 'Research Gap Statement',
          description: 'Clearly articulate the gap in existing knowledge that your research addresses',
          actionable: true,
          action: { type: 'navigate', target: '/research-gap' },
          relevanceScore: 90,
          basedOn: ['section-type']
        }
      ],
      'literature-review': [
        {
          id: 'lit-organization',
          type: 'structure',
          priority: 'medium',
          title: 'Literature Organization',
          description: 'Consider organizing your literature thematically or chronologically',
          actionable: true,
          action: { type: 'generate', target: 'lit-outline' },
          relevanceScore: 85,
          basedOn: ['section-type']
        },
        {
          id: 'citation-check',
          type: 'citation',
          priority: 'high',
          title: 'Citation Completeness',
          description: `Ensure all sources are properly cited in ${preferences.citationFormat.toUpperCase()} format`,
          actionable: true,
          action: { type: 'review', target: 'citations' },
          relevanceScore: 90,
          basedOn: ['section-type', 'preferences']
        }
      ],
      'methodology': [
        {
          id: 'method-justification',
          type: 'methodology',
          priority: 'high',
          title: 'Methodology Justification',
          description: 'Explain why your chosen methods are appropriate for your research questions',
          actionable: true,
          action: { type: 'generate', target: 'method-rationale' },
          relevanceScore: 90,
          basedOn: ['section-type']
        },
        {
          id: 'sample-size',
          type: 'methodology',
          priority: 'medium',
          title: 'Sample Size Justification',
          description: 'Include statistical justification for your sample size if applicable',
          actionable: true,
          relevanceScore: 80,
          basedOn: ['section-type']
        }
      ],
      'results': [
        {
          id: 'results-presentation',
          type: 'content',
          priority: 'medium',
          title: 'Results Presentation',
          description: 'Present results objectively without interpretation (save that for Discussion)',
          actionable: false,
          relevanceScore: 85,
          basedOn: ['section-type']
        }
      ],
      'discussion': [
        {
          id: 'lit-connection',
          type: 'content',
          priority: 'high',
          title: 'Connect to Literature',
          description: 'Link your findings back to the literature reviewed earlier',
          actionable: true,
          action: { type: 'generate', target: 'discussion-links' },
          relevanceScore: 90,
          basedOn: ['section-type']
        }
      ],
      'conclusion': [
        {
          id: 'conclusion-summary',
          type: 'content',
          priority: 'medium',
          title: 'Summary of Findings',
          description: 'Briefly summarize key findings without introducing new information',
          actionable: false,
          relevanceScore: 85,
          basedOn: ['section-type']
        },
        {
          id: 'future-research',
          type: 'research',
          priority: 'medium',
          title: 'Future Research Directions',
          description: 'Suggest areas for future research based on your findings',
          actionable: true,
          action: { type: 'generate', target: 'future-research' },
          relevanceScore: 80,
          basedOn: ['section-type']
        }
      ],
      'references': [
        {
          id: 'ref-format',
          type: 'citation',
          priority: 'high',
          title: 'Reference Formatting',
          description: `Verify all references follow ${preferences.citationFormat.toUpperCase()} format`,
          actionable: true,
          action: { type: 'review', target: 'reference-check' },
          relevanceScore: 95,
          basedOn: ['section-type', 'preferences']
        }
      ],
      'appendix': [],
      'chapter': [],
      'subsection': []
    };

    const sectionSuggestions = sectionGuidance[currentSection.type] || [];
    suggestions.push(...sectionSuggestions);

    return suggestions;
  }

  /**
   * Get suggestions based on user progress
   */
  private getProgressSuggestions(context: ThesisContext): ContextualSuggestion[] {
    const { userProgress, documentStructure } = context;
    const suggestions: ContextualSuggestion[] = [];

    // Word count progress
    const wordProgress = (userProgress.totalWords / userProgress.targetWords) * 100;
    if (wordProgress < 25) {
      suggestions.push({
        id: 'word-count-low',
        type: 'next-step',
        priority: 'medium',
        title: 'Build Momentum',
        description: `You're at ${wordProgress.toFixed(0)}% of your target. Focus on getting your ideas down first.`,
        actionable: false,
        relevanceScore: 75,
        basedOn: ['progress']
      });
    } else if (wordProgress > 90) {
      suggestions.push({
        id: 'near-completion',
        type: 'next-step',
        priority: 'high',
        title: 'Final Review Phase',
        description: 'You\'re close to your target! Consider a comprehensive review.',
        actionable: true,
        action: { type: 'navigate', target: '/review' },
        relevanceScore: 90,
        basedOn: ['progress']
      });
    }

    // Streak motivation
    if (userProgress.streakDays >= 7) {
      suggestions.push({
        id: 'streak-celebration',
        type: 'next-step',
        priority: 'low',
        title: `${userProgress.streakDays} Day Streak!`,
        description: 'Great consistency! Keep up the momentum.',
        actionable: false,
        relevanceScore: 60,
        basedOn: ['activity']
      });
    }

    // Completion suggestions
    if (documentStructure.estimatedCompletion < 50) {
      const incompleteSections = documentStructure.outline.filter(
        item => item.status === 'not-started'
      );
      if (incompleteSections.length > 0) {
        suggestions.push({
          id: 'next-section',
          type: 'next-step',
          priority: 'medium',
          title: 'Suggested Next Section',
          description: `Consider starting "${incompleteSections[0].title}" next`,
          actionable: true,
          action: { type: 'navigate', target: incompleteSections[0].id },
          relevanceScore: 80,
          basedOn: ['structure', 'progress']
        });
      }
    }

    return suggestions;
  }

  /**
   * Get suggestions based on recent activity
   */
  private getActivitySuggestions(context: ThesisContext): ContextualSuggestion[] {
    const { recentActivity } = context;
    const suggestions: ContextualSuggestion[] = [];

    if (recentActivity.length === 0) {
      suggestions.push({
        id: 'welcome-back',
        type: 'next-step',
        priority: 'medium',
        title: 'Welcome Back',
        description: 'Pick up where you left off or start a new section',
        actionable: true,
        action: { type: 'navigate', target: 'last-edited' },
        relevanceScore: 85,
        basedOn: ['activity']
      });
      return suggestions;
    }

    // Analyze recent AI usage
    const recentAIRequests = recentActivity.filter(a => a.type === 'ai-request');
    if (recentAIRequests.length > 5) {
      const commonSection = this.getMostCommonValue(recentAIRequests.map(a => a.section));
      suggestions.push({
        id: 'ai-focus-area',
        type: 'content',
        priority: 'low',
        title: 'AI Assistance Pattern',
        description: `You've been using AI help frequently in "${commonSection}". Consider reviewing for consistency.`,
        actionable: true,
        action: { type: 'review', target: commonSection },
        relevanceScore: 70,
        basedOn: ['activity']
      });
    }

    // Check for sections needing attention
    const editedSections = new Set(recentActivity.filter(a => a.type === 'edit').map(a => a.section));
    if (editedSections.size === 1) {
      suggestions.push({
        id: 'diversify-focus',
        type: 'next-step',
        priority: 'low',
        title: 'Consider Other Sections',
        description: 'You\'ve been focused on one section. Consider switching to maintain fresh perspective.',
        actionable: false,
        relevanceScore: 65,
        basedOn: ['activity']
      });
    }

    return suggestions;
  }

  /**
   * Get suggestions based on document structure
   */
  private getStructureSuggestions(context: ThesisContext): ContextualSuggestion[] {
    const { documentStructure } = context;
    const suggestions: ContextualSuggestion[] = [];

    // Check for sections needing revision
    const needsRevision = documentStructure.outline.filter(
      item => item.status === 'needs-revision'
    );
    if (needsRevision.length > 0) {
      suggestions.push({
        id: 'revision-needed',
        type: 'structure',
        priority: 'high',
        title: 'Sections Need Revision',
        description: `${needsRevision.length} section(s) marked for revision`,
        actionable: true,
        action: { type: 'navigate', target: needsRevision[0].id },
        relevanceScore: 90,
        basedOn: ['structure']
      });
    }

    // Check chapter balance
    const chapters = documentStructure.outline.filter(item => item.type === 'chapter');
    if (chapters.length > 0) {
      // This would need word counts per chapter for accurate analysis
      suggestions.push({
        id: 'chapter-balance',
        type: 'structure',
        priority: 'low',
        title: 'Chapter Balance',
        description: 'Review chapter lengths for appropriate balance',
        actionable: true,
        action: { type: 'review', target: 'chapter-analysis' },
        relevanceScore: 60,
        basedOn: ['structure']
      });
    }

    return suggestions;
  }

  /**
   * Record user activity
   */
  recordActivity(activity: ActivityItem): void {
    this.activityBuffer.push(activity);
    if (this.activityBuffer.length > this.maxActivityHistory) {
      this.activityBuffer.shift();
    }
  }

  /**
   * Get recent activity for a document
   */
  private getRecentActivity(documentId: string): ActivityItem[] {
    return this.activityBuffer
      .filter(a => a.metadata?.documentId === documentId)
      .slice(-20);
  }

  /**
   * Analyze document structure
   */
  private analyzeStructure(sections: ThesisSection[]): DocumentStructure {
    const completedSections = sections.filter(s => s.completionPercentage >= 90).length;
    const chapters = sections.filter(s => s.type === 'chapter');

    const outline: OutlineItem[] = sections.map(section => ({
      id: section.id,
      title: section.title,
      type: section.type,
      level: this.getSectionLevel(section.type),
      status: this.getSectionStatus(section.completionPercentage),
      children: section.childSections?.map(childId => {
        const child = sections.find(s => s.id === childId);
        return child ? {
          id: child.id,
          title: child.title,
          type: child.type,
          level: this.getSectionLevel(child.type) + 1,
          status: this.getSectionStatus(child.completionPercentage)
        } : null;
      }).filter(Boolean) as OutlineItem[]
    }));

    return {
      totalSections: sections.length,
      completedSections,
      currentChapter: 1,
      totalChapters: chapters.length || 5,
      estimatedCompletion: Math.round((completedSections / sections.length) * 100),
      outline
    };
  }

  /**
   * Calculate user progress
   */
  private calculateProgress(sections: ThesisSection[]): UserProgress {
    const totalWords = sections.reduce((sum, s) => sum + s.wordCount, 0);

    return {
      totalWords,
      targetWords: 20000, // Default target
      sessionsCompleted: this.activityBuffer.filter(a => a.type === 'edit').length,
      averageSessionLength: 45,
      productiveHours: [9, 10, 11, 14, 15, 16],
      streakDays: 0,
      lastActive: new Date()
    };
  }

  /**
   * Get section level for outline hierarchy
   */
  private getSectionLevel(type: SectionType): number {
    const levels: Record<SectionType, number> = {
      'title-page': 0,
      'abstract': 0,
      'introduction': 1,
      'literature-review': 1,
      'methodology': 1,
      'results': 1,
      'discussion': 1,
      'conclusion': 1,
      'references': 0,
      'appendix': 0,
      'chapter': 1,
      'subsection': 2
    };
    return levels[type] || 1;
  }

  /**
   * Get section status from completion percentage
   */
  private getSectionStatus(completion: number): OutlineItem['status'] {
    if (completion === 0) return 'not-started';
    if (completion < 90) return 'in-progress';
    return 'completed';
  }

  /**
   * Get most common value in array
   */
  private getMostCommonValue<T>(arr: T[]): T {
    const counts = new Map<T, number>();
    arr.forEach(item => counts.set(item, (counts.get(item) || 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
  }

  /**
   * Clear context cache
   */
  clearCache(): void {
    this.contextCache.clear();
  }

  /**
   * Get cached context
   */
  getCachedContext(documentId: string): ThesisContext | undefined {
    return this.contextCache.get(documentId);
  }
}

// Singleton instance
export const contextEngine = new ContextEngine();
