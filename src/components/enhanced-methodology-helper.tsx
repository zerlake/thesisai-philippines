"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  FlaskConical,
  Calculator,
  ClipboardEdit,
  GitBranch,
  Sigma,
  Users,
  ClipboardList,
  BrainCircuit,
  Target,
  TrendingUp,
  Lightbulb,
  BarChart3,
  Zap,
  CheckCircle,
  AlertTriangle,
  Clock,
  Award,
  Loader2,
  Download,
  Save,
  RefreshCw,
  Quote,
  History,
  ExternalLink,
  BookOpenCheck,
  Baseline,
  MessageSquare,
  UserCheck,
  ShieldCheck,
  Plus,
} from "lucide-react";
import { MethodologyToolCard } from "./methodology-tool-card";
import { ResearchDesignSelector } from "./methodology-tools/research-design-selector";
import { SampleSizeCalculator } from "./methodology-tools/sample-size-calculator";
import { SamplingMethodAdvisor } from "./methodology-tools/sampling-method-advisor";
import { StatisticalTestAdvisor } from "./methodology-tools/statistical-test-advisor";
import { InformedConsentGenerator } from "./methodology-tools/informed-consent-generator";
import { PowerAnalysisCalculator } from "./methodology-tools/power-analysis-calculator";
import { SurveyQuestionGenerator } from "./methodology-tools/survey-question-generator";
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
import { cn } from "../lib/utils";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Progress } from "./ui/progress";

type ResearchQuestion = {
  id: string;
  text: string;
  type: "descriptive" | "comparative" | "correlational" | "experimental" | "exploratory";
  complexity: "low" | "medium" | "high";
  dataRequirements: string[];
};

type MethodologyRecommendation = {
  id: string;
  design: string;
  sampling: string;
  analysis: string;
  confidence: number; // 0-100
  justification: string;
  limitations: string[];
  advantages: string[];
 适用场景: string[]; // Applicable scenarios
};

type MethodologyAnalysis = {
  overallScore: number;
  recommendations: MethodologyRecommendation[];
  suitabilityMatrix: {
    design: string;
    sampling: string;
    analysis: string;
    score: number;
  }[];
  feasibilityAssessment: {
    time: "low" | "medium" | "high";
    resources: "low" | "medium" | "high";
    expertise: "low" | "medium" | "high";
    ethical: "low" | "medium" | "high";
  };
};

export function EnhancedMethodologyHelper() {
  const { session, supabase, profile } = useAuth();
  const user = session?.user;
  const router = useRouter();
  const [researchQuestions, setResearchQuestions] = useState<ResearchQuestion[]>([]);
  const [methodologyAnalysis, setMethodologyAnalysis] = useState<MethodologyAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("tools");
  const [userFeedback, setUserFeedback] = useState<{[key: string]: "positive" | "negative" | null}>({});
  const [webResults, setWebResults] = useState<any>(null);
  const [internalResults, setInternalResults] = useState<any>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const handleAutomatedMethodologySelection = async () => {
    if (!user || researchQuestions.length === 0) {
      toast.error("Please add research questions first.");
      return;
    }

    setIsLoading(true);
    setMethodologyAnalysis(null);

    try {
      // In a real implementation, this would call an API to analyze research questions
      // and recommend appropriate methodologies
      // For now, we'll simulate the process with mock data
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock methodology recommendations based on research questions
      const mockRecommendations: MethodologyRecommendation[] = [
        {
          id: "1",
          design: "Mixed-Methods Sequential Explanatory Design",
          sampling: "Stratified Random Sampling",
          analysis: "Quantitative (Descriptive Statistics, Inferential Tests) + Qualitative (Thematic Analysis)",
          confidence: 85,
          justification: "This design is ideal for your research questions as it allows for initial quantitative data collection to identify patterns, followed by qualitative interviews to explain and elaborate on those patterns. The sequential approach ensures that qualitative data directly addresses quantitative findings.",
          limitations: [
            "Requires expertise in both quantitative and qualitative methods",
            "Time-intensive due to sequential data collection",
            "May require larger sample sizes for both components"
          ],
          advantages: [
            "Provides comprehensive understanding of research phenomena",
            "Allows for triangulation of findings",
            "Enables validation of quantitative results through qualitative insights"
          ],
          适用场景: [
            "When quantitative results need qualitative explanation",
            "For exploratory research with confirmatory elements",
            "When seeking both breadth and depth of understanding"
          ]
        },
        {
          id: "2",
          design: "Quantitative Survey Design",
          sampling: "Systematic Sampling",
          analysis: "Descriptive Statistics + Inferential Tests (T-test, ANOVA, Regression)",
          confidence: 78,
          justification: "Given your comparative and correlational research questions, a quantitative survey design provides the most efficient approach to collect numerical data from a large sample. Systematic sampling ensures representative coverage while maintaining simplicity.",
          limitations: [
            "Limited depth of understanding for complex phenomena",
            "Response bias potential in self-reported data",
            "Requires clearly defined variables and constructs"
          ],
          advantages: [
            "Efficient data collection from large samples",
            "Statistically generalizable results",
            "Standardized measurement procedures"
          ],
          适用场景: [
            "When seeking to generalize findings to larger populations",
            "For hypothesis testing with clearly defined variables",
            "When time and resources are constrained"
          ]
        },
        {
          id: "3",
          design: "Qualitative Phenomenological Study",
          sampling: "Purposive Sampling",
          analysis: "Thematic Analysis + Interpretative Phenomenological Analysis (IPA)",
          confidence: 72,
          justification: "If your research questions focus on lived experiences and subjective perspectives, a phenomenological approach allows for deep exploration of participants' worldviews. Purposive sampling ensures you recruit participants with rich, relevant experiences.",
          limitations: [
            "Limited generalizability of findings",
            "Time-intensive data collection and analysis",
            "Requires advanced qualitative research skills"
          ],
          advantages: [
            "Deep understanding of complex human experiences",
            "Rich, detailed insights into phenomena",
            "Flexible approach that adapts to emerging themes"
          ],
          适用场景: [
            "When exploring personal experiences and perspectives",
            "For understanding meaning-making processes",
            "When seeking to develop theoretical insights"
          ]
        }
      ];

      const mockSuitabilityMatrix = [
        { design: "Quantitative", sampling: "Random", analysis: "Statistical", score: 85 },
        { design: "Qualitative", sampling: "Purposive", analysis: "Thematic", score: 78 },
        { design: "Mixed-Methods", sampling: "Stratified", analysis: "Integrated", score: 92 },
        { design: "Experimental", sampling: "Randomized", analysis: "ANOVA", score: 65 },
        { design: "Survey", sampling: "Systematic", analysis: "Descriptive", score: 88 }
      ];

      const mockFeasibility = {
        time: "medium" as const,
        resources: "low" as const,
        expertise: "medium" as const,
        ethical: "low" as const
      };

      const mockAnalysis: MethodologyAnalysis = {
        overallScore: 82,
        recommendations: mockRecommendations,
        suitabilityMatrix: mockSuitabilityMatrix,
        feasibilityAssessment: mockFeasibility
      };

      setMethodologyAnalysis(mockAnalysis);
      toast.success("Automated methodology selection complete!");
    } catch (error: any) {
      toast.error(error.message || "Failed to perform automated methodology selection.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddResearchQuestion = (question: string, type: ResearchQuestion["type"]) => {
    if (!question.trim()) {
      toast.error("Please enter a research question.");
      return;
    }
    
    const newQuestion: ResearchQuestion = {
      id: `rq-${Date.now()}`,
      text: question.trim(),
      type,
      complexity: "medium", // This would be determined automatically in a real implementation
      dataRequirements: [] // This would be determined automatically in a real implementation
    };
    
    setResearchQuestions([...researchQuestions, newQuestion]);
    toast.success("Research question added!");
  };

  const handleRemoveResearchQuestion = (id: string) => {
    setResearchQuestions(researchQuestions.filter(q => q.id !== id));
    toast.success("Research question removed.");
  };

  const handleFeedback = (recommendationId: string, feedback: "positive" | "negative") => {
    setUserFeedback(prev => ({
      ...prev,
      [recommendationId]: feedback
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

  if (profile?.plan === "free") {
    return (
      <div className="max-w-4xl mx-auto">
        <UpgradePrompt
          featureName="Unlimited Methodology Tools"
          description="The Pro plan gives you unlimited access to our powerful methodology tools to help you design robust research studies."
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5" />
            Enhanced Methodology Helper
          </CardTitle>
          <CardDescription>
            Interactive tools to help you build and justify your research methodology with automated selection and gap analysis.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tools" className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Methodology Tools</span>
          </TabsTrigger>
          <TabsTrigger value="selection" className="flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Auto Selection</span>
          </TabsTrigger>
          <TabsTrigger value="advisor" className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Advisor Integration</span>
          </TabsTrigger>
          <TabsTrigger value="gaps" className="flex items-center gap-2">
            <Target className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Research Gaps</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tools" className="mt-6">
          <div className="space-y-6">
            <MethodologyToolCard
              title="Research Design Selector"
              description="Choose your research design and generate a justification for your choice."
              icon={FlaskConical}
            >
              <ResearchDesignSelector />
            </MethodologyToolCard>

            <MethodologyToolCard
              title="Sample Size Calculator (Slovin's Formula)"
              description="Calculate the required sample size from a known total population."
              icon={Calculator}
            >
              <SampleSizeCalculator />
            </MethodologyToolCard>

            <MethodologyToolCard
              title="Sample Size & Power Analysis Calculator"
              description="Determine the required sample size based on your chosen statistical test and desired effect size."
              icon={Users}
            >
              <PowerAnalysisCalculator />
            </MethodologyToolCard>

            <MethodologyToolCard
              title="Sampling Method Advisor"
              description="Answer a few questions to get a recommendation for your sampling technique."
              icon={GitBranch}
            >
              <SamplingMethodAdvisor />
            </MethodologyToolCard>

            <MethodologyToolCard
              title="Survey Question Generator"
              description="Generate sample survey questions for your topic based on different question types."
              icon={ClipboardList}
            >
              <SurveyQuestionGenerator />
            </MethodologyToolCard>

            <MethodologyToolCard
              title="Data Analysis Plan Advisor"
              description="Answer a few questions to find the right statistical test, its assumptions, and a justification for your plan."
              icon={Sigma}
            >
              <StatisticalTestAdvisor />
            </MethodologyToolCard>

            <MethodologyToolCard
              title="Informed Consent Form Generator"
              description="Create a standard consent form for your participants."
              icon={ClipboardEdit}
            >
              <InformedConsentGenerator />
            </MethodologyToolCard>
          </div>
        </TabsContent>

        <TabsContent value="selection" className="mt-6">
          <div className="space-y-6">
            {/* Research Questions Input */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Research Questions
                </CardTitle>
                <CardDescription>
                  Enter your research questions to get automated methodology recommendations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      id="research-question"
                      placeholder="e.g., What is the impact of AI on student learning outcomes?"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const target = e.target as HTMLInputElement;
                          handleAddResearchQuestion(target.value, "descriptive");
                          target.value = "";
                        }
                      }}
                    />
                    <select className="border rounded p-2">
                      <option value="descriptive">Descriptive</option>
                      <option value="comparative">Comparative</option>
                      <option value="correlational">Correlational</option>
                      <option value="experimental">Experimental</option>
                      <option value="exploratory">Exploratory</option>
                    </select>
                  </div>
                  
                  <Button 
                    onClick={() => {
                      const input = document.getElementById("research-question") as HTMLInputElement;
                      if (input) {
                        handleAddResearchQuestion(input.value, "descriptive");
                        input.value = "";
                      }
                    }}
                    disabled={!session}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Research Question
                  </Button>
                  
                  {researchQuestions.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Your Research Questions:</h4>
                      <ul className="space-y-2">
                        {researchQuestions.map((question) => (
                          <li key={question.id} className="flex items-center gap-2 p-2 bg-muted/10 rounded">
                            <Badge variant="outline">{question.type}</Badge>
                            <span className="flex-1">{question.text}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveResearchQuestion(question.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={handleAutomatedMethodologySelection}
                      disabled={isLoading || researchQuestions.length === 0 || !session}
                      className="flex items-center gap-2"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <BrainCircuit className="w-4 h-4 mr-2" />
                      )}
                      {isLoading ? "Analyzing..." : "Get Methodology Recommendations"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Methodology Analysis Results */}
            {methodologyAnalysis && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Automated Methodology Recommendations
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        toast.info("In a full implementation, this would download a methodology report.");
                      }}
                      disabled={isSaving}
                    >
                      {isSaving ? (
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
                    className={`p-6 rounded-lg border-2 ${getScoreColor(methodologyAnalysis.overallScore)}`}
                  >
                    <div className="text-center">
                      <div className="text-4xl font-bold mb-2">
                        {methodologyAnalysis.overallScore}%
                      </div>
                      <div className="text-lg font-medium mb-2">
                        Methodology Suitability Score
                      </div>
                      <div className="text-sm opacity-80">
                        Based on {methodologyAnalysis.recommendations.length} methodology combinations
                      </div>
                    </div>
                  </div>

                  <Accordion
                    type="single"
                    collapsible
                    className="w-full max-h-[600px] overflow-y-auto pr-2"
                  >
                    {methodologyAnalysis.recommendations.map((rec) => (
                      <AccordionItem key={rec.id} value={`rec-${rec.id}`}>
                        <AccordionTrigger className="text-left hover:no-underline">
                          <div className="flex items-center gap-3 flex-1">
                            <Badge
                              variant="outline"
                              className={getScoreBadgeColor(rec.confidence)}
                            >
                              {rec.confidence}% Confidence
                            </Badge>
                            <span className="font-semibold">{rec.design}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4 pt-2">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <Card className="bg-muted/10">
                                <CardHeader>
                                  <CardTitle className="text-base flex items-center gap-2">
                                    <FlaskConical className="w-4 h-4" />
                                    Design
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <p className="text-sm">{rec.design}</p>
                                </CardContent>
                              </Card>
                              
                              <Card className="bg-muted/10">
                                <CardHeader>
                                  <CardTitle className="text-base flex items-center gap-2">
                                    <GitBranch className="w-4 h-4" />
                                    Sampling
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <p className="text-sm">{rec.sampling}</p>
                                </CardContent>
                              </Card>
                              
                              <Card className="bg-muted/10">
                                <CardHeader>
                                  <CardTitle className="text-base flex items-center gap-2">
                                    <Sigma className="w-4 h-4" />
                                    Analysis
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <p className="text-sm">{rec.analysis}</p>
                                </CardContent>
                              </Card>
                            </div>
                            
                            <div className="p-4 bg-muted/10 border-l-4 border-muted-foreground rounded">
                              <p className="font-medium mb-2">Justification:</p>
                              <p className="text-sm">{rec.justification}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="font-medium mb-2 flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  Advantages
                                </p>
                                <ul className="space-y-1 text-sm">
                                  {rec.advantages.map((advantage, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                                      <span>{advantage}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <p className="font-medium mb-2 flex items-center gap-2">
                                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                  Limitations
                                </p>
                                <ul className="space-y-1 text-sm">
                                  {rec.limitations.map((limitation, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                                      <span>{limitation}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            <div>
                              <p className="font-medium mb-2 flex items-center gap-2">
                                <Lightbulb className="w-4 h-4 text-blue-600" />
                                适用场景 (Applicable Scenarios)
                              </p>
                              <ul className="space-y-1 text-sm">
                                {rec.适用场景.map((scenario, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                                    <span>{scenario}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Was this helpful?</span>
                                <div className="flex gap-1">
                                  <Button
                                    variant={userFeedback[rec.id] === "positive" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleFeedback(rec.id, "positive")}
                                  >
                                    <ThumbsUp className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant={userFeedback[rec.id] === "negative" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handleFeedback(rec.id, "negative")}
                                  >
                                    <ThumbsDown className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  toast.info("In a full implementation, this would apply the selected methodology to your research plan.");
                                }}
                              >
                                <Zap className="w-4 h-4 mr-2" />
                                Apply Methodology
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
                          Suitability Matrix
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Design</TableHead>
                              <TableHead>Sampling</TableHead>
                              <TableHead>Analysis</TableHead>
                              <TableHead className="text-right">Score</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {methodologyAnalysis.suitabilityMatrix.map((combo, index) => (
                              <TableRow key={index}>
                                <TableCell>{combo.design}</TableCell>
                                <TableCell>{combo.sampling}</TableCell>
                                <TableCell>{combo.analysis}</TableCell>
                                <TableCell className="text-right">
                                  <Badge
                                    variant="outline"
                                    className={getScoreBadgeColor(combo.score)}
                                  >
                                    {combo.score}%
                                  </Badge>
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
                          <Clock className="w-5 h-5" />
                          Feasibility Assessment
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium mb-1">Time Requirements</p>
                              <Badge 
                                variant="outline" 
                                className={getDifficultyColor(methodologyAnalysis.feasibilityAssessment.time)}
                              >
                                {methodologyAnalysis.feasibilityAssessment.time.charAt(0).toUpperCase() + methodologyAnalysis.feasibilityAssessment.time.slice(1)}
                              </Badge>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium mb-1">Resource Needs</p>
                              <Badge 
                                variant="outline" 
                                className={getDifficultyColor(methodologyAnalysis.feasibilityAssessment.resources)}
                              >
                                {methodologyAnalysis.feasibilityAssessment.resources.charAt(0).toUpperCase() + methodologyAnalysis.feasibilityAssessment.resources.slice(1)}
                              </Badge>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium mb-1">Expertise Level</p>
                              <Badge 
                                variant="outline" 
                                className={getDifficultyColor(methodologyAnalysis.feasibilityAssessment.expertise)}
                              >
                                {methodologyAnalysis.feasibilityAssessment.expertise.charAt(0).toUpperCase() + methodologyAnalysis.feasibilityAssessment.expertise.slice(1)}
                              </Badge>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium mb-1">Ethical Complexity</p>
                              <Badge 
                                variant="outline" 
                                className={getDifficultyColor(methodologyAnalysis.feasibilityAssessment.ethical)}
                              >
                                {methodologyAnalysis.feasibilityAssessment.ethical.charAt(0).toUpperCase() + methodologyAnalysis.feasibilityAssessment.ethical.slice(1)}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="p-3 bg-muted/10 rounded">
                            <p className="text-sm font-medium mb-2">Feasibility Recommendations:</p>
                            <ul className="space-y-1 text-sm">
                              <li className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span>Consider starting with the Mixed-Methods Sequential Explanatory Design for comprehensive insights</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                <span>Allocate additional time for qualitative data analysis if choosing mixed-methods</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <span>Consult with your advisor about required statistical software training</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="advisor" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  Advisor Integration
                </CardTitle>
                <CardDescription>
                  Submit your methodology for review by your assigned advisor.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      Request feedback on your methodology plan from your advisor. They will review your research design, 
                      sampling approach, statistical methods, and ethical considerations.
                    </p>
                  </div>
                  <Button 
                    onClick={() => {
                      toast.info("In a full implementation, this would send a review request to your advisor.");
                    }}
                    className="flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Request Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="gaps" className="mt-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Research Gap Analysis
                </CardTitle>
                <CardDescription>
                  Identify unexplored areas in your research field for novel contributions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      Analyze your literature review to identify genuine research gaps and opportunities 
                      for meaningful contributions to your field.
                    </p>
                  </div>
                  <Button 
                    onClick={() => {
                      toast.info("In a full implementation, this would analyze research gaps in your field.");
                    }}
                    className="flex items-center gap-2"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Analyze Research Gaps
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

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