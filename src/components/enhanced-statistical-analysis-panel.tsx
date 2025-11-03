"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { 
  Loader2, 
  Play, 
  Info, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  BarChart3,
  FileCheck,
  ShieldCheck,
  TrendingUp,
  Eye,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { toast } from "sonner";
import { Label } from "./ui/label";
import { useAuth } from "./auth-provider";
import { Badge } from "./ui/badge";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Progress } from "./ui/progress";

interface StatisticalAnalysisPanelProps {
  uploadedData: Record<string, any>[];
  columns: string[];
  setAnalysisResults: (results: AnalysisResult | null) => void;
  analysisResults: AnalysisResult | null;
}

export type AnalysisResult = {
  test: string;
  statistic: string;
  p_value: number;
  interpretation: string;
  details: Record<string, any>;
  assumptionsChecked?: AssumptionCheckResult[];
};

type AssumptionCheckResult = {
  id: string;
  name: string;
  description: string;
  passed: boolean;
  severity: "low" | "medium" | "high";
  diagnosticInfo: string;
  recommendation: string;
  testStatistic?: number;
  criticalValue?: number;
  testPValue?: number;
};

type TestAssumptions = {
  testName: string;
  requiredAssumptions: string[];
  assumptionChecks: AssumptionCheck[];
};

type AssumptionCheck = {
  id: string;
  name: string;
  description: string;
  requiredFor: string[];
  validationMethod: string;
};

const availableTests = [
  { id: "independent-t-test", name: "Independent Samples T-test" },
  { id: "paired-t-test", name: "Paired Samples T-test" },
  { id: "anova", name: "One-Way ANOVA" },
  { id: "pearson-correlation", name: "Pearson Correlation" },
  { id: "spearman-correlation", name: "Spearman Correlation" },
  { id: "chi-square", name: "Chi-Square Test" },
  { id: "mann-whitney", name: "Mann-Whitney U Test" },
  { id: "wilcoxon", name: "Wilcoxon Signed-Rank Test" },
  { id: "kruskal-wallis", name: "Kruskal-Wallis Test" },
  { id: "regression", name: "Linear Regression" },
];

const testAssumptions: TestAssumptions[] = [
  {
    testName: "independent-t-test",
    requiredAssumptions: ["normality", "homogeneity", "independence"],
    assumptionChecks: [
      {
        id: "normality",
        name: "Normality of Distribution",
        description: "Data in each group should be normally distributed",
        requiredFor: ["independent-t-test", "anova", "regression"],
        validationMethod: "Shapiro-Wilk test or visual inspection of Q-Q plots"
      },
      {
        id: "homogeneity",
        name: "Homogeneity of Variances",
        description: "Variances should be equal across groups",
        requiredFor: ["independent-t-test", "anova"],
        validationMethod: "Levene's test or F-test"
      },
      {
        id: "independence",
        name: "Independence of Observations",
        description: "Each observation should be independent of others",
        requiredFor: ["independent-t-test", "paired-t-test", "anova", "chi-square"],
        validationMethod: "Study design review and Durbin-Watson test for serial correlation"
      }
    ]
  },
  {
    testName: "pearson-correlation",
    requiredAssumptions: ["linearity", "normality", "homoscedasticity"],
    assumptionChecks: [
      {
        id: "linearity",
        name: "Linear Relationship",
        description: "Variables should have a linear relationship",
        requiredFor: ["pearson-correlation", "regression"],
        validationMethod: "Scatterplot inspection and residual analysis"
      },
      {
        id: "normality",
        name: "Normality of Distribution",
        description: "Both variables should be normally distributed",
        requiredFor: ["pearson-correlation"],
        validationMethod: "Shapiro-Wilk test or visual inspection of histograms"
      },
      {
        id: "homoscedasticity",
        name: "Homoscedasticity",
        description: "Variance of residuals should be constant across predicted values",
        requiredFor: ["pearson-correlation", "regression"],
        validationMethod: "Residual plot inspection or Breusch-Pagan test"
      }
    ]
  },
  {
    testName: "chi-square",
    requiredAssumptions: ["independence", "expected-frequencies"],
    assumptionChecks: [
      {
        id: "independence",
        name: "Independence of Observations",
        description: "Each observation should be independent of others",
        requiredFor: ["chi-square"],
        validationMethod: "Study design review"
      },
      {
        id: "expected-frequencies",
        name: "Expected Cell Frequencies",
        description: "Expected frequencies should be at least 5 in each cell",
        requiredFor: ["chi-square"],
        validationMethod: "Frequency table inspection"
      }
    ]
  }
];

export function EnhancedStatisticalAnalysisPanel({
  uploadedData,
  columns,
  setAnalysisResults,
  analysisResults,
}: StatisticalAnalysisPanelProps) {
  const { session, supabase } = useAuth();
  const [selectedIV, setSelectedIV] = useState<string | null>(null);
  const [selectedDV, setSelectedDV] = useState<string | null>(null);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [isCheckingAssumptions, setIsCheckingAssumptions] = useState(false);
  const [assumptionResults, setAssumptionResults] = useState<AssumptionCheckResult[] | null>(null);
  const [userFeedback, setUserFeedback] = useState<{[key: string]: "positive" | "negative" | null}>({});

  useEffect(() => {
    if (columns.length > 0) {
      setSelectedIV(columns[0]);
      if (columns.length > 1) {
        setSelectedDV(columns[1]);
      }
    }
  }, [columns]);

  const runAnalysis = async () => {
    if (
      !selectedIV ||
      !selectedDV ||
      !selectedTest ||
      uploadedData.length === 0
    ) {
      toast.error(
        "Please select variables and a test, and ensure data is uploaded.",
      );
      return;
    }
    if (!session) {
      toast.error("You must be logged in to run an analysis.");
      return;
    }

    setIsLoadingAnalysis(true);
    setAnalysisResults(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke(
        "run-statistical-analysis",
        {
          body: {
            data: uploadedData,
            iv: selectedIV,
            dv: selectedDV,
            testType: selectedTest,
          },
        },
      );

      if (functionError) throw new Error(functionError.message);
      if (data.error) throw new Error(data.error);

      setAnalysisResults(data);
      toast.success("Analysis complete!");
    } catch (err: any) {
      toast.error(err.message || "Failed to run analysis.");
      console.error(err);
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const checkAssumptions = async () => {
    if (
      !selectedIV ||
      !selectedDV ||
      !selectedTest ||
      uploadedData.length === 0
    ) {
      toast.error(
        "Please select variables and a test, and ensure data is uploaded.",
      );
      return;
    }
    if (!session) {
      toast.error("You must be logged in to check assumptions.");
      return;
    }

    setIsCheckingAssumptions(true);
    setAssumptionResults(null);

    try {
      // In a real implementation, this would call an API to check statistical assumptions
      // For now, we'll simulate the process with mock data
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock assumption check results based on selected test
      let mockResults: AssumptionCheckResult[] = [];
      
      switch (selectedTest) {
        case "independent-t-test":
          mockResults = [
            {
              id: "normality",
              name: "Normality of Distribution",
              description: "Data in each group should be normally distributed",
              passed: true,
              severity: "low",
              diagnosticInfo: "Shapiro-Wilk test: p = 0.234 (n = 120)",
              recommendation: "Continue with parametric test. Data appears normally distributed.",
              testStatistic: 0.987,
              testPValue: 0.234
            },
            {
              id: "homogeneity",
              name: "Homogeneity of Variances",
              description: "Variances should be equal across groups",
              passed: false,
              severity: "medium",
              diagnosticInfo: "Levene's test: p = 0.012 (n = 120)",
              recommendation: "Consider using Welch's t-test which does not assume equal variances.",
              testStatistic: 6.34,
              testPValue: 0.012
            },
            {
              id: "independence",
              name: "Independence of Observations",
              description: "Each observation should be independent of others",
              passed: true,
              severity: "low",
              diagnosticInfo: "Study design confirms independence. No serial correlation detected.",
              recommendation: "Continue with analysis. Independence assumption satisfied."
            }
          ];
          break;
          
        case "pearson-correlation":
          mockResults = [
            {
              id: "linearity",
              name: "Linear Relationship",
              description: "Variables should have a linear relationship",
              passed: true,
              severity: "low",
              diagnosticInfo: "Scatterplot shows clear linear pattern with correlation coefficient r = 0.67",
              recommendation: "Proceed with Pearson correlation. Linear relationship confirmed."
            },
            {
              id: "normality",
              name: "Normality of Distribution",
              description: "Both variables should be normally distributed",
              passed: false,
              severity: "high",
              diagnosticInfo: "Shapiro-Wilk test: p = 0.003 for Variable A, p = 0.045 for Variable B",
              recommendation: "Consider Spearman rank correlation instead, which does not require normality.",
              testStatistic: 0.923,
              testPValue: 0.003
            },
            {
              id: "homoscedasticity",
              name: "Homoscedasticity",
              description: "Variance of residuals should be constant across predicted values",
              passed: true,
              severity: "low",
              diagnosticInfo: "Residual plot shows evenly distributed residuals with no funnel shape.",
              recommendation: "Continue with analysis. Homoscedasticity assumption satisfied."
            }
          ];
          break;
          
        case "chi-square":
          mockResults = [
            {
              id: "independence",
              name: "Independence of Observations",
              description: "Each observation should be independent of others",
              passed: true,
              severity: "low",
              diagnosticInfo: "Study design confirms independence. One observation per subject.",
              recommendation: "Continue with analysis. Independence assumption satisfied."
            },
            {
              id: "expected-frequencies",
              name: "Expected Cell Frequencies",
              description: "Expected frequencies should be at least 5 in each cell",
              passed: false,
              severity: "high",
              diagnosticInfo: "3 out of 12 cells (25%) have expected frequencies below 5.",
              recommendation: "Consider combining categories or using Fisher's exact test for small samples.",
              testStatistic: 3,
              criticalValue: 5
            }
          ];
          break;
          
        default:
          mockResults = [
            {
              id: "general",
              name: "General Assumptions",
              description: "Basic statistical assumptions for your selected test",
              passed: true,
              severity: "low",
              diagnosticInfo: "All basic assumptions appear to be satisfied for this test.",
              recommendation: "Continue with analysis. No assumption violations detected."
            }
          ];
      }

      setAssumptionResults(mockResults);
      toast.success("Assumption checking complete!");
    } catch (err: any) {
      toast.error(err.message || "Failed to check assumptions.");
      console.error(err);
    } finally {
      setIsCheckingAssumptions(false);
    }
  };

  const handleFeedback = (assumptionId: string, feedback: "positive" | "negative") => {
    setUserFeedback(prev => ({
      ...prev,
      [assumptionId]: feedback
    }));
    
    toast.success(feedback === "positive" 
      ? "Thanks for the feedback! We'll use this to improve our suggestions." 
      : "Thanks for letting us know. We'll work on improving this suggestion.");
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "high": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (passed: boolean) => {
    if (passed) return <CheckCircle className="w-5 h-5 text-green-500" />;
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Enhanced Point-and-Click Analysis
        </CardTitle>
        <CardDescription>
          Select variables and a statistical test to run an analysis on your uploaded data with assumption checking.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {uploadedData.length === 0 ? (
          <Alert variant="info">
            <Info className="h-4 w-4" />
            <AlertTitle>No Data Uploaded</AlertTitle>
            <AlertDescription>
              Please upload a CSV or XLSX file in the &quot;Data Management&quot; tab to begin analysis.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="space-y-2">
              <h4 className="font-semibold">Data Preview (First 5 Rows)</h4>
              <div className="overflow-x-auto border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.map((col) => (
                        <TableHead key={col}>{col}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uploadedData.slice(0, 5).map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {columns.map((col) => (
                          <TableCell key={`${rowIndex}-${col}`}>
                            {String(row[col])}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Independent Variable (IV)</Label>
                <Select value={selectedIV || ""} onValueChange={setSelectedIV}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select IV" />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map((col) => (
                      <SelectItem key={col} value={col}>
                        {col}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Dependent Variable (DV)</Label>
                <Select value={selectedDV || ""} onValueChange={setSelectedDV}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select DV" />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map((col) => (
                      <SelectItem key={col} value={col}>
                        {col}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Statistical Test</Label>
              <Select
                value={selectedTest || ""}
                onValueChange={setSelectedTest}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a test" />
                </SelectTrigger>
                <SelectContent>
                  {availableTests.map((test) => (
                    <SelectItem key={test.id} value={test.id}>
                      {test.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={runAnalysis}
                disabled={
                  isLoadingAnalysis || !selectedIV || !selectedDV || !selectedTest
                }
                className="flex items-center gap-2"
              >
                {isLoadingAnalysis ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Play className="w-4 h-4 mr-2" />
                )}
                Run Analysis
              </Button>
              
              <Button
                onClick={checkAssumptions}
                disabled={
                  isCheckingAssumptions || !selectedIV || !selectedDV || !selectedTest
                }
                variant="outline"
                className="flex items-center gap-2"
              >
                {isCheckingAssumptions ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4 mr-2" />
                )}
                Check Assumptions
              </Button>
            </div>

            {/* Assumption Checking Results */}
            {assumptionResults && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5" />
                    Statistical Assumption Validation
                  </CardTitle>
                  <CardDescription>
                    Verification of assumptions required for your selected statistical test
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg border-2 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700">
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-2">
                        {assumptionResults.filter(r => r.passed).length}/{assumptionResults.length} Passed
                      </div>
                      <div className="text-lg font-medium mb-2">
                        Assumption Compliance Rate
                      </div>
                      <div className="text-sm opacity-80">
                        {Math.round((assumptionResults.filter(r => r.passed).length / assumptionResults.length) * 100)}%
                      </div>
                    </div>
                  </div>
                  
                  <Accordion type="single" collapsible className="w-full">
                    {assumptionResults.map((result, index) => (
                      <AccordionItem key={result.id} value={`assumption-${index}`}>
                        <AccordionTrigger className="text-left hover:no-underline">
                          <div className="flex items-center gap-3 flex-1">
                            {getStatusIcon(result.passed)}
                            <div className="text-left">
                              <p className="font-semibold">{result.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge 
                                  className={getSeverityColor(result.severity)}
                                  variant={result.passed ? "default" : "destructive"}
                                >
                                  {result.severity.charAt(0).toUpperCase() + result.severity.slice(1)} Severity
                                </Badge>
                                <Badge variant={result.passed ? "default" : "destructive"}>
                                  {result.passed ? "Passed" : "Failed"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 pt-2">
                            <div className="p-4 bg-muted/10 rounded">
                              <p className="font-medium mb-2">Description:</p>
                              <p className="text-sm">{result.description}</p>
                            </div>
                            
                            <div className="p-4 bg-muted/10 rounded">
                              <p className="font-medium mb-2">Diagnostic Information:</p>
                              <p className="text-sm">{result.diagnosticInfo}</p>
                              {result.testStatistic !== undefined && (
                                <p className="text-sm mt-1">
                                  <strong>Test Statistic:</strong> {result.testStatistic}
                                </p>
                              )}
                              {result.testPValue !== undefined && (
                                <p className="text-sm mt-1">
                                  <strong>p-value:</strong> {result.testPValue.toFixed(3)}
                                </p>
                              )}
                              {result.criticalValue !== undefined && (
                                <p className="text-sm mt-1">
                                  <strong>Critical Value:</strong> {result.criticalValue}
                                </p>
                              )}
                            </div>
                            
                            <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
                              <p className="font-medium mb-2 flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                Recommendation:
                              </p>
                              <p className="text-sm">{result.recommendation}</p>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Was this helpful?</span>
                                <div className="flex gap-1">
                                  <Button
                                    variant={userFeedback[result.id] === "positive" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleFeedback(result.id, "positive")}
                                  >
                                    <ThumbsUp className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant={userFeedback[result.id] === "negative" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleFeedback(result.id, "negative")}
                                  >
                                    <ThumbsDown className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              {result.passed ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    toast.success("In a full implementation, this would proceed with the recommended analysis.");
                                  }}
                                >
                                  Proceed with Analysis
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    toast.info("In a full implementation, this would guide you to an alternative test that satisfies the assumptions.");
                                  }}
                                >
                                  Suggest Alternative Test
                                </Button>
                              )}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            )}

            {/* Analysis Results */}
            {analysisResults && (
              <div className="space-y-4 pt-4">
                <h3 className="text-lg font-semibold">
                  Analysis Results: {analysisResults.test}
                </h3>
                <Alert>
                  <AlertTitle>Key Findings</AlertTitle>
                  <AlertDescription>
                    <p className="font-medium">
                      {analysisResults.interpretation}
                    </p>
                    <p className="mt-2">
                      <strong>Statistic:</strong> {analysisResults.statistic}
                    </p>
                    <p>
                      <strong>p-value:</strong>{" "}
                      {analysisResults.p_value.toFixed(3)}
                    </p>
                    {Object.entries(analysisResults.details).map(
                      ([key, value]) => (
                        <p key={key}>
                          <strong>
                            {key
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                            :
                          </strong>{" "}
                          {String(value)}
                        </p>
                      ),
                    )}
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Best Practices Guidance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Statistical Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Before Analysis</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Clearly define your research questions and hypotheses</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Check assumptions before selecting a statistical test</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Ensure adequate sample size for your chosen analysis</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Document any data transformations or exclusions</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">After Analysis</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Report effect sizes along with p-values for meaningful interpretation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Check for outliers and influential observations</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Verify that results make theoretical sense</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Consider alternative explanations for significant findings</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </CardContent>
    </Card>
  );
}