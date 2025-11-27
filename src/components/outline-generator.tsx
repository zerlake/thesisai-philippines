"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { FilePlus2, Wand2 } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { useAuth } from "./auth-provider";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { FieldOfStudySelector } from "./field-of-study-selector";
import { generateOutline } from "@/lib/puter-sdk";

export function OutlineGenerator() {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const router = useRouter();
  const [field, setField] = useState("");
  const [topic, setTopic] = useState("");
  const [outline, setOutline] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || !field) return;

    setIsLoading(true);
    setOutline("");

    try {
      const data = await generateOutline(topic);
      
      let outlineText = '';
      if (typeof data === 'string') {
        outlineText = data;
      } else if (data?.outline) {
        outlineText = data.outline;
      } else {
        outlineText = JSON.stringify(data, null, 2);
      }
      
      setOutline(outlineText);
      toast.success("Outline generated successfully!");
    } catch (error: any) {
      const msg = error.message || "Failed to generate outline.";
      
      if (msg.includes("auth")) {
        toast.error("Please sign in to your Puter account");
      } else {
        toast.error(msg);
      }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAsDraft = async () => {
    if (!user || !outline || !topic) return;
    setIsSaving(true);

    const htmlOutline = outline.replace(/\n/g, '<br>');

    const { data: newDoc, error } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        title: `Outline: ${topic}`,
        content: `<h1>Outline for: ${topic}</h1><p>${htmlOutline}</p>`,
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
          <CardTitle>Project Outline Generator</CardTitle>
          <CardDescription>
            Enter your topic, and our AI will generate a structured
            outline for your thesis, dissertation, or paper.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Field of Study</Label>
              <FieldOfStudySelector
                value={field}
                onValueChange={setField}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic">Thesis Topic</Label>
              <Input
                id="topic"
                placeholder="e.g., The Impact of AI on Higher Education"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" disabled={isLoading || !topic || !field || !session}>
              <Wand2 className="w-4 h-4 mr-2" />
              {isLoading ? "Generating..." : "Generate Outline"}
            </Button>
          </form>

          {(isLoading || outline) && (
            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Generated Outline</h3>
                {outline && !isLoading && (
                  <Button variant="outline" size="sm" onClick={handleSaveAsDraft} disabled={isSaving}>
                    <FilePlus2 className="w-4 h-4 mr-2" />
                    {isSaving ? "Saving..." : "Save as Draft"}
                  </Button>
                )}
              </div>
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-11/12" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-10/12" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-11/12" />
                </div>
              ) : (
                <div className="p-4 border rounded-md bg-tertiary whitespace-pre-wrap font-mono text-sm">
                  {outline}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}