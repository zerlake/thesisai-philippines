"use client";

import { type Editor } from "@tiptap/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Languages, Loader2, Sparkles, TextQuote, MessageSquare, AlertCircle, ChevronDown, RefreshCw, Eye } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { callPuterAI } from "@/lib/puter-ai-wrapper";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface ReviewerAiToolkitProps {
  editor: Editor | null;
}

type StructuredFeedback = {
  positive: string;
  improvement: string;
};

type WritingTone = 'formal' | 'professional' | 'conversational' | 'academic';
type TargetAudience = 'academic' | 'professional' | 'general' | 'expert';
type ComplexityLevel = 'advanced' | 'intermediate' | 'beginner';

export function ReviewerAiToolkit({ editor }: ReviewerAiToolkitProps) {
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [generatedFeedback, setGeneratedFeedback] = useState<StructuredFeedback | null>(null);
  const [generatedContentType, setGeneratedContentType] = useState<string | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [selectedTone, setSelectedTone] = useState<WritingTone>('academic');
  const [selectedAudience, setSelectedAudience] = useState<TargetAudience>('academic');
  const [selectedComplexity, setSelectedComplexity] = useState<ComplexityLevel>('intermediate');
  const [previewMode, setPreviewMode] = useState(false);

  const getSelectedText = () => {
    if (!editor) return "";
    const { from, to } = editor.state.selection;
    return editor.state.doc.textBetween(from, to);
  };

  const getToneDescription = (tone: WritingTone): string => {
    const descriptions: Record<WritingTone, string> = {
      formal: 'Highly formal, suitable for official documents and formal academic writing',
      professional: 'Professional yet approachable, suitable for business and academic contexts',
      conversational: 'Conversational and engaging, easier to read and understand',
      academic: 'Academic and objective, suitable for research papers and theses'
    };
    return descriptions[tone];
  };

  const getAudienceDescription = (audience: TargetAudience): string => {
    const descriptions: Record<TargetAudience, string> = {
      academic: 'University students and academic professionals',
      professional: 'Business professionals and industry experts',
      general: 'General educated audience without specialized knowledge',
      expert: 'Highly specialized experts in the field'
    };
    return descriptions[audience];
  };

  const handleAiAction = async (action: 'improve' | 'summarize' | 'paraphrase') => {
    const selectedText = getSelectedText();
    if (!selectedText) {
      toast.info("Please select some text in the document first.");
      return;
    }

    if (!session) {
      toast.error("You must be logged in to use AI features.");
      return;
    }

    setIsLoading(action);
    setGeneratedContent(null);
    setGeneratedFeedback(null);

    try {
      let prompt = '';
      let contentType = '';
      const toneInstructions: Record<WritingTone, string> = {
        formal: 'Use formal, sophisticated language. Avoid contractions and colloquialisms.',
        professional: 'Use professional language that is accessible but authoritative.',
        conversational: 'Use conversational, engaging language that is easy to understand.',
        academic: 'Maintain academic tone suitable for scholarly work.'
      };

      const audienceInstructions: Record<TargetAudience, string> = {
        academic: 'Tailor the content for university students and academic professionals.',
        professional: 'Tailor the content for business professionals and industry experts.',
        general: 'Make the content accessible to educated readers without specialized knowledge.',
        expert: 'Assume expertise in the field and use specialized terminology appropriately.'
      };

      const complexityInstructions: Record<ComplexityLevel, string> = {
        advanced: 'Use advanced vocabulary and complex sentence structures.',
        intermediate: 'Use intermediate vocabulary and balanced sentence complexity.',
        beginner: 'Use simpler vocabulary and clearer, shorter sentences.'
      };

      switch (action) {
        case 'improve':
          prompt = `You are an expert academic editor and writing coach. Your task is to revise the following text to improve its clarity, conciseness, and overall quality.

Requirements:
${toneInstructions[selectedTone]}
${audienceInstructions[selectedAudience]}
${complexityInstructions[selectedComplexity]}
- Correct any grammatical errors.
- Rephrase awkward sentences.
- Ensure logical flow and coherence.
- Do not change the core meaning of the text.
- Return only the improved text, with no additional comments or explanations.

Text to improve:
"${selectedText}"

Improved text:`;
          contentType = 'Improved Version';
          break;

        case 'summarize':
          prompt = `You are an expert academic summarizer. Your task is to create a concise summary of the provided text while preserving all important information.

Requirements:
${audienceInstructions[selectedAudience]}
${complexityInstructions[selectedComplexity]}
- Keep the core meaning and important information.
- Make it concise (typically 25-33% of original length).
- Maintain ${selectedTone} tone.
- Return only the summarized text, with no additional comments or explanations.

Text to summarize:
"${selectedText}"

Summary:`;
          contentType = 'Summary';
          break;

        case 'paraphrase':
          prompt = `You are an expert paraphrase specialist. Your task is to rephrase the following text with different vocabulary and sentence structure while preserving the exact meaning.

Requirements:
${toneInstructions[selectedTone]}
${audienceInstructions[selectedAudience]}
${complexityInstructions[selectedComplexity]}
- The new version should have a different sentence structure and use different vocabulary.
- It must retain the original meaning with absolute precision.
- Vary the sentence patterns and word choices significantly.
- Return only the paraphrased text, with no additional comments or explanations.

Text to paraphrase:
"${selectedText}"

Paraphrased text:`;
          contentType = 'Paraphrased Version';
          break;
      }

      const result = await callPuterAI(prompt, {
        temperature: 0.7,
        max_tokens: 2000,
        timeout: 30000
      });

      setGeneratedContent(result);
      setGeneratedContentType(contentType);
      setPreviewMode(true);
    } catch (error: any) {
      const message = error instanceof Error ? error.message : 'Failed to process text';
      toast.error(message);
    } finally {
      setIsLoading(null);
    }
  };

  const handleGenerateFeedback = async () => {
    const selectedText = getSelectedText();
    if (!selectedText) {
      toast.info("Please select some text in the document first.");
      return;
    }

    if (!session) {
      toast.error("You must be logged in to use AI features.");
      return;
    }

    setIsLoading('feedback');
    setGeneratedContent(null);
    setGeneratedFeedback(null);

    try {
      const prompt = `You are an expert academic reviewer and writing coach. Analyze the following text and provide detailed, constructive feedback.

Evaluate the text based on:
- Clarity and Coherence: Are ideas clearly expressed and logically connected?
- Academic Tone: Is the tone appropriate for academic writing?
- Grammar and Mechanics: Are there grammatical errors or mechanical issues?
- Structure: Is the text well-organized with clear progression of ideas?
- Audience Appropriateness: Is it suitable for ${selectedAudience} audience?

Provide your response as JSON with these exact fields:
{
  "positive": "Two specific strengths of the text (2-3 sentences)",
  "improvement": "Three actionable suggestions for improvement (2-3 sentences)"
}

Text to review:
"${selectedText}"

Response (JSON only):`;

      const result = await callPuterAI(prompt, {
        temperature: 0.7,
        max_tokens: 1000,
        timeout: 30000
      });

      try {
        const feedback = JSON.parse(result);
        setGeneratedFeedback({
          positive: feedback.positive || 'Well written.',
          improvement: feedback.improvement || 'Consider revising for clarity.'
        });
        setGeneratedContentType('Detailed Feedback');
        setPreviewMode(true);
      } catch {
        setGeneratedContent(result);
        setGeneratedContentType('Feedback');
        setPreviewMode(true);
      }
    } catch (error: any) {
      const message = error instanceof Error ? error.message : 'Failed to generate feedback';
      toast.error(message);
    } finally {
      setIsLoading(null);
    }
  };

  const handleCopy = () => {
    if (!generatedContent) return;
    navigator.clipboard.writeText(generatedContent);
    toast.success("Suggestion copied to clipboard!");
  };

  const handleInsert = () => {
    if (!generatedContent || !editor) return;
    const { from, to } = editor.state.selection;
    editor.chain().focus().deleteRange({ from, to }).insertContent(generatedContent).run();
    toast.success("Text inserted into document!");
    setGeneratedContent(null);
    setGeneratedFeedback(null);
    setGeneratedContentType(null);
    setPreviewMode(false);
  };

  const handleRegenerate = () => {
    if (generatedContentType === 'Improved Version') {
      handleAiAction('improve');
    } else if (generatedContentType === 'Summary') {
      handleAiAction('summarize');
    } else if (generatedContentType === 'Paraphrased Version') {
      handleAiAction('paraphrase');
    } else if (generatedContentType === 'Detailed Feedback') {
      handleGenerateFeedback();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Professional Writing Assistant
        </CardTitle>
        <CardDescription>Select text to enhance your writing with AI-powered suggestions and feedback.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Advanced Options Toggle */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className="gap-2"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedOptions ? 'rotate-180' : ''}`} />
            Advanced Options
          </Button>
        </div>

        {/* Advanced Options Panel */}
        {showAdvancedOptions && (
          <div className="bg-muted p-4 rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Writing Tone</label>
                <Select value={selectedTone} onValueChange={(value) => setSelectedTone(value as WritingTone)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="conversational">Conversational</SelectItem>
                    <SelectItem value="academic">Academic</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">{getToneDescription(selectedTone)}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Target Audience</label>
                <Select value={selectedAudience} onValueChange={(value) => setSelectedAudience(value as TargetAudience)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">{getAudienceDescription(selectedAudience)}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Complexity Level</label>
                <Select value={selectedComplexity} onValueChange={(value) => setSelectedComplexity(value as ComplexityLevel)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Vocabulary and sentence complexity level</p>
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Quick Action Buttons */}
        <Tabs defaultValue="enhance" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="enhance">Enhance</TabsTrigger>
            <TabsTrigger value="analyze">Analyze</TabsTrigger>
          </TabsList>

          <TabsContent value="enhance" className="space-y-3 mt-4">
            <Button 
              onClick={() => handleAiAction('improve')} 
              disabled={!!isLoading} 
              className="w-full justify-start h-auto py-2"
            >
              {isLoading === 'improve' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              <div className="text-left">
                <div className="font-medium">Improve Selection</div>
                <div className="text-xs text-muted-foreground">Enhance clarity, grammar, and flow</div>
              </div>
            </Button>
            <Button 
              onClick={() => handleAiAction('summarize')} 
              disabled={!!isLoading} 
              className="w-full justify-start h-auto py-2"
            >
              {isLoading === 'summarize' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <TextQuote className="w-4 h-4 mr-2" />}
              <div className="text-left">
                <div className="font-medium">Summarize Selection</div>
                <div className="text-xs text-muted-foreground">Create a concise summary</div>
              </div>
            </Button>
            <Button 
              onClick={() => handleAiAction('paraphrase')} 
              disabled={!!isLoading} 
              className="w-full justify-start h-auto py-2"
            >
              {isLoading === 'paraphrase' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Languages className="w-4 h-4 mr-2" />}
              <div className="text-left">
                <div className="font-medium">Paraphrase Selection</div>
                <div className="text-xs text-muted-foreground">Rephrase with different wording</div>
              </div>
            </Button>
          </TabsContent>

          <TabsContent value="analyze" className="space-y-3 mt-4">
            <Button 
              onClick={handleGenerateFeedback} 
              disabled={!!isLoading} 
              className="w-full justify-start h-auto py-2"
            >
              {isLoading === 'feedback' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MessageSquare className="w-4 h-4 mr-2" />}
              <div className="text-left">
                <div className="font-medium">Generate Detailed Feedback</div>
                <div className="text-xs text-muted-foreground">Get expert analysis and suggestions</div>
              </div>
            </Button>
          </TabsContent>
        </Tabs>

        {/* Generated Content Preview */}
        {generatedContentType && (
          <>
            <Separator className="my-4" />
            <div className="bg-card border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm">{generatedContentType}</h3>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={handleRegenerate}
                    disabled={!!isLoading}
                    className="h-auto p-1"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  {generatedContent && (
                    <>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={handleCopy}
                        className="h-auto p-1"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="default" 
                        onClick={handleInsert}
                        className="h-auto px-3"
                      >
                        Insert
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-muted p-3 rounded text-sm max-h-64 overflow-y-auto">
                {generatedFeedback ? (
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-sm mb-1 text-green-700 dark:text-green-400">✓ Strengths:</p>
                      <p className="text-sm">{generatedFeedback.positive}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="font-semibold text-sm mb-1 text-blue-700 dark:text-blue-400">→ Suggestions:</p>
                      <p className="text-sm">{generatedFeedback.improvement}</p>
                    </div>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {generatedContent}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Info Alert */}
        {!generatedContentType && (
          <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertTitle className="text-blue-900 dark:text-blue-200">Tips for best results</AlertTitle>
            <AlertDescription className="text-blue-800 dark:text-blue-300 text-sm">
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Select 50-500 words for best results</li>
                <li>Customize tone and audience in Advanced Options</li>
                <li>Regenerate results if you want variations</li>
                <li>Use feedback to improve your writing skills</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
