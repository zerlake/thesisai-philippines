"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Copy, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

export function SurveyQuestionGenerator() {
  const { session } = useAuth();
  const [surveyTopic, setSurveyTopic] = useState("");
  const [questionType, setQuestionType] = useState("Likert Scale (1-5)");
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  const handleGenerateQuestions = async () => {
    if (!surveyTopic || !questionType || !session) return;
    setIsGeneratingQuestions(true);
    setGeneratedQuestions([]);
    try {
      const response = await fetch(
        "https://dnyjgzzfyzrsucucexhy.supabase.co/functions/v1/generate-survey-questions",
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
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setGeneratedQuestions(data.questions);
      toast.success("Survey questions generated!");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate questions.");
      console.error(error);
    } finally {
      setIsGeneratingQuestions(false);
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
      <Button onClick={handleGenerateQuestions} disabled={isGeneratingQuestions || !surveyTopic || !session}>
        <Wand2 className="w-4 h-4 mr-2" /> {isGeneratingQuestions ? "Generating..." : "Generate Questions"}
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