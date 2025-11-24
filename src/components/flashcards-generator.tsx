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
import { useAuthReady } from "@/hooks/use-auth-ready";

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
  const { isReady } = useAuthReady();
  const user = session?.user;
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const addSampleData = () => {
    // Sample flashcards for a thesis on "The Impact of Social Media on Academic Performance"
    const sampleTopic = "The Impact of Social Media on Academic Performance";
    setTopic(sampleTopic);
    
    const sampleFlashcards = [
      {
        term: "Digital Citizenship",
        definition: "The responsible and ethical use of technology, including understanding how to behave appropriately online and the implications of one's actions in digital spaces."
      },
      {
        term: "Academic Integrity",
        definition: "The moral code or ethical policy governing academic conduct, including honesty, trust, fairness, respect, and responsibility in scholarly activities."
      },
      {
        term: "Cognitive Load Theory",
        definition: "A theory that describes how the human brain processes information, suggesting that working memory is limited and instruction should avoid overloading it."
      },
      {
        term: "E-Learning Platforms",
        definition: "Digital environments used to deliver educational content and facilitate learning through internet-based technologies and tools."
      },
      {
        term: "Student Engagement",
        definition: "The degree of attention, curiosity, interest, and passion that students show when learning or are participating in academic activities."
      },
      {
        term: "Social Media Influence",
        definition: "The impact of social networking sites and platforms on student behaviors, attitudes, and academic outcomes, including both positive and negative effects."
      },
      {
        term: "Time Management Skills",
        definition: "The ability to effectively organize and plan how to divide time between different academic tasks and social media use to maximize productivity."
      },
      {
        term: "Research Methodology",
        definition: "The systematic approach used to conduct research, including data collection methods, analysis techniques, and theoretical frameworks."
      },
      {
        term: "Statistical Analysis",
        definition: "The process of collecting, exploring, and presenting large amounts of data to reveal patterns and trends related to research questions."
      },
      {
        term: "Thesis Writing",
        definition: "The process of composing an extended piece of academic writing based on research, presenting an argument or analysis on a specific topic."
      },
      {
        term: "Literature Review",
        definition: "A comprehensive survey of scholarly sources on a specific topic, providing an overview of current knowledge and identifying gaps in research."
      },
      {
        term: "Peer Review Process",
        definition: "The evaluation of scientific, academic, or professional work by others working in the same field to ensure quality and validity."
      }
    ];
    
    setFlashcards(sampleFlashcards);
    toast.success("Sample flashcards added! Explore all 12 cards using the carousel navigation.");
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;
    
    if (!isReady) {
      toast.error("Please wait while your session is loading...");
      return;
    }

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
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

    let content = `<h1>Flashcards for: ${topic}</h1><hr>`;
    flashcards.forEach(card => {
      content += `<h2>${card.term}</h2><p>${card.definition}</p><hr>`;
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
              <div className="flex justify-between items-center">
                <Label htmlFor="topic">Project Topic</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={addSampleData}
                >
                  Add Sample
                </Button>
              </div>
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