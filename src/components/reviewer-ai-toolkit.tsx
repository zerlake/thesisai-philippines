"use client";

import { type Editor } from "@tiptap/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Languages, Loader2, Sparkles, TextQuote, MessageSquare } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

interface ReviewerAiToolkitProps {
  editor: Editor | null;
}

type StructuredFeedback = {
  positive: string;
  improvement: string;
};

export function ReviewerAiToolkit({ editor }: ReviewerAiToolkitProps) {
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [generatedFeedback, setGeneratedFeedback] = useState<StructuredFeedback | null>(null);
  const [generatedContentType, setGeneratedContentType] = useState<string | null>(null);

  const getSelectedText = () => {
    if (!editor) return "";
    const { from, to } = editor.state.selection;
    return editor.state.doc.textBetween(from, to);
  };

  const callAIFunction = async (functionName: string, body: object) => {
    if (!session) {
      toast.error("You must be logged in to use AI features.");
      return null;
    }
    setIsLoading(functionName);
    setGeneratedContent(null);
    setGeneratedFeedback(null);
    try {
      const response = await fetch(
        `https://dnyjgzzfyzrsucucexhy.supabase.co/functions/v1/${functionName}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRueWpnenpmeXpyc3VjdWNleGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NDAxMjcsImV4cCI6MjA3MzAxNjEyN30.elZ6r3JJjdwGUadSzQ1Br5EdGeqZIEr67Z5QB_Q3eMw",
          },
          body: JSON.stringify(body),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `Failed to call ${functionName}.`);
      return data;
    } catch (error: any) {
      toast.error(error.message);
      return null;
    } finally {
      setIsLoading(null);
    }
  };

  const handleAiAction = async (action: 'improve' | 'summarize' | 'paraphrase') => {
    const selectedText = getSelectedText();
    if (!selectedText) {
      toast.info("Please select some text in the document first.");
      return;
    }

    let functionName = "";
    let resultKey = "";
    let contentType = "";

    switch (action) {
      case 'improve':
        functionName = "improve-writing";
        resultKey = "improvedText";
        contentType = "Improved Version";
        break;
      case 'summarize':
        functionName = "summarize-text";
        resultKey = "summarizedText";
        contentType = "Summary";
        break;
      case 'paraphrase':
        functionName = "paraphrase-text";
        resultKey = "paraphrasedText";
        contentType = "Paraphrased Version";
        break;
    }

    const data = await callAIFunction(functionName, { text: selectedText });
    if (data && data[resultKey]) {
      setGeneratedContent(data[resultKey]);
      setGeneratedContentType(contentType);
    }
  };

  const handleGenerateFeedback = async () => {
    const selectedText = getSelectedText();
    if (!selectedText) {
      toast.info("Please select some text in the document first.");
      return;
    }
    const data = await callAIFunction("generate-feedback", { text: selectedText });
    if (data) {
      setGeneratedFeedback(data);
      setGeneratedContentType("Feedback");
    }
  };

  const handleCopy = () => {
    if (!generatedContent) return;
    navigator.clipboard.writeText(generatedContent);
    toast.success("Suggestion copied to clipboard!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reviewer AI Toolkit</CardTitle>
        <CardDescription>Select text in the document to generate feedback and suggestions.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={() => handleAiAction('improve')} disabled={!!isLoading} className="w-full justify-start">
          {isLoading === 'improve-writing' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
          Improve Selection
        </Button>
        <Button onClick={() => handleAiAction('summarize')} disabled={!!isLoading} className="w-full justify-start">
          {isLoading === 'summarize-text' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <TextQuote className="w-4 h-4 mr-2" />}
          Summarize Selection
        </Button>
        <Button onClick={() => handleAiAction('paraphrase')} disabled={!!isLoading} className="w-full justify-start">
          {isLoading === 'paraphrase-text' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Languages className="w-4 h-4 mr-2" />}
          Paraphrase Selection
        </Button>
        <Button onClick={handleGenerateFeedback} disabled={!!isLoading} className="w-full justify-start">
          {isLoading === 'generate-feedback' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MessageSquare className="w-4 h-4 mr-2" />}
          Generate Feedback
        </Button>

        {generatedContentType && (
          <>
            <Separator className="my-4" />
            <Alert>
              <AlertTitle className="flex justify-between items-center">
                <span>{generatedContentType}</span>
                {generatedContent && (
                  <Button size="icon" variant="ghost" onClick={handleCopy}>
                    <Copy className="w-4 h-4" />
                  </Button>
                )}
              </AlertTitle>
              <AlertDescription className="mt-2 max-h-48 overflow-y-auto">
                {generatedContent && generatedContent}
                {generatedFeedback && (
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-green-600">Positive Feedback</h4>
                      <p>{generatedFeedback.positive}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-yellow-600">Area for Improvement</h4>
                      <p>{generatedFeedback.improvement}</p>
                    </div>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          </>
        )}
      </CardContent>
    </Card>
  );
}