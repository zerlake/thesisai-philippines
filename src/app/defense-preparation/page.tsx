// Defense Preparation Dashboard Page
// Simple integration of all four Defense Framework Trainers

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
  Play, 
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
  Square,
  Mic,
  Pause,
  CheckCircle,
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
import FinalDefenseQAFrameTrainer from "@/components/final-defense-qa-frame-trainer";
import { Skeleton } from "@/components/ui/skeleton";

export default function DefensePreparationPage() {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [isGeneralTrainerOpen, setIsGeneralTrainerOpen] = useState(false);
  const [isTitleTrainerOpen, setIsTitleTrainerOpen] = useState(false);
  const [isProposalTrainerOpen, setIsProposalTrainerOpen] = useState(false);
  const [isDefenseTrainerOpen, setIsDefenseTrainerOpen] = useState(false);

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
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setIsGeneralTrainerOpen(true)}>
              <Brain className="w-4 h-4 mr-2" />
              General Q&A Practice
            </Button>
            <Button variant="outline" onClick={() => setIsTitleTrainerOpen(true)}>
              <Target className="w-4 h-4 mr-2" />
              Title Defense Practice
            </Button>
            <Button variant="outline" onClick={() => setIsProposalTrainerOpen(true)}>
              <FilePlus2 className="w-4 h-4 mr-2" />
              Proposal Q&A Practice
            </Button>
            <Button variant="outline" onClick={() => setIsDefenseTrainerOpen(true)}>
              <ShieldCheck className="w-4 h-4 mr-2" />
              Final Defense Practice
            </Button>
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
                        <Trophy className="w-4 h-4" />
                        Sessions Completed
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">12</div>
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
                      <div className="text-2xl font-bold">68%</div>
                      <Progress value={68} className="mt-2" />
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
                      <div className="text-2xl font-bold">3/4</div>
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
                      <div className="text-2xl font-bold">5 days</div>
                      <p className="text-xs text-muted-foreground">Keep it up!</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Stage Progress</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">General Q&A</span>
                          <span>75%</span>
                        </div>
                        <Progress value={75} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>15 questions answered</span>
                          <span>Avg. confidence: 65%</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">Title Defense</span>
                          <span>45%</span>
                        </div>
                        <Progress value={45} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>8 questions answered</span>
                          <span>Avg. confidence: 55%</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">Proposal Q&A</span>
                          <span>60%</span>
                        </div>
                        <Progress value={60} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>12 questions answered</span>
                          <span>Avg. confidence: 70%</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">Final Defense</span>
                          <span>30%</span>
                        </div>
                        <Progress value={30} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>6 questions answered</span>
                          <span>Avg. confidence: 60%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-primary/5 rounded-lg border">
                      <h4 className="font-medium mb-1">Next Milestone</h4>
                      <p className="text-sm">Complete 5 more sessions to unlock Advanced Mode</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3">Achievements</h3>
                    <div className="space-y-4">
                      {[
                        "Framework Explorer",
                        "Consistent Practitioner",
                        "Confidence Builder"
                      ].map((achievement, index) => (
                        <div key={index} className="flex items-center gap-3">
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
                      <Card 
                        className="cursor-pointer transition-all hover:shadow-md hover:border-primary"
                        onClick={() => setIsGeneralTrainerOpen(true)}
                      >
                        <CardContent className="p-4 text-center">
                          <Brain className="w-8 h-8 mx-auto text-primary mb-2" />
                          <h4 className="font-semibold text-sm">General Q&A</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Broad practice for all thesis topics
                          </p>
                          <Badge variant="secondary" className="mt-2">
                            75% Complete
                          </Badge>
                        </CardContent>
                      </Card>
                      
                      <Card 
                        className="cursor-pointer transition-all hover:shadow-md hover:border-primary"
                        onClick={() => setIsTitleTrainerOpen(true)}
                      >
                        <CardContent className="p-4 text-center">
                          <Target className="w-8 h-8 mx-auto text-primary mb-2" />
                          <h4 className="font-semibold text-sm">Title Defense</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Specialized for research title justification
                          </p>
                          <Badge variant="outline" className="mt-2">
                            45% Complete
                          </Badge>
                        </CardContent>
                      </Card>
                      
                      <Card 
                        className="cursor-pointer transition-all hover:shadow-md hover:border-primary"
                        onClick={() => setIsProposalTrainerOpen(true)}
                      >
                        <CardContent className="p-4 text-center">
                          <FilePlus2 className="w-8 h-8 mx-auto text-primary mb-2" />
                          <h4 className="font-semibold text-sm">Proposal Q&A</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Targeted for proposal defense
                          </p>
                          <Badge variant="outline" className="mt-2">
                            60% Complete
                          </Badge>
                        </CardContent>
                      </Card>
                      
                      <Card 
                        className="cursor-pointer transition-all hover:shadow-md hover:border-primary"
                        onClick={() => setIsDefenseTrainerOpen(true)}
                      >
                        <CardContent className="p-4 text-center">
                          <ShieldCheck className="w-8 h-8 mx-auto text-primary mb-2" />
                          <h4 className="font-semibold text-sm">Final Defense</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Advanced final oral defense training
                          </p>
                          <Badge variant="outline" className="mt-2">
                            30% Complete
                          </Badge>
                        </CardContent>
                      </Card>
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
                <Button onClick={() => setIsGeneralTrainerOpen(true)}>
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
                        <p className="text-xs text-muted-foreground mt-1">
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
                        <p className="text-xs text-muted-foreground mt-1">
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
                        <p className="text-xs text-muted-foreground mt-1">
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
                <Button onClick={() => setIsTitleTrainerOpen(true)}>
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
                <Button onClick={() => setIsProposalTrainerOpen(true)}>
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
                      { category: "Literature", desc: "Theoretical foundation" },
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
                    Advanced practice for final oral research defense with comprehensive frameworks
                  </CardDescription>
                </div>
                <Button onClick={() => setIsDefenseTrainerOpen(true)}>
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
          <FinalDefenseQAFrameTrainer />
        </DialogContent>
      </Dialog>
    </div>
  );
}