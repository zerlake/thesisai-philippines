"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { useAuth } from "./auth-provider";
import { toast } from "sonner";
import { Download, Loader2, Sparkles, FilePlus2, Copy } from "lucide-react";
import { callPuterAI } from "@/lib/puter-ai-wrapper";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "./ui/alert";
import { Info } from "lucide-react";

interface Flashcard {
  question: string;
  answer: string;
  type: "definition" | "explanation" | "application" | "example";
}

interface FlashcardSet {
  cards: Flashcard[];
  metadata: {
    generatedAt: string;
    cardCount: number;
    topic: string;
  };
}

export function FlashcardGenerator() {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const router = useRouter();
  const [inputText, setInputText] = useState("");
  const [topic, setTopic] = useState("");
  const [generatedCards, setGeneratedCards] = useState<FlashcardSet | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleGenerateFlashcards = async () => {
    if (!inputText.trim()) {
      toast.error("Please provide thesis content or summary.");
      return;
    }
    if (!topic.trim()) {
      toast.error("Please enter a topic for the flashcards.");
      return;
    }
    if (!session) {
      toast.error("You must be logged in to use this feature.");
      return;
    }

    setIsLoading(true);

    try {
      const prompt = `You are an expert educator creating flashcards for thesis study.

Generate flashcard pairs based on this thesis content for the topic: "${topic}"

Content:
${inputText}

Create 10-15 flashcards with these requirements:
- Question: Clear, specific, testable (no more than 2 sentences)
- Answer: Concise but complete (2-3 sentences max)
- Type: One of: definition, explanation, application, example

Mix the types:
- Definition: "What is X?" or "Define X"
- Explanation: "Why/How does X work?" or "Explain X"
- Application: "How would you use X in practice?"
- Example: "Give an example of X"

Make questions that are suitable for studying and exam preparation.
Focus on key concepts, methodology, findings, and implications from the thesis.

Output ONLY a valid JSON array with structure:
[
  {
    "question": "string",
    "answer": "string",
    "type": "definition|explanation|application|example"
  }
]

Generate the flashcards now.`;

      const result = await callPuterAI(prompt, {
        temperature: 0.4, // Balanced Q&A generation
        max_tokens: 3000,
        timeout: 30000
      });

      // Handle markdown code blocks if present
      let cleanedResult = result;
      if (result.includes("```")) {
        cleanedResult = result.replace(/```json\n?|\n?```/g, "").trim();
      }

      const parsed: Flashcard[] = JSON.parse(cleanedResult);

      // Validate parsed data
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error("Invalid flashcard format received");
      }

      setGeneratedCards({
        cards: parsed,
        metadata: {
          generatedAt: new Date().toISOString(),
          cardCount: parsed.length,
          topic
        }
      });

      toast.success(`Generated ${parsed.length} flashcards successfully!`);
    } catch (error: any) {
      const errorMessage = error.message || "Failed to generate flashcards.";
      toast.error(errorMessage);
      console.error("Flashcard generation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addSampleData = () => {
    const sampleTopic = "Thesis Research Methodology";
    const sampleContent = `This thesis investigates the impact of social media on academic performance. The study employs a mixed-methods approach combining quantitative surveys with qualitative interviews. 

Quantitative Phase:
- 500 Grade 12 students across 15 schools
- Validated scales for measuring social media usage, time management, and academic performance
- Statistical analysis using SPSS with multiple regression

Qualitative Phase:
- 30 semi-structured interviews with students showing high/low social media use
- Thematic analysis identifying patterns in behavior and academic outcomes
- Member checking for validity

Key Findings:
- Moderate social media use (1-2 hours daily) correlated with better academic performance
- Excessive use (>3 hours daily) significantly predicted lower grades
- Time management skills moderated the relationship
- Educational platforms showed positive associations, entertainment platforms negative

Methodology Strengths:
- Mixed methods provided comprehensive understanding
- Large sample size for quantitative phase
- Purposive sampling ensured diverse qualitative perspectives
- Multiple validation strategies employed

Limitations:
- Self-reported data subject to social desirability bias
- Cross-sectional design limits causal inference
- Limited to one region in Philippines
- Cannot generalize to all digital natives`;

    setTopic(sampleTopic);
    setInputText(sampleContent);
    setGeneratedCards(null);
    toast.success("Sample data added! Click 'Generate Flashcards' to create study cards.");
  };

  const handleSaveFlashcards = async () => {
    if (!user || !generatedCards) return;
    setIsSaving(true);

    try {
      const { data: newDoc, error } = await supabase
        .from("documents")
        .insert({
          user_id: user.id,
          title: `Flashcards: ${generatedCards.metadata.topic}`,
          content: `<h2>Flashcard Set: ${generatedCards.metadata.topic}</h2>
<p>Generated: ${new Date(generatedCards.metadata.generatedAt).toLocaleDateString()}</p>
<p>Total Cards: ${generatedCards.metadata.cardCount}</p>
<hr/>
${generatedCards.cards.map((card, i) => `
<div style="page-break-inside: avoid; margin-bottom: 20px; border: 1px solid #ddd; padding: 15px; border-radius: 5px;">
  <p><strong>Card ${i + 1} [${card.type.toUpperCase()}]</strong></p>
  <p><strong>Q:</strong> ${card.question}</p>
  <p><strong>A:</strong> ${card.answer}</p>
</div>
`).join("")}`,
        })
        .select("id")
        .single();

      if (error) {
        toast.error("Failed to save flashcards.");
        console.error(error);
      } else if (newDoc) {
        toast.success("Flashcards saved as document!");
        router.push(`/drafts/${newDoc.id}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportJSON = () => {
    if (!generatedCards) return;

    const dataStr = JSON.stringify(generatedCards, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `flashcards-${generatedCards.metadata.topic.replace(/\s+/g, "-")}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Flashcards exported as JSON!");
  };

  const handleExportCSV = () => {
    if (!generatedCards) return;

    const csvHeader = "Question,Answer,Type\n";
    const csvData = generatedCards.cards
      .map(card =>
        `"${card.question.replace(/"/g, '""')}","${card.answer.replace(/"/g, '""')}","${card.type}"`
      )
      .join("\n");

    const csv = csvHeader + csvData;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `flashcards-${generatedCards.metadata.topic.replace(/\s+/g, "-")}-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Flashcards exported as CSV!");
  };

  const handleCopyFlashcards = () => {
    if (!generatedCards) return;

    const text = generatedCards.cards
      .map((card, i) => `Card ${i + 1} [${card.type}]\nQ: ${card.question}\nA: ${card.answer}`)
      .join("\n\n---\n\n");

    navigator.clipboard.writeText(text);
    toast.success("Flashcards copied to clipboard!");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                AI Flashcard Generator
              </CardTitle>
              <CardDescription>
                Create comprehensive flashcard sets from your thesis content. Perfect for studying and exam preparation.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Topic Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Topic/Chapter</label>
            <input
              type="text"
              placeholder="e.g., Thesis Methodology, Research Findings, Literature Review"
              className="w-full px-3 py-2 border rounded-md border-input bg-background"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              What topic or chapter are these flashcards for?
            </p>
          </div>

          {/* Content Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Thesis Content</label>
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
              placeholder="Paste your thesis content, chapter summary, or research notes here..."
              className="min-h-[300px] resize-none"
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
            onClick={handleGenerateFlashcards}
            disabled={isLoading || !inputText.trim() || !topic.trim()}
            size="lg"
            className="w-full gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Flashcards...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Flashcards
              </>
            )}
          </Button>

          {isLoading && (
            <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-blue-700 dark:text-blue-300">
                Creating flashcard pairs with AI... This usually takes 5-15 seconds.
              </AlertDescription>
            </Alert>
          )}

          {/* Tips */}
          {!generatedCards && !isLoading && (
            <Alert className="bg-green-50 dark:bg-green-950 border-green-200">
              <Info className="h-4 w-4 text-green-700 dark:text-green-300" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                <strong>Tips:</strong> For best results, provide substantial content (500+ words). The AI will generate definition, explanation, application, and example-type questions suitable for studying.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Generated Flashcards Display */}
      {generatedCards && (
        <>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Generated Flashcards</CardTitle>
                  <CardDescription>
                    {generatedCards.metadata.cardCount} cards generated for "{generatedCards.metadata.topic}"
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleSaveFlashcards}
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
                  onClick={handleCopyFlashcards}
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
                <Button
                  variant="outline"
                  onClick={handleExportCSV}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </Button>
              </div>

              {/* Flashcards Grid */}
              <div className="grid gap-4">
                {generatedCards.cards.map((card, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <p className="text-xs font-semibold text-muted-foreground uppercase">
                        Card {index + 1} • {card.type}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Question:</p>
                        <p className="text-sm font-medium">{card.question}</p>
                      </div>

                      <div className="border-t pt-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Answer:</p>
                        <p className="text-sm text-foreground/90">{card.answer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary Stats */}
              <div className="pt-4 border-t">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Cards</p>
                    <p className="text-2xl font-bold">{generatedCards.metadata.cardCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Card Types</p>
                    <p className="text-sm mt-2">
                      <span className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-2 py-1 rounded text-xs mr-2">
                        {generatedCards.cards.filter(c => c.type === "definition").length} Definition
                      </span>
                      <span className="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-2 py-1 rounded text-xs">
                        {generatedCards.cards.filter(c => c.type === "explanation").length} Explanation
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Generated</p>
                    <p className="text-sm mt-2">
                      {new Date(generatedCards.metadata.generatedAt).toLocaleDateString()}
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
