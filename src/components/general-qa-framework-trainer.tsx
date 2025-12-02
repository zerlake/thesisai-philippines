"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useAuth } from "./auth-provider";
import { toast } from "sonner";
import { Copy, FilePlus2, HelpCircle, Wand2 } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Label } from "./ui/label";
import { useRouter } from "next/navigation";
import { generateDefenseQuestions } from "@/lib/puter-sdk";

export function GeneralQAFrameworkTrainer() {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [textContent, setTextContent] = useState("");
  const [framework, setFramework] = useState("PREP");
  const [questions, setQuestions] = useState<{question: string, frameworkSteps: string[]}[]>([]);
  const [generatedFramework, setGeneratedFramework] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const frameworkPrompts: Record<string, string> = {
    PREP: "Point, Reason, Example, Point - State your position, give reason, provide example, restate point",
    PEEL: "Point, Evidence, Explain, Link - Make a point, provide evidence, explain it, link to thesis",
    STAR: "Situation, Task, Action, Result - Describe situation, task, action taken, result achieved",
    ADD: "Answer, Details, Data - Direct answer with supporting details and data points",
    CLEAR: "Clarify, Link, Express, Articulate, Reflect - Clarify main idea, link to problem, express scope, articulate uniqueness, reflect academic relevance"
  };

  const generalQuestions = [
    "Can you summarize your research in 2 minutes?",
    "What is the main problem your research addresses?",
    "How is your study different from existing ones?",
    "What are the key findings of your research?",
    "What are the limitations of your study?",
    "How do your findings contribute to the field?",
    "What are the implications of your research?",
    "What recommendations do you have?",
    "What would you do differently if you could?",
    "What are your next steps?"
  ];

  const generateFrameworkSteps = (question: string, framework: string) => {
    const steps: Record<string, string[]> = {
      PREP: [
        `Point: ${question.split('?')[0]} is important because...`,
        `Reason: The reason for this is...`,
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
    setTopic(`Impact of Social Media on Academic Performance of Senior High School Students in Bukidnon`);
    // Sample text content for a thesis (similar to Q&A Simulator)
    const sampleText = `Chapter 3: Research Methodology

This study employed a mixed-methods approach combining quantitative surveys and qualitative interviews to investigate the impact of social media usage on academic performance among senior high school students in Bukidnon. The quantitative component used a cross-sectional survey design with 320 participants selected through stratified random sampling from five public schools. The qualitative component involved in-depth interviews with 25 selected participants representing different social media usage patterns.

The research instrument consisted of a structured questionnaire adapted from the Digital Behavior Assessment Tool (DBAT), with modifications for the local context. The questionnaire included sections measuring social media usage patterns, academic performance indicators, and potential mediating variables such as time management skills and sleep quality. Content validity was established by three expert judges with a Content Validity Ratio (CVR) of 0.87. Internal consistency yielded a Cronbach's alpha of 0.82.

Data collection occurred over a six-week period in August-September 2024. Quantitative data was analyzed using correlation and regression analysis to determine relationships between variables, while qualitative data was analyzed thematically using Braun and Clarke's six-phase thematic analysis approach. Ethical clearance was obtained from the University Research Ethics Board.`;

    setTextContent(sampleText);
    setFramework("PREP");

    const sampleQuestions = [
      {
        question: "Can you summarize your research in 2 minutes?",
        frameworkSteps: [
          "Point: My research investigates social media's impact on academic performance",
          "Reason: There is limited local research on this important topic",
          "Example: I used mixed-methods to analyze this relationship",
          "Point: This research provides valuable insights for educators"
        ]
      },
      {
        question: "What are the key findings of your research?",
        frameworkSteps: [
          "Point: The study found significant correlations between usage patterns and performance",
          "Reason: Based on analysis of survey and interview data",
          "Example: Heavy users showed different performance patterns than moderate users",
          "Point: These findings suggest areas for educational interventions"
        ]
      }
    ];

    setQuestions(sampleQuestions);
    setGeneratedFramework("PREP"); // Set the framework that was used for samples
    toast.success("Sample general Q&A with framework loaded! Practice with structured responses.");
  };

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic first.");
      return;
    }

    setIsGenerating(true);

    try {
      // Generate general questions based on the topic and selected framework
      const generatedQuestions = generalQuestions
        .slice(0, 5) // Limit to 5 questions
        .map((q, index) => ({
          question: q,
          frameworkSteps: generateFrameworkSteps(q, framework)
        }));

      setQuestions(generatedQuestions);
      setGeneratedFramework(framework); // Store the framework that was used
      toast.success(`General Q&A generated using ${framework} framework!`);
    } catch (err) {
      toast.error("Failed to generate questions.");
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateFromText = async () => {
    if (!textContent.trim()) {
      toast.error("Please paste your abstract or a chapter summary first.");
      return;
    }

    setIsGeneratingQuestions(true);
    setQuestions([]);

    try {
      const generatedQuestions = await generateDefenseQuestions(textContent);
      const questionsWithFrameworks = (Array.isArray(generatedQuestions) ? generatedQuestions : [generatedQuestions])
        .slice(0, 5) // Limit to 5 questions
        .map((question: string) => ({
          question,
          frameworkSteps: generateFrameworkSteps(question, framework)
        }));

      setQuestions(questionsWithFrameworks);
      setGeneratedFramework(framework); // Store the framework that was used
      toast.success("Potential defense questions generated with framework steps!");
    } catch (err: any) {
      const msg = err.message || "Failed to generate questions";

      if (msg.includes("auth")) {
        toast.error("Please sign in to your Puter account");
      } else if (msg.includes("JSON")) {
        toast.error("Invalid response format. Please try again.");
      } else {
        toast.error(msg);
      }
      console.error(err);
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleSaveAsDraft = async () => {
    if (!user || questions.length === 0) return;
    setIsSaving(true);

    let content = `<h1>General Q&A Practice with ${framework} Framework</h1><h2>Topic:</h2><p><em>${topic}</em></p><hr><h2>Generated Questions:</h2>`;

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
        title: `General Q&A with ${framework} Framework`,
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
          <CardTitle>General Q&A Framework Trainer</CardTitle>
          <CardDescription>
            Practice general Q&A sessions using proven communication frameworks to structure your responses confidently.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="textContent">Abstract / Chapter Summary</Label>
            <Textarea
              id="textContent"
              placeholder="Paste your text here to generate defense questions..."
              className="min-h-[200px] resize-y"
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
            />
            <Button
              onClick={handleGenerateFromText}
              disabled={isGeneratingQuestions || !textContent}
              className="mt-2"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              {isGeneratingQuestions ? "Generating..." : "Generate Questions from Text"}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Textarea
              id="topic"
              placeholder="Enter your topic or research area..."
              className="min-h-[100px] resize-y"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
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
            <Button onClick={handleGenerate} disabled={isGenerating || !topic}>
              <Wand2 className="w-4 h-4 mr-2" />
              {isGenerating ? "Generating..." : "Generate Generic Questions"}
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

      {(isGenerating || isGeneratingQuestions || questions.length > 0) && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Practice Questions with {framework} Framework</CardTitle>
              {questions.length > 0 && !isGenerating && !isGeneratingQuestions && (
                <Button variant="outline" size="sm" onClick={handleSaveAsDraft} disabled={isSaving}>
                  <FilePlus2 className="w-4 h-4 mr-2" />
                  {isSaving ? "Saving..." : "Save as Draft"}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isGenerating || isGeneratingQuestions ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-11/12" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
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
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}