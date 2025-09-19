"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { useAuth } from "./auth-provider";
import { toast } from "sonner";
import { Copy, FilePlus2, HelpCircle, Loader2, Wand2 } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Label } from "./ui/label";
import { useRouter } from "next/navigation";

export function QASimulator() {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const router = useRouter();
  const [textContent, setTextContent] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleGenerate = async () => {
    if (!textContent.trim()) {
      toast.error("Please paste your abstract or a chapter summary first.");
      return;
    }
    if (!session) {
      toast.error("You must be logged in to use this feature.");
      return;
    }

    setIsLoading(true);
    setQuestions([]);

    try {
      const response = await fetch(
        "https://dnyjgzzfyzrsucucexhy.supabase.co/functions/v1/generate-defense-questions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRueWpnenpmeXpyc3VjdWNleGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NDAxMjcsImV4cCI6MjA3MzAxNjEyN30.elZ6r3JJjdwGUadSzQ1Br5EdGeqZIEr67Z5QB_Q3eMw",
          },
          body: JSON.stringify({ textContent }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to generate questions.");

      setQuestions(data.questions || []);
      toast.success("Potential defense questions generated!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleSaveAsDraft = async () => {
    if (!user || questions.length === 0) return;
    setIsSaving(true);

    let content = `<h1>Potential Defense Questions</h1><h2>Source Text:</h2><p><em>${textContent}</em></p><hr><h2>Generated Questions:</h2><ol>`;
    questions.forEach(q => {
      content += `<li>${q}</li>`;
    });
    content += `</ol>`;

    const { data: newDoc, error } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        title: "Defense Q&A Practice",
        content: content,
      })
      .select("id")
      .single();

    if (error) {
      toast.error("Failed to save draft.");
    } else if (newDoc) {
      toast.success("Q&A practice saved as a new draft!");
      router.push(`/drafts/${newDoc.id}`);
    }
    setIsSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Defense Q&A Simulator</CardTitle>
          <CardDescription>
            Paste your abstract or a chapter summary to generate potential questions from a defense panel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="summary">Abstract / Chapter Summary</Label>
            <Textarea
              id="summary"
              placeholder="Paste your text here..."
              className="min-h-[200px] resize-y"
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
            />
          </div>
          <Button onClick={handleGenerate} disabled={isLoading}>
            <Wand2 className="w-4 h-4 mr-2" />
            {isLoading ? "Generating..." : "Generate Questions"}
          </Button>
        </CardContent>
      </Card>

      {(isLoading || questions.length > 0) && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Generated Questions</CardTitle>
              {questions.length > 0 && !isLoading && (
                <Button variant="outline" size="sm" onClick={handleSaveAsDraft} disabled={isSaving}>
                  <FilePlus2 className="w-4 h-4 mr-2" />
                  {isSaving ? "Saving..." : "Save as Draft"}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-11/12" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <div className="space-y-3">
                {questions.map((question, index) => (
                  <div key={index} className="flex items-start justify-between gap-2 p-3 rounded-md border bg-tertiary">
                    <div className="flex items-start gap-3">
                      <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                      <p className="font-medium flex-1">{question}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleCopy(question)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}