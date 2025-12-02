"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { useAuth } from "./auth-provider";
import { toast } from "sonner";
import { Copy, Wand2 } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Label } from "./ui/label";
import { useAuthReady } from "@/hooks/use-auth-ready";
import { callPuterAI } from "@/lib/puter-ai-wrapper";

export function TitleGenerator() {
  const { session } = useAuth();
  const { isReady } = useAuthReady();
  const [summary, setSummary] = useState("");
  const [titles, setTitles] = useState<string[]>([]);

  const sampleSummaries = [
    `This research investigates the effectiveness of AI-powered personalized learning systems in improving student engagement and academic performance in undergraduate computer science courses. A mixed-methods approach was used, combining quantitative data from student grades and platform analytics with qualitative data from student surveys and focus groups. Preliminary results indicate a significant increase in student engagement and a moderate improvement in academic performance among students utilizing the AI system compared to a control group. The study also identifies key features of the AI system perceived as most beneficial by students, such as adaptive feedback and customized learning paths.`,
    `A study on the psychological impact of remote work on employee well-being in the technology sector. The research explores factors such as work-life balance, social isolation, and perceived productivity among remote employees. Data was collected through a large-scale online survey distributed across various tech companies globally. Findings reveal a complex relationship where increased flexibility is often offset by challenges in maintaining social connections and setting boundaries between professional and personal life. The study proposes recommendations for organizations to foster a healthier remote work environment.`,
    `An examination of sustainable agricultural practices in developing countries, focusing on their economic viability and environmental benefits. This research synthesizes existing literature and presents case studies from Southeast Asia. Key practices analyzed include agroforestry, organic farming, and water conservation techniques. The findings suggest that while initial adoption of sustainable methods may require upfront investment, they consistently lead to long-term economic resilience for farmers and significant ecological improvements, such as enhanced biodiversity and soil health. Policy implications for supporting such transitions are discussed.`,
  ];

  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    const trimmedSummary = summary.trim();

    if (!trimmedSummary) {
      toast.error("Please enter a summary or abstract first.");
      return;
    }

    if (trimmedSummary.length < 50) {
      toast.error("Summary must be at least 50 characters long. Please provide a more detailed summary.");
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

    setTitles([]);
    setIsGenerating(true);

    try {
      const prompt = `You are an expert academic thesis title generator. Analyze the following research summary and generate exactly 5 unique, professional, and specific academic thesis titles.

  Research Summary:
  ${trimmedSummary}

  Requirements:
  - Each title must be 8-15 words long
  - Titles must be clear, specific, and directly related to the research
  - Use professional academic language
  - Titles should capture the main research focus, methodology, and/or findings
  - Return ONLY the 5 titles, one per line, without numbering, bullets, or explanations
  - Each title should be different in structure and emphasis

  Generate the titles now:`;

      const result = await callPuterAI(prompt, {
        temperature: 0.8,
        max_tokens: 500,
        timeout: 30000,
      });

      // Parse the result into individual titles
      const generatedTitles = result
        .split('\n')
        .map((line: string) => line.trim())
        .filter((line: string) => line.length > 8 && line.length < 200)
        .slice(0, 5);

      if (generatedTitles.length === 0) {
        toast.error("Failed to generate titles. Please try again.");
        return;
      }

      setTitles(generatedTitles);
      toast.success(`Generated ${generatedTitles.length} titles successfully!`);
    } catch (error: any) {
      console.error("Title generation error:", error);
      const message = error?.message || "Failed to generate titles. Please try again.";
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLoadSampleData = () => {
    let newSample = sampleSummaries[Math.floor(Math.random() * sampleSummaries.length)];
    while (newSample === summary && sampleSummaries.length > 1) {
      newSample = sampleSummaries[Math.floor(Math.random() * sampleSummaries.length)];
    }
    setSummary(newSample);
    setTitles([]); // Clear previous titles
  };

  const handleCopy = (title: string) => {
    navigator.clipboard.writeText(title);
    toast.success("Title copied to clipboard!");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Title Generator</CardTitle>
          <CardDescription>
            Paste your abstract or summary to generate creative and academic title suggestions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="summary">Abstract / Summary</Label>
            <Textarea
              id="summary"
              placeholder="Paste your text here..."
              className="min-h-[200px] resize-y"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleGenerate} disabled={isGenerating}>
              <Wand2 className="w-4 h-4 mr-2" />
              {isGenerating ? "Generating..." : "Generate Titles"}
            </Button>
            <Button variant="outline" onClick={handleLoadSampleData} disabled={isGenerating}>
              Load Sample Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {(isGenerating || titles.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Titles</CardTitle>
          </CardHeader>
          <CardContent>
            {isGenerating ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-11/12" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <div className="space-y-3">
                {titles.map((title, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-md border bg-tertiary">
                    <p className="font-medium flex-1">{title}</p>
                    <Button variant="ghost" size="icon" onClick={() => handleCopy(title)}>
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