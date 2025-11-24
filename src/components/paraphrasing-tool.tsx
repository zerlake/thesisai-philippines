"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { useAuth } from "./auth-provider";
import { toast } from "sonner";
import { Copy, FilePlus2, Languages, Loader2, Info, RotateCcw, Eye } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "./ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export function ParaphrasingTool() {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const router = useRouter();
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [mode, setMode] = useState("standard");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [history, setHistory] = useState<Array<{mode: string; output: string}>>([]);

  const handleParaphrase = async () => {
    if (!inputText.trim()) {
      toast.error("Please enter some text to paraphrase.");
      return;
    }

    setIsLoading(true);
    setOutputText("");

    try {
      // Wait for Puter SDK to load
      let puter = (window as any).puter;
      let attempts = 0;
      while (!puter?.ai?.chat && attempts < 20) {
        await new Promise(resolve => setTimeout(resolve, 100));
        puter = (window as any).puter;
        attempts++;
      }
      
      if (!puter?.ai?.chat) {
        throw new Error("Puter AI service not available. Please reload the page.");
      }

      // Check authentication
      let puterUser;
      try {
        puterUser = await puter.auth.getUser();
      } catch (authError) {
        console.error("Puter auth.getUser() error:", authError);
        throw new Error("Unable to verify Puter authentication. Please sign in again.");
      }
      
      if (!puterUser) {
        throw new Error("Not authenticated with Puter. Please sign in.");
      }

      // Construct prompt based on mode
      let prompt = '';
      switch (mode) {
        case 'formal':
          prompt = `You are an expert academic editor. Your task is to rewrite the following text to make it more formal and suitable for a thesis.
- Elevate the vocabulary and sentence structure.
- Ensure the core meaning is preserved.
- Return only the rewritten text, with no additional comments or explanations.

Original text: "${inputText}"

Formal text:`;
          break;

        case 'simple':
          prompt = `You are an expert academic editor. Your task is to simplify the following text.
- Make it easier to understand for a general audience.
- Use clearer, more direct language.
- Retain the key information and core meaning.
- Return only the simplified text, with no additional comments or explanations.

Original text: "${inputText}"

Simplified text:`;
          break;

        case 'expand':
          prompt = `You are an expert academic editor. Your task is to expand on the following text.
- Add more detail, context, or examples to elaborate on the core idea.
- The length should be slightly longer but not excessively so.
- Maintain a consistent academic tone.
- Return only the expanded text, with no additional comments or explanations.

Original text: "${inputText}"

Expanded text:`;
          break;

        case 'standard':
        default:
          prompt = `You are an expert academic editor. Your task is to paraphrase the following text.
- The new version should have a different sentence structure and use different vocabulary.
- It must retain the original meaning and academic tone.
- Return only the paraphrased text, with no additional comments or explanations.

Original text: "${inputText}"

Paraphrased text:`;
      }

      // Call Puter AI directly
      let result;
      try {
        result = await puter.ai.chat(prompt);
      } catch (chatError) {
        console.error("Puter AI chat error:", chatError);
        throw chatError;
      }

      // Extract text from response
      let paraphrasedText = '';
      if (typeof result === 'string') {
        paraphrasedText = result.trim();
      } else if (result && typeof result === 'object') {
        // Puter returns format: {message: {content: "..."}, ...}
        paraphrasedText =
          (result as any).message?.content?.trim() ||
          (result as any).choices?.[0]?.message?.content?.trim() ||
          (result as any).choices?.[0]?.text?.trim() ||
          (result as any).response?.trim() ||
          (result as any).text?.trim() ||
          (result as any).content?.trim() ||
          '';
      }

      if (!paraphrasedText) {
        throw new Error("AI returned empty response. Please try again.");
      }

      setOutputText(paraphrasedText);
      setHistory([...history, { mode, output: paraphrasedText }]);
      setShowPreview(true);
      toast.success("Text paraphrased successfully!");
    } catch (error: any) {
      let errorMessage = "Failed to paraphrase text.";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const addSampleData = () => {
    const sampleText = `The proliferation of social media platforms has significantly transformed how students engage with educational content and interact with peers. Numerous studies have demonstrated that excessive use of these platforms can lead to decreased academic performance, reduced attention spans, and increased anxiety levels among learners. However, when used appropriately, social media can facilitate collaborative learning, provide access to diverse educational resources, and enhance communication between students and educators. The key lies in establishing balanced usage patterns and promoting digital literacy skills.`;
    
    setInputText(sampleText);
    setOutputText("");
    toast.success("Sample text added! Try different modes to see how it transforms the text.");
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    toast.success("Copied to clipboard!");
  };

  const handleSaveAsDraft = async () => {
    if (!user || !outputText) return;
    setIsSaving(true);

    const { data: newDoc, error } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        title: "Paraphrased Text",
        content: `<p>${outputText.replace(/\n/g, '</p><p>')}</p>`,
      })
      .select("id")
      .single();

    if (error) {
      toast.error("Failed to save draft.");
    } else if (newDoc) {
      toast.success("Saved as a new draft!");
      router.push(`/drafts/${newDoc.id}`);
    }
    setIsSaving(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Languages className="w-5 h-5" />
                Professional Paraphrasing Tool
              </CardTitle>
              <CardDescription>
                Rewrite sentences and paragraphs with precision. Improve clarity, vary your language, and maintain academic integrity.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mode Selection and Quick Info */}
          <div className="bg-muted p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Rewriting Mode</label>
              <Button type="button" variant="outline" size="sm" onClick={addSampleData}>
                Add Sample Text
              </Button>
            </div>
            <Select value={mode} onValueChange={setMode} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">
                  <span>📝 Standard Paraphrase</span>
                </SelectItem>
                <SelectItem value="formal">
                  <span>📋 Make More Formal</span>
                </SelectItem>
                <SelectItem value="simple">
                  <span>✨ Simplify</span>
                </SelectItem>
                <SelectItem value="expand">
                  <span>📚 Expand & Elaborate</span>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {mode === 'standard' && 'Rewrite with different sentence structure and vocabulary while preserving meaning.'}
              {mode === 'formal' && 'Elevate language for academic and formal contexts.'}
              {mode === 'simple' && 'Use clearer, simpler language for general audiences.'}
              {mode === 'expand' && 'Add more detail, context, and examples to elaborate on ideas.'}
            </p>
          </div>

          {/* Input and Output */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Original Text</label>
              <Textarea
                placeholder="Enter your text here... (50-500 words recommended)"
                className="min-h-[300px] resize-none"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {inputText.length} characters
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Rewritten Version</label>
                {outputText && (
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowPreview(!showPreview)}
                      title="Toggle preview"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleCopy}
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleSaveAsDraft} 
                      disabled={isSaving}
                      title="Save as draft"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <FilePlus2 className="w-4 h-4" />}
                    </Button>
                  </div>
                )}
              </div>
              <Textarea
                placeholder="Your rewritten text will appear here..."
                className="min-h-[300px] resize-none"
                value={outputText}
                readOnly
              />
              <p className="text-xs text-muted-foreground">
                {outputText.length} characters
              </p>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex gap-2">
            <Button 
              onClick={handleParaphrase} 
              disabled={isLoading || !inputText.trim()} 
              size="lg"
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Rewriting...
                </>
              ) : (
                <>
                  <Languages className="w-4 h-4" />
                  Rewrite Text
                </>
              )}
            </Button>
            {history.length > 0 && (
              <Button 
                variant="outline" 
                onClick={() => {
                  if (history.length > 0) {
                    const prev = history[history.length - 1];
                    setOutputText(prev.output);
                    setMode(prev.mode);
                    setHistory(history.slice(0, -1));
                  }
                }}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Undo
              </Button>
            )}
          </div>

          {isLoading && (
            <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-blue-700 dark:text-blue-300">
                Processing your text with AI... This usually takes 5-15 seconds.
              </AlertDescription>
            </Alert>
          )}

          {/* Tips */}
          {!outputText && (
            <Alert className="bg-green-50 dark:bg-green-950 border-green-200">
              <Info className="h-4 w-4 text-green-700 dark:text-green-300" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                <strong>Tips:</strong> For best results, use 50-500 words. Try different modes to find the style that works best for your document.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
