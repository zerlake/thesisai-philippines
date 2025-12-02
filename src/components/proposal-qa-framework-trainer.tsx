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

export function ProposalQAFrameworkTrainer() {
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
    PEEL: "Point, Evidence, Explain, Link - Make a point, provide evidence, explain it, link to proposal",
    STAR: "Situation, Task, Action, Result - Describe research situation, task, proposed action, expected result",
    ADD: "Answer, Details, Data - Direct answer with supporting details and data points",
    CLEAR: "Clarify, Link, Express, Articulate, Reflect - Clarify main idea, link to research gap, express scope, articulate uniqueness, reflect academic relevance"
  };

  const proposalQuestions = [
    "Why is your study significant and relevant to your field?",
    "How does your title capture the aim and scope of your study?",
    "What research gap does your study address?",
    "Why did you choose this methodology?",
    "How will you address potential limitations?",
    "What are the expected implications of your findings?",
    "How does your theoretical framework support your research?",
    "What ethical considerations are involved in your study?"
  ];

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
        question: "Why is your study significant and relevant to your field?",
        frameworkSteps: [
          "Point: The study is significant because limited research exists locally",
          "Reason: There is a growing concern about social media's impact on academic performance",
          "Example: Studies in other countries show mixed results, but limited local studies exist",
          "Point: This research fills an important gap in local educational research"
        ]
      },
      {
        question: "Why did you choose this methodology?",
        frameworkSteps: [
          "Point: I chose a mixed-methods approach for comprehensive results",
          "Reason: Quantitative data provides statistical evidence while qualitative adds context",
          "Example: Surveys will show relationships between variables, interviews will provide deeper insights",
          "Point: This methodology best addresses my research questions"
        ]
      }
    ];
    
    setQuestions(sampleQuestions);
    setGeneratedFramework("PREP"); // Set the framework that was used for samples
    toast.success("Sample proposal defense questions with framework loaded! Practice with structured responses.");
  };

  const handleGenerate = () => {
    if (!researchTopic.trim()) {
      toast.error("Please enter your research topic first.");
      return;
    }

    setIsGenerating(true);

    try {
      // Generate proposal-specific questions based on the research topic and selected framework
      const generatedQuestions = proposalQuestions
        .slice(0, 5) // Limit to 5 questions
        .map((q, index) => ({
          question: q.replace("your study", `a study on ${researchTopic}`),
          frameworkSteps: generateFrameworkSteps(q.replace("your study", `a study on ${researchTopic}`), framework)
        }));
      
      setQuestions(generatedQuestions);
      setGeneratedFramework(framework); // Store the framework that was used
      toast.success(`Proposal questions generated using ${framework} framework!`);
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

    let content = `<h1>Proposal Defense Q&A Practice with ${framework} Framework</h1><h2>Research Topic:</h2><p><em>${researchTopic}</em></p><hr><h2>Generated Questions:</h2>`;

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
        title: `Proposal Defense Q&A with ${framework} Framework`,
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
          <CardTitle>Proposal Q&A Framework Trainer</CardTitle>
          <CardDescription>
            Practice answering proposal defense questions using proven communication frameworks to structure your responses confidently.
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