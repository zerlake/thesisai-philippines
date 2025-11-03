"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Progress } from "./ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import {
  thesisChecklist,
  type ChecklistItem,
  type ChecklistPhase,
} from "../lib/checklist-items";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { useAuth } from "./auth-provider";
import { toast } from "sonner";
import { Skeleton } from "./ui/skeleton";
import Confetti from "react-confetti";
import { useWindowSize } from "../hooks/use-window-size";
import Link from "next/link";
import { Button } from "./ui/button";
import { 
  ArrowRight, 
  BookOpen, 
  FileText, 
  Target, 
  TrendingUp, 
  Calendar,
  Users,
  BrainCircuit,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  BarChart3,
  Clock,
  Zap,
  Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";

const allItems = thesisChecklist.flatMap(
  (phase: ChecklistPhase) => phase.items,
);
const totalItems = allItems.length;

type ChapterStructure = {
  id: string;
  title: string;
  description: string;
  items: ChecklistItem[];
  estimatedTime: string;
  dependencies: string[];
  tools: string[];
};

type ResearchGap = {
  id: string;
  title: string;
  description: string;
  relevance: number; // 0-100
  difficulty: "low" | "medium" | "high";
  potentialImpact: "low" | "high";
  supportingEvidence: string[];
  researchQuestions: string[];
  methodologySuggestions: string[];
};

type GapAnalysis = {
  overallScore: number;
  identifiedGaps: ResearchGap[];
  thematicClusters: { theme: string; gapCount: number; papers: any[] }[];
  timelineAnalysis: { year: number; gapCount: number; papers: any[] }[];
  citationPattern: { highlyCited: any[]; underCited: any[] };
};

export function EnhancedThesisChecklist() {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const [checkedItems, setCheckedItems] = useState<string[]>([]);
  const [openPhases, setOpenPhases] = useState<string[]>(["phase-1"]);
  const [isLoading, setIsLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const { width, height } = useWindowSize();
  const [activeTab, setActiveTab] = useState("checklist");
  const [chapterStructures, setChapterStructures] = useState<ChapterStructure[]>([]);
  const [gapAnalysis, setGapAnalysis] = useState<GapAnalysis | null>(null);
  const [isGeneratingStructure, setIsGeneratingStructure] = useState(false);
  const [isAnalyzingGaps, setIsAnalyzingGaps] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [chapterProgress, setChapterProgress] = useState<Record<string, number>>({});
  const [deadline, setDeadline] = useState<string>("");
  const [isSettingDeadline, setIsSettingDeadline] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchCheckedItems = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("checklist_progress")
          .select("item_id")
          .eq("user_id", user.id);

        if (error) {
          // Check if it's a table doesn't exist error
          if (error.code === '42P01') { // Undefined table error
            console.warn("checklist_progress table does not exist, initializing with empty list");
            setCheckedItems([]);
          } else {
            toast.error("Failed to load checklist progress.");
            console.error("Error loading checklist progress:", error);
          }
        } else {
          setCheckedItems(data.map((item: { item_id: string }) => item.item_id));
        }
      } catch (err) {
        console.error("Unexpected error in fetchCheckedItems:", err);
        setCheckedItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCheckedItems();
  }, [user, supabase]);

  const handleCheckedChange = async (itemId: string, isChecked: boolean) => {
    if (!user) return;

    const originalState = [...checkedItems];
    const newState = isChecked
      ? [...checkedItems, itemId]
      : checkedItems.filter((id) => id !== itemId);
    setCheckedItems(newState);

    if (newState.length === totalItems && originalState.length !== totalItems) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 8000); // Let the confetti run for 8 seconds
    }

    if (isChecked) {
      const { error } = await supabase
        .from("checklist_progress")
        .insert({ user_id: user.id, item_id: itemId });

      if (error) {
        toast.error("Failed to save progress.");
        setCheckedItems(originalState); // Revert on error
      }
    } else {
      const { error } = await supabase
        .from("checklist_progress")
        .delete()
        .eq("user_id", user.id)
        .eq("item_id", itemId);

      if (error) {
        toast.error("Failed to save progress.");
        setCheckedItems(originalState); // Revert on error
      }
    }
    
    // Update chapter progress when items are checked
    updateChapterProgress();
  };

  const updateChapterProgress = () => {
    // Calculate progress for each chapter based on completed items
    const chapterProgressMap: Record<string, number> = {};
    
    thesisChecklist.forEach(phase => {
      const phaseItems = phase.items;
      const completedItems = phaseItems.filter(item => 
        checkedItems.includes(item.id)
      ).length;
      
      chapterProgressMap[phase.id] = Math.round(
        (completedItems / phaseItems.length) * 100
      );
    });
    
    setChapterProgress(chapterProgressMap);
  };

  const progressPercentage = (checkedItems.length / totalItems) * 100;

  const handleGenerateChapterStructure = async () => {
    if (!session) {
      toast.error("You must be logged in to generate chapter structures.");
      return;
    }
    
    setIsGeneratingStructure(true);
    setChapterStructures([]);
    
    try {
      // In a real implementation, this would call an API to generate chapter structures
      // For now, we'll simulate the process with mock data
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock chapter structures based on checklist phases
      const mockStructures: ChapterStructure[] = thesisChecklist.map((phase, index) => ({
        id: phase.id,
        title: phase.title,
        description: `Structured approach to completing ${phase.title.toLowerCase()}`,
        items: phase.items,
        estimatedTime: `${Math.max(1, Math.floor(phase.items.length / 2))}-${Math.max(2, Math.floor(phase.items.length))} weeks`,
        dependencies: index > 0 ? [thesisChecklist[index - 1].id] : [],
        tools: phase.items
          .filter(item => item.toolName)
          .map(item => item.toolName!)
          .filter((value, index, self) => self.indexOf(value) === index) // Remove duplicates
      }));
      
      setChapterStructures(mockStructures);
      toast.success("Chapter structures generated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate chapter structures.");
    } finally {
      setIsGeneratingStructure(false);
    }
  };

  const handleGapAnalysis = async () => {
    if (!session) {
      toast.error("You must be logged in to perform gap analysis.");
      return;
    }
    
    setIsAnalyzingGaps(true);
    setGapAnalysis(null);
    
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
          {
            theme: "AI Effectiveness",
            gapCount: 2,
            papers: []
          }
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
      toast.error(error.message || "Failed to analyze research gaps.");
    } finally {
      setIsAnalyzingGaps(false);
    }
  };

  const handleSetDeadline = async () => {
    if (!user || !deadline) {
      toast.error("Please select a deadline date.");
      return;
    }
    
    setIsSettingDeadline(true);
    
    try {
      const { error } = await supabase
        .from("user_preferences")
        .upsert({
          user_id: user.id,
          thesis_deadline: deadline,
        }, {
          onConflict: "user_id"
        });

      if (error) throw new Error("Failed to set deadline.");

      toast.success("Thesis deadline set successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to set deadline.");
    } finally {
      setIsSettingDeadline(false);
    }
  };

  const getChapterIcon = (chapterId: string) => {
    switch (chapterId) {
      case "phase-1": return <Target className="w-5 h-5" />;
      case "phase-2": return <BookOpen className="w-5 h-5" />;
      case "phase-3": return <BrainCircuit className="w-5 h-5" />;
      case "phase-4": return <BarChart3 className="w-5 h-5" />;
      case "phase-5": return <TrendingUp className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "low": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "high": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "low": return "bg-blue-100 text-blue-800";
      case "high": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Enhanced Thesis/Dissertation Checklist</CardTitle>
          <CardDescription>
            A step-by-step guide from topic to submission with automated chapter organization and gap analysis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2 relative overflow-hidden">
      {showConfetti && (
        <Confetti 
          width={width} 
          height={height} 
          recycle={false} 
          opacity={0.6}
          pointerEvents="none"
        />
      )}
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="w-5 h-5" />
          Enhanced Thesis/Dissertation Checklist
        </CardTitle>
        <CardDescription>
          A step-by-step guide from topic to submission with automated chapter organization and gap analysis.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="checklist" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Checklist</span>
            </TabsTrigger>
            <TabsTrigger value="structure" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Structure</span>
            </TabsTrigger>
            <TabsTrigger value="gaps" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Gaps</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Timeline</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="checklist" className="mt-6">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex-1 min-w-[200px]">
                  <Progress value={progressPercentage} className="mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {checkedItems.length} of {totalItems} tasks completed (
                    {Math.round(progressPercentage)}%)
                  </p>
                </div>
                <Button 
                  onClick={handleGenerateChapterStructure} 
                  disabled={isGeneratingStructure}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {isGeneratingStructure ? (
                    <Zap className="w-4 h-4 animate-spin" />
                  ) : (
                    <Layers className="w-4 h-4" />
                  )}
                  {isGeneratingStructure ? "Generating..." : "Organize Chapters"}
                </Button>
              </div>
              
              <Accordion
                type="multiple"
                value={openPhases}
                onValueChange={setOpenPhases}
                className="w-full"
              >
                {thesisChecklist.map((phase: ChecklistPhase) => (
                  <AccordionItem value={phase.id} key={phase.id}>
                    <AccordionTrigger>
                      <div className="flex items-center gap-3">
                        {getChapterIcon(phase.id)}
                        <span className="font-semibold">{phase.title}</span>
                        <Badge variant="secondary">
                          {chapterProgress[phase.id] || 0}% Complete
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pl-4 border-l-2 ml-2">
                        <AnimatePresence>
                          {phase.items.map((item: ChecklistItem) => {
                            const isChecked = checkedItems.includes(item.id);

                            const handleDragEnd = (event: any, info: any) => {
                              if (info.offset.x > 50 && !isChecked) {
                                handleCheckedChange(item.id, true);
                              } else if (info.offset.x < -50 && isChecked) {
                                handleCheckedChange(item.id, false);
                              }
                            };

                            return (
                              <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, y: -10 }}
                                animate={{
                                  opacity: 1,
                                  y: 0,
                                  transition: {
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 25,
                                  },
                                }}
                                exit={{ opacity: 0, scale: 0.8, x: 50 }}
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={{ left: 0.2, right: 0.2 }}
                                onDragEnd={handleDragEnd}
                                className="flex items-start space-x-3 cursor-grab active:cursor-grabbing"
                              >
                                <Checkbox
                                  id={item.id}
                                  checked={isChecked}
                                  onCheckedChange={(isChecked) =>
                                    handleCheckedChange(item.id, !!isChecked)
                                  }
                                  className="mt-1"
                                />
                                <div className="grid gap-1.5 leading-none">
                                  <Label
                                    htmlFor={item.id}
                                    className={`font-medium ${
                                      isChecked
                                        ? "line-through text-muted-foreground"
                                        : ""
                                    }`}
                                  >
                                    {item.title}
                                  </Label>
                                  <p className="text-sm text-muted-foreground">
                                    {item.description}
                                  </p>
                                  {item.href && (
                                    <Link href={item.href} className="mt-1">
                                      <Button
                                        variant="link"
                                        size="sm"
                                        className="h-auto p-0 text-primary"
                                      >
                                        Go to {item.toolName}
                                        <ArrowRight className="w-3 h-3 ml-1" />
                                      </Button>
                                    </Link>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </TabsContent>
          
          <TabsContent value="structure" className="mt-6">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Automated Chapter Organization</h3>
                  <p className="text-sm text-muted-foreground">
                    Structured approach to completing each chapter of your thesis
                  </p>
                </div>
                <Button 
                  onClick={handleGenerateChapterStructure} 
                  disabled={isGeneratingStructure}
                  className="flex items-center gap-2"
                >
                  {isGeneratingStructure ? (
                    <Zap className="w-4 h-4 animate-spin" />
                  ) : (
                    <Layers className="w-4 h-4" />
                  )}
                  {isGeneratingStructure ? "Generating Structure..." : "Generate Chapter Structure"}
                </Button>
              </div>
              
              {chapterStructures.length > 0 ? (
                <div className="space-y-4">
                  {chapterStructures.map((chapter, index) => (
                    <Card key={chapter.id} className="bg-muted/10">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2 text-lg">
                            {getChapterIcon(chapter.id)}
                            <span>Chapter {index + 1}: {chapter.title}</span>
                          </CardTitle>
                          <Badge variant="outline">{chapter.estimatedTime}</Badge>
                        </div>
                        <CardDescription>{chapter.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold mb-2">Required Tasks</h4>
                            <ul className="space-y-1 text-sm">
                              {chapter.items.slice(0, 3).map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                                  <span>{item.title}</span>
                                </li>
                              ))}
                              {chapter.items.length > 3 && (
                                <li className="text-muted-foreground">
                                  + {chapter.items.length - 3} more tasks
                                </li>
                              )}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-2">Suggested Tools</h4>
                            <div className="flex flex-wrap gap-2">
                              {chapter.tools.slice(0, 3).map((tool, idx) => (
                                <Badge key={idx} variant="secondary">
                                  {tool}
                                </Badge>
                              ))}
                              {chapter.tools.length > 3 && (
                                <Badge variant="outline">
                                  + {chapter.tools.length - 3} more
                                </Badge>
                              )}
                            </div>
                            
                            {chapter.dependencies.length > 0 && (
                              <div className="mt-3">
                                <h4 className="font-semibold mb-2">Dependencies</h4>
                                <div className="flex flex-wrap gap-2">
                                  {chapter.dependencies.map((dep, idx) => {
                                    const depPhase = thesisChecklist.find(p => p.id === dep);
                                    return (
                                      <Badge key={idx} variant="outline">
                                        Complete {depPhase?.title || dep} first
                                      </Badge>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="mt-4 flex justify-end">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedChapter(selectedChapter === chapter.id ? null : chapter.id)}
                          >
                            {selectedChapter === chapter.id ? "Hide Details" : "View All Tasks"}
                          </Button>
                        </div>
                        
                        {selectedChapter === chapter.id && (
                          <div className="mt-4 pt-4 border-t">
                            <h4 className="font-semibold mb-3">All Tasks for This Chapter</h4>
                            <ul className="space-y-2">
                              {chapter.items.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                  <Checkbox
                                    id={`${chapter.id}-${item.id}`}
                                    checked={checkedItems.includes(item.id)}
                                    onCheckedChange={(isChecked) =>
                                      handleCheckedChange(item.id, !!isChecked)
                                    }
                                    className="mt-0.5"
                                  />
                                  <Label
                                    htmlFor={`${chapter.id}-${item.id}`}
                                    className={`text-sm ${
                                      checkedItems.includes(item.id)
                                        ? "line-through text-muted-foreground"
                                        : ""
                                    }`}
                                  >
                                    {item.title}
                                  </Label>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Layers className="w-12 h-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No Chapter Structure Generated</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Click "Generate Chapter Structure" to create an organized approach to your thesis chapters.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="gaps" className="mt-6">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Research Gap Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Identify unexplored areas in your research field
                  </p>
                </div>
                <Button 
                  onClick={handleGapAnalysis} 
                  disabled={isAnalyzingGaps}
                  className="flex items-center gap-2"
                >
                  {isAnalyzingGaps ? (
                    <Zap className="w-4 h-4 animate-spin" />
                  ) : (
                    <Target className="w-4 h-4" />
                  )}
                  {isAnalyzingGaps ? "Analyzing..." : "Analyze Research Gaps"}
                </Button>
              </div>
              
              {gapAnalysis ? (
                <div className="space-y-6">
                  {/* Overall Score */}
                  <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="text-5xl font-bold mb-2 text-blue-600 dark:text-blue-300">
                          {gapAnalysis.overallScore}%
                        </div>
                        <div className="text-xl font-medium mb-2">
                          Research Opportunity Score
                        </div>
                        <div className="text-sm opacity-80">
                          Based on {gapAnalysis.identifiedGaps.length} identified opportunities
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Identified Gaps */}
                  <div>
                    <h4 className="text-md font-semibold mb-3">Identified Research Opportunities</h4>
                    <Accordion type="single" collapsible className="w-full">
                      {gapAnalysis.identifiedGaps.map((gap, index) => (
                        <AccordionItem value={`gap-${index}`} key={gap.id}>
                          <AccordionTrigger className="text-left hover:no-underline">
                            <div className="flex items-center gap-3 flex-1">
                              <Badge 
                                className={getDifficultyColor(gap.difficulty)}
                                variant="outline"
                              >
                                {gap.difficulty.charAt(0).toUpperCase() + gap.difficulty.slice(1)} Difficulty
                              </Badge>
                              <Badge 
                                className={getImpactColor(gap.potentialImpact)}
                                variant="outline"
                              >
                                {gap.potentialImpact.charAt(0).toUpperCase() + gap.potentialImpact.slice(1)} Impact
                              </Badge>
                              <span className="font-semibold">{gap.title}</span>
                              <Badge variant="secondary">
                                Relevance: {gap.relevance}%
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4 pt-2">
                              <div className="p-4 bg-muted/10 rounded">
                                <p className="font-medium mb-2">Description:</p>
                                <p className="text-sm">{gap.description}</p>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="font-medium mb-2">Supporting Evidence:</p>
                                  <ul className="space-y-1 text-sm">
                                    {gap.supportingEvidence.map((evidence, idx) => (
                                      <li key={idx} className="flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                                        <span>{evidence}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                
                                <div>
                                  <p className="font-medium mb-2">Research Questions:</p>
                                  <ul className="space-y-1 text-sm">
                                    {gap.researchQuestions.slice(0, 3).map((question, idx) => (
                                      <li key={idx} className="flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                                        <span>{question}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                              
                              <div>
                                <p className="font-medium mb-2">Methodology Suggestions:</p>
                                <ul className="space-y-1 text-sm">
                                  {gap.methodologySuggestions.map((method, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                                      <span>{method}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm">
                                  <Lightbulb className="w-4 h-4 mr-2" />
                                  Save for Later
                                </Button>
                                <Button size="sm">
                                  <Target className="w-4 h-4 mr-2" />
                                  Explore This Gap
                                </Button>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                  
                  {/* Visualization */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Research Landscape Visualization
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Thematic Clusters</h4>
                          <div className="flex flex-wrap gap-2">
                            {gapAnalysis.thematicClusters.map((cluster, index) => (
                              <Badge key={index} variant="secondary">
                                {cluster.theme} ({cluster.gapCount} gaps)
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Evolution Over Time</h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Year</TableHead>
                                <TableHead>Gaps Identified</TableHead>
                                <TableHead>Research Focus</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {gapAnalysis.timelineAnalysis
                                .filter(entry => entry.gapCount > 0)
                                .map((entry, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{entry.year}</TableCell>
                                    <TableCell>{entry.gapCount} gaps</TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <Progress value={(entry.gapCount / 5) * 100} className="w-24" />
                                        <span className="text-xs">{entry.papers.length} papers</span>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Target className="w-12 h-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No Gap Analysis Performed</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Click "Analyze Research Gaps" to identify unexplored areas in your research field.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="timeline" className="mt-6">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Project Timeline & Milestones</h3>
                  <p className="text-sm text-muted-foreground">
                    Plan and track your thesis completion schedule
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-40"
                  />
                  <Button 
                    onClick={handleSetDeadline} 
                    disabled={isSettingDeadline || !deadline}
                    size="sm"
                  >
                    {isSettingDeadline ? "Setting..." : "Set Deadline"}
                  </Button>
                </div>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Chapter Completion Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {thesisChecklist.map((phase, index) => (
                      <div key={phase.id} className="flex items-center gap-4">
                        <div className="w-8 text-center font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">{phase.title}</span>
                            <span>{chapterProgress[phase.id] || 0}% Complete</span>
                          </div>
                          <Progress value={chapterProgress[phase.id] || 0} />
                        </div>
                        <div className="w-24 text-right text-sm text-muted-foreground">
                          {Math.round((chapterProgress[phase.id] || 0) / 100 * 100)} days
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Advisor Checkpoints
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs">
                        1
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Topic Approval</p>
                        <p className="text-sm text-muted-foreground">Due in 2 weeks</p>
                      </div>
                      <Badge variant="outline">Pending</Badge>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs">
                        2
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Outline Review</p>
                        <p className="text-sm text-muted-foreground">Due in 4 weeks</p>
                      </div>
                      <Badge variant="outline">Scheduled</Badge>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs">
                        3
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Draft Feedback</p>
                        <p className="text-sm text-muted-foreground">Due in 8 weeks</p>
                      </div>
                      <Badge variant="outline">Upcoming</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}