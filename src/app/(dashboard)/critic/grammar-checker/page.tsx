'use client';

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { redirect } from "next/navigation";
import { BrandedLoader } from "@/components/branded-loader";
import { callPuterAI } from "@/lib/puter-ai-wrapper";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  SpellCheck,
  FileText,
  Loader2,
  Copy,
  RefreshCw,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

type GrammarIssue = {
  id: string;
  type: 'error' | 'warning' | 'suggestion';
  category: string;
  original: string;
  suggestion: string;
  explanation: string;
  position: { start: number; end: number };
};

type AnalysisResult = {
  issues: GrammarIssue[];
  correctedText: string;
  stats: {
    totalIssues: number;
    errors: number;
    warnings: number;
    suggestions: number;
    readabilityScore: number;
  };
};

const sampleTexts = [
  {
    title: "Academic Essay with Errors",
    content: `The researchs conducted by Smith et al. (2023) shows that climate change have significant impacts on biodiversity. Their finding suggests that many species is migrating to higher altitudes. However, the datas collected from various regions indicates different patterns.

According to the study, aproximately 40% of species has been affected. The researchers argues that immediate action are necessary to prevent further damage. This phenomenom has been observed in multiple continents, including Africa, Asia, and in Europe.

The methodology used in this study were comprehensive and rigourous. The team collected samples from over 100 locations, analizing each one carefully. Their conclusions is supported by previous researchs conducted between 2015-2022.`
  },
  {
    title: "Thesis Introduction Draft",
    content: `This thesis examine the relationship between social media usage and academic performance among college students. The rapid growth of social media platforms have transformed how students communicate and access informations. Many educator express concerns about the potential negative effects of excessive social media use.

Previous studies on this topic has yielded mixed results. Some researcher found that moderate social media use can actually enhance learning outcomes, while other suggest that it primarly serves as a distraction. The inconsistancy in findings highlight the need for more nuanced research.

This study aim to address these gaps by investigating specific social media behaviors and their correlation with academic metrics. Data will be collected from aproximately 500 students accross three universities. The research metodology combines quantitative surveys with qualitative interviews.`
  },
  {
    title: "Literature Review Section",
    content: `The literature on artificial intelligence in healthcare have expanded significantly over the past decade. According to recent meta-analyses, AI systems demonstrates high accuracy in diagnostic tasks, particulary in medical imaging (Johnson & Lee, 2022). However, the implementation of these technologies faces several challenge.

One of the primary concern is the lack of interpretibility in deep learning models. Healthcare professionals often requires explanations for AI-driven recommendations, yet many algorithms operates as "black boxes" (Chen et al., 2021). This issue have led to reluctance in adoption, despite evidence of improved outcomes.

Furthermore, ethical considerations plays a crucial role in AI deployment. Questions about data privacy, algorithmic bias, and accountability remains largely unresolved. The regulatory frameworks in most countries has not kept pace with technological advancements, creating uncertainity for healthcare institutions.`
  }
];

export default function GrammarCheckerPage() {
  const authContext = useAuth();
  const [inputText, setInputText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<GrammarIssue | null>(null);
  const [showSampleMenu, setShowSampleMenu] = useState(false);

  const loadSampleText = (sample: typeof sampleTexts[0]) => {
    setInputText(sample.content);
    setResult(null);
    setShowSampleMenu(false);
    toast.success(`Loaded: ${sample.title}`);
  };

  if (!authContext) {
    return <BrandedLoader />;
  }

  const { session, profile, isLoading } = authContext;

  if (!isLoading && (!session || profile?.role !== 'critic')) {
    redirect('/login');
  }

  if (isLoading) {
    return <BrandedLoader />;
  }

  const handleAnalyze = async () => {
    if (!inputText.trim()) {
      toast.error("Please enter some text to analyze");
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const prompt = `You are an expert academic editor. Analyze the following text for grammar, spelling, punctuation, and style issues.

Text to analyze:
"${inputText}"

Respond in this exact JSON format (no markdown, just JSON):
{
  "issues": [
    {
      "id": "1",
      "type": "error|warning|suggestion",
      "category": "Grammar|Spelling|Punctuation|Style|Clarity",
      "original": "the problematic text",
      "suggestion": "the corrected text",
      "explanation": "brief explanation of the issue"
    }
  ],
  "correctedText": "the full text with all corrections applied",
  "stats": {
    "totalIssues": number,
    "errors": number,
    "warnings": number,
    "suggestions": number,
    "readabilityScore": number between 0-100
  }
}

Focus on academic writing standards. Be thorough but constructive.`;

      const response = await callPuterAI(prompt, { temperature: 0.3, max_tokens: 2000 });

      // Parse the JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        // Add position data for highlighting (simplified)
        parsed.issues = parsed.issues.map((issue: any, idx: number) => ({
          ...issue,
          id: String(idx + 1),
          position: { start: 0, end: 0 }
        }));
        setResult(parsed);
        toast.success(`Found ${parsed.stats.totalIssues} issues`);
      } else {
        throw new Error("Could not parse response");
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      toast.error("Failed to analyze text. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopyCorrection = () => {
    if (result?.correctedText) {
      navigator.clipboard.writeText(result.correctedText);
      toast.success("Corrected text copied to clipboard");
    }
  };

  const handleApplyCorrection = (issue: GrammarIssue) => {
    const newText = inputText.replace(issue.original, issue.suggestion);
    setInputText(newText);
    toast.success("Correction applied");
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'suggestion':
        return <Lightbulb className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-gray-500" />;
    }
  };

  const getIssueBadgeColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'warning':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'suggestion':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <SpellCheck className="h-8 w-8" />
            Grammar Checker
          </h1>
          <p className="text-muted-foreground">
            Analyze and correct grammar, spelling, and style issues in academic writing
          </p>
        </div>
        <DropdownMenu open={showSampleMenu} onOpenChange={setShowSampleMenu}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              Load Sample
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            {sampleTexts.map((sample, index) => (
              <DropdownMenuItem
                key={index}
                onClick={() => loadSampleText(sample)}
                className="cursor-pointer"
              >
                <FileText className="h-4 w-4 mr-2" />
                {sample.title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Input Text
            </CardTitle>
            <CardDescription>
              Paste or type the text you want to analyze
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste the manuscript text here for grammar analysis..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[400px] resize-none font-mono text-sm"
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {inputText.split(/\s+/).filter(Boolean).length} words
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setInputText("")}
                  disabled={!inputText}
                >
                  Clear
                </Button>
                <Button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !inputText.trim()}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <SpellCheck className="mr-2 h-4 w-4" />
                      Check Grammar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>
              Grammar, spelling, and style issues found in the text
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <SpellCheck className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Analysis Yet</h3>
                <p className="text-muted-foreground text-sm">
                  Enter text and click "Check Grammar" to start
                </p>
              </div>
            ) : (
              <Tabs defaultValue="issues" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="issues">
                    Issues ({result.stats.totalIssues})
                  </TabsTrigger>
                  <TabsTrigger value="corrected">
                    Corrected
                  </TabsTrigger>
                  <TabsTrigger value="stats">
                    Stats
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="issues">
                  <ScrollArea className="h-[350px] pr-4">
                    {result.issues.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <CheckCircle2 className="h-12 w-12 text-green-500 mb-2" />
                        <p className="text-green-600 font-medium">No issues found!</p>
                        <p className="text-sm text-muted-foreground">The text appears to be grammatically correct.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {result.issues.map((issue) => (
                          <div
                            key={issue.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                              selectedIssue?.id === issue.id ? 'bg-muted' : 'hover:bg-muted/50'
                            }`}
                            onClick={() => setSelectedIssue(issue)}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2">
                                {getIssueIcon(issue.type)}
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Badge className={getIssueBadgeColor(issue.type)}>
                                      {issue.category}
                                    </Badge>
                                  </div>
                                  <p className="text-sm">
                                    <span className="line-through text-red-500">{issue.original}</span>
                                    <ArrowRight className="inline h-3 w-3 mx-2" />
                                    <span className="text-green-500">{issue.suggestion}</span>
                                  </p>
                                  <p className="text-xs text-muted-foreground">{issue.explanation}</p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApplyCorrection(issue);
                                }}
                              >
                                <RefreshCw className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="corrected">
                  <div className="space-y-4">
                    <div className="relative">
                      <Textarea
                        value={result.correctedText}
                        readOnly
                        className="min-h-[300px] resize-none font-mono text-sm"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={handleCopyCorrection}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setInputText(result.correctedText)}
                    >
                      Apply All Corrections to Input
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="stats">
                  <div className="grid gap-4 grid-cols-2">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-red-500">
                            {result.stats.errors}
                          </div>
                          <p className="text-sm text-muted-foreground">Errors</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-yellow-500">
                            {result.stats.warnings}
                          </div>
                          <p className="text-sm text-muted-foreground">Warnings</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className="text-4xl font-bold text-blue-500">
                            {result.stats.suggestions}
                          </div>
                          <p className="text-sm text-muted-foreground">Suggestions</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <div className={`text-4xl font-bold ${
                            result.stats.readabilityScore >= 70 ? 'text-green-500' :
                            result.stats.readabilityScore >= 50 ? 'text-yellow-500' : 'text-red-500'
                          }`}>
                            {result.stats.readabilityScore}
                          </div>
                          <p className="text-sm text-muted-foreground">Readability Score</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
