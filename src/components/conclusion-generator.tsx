"use client";

import { useState } from "react";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Copy, FilePlus2, Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "./auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useRouter } from "next/navigation";

type ConclusionResult = {
  summary: string;
  conclusion: string;
  recommendations: string;
};

export function ConclusionGenerator() {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const router = useRouter();
  const [findings, setFindings] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [results, setResults] = useState<ConclusionResult | null>(null);

  const handleGenerate = async () => {
    if (!session) {
      toast.error("You must be logged in to use this feature.");
      return;
    }
    setIsLoading(true);
    setResults(null);
    try {
      const { data, error } = await supabase.functions.invoke('generate-conclusion', {
        body: { findings },
      });
      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);
      setResults(data);
      toast.success("Conclusion sections generated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate conclusion.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleSaveAsDraft = async () => {
    if (!user || !results) return;
    setIsSaving(true);

    const content = `
      <h2>Summary of Findings</h2>
      <p>${results.summary}</p>
      <h2>Conclusion</h2>
      <p>${results.conclusion}</p>
      <h2>Recommendations</h2>
      <p>${results.recommendations.replace(/\n/g, '<br>')}</p>
    `;

    const { data: newDoc, error } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        title: "Generated Chapter V Draft",
        content: content,
      })
      .select("id")
      .single();

    if (error) {
      toast.error("Failed to save draft.");
    } else if (newDoc) {
      toast.success("Draft saved successfully!");
      router.push(`/drafts/${newDoc.id}`);
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="findings">
          Summarize your key findings from Chapter IV
        </Label>
        <Textarea
          id="findings"
          placeholder="e.g., The study found a significant positive correlation between study hours and exam scores. 75% of students reported using AI tools for research..."
          value={findings}
          onChange={(e) => setFindings(e.target.value)}
          rows={5}
        />
      </div>
      <Button onClick={handleGenerate} disabled={!findings || isLoading}>
        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
        {isLoading ? "Generating..." : "Generate Conclusion Sections"}
      </Button>

      {results && (
        <Card className="mt-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Generated Chapter V</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={handleSaveAsDraft} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FilePlus2 className="w-4 h-4 mr-2" />}
              Save as Draft
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">Summary of Findings</h4>
                <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard(results.summary)}><Copy className="w-4 h-4" /></Button>
              </div>
              <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md">{results.summary}</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">Conclusion</h4>
                <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard(results.conclusion)}><Copy className="w-4 h-4" /></Button>
              </div>
              <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md">{results.conclusion}</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">Recommendations</h4>
                <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard(results.recommendations)}><Copy className="w-4 h-4" /></Button>
              </div>
              <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md whitespace-pre-wrap">{results.recommendations}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}