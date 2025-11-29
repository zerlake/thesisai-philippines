'use client';

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { useAuth } from "./auth-provider";
import { useAuthReady } from "@/hooks/use-auth-ready";
import { toast } from "sonner";
import { AlertTriangle, History, Loader2, Sparkles, Trash2, ChevronDown } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Separator } from "./ui/separator";
import { Alert, AlertDescription } from "./ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Label } from "./ui/label";
import { formatDistanceToNow } from "date-fns";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { callPuterAI } from "@/lib/puter-ai-wrapper";

type ScoreResults = {
  focus: number;
  development: number;
  audience: number;
  cohesion: number;
  languageAndStyle: number;
  overall: number;
  // Extended rating dimensions
  clarity?: number;
  originality?: number;
  structure?: number;
  grammar?: number;
  argumentStrength?: number;
  engagement?: number;
  conciseness?: number;
  readability?: number;
};

type Tips = {
  focus: string;
  development: string;
  audience: string;
  cohesion: string;
  languageAndStyle: string;
  // Extended tips
  clarity?: string;
  originality?: string;
  structure?: string;
  grammar?: string;
  argumentStrength?: string;
  engagement?: string;
  conciseness?: string;
  readability?: string;
};

type AnalysisResult = {
  scores: ScoreResults;
  overallFeedback: string;
  tips: Tips;
};

type HistoryItem = {
  id: string;
  created_at: string;
  text_preview: string;
  scores: ScoreResults;
  overall_feedback: string;
};

const MINIMUM_WORD_COUNT = 25;

const criterionDescriptions: { [key: string]: string } = {
  focus: "Is the writing centered on a clear, consistent main idea?",
  development: "Are the ideas well-supported with evidence, examples, and details?",
  audience: "Is the tone and language appropriate for an academic audience?",
  cohesion: "Do the ideas flow logically? Are transitions used effectively?",
  languageAndStyle: "Is the grammar correct? Is the sentence structure varied and the word choice precise?",
  // Extended dimensions
  clarity: "How clearly are ideas expressed? Is vocabulary precise and appropriate?",
  originality: "Does the writing present unique insights, arguments, or presentation styles?",
  structure: "Is the text logically organized with clear introduction, body, and conclusion?",
  grammar: "Are grammar, punctuation, spelling, and formatting consistent and correct?",
  argumentStrength: "How effective are arguments? Is evidence adequate and convincing?",
  engagement: "Does the writing engage the target audience? Is the tone appropriate for the purpose?",
  conciseness: "Is the writing economical with words? Are there unnecessary repetitions or verbosity?",
  readability: "What is the overall readability level? (Flesch-Kincaid equivalent)",
};

/**
 * Analyze text using Puter AI client-side wrapper
 */
async function analyzeWithPuterAI(text: string): Promise<AnalysisResult> {
  const prompt = `You are an expert academic writing coach. Analyze the following text based on these criteria:

CORE CRITERIA (required):
- Focus: Is the writing centered on a clear, consistent main idea?
- Development: Are the ideas well-supported with evidence, examples, and details?
- Audience: Is the tone and language appropriate for an academic audience?
- Cohesion: Do the ideas flow logically? Are transitions used effectively?
- Language and Style: Is the grammar correct? Is the sentence structure varied and the word choice precise?

EXTENDED CRITERIA:
- Clarity & Precision: How clearly are ideas expressed? Is vocabulary precise and appropriate?
- Originality & Creativity: Does the writing present unique insights, arguments, or presentation styles?
- Structure & Organization: Is the text logically organized with clear introduction, body, and conclusion?
- Grammar & Mechanics: Are grammar, punctuation, spelling, and formatting consistent and correct?
- Argument Strength & Evidence: How effective are arguments? Is evidence adequate and convincing?
- Engagement & Tone: Does the writing engage the target audience? Is the tone appropriate for the purpose?
- Conciseness & Redundancy: Is the writing economical with words? Are there unnecessary repetitions or verbosity?
- Readability Metrics: What is the overall readability level? Consider sentence length and complexity.

For each criterion, provide a score from 1 to 5 (can be decimal like 3.5).
Provide an overall score which is the average of ALL scores.
Provide a concise "overallFeedback" (2-3 sentences) summarizing main strengths and areas for improvement.
For each criterion, provide a specific actionable "tip" (1-2 sentences).

Output ONLY a valid JSON object with this structure:
{
  "scores": {
    "focus": number,
    "development": number,
    "audience": number,
    "cohesion": number,
    "languageAndStyle": number,
    "clarity": number,
    "originality": number,
    "structure": number,
    "grammar": number,
    "argumentStrength": number,
    "engagement": number,
    "conciseness": number,
    "readability": number,
    "overall": number
  },
  "overallFeedback": "string",
  "tips": {
    "focus": "string",
    "development": "string",
    "audience": "string",
    "cohesion": "string",
    "languageAndStyle": "string",
    "clarity": "string",
    "originality": "string",
    "structure": "string",
    "grammar": "string",
    "argumentStrength": "string",
    "engagement": "string",
    "conciseness": "string",
    "readability": "string"
  }
}

Text to analyze:
"${text}"

Generate the JSON now.`;

  try {
    // Call Puter AI using client-side wrapper
    const result = await callPuterAI(prompt, {
      temperature: 0.3,  // Precise corrections
      max_tokens: 2500,
      timeout: 30000
    });

    // Parse JSON response
    const parsed = JSON.parse(result) as AnalysisResult;

    // Validate and fill in missing scores
    const requiredScores = [
      'focus', 'development', 'audience', 'cohesion', 'languageAndStyle',
      'clarity', 'originality', 'structure', 'grammar', 'argumentStrength',
      'engagement', 'conciseness', 'readability'
    ];

    for (const dimension of requiredScores) {
      if (parsed.scores[dimension as keyof ScoreResults] === undefined) {
        parsed.scores[dimension as keyof ScoreResults] = 3;
        parsed.tips[dimension as keyof Tips] = parsed.tips[dimension as keyof Tips] || 'Review this aspect of your writing for improvement.';
      }
    }

    // Recalculate overall score
    const allScores = Object.entries(parsed.scores)
      .filter(([key]) => key !== 'overall')
      .map(([_, value]) => value as number);
    
    if (allScores.length > 0) {
      parsed.scores.overall = Math.round((allScores.reduce((a, b) => a + b, 0) / allScores.length) * 10) / 10;
    }

    return parsed;
  } catch (error) {
    console.error("Grammar check analysis error:", error);
    throw new Error(`Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function GrammarChecker() {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null);

  const wordCount = inputText.split(/\s+/).filter(Boolean).length;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const addSampleData = () => {
    const sampleText = `Introduction: The Impact of Social Media Usage on Academic Performance of Senior High School Students in the Philippines

Research Problem: With the proliferation of digital technology and social media platforms, concerns have been raised about their impact on students' academic performance. Studies have shown mixed results regarding the relationship between social media usage and academic achievement, with some indicating negative correlations while others suggest potential benefits for collaborative learning. In the Philippine context, the K-12 educational reforms have emphasized the importance of digital literacy while also highlighting the need for balanced technology use. During the pandemic, the reliance on digital platforms for education increased dramatically, further blurring the lines between educational and recreational technology use. This study aims to investigate the specific relationship between social media usage patterns and academic performance among Grade 12 students in selected schools in Region III, providing insights that could inform educational policies and student guidance programs.`;
    
    setInputText(sampleText);
    toast.success("Sample text added! Click 'Analyze Text' to see the writing feedback in action.");
  };

  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      const { data, error } = await supabase
        .from("grammar_check_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        toast.error("Failed to load grammar check history.");
        console.error(error);
      } else {
        setHistory(data || []);
      }
      setIsLoadingHistory(false);
    };

    fetchHistory();
  }, [user, supabase]);

  const handleCheck = async () => {
    if (wordCount < MINIMUM_WORD_COUNT) {
      toast.error(`Please provide at least ${MINIMUM_WORD_COUNT} words for an effective analysis.`);
      return;
    }
    if (!session) {
      toast.error("You must be logged in to use this feature.");
      return;
    }

    setIsLoading(true);
    setError("");
    setResults(null);

    try {
      // Call Puter AI analysis
      const analysisData = await analyzeWithPuterAI(inputText);
      
      setResults(analysisData);
      toast.success("Analysis complete!");

      // Save analysis results to database (fire and forget)
      const { error: saveError } = await supabase
        .from("grammar_check_history")
        .insert({
          user_id: user!.id,
          text_preview: inputText.substring(0, 200),
          scores: analysisData.scores,
          overall_feedback: analysisData.overallFeedback,
        });

      if (saveError) {
        console.error("Failed to save grammar check history:", saveError);
      }

      // Refresh history
      const { data: newHistory, error: historyError } = await supabase
        .from("grammar_check_history")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(5);
      if (historyError) console.error("Failed to refresh history:", historyError);
      else setHistory(newHistory || []);

    } catch (err: any) {
      const errorMessage = err.message || 'An unknown error occurred.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteHistoryItem = async (id: string) => {
    if (!user) return;
    const { error } = await supabase
      .from("grammar_check_history")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to delete history item.");
      console.error(error);
    } else {
      setHistory(history.filter(item => item.id !== id));
      toast.success("History item deleted.");
    }
  };

  const baseScoreItems = results ? [
    { label: "Focus", key: "focus", value: results.scores.focus, tip: results.tips.focus },
    { label: "Development", key: "development", value: results.scores.development, tip: results.tips.development },
    { label: "Audience", key: "audience", value: results.scores.audience, tip: results.tips.audience },
    { label: "Cohesion", key: "cohesion", value: results.scores.cohesion, tip: results.tips.cohesion },
    { label: "Language and Style", key: "languageAndStyle", value: results.scores.languageAndStyle, tip: results.tips.languageAndStyle },
  ] : [];

  const extendedScoreItems = results ? [
    results.scores.clarity !== undefined ? { label: "Clarity & Precision", key: "clarity", value: results.scores.clarity, tip: results.tips.clarity } : null,
    results.scores.originality !== undefined ? { label: "Originality & Creativity", key: "originality", value: results.scores.originality, tip: results.tips.originality } : null,
    results.scores.structure !== undefined ? { label: "Structure & Organization", key: "structure", value: results.scores.structure, tip: results.tips.structure } : null,
    results.scores.grammar !== undefined ? { label: "Grammar & Mechanics", key: "grammar", value: results.scores.grammar, tip: results.tips.grammar } : null,
    results.scores.argumentStrength !== undefined ? { label: "Argument Strength & Evidence", key: "argumentStrength", value: results.scores.argumentStrength, tip: results.tips.argumentStrength } : null,
    results.scores.engagement !== undefined ? { label: "Engagement & Tone", key: "engagement", value: results.scores.engagement, tip: results.tips.engagement } : null,
    results.scores.conciseness !== undefined ? { label: "Conciseness & Redundancy", key: "conciseness", value: results.scores.conciseness, tip: results.tips.conciseness } : null,
    results.scores.readability !== undefined ? { label: "Readability Metrics", key: "readability", value: results.scores.readability, tip: results.tips.readability } : null,
  ].filter((item): item is { label: string; key: string; value: number; tip: string | undefined } => item !== null) : [];

  const allScoreItems = [...baseScoreItems, ...extendedScoreItems];

  const chartData = history.map(item => ({
    date: isMounted ? formatDistanceToNow(new Date(item.created_at), { addSuffix: false }) : '',
    overallScore: item.scores.overall,
  })).reverse(); // Reverse to show oldest first on chart

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Grammar & Writing Check</CardTitle>
          <CardDescription>
            Get AI-powered feedback on your writing&apos;s focus, development, cohesion, and more.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <Label htmlFor="text-input">Text for Analysis</Label>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={addSampleData}
            >
              Add Sample
            </Button>
          </div>
          <Textarea
            id="text-input"
            placeholder="Paste your text here for analysis..."
            className="min-h-[250px] resize-y"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
          />
          <div className="flex justify-between items-center">
            <Button onClick={handleCheck} disabled={isLoading || wordCount < MINIMUM_WORD_COUNT}>
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Analyze Text
            </Button>
            <p className="text-sm text-muted-foreground">
              {wordCount} words
            </p>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-8">
              <Skeleton className="h-64 w-full" />
              <div>
                <Skeleton className="h-8 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {results && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Your Feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Overall Feedback</h4>
                <p className="text-muted-foreground">{results.overallFeedback}</p>
              </div>
              <div className="p-6 bg-primary/5 rounded-lg border">
                <div className="flex justify-between items-baseline">
                  <p className="text-lg font-semibold">Overall Score</p>
                  <p className="text-4xl font-bold text-primary">{results.scores.overall.toFixed(1)}</p>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Average of all 13 writing dimensions</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detailed Breakdown (1-5 Scale)</CardTitle>
              <CardDescription>
                Comprehensive analysis across all writing quality dimensions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-4 text-sm">Core Dimensions</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {baseScoreItems.map(item => (
                      <div key={item.key} className="space-y-2 p-4 rounded-lg bg-muted/50">
                        <div className="flex justify-between items-baseline">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="link" className="p-0 h-auto text-sm font-semibold justify-start">
                                {item.label}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <p className="text-sm font-semibold mb-2">{item.label}</p>
                              <p className="text-xs text-muted-foreground">{criterionDescriptions[item.key]}</p>
                            </PopoverContent>
                          </Popover>
                          <span className="text-lg font-bold text-primary">{item.value.toFixed(1)}/5</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${(item.value / 5) * 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">{item.tip}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {extendedScoreItems.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-4 text-sm">Extended Dimensions (Advanced Analysis)</h4>
                    <div className="space-y-2">
                      {extendedScoreItems.map(item => (
                        <div key={item.key} className="border rounded-lg overflow-hidden">
                          <button
                            onClick={() => setExpandedAccordion(expandedAccordion === item.key ? null : item.key)}
                            className="w-full p-4 flex justify-between items-center hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <ChevronDown 
                                className={`w-4 h-4 transition-transform ${expandedAccordion === item.key ? 'rotate-180' : ''}`}
                              />
                              <div className="text-left">
                                <p className="font-semibold text-sm">{item.label}</p>
                              </div>
                            </div>
                            <span className="text-lg font-bold text-primary">{item.value.toFixed(1)}/5</span>
                          </button>
                          
                          {expandedAccordion === item.key && (
                            <div className="px-4 pb-4 border-t bg-muted/30 space-y-3">
                              <div className="w-full bg-muted rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full transition-all"
                                  style={{ width: `${(item.value / 5) * 100}%` }}
                                />
                              </div>
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">What this measures:</p>
                                <p className="text-sm text-muted-foreground">{criterionDescriptions[item.key]}</p>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-1">Improvement tip:</p>
                                <p className="text-sm text-muted-foreground">{item.tip}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Consider using the AI tools in the editor to improve specific sections. Highlight text to get suggestions for improving, summarizing, or rewriting. Focus on the dimensions with lower scores for the most impact.
              </p>
            </CardContent>
          </Card>
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3"><History className="w-5 h-5" />Grammar Check History</CardTitle>
          <CardDescription>Your last 5 writing analyses and overall score trend.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingHistory ? (
            <Skeleton className="h-48 w-full" />
          ) : history.length > 0 ? (
            <div className="space-y-4">
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="overallScore" stroke="#8884d8" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Preview</TableHead>
                    <TableHead className="text-right">Overall Score</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>{isMounted && formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</TableCell>
                      <TableCell className="text-muted-foreground text-sm max-w-xs truncate">{item.text_preview}</TableCell>
                      <TableCell className="text-right font-medium">{item.scores.overall.toFixed(1)}/5</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteHistoryItem(item.id)}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No grammar check history yet. Run an analysis to see your progress!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}