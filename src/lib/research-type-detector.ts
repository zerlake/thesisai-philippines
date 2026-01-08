/**
 * Research Type Detection Utilities
 *
 * This module provides functions to detect and analyze research methodology types
 * (quantitative, qualitative, mixed-method) based on problem statements.
 */

export type ResearchType = 'quantitative' | 'qualitative' | 'mixed-method';

export interface ResearchTypeAnalysis {
  type: ResearchType;
  confidence: number;
  rationale: string;
  indicators: {
    quantitative: number;
    qualitative: number;
    mixed: number;
  };
  suggestions: string[];
}

export interface ValidationIssue {
  type: 'error' | 'warning';
  message: string;
  correction: string;
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
}

// Keyword indicators for each research type
const QUANTITATIVE_INDICATORS = [
  'compare', 'comparison', 'difference',
  'relationship', 'correlation', 'association',
  'impact', 'effect', 'influence',
  'determine', 'predict', 'quantify',
  'significant', 'statistical', 'numerical',
  'variables', 'measurement', 'scale',
  'test', 'hypothesis', 'experimental',
  'between two', 'between the', 'difference between'
];

const QUALITATIVE_INDICATORS = [
  'explore', 'understand', 'experience',
  'perception', 'meaning', 'perspective',
  'describe', 'explain', 'interpret',
  'analyze', 'lived experience',
  'viewpoint', 'story', 'narrative',
  'informant', 'participant',
  'in-depth', 'contextual', 'rich description',
  'phenomenological', 'case study', 'ethnographic',
  'grounded theory', 'what are the', 'how do'
];

const MIXED_INDICATORS = [
  'combine', 'integrate', 'comprehensive',
  'holistic', 'both quantitative and qualitative',
  'numerical and narrative',
  'sequential', 'convergent', 'parallel',
  'triangulation', 'mixed method'
];

/**
 * Main function to detect research type from problem statement
 */
export function detectResearchType(problemStatement: string): ResearchTypeAnalysis {
  const lowerStatement = problemStatement.toLowerCase();

  // Count keyword matches
  const quantScore = QUANTITATIVE_INDICATORS.filter(i =>
    lowerStatement.includes(i)
  ).length;

  const qualScore = QUALITATIVE_INDICATORS.filter(i =>
    lowerStatement.includes(i)
  ).length;

  const mixedScore = MIXED_INDICATORS.filter(i =>
    lowerStatement.includes(i)
  ).length;

  // Calculate total indicators
  const totalScore = quantScore + qualScore + mixedScore;

  // No clear indicators detected
  if (totalScore === 0) {
    return {
      type: 'mixed-method',
      confidence: 0.3,
      rationale: 'No clear indicators detected. Based on research goals and data availability.',
      indicators: { quantitative: 0, qualitative: 0, mixed: 0 },
      suggestions: [
        'Clarify if you want to compare variables (quantitative) or explore experiences (qualitative)',
        'Consider the type of data you will collect',
        'Specify if you are examining relationships or exploring phenomena'
      ]
    };
  }

  // Mixed method indicators detected
  if (mixedScore > 0) {
    return {
      type: 'mixed-method',
      confidence: Math.min(0.9, 0.5 + mixedScore * 0.15),
      rationale: 'Mixed-method indicators detected. Combines statistical analysis with deep understanding.',
      indicators: { quantitative: quantScore, qualitative: qualScore, mixed: mixedScore },
      suggestions: getMixedMethodSuggestions(problemStatement)
    };
  }

  // Quantitative dominates
  if (quantScore > qualScore && quantScore >= 1) {
    return {
      type: 'quantitative',
      confidence: Math.min(0.95, 0.5 + quantScore * 0.1),
      rationale: 'Quantitative indicators detected. Focuses on comparing variables and investigating relationships.',
      indicators: { quantitative: quantScore, qualitative: qualScore, mixed: mixedScore },
      suggestions: getQuantitativeSuggestions(problemStatement)
    };
  }

  // Qualitative dominates
  if (qualScore > quantScore && qualScore >= 1) {
    return {
      type: 'qualitative',
      confidence: Math.min(0.95, 0.5 + qualScore * 0.1),
      rationale: 'Qualitative indicators detected. Seeks understanding through open-ended exploration.',
      indicators: { quantitative: quantScore, qualitative: qualScore, mixed: mixedScore },
      suggestions: getQualitativeSuggestions(problemStatement)
    };
  }

  // Equal scores
  if (quantScore === qualScore && quantScore > 0) {
    return {
      type: 'mixed-method',
      confidence: 0.7,
      rationale: 'Both quantitative and qualitative indicators present equally. Consider mixed-methods approach.',
      indicators: { quantitative: quantScore, qualitative: qualScore, mixed: mixedScore },
      suggestions: [
        'Consider mixed-methods to combine strengths of both approaches',
        'Use quantitative for patterns, qualitative for depth',
        'Think about whether you need both statistical significance and rich understanding'
      ]
    };
  }

  // Fallback
  return {
    type: 'mixed-method',
    confidence: 0.5,
    rationale: 'Inconclusive detection. Review problem statement for clearer indicators.',
    indicators: { quantitative: quantScore, qualitative: qualScore, mixed: mixedScore },
    suggestions: ['Refine problem statement to clearly indicate research approach']
  };
}

/**
 * Get specific suggestions for quantitative research
 */
function getQuantitativeSuggestions(statement: string): string[] {
  const suggestions = [
    'Focus on comparing variables or investigating relationships',
    'Use closed-ended questions with predefined options',
    'Consider the statistical tests you will use'
  ];

  const lowerStatement = statement.toLowerCase();

  if (lowerStatement.includes('relationship') || lowerStatement.includes('correlation')) {
    suggestions.push('Identify the specific variables you will correlate');
    suggestions.push('Specify the direction (positive/negative) you expect');
  }

  if (lowerStatement.includes('compare') || lowerStatement.includes('difference')) {
    suggestions.push('Define the groups or conditions being compared');
    suggestions.push('Clarify what type of difference you expect to find');
  }

  if (lowerStatement.includes('impact') || lowerStatement.includes('effect') || lowerStatement.includes('influence')) {
    suggestions.push('Specify the independent and dependent variables');
    suggestions.push('Consider control variables that might affect results');
  }

  return suggestions;
}

/**
 * Get specific suggestions for qualitative research
 */
function getQualitativeSuggestions(statement: string): string[] {
  const suggestions = [
    'Focus on getting raw answers from informants',
    'Do NOT write choices or predefined options in your problem statement',
    'Use open-ended questions to explore experiences',
    'Aim for rich, contextual understanding'
  ];

  const lowerStatement = statement.toLowerCase();

  if (lowerStatement.includes('experience') || lowerStatement.includes('perception')) {
    suggestions.push('Consider how you will capture lived experiences');
    suggestions.push('Think about interview or observation methods');
  }

  if (lowerStatement.includes('meaning') || lowerStatement.includes('perspective')) {
    suggestions.push('Plan to gather multiple viewpoints');
    suggestions.push('Consider focus group discussions');
  }

  return suggestions;
}

/**
 * Get specific suggestions for mixed-method research
 */
function getMixedMethodSuggestions(statement: string): string[] {
  return [
    'Use sequential approach: start with quantitative, follow with qualitative',
    'Or use concurrent approach: collect both types simultaneously',
    'Ensure both approaches address your research problem',
    'Plan how to integrate findings from both methods',
    'Justify why mixed-methods is necessary for your study'
  ];
}

/**
 * Validate problem statement against research type
 * Enforces critical rules: qualitative should NOT have choices
 */
export function validateProblemStatement(statement: string, type: ResearchType): ValidationResult {
  const issues: ValidationIssue[] = [];
  const lowerStatement = statement.toLowerCase();

  if (type === 'qualitative') {
    // Critical rule: Qualitative should NOT have choices/options
    if (lowerStatement.includes('choose from') ||
        lowerStatement.includes('select from') ||
        lowerStatement.includes('multiple choice') ||
        lowerStatement.includes('options:') ||
        lowerStatement.includes('choice:') ||
        lowerStatement.includes('(a)') ||
        lowerStatement.includes('(b)') ||
        lowerStatement.includes('1.') || lowerStatement.includes('2.') || lowerStatement.includes('3.')) {

      issues.push({
        type: 'error',
        message: 'Qualitative research should not provide choices or predefined options',
        correction: 'Replace options with open-ended inquiry. Aim for raw informant answers.'
      });
    }

    // Check for closed-ended patterns
    if (lowerStatement.includes('yes or no') ||
        lowerStatement.includes('agree/disagree') ||
        lowerStatement.includes('scale of')) {

      issues.push({
        type: 'error',
        message: 'Closed-ended scales are not appropriate for qualitative research',
        correction: 'Use open-ended questions that allow informants to share their perspectives freely'
      });
    }
  }

  if (type === 'quantitative') {
    // Quantitative should mention comparison or relationships
    const hasComparisonIndicator =
      lowerStatement.includes('compare') ||
      lowerStatement.includes('comparison') ||
      lowerStatement.includes('difference between') ||
      lowerStatement.includes('relationship') ||
      lowerStatement.includes('correlation') ||
      lowerStatement.includes('association');

    if (!hasComparisonIndicator) {
      issues.push({
        type: 'warning',
        message: 'Quantitative research should compare variables or examine relationships',
        correction: 'Specify the variables being compared or the relationship being studied'
      });
    }
  }

  return {
    isValid: issues.filter(i => i.type === 'error').length === 0,
    issues
  };
}

/**
 * Get formatted research type label
 */
export function getResearchTypeLabel(type: ResearchType): string {
  switch (type) {
    case 'quantitative':
      return 'Quantitative Research';
    case 'qualitative':
      return 'Qualitative Research';
    case 'mixed-method':
      return 'Mixed-Method Research';
    default:
      return 'Unknown';
  }
}

/**
 * Get research type description
 */
export function getResearchTypeDescription(type: ResearchType): string {
  switch (type) {
    case 'quantitative':
      return 'Uses numerical data and statistical analysis to test hypotheses, compare variables, and examine relationships.';
    case 'qualitative':
      return 'Explores experiences, perceptions, and meanings through open-ended inquiry and deep understanding.';
    case 'mixed-method':
      return 'Combines quantitative and qualitative approaches for comprehensive analysis.';
    default:
      return '';
  }
}
