"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { useAuth } from "./auth-provider";
import { toast } from "sonner";
import { Copy, FilePlus2, HelpCircle, Wand2 } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Label } from "./ui/label";
import { useRouter } from "next/navigation";
import { useAuthReady } from "@/hooks/use-auth-ready";

export function QASimulator() {
  const { session, supabase } = useAuth();
  const { isReady } = useAuthReady();
  const user = session?.user;
  const router = useRouter();
  const [textContent, setTextContent] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const addSampleData = () => {
    // Sample text content for a thesis
    const sampleText = `Chapter 3: Research Methodology

This study employed a mixed-methods approach combining quantitative surveys and qualitative interviews to investigate the impact of social media usage on academic performance among senior high school students in Bukidnon. The quantitative component used a cross-sectional survey design with 320 participants selected through stratified random sampling from five public schools. The qualitative component involved in-depth interviews with 25 selected participants representing different social media usage patterns.

The research instrument consisted of a structured questionnaire adapted from the Digital Behavior Assessment Tool (DBAT), with modifications for the local context. The questionnaire included sections measuring social media usage patterns, academic performance indicators, and potential mediating variables such as time management skills and sleep quality. Content validity was established by three expert judges with a Content Validity Ratio (CVR) of 0.87. Internal consistency yielded a Cronbach's alpha of 0.82.

Data collection occurred over a six-week period in August-September 2024. Quantitative data was analyzed using correlation and regression analysis to determine relationships between variables, while qualitative data was analyzed thematically using Braun and Clarke's six-phase thematic analysis approach. Ethical clearance was obtained from the University Research Ethics Board.`;
    
    setTextContent(sampleText);
    
    // Sample questions that might be asked during defense
    const sampleQuestions = [
      "How does your mixed-methods approach strengthen the validity of your findings compared to a single-method design?",
      "Could you explain your rationale for choosing stratified random sampling over other sampling techniques, and how it addresses potential bias in your study?",
      "How do you ensure the reliability and validity of the Digital Behavior Assessment Tool (DBAT) when adapting it for the Philippine context?",
      "What measures did you take to protect participant privacy given the sensitive nature of social media usage data?",
      "How do your findings align with existing literature on technology's impact on academic performance in Southeast Asian contexts?",
      "What are the limitations of using self-reported data to measure social media usage, and how did you address this concern?",
      "How might your findings differ if you had included students from private schools or other regions in the Philippines?",
      "What ethical considerations were most challenging in your study, particularly regarding digital behavior research?",
      "How do you plan to disseminate these findings to educators and policymakers in the Philippines?",
      "How might gender differences have influenced the relationship between social media usage and academic performance in your sample?"
    ];
    
    setQuestions(sampleQuestions);
    toast.success("Sample defense questions loaded! Practice with these questions based on the sample methodology.");
  };

  const handleGenerate = async () => {
    if (!textContent.trim()) {
      toast.error("Please paste your abstract or a chapter summary first.");
      return;
    }
    
    if (!isReady) {
      toast.error("Please wait while your session is loading...");
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
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
            <div className="flex justify-between items-center">
              <Label htmlFor="summary">Abstract / Chapter Summary</Label>
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