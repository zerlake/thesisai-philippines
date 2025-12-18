/**
 * Feedback Aggregation System
 * Phase 5 Week 2: Advanced AI Features
 *
 * Consolidates feedback from multiple AI tools:
 * - Grammar checker results
 * - Paraphraser suggestions
 * - Thesis feedback engine
 * - Citation checker
 * - Semantic analyzer
 */

import { ThesisFeedbackEngine, ThesisFeedback, FeedbackSuggestion } from './thesis-feedback-engine';

export interface FeedbackSource {
  id: string;
  name: string;
  type: FeedbackSourceType;
  weight: number; // 0-1, importance of this source
  enabled: boolean;
}

export type FeedbackSourceType =
  | 'grammar'
  | 'style'
  | 'structure'
  | 'citation'
  | 'content'
  | 'semantic'
  | 'thesis-feedback';

export interface AggregatedFeedback {
  id: string;
  documentId: string;
  timestamp: Date;
  overallScore: number;
  sources: FeedbackSourceResult[];
  prioritizedIssues: PrioritizedIssue[];
  categories: CategorySummary[];
  actionItems: ActionItem[];
  progress: FeedbackProgress;
}

export interface FeedbackSourceResult {
  sourceId: string;
  sourceName: string;
  type: FeedbackSourceType;
  score: number;
  issueCount: number;
  issues: FeedbackIssue[];
  processedAt: Date;
}

export interface FeedbackIssue {
  id: string;
  source: string;
  type: string;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location?: IssueLocation;
  suggestion?: string;
  autoFixable: boolean;
  autoFix?: () => string;
}

export interface IssueLocation {
  startLine?: number;
  endLine?: number;
  startOffset?: number;
  endOffset?: number;
  section?: string;
  paragraph?: number;
}

export interface PrioritizedIssue extends FeedbackIssue {
  priority: number; // 1-10, higher = more urgent
  aggregatedFrom: string[];
  confidence: number;
}

export interface CategorySummary {
  category: string;
  score: number;
  issueCount: number;
  trend: 'improving' | 'stable' | 'declining';
  topIssues: string[];
}

export interface ActionItem {
  id: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  estimatedTime: string;
  category: string;
  relatedIssues: string[];
}

export interface FeedbackProgress {
  totalIssues: number;
  resolvedIssues: number;
  pendingIssues: number;
  improvementRate: number; // 0-100
  comparisonToPrevious: {
    scoreChange: number;
    issueCountChange: number;
  };
}

export interface FeedbackHistoryEntry {
  timestamp: Date;
  score: number;
  issueCount: number;
  categories: Record<string, number>;
}

export class FeedbackAggregator {
  private sources: Map<string, FeedbackSource> = new Map();
  private feedbackHistory: Map<string, FeedbackHistoryEntry[]> = new Map();
  private thesisFeedbackEngine: ThesisFeedbackEngine;

  constructor() {
    this.thesisFeedbackEngine = new ThesisFeedbackEngine();
    this.initializeDefaultSources();
  }

  /**
   * Initialize default feedback sources
   */
  private initializeDefaultSources(): void {
    const defaultSources: FeedbackSource[] = [
      { id: 'grammar', name: 'Grammar Checker', type: 'grammar', weight: 0.15, enabled: true },
      { id: 'style', name: 'Style Analyzer', type: 'style', weight: 0.15, enabled: true },
      { id: 'structure', name: 'Structure Checker', type: 'structure', weight: 0.2, enabled: true },
      { id: 'citation', name: 'Citation Validator', type: 'citation', weight: 0.15, enabled: true },
      { id: 'content', name: 'Content Analyzer', type: 'content', weight: 0.2, enabled: true },
      { id: 'thesis', name: 'Thesis Feedback', type: 'thesis-feedback', weight: 0.15, enabled: true }
    ];

    defaultSources.forEach(source => this.sources.set(source.id, source));
  }

  /**
   * Register a new feedback source
   */
  registerSource(source: FeedbackSource): void {
    this.sources.set(source.id, source);
  }

  /**
   * Enable or disable a feedback source
   */
  toggleSource(sourceId: string, enabled: boolean): void {
    const source = this.sources.get(sourceId);
    if (source) {
      source.enabled = enabled;
    }
  }

  /**
   * Aggregate feedback from all enabled sources
   */
  async aggregateFeedback(
    documentId: string,
    content: string,
    section: string,
    options?: {
      includeHistory?: boolean;
      priorityThreshold?: number;
    }
  ): Promise<AggregatedFeedback> {
    const enabledSources = Array.from(this.sources.values()).filter(s => s.enabled);
    const sourceResults: FeedbackSourceResult[] = [];

    // Collect feedback from each source
    for (const source of enabledSources) {
      const result = await this.collectFromSource(source, content, section);
      sourceResults.push(result);
    }

    // Prioritize and deduplicate issues
    const prioritizedIssues = this.prioritizeIssues(sourceResults);

    // Generate category summaries
    const categories = this.generateCategorySummaries(sourceResults, documentId);

    // Generate action items
    const actionItems = this.generateActionItems(prioritizedIssues);

    // Calculate overall score
    const overallScore = this.calculateOverallScore(sourceResults);

    // Calculate progress
    const progress = this.calculateProgress(documentId, sourceResults);

    // Store in history
    this.updateHistory(documentId, overallScore, sourceResults);

    return {
      id: `agg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      documentId,
      timestamp: new Date(),
      overallScore,
      sources: sourceResults,
      prioritizedIssues: options?.priorityThreshold
        ? prioritizedIssues.filter(i => i.priority >= options.priorityThreshold!)
        : prioritizedIssues,
      categories,
      actionItems,
      progress
    };
  }

  /**
   * Collect feedback from a specific source
   */
  private async collectFromSource(
    source: FeedbackSource,
    content: string,
    section: string
  ): Promise<FeedbackSourceResult> {
    const issues: FeedbackIssue[] = [];

    switch (source.type) {
      case 'grammar':
        issues.push(...this.analyzeGrammar(content));
        break;
      case 'style':
        issues.push(...this.analyzeStyle(content));
        break;
      case 'structure':
        issues.push(...this.analyzeStructure(content, section));
        break;
      case 'citation':
        issues.push(...this.analyzeCitations(content));
        break;
      case 'content':
        issues.push(...this.analyzeContent(content, section));
        break;
      case 'thesis-feedback':
        issues.push(...await this.getThesisFeedback(content, section));
        break;
    }

    const score = this.calculateSourceScore(issues);

    return {
      sourceId: source.id,
      sourceName: source.name,
      type: source.type,
      score,
      issueCount: issues.length,
      issues,
      processedAt: new Date()
    };
  }

  /**
   * Grammar analysis
   */
  private analyzeGrammar(content: string): FeedbackIssue[] {
    const issues: FeedbackIssue[] = [];

    // Check for common grammar issues
    const patterns = [
      { regex: /\b(their|there|they're)\b/gi, type: 'homophone', severity: 'medium' as const },
      { regex: /\b(your|you're)\b/gi, type: 'homophone', severity: 'medium' as const },
      { regex: /\b(its|it's)\b/gi, type: 'homophone', severity: 'medium' as const },
      { regex: /\s{2,}/g, type: 'spacing', severity: 'low' as const },
      { regex: /[.!?]\s*[a-z]/g, type: 'capitalization', severity: 'medium' as const },
      { regex: /\b(alot|everytime|noone)\b/gi, type: 'spelling', severity: 'high' as const }
    ];

    patterns.forEach(({ regex, type, severity }) => {
      const matches = content.match(regex) || [];
      if (matches.length > 0) {
        issues.push({
          id: `grammar_${type}_${Date.now()}`,
          source: 'grammar',
          type,
          severity,
          title: `Potential ${type} issue`,
          description: `Found ${matches.length} instance(s) of potential ${type} issues`,
          autoFixable: type === 'spacing',
          suggestion: this.getGrammarSuggestion(type)
        });
      }
    });

    return issues;
  }

  /**
   * Style analysis
   */
  private analyzeStyle(content: string): FeedbackIssue[] {
    const issues: FeedbackIssue[] = [];
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [];

    // Check sentence length variety
    const lengths = sentences.map(s => s.split(/\s+/).length);
    const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;

    if (avgLength > 30) {
      issues.push({
        id: `style_sentence_length_${Date.now()}`,
        source: 'style',
        type: 'sentence-length',
        severity: 'medium',
        title: 'Long sentences detected',
        description: `Average sentence length is ${avgLength.toFixed(1)} words. Consider breaking up longer sentences.`,
        autoFixable: false,
        suggestion: 'Aim for 15-25 words per sentence for better readability.'
      });
    }

    // Check for passive voice overuse
    const passiveMatches = content.match(/\b(is|are|was|were|been|being)\s+\w+ed\b/gi) || [];
    if (passiveMatches.length > 5) {
      issues.push({
        id: `style_passive_${Date.now()}`,
        source: 'style',
        type: 'passive-voice',
        severity: 'low',
        title: 'Passive voice overuse',
        description: `Found ${passiveMatches.length} instances of passive voice.`,
        autoFixable: false,
        suggestion: 'Consider using active voice for clearer, more direct writing.'
      });
    }

    // Check for informal language
    const informalPatterns = /\b(gonna|wanna|kinda|sorta|gotta|ain't)\b/gi;
    const informalMatches = content.match(informalPatterns) || [];
    if (informalMatches.length > 0) {
      issues.push({
        id: `style_informal_${Date.now()}`,
        source: 'style',
        type: 'informal-language',
        severity: 'high',
        title: 'Informal language detected',
        description: `Found ${informalMatches.length} informal expressions that should be revised.`,
        autoFixable: true,
        suggestion: 'Replace informal expressions with formal academic alternatives.'
      });
    }

    return issues;
  }

  /**
   * Structure analysis
   */
  private analyzeStructure(content: string, section: string): FeedbackIssue[] {
    const issues: FeedbackIssue[] = [];
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);

    // Check paragraph count
    if (paragraphs.length < 3 && content.length > 500) {
      issues.push({
        id: `structure_paragraphs_${Date.now()}`,
        source: 'structure',
        type: 'paragraph-structure',
        severity: 'medium',
        title: 'Consider adding paragraph breaks',
        description: 'Long sections benefit from more paragraph breaks for readability.',
        autoFixable: false,
        suggestion: 'Break content into logical paragraphs, each focusing on one main idea.'
      });
    }

    // Check for transition words
    const transitions = /\b(however|therefore|furthermore|moreover|consequently|additionally|thus)\b/gi;
    const transitionMatches = content.match(transitions) || [];
    if (transitionMatches.length < 2 && paragraphs.length > 3) {
      issues.push({
        id: `structure_transitions_${Date.now()}`,
        source: 'structure',
        type: 'transitions',
        severity: 'low',
        title: 'Add transitional phrases',
        description: 'Consider adding transitional words to improve flow between paragraphs.',
        autoFixable: false,
        suggestion: 'Use words like "however," "therefore," "furthermore" to connect ideas.'
      });
    }

    // Section-specific checks
    if (section === 'introduction' && !content.toLowerCase().includes('objective')) {
      issues.push({
        id: `structure_objective_${Date.now()}`,
        source: 'structure',
        type: 'section-requirement',
        severity: 'high',
        title: 'Research objective may be missing',
        description: 'Introduction sections typically include a clear research objective.',
        autoFixable: false,
        suggestion: 'State your research objectives clearly in the introduction.'
      });
    }

    return issues;
  }

  /**
   * Citation analysis
   */
  private analyzeCitations(content: string): FeedbackIssue[] {
    const issues: FeedbackIssue[] = [];

    // Check for citation patterns (APA, MLA, etc.)
    const apaPattern = /\([A-Z][a-z]+(?:\s+(?:&|and)\s+[A-Z][a-z]+)*,\s*\d{4}\)/g;
    const citationMatches = content.match(apaPattern) || [];

    // Check for claims without citations
    const claimPatterns = /\b(studies show|research indicates|experts say|according to|it is known that|many believe)\b/gi;
    const claimMatches = content.match(claimPatterns) || [];

    if (claimMatches.length > citationMatches.length) {
      issues.push({
        id: `citation_missing_${Date.now()}`,
        source: 'citation',
        type: 'missing-citation',
        severity: 'critical',
        title: 'Potential missing citations',
        description: `Found ${claimMatches.length} claims but only ${citationMatches.length} citations.`,
        autoFixable: false,
        suggestion: 'Add citations to support claims about research findings.'
      });
    }

    // Check citation format consistency
    const otherFormats = content.match(/\[\d+\]|\d+\./g) || [];
    if (citationMatches.length > 0 && otherFormats.length > 0) {
      issues.push({
        id: `citation_format_${Date.now()}`,
        source: 'citation',
        type: 'inconsistent-format',
        severity: 'high',
        title: 'Inconsistent citation format',
        description: 'Multiple citation formats detected. Use one consistent style.',
        autoFixable: false,
        suggestion: 'Choose one citation format (APA, MLA, Chicago) and use it consistently.'
      });
    }

    return issues;
  }

  /**
   * Content analysis
   */
  private analyzeContent(content: string, section: string): FeedbackIssue[] {
    const issues: FeedbackIssue[] = [];
    const wordCount = content.split(/\s+/).length;

    // Check word count for section
    const expectedCounts: Record<string, { min: number; max: number }> = {
      abstract: { min: 150, max: 300 },
      introduction: { min: 500, max: 2000 },
      'literature-review': { min: 2000, max: 5000 },
      methodology: { min: 1000, max: 3000 },
      results: { min: 1000, max: 4000 },
      discussion: { min: 1500, max: 4000 },
      conclusion: { min: 300, max: 1000 }
    };

    const expected = expectedCounts[section];
    if (expected) {
      if (wordCount < expected.min) {
        issues.push({
          id: `content_short_${Date.now()}`,
          source: 'content',
          type: 'word-count',
          severity: 'medium',
          title: 'Section may be too short',
          description: `${section} has ${wordCount} words. Recommended: ${expected.min}-${expected.max} words.`,
          autoFixable: false,
          suggestion: 'Consider expanding this section with more detail.'
        });
      } else if (wordCount > expected.max) {
        issues.push({
          id: `content_long_${Date.now()}`,
          source: 'content',
          type: 'word-count',
          severity: 'low',
          title: 'Section may be too long',
          description: `${section} has ${wordCount} words. Recommended: ${expected.min}-${expected.max} words.`,
          autoFixable: false,
          suggestion: 'Consider condensing this section or splitting into subsections.'
        });
      }
    }

    // Check for repetition
    const words = content.toLowerCase().split(/\s+/);
    const wordFreq = new Map<string, number>();
    words.forEach(word => {
      if (word.length > 5) {
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
      }
    });

    const overusedWords = Array.from(wordFreq.entries())
      .filter(([_, count]) => count > 10)
      .map(([word]) => word);

    if (overusedWords.length > 0) {
      issues.push({
        id: `content_repetition_${Date.now()}`,
        source: 'content',
        type: 'repetition',
        severity: 'low',
        title: 'Word repetition detected',
        description: `The following words appear frequently: ${overusedWords.slice(0, 5).join(', ')}`,
        autoFixable: false,
        suggestion: 'Consider using synonyms or restructuring sentences.'
      });
    }

    return issues;
  }

  /**
   * Get thesis feedback
   */
  private async getThesisFeedback(content: string, section: string): Promise<FeedbackIssue[]> {
    const submission = {
      userId: 'system',
      documentId: 'temp',
      title: section,
      content,
      section,
      wordCount: content.split(/\s+/).length,
      submissionDate: new Date(),
      version: 1
    };

    const feedback = await this.thesisFeedbackEngine.generateFeedback(submission);

    return feedback.suggestions.map(suggestion => ({
      id: suggestion.id,
      source: 'thesis-feedback',
      type: suggestion.category,
      severity: suggestion.severity,
      title: suggestion.title,
      description: suggestion.description,
      autoFixable: false,
      suggestion: suggestion.suggestions.join(' ')
    }));
  }

  /**
   * Get grammar suggestion based on type
   */
  private getGrammarSuggestion(type: string): string {
    const suggestions: Record<string, string> = {
      homophone: 'Check the usage of commonly confused words.',
      spacing: 'Remove extra spaces between words.',
      capitalization: 'Capitalize the first letter after sentence-ending punctuation.',
      spelling: 'Check spelling of commonly misspelled words.'
    };
    return suggestions[type] || 'Review for grammatical accuracy.';
  }

  /**
   * Calculate score for a source based on issues
   */
  private calculateSourceScore(issues: FeedbackIssue[]): number {
    let score = 100;
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'critical': score -= 15; break;
        case 'high': score -= 10; break;
        case 'medium': score -= 5; break;
        case 'low': score -= 2; break;
        case 'info': score -= 0; break;
      }
    });
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Prioritize and deduplicate issues across sources
   */
  private prioritizeIssues(sources: FeedbackSourceResult[]): PrioritizedIssue[] {
    const allIssues = sources.flatMap(s => s.issues);
    const prioritized: Map<string, PrioritizedIssue> = new Map();

    // Group similar issues
    allIssues.forEach(issue => {
      const key = `${issue.type}_${issue.severity}`;
      const existing = prioritized.get(key);

      if (existing) {
        existing.aggregatedFrom.push(issue.source);
        existing.confidence = Math.min(1, existing.confidence + 0.2);
      } else {
        prioritized.set(key, {
          ...issue,
          priority: this.calculatePriority(issue),
          aggregatedFrom: [issue.source],
          confidence: 0.7
        });
      }
    });

    return Array.from(prioritized.values())
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Calculate priority score for an issue
   */
  private calculatePriority(issue: FeedbackIssue): number {
    const severityScores: Record<string, number> = {
      critical: 10,
      high: 8,
      medium: 5,
      low: 3,
      info: 1
    };
    return severityScores[issue.severity] || 5;
  }

  /**
   * Generate category summaries
   */
  private generateCategorySummaries(
    sources: FeedbackSourceResult[],
    documentId: string
  ): CategorySummary[] {
    const categories = new Map<string, { issues: FeedbackIssue[]; score: number }>();

    sources.forEach(source => {
      const existing = categories.get(source.type) || { issues: [], score: 0 };
      existing.issues.push(...source.issues);
      existing.score = (existing.score + source.score) / 2;
      categories.set(source.type, existing);
    });

    const history = this.feedbackHistory.get(documentId) || [];
    const previousEntry = history[history.length - 2];

    return Array.from(categories.entries()).map(([category, data]) => {
      const previousScore = previousEntry?.categories[category] || data.score;
      let trend: 'improving' | 'stable' | 'declining' = 'stable';
      if (data.score > previousScore + 5) trend = 'improving';
      else if (data.score < previousScore - 5) trend = 'declining';

      return {
        category,
        score: Math.round(data.score),
        issueCount: data.issues.length,
        trend,
        topIssues: data.issues.slice(0, 3).map(i => i.title)
      };
    });
  }

  /**
   * Generate action items from prioritized issues
   */
  private generateActionItems(issues: PrioritizedIssue[]): ActionItem[] {
    return issues.slice(0, 5).map((issue, index) => ({
      id: `action_${Date.now()}_${index}`,
      priority: issue.severity === 'critical' ? 'critical' :
                issue.severity === 'high' ? 'high' :
                issue.severity === 'medium' ? 'medium' : 'low',
      title: `Fix: ${issue.title}`,
      description: issue.suggestion || issue.description,
      estimatedTime: issue.severity === 'critical' ? '15-30 min' :
                     issue.severity === 'high' ? '10-15 min' : '5-10 min',
      category: issue.type,
      relatedIssues: [issue.id]
    }));
  }

  /**
   * Calculate overall score from all sources
   */
  private calculateOverallScore(sources: FeedbackSourceResult[]): number {
    let totalWeight = 0;
    let weightedScore = 0;

    sources.forEach(result => {
      const source = this.sources.get(result.sourceId);
      if (source) {
        weightedScore += result.score * source.weight;
        totalWeight += source.weight;
      }
    });

    return Math.round(totalWeight > 0 ? weightedScore / totalWeight : 0);
  }

  /**
   * Calculate progress compared to previous feedback
   */
  private calculateProgress(
    documentId: string,
    sources: FeedbackSourceResult[]
  ): FeedbackProgress {
    const history = this.feedbackHistory.get(documentId) || [];
    const currentIssues = sources.reduce((sum, s) => sum + s.issueCount, 0);
    const currentScore = this.calculateOverallScore(sources);

    let previousEntry = history[history.length - 1];
    const previousScore = previousEntry?.score || currentScore;
    const previousIssues = previousEntry?.issueCount || currentIssues;

    return {
      totalIssues: currentIssues,
      resolvedIssues: Math.max(0, previousIssues - currentIssues),
      pendingIssues: currentIssues,
      improvementRate: previousScore > 0
        ? Math.round(((currentScore - previousScore) / previousScore) * 100)
        : 0,
      comparisonToPrevious: {
        scoreChange: currentScore - previousScore,
        issueCountChange: currentIssues - previousIssues
      }
    };
  }

  /**
   * Update feedback history
   */
  private updateHistory(
    documentId: string,
    score: number,
    sources: FeedbackSourceResult[]
  ): void {
    const history = this.feedbackHistory.get(documentId) || [];
    const categories: Record<string, number> = {};
    sources.forEach(s => {
      categories[s.type] = s.score;
    });

    history.push({
      timestamp: new Date(),
      score,
      issueCount: sources.reduce((sum, s) => sum + s.issueCount, 0),
      categories
    });

    // Keep last 50 entries
    if (history.length > 50) {
      history.shift();
    }

    this.feedbackHistory.set(documentId, history);
  }

  /**
   * Get feedback history for a document
   */
  getHistory(documentId: string): FeedbackHistoryEntry[] {
    return this.feedbackHistory.get(documentId) || [];
  }

  /**
   * Get registered sources
   */
  getSources(): FeedbackSource[] {
    return Array.from(this.sources.values());
  }
}

// Singleton instance
export const feedbackAggregator = new FeedbackAggregator();
