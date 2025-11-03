"use client";

import React, { useState } from "react";
import {
  FolderIcon,
  FileTextIcon,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Award,
  Target,
  TrendingUp,
  Lightbulb,
  BarChart3,
  Zap,
  ShieldCheck,
  BookOpenCheck,
  Baseline,
  MessageSquare,
  Users,
  ClipboardCheck,
  FlaskConical,
  GitBranch,
  Sigma,
  Presentation,
  BookCheck,
  Library,
  Globe,
  Search,
  RefreshCw,
  Download,
  Save,
  Quote,
  ExternalLink,
  History,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Progress } from "./ui/progress";
import { Skeleton } from "./ui/skeleton";
import { toast } from "sonner";
import { useAuth } from "./auth-provider";
import { formatDistanceToNow } from "date-fns";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import Link from "next/link";
import { UpgradePrompt } from "./upgrade-prompt";
import { cn } from "../lib/utils";

type ThesisChapter = {
  id: string;
  title: string;
  description: string;
  requiredSections: string[];
  optionalSections: string[];
  wordCountRange: [number, number];
  typicalDuration: string; // e.g., "2-3 weeks"
  commonIssues: string[];
  bestPractices: string[];
};

type StructureValidation = {
  overallScore: number;
  chapters: {
    id: string;
    title: string;
    score: number;
    issues: StructureIssue[];
    suggestions: string[];
  }[];
  missingChapters: string[];
  formattingIssues: StructureIssue[];
  completeness: number;
  consistency: number;
};

type StructureIssue = {
  id: string;
  type: "missing" | "incomplete" | "format" | "sequence" | "content";
  severity: "low" | "medium" | "high";
  chapter: string;
  section?: string;
  description: string;
  suggestion: string;
  position?: number;
};

type ValidationHistoryItem = {
  id: string;
  score: number;
  chaptersValidated: number;
  created_at: string;
};

const thesisStructure: ThesisChapter[] = [
  {
    id: "chapter-1",
    title: "CHAPTER I - THE PROBLEM AND ITS BACKGROUND",
    description: "Establishes the foundation for your research by defining the problem, setting context, and outlining scope.",
    requiredSections: [
      "Introduction",
      "Background of the Study",
      "Statement of the Problem",
      "Hypothesis",
      "Scope and Limitations",
      "Significance of the Study",
      "Definition of Terms"
    ],
    optionalSections: [
      "Conceptual Framework",
      "Theoretical Framework",
      "Research Paradigm"
    ],
    wordCountRange: [1500, 2500],
    typicalDuration: "2-3 weeks",
    commonIssues: [
      "Too broad problem statements",
      "Insufficient background context",
      "Unclear scope boundaries"
    ],
    bestPractices: [
      "Start with a compelling hook in your introduction",
      "Clearly distinguish between background and problem statement",
      "Ensure scope aligns with methodology capabilities"
    ]
  },
  {
    id: "chapter-2",
    title: "CHAPTER II - REVIEW OF RELATED LITERATURE",
    description: "Synthesizes existing research to establish what is already known and identify gaps your study will address.",
    requiredSections: [
      "Foreign Literature",
      "Local Literature",
      "Synthesis"
    ],
    optionalSections: [
      "Theoretical Foundations",
      "Conceptual Literature",
      "Historical Context"
    ],
    wordCountRange: [3000, 5000],
    typicalDuration: "3-4 weeks",
    commonIssues: [
      "Poor synthesis of sources",
      "Lack of critical analysis",
      "Insufficient gap identification"
    ],
    bestPractices: [
      "Organize by themes rather than sources",
      "Critically evaluate rather than just describe",
      "Explicitly connect literature to your research gap"
    ]
  },
  {
    id: "chapter-3",
    title: "CHAPTER III - RESEARCH METHODOLOGY",
    description: "Details how you will conduct your research, including design, data collection, and analysis methods.",
    requiredSections: [
      "Research Design",
      "Respondents of the Study",
      "Sampling Procedure",
      "Research Instrument",
      "Data Gathering Procedure",
      "Statistical Treatment of Data"
    ],
    optionalSections: [
      "Validity and Reliability of Instrument",
      "Ethical Considerations",
      "Data Analysis Software"
    ],
    wordCountRange: [2000, 3500],
    typicalDuration: "2-3 weeks",
    commonIssues: [
      "Mismatched design and questions",
      "Insufficient sample size justification",
      "Vague data collection procedures"
    ],
    bestPractices: [
      "Align methodology with research questions",
      "Justify sample size with calculations",
      "Detail step-by-step procedures"
    ]
  },
  {
    id: "chapter-4",
    title: "CHAPTER IV - PRESENTATION, ANALYSIS, AND INTERPRETATION",
    description: "Presents your findings, analyzes data, and interprets results in relation to your research questions.",
    requiredSections: [
      "Presentation of Data",
      "Analysis of Data",
      "Interpretation of Data"
    ],
    optionalSections: [
      "Statistical Tables",
      "Graphical Representations",
      "Comparative Analysis"
    ],
    wordCountRange: [2500, 4000],
    typicalDuration: "2-3 weeks",
    commonIssues: [
      "Data dumping without analysis",
      "Misinterpretation of statistical results",
      "Failure to connect findings to literature"
    ],
    bestPractices: [
      "Present data with clear visualizations",
      "Analyze patterns and trends",
      "Interpret in context of existing literature"
    ]
  },
  {
    id: "chapter-5",
    title: "CHAPTER V - SUMMARY, CONCLUSIONS, AND RECOMMENDATIONS",
    description: "Synthesizes key findings, draws conclusions, and suggests future directions.",
    requiredSections: [
      "Summary",
      "Conclusions",
      "Recommendations"
    ],
    optionalSections: [
      "Implications",
      "Limitations of the Study",
      "Suggestions for Further Research"
    ],
    wordCountRange: [1500, 2500],
    typicalDuration: "1-2 weeks",
    commonIssues: [
      "Introducing new data",
      "Vague recommendations",
      "Failure to acknowledge limitations"
    ],
    bestPractices: [
      "Restate key findings concisely",
      "Draw conclusions directly from results",
      "Provide specific, actionable recommendations"
    ]
  }
];

const additionalStructureItems = [
  { name: "REFERENCES.docx", icon: FileTextIcon, indent: false },
  { name: "APPENDICES.docx", icon: FileTextIcon, indent: false },
];

export function EnhancedThesisStructureSection() {
  const { session, supabase, profile } = useAuth();
  const user = session?.user;
  const [validation, setValidation] = useState<StructureValidation | null>(null);
  const [is_validating, setIsValidating] = useState(false);
  const [history, setHistory] = useState<ValidationHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const reportRef = React.useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [userFeedback, setUserFeedback] = useState<{[key: string]: "positive" | "negative" | null}>({});

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchHistory = React.useCallback(async () => {
    if (!session) return;
    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase.rpc("get_user_validation_history", {
        p_limit: 5,
      });
      if (error) {
        console.error("Error fetching validation history:", error);
        // Don't show a toast error for this as it's not critical to the main functionality
      } else {
        setHistory(data || []);
      }
    } catch (err) {
      console.error("Error calling get_user_validation_history RPC:", err);
      // Silently handle the error - don't break the UI for a missing feature
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

  const handleValidateStructure = async () => {
    if (!session) {
      toast.error("You must be logged in to validate thesis structure.");
      return;
    }

    setIsValidating(true);
    setValidation(null);

    try {
      // In a real implementation, this would call an API to validate thesis structure
      // For now, we'll simulate the process with mock data
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock validation results
      const mockIssues: StructureIssue[] = [
        {
          id: "1",
          type: "missing",
          severity: "high",
          chapter: "Chapter I",
          section: "Definition of Terms",
          description: "Missing required section 'Definition of Terms' in Chapter I",
          suggestion: "Add a comprehensive definition of terms section with all key concepts in your study",
          position: 5
        },
        {
          id: "2",
          type: "incomplete",
          severity: "medium",
          chapter: "Chapter II",
          section: "Synthesis",
          description: "Synthesis section lacks critical analysis of literature gaps",
          suggestion: "Expand the synthesis to explicitly connect literature to your research questions and identify specific gaps",
          position: 3
        },
        {
          id: "3",
          type: "format",
          severity: "low",
          chapter: "Chapter III",
          section: "Research Design",
          description: "Research design section doesn't clearly distinguish between methodology and design",
          suggestion: "Clarify the difference between your research methodology (qualitative/quantitative) and research design (experimental, survey, etc.)",
          position: 2
        },
        {
          id: "4",
          type: "sequence",
          severity: "medium",
          chapter: "Chapter IV",
          description: "Data presentation section doesn't follow logical flow from previous chapters",
          suggestion: "Reorganize data presentation to mirror the sequence of research questions in Chapter I",
          position: 4
        }
      ];

      const mockChapters = thesisStructure.map((chapter, index) => {
        const chapterIssues = mockIssues.filter(issue => 
          issue.chapter === chapter.title.split(" - ")[0]
        );
        
        return {
          id: chapter.id,
          title: chapter.title,
          score: 100 - (chapterIssues.length * 15), // Simple scoring based on issues
          issues: chapterIssues,
          suggestions: chapter.bestPractices.slice(0, 2)
        };
      });

      const mockValidation: StructureValidation = {
        overallScore: 78,
        chapters: mockChapters,
        missingChapters: [],
        formattingIssues: mockIssues.filter(issue => issue.type === "format"),
        completeness: 85,
        consistency: 72
      };

      setValidation(mockValidation);
      await fetchHistory();
      toast.success("Thesis structure validation complete!");
    } catch (error: any) {
      toast.error(error.message || "Failed to validate thesis structure.");
      console.error(error);
    } finally {
      setIsValidating(false);
    }
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
        pdf.save("thesis_structure_validation.pdf");
        toast.success("Validation report downloaded successfully!");
        setIsExporting(false);
      };
    } catch (err) {
      toast.error("Failed to download validation report.");
      setIsExporting(false);
    }
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

  const getScoreColor = (score: number) => {
    if (score >= 80)
      return "text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300";
    if (score >= 60)
      return "text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-300";
    return "text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80)
      return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-200 dark:border-green-700";
    if (score >= 60)
      return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-700";
    return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700";
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low": return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-700";
      case "high": return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700";
      default: return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/50 dark:text-gray-200 dark:border-gray-700";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "missing": return <XCircle className="w-4 h-4 text-red-500" />;
      case "incomplete": return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "format": return <Baseline className="w-4 h-4 text-blue-500" />;
      case "sequence": return <TrendingUp className="w-4 h-4 text-purple-500" />;
      case "content": return <BookOpenCheck className="w-4 h-4 text-green-500" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-500" />;
    }
  };

  if (profile?.plan === "free") {
    return (
      <div className="max-w-4xl mx-auto">
        <UpgradePrompt
          featureName="Unlimited Structure Validation"
          description="The Pro plan gives you unlimited access to our powerful thesis structure validator to ensure your work always meets academic standards."
        />
      </div>
    );
  }

  return (
    <section className="py-16 md:py-20 lg:py-24 bg-gradient-to-b from-slate-800 to-slate-900">
      <div className="container">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white mb-4">
            Enhanced Thesis Structure Validator
          </h2>
          <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto">
            ThesisAI helps you build your paper on the standard 5-chapter model used by universities across the Philippines, 
            with intelligent validation to ensure you meet academic standards from the very first draft.
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Structure Visualization */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderIcon className="w-5 h-5" />
                Standard Thesis Structure
              </CardTitle>
              <CardDescription>
                The 5-chapter model used by universities across the Philippines.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-2xl mx-auto bg-muted rounded-lg border border-border p-6 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                </div>
                <div className="font-mono text-sm text-slate-300 space-y-2">
                  {thesisStructure.map((chapter, index) => (
                    <div key={chapter.id}>
                      <div className="flex items-center gap-3">
                        <FolderIcon className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="font-semibold">{chapter.title}</span>
                      </div>
                      <div className="pl-8 mt-1 space-y-1">
                        {chapter.requiredSections.map((section, secIndex) => (
                          <div key={secIndex} className="flex items-center gap-3">
                            <div className="w-4 h-4 flex items-center justify-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                            </div>
                            <span>{section}.docx</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {additionalStructureItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 text-blue-400 flex-shrink-0" />
                      <span>{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6 flex justify-center">
                <Button 
                  onClick={handleValidateStructure}
                  disabled={is_validating}
                  className="flex items-center gap-2"
                >
                  {is_validating ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 mr-2" />
                  )}
                  {is_validating ? "Validating Structure..." : "Validate Thesis Structure"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Structure Validation Results */}
          {validation && (
            <Card ref={reportRef}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5" />
                    Thesis Structure Validation Report
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
                {/* Overall Score */}
                <div
                  className={`p-6 rounded-lg border-2 ${getScoreColor(validation.overallScore)}`}
                >
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">
                      {validation.overallScore}%
                    </div>
                    <div className="text-lg font-medium mb-2">
                      Structure Compliance Score
                    </div>
                    <div className="text-sm opacity-80">
                      Based on {validation.chapters.length} chapters and {validation.chapters.reduce((sum, ch) => sum + ch.issues.length, 0)} issues identified
                    </div>
                  </div>
                </div>

                {/* Detailed Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Completeness</span>
                        <span className="text-green-600 dark:text-green-300 font-bold">
                          {validation.completeness}%
                        </span>
                      </div>
                      <Progress 
                        value={validation.completeness} 
                        className="h-2" 
                        indicatorClassName="bg-green-500" 
                      />
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Consistency</span>
                        <span className="text-blue-600 dark:text-blue-300 font-bold">
                          {validation.consistency}%
                        </span>
                      </div>
                      <Progress 
                        value={validation.consistency} 
                        className="h-2" 
                        indicatorClassName="bg-blue-500" 
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Chapter-by-Chapter Analysis */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    Chapter Analysis
                  </h3>
                  <Accordion
                    type="single"
                    collapsible
                    className="w-full max-h-[600px] overflow-y-auto pr-2"
                  >
                    {validation.chapters.map((chapter) => (
                      <AccordionItem key={chapter.id} value={`chapter-${chapter.id}`}>
                        <AccordionTrigger className="text-left hover:no-underline">
                          <div className="flex items-center gap-3 flex-1">
                            <Badge
                              variant="outline"
                              className={getScoreBadgeColor(chapter.score)}
                            >
                              {chapter.score}%
                            </Badge>
                            <span className="font-semibold">{chapter.title}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 pt-2">
                            {/* Chapter Score */}
                            <div
                              className={`p-4 rounded-lg border-2 ${getScoreColor(chapter.score)}`}
                            >
                              <div className="text-center">
                                <div className="text-2xl font-bold mb-1">
                                  {chapter.score}%
                                </div>
                                <div className="text-sm font-medium">
                                  Chapter Compliance
                                </div>
                              </div>
                            </div>

                            {/* Issues */}
                            {chapter.issues.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                                  Issues Identified ({chapter.issues.length})
                                </h4>
                                <Accordion
                                  type="single"
                                  collapsible
                                  className="w-full"
                                >
                                  {chapter.issues.map((issue) => (
                                    <AccordionItem key={issue.id} value={`issue-${issue.id}`}>
                                      <AccordionTrigger className="text-left hover:no-underline">
                                        <div className="flex items-center gap-2 flex-1">
                                          {getTypeIcon(issue.type)}
                                          <Badge
                                            variant="outline"
                                            className={getSeverityColor(issue.severity)}
                                          >
                                            {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}
                                          </Badge>
                                          <span className="text-sm">
                                            {issue.section ? `${issue.section}: ` : ""}
                                            {issue.description}
                                          </span>
                                        </div>
                                      </AccordionTrigger>
                                      <AccordionContent>
                                        <div className="space-y-3 pt-2">
                                          <div className="p-3 bg-muted/10 rounded">
                                            <p className="font-medium mb-1">Suggested Fix:</p>
                                            <p className="text-sm">{issue.suggestion}</p>
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
                                                toast.info("In a full implementation, this would apply the suggested fix to your document.");
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

                            {/* Suggestions */}
                            {chapter.suggestions.length > 0 && (
                              <div>
                                <h4 className="font-medium mb-2 flex items-center gap-2">
                                  <Lightbulb className="w-4 h-4 text-blue-500" />
                                  Improvement Suggestions
                                </h4>
                                <ul className="space-y-2">
                                  {chapter.suggestions.map((suggestion, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                      <span className="text-sm">{suggestion}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>

                {/* Best Practices */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpenCheck className="w-5 h-5" />
                      Chapter Writing Best Practices
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {thesisStructure.map((chapter) => (
                        <AccordionItem key={chapter.id} value={`best-practices-${chapter.id}`}>
                          <AccordionTrigger className="text-left hover:no-underline">
                            <span className="font-semibold">{chapter.title}</span>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4 pt-2">
                              <div>
                                <p className="font-medium mb-2">Description:</p>
                                <p className="text-sm">{chapter.description}</p>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="font-medium mb-2">Required Sections:</p>
                                  <ul className="space-y-1 text-sm">
                                    {chapter.requiredSections.map((section, index) => (
                                      <li key={index} className="flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                                        <span>{section}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                
                                <div>
                                  <p className="font-medium mb-2">Common Issues & Best Practices:</p>
                                  <ul className="space-y-1 text-sm">
                                    {chapter.commonIssues.slice(0, 2).map((issue, index) => (
                                      <li key={index} className="flex items-start gap-2">
                                        <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                        <span>{issue}</span>
                                      </li>
                                    ))}
                                    {chapter.bestPractices.slice(0, 2).map((practice, index) => (
                                      <li key={index} className="flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span>{practice}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-muted-foreground" />
                                  <span>{chapter.typicalDuration}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <BarChart3 className="w-4 h-4 text-muted-foreground" />
                                  <span>{chapter.wordCountRange[0]}-{chapter.wordCountRange[1]} words</span>
                                </div>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          )}

          {/* Validation History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <History className="w-5 h-5" />
                Recent Structure Validations
              </CardTitle>
              <CardDescription>
                Your last 5 thesis structure validations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Chapters Validated</TableHead>
                    <TableHead className="text-right">Score</TableHead>
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
                        <TableCell>{item.chaptersValidated}</TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant="outline"
                            className={getScoreBadgeColor(item.score)}
                          >
                            {item.score}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center h-24">
                        No validation history yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}