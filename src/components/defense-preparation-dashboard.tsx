// Defense Preparation Dashboard
// Integrates all four Defense Framework Trainers into a unified dashboard

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
import { 
  BookOpen, 
  CheckCircle,
  Mic,
  Pause,
  Play, 
  Square,
  Target, 
  Trophy, 
  Brain, 
  Calendar, 
  User, 
  Award, 
  Flag, 
  MessageCircle, 
  ThumbsUp, 
  ThumbsDown,
  HelpCircle,
  Crown,
  ShieldCheck,
  Lightbulb,
  TrendingUp,
  BarChart3,
  FilePlus2,
  Download,
  RotateCw,
  Zap,
  Clock,
  Eye,
  EyeOff,
  GitBranch,
  Sparkles,
  Users
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { GeneralQAFrameTrainer } from "@/components/general-qa-frame-trainer";
import { TitleDefenseFrameTrainer } from "@/components/title-defense-frame-trainer";
import { ProposalQAFrameTrainer } from "@/components/proposal-qa-frame-trainer";
import { DefenseQAFrameTrainer } from "@/components/defense-qa-frame-trainer";

interface DefensePrepStats {
  totalSessions: number;
  avgConfidence: number;
  frameworksMastered: number;
  practiceQuestions: number;
  streakDays: number;
  nextMilestone: string;
  achievements: string[];
}

export function DefensePreparationDashboard() {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const router = useRouter();
  
  const [stats, setStats] = useState<DefensePrepStats>({
    totalSessions: 12,
    avgConfidence: 68,
    frameworksMastered: 3,
    practiceQuestions: 24,
    streakDays: 5,
    nextMilestone: "Complete 5 more sessions to unlock Advanced Mode",
    achievements: [
      "Framework Explorer",
      "Consistent Practitioner",
      "Confidence Builder"
    ]
  });
  
  const [activeTab, setActiveTab] = useState("overview");
  const [isGeneralTrainerOpen, setIsGeneralTrainerOpen] = useState(false);
  const [isTitleTrainerOpen, setIsTitleTrainerOpen] = useState(false);
  const [isProposalTrainerOpen, setIsProposalTrainerOpen] = useState(false);
  const [isDefenseTrainerOpen, setIsDefenseTrainerOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

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

  const handleStartGeneralPractice = () => {
    setIsGeneralTrainerOpen(true);
    toast.info("Opening General Q&A Framework Trainer...");
  };

  const handleStartTitlePractice = () => {
    setIsTitleTrainerOpen(true);
    toast.info("Opening Title Defense Framework Trainer...");
  };

  const handleStartProposalPractice = () => {
    setIsProposalTrainerOpen(true);
    toast.info("Opening Proposal Q&A Framework Trainer...");
  };

  const handleStartDefensePractice = () => {
    setIsDefenseTrainerOpen(true);
    toast.info("Opening Final Defense Q&A Framework Trainer...");
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
      stats,
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
    a.download = 'defense-preparation-summary.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Defense preparation summary exported successfully!");
  };

  const resetPractice = () => {
    setStats({
      totalSessions: 0,
      avgConfidence: 50,
      frameworksMastered: 0,
      practiceQuestions: 0,
      streakDays: 0,
      nextMilestone: "Start your first practice session",
      achievements: []
    });
    toast.info("Defense preparation reset");
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
            <Crown className="w-5 h-5" />
            Defense Preparation Suite
          </CardTitle>
          <CardDescription>
            Master your research defense with structured communication frameworks at every stage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleStartGeneralPractice}>
              <Brain className="w-4 h-4 mr-2" />
              General Q&A Practice
            </Button>
            <Button onClick={handleStartTitlePractice} variant="outline">
              <Target className="w-4 h-4 mr-2" />
              Title Defense Practice
            </Button>
            <Button onClick={handleStartProposalPractice} variant="outline">
              <FilePlus2 className="w-4 h-4 mr-2" />
              Proposal Q&A Practice
            </Button>
            <Button onClick={handleStartDefensePractice} variant="outline">
              <ShieldCheck className="w-4 h-4 mr-2" />
              Final Defense Practice
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
            <Button variant="outline" onClick={exportResponses}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>Timer: {formatTime(timerSeconds)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span>Practice Sessions: {stats.totalSessions}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span>Avg Confidence: {stats.avgConfidence}%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="general">General Q&A</TabsTrigger>
          <TabsTrigger value="title">Title Defense</TabsTrigger>
          <TabsTrigger value="proposal">Proposal Q&A</TabsTrigger>
          <TabsTrigger value="defense">Final Defense</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Defense Preparation Progress
              </CardTitle>
              <CardDescription>
                Your progression through all four defense preparation stages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        Sessions Completed
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalSessions}</div>
                      <p className="text-xs text-muted-foreground">+2 from last week</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Avg Confidence
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.avgConfidence}%</div>
                      <Progress value={stats.avgConfidence} className="mt-2" />
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Frameworks Mastered
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.frameworksMastered}/5</div>
                      <p className="text-xs text-muted-foreground">PREP, PEEL, STAR</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Current Streak
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.streakDays} days</div>
                      <p className="text-xs text-muted-foreground">Keep it up!</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Stage Progress</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">General Q&A Practice</span>
                          <span>75%</span>
                        </div>
                        <Progress value={75} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">Title Defense Practice</span>
                          <span>45%</span>
                        </div>
                        <Progress value={45} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">Proposal Q&A Practice</span>
                          <span>60%</span>
                        </div>
                        <Progress value={60} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">Final Defense Practice</span>
                          <span>30%</span>
                        </div>
                        <Progress value={30} className="h-2" />
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-primary/5 rounded-lg border">
                      <h4 className="font-medium mb-1">Next Milestone</h4>
                      <p className="text-sm">{stats.nextMilestone}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">Achievements</h3>
                    <div className="space-y-3">
                      {stats.achievements.map((achievement, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{achievement}</p>
                            <p className="text-xs text-muted-foreground">Unlocked this week</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="w-5 h-5" />
                      Defense Preparation Roadmap
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="border rounded-lg p-4 text-center">
                        <Brain className="w-8 h-8 mx-auto text-primary mb-2" />
                        <h4 className="font-semibold text-sm">General Q&A</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Broad practice for all thesis topics using PREP framework
                        </p>
                        <Badge variant="default" className="mt-2">
                          In Progress
                        </Badge>
                      </div>
                      
                      <div className="border rounded-lg p-4 text-center">
                        <Target className="w-8 h-8 mx-auto text-primary mb-2" />
                        <h4 className="font-semibold text-sm">Title Defense</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Specialized practice for defending research titles with CLEAR framework
                        </p>
                        <Badge variant="outline" className="mt-2">
                          Not Started
                        </Badge>
                      </div>
                      
                      <div className="border rounded-lg p-4 text-center">
                        <FilePlus2 className="w-8 h-8 mx-auto text-primary mb-2" />
                        <h4 className="font-semibold text-sm">Proposal Q&A</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Targeted practice for proposal defense using PREP/PEEL frameworks
                        </p>
                        <Badge variant="outline" className="mt-2">
                          Not Started
                        </Badge>
                      </div>
                      
                      <div className="border rounded-lg p-4 text-center">
                        <ShieldCheck className="w-8 h-8 mx-auto text-primary mb-2" />
                        <h4 className="font-semibold text-sm">Final Defense</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Advanced practice for final oral defense with comprehensive frameworks
                        </p>
                        <Badge variant="outline" className="mt-2">
                          Not Started
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="general" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    General Q&A Framework Trainer
                  </CardTitle>
                  <CardDescription>
                    Broad practice for all thesis-related questions with framework guidance
                  </CardDescription>
                </div>
                <Button onClick={handleStartGeneralPractice}>
                  <Play className="w-4 h-4 mr-2" />
                  Open Trainer
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Purpose</h4>
                    <p className="text-sm text-muted-foreground">
                      The General Q&A Framework Trainer provides broad practice for all thesis-related questions 
                      with structured framework guidance. Perfect for initial orientation and warm-up drills.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Key Features</h4>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>PREP framework for persuasive answers</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>PEEL framework for evidence-based responses</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>STAR framework for describing processes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>ADD framework for factual questions</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3">When to Use</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="w-4 h-4 text-primary" />
                          <h5 className="font-medium">Early Preparation</h5>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          For initial orientation and warm-up drills before specific defense stages
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-4 h-4 text-primary" />
                          <h5 className="font-medium">Scholarship Interviews</h5>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          For general academic interviews and scholarship applications
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MessageCircle className="w-4 h-4 text-primary" />
                          <h5 className="font-medium">Practice Conversations</h5>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          For practicing spontaneous academic conversations with peers or advisors
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="title" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Title Defense Framework Trainer
                  </CardTitle>
                  <CardDescription>
                    Specialized tool for defending research titles with CLEAR framework
                  </CardDescription>
                </div>
                <Button onClick={handleStartTitlePractice}>
                  <Play className="w-4 h-4 mr-2" />
                  Open Trainer
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Purpose</h4>
                    <p className="text-sm text-muted-foreground">
                      The Title Defense Framework Trainer specializes in helping students justify 
                      their research titles with the CLEAR framework (Clarify, Link, Express, Articulate, Reflect).
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Key Features</h4>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>CLEAR framework for title justification</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Title analysis and scoring system</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Common title defense questions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Thematic categorization of titles</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3">CLEAR Framework</h4>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    {[
                      { letter: "C", word: "Clarify", desc: "Clarify main concepts and relationships" },
                      { letter: "L", word: "Link", desc: "Link to significant problems or research gaps" },
                      { letter: "E", word: "Express", desc: "Express scope, population, method, setting" },
                      { letter: "A", word: "Articulate", desc: "Articulate uniqueness and relevance" },
                      { letter: "R", word: "Reflect", desc: "Reflect academic field requirements" }
                    ].map((step, index) => (
                      <Card key={index} className="text-center">
                        <CardContent className="p-3">
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center mx-auto mb-2">
                            {step.letter}
                          </div>
                          <h5 className="font-semibold text-sm">{step.word}</h5>
                          <p className="text-xs text-muted-foreground mt-1">{step.desc}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                
                <div className="pt-2">
                  <h4 className="font-semibold mb-3">When to Use</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="w-4 h-4 text-primary" />
                          <h5 className="font-medium">Before Proposal Defense</h5>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Ensure your title is well-justified before presenting it to your committee
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <RotateCw className="w-4 h-4 text-primary" />
                          <h5 className="font-medium">Title Refinement</h5>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Practice refining and justifying iterative title changes
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="proposal" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FilePlus2 className="w-5 h-5" />
                    Proposal Q&A Framework Trainer
                  </CardTitle>
                  <CardDescription>
                    Targeted practice for proposal defense using PREP/PEEL frameworks
                  </CardDescription>
                </div>
                <Button onClick={handleStartProposalPractice}>
                  <Play className="w-4 h-4 mr-2" />
                  Open Trainer
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Purpose</h4>
                    <p className="text-sm text-muted-foreground">
                      The Proposal Q&A Framework Trainer prepares students for their research proposal 
                      defense by generating and practicing common questions about rationale, methodology, 
                      and significance using structured communication frameworks.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Key Features</h4>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>PREP framework for justifying research choices</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>PEEL framework for evidence-based methodology defense</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Proposal-specific question generation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Methodology alignment checking</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3">Proposal Defense Categories</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {[
                      { category: "Rationale", desc: "Why this study matters" },
                      { category: "Methodology", desc: "How you'll conduct research" },
                      { category: "Significance", desc: "Impact of your research" },
                      { category: "Feasibility", desc: "Can you complete this?" },
                      { category: "Literature", desc: "Your theoretical foundation" },
                      { category: "Ethical", desc: "Research ethics considerations" },
                      { category: "Limitations", desc: "Anticipated constraints" },
                      { category: "Timeline", desc: "Project scheduling" }
                    ].map((item, index) => (
                      <Card key={index} className="text-center">
                        <CardContent className="p-3">
                          <h5 className="font-semibold text-sm">{item.category}</h5>
                          <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                
                <div className="pt-2">
                  <h4 className="font-semibold mb-3">When to Use</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <FilePlus2 className="w-4 h-4 text-primary" />
                          <h5 className="font-medium">Before Proposal Defense</h5>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Prepare for the specific questions your committee will ask about your proposal
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-primary" />
                          <h5 className="font-medium">Methodology Refinement</h5>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Strengthen your methodology justification with structured practice
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="defense" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5" />
                    Final Defense Q&A Framework Trainer
                  </CardTitle>
                  <CardDescription>
                    Advanced practice for final oral defense with comprehensive frameworks
                  </CardDescription>
                </div>
                <Button onClick={handleStartDefensePractice}>
                  <Play className="w-4 h-4 mr-2" />
                  Open Trainer
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Purpose</h4>
                    <p className="text-sm text-muted-foreground">
                      The Final Defense Q&A Framework Trainer prepares students for their ultimate 
                      research defense by practicing high-pressure questions about results, interpretation, 
                      and contributions using advanced communication frameworks.
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Key Features</h4>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>PEEL framework for interpreting results</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>STAR framework for describing challenges</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>ADD framework for factual questions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>High-pressure simulation training</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3">Final Defense Categories</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {[
                      { category: "Results", desc: "Your findings and data" },
                      { category: "Interpretation", desc: "What your data means" },
                      { category: "Limitations", desc: "Study constraints" },
                      { category: "Implications", desc: "Broader significance" },
                      { category: "Contributions", desc: "What you added" },
                      { category: "Methodology", desc: "Research design" },
                      { category: "Validity", desc: "Reliability concerns" },
                      { category: "Future", desc: "Next steps" }
                    ].map((item, index) => (
                      <Card key={index} className="text-center">
                        <CardContent className="p-3">
                          <h5 className="font-semibold text-sm">{item.category}</h5>
                          <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                
                <div className="pt-2">
                  <h4 className="font-semibold mb-3">When to Use</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <ShieldCheck className="w-4 h-4 text-primary" />
                          <h5 className="font-medium">Before Final Defense</h5>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Master high-pressure questions about your complete research findings
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-4 h-4 text-primary" />
                          <h5 className="font-medium">Stress Management</h5>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Practice defending under time pressure and cognitive anxiety
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
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
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Defense Preparation Tips
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
                  <span>Take a deep breath and organize your thoughts</span>
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
    </div>
  );
}