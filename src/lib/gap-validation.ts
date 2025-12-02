/**
 * Gap Validation Library
 * Based on @askdocnad guidance: Research gaps must be specific, testable, and clearly articulated
 * Detects vague gap statements and provides actionable improvement suggestions
 */

export type SeverityLevel = 'warning' | 'error' | 'info';
export type IssueType = 'vague' | 'non-testable' | 'unclear' | 'too-broad' | 'missing-context';

export interface ValidationIssue {
  id: string;
  type: IssueType;
  message: string;
  severity: SeverityLevel;
  affectedText?: string;
  suggestedFix?: string;
  example?: string;
}

export interface GapValidationResult {
  isValid: boolean;
  overallScore: number; // 0-100
  scores: {
    specificity: number; // How specific is the gap?
    testability: number; // Is the gap empirically testable?
    clarity: number; // Is the gap clearly articulated?
    evidence: number; // Is the gap grounded in literature?
  };
  issues: ValidationIssue[];
  suggestions: string[];
  strengths: string[];
}

/**
 * Vague patterns that indicate weak gap statements
 * These should trigger warnings for refinement
 */
const VAGUE_PATTERNS = [
  { pattern: /more research (?:is |)needed/i, message: 'Replace with specific research gap', severity: 'error' as const },
  { pattern: /limited (?:knowledge|studies|evidence|research)/i, message: 'Be more specific about what is limited', severity: 'error' as const },
  { pattern: /insufficient/i, message: 'Insufficient data/evidence - be more precise', severity: 'error' as const },
  { pattern: /not (?:well |fully )?understood/i, message: 'Specify what aspects are not understood', severity: 'error' as const },
  { pattern: /poorly (?:defined|explored|studied)/i, message: 'Explain how it is poorly defined', severity: 'warning' as const },
  { pattern: /little (?:is |)known/i, message: 'Specify what exactly is not known', severity: 'error' as const },
  { pattern: /needs (?:further|more) (study|research)/i, message: 'Identify the specific knowledge gap', severity: 'warning' as const },
  { pattern: /unclear|ambiguous|vague/i, message: 'Replace with concrete evidence of the gap', severity: 'error' as const },
];

/**
 * Patterns indicating good gap specificity
 */
const SPECIFIC_PATTERNS = [
  /in (?:the )?philippine|philippine[s]?/i,
  /post-20\d{2}/i,
  /before 20\d{2}/i,
  /(?:rural|urban|coastal|island) communities?/i,
  /higher education|university|college/i,
  /no studies? (?:found|exist|address)/i,
  /only \d+ (?:studies?|papers)/i,
];

/**
 * Testability patterns - gaps must be empirically verifiable
 */
const TESTABILITY_PATTERNS = [
  /hypothesis/i,
  /explore the relationship/i,
  /impact of/i,
  /effect of/i,
  /influence of/i,
  /examine|investigate|study/i,
];

/**
 * Non-testable red flags
 */
const NON_TESTABLE_PATTERNS = [
  /opinion|belief|think|feel/i,
  /should|ought|must/i, // normative, not descriptive
  /why people like|why students prefer/i, // subjective without framework
];

/**
 * Validate a research gap statement
 * Returns structured feedback aligned with @askdocnad guidance
 */
export function validateResearchGap(gapStatement: string): GapValidationResult {
  if (!gapStatement || gapStatement.trim().length === 0) {
    return {
      isValid: false,
      overallScore: 0,
      scores: { specificity: 0, testability: 0, clarity: 0, evidence: 0 },
      issues: [{ id: 'empty', type: 'unclear', message: 'Gap statement is empty', severity: 'error' }],
      suggestions: ['Provide a research gap statement to validate'],
      strengths: [],
    };
  }

  const issues: ValidationIssue[] = [];
  const suggestions: Set<string> = new Set();
  const strengths: string[] = [];

  // Check for vague language
  let vaguenessScore = 100;
  for (const { pattern, message, severity } of VAGUE_PATTERNS) {
    if (pattern.test(gapStatement)) {
      vaguenessScore -= 20;
      issues.push({
        id: `vague-${pattern.source.slice(0, 10)}`,
        type: 'vague',
        message,
        severity,
        affectedText: gapStatement.match(pattern)?.[0],
        suggestedFix: `Replace vague language with specific evidence (e.g., "Only 2 studies on [specific topic] in [specific context]")`,
      });
    }
  }

  // Check specificity (geographic, temporal, population-based)
  let specificityScore = 40; // Default low
  const specificMatches = SPECIFIC_PATTERNS.filter(p => p.test(gapStatement)).length;
  specificityScore += specificMatches * 15; // Boost for each specific element found
  specificityScore = Math.min(100, specificityScore);

  if (specificityScore < 60) {
    suggestions.add('Add geographic scope (e.g., "Philippine context", "rural areas")');
    suggestions.add('Specify temporal scope (e.g., "post-2020", "recent decade")');
    suggestions.add('Identify target population (e.g., "higher education students", "off-grid communities")');
  } else {
    strengths.push('Gap includes specific geographic and/or temporal scope');
  }

  // Check testability
  let testabilityScore = 50;
  const isTestable = TESTABILITY_PATTERNS.some(p => p.test(gapStatement));
  const isNonTestable = NON_TESTABLE_PATTERNS.some(p => p.test(gapStatement));

  if (isTestable) {
    testabilityScore += 40;
    strengths.push('Gap includes empirically testable language');
  } else {
    issues.push({
      id: 'non-testable',
      type: 'non-testable',
      message: 'Gap lacks empirically testable language',
      severity: 'warning',
      suggestedFix: 'Use verbs like "examine", "investigate", "explore the impact of", "determine the relationship between"',
    });
  }

  if (isNonTestable) {
    testabilityScore -= 30;
    issues.push({
      id: 'normative-gap',
      type: 'non-testable',
      message: 'Gap uses normative (should/ought) rather than descriptive language',
      severity: 'error',
      suggestedFix: 'Reframe to describe what is unknown rather than what should be done',
    });
  }
  testabilityScore = Math.max(0, Math.min(100, testabilityScore));

  // Check clarity
  const sentences = gapStatement.split(/[.!?]+/).filter(s => s.trim().length > 0);
  let clarityScore = 100;

  if (sentences.length > 3) {
    clarityScore -= 15;
    suggestions.add('Consider condensing to 1-2 focused sentences following @askdocnad guidance');
    issues.push({
      id: 'clarity-length',
      type: 'unclear',
      message: 'Gap statement is too long (should be 1-2 sentences)',
      severity: 'warning',
      suggestedFix: 'Distill to core gap in 1-2 sentences',
      example: '"Gap: Limited Y in Z region [cite 3 papers]"',
    });
  } else {
    strengths.push('Gap statement is concise (1-2 sentences)');
  }

  // Assess complexity level
  const wordCount = gapStatement.split(/\s+/).length;
  if (wordCount > 100) {
    clarityScore -= 10;
    suggestions.add('Simplify language for better clarity in defense presentation');
  }

  // Check evidence indicators (citations, data points)
  let evidenceScore = 40;
  const hasCitations = /\(\d{4}\)|et al|[A-Z][a-z]+ (?:et al|&)/i.test(gapStatement);
  const hasNumbers = /\d+ (?:studies?|papers?|findings?|evidence)/i.test(gapStatement);

  if (hasCitations) {
    evidenceScore += 30;
    strengths.push('Gap includes literature citations');
  } else {
    suggestions.add('Reference specific studies or data (e.g., "Only 2 studies on X" or cite authors)');
  }

  if (hasNumbers) {
    evidenceScore += 20;
    strengths.push('Gap includes quantified evidence');
  }

  evidenceScore = Math.min(100, evidenceScore);

  if (evidenceScore < 70) {
    issues.push({
      id: 'weak-evidence',
      type: 'missing-context',
      message: 'Gap lacks evidence grounding (citations or data)',
      severity: 'warning',
      suggestedFix: 'Add specific citation counts, author names, or data points from your literature review',
    });
  }

  // Calculate overall score
  const overallScore = Math.round((specificityScore + testabilityScore + clarityScore + evidenceScore) / 4);

  // Determine validity
  const criticalIssues = issues.filter(i => i.severity === 'error');
  const isValid = overallScore >= 70 && criticalIssues.length === 0;

  // Add validation tips based on @askdocnad guidance
  if (!isValid) {
    suggestions.add('Frame the gap as a specific void (e.g., "No studies on X in Philippine context post-2020")');
    suggestions.add('Ensure you can explain: "How did you confirm this gap exists?"');
  }

  return {
    isValid,
    overallScore,
    scores: {
      specificity: specificityScore,
      testability: testabilityScore,
      clarity: clarityScore,
      evidence: evidenceScore,
    },
    issues,
    suggestions: Array.from(suggestions),
    strengths,
  };
}

/**
 * Generate an improved version of a gap statement
 * Useful for auto-generating suggestions
 */
export function suggestGapRefinement(
  originalGap: string,
  specificContext: string,
  citationCount?: number,
): string {
  const baseTemplate = `Gap: Limited evidence on {{topic}} in {{context}}.`;
  // This would ideally use Puter AI to rewrite more naturally
  // For now, provide structured template

  const topicMatch = originalGap.match(/(?:about|on|of|regarding)\s+([^.]+)/i);
  const topic = topicMatch?.[1] || 'this phenomenon';

  const refined = baseTemplate
    .replace('{{topic}}', topic.toLowerCase())
    .replace('{{context}}', specificContext);

  const withCitation = citationCount ? `${refined} [${citationCount} relevant studies identified]` : refined;
  return withCitation;
}

/**
 * Score gap suitability for thesis defense
 * Aligned with panel question anticipation
 */
export function scoreGapDefenseReadiness(
  gapStatement: string,
  supportingStudies: number,
): {
  defenseScore: number;
  panelQuestions: string[];
  strengthAreas: string[];
  weakAreas: string[];
} {
  const validation = validateResearchGap(gapStatement);

  const defenseScore = Math.round((validation.overallScore + (supportingStudies > 0 ? 20 : 0)) / 1.2);

  // Generate probable panel questions based on gap quality
  const panelQuestions: string[] = [];

  // All gaps get asked this
  panelQuestions.push('How did you confirm this gap exists in the literature?');

  if (validation.scores.specificity < 70) {
    panelQuestions.push('Can you define more precisely what aspect of the literature is lacking?');
  }

  if (validation.scores.evidence < 70) {
    panelQuestions.push('How many existing studies did you review, and what specifically do they miss?');
  }

  if (validation.scores.testability < 70) {
    panelQuestions.push('How will you empirically test or measure this gap in your research?');
  }

  // Standard defense questions
  panelQuestions.push('Why is this gap important to address?');
  panelQuestions.push('What methodologies from existing studies could inform your approach?');

  return {
    defenseScore,
    panelQuestions,
    strengthAreas: validation.strengths,
    weakAreas: validation.issues.filter(i => i.severity === 'error').map(i => i.message),
  };
}
