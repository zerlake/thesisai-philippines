"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getSupabaseFunctionUrl } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Copy, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { useApiCall } from "@/hooks/use-api-call";

export function SurveyQuestionGenerator() {
  const { session } = useAuth();
  const [surveyTopic, setSurveyTopic] = useState("");
  const [questionType, setQuestionType] = useState("Likert Scale (1-5)");
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([]);
  // const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false); // Replaced by useApiCall's loading state

  const { execute: generateQuestions, loading: isGenerating } = useApiCall<any>({
    onSuccess: (data) => {
      if (!data.questions) {
        throw new Error("API returned no questions data.");
      }
      setGeneratedQuestions(data.questions);
      toast.success("Survey questions generated!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to generate questions.");
      console.error(error);
    },
    autoErrorToast: false,
  });

  const handleGenerateQuestions = async () => {
    if (!surveyTopic || !questionType || !session) {
        toast.error("Please provide a topic and question type.");
        return;
    }
    // setIsGeneratingQuestions(true); // Loading state managed by useApiCall
    setGeneratedQuestions([]);
    try {
      await generateQuestions(
        getSupabaseFunctionUrl("generate-survey-questions"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          },
          body: JSON.stringify({ topic: surveyTopic, questionType }),
        }
      );
    } catch (error: any) {
        // Errors are already handled by useApiCall's onError
        console.error("Local error before API call in handleGenerateQuestions:", error);
    }
  };

  const handleCopyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="survey-topic">Research Topic</Label>
        <Input id="survey-topic" placeholder="e.g., The Impact of AI on Higher Education" value={surveyTopic} onChange={e => setSurveyTopic(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Question Type</Label>
        <RadioGroup value={questionType} onValueChange={setQuestionType}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Likert Scale (1-5)" id="likert" />
            <Label htmlFor="likert">Likert Scale (1-5)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Multiple Choice" id="mcq" />
            <Label htmlFor="mcq">Multiple Choice</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Open-Ended" id="open-ended" />
            <Label htmlFor="open-ended">Open-Ended</Label>
          </div>
        </RadioGroup>
      </div>
      <Button onClick={handleGenerateQuestions} disabled={isGenerating || !surveyTopic || !session}>
        <Wand2 className="w-4 h-4 mr-2" /> {isGenerating ? "Generating..." : "Generate Questions"}
      </Button>
      {generatedQuestions.length > 0 && (
        <div className="relative">
          <Textarea value={generatedQuestions.join('\n\n')} readOnly rows={8} />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2"
            onClick={() => handleCopyToClipboard(generatedQuestions.join('\n\n'))}
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}