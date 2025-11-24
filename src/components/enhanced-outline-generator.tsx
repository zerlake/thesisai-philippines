"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
;
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
;
import { Bot, BookText, Download, Copy, RefreshCw, Zap } from "lucide-react";
import { toast } from "sonner";
import { useContext7 } from "@/contexts/context7-provider";

interface EnhancedOutlineGeneratorProps {
  className?: string;
}

export function EnhancedOutlineGenerator({ className }: EnhancedOutlineGeneratorProps) {
  const { getDocumentation, isInitialized } = useContext7();
  const [topic, setTopic] = useState("");
  const [outline, setOutline] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [university, setUniversity] = useState("");
  const [style, setStyle] = useState("apa");
  const [complexity, setComplexity] = useState("standard");

  // Context7 integration for thesis writing documentation
  const [thesisGuidelines, setThesisGuidelines] = useState<string>("");
  const [isFetchingGuidelines, setIsFetchingGuidelines] = useState(false);

  const fetchThesisGuidelines = useCallback(async () => {
    try {
      setIsFetchingGuidelines(true);
      const docs = await getDocumentation(`${topic} thesis writing guidelines`);
      if (docs.length > 0) {
        setThesisGuidelines(docs[0].content);
      }
    } catch (error) {
      console.error("Error fetching thesis guidelines:", error);
    } finally {
      setIsFetchingGuidelines(false);
    }
  }, [getDocumentation, topic]);

  // Fetch relevant documentation when topic changes
  useEffect(() => {
    if (topic && isInitialized) {
      fetchThesisGuidelines();
    }
  }, [topic, isInitialized, fetchThesisGuidelines]);

  const generateOutline = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a research topic");
      return;
    }

    setIsGenerating(true);
    try {
      // In a real implementation, this would call an API that uses Context7
      // For now, we'll simulate a response that incorporates Context7 documentation
      const contextPrompt = thesisGuidelines 
        ? `Based on the following thesis guidelines: ${thesisGuidelines.substring(0, 500)}... `
        : "";
      
      // Simulated outline generation combining Context7 documentation with outline generation
      const simulatedOutline = `# ${topic} - Thesis Outline

${contextPrompt ? `Based on the following guidelines: ${thesisGuidelines.substring(0, 200)}...` : 'Standard academic thesis outline'}

## Chapter 1: Introduction
- Background of the Study
- Statement of the Problem
- Purpose and Significance of the Study
- Research Questions/Hypotheses
- Definitions of Terms
- Assumptions and Limitations
- Scope and Delimitations
- Theoretical Framework
- Conceptual Framework
- Overview of the Following Chapters

## Chapter 2: Review of Related Literature
- Local Literature
- Foreign Literature
- Local Studies
- Foreign Studies
- Synthesis of Literature
- Gap Analysis

## Chapter 3: Methodology
- Research Design
- Locale and Population
- Sampling Technique
- Research Instruments
- Data Collection Procedure
- Data Analysis Plan
- Ethical Considerations
- Validity and Reliability

## Chapter 4: Results and Discussion
- Presentation of Data
- Analysis and Interpretation of Data
- Discussion of Findings
- Implications of the Study

## Chapter 5: Summary, Conclusions, and Recommendations
- Summary of Findings
- Conclusions
- Recommendations
- Suggestions for Future Studies

### Bibliography
### Appendices`;

      setOutline(simulatedOutline);
      toast.success("Outline generated successfully!");
    } catch (error) {
      console.error("Error generating outline:", error);
      toast.error("Failed to generate outline. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outline);
    toast.success("Outline copied to clipboard!");
  };

  const downloadOutline = () => {
    const blob = new Blob([outline], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${topic.replace(/\s+/g, "_")}_outline.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Outline downloaded!");
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Enhanced Outline Generator with Context7
            </CardTitle>
            <CardDescription>
              Generate structured thesis outlines with intelligent suggestions from Context7 documentation
            </CardDescription>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Bot className="h-3 w-3" />
            AI-Powered
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Research Topic</Label>
                  <Input
                    id="topic"
                    placeholder="Enter your research topic..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="university">University (Optional)</Label>
                  <Input
                    id="university"
                    placeholder="Your university name..."
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="style">Citation Style</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger id="style">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apa">APA</SelectItem>
                      <SelectItem value="mla">MLA</SelectItem>
                      <SelectItem value="chicago">Chicago</SelectItem>
                      <SelectItem value="harvard">Harvard</SelectItem>
                      <SelectItem value="ieee">IEEE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complexity">Complexity Level</Label>
                  <Select value={complexity} onValueChange={setComplexity}>
                    <SelectTrigger id="complexity">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Button 
              onClick={generateOutline} 
              disabled={isGenerating || !topic.trim()}
              className="w-full flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Generate Outline with Context7
                </>
              )}
            </Button>

            {outline && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Generated Outline</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadOutline}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
                <ScrollArea className="h-96 w-full rounded-md border p-4 font-mono text-sm whitespace-pre-wrap">
                  {outline}
                </ScrollArea>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookText className="h-4 w-4" />
                  Thesis Guidelines
                </CardTitle>
                <CardDescription>
                  Relevant documentation from Context7
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isFetchingGuidelines ? (
                  <div className="flex items-center justify-center h-48">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  </div>
                ) : thesisGuidelines ? (
                  <ScrollArea className="h-48 rounded-md border p-3 text-sm">
                    {thesisGuidelines.substring(0, 1000)}{thesisGuidelines.length > 1000 ? '...' : ''}
                  </ScrollArea>
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-center text-sm text-muted-foreground">
                    <Bot className="h-8 w-8 mb-2" />
                    <p>Enter a topic to fetch relevant thesis guidelines from Context7</p>
                    <p className="text-xs mt-2">Context7 provides real-time, version-specific documentation</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tips for Better Outlines</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Zap className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-500" />
                    <span>Include clear research objectives</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-500" />
                    <span>Define your theoretical framework early</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-500" />
                    <span>Plan your methodology section carefully</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-500" />
                    <span>Consider your university&apos;s specific requirements</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}