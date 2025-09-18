"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Wand2,
  TextQuote,
  FileText,
  Loader2,
} from "lucide-react";
import { useAuth } from "./auth-provider";
import { toast } from "sonner";
import { type Editor } from "@tiptap/react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { FieldOfStudySelector } from "./field-of-study-selector";
import { OriginalityCheckPanel } from "./originality-check-panel";

interface AIAssistantPanelProps {
  editor: Editor | null;
  documentContent: string;
  documentId: string;
}

export function AIAssistantPanel({
  editor,
  documentContent,
  documentId,
}: AIAssistantPanelProps) {
  const { session } = useAuth();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [generatedContentType, setGeneratedContentType] = useState<
    string | null
  >(null);

  // State for generators
  const [generatorType, setGeneratorType] = useState("outline");
  const [generatorTopic, setGeneratorTopic] = useState("");
  const [generatorField, setGeneratorField] = useState("");

  const callAIFunction = async (functionName: string, body: object) => {
    if (!session) {
      toast.error("You must be logged in to use AI features.");
      return null;
    }

    try {
      const response = await fetch(
        `https://dnyjgzzfyzrsucucexhy.supabase.co/functions/v1/${functionName}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRueWpnenpmeXpyc3VjdWNleGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NDAxMjcsImV4cCI6MjA3MzAxNjEyN30.elZ6r3JJjdwGUadSzQ1Br5EdGeqZIEr67Z5QB_Q3eMw",
          },
          body: JSON.stringify(body),
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || `Failed to call ${functionName}.`);
      return data;
    } catch (error: any) {
      toast.error(error.message);
      console.error(error);
      return null;
    }
  };

  // Document Tool Functions
  const handleImprove = async () => {
    if (!editor) return;
    setIsLoading("improve");
    const data = await callAIFunction("improve-writing", {
      text: documentContent,
    });
    if (data && data.improvedText) {
      editor.commands.setContent(data.improvedText);
      toast.success("Document improved successfully!");
    }
    setIsLoading(null);
  };

  const handleSummarize = async () => {
    setIsLoading("summarize");
    setGeneratedContent(null);
    const data = await callAIFunction("summarize-text", {
      text: documentContent,
    });
    if (data && data.summarizedText) {
      setGeneratedContent(data.summarizedText);
      setGeneratedContentType("Summary");
    }
    setIsLoading(null);
  };

  const handleGenerateAbstract = async () => {
    setIsLoading("abstract");
    setGeneratedContent(null);
    const data = await callAIFunction("generate-abstract", {
      content: documentContent,
    });
    if (data && data.abstract) {
      setGeneratedContent(data.abstract);
      setGeneratedContentType("Abstract");
    }
    setIsLoading(null);
  };

  // Content Generator Function
  const handleGenerateContent = async () => {
    setIsLoading("generator");
    setGeneratedContent(null);

    if (generatorType === "outline") {
      if (!generatorTopic || !generatorField) {
        toast.error("Please provide a topic and field of study.");
        setIsLoading(null);
        return;
      }
      const data = await callAIFunction("generate-outline", {
        topic: generatorTopic,
        field: generatorField,
      });
      if (data && data.outline) {
        setGeneratedContent(data.outline);
        setGeneratedContentType("Outline");
      }
    } else if (generatorType === "topic-ideas") {
      if (!generatorField) {
        toast.error("Please select a field of study.");
        setIsLoading(null);
        return;
      }
      const data = await callAIFunction("generate-topic-ideas", {
        field: generatorField,
      });
      if (data && data.topicIdeas) {
        const formattedContent = data.topicIdeas
          .map(
            (idea: any) => `<h3>${idea.title}</h3><p>${idea.description}</p>`
          )
          .join("");
        setGeneratedContent(formattedContent);
        setGeneratedContentType("Topic Ideas");
      }
    }
    setIsLoading(null);
  };

  const handleInsertContent = () => {
    if (!editor || !generatedContent) return;

    if (generatedContentType === "Summary" || generatedContentType === "Abstract") {
      editor
        .chain()
        .focus()
        .insertContentAt(
          0,
          `<h2>${generatedContentType}</h2><p>${generatedContent}</p><hr>`
        )
        .run();
      toast.success(
        `${generatedContentType} inserted at the top of your document.`
      );
    } else {
      const contentToInsert = `<h2>Generated ${generatedContentType}</h2>${generatedContent}`;
      editor.chain().focus().insertContent(contentToInsert).run();
      toast.success(`${generatedContentType} inserted at the cursor position.`);
    }

    setGeneratedContent(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Assistant</CardTitle>
        <CardDescription>Supercharge your writing process.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="document-tools" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="document-tools">Document Tools</TabsTrigger>
            <TabsTrigger value="generators">Generators</TabsTrigger>
            <TabsTrigger value="originality">Originality</TabsTrigger>
          </TabsList>
          <TabsContent value="document-tools" className="pt-4 space-y-4">
            <Button
              onClick={handleImprove}
              disabled={!!isLoading}
              className="w-full justify-start"
            >
              {isLoading === "improve" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
              {isLoading === "improve"
                ? "Improving..."
                : "Improve Entire Document"}
            </Button>
            <Button
              onClick={handleSummarize}
              disabled={!!isLoading}
              className="w-full justify-start"
            >
              {isLoading === "summarize" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <TextQuote className="w-4 h-4 mr-2" />}
              {isLoading === "summarize"
                ? "Summarizing..."
                : "Summarize Document"}
            </Button>
            <Button
              onClick={handleGenerateAbstract}
              disabled={!!isLoading}
              className="w-full justify-start"
            >
              {isLoading === "abstract" ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
              {isLoading === "abstract" ? "Generating..." : "Generate Abstract"}
            </Button>
          </TabsContent>
          <TabsContent value="generators" className="pt-4 space-y-4">
            <div className="space-y-2">
              <Label>Generator Type</Label>
              <Select value={generatorType} onValueChange={setGeneratorType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a generator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="outline">Outline Generator</SelectItem>
                  <SelectItem value="topic-ideas">
                    Topic Idea Generator
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {generatorType === "outline" && (
              <>
                <div className="space-y-2">
                  <Label>Field of Study</Label>
                  <FieldOfStudySelector
                    value={generatorField}
                    onValueChange={setGeneratorField}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Thesis Topic</Label>
                  <Input
                    placeholder="e.g., AI in Philippine Education"
                    value={generatorTopic}
                    onChange={(e) => setGeneratorTopic(e.target.value)}
                  />
                </div>
              </>
            )}

            {generatorType === "topic-ideas" && (
              <div className="space-y-2">
                <Label>Field of Study</Label>
                <FieldOfStudySelector
                  value={generatorField}
                  onValueChange={setGeneratorField}
                />
              </div>
            )}

            <Button
              onClick={handleGenerateContent}
              disabled={isLoading === "generator"}
              className="w-full"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              {isLoading === "generator" ? "Generating..." : "Generate"}
            </Button>
          </TabsContent>
          <TabsContent value="originality" className="pt-4">
            <OriginalityCheckPanel documentContent={documentContent} documentId={documentId} />
          </TabsContent>
        </Tabs>

        {generatedContent && (
          <>
            <Separator className="my-4" />
            <Alert>
              <AlertTitle className="flex justify-between items-center">
                <span>Generated {generatedContentType}</span>
                <Button size="sm" onClick={handleInsertContent}>
                  Insert
                </Button>
              </AlertTitle>
              <AlertDescription
                className="mt-2 max-h-48 overflow-y-auto prose dark:prose-invert prose-sm"
                dangerouslySetInnerHTML={{ __html: generatedContent }}
              />
            </Alert>
          </>
        )}
      </CardContent>
    </Card>
  );
}