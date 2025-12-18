/**
 * Semantic Understanding Layer
 * Phase 5 Sprint 2: Advanced AI Features
 *
 * Provides deep semantic analysis:
 * - Text embedding generation
 * - Similarity detection
 * - Argument structure analysis
 * - Sentiment analysis
 * - Concept relationship mapping
 */

export interface SemanticAnalysisResult {
  id: string;
  documentId: string;
  timestamp: Date;
  embedding?: number[];
  concepts: ConceptEntity[];
  arguments: ArgumentStructure[];
  sentiment: SentimentAnalysis;
  coherence: CoherenceAnalysis;
  relationships: ConceptRelationship[];
  summary: SemanticSummary;
}

export interface ConceptEntity {
  id: string;
  term: string;
  type: ConceptType;
  frequency: number;
  importance: number; // 0-1
  positions: number[];
  relatedTerms: string[];
  definition?: string;
}

export type ConceptType =
  | 'key-term'
  | 'methodology'
  | 'theory'
  | 'variable'
  | 'finding'
  | 'citation'
  | 'acronym'
  | 'technical-term';

export interface ArgumentStructure {
  id: string;
  type: ArgumentType;
  claim: string;
  evidence: EvidenceItem[];
  warrant?: string;
  strength: number; // 0-1
  position: TextPosition;
}

export type ArgumentType =
  | 'thesis'
  | 'main-argument'
  | 'supporting-argument'
  | 'counter-argument'
  | 'rebuttal'
  | 'conclusion';

export interface EvidenceItem {
  type: 'data' | 'citation' | 'example' | 'reasoning' | 'authority';
  content: string;
  strength: number;
  source?: string;
}

export interface TextPosition {
  startOffset: number;
  endOffset: number;
  paragraph?: number;
  section?: string;
}

export interface SentimentAnalysis {
  overall: SentimentScore;
  bySection: Record<string, SentimentScore>;
  confidence: number;
  objectivity: number; // 0-1, higher = more objective
  academicTone: number; // 0-1, higher = more academic
}

export interface SentimentScore {
  positive: number;
  negative: number;
  neutral: number;
  compound: number; // -1 to 1
}

export interface CoherenceAnalysis {
  overallScore: number; // 0-100
  topicConsistency: number;
  logicalFlow: number;
  transitionQuality: number;
  issues: CoherenceIssue[];
}

export interface CoherenceIssue {
  type: 'topic-shift' | 'missing-transition' | 'logical-gap' | 'repetition' | 'contradiction';
  location: TextPosition;
  description: string;
  suggestion: string;
  severity: 'low' | 'medium' | 'high';
}

export interface ConceptRelationship {
  source: string;
  target: string;
  type: RelationshipType;
  strength: number;
  context?: string;
}

export type RelationshipType =
  | 'causes'
  | 'correlates'
  | 'includes'
  | 'contradicts'
  | 'supports'
  | 'defines'
  | 'extends'
  | 'compares';

export interface SemanticSummary {
  mainTopics: string[];
  keyFindings: string[];
  methodologyUsed: string[];
  researchGaps: string[];
  contributions: string[];
}

export interface SimilarityResult {
  documentId: string;
  score: number; // 0-1
  matchedConcepts: string[];
  matchedSections: string[];
}

export interface SemanticConfig {
  embeddingModel: 'local' | 'openai' | 'huggingface';
  minConceptFrequency: number;
  similarityThreshold: number;
  maxConcepts: number;
  enableEmbeddings: boolean;
}

export class SemanticAnalyzer {
  private config: SemanticConfig;
  private conceptCache: Map<string, ConceptEntity[]> = new Map();
  private embeddingCache: Map<string, number[]> = new Map();

  // Academic vocabulary for detection
  private academicTerms = new Set([
    'hypothesis', 'methodology', 'analysis', 'framework', 'paradigm',
    'empirical', 'theoretical', 'quantitative', 'qualitative', 'correlation',
    'causation', 'variable', 'dependent', 'independent', 'significant',
    'statistical', 'longitudinal', 'cross-sectional', 'validity', 'reliability',
    'construct', 'operationalize', 'sample', 'population', 'generalize'
  ]);

  // Transition words for coherence analysis
  private transitionWords = {
    addition: ['furthermore', 'moreover', 'additionally', 'also', 'besides'],
    contrast: ['however', 'nevertheless', 'nonetheless', 'although', 'whereas'],
    cause: ['therefore', 'consequently', 'thus', 'hence', 'accordingly'],
    example: ['for example', 'for instance', 'specifically', 'namely'],
    conclusion: ['in conclusion', 'finally', 'in summary', 'to summarize']
  };

  constructor(config?: Partial<SemanticConfig>) {
    this.config = {
      embeddingModel: 'local',
      minConceptFrequency: 2,
      similarityThreshold: 0.7,
      maxConcepts: 50,
      enableEmbeddings: false,
      ...config
    };
  }

  /**
   * Perform full semantic analysis on text
   */
  async analyze(
    documentId: string,
    content: string,
    section?: string
  ): Promise<SemanticAnalysisResult> {
    const concepts = this.extractConcepts(content);
    const arguments_ = this.analyzeArguments(content);
    const sentiment = this.analyzeSentiment(content);
    const coherence = this.analyzeCoherence(content);
    const relationships = this.findRelationships(concepts, content);
    const summary = this.generateSummary(content, concepts, arguments_);

    let embedding: number[] | undefined;
    if (this.config.enableEmbeddings) {
      embedding = await this.generateEmbedding(content);
    }

    // Cache concepts for later use
    this.conceptCache.set(documentId, concepts);

    return {
      id: `sem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      documentId,
      timestamp: new Date(),
      embedding,
      concepts,
      arguments: arguments_,
      sentiment,
      coherence,
      relationships,
      summary
    };
  }

  /**
   * Extract key concepts from text
   */
  extractConcepts(content: string): ConceptEntity[] {
    const concepts: Map<string, ConceptEntity> = new Map();
    const words = content.toLowerCase().split(/\s+/);
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [];

    // Extract n-grams (1-3 words)
    for (let n = 1; n <= 3; n++) {
      for (let i = 0; i <= words.length - n; i++) {
        const ngram = words.slice(i, i + n).join(' ');
        const cleanNgram = ngram.replace(/[^a-z\s-]/g, '').trim();

        if (cleanNgram.length < 3) continue;

        // Check if it's a meaningful term
        if (this.isMeaningfulTerm(cleanNgram)) {
          const existing = concepts.get(cleanNgram);
          if (existing) {
            existing.frequency++;
            existing.positions.push(i);
          } else {
            concepts.set(cleanNgram, {
              id: `concept_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
              term: cleanNgram,
              type: this.classifyConceptType(cleanNgram, content),
              frequency: 1,
              importance: 0,
              positions: [i],
              relatedTerms: []
            });
          }
        }
      }
    }

    // Calculate importance scores
    const conceptList = Array.from(concepts.values())
      .filter(c => c.frequency >= this.config.minConceptFrequency);

    const maxFreq = Math.max(...conceptList.map(c => c.frequency), 1);
    conceptList.forEach(concept => {
      // TF-IDF-like importance
      concept.importance = (concept.frequency / maxFreq) *
        (this.academicTerms.has(concept.term) ? 1.5 : 1);
      concept.importance = Math.min(1, concept.importance);

      // Find related terms
      concept.relatedTerms = this.findRelatedTerms(concept.term, conceptList);
    });

    return conceptList
      .sort((a, b) => b.importance - a.importance)
      .slice(0, this.config.maxConcepts);
  }

  /**
   * Check if term is meaningful
   */
  private isMeaningfulTerm(term: string): boolean {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
      'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
      'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'this',
      'that', 'these', 'those', 'it', 'its', 'they', 'their', 'them'
    ]);

    const words = term.split(' ');
    if (words.every(w => stopWords.has(w))) return false;
    if (term.length < 3) return false;

    return true;
  }

  /**
   * Classify concept type
   */
  private classifyConceptType(term: string, content: string): ConceptType {
    // Check for methodology terms
    const methodologyTerms = ['method', 'approach', 'technique', 'procedure', 'design', 'analysis'];
    if (methodologyTerms.some(m => term.includes(m))) return 'methodology';

    // Check for theory terms
    const theoryTerms = ['theory', 'model', 'framework', 'paradigm', 'concept'];
    if (theoryTerms.some(t => term.includes(t))) return 'theory';

    // Check for variable terms
    const variableTerms = ['variable', 'factor', 'indicator', 'measure'];
    if (variableTerms.some(v => term.includes(v))) return 'variable';

    // Check for acronyms (all caps, 2-5 letters)
    if (/^[A-Z]{2,5}$/.test(term)) return 'acronym';

    // Check if it's a technical/academic term
    if (this.academicTerms.has(term)) return 'technical-term';

    // Check for findings context
    const findingsContext = new RegExp(`(found|showed|revealed|demonstrated).*${term}`, 'i');
    if (findingsContext.test(content)) return 'finding';

    return 'key-term';
  }

  /**
   * Find related terms for a concept
   */
  private findRelatedTerms(term: string, allConcepts: ConceptEntity[]): string[] {
    const related: string[] = [];
    const termWords = new Set(term.split(' '));

    for (const concept of allConcepts) {
      if (concept.term === term) continue;

      const conceptWords = new Set(concept.term.split(' '));
      const overlap = [...termWords].filter(w => conceptWords.has(w)).length;

      if (overlap > 0 || this.areSemanticallySimilar(term, concept.term)) {
        related.push(concept.term);
      }
    }

    return related.slice(0, 5);
  }

  /**
   * Check if terms are semantically similar
   */
  private areSemanticallySimilar(term1: string, term2: string): boolean {
    // Simple synonym checking
    const synonymGroups = [
      ['study', 'research', 'investigation', 'analysis'],
      ['method', 'approach', 'technique', 'procedure'],
      ['result', 'finding', 'outcome', 'conclusion'],
      ['significant', 'important', 'notable', 'substantial'],
      ['increase', 'rise', 'growth', 'improvement'],
      ['decrease', 'decline', 'reduction', 'drop']
    ];

    for (const group of synonymGroups) {
      if (group.includes(term1) && group.includes(term2)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Analyze argument structure
   */
  analyzeArguments(content: string): ArgumentStructure[] {
    const arguments_: ArgumentStructure[] = [];
    const paragraphs = content.split(/\n\n+/);

    // Look for thesis statements (often in first/last paragraph)
    const firstPara = paragraphs[0] || '';
    const thesisMatch = this.findThesisStatement(firstPara);
    if (thesisMatch) {
      arguments_.push({
        id: `arg_thesis_${Date.now()}`,
        type: 'thesis',
        claim: thesisMatch,
        evidence: [],
        strength: 0.8,
        position: { startOffset: 0, endOffset: thesisMatch.length, paragraph: 0 }
      });
    }

    // Analyze each paragraph for arguments
    paragraphs.forEach((para, index) => {
      const argument = this.extractArgumentFromParagraph(para, index);
      if (argument) {
        arguments_.push(argument);
      }
    });

    // Look for conclusion
    const lastPara = paragraphs[paragraphs.length - 1] || '';
    const conclusionMatch = this.findConclusion(lastPara);
    if (conclusionMatch) {
      arguments_.push({
        id: `arg_conclusion_${Date.now()}`,
        type: 'conclusion',
        claim: conclusionMatch,
        evidence: [],
        strength: 0.7,
        position: {
          startOffset: content.length - lastPara.length,
          endOffset: content.length,
          paragraph: paragraphs.length - 1
        }
      });
    }

    return arguments_;
  }

  /**
   * Find thesis statement
   */
  private findThesisStatement(text: string): string | null {
    const thesisIndicators = [
      /this (?:study|research|paper|thesis) (?:aims|seeks|attempts|examines|investigates|explores) (.+?)[.]/i,
      /the purpose of this (?:study|research) is (.+?)[.]/i,
      /this (?:paper|thesis) argues that (.+?)[.]/i,
      /the main argument is that (.+?)[.]/i
    ];

    for (const pattern of thesisIndicators) {
      const match = text.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return null;
  }

  /**
   * Extract argument from paragraph
   */
  private extractArgumentFromParagraph(para: string, index: number): ArgumentStructure | null {
    const sentences = para.match(/[^.!?]+[.!?]+/g) || [];
    if (sentences.length < 2) return null;

    // First sentence is often the claim
    const firstSentence = sentences[0];
    if (!firstSentence) return null;
    const claim = firstSentence.trim();

    // Look for evidence
    const evidence: EvidenceItem[] = [];

    sentences.slice(1).forEach(sentence => {
      // Citation evidence
      if (/\([A-Z][a-z]+.*\d{4}\)/.test(sentence)) {
        evidence.push({
          type: 'citation',
          content: sentence.trim(),
          strength: 0.8
        });
      }
      // Data/statistics evidence
      else if (/\d+%|\d+\.\d+|significant|p\s*[<>=]/.test(sentence)) {
        evidence.push({
          type: 'data',
          content: sentence.trim(),
          strength: 0.9
        });
      }
      // Example evidence
      else if (/for example|for instance|such as|including/i.test(sentence)) {
        evidence.push({
          type: 'example',
          content: sentence.trim(),
          strength: 0.6
        });
      }
    });

    if (evidence.length === 0) return null;

    // Determine argument type
    let type: ArgumentType = 'supporting-argument';
    if (/however|although|despite|contrary|conversely/i.test(claim)) {
      type = 'counter-argument';
    }

    const strength = Math.min(1, 0.5 + (evidence.length * 0.15));

    return {
      id: `arg_${Date.now()}_${index}`,
      type,
      claim,
      evidence,
      strength,
      position: { startOffset: 0, endOffset: para.length, paragraph: index }
    };
  }

  /**
   * Find conclusion statement
   */
  private findConclusion(text: string): string | null {
    const conclusionIndicators = [
      /in conclusion,?\s*(.+?)[.]/i,
      /to summarize,?\s*(.+?)[.]/i,
      /in summary,?\s*(.+?)[.]/i,
      /this (?:study|research) (?:concludes|demonstrates|shows) that (.+?)[.]/i,
      /the findings (?:suggest|indicate|reveal) that (.+?)[.]/i
    ];

    for (const pattern of conclusionIndicators) {
      const match = text.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return null;
  }

  /**
   * Analyze sentiment and tone
   */
  analyzeSentiment(content: string): SentimentAnalysis {
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [];

    // Positive/negative word lists for academic context
    const positiveWords = new Set([
      'significant', 'effective', 'successful', 'improved', 'enhanced',
      'beneficial', 'positive', 'strong', 'robust', 'reliable', 'valid',
      'innovative', 'novel', 'important', 'substantial', 'notable'
    ]);

    const negativeWords = new Set([
      'insignificant', 'ineffective', 'failed', 'declined', 'decreased',
      'negative', 'weak', 'limited', 'problematic', 'insufficient',
      'unreliable', 'invalid', 'biased', 'flawed', 'contradictory'
    ]);

    const hedgingWords = new Set([
      'may', 'might', 'could', 'possibly', 'perhaps', 'suggests',
      'indicates', 'appears', 'seems', 'likely', 'potentially'
    ]);

    let positive = 0;
    let negative = 0;
    let neutral = 0;
    let hedging = 0;
    let totalWords = 0;

    const words = content.toLowerCase().split(/\s+/);
    totalWords = words.length;

    words.forEach(word => {
      const clean = word.replace(/[^a-z]/g, '');
      if (positiveWords.has(clean)) positive++;
      else if (negativeWords.has(clean)) negative++;
      else neutral++;

      if (hedgingWords.has(clean)) hedging++;
    });

    const total = positive + negative + neutral;
    const compound = total > 0 ? (positive - negative) / total : 0;

    // Calculate objectivity (hedging and lack of strong sentiment = more objective)
    const objectivity = Math.min(1, 0.5 + (hedging / totalWords) * 10 - Math.abs(compound) * 0.5);

    // Calculate academic tone
    const academicWordCount = words.filter(w =>
      this.academicTerms.has(w.replace(/[^a-z]/g, ''))
    ).length;
    const academicTone = Math.min(1, academicWordCount / (totalWords / 50));

    return {
      overall: {
        positive: positive / total,
        negative: negative / total,
        neutral: neutral / total,
        compound
      },
      bySection: {},
      confidence: 0.75,
      objectivity,
      academicTone
    };
  }

  /**
   * Analyze text coherence
   */
  analyzeCoherence(content: string): CoherenceAnalysis {
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim());
    const issues: CoherenceIssue[] = [];

    let transitionScore = 0;
    let topicScore = 0;
    let flowScore = 0;

    // Check transitions between paragraphs
    for (let i = 1; i < paragraphs.length; i++) {
      const prevPara = paragraphs[i - 1];
      const currPara = paragraphs[i];

      // Check for transition words at start
      const hasTransition = Object.values(this.transitionWords)
        .flat()
        .some(word => currPara.toLowerCase().startsWith(word));

      if (hasTransition) {
        transitionScore += 1;
      } else {
        // Check if there's topic continuity
        const prevWords = new Set(prevPara.toLowerCase().split(/\s+/).filter(w => w.length > 4));
        const currWords = currPara.toLowerCase().split(/\s+/).filter(w => w.length > 4);
        const overlap = currWords.filter(w => prevWords.has(w)).length;

        if (overlap < 2) {
          issues.push({
            type: 'missing-transition',
            location: { startOffset: 0, endOffset: 0, paragraph: i },
            description: `Paragraph ${i + 1} may need a transition from the previous paragraph`,
            suggestion: 'Add a transitional phrase to connect ideas',
            severity: 'medium'
          });
        } else {
          topicScore += 0.5;
        }
      }
    }

    // Check for topic consistency within paragraphs
    paragraphs.forEach((para, index) => {
      const sentences = para.match(/[^.!?]+[.!?]+/g) || [];
      const firstSentence = sentences[0];
      if (sentences.length > 1 && firstSentence) {
        const firstSentenceWords = new Set(
          firstSentence.toLowerCase().split(/\s+/).filter(w => w.length > 4)
        );

        let consistent = 0;
        sentences.slice(1).forEach(sentence => {
          const words = sentence.toLowerCase().split(/\s+/).filter(w => w.length > 4);
          if (words.some(w => firstSentenceWords.has(w))) {
            consistent++;
          }
        });

        topicScore += consistent / sentences.length;
      }
    });

    // Normalize scores
    const numParagraphs = Math.max(paragraphs.length - 1, 1);
    transitionScore = (transitionScore / numParagraphs) * 100;
    topicScore = (topicScore / paragraphs.length) * 100;
    flowScore = (transitionScore + topicScore) / 2;

    const overallScore = Math.round((transitionScore + topicScore + flowScore) / 3);

    return {
      overallScore,
      topicConsistency: Math.round(topicScore),
      logicalFlow: Math.round(flowScore),
      transitionQuality: Math.round(transitionScore),
      issues
    };
  }

  /**
   * Find relationships between concepts
   */
  findRelationships(concepts: ConceptEntity[], content: string): ConceptRelationship[] {
    const relationships: ConceptRelationship[] = [];
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [];

    // Relationship patterns
    const patterns: Array<{ regex: RegExp; type: RelationshipType }> = [
      { regex: /(\w+)\s+(?:causes?|leads?\s+to|results?\s+in)\s+(\w+)/gi, type: 'causes' },
      { regex: /(\w+)\s+(?:correlates?\s+with|is\s+associated\s+with)\s+(\w+)/gi, type: 'correlates' },
      { regex: /(\w+)\s+(?:includes?|comprises?|consists?\s+of)\s+(\w+)/gi, type: 'includes' },
      { regex: /(\w+)\s+(?:contradicts?|opposes?|conflicts?\s+with)\s+(\w+)/gi, type: 'contradicts' },
      { regex: /(\w+)\s+(?:supports?|reinforces?|validates?)\s+(\w+)/gi, type: 'supports' },
      { regex: /(\w+)\s+(?:is\s+defined\s+as|refers?\s+to|means?)\s+(\w+)/gi, type: 'defines' }
    ];

    const conceptTerms = new Set(concepts.map(c => c.term.toLowerCase()));

    sentences.forEach(sentence => {
      patterns.forEach(({ regex, type }) => {
        let match;
        while ((match = regex.exec(sentence)) !== null) {
          const source = match[1].toLowerCase();
          const target = match[2].toLowerCase();

          // Only add if both terms are in our concepts
          if (conceptTerms.has(source) || conceptTerms.has(target)) {
            relationships.push({
              source,
              target,
              type,
              strength: 0.7,
              context: sentence.trim()
            });
          }
        }
      });
    });

    // Add co-occurrence relationships
    for (let i = 0; i < concepts.length; i++) {
      for (let j = i + 1; j < concepts.length; j++) {
        const c1 = concepts[i];
        const c2 = concepts[j];

        // Check if they appear in the same sentence
        const coOccur = sentences.some(s => {
          const lower = s.toLowerCase();
          return lower.includes(c1.term) && lower.includes(c2.term);
        });

        if (coOccur && !relationships.some(r =>
          (r.source === c1.term && r.target === c2.term) ||
          (r.source === c2.term && r.target === c1.term)
        )) {
          relationships.push({
            source: c1.term,
            target: c2.term,
            type: 'correlates',
            strength: 0.5
          });
        }
      }
    }

    return relationships.slice(0, 30);
  }

  /**
   * Generate semantic summary
   */
  generateSummary(
    content: string,
    concepts: ConceptEntity[],
    arguments_: ArgumentStructure[]
  ): SemanticSummary {
    // Main topics from top concepts
    const mainTopics = concepts
      .filter(c => c.importance > 0.5)
      .slice(0, 5)
      .map(c => c.term);

    // Key findings from arguments with data evidence
    const keyFindings = arguments_
      .filter(a => a.evidence.some(e => e.type === 'data' || e.type === 'citation'))
      .map(a => a.claim)
      .slice(0, 3);

    // Methodology from methodology concepts
    const methodologyUsed = concepts
      .filter(c => c.type === 'methodology')
      .map(c => c.term);

    // Research gaps (look for gap-related phrases)
    const gapPatterns = [
      /(?:gap|lack|limited|insufficient|need for|future research)/gi
    ];
    const researchGaps: string[] = [];
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [];
    sentences.forEach(s => {
      if (gapPatterns.some(p => p.test(s))) {
        researchGaps.push(s.trim());
      }
    });

    // Contributions (look for contribution phrases)
    const contributions: string[] = [];
    const contributionPatterns = [
      /(?:this study contributes|contribution|novel|new approach|first to)/gi
    ];
    sentences.forEach(s => {
      if (contributionPatterns.some(p => p.test(s))) {
        contributions.push(s.trim());
      }
    });

    return {
      mainTopics,
      keyFindings,
      methodologyUsed,
      researchGaps: researchGaps.slice(0, 3),
      contributions: contributions.slice(0, 3)
    };
  }

  /**
   * Generate text embedding (simplified local version)
   */
  async generateEmbedding(text: string): Promise<number[]> {
    // Check cache first
    const cacheKey = text.substring(0, 100);
    const cached = this.embeddingCache.get(cacheKey);
    if (cached) return cached;

    // Simple bag-of-words embedding for local use
    // In production, this would call OpenAI or HuggingFace
    const words = text.toLowerCase().split(/\s+/);
    const vocabulary = [...this.academicTerms];
    const embedding = new Array(vocabulary.length).fill(0);

    words.forEach(word => {
      const index = vocabulary.indexOf(word);
      if (index !== -1) {
        embedding[index]++;
      }
    });

    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    const normalized = magnitude > 0
      ? embedding.map(val => val / magnitude)
      : embedding;

    // Cache result
    this.embeddingCache.set(cacheKey, normalized);

    return normalized;
  }

  /**
   * Calculate similarity between two texts
   */
  async calculateSimilarity(text1: string, text2: string): Promise<number> {
    const emb1 = await this.generateEmbedding(text1);
    const emb2 = await this.generateEmbedding(text2);

    // Cosine similarity
    let dotProduct = 0;
    let mag1 = 0;
    let mag2 = 0;

    for (let i = 0; i < emb1.length; i++) {
      dotProduct += emb1[i] * emb2[i];
      mag1 += emb1[i] * emb1[i];
      mag2 += emb2[i] * emb2[i];
    }

    const magnitude = Math.sqrt(mag1) * Math.sqrt(mag2);
    return magnitude > 0 ? dotProduct / magnitude : 0;
  }

  /**
   * Find similar documents
   */
  async findSimilar(
    content: string,
    documents: Array<{ id: string; content: string }>
  ): Promise<SimilarityResult[]> {
    const results: SimilarityResult[] = [];
    const sourceConcepts = this.extractConcepts(content);
    const sourceTerms = new Set(sourceConcepts.map(c => c.term));

    for (const doc of documents) {
      const similarity = await this.calculateSimilarity(content, doc.content);

      if (similarity >= this.config.similarityThreshold) {
        const docConcepts = this.extractConcepts(doc.content);
        const matchedConcepts = docConcepts
          .filter(c => sourceTerms.has(c.term))
          .map(c => c.term);

        results.push({
          documentId: doc.id,
          score: similarity,
          matchedConcepts,
          matchedSections: []
        });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Get cached concepts for a document
   */
  getCachedConcepts(documentId: string): ConceptEntity[] | undefined {
    return this.conceptCache.get(documentId);
  }

  /**
   * Clear caches
   */
  clearCache(): void {
    this.conceptCache.clear();
    this.embeddingCache.clear();
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<SemanticConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Singleton instance
export const semanticAnalyzer = new SemanticAnalyzer();
