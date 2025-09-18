"use client";

import { EditorContent, type Editor, BubbleMenu } from "@tiptap/react";
import { EditorToolbar } from "./editor-toolbar";
import { useState } from "react";
import { Button } from "./ui/button";
import { Wand2, TextQuote, Languages } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "./auth-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface RichTextEditorProps {
  editor: Editor | null;
}

export function RichTextEditor({ editor }: RichTextEditorProps) {
  const { session } = useAuth();
  const [isImproving, setIsImproving] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);

  const handleImproveText = async () => {
    if (!editor || !session) return;

    const { from, to } = editor.state.selection;
    const originalText = editor.state.doc.textBetween(from, to);

    if (!originalText) return;

    setIsImproving(true);
    try {
      const response = await fetch(
        "https://dnyjgzzfyzrsucucexhy.supabase.co/functions/v1/improve-writing",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRueWpnenpmeXpyc3VjdWNleGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NDAxMjcsImV4cCI6MjA3MzAxNjEyN30.elZ6r3JJjdwGUadSzQ1Br5EdGeqZIEr67Z5QB_Q3eMw",
          },
          body: JSON.stringify({ text: originalText }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to improve text.");

      editor.chain().focus().deleteRange({ from, to }).insertContent(data.improvedText).run();
      toast.success("Text improved with AI!");

    } catch (error: any) {
      toast.error(error.message);
      console.error(error);
    } finally {
      setIsImproving(false);
    }
  };

  const handleSummarizeText = async () => {
    if (!editor || !session) return;

    const { from, to } = editor.state.selection;
    const originalText = editor.state.doc.textBetween(from, to);

    if (!originalText) return;

    setIsSummarizing(true);
    try {
      const response = await fetch(
        "https://dnyjgzzfyzrsucucexhy.supabase.co/functions/v1/summarize-text",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRueWpnenpmeXpyc3VjdWNleGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NDAxMjcsImV4cCI6MjA3MzAxNjEyN30.elZ6r3JJjdwGUadSzQ1Br5EdGeqZIEr67Z5QB_Q3eMw",
          },
          body: JSON.stringify({ text: originalText }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to summarize text.");

      editor.chain().focus().deleteRange({ from, to }).insertContent(data.summarizedText).run();
      toast.success("Text summarized with AI!");

    } catch (error: any) {
      toast.error(error.message);
      console.error(error);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleRewriteText = async (mode: string) => {
    if (!editor || !session) return;

    const { from, to } = editor.state.selection;
    const originalText = editor.state.doc.textBetween(from, to);

    if (!originalText) return;

    setIsRewriting(true);
    try {
      const response = await fetch(
        "https://dnyjgzzfyzrsucucexhy.supabase.co/functions/v1/paraphrase-text",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRueWpnenpmeXpyc3VjdWNleGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NDAxMjcsImV4cCI6MjA3MzAxNjEyN30.elZ6r3JJjdwGUadSzQ1Br5EdGeqZIEr67Z5QB_Q3eMw",
          },
          body: JSON.stringify({ text: originalText, mode }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to paraphrase text.");

      editor.chain().focus().deleteRange({ from, to }).insertContent(data.paraphrasedText).run();
      toast.success("Text rewritten successfully!");

    } catch (error: any) {
      toast.error(error.message);
      console.error(error);
    } finally {
      setIsRewriting(false);
    }
  };

  const isProcessing = isImproving || isSummarizing || isRewriting;

  return (
    <div className="flex flex-col gap-4">
      <EditorToolbar editor={editor} />
      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="flex gap-1 bg-background p-1 rounded-lg shadow-lg border">
            <Button
              size="sm"
              onClick={handleImproveText}
              disabled={isProcessing}
              variant="ghost"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              {isImproving ? "Improving..." : "Improve"}
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
        </BubbleMenu>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}