"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { FilePlus2, Wand2, Lightbulb, CheckCircle2, Copy, Loader2 } from "lucide-react";
import { useAuth } from "./auth-provider";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { FieldOfStudySelector } from "./field-of-study-selector";
import { Skeleton } from "./ui/skeleton";
import { callPuterAI } from "@/lib/puter-ai-wrapper";

type ResearchQuestion = {
  question: string;
  type: string;
  chapter: string;
  rationale: string;
};

type Hypothesis = {
  null_hypothesis: string;
  alternative_hypothesis: string;
  variables: {
    independent: string[];
    dependent: string[];
  };
  testable: boolean;
};

type AlignmentSuggestion = {
  question: string;
  aligned_literature: string[];
  gaps_identified: string[];
  methodology_implications: string;
};

export function ResearchQuestionGenerator() {
  const { session, supabase } = useAuth();
  const router = useRouter();
  const [field, setField] = useState("");
  const [topic, setTopic] = useState("");
  const [researchType, setResearchType] = useState("quantitative");
  const [literatureContext, setLiteratureContext] = useState("");
  
  const [researchQuestions, setResearchQuestions] = useState<ResearchQuestion[]>([]);
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [alignmentSuggestions, setAlignmentSuggestions] = useState<AlignmentSuggestion[]>([]);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("questions");
  const [isSaving, setIsSaving] = useState(false);

  const handleGenerateQuestions = async () => {
    if (!topic || !field) {
      toast.error("Please provide a topic and field of study.");
      return;
    }
    if (!session) {
      toast.error("You must be logged in to use this feature.");
      return;
    }

    setIsGenerating(true);
    setResearchQuestions([]);

    try {
      const prompt = `You are an expert academic advisor. Generate EXACTLY 5-7 research questions for a thesis about "${topic}" in the field of "${field}".

Requirements:
- Questions should progress from broad to specific
- Include descriptive, exploratory, explanatory, and evaluative questions
- Each question should be 8-15 words
- Questions must be answerable through research
- Context: Philippines academic standards

For each question, provide:
1. The question itself
2. Type (e.g., descriptive, exploratory, explanatory, evaluative)
3. Chapter (e.g., Introduction, Literature Review, Methodology, Results, Discussion)
4. Rationale (1-2 sentences explaining the question's importance)

Return ONLY a valid JSON array with this structure:
[
  {
    "question": "...",
    "type": "descriptive|exploratory|explanatory|evaluative",
    "chapter": "Introduction|Literature Review|Methodology|Results|Discussion",
    "rationale": "..."
  }
]

Do not include any text outside the JSON array.`;

      const result = await callPuterAI(prompt, {
        temperature: 0.6,
        max_tokens: 2500,
        timeout: 30000,
      });

      const parsed = JSON.parse(result);
      if (!Array.isArray(parsed)) {
        throw new Error("Invalid response format: expected JSON array");
      }

      setResearchQuestions(parsed);
      toast.success(`Generated ${parsed.length} research questions!`);
    } catch (error: any) {
      console.error("Research question generation error:", error);
      const message = error?.message || "Failed to generate research questions. Please try again.";
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateHypotheses = async () => {
    if (!topic || !field) {
      toast.error("Please provide a topic and field of study.");
      return;
    }
    if (!session) {
      toast.error("You must be logged in to use this feature.");
      return;
    }

    if (researchType !== "quantitative") {
      toast.info("Hypotheses are typically used in quantitative research.");
    }

    setIsGenerating(true);
    setHypotheses([]);

    try {
      const prompt = `You are an expert researcher. Generate EXACTLY 3-5 testable research hypotheses for a thesis about "${topic}" in the field of "${field}".

Requirements:
- All hypotheses must be testable and falsifiable
- Should follow null hypothesis (H₀) and alternative hypothesis (H₁) format
- Include identified independent and dependent variables
- Be scientifically rigorous and specific

For each hypothesis, provide:
1. Null hypothesis (H₀)
2. Alternative hypothesis (H₁)
3. Independent variables (list)
4. Dependent variables (list)
5. Whether it's testable (true/false)

Return ONLY a valid JSON array with this structure:
[
  {
    "null_hypothesis": "H₀: ...",
    "alternative_hypothesis": "H₁: ...",
    "variables": {
      "independent": ["var1", "var2"],
      "dependent": ["outcome1", "outcome2"]
    },
    "testable": true
  }
]

Do not include any text outside the JSON array.`;

      const result = await callPuterAI(prompt, {
        temperature: 0.5,
        max_tokens: 2500,
        timeout: 30000,
      });

      const parsed = JSON.parse(result);
      if (!Array.isArray(parsed)) {
        throw new Error("Invalid response format: expected JSON array");
      }

      setHypotheses(parsed);
      toast.success(`Generated ${parsed.length} hypotheses!`);
    } catch (error: any) {
      console.error("Hypothesis generation error:", error);
      const message = error?.message || "Failed to generate hypotheses. Please try again.";
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAlignWithLiterature = async () => {
    if (researchQuestions.length === 0) {
      toast.error("Please generate research questions first.");
      return;
    }
    if (!session) {
      toast.error("You must be logged in to use this feature.");
      return;
    }

    if (!literatureContext) {
      toast.error("Please provide literature context for alignment.");
      return;
    }

    setIsGenerating(true);
    setAlignmentSuggestions([]);

    try {
      const questionsText = researchQuestions.map((q, i) => `${i + 1}. ${q.question}`).join('\n');

      const prompt = `You are an expert academic researcher. Align these research questions with relevant academic literature about "${topic}" in the field of "${field}".

Research Questions:
${questionsText}

Literature Context:
${literatureContext}

For EACH question, provide:
1. The question itself
2. Relevant aligned literature (3-4 key theories, frameworks, or authors)
3. Research gaps this question addresses (2-3 specific gaps)
4. Methodology implications (1-2 sentences on how this shapes the research approach)

Return ONLY a valid JSON array with this structure:
[
  {
    "question": "...",
    "aligned_literature": ["theory/author1", "theory/author2", "theory/author3"],
    "gaps_identified": ["gap1", "gap2", "gap3"],
    "methodology_implications": "..."
  }
]

Do not include any text outside the JSON array.`;

      const result = await callPuterAI(prompt, {
        temperature: 0.6,
        max_tokens: 3000,
        timeout: 30000,
      });

      const parsed = JSON.parse(result);
      if (!Array.isArray(parsed)) {
        throw new Error("Invalid response format: expected JSON array");
      }

      setAlignmentSuggestions(parsed);
      toast.success("Alignment analysis complete!");
    } catch (error: any) {
      console.error("Literature alignment error:", error);
      const message = error?.message || "Failed to align questions with literature. Please try again.";
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleSaveAsDraft = async () => {
    if (!session?.user || (!researchQuestions.length && !hypotheses.length)) return;
    setIsSaving(true);

    let content = `<h1>Research Questions & Hypotheses</h1>`;
    content += `<p><strong>Topic:</strong> ${topic}</p>`;
    content += `<p><strong>Field:</strong> ${field}</p>`;
    content += `<p><strong>Research Type:</strong> ${researchType}</p>`;
    content += `<hr>`;

    if (researchQuestions.length > 0) {
      content += `<h2>Research Questions</h2>`;
      researchQuestions.forEach((rq, idx) => {
        content += `<h3>${idx + 1}. ${rq.question}</h3>`;
        content += `<p><strong>Type:</strong> ${rq.type} | <strong>Chapter:</strong> ${rq.chapter}</p>`;
        content += `<p><strong>Rationale:</strong> ${rq.rationale}</p>`;
        content += `<hr>`;
      });
    }

    if (hypotheses.length > 0) {
      content += `<h2>Hypotheses</h2>`;
      hypotheses.forEach((h, idx) => {
        content += `<h3>Hypothesis ${idx + 1}</h3>`;
        content += `<p><strong>Null Hypothesis (H₀):</strong> ${h.null_hypothesis}</p>`;
        content += `<p><strong>Alternative Hypothesis (H₁):</strong> ${h.alternative_hypothesis}</p>`;
        content += `<p><strong>Independent Variables:</strong> ${h.variables.independent.join(', ')}</p>`;
        content += `<p><strong>Dependent Variables:</strong> ${h.variables.dependent.join(', ')}</p>`;
        content += `<hr>`;
      });
    }

    if (alignmentSuggestions.length > 0) {
      content += `<h2>Literature Alignment</h2>`;
      alignmentSuggestions.forEach((align, _idx) => {
         content += `<h3>Question: ${align.question}</h3>`;
        content += `<p><strong>Aligned Literature:</strong> ${align.aligned_literature.join('; ')}</p>`;
        content += `<p><strong>Research Gaps:</strong> ${align.gaps_identified.join('; ')}</p>`;
        content += `<p><strong>Methodology Implications:</strong> ${align.methodology_implications}</p>`;
        content += `<hr>`;
      });
    }

    const { data: newDoc, error } = await supabase
      .from("documents")
      .insert({
        user_id: session.user.id,
        title: `Research Questions: ${topic}`,
        content,
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
    <div className="max-w-5xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Research Question & Hypothesis Generator</CardTitle>
          <CardDescription>
            Generate research questions for each chapter, create testable hypotheses, and align them with your literature review.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Field of Study</Label>
              <FieldOfStudySelector
                value={field}
                onValueChange={setField}
                disabled={isGenerating}
              />
            </div>
            <div className="space-y-2">
              <Label>Research Type</Label>
              <Select value={researchType} onValueChange={setResearchType} disabled={isGenerating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quantitative">Quantitative</SelectItem>
                  <SelectItem value="qualitative">Qualitative</SelectItem>
                  <SelectItem value="mixed-methods">Mixed Methods</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Research Topic</Label>
            <Input
              id="topic"
              placeholder="e.g., The Impact of Online Learning on Student Performance"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isGenerating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="literature">Literature Context (Optional)</Label>
            <Textarea
              id="literature"
              placeholder="Briefly summarize key findings from your literature review..."
              value={literatureContext}
              onChange={(e) => setLiteratureContext(e.target.value)}
              disabled={isGenerating}
              rows={4}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={handleGenerateQuestions} 
              disabled={isGenerating || !topic || !field || !session}
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4 mr-2" />
              )}
              Generate Questions
            </Button>
            
            {researchType === "quantitative" && (
              <Button 
                onClick={handleGenerateHypotheses} 
                disabled={isGenerating || !topic || !field || !session}
                variant="outline"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Lightbulb className="w-4 h-4 mr-2" />
                )}
                Generate Hypotheses
              </Button>
            )}

            {researchQuestions.length > 0 && literatureContext && (
              <Button 
                onClick={handleAlignWithLiterature} 
                disabled={isGenerating || !session}
                variant="outline"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                )}
                Align with Literature
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {(researchQuestions.length > 0 || hypotheses.length > 0 || alignmentSuggestions.length > 0) && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Generated Content</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSaveAsDraft} 
                disabled={isSaving}
              >
                <FilePlus2 className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save as Draft"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="questions">
                  Questions ({researchQuestions.length})
                </TabsTrigger>
                <TabsTrigger value="hypotheses">
                  Hypotheses ({hypotheses.length})
                </TabsTrigger>
                <TabsTrigger value="alignment">
                  Alignment ({alignmentSuggestions.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="questions" className="space-y-4 mt-4">
                {isGenerating && researchQuestions.length === 0 ? (
                  <div className="space-y-3">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                ) : researchQuestions.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {researchQuestions.map((rq, idx) => (
                      <AccordionItem key={idx} value={`question-${idx}`}>
                        <AccordionTrigger>
                          <div className="flex items-center gap-2 text-left">
                            <Badge variant="outline">{rq.chapter}</Badge>
                            <span className="font-medium">{rq.question}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3 pt-2">
                            <div>
                              <span className="text-sm font-semibold">Type: </span>
                              <Badge>{rq.type}</Badge>
                            </div>
                            <div>
                              <span className="text-sm font-semibold">Rationale:</span>
                              <p className="text-sm text-muted-foreground mt-1">{rq.rationale}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyToClipboard(rq.question)}
                            >
                              <Copy className="w-3 h-3 mr-2" />
                              Copy Question
                            </Button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <Alert>
                    <AlertTitle>No Questions Generated</AlertTitle>
                    <AlertDescription>
                      Click &quot;Generate Questions&quot; to create research questions for your topic.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="hypotheses" className="space-y-4 mt-4">
                {isGenerating && hypotheses.length === 0 ? (
                  <div className="space-y-3">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                ) : hypotheses.length > 0 ? (
                  <div className="space-y-4">
                    {hypotheses.map((h, idx) => (
                      <Card key={idx}>
                        <CardHeader>
                          <CardTitle className="text-base">Hypothesis {idx + 1}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <Label className="text-sm font-semibold">Null Hypothesis (H₀):</Label>
                            <p className="text-sm mt-1">{h.null_hypothesis}</p>
                          </div>
                          <Separator />
                          <div>
                            <Label className="text-sm font-semibold">Alternative Hypothesis (H₁):</Label>
                            <p className="text-sm mt-1">{h.alternative_hypothesis}</p>
                          </div>
                          <Separator />
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-semibold">Independent Variables:</Label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {h.variables.independent.map((iv, i) => (
                                  <Badge key={i} variant="secondary">{iv}</Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-semibold">Dependent Variables:</Label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {h.variables.dependent.map((dv, i) => (
                                  <Badge key={i} variant="secondary">{dv}</Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Label className="text-sm font-semibold">Testable:</Label>
                            {h.testable ? (
                              <Badge className="bg-green-500">Yes</Badge>
                            ) : (
                              <Badge variant="destructive">Needs Refinement</Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyToClipboard(`H₀: ${h.null_hypothesis}\nH₁: ${h.alternative_hypothesis}`)}
                          >
                            <Copy className="w-3 h-3 mr-2" />
                            Copy Hypotheses
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <AlertTitle>No Hypotheses Generated</AlertTitle>
                    <AlertDescription>
                      Click &quot;Generate Hypotheses&quot; to create testable hypotheses for your research questions.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="alignment" className="space-y-4 mt-4">
                {isGenerating && alignmentSuggestions.length === 0 ? (
                  <div className="space-y-3">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                ) : alignmentSuggestions.length > 0 ? (
                  <div className="space-y-4">
                    {alignmentSuggestions.map((align, idx) => (
                      <Card key={idx}>
                        <CardHeader>
                          <CardTitle className="text-base">{align.question}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <Label className="text-sm font-semibold">Aligned Literature:</Label>
                            <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                              {align.aligned_literature.map((lit, i) => (
                                <li key={i} className="text-muted-foreground">{lit}</li>
                              ))}
                            </ul>
                          </div>
                          <Separator />
                          <div>
                            <Label className="text-sm font-semibold">Research Gaps Identified:</Label>
                            <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                              {align.gaps_identified.map((gap, i) => (
                                <li key={i} className="text-muted-foreground">{gap}</li>
                              ))}
                            </ul>
                          </div>
                          <Separator />
                          <div>
                            <Label className="text-sm font-semibold">Methodology Implications:</Label>
                            <p className="text-sm text-muted-foreground mt-1">{align.methodology_implications}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Alert>
                    <AlertTitle>No Alignment Analysis</AlertTitle>
                    <AlertDescription>
                      Provide literature context and click &quot;Align with Literature&quot; to see how your questions align with existing research.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
