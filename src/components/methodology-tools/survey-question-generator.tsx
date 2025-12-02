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
import { callPuterAI } from "@/lib/puter-ai-wrapper";

export function SurveyQuestionGenerator() {
  const { session } = useAuth();
  const [surveyTopic, setSurveyTopic] = useState("");
  const [questionType, setQuestionType] = useState("Likert Scale (1-5)");
  const [generatedQuestions, setGeneratedQuestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateQuestions = async () => {
    if (!surveyTopic || !questionType) {
      toast.error("Please provide a topic and question type.");
      return;
    }

    setIsGenerating(true);
    setGeneratedQuestions([]);

    try {
      // Create a prompt for generating survey questions
      let prompt = `Generate 5-8 survey questions for the research topic: "${surveyTopic}". `;

      switch(questionType) {
        case "Likert Scale (1-5)":
          prompt += "Create Likert scale questions with a 1-5 agreement scale (Strongly Disagree, Disagree, Neutral, Agree, Strongly Agree).";
          break;
        case "Multiple Choice":
          prompt += "Create multiple choice questions with 4-5 answer options each.";
          break;
        case "Open-Ended":
          prompt += "Create open-ended questions that allow for detailed responses.";
          break;
        default:
          prompt += "Create appropriate survey questions for the selected type.";
      }

      prompt += " Format the output as a numbered list with each question on a new line.";

      const result = await callPuterAI(prompt, {
        temperature: 0.6,  // Slightly creative but focused
        max_tokens: 2000,
        timeout: 60000
      });

      // Split the response into an array of questions
      const questions = result
        .split('\n')
        .map(q => q.trim())
        .filter(q => q.length > 0 && (/^\d+\./.test(q) || q.length > 3)); // Keep numbered items or substantial text

      setGeneratedQuestions(questions);
      toast.success("Survey questions generated!");
    } catch (error: any) {
      console.error("Error generating survey questions:", error);
      toast.error(error.message || "Failed to generate questions. Please try again.");
    } finally {
      setIsGenerating(false);
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
        <Input
          id="survey-topic"
          placeholder="e.g., The Impact of AI on Higher Education"
          value={surveyTopic}
          onChange={e => setSurveyTopic(e.target.value)}
          disabled={isGenerating}
        />
      </div>
      <div className="space-y-2">
        <Label>Question Type</Label>
        <RadioGroup value={questionType} onValueChange={setQuestionType} disabled={isGenerating}>
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
      <Button
        onClick={handleGenerateQuestions}
        disabled={isGenerating || !surveyTopic}
      >
        <Wand2 className="w-4 h-4 mr-2" />
        {isGenerating ? "Generating..." : "Generate Questions"}
      </Button>
      {generatedQuestions.length > 0 && (
        <div className="relative">
          <Textarea
            value={generatedQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n\n')}
            readOnly
            rows={Math.max(8, generatedQuestions.length)}
          />
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