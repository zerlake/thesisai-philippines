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
import { getSupabaseFunctionUrl } from "@/integrations/supabase/client";
import { useApiCall } from "@/hooks/use-api-call";

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
  // const [isLoading, setIsLoading] = useState(false); // Replaced by useApiCall's loading state
  const [isSaving, setIsSaving] = useState(false);

  const { execute: generateTopics, loading: isGenerating } = useApiCall<any>({
    onSuccess: (data) => {
      if (!data.topicIdeas) {
        throw new Error("API returned no topic ideas data.");
      }
      setIdeas(data.topicIdeas);
    },
    onError: (error) => {
      toast.error(error.message || "An unexpected error occurred.");
      console.error(error);
    },
    autoErrorToast: false,
  });

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

    setIdeas([]); // Clear previous ideas

    try {
      await generateTopics(
        getSupabaseFunctionUrl("generate-topic-ideas"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          },
          body: JSON.stringify({ field }),
        }
      );
    } catch (error: any) {
        // Errors are already handled by useApiCall's onError
        console.error("Local error before API call in handleGenerate:", error);
    }
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
            <Button type="submit" disabled={isGenerating || !field || !session}>
              <Wand2 className="w-4 h-4 mr-2" />
              {isGenerating ? "Generating Ideas..." : "Generate Ideas"}
            </Button>
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
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
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