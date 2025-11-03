// Proposal Q&A Framework Trainer
// Targeted tool for defending research proposals with PREP/PEEL frameworks

"use client";

import { useState } from "react";
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
  RotateCcw,
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

// Proposal-specific types
type ProposalQuestionCategory = 
  | "rationale" 
  | "methodology" 
  | "significance" 
  | "feasibility" 
  | "literature" 
  | "ethical" 
  | "limitations" 
  | "timeline";

type FrameworkType = "PREP" | "PEEL" | "STAR" | "ADD";

interface ProposalQuestion {
  id: string;
  question: string;
  category: ProposalQuestionCategory;
  difficulty: "easy" | "medium" | "hard";
  suggestedFramework: FrameworkType;
  pressureLevel: "low" | "medium" | "high";
}

interface ProposalResponse {
  questionId: string;
  response: string;
  frameworkUsed: FrameworkType;
  confidence: number;
  timestamp: Date;
  feedback?: string;
  stressLevel?: number;
}

interface ProposalSection {
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

export function ProposalQAFrameTrainer() {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const router = useRouter();
  
  const [proposalSections, setProposalSections] = useState<ProposalSection[]>([
    { id: "introduction", title: "Introduction", content: "" },
    { id: "literature", title: "Literature Review", content: "" },
    { id: "methodology", title: "Methodology", content: "" },
    { id: "timeline", title: "Timeline", content: "" },
    { id: "budget", title: "Budget", content: "" }
  ]);
  const [questions, setQuestions] = useState<ProposalQuestion[]>([]);
  const [responses, setResponses] = useState<ProposalResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState<FrameworkType>("PREP");
  const [activeTab, setActiveTab] = useState("sections");
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [anxietyTriggers, setAnxietyTriggers] = useState<AnxietyTrigger[]>([]);
  const [stressLevel, setStressLevel] = useState(50);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Framework definitions for proposal defense
  const FRAMEWORKS: Record<FrameworkType, any> = {
    PREP: {
      name: "PREP Framework",
      description: "Point, Reason, Example, Point - For persuasive, structured answers",
      适用场景: "Justifying research choices, explaining rationale, defending methodology",
      steps: [
        {
          id: "point",
          title: "Point",
          description: "State your main point clearly and directly",
          example: "Our methodology incorporates both quantitative and qualitative approaches.",
          tip: "Be specific and avoid vague statements"
        },
        {
          id: "reason",
          title: "Reason",
          description: "Provide the logical reason or justification for your point",
          example: "This addresses the complexity of our research questions and aligns with mixed-methods best practices.",
          tip: "Connect to literature or established theories"
        },
        {
          id: "example",
          title: "Example",
          description: "Give a concrete example or evidence to support your reason",
          example: "Specifically, our research questions require both statistical analysis and in-depth exploration of participant experiences.",
          tip: "Use statistics or specific references when possible"
        },
        {
          id: "point2",
          title: "Point (Restate)",
          description: "Restate your main point or link to broader implications",
          example: "Therefore, our mixed-methods approach strengthens the validity of our conclusions.",
          tip: "Connect back to significance or future applications"
        }
      ]
    },
    PEEL: {
      name: "PEEL Framework",
      description: "Point, Evidence, Explain, Link - For evidence-based, analytical answers",
      适用场景: "Supporting claims, discussing methodology, interpreting results",
      steps: [
        {
          id: "point",
          title: "Point",
          description: "Make a clear statement about your position or finding",
          example: "Our sample size of 300 participants is adequate for our research design.",
          tip: "State your point confidently without hedging"
        },
        {
          id: "evidence",
          title: "Evidence",
          description: "Provide supporting evidence from literature or your data",
          example: "According to Cohen (1988), a sample size of 200-300 is sufficient for detecting medium effect sizes.",
          tip: "Cite specific sources or data points"
        },
        {
          id: "explain",
          title: "Explain",
          description: "Explain how the evidence supports your point",
          example: "This ensures our study has adequate statistical power while remaining feasible within our timeframe.",
          tip: "Show the logical connection, don't just state it"
        },
        {
          id: "link",
          title: "Link",
          description: "Connect your point to broader implications or next steps",
          example: "Thus, our sample size supports both internal validity and practical completion of the study.",
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
          example: "During our pilot study, we encountered unexpectedly low response rates from participants.",
          tip: "Set the scene without unnecessary detail"
        },
        {
          id: "task",
          title: "Task",
          description: "Explain what needed to be accomplished",
          example: "We needed to increase participation while maintaining data quality.",
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
          example: "Our data collection period is 3 months.",
          tip: "Answer the specific question asked, nothing more"
        },
        {
          id: "details",
          title: "Details",
          description: "Provide relevant details to support your answer",
          example: "This includes 1 month for recruitment, 1.5 months for data collection, and 0.5 months for data cleaning.",
          tip: "Include only pertinent details"
        },
        {
          id: "data",
          title: "Data",
          description: "Offer supporting data, statistics, or references",
          example: "This follows the recommended timeline ratios for survey research validity (Smith et al., 2020).",
          tip: "Use specific numbers or citations when available"
        }
      ]
    }
  };

  // Common proposal defense questions
  const COMMON_QUESTIONS: ProposalQuestion[] = [
    {
      id: "p1",
      question: "Why is your study significant?",
      category: "significance",
      difficulty: "medium",
      suggestedFramework: "PREP",
      pressureLevel: "medium"
    },
    {
      id: "p2",
      question: "What research gap does your study address?",
      category: "rationale",
      difficulty: "hard",
      suggestedFramework: "PEEL",
      pressureLevel: "high"
    },
    {
      id: "p3",
      question: "Why did you choose this methodology?",
      category: "methodology",
      difficulty: "hard",
      suggestedFramework: "PEEL",
      pressureLevel: "high"
    },
    {
      id: "p4",
      question: "What are the potential limitations of your study?",
      category: "limitations",
      difficulty: "hard",
      suggestedFramework: "PEEL",
      pressureLevel: "high"
    },
    {
      id: "p5",
      question: "How will you ensure ethical considerations are met?",
      category: "ethical",
      difficulty: "medium",
      suggestedFramework: "ADD",
      pressureLevel: "low"
    },
    {
      id: "p6",
      question: "What resources do you need and how will you obtain them?",
      category: "feasibility",
      difficulty: "medium",
      suggestedFramework: "STAR",
      pressureLevel: "medium"
    },
    {
      id: "p7",
      question: "How does your theoretical framework support your research questions?",
      category: "literature",
      difficulty: "hard",
      suggestedFramework: "PEEL",
      pressureLevel: "high"
    },
    {
      id: "p8",
      question: "Is your timeline realistic for completing this research?",
      category: "timeline",
      difficulty: "medium",
      suggestedFramework: "ADD",
      pressureLevel: "low"
    }
  ];

  // Timer effect
  useState(() => {
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
      // Simulate question generation based on proposal content
      setTimeout(() => {
        // In a real implementation, this would analyze the proposal sections
        // and generate relevant questions
        setQuestions(COMMON_QUESTIONS);
        toast.success("Proposal defense questions generated!");
        setIsLoading(false);
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || "Failed to generate questions.");
      setIsLoading(false);
    }
  };

  const handleSectionChange = (sectionId: string, content: string) => {
    setProposalSections(prev => 
      prev.map(section => 
        section.id === sectionId ? {...section, content} : section
      )
    );
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleSaveAsDraft = async () => {
    if (!user || !proposalSections.some(s => s.content.trim())) return;
    setIsSaving(true);

    let content = `<h1>Proposal Q&A Framework Practice</h1><hr>`;
    
    content += `<h2>Proposal Sections</h2>`;
    proposalSections.forEach(section => {
      if (section.content.trim()) {
        content += `<h3>${section.title}</h3><p>${section.content}</p>`;
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
        title: "Proposal Q&A Framework Practice",
        content: content,
      })
      .select("id")
      .single();

    if (error) {
      toast.error("Failed to save draft.");
    } else if (newDoc) {
      toast.success("Proposal Q&A practice saved as a new draft!");
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
      proposalSections,
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
    a.download = 'proposal-qa-practice.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Proposal Q&A practice exported successfully!");
  };

  const resetPractice = () => {
    setResponses([]);
    setStressLevel(50);
    toast.info("Proposal Q&A practice reset");
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
            <FilePlus2 className="w-5 h-5" />
            Proposal Q&A Framework Trainer
          </CardTitle>
          <CardDescription>
            Targeted practice for proposal defense using PREP/PEEL frameworks
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
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Timer
            </Button>
            <Button variant="outline" onClick={resetPractice}>
              <RotateCcw className="w-4 h-4 mr-2" />
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
          <TabsTrigger value="sections">Proposal Sections</TabsTrigger>
          <TabsTrigger value="framework">Framework Guide</TabsTrigger>
          <TabsTrigger value="questions">Defense Questions</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sections" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FilePlus2 className="w-5 h-5" />
                Your Proposal Sections
              </CardTitle>
              <CardDescription>
                Enter content from your proposal for targeted question generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {proposalSections.map((section) => (
                  <div key={section.id} className="space-y-2">
                    <Label htmlFor={section.id}>{section.title}</Label>
                    <Textarea
                      id={section.id}
                      placeholder={`Enter key points from your ${section.title.toLowerCase()}...`}
                      value={section.content}
                      onChange={(e) => handleSectionChange(section.id, e.target.value)}
                      className="min-h-[120px] resize-y"
                    />
                  </div>
                ))}
                
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3">Tips for Effective Proposal Sections</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Know your proposal inside and out</span>
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
                    Select a framework to guide your proposal defense responses
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
                    Proposal Defense Questions
                  </CardTitle>
                  <CardDescription>
                    Practice answering common proposal defense questions
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
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <p>Click "Generate Questions" to get started with proposal defense practice</p>
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
                Track your progress in proposal defense preparation
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
            Proposal Defense Strategies
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
                  <span>Listen carefully to each question before responding</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Take a moment to organize your thoughts</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Use frameworks to structure complex answers</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Admit limitations honestly but confidently</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Maintain eye contact and composed body language</span>
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
      
      {/* Dialogs for each trainer */}
      <Dialog open={isGeneralTrainerOpen} onOpenChange={setIsGeneralTrainerOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              General Q&A Framework Trainer
            </DialogTitle>
          </DialogHeader>
          <GeneralQAFrameTrainer />
        </DialogContent>
      </Dialog>
      
      <Dialog open={isTitleTrainerOpen} onOpenChange={setIsTitleTrainerOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Title Defense Framework Trainer
            </DialogTitle>
          </DialogHeader>
          <TitleDefenseFrameTrainer />
        </DialogContent>
      </Dialog>
      
      <Dialog open={isProposalTrainerOpen} onOpenChange={setIsProposalTrainerOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FilePlus2 className="w-5 h-5" />
              Proposal Q&A Framework Trainer
            </DialogTitle>
          </DialogHeader>
          <ProposalQAFrameTrainer />
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDefenseTrainerOpen} onOpenChange={setIsDefenseTrainerOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              Final Defense Q&A Framework Trainer
            </DialogTitle>
          </DialogHeader>
          <DefenseQAFrameTrainer />
        </DialogContent>
      </Dialog>
    </div>
  );
}