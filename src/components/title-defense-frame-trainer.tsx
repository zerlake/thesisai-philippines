// Title Defense Framework Trainer
// Specialized tool for defending research titles with CLEAR framework

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/components/auth-provider";
import { toast } from "sonner";
import { 
  Copy, 
  FilePlus2, 
  Target, 
  Loader2, 
  Wand2, 
  BookOpen,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Play,
  Pause,
  Square,
  Mic,
  Download,
  Save,
  RotateCw,
  Flag,
  Brain,
  TrendingUp,
  Calendar,
  User,
  Award,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Eye,
  EyeOff,
  Zap,
  Shield,
  ShieldCheck,
  Sparkles,
  GitBranch,
  BarChart3
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

// Title defense specific types
type TitleQuestionCategory = 
  | "clarity" 
  | "significance" 
  | "scope" 
  | "uniqueness" 
  | "alignment";

type FrameworkType = "CLEAR" | "PREP" | "PEEL" | "STAR" | "ADD";

interface TitleDefenseQuestion {
  id: string;
  question: string;
  category: TitleQuestionCategory;
  difficulty: "easy" | "medium" | "hard";
  suggestedFramework: FrameworkType;
  pressureLevel: "low" | "medium" | "high";
}

interface TitleDefenseResponse {
  questionId: string;
  response: string;
  frameworkUsed: FrameworkType;
  confidence: number;
  timestamp: Date;
  feedback?: string;
  stressLevel?: number;
}

interface TitleAnalysis {
  clarity: number;
  significance: number;
  scope: number;
  uniqueness: number;
  alignment: number;
  overall: number;
  violations: FormatViolation[];
  suggestions: string[];
}

interface FormatViolation {
  section: string;
  guideline: string;
  violation: string;
  suggestion: string;
}

interface TitleSection {
  id: string;
  title: string;
  content: string;
}

interface PerformanceMetric {
  framework: FrameworkType;
  questionsAnswered: number;
  averageConfidence: number;
  averageStressLevel: number;
  strengths: string[];
  areasForImprovement: string[];
}

interface AnxietyTrigger {
  id: string;
  trigger: string;
  frequency: number;
  copingStrategy: string;
}

export function TitleDefenseFrameTrainer() {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const router = useRouter();
  
  const [researchTitle, setResearchTitle] = useState("");
  const [titleAnalysis, setTitleAnalysis] = useState<TitleAnalysis | null>(null);
  const [questions, setQuestions] = useState<TitleDefenseQuestion[]>([]);
  const [responses, setResponses] = useState<TitleDefenseResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState<FrameworkType>("CLEAR");
  const [activeTab, setActiveTab] = useState("title");
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [anxietyTriggers, setAnxietyTriggers] = useState<AnxietyTrigger[]>([]);
  const [stressLevel, setStressLevel] = useState(50);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // CLEAR framework definition
  const CLEAR_FRAMEWORK = {
    name: "CLEAR Framework",
    description: "Clarify, Link, Express, Articulate, Reflect - Specifically for title defense",
    适用场景: "Justifying research titles, explaining scope and focus",
    steps: [
      {
        id: "clarify",
        title: "Clarify",
        description: "Clarify the main concepts and relationships in your title",
        example: "Our title focuses on the impact of solar energy adoption on local communities.",
        tip: "Identify the key variables and their relationships"
      },
      {
        id: "link",
        title: "Link",
        description: "Link the title to significant problems or research gaps",
        example: "This addresses a current regional policy gap despite national incentives.",
        tip: "Connect to broader issues or literature"
      },
      {
        id: "express",
        title: "Express",
        description: "Express scope, population, method, and setting",
        example: "We focus on community-level implementation between 2022-2024 in Bukidnon.",
        tip: "Be specific about boundaries and approach"
      },
      {
        id: "articulate",
        title: "Articulate",
        description: "Articulate uniqueness and relevance",
        example: "Few local studies exist, making this empirically valuable.",
        tip: "Highlight what makes your approach distinctive"
      },
      {
        id: "reflect",
        title: "Reflect",
        description: "Reflect academic field requirements and alignment",
        example: "The title aligns with development studies and faculty expertise.",
        tip: "Show how it fits your program and disciplinary standards"
      }
    ]
  };

  // Other frameworks for title defense
  const OTHER_FRAMEWORKS: Record<FrameworkType, any> = {
    PREP: {
      name: "PREP Framework",
      description: "Point, Reason, Example, Point - For persuasive, structured answers",
      适用场景: "Justifying title choices, explaining rationale",
      steps: [
        {
          id: "point",
          title: "Point",
          description: "State your main point clearly and directly",
          example: "Our study focuses on the impact of AI on student learning outcomes.",
          tip: "Be specific and avoid vague statements"
        },
        {
          id: "reason",
          title: "Reason",
          description: "Provide the logical reason or justification for your point",
          example: "This addresses a significant research gap in digital learning environments.",
          tip: "Connect to literature or established theories"
        },
        {
          id: "example",
          title: "Example",
          description: "Give a concrete example or evidence to support your reason",
          example: "Recent studies show 75% of students use social media during study time.",
          tip: "Use statistics or specific references when possible"
        },
        {
          id: "point2",
          title: "Point (Restate)",
          description: "Restate your main point or link to broader implications",
          example: "Therefore, understanding this relationship is crucial for educational policy.",
          tip: "Connect back to significance or future applications"
        }
      ]
    },
    PEEL: {
      name: "PEEL Framework",
      description: "Point, Evidence, Explain, Link - For evidence-based, analytical answers",
      适用场景: "Supporting title claims, discussing literature",
      steps: [
        {
          id: "point",
          title: "Point",
          description: "Make a clear statement about your position or finding",
          example: "Our methodology incorporates both quantitative and qualitative approaches.",
          tip: "State your point confidently without hedging"
        },
        {
          id: "evidence",
          title: "Evidence",
          description: "Provide supporting evidence from literature or your data",
          example: "Mixed-methods research shows 30% higher validity compared to single approaches.",
          tip: "Cite specific sources or data points"
        },
        {
          id: "explain",
          title: "Explain",
          description: "Explain how the evidence supports your point",
          example: "This triangulation helps validate our findings from multiple perspectives.",
          tip: "Show the logical connection, don't just state it"
        },
        {
          id: "link",
          title: "Link",
          description: "Connect your point to broader implications or next steps",
          example: "Thus, our findings can inform similar studies and practical applications.",
          tip: "Link to significance, limitations, or recommendations"
        }
      ]
    },
    STAR: {
      name: "STAR Framework",
      description: "Situation, Task, Action, Result - For describing processes or overcoming challenges",
      适用场景: "Discussing title development challenges, pilot studies",
      steps: [
        {
          id: "situation",
          title: "Situation",
          description: "Describe the context or background situation",
          example: "During our pilot study, we encountered low response rates from participants.",
          tip: "Set the scene without unnecessary detail"
        },
        {
          id: "task",
          title: "Task",
          description: "Explain what needed to be accomplished",
          example: "We needed to improve participation while maintaining data quality.",
          tip: "Focus on the specific challenge or goal"
        },
        {
          id: "action",
          title: "Action",
          description: "Detail the specific actions you took to address the task",
          example: "We implemented a multi-channel reminder system and offered participation incentives.",
          tip: "Be specific about what YOU did"
        },
        {
          id: "result",
          title: "Result",
          description: "Describe the outcome and what you learned",
          example: "Response rates increased by 40%, and data quality remained high.",
          tip: "Include both quantitative and qualitative outcomes"
        }
      ]
    },
    ADD: {
      name: "ADD Framework",
      description: "Answer, Details, Data - Quick structure for factual questions",
      适用场景: "Brief factual questions about title components",
      steps: [
        {
          id: "answer",
          title: "Answer",
          description: "Give a direct, concise answer to the question",
          example: "Our sample size is 300 participants.",
          tip: "Answer the specific question asked, nothing more"
        },
        {
          id: "details",
          title: "Details",
          description: "Provide relevant details to support your answer",
          example: "This includes 150 males and 150 females aged 18-25.",
          tip: "Include only pertinent details"
        },
        {
          id: "data",
          title: "Data",
          description: "Offer supporting data, statistics, or references",
          example: "This follows the recommended ratio of 10:1 for survey research validity.",
          tip: "Use specific numbers or citations when available"
        }
      ]
    },
    CLEAR: CLEAR_FRAMEWORK
  };

  // Common title defense questions
  const COMMON_QUESTIONS: TitleDefenseQuestion[] = [
    {
      id: "t1",
      question: "Why did you choose this title?",
      category: "clarity",
      difficulty: "medium",
      suggestedFramework: "CLEAR",
      pressureLevel: "medium"
    },
    {
      id: "t2",
      question: "What is the main problem your study wants to solve?",
      category: "significance",
      difficulty: "medium",
      suggestedFramework: "PREP",
      pressureLevel: "medium"
    },
    {
      id: "t3",
      question: "How is your study different from existing ones?",
      category: "uniqueness",
      difficulty: "hard",
      suggestedFramework: "PEEL",
      pressureLevel: "high"
    },
    {
      id: "t4",
      question: "Is your title appropriately scoped for a thesis?",
      category: "scope",
      difficulty: "medium",
      suggestedFramework: "CLEAR",
      pressureLevel: "low"
    },
    {
      id: "t5",
      question: "Does your title reflect your intended methodology?",
      category: "alignment",
      difficulty: "easy",
      suggestedFramework: "ADD",
      pressureLevel: "low"
    },
    {
      id: "t6",
      question: "What makes your title significant and relevant?",
      category: "significance",
      difficulty: "hard",
      suggestedFramework: "PREP",
      pressureLevel: "high"
    },
    {
      id: "t7",
      question: "How does your title capture the aim or scope of your study?",
      category: "scope",
      difficulty: "hard",
      suggestedFramework: "CLEAR",
      pressureLevel: "high"
    },
    {
      id: "t8",
      question: "Is the title too broad or too narrow—how did you set its parameters?",
      category: "scope",
      difficulty: "hard",
      suggestedFramework: "PREP",
      pressureLevel: "high"
    },
    {
      id: "t9",
      question: "In what way does the title reflect your intended methodology?",
      category: "alignment",
      difficulty: "medium",
      suggestedFramework: "ADD",
      pressureLevel: "medium"
    },
    {
      id: "t10",
      question: "Is the title original, or does it overlap with existing research?",
      category: "uniqueness",
      difficulty: "hard",
      suggestedFramework: "PEEL",
      pressureLevel: "high"
    }
  ];

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const handleAnalyzeTitle = async () => {
    if (!researchTitle.trim()) {
      toast.error("Please enter your research title first.");
      return;
    }
    if (!session) {
      toast.error("You must be logged in to use this feature.");
      return;
    }

    setIsLoading(true);
    setTitleAnalysis(null);
    
    try {
      // Simulate title analysis
      setTimeout(() => {
        const mockAnalysis: TitleAnalysis = {
          clarity: 85,
          significance: 78,
          scope: 82,
          uniqueness: 75,
          alignment: 90,
          overall: 82,
          violations: [],
          suggestions: []
        };
        
        setTitleAnalysis(mockAnalysis);
        toast.success("Title analysis completed!");
        setIsLoading(false);
      }, 1500);
    } catch (error: any) {
      toast.error(error.message || "Failed to analyze title.");
      setIsLoading(false);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!researchTitle.trim()) {
      toast.error("Please enter your research title first.");
      return;
    }
    if (!session) {
      toast.error("You must be logged in to use this feature.");
      return;
    }

    setIsLoading(true);
    setQuestions([]);
    
    try {
      // Simulate question generation based on title content
      setTimeout(() => {
        // In a real implementation, this would analyze the title
        // and generate relevant questions
        setQuestions(COMMON_QUESTIONS);
        toast.success("Title defense questions generated!");
        setIsLoading(false);
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || "Failed to generate questions.");
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleSaveAsDraft = async () => {
    if (!user || !researchTitle) return;
    setIsSaving(true);

    let content = `<h1>Title Defense Framework Practice</h1><hr>`;
    
    content += `<h2>Research Title</h2><p><strong>${researchTitle}</strong></p>`;
    
    if (titleAnalysis) {
      content += `<hr><h2>Title Analysis</h2>
        <ul>
          <li><strong>Clarity:</strong> ${titleAnalysis.clarity}%</li>
          <li><strong>Significance:</strong> ${titleAnalysis.significance}%</li>
          <li><strong>Scope:</strong> ${titleAnalysis.scope}%</li>
          <li><strong>Uniqueness:</strong> ${titleAnalysis.uniqueness}%</li>
          <li><strong>Alignment:</strong> ${titleAnalysis.alignment}%</li>
          <li><strong>Overall:</strong> ${titleAnalysis.overall}%</li>
        </ul>`;
    }
    
    if (questions.length > 0) {
      content += `<hr><h2>Defense Questions</h2><ol>`;
      questions.forEach((q, index) => {
        const response = responses.find(r => r.questionId === q.id);
        content += `<li>
          <p><strong>${q.question}</strong></p>
          <p><em>Category:</em> ${q.category} | <em>Difficulty:</em> ${q.difficulty} | <em>Pressure:</em> ${q.pressureLevel} | <em>Framework:</em> ${q.suggestedFramework}</p>
          ${response ? `<p><strong>Your Response:</strong> ${response.response}</p>
          <p><em>Confidence:</em> ${response.confidence}% | <em>Framework Used:</em> ${response.frameworkUsed}</p>` : ''}
        </li>`;
      });
      content += `</ol>`;
    }

    const { data: newDoc, error } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        title: `Title Defense: ${researchTitle}`,
        content: content,
      })
      .select("id")
      .single();

    if (error) {
      toast.error("Failed to save draft.");
    } else if (newDoc) {
      toast.success("Title defense practice saved as a new draft!");
      router.push(`/drafts/${newDoc.id}`);
    }
    setIsSaving(false);
  };

  const handleResponseChange = (questionId: string, response: string) => {
    setResponses(prev => {
      const existingIndex = prev.findIndex(r => r.questionId === questionId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          response,
          timestamp: new Date()
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            questionId,
            response,
            frameworkUsed: selectedFramework,
            confidence: 50,
            stressLevel: stressLevel,
            timestamp: new Date()
          }
        ];
      }
    });
  };

  const handleConfidenceChange = (questionId: string, confidence: number) => {
    setResponses(prev => {
      const existingIndex = prev.findIndex(r => r.questionId === questionId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          confidence
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            questionId,
            response: "",
            frameworkUsed: selectedFramework,
            confidence,
            stressLevel: stressLevel,
            timestamp: new Date()
          }
        ];
      }
    });
  };

  const handleStressLevelChange = (questionId: string, stressLevel: number) => {
    setResponses(prev => {
      const existingIndex = prev.findIndex(r => r.questionId === questionId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          stressLevel
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            questionId,
            response: "",
            frameworkUsed: selectedFramework,
            confidence: 50,
            stressLevel,
            timestamp: new Date()
          }
        ];
      }
    });
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    toast.info(isRecording ? "Recording stopped" : "Recording started");
  };

  const toggleTimer = () => {
    setIsTimerRunning(!isTimerRunning);
    if (!isTimerRunning) {
      toast.info("Timer started - practice under time pressure");
    } else {
      toast.info("Timer paused");
    }
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
    toast.info("Timer reset");
  };

  const exportResponses = () => {
    const exportData = {
      researchTitle,
      titleAnalysis,
      questions: questions.map(q => {
        const response = responses.find(r => r.questionId === q.id);
        return {
          ...q,
          response: response?.response || "",
          confidence: response?.confidence || 50,
          frameworkUsed: response?.frameworkUsed || selectedFramework
        };
      }),
      timestamp: new Date().toISOString(),
      timerData: {
        totalTime: timerSeconds,
        isRunning: isTimerRunning
      }
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'title-defense-qa-practice.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Title defense Q&A practice exported successfully!");
  };

  const resetPractice = () => {
    setResponses([]);
    setStressLevel(50);
    toast.info("Title defense Q&A practice reset");
  };

  const getFrameworkGuide = () => {
    const framework = OTHER_FRAMEWORKS[selectedFramework];
    return (
      <div className="p-4 bg-muted rounded-lg">
        <h4 className="font-semibold flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          {framework.name} Framework Guide
        </h4>
        <p className="text-sm mt-1">{framework.description}</p>
        <p className="text-xs text-muted-foreground mt-2">适用场景: {framework.适用场景}</p>
      </div>
    );
  };

  const getPressureIndicator = (level: "low" | "medium" | "high") => {
    switch (level) {
      case "low":
        return <Shield className="w-4 h-4 text-green-500" />;
      case "medium":
        return <ShieldCheck className="w-4 h-4 text-yellow-500" />;
      case "high":
        return <Zap className="w-4 h-4 text-red-500" />;
      default:
        return <Shield className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Title Defense Framework Trainer
          </CardTitle>
          <CardDescription>
            Master your research title defense with structured communication frameworks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleAnalyzeTitle} disabled={isLoading}>
              <Wand2 className="w-4 h-4 mr-2" />
              {isLoading ? "Analyzing..." : "Analyze Title"}
            </Button>
            <Button onClick={handleGenerateQuestions} disabled={isLoading || !researchTitle}>
              <HelpCircle className="w-4 h-4 mr-2" />
              {isLoading ? "Generating..." : "Generate Questions"}
            </Button>
            <Button 
              variant="outline" 
              onClick={toggleRecording}
              className={isRecording ? "bg-red-500 text-white hover:bg-red-600" : ""}
            >
              {isRecording ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Record Practice
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={toggleTimer}
              className={isTimerRunning ? "bg-blue-500 text-white hover:bg-blue-600" : ""}
            >
              {isTimerRunning ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Pause Timer
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Timer
                </>
              )}
            </Button>
            <Button variant="outline" onClick={resetTimer}>
              <RotateCw className="w-4 h-4 mr-2" />
              Reset Timer
            </Button>
            <Button variant="outline" onClick={resetPractice}>
              <RotateCw className="w-4 h-4 mr-2" />
              Reset Practice
            </Button>
            <Button
              variant="outline"
              onClick={handleSaveAsDraft}
              disabled={isSaving}
            >
              <FilePlus2 className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save as Draft"}
            </Button>
            <Button variant="outline" onClick={exportResponses}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>Timer: {formatTime(timerSeconds)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span>Stress Level: {stressLevel}%</span>
            </div>
            <Progress value={stressLevel} className="w-24" />
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="title">Research Title</TabsTrigger>
          <TabsTrigger value="framework">Framework Guide</TabsTrigger>
          <TabsTrigger value="questions">Defense Questions</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="title" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Your Research Title
              </CardTitle>
              <CardDescription>
                Enter your research title for targeted question generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Research Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., The Impact of AI on Higher Education"
                    value={researchTitle}
                    onChange={(e) => setResearchTitle(e.target.value)}
                  />
                </div>
                
                {titleAnalysis && (
                  <Card className="bg-muted/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        Title Analysis Results
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                        <div className="text-center p-3 border rounded">
                          <div className="text-2xl font-bold">{titleAnalysis.clarity}%</div>
                          <div className="text-xs text-muted-foreground">Clarity</div>
                        </div>
                        <div className="text-center p-3 border rounded">
                          <div className="text-2xl font-bold">{titleAnalysis.significance}%</div>
                          <div className="text-xs text-muted-foreground">Significance</div>
                        </div>
                        <div className="text-center p-3 border rounded">
                          <div className="text-2xl font-bold">{titleAnalysis.scope}%</div>
                          <div className="text-xs text-muted-foreground">Scope</div>
                        </div>
                        <div className="text-center p-3 border rounded">
                          <div className="text-2xl font-bold">{titleAnalysis.uniqueness}%</div>
                          <div className="text-xs text-muted-foreground">Uniqueness</div>
                        </div>
                        <div className="text-center p-3 border rounded">
                          <div className="text-2xl font-bold">{titleAnalysis.alignment}%</div>
                          <div className="text-xs text-muted-foreground">Alignment</div>
                        </div>
                        <div className="text-center p-3 border rounded bg-primary/10">
                          <div className="text-2xl font-bold">{titleAnalysis.overall}%</div>
                          <div className="text-xs text-muted-foreground">Overall</div>
                        </div>
                      </div>
                      
                      {titleAnalysis.violations.length > 0 && (
                        <div className="mt-4 p-3 border border-red-200 rounded bg-red-50/50">
                          <h4 className="font-semibold text-red-600 mb-2">Format Violations</h4>
                          <ul className="space-y-2">
                            {titleAnalysis.violations.map((violation, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="font-medium">{violation.violation}</p>
                                  <p className="text-xs text-muted-foreground">
                                    <span className="font-medium">Section:</span> {violation.section} | 
                                    <span className="font-medium"> Guideline:</span> {violation.guideline}
                                  </p>
                                  <p className="text-xs">
                                    <span className="font-medium">Suggestion:</span> {violation.suggestion}
                                  </p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {titleAnalysis.suggestions.length > 0 && (
                        <div className="mt-4 p-3 border border-green-200 rounded bg-green-50/50">
                          <h4 className="font-semibold text-green-600 mb-2">Suggestions</h4>
                          <ul className="space-y-2">
                            {titleAnalysis.suggestions.map((suggestion, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
                
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3">Tips for Effective Title Justification</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Clearly identify the main variables or concepts in your title</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Link your title to significant problems or research gaps</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Express the scope, population, method, and setting clearly</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Articulate what makes your approach unique and relevant</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Reflect academic field requirements and program alignment</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="framework" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Framework Library
                  </CardTitle>
                  <CardDescription>
                    Select a framework to guide your title defense responses
                  </CardDescription>
                </div>
                <div className="w-full sm:w-48">
                  <Label>Selected Framework</Label>
                  <Select 
                    value={selectedFramework} 
                    onValueChange={(value: FrameworkType) => setSelectedFramework(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select framework" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(OTHER_FRAMEWORKS).map(([key, framework]) => (
                        <SelectItem key={key} value={key as FrameworkType}>
                          {framework.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {getFrameworkGuide()}
              
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Framework Steps</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {OTHER_FRAMEWORKS[selectedFramework].steps.map((step: any, index: number) => (
                    <div key={step.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                          {index + 1}
                        </div>
                        <h5 className="font-semibold">{step.title}</h5>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                      <div className="mt-2 p-2 bg-muted rounded">
                        <p className="text-xs font-medium mb-1">Example:</p>
                        <p className="text-xs italic">"{step.example}"</p>
                      </div>
                      <div className="mt-2 flex items-start gap-1">
                        <Lightbulb className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-muted-foreground">{step.tip}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <Accordion type="single" collapsible className="mt-6">
                <AccordionItem value="framework-comparison">
                  <AccordionTrigger>Framework Comparison</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left pb-2">Framework</th>
                              <th className="text-left pb-2">Best For</th>
                              <th className="text-left pb-2">Structure</th>
                              <th className="text-left pb-2">Example Use</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b">
                              <td className="py-2 font-medium">PREP</td>
                              <td className="py-2">Justifying choices</td>
                              <td className="py-2">Point → Reason → Example → Point</td>
                              <td className="py-2">"Why this methodology?"</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2 font-medium">PEEL</td>
                              <td className="py-2">Evidence-based answers</td>
                              <td className="py-2">Point → Evidence → Explain → Link</td>
                              <td className="py-2">"Supporting literature"</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2 font-medium">STAR</td>
                              <td className="py-2">Describing experiences</td>
                              <td className="py-2">Situation → Task → Action → Result</td>
                              <td className="py-2">"Pilot study challenges"</td>
                            </tr>
                            <tr>
                              <td className="py-2 font-medium">ADD</td>
                              <td className="py-2">Factual questions</td>
                              <td className="py-2">Answer → Details → Data</td>
                              <td className="py-2">"Sample size, timeline"</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="questions" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5" />
                    Title Defense Questions
                  </CardTitle>
                  <CardDescription>
                    Practice answering common title defense questions
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveAsDraft}
                    disabled={isSaving}
                  >
                    <FilePlus2 className="w-4 h-4 mr-2" />
                    {isSaving ? "Saving..." : "Save as Draft"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-11/12" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-10/12" />
                </div>
              ) : questions.length > 0 ? (
                <div className="space-y-6">
                  {questions.map((question, index) => {
                    const response = responses.find(r => r.questionId === question.id);
                    return (
                      <div key={question.id} className="space-y-3 p-4 border rounded-lg bg-muted/30">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline">Q{index + 1}</Badge>
                          <Badge variant={
                            question.difficulty === "easy" ? "default" : 
                            question.difficulty === "medium" ? "secondary" : "destructive"
                          }>
                            {question.difficulty}
                          </Badge>
                          <Badge variant="outline">{question.category}</Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {question.suggestedFramework}
                          </Badge>
                          {selectedFramework === question.suggestedFramework && (
                            <Badge variant="default">Framework Match</Badge>
                          )}
                          <Badge variant="outline" className="flex items-center gap-1">
                            {getPressureIndicator(question.pressureLevel)}
                            {question.pressureLevel} pressure
                          </Badge>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                          <p className="font-medium flex-1">{question.question}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopy(question.question)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="mt-3 space-y-3">
                          <div>
                            <Label className="text-sm">Your Response (Using {selectedFramework} Framework)</Label>
                            <Textarea
                              placeholder={`Use the ${selectedFramework} framework to structure your response...`}
                              value={response?.response || ""}
                              onChange={(e) => handleResponseChange(question.id, e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-sm flex items-center gap-2">
                              <Target className="w-4 h-4" />
                              Confidence Level: {response?.confidence || 50}%
                            </Label>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-muted-foreground">Low</span>
                              <Progress 
                                value={response?.confidence || 50} 
                                className="flex-1" 
                                onClick={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  const percent = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                                  handleConfidenceChange(question.id, Math.max(0, Math.min(100, percent)));
                                }}
                              />
                              <span className="text-xs text-muted-foreground">High</span>
                            </div>
                            <div className="flex gap-2">
                              {[0, 25, 50, 75, 100].map((level) => (
                                <Button
                                  key={level}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleConfidenceChange(question.id, level)}
                                  className="text-xs"
                                >
                                  {level}%
                                </Button>
                              ))}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-sm flex items-center gap-2">
                              <Zap className="w-4 h-4" />
                              Stress Level: {response?.stressLevel || stressLevel}%
                            </Label>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-muted-foreground">Low</span>
                              <Progress 
                                value={response?.stressLevel || stressLevel} 
                                className="flex-1" 
                                onClick={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  const percent = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                                  handleStressLevelChange(question.id, Math.max(0, Math.min(100, percent)));
                                }}
                              />
                              <span className="text-xs text-muted-foreground">High</span>
                            </div>
                            <div className="flex gap-2">
                              {[0, 25, 50, 75, 100].map((level) => (
                                <Button
                                  key={level}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStressLevelChange(question.id, level)}
                                  className="text-xs"
                                >
                                  {level}%
                                </Button>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Save className="w-4 h-4 mr-2" />
                              Save Draft
                            </Button>
                            <Button variant="outline" size="sm">
                              <Mic className="w-4 h-4 mr-2" />
                              Record Answer
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <HelpCircle className="w-12 h-12 mx-auto mb-4" />
                  <p>Enter your research title and click "Generate Questions" to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Performance Dashboard
              </CardTitle>
              <CardDescription>
                Track your progress in title defense preparation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Questions Answered</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{responses.length}</div>
                    <p className="text-xs text-muted-foreground">+2 from last week</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {responses.length > 0 
                        ? Math.round(responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length) 
                        : 0}%
                    </div>
                    <Progress 
                      value={responses.length > 0 
                        ? responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length 
                        : 0} 
                      className="mt-2" 
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Avg Stress Level</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {responses.length > 0 
                        ? Math.round(responses.reduce((sum, r) => (sum + (r.stressLevel || 0)), 0) / responses.length) 
                        : 0}%
                    </div>
                    <Progress 
                      value={responses.length > 0 
                        ? responses.reduce((sum, r) => (sum + (r.stressLevel || 0)), 0) / responses.length 
                        : 0} 
                      className="mt-2" 
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Study Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Math.round(responses.length * 15 / 60)}h
                    </div>
                    <p className="text-xs text-muted-foreground">Approximate practice time</p>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold">Framework Mastery</h3>
                {Object.entries(OTHER_FRAMEWORKS).map(([key, framework]: [string, any]) => {
                  const responsesForFramework = responses.filter(r => r.frameworkUsed === key);
                  const avgConfidence = responsesForFramework.length > 0 
                    ? responsesForFramework.reduce((sum, r) => sum + r.confidence, 0) / responsesForFramework.length
                    : 0;
                  const avgStress = responsesForFramework.length > 0 
                    ? responsesForFramework.reduce((sum, r) => (sum + (r.stressLevel || 0)), 0) / responsesForFramework.length
                    : 0;
                    
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{framework.name}</span>
                        <span>{responsesForFramework.length} attempts</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Confidence: {Math.round(avgConfidence)}%</span>
                            <span>Mastery: {avgConfidence > 80 ? "Expert" : avgConfidence > 60 ? "Proficient" : "Developing"}</span>
                          </div>
                          <Progress value={avgConfidence} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span>Stress: {Math.round(avgStress)}%</span>
                            <span>Management: {avgStress < 30 ? "Excellent" : avgStress < 50 ? "Good" : "Needs Work"}</span>
                          </div>
                          <Progress value={avgStress} className="h-2" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Title Defense Strategies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                During Your Title Defense
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Know your title inside and out</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Anticipate challenging questions about variables and relationships</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Prepare clear justifications for all title components</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Practice explaining complex title elements simply</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Managing Pressure
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Use the 3-second pause technique before answering</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Redirect difficult questions to your title components</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Ask for clarification if a question is unclear</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Stay hydrated and take breaks when permitted</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Remember the panel wants you to succeed</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}