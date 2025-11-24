export interface ResearchGap {
  id: string;
  title: string;
  description: string;
  gapType: 'theoretical' | 'methodological' | 'empirical' | 'contextual' | 'temporal';
  noveltyScore: number; // 1-100
  feasibilityScore: number; // 1-100
  significanceScore: number; // 1-100
  potentialContribution: string;
  relatedFields: string[];
  requiredResources: string[];
  timelineEstimate: string; // e.g., "6-12 months"
  supportingLiterature: GapLiterature[];
  keyCitations: string[];
  researchMethodology: string;
  potentialChallenges: string[];
  solutionApproach: string;
}

export interface GapLiterature {
  id: string;
  title: string;
  authors: string;
  year: number;
  type: 'study' | 'review' | 'theoretical' | 'methodological';
  findings: string;
  limitations: string[]; // What this paper doesn't address
  relevanceScore: number; // 1-100 to the identified gap
  contribution: 'major' | 'moderate' | 'minor';
  gapConnection: string; // How this paper relates to the gap
}

export interface GapAnalysisRequest {
  topic: string;
  fieldOfStudy: string;
  keywords: string[];
  existingLiterature: string[]; // References for context
  researchFocus: 'quantitative' | 'qualitative' | 'mixed' | 'theoretical' | 'methodological';
  geographicScope: string;
  timeline: string; // When they want to complete the research
}

export interface GapAnalysisResponse {
  requestId: string;
  analysisDate: Date;
  identifiedGaps: ResearchGap[];
  confidenceScore: number; // Overall confidence in the analysis
  methodology: string; // How the analysis was performed
  dataSources: string[]; // What databases/sources were used
  recommendations: GapRecommendation[];
  relatedConferences: Conference[]; // Conferences where gap research might be presented
  fundingOpportunities: FundingOpportunity[]; // Potential funding for gap research
}

export interface GapRecommendation {
  gapId: string;
  priority: 'high' | 'medium' | 'low';
  rationale: string;
  nextSteps: string[];
  estimatedEffort: 'low' | 'medium' | 'high';
  timelineEstimate: string;
  resourceRequirements: string[];
}

export interface Conference {
  id: string;
  name: string;
  topic: string;
  deadline: Date;
  location: string;
  acceptanceRate: number;
  relevanceToGap: number; // 1-100
  url: string;
}

export interface FundingOpportunity {
  id: string;
  title: string;
  organization: string;
  deadline: Date;
  amount: string; // "PHP 100,000 - 500,000" or similar
  description: string;
  eligibility: string;
  relevanceToGaps: string[]; // IDs of gaps this funding applies to
  url: string;
}