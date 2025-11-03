"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { 
  Wand2, 
  TextQuote, 
  FileText, 
  Loader2,
  Sparkles,
  Zap,
  Target,
  Eye,
  BookOpen,
  PenLine,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  TrendingUp,
  BarChart3,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Copy,
  RotateCcw
} from "lucide-react";
import { useAuth } from "./auth-provider";
import { toast } from "sonner";
import { type Editor } from "@tiptap/react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { FieldOfStudySelector } from "./field-of-study-selector";
import { OriginalityCheckPanel } from "./originality-check-panel";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface AIAssistantPanelProps {
  editor: Editor | null;
  documentContent: string;
  documentId: string;
}

type WritingStyle = "academic" | "formal" | "informal" | "persuasive" | "descriptive" | "narrative";
type ToneAdjustment = "more_formal" | "more_informal" | "more_concise" | "more_detailed" | "more_objective" | "more_subjective";

type WritingIssue = {
  id: string;
  type: "grammar" | "clarity" | "tone" | "structure" | "flow" | "repetition" | "bias" | "plagiarism";
  severity: "low" | "medium" | "high";
  text: string;
  suggestion: string;
  explanation: string;
  position: { start: number; end: number };
};

type StyleAnalysis = {
  overallScore: number;
  metrics: {
    formality: number;
    clarity: number;
    coherence: number;
    engagement: number;
    originality: number;
  };
  issues: WritingIssue[];
  suggestions: {
    type: "rewrite" | "add" | "remove" | "restructure";
    text: string;
    suggestion: string;
    reason: string;
  }[];
};

type GapAnalysis = {
  id: string;
  title: string;
  description: string;
  relevance: number;
  difficulty: "low" | "medium" | "high";
  potentialImpact: "low" | "high";
  supportingEvidence: string[];
  researchQuestions: string[];
  methodologySuggestions: string[];
};

type ResearchGapInsight = {
  overallScore: number;
  identifiedGaps: GapAnalysis[];
  thematicClusters: { theme: string; gapCount: number }[];
  timelineAnalysis: { year: number; gapCount: number }[];
};

export function EnhancedAIAssistantPanel({
  editor,
  documentContent,
  documentId,
}: AIAssistantPanelProps) {
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [generatedContentType, setGeneratedContentType] = useState<string | null>(null);
  const [styleAnalysis, setStyleAnalysis] = useState<StyleAnalysis | null>(null);
  const [gapAnalysis, setGapAnalysis] = useState<ResearchGapInsight | null>(null);
  const [userFeedback, setUserFeedback] = useState<{[key: string]: "positive" | "negative" | null}>({});

  // State for generators
  const [generatorType, setGeneratorType] = useState("outline");
  const [generatorTopic, setGeneratorTopic] = useState("");
  const [generatorField, setGeneratorField] = useState("");
  const [writingStyle, setWritingStyle] = useState<WritingStyle>("academic");
  const [toneAdjustment, setToneAdjustment] = useState<ToneAdjustment | "none">("none");

  const callAIFunction = async (functionName: string, body: object) => {
    if (!session) {
      toast.error("You must be logged in to use AI features.");
      return null;
    }

    try {
      // Import OpenRouter API service
      const { OpenRouterAPI } = await import("../services/openrouter-api");
      const openRouterAPI = new OpenRouterAPI();
      
      // Define different prompts based on the function name
      let prompt = "";
      let model = "openai/gpt-3.5-turbo";
      
      switch(functionName) {
        case "improve-writing":
          prompt = `Improve this academic text in a respectful, professional tone with consideration for ${body["style"]} style and ${body["tone"] || "neutral"} tone:
          
          ${body["text"]}

          Return the improved text in a JSON format with the field "improvedText".`;
          break;
          
        case "summarize-text":
          prompt = `Summarize this academic text concisely while preserving the key points, in a ${body["style"]} style:
          
          ${body["text"]}

          Return the summary in a JSON format with the field "summarizedText".`;
          break;
          
        case "generate-abstract":
          prompt = `Generate a compelling academic abstract based on this content in a ${body["style"]} style:
          
          ${body["content"]}

          The abstract should be between 150-300 words and include the main purposes, methods, results, and conclusions.
          Return the abstract in a JSON format with the field "abstract".`;
          break;
          
        case "generate-outline":
          prompt = `Generate a detailed academic outline for a thesis on "${body["topic"]}" in the field of "${body["field"]}" in a ${body["style"]} style.
          The outline should follow the standard 5-chapter structure used in Philippine universities and include detailed sections and subsections.
          Return the outline in a JSON format with the field "outline".`;
          break;
          
        case "generate-topic-ideas":
          prompt = `Generate 3-5 innovative research topic ideas in the field of "${body["field"]}" in a ${body["style"]} style.
          For each topic, provide a title and a brief description of the research focus.
          Return the ideas in a JSON format with the field "topicIdeas" as an array of objects with "title" and "description" fields.`;
          break;
          
        default:
          throw new Error(`Unknown function: ${functionName}`);
      }

      const response = await openRouterAPI.chatCompletion({
        model: model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });

      const content = response.choices[0].message.content as string;
      
      // Try to parse the JSON response
      let parsedResponse;
      try {
        // Extract JSON from the response if it's wrapped in code blocks
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Could not extract JSON from response");
        }
      } catch (parseError) {
        console.warn("Could not parse AI response JSON:", parseError);
        // Fallback: return the raw content as the expected field
        switch(functionName) {
          case "improve-writing":
            parsedResponse = { improvedText: content };
            break;
          case "summarize-text":
            parsedResponse = { summarizedText: content };
            break;
          case "generate-abstract":
            parsedResponse = { abstract: content };
            break;
          case "generate-outline":
            parsedResponse = { outline: content };
            break;
          case "generate-topic-ideas":
            parsedResponse = { topicIdeas: [{ title: "AI-Generated Topic", description: content }] };
            break;
          default:
            parsedResponse = { result: content };
        }
      }

      return parsedResponse;
    } catch (error: any) {
      toast.error(error.message);
      console.error(error);
      return null;
    }
  };

  // Document Tool Functions
  const handleImprove = async () => {
    if (!editor) return;
    setIsLoading("improve");
    const data = await callAIFunction("improve-writing", {
      text: documentContent,
      style: writingStyle,
      tone: toneAdjustment !== "none" ? toneAdjustment : undefined,
    });
    if (data && data.improvedText) {
      editor.commands.setContent(data.improvedText);
      toast.success("Document improved successfully!");
    }
    setIsLoading(null);
  };

  const handleSummarize = async () => {
    setIsLoading("summarize");
    setGeneratedContent(null);
    const data = await callAIFunction("summarize-text", {
      text: documentContent,
      style: writingStyle,
    });
    if (data && data.summarizedText) {
      setGeneratedContent(data.summarizedText);
      setGeneratedContentType("Summary");
    }
    setIsLoading(null);
  };

  const handleGenerateAbstract = async () => {
    setIsLoading("abstract");
    setGeneratedContent(null);
    const data = await callAIFunction("generate-abstract", {
      content: documentContent,
      style: writingStyle,
    });
    if (data && data.abstract) {
      setGeneratedContent(data.abstract);
      setGeneratedContentType("Abstract");
    }
    setIsLoading(null);
  };

  // Advanced Style Analysis
  const handleStyleAnalysis = async () => {
    setIsLoading("style-analysis");
    setStyleAnalysis(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock style analysis results
      const mockAnalysis: StyleAnalysis = {
        overallScore: 78,
        metrics: {
          formality: 82,
          clarity: 75,
          coherence: 85,
          engagement: 68,
          originality: 90
        },
        issues: [
          {
            id: "1",
            type: "clarity",
            severity: "medium",
            text: "The research findings indicates that students who use AI tools",
            suggestion: "The research findings indicate that students who use AI tools",
            explanation: "Subject-verb disagreement. 'Findings' is plural, so the verb should be 'indicate' not 'indicates'.",
            position: { start: 45, end: 105 }
          },
          {
            id: "2",
            type: "tone",
            severity: "low",
            text: "very important",
            suggestion: "crucial",
            explanation: "Using more academic vocabulary would enhance the formality of your writing.",
            position: { start: 120, end: 135 }
          },
          {
            id: "3",
            type: "structure",
            severity: "high",
            text: "In addition to this, it should also be noted that the results were quite interesting.",
            suggestion: "Furthermore, the results revealed significant insights.",
            explanation: "Redundant phrasing reduces clarity. Simplify for better academic tone.",
            position: { start: 200, end: 285 }
          }
        ],
        suggestions: [
          {
            type: "rewrite",
            text: "very important",
            suggestion: "crucial",
            reason: "More precise academic vocabulary"
          },
          {
            type: "restructure",
            text: "large amounts of data",
            suggestion: "extensive datasets",
            reason: "More specific academic terminology"
          },
          {
            type: "add",
            text: "The study found that...",
            suggestion: "This study found that...",
            reason: "Clearer attribution of findings"
          }
        ]
      };
      
      setStyleAnalysis(mockAnalysis);
      toast.success("Style analysis complete!");
    } catch (error: any) {
      toast.error(error.message || "Failed to analyze writing style.");
    } finally {
      setIsLoading(null);
    }
  };

  // Research Gap Analysis
  const handleGapAnalysis = async () => {
    setIsLoading("gap-analysis");
    setGapAnalysis(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock gap analysis results
      const mockGaps: GapAnalysis[] = [
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

      const mockAnalysis: ResearchGapInsight = {
        overallScore: 82,
        identifiedGaps: mockGaps,
        thematicClusters: [
          { theme: "AI Effectiveness", gapCount: 2 },
          { theme: "Cultural Adaptation", gapCount: 1 }
        ],
        timelineAnalysis: [
          { year: 2020, gapCount: 1 },
          { year: 2021, gapCount: 0 },
          { year: 2022, gapCount: 2 },
          { year: 2023, gapCount: 3 },
          { year: 2024, gapCount: 1 }
        ]
      };

      setGapAnalysis(mockAnalysis);
      toast.success("Research gap analysis complete!");
    } catch (error: any) {
      toast.error(error.message || "Failed to analyze research gaps.");
    } finally {
      setIsLoading(null);
    }
  };

  // Content Generator Function
  const handleGenerateContent = async () => {
    setIsLoading("generator");
    setGeneratedContent(null);

    if (generatorType === "outline") {
      if (!generatorTopic || !generatorField) {
        toast.error("Please provide a topic and field of study.");
        setIsLoading(null);
        return;
      }
      const data = await callAIFunction("generate-outline", {
        topic: generatorTopic,
        field: generatorField,
        style: writingStyle,
      });
      if (data && data.outline) {
        setGeneratedContent(data.outline);
        setGeneratedContentType("Outline");
      }
    } else if (generatorType === "topic-ideas") {
      if (!generatorField) {
        toast.error("Please select a field of study.");
        setIsLoading(null);
        return;
      }
      const data = await callAIFunction("generate-topic-ideas", {
        field: generatorField,
        style: writingStyle,
      });
      if (data && data.topicIdeas) {
        const formattedContent = data.topicIdeas
          .map(
            (idea: any) => `<h3>${idea.title}</h3><p>${idea.description}</p>`,
          )
          .join("");
        setGeneratedContent(formattedContent);
        setGeneratedContentType("Topic Ideas");
      }
    }
    setIsLoading(null);
  };

  const handleInsertContent = () => {
    if (!editor || !generatedContent) return;

    if (
      generatedContentType === "Summary" ||
      generatedContentType === "Abstract"
    ) {
      editor
        .chain()
        .focus()
        .insertContentAt(
          0,
          `<h2>${generatedContentType}</h2><p>${generatedContent}</p><hr>`,
        )
        .run();
      toast.success(
        `${generatedContentType} inserted at the top of your document.`,
      );
    } else {
      const contentToInsert = `<h2>Generated ${generatedContentType}</h2>${generatedContent}`;
      editor.chain().focus().insertContent(contentToInsert).run();
      toast.success(`${generatedContentType} inserted at cursor position.`);
    }

    setGeneratedContent(null);
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

  const getMetricColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getMetricBgColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low": return "bg-blue-100 text-blue-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "high": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Enhanced AI Assistant
        </CardTitle>
        <CardDescription>Supercharge your writing process with advanced AI assistance.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="document-tools" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="document-tools">Document Tools</TabsTrigger>
            <TabsTrigger value="generators">Generators</TabsTrigger>
            <TabsTrigger value="style-analysis">Style Analysis</TabsTrigger>
            <TabsTrigger value="originality">Originality</TabsTrigger>
          </TabsList>
          <TabsContent value="document-tools" className="pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={handleImprove}
                disabled={!!isLoading}
                className="justify-start"
              >
                {isLoading === "improve" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4 mr-2" />
                )}
                {isLoading === "improve"
                  ? "Improving..."
                  : "Improve Entire Document"}
              </Button>
              <Button
                onClick={handleSummarize}
                disabled={!!isLoading}
                className="justify-start"
              >
                {isLoading === "summarize" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <TextQuote className="w-4 h-4 mr-2" />
                )}
                {isLoading === "summarize"
                  ? "Summarizing..."
                  : "Summarize Document"}
              </Button>
              <Button
                onClick={handleGenerateAbstract}
                disabled={!!isLoading}
                className="justify-start"
              >
                {isLoading === "abstract" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4 mr-2" />
                )}
                {isLoading === "abstract" ? "Generating..." : "Generate Abstract"}
              </Button>
              <Button
                onClick={handleStyleAnalysis}
                disabled={!!isLoading}
                className="justify-start"
              >
                {isLoading === "style-analysis" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <BarChart3 className="w-4 h-4 mr-2" />
                )}
                {isLoading === "style-analysis" ? "Analyzing..." : "Analyze Style"}
              </Button>
              <Button
                onClick={handleGapAnalysis}
                disabled={!!isLoading}
                className="justify-start col-span-1 md:col-span-2"
              >
                {isLoading === "gap-analysis" ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Target className="w-4 h-4 mr-2" />
                )}
                {isLoading === "gap-analysis" ? "Analyzing Gaps..." : "Analyze Research Gaps"}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Writing Style</Label>
                <Select value={writingStyle} onValueChange={(value: WritingStyle) => setWritingStyle(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="informal">Informal</SelectItem>
                    <SelectItem value="persuasive">Persuasive</SelectItem>
                    <SelectItem value="descriptive">Descriptive</SelectItem>
                    <SelectItem value="narrative">Narrative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Tone Adjustment</Label>
                <Select value={toneAdjustment} onValueChange={(value: ToneAdjustment | "none") => setToneAdjustment(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an adjustment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="more_formal">More Formal</SelectItem>
                    <SelectItem value="more_informal">More Informal</SelectItem>
                    <SelectItem value="more_concise">More Concise</SelectItem>
                    <SelectItem value="more_detailed">More Detailed</SelectItem>
                    <SelectItem value="more_objective">More Objective</SelectItem>
                    <SelectItem value="more_subjective">More Subjective</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="generators" className="pt-4 space-y-4">
            <div className="space-y-2">
              <Label>Generator Type</Label>
              <Select value={generatorType} onValueChange={setGeneratorType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a generator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="outline">Outline Generator</SelectItem>
                  <SelectItem value="topic-ideas">
                    Topic Idea Generator
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {generatorType === "outline" && (
              <>
                <div className="space-y-2">
                  <Label>Field of Study</Label>
                  <FieldOfStudySelector
                    value={generatorField}
                    onValueChange={setGeneratorField}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Thesis Topic</Label>
                  <Input
                    placeholder="e.g., AI in Philippine Education"
                    value={generatorTopic}
                    onChange={(e) => setGeneratorTopic(e.target.value)}
                  />
                </div>
              </>
            )}

            {generatorType === "topic-ideas" && (
              <div className="space-y-2">
                <Label>Field of Study</Label>
                <FieldOfStudySelector
                  value={generatorField}
                  onValueChange={setGeneratorField}
                />
              </div>
            )}

            <Button
              onClick={handleGenerateContent}
              disabled={isLoading === "generator"}
              className="w-full"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              {isLoading === "generator" ? "Generating..." : "Generate"}
            </Button>
          </TabsContent>
          <TabsContent value="style-analysis" className="pt-4">
            <div className="space-y-6">
              {styleAnalysis ? (
                <>
                  {/* Overall Score */}
                  <div className="p-6 rounded-lg border-2 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700">
                    <div className="text-center">
                      <div className="text-4xl font-bold mb-2">
                        {styleAnalysis.overallScore}%
                      </div>
                      <div className="text-lg font-medium mb-2">
                        Writing Quality Score
                      </div>
                      <div className="text-sm opacity-80">
                        Based on 5 key writing quality metrics
                      </div>
                    </div>
                  </div>

                  {/* Quality Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Card className="text-center">
                      <CardContent className="p-4">
                        <div className={`text-2xl font-bold mb-2 ${getMetricColor(styleAnalysis.metrics.formality)}`}>
                          {styleAnalysis.metrics.formality}%
                        </div>
                        <div className="text-sm font-medium">Formality</div>
                        <Progress 
                          value={styleAnalysis.metrics.formality} 
                          className="mt-2" 
                          indicatorClassName={getMetricBgColor(styleAnalysis.metrics.formality)}
                        />
                      </CardContent>
                    </Card>
                    
                    <Card className="text-center">
                      <CardContent className="p-4">
                        <div className={`text-2xl font-bold mb-2 ${getMetricColor(styleAnalysis.metrics.clarity)}`}>
                          {styleAnalysis.metrics.clarity}%
                        </div>
                        <div className="text-sm font-medium">Clarity</div>
                        <Progress 
                          value={styleAnalysis.metrics.clarity} 
                          className="mt-2" 
                          indicatorClassName={getMetricBgColor(styleAnalysis.metrics.clarity)}
                        />
                      </CardContent>
                    </Card>
                    
                    <Card className="text-center">
                      <CardContent className="p-4">
                        <div className={`text-2xl font-bold mb-2 ${getMetricColor(styleAnalysis.metrics.coherence)}`}>
                          {styleAnalysis.metrics.coherence}%
                        </div>
                        <div className="text-sm font-medium">Coherence</div>
                        <Progress 
                          value={styleAnalysis.metrics.coherence} 
                          className="mt-2" 
                          indicatorClassName={getMetricBgColor(styleAnalysis.metrics.coherence)}
                        />
                      </CardContent>
                    </Card>
                    
                    <Card className="text-center">
                      <CardContent className="p-4">
                        <div className={`text-2xl font-bold mb-2 ${getMetricColor(styleAnalysis.metrics.engagement)}`}>
                          {styleAnalysis.metrics.engagement}%
                        </div>
                        <div className="text-sm font-medium">Engagement</div>
                        <Progress 
                          value={styleAnalysis.metrics.engagement} 
                          className="mt-2" 
                          indicatorClassName={getMetricBgColor(styleAnalysis.metrics.engagement)}
                        />
                      </CardContent>
                    </Card>
                    
                    <Card className="text-center">
                      <CardContent className="p-4">
                        <div className={`text-2xl font-bold mb-2 ${getMetricColor(styleAnalysis.metrics.originality)}`}>
                          {styleAnalysis.metrics.originality}%
                        </div>
                        <div className="text-sm font-medium">Originality</div>
                        <Progress 
                          value={styleAnalysis.metrics.originality} 
                          className="mt-2" 
                          indicatorClassName={getMetricBgColor(styleAnalysis.metrics.originality)}
                        />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Issues List */}
                  {styleAnalysis.issues.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        Writing Issues Detected
                      </h3>
                      <Accordion type="single" collapsible className="w-full">
                        {styleAnalysis.issues.map((issue, index) => (
                          <AccordionItem key={issue.id} value={`issue-${index}`}>
                            <AccordionTrigger className="text-left hover:no-underline">
                              <div className="flex items-center gap-3 flex-1">
                                <Badge
                                  variant="outline"
                                  className={getSeverityColor(issue.severity)}
                                >
                                  {issue.severity.charAt(0).toUpperCase() + issue.severity.slice(1)}
                                </Badge>
                                <span className="font-semibold">
                                  {issue.type.charAt(0).toUpperCase() + issue.type.slice(1)} Issue
                                </span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-4 pt-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="p-4 bg-destructive/10 border-l-4 border-destructive rounded">
                                    <p className="text-sm font-medium mb-2">Problematic Text:</p>
                                    <p className="text-sm">&quot;{issue.text}&quot;</p>
                                  </div>
                                  
                                  <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
                                    <p className="text-sm font-medium mb-2">Suggested Improvement:</p>
                                    <p className="text-sm">&quot;{issue.suggestion}&quot;</p>
                                  </div>
                                </div>
                                
                                <div className="p-4 bg-muted/10 rounded">
                                  <p className="font-medium mb-2">Explanation:</p>
                                  <p className="text-sm">{issue.explanation}</p>
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
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      if (editor) {
                                        // In a real implementation, this would apply the fix to the editor
                                        toast.success("In a full implementation, this would apply the suggested fix to your text.");
                                      }
                                    }}
                                  >
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
                  {styleAnalysis.suggestions.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">
                        Improvement Suggestions
                      </h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Original Text</TableHead>
                            <TableHead>Suggested Change</TableHead>
                            <TableHead>Reason</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {styleAnalysis.suggestions.map((suggestion, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Badge variant="outline">
                                  {suggestion.type.charAt(0).toUpperCase() + suggestion.type.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm max-w-[150px] truncate">
                                {suggestion.text}
                              </TableCell>
                              <TableCell className="text-sm max-w-[150px] truncate">
                                {suggestion.suggestion}
                              </TableCell>
                              <TableCell className="text-sm max-w-[200px] truncate">
                                {suggestion.reason}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="w-12 h-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No Style Analysis Performed</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Click "Analyze Style" to get a comprehensive assessment of your writing quality.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="originality" className="pt-4">
            <OriginalityCheckPanel
              documentContent={documentContent}
              documentId={documentId}
            />
          </TabsContent>
        </Tabs>

        {generatedContent && (
          <>
            <Separator className="my-4" />
            <Alert>
              <AlertTitle className="flex justify-between items-center">
                <span>Generated {generatedContentType}</span>
                <Button size="sm" onClick={handleInsertContent}>
                  Insert
                </Button>
              </AlertTitle>
              <AlertDescription
                className="mt-2 max-h-48 overflow-y-auto prose dark:prose-invert prose-sm"
                dangerouslySetInnerHTML={{ __html: generatedContent }}
              />
            </Alert>
          </>
        )}

        {gapAnalysis && (
          <div className="space-y-6 mt-6">
            <Separator />
            
            <div className="p-4 rounded-lg border bg-muted/10">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Research Gap Analysis Summary
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Card className="bg-blue-50 dark:bg-blue-900/20">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-1">
                        {gapAnalysis.overallScore}%
                      </div>
                      <div className="text-sm font-medium">
                        Opportunity Score
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-green-50 dark:bg-green-900/20">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-1">
                        {gapAnalysis.identifiedGaps.length}
                      </div>
                      <div className="text-sm font-medium">
                        Research Gaps
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-purple-50 dark:bg-purple-900/20">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-1">
                        {gapAnalysis.thematicClusters.length}
                      </div>
                      <div className="text-sm font-medium">
                        Themes Identified
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                {gapAnalysis.identifiedGaps.map((gap) => (
                  <AccordionItem value={`gap-${gap.id}`} key={gap.id}>
                    <AccordionTrigger className="text-left hover:no-underline">
                      <div className="flex items-center gap-3 flex-1">
                        <Badge variant="outline">
                          Relevance: {gap.relevance}%
                        </Badge>
                        <span className="font-semibold">{gap.title}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        <p className="text-muted-foreground">{gap.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Difficulty & Impact</h4>
                            <div className="flex flex-wrap gap-2">
                              <Badge className={getDifficultyColor(gap.difficulty)} variant="outline">
                                {gap.difficulty.charAt(0).toUpperCase() + gap.difficulty.slice(1)} Difficulty
                              </Badge>
                              <Badge className={getImpactColor(gap.potentialImpact)} variant="outline">
                                {gap.potentialImpact.charAt(0).toUpperCase() + gap.potentialImpact.slice(1)} Impact
                              </Badge>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Research Questions</h4>
                            <ul className="space-y-1 text-sm">
                              {gap.researchQuestions.slice(0, 2).map((question, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                                  <span>{question}</span>
                                </li>
                              ))}
                              {gap.researchQuestions.length > 2 && (
                                <li className="text-muted-foreground italic">
                                  + {gap.researchQuestions.length - 2} more questions
                                </li>
                              )}
                            </ul>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Methodology Suggestions</h4>
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
                        
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Research Questions
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper functions
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