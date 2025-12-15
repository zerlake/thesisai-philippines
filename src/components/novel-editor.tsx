'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { CharacterCount } from '@tiptap/extension-character-count';
import { FloatingMenu } from '@tiptap/extension-floating-menu';
import { BubbleMenu } from '@tiptap/extension-bubble-menu';
import { Dropcursor } from '@tiptap/extension-dropcursor';
import { Gapcursor } from '@tiptap/extension-gapcursor';
import { toast } from 'sonner';
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
  Mail,
  X,
  Trash2,
} from 'lucide-react';
import { callPuterAI } from '@/lib/puter-ai-wrapper';
import { EditorEmailNotificationsSidebar } from './editor-email-notifications-sidebar';
import { useAuth } from './auth-provider';
import { Autocomplete } from '@/lib/tiptap/autocomplete-extension';
import AutocompleteOverlay from './autocomplete-overlay';

interface NovelEditorProps {
  documentId: string;
  initialContent?: Record<string, any>;
  onContentChange?: (content: Record<string, any>, html: string, plainText: string) => void;
  onSave?: (content: Record<string, any>) => Promise<void>;
  isReadOnly?: boolean;
  phase?: 'conceptualize' | 'research' | 'write' | 'submit';
  showAITools?: boolean;
  onCreateCheckpoint?: (label: string) => Promise<void>;
}

export function NovelEditor({
  documentId,
  initialContent,
  onContentChange,
  onSave,
  isReadOnly = false,
  phase = 'write',
  showAITools = true,
  onCreateCheckpoint,
}: NovelEditorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCheckpointDialog, setShowCheckpointDialog] = useState(false);
  const [checkpointLabel, setCheckpointLabel] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showNotificationsSidebar, setShowNotificationsSidebar] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(380);
  const [isResizing, setIsResizing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const saveTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

  const { session, supabase } = useAuth();
  const user = session?.user;
  const editorRef = useRef(null);
  const hasInitialized = useRef(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      CharacterCount.configure({
        limit: 100000,
      }),
      FloatingMenu.configure({
        shouldShow: ({ state }) => {
          const { selection } = state;
          const isSelection = !selection.empty;
          return isSelection;
        },
      }),
      BubbleMenu.configure({
        shouldShow: ({ state }) => {
          const { selection } = state;
          return !selection.empty;
        },
      }),
      Dropcursor,
      Gapcursor,
      Autocomplete.configure({
        debounceMs: 300,
        minChars: 3,
        maxSuggestions: 3,
        enabled: true,
      }),
    ] as any,
    content: getDefaultTemplate(),
    editable: !isReadOnly,
    editorProps: {
      attributes: {
        class:
          'prose max-w-none focus:outline-none min-h-[600px] w-full p-8 bg-white text-gray-900 rounded-lg border relative', // White background with dark contrasting text
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      const html = editor.getHTML();
      const plainText = editor.getText();
      setWordCount(plainText.split(/\s+/).filter(Boolean).length);
      onContentChange?.(json, html, plainText);

      // Auto-save with debounce
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
      saveTimeout.current = setTimeout(() => {
        handleAutoSave(json);
      }, 2000);
    },
  });

  // Load initial content only once after editor is ready
  useEffect(() => {
    if (editor && initialContent && !hasInitialized.current) {
      hasInitialized.current = true;
      editor.commands.setContent(initialContent, { emitUpdate: false });
    }
  }, [editor]);

  // Handle sidebar resize
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate new width from the right edge of the window
      const newWidth = window.innerWidth - e.clientX;

      // Constrain width between 280px and 800px
      const constrainedWidth = Math.min(Math.max(newWidth, 280), 800);

      setSidebarWidth(constrainedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Prevent text selection during resize
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isResizing]);

  function getDefaultTemplate() {
    return {
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
    };
  }

  const handleAutoSave = async (content: Record<string, any>) => {
    if (!documentId || isReadOnly || !onSave) return;

    setIsSaving(true);
    try {
      await onSave(content);
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

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

  const handleClearContent = () => {
    if (editor) {
      editor.commands.setContent(getDefaultTemplate(), { emitUpdate: true });
      toast.success('Content cleared. Ready to edit!');
      setShowClearConfirm(false);
    }
  };

  // AI-powered commands
  const aiCommands = {
    generateIntroduction: async () => {
      if (!editor) {
        console.warn('No editor instance available');
        return;
      }
      setIsProcessing(true);
      console.log('Starting introduction generation...');
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

        console.log('Calling Puter AI with prompt...');
        const text = await callPuterAI(prompt, { temperature: 0.7, max_tokens: 500 });
        console.log('Puter AI response received:', text.substring(0, 100) + '...');
        
        editor
          .chain()
          .insertContent(`<h2>Introduction</h2><p>${text}</p>`)
          .run();
        toast.success('Introduction generated!');
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error('Error generating introduction:', errorMsg);
        toast.error('Failed to generate introduction: ' + errorMsg);
      } finally {
        setIsProcessing(false);
      }
    },

    improveParagraph: async () => {
      if (!editor) {
        console.warn('No editor instance available');
        return;
      }
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to);

      if (!text) {
        toast.info('Please select a paragraph to improve');
        return;
      }

      setIsProcessing(true);
      console.log('Starting paragraph improvement...');
      try {
        const prompt = `You are an expert academic editor. Improve the following text by:
- Enhancing clarity and flow
- Correcting grammatical errors
- Strengthening academic tone
- Maintaining original meaning
- Return only the improved text

Original text:
${text}`;

        console.log('Calling Puter AI for paragraph improvement...');
        const improved = await callPuterAI(prompt, { temperature: 0.5, max_tokens: 1000 });
        console.log('Improvement received, inserting into editor...');
        editor.chain().focus().deleteRange({ from, to }).insertContent(improved).run();
        toast.success('Paragraph improved!');
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error('Error improving paragraph:', errorMsg);
        toast.error('Failed to improve paragraph: ' + errorMsg);
      } finally {
        setIsProcessing(false);
      }
    },

    generateOutline: async () => {
      if (!editor) {
        console.warn('No editor instance available');
        return;
      }
      setIsProcessing(true);
      console.log('Starting outline generation...');
      try {
        const prompt = `Generate a detailed thesis chapter outline based on IMRaD structure.
Include:
- Chapter titles
- Main sections
- Key subsections
- Approximate word counts per section
Format as a hierarchical list suitable for an academic thesis.`;

        console.log('Calling Puter AI for outline...');
        const outline = await callPuterAI(prompt, { temperature: 0.6, max_tokens: 800 });
        console.log('Outline received');
        editor.chain().insertContent(`<h2>Thesis Outline</h2><pre>${outline}</pre>`).run();
        toast.success('Outline generated!');
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error('Error generating outline:', errorMsg);
        toast.error('Failed to generate outline: ' + errorMsg);
      } finally {
        setIsProcessing(false);
      }
    },

    summarizeSelection: async () => {
      if (!editor) {
        console.warn('No editor instance available');
        return;
      }
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to);

      if (!text) {
        toast.info('Please select text to summarize');
        return;
      }

      setIsProcessing(true);
      console.log('Starting text summarization...');
      try {
        const prompt = `Summarize the following academic text in 2-3 sentences:

${text}`;

        console.log('Calling Puter AI for summarization...');
        const summary = await callPuterAI(prompt, { temperature: 0.5, max_tokens: 200 });
        console.log('Summary received');
        editor.chain().focus().deleteRange({ from, to }).insertContent(summary).run();
        toast.success('Text summarized!');
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error('Error summarizing text:', errorMsg);
        toast.error('Failed to summarize text: ' + errorMsg);
      } finally {
        setIsProcessing(false);
      }
    },

    generateRelatedWork: async () => {
      if (!editor) {
        console.warn('No editor instance available');
        return;
      }
      setIsProcessing(true);
      console.log('Starting related work generation...');
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

        console.log('Calling Puter AI for related work...');
        const text = await callPuterAI(prompt, { temperature: 0.7, max_tokens: 600 });
        console.log('Related work received');
        editor.chain().insertContent(`<h2>Related Work</h2><p>${text}</p>`).run();
        toast.success('Related work section generated!');
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error('Error generating related work:', errorMsg);
        toast.error('Failed to generate related work: ' + errorMsg);
      } finally {
        setIsProcessing(false);
      }
    },

    generateConclusion: async () => {
      if (!editor) {
        console.warn('No editor instance available');
        return;
      }
      setIsProcessing(true);
      console.log('Starting conclusion generation...');
      try {
        const prompt = `Write a comprehensive thesis conclusion that:
- Summarizes main findings/arguments
- Restates thesis significance
- Discusses implications
- Suggests future research directions
- Closes with strong final statement
- 200-300 words
- Maintains academic tone`;

        console.log('Calling Puter AI for conclusion...');
        const text = await callPuterAI(prompt, { temperature: 0.7, max_tokens: 500 });
        console.log('Conclusion received');
        editor.chain().insertContent(`<h2>Conclusion</h2><p>${text}</p>`).run();
        toast.success('Conclusion generated!');
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error('Error generating conclusion:', errorMsg);
        toast.error('Failed to generate conclusion: ' + errorMsg);
      } finally {
        setIsProcessing(false);
      }
    },
  };

  if (!editor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500">Initializing editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      {showAITools && (
        <div className="flex items-center gap-2 p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border flex-wrap">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => aiCommands.generateIntroduction()}
                  disabled={isProcessing}
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
                  disabled={isProcessing}
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
                  disabled={isProcessing}
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
                  disabled={isProcessing}
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
                <Button variant="ghost" size="sm" className="gap-2">
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

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowClearConfirm(true)}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear
                </Button>
              </TooltipTrigger>
              <TooltipContent>Remove sample content and start fresh</TooltipContent>
            </Tooltip>

            <div className="flex-1" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCheckpointDialog(true)}
                  className="gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Checkpoint
                </Button>
              </TooltipTrigger>
              <TooltipContent>Create a version checkpoint</TooltipContent>
            </Tooltip>

            <div className="text-sm text-gray-500 dark:text-gray-400">
              {wordCount} words
              {isSaving && (
                <span className="ml-2 inline-flex items-center gap-1">
                  <Clock className="h-3 w-3 animate-spin" />
                  Saving...
                </span>
              )}
            </div>

            {/* Email Notifications Toggle - Always visible for developers */}
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

          </TooltipProvider>
        </div>
      )}

      {/* Editor with autocomplete overlay */}
      <div className="border rounded-lg bg-white overflow-hidden relative">
        <EditorContent editor={editor} />
        <AutocompleteOverlay editor={editor} />
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
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCheckpointDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCheckpoint} disabled={isProcessing}>
                <Check className="h-4 w-4 mr-2" />
                Create Checkpoint
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clear Content Dialog */}
      <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear Sample Content?</DialogTitle>
            <DialogDescription>
              This will remove all sample content and replace it with a blank template. This action cannot be undone unless you restore a previous checkpoint.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowClearConfirm(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleClearContent}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Content
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sliding Email Notifications Sidebar */}
      <div
        className={`fixed top-0 right-0 h-screen bg-white dark:bg-slate-950 shadow-2xl border-l border-gray-200 dark:border-gray-800 z-50 ${
          showNotificationsSidebar ? 'translate-x-0' : 'translate-x-full'
        } ${isResizing ? '' : 'transition-transform duration-300 ease-in-out'}`}
        style={{
          width: `${sidebarWidth}px`,
          cursor: isResizing ? 'col-resize' : 'default',
          userSelect: isResizing ? 'none' : 'auto',
          transition: isResizing ? 'none' : 'transform 300ms ease-in-out'
        } as React.CSSProperties}
      >
        {/* Resize Handle */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-1.5 hover:w-2 cursor-col-resize z-50 ${
            isResizing
              ? 'bg-blue-500 w-2'
              : 'bg-gray-300 dark:bg-gray-600 hover:bg-blue-500'
          }`}
          style={{
            transition: isResizing ? 'none' : 'all 0.2s'
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsResizing(true);
          }}
        />

        {/* Close Button */}
        <div className="sticky top-0 bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-gray-800 p-3 flex items-center justify-between z-10">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
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
