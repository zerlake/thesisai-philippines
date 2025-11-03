"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Textarea } from "./ui/textarea";
import { useAuth } from "./auth-provider";
import { toast } from "sonner";
import { Copy, FilePlus2, History, Languages, Loader2, CheckCircle, AlertTriangle, XCircle, BarChart3, SpellCheck, Zap, Eye, ThumbsUp, ThumbsDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useRouter } from "next/navigation";
import { Badge } from "./ui/badge";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Progress } from "./ui/progress";

type ParaphraseMode = "standard" | "formal" | "simple" | "expand";

type QualityMetrics = {
  originality: number;
  readability: number;
  clarity: number;
  fluency: number;
  semanticPreservation: number;
};

type QualityIssue = {
  id: string;
  type: "grammar" | "meaning" | "fluency" | "style" | "coherence";
  severity: "low" | "medium" | "high";
  originalText: string;
  suggestedText: string;
  explanation: string;
  position: { start: number; end: number };
};

type QualityAssessment = {
  overallScore: number;
  metrics: QualityMetrics;
  issues: QualityIssue[];
  improvementSuggestions: string[];
};

export function EnhancedParaphrasingTool() {
  const { session, supabase, profile } = useAuth();
  const user = session?.user;
  const router = useRouter();
  const MINIMUM_WORD_COUNT = 10;
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [mode, setMode] = useState<ParaphraseMode>("standard");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [qualityAssessment, setQualityAssessment] = useState<QualityAssessment | null>(null);
  const [isAssessingQuality, setIsAssessingQuality] = useState(false);
  const [userFeedback, setUserFeedback] = useState<{[key: string]: "positive" | "negative" | null}>({});

  // Calculate word count
  const inputWordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const outputWordCount = outputText.trim() ? outputText.trim().split(/\s+/).length : 0;

  const handleParaphrase = async () => {
    if (!inputText.trim()) {
      toast.error("Please enter some text to paraphrase.");
      return;
    }
    if (!session) {
      toast.error("You must be logged in to use this feature.");
      return;
    }

    setIsLoading(true);
    setOutputText("");
    setQualityAssessment(null);

    try {
      const response = await fetch(
        "https://dnyjgzzfyzrsucucexhy.supabase.co/functions/v1/paraphrase-text",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRueWpnenpmeXpyc3VjdWNleGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NDAxMjcsImV4cCI6MjA3MzAxNjEyN30.elZ6r3JJjdwGUadSzQ1Br5EdGeqZIEr67Z5QB_Q3eMw",
          },
          body: JSON.stringify({ text: inputText, mode }),
        },
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || `Request failed with status ${response.status}`);

      setOutputText(data.paraphrasedText);
      toast.success("Text paraphrased successfully!");
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQualityAssessment = async () => {
    if (!inputText.trim() || !outputText.trim()) {
      toast.error("Please paraphrase text first before assessing quality.");
      return;
    }
    if (!session) {
      toast.error("You must be logged in to perform quality assessment.");
      return;
    }

    setIsAssessingQuality(true);
    setQualityAssessment(null);

    try {
      // In a real implementation, this would call an API to assess paraphrase quality
      // For now, we'll simulate the process with mock data
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock quality assessment results
      const mockMetrics: QualityMetrics = {
        originality: 85,
        readability: 78,
        clarity: 82,
        fluency: 75,
        semanticPreservation: 92
      };

      const mockIssues: QualityIssue[] = [
        {
          id: "1",
          type: "fluency",
          severity: "medium",
          originalText: "The research findings indicates",
          suggestedText: "The research findings indicate",
          explanation: "Subject-verb disagreement. 'Findings' is plural, so verb should be 'indicate' not 'indicates'.",
          position: { start: 45, end: 75 }
        },
        {
          id: "2",
          type: "style",
          severity: "low",
          originalText: "very important",
          suggestedText: "crucial",
          explanation: "Using more academic vocabulary would enhance the formality of your writing.",
          position: { start: 120, end: 135 }
        },
        {
          id: "3",
          type: "coherence",
          severity: "high",
          originalText: "In addition to this, it should also be noted that the results were quite interesting.",
          suggestedText: "Furthermore, the results revealed significant insights.",
          explanation: "Redundant phrasing reduces clarity. Simplify for better academic tone.",
          position: { start: 200, end: 285 }
        }
      ];

      const mockSuggestions = [
        "Consider using more precise academic terminology",
        "Simplify complex sentence structures for better readability",
        "Ensure subject-verb agreement throughout your text",
        "Vary sentence length to improve rhythm and flow",
        "Replace vague terms like 'very' and 'quite' with stronger modifiers"
      ];

      const overallScore = Math.round(
        (mockMetrics.originality + 
         mockMetrics.readability + 
         mockMetrics.clarity + 
         mockMetrics.fluency + 
         mockMetrics.semanticPreservation) / 5
      );

      const mockAssessment: QualityAssessment = {
        overallScore,
        metrics: mockMetrics,
        issues: mockIssues,
        improvementSuggestions: mockSuggestions
      };

      setQualityAssessment(mockAssessment);
      toast.success("Quality assessment complete!");
    } catch (error: any) {
      toast.error(error.message || "Failed to assess paraphrase quality.");
      console.error(error);
    } finally {
      setIsAssessingQuality(false);
    }
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    toast.success("Copied to clipboard!");
  };

  const handleSaveAsDraft = async () => {
    if (!user || !outputText) return;
    setIsSaving(true);

    const { data: newDoc, error } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        title: "Paraphrased Text",
        content: `<p>${outputText.replace(/\n/g, "</p><p>")}</p>`,
      })
      .select("id")
      .single();

    if (error) {
      toast.error("Failed to save draft.");
    } else if (newDoc) {
      toast.success("Saved as a new draft!");
      router.push(`/drafts/${newDoc.id}`);
    }
    setIsSaving(false);
  };

  const handleFeedback = (issueId: string, feedback: "positive" | "negative") => {
    setUserFeedback(prev => ({
      ...prev,
      [issueId]: feedback
    }));
    
    toast.success(feedback === "positive" 
      ? "Thanks for the feedback! We'll use this to improve our suggestions." 
      : "Thanks for letting us know. We'll work on improving this suggestion.");
  };

  const getMetricColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getMetricBgColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low": return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-700";
      case "high": return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700";
      default: return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/50 dark:text-gray-200 dark:border-gray-700";
    }
  };

  if (profile?.plan === "free") {
    return (
      <div className="max-w-4xl mx-auto">
        <UpgradePrompt
          featureName="Unlimited Paraphrasing Tools"
          description="The Pro plan gives you unlimited access to our powerful paraphrasing tools to help you improve clarity and avoid plagiarism."
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="w-5 h-5" />
            Enhanced Paraphrasing Tool
          </CardTitle>
          <CardDescription>
            Rewrite sentences and paragraphs to improve clarity, vary your language, and avoid plagiarism with quality assessment.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {outputText ? (
            <div>
              <Textarea
                value={inputText}
                readOnly
                className="min-h-[200px] resize-y"
              />
            </div>
          ) : (
            <div>
              <Textarea
                id="text-input"
                placeholder="Enter your original text here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[200px] resize-y"
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Word count: {inputWordCount} (minimum {MINIMUM_WORD_COUNT})
              </p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {outputText ? (
            <Button
              onClick={() => {
                setOutputText("");
                setQualityAssessment(null);
              }}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Start New Paraphrase
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Select value={mode} onValueChange={(value: ParaphraseMode) => setMode(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Paraphrase</SelectItem>
                  <SelectItem value="formal">Make More Formal</SelectItem>
                  <SelectItem value="simple">Simplify</SelectItem>
                  <SelectItem value="expand">Expand</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleParaphrase} disabled={isLoading || !inputText.trim() || !session}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Languages className="w-4 h-4 mr-2" />
                )}
                {isLoading ? "Rewriting..." : "Rewrite Text"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Output Text Area */}
      {outputText && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Paraphrased Text
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveAsDraft}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FilePlus2 className="w-4 h-4 mr-2" />
                  )}
                  Save as Draft
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleQualityAssessment}
                  disabled={isAssessingQuality}
                >
                  {isAssessingQuality ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <SpellCheck className="w-4 h-4 mr-2" />
                  )}
                  Assess Quality
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={outputText}
              readOnly
              className="min-h-[250px] resize-y"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Word count: {outputWordCount}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quality Assessment Results */}
      {qualityAssessment && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Paraphrase Quality Assessment
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  toast.info("In a full implementation, this would download a quality report.");
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
                <CardContent className="p-4 text-center">
                  <div className="text-4xl font-bold mb-2 text-green-600 dark:text-green-300">
                    {qualityAssessment.overallScore}%
                  </div>
                  <div className="text-lg font-medium mb-2">
                    Overall Quality
                  </div>
                  <div className="text-sm opacity-80">
                    Based on 5 key metrics
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
                <CardContent className="p-4 text-center">
                  <div className="text-4xl font-bold mb-2 text-blue-600 dark:text-blue-300">
                    {qualityAssessment.metrics.originality}%
                  </div>
                  <div className="text-lg font-medium mb-2">
                    Originality
                  </div>
                  <div className="text-sm opacity-80">
                    Distinct from original text
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700">
                <CardContent className="p-4 text-center">
                  <div className="text-4xl font-bold mb-2 text-purple-600 dark:text-purple-300">
                    {qualityAssessment.metrics.semanticPreservation}%
                  </div>
                  <div className="text-lg font-medium mb-2">
                    Meaning Preserved
                  </div>
                  <div className="text-sm opacity-80">
                    Content accuracy maintained
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Metrics */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Quality Metrics Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Readability</span>
                    <span className={getMetricColor(qualityAssessment.metrics.readability)}>
                      {qualityAssessment.metrics.readability}%
                    </span>
                  </div>
                  <Progress 
                    value={qualityAssessment.metrics.readability} 
                    className="mb-3" 
                    indicatorClassName={getMetricBgColor(qualityAssessment.metrics.readability)}
                  />
                  
                  <div className="flex justify-between text-sm mb-1">
                    <span>Clarity</span>
                    <span className={getMetricColor(qualityAssessment.metrics.clarity)}>
                      {qualityAssessment.metrics.clarity}%
                    </span>
                  </div>
                  <Progress 
                    value={qualityAssessment.metrics.clarity} 
                    className="mb-3" 
                    indicatorClassName={getMetricBgColor(qualityAssessment.metrics.clarity)}
                  />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Fluency</span>
                    <span className={getMetricColor(qualityAssessment.metrics.fluency)}>
                      {qualityAssessment.metrics.fluency}%
                    </span>
                  </div>
                  <Progress 
                    value={qualityAssessment.metrics.fluency} 
                    className="mb-3" 
                    indicatorClassName={getMetricBgColor(qualityAssessment.metrics.fluency)}
                  />
                  
                  <div className="flex justify-between text-sm mb-1">
                    <span>Originality</span>
                    <span className={getMetricColor(qualityAssessment.metrics.originality)}>
                      {qualityAssessment.metrics.originality}%
                    </span>
                  </div>
                  <Progress 
                    value={qualityAssessment.metrics.originality} 
                    className="mb-3" 
                    indicatorClassName={getMetricBgColor(qualityAssessment.metrics.originality)}
                  />
                </div>
              </div>
            </div>

            {/* Quality Issues */}
            {qualityAssessment.issues.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Quality Issues Detected</h3>
                <Accordion
                  type="single"
                  collapsible
                  className="w-full max-h-[600px] overflow-y-auto pr-2"
                >
                  {qualityAssessment.issues.map((issue) => (
                    <AccordionItem key={issue.id} value={`issue-${issue.id}`}>
                      <AccordionTrigger className="text-left hover:no-underline">
                        <div className="flex items-center gap-3 flex-1">
                          <Badge
                            variant="outline"
                            className={getSeverityColor(issue.severity)}
                          >
                            {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)} Severity
                          </Badge>
                          <span className="font-semibold">
                            {issue.type.charAt(0).toUpperCase() + issue.type.slice(1)} Issue
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-destructive/10 border-l-4 border-destructive rounded">
                              <p className="font-medium mb-2">Problematic Text:</p>
                              <p className="text-sm">&quot;{issue.originalText}&quot;</p>
                            </div>
                            
                            <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
                              <p className="font-medium mb-2">Suggested Fix:</p>
                              <p className="text-sm">&quot;{issue.suggestedText}&quot;</p>
                            </div>
                          </div>
                          
                          <div className="p-4 bg-muted/10 rounded">
                            <p className="font-medium mb-2">Explanation:</p>
                            <p className="text-sm">{issue.explanation}</p>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">Was this helpful?</span>
                              <div className="flex gap-1">
                                <Button
                                  variant={userFeedback[issue.id] === "positive" ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handleFeedback(issue.id, "positive")}
                                >
                                  <ThumbsUp className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant={userFeedback[issue.id] === "negative" ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handleFeedback(issue.id, "negative")}
                                >
                                  <ThumbsDown className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                toast.info("In a full implementation, this would apply the suggested fix to your text.");
                              }}
                            >
                              <Zap className="w-4 h-4 mr-2" />
                              Apply Fix
                            </Button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}

            {/* Improvement Suggestions */}
            {qualityAssessment.improvementSuggestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Improvement Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {qualityAssessment.improvementSuggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Paraphrasing Best Practices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="dos">
              <AccordionTrigger className="text-left hover:no-underline">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-semibold">Dos</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Change sentence structure, not just synonyms</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Maintain the original meaning and intent</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Cite the original source when paraphrasing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Use your own words and sentence structures</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Paraphrase entire paragraphs, not just phrases</span>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="donts">
              <AccordionTrigger className="text-left hover:no-underline">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span className="font-semibold">Don'ts</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Simply swap words with synonyms without changing structure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Omit important information from the original text</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Forget to cite the original source</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Copy the original sentence structure too closely</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>Paraphrase just to meet word count requirements</span>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Recent Checks History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <History className="w-5 h-5" />
            Recent Web Checks
          </CardTitle>
          <CardDescription>
            Your last 5 originality checks against the web.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Word Count</TableHead>
                <TableHead className="text-right">Similarity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingHistory ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-16" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-6 w-12 ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : history.length > 0 ? (
                history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {isMounted &&
                        formatDistanceToNow(new Date(item.created_at), {
                          addSuffix: true,
                        })}
                    </TableCell>
                    <TableCell>{item.word_count}</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className={getScoreBadgeColor(item.plagiarism_percent)}
                      >
                        {item.plagiarism_percent}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center h-24">
                    No check history yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper functions
const getScoreColor = (score: number) => {
  if (score < 15)
    return "text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300";
  if (score < 40)
    return "text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-300";
  return "text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300";
};

const getScoreBadgeColor = (score: number) => {
  if (score < 15)
    return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-200 dark:border-green-700";
  if (score < 40)
    return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-700";
  return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700";
};

const getScoreIcon = (score: number) => {
  if (score < 10) return <CheckCircle className="w-5 h-5 text-green-600" />;
  return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
};