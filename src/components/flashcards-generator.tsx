"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { FilePlus2, Wand2 } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useAuth } from "./auth-provider";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

function Flashcard({ term, definition }: { term: string; definition: string }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <Card
      className="h-64 flex flex-col items-center justify-center text-center p-6 cursor-pointer select-none"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      {!isFlipped ? (
        <div>
          <p className="text-muted-foreground text-sm">Term</p>
          <p className="text-2xl font-semibold">{term}</p>
        </div>
      ) : (
        <div>
          <p className="text-muted-foreground text-sm">Definition</p>
          <p className="text-lg">{definition}</p>
        </div>
      )}
    </Card>
  );
}

export function FlashcardsGenerator() {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;

    setIsLoading(true);
    setFlashcards([]);

    try {
      if (!session) {
        throw new Error("Authentication session not found. Please log in again.");
      }

      const response = await fetch(
        "https://dnyjgzzfyzrsucucexhy.supabase.co/functions/v1/generate-flashcards",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRueWpnenpmeXpyc3VjdWNleGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NDAxMjcsImV4cCI6MjA3MzAxNjEyN30.elZ6r3JJjdwGUadSzQ1Br5EdGeqZIEr67Z5QB_Q3eMw",
          },
          body: JSON.stringify({ topic }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }

      if (data.flashcards) {
        setFlashcards(data.flashcards);
      } else {
        throw new Error("The AI did not return the expected flashcard data. Please try again.");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAsDraft = async () => {
    if (!user || flashcards.length === 0 || !topic) return;
    setIsSaving(true);

    let content = `# Flashcards for: ${topic}\n\n---\n\n`;
    flashcards.forEach(card => {
      content += `**Term:** ${card.term}\n`;
      content += `**Definition:** ${card.definition}\n\n---\n\n`;
    });

    const { data: newDoc, error } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        title: `Flashcards: ${topic}`,
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
          <CardTitle>Flashcards Generator</CardTitle>
          <CardDescription>
            Create flashcards from key terms in your project to help you study.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Project Topic</Label>
              <Input
                id="topic"
                placeholder="e.g., The Impact of AI on Higher Education"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" disabled={isLoading || !topic || !session}>
              <Wand2 className="w-4 h-4 mr-2" />
              {isLoading ? "Generating Flashcards..." : "Generate Flashcards"}
            </Button>
          </form>

          <div className="mt-8">
            {isLoading && (
              <div className="flex justify-center">
                 <Skeleton className="h-64 w-full max-w-md" />
              </div>
            )}
            {flashcards.length > 0 && (
              <>
                <div className="flex justify-end mb-4">
                  <Button variant="outline" size="sm" onClick={handleSaveAsDraft} disabled={isSaving}>
                    <FilePlus2 className="w-4 h-4 mr-2" />
                    {isSaving ? "Saving..." : "Save as Draft"}
                  </Button>
                </div>
                <Carousel className="w-full max-w-md mx-auto">
                  <CarouselContent>
                    {flashcards.map((card, index) => (
                      <CarouselItem key={index}>
                        <Flashcard term={card.term} definition={card.definition} />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}