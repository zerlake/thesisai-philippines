"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Wand2,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calculator,
  MessageSquare,
  GitMerge,
  Copy,
  X
} from "lucide-react";
import { toast } from "sonner";
import {
  detectResearchType,
  validateProblemStatement,
  type ResearchType,
  type ResearchTypeAnalysis,
  type ValidationResult
} from "@/lib/research-type-detector";

interface ResearchTypeAdvisorProps {
  initialStatement?: string;
  onTypeDetected?: (analysis: ResearchTypeAnalysis) => void;
  showSuggestions?: boolean;
  showValidation?: boolean;
}

export function ResearchTypeAdvisor({
  initialStatement = "",
  onTypeDetected,
  showSuggestions = true,
  showValidation = true
}: ResearchTypeAdvisorProps) {
  const [problemStatement, setProblemStatement] = useState(initialStatement);
  const [analysis, setAnalysis] = useState<ResearchTypeAnalysis | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    setProblemStatement(initialStatement);
  }, [initialStatement]);

  const handleAnalyze = () => {
    if (!problemStatement.trim()) {
      toast.error("Please enter a problem statement");
      return;
    }

    setIsAnalyzing(true);

    // Simulate processing time
    setTimeout(() => {
      const newAnalysis = detectResearchType(problemStatement);
      setAnalysis(newAnalysis);
      setValidation(validateProblemStatement(problemStatement, newAnalysis.type));
      onTypeDetected?.(newAnalysis);
      setIsAnalyzing(false);
    }, 500);
  };

  const handleClear = () => {
    setProblemStatement("");
    setAnalysis(null);
    setValidation(null);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const getResearchTypeIcon = (type: ResearchType) => {
    switch (type) {
      case 'quantitative':
        return <Calculator className="h-5 w-5" />;
      case 'qualitative':
        return <MessageSquare className="h-5 w-5" />;
      case 'mixed-method':
        return <GitMerge className="h-5 w-5" />;
    }
  };

  const getResearchTypeColor = (type: ResearchType) => {
    switch (type) {
      case 'quantitative':
        return "bg-blue-50 border-blue-200 text-blue-700";
      case 'qualitative':
        return "bg-purple-50 border-purple-200 text-purple-700";
      case 'mixed-method':
        return "bg-green-50 border-green-200 text-green-700";
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-500";
    if (confidence >= 0.6) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Research Type Advisor</CardTitle>
          <CardDescription>
            Enter your research problem statement and get instant analysis of the appropriate methodology.
            The system will detect whether your study is quantitative, qualitative, or mixed-method.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Problem Statement
              </label>
              <Textarea
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                placeholder="Enter your research problem statement (e.g., 'What is the relationship between social media usage and academic performance among senior high school students?')"
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleAnalyze}
                disabled={!problemStatement.trim() || isAnalyzing}
                className="flex-1"
              >
                <Wand2 className="w-4 h-4 mr-2" />
                {isAnalyzing ? "Analyzing..." : "Detect Research Type"}
              </Button>

              {problemStatement && (
                <Button variant="outline" onClick={handleClear}>
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {analysis && (
        <>
          {/* Detection Results */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {getResearchTypeIcon(analysis.type)}
                  {analysis.type === 'quantitative' && 'Quantitative Research'}
                  {analysis.type === 'qualitative' && 'Qualitative Research'}
                  {analysis.type === 'mixed-method' && 'Mixed-Method Research'}
                </CardTitle>
                <Badge className={getResearchTypeColor(analysis.type)}>
                  {(analysis.confidence * 100).toFixed(0)}% Confidence
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Rationale */}
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>{analysis.rationale}</AlertDescription>
                </Alert>

                {/* Confidence Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Detection Confidence</span>
                    <span>{(analysis.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <Progress
                    value={analysis.confidence * 100}
                    className="h-2"
                  />
                </div>

                {/* Indicator Breakdown */}
                <div>
                  <h4 className="font-medium mb-2">Keyword Indicator Breakdown</h4>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-blue-600">Quantitative Indicators</span>
                        <span>{analysis.indicators.quantitative}</span>
                      </div>
                      <Progress
                        value={Math.min(100, (analysis.indicators.quantitative / 10) * 100)}
                        className="h-1.5"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-purple-600">Qualitative Indicators</span>
                        <span>{analysis.indicators.qualitative}</span>
                      </div>
                      <Progress
                        value={Math.min(100, (analysis.indicators.qualitative / 10) * 100)}
                        className="h-1.5"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-green-600">Mixed-Method Indicators</span>
                        <span>{analysis.indicators.mixed}</span>
                      </div>
                      <Progress
                        value={Math.min(100, (analysis.indicators.mixed / 10) * 100)}
                        className="h-1.5"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Suggestions */}
          {showSuggestions && analysis.suggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Methodology Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Validation */}
          {showValidation && validation && (
            <Card>
              <CardHeader>
                <CardTitle>Problem Statement Validation</CardTitle>
              </CardHeader>
              <CardContent>
                {validation.isValid ? (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-700">
                      Your problem statement is well-formatted for {analysis.type} research.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-3">
                    {validation.issues.map((issue, index) => (
                      <Alert
                        key={index}
                        className={issue.type === 'error'
                          ? 'border-red-200 bg-red-50'
                          : 'border-yellow-200 bg-yellow-50'}
                      >
                        {issue.type === 'error' ? (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        ) : (
                          <Info className="h-4 w-4 text-yellow-600" />
                        )}
                        <AlertDescription className={issue.type === 'error'
                          ? 'text-red-700'
                          : 'text-yellow-700'}>
                          <div className="space-y-1">
                            <p className="font-medium">{issue.message}</p>
                            <p className="text-sm opacity-90">
                              <span className="font-medium">Suggestion:</span> {issue.correction}
                            </p>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Quick Reference */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Reference</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-700 flex items-center gap-2 mb-2">
                    <Calculator className="h-4 w-4" />
                    Quantitative Research
                  </h4>
                  <p className="text-sm text-blue-600">
                    Use when <strong>comparing variables</strong> or asking for the <strong>relationship between variables</strong>.
                    Involves numerical data and statistical analysis.
                  </p>
                </div>

                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <h4 className="font-medium text-purple-700 flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4" />
                    Qualitative Research
                  </h4>
                  <p className="text-sm text-purple-600">
                    Aims to get <strong>raw answers from informants</strong>. <strong>Do NOT write choices/options</strong>.
                    Uses open-ended questions to explore experiences.
                  </p>
                </div>

                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-700 flex items-center gap-2 mb-2">
                    <GitMerge className="h-4 w-4" />
                    Mixed-Method Research
                  </h4>
                  <p className="text-sm text-green-600">
                    Combines quantitative and qualitative approaches for comprehensive analysis.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
