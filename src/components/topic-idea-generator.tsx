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
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!field) return;

    setIsLoading(true);
    setIdeas([]);

    try {
      if (!session) {
        throw new Error("Authentication session not found. Please log in again.");
      }

      const response = await fetch(
        "https://dnyjgzzfyzrsucucexhy.supabase.co/functions/v1/generate-topic-ideas",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRueWpnenpmeXpyc3VjdWNleGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NDAxMjcsImV4cCI6MjA3MzAxNjEyN30.elZ6r3JJjdwGUadSzQ1Br5EdGeqZIEr67Z5QB_Q3eMw",
          },
          body: JSON.stringify({ field }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }

      if (data.topicIdeas) {
        setIdeas(data.topicIdeas);
      } else {
        throw new Error("The AI did not return the expected topic data. Please try again.");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
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
                disabled={isLoading}
              />
            </div>
            <Button type="submit" disabled={isLoading || !field || !session}>
              <Wand2 className="w-4 h-4 mr-2" />
              {isLoading ? "Generating Ideas..." : "Generate Ideas"}
            </Button>
          </form>

          {(isLoading || ideas.length > 0) && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Generated Ideas</h3>
                {ideas.length > 0 && !isLoading && (
                  <Button variant="outline" size="sm" onClick={handleSaveAsDraft} disabled={isSaving}>
                    <FilePlus2 className="w-4 h-4 mr-2" />
                    {isSaving ? "Saving..." : "Save as Draft"}
                  </Button>
                )}
              </div>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : (
                <div className="space-y-6">
                  {ideas.map((idea, index) => (
                    <Card key={index} className="bg-muted/50">
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