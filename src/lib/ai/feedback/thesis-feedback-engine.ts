// src/lib/ai/feedback/thesis-feedback-engine.ts

export interface ThesisSubmission {
  userId: string;
  documentId: string;
  title: string;
  content: string;
  section: string;
  wordCount: number;
  submissionDate: Date;
  version: number;
}

export interface AnalysisCriteria {
  checkGrammar?: boolean;
  checkStructure?: boolean;
  checkClarity?: boolean;
  checkCitations?: boolean;
  checkArgumentation?: boolean;
  academicLevel?: 'undergraduate' | 'graduate' | 'doctoral';
}

export interface FeedbackSuggestion {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestions: string[];
  startIndex?: number;
  endIndex?: number;
}

export interface FeedbackCategory {
  id: string;
  name: string;
  description: string;
}

export interface ThesisFeedback {
  overallScore: number;
  overallFeedback: string;
  strengths: string[];
  suggestions: FeedbackSuggestion[];
  categories: FeedbackCategory[];
  recommendations: string[];
  generatedAt: Date;
}

// Analysis patterns for common thesis issues
const ANALYSIS_PATTERNS = {
  passiveVoice: /\b(is|are|was|were|been|being|be)\s+\w+ed\b/gi,
  longSentences: /[^.!?]*[.!?]/g,
  vagueWords: /\b(things?|stuff|very|really|quite|somewhat|basically|actually|definitely|certainly)\b/gi,
  firstPerson: /\b(I|me|my|mine|we|us|our|ours)\b/g,
  informalLanguage: /\b(gonna|wanna|kinda|sorta|gotta|ain't|can't|won't|don't|isn't|aren't|wasn't|weren't)\b/gi,
  repetitiveStarts: /^(The|This|It|There|These|Those)\s/gm,
  missingCitations: /\b(studies show|research indicates|experts say|according to|it is known that|many believe)\b/gi,
  weakVerbs: /\b(is|are|was|were|has|have|had|do|does|did|make|makes|made|get|gets|got)\b/gi,
};

// Feedback categories
const CATEGORIES: FeedbackCategory[] = [
  {
    id: 'structure',
    name: 'Structure & Organization',
    description: 'Analysis of document structure, flow, and logical organization',
  },
  {
    id: 'clarity',
    name: 'Clarity & Readability',
    description: 'Assessment of writing clarity, sentence structure, and readability',
  },
  {
    id: 'academic_tone',
    name: 'Academic Tone',
    description: 'Evaluation of formal academic writing conventions and tone',
  },
  {
    id: 'argumentation',
    name: 'Argumentation & Evidence',
    description: 'Analysis of argument strength, evidence support, and logical reasoning',
  },
  {
    id: 'citations',
    name: 'Citations & References',
    description: 'Review of citation practices and reference accuracy',
  },
];

class ThesisFeedbackEngine {
  private generateId(): string {
    return `fb_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private analyzePassiveVoice(content: string): FeedbackSuggestion[] {
    const suggestions: FeedbackSuggestion[] = [];
    const matches = content.match(ANALYSIS_PATTERNS.passiveVoice) || [];

    if (matches.length > 5) {
      suggestions.push({
        id: this.generateId(),
        title: 'Excessive Passive Voice Usage',
        description: `Found ${matches.length} instances of passive voice. Academic writing benefits from active voice for clarity and directness.`,
        category: 'clarity',
        severity: matches.length > 15 ? 'high' : 'medium',
        suggestions: [
          'Convert passive constructions to active voice where appropriate',
          'Use "The researchers found..." instead of "It was found by researchers..."',
          'Keep passive voice only when the actor is unknown or unimportant',
        ],
      });
    }

    return suggestions;
  }

  private analyzeSentenceLength(content: string): FeedbackSuggestion[] {
    const suggestions: FeedbackSuggestion[] = [];
    const sentences = content.match(ANALYSIS_PATTERNS.longSentences) || [];
    const longSentences = sentences.filter(s => s.split(/\s+/).length > 35);

    if (longSentences.length > 3) {
      suggestions.push({
        id: this.generateId(),
        title: 'Long Sentences Detected',
        description: `Found ${longSentences.length} sentences with more than 35 words. Long sentences can reduce readability.`,
        category: 'clarity',
        severity: longSentences.length > 8 ? 'high' : 'medium',
        suggestions: [
          'Break complex sentences into shorter, focused statements',
          'Use bullet points or lists for complex information',
          'Aim for an average sentence length of 15-25 words',
        ],
      });
    }

    return suggestions;
  }

  private analyzeVagueLanguage(content: string): FeedbackSuggestion[] {
    const suggestions: FeedbackSuggestion[] = [];
    const matches = content.match(ANALYSIS_PATTERNS.vagueWords) || [];

    if (matches.length > 10) {
      suggestions.push({
        id: this.generateId(),
        title: 'Vague or Imprecise Language',
        description: `Found ${matches.length} instances of vague language. Academic writing requires precise terminology.`,
        category: 'academic_tone',
        severity: matches.length > 20 ? 'high' : 'medium',
        suggestions: [
          'Replace "very" with specific quantifiers or stronger adjectives',
          'Use precise academic terminology',
          'Provide specific examples instead of generalizations',
        ],
      });
    }

    return suggestions;
  }

  private analyzeAcademicTone(content: string): FeedbackSuggestion[] {
    const suggestions: FeedbackSuggestion[] = [];

    // Check first person usage
    const firstPersonMatches = content.match(ANALYSIS_PATTERNS.firstPerson) || [];
    if (firstPersonMatches.length > 15) {
      suggestions.push({
        id: this.generateId(),
        title: 'First Person Overuse',
        description: `Found ${firstPersonMatches.length} first-person references. Consider reducing for more objective tone.`,
        category: 'academic_tone',
        severity: 'low',
        suggestions: [
          'Use third person for objective statements',
          'First person is acceptable when describing your methodology',
          'Consider "This study demonstrates..." instead of "I found..."',
        ],
      });
    }

    // Check informal language
    const informalMatches = content.match(ANALYSIS_PATTERNS.informalLanguage) || [];
    if (informalMatches.length > 0) {
      suggestions.push({
        id: this.generateId(),
        title: 'Informal Language Detected',
        description: `Found ${informalMatches.length} instances of informal contractions or language.`,
        category: 'academic_tone',
        severity: informalMatches.length > 5 ? 'high' : 'medium',
        suggestions: [
          'Expand contractions (use "cannot" instead of "can\'t")',
          'Replace colloquial expressions with formal alternatives',
          'Maintain consistent academic register throughout',
        ],
      });
    }

    return suggestions;
  }

  private analyzeCitations(content: string): FeedbackSuggestion[] {
    const suggestions: FeedbackSuggestion[] = [];
    const matches = content.match(ANALYSIS_PATTERNS.missingCitations) || [];

    if (matches.length > 0) {
      suggestions.push({
        id: this.generateId(),
        title: 'Potential Missing Citations',
        description: `Found ${matches.length} claims that may require citations to support them.`,
        category: 'citations',
        severity: matches.length > 5 ? 'critical' : 'high',
        suggestions: [
          'Add specific citations for claims about research findings',
          'Avoid unattributed generalizations',
          'Use primary sources where possible',
          'Ensure all cited works appear in the reference list',
        ],
      });
    }

    return suggestions;
  }

  private analyzeStructure(content: string): FeedbackSuggestion[] {
    const suggestions: FeedbackSuggestion[] = [];
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);

    // Check paragraph length
    const shortParagraphs = paragraphs.filter(p => p.split(/\s+/).length < 40);
    const longParagraphs = paragraphs.filter(p => p.split(/\s+/).length > 200);

    if (shortParagraphs.length > paragraphs.length * 0.5 && paragraphs.length > 3) {
      suggestions.push({
        id: this.generateId(),
        title: 'Underdeveloped Paragraphs',
        description: 'Many paragraphs appear too short. Well-developed paragraphs typically contain 100-200 words.',
        category: 'structure',
        severity: 'medium',
        suggestions: [
          'Expand paragraphs with supporting evidence and analysis',
          'Ensure each paragraph develops a single main idea fully',
          'Add transitional sentences to connect ideas',
        ],
      });
    }

    if (longParagraphs.length > 2) {
      suggestions.push({
        id: this.generateId(),
        title: 'Overly Long Paragraphs',
        description: `Found ${longParagraphs.length} paragraphs exceeding 200 words. Consider breaking them up.`,
        category: 'structure',
        severity: 'medium',
        suggestions: [
          'Break long paragraphs at natural topic shifts',
          'Use one main idea per paragraph',
          'Create new paragraphs when introducing new evidence',
        ],
      });
    }

    // Check repetitive paragraph starts
    const paragraphStarts = paragraphs.map(p => p.trim().split(/\s+/)[0]);
    const startCounts: Record<string, number> = {};
    paragraphStarts.forEach(start => {
      startCounts[start] = (startCounts[start] || 0) + 1;
    });

    const repetitiveStarts = Object.entries(startCounts)
      .filter(([_, count]) => count > 3)
      .map(([word]) => word);

    if (repetitiveStarts.length > 0) {
      suggestions.push({
        id: this.generateId(),
        title: 'Repetitive Paragraph Openings',
        description: `Multiple paragraphs begin with the same word(s): ${repetitiveStarts.join(', ')}`,
        category: 'structure',
        severity: 'low',
        suggestions: [
          'Vary sentence and paragraph openings',
          'Use transitional phrases to connect paragraphs',
          'Start with different parts of speech',
        ],
      });
    }

    return suggestions;
  }

  private identifyStrengths(content: string, wordCount: number): string[] {
    const strengths: string[] = [];
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
    const sentences = content.match(ANALYSIS_PATTERNS.longSentences) || [];

    // Check for good length
    if (wordCount >= 500) {
      strengths.push('Substantial content length appropriate for academic analysis');
    }

    // Check paragraph structure
    if (paragraphs.length >= 3) {
      strengths.push('Good paragraph organization with multiple distinct sections');
    }

    // Check sentence variety
    const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
    const avgLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
    if (avgLength >= 12 && avgLength <= 25) {
      strengths.push('Good sentence length variety enhances readability');
    }

    // Check for academic language
    const academicTerms = content.match(/\b(analysis|methodology|hypothesis|theoretical|empirical|significant|correlation|findings|conclusion|evidence|framework)\b/gi) || [];
    if (academicTerms.length >= 5) {
      strengths.push('Appropriate use of academic vocabulary and terminology');
    }

    // Check for transitions
    const transitions = content.match(/\b(however|therefore|furthermore|moreover|consequently|additionally|nevertheless|thus|hence)\b/gi) || [];
    if (transitions.length >= 3) {
      strengths.push('Effective use of transitional words and phrases');
    }

    // Check for hedging language (appropriate in academic writing)
    const hedging = content.match(/\b(may|might|could|suggests|indicates|appears|seems|possibly|potentially)\b/gi) || [];
    if (hedging.length >= 3 && hedging.length <= 15) {
      strengths.push('Appropriate use of hedging language for academic caution');
    }

    // Check for clear structure markers
    const structureMarkers = content.match(/\b(firstly|secondly|finally|in conclusion|to summarize|in summary)\b/gi) || [];
    if (structureMarkers.length >= 2) {
      strengths.push('Clear structural markers guide the reader effectively');
    }

    return strengths;
  }

  private generateRecommendations(suggestions: FeedbackSuggestion[]): string[] {
    const recommendations: string[] = [];
    const categories = new Set(suggestions.map(s => s.category));

    if (categories.has('clarity')) {
      recommendations.push('Review and revise sentences for clarity. Read your work aloud to identify awkward phrasing.');
    }

    if (categories.has('academic_tone')) {
      recommendations.push('Ensure consistent academic tone throughout. Remove colloquialisms and contractions.');
    }

    if (categories.has('citations')) {
      recommendations.push('Strengthen your evidence base by adding citations for all claims and statistics.');
    }

    if (categories.has('structure')) {
      recommendations.push('Review paragraph structure. Ensure each paragraph has a clear topic sentence and supporting details.');
    }

    if (categories.has('argumentation')) {
      recommendations.push('Strengthen your argument by anticipating and addressing counterarguments.');
    }

    // Add general recommendations
    if (suggestions.filter(s => s.severity === 'critical' || s.severity === 'high').length > 3) {
      recommendations.push('Consider a comprehensive revision focusing on the high-priority issues identified above.');
    }

    recommendations.push('Have a peer or advisor review your work for additional feedback before final submission.');

    return recommendations;
  }

  private calculateOverallScore(suggestions: FeedbackSuggestion[], strengths: string[]): number {
    let score = 75; // Base score

    // Deduct points for issues
    suggestions.forEach(suggestion => {
      switch (suggestion.severity) {
        case 'critical':
          score -= 8;
          break;
        case 'high':
          score -= 5;
          break;
        case 'medium':
          score -= 3;
          break;
        case 'low':
          score -= 1;
          break;
      }
    });

    // Add points for strengths
    score += strengths.length * 3;

    // Clamp score between 0 and 100
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private generateOverallFeedback(score: number, suggestions: FeedbackSuggestion[], strengths: string[]): string {
    const criticalCount = suggestions.filter(s => s.severity === 'critical').length;
    const highCount = suggestions.filter(s => s.severity === 'high').length;

    if (score >= 85) {
      return 'Excellent work! Your thesis section demonstrates strong academic writing with clear organization and appropriate scholarly tone. Minor refinements will further enhance the quality.';
    } else if (score >= 70) {
      return 'Good foundation with room for improvement. The content shows solid understanding of the subject matter. Focus on addressing the identified issues to strengthen your argument and presentation.';
    } else if (score >= 55) {
      return 'The section needs significant revision. While the core ideas are present, there are notable issues with structure, clarity, or academic conventions that should be addressed before submission.';
    } else {
      return `This section requires substantial revision. ${criticalCount > 0 ? `There are ${criticalCount} critical issues that must be addressed. ` : ''}${highCount > 0 ? `Additionally, ${highCount} high-priority concerns need attention. ` : ''}Consider consulting with your advisor for guidance on improving this section.`;
    }
  }

  async generateFeedback(submission: ThesisSubmission, criteria?: AnalysisCriteria): Promise<ThesisFeedback> {
    const { content, wordCount } = submission;

    // Run all analyses
    const allSuggestions: FeedbackSuggestion[] = [];

    // Always run basic analyses
    allSuggestions.push(...this.analyzePassiveVoice(content));
    allSuggestions.push(...this.analyzeSentenceLength(content));
    allSuggestions.push(...this.analyzeVagueLanguage(content));
    allSuggestions.push(...this.analyzeAcademicTone(content));
    allSuggestions.push(...this.analyzeCitations(content));
    allSuggestions.push(...this.analyzeStructure(content));

    // Apply criteria filters if provided
    let filteredSuggestions = allSuggestions;
    if (criteria) {
      filteredSuggestions = allSuggestions.filter(suggestion => {
        if (criteria.checkGrammar === false && suggestion.category === 'clarity') return false;
        if (criteria.checkStructure === false && suggestion.category === 'structure') return false;
        if (criteria.checkClarity === false && suggestion.category === 'clarity') return false;
        if (criteria.checkCitations === false && suggestion.category === 'citations') return false;
        if (criteria.checkArgumentation === false && suggestion.category === 'argumentation') return false;
        return true;
      });
    }

    // Identify strengths
    const strengths = this.identifyStrengths(content, wordCount);

    // Generate recommendations
    const recommendations = this.generateRecommendations(filteredSuggestions);

    // Calculate score
    const overallScore = this.calculateOverallScore(filteredSuggestions, strengths);

    // Generate overall feedback
    const overallFeedback = this.generateOverallFeedback(overallScore, filteredSuggestions, strengths);

    return {
      overallScore,
      overallFeedback,
      strengths,
      suggestions: filteredSuggestions,
      categories: CATEGORIES,
      recommendations,
      generatedAt: new Date(),
    };
  }
}

// Export singleton instance
export const thesisFeedbackEngine = new ThesisFeedbackEngine();
