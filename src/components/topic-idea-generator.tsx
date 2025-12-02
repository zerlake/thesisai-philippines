"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { BrainCircuit, FilePlus2, Wand2 } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Label } from "./ui/label";
import { useAuth } from "./auth-provider";
import { toast } from "sonner";
import { FieldOfStudySelector } from "./field-of-study-selector";
import { useRouter } from "next/navigation";
import { callPuterAI } from "@/lib/puter-ai-wrapper";

type TopicIdea = {
  title: string;
  description: string;
};

export function TopicIdeaGenerator() {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const router = useRouter();
  const [field, setField] = useState("");
  const [ideas, setIdeas] = useState<TopicIdea[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const sampleData = [
    {
      field: "Artificial Intelligence",
      ideas: [
        { title: "The Impact of AI on Higher Education", description: "An analysis of how AI tools are changing teaching, learning, and administrative processes in universities." },
        { title: "Ethical Considerations of AI in Healthcare", description: "A study on the ethical dilemmas posed by using AI in diagnostics, treatment planning, and patient data management." },
        { title: "AI-Powered Personalized Learning Platforms", description: "An investigation into the effectiveness of AI-driven platforms in tailoring education to individual student needs." },
      ],
    },
    {
      field: "Environmental Science",
      ideas: [
        { title: "The Role of Renewable Energy in Mitigating Climate Change", description: "A comprehensive review of the impact of solar, wind, and geothermal energy on reducing carbon emissions." },
        { title: "Microplastics in the Marine Ecosystem", description: "A study on the sources, distribution, and effects of microplastics on marine life." },
        { title: "Sustainable Agriculture Practices in the Philippines", description: "An examination of sustainable farming methods and their potential for improving food security and environmental health." },
      ],
    },
  ];

  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!field) {
      toast.error("Please select a field of study.");
      return;
    }
    if (!session) {
      toast.error("You must be logged in to use this feature.");
      return;
    }

    setIdeas([]);
    setIsGenerating(true);

    try {
      const prompt = `You are an expert academic advisor at a Philippine university. Generate EXACTLY 10 unique and researchable thesis topic ideas for students studying "${field}".

For each topic, provide:
1. A clear, specific title
2. A brief description (2-3 sentences) explaining the research focus and relevance

Return ONLY a valid JSON object with this structure:
{
  "topicIdeas": [
    {
      "title": "...",
      "description": "..."
    }
  ]
}

The JSON must contain exactly 10 topic ideas. Do not include any text outside the JSON object.`;

      const result = await callPuterAI(prompt, {
        temperature: 0.8,
        max_tokens: 2500,
        timeout: 30000,
      });

      // Parse JSON response
      const parsed = JSON.parse(result);
      
      if (!parsed.topicIdeas || !Array.isArray(parsed.topicIdeas)) {
        throw new Error("Invalid response format from AI");
      }

      setIdeas(parsed.topicIdeas.slice(0, 10));
      toast.success(`Generated ${parsed.topicIdeas.length} topic ideas!`);
    } catch (error: any) {
      console.error("Topic generation error:", error);
      const message = error?.message || "Failed to generate topics. Please try again.";
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLoadSampleData = () => {
    const randomIndex = Math.floor(Math.random() * sampleData.length);
    const sample = sampleData[randomIndex];
    setField(sample.field);
    setIdeas(sample.ideas);
  };

  const handleSaveAsDraft = async () => {
    if (!user || ideas.length === 0 || !field) return;
    setIsSaving(true);

    let content = `<h1>Thesis Topic Ideas for: ${field}</h1><hr>`;
    ideas.forEach((idea, index) => {
      content += `<h2>Idea ${index + 1}: ${idea.title}</h2>`;
      content += `<p>${idea.description}</p><hr>`;
    });

    const { data: newDoc, error } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        title: `Topic Ideas: ${field}`,
        content: content,
      })
      .select("id")
      .single();

    if (error) {
      toast.error("Failed to save draft.");
      console.error(error);
    } else if (newDoc) {
      toast.success("Draft saved successfully!");
      router.push(`/drafts/${newDoc.id}`);
    }
    setIsSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Research Topic Idea Generator</CardTitle>
          <CardDescription>
            Stuck on a topic? Select your field of study to brainstorm ideas for your thesis or dissertation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="field">Field of Study</Label>
              <FieldOfStudySelector
                value={field}
                onValueChange={setField}
                disabled={isGenerating}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isGenerating || !field || !session}>
                <Wand2 className="w-4 h-4 mr-2" />
                {isGenerating ? "Generating Ideas..." : "Generate Ideas"}
              </Button>
              <Button variant="outline" onClick={handleLoadSampleData} disabled={isGenerating}>
                Load Sample Data
              </Button>
            </div>
          </form>

          {(isGenerating || ideas.length > 0) && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Generated Ideas</h3>
                {ideas.length > 0 && !isGenerating && (
                  <Button variant="outline" size="sm" onClick={handleSaveAsDraft} disabled={isSaving}>
                    <FilePlus2 className="w-4 h-4 mr-2" />
                    {isSaving ? "Saving..." : "Save as Draft"}
                  </Button>
                )}
              </div>
              {isGenerating ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : (
                <div className="space-y-6">
                  {ideas.map((idea, index) => (
                    <Card key={index} className="bg-tertiary">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-start gap-3">
                          <BrainCircuit className="w-6 h-6 mt-1 text-primary" />
                          <span>{idea.title}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{idea.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}