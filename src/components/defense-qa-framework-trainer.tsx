"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useAuth } from "./auth-provider";
import { toast } from "sonner";
import { Copy, FilePlus2, HelpCircle, Wand2 } from "lucide-react";
import { Label } from "./ui/label";
import { useRouter } from "next/navigation";

export function DefenseQAFrameworkTrainer() {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const router = useRouter();
  const [researchTopic, setResearchTopic] = useState("");
  const [framework, setFramework] = useState("PREP");
  const [questions, setQuestions] = useState<{question: string, frameworkSteps: string[]}[]>([]);
  const [generatedFramework, setGeneratedFramework] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const frameworkPrompts: Record<string, string> = {
    PREP: "Point, Reason, Example, Point - State your position, give reason, provide example, restate point",
    PEEL: "Point, Evidence, Explain, Link - Make a point, provide evidence, explain it, link to thesis",
    STAR: "Situation, Task, Action, Result - Describe situation, task, action taken, result achieved",
    ADD: "Answer, Details, Data - Direct answer with supporting details and data points",
    CLEAR: "Clarify, Link, Express, Articulate, Reflect - Clarify main idea, link to problem, express scope, articulate uniqueness, reflect academic relevance"
  };

  const generateFrameworkSteps = (question: string, framework: string) => {
    const steps: Record<string, string[]> = {
      PREP: [
        `Point: Regarding "${question}", my position is...`,
        `Reason: This is important because...`,
        `Example: For example...`,
        `Point: So in conclusion...`
      ],
      PEEL: [
        `Point: Regarding ${question.split('?')[0].toLowerCase()}, my main point is...`,
        `Evidence: This is supported by...`,
        `Explain: This means that...`,
        `Link: This connects to my research by...`
      ],
      STAR: [
        `Situation: In the context of ${question.split('?')[0].toLowerCase()}, the situation is...`,
        `Task: The task I addressed was...`,
        `Action: I addressed this by...`,
        `Result: This resulted in...`
      ],
      ADD: [
        `Answer: ${question.split('?')[0]} because...`,
        `Details: Specifically...`,
        `Data: As evidenced by...`
      ],
      CLEAR: [
        `Clarify: The main idea is that...`,
        `Link: This links to the research gap by...`,
        `Express: I express this through...`,
        `Articulate: This articulates...`,
        `Reflect: This reflects the academic standards of...`
      ]
    };
    return steps[framework] || [`Framework steps for ${framework}`];
  };

  const addSampleData = () => {
    setResearchTopic(`Impact of Social Media on Academic Performance of Senior High School Students in Bukidnon`);
    setFramework("PREP");
    
    const sampleQuestions = [
      {
        question: "Why did you choose this specific topic?",
        frameworkSteps: [
          "Point: I chose this topic because...",
          "Reason: There is a significant gap in local research...",
          "Example: Previous studies show...",
          "Point: This addresses the core research need by..."
        ]
      },
      {
        question: "How does your methodology address the research questions?",
        frameworkSteps: [
          "Point: My mixed-methods approach effectively...",
          "Reason: Quantitative data provides statistical evidence, qualitative adds context...",
          "Example: Surveys give statistical trends, interviews provide deeper insights...",
          "Point: This methodology directly answers all research questions..."
        ]
      }
    ];
    
    setQuestions(sampleQuestions);
    setGeneratedFramework("PREP"); // Set the framework that was used for samples
    toast.success("Sample defense questions with framework loaded! Practice with structured responses.");
  };

  const handleGenerate = () => {
    if (!researchTopic.trim()) {
      toast.error("Please enter your research topic first.");
      return;
    }

    setIsGenerating(true);

    try {
      // Generate questions based on the research topic and selected framework
      const generatedQuestions = [
        {
          question: `Why is your study significant in the context of ${researchTopic}?`,
          frameworkSteps: generateFrameworkSteps(`Why is your study significant in the context of ${researchTopic}?`, framework)
        },
        {
          question: `How does your ${framework} approach help answer questions about ${researchTopic}?`,
          frameworkSteps: generateFrameworkSteps(`How does your ${framework} approach help answer questions about ${researchTopic}?`, framework)
        },
        {
          question: `What makes your research on ${researchTopic} different from existing studies?`,
          frameworkSteps: generateFrameworkSteps(`What makes your research on ${researchTopic} different from existing studies?`, framework)
        }
      ];
      
      setQuestions(generatedQuestions);
      setGeneratedFramework(framework); // Store the framework that was used
      toast.success(`Questions generated using ${framework} framework!`);
    } catch (err) {
      toast.error("Failed to generate questions.");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleSaveAsDraft = async () => {
    if (!user || questions.length === 0) return;
    setIsSaving(true);

    let content = `<h1>Defense Q&A Practice with ${framework} Framework</h1><h2>Research Topic:</h2><p><em>${researchTopic}</em></p><hr><h2>Generated Questions:</h2>`;

    questions.forEach((q, index) => {
      content += `<h3>Question ${index + 1}: ${q.question}</h3>`;
      content += `<h4>Framework: ${framework}</h4>`;
      content += `<ol>`;
      q.frameworkSteps.forEach(step => {
        content += `<li>${step}</li>`;
      });
      content += `</ol>`;
      content += `<hr>`;
    });

    const { data: newDoc, error } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        title: `Defense Q&A with ${framework} Framework`,
        content: content,
      })
      .select("id")
      .single();

    if (error) {
      toast.error("Failed to save draft.");
    } else if (newDoc) {
      toast.success("Q&A practice saved as a new draft!");
      router.push(`/drafts/${newDoc.id}`);
    }
    setIsSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Defense Q&A Framework Trainer</CardTitle>
          <CardDescription>
            Practice answering defense questions using proven communication frameworks (PREP, PEEL, STAR, ADD, CLEAR) to structure your responses confidently.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Research Topic</Label>
            <Textarea
              id="topic"
              placeholder="Enter your research topic..."
              className="min-h-[100px] resize-y"
              value={researchTopic}
              onChange={(e) => setResearchTopic(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Answer Framework</Label>
            <Select value={framework} onValueChange={setFramework}>
              <SelectTrigger>
                <SelectValue placeholder="Select a framework" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PREP">PREP (Point, Reason, Example, Point)</SelectItem>
                <SelectItem value="PEEL">PEEL (Point, Evidence, Explain, Link)</SelectItem>
                <SelectItem value="STAR">STAR (Situation, Task, Action, Result)</SelectItem>
                <SelectItem value="ADD">ADD (Answer, Details, Data)</SelectItem>
                <SelectItem value="CLEAR">CLEAR (Clarify, Link, Express, Articulate, Reflect)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {frameworkPrompts[framework as keyof typeof frameworkPrompts]}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleGenerate} disabled={isGenerating || !researchTopic}>
              <Wand2 className="w-4 h-4 mr-2" />
              {isGenerating ? "Generating..." : "Generate Questions"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={addSampleData}
            >
              Add Sample
            </Button>
          </div>
        </CardContent>
      </Card>

      {questions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Practice Questions with {framework} Framework</CardTitle>
              <Button variant="outline" size="sm" onClick={handleSaveAsDraft} disabled={isSaving}>
                <FilePlus2 className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save as Draft"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {questions.map((q, index) => (
                <div key={index} className="p-4 rounded-md border bg-tertiary">
                  <div className="flex items-start gap-3 mb-3">
                    <HelpCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    <p className="font-medium flex-1">{q.question}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(q.question)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="ml-8 space-y-2">
                    <h4 className="font-semibold text-sm">Using {generatedFramework || framework} Framework:</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm">
                      {q.frameworkSteps.map((step, stepIndex) => (
                        <li key={stepIndex} className="ml-2">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}