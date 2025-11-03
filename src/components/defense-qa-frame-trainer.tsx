// Final Defense Q&A Framework Trainer
// Advanced tool for final oral research defense with comprehensive framework support

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
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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

// Final defense specific types
type DefenseQuestionCategory = 
  | "results" 
  | "interpretation" 
  | "limitations" 
  | "implications" 
  | "contributions" 
  | "methodology" 
  | "validity" 
  | "future";

type FrameworkType = "PREP" | "PEEL" | "STAR" | "ADD";

interface DefenseQuestion {
  id: string;
  question: string;
  category: DefenseQuestionCategory;
  difficulty: "easy" | "medium" | "hard";
  suggestedFramework: FrameworkType;
  pressureLevel: "low" | "medium" | "high";
}

interface DefenseResponse {
  questionId: string;
  response: string;
  frameworkUsed: FrameworkType;
  confidence: number;
  timestamp: Date;
  feedback?: string;
  stressLevel?: number;
}

interface ChapterContent {
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

export function DefenseQAFrameTrainer() {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const router = useRouter();
  
  const [thesisChapters, setThesisChapters] = useState<ChapterContent[]>([
    { id: "chapter1", title: "Introduction", content: "" },
    { id: "chapter2", title: "Literature Review", content: "" },
    { id: "chapter3", title: "Methodology", content: "" },
    { id: "chapter4", title: "Results and Discussion", content: "" },
    { id: "chapter5", title: "Conclusion and Recommendations", content: "" }
  ]);
  const [questions, setQuestions] = useState<DefenseQuestion[]>([]);
  const [responses, setResponses] = useState<DefenseResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState<FrameworkType>("PEEL");
  const [activeTab, setActiveTab] = useState("chapters");
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [anxietyTriggers, setAnxietyTriggers] = useState<AnxietyTrigger[]>([]);
  const [stressLevel, setStressLevel] = useState(50);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Framework definitions for final defense
  const FRAMEWORKS: Record<FrameworkType, any> = {
    PREP: {
      name: "PREP Framework",
      description: "Point, Reason, Example, Point - For persuasive, structured answers",
      适用场景: "Justifying findings, explaining unexpected results, defending conclusions",
      steps: [
        {
          id: "point",
          title: "Point",
          description: "State your main point clearly and directly",
          example: "Our study demonstrates a significant positive correlation between X and Y.",
          tip: "Be specific and avoid vague statements"
        },
        {
          id: "reason",
          title: "Reason",
          description: "Provide the logical reason or justification for your point",
          example: "This validates our initial hypothesis based on social learning theory.",
          tip: "Connect to theory, literature, or established theories"
        },
        {
          id: "example",
          title: "Example",
          description: "Give a concrete example or evidence to support your reason",
          example: "Specifically, 78% of participants showed improved outcomes with intervention Z.",
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
      适用场景: "Interpreting results, discussing validity, addressing methodology",
      steps: [
        {
          id: "point",
          title: "Point",
          description: "Make a clear statement about your position or finding",
          example: "Our methodology was robust and appropriate for addressing our research questions.",
          tip: "State your point confidently without hedging"
        },
        {
          id: "evidence",
          title: "Evidence",
          description: "Provide supporting evidence from literature or your data",
          example: "Validity testing showed Cronbach's alpha of 0.89, exceeding the acceptable threshold.",
          tip: "Cite specific data points, statistics, or references"
        },
        {
          id: "explain",
          title: "Explain",
          description: "Explain how the evidence supports your point",
          example: "This high reliability coefficient indicates our instrument consistently measured constructs.",
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
      适用场景: "Discussing pilot studies, problem-solving, methodological challenges",
      steps: [
        {
          id: "situation",
          title: "Situation",
          description: "Describe the context or background situation",
          example: "During data collection, we encountered unexpectedly low response rates from participants.",
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
      适用场景: "Brief factual questions, definitions, procedural explanations",
      steps: [
        {
          id: "answer",
          title: "Answer",
          description: "Give a direct, concise answer to the question",
          example: "Our sample size was 300 participants.",
          tip: "Answer the specific question asked, nothing more"
        },
        {
          id: "details",
          title: "Details",
          description: "Provide relevant details to support your answer",
          example: "This included 150 males and 150 females aged 18-25.",
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
    }
  };

  // Common final defense questions
  const COMMON_QUESTIONS: DefenseQuestion[] = [
    {
      id: "f1",
      question: "How do your findings compare to your initial hypotheses?",
      category: "results",
      difficulty: "hard",
      suggestedFramework: "PEEL",
      pressureLevel: "high"
    },
    {
      id: "f2",
      question: "What are the implications of your findings for [field/stakeholders]?",
      category: "implications",
      difficulty: "hard",
      suggestedFramework: "PREP",
      pressureLevel: "high"
    },
    {
      id: "f3",
      question: "What are the limitations of your study?",
      category: "limitations",
      difficulty: "medium",
      suggestedFramework: "PEEL",
      pressureLevel: "medium"
    },
    {
      id: "f4",
      question: "How could your research be extended in future studies?",
      category: "future",
      difficulty: "medium",
      suggestedFramework: "STAR",
      pressureLevel: "medium"
    },
    {
      id: "f5",
      question: "How do your findings contribute to existing literature?",
      category: "contributions",
      difficulty: "hard",
      suggestedFramework: "PEEL",
      pressureLevel: "high"
    },
    {
      id: "f6",
      question: "What would you do differently if you could redo this study?",
      category: "limitations",
      difficulty: "hard",
      suggestedFramework: "STAR",
      pressureLevel: "high"
    },
    {
      id: "f7",
      question: "How do you know your results are valid and reliable?",
      category: "validity",
      difficulty: "hard",
      suggestedFramework: "PEEL",
      pressureLevel: "high"
    },
    {
      id: "f8",
      question: "What recommendations do you have based on your findings?",
      category: "implications",
      difficulty: "medium",
      suggestedFramework: "PREP",
      pressureLevel: "medium"
    },
    {
      id: "f9",
      question: "How did you address ethical considerations in your research?",
      category: "methodology",
      difficulty: "medium",
      suggestedFramework: "ADD",
      pressureLevel: "low"
    },
    {
      id: "f10",
      question: "What challenges did you face during data collection?",
      category: "methodology",
      difficulty: "medium",
      suggestedFramework: "STAR",
      pressureLevel: "medium"
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

  const handleGenerateQuestions = async () => {
    if (!session) {
      toast.error("You must be logged in to use this feature.");
      return;
    }

    setIsLoading(true);
    setQuestions([]);
    
    try {
      // Simulate question generation based on thesis content
      setTimeout(() => {
        // In a real implementation, this would analyze the thesis chapters
        // and generate relevant questions
        setQuestions(COMMON_QUESTIONS);
        toast.success("Final defense questions generated!");
        setIsLoading(false);
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || "Failed to generate questions.");
      setIsLoading(false);
    }
  };

  const handleChapterChange = (chapterId: string, content: string) => {
    setThesisChapters(prev => 
      prev.map(chapter => 
        chapter.id === chapterId ? {...chapter, content} : chapter
      )
    );
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleSaveAsDraft = async () => {
    if (!user || !thesisChapters.some(ch => ch.content.trim())) return;
    setIsSaving(true);

    let content = `<h1>Final Defense Q&A Framework Practice</h1><hr>`;
    
    content += `<h2>Thesis Chapters</h2>`;
    thesisChapters.forEach(chapter => {
      if (chapter.content.trim()) {
        content += `<h3>${chapter.title}</h3><p>${chapter.content}</p>`;
      }
    });
    
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
        title: "Final Defense Q&A Framework Practice",
        content: content,
      })
      .select("id")
      .single();

    if (error) {
      toast.error("Failed to save draft.");
    } else if (newDoc) {
      toast.success("Final defense Q&A practice saved as a new draft!");
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
      thesisChapters,
      questions: questions.map(q => {
        const response = responses.find(r => r.questionId === q.id);
        return {
          ...q,
          response: response?.response || "",
          confidence: response?.confidence || 50,
          stressLevel: response?.stressLevel || stressLevel,
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
    a.download = 'final-defense-qa-practice.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Final defense Q&A practice exported successfully!");
  };

  const resetPractice = () => {
    setResponses([]);
    setStressLevel(50);
    toast.info("Final defense Q&A practice reset");
  };

  const getFrameworkGuide = () => {
    const framework = FRAMEWORKS[selectedFramework];
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
            <ShieldCheck className="w-5 h-5" />
            Final Defense Q&A Framework Trainer
          </CardTitle>
          <CardDescription>
            Master your final oral research defense with structured communication frameworks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleGenerateQuestions} disabled={isLoading}>
              <Wand2 className="w-4 h-4 mr-2" />
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
          <TabsTrigger value="chapters">Thesis Chapters</TabsTrigger>
          <TabsTrigger value="framework">Framework Guide</TabsTrigger>
          <TabsTrigger value="questions">Defense Questions</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chapters" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FilePlus2 className="w-5 h-5" />
                Your Thesis Chapters
              </CardTitle>
              <CardDescription>
                Enter content from your complete thesis for targeted question generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {thesisChapters.map((chapter) => (
                  <div key={chapter.id} className="space-y-2">
                    <Label htmlFor={chapter.id}>{chapter.title}</Label>
                    <Textarea
                      id={chapter.id}
                      placeholder={`Enter key points from your ${chapter.title.toLowerCase()}...`}
                      value={chapter.content}
                      onChange={(e) => handleChapterChange(chapter.id, e.target.value)}
                      className="min-h-[120px]"
                    />
                  </div>
                ))}
                
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3">Tips for Effective Thesis Sections</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Clearly articulate your research problem and objectives</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Demonstrate thorough understanding of relevant literature</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Justify your methodology with clear rationale</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Address potential limitations and ethical considerations</span>
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
                    Select a framework to guide your final defense responses
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
                      {Object.entries(FRAMEWORKS).map(([key, framework]) => (
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
                  {FRAMEWORKS[selectedFramework].steps.map((step: any, index: number) => (
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
                        <p className="text-xs italic">&quot;{step.example}&quot;</p>
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
                              <td className="py-2">&quot;Why these recommendations?&quot;</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2 font-medium">PEEL</td>
                              <td className="py-2">Evidence-based answers</td>
                              <td className="py-2">Point → Evidence → Explain → Link</td>
                              <td className="py-2">&quot;Supporting literature&quot;</td>
                            </tr>
                            <tr className="border-b">
                              <td className="py-2 font-medium">STAR</td>
                              <td className="py-2">Describing experiences</td>
                              <td className="py-2">Situation → Task → Action → Result</td>
                              <td className="py-2">&quot;Pilot study challenges&quot;</td>
                            </tr>
                            <tr>
                              <td className="py-2 font-medium">ADD</td>
                              <td className="py-2">Factual questions</td>
                              <td className="py-2">Answer → Details → Data</td>
                              <td className="py-2">&quot;Sample size, timeline&quot;</td>
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
                    Final Defense Questions
                  </CardTitle>
                  <CardDescription>
                    Practice answering high-pressure final defense questions
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
                          <Badge variant="outline" className="flex items-center gap-1">
                            {getPressureIndicator(question.pressureLevel)}
                            {question.pressureLevel} pressure
                          </Badge>
                          {selectedFramework === question.suggestedFramework && (
                            <Badge variant="default">Framework Match</Badge>
                          )}
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
                  <p>Click &quot;Generate Questions&quot; to get started with final defense practice</p>
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
                Track your progress in final defense preparation
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
                {Object.entries(FRAMEWORKS).map(([key, framework]: [string, any]) => {
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
            Final Defense Strategies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                During Your Defense
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Know your research inside and out</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Anticipate challenging questions about methodology</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Prepare clear justifications for all major decisions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Practice explaining complex concepts simply</span>
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
                  <span>Redirect difficult questions to your data</span>
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
