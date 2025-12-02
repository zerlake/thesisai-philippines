"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { useAuth } from "./auth-provider";
import { toast } from "sonner";
import { Download, Loader2, BookMarked, FilePlus2, Copy } from "lucide-react";
import { callPuterAI } from "@/lib/puter-ai-wrapper";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "./ui/alert";
import { Info } from "lucide-react";

interface StudyGuideSection {
  title: string;
  content: string;
  keyPoints: string[];
  reviewQuestions: string[];
}

interface StudyGuide {
  title: string;
  executive_summary: string;
  sections: StudyGuideSection[];
  key_terms: Array<{ term: string; definition: string }>;
  study_tips: string[];
  important_citations: string[];
  metadata: {
    generatedAt: string;
    sectionCount: number;
    estimatedReadTime: number;
  };
}

export function StudyGuideGenerator() {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const router = useRouter();
  const [inputText, setInputText] = useState("");
  const [guideTitle, setGuideTitle] = useState("");
  const [generatedGuide, setGeneratedGuide] = useState<StudyGuide | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleGenerateGuide = async () => {
    if (!inputText.trim()) {
      toast.error("Please provide thesis content or summary.");
      return;
    }
    if (!guideTitle.trim()) {
      toast.error("Please enter a title for the study guide.");
      return;
    }
    if (!session) {
      toast.error("You must be logged in to use this feature.");
      return;
    }

    setIsLoading(true);

    try {
      const prompt = `You are an expert educator creating a comprehensive study guide for thesis preparation.

Create a detailed study guide titled: "${guideTitle}"

Based on this thesis content:
${inputText}

Structure the guide with the following components:

1. EXECUTIVE SUMMARY (2-3 paragraphs):
   - Overview of the thesis
   - Main problem/question
   - Key findings or contributions

2. MAIN SECTIONS (3-5 sections):
   For each section:
   - Title and description
   - Content overview
   - 3-4 Key Points (bullet list)
   - 2-3 Review Questions

3. KEY TERMS & DEFINITIONS:
   - 8-12 important terms with clear definitions

4. STUDY TIPS:
   - 5-7 practical tips for learning/retention
   - Mnemonics or memory aids if applicable

5. IMPORTANT CITATIONS:
   - Key references or works cited

Output as a properly formatted JSON object with this structure:
{
  "title": "string",
  "executive_summary": "string (full paragraph)",
  "sections": [
    {
      "title": "string",
      "content": "string (descriptive overview)",
      "keyPoints": ["point1", "point2", "point3", "point4"],
      "reviewQuestions": ["question1", "question2", "question3"]
    }
  ],
  "key_terms": [
    {
      "term": "string",
      "definition": "string (concise, clear definition)"
    }
  ],
  "study_tips": ["tip1", "tip2", "tip3", "tip4", "tip5"],
  "important_citations": ["citation1", "citation2", "citation3"]
}

Create the study guide now. Ensure it's comprehensive, well-organized, and suitable for thorough thesis study.`;

      const result = await callPuterAI(prompt, {
        temperature: 0.5, // Balanced, organized content
        max_tokens: 4000,
        timeout: 30000
      });

      // Handle markdown code blocks if present
      let cleanedResult = result;
      if (result.includes("```")) {
        cleanedResult = result.replace(/```json\n?|\n?```/g, "").trim();
      }

      const parsed: StudyGuide = JSON.parse(cleanedResult);

      // Validate and enhance
      if (!parsed.sections || parsed.sections.length === 0) {
        throw new Error("Invalid study guide format");
      }

      // Calculate estimated read time (rough estimate: 200 words per minute)
      const totalWords = (parsed.executive_summary + parsed.sections.map(s => s.content).join(" ")).split(/\s+/).length;
      const readTime = Math.ceil(totalWords / 200);

      setGeneratedGuide({
        ...parsed,
        metadata: {
          generatedAt: new Date().toISOString(),
          sectionCount: parsed.sections.length,
          estimatedReadTime: readTime
        }
      });

      toast.success("Study guide generated successfully!");
    } catch (error: any) {
      const errorMessage = error.message || "Failed to generate study guide.";
      toast.error(errorMessage);
      console.error("Study guide generation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addSampleData = () => {
    const sampleTitle = "Social Media Impact on Academic Performance";
    const sampleContent = `This thesis investigates the complex relationship between social media usage and academic performance among Philippine Grade 12 students through a mixed-methods lens.

QUANTITATIVE PHASE:
Participants: 500 Grade 12 students across 15 schools in Region III
Instruments: 
- Social Media Use Scale (SMUS)
- Academic Self-Efficacy Scale
- Time Management Inventory
Measures: GPA, attendance records, course grades

Results:
- Moderate use (1-2 hrs/day) predicted higher academic performance (r=0.34, p<.01)
- Excessive use (>3 hrs/day) significantly predicted lower grades (β=-0.52, p<.001)
- Time management significantly moderated the relationship (F=12.4, p<.001)

QUALITATIVE PHASE:
30 semi-structured interviews exploring student experiences, strategies, and challenges.

Key Themes:
1. Adaptive Strategies: Students using scheduled breaks, platform curation, app restrictions
2. Maladaptive Patterns: Distraction spirals, procrastination, FOMO-driven behavior
3. Family Dynamics: Parental monitoring and guidance effects
4. Digital Literacy: Understanding algorithm effects and intentional consumption

FINDINGS:
Social media impact is not inherently negative but depends on usage patterns and personal characteristics. Educational intervention should focus on digital literacy and intentional use rather than abstinence.

IMPLICATIONS:
For educators: Integrate digital citizenship into curriculum
For parents: Guide rather than restrict; model healthy use
For policymakers: Support digital literacy programs`;

    setGuideTitle(sampleTitle);
    setInputText(sampleContent);
    setGeneratedGuide(null);
    toast.success("Sample data added! Click 'Generate Study Guide' to create a comprehensive guide.");
  };

  const handleSaveGuide = async () => {
    if (!user || !generatedGuide) return;
    setIsSaving(true);

    try {
      const { data: newDoc, error } = await supabase
        .from("documents")
        .insert({
          user_id: user.id,
          title: `Study Guide: ${generatedGuide.title}`,
          content: `<h1>${generatedGuide.title}</h1>
<p><em>Generated: ${new Date(generatedGuide.metadata.generatedAt).toLocaleDateString()}</em></p>
<p><strong>Estimated Reading Time: ${generatedGuide.metadata.estimatedReadTime} minutes</strong></p>
<hr/>

<h2>Executive Summary</h2>
<p>${generatedGuide.executive_summary}</p>

<h2>Main Topics</h2>
${generatedGuide.sections.map((section, i) => `
<h3>${i + 1}. ${section.title}</h3>
<p>${section.content}</p>
<h4>Key Points:</h4>
<ul>
${section.keyPoints.map(point => `<li>${point}</li>`).join("")}
</ul>
<h4>Review Questions:</h4>
<ol>
${section.reviewQuestions.map(q => `<li>${q}</li>`).join("")}
</ol>
`).join("")}

<h2>Key Terms & Definitions</h2>
<dl>
${generatedGuide.key_terms.map(kt => `
<dt><strong>${kt.term}</strong></dt>
<dd>${kt.definition}</dd>
`).join("")}
</dl>

<h2>Study Tips</h2>
<ol>
${generatedGuide.study_tips.map(tip => `<li>${tip}</li>`).join("")}
</ol>

<h2>Important Citations</h2>
<ul>
${generatedGuide.important_citations.map(cite => `<li>${cite}</li>`).join("")}
</ul>`,
        })
        .select("id")
        .single();

      if (error) {
        toast.error("Failed to save study guide.");
        console.error(error);
      } else if (newDoc) {
        toast.success("Study guide saved as document!");
        router.push(`/drafts/${newDoc.id}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportJSON = () => {
    if (!generatedGuide) return;

    const dataStr = JSON.stringify(generatedGuide, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `study-guide-${generatedGuide.title.replace(/\s+/g, "-")}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Study guide exported as JSON!");
  };

  const handleCopyGuide = () => {
    if (!generatedGuide) return;

    const text = `${generatedGuide.title}\n\nEXECUTIVE SUMMARY:\n${generatedGuide.executive_summary}\n\n${generatedGuide.sections
      .map(
        s =>
          `${s.title}\n${s.content}\n\nKey Points:\n${s.keyPoints.map(p => `• ${p}`).join("\n")}\n\nReview Questions:\n${s.reviewQuestions.map(q => `? ${q}`).join("\n")}`
      )
      .join("\n\n---\n\n")}\n\nKEY TERMS:\n${generatedGuide.key_terms.map(kt => `${kt.term}: ${kt.definition}`).join("\n")}\n\nSTUDY TIPS:\n${generatedGuide.study_tips.map((t, i) => `${i + 1}. ${t}`).join("\n")}`;

    navigator.clipboard.writeText(text);
    toast.success("Study guide copied to clipboard!");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookMarked className="w-5 h-5" />
                Study Guide Generator
              </CardTitle>
              <CardDescription>
                Create a comprehensive, hierarchically-organized study guide from your thesis. Perfect for review and exam preparation.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Guide Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Study Guide Title</label>
            <input
              type="text"
              placeholder="e.g., Complete Study Guide: Social Media Impact on Student Performance"
              className="w-full px-3 py-2 border rounded-md border-input bg-background"
              value={guideTitle}
              onChange={(e) => setGuideTitle(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Title for your comprehensive study guide
            </p>
          </div>

          {/* Content Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Thesis Content/Summary</label>
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
              placeholder="Paste your complete thesis content, chapter summaries, or detailed research notes. More detailed content produces better study guides."
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
            onClick={handleGenerateGuide}
            disabled={isLoading || !inputText.trim() || !guideTitle.trim()}
            size="lg"
            className="w-full gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating Study Guide...
              </>
            ) : (
              <>
                <BookMarked className="w-4 h-4" />
                Generate Study Guide
              </>
            )}
          </Button>

          {isLoading && (
            <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-blue-700 dark:text-blue-300">
                Creating comprehensive study guide with AI... This usually takes 10-20 seconds.
              </AlertDescription>
            </Alert>
          )}

          {/* Tips */}
          {!generatedGuide && !isLoading && (
            <Alert className="bg-green-50 dark:bg-green-950 border-green-200">
              <Info className="h-4 w-4 text-green-700 dark:text-green-300" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                <strong>Tips:</strong> Provide comprehensive thesis content (1000+ words) for the best results. The guide will include sections, key terms, review questions, and study strategies.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Generated Guide Display */}
      {generatedGuide && (
        <>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{generatedGuide.title}</CardTitle>
                  <CardDescription>
                    {generatedGuide.metadata.sectionCount} sections • ~{generatedGuide.metadata.estimatedReadTime} min read
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={handleSaveGuide}
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
                  onClick={handleCopyGuide}
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

              {/* Executive Summary */}
              <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <h3 className="text-lg font-semibold mb-2">Executive Summary</h3>
                <p className="text-sm leading-relaxed">{generatedGuide.executive_summary}</p>
              </div>

              {/* Main Sections */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Main Topics</h3>
                {generatedGuide.sections.map((section, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="text-base font-semibold mb-2">
                      {index + 1}. {section.title}
                    </h4>
                    <p className="text-sm text-foreground/80 mb-4">{section.content}</p>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">
                          Key Points
                        </p>
                        <ul className="space-y-1">
                          {section.keyPoints.map((point, i) => (
                            <li key={i} className="text-sm flex gap-2">
                              <span className="text-muted-foreground">•</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">
                          Review Questions
                        </p>
                        <ol className="space-y-1">
                          {section.reviewQuestions.map((q, i) => (
                            <li key={i} className="text-sm flex gap-2">
                              <span className="text-muted-foreground">{i + 1}.</span>
                              <span>{q}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Key Terms */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Key Terms & Definitions</h3>
                <div className="grid gap-3">
                  {generatedGuide.key_terms.map((kt, index) => (
                    <div key={index} className="border-l-2 border-muted pl-4 py-2">
                      <p className="font-medium text-sm">{kt.term}</p>
                      <p className="text-sm text-foreground/80">{kt.definition}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Study Tips */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Study Tips & Strategies</h3>
                <ol className="space-y-2">
                  {generatedGuide.study_tips.map((tip, index) => (
                    <li key={index} className="text-sm flex gap-3">
                      <span className="font-semibold text-primary">{index + 1}.</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Important Citations */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Important Citations</h3>
                <ul className="space-y-2">
                  {generatedGuide.important_citations.map((cite, index) => (
                    <li key={index} className="text-sm text-foreground/80 flex gap-2">
                      <span className="text-muted-foreground">•</span>
                      <span>{cite}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Footer Info */}
              <div className="pt-4 border-t text-xs text-muted-foreground">
                <p>Generated: {new Date(generatedGuide.metadata.generatedAt).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
