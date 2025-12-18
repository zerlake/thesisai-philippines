'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  BookOpen, 
  Shield, 
  Sparkles,
  Loader,
  AlertTriangle,
  CheckCircle,
  Download,
  RefreshCw
} from 'lucide-react';
import { ResearchGap } from '@/types/researchGap';
import { AIGapAnalysis } from '@/lib/ai/research-gap-analyzer';
import { toast } from 'sonner';

interface AIResearchGapAnalysisProps {
  gap: ResearchGap;
  literature?: string;
  context?: {
    fieldOfStudy?: string;
    geographicScope?: string;
    timeframe?: string;
    targetPopulation?: string;
  };
}

export function AIResearchGapAnalysis({ gap, literature, context }: AIResearchGapAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIGapAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const analyzeGap = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/research-gaps/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gap,
          literature,
          context,
          analysisDepth: 'comprehensive',
          saveAnalysis: true
        })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze research gap');
      }

      const result = await response.json();
      setAnalysis(result);
      toast.success('Research gap analysis complete');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadAnalysis = () => {
    if (!analysis) return;

    const report = generateReport(analysis, gap);
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gap-analysis-${gap.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!analysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Research Gap Analysis
          </CardTitle>
          <CardDescription>
            Comprehensive AI-powered analysis of your research gap
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Button 
            onClick={analyzeGap} 
            disabled={isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Analyze with AI
              </>
            )}
          </Button>
          
          <p className="text-sm text-muted-foreground mt-4 text-center">
            This analysis will evaluate your gap across multiple dimensions including:
            specificity, novelty, feasibility, significance, and defense readiness.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Research Gap Analysis
            </CardTitle>
            <CardDescription>
              Comprehensive AI analysis completed
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={analyzeGap}
            disabled={isAnalyzing}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Re-analyze
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="dimensions">Dimensions</TabsTrigger>
            <TabsTrigger value="depth">Depth</TabsTrigger>
            <TabsTrigger value="defense">Defense</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <SWOTAnalysis analysis={analysis} />
            <ConfidenceMetrics analysis={analysis} />
          </TabsContent>

          {/* Dimensions Tab */}
          <TabsContent value="dimensions" className="space-y-4">
            <DimensionScores analysis={analysis} />
          </TabsContent>

          {/* Depth Tab */}
          <TabsContent value="depth" className="space-y-4">
            <DepthAnalysis analysis={analysis} />
            <ResearchImpact analysis={analysis} />
          </TabsContent>

          {/* Defense Tab */}
          <TabsContent value="defense" className="space-y-4">
            <DefensePreparation analysis={analysis} />
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-4">
            <GapRecommendations analysis={analysis} />
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex gap-2">
          <Button 
            onClick={downloadAnalysis}
            variant="outline"
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
          <Button 
            onClick={analyzeGap}
            disabled={isAnalyzing}
            className="flex-1"
          >
            {isAnalyzing ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : null}
            {isAnalyzing ? 'Analyzing...' : 'Update Analysis'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * SWOT Analysis Component
 */
function SWOTAnalysis({ analysis }: { analysis: AIGapAnalysis }) {
  const { analysis: swot } = analysis;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Strengths</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {swot.strengths.map((s, i) => (
              <li key={i} className="flex gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{s}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Weaknesses</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {swot.weaknesses.map((w, i) => (
              <li key={i} className="flex gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{w}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Opportunities</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {swot.opportunities.map((o, i) => (
              <li key={i} className="flex gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{o}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Threats</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {swot.threats.map((t, i) => (
              <li key={i} className="flex gap-2">
                <Shield className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{t}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Dimension Scores Component
 */
function DimensionScores({ analysis }: { analysis: AIGapAnalysis }) {
  const { dimensions } = analysis;
  const avgScore = Math.round(
    (dimensions.specificity.score + 
     dimensions.novelty.score + 
     dimensions.feasibility.score + 
     dimensions.significance.score + 
     dimensions.literatureAlignment.score) / 5
  );

  const scoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-blue-100';
    return 'bg-orange-100';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Overall Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-center p-4 rounded-lg ${scoreColor(avgScore)}`}>
            <div className="text-4xl font-bold">{avgScore}</div>
            <p className="text-sm text-muted-foreground">out of 100</p>
          </div>
        </CardContent>
      </Card>

      {Object.entries(dimensions).map(([key, dim]) => (
        <Card key={key}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</CardTitle>
            <CardDescription>{dim.feedback}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">{dim.score}/100</span>
                <Badge variant="outline">{dim.score >= 70 ? 'Strong' : 'Review'}</Badge>
              </div>
              <Progress value={dim.score} className="h-2" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Depth Analysis Component
 */
function DepthAnalysis({ analysis }: { analysis: AIGapAnalysis }) {
  const { depthAnalysis } = analysis;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.entries(depthAnalysis).map(([key, items]) => (
        <Card key={key}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm capitalize">
              {key.replace(/([A-Z])/g, ' $1')} Gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {items.length > 0 ? (
                items.map((item, i) => (
                  <li key={i} className="text-sm text-muted-foreground">• {item}</li>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic">No gaps identified</p>
              )}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Research Impact Component
 */
function ResearchImpact({ analysis }: { analysis: AIGapAnalysis }) {
  const { researchImpact } = analysis;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Research Impact</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h4 className="font-semibold text-sm mb-1">Theoretical Contribution</h4>
          <p className="text-sm text-muted-foreground">{researchImpact.theoreticalContribution}</p>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-1">Practical Application</h4>
          <p className="text-sm text-muted-foreground">{researchImpact.practicalApplication}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Innovation Level</p>
            <Badge>{researchImpact.innovationLevel}</Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Scalability</p>
            <Badge>{researchImpact.scalability}</Badge>
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-2">Beneficiaries</p>
          <div className="flex flex-wrap gap-1">
            {researchImpact.beneficiaries.map((b, i) => (
              <Badge key={i} variant="secondary">{b}</Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Defense Preparation Component
 */
function DefensePreparation({ analysis }: { analysis: AIGapAnalysis }) {
  const { defensePrep } = analysis;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Defense Readiness Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-semibold">{defensePrep.defenseReadinessScore}/100</span>
              <Badge variant={defensePrep.defenseReadinessScore >= 70 ? 'default' : 'secondary'}>
                {defensePrep.defenseReadinessScore >= 70 ? 'Ready' : 'Needs Work'}
              </Badge>
            </div>
            <Progress value={defensePrep.defenseReadinessScore} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Preparation Strategy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{defensePrep.preparationStrategy}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Key Defense Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {defensePrep.keyQuestions.map((q, i) => (
              <div key={i} className="border-l-2 border-blue-200 pl-3">
                <p className="text-sm font-medium">{q.question}</p>
                <Badge className="mt-1">{q.difficulty}</Badge>
                <ul className="mt-2 space-y-1">
                  {q.suggestedPoints.map((point, j) => (
                    <li key={j} className="text-sm text-muted-foreground">• {point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Potential Challenges</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1">
            {defensePrep.potentialChallenges.map((c, i) => (
              <li key={i} className="text-sm text-muted-foreground">• {c}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Gap Recommendations Component
 */
function GapRecommendations({ analysis }: { analysis: AIGapAnalysis }) {
  const { recommendations } = analysis;

  return (
    <div className="space-y-4">
      {recommendations.refinements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recommended Refinements</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendations.refinements.map((r, i) => (
                <li key={i} className="text-sm text-muted-foreground">• {r}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {recommendations.literatureSources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Literature Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendations.literatureSources.map((s, i) => (
                <li key={i} className="text-sm text-muted-foreground">• {s}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {recommendations.methodologyAdvice.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Methodology Advice</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendations.methodologyAdvice.map((m, i) => (
                <li key={i} className="text-sm text-muted-foreground">• {m}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {recommendations.collaborationOpportunities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Collaboration Opportunities</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendations.collaborationOpportunities.map((c, i) => (
                <li key={i} className="text-sm text-muted-foreground">• {c}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Confidence Metrics Component
 */
function ConfidenceMetrics({ analysis }: { analysis: AIGapAnalysis }) {
  const { confidence } = analysis;

  return (
    <div className="grid grid-cols-3 gap-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs">Analysis Confidence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{confidence.analysisConfidence}%</div>
          <Progress value={confidence.analysisConfidence} className="h-1 mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs">Data Quality</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{confidence.dataQuality}%</div>
          <Progress value={confidence.dataQuality} className="h-1 mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs">Completeness</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{confidence.completeness}%</div>
          <Progress value={confidence.completeness} className="h-1 mt-2" />
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Generate text report
 */
function generateReport(analysis: AIGapAnalysis, gap: ResearchGap): string {
  return `
RESEARCH GAP AI ANALYSIS REPORT
================================

Gap: ${gap.title}
Analysis Date: ${new Date(analysis.timestamp).toLocaleDateString()}

EXECUTIVE SUMMARY
-----------------
${analysis.analysis.overallAssessment}

SWOT ANALYSIS
-------------
Strengths:
${analysis.analysis.strengths.map(s => `  • ${s}`).join('\n')}

Weaknesses:
${analysis.analysis.weaknesses.map(w => `  • ${w}`).join('\n')}

Opportunities:
${analysis.analysis.opportunities.map(o => `  • ${o}`).join('\n')}

Threats:
${analysis.analysis.threats.map(t => `  • ${t}`).join('\n')}

DIMENSION SCORES
----------------
Specificity: ${analysis.dimensions.specificity.score}/100
Novelty: ${analysis.dimensions.novelty.score}/100
Feasibility: ${analysis.dimensions.feasibility.score}/100
Significance: ${analysis.dimensions.significance.score}/100
Literature Alignment: ${analysis.dimensions.literatureAlignment.score}/100

RESEARCH IMPACT
---------------
Theoretical Contribution: ${analysis.researchImpact.theoreticalContribution}
Practical Application: ${analysis.researchImpact.practicalApplication}
Innovation Level: ${analysis.researchImpact.innovationLevel}
Beneficiaries: ${analysis.researchImpact.beneficiaries.join(', ')}
Scalability: ${analysis.researchImpact.scalability}

DEFENSE READINESS
-----------------
Score: ${analysis.defensePrep.defenseReadinessScore}/100
Strategy: ${analysis.defensePrep.preparationStrategy}

RECOMMENDATIONS
----------------
${analysis.recommendations.refinements.length > 0 ? `Refinements:\n${analysis.recommendations.refinements.map(r => `  • ${r}`).join('\n')}\n` : ''}
${analysis.recommendations.methodologyAdvice.length > 0 ? `Methodology Advice:\n${analysis.recommendations.methodologyAdvice.map(m => `  • ${m}`).join('\n')}\n` : ''}

Report Generated: ${new Date().toLocaleString()}
  `.trim();
}
