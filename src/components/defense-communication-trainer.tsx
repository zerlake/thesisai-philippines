// Research Defense Communication Trainer
// A comprehensive tool to help students master panel Q&A using structured frameworks

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Badge, 
  BadgeProps 
} from "@/components/ui/badge";
import { 
  Progress 
} from "@/components/ui/progress";
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
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import {
  BookOpen,
  Play,
  Pause,
  Square,
  Mic,
  MicOff,
  Download,
  Star,
  Trophy,
  Brain,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  Copy,
  Volume2,
  VolumeX,
  RotateCcw,
  Save,
  FileText,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  TrendingUp,
  Calendar,
  User,
  Award,
  Flag,
  MessageCircle,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { toast } from "sonner";

// Type definitions
type FrameworkType = "PREP" | "PEEL" | "STAR" | "ADD" | "CLEAR";
type DefenseStage = "title" | "proposal" | "defense";
type QuestionCategory = "rationale" | "methodology" | "significance" | "feasibility" | "results" | "limitations" | "implications" | "contribution";

interface Framework {
  id: FrameworkType;
  name: string;
  description: string;
  steps: FrameworkStep[];
 适用场景: string;
}

interface FrameworkStep {
  id: string;
  title: string;
  description: string;
  example: string;
  tip: string;
}

interface PracticeQuestion {
  id: string;
  question: string;
  category: QuestionCategory;
  difficulty: "easy" | "medium" | "hard";
  frameworkSuggestions: FrameworkType[];
}

interface StudentResponse {
  id: string;
  questionId: string;
  framework: FrameworkType;
  responseParts: Record<string, string>;
  timestamp: Date;
  confidence: number;
  feedback: string;
  audioRecording?: string;
}

interface PerformanceMetric {
  framework: FrameworkType;
  questionsAttempted: number;
  averageConfidence: number;
  strengths: string[];
  areasForImprovement: string[];
}

interface AnxietyTrigger {
  id: string;
  category: QuestionCategory;
  trigger: string;
  frequency: number;
  copingStrategy: string;
}

// Framework definitions
const FRAMEWORKS: Record<FrameworkType, Framework> = {
  PREP: {
    id: "PREP",
    name: "PREP Framework",
    description: "Point, Reason, Example, Point - A clear structure for persuasive answers",
    适用场景: "Justifying choices, explaining rationale, defending methodology",
    steps: [
      {
        id: "point",
        title: "Point",
        description: "State your main point clearly and directly",
        example: "Our study focuses on the impact of social media on student learning outcomes.",
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
    id: "PEEL",
    name: "PEEL Framework",
    description: "Point, Evidence, Explain, Link - Ideal for evidence-based answers",
    适用场景: "Supporting claims, discussing methodology, interpreting results",
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
        example: "This approach strengthens our conclusions and recommendations.",
        tip: "Link to significance, limitations, or future work"
      }
    ]
  },
  STAR: {
    id: "STAR",
    name: "STAR Framework",
    description: "Situation, Task, Action, Result - Perfect for describing processes or experiences",
    适用场景: "Discussing pilot studies, methodological challenges, problem-solving",
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
    id: "ADD",
    name: "ADD Framework",
    description: "Answer, Details, Data - Quick structure for factual questions",
    适用场景: "Brief factual questions, definitions, procedural explanations",
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
  CLEAR: {
    id: "CLEAR",
    name: "CLEAR Framework",
    description: "Clarify, Link, Express, Articulate, Reflect - Specifically for title defense",
    适用场景: "Defending research titles, justifying scope and focus",
    steps: [
      {
        id: "clarify",
        title: "Clarify",
        description: "Clarify the main idea or variables in your title",
        example: "Our title focuses on solar energy adoption's impact on rural communities.",
        tip: "Identify the key concepts and relationships"
      },
      {
        id: "link",
        title: "Link",
        description: "Link the title to significant problems or research gaps",
        example: "This addresses the policy gap in renewable energy implementation in rural areas.",
        tip: "Connect to broader issues or literature"
      },
      {
        id: "express",
        title: "Express",
        description: "Express the scope, population, method, and setting",
        example: "We focus on communities in Bukidnon from 2022-2024 using mixed methods.",
        tip: "Be specific about boundaries and approach"
      },
      {
        id: "articulate",
        title: "Articulate",
        description: "Articulate uniqueness, relevance, or contribution",
        example: "Few local studies exist, making this research empirically valuable.",
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
  }
};

// Practice questions database
const PRACTICE_QUESTIONS: Record<DefenseStage, PracticeQuestion[]> = {
  title: [
    {
      id: "t1",
      question: "Why did you choose this title?",
      category: "rationale",
      difficulty: "medium",
      frameworkSuggestions: ["PREP", "CLEAR"]
    },
    {
      id: "t2",
      question: "What is the main problem your study wants to solve?",
      category: "significance",
      difficulty: "medium",
      frameworkSuggestions: ["PEEL", "PREP"]
    },
    {
      id: "t3",
      question: "How is your study different from existing ones?",
      category: "contribution",
      difficulty: "hard",
      frameworkSuggestions: ["STAR", "PEEL"]
    },
    {
      id: "t4",
      question: "Is your title appropriately scoped for a thesis?",
      category: "feasibility",
      difficulty: "medium",
      frameworkSuggestions: ["CLEAR", "PREP"]
    },
    {
      id: "t5",
      question: "Does your title reflect your intended methodology?",
      category: "methodology",
      difficulty: "easy",
      frameworkSuggestions: ["ADD", "CLEAR"]
    }
  ],
  proposal: [
    {
      id: "p1",
      question: "Why is your study significant?",
      category: "significance",
      difficulty: "medium",
      frameworkSuggestions: ["PREP", "PEEL"]
    },
    {
      id: "p2",
      question: "What research gap does your study address?",
      category: "rationale",
      difficulty: "hard",
      frameworkSuggestions: ["PEEL", "PREP"]
    },
    {
      id: "p3",
      question: "Why did you choose this methodology?",
      category: "methodology",
      difficulty: "hard",
      frameworkSuggestions: ["PEEL", "STAR"]
    },
    {
      id: "p4",
      question: "What are the potential limitations of your study?",
      category: "limitations",
      difficulty: "hard",
      frameworkSuggestions: ["PEEL", "PREP"]
    },
    {
      id: "p5",
      question: "How will you ensure ethical considerations are met?",
      category: "methodology",
      difficulty: "medium",
      frameworkSuggestions: ["ADD", "PEEL"]
    },
    {
      id: "p6",
      question: "What resources do you need and how will you obtain them?",
      category: "feasibility",
      difficulty: "medium",
      frameworkSuggestions: ["STAR", "ADD"]
    },
    {
      id: "p7",
      question: "How does your theoretical framework support your research questions?",
      category: "rationale",
      difficulty: "hard",
      frameworkSuggestions: ["PEEL", "PREP"]
    }
  ],
  defense: [
    {
      id: "d1",
      question: "How do your findings compare to your initial hypotheses?",
      category: "results",
      difficulty: "hard",
      frameworkSuggestions: ["PEEL", "PREP"]
    },
    {
      id: "d2",
      question: "What are the implications of your findings for [field/stakeholders]?",
      category: "implications",
      difficulty: "hard",
      frameworkSuggestions: ["PREP", "PEEL"]
    },
    {
      id: "d3",
      question: "What are the limitations of your study?",
      category: "limitations",
      difficulty: "medium",
      frameworkSuggestions: ["PEEL", "PREP"]
    },
    {
      id: "d4",
      question: "How could your research be extended in future studies?",
      category: "contribution",
      difficulty: "medium",
      frameworkSuggestions: ["PREP", "STAR"]
    },
    {
      id: "d5",
      question: "How do your findings contribute to existing literature?",
      category: "contribution",
      difficulty: "hard",
      frameworkSuggestions: ["PEEL", "PREP"]
    },
    {
      id: "d6",
      question: "What would you do differently if you could redo this study?",
      category: "limitations",
      difficulty: "hard",
      frameworkSuggestions: ["STAR", "PEEL"]
    },
    {
      id: "d7",
      question: "How do you know your results are valid and reliable?",
      category: "results",
      difficulty: "hard",
      frameworkSuggestions: ["PEEL", "ADD"]
    },
    {
      id: "d8",
      question: "What recommendations do you have based on your findings?",
      category: "implications",
      difficulty: "medium",
      frameworkSuggestions: ["PREP", "PEEL"]
    }
  ]
};

// Anxiety triggers database
const ANXIETY_TRIGGERS: AnxietyTrigger[] = [
  {
    id: "a1",
    category: "methodology",
    trigger: "Questions about methodology choice",
    frequency: 0,
    copingStrategy: "Prepare specific reasons backed by literature for your methodological decisions"
  },
  {
    id: "a2",
    category: "results",
    trigger: "Unexpected or contrary findings",
    frequency: 0,
    copingStrategy: "Practice acknowledging limitations while highlighting valuable insights"
  },
  {
    id: "a3",
    category: "limitations",
    trigger: "Being asked about study weaknesses",
    frequency: 0,
    copingStrategy: "Reframe limitations as opportunities for future research"
  },
  {
    id: "a4",
    category: "contribution",
    trigger: "Questions about significance or contribution",
    frequency: 0,
    copingStrategy: "Connect your work to practical applications and theoretical advancement"
  },
  {
    id: "a5",
    category: "implications",
    trigger: "Applying findings to real-world contexts",
    frequency: 0,
    copingStrategy: "Practice translating academic findings into practical recommendations"
  }
];

export function DefenseCommunicationTrainer() {
  // State management
  const [currentStage, setCurrentStage] = useState<DefenseStage>("proposal");
  const [selectedFramework, setSelectedFramework] = useState<FrameworkType | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<PracticeQuestion | null>(null);
  const [responses, setResponses] = useState<StudentResponse[]>([]);
  const [currentResponse, setCurrentResponse] = useState<Record<string, string>>({});
  const [confidence, setConfidence] = useState<number>(50);
  const [isRecording, setIsRecording] = useState(false);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [anxietyTriggers, setAnxietyTriggers] = useState<AnxietyTrigger[]>(ANXIETY_TRIGGERS);
  const [activeTab, setActiveTab] = useState("practice");
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");

  // Initialize with sample data
  useEffect(() => {
    // Load saved responses from localStorage or API
    const savedResponses = localStorage.getItem("defenseTrainerResponses");
    if (savedResponses) {
      setResponses(JSON.parse(savedResponses));
    }
    
    // Load performance metrics
    const savedMetrics = localStorage.getItem("defenseTrainerMetrics");
    if (savedMetrics) {
      setPerformanceMetrics(JSON.parse(savedMetrics));
    }
  }, []);

  // Save responses to localStorage
  useEffect(() => {
    localStorage.setItem("defenseTrainerResponses", JSON.stringify(responses));
  }, [responses]);

  // Save performance metrics
  useEffect(() => {
    localStorage.setItem("defenseTrainerMetrics", JSON.stringify(performanceMetrics));
  }, [performanceMetrics]);

  // Handler functions
  const handleFrameworkSelect = (frameworkId: FrameworkType) => {
    setSelectedFramework(frameworkId);
    setCurrentResponse({});
    setShowFeedback(false);
  };

  const handleQuestionSelect = (question: PracticeQuestion) => {
    setSelectedQuestion(question);
    setCurrentResponse({});
    setShowFeedback(false);
  };

  const handleResponseChange = (stepId: string, value: string) => {
    setCurrentResponse(prev => ({
      ...prev,
      [stepId]: value
    }));
  };

  const handleConfidenceChange = (value: number) => {
    setConfidence(value);
  };

  const handleSubmitResponse = () => {
    if (!selectedQuestion || !selectedFramework) return;

    const newResponse: StudentResponse = {
      id: `resp-${Date.now()}`,
      questionId: selectedQuestion.id,
      framework: selectedFramework,
      responseParts: currentResponse,
      timestamp: new Date(),
      confidence: confidence,
      feedback: feedbackText
    };

    setResponses(prev => [...prev, newResponse]);
    
    // Update performance metrics
    updatePerformanceMetrics(selectedFramework);
    
    // Show feedback
    generateFeedback();
    setShowFeedback(true);
    
    // Reset for next response
    setCurrentResponse({});
    setConfidence(50);
    setFeedbackText("");
    
    toast.success("Response submitted successfully!");
  };

  const updatePerformanceMetrics = (framework: FrameworkType) => {
    setPerformanceMetrics(prev => {
      const existing = prev.find(m => m.framework === framework);
      if (existing) {
        return prev.map(m => 
          m.framework === framework 
            ? { 
                ...m, 
                questionsAttempted: m.questionsAttempted + 1,
                averageConfidence: ((m.averageConfidence * m.questionsAttempted) + confidence) / (m.questionsAttempted + 1)
              } 
            : m
        );
      } else {
        return [
          ...prev,
          {
            framework,
            questionsAttempted: 1,
            averageConfidence: confidence,
            strengths: [],
            areasForImprovement: []
          }
        ];
      }
    });
  };

  const generateFeedback = () => {
    if (!selectedFramework || !selectedQuestion) return;
    
    const framework = FRAMEWORKS[selectedFramework];
    const completedSteps = Object.values(currentResponse).filter(val => val.trim() !== "").length;
    const totalSteps = framework.steps.length;
    
    let feedback = "";
    
    if (completedSteps === 0) {
      feedback = "Please complete at least one step of the framework before submitting.";
    } else if (completedSteps < totalSteps) {
      feedback = `Good start! You've completed ${completedSteps} out of ${totalSteps} steps. ` +
                 `Try to complete all steps for a more comprehensive answer. ` +
                 `Remember to connect your points clearly and provide specific examples.`;
    } else {
      feedback = `Excellent work! You've successfully applied the ${framework.name} framework. ` +
                 `Your response shows clear structure and logical flow. ` +
                 `Consider recording yourself practicing this answer to build confidence.`;
    }
    
    setFeedbackText(feedback);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast.info("Recording started. Speak clearly and at a moderate pace.");
    } else {
      toast.success("Recording stopped and saved.");
    }
  };

  const exportResponses = () => {
    const dataStr = JSON.stringify(responses, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "defense-training-responses.json";
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Responses exported successfully!");
  };

  const resetPractice = () => {
    setSelectedFramework(null);
    setSelectedQuestion(null);
    setCurrentResponse({});
    setConfidence(50);
    setShowFeedback(false);
    setFeedbackText("");
    toast.info("Practice session reset.");
  };

  // Render functions
  const renderFrameworkGuide = () => {
    if (!selectedFramework) return null;
    
    const framework = FRAMEWORKS[selectedFramework];
    
    return (
      <div className="space-y-4">
        <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            {framework.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">{framework.description}</p>
          <p className="text-xs mt-2 text-primary">{framework.适用场景}</p>
        </div>
        
        <div className="space-y-3">
          {framework.steps.map((step, index) => (
            <div key={step.id} className="border rounded-lg p-4 bg-background">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{step.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                  <div className="mt-2 p-3 bg-muted/50 rounded text-sm">
                    <p className="font-medium">Example:</p>
                    <p className="italic">&quot;{step.example}&quot;</p>
                  </div>
                  <div className="mt-2 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">{step.tip}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPracticeMode = () => {
    if (!selectedFramework || !selectedQuestion) {
      return (
        <div className="text-center py-12">
          <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Ready to Practice</h3>
          <p className="text-muted-foreground mb-4">
            Select a framework and a practice question to begin your defense preparation.
          </p>
          <Button onClick={() => setActiveTab("library")}>
            Browse Framework Library
          </Button>
        </div>
      );
    }

    const framework = FRAMEWORKS[selectedFramework];

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h3 className="font-semibold text-lg">{selectedQuestion.question}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{selectedQuestion.category}</Badge>
              <Badge variant="secondary">
                {selectedQuestion.difficulty.charAt(0).toUpperCase() + selectedQuestion.difficulty.slice(1)}
              </Badge>
              <Badge variant="outline">{framework.name}</Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={resetPractice}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button variant="outline" size="sm" onClick={toggleRecording}>
              {isRecording ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Record
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Target className="w-4 h-4" />
              Build Your Response
            </h4>
            
            <div className="space-y-4">
              {framework.steps.map((step) => (
                <div key={step.id} className="space-y-2">
                  <Label htmlFor={step.id} className="flex items-center gap-2">
                    <span className="font-medium">{step.title}</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{step.tip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Textarea
                    id={step.id}
                    placeholder={`Enter your ${step.title.toLowerCase()} here...`}
                    value={currentResponse[step.id] || ""}
                    onChange={(e) => handleResponseChange(step.id, e.target.value)}
                    className="min-h-[100px]"
                  />
                  {currentResponse[step.id] && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      Completed
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Confidence Level: {confidence}%
              </Label>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">Low</span>
                <Progress 
                  value={confidence} 
                  className="flex-1" 
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const percent = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                    handleConfidenceChange(Math.max(0, Math.min(100, percent)));
                  }}
                />
                <span className="text-xs text-muted-foreground">High</span>
              </div>
              <div className="flex gap-2">
                {[20, 40, 60, 80, 100].map((level) => (
                  <Button
                    key={level}
                    variant="outline"
                    size="sm"
                    onClick={() => handleConfidenceChange(level)}
                    className="text-xs"
                  >
                    {level}%
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmitResponse} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Save Response
              </Button>
              <Button variant="outline" onClick={exportResponses}>
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Framework Guide
            </h4>
            {renderFrameworkGuide()}

            {showFeedback && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <MessageCircle className="w-4 h-4" />
                  AI Feedback
                </h4>
                <p className="text-sm">{feedbackText}</p>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm">
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    Helpful
                  </Button>
                  <Button variant="outline" size="sm">
                    <ThumbsDown className="w-4 h-4 mr-1" />
                    Needs Work
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderFrameworkLibrary = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(FRAMEWORKS).map((framework) => (
            <Card 
              key={framework.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedFramework === framework.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => handleFrameworkSelect(framework.id)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  {framework.name}
                </CardTitle>
                <CardDescription>{framework.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">{framework.适用场景}</p>
                  <div className="flex flex-wrap gap-1">
                    {PRACTICE_QUESTIONS.title
                      .concat(PRACTICE_QUESTIONS.proposal)
                      .concat(PRACTICE_QUESTIONS.defense)
                      .filter(q => q.frameworkSuggestions.includes(framework.id))
                      .slice(0, 3)
                      .map((q, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {q.category}
                        </Badge>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedFramework && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Framework Details</h3>
            {renderFrameworkGuide()}
          </div>
        )}
      </div>
    );
  };

  const renderQuestionBank = () => {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={currentStage === "title" ? "default" : "outline"}
            onClick={() => setCurrentStage("title")}
          >
            Title Defense
          </Button>
          <Button
            variant={currentStage === "proposal" ? "default" : "outline"}
            onClick={() => setCurrentStage("proposal")}
          >
            Proposal Defense
          </Button>
          <Button
            variant={currentStage === "defense" ? "default" : "outline"}
            onClick={() => setCurrentStage("defense")}
          >
            Final Defense
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRACTICE_QUESTIONS[currentStage].map((question) => (
            <Card 
              key={question.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedQuestion?.id === question.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => handleQuestionSelect(question)}
            >
              <CardHeader>
                <CardTitle className="text-base">{question.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{question.category}</Badge>
                  <Badge variant={
                    question.difficulty === "easy" ? "default" : 
                    question.difficulty === "medium" ? "secondary" : "destructive"
                  }>
                    {question.difficulty}
                  </Badge>
                  {question.frameworkSuggestions.map((fw, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {fw}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderPerformanceDashboard = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{responses.length}</div>
              <p className="text-xs text-muted-foreground">Practice attempts</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Frameworks Used</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {performanceMetrics.length}
              </div>
              <p className="text-xs text-muted-foreground">Different approaches</p>
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
              <p className="text-xs text-muted-foreground">Self-assessment</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Framework Mastery</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceMetrics.map((metric) => {
                  const framework = FRAMEWORKS[metric.framework];
                  return (
                    <div key={metric.framework} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{framework.name}</span>
                        <span>{metric.questionsAttempted} attempts</span>
                      </div>
                      <Progress value={metric.averageConfidence} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Avg. Confidence: {Math.round(metric.averageConfidence)}%</span>
                  <p className="text-xs text-muted-foreground">
                    Mastery: {metric.averageConfidence > 80 ? "Expert" : 
                                   metric.averageConfidence > 60 ? "Proficient" : "Developing"}
                  </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Anxiety Triggers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {anxietyTriggers
                  .sort((a, b) => b.frequency - a.frequency)
                  .slice(0, 5)
                  .map((trigger) => (
                    <div key={trigger.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{trigger.trigger}</p>
                        <p className="text-xs text-muted-foreground">
                          {trigger.category} • Used {trigger.frequency} times
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => {
                          setAnxietyTriggers(prev => 
                            prev.map(t => 
                              t.id === trigger.id 
                                ? {...t, frequency: t.frequency + 1} 
                                : t
                            )
                          );
                        }}>
                          <Flag className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Practice Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {responses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4" />
                <p>No practice sessions yet. Start practicing to see your progress!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {[...responses].reverse().slice(0, 5).map((response) => {
                  const question = PRACTICE_QUESTIONS.title
                    .concat(PRACTICE_QUESTIONS.proposal)
                    .concat(PRACTICE_QUESTIONS.defense)
                    .find(q => q.id === response.questionId);
                  const framework = FRAMEWORKS[response.framework];
                  
                  return (
                    <div key={response.id} className="border rounded-lg p-4">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">{question?.question || "Unknown question"}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{framework.name}</Badge>
                            <Badge variant="secondary">
                              {response.confidence}% confidence
                            </Badge>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {response.timestamp.toLocaleDateString()}
                        </div>
                      </div>
                      <div className="mt-2 text-sm">
                        {Object.entries(response.responseParts)
                          .map(([key, value]) => value)
                          .join(" ")}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
    };

    const renderCheatSheets = () => {
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Framework Quick Reference</CardTitle>
              <CardDescription>Downloadable cheat sheets for your defense day</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.values(FRAMEWORKS).map((framework) => (
                <div key={framework.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{framework.name}</h3>
                      <p className="text-sm text-muted-foreground">{framework.description}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download PDF
                    </Button>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                    {framework.steps.map((step, index) => (
                      <div key={step.id} className="p-2 bg-muted rounded text-center">
                        <div className="font-medium">{index + 1}. {step.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {step.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Common Question Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {category: "rationale", title: "Research Rationale", color: "blue"},
                  {category: "methodology", title: "Methodology Choices", color: "green"},
                  {category: "significance", title: "Study Significance", color: "purple"},
                  {category: "feasibility", title: "Feasibility & Resources", color: "orange"},
                  {category: "results", title: "Findings & Results", color: "red"},
                  {category: "limitations", title: "Study Limitations", color: "gray"},
                  {category: "implications", title: "Implications & Applications", color: "yellow"},
                  {category: "contribution", title: "Contributions & Future Work", color: "indigo"}
                ].map((item) => (
                  <div key={item.category} className="border rounded-lg p-3">
                    <h4 className="font-medium">{item.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Sample questions and recommended frameworks
                    </p>
                    <Button variant="link" size="sm" className="p-0 mt-2 h-auto">
                      View Examples
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    };

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-primary" />
              Defense Q&A Framework Trainer
            </CardTitle>
            <CardDescription>
              Master your research defense with structured communication frameworks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="practice">Practice Mode</TabsTrigger>
                <TabsTrigger value="library">Framework Library</TabsTrigger>
                <TabsTrigger value="questions">Question Bank</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
              </TabsList>
              
              <TabsContent value="practice" className="mt-6">
                {renderPracticeMode()}
              </TabsContent>
              
              <TabsContent value="library" className="mt-6">
                {renderFrameworkLibrary()}
              </TabsContent>
              
              <TabsContent value="questions" className="mt-6">
                {renderQuestionBank()}
              </TabsContent>
              
              <TabsContent value="performance" className="mt-6">
                {renderPerformanceDashboard()}
              </TabsContent>
              
              <TabsContent value="resources" className="mt-6">
                {renderCheatSheets()}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="w-4 h-4" />
                Today's Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm">Practice 3 responses</span>
                <span className="text-sm font-medium">1/3</span>
              </div>
              <Progress value={33} className="mt-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Award className="w-4 h-4" />
                Weekly Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm">Current streak</span>
                <span className="text-sm font-medium">5 days</span>
              </div>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                  <div 
                    key={day} 
                    className={`w-3 h-3 rounded-full ${
                      day <= 5 ? "bg-green-500" : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Star className="w-4 h-4" />
                Achievement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span className="text-sm">Framework Explorer</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Used 3 different frameworks
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  export { DefenseCommunicationTrainer };