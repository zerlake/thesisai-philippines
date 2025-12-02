"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { useAuth } from "./auth-provider";
import { toast } from "sonner";
import { Copy, FilePlus2, BookOpen, Loader2, Info, RotateCcw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "./ui/alert";
import { callPuterAI } from "@/lib/puter-ai-wrapper";

type AbstractStyle = "academic" | "concise" | "comprehensive" | "descriptive";

interface AbstractResult {
  abstract: string;
  wordCount: number;
  keyPoints: string[];
}

export function AbstractGenerator() {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const router = useRouter();
  const [inputText, setInputText] = useState("");
  const [outputAbstract, setOutputAbstract] = useState("");
  const [style, setStyle] = useState<AbstractStyle>("academic");
  const [wordCountTarget, setWordCountTarget] = useState("200");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [history, setHistory] = useState<Array<{ style: AbstractStyle; abstract: string }>>([]);

  const inputWordCount = inputText.split(/\s+/).filter(Boolean).length;

  const getStyleInstructions = (selectedStyle: AbstractStyle): string => {
    const instructions: Record<AbstractStyle, string> = {
      academic: "Create a formal academic abstract suitable for thesis submission. Use third person, passive voice where appropriate, and maintain scholarly tone.",
      concise: "Generate a brief, punchy abstract (150-200 words) that captures the essence of the work. Use clear, direct language.",
      comprehensive: "Develop a detailed abstract (250-300 words) that thoroughly describes methodology, findings, and implications.",
      descriptive: "Write a descriptive abstract that provides a clear overview of the content, structure, and main arguments without necessarily including results."
    };
    return instructions[selectedStyle];
  };

  const handleGenerateAbstract = async () => {
    if (!inputText.trim()) {
      toast.error("Please enter the thesis content or summary.");
      return;
    }
    if (inputWordCount < 100) {
      toast.error("Please provide at least 100 words of content for abstract generation.");
      return;
    }
    if (!session) {
      toast.error("You must be logged in to use this feature.");
      return;
    }

    setIsLoading(true);
    setOutputAbstract("");

    try {
      const prompt = `${getStyleInstructions(style)}

Generate an abstract of approximately ${wordCountTarget} words based on the following thesis content:

${inputText}

Output ONLY the abstract text. Do not include any explanations or metadata.`;

      const result = await callPuterAI(prompt, {
        temperature: 0.5, // Balanced - structured but with some variation
        max_tokens: Math.min(parseInt(wordCountTarget) * 2, 3000),
        timeout: 30000
      });

      setOutputAbstract(result);
      setHistory([...history, { style, abstract: result }]);
      toast.success("Abstract generated successfully!");
    } catch (error: any) {
      const errorMessage = error.message || "Failed to generate abstract.";
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const addSampleData = () => {
    const sampleText = `This thesis investigates the multifaceted relationship between social media consumption and academic performance among Grade 12 students in selected schools across Region III of the Philippines. The study employs a mixed-methods approach, combining quantitative analysis of academic records with qualitative interviews exploring students' digital habits and their perceived impact on schoolwork.

The research identifies that moderate social media use correlates with enhanced collaborative learning and information access, while excessive consumption (>3 hours daily) significantly predicts lower academic achievement. Key findings reveal that time management skills and parental guidance moderate the relationship between platform use and academic outcomes. The study highlights that platform type matters—educational and professional networks show positive correlations, while entertainment-focused platforms show negative associations.

Results suggest that digital literacy interventions focusing on intentional technology use, boundary setting, and metacognitive awareness of usage patterns can help students leverage social media's benefits while minimizing academic disruption. The thesis concludes with practical recommendations for educators, parents, and policymakers to foster healthier digital citizenship during adolescence.`;

    setInputText(sampleText);
    setOutputAbstract("");
    toast.success("Sample thesis content added! Click 'Generate Abstract' to create an abstract.");
  };

  const handleCopy = () => {
    if (!outputAbstract) return;
    navigator.clipboard.writeText(outputAbstract);
    toast.success("Copied to clipboard!");
  };

  const handleSaveAsDraft = async () => {
    if (!user || !outputAbstract) return;
    setIsSaving(true);

    try {
      const { data: newDoc, error } = await supabase
        .from("documents")
        .insert({
          user_id: user.id,
          title: `Abstract - ${style} Style`,
          content: `<h2>Abstract</h2><p>${outputAbstract.replace(/\n/g, '</p><p>')}</p>`,
        })
        .select("id")
        .single();

      if (error) {
        toast.error("Failed to save draft.");
        console.error(error);
      } else if (newDoc) {
        toast.success("Saved as a new draft!");
        router.push(`/drafts/${newDoc.id}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleUndo = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setOutputAbstract(prev.abstract);
      setStyle(prev.style);
      setHistory(history.slice(0, -1));
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Thesis Abstract Generator
              </CardTitle>
              <CardDescription>
                Create compelling, well-structured abstracts for your thesis. Choose your style and generate summaries in seconds.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Style and Word Count Selection */}
          <div className="grid md:grid-cols-2 gap-4 bg-muted p-4 rounded-lg">
            <div className="space-y-2">
              <label className="text-sm font-medium">Abstract Style</label>
              <Select value={style} onValueChange={(v) => setStyle(v as AbstractStyle)} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="academic">
                    <span>📚 Academic (Formal, Scholarly)</span>
                  </SelectItem>
                  <SelectItem value="concise">
                    <span>⚡ Concise (Brief, Clear)</span>
                  </SelectItem>
                  <SelectItem value="comprehensive">
                    <span>📖 Comprehensive (Detailed)</span>
                  </SelectItem>
                  <SelectItem value="descriptive">
                    <span>✍️ Descriptive (Narrative)</span>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {style === 'academic' && 'Formal academic tone, suitable for thesis submission.'}
                {style === 'concise' && 'Brief and punchy, captures the essence.'}
                {style === 'comprehensive' && 'Detailed overview including methodology and implications.'}
                {style === 'descriptive' && 'Clear narrative description of content and arguments.'}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Target Word Count</label>
              <Select value={wordCountTarget} onValueChange={setWordCountTarget} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select word count" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="150">150 words (Brief)</SelectItem>
                  <SelectItem value="200">200 words (Standard)</SelectItem>
                  <SelectItem value="250">250 words (Detailed)</SelectItem>
                  <SelectItem value="300">300 words (Comprehensive)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Approximate target length for the abstract
              </p>
            </div>
          </div>

          {/* Input and Output */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Thesis Content / Summary</label>
                <Button type="button" variant="outline" size="sm" onClick={addSampleData}>
                  Add Sample
                </Button>
              </div>
              <Textarea
                placeholder="Paste your thesis introduction, summary, or full content here..."
                className="min-h-[350px] resize-none"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                {inputWordCount} words (minimum 100 required)
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Generated Abstract</label>
                {outputAbstract && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSaveAsDraft}
                      disabled={isSaving}
                      title="Save as draft"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <FilePlus2 className="w-4 h-4" />}
                    </Button>
                  </div>
                )}
              </div>
              <Textarea
                placeholder="Your generated abstract will appear here..."
                className="min-h-[350px] resize-none"
                value={outputAbstract}
                readOnly
              />
              <p className="text-xs text-muted-foreground">
                {outputAbstract.split(/\s+/).filter(Boolean).length} words
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleGenerateAbstract}
              disabled={isLoading || inputWordCount < 100}
              size="lg"
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4" />
                  Generate Abstract
                </>
              )}
            </Button>
            {history.length > 0 && (
              <Button
                variant="outline"
                onClick={handleUndo}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Undo
              </Button>
            )}
          </div>

          {isLoading && (
            <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-blue-700 dark:text-blue-300">
                Generating your abstract with AI... This usually takes 5-15 seconds.
              </AlertDescription>
            </Alert>
          )}

          {/* Tips */}
          {!outputAbstract && (
            <Alert className="bg-green-50 dark:bg-green-950 border-green-200">
              <Info className="h-4 w-4 text-green-700 dark:text-green-300" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                <strong>Tips:</strong> Paste your thesis introduction or full content. The abstract generator will distill the key information into a concise, well-structured summary. Different styles work better for different contexts—experiment to find the best fit for your submission.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
