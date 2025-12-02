"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { FilePlus2, Wand2 } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Label } from "./ui/label";
import { useAuth } from "./auth-provider";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuthReady } from "@/hooks/use-auth-ready";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { callPuterAI } from "@/lib/puter-ai-wrapper";

type Slide = {
  title: string;
  bulletPoints: string[];
  speakerNotes: string;
};

export function PresentationGenerator() {
  const { session, supabase } = useAuth();
  const { isReady } = useAuthReady();
  const user = session?.user;
  const router = useRouter();
  const [chapterContent, setChapterContent] = useState("");
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const addSampleData = () => {
    const sampleContent = `Chapter 3: Methodology

Research Design
This study employed a mixed-methods approach combining quantitative surveys and qualitative interviews to investigate the impact of social media usage on academic performance among senior high school students in Region III. The convergent parallel design was selected to gain comprehensive insights into the research problem.

Population and Sampling
The study's target population comprised 1,250 Grade 11 and Grade 12 students from three public schools in Bukidnon. A sample of 320 students was selected through stratified random sampling, with 160 students from each grade level. Participants were selected to ensure equal representation across gender and academic tracks.

Instrumentation and Data Collection
The primary research instrument was a structured questionnaire adapted from the Digital Behavior Assessment Tool (DBAT) with modifications for the local context. The instrument included four sections: (1) demographic profile, (2) social media usage patterns, (3) academic performance indicators, and (4) perceived impact of social media on studies. The questionnaire underwent face and content validation by three experts with CVR scores ranging from 0.87 to 0.94.

Ethical Considerations
The study protocol was reviewed and approved by the University Research Ethics Committee (UREC). All participants provided informed consent, and parents of minors provided assent. Participation was voluntary with assurance of confidentiality and anonymity. Data was stored securely with access limited to the principal investigators.`;

    setChapterContent(sampleContent);
    toast.success("Sample chapter content added! Click 'Generate Presentation' to see the tool in action.");
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapterContent) {
      toast.error("Please provide chapter content.");
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

    setIsGenerating(true);
    setSlides([]);

    try {
      // Create a prompt for generating presentation slides
      const prompt = `Generate 5-8 presentation slides from the following chapter content.
      Format your response as JSON with this structure:
      {
        "slides": [
          {
            "title": "Slide title",
            "bulletPoints": ["bullet point 1", "bullet point 2", "bullet point 3"],
            "speakerNotes": "Detailed speaker notes for the presenter"
          }
        ]
      }

      The content is:
      ${chapterContent}`;

      const result = await callPuterAI(prompt, {
        temperature: 0.5,  // More focused for structured output
        max_tokens: 4000,
        timeout: 90000
      });

      // Try to parse the result as JSON
      let parsedResult;
      try {
        // First try direct JSON parsing
        parsedResult = JSON.parse(result);
      } catch {
        // If direct parsing fails, try to extract JSON from code blocks
        const jsonMatch = result.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          try {
            parsedResult = JSON.parse(jsonMatch[1]);
          } catch {
            // If that fails, look for JSON between curly braces
            const jsonText = result.match(/\{[\s\S]*\}/);
            if (jsonText) {
              parsedResult = JSON.parse(jsonText[0]);
            } else {
              throw new Error("Could not extract valid JSON from AI response");
            }
          }
        } else {
          throw new Error("Could not extract valid JSON from AI response");
        }
      }

      if (parsedResult && Array.isArray(parsedResult.slides)) {
        setSlides(parsedResult.slides);
        toast.success("Presentation slides generated!");
      } else {
        throw new Error("AI response did not contain properly formatted slides");
      }
    } catch (error: any) {
      console.error("Error generating presentation:", error);
      toast.error(error.message || "Failed to generate presentation. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAsDraft = async () => {
    if (!user || slides.length === 0 || !chapterContent) return;
    setIsSaving(true);

    let content = `<h1>Presentation Outline</h1>`;
    slides.forEach((slide, index) => {
      content += `<h2>Slide ${index + 1}: ${slide.title}</h2>`;
      content += `<h3>Slide Content</h3><ul>`;
      slide.bulletPoints.forEach((point: string) => {
        content += `<li>${point}</li>`;
      });
      content += `</ul>`;
      content += `<h3>Speaker Notes</h3><p>${slide.speakerNotes}</p>`;
    });

    const { data: newDoc, error } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        title: `Presentation Draft`,
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
    <div className="max-w-4xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Advanced Presentation Generator</CardTitle>
          <CardDescription>
            Paste a chapter or section of your thesis to generate slides with bullet points and speaker notes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="chapterContent">Chapter / Section Content</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSampleData}
                  disabled={isGenerating}
                >
                  Add Sample Data
                </Button>
              </div>
              <Textarea
                id="chapterContent"
                placeholder="Paste your text here..."
                className="min-h-[200px]"
                value={chapterContent}
                onChange={(e) => setChapterContent(e.target.value)}
                disabled={isGenerating}
              />
            </div>
            <Button type="submit" disabled={isGenerating || !chapterContent || !session}>
              <Wand2 className="w-4 h-4 mr-2" />
              {isGenerating ? "Generating Slides..." : "Generate Presentation"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {(isGenerating || slides.length > 0) && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Generated Presentation</CardTitle>
              {slides.length > 0 && !isGenerating && (
                <Button variant="outline" size="sm" onClick={handleSaveAsDraft} disabled={isSaving}>
                  <FilePlus2 className="w-4 h-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Outline as Draft"}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isGenerating ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
                <Skeleton className="h-96 w-full" />
              </div>
            ) : (
              slides.length > 0 && (
                <Carousel className="w-full max-w-2xl mx-auto">
                  <CarouselContent>
                    {slides.map((slide, index) => (
                      <CarouselItem key={index}>
                        <div className="p-1">
                          <Card className="aspect-video flex flex-col bg-background">
                            <CardHeader>
                              <CardTitle className="text-2xl">{slide.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 flex-1">
                              <Tabs defaultValue="content">
                                <TabsList className="grid w-full grid-cols-2">
                                  <TabsTrigger value="content">Slide Content</TabsTrigger>
                                  <TabsTrigger value="notes">Speaker Notes</TabsTrigger>
                                </TabsList>
                                <TabsContent value="content" className="mt-4">
                                  <ul className="space-y-4 list-disc list-inside text-lg">
                                    {slide.bulletPoints.map((point: string, i: number) => (
                                      <li key={i}>{point}</li>
                                    ))}
                                  </ul>
                                </TabsContent>
                                <TabsContent value="notes" className="mt-4">
                                  <p className="text-base text-muted-foreground">{slide.speakerNotes}</p>
                                </TabsContent>
                              </Tabs>
                            </CardContent>
                            <CardFooter className="text-sm text-muted-foreground justify-end">
                              <p>Slide {index + 1} of {slides.length}</p>
                            </CardFooter>
                          </Card>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="hidden sm:flex" />
                  <CarouselNext className="hidden sm:flex" />
                </Carousel>
              )
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}