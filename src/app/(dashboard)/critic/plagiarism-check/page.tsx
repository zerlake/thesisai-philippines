'use client';

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { redirect } from "next/navigation";
import { BrandedLoader } from "@/components/branded-loader";
import { callPuterAI } from "@/lib/puter-ai-wrapper";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  FileText,
  Loader2,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Search,
  BookOpen,
  Copy,
  FileWarning,
} from "lucide-react";
import { toast } from "sonner";

type SimilarityMatch = {
  id: string;
  text: string;
  matchedText: string;
  similarity: number;
  source: string;
  sourceUrl?: string;
  type: 'exact' | 'paraphrase' | 'similar';
};

type PlagiarismResult = {
  overallScore: number;
  originalityScore: number;
  matches: SimilarityMatch[];
  summary: {
    totalMatches: number;
    exactMatches: number;
    paraphraseMatches: number;
    similarMatches: number;
  };
  recommendation: string;
};

const sampleTexts = [
  {
    title: "Suspicious Academic Text",
    content: `Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed. The field has experienced tremendous growth in recent years, particularly in areas such as natural language processing, computer vision, and predictive analytics.

Deep learning, a subset of machine learning, uses neural networks with multiple layers to progressively extract higher-level features from raw input. For example, in image processing, lower layers may identify edges, while higher layers may identify human-relevant concepts such as digits, letters, or faces.

According to Wikipedia, artificial intelligence was founded as an academic discipline in 1956. The field went through multiple cycles of optimism followed by disappointment and loss of funding, followed by new approaches, success, and renewed funding.`
  },
  {
    title: "Research Methodology Text",
    content: `This study employed a mixed-methods research design combining quantitative surveys with qualitative interviews. The research methodology was adapted from Creswell's (2014) framework for mixed-methods research, which emphasizes the integration of both data types to provide a comprehensive understanding of the research problem.

Data collection involved administering standardized questionnaires to 250 participants, followed by semi-structured interviews with a purposive sample of 20 respondents. The sampling strategy followed Patton's (2002) guidelines for purposeful sampling in qualitative research, ensuring maximum variation in participant characteristics.

Statistical analysis was conducted using SPSS version 26, while thematic analysis of qualitative data followed Braun and Clarke's (2006) six-phase framework. This approach has been widely adopted in social science research for its systematic and transparent methodology.`
  },
  {
    title: "Literature Review Sample",
    content: `The concept of emotional intelligence was first introduced by Salovey and Mayer in 1990, who defined it as "the ability to monitor one's own and others' feelings and emotions, to discriminate among them, and to use this information to guide one's thinking and actions." This definition has since been expanded and refined by numerous researchers.

Goleman (1995) popularized the concept through his bestselling book, arguing that emotional intelligence is more important than IQ in determining life success. His framework identified five key components: self-awareness, self-regulation, motivation, empathy, and social skills.

More recent research by Bar-On (2006) has developed the Emotional Quotient Inventory (EQ-i), a widely used assessment tool that measures emotional and social functioning. Studies using this instrument have demonstrated significant correlations between emotional intelligence and various outcomes including job performance, leadership effectiveness, and mental health.`
  }
];

export default function PlagiarismCheckPage() {
  const authContext = useAuth();
  const [inputText, setInputText] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<PlagiarismResult | null>(null);
  const [showSampleMenu, setShowSampleMenu] = useState(false);

  const loadSampleText = (sample: typeof sampleTexts[0]) => {
    setInputText(sample.content);
    setResult(null);
    setShowSampleMenu(false);
    toast.success(`Loaded: ${sample.title}`);
  };

  if (!authContext) {
    return <BrandedLoader />;
  }

  const { session, profile, isLoading } = authContext;

  if (!isLoading && (!session || profile?.role !== 'critic')) {
    redirect('/login');
  }

  if (isLoading) {
    return <BrandedLoader />;
  }

  const handleCheck = async () => {
    if (!inputText.trim()) {
      toast.error("Please enter some text to check");
      return;
    }

    setIsChecking(true);
    setResult(null);

    try {
      const prompt = `You are an academic plagiarism detection expert. Analyze the following text for potential plagiarism issues, focusing on common academic writing patterns and potential borrowed content.

Text to analyze:
"${inputText}"

Respond in this exact JSON format (no markdown, just JSON):
{
  "overallScore": number between 0-100 representing plagiarism percentage,
  "originalityScore": number between 0-100 representing originality,
  "matches": [
    {
      "id": "1",
      "text": "the potentially plagiarized text from input",
      "matchedText": "hypothetical original source text",
      "similarity": percentage 0-100,
      "source": "hypothetical source name (e.g., 'Academic Journal 2023', 'Wikipedia Article', 'Published Textbook')",
      "sourceUrl": "https://example.com/source",
      "type": "exact|paraphrase|similar"
    }
  ],
  "summary": {
    "totalMatches": number,
    "exactMatches": number,
    "paraphraseMatches": number,
    "similarMatches": number
  },
  "recommendation": "brief recommendation for the critic about originality"
}

Note: This is a simulated analysis for educational purposes. Identify common phrases, clichés, or patterns that might appear borrowed. Be realistic - most academic writing will have some similarity to existing work.`;

      const response = await callPuterAI(prompt, { temperature: 0.4, max_tokens: 2000 });

      // Parse the JSON response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setResult(parsed);

        if (parsed.overallScore > 30) {
          toast.warning(`Found ${parsed.summary.totalMatches} potential matches`);
        } else {
          toast.success("Text appears to be mostly original");
        }
      } else {
        throw new Error("Could not parse response");
      }
    } catch (error) {
      console.error("Check failed:", error);
      toast.error("Failed to check text. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  const getScoreColor = (score: number, isOriginality = false) => {
    if (isOriginality) {
      if (score >= 80) return 'text-green-500';
      if (score >= 60) return 'text-yellow-500';
      return 'text-red-500';
    } else {
      if (score <= 20) return 'text-green-500';
      if (score <= 40) return 'text-yellow-500';
      return 'text-red-500';
    }
  };

  const getScoreBgColor = (score: number, isOriginality = false) => {
    if (isOriginality) {
      if (score >= 80) return 'bg-green-500';
      if (score >= 60) return 'bg-yellow-500';
      return 'bg-red-500';
    } else {
      if (score <= 20) return 'bg-green-500';
      if (score <= 40) return 'bg-yellow-500';
      return 'bg-red-500';
    }
  };

  const getMatchBadgeColor = (type: string) => {
    switch (type) {
      case 'exact':
        return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'paraphrase':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'similar':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Plagiarism Checker
          </h1>
          <p className="text-muted-foreground">
            Check manuscript text for potential plagiarism and similarity issues
          </p>
        </div>
        <DropdownMenu open={showSampleMenu} onOpenChange={setShowSampleMenu}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              Load Sample
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            {sampleTexts.map((sample, index) => (
              <DropdownMenuItem
                key={index}
                onClick={() => loadSampleText(sample)}
                className="cursor-pointer"
              >
                <FileText className="h-4 w-4 mr-2" />
                {sample.title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <Card className="lg:row-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Text to Check
            </CardTitle>
            <CardDescription>
              Paste the manuscript content to check for originality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste the manuscript text here for plagiarism checking..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[500px] resize-none font-mono text-sm"
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {inputText.split(/\s+/).filter(Boolean).length} words
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setInputText("")}
                  disabled={!inputText}
                >
                  Clear
                </Button>
                <Button
                  onClick={handleCheck}
                  disabled={isChecking || !inputText.trim()}
                >
                  {isChecking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Check Plagiarism
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
              <AlertTriangle className="h-4 w-4 inline mr-2" />
              <strong>Note:</strong> This is an AI-powered similarity analysis tool for educational purposes.
              For official plagiarism reports, please use certified services like Turnitin or iThenticate.
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {!result ? (
          <Card className="flex items-center justify-center min-h-[300px]">
            <CardContent className="text-center">
              <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No Check Performed</h3>
              <p className="text-muted-foreground text-sm">
                Enter text and click "Check Plagiarism" to analyze
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Score Cards */}
            <div className="grid gap-4 grid-cols-2">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    {result.originalityScore >= 80 ? (
                      <ShieldCheck className="h-10 w-10 mx-auto text-green-500" />
                    ) : result.originalityScore >= 60 ? (
                      <Shield className="h-10 w-10 mx-auto text-yellow-500" />
                    ) : (
                      <ShieldAlert className="h-10 w-10 mx-auto text-red-500" />
                    )}
                    <div className={`text-4xl font-bold ${getScoreColor(result.originalityScore, true)}`}>
                      {result.originalityScore}%
                    </div>
                    <p className="text-sm text-muted-foreground">Originality Score</p>
                    <Progress
                      value={result.originalityScore}
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <FileWarning className={`h-10 w-10 mx-auto ${getScoreColor(result.overallScore)}`} />
                    <div className={`text-4xl font-bold ${getScoreColor(result.overallScore)}`}>
                      {result.overallScore}%
                    </div>
                    <p className="text-sm text-muted-foreground">Similarity Found</p>
                    <Progress
                      value={result.overallScore}
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Results */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Detailed Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="matches" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="matches">
                      Matches ({result.summary.totalMatches})
                    </TabsTrigger>
                    <TabsTrigger value="summary">
                      Summary
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="matches">
                    <ScrollArea className="h-[250px] pr-4">
                      {result.matches.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8">
                          <CheckCircle2 className="h-12 w-12 text-green-500 mb-2" />
                          <p className="text-green-600 font-medium">No significant matches found!</p>
                          <p className="text-sm text-muted-foreground">The text appears to be original.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {result.matches.map((match) => (
                            <div
                              key={match.id}
                              className="p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <Badge className={getMatchBadgeColor(match.type)}>
                                  {match.type.charAt(0).toUpperCase() + match.type.slice(1)} Match
                                </Badge>
                                <span className={`text-sm font-bold ${getScoreColor(match.similarity)}`}>
                                  {match.similarity}%
                                </span>
                              </div>
                              <p className="text-sm mb-2 bg-red-500/10 p-2 rounded">
                                "{match.text}"
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <BookOpen className="h-3 w-3" />
                                <span>{match.source}</span>
                                {match.sourceUrl && (
                                  <a
                                    href={match.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline inline-flex items-center gap-1"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="summary">
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-3 rounded-lg bg-red-500/10">
                          <div className="text-2xl font-bold text-red-500">
                            {result.summary.exactMatches}
                          </div>
                          <p className="text-xs text-muted-foreground">Exact</p>
                        </div>
                        <div className="p-3 rounded-lg bg-yellow-500/10">
                          <div className="text-2xl font-bold text-yellow-500">
                            {result.summary.paraphraseMatches}
                          </div>
                          <p className="text-xs text-muted-foreground">Paraphrase</p>
                        </div>
                        <div className="p-3 rounded-lg bg-blue-500/10">
                          <div className="text-2xl font-bold text-blue-500">
                            {result.summary.similarMatches}
                          </div>
                          <p className="text-xs text-muted-foreground">Similar</p>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg bg-muted/50">
                        <h4 className="font-medium mb-2">Recommendation</h4>
                        <p className="text-sm text-muted-foreground">
                          {result.recommendation}
                        </p>
                      </div>

                      <Button variant="outline" className="w-full">
                        <Copy className="mr-2 h-4 w-4" />
                        Export Report
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
