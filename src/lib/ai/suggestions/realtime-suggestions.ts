/**
 * Real-time Suggestion Engine
 * Phase 5 Week 2: Advanced AI Features
 *
 * Provides instant suggestions as users type:
 * - Debounced analysis
 * - Inline suggestions
 * - Context-aware recommendations
 * - Performance-optimized processing
 */

export interface RealtimeSuggestion {
  id: string;
  type: SuggestionType;
  trigger: TriggerInfo;
  content: string;
  preview?: string;
  confidence: number;
  actions: SuggestionAction[];
  metadata: SuggestionMetadata;
}

export type SuggestionType =
  | 'completion'
  | 'correction'
  | 'improvement'
  | 'structure'
  | 'citation'
  | 'terminology'
  | 'style';

export interface TriggerInfo {
  position: number;
  text: string;
  context: string;
  type: 'word' | 'sentence' | 'paragraph' | 'section';
}

export interface SuggestionAction {
  id: string;
  label: string;
  type: 'accept' | 'dismiss' | 'modify' | 'learn-more';
  handler?: () => void;
}

export interface SuggestionMetadata {
  generatedAt: Date;
  processingTime: number;
  source: string;
  category: string;
}

export interface SuggestionConfig {
  debounceMs: number;
  minTextLength: number;
  maxSuggestions: number;
  enabledTypes: SuggestionType[];
  confidenceThreshold: number;
  contextWindow: number; // characters before/after cursor
}

export interface SuggestionContext {
  fullText: string;
  cursorPosition: number;
  selectedText?: string;
  section: string;
  recentEdits: EditEvent[];
}

export interface EditEvent {
  timestamp: Date;
  position: number;
  type: 'insert' | 'delete' | 'replace';
  text: string;
}

export interface SuggestionSubscriber {
  id: string;
  callback: (suggestions: RealtimeSuggestion[]) => void;
  filters?: {
    types?: SuggestionType[];
    minConfidence?: number;
  };
}

export class RealtimeSuggestionEngine {
  private config: SuggestionConfig;
  private subscribers: Map<string, SuggestionSubscriber> = new Map();
  private debounceTimer: NodeJS.Timeout | null = null;
  private lastContext: SuggestionContext | null = null;
  private suggestionCache: Map<string, RealtimeSuggestion[]> = new Map();
  private recentEdits: EditEvent[] = [];
  private maxRecentEdits = 20;

  constructor(config?: Partial<SuggestionConfig>) {
    this.config = {
      debounceMs: 300,
      minTextLength: 10,
      maxSuggestions: 5,
      enabledTypes: ['completion', 'correction', 'improvement', 'style'],
      confidenceThreshold: 0.6,
      contextWindow: 200,
      ...config
    };
  }

  /**
   * Subscribe to suggestion updates
   */
  subscribe(subscriber: SuggestionSubscriber): () => void {
    this.subscribers.set(subscriber.id, subscriber);
    return () => this.subscribers.delete(subscriber.id);
  }

  /**
   * Unsubscribe from updates
   */
  unsubscribe(subscriberId: string): void {
    this.subscribers.delete(subscriberId);
  }

  /**
   * Process text change and generate suggestions
   */
  async onTextChange(context: SuggestionContext): Promise<void> {
    // Clear existing debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Record edit event
    this.recordEdit(context);

    // Debounce the suggestion generation
    this.debounceTimer = setTimeout(async () => {
      const suggestions = await this.generateSuggestions(context);
      this.notifySubscribers(suggestions);
    }, this.config.debounceMs);
  }

  /**
   * Generate suggestions for the current context
   */
  async generateSuggestions(context: SuggestionContext): Promise<RealtimeSuggestion[]> {
    const startTime = Date.now();
    const suggestions: RealtimeSuggestion[] = [];

    // Check minimum text length
    if (context.fullText.length < this.config.minTextLength) {
      return [];
    }

    // Extract context around cursor
    const localContext = this.extractLocalContext(context);

    // Check cache first
    const cacheKey = this.getCacheKey(localContext);
    const cached = this.suggestionCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Generate suggestions based on enabled types
    for (const type of this.config.enabledTypes) {
      const typeSuggestions = await this.generateByType(type, context, localContext);
      suggestions.push(...typeSuggestions);
    }

    // Filter by confidence threshold
    const filtered = suggestions
      .filter(s => s.confidence >= this.config.confidenceThreshold)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, this.config.maxSuggestions);

    // Update processing time
    filtered.forEach(s => {
      s.metadata.processingTime = Date.now() - startTime;
    });

    // Cache results
    this.suggestionCache.set(cacheKey, filtered);

    // Clean old cache entries
    if (this.suggestionCache.size > 100) {
      const firstKey = this.suggestionCache.keys().next().value;
      if (firstKey) this.suggestionCache.delete(firstKey);
    }

    this.lastContext = context;
    return filtered;
  }

  /**
   * Generate suggestions by type
   */
  private async generateByType(
    type: SuggestionType,
    context: SuggestionContext,
    localContext: string
  ): Promise<RealtimeSuggestion[]> {
    switch (type) {
      case 'completion':
        return this.generateCompletions(context, localContext);
      case 'correction':
        return this.generateCorrections(context, localContext);
      case 'improvement':
        return this.generateImprovements(context, localContext);
      case 'style':
        return this.generateStyleSuggestions(context, localContext);
      case 'structure':
        return this.generateStructureSuggestions(context, localContext);
      case 'citation':
        return this.generateCitationSuggestions(context, localContext);
      case 'terminology':
        return this.generateTerminologySuggestions(context, localContext);
      default:
        return [];
    }
  }

  /**
   * Generate text completions
   */
  private generateCompletions(
    context: SuggestionContext,
    localContext: string
  ): RealtimeSuggestion[] {
    const suggestions: RealtimeSuggestion[] = [];
    const words = localContext.split(/\s+/);
    const lastWord = words[words.length - 1] || '';

    // Academic phrase completions
    const academicPhrases: Record<string, string[]> = {
      'this': ['study aims to', 'research demonstrates', 'analysis reveals', 'section discusses'],
      'the': ['findings indicate', 'results suggest', 'data shows', 'evidence supports'],
      'in': ['conclusion', 'summary', 'addition', 'contrast'],
      'it': ['is important to note', 'should be emphasized', 'can be argued'],
      'according': ['to the literature', 'to previous studies', 'to recent research'],
      'further': ['research is needed', 'analysis reveals', 'investigation shows'],
      'as': ['mentioned previously', 'demonstrated above', 'shown in Figure']
    };

    const completions = academicPhrases[lastWord.toLowerCase()];
    if (completions && lastWord.length >= 2) {
      completions.forEach((completion, index) => {
        suggestions.push({
          id: `completion_${Date.now()}_${index}`,
          type: 'completion',
          trigger: {
            position: context.cursorPosition,
            text: lastWord,
            context: localContext,
            type: 'word'
          },
          content: completion,
          preview: `${lastWord} ${completion}`,
          confidence: 0.75 - (index * 0.1),
          actions: [
            { id: 'accept', label: 'Accept', type: 'accept' },
            { id: 'dismiss', label: 'Dismiss', type: 'dismiss' }
          ],
          metadata: {
            generatedAt: new Date(),
            processingTime: 0,
            source: 'phrase-completion',
            category: 'completion'
          }
        });
      });
    }

    return suggestions;
  }

  /**
   * Generate corrections for common errors
   */
  private generateCorrections(
    context: SuggestionContext,
    localContext: string
  ): RealtimeSuggestion[] {
    const suggestions: RealtimeSuggestion[] = [];

    // Common academic writing corrections
    const corrections: Array<{ pattern: RegExp; replacement: string; description: string }> = [
      { pattern: /\balot\b/gi, replacement: 'a lot', description: '"A lot" should be two words' },
      { pattern: /\beffect\b(?=\s+(on|upon))/gi, replacement: 'effect', description: 'Use "effect" as a noun' },
      { pattern: /\baffect\b(?=\s+(the|a|an))/gi, replacement: 'affect', description: 'Use "affect" as a verb' },
      { pattern: /\bprincipal\b(?=\s+(reason|factor|cause))/gi, replacement: 'principal', description: 'Principal = main/chief' },
      { pattern: /\bthere\s+their\b/gi, replacement: 'their', description: 'Use "their" for possession' },
      { pattern: /\bits\s+it's\b/gi, replacement: "it's", description: "It's = it is" },
      { pattern: /\bcould\s+of\b/gi, replacement: 'could have', description: 'Use "could have" not "could of"' },
      { pattern: /\bwould\s+of\b/gi, replacement: 'would have', description: 'Use "would have" not "would of"' }
    ];

    corrections.forEach((correction, index) => {
      if (correction.pattern.test(localContext)) {
        const match = localContext.match(correction.pattern);
        if (match) {
          suggestions.push({
            id: `correction_${Date.now()}_${index}`,
            type: 'correction',
            trigger: {
              position: context.cursorPosition,
              text: match[0],
              context: localContext,
              type: 'word'
            },
            content: correction.replacement,
            preview: correction.description,
            confidence: 0.9,
            actions: [
              { id: 'accept', label: 'Fix', type: 'accept' },
              { id: 'dismiss', label: 'Ignore', type: 'dismiss' }
            ],
            metadata: {
              generatedAt: new Date(),
              processingTime: 0,
              source: 'grammar-check',
              category: 'correction'
            }
          });
        }
      }
    });

    return suggestions;
  }

  /**
   * Generate improvement suggestions
   */
  private generateImprovements(
    context: SuggestionContext,
    localContext: string
  ): RealtimeSuggestion[] {
    const suggestions: RealtimeSuggestion[] = [];

    // Word improvements
    const improvements: Array<{ word: string; better: string[]; reason: string }> = [
      { word: 'very', better: ['significantly', 'considerably', 'substantially'], reason: 'Use stronger modifiers' },
      { word: 'really', better: ['genuinely', 'truly', 'notably'], reason: 'Avoid informal intensifiers' },
      { word: 'things', better: ['factors', 'elements', 'aspects', 'components'], reason: 'Be more specific' },
      { word: 'stuff', better: ['material', 'content', 'data', 'information'], reason: 'Use academic language' },
      { word: 'good', better: ['effective', 'beneficial', 'advantageous', 'favorable'], reason: 'Use more precise terms' },
      { word: 'bad', better: ['detrimental', 'adverse', 'unfavorable', 'problematic'], reason: 'Use academic vocabulary' },
      { word: 'big', better: ['significant', 'substantial', 'considerable', 'extensive'], reason: 'Use formal adjectives' },
      { word: 'get', better: ['obtain', 'acquire', 'receive', 'achieve'], reason: 'Use formal verbs' },
      { word: 'show', better: ['demonstrate', 'illustrate', 'indicate', 'reveal'], reason: 'Use academic verbs' }
    ];

    improvements.forEach((imp, index) => {
      const regex = new RegExp(`\\b${imp.word}\\b`, 'gi');
      if (regex.test(localContext)) {
        suggestions.push({
          id: `improvement_${Date.now()}_${index}`,
          type: 'improvement',
          trigger: {
            position: context.cursorPosition,
            text: imp.word,
            context: localContext,
            type: 'word'
          },
          content: imp.better[0],
          preview: `Replace "${imp.word}" with "${imp.better.join('" or "')}"`,
          confidence: 0.7,
          actions: [
            { id: 'accept', label: `Use "${imp.better[0]}"`, type: 'accept' },
            { id: 'alternatives', label: 'More options', type: 'modify' },
            { id: 'dismiss', label: 'Keep', type: 'dismiss' }
          ],
          metadata: {
            generatedAt: new Date(),
            processingTime: 0,
            source: 'vocabulary-enhancement',
            category: 'improvement'
          }
        });
      }
    });

    return suggestions;
  }

  /**
   * Generate style suggestions
   */
  private generateStyleSuggestions(
    context: SuggestionContext,
    localContext: string
  ): RealtimeSuggestion[] {
    const suggestions: RealtimeSuggestion[] = [];

    // Check for contractions
    const contractions = localContext.match(/\b(can't|won't|don't|isn't|aren't|wasn't|weren't|haven't|hasn't|hadn't)\b/gi);
    if (contractions && contractions.length > 0) {
      suggestions.push({
        id: `style_contractions_${Date.now()}`,
        type: 'style',
        trigger: {
          position: context.cursorPosition,
          text: contractions[0],
          context: localContext,
          type: 'word'
        },
        content: this.expandContraction(contractions[0]),
        preview: 'Expand contractions for formal academic writing',
        confidence: 0.85,
        actions: [
          { id: 'accept', label: 'Expand', type: 'accept' },
          { id: 'dismiss', label: 'Keep', type: 'dismiss' }
        ],
        metadata: {
          generatedAt: new Date(),
          processingTime: 0,
          source: 'style-checker',
          category: 'style'
        }
      });
    }

    // Check for first person overuse in current sentence
    const sentence = this.getCurrentSentence(context.fullText, context.cursorPosition);
    const firstPerson = sentence.match(/\b(I|me|my|mine)\b/gi);
    if (firstPerson && firstPerson.length >= 2) {
      suggestions.push({
        id: `style_firstperson_${Date.now()}`,
        type: 'style',
        trigger: {
          position: context.cursorPosition,
          text: sentence,
          context: localContext,
          type: 'sentence'
        },
        content: 'Consider using third person',
        preview: 'Multiple first-person references in this sentence',
        confidence: 0.65,
        actions: [
          { id: 'learn-more', label: 'Show alternatives', type: 'learn-more' },
          { id: 'dismiss', label: 'Dismiss', type: 'dismiss' }
        ],
        metadata: {
          generatedAt: new Date(),
          processingTime: 0,
          source: 'style-checker',
          category: 'style'
        }
      });
    }

    return suggestions;
  }

  /**
   * Generate structure suggestions
   */
  private generateStructureSuggestions(
    context: SuggestionContext,
    localContext: string
  ): RealtimeSuggestion[] {
    const suggestions: RealtimeSuggestion[] = [];

    // Check sentence length
    const sentence = this.getCurrentSentence(context.fullText, context.cursorPosition);
    const wordCount = sentence.split(/\s+/).length;

    if (wordCount > 35) {
      suggestions.push({
        id: `structure_sentence_${Date.now()}`,
        type: 'structure',
        trigger: {
          position: context.cursorPosition,
          text: sentence,
          context: localContext,
          type: 'sentence'
        },
        content: 'Consider breaking this sentence',
        preview: `This sentence has ${wordCount} words. Consider splitting for clarity.`,
        confidence: 0.7,
        actions: [
          { id: 'learn-more', label: 'Show suggestions', type: 'learn-more' },
          { id: 'dismiss', label: 'Keep as is', type: 'dismiss' }
        ],
        metadata: {
          generatedAt: new Date(),
          processingTime: 0,
          source: 'structure-analyzer',
          category: 'structure'
        }
      });
    }

    return suggestions;
  }

  /**
   * Generate citation suggestions
   */
  private generateCitationSuggestions(
    context: SuggestionContext,
    localContext: string
  ): RealtimeSuggestion[] {
    const suggestions: RealtimeSuggestion[] = [];

    // Check for claims that might need citations
    const claimPatterns = [
      /\b(studies show|research indicates|experts say)\b/gi,
      /\b(according to|it is known that|many believe)\b/gi,
      /\b(statistics show|data suggests|evidence indicates)\b/gi
    ];

    for (const pattern of claimPatterns) {
      const match = localContext.match(pattern);
      if (match) {
        suggestions.push({
          id: `citation_needed_${Date.now()}`,
          type: 'citation',
          trigger: {
            position: context.cursorPosition,
            text: match[0],
            context: localContext,
            type: 'sentence'
          },
          content: 'Add citation',
          preview: 'This claim may need a citation to support it',
          confidence: 0.8,
          actions: [
            { id: 'add-citation', label: 'Add citation', type: 'modify' },
            { id: 'dismiss', label: 'Dismiss', type: 'dismiss' }
          ],
          metadata: {
            generatedAt: new Date(),
            processingTime: 0,
            source: 'citation-checker',
            category: 'citation'
          }
        });
        break; // Only one citation suggestion at a time
      }
    }

    return suggestions;
  }

  /**
   * Generate terminology suggestions
   */
  private generateTerminologySuggestions(
    context: SuggestionContext,
    localContext: string
  ): RealtimeSuggestion[] {
    const suggestions: RealtimeSuggestion[] = [];

    // Section-specific terminology
    const sectionTerms: Record<string, Array<{ trigger: string; suggestion: string }>> = {
      methodology: [
        { trigger: 'survey', suggestion: 'Consider specifying: questionnaire, interview schedule, or assessment instrument' },
        { trigger: 'test', suggestion: 'Specify the type: statistical test, validation test, or reliability test' },
        { trigger: 'sample', suggestion: 'Consider adding: sample size, sampling method, or sampling frame' }
      ],
      results: [
        { trigger: 'significant', suggestion: 'Add statistical significance level (p < 0.05)' },
        { trigger: 'correlation', suggestion: 'Consider specifying: Pearson, Spearman, or point-biserial correlation' },
        { trigger: 'difference', suggestion: 'Quantify the difference with effect size or percentage' }
      ],
      discussion: [
        { trigger: 'limitation', suggestion: 'Consider categorizing: methodological, theoretical, or practical limitation' },
        { trigger: 'implication', suggestion: 'Specify: theoretical, practical, or policy implication' }
      ]
    };

    const terms = sectionTerms[context.section.toLowerCase()] || [];
    for (const term of terms) {
      if (localContext.toLowerCase().includes(term.trigger)) {
        suggestions.push({
          id: `terminology_${Date.now()}_${term.trigger}`,
          type: 'terminology',
          trigger: {
            position: context.cursorPosition,
            text: term.trigger,
            context: localContext,
            type: 'word'
          },
          content: term.suggestion,
          preview: term.suggestion,
          confidence: 0.65,
          actions: [
            { id: 'learn-more', label: 'Learn more', type: 'learn-more' },
            { id: 'dismiss', label: 'Dismiss', type: 'dismiss' }
          ],
          metadata: {
            generatedAt: new Date(),
            processingTime: 0,
            source: 'terminology-helper',
            category: 'terminology'
          }
        });
      }
    }

    return suggestions;
  }

  /**
   * Extract local context around cursor
   */
  private extractLocalContext(context: SuggestionContext): string {
    const start = Math.max(0, context.cursorPosition - this.config.contextWindow);
    const end = Math.min(context.fullText.length, context.cursorPosition + this.config.contextWindow);
    return context.fullText.substring(start, end);
  }

  /**
   * Get current sentence at cursor position
   */
  private getCurrentSentence(text: string, position: number): string {
    const before = text.substring(0, position);
    const after = text.substring(position);

    const sentenceStart = Math.max(
      before.lastIndexOf('.') + 1,
      before.lastIndexOf('!') + 1,
      before.lastIndexOf('?') + 1,
      0
    );

    const nextPeriod = after.search(/[.!?]/);
    const sentenceEnd = nextPeriod === -1 ? text.length : position + nextPeriod + 1;

    return text.substring(sentenceStart, sentenceEnd).trim();
  }

  /**
   * Expand contraction to full form
   */
  private expandContraction(contraction: string): string {
    const expansions: Record<string, string> = {
      "can't": 'cannot',
      "won't": 'will not',
      "don't": 'do not',
      "isn't": 'is not',
      "aren't": 'are not',
      "wasn't": 'was not',
      "weren't": 'were not',
      "haven't": 'have not',
      "hasn't": 'has not',
      "hadn't": 'had not'
    };
    return expansions[contraction.toLowerCase()] || contraction;
  }

  /**
   * Generate cache key from context
   */
  private getCacheKey(localContext: string): string {
    return localContext.trim().toLowerCase().substring(0, 100);
  }

  /**
   * Record an edit event
   */
  private recordEdit(context: SuggestionContext): void {
    this.recentEdits.push({
      timestamp: new Date(),
      position: context.cursorPosition,
      type: 'insert',
      text: context.fullText.substring(
        Math.max(0, context.cursorPosition - 10),
        context.cursorPosition
      )
    });

    if (this.recentEdits.length > this.maxRecentEdits) {
      this.recentEdits.shift();
    }
  }

  /**
   * Notify all subscribers of new suggestions
   */
  private notifySubscribers(suggestions: RealtimeSuggestion[]): void {
    this.subscribers.forEach(subscriber => {
      let filtered = suggestions;

      if (subscriber.filters?.types) {
        filtered = filtered.filter(s => subscriber.filters!.types!.includes(s.type));
      }

      if (subscriber.filters?.minConfidence) {
        filtered = filtered.filter(s => s.confidence >= subscriber.filters!.minConfidence!);
      }

      subscriber.callback(filtered);
    });
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SuggestionConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): SuggestionConfig {
    return { ...this.config };
  }

  /**
   * Clear suggestion cache
   */
  clearCache(): void {
    this.suggestionCache.clear();
  }

  /**
   * Get recent edit history
   */
  getRecentEdits(): EditEvent[] {
    return [...this.recentEdits];
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.subscribers.clear();
    this.suggestionCache.clear();
    this.recentEdits = [];
  }
}

// Singleton instance
export const realtimeSuggestions = new RealtimeSuggestionEngine();
