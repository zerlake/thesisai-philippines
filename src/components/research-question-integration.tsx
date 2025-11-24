"use client";

import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { FilePlus2, Wand2, Lightbulb, CheckCircle2, Copy, Loader2, BookOpen, FlaskConical } from "lucide-react";
import { useAuth } from "../components/auth-provider";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { FieldOfStudySelector } from "../components/field-of-study-selector";
import { Skeleton } from "../components/ui/skeleton";

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

type Paper = {
  id: string;
  title: string;
  link: string;
  publication_info: string;
  snippet: string;
};

export function ResearchQuestionIntegration() {
  const { session, supabase } = useAuth();
  
  // Verify that Supabase client is properly configured
  if (!supabase) {
    console.error("Supabase client is not available. Check your auth provider setup.");
  }
  const router = useRouter();
  
  // Research question generation states
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

  // Literature review states
  const [papers, setPapers] = useState<Paper[]>([]);
  const [selectedPapers, setSelectedPapers] = useState<Paper[]>([]);
  const [synthesizedText, setSynthesizedText] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [literatureActiveTab, setLiteratureActiveTab] = useState("search");

  const handleGenerateQuestions = async () => {
    if (!topic || !field) {
      toast.error("Please provide a topic and field of study.");
      return;
    }

    setIsGenerating(true);
    setResearchQuestions([]);

    try {
      if (!session) {
        throw new Error("Authentication session not found. Please log in again.");
      }
      const response = await supabase.functions.invoke('generate-research-questions', {
        body: { 
          topic, 
          field, 
          researchType,
          literatureContext: literatureContext || undefined
        }
      });
      if (response.error) {
        console.error("Supabase function error:", response.error);
        throw new Error(response.error.message || 'Failed to generate research questions');
      }

      if (response.data?.questions) {
        setResearchQuestions(response.data.questions);
        toast.success("Research questions generated successfully!");
      } else {
        throw new Error("No research questions returned from function.");
      }
    } catch (error: any) {
      console.error("Error in handleGenerateQuestions:", error);
      if (error.name === 'FetchError' || error.message.includes('Failed to send a request')) {
        toast.error("Unable to connect to the research generation service. Please check your internet connection and ensure the Supabase functions are properly deployed.");
      } else {
        toast.error(error.message || "An unexpected error occurred while generating research questions.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateHypotheses = async () => {
    if (!topic || !field) {
      toast.error("Please provide a topic and field of study.");
      return;
    }

    if (researchType !== "quantitative") {
      toast.info("Hypotheses are typically used in quantitative research.");
    }

    setIsGenerating(true);
    setHypotheses([]);

    try {
      if (!session) {
        throw new Error("Authentication session not found. Please log in again.");
      }
      const response = await supabase.functions.invoke('generate-hypotheses', {
        body: { 
          topic, 
          field,
          researchQuestions: researchQuestions.map(rq => rq.question)
        }
      });
      if (response.error) {
        console.error("Supabase function error:", response.error);
        throw new Error(response.error.message || 'Failed to generate hypotheses');
      }

      if (response.data?.hypotheses) {
        setHypotheses(response.data.hypotheses);
        toast.success("Hypotheses generated successfully!");
      } else {
        throw new Error("No hypotheses returned from function.");
      }
    } catch (error: any) {
      console.error("Error in handleGenerateHypotheses:", error);
      if (error.name === 'FetchError' || error.message.includes('Failed to send a request')) {
        toast.error("Unable to connect to the hypothesis generation service. Please check your internet connection and ensure the Supabase functions are properly deployed.");
      } else {
        toast.error(error.message || "An unexpected error occurred while generating hypotheses.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAlignWithLiterature = async () => {
    if (researchQuestions.length === 0) {
      toast.error("Please generate research questions first.");
      return;
    }

    if (!literatureContext) {
      toast.error("Please provide literature context for alignment.");
      return;
    }

    setIsGenerating(true);
    setAlignmentSuggestions([]);

    try {
      if (!session) {
        throw new Error("Authentication session not found. Please log in again.");
      }
      const response = await supabase.functions.invoke('align-questions-with-literature', {
        body: { 
          researchQuestions: researchQuestions.map(rq => rq.question),
          literatureContext,
          field
        }
      });
      if (response.error) {
        console.error("Supabase function error:", response.error);
        throw new Error(response.error.message || 'Failed to align questions with literature');
      }

      if (response.data?.alignments) {
        setAlignmentSuggestions(response.data.alignments);
        toast.success("Alignment analysis complete!");
      } else {
        throw new Error("No alignment suggestions returned from function.");
      }
    } catch (error: any) {
      console.error("Error in handleAlignWithLiterature:", error);
      if (error.name === 'FetchError' || error.message.includes('Failed to send a request')) {
        toast.error("Unable to connect to the literature alignment service. Please check your internet connection and ensure the Supabase functions are properly deployed.");
      } else {
        toast.error(error.message || "An unexpected error occurred while aligning questions with literature.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;

    setIsSearching(true);
    setPapers([]);
    setSelectedPapers([]);
    setSynthesizedText("");

    try {
      // Call our API route which proxies to ArXiv
      const response = await fetch(`/api/arxiv-search?query=${encodeURIComponent(topic)}`);

      if (!response.ok) {
        throw new Error(`Search failed with status ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.papers && data.papers.length > 0) {
        setPapers(data.papers);
        toast.success(`Found ${data.papers.length} papers from ArXiv`);
      } else {
        toast.info("No papers found for your search. Try different keywords.");
      }
    } catch (error: any) {
      console.error("ArXiv search error:", error);
      toast.error(error.message || "Failed to search ArXiv. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handlePaperSelection = (paper: Paper, isSelected: boolean) => {
    if (isSelected) {
      setSelectedPapers([...selectedPapers, paper]);
    } else {
      setSelectedPapers(selectedPapers.filter(p => p.id !== paper.id));
    }
  };

  const handleSynthesize = async () => {
    if (selectedPapers.length < 2) {
      toast.info("Please select at least two sources to synthesize.");
      return;
    }
    if (!session) {
      toast.error("You must be logged in to synthesize sources.");
      return;
    }
    setIsSynthesizing(true);
    setSynthesizedText("");
    try {
      const response = await fetch(
        "https://dnyjgzzfyzrsucucexhy.supabase.co/functions/v1/synthesize-literature",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          },
          body: JSON.stringify({ papers: selectedPapers.map(p => ({ title: p.title, snippet: p.snippet })) }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setSynthesizedText(data.synthesizedText);
      toast.success("Synthesis complete!");
    } catch (error: any) {
      toast.error(error.message || "Failed to synthesize sources.");
    } finally {
      setIsSynthesizing(false);
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
        content += `<p><strong>Independent Variables:</strong> ${h.variables?.independent?.join(', ') || 'Not specified'}</p>`;
        content += `<p><strong>Dependent Variables:</strong> ${h.variables?.dependent?.join(', ') || 'Not specified'}</p>`;
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

    if (synthesizedText) {
      content += `<h2>Literature Synthesis</h2><p>${synthesizedText}</p>`;
    }

    if (papers.length > 0) {
      content += "<h3>Found Sources</h3>";
      papers.forEach(p => {
        content += `<hr>`;
        content += `<h4><a href="${p.link}" target="_blank" rel="noopener noreferrer">${p.title}</a></h4>`;
        if (p.publication_info) {
          content += `<p><strong>Source:</strong> ${p.publication_info}</p>`;
        }
        content += `<p><strong>Snippet:</strong> ${p.snippet}</p>`;
      });
    }

    const { data: newDoc, error } = await supabase
      .from("documents")
      .insert({
        user_id: session.user.id,
        title: `Research: ${topic}`,
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
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="w-6 h-6" />
            Research Question & Literature Integration
          </CardTitle>
          <CardDescription>
            Generate research questions for each chapter, create testable hypotheses, and align them with your literature review.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Field of Study</Label>
              <FieldOfStudySelector
                value={field}
                onValueChange={setField}
                disabled={isGenerating || isSearching}
              />
            </div>
            <div className="space-y-2">
              <Label>Research Type</Label>
              <Select value={researchType} onValueChange={setResearchType} disabled={isGenerating || isSearching}>
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
              disabled={isGenerating || isSearching}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="literature">Literature Context (Optional)</Label>
            <Textarea
              id="literature"
              placeholder="Briefly summarize key findings from your literature review..."
              value={literatureContext}
              onChange={(e) => setLiteratureContext(e.target.value)}
              disabled={isGenerating || isSearching}
              rows={4}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={handleGenerateQuestions} 
              disabled={isGenerating || isSearching || !topic || !field || !session}
            >
              {isGenerating && activeTab === "questions" ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4 mr-2" />
              )}
              Generate Questions
            </Button>
            
            {researchType === "quantitative" && (
              <Button 
                onClick={handleGenerateHypotheses} 
                disabled={isGenerating || isSearching || !topic || !field || !session}
                variant="outline"
              >
                {isGenerating && activeTab === "hypotheses" ? (
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
                disabled={isGenerating || isSearching || !session}
                variant="outline"
              >
                {isGenerating && activeTab === "alignment" ? (
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

      <Tabs value={literatureActiveTab} onValueChange={setLiteratureActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="research">Research Questions & Hypotheses</TabsTrigger>
          <TabsTrigger value="literature">Literature Review</TabsTrigger>
        </TabsList>
        
        <TabsContent value="research" className="space-y-4">
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
                    {isGenerating && activeTab === "questions" && researchQuestions.length === 0 ? (
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
                    {isGenerating && activeTab === "hypotheses" && hypotheses.length === 0 ? (
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
                                    {h.variables?.independent?.length > 0 ? (
                                      h.variables?.independent.map((iv, i) => (
                                        <Badge key={i} variant="secondary">{iv}</Badge>
                                      ))
                                    ) : (
                                      <span className="text-sm text-muted-foreground">No independent variables specified</span>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-sm font-semibold">Dependent Variables:</Label>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {h.variables?.dependent?.length > 0 ? (
                                      h.variables?.dependent.map((dv, i) => (
                                        <Badge key={i} variant="secondary">{dv}</Badge>
                                      ))
                                    ) : (
                                      <span className="text-sm text-muted-foreground">No dependent variables specified</span>
                                    )}
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
                    {isGenerating && activeTab === "alignment" && alignmentSuggestions.length === 0 ? (
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
        </TabsContent>
        
        <TabsContent value="literature" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Literature Review Assistant
              </CardTitle>
              <CardDescription>
                Search for sources, then select at least two to generate a synthesized paragraph.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex items-center gap-2 mt-4">
                <Input 
                  id="topic" 
                  placeholder="e.g., Transformer architecture in NLP" 
                  value={topic} 
                  onChange={(e) => setTopic(e.target.value)} 
                  disabled={isSearching || isGenerating} 
                />
                <Button 
                  type="submit" 
                  disabled={isSearching || isGenerating || !topic || !session || !field}
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  {isSearching ? "Searching..." : "Search"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {isSearching && <div className="space-y-4"><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /></div>}

          {!isSearching && papers.length > 0 && (
            <>
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Search Results</h3>
                <div className="flex items-center gap-2">
                  {selectedPapers.length > 1 && <Button onClick={handleSynthesize} disabled={isSynthesizing || !session}><Wand2 className="w-4 h-4 mr-2" />{isSynthesizing ? "Synthesizing..." : `Synthesize (${selectedPapers.length})`}</Button>}
                </div>
              </div>

              {synthesizedText && (
                <Card className="bg-muted/50">
                  <CardHeader><CardTitle className="text-lg">AI-Generated Synthesis</CardTitle></CardHeader>
                  <CardContent><Textarea value={synthesizedText} readOnly rows={6} /></CardContent>
                </Card>
              )}

              <div className="space-y-4">
                {papers.map((paper) => (
                  <Card key={paper.id}>
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <input
                          type="checkbox"
                          id={`select-${paper.id}`}
                          className="mt-1.5 rounded border-input bg-background w-4 h-4"
                          checked={selectedPapers.some(sp => sp.id === paper.id)}
                          onChange={(e) => handlePaperSelection(paper, e.target.checked)}
                        />
                        <div>
                          <CardTitle className="text-base">{paper.title}</CardTitle>
                          {paper.publication_info && <CardDescription>{paper.publication_info}</CardDescription>}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent><p className="text-sm text-muted-foreground ml-8">{paper.snippet}</p></CardContent>
                    <CardFooter>
                      <a href={paper.link} target="_blank" rel="noopener noreferrer" className="w-full">
                        <Button variant="outline" className="w-full">
                          View Source <span className="ml-2">↗</span>
                        </Button>
                      </a>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Chapter-specific Research Questions Display */}
      {researchQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Research Questions by Chapter</CardTitle>
            <CardDescription>Organized by thesis chapter structure</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {['Chapter I', 'Chapter II', 'Chapter III', 'Chapter IV', 'Chapter V'].map((chapter, idx) => {
                const chapterQuestions = researchQuestions.filter(rq => rq.chapter.includes(chapter));
                if (chapterQuestions.length === 0) return null;
                
                return (
                  <div key={idx} className="space-y-2">
                    <h4 className="font-semibold text-center border-b pb-1">{chapter}</h4>
                    <div className="space-y-2">
                      {chapterQuestions.map((rq, i) => (
                        <div key={i} className="p-2 bg-muted rounded text-sm">
                          <span className="font-medium">{i + 1}.</span> {rq.question}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}