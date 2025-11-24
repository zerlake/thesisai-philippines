"use client";

import { EditorContent, type Editor } from "@tiptap/react";
import { EditorToolbar } from "./editor-toolbar";
import { useState } from "react";
import { Button } from "./ui/button";
import { SpellCheck, TextQuote, Languages } from "lucide-react";
import { useAuth } from "./auth-provider";
import { toast } from "sonner";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "./ui/dropdown-menu";
import { usePuterContext } from "@/contexts/puter-context";
import { AIError, AuthenticationError } from "@/lib/errors";
import { callPuterAIWithRetry, getPuterErrorMessage, isPuterAIAvailable } from "@/utils/puter-ai-retry";

interface RichTextEditorProps {
  editor: Editor | null;
}

export function RichTextEditor({ editor }: RichTextEditorProps) {
  const { session } = useAuth();
  const { puterReady, isAuthenticated, signIn } = usePuterContext();
  const [isImproving, setIsImproving] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);

  const handleAuth = async () => {
    if (!puterReady) {
      throw new AIError("AI features are not available. Please wait for Puter to load.");
    }
    if (!isAuthenticated) {
      const confirmed = window.confirm("AI tools require authentication with Puter. Would you like to sign in now?");
      if (confirmed) {
        try {
          await signIn();
        } catch (error) {
          throw new AuthenticationError(`Puter sign-in failed: ${error instanceof Error ? error.message : String(error)}`);
        }
      } else {
        return false;
      }
    }
    return true;
  };

  const handleImproveText = async () => {
    if (!editor || !session) return;

    const { from, to } = editor.state.selection;
    const originalText = editor.state.doc.textBetween(from, to);

    if (!originalText) {
      toast.info("Please select some text to improve.");
      return;
    }

    setIsImproving(true);
    try {
      if (!await handleAuth()) return;
      if (!isPuterAIAvailable()) {
        throw new AIError("Puter AI service is not available. Please refresh the page and try again.");
      }

      const prompt = `You are an expert academic editor. Please correct the grammar and spelling of the following text, while also improving its clarity and flow.
- Return only the improved text, with no additional comments or explanations.

Original text: "${originalText}"

Improved text:`;

      const result = await callPuterAIWithRetry(
        () => window.puter.ai.chat({ prompt, temperature: 0.5, max_tokens: 2000 }),
        { maxRetries: 3, initialDelayMs: 1000 },
        (attempt) => console.log(`[Puter AI] Retrying improve text (attempt ${attempt}/3)`)
      );

      editor.chain().focus().deleteRange({ from, to }).insertContent(result.response).run();
      toast.success("Text improved with AI!");

    } catch (error: any) {
      const message = getPuterErrorMessage(error);
      toast.error(message);
      console.error("Error improving text:", { error, prompt });
    } finally {
      setIsImproving(false);
    }
  };

  const handleSummarizeText = async () => {
    if (!editor || !session) return;

    const { from, to } = editor.state.selection;
    const originalText = editor.state.doc.textBetween(from, to);

    if (!originalText) {
      toast.info("Please select some text to summarize.");
      return;
    }

    setIsSummarizing(true);
    let prompt = "";
    try {
      if (!await handleAuth()) return;
      if (!isPuterAIAvailable()) {
        throw new AIError("Puter AI service is not available. Please refresh the page and try again.");
      }

      prompt = `You are an expert academic editor. Please summarize the following text concisely, capturing the main points.
- The summary should be significantly shorter than the original text.
- Return only the summarized text, with no additional comments or explanations.

Original text: "${originalText}"

Summary:`;

      const result = await callPuterAIWithRetry(
        () => window.puter.ai.chat({ prompt, temperature: 0.5, max_tokens: 1000 }),
        { maxRetries: 3, initialDelayMs: 1000 },
        (attempt) => console.log(`[Puter AI] Retrying summarize text (attempt ${attempt}/3)`)
      );

      editor.chain().focus().deleteRange({ from, to }).insertContent(result.response).run();
      toast.success("Text summarized with AI!");

    } catch (error: any) {
      const message = getPuterErrorMessage(error);
      toast.error(message);
      console.error("Error summarizing text:", { error, prompt });
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleRewriteText = async (mode: string) => {
    if (!editor || !session) return;

    const { from, to } = editor.state.selection;
    const originalText = editor.state.doc.textBetween(from, to);

    if (!originalText) {
      toast.info("Please select some text to rewrite.");
      return;
    }

    setIsRewriting(true);
    let prompt = "";
    try {
      if (!await handleAuth()) return;

      switch (mode) {
        case 'formal':
          prompt = `You are an expert academic editor. Your task is to rewrite the following text to make it more formal and suitable for a thesis.
- Elevate the vocabulary and sentence structure.
- Ensure the core meaning is preserved.
- Return only the rewritten text, with no additional comments or explanations.

Original text: "${originalText}"

Formal text:`;
          break;
        case 'simple':
          prompt = `You are an expert academic editor. Your task is to simplify the following text.
- Make it easier to understand for a general audience.
- Use clearer, more direct language.
- Retain the key information and core meaning.
- Return only the simplified text, with no additional comments or explanations.

Original text: "${originalText}"

Simplified text:`;
          break;
        case 'expand':
          prompt = `You are an expert academic editor. Your task is to expand on the following text.
- Add more detail, context, or examples to elaborate on the core idea.
- The length should be slightly longer but not excessively so.
- Maintain a consistent academic tone.
- Return only the expanded text, with no additional comments or explanations.

Original text: "${originalText}"

Expanded text:`;
          break;
        case 'standard':
        default:
          prompt = `You are an expert academic editor. Your task is to paraphrase the following text.
- The new version should have a different sentence structure and use different vocabulary.
- It must retain the original meaning and academic tone.
- Return only the paraphrased text, with no additional comments or explanations.

Original text: "${originalText}"

Paraphrased text:`;
      }

      if (!isPuterAIAvailable()) {
        throw new AIError("Puter AI service is not available. Please refresh the page and try again.");
      }

      const result = await callPuterAIWithRetry(
        () => window.puter.ai.chat({ prompt, temperature: 0.7, max_tokens: 2000 }),
        { maxRetries: 3, initialDelayMs: 1000 },
        (attempt) => console.log(`[Puter AI] Retrying rewrite text (attempt ${attempt}/3)`)
      );

      editor.chain().focus().deleteRange({ from, to }).insertContent(result.response).run();
      toast.success("Text rewritten successfully!");

    } catch (error: any) {
      const message = getPuterErrorMessage(error);
      toast.error(message);
      console.error("Error rewriting text:", { error, prompt });
    } finally {
      setIsRewriting(false);
    }
  };

  const isProcessing = isImproving || isSummarizing || isRewriting;

  return (
    <div className="flex flex-col gap-4">
      <EditorToolbar editor={editor} />
      {editor && (
        <div className="flex gap-1 bg-background p-1 rounded-lg shadow-lg border">
          <Button
            size="sm"
            onClick={handleImproveText}
            disabled={isProcessing}
            variant="ghost"
          >
            <SpellCheck className="w-4 h-4 mr-2" />
            {isImproving ? "Fixing..." : "Fix Grammar"}
          </Button>
          <Button
            size="sm"
            onClick={handleSummarizeText}
            disabled={isProcessing}
            variant="ghost"
          >
            <TextQuote className="w-4 h-4 mr-2" />
            {isSummarizing ? "Summarizing..." : "Summarize"}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" disabled={isProcessing} variant="ghost">
                <Languages className="w-4 h-4 mr-2" />
                {isRewriting ? "Rewriting..." : "Rewrite"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => handleRewriteText('standard')}>Paraphrase</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleRewriteText('formal')}>Make More Formal</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleRewriteText('simple')}>Simplify</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleRewriteText('expand')}>Expand</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}