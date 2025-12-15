'use client';

import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sparkles,
  Lightbulb,
  RefreshCw,
  ChevronDown,
  BookOpen,
  Brain,
  Check,
  Clock,
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Undo,
  Redo,
  Mail,
  X,
} from 'lucide-react';
import { callPuterAI } from '@/lib/puter-ai-wrapper';
import { toast } from 'sonner';
import StarterKit from '@tiptap/starter-kit';
import { EditorEmailNotificationsSidebar } from './editor-email-notifications-sidebar';

interface NovelEditorWithNovelProps {
  documentId: string;
  initialContent?: any; // Using 'any' to accept both JSONContent and editor content objects
  onContentChange?: (content: any, html: string, plainText: string) => void;
  onSave?: (content: any) => Promise<void>;
  isReadOnly?: boolean;
  phase?: 'conceptualize' | 'research' | 'write' | 'submit';
  showAITools?: boolean;
  onCreateCheckpoint?: (label: string) => Promise<void>;
}

export function NovelEditorWithNovel({
  documentId,
  initialContent,
  onContentChange,
  onSave,
  isReadOnly = false,
  phase = 'write',
  showAITools = true,
  onCreateCheckpoint,
}: NovelEditorWithNovelProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCheckpointDialog, setShowCheckpointDialog] = useState(false);
  const [checkpointLabel, setCheckpointLabel] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [showNotificationsSidebar, setShowNotificationsSidebar] = useState(false);

  const defaultTemplate = {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: 'Your Thesis Title Here' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Start writing your thesis content here...' }],
      },
    ],
  };

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        bold: {},
        italic: {},
        strike: {},
        bulletList: {},
        orderedList: {},
        listItem: {},
      }),
    ] as any,
    content: initialContent || defaultTemplate,
    editable: !isReadOnly,
    editorProps: {
      attributes: {
        class:
          'prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[400px] w-full p-8 bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100',
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      const html = editor.getHTML();
      const plainText = editor.getText();
      setWordCount(plainText.split(/\s+/).filter(Boolean).length);
      onContentChange?.(json, html, plainText);
    },
  });

  const getDefaultTemplate = () => ({
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: 'Thesis Title' }],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Abstract' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Start writing your thesis here...' }],
      },
    ],
  });

  const handleCreateCheckpoint = async () => {
    if (!checkpointLabel.trim()) {
      toast.error('Please enter a checkpoint label');
      return;
    }

    if (onCreateCheckpoint) {
      try {
        await onCreateCheckpoint(checkpointLabel);
        toast.success(`Checkpoint "${checkpointLabel}" created!`);
        setCheckpointLabel('');
        setShowCheckpointDialog(false);
      } catch (error) {
        toast.error('Failed to create checkpoint');
        console.error(error);
      }
    }
  };

  // Formatting commands
  const formatCommands = {
    toggleBold: () => {
      if (!editor) return;
      editor.chain().focus().toggleBold().run();
    },
    toggleItalic: () => {
      if (!editor) return;
      editor.chain().focus().toggleItalic().run();
    },
    toggleStrike: () => {
      if (!editor) return;
      editor.chain().focus().toggleStrike().run();
    },
    toggleHeading2: () => {
      if (!editor) return;
      editor.chain().focus().toggleHeading({ level: 2 }).run();
    },
    toggleHeading3: () => {
      if (!editor) return;
      editor.chain().focus().toggleHeading({ level: 3 }).run();
    },
    toggleHeading4: () => {
      if (!editor) return;
      editor.chain().focus().toggleHeading({ level: 4 }).run();
    },
    toggleBulletList: () => {
      if (!editor) return;
      editor.chain().focus().toggleBulletList().run();
    },
    toggleOrderedList: () => {
      if (!editor) return;
      editor.chain().focus().toggleOrderedList().run();
    },
    undo: () => {
      if (!editor) return;
      editor.chain().focus().undo().run();
    },
    redo: () => {
      if (!editor) return;
      editor.chain().focus().redo().run();
    },
  };

  // AI-powered commands
  const aiCommands = {
    generateIntroduction: async () => {
      if (!editor) return;
      setIsProcessing(true);
      try {
        const prompt = `Write a compelling academic introduction for a thesis.
The introduction should:
- Hook the reader with relevance and significance
- Clearly state the problem being addressed
- Define key terms
- Outline the thesis structure
- Be 200-300 words
- Use academic tone
- Maintain coherent flow`;

        const text = await callPuterAI(prompt, { temperature: 0.7, max_tokens: 500 });
        editor
          .chain()
          .focus()
          .insertContent(`<h2>Introduction</h2><p>${text}</p>`)
          .run();
        toast.success('Introduction generated!');
      } catch (error) {
        toast.error('Failed to generate introduction');
        console.error(error);
      } finally {
        setIsProcessing(false);
      }
    },

    improveParagraph: async () => {
      if (!editor) return;
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to);

      if (!text) {
        toast.info('Please select a paragraph to improve');
        return;
      }

      setIsProcessing(true);
      try {
        const prompt = `You are an expert academic editor. Improve the following text by:
- Enhancing clarity and flow
- Correcting grammatical errors
- Strengthening academic tone
- Maintaining original meaning
- Return only the improved text

Original text:
${text}`;

        const improved = await callPuterAI(prompt, { temperature: 0.5, max_tokens: 1000 });
        editor.chain().focus().deleteRange({ from, to }).insertContent(improved).run();
        toast.success('Paragraph improved!');
      } catch (error) {
        toast.error('Failed to improve paragraph');
        console.error(error);
      } finally {
        setIsProcessing(false);
      }
    },

    generateOutline: async () => {
      if (!editor) return;
      setIsProcessing(true);
      try {
        const prompt = `Generate a detailed thesis chapter outline based on IMRaD structure.
Include:
- Chapter titles
- Main sections
- Key subsections
- Approximate word counts per section
Format as a hierarchical list suitable for an academic thesis.`;

        const outline = await callPuterAI(prompt, { temperature: 0.6, max_tokens: 800 });
        editor.chain().focus().insertContent(`<h2>Thesis Outline</h2><pre>${outline}</pre>`).run();
        toast.success('Outline generated!');
      } catch (error) {
        toast.error('Failed to generate outline');
        console.error(error);
      } finally {
        setIsProcessing(false);
      }
    },

    summarizeSelection: async () => {
      if (!editor) return;
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to);

      if (!text) {
        toast.info('Please select text to summarize');
        return;
      }

      setIsProcessing(true);
      try {
        const prompt = `Summarize the following academic text in 2-3 sentences:

${text}`;

        const summary = await callPuterAI(prompt, { temperature: 0.5, max_tokens: 200 });
        editor.chain().focus().deleteRange({ from, to }).insertContent(summary).run();
        toast.success('Text summarized!');
      } catch (error) {
        toast.error('Failed to summarize text');
        console.error(error);
      } finally {
        setIsProcessing(false);
      }
    },

    generateRelatedWork: async () => {
      if (!editor) return;
      setIsProcessing(true);
      try {
        const prompt = `Write a "Related Work" or "Literature Review" section for an academic thesis.
Include:
- Overview of the field
- Key studies and findings
- Theoretical frameworks
- Research gaps
- How current work fits in
- Use proper academic citations format (Author, Year)
- 300-400 words
- Academic tone`;

        const text = await callPuterAI(prompt, { temperature: 0.7, max_tokens: 600 });
        editor.chain().focus().insertContent(`<h2>Related Work</h2><p>${text}</p>`).run();
        toast.success('Related work section generated!');
      } catch (error) {
        toast.error('Failed to generate related work');
        console.error(error);
      } finally {
        setIsProcessing(false);
      }
    },

    generateConclusion: async () => {
      if (!editor) return;
      setIsProcessing(true);
      try {
        const prompt = `Write a comprehensive thesis conclusion that:
- Summarizes main findings/arguments
- Restates thesis significance
- Discusses implications
- Suggests future research directions
- Closes with strong final statement
- 200-300 words
- Maintains academic tone`;

        const text = await callPuterAI(prompt, { temperature: 0.7, max_tokens: 500 });
        editor.chain().focus().insertContent(`<h2>Conclusion</h2><p>${text}</p>`).run();
        toast.success('Conclusion generated!');
      } catch (error) {
        toast.error('Failed to generate conclusion');
        console.error(error);
      } finally {
        setIsProcessing(false);
      }
    },
  };

  if (!editor) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <p className="text-gray-500">Initializing editor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 relative">
      {/* Formatting Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 dark:bg-slate-900 rounded-lg border">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
                size="sm"
                onClick={formatCommands.toggleBold}
                disabled={isReadOnly}
              >
                <Bold className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bold</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
                size="sm"
                onClick={formatCommands.toggleItalic}
                disabled={isReadOnly}
              >
                <Italic className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Italic</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={editor.isActive('strike') ? 'secondary' : 'ghost'}
                size="sm"
                onClick={formatCommands.toggleStrike}
                disabled={isReadOnly}
              >
                <Strikethrough className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Strikethrough</TooltipContent>
          </Tooltip>

          <div className="border-l border-gray-200 dark:border-gray-700 mx-1 h-6" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={editor.isActive('heading', { level: 2 }) ? 'secondary' : 'ghost'}
                size="sm"
                onClick={formatCommands.toggleHeading2}
                disabled={isReadOnly}
              >
                <Heading2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Heading 2</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={editor.isActive('heading', { level: 3 }) ? 'secondary' : 'ghost'}
                size="sm"
                onClick={formatCommands.toggleHeading3}
                disabled={isReadOnly}
              >
                <Heading3 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Heading 3</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={editor.isActive('heading', { level: 4 }) ? 'secondary' : 'ghost'}
                size="sm"
                onClick={formatCommands.toggleHeading4}
                disabled={isReadOnly}
              >
                <Heading4 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Heading 4</TooltipContent>
          </Tooltip>

          <div className="border-l border-gray-200 dark:border-gray-700 mx-1 h-6" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'}
                size="sm"
                onClick={formatCommands.toggleBulletList}
                disabled={isReadOnly}
              >
                <List className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bullet List</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'}
                size="sm"
                onClick={formatCommands.toggleOrderedList}
                disabled={isReadOnly}
              >
                <ListOrdered className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Numbered List</TooltipContent>
          </Tooltip>

          <div className="border-l border-gray-200 dark:border-gray-700 mx-1 h-6" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={formatCommands.undo}
                disabled={!editor.can().undo() || isReadOnly}
              >
                <Undo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={formatCommands.redo}
                disabled={!editor.can().redo() || isReadOnly}
              >
                <Redo className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="flex-1" />

        <div className="text-sm text-gray-500 dark:text-gray-400">
          {wordCount} words
        </div>

        {/* Email Notifications Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={showNotificationsSidebar ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setShowNotificationsSidebar(!showNotificationsSidebar)}
              className="gap-2"
            >
              <Mail className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {showNotificationsSidebar ? 'Hide' : 'Show'} Email Notifications
          </TooltipContent>
        </Tooltip>
      </div>

      {/* AI Tools Toolbar */}
      {showAITools && (
        <div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => aiCommands.generateIntroduction()}
                  disabled={isProcessing || isReadOnly}
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Intro
                </Button>
              </TooltipTrigger>
              <TooltipContent>Generate introduction</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => aiCommands.improveParagraph()}
                  disabled={isProcessing || isReadOnly}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Improve
                </Button>
              </TooltipTrigger>
              <TooltipContent>Improve selected paragraph</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => aiCommands.generateOutline()}
                  disabled={isProcessing || isReadOnly}
                  className="gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Outline
                </Button>
              </TooltipTrigger>
              <TooltipContent>Generate thesis outline</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => aiCommands.summarizeSelection()}
                  disabled={isProcessing || isReadOnly}
                  className="gap-2"
                >
                  <Brain className="h-4 w-4" />
                  Summarize
                </Button>
              </TooltipTrigger>
              <TooltipContent>Summarize selected text</TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2" disabled={isReadOnly}>
                  <Lightbulb className="h-4 w-4" />
                  More <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => aiCommands.generateRelatedWork()}>
                  Generate Related Work
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => aiCommands.generateConclusion()}>
                  Generate Conclusion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex-1" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCheckpointDialog(true)}
                  disabled={isReadOnly}
                  className="gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Checkpoint
                </Button>
              </TooltipTrigger>
              <TooltipContent>Create a version checkpoint</TooltipContent>
            </Tooltip>

          </TooltipProvider>
        </div>
      )}

      {/* Editor */}
      <div className="border rounded-lg bg-white dark:bg-slate-950 overflow-hidden min-h-[600px]">
        <EditorContent editor={editor} />
      </div>

      {/* Checkpoint Dialog */}
      <Dialog open={showCheckpointDialog} onOpenChange={setShowCheckpointDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Checkpoint</DialogTitle>
            <DialogDescription>
              Save your current work as a named checkpoint for easy restoration later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="e.g., 'Draft of Chapter 1', 'Final Review Ready'"
              value={checkpointLabel}
              onChange={(e) => setCheckpointLabel(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isReadOnly}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCheckpointDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCheckpoint} disabled={isProcessing || isReadOnly}>
                <Check className="h-4 w-4 mr-2" />
                Create Checkpoint
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sliding Email Notifications Sidebar */}
      <div
        className={`fixed top-0 right-0 h-screen bg-white dark:bg-slate-950 shadow-2xl border-l border-gray-200 dark:border-gray-800 z-50 transition-transform duration-300 ease-in-out ${
          showNotificationsSidebar ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ width: '380px' }}
      >
        {/* Close Button */}
        <div className="sticky top-0 bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-gray-800 p-3 flex items-center justify-between z-10">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotificationsSidebar(false)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Sidebar Content */}
        <div className="overflow-y-auto h-[calc(100vh-60px)]">
          <EditorEmailNotificationsSidebar documentId={documentId} />
        </div>
      </div>

      {/* Overlay */}
      {showNotificationsSidebar && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setShowNotificationsSidebar(false)}
        />
      )}
    </div>
  );
}
