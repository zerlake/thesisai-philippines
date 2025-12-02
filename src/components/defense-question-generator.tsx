"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { useAuth } from "./auth-provider";
import { toast } from "sonner";
import { Download, Loader2, Zap, FilePlus2, Copy } from "lucide-react";
import { callPuterAI } from "@/lib/puter-ai-wrapper";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "./ui/alert";
import { Info } from "lucide-react";
import { Badge } from "./ui/badge";

interface DefenseQuestion {
  question: string;
  category: "methodology" | "findings" | "implications" | "limitations" | "critique";
  difficulty: "moderate" | "challenging" | "expert";
  answerFramework: string;
}

interface DefenseQuestionSet {
  questions: DefenseQuestion[];
  metadata: {
    generatedAt: string;
    questionCount: number;
    thesisTopic: string;
  };
}

const categoryColors: Record<DefenseQuestion["category"], string> = {
  methodology: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100",
  findings: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100",
  implications: "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100",
  limitations: "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-100",
  critique: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100"
};

const difficultyColors: Record<DefenseQuestion["difficulty"], string> = {
  moderate: "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100",
  challenging: "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-100",
  expert: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100"
};

export function DefenseQuestionGenerator() {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const router = useRouter();
  const [inputText, setInputText] = useState("");
  const [generatedQuestions, setGeneratedQuestions] = useState<DefenseQuestionSet | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleGenerateQuestions = async () => {
    if (!inputText.trim()) {
      toast.error("Please provide your thesis abstract or summary.");
      return;
    }
    if (!session) {
      toast.error("You must be logged in to use this feature.");
      return;
    }

    setIsLoading(true);

    try {
      const prompt = `You are an experienced thesis committee member preparing challenging defense questions.

Generate tough, probing defense questions for this thesis:

${inputText}

Create 8-12 questions that a thesis committee would ask to:
- Challenge the methodology and research design
- Probe the validity of findings and conclusions
- Test understanding of contributions and implications
- Explore limitations and alternative approaches
- Assess the candidate's mastery of the subject

Requirements for each question:
- Question: Specific, probing, requires thoughtful answer (1-2 sentences)
- Category: One of - methodology, findings, implications, limitations, critique
- Difficulty: One of - moderate, challenging, expert
- AnswerFramework: 2-3 bullet points suggesting answer approach

Mix difficulty levels:
- Moderate (40%): Requires good understanding
- Challenging (40%): Requires deep analysis
- Expert (20%): Requires synthesis and critical thinking

Ensure questions cover different aspects:
- Research design and methodology
- Validity of findings
- Practical/theoretical implications
- Limitations and future work
- Broader context and significance

Output ONLY valid JSON array with structure:
[
  {
    "question": "string",
    "category": "methodology|findings|implications|limitations|critique",
    "difficulty": "moderate|challenging|expert",
    "answerFramework": "string with bullet points"
  }
]

Generate the questions now.`;

      const result = await callPuterAI(prompt, {
        temperature: 0.6, // Creative, challenging questions
        max_tokens: 3500,
        timeout: 30000
      });

      // Handle markdown code blocks if present
      let cleanedResult = result;
      if (result.includes("```")) {
        cleanedResult = result.replace(/```json\n?|\n?```/g, "").trim();
      }

      const parsed: DefenseQuestion[] = JSON.parse(cleanedResult);

      // Validate parsed data
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error("Invalid question format received");
      }

      // Extract topic from input
      const lines = inputText.split("\n").filter(l => l.trim());
      const thesisTopic = lines[0].substring(0, 100); // First line as topic

      setGeneratedQuestions({
        questions: parsed,
        metadata: {
          generatedAt: new Date().toISOString(),
          questionCount: parsed.length,
          thesisTopic
        }
      });

      toast.success(`Generated ${parsed.length} defense questions successfully!`);
    } catch (error: any) {
      const errorMessage = error.message || "Failed to generate defense questions.";
      toast.error(errorMessage);
      console.error("Question generation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addSampleData = () => {
    const sampleContent = `The Impact of Social Media Usage on Academic Performance of Senior High School Students in the Philippines

This mixed-methods study investigated the relationship between social media consumption patterns and academic achievement among Grade 12 students in Region III. The quantitative phase surveyed 500 students across 15 schools using validated instruments measuring social media use, time management, academic self-efficacy, and GPA.

Key findings revealed a curvilinear relationship: moderate social media use (1-2 hours daily) correlated with higher academic performance (r = 0.34, p < .01), while excessive use (>3 hours daily) significantly predicted lower grades (β = -0.52, p < .001). Time management skills emerged as a significant moderator of this relationship.

The qualitative phase involved 30 semi-structured interviews revealing how students navigated social media use alongside academic responsibilities. Thematic analysis identified adaptive strategies (scheduled use, platform curation) versus maladaptive patterns (distraction, procrastination).

Implications include educational interventions focused on digital literacy and intentional technology use rather than abstinence. Limitations include self-reported data and cross-sectional design limiting causal inference.`;

    setInputText(sampleContent);
    setGeneratedQuestions(null);
    toast.success("Sample thesis summary added! Click 'Generate Defense Questions' to create challenging questions.");
  };

  const handleSaveQuestions = async () => {
    if (!user || !generatedQuestions) return;
    setIsSaving(true);

    try {
      const { data: newDoc, error } = await supabase
        .from("documents")
        .insert({
          user_id: user.id,
          title: `Defense Questions: ${generatedQuestions.metadata.thesisTopic}`,
          content: `<h2>Defense Questions</h2>
<p>Topic: ${generatedQuestions.metadata.thesisTopic}</p>
<p>Generated: ${new Date(generatedQuestions.metadata.generatedAt).toLocaleDateString()}</p>
<p>Total Questions: ${generatedQuestions.metadata.questionCount}</p>
<hr/>
${generatedQuestions.questions.map((q, i) => `
<div style="page-break-inside: avoid; margin-bottom: 25px; border-left: 4px solid #3b82f6; padding-left: 15px;">
  <p><strong>Question ${i + 1} [${q.category.toUpperCase()}] - ${q.difficulty.toUpperCase()}</strong></p>
  <p><strong>Q:</strong> ${q.question}</p>
  <p><strong>Answer Framework:</strong></p>
  <p style="white-space: pre-wrap; font-family: monospace; background: #f5f5f5; padding: 10px; border-radius: 5px;">${q.answerFramework}</p>
</div>
`).join("")}`,
        })
        .select("id")
        .single();

      if (error) {
        toast.error("Failed to save questions.");
        console.error(error);
      } else if (newDoc) {
        toast.success("Defense questions saved as document!");
        router.push(`/drafts/${newDoc.id}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportJSON = () => {
    if (!generatedQuestions) return;

    const dataStr = JSON.stringify(generatedQuestions, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `defense-questions-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Defense questions exported as JSON!");
  };

  const handleCopyQuestions = () => {
    if (!generatedQuestions) return;

    const text = generatedQuestions.questions
      .map(
        (q, i) =>
          `Q${i + 1} [${q.category}] (${q.difficulty})\n${q.question}\n\nAnswer Framework:\n${q.answerFramework}`
      )
      .join("\n\n---\n\n");

    navigator.clipboard.writeText(text);
    toast.success("Defense questions copied to clipboard!");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Defense Question Generator
              </CardTitle>
              <CardDescription>
                Generate challenging questions a thesis committee would ask. Practice your defense with AI-powered questions covering methodology, findings, implications, and critiques.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Content Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Thesis Abstract/Summary</label>
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
              placeholder="Paste your thesis abstract, summary, or full thesis content here. The more detailed, the better the questions."
              className="min-h-[350px] resize-none"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              {inputText.split(/\s+/).filter(Boolean).length} words
            </p>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerateQuestions}
            disabled={isLoading || !inputText.trim()}
            size="lg"
            className="w-full gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Defense Questions...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Generate Defense Questions
              </>
            )}
          </Button>

          {isLoading && (
            <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-blue-700 dark:text-blue-300">
                Creating challenging defense questions with AI... This usually takes 5-15 seconds.
              </AlertDescription>
            </Alert>
          )}

          {/* Tips */}
          {!generatedQuestions && !isLoading && (
            <Alert className="bg-green-50 dark:bg-green-950 border-green-200">
              <Info className="h-4 w-4 text-green-700 dark:text-green-300" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                <strong>Tips:</strong> Provide your full thesis abstract or summary for the most relevant questions. Questions will cover methodology, findings, implications, limitations, and scholarly critique. Use these to practice before your defense!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Generated Questions Display */}
      {generatedQuestions && (
        <>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Generated Defense Questions</CardTitle>
                  <CardDescription>
                    {generatedQuestions.metadata.questionCount} challenging questions to prepare for your thesis defense
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleSaveQuestions}
                  disabled={isSaving}
                  className="gap-2"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FilePlus2 className="w-4 h-4" />
                  )}
                  Save as Document
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCopyQuestions}
                  className="gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Copy All
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExportJSON}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export JSON
                </Button>
              </div>

              {/* Questions Grid */}
              <div className="grid gap-4">
                {generatedQuestions.questions.map((question, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="mb-3 flex items-center justify-between flex-wrap gap-2">
                      <p className="text-sm font-semibold">Question {index + 1}</p>
                      <div className="flex gap-2">
                        <Badge className={categoryColors[question.category]}>
                          {question.category}
                        </Badge>
                        <Badge className={difficultyColors[question.difficulty]}>
                          {question.difficulty}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {question.question}
                        </p>
                      </div>

                      <div className="bg-muted/50 rounded p-3 border-l-2 border-muted">
                        <p className="text-xs font-semibold text-muted-foreground mb-2">
                          SUGGESTED ANSWER APPROACH:
                        </p>
                        <p className="text-sm text-foreground whitespace-pre-wrap">
                          {question.answerFramework}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Stats */}
              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">{generatedQuestions.metadata.questionCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Moderate</p>
                    <p className="text-lg font-bold">
                      {generatedQuestions.questions.filter(q => q.difficulty === "moderate").length}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Challenging</p>
                    <p className="text-lg font-bold">
                      {generatedQuestions.questions.filter(q => q.difficulty === "challenging").length}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Expert</p>
                    <p className="text-lg font-bold">
                      {generatedQuestions.questions.filter(q => q.difficulty === "expert").length}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Generated</p>
                    <p className="text-sm mt-2">
                      {new Date(generatedQuestions.metadata.generatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
