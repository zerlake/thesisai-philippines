"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Badge } from "./ui/badge";
import {
  Loader2,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  History,
  Download,
  RefreshCw,
  Quote,
  Save,
  Library,
  Globe,
  ShieldCheck,
  GraduationCap,
  Calendar,
  Target,
  BookOpen,
} from "lucide-react";
import { useAuth } from "./auth-provider";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "./ui/skeleton";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import Link from "next/link";
import { UpgradePrompt } from "./upgrade-prompt";
import { checkThesisDatabaseForPlagiarism, analyzeHistoricalTopicOccurrence } from "@/services/thesis-database-service";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { useRouter } from "next/navigation";
import { Progress } from "./ui/progress";

const MINIMUM_WORD_COUNT = 20;

// Web Check Types
type MatchSource = { url: string; title: string };
type Match = { sentence: string; sources: MatchSource[] };
type WebOriginalityResult = {
  score: number;
  totalSentences: number;
  matchedSentences: number;
  matches: Match[];
  wordCount: number;
};

type CheckHistoryItem = {
  id: string;
  plagiarism_percent: number;
  word_count: number;
  created_at: string;
};

// Internal Check Types
type InternalMatch = { documentId: string; title: string; similarity: number };
type InternalOriginalityResult = {
  highestScore: number;
  matches: InternalMatch[];
};

// Thesis Database Types
type ThesisRecord = {
  id: string;
  title: string;
  author: string;
  institution: string;
  year: number;
  abstract: string;
  fullText: string;
  keywords: string[];
  field: string;
};

type ThesisSimilarityResult = {
  thesis: ThesisRecord;
  similarity: number;
  matchingSections: { source: string; match: string }[];
};

type HistoricalTopicAnalysis = {
  topicFrequency: { year: number; count: number }[];
  emergingTrends: { topic: string; firstAppearance: number; recentGrowth: number }[];
  saturatedFields: { field: string; recentDecline: number }[];
  gapOpportunities: { field: string; lowActivityPeriod: string }[];
};

export function EnhancedOriginalityChecker() {
  const { session, supabase, profile } = useAuth();
  const user = session?.user;
  const router = useRouter();
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const reportRef = React.useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // State for Web Check
  const [webResults, setWebResults] = useState<WebOriginalityResult | null>(
    null,
  );
  const [history, setHistory] = useState<CheckHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isCiting, setIsCiting] = useState<number | null>(null);
  const [citationResults, setCitationResults] = useState<{
    [key: number]: { inText: string; reference: string };
  }>({});
  const [isSavingCitation, setIsSavingCitation] = useState<number | null>(null);

  // State for Internal Check
  const [internalResults, setInternalResults] =
    useState<InternalOriginalityResult | null>(null);

  // State for Thesis Database Check
  const [thesisResults, setThesisResults] = useState<ThesisSimilarityResult[] | null>(null);
  const [historicalAnalysis, setHistoricalAnalysis] = useState<HistoricalTopicAnalysis | null>(null);
  const [isCheckingThesisDb, setIsCheckingThesisDb] = useState(false);
  
  // State for Gap Analysis
  const [gapAnalysis, setGapAnalysis] = useState<any>(null);
  const [isAnalyzingGaps, setIsAnalyzingGaps] = useState(false);

  const wordCount = inputText
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchHistory = React.useCallback(async () => {
    if (!session) return;
    setIsLoadingHistory(true);
    const { data, error } = await supabase.rpc("get_user_check_history", {
      p_limit: 5,
    });
    if (error) {
      toast.error("Failed to load check history.");
    } else {
      setHistory(data || []);
    }
    setIsLoadingHistory(false);
  }, [session, supabase]);

  React.useEffect(() => {
    if (profile?.plan !== "free") {
      fetchHistory();
    } else {
      setIsLoadingHistory(false);
    }
  }, [fetchHistory, profile]);

  const handleCheck = async (checkType: "web" | "internal" | "gaps" | "thesis" | "historical") => {
    if (wordCount < MINIMUM_WORD_COUNT) {
      setError(`Text must be at least ${MINIMUM_WORD_COUNT} words long.`);
      return;
    }
    if (!session) {
      setError("You must be logged in to perform this check.");
      return;
    }

    setIsLoading(true);
    setIsCheckingThesisDb(true);
    setError("");
    setWebResults(null);
    setInternalResults(null);
    setThesisResults(null);
    setHistoricalAnalysis(null);

    try {
      if (checkType === "thesis") {
        // Handle thesis database plagiarism check
        const results = await checkThesisDatabaseForPlagiarism(inputText);
        setThesisResults(results);
        toast.success(`Thesis database check complete! Found ${results.length} potential matches.`);
      } else if (checkType === "historical") {
        // Handle historical topic analysis
        // For demonstration, we'll use generic field and keywords
        const field = "General Research";
        const keywords = inputText.split(/\s+/).filter(word => word.length > 4).slice(0, 5);
        const analysis = await analyzeHistoricalTopicOccurrence(field, keywords);
        setHistoricalAnalysis(analysis);
        toast.success("Historical topic analysis complete!");
      } else if (checkType === "gaps") {
        // Handle research gap analysis
        await handleGapAnalysis();
      } else {
        const functionName =
          checkType === "web" ? "check-plagiarism" : "check-internal-plagiarism";
        const { data, error: functionError } = await supabase.functions.invoke(
          functionName,
          {
            body: { text: inputText },
          },
        );

        if (functionError) throw new Error(functionError.message);
        if (data.error) throw new Error(data.error);

        if (checkType === "web") {
          setWebResults(data);
          await fetchHistory();
        } else {
          setInternalResults(data);
        }
        toast.success(`Originality check (${checkType}) complete!`);
      }
    } catch (error: any) {
      const errorMessage = error.message || "An unknown error occurred.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGapAnalysis = async () => {
    if (wordCount < MINIMUM_WORD_COUNT) {
      setError(`Text must be at least ${MINIMUM_WORD_COUNT} words long.`);
      return;
    }
    if (!session) {
      setError("You must be logged in to perform gap analysis.");
      return;
    }

    setIsAnalyzingGaps(true);
    setGapAnalysis(null);
    setError("");

    try {
      // In a real implementation, this would call an API to analyze research gaps
      // For now, we'll simulate the process with mock data
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock gap analysis results
      const mockGaps: ResearchGap[] = [
        {
          id: "1",
          title: "Long-term Impact of AI in Education",
          description: "While numerous studies have examined immediate effects of AI tools in educational settings, there is limited research on long-term outcomes and sustained behavioral changes among students and educators.",
          relevance: 85,
          difficulty: "medium",
          potentialImpact: "high",
          supportingEvidence: [
            "Recent meta-analysis shows diminishing returns after 6 months (Smith et al., 2023)",
            "Longitudinal studies in traditional education show lasting effects take 2+ years (Johnson, 2022)"
          ],
          researchQuestions: [
            "What are the long-term cognitive and behavioral impacts of AI-assisted learning on student development?",
            "How do educator attitudes toward AI evolve over extended implementation periods?",
            "What institutional factors predict sustained AI adoption in educational settings?"
          ],
          methodologySuggestions: [
            "5-year longitudinal study with control and experimental groups",
            "Mixed-methods approach combining quantitative performance data with qualitative interviews",
            "Multi-institution collaboration to ensure diverse sample representation"
          ]
        },
        {
          id: "2",
          title: "Cross-cultural Effectiveness of AI Learning Systems",
          description: "Current AI educational tools are predominantly designed for Western, English-speaking populations, with limited adaptation for diverse cultural and linguistic contexts.",
          relevance: 78,
          difficulty: "high",
          potentialImpact: "high",
          supportingEvidence: [
            "Only 23% of surveyed AI EdTech companies report localization efforts (Global EdTech Report, 2023)",
            "Cultural adaptation studies show 35% performance improvement with culturally-aligned interfaces (Lee & Chen, 2022)"
          ],
          researchQuestions: [
            "How do cultural factors influence user acceptance and effectiveness of AI learning systems?",
            "What adaptation strategies maximize cross-cultural effectiveness of AI educational tools?",
            "How do language-specific features impact learning outcomes in non-English contexts?"
          ],
          methodologySuggestions: [
            "Comparative study across 5+ cultural regions with adapted and non-adapted versions",
            "Ethnographic research methods to identify cultural learning preferences",
            "Collaboration with local educational institutions for authentic context understanding"
          ]
        }
      ];

      const mockAnalysis: GapAnalysis = {
        overallScore: 82,
        identifiedGaps: mockGaps,
        thematicClusters: [
          { theme: "AI Effectiveness", gapCount: 2, papers: [] },
          { theme: "Cultural Adaptation", gapCount: 1, papers: [] }
        ],
        timelineAnalysis: [
          { year: 2020, gapCount: 1, papers: [] },
          { year: 2021, gapCount: 0, papers: [] },
          { year: 2022, gapCount: 2, papers: [] },
          { year: 2023, gapCount: 3, papers: [] },
          { year: 2024, gapCount: 1, papers: [] }
        ],
        citationPattern: {
          highlyCited: [],
          underCited: []
        }
      };

      setGapAnalysis(mockAnalysis);
      toast.success("Research gap analysis complete!");
    } catch (error: any) {
      const errorMessage = error.message || "An unknown error occurred during gap analysis.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsAnalyzingGaps(false);
    }
  };

  const handleNewCheck = () => {
    setWebResults(null);
    setInternalResults(null);
    setGapAnalysis(null);
    setError("");
  };

  const handleExportPdf = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(reportRef.current, {
        cacheBust: true,
        backgroundColor: "white",
        pixelRatio: 2,
      });
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        const imgWidth = img.width;
        const imgHeight = img.height;
        const ratio = imgWidth / imgHeight;
        const finalHeight = pdfWidth / ratio;
        pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, finalHeight);
        pdf.save("originality_report.pdf");
        toast.success("Report downloaded successfully!");
        setIsExporting(false);
      };
    } catch (err) {
      toast.error("Failed to download report.");
      setIsExporting(false);
    }
  };

  const handleSuggestCitation = async (match: Match, index: number) => {
    if (!session) return;
    const source = match.sources[0];
    if (!source) return;
    setIsCiting(index);
    try {
      const { data, error: functionError } = await supabase.functions.invoke(
        "generate-citation-from-source",
        { body: { sentence: match.sentence, sourceUrl: source.url } },
      );
      if (functionError) throw new Error(functionError.message);
      if (data.error) throw new Error(data.error);
      setCitationResults((prev) => ({ ...prev, [index]: data }));
      toast.success("Citation suggestion generated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate citation.");
    } finally {
      setIsCiting(null);
    }
  };

  const handleSaveCitation = async (reference: string, index: number) => {
    if (!session) return;
    setIsSavingCitation(index);
    const { error } = await supabase
      .from("citations")
      .insert({
        user_id: session.user.id,
        content: reference,
        style: "APA 7th Edition",
      });
    if (error) {
      toast.error("Failed to save citation.");
    } else {
      toast.success("Citation saved to your bibliography!");
    }
    setIsSavingCitation(null);
  };

  const handleFeedback = (gapId: string, feedback: "positive" | "negative") => {
    setUserFeedback(prev => ({
      ...prev,
      [gapId]: feedback
    }));
    
    toast.success(feedback === "positive" 
      ? "Thanks for the feedback! We'll use this to improve our suggestions." 
      : "Thanks for letting us know. We'll work on improving this suggestion.");
  };

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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "low": return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-200 dark:border-green-700";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-700";
      case "high": return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700";
      default: return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/50 dark:text-gray-200 dark:border-gray-700";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "low": return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700";
      case "high": return "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-200 dark:border-purple-700";
      default: return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/50 dark:text-gray-200 dark:border-gray-700";
    }
  };

  const matchedWords = webResults
    ? webResults.matches.reduce(
        (sum, m) => sum + m.sentence.split(" ").length,
        0,
      )
    : 0;

  const hasResults = webResults || internalResults || gapAnalysis;

  if (profile?.plan === "free") {
    return (
      <div className="max-w-4xl mx-auto">
        <UpgradePrompt
          featureName="Unlimited Originality Checks"
          description="The Pro plan gives you unlimited access to our powerful originality checker to ensure your work is always plagiarism-free."
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            Enhanced Originality Checker
          </CardTitle>
          <CardDescription>
            Check your text for potential plagiarism against web sources or your
            own saved documents with automated research gap identification.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasResults ? (
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
                placeholder="Paste your text here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[200px] resize-y"
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Word count: {wordCount} (minimum {MINIMUM_WORD_COUNT})
              </p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {hasResults ? (
            <Button
              onClick={handleNewCheck}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Start New Check
            </Button>
          ) : (
            <Tabs defaultValue="web" className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="web" className="flex items-center gap-2">
                  <Globe className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Web Check</span>
                </TabsTrigger>
                <TabsTrigger value="internal" className="flex items-center gap-2">
                  <Library className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Internal Check</span>
                </TabsTrigger>
                <TabsTrigger value="thesis" className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Thesis DB</span>
                </TabsTrigger>
                <TabsTrigger value="historical" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Historical</span>
                </TabsTrigger>
                <TabsTrigger value="gaps" className="flex items-center gap-2">
                  <Target className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Research Gaps</span>
                </TabsTrigger>
                <TabsTrigger value="citation" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Citation Check</span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="web">
                <Button
                  onClick={() => handleCheck("web")}
                  disabled={isLoading || wordCount < MINIMUM_WORD_COUNT}
                  className="w-full mt-4"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking Web...
                    </>
                  ) : (
                    "Check for Originality on the Web"
                  )}
                </Button>
              </TabsContent>
              <TabsContent value="internal">
                <Button
                  onClick={() => handleCheck("internal")}
                  disabled={isLoading || wordCount < MINIMUM_WORD_COUNT}
                  className="w-full mt-4"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking Internally...
                    </>
                  ) : (
                    "Check Against My Saved Drafts"
                  )}
                </Button>
              </TabsContent>
              <TabsContent value="thesis">
                <Button
                  onClick={() => handleCheck("thesis")}
                  disabled={isCheckingThesisDb || wordCount < MINIMUM_WORD_COUNT}
                  className="w-full mt-4"
                  size="lg"
                >
                  {isCheckingThesisDb ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking Thesis Database...
                    </>
                  ) : (
                    "Check Against Thesis Database"
                  )}
                </Button>
              </TabsContent>
              <TabsContent value="historical">
                <Button
                  onClick={() => handleCheck("historical")}
                  disabled={isCheckingThesisDb || wordCount < MINIMUM_WORD_COUNT}
                  className="w-full mt-4"
                  size="lg"
                >
                  {isCheckingThesisDb ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing Historical Trends...
                    </>
                  ) : (
                    "Analyze Historical Topic Trends"
                  )}
                </Button>
              </TabsContent>
              <TabsContent value="gaps">
                <Button
                  onClick={() => handleCheck("gaps")}
                  disabled={isAnalyzingGaps || wordCount < MINIMUM_WORD_COUNT}
                  className="w-full mt-4"
                  size="lg"
                >
                  {isAnalyzingGaps ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing Gaps...
                    </>
                  ) : (
                    "Identify Research Gaps"
                  )}
                </Button>
              </TabsContent>
              <TabsContent value="citation">
                <Button
                  onClick={() => {
                    toast.info("In a full implementation, this would verify citation accuracy.");
                  }}
                  disabled={wordCount < MINIMUM_WORD_COUNT}
                  className="w-full mt-4"
                  size="lg"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Verify Citation Accuracy
                </Button>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Research Gap Analysis Results */}
      {gapAnalysis && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Research Gap Analysis
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPdf}
                disabled={isExporting}
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Download Report
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div
              className={`p-6 rounded-lg border-2 ${getScoreColor(gapAnalysis.overallScore)}`}
            >
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  {gapAnalysis.overallScore}%
                </div>
                <div className="text-lg font-medium mb-2">
                  Research Opportunity Score
                </div>
                <div className="text-sm opacity-80">
                  Based on {gapAnalysis.identifiedGaps.length} identified opportunities
                </div>
              </div>
            </div>

            <Accordion
              type="single"
              collapsible
              className="w-full max-h-[600px] overflow-y-auto pr-2"
            >
              {gapAnalysis.identifiedGaps.map((gap) => (
                <AccordionItem key={gap.id} value={`gap-${gap.id}`}>
                  <AccordionTrigger className="text-left hover:no-underline">
                    <div className="flex items-center gap-3 flex-1">
                      <Badge
                        variant="outline"
                        className={getDifficultyColor(gap.difficulty)}
                      >
                        {gap.difficulty.charAt(0).toUpperCase() + gap.difficulty.slice(1)} Difficulty
                      </Badge>
                      <span className="font-semibold">{gap.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      <div className="p-4 bg-muted/10 border-l-4 border-muted-foreground rounded">
                        <p className="font-medium mb-2">Description:</p>
                        <p className="text-sm">{gap.description}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="font-medium mb-2 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-muted-foreground" />
                            Difficulty & Impact
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Badge 
                              variant="outline" 
                              className={getDifficultyColor(gap.difficulty)}
                            >
                              {gap.difficulty.charAt(0).toUpperCase() + gap.difficulty.slice(1)} Difficulty
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className={getImpactColor(gap.potentialImpact)}
                            >
                              {gap.potentialImpact.charAt(0).toUpperCase() + gap.potentialImpact.slice(1)} Impact
                            </Badge>
                            <Badge variant="secondary">
                              Relevance: {gap.relevance}%
                            </Badge>
                          </div>
                        </div>

                        <div>
                          <p className="font-medium mb-2 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-muted-foreground" />
                            Supporting Evidence
                          </p>
                          <ul className="space-y-1 text-sm">
                            {gap.supportingEvidence.map((evidence, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                                <span>{evidence}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="font-medium mb-2 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-muted-foreground" />
                            Research Questions
                          </p>
                          <ul className="space-y-1 text-sm">
                            {gap.researchQuestions.slice(0, 3).map((question, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                                <span>{question}</span>
                              </li>
                            ))}
                            {gap.researchQuestions.length > 3 && (
                              <li className="text-muted-foreground italic">
                                + {gap.researchQuestions.length - 3} more questions
                              </li>
                            )}
                          </ul>
                        </div>

                        <div>
                          <p className="font-medium mb-2 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-muted-foreground" />
                            Methodology Suggestions
                          </p>
                          <ul className="space-y-1 text-sm">
                            {gap.methodologySuggestions.slice(0, 2).map((method, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                                <span>{method}</span>
                              </li>
                            ))}
                            {gap.methodologySuggestions.length > 2 && (
                              <li className="text-muted-foreground italic">
                                + {gap.methodologySuggestions.length - 2} more suggestions
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Was this helpful?</span>
                          <div className="flex gap-1">
                            <Button
                              variant={userFeedback[gap.id] === "positive" ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleFeedback(gap.id, "positive")}
                            >
                              <ThumbsUp className="w-4 h-4" />
                            </Button>
                            <Button
                              variant={userFeedback[gap.id] === "negative" ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleFeedback(gap.id, "negative")}
                            >
                              <ThumbsDown className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            toast.info("In a full implementation, this would explore this research gap in more detail.");
                          }}
                        >
                          <Target className="w-4 h-4 mr-2" />
                          Explore This Gap
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Thematic Clusters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Theme</TableHead>
                        <TableHead className="text-right">Gaps</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {gapAnalysis.thematicClusters.map((cluster, index) => (
                        <TableRow key={index}>
                          <TableCell>{cluster.theme}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="secondary">{cluster.gapCount}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Timeline Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Year</TableHead>
                        <TableHead className="text-right">Gaps</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {gapAnalysis.timelineAnalysis
                        .filter(entry => entry.gapCount > 0)
                        .map((entry, index) => (
                          <TableRow key={index}>
                            <TableCell>{entry.year}</TableCell>
                            <TableCell className="text-right">
                              <Badge variant="outline">{entry.gapCount}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}

      {webResults && (
        <Card ref={reportRef}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                {getScoreIcon(webResults.score)}Web Originality Report
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPdf}
                disabled={isExporting}
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Download Report
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div
              className={`p-6 rounded-lg border-2 ${getScoreColor(webResults.score)}`}
            >
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  {webResults.score}%
                </div>
                <div className="text-lg font-medium mb-2">
                  Similarity Detected
                </div>
                <div className="text-sm opacity-80">
                  {matchedWords} of {webResults.wordCount} words found in{" "}
                  {webResults.matchedSentences} potentially similar sentences.
                </div>
              </div>
            </div>
            {webResults.matches && webResults.matches.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Potential Matches Found
                </h3>
                <Accordion
                  type="single"
                  collapsible
                  className="w-full max-h-[600px] overflow-y-auto pr-2"
                >
                  {webResults.matches.map((match, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left hover:no-underline">
                        <div className="flex items-start gap-2 flex-1">
                          <Badge
                            variant="destructive"
                            className="mt-1 flex-shrink-0"
                          >
                            Match {index + 1}
                          </Badge>
                          <span className="text-sm line-clamp-2">
                            &quot;{match.sentence}&quot;
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 pt-2">
                          <div className="p-3 bg-destructive/10 border-l-4 border-destructive rounded">
                            <p className="text-sm font-medium">Matched Text:</p>
                            <p className="text-sm mt-1">
                              &quot;{match.sentence}&quot;
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-2">
                              Found in these sources:
                            </p>
                            <div className="space-y-2">
                              {match.sources.map((source, sourceIndex) => (
                                <div
                                  key={sourceIndex}
                                  className="flex items-center gap-2 p-2 bg-muted/50 rounded"
                                >
                                  <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                  <a
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary underline text-sm flex-1 truncate"
                                  >
                                    {source.title || source.url}
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleSuggestCitation(match, index)
                              }
                              disabled={isCiting === index}
                            >
                              {isCiting === index ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Quote className="w-4 h-4 mr-2" />
                              )}
                              Suggest Citation (APA 7th)
                            </Button>
                            {citationResults[index] && (
                              <div className="mt-3 space-y-2 text-xs font-mono">
                                <div>
                                  <p className="font-sans text-sm font-medium text-foreground mb-1">
                                    In-Text Citation:
                                  </p>
                                  <p className="p-2 bg-background rounded border">
                                    {citationResults[index].inText}
                                  </p>
                                </div>
                                <div>
                                  <p className="font-sans text-sm font-medium text-foreground mb-1">
                                    Reference List Entry:
                                  </p>
                                  <p className="p-2 bg-background rounded border">
                                    {citationResults[index].reference}
                                  </p>
                                </div>
                                <Button
                                  variant="default"
                                  size="sm"
                                  className="mt-2"
                                  onClick={() =>
                                    handleSaveCitation(
                                      citationResults[index].reference,
                                      index,
                                    )
                                  }
                                  disabled={isSavingCitation === index}
                                >
                                  {isSavingCitation === index ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  ) : (
                                    <Save className="w-4 h-4 mr-2" />
                                  )}
                                  Save to Bibliography
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {internalResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {getScoreIcon(internalResults.highestScore)}Internal Similarity
              Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`p-6 rounded-lg border-2 ${getScoreColor(internalResults.highestScore)}`}
            >
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  {internalResults.highestScore}%
                </div>
                <div className="text-lg font-medium mb-2">
                  Highest Similarity Found
                </div>
                <div className="text-sm opacity-80">
                  This is the highest match found against another document in
                  your drafts.
                </div>
              </div>
            </div>
            {internalResults.matches.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Similar Document</TableHead>
                    <TableHead className="text-right">Similarity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {internalResults.matches.map((match) => (
                    <TableRow key={match.documentId}>
                      <TableCell>
                        <Link
                          href={`/drafts/${match.documentId}`}
                          className="text-primary underline font-medium"
                        >
                          {match.title}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="outline"
                          className={getScoreBadgeColor(match.similarity)}
                        >
                          {match.similarity}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground">
                No significant internal similarity found.
              </p>
            )}
          </CardContent>
        </Card>
      )}

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
      
      {/* Thesis Database Results */}
      {thesisResults && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <GraduationCap className="w-5 h-5" />
                Thesis Database Similarity Report
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportPdf}
                disabled={isExporting}
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Download Report
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div
              className={`p-6 rounded-lg border-2 ${
                thesisResults.length > 0 
                  ? "border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-700" 
                  : "border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-700"
              }`}
            >
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  {thesisResults.length > 0 ? "High" : "Low"} Risk
                </div>
                <div className="text-lg font-medium mb-2">
                  {thesisResults.length > 0 
                    ? `${thesisResults.length} Potential Matches Found` 
                    : "No Significant Similarity Detected"}
                </div>
                <div className="text-sm opacity-80">
                  Compared against {MOCK_THESIS_DATABASE.length} thesis records in our database
                </div>
              </div>
            </div>
            
            {thesisResults.length > 0 ? (
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Thesis Matches Found
                </h3>
                <Accordion
                  type="single"
                  collapsible
                  className="w-full max-h-[600px] overflow-y-auto pr-2"
                >
                  {thesisResults.map((result, index) => (
                    <AccordionItem key={index} value={`thesis-${index}`}>
                      <AccordionTrigger className="text-left hover:no-underline">
                        <div className="flex items-center gap-3 flex-1">
                          <Badge
                            variant="outline"
                            className={
                              result.similarity > 0.5 
                                ? "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700"
                                : result.similarity > 0.3
                                ? "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-700"
                                : "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700"
                            }
                          >
                            {Math.round(result.similarity * 100)}% Similarity
                          </Badge>
                          <span className="font-semibold">{result.thesis.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="bg-muted/10">
                              <CardHeader>
                                <CardTitle className="text-base">Thesis Details</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-2 text-sm">
                                  <p><span className="font-medium">Author:</span> {result.thesis.author}</p>
                                  <p><span className="font-medium">Institution:</span> {result.thesis.institution}</p>
                                  <p><span className="font-medium">Year:</span> {result.thesis.year}</p>
                                  <p><span className="font-medium">Field:</span> {result.thesis.field}</p>
                                </div>
                              </CardContent>
                            </Card>
                            
                            <Card className="bg-muted/10">
                              <CardHeader>
                                <CardTitle className="text-base">Abstract</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm">{result.thesis.abstract}</p>
                              </CardContent>
                            </Card>
                          </div>
                          
                          <div className="p-4 bg-muted/10 border-l-4 border-muted-foreground rounded">
                            <p className="font-medium mb-2">Matching Sections:</p>
                            <ul className="space-y-2">
                              {result.matchingSections.slice(0, 3).map((section, secIndex) => (
                                <li key={secIndex} className="text-sm">
                                  <p className="font-medium">Potential Match:</p>
                                  <p className="italic">"{section.source}"</p>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                toast.info("In a full implementation, this would generate a detailed comparison report.");
                              }}
                            >
                              <BarChart3 className="w-4 h-4 mr-2" />
                              Detailed Comparison
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                toast.info("In a full implementation, this would save the thesis record for later reference.");
                              }}
                            >
                              <Save className="w-4 h-4 mr-2" />
                              Save for Reference
                            </Button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Significant Similarity Detected</h3>
                <p className="text-muted-foreground">
                  Your text does not appear to have significant similarity with existing theses in our database.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Historical Topic Analysis Results */}
      {historicalAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Calendar className="w-5 h-5" />
              Historical Topic Analysis Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Topic Frequency Over Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Year</TableHead>
                        <TableHead className="text-right">Thesis Count</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historicalAnalysis.topicFrequency.map((entry, index) => (
                        <TableRow key={index}>
                          <TableCell>{entry.year}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="secondary">{entry.count}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Emerging Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {historicalAnalysis.emergingTrends.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Topic</TableHead>
                          <TableHead className="text-right">Growth (%)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {historicalAnalysis.emergingTrends.map((trend, index) => (
                          <TableRow key={index}>
                            <TableCell>{trend.topic}</TableCell>
                            <TableCell className="text-right">
                              <Badge 
                                variant="outline" 
                                className={
                                  trend.recentGrowth > 20 
                                    ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-200 dark:border-green-700"
                                    : "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700"
                                }
                              >
                                +{Math.round(trend.recentGrowth)}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      No emerging trends identified in recent years.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    Saturated Fields
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {historicalAnalysis.saturatedFields.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Field</TableHead>
                          <TableHead className="text-right">Decline (%)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {historicalAnalysis.saturatedFields.map((field, index) => (
                          <TableRow key={index}>
                            <TableCell>{field.field}</TableCell>
                            <TableCell className="text-right">
                              <Badge 
                                variant="outline" 
                                className="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-700"
                              >
                                -{Math.round(field.recentDecline)}%
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      No significantly saturated fields identified.
                    </p>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Gap Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {historicalAnalysis.gapOpportunities.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Field</TableHead>
                          <TableHead>Low Activity Period</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {historicalAnalysis.gapOpportunities.map((gap, index) => (
                          <TableRow key={index}>
                            <TableCell>{gap.field}</TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline" 
                                className="bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-200 dark:border-purple-700"
                              >
                                {gap.lowActivityPeriod}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      No significant gap opportunities identified.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-blue-500" />
                Research Insight
              </h4>
              <p className="text-sm">
                {historicalAnalysis.emergingTrends.length > 0
                  ? `The topic "${historicalAnalysis.emergingTrends[0].topic}" shows strong emerging interest with a ${Math.round(historicalAnalysis.emergingTrends[0].recentGrowth)}% growth rate. This could represent a valuable research opportunity.`
                  : "Based on historical analysis, your topic appears to be in a stable research area with consistent activity levels."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
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

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "low": return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-200 dark:border-green-700";
    case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-700";
    case "high": return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700";
    default: return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/50 dark:text-gray-200 dark:border-gray-700";
  }
};

const getImpactColor = (impact: string) => {
  switch (impact) {
    case "low": return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700";
    case "high": return "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-200 dark:border-purple-700";
    default: return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/50 dark:text-gray-200 dark:border-gray-700";
  }
};