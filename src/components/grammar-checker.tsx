"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { useAuth } from "./auth-provider";
import { toast } from "sonner";
import { AlertTriangle, Loader2, Sparkles } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Separator } from "./ui/separator";
import { Alert, AlertDescription } from "./ui/alert";

type ScoreResults = {
  focus: number;
  development: number;
  audience: number;
  cohesion: number;
  languageAndStyle: number;
  overall: number;
};

type AnalysisResult = {
  scores: ScoreResults;
  writingStrength: string;
};

const MINIMUM_WORD_COUNT = 25;

export function GrammarChecker() {
  const { session, supabase } = useAuth();
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<AnalysisResult | null>(null);

  const wordCount = inputText.split(/\s+/).filter(Boolean).length;

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
      const { data, error: functionError } = await supabase.functions.invoke('grammar-check', {
        body: { text: inputText }
      });
      
      if (functionError) throw new Error(functionError.message);
      if (data.error) throw new Error(data.error);

      setResults(data);
      toast.success("Analysis complete!");

    } catch (err: any) {
      const errorMessage = err.message || 'An unknown error occurred.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const scoreItems = results ? [
    { label: "Focus", value: results.scores.focus },
    { label: "Development", value: results.scores.development },
    { label: "Audience", value: results.scores.audience },
    { label: "Cohesion", value: results.scores.cohesion },
    { label: "Language and style", value: results.scores.languageAndStyle },
  ] : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Grammar & Writing Check</CardTitle>
          <CardDescription>
            Get AI-powered feedback on your writing's focus, development, cohesion, and more.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
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
        <Card>
          <CardHeader>
            <CardTitle>Your Feedback</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-[250px_1fr] gap-8">
            <Card className="p-4 bg-muted/50">
              <div className="flex justify-between items-baseline mb-2">
                <p className="font-bold">Overall</p>
                <p className="text-2xl font-bold">{results.scores.overall.toFixed(1)}</p>
              </div>
              <Separator />
              <div className="space-y-2 mt-4">
                {scoreItems.map(item => (
                  <div key={item.label} className="flex justify-between text-sm">
                    <p>{item.label}</p>
                    <p className="font-medium">{item.value.toFixed(1)}/5</p>
                  </div>
                ))}
              </div>
            </Card>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">Writing Strength</h4>
                <p className="text-muted-foreground">{results.writingStrength}</p>
              </div>
              <div>
                <h4 className="font-semibold">Next Steps</h4>
                <p className="text-muted-foreground">
                  Consider using the AI tools in the editor to improve specific sections. Highlight text to get suggestions for improving, summarizing, or rewriting.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}