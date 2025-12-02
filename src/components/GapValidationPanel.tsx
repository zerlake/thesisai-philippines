'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  TrendingUp,
  Eye,
  Zap,
  BookOpen,
} from 'lucide-react';
import { ResearchGap } from '@/types/researchGap';
import {
  validateResearchGap,
  scoreGapDefenseReadiness,
  GapValidationResult,
  ValidationIssue,
} from '@/lib/gap-validation';

interface GapValidationPanelProps {
  gaps: ResearchGap[];
}

export function GapValidationPanel({ gaps }: GapValidationPanelProps) {
  const [expandedGapId, setExpandedGapId] = useState<string | null>(null);
  const [validations, setValidations] = useState<Record<string, GapValidationResult>>({});

  // Validate all gaps on mount
  useState(() => {
    const newValidations: Record<string, GapValidationResult> = {};
    gaps.forEach((gap: ResearchGap) => {
      if (!validations[gap.id]) {
        newValidations[gap.id] = validateResearchGap(gap.description);
      }
    });
    if (Object.keys(newValidations).length > 0) {
      setValidations(prev => ({ ...prev, ...newValidations }));
    }
  });

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number): string => {
    if (score >= 80) return 'bg-green-50';
    if (score >= 60) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  const handleGapClick = (gapId: string) => {
    setExpandedGapId(expandedGapId === gapId ? null : gapId);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Total Gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gaps.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Valid Gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Object.values(validations).filter(v => v.isValid).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              Needs Work
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {Object.values(validations).filter(v => !v.isValid).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Avg Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.values(validations).length > 0
                ? Math.round(
                    Object.values(validations).reduce((sum, v) => sum + v.overallScore, 0) /
                      Object.values(validations).length,
                  )
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {gaps.map(gap => {
          const validation = validations[gap.id];
          if (!validation) return null;

          const defenseReadiness = scoreGapDefenseReadiness(gap.description, gap.supportingLiterature.length);
          const isExpanded = expandedGapId === gap.id;

          return (
            <Card key={gap.id} className={isExpanded ? 'ring-2 ring-primary' : ''}>
              <CardHeader
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleGapClick(gap.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-base flex-1">{gap.title}</CardTitle>
                      {validation.isValid ? (
                        <Badge className="bg-green-500">Valid</Badge>
                      ) : (
                        <Badge variant="destructive">Needs Improvement</Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs">{gap.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="space-y-6 border-t pt-6">
                  {/* Validation Scores */}
                  <div>
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Gap Quality Scores
                    </h4>
                    <div className="space-y-4">
                      {[
                        {
                          label: 'Specificity',
                          score: validation.scores.specificity,
                          icon: '📍',
                          description: 'Does it specify context, population, time period?',
                        },
                        {
                          label: 'Testability',
                          score: validation.scores.testability,
                          icon: '🔬',
                          description: 'Is the gap empirically verifiable?',
                        },
                        {
                          label: 'Clarity',
                          score: validation.scores.clarity,
                          icon: '✨',
                          description: 'Is it concise and well-articulated?',
                        },
                        {
                          label: 'Evidence',
                          score: validation.scores.evidence,
                          icon: '📚',
                          description: 'Is it grounded in literature?',
                        },
                      ].map(item => (
                        <div key={item.label} className="space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium flex items-center gap-2">
                                <span>{item.icon}</span>
                                {item.label}
                              </p>
                              <p className="text-xs text-muted-foreground">{item.description}</p>
                            </div>
                            <span className={`text-xl font-bold ${getScoreColor(item.score)}`}>
                              {item.score}
                            </span>
                          </div>
                          <Progress value={item.score} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Overall Score */}
                  <div className={`p-4 rounded-lg border ${getScoreBg(validation.overallScore)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Overall Gap Quality</span>
                      <span className={`text-2xl font-bold ${getScoreColor(validation.overallScore)}`}>
                        {validation.overallScore}/100
                      </span>
                    </div>
                    <Progress value={validation.overallScore} className="h-3" />
                    {validation.isValid && (
                      <p className="text-sm mt-2 text-green-700">
                        ✓ This gap statement is well-defined and defense-ready
                      </p>
                    )}
                  </div>

                  {/* Issues and Warnings */}
                  {validation.issues.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Issues Found ({validation.issues.length})
                      </h4>
                      {validation.issues.map((issue: ValidationIssue) => (
                        <Alert
                          key={issue.id}
                          variant={issue.severity === 'error' ? 'destructive' : 'default'}
                        >
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <p className="font-medium">{issue.message}</p>
                            {issue.affectedText && (
                              <p className="text-xs mt-1 font-mono bg-muted p-1 rounded">
                                "{issue.affectedText}"
                              </p>
                            )}
                            {issue.suggestedFix && (
                              <p className="text-sm mt-2">
                                <strong>Fix:</strong> {issue.suggestedFix}
                              </p>
                            )}
                            {issue.example && (
                              <p className="text-xs mt-1 text-muted-foreground italic">
                                Example: {issue.example}
                              </p>
                            )}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  )}

                  {/* Strengths */}
                  {validation.strengths.length > 0 && (
                    <div className="space-y-2 bg-green-50 p-3 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-sm flex items-center gap-2 text-green-700">
                        <CheckCircle2 className="w-4 h-4" />
                        Strengths
                      </h4>
                      <ul className="space-y-1">
                        {validation.strengths.map((strength, idx) => (
                          <li key={idx} className="text-sm text-green-700">
                            ✓ {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Suggestions */}
                  {validation.suggestions.length > 0 && (
                    <div className="space-y-2 bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-sm flex items-center gap-2 text-blue-700">
                        <Lightbulb className="w-4 h-4" />
                        Suggestions for Improvement
                      </h4>
                      <ul className="space-y-1">
                        {validation.suggestions.map((suggestion, idx) => (
                          <li key={idx} className="text-sm text-blue-700">
                            • {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Defense Readiness */}
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 space-y-3">
                    <h4 className="font-semibold flex items-center gap-2 text-purple-700">
                      <BookOpen className="w-4 h-4" />
                      Defense Panel Readiness
                    </h4>
                    <div>
                      <p className="text-sm font-medium text-purple-700 mb-2">
                        Defense Score: <span className="text-lg font-bold">{defenseReadiness.defenseScore}/100</span>
                      </p>
                      <Progress value={defenseReadiness.defenseScore} className="h-2" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-700 mb-2">
                        Probable Panel Questions:
                      </p>
                      <ul className="space-y-1">
                        {defenseReadiness.panelQuestions.slice(0, 3).map((q, idx) => (
                          <li key={idx} className="text-sm text-purple-700 list-disc list-inside">
                            {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
