"use client";

import { useState } from "react";
import { useAuth } from "./auth-provider";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Progress } from "./ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

interface OriginalityCheckPanelProps {
  documentContent: string;
  documentId: string;
}

type Match = {
  sentence: string;
  sources: { title: string; url: string }[];
};

type PlagiarismResult = {
  score: number;
  matches: Match[];
};

export function OriginalityCheckPanel({ documentContent, documentId }: OriginalityCheckPanelProps) {
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PlagiarismResult | null>(null);

  const handleCheck = async () => {
    if (!session) return;
    setIsLoading(true);
    setResult(null);
    try {
      const response = await fetch(
        "https://dnyjgzzfyzrsucucexhy.supabase.co/functions/v1/check-plagiarism",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRueWpnenpmeXpyc3VjdWNleGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NDAxMjcsImV4cCI6MjA3MzAxNjEyN30.elZ6r3JJjdwGUadSzQ1Br5EdGeqZIEr67Z5QB_Q3eMw",
          },
          body: JSON.stringify({ text: documentContent }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setResult(data);
      toast.success("Originality check complete.");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button onClick={handleCheck} disabled={isLoading} className="w-full">
        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
        Check Originality
      </Button>
      {result && (
        <Alert>
          <AlertTitle>Originality Score: {100 - result.score}%</AlertTitle>
          <AlertDescription className="mt-2">
            <Progress value={100 - result.score} />
            <p className="text-xs mt-1">{result.score}% of the text was found in other sources.</p>
          </AlertDescription>
          {result.matches.length > 0 && (
            <Accordion type="single" collapsible className="w-full mt-4">
              <AccordionItem value="matches">
                <AccordionTrigger>View Matched Sources</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 max-h-60 overflow-y-auto">
                    {result.matches.map((match, index) => (
                      <div key={index} className="p-2 border rounded-md">
                        <p className="italic">"{match.sentence}"</p>
                        <ul className="text-xs list-disc pl-5 mt-2">
                          {match.sources.slice(0, 2).map((source, sIndex) => (
                            <li key={sIndex}>
                              <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                {source.title}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </Alert>
      )}
    </div>
  );
}