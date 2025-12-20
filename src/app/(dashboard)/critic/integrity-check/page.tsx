'use client';

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { redirect } from "next/navigation";
import { BrandedLoader } from "@/components/branded-loader";
import { toast } from "sonner";
import {
  AlertTriangle,
  FileText,
  Loader2,
  CheckCircle2,
  XCircle,
  Shield,
  Brain,
  Copy,
  Sparkles,
} from "lucide-react";

type IntegrityIssue = {
  id: string;
  category: 'ai_generated' | 'contract_cheating' | 'self_plagiarism' | 'fabrication' | 'falsification';
  severity: 'high' | 'medium' | 'low';
  text: string;
  explanation: string;
  confidence: number;
};

type IntegrityResult = {
  overallScore: number;
  aiProbability: number;
  issues: IntegrityIssue[];
  flags: {
    ai_generated: number;
    contract_cheating: number;
    self_plagiarism: number;
    fabrication: number;
  };
  recommendation: string;
};

const sampleTexts = [
  {
    title: "Potentially AI-Generated Text",
    content: `The intersection of artificial intelligence and healthcare represents a paradigm shift in how medical professionals approach diagnosis and treatment. This transformative technology leverages sophisticated algorithms to analyze vast datasets, identifying patterns that may elude human perception.

In the realm of diagnostic imaging, AI-powered systems demonstrate remarkable accuracy in detecting anomalies. These systems utilize convolutional neural networks to process radiological images, achieving sensitivity and specificity rates that rival, and in some cases surpass, those of experienced radiologists.

Furthermore, the integration of natural language processing enables the extraction of valuable insights from unstructured clinical notes. This capability facilitates more comprehensive patient profiling and supports evidence-based decision-making processes.

The implications of these technological advancements extend beyond immediate clinical applications, potentially reshaping healthcare delivery models and resource allocation strategies on a systemic level.`
  },
  {
    title: "Authentic Student Writing",
    content: `When I first started researching this topic, I wasn't sure what to expect. The literature on emotional intelligence seemed overwhelming at first, but as I read more papers, I began to see patterns emerge.

One thing that really struck me was how Goleman's work differed from the original Salovey and Mayer model. Goleman seemed to include a lot more personality traits, which some researchers like Matthews have criticized pretty heavily.

In my interviews with students, I found that many of them had never heard of emotional intelligence before. This surprised me because I assumed it was common knowledge. Maybe this reflects a gap between academic research and practical understanding?

I struggled with the data analysis part. SPSS kept giving me error messages, and I had to ask my advisor for help multiple times. Eventually, we figured out that I had coded some of the Likert scale items incorrectly.`
  }
];

export default function IntegrityCheckPage() {
  const authContext = useAuth();
  const [inputText, setInputText] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<IntegrityResult | null>(null);
  const [showSampleMenu, setShowSampleMenu] = useState(false);

  if (!authContext) return <BrandedLoader />;
  const { session, profile, isLoading } = authContext;
  if (!isLoading && (!session || profile?.role !== 'critic')) redirect('/login');
  if (isLoading) return <BrandedLoader />;

  const loadSample = (sample: typeof sampleTexts[0]) => {
    setInputText(sample.content);
    setResult(null);
    setShowSampleMenu(false);
    toast.success(`Loaded: ${sample.title}`);
  };

  const handleCheck = async () => {
    if (!inputText.trim()) {
      toast.error("Please enter text to check");
      return;
    }

    setIsChecking(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulated results based on text characteristics
    const hasAiPatterns = inputText.includes("paradigm shift") || inputText.includes("leverages sophisticated");

    setResult({
      overallScore: hasAiPatterns ? 45 : 92,
      aiProbability: hasAiPatterns ? 78 : 12,
      issues: hasAiPatterns ? [
        { id: '1', category: 'ai_generated', severity: 'high', text: 'paradigm shift in how medical professionals approach', explanation: 'Generic phrasing commonly seen in AI-generated content', confidence: 85 },
        { id: '2', category: 'ai_generated', severity: 'medium', text: 'leverages sophisticated algorithms', explanation: 'Overly formal language pattern typical of LLMs', confidence: 72 },
        { id: '3', category: 'ai_generated', severity: 'medium', text: 'sensitivity and specificity rates that rival', explanation: 'Formulaic structure without specific data', confidence: 68 },
      ] : [
        { id: '1', category: 'self_plagiarism', severity: 'low', text: 'emotional intelligence', explanation: 'Common term - verify not reused from previous submissions', confidence: 25 },
      ],
      flags: {
        ai_generated: hasAiPatterns ? 3 : 0,
        contract_cheating: 0,
        self_plagiarism: hasAiPatterns ? 0 : 1,
        fabrication: 0
      },
      recommendation: hasAiPatterns
        ? "High probability of AI-generated content detected. Recommend requesting revision with authentic student voice and specific examples."
        : "Text appears to be authentic student writing with natural voice and personal reflections."
    });

    setIsChecking(false);
    toast.success("Integrity check complete");
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-500/20 text-red-500';
      case 'medium': return 'bg-yellow-500/20 text-yellow-500';
      default: return 'bg-blue-500/20 text-blue-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-8 w-8" />
            Academic Integrity Check
          </h1>
          <p className="text-muted-foreground">
            Detect AI-generated content, contract cheating, and other integrity issues
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
              <DropdownMenuItem key={index} onClick={() => loadSample(sample)}>
                <FileText className="h-4 w-4 mr-2" />
                {sample.title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Text to Analyze</CardTitle>
            <CardDescription>Paste manuscript text for integrity analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste student manuscript text here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
            />
            <Button onClick={handleCheck} disabled={isChecking || !inputText.trim()} className="w-full">
              {isChecking ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Analyzing...</> : <><Shield className="mr-2 h-4 w-4" />Check Integrity</>}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Shield className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Enter text and click "Check Integrity"</p>
              </div>
            ) : (
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="issues">Issues ({result.issues.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 rounded-lg border">
                        <div className={`text-4xl font-bold ${result.overallScore >= 70 ? 'text-green-500' : result.overallScore >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                          {result.overallScore}%
                        </div>
                        <p className="text-sm text-muted-foreground">Integrity Score</p>
                      </div>
                      <div className="text-center p-4 rounded-lg border">
                        <div className="flex items-center justify-center gap-2">
                          <Sparkles className={`h-6 w-6 ${result.aiProbability > 50 ? 'text-red-500' : 'text-green-500'}`} />
                          <span className={`text-4xl font-bold ${result.aiProbability > 50 ? 'text-red-500' : 'text-green-500'}`}>
                            {result.aiProbability}%
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">AI Probability</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-muted/50">
                      <h4 className="font-medium mb-2">Recommendation</h4>
                      <p className="text-sm">{result.recommendation}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="p-2 bg-red-500/10 rounded text-center">
                        <div className="font-bold">{result.flags.ai_generated}</div>
                        <div className="text-xs text-muted-foreground">AI Generated</div>
                      </div>
                      <div className="p-2 bg-yellow-500/10 rounded text-center">
                        <div className="font-bold">{result.flags.self_plagiarism}</div>
                        <div className="text-xs text-muted-foreground">Self-Plagiarism</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="issues">
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {result.issues.map((issue) => (
                        <div key={issue.id} className="p-3 rounded-lg border">
                          <div className="flex items-center justify-between mb-2">
                            <Badge className={getSeverityColor(issue.severity)}>{issue.severity}</Badge>
                            <span className="text-xs text-muted-foreground">{issue.confidence}% confidence</span>
                          </div>
                          <p className="text-sm font-mono bg-muted p-2 rounded mb-2">"{issue.text}"</p>
                          <p className="text-xs text-muted-foreground">{issue.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
