'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { CharacterCount } from '@tiptap/extension-character-count';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
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
  DropdownMenuSeparator,
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
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Link as LinkIcon,
  Highlighter,
  Type,
  Trash2,
  Save,
  FileText,
  Loader2,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { callPuterAI } from '@/lib/puter-ai-wrapper';
import { useAuth } from './auth-provider';
import { cn } from '@/lib/utils';

interface UnifiedNovelEditorProps {
  documentId: string;
  initialContent?: Record<string, any> | string;
  onContentChange?: (content: Record<string, any>, html: string, plainText: string) => void;
  onSave?: (content: Record<string, any>) => Promise<void>;
  isReadOnly?: boolean;
  placeholder?: string;
  showAITools?: boolean;
  showFormattingToolbar?: boolean;
  minHeight?: string;
  className?: string;
  onCreateCheckpoint?: (label: string) => Promise<void>;
  autoSaveInterval?: number; // in milliseconds, 0 to disable
  mode?: 'student' | 'critic' | 'advisor';
}

const defaultContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [],
    },
  ],
};

export function UnifiedNovelEditor({
  documentId,
  initialContent,
  onContentChange,
  onSave,
  isReadOnly = false,
  placeholder = 'Write your draft here...',
  showAITools = true,
  showFormattingToolbar = true,
  minHeight = '600px',
  className,
  onCreateCheckpoint,
  autoSaveInterval = 3000,
  mode = 'student',
}: UnifiedNovelEditorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCheckpointDialog, setShowCheckpointDialog] = useState(false);
  const [checkpointLabel, setCheckpointLabel] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showWordLimitDialog, setShowWordLimitDialog] = useState(false);
  const [targetWordCount, setTargetWordCount] = useState(5000);
  const [showFormattingDialog, setShowFormattingDialog] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<'apa' | 'mla' | 'chicago'>('apa');
  const saveTimeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const hasInitialized = useRef(false);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  const { session, supabase } = useAuth();

  // Parse initial content
  const getInitialContent = () => {
    if (!initialContent) return defaultContent;
    if (typeof initialContent === 'string') {
      try {
        return JSON.parse(initialContent);
      } catch {
        return {
          type: 'doc',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: initialContent }] }],
        };
      }
    }
    return initialContent;
  };

  const editor = useEditor({
    immediatelyRender: true,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      CharacterCount.configure({
        limit: 500000,
      }),
      Placeholder.configure({
        placeholder,
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline cursor-pointer',
        },
      }),
    ],
    content: defaultContent,
    editable: !isReadOnly,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-lg dark:prose-invert max-w-none focus:outline-none w-full p-8',
          'prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl',
          'prose-p:my-4 prose-p:leading-relaxed',
          'prose-ul:list-disc prose-ol:list-decimal',
          'prose-li:my-1',
          'prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic',
          isReadOnly ? 'cursor-default' : '',
          'bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100',
          'rounded-lg shadow-sm',
          '[&_p.is-editor-empty:first-child::before]:text-gray-400 [&_p.is-editor-empty:first-child::before]:dark:text-gray-600 [&_p.is-editor-empty:first-child::before]:pointer-events-none [&_p.is-editor-empty:first-child::before]:opacity-50'
        ),
        style: `min-height: ${minHeight}`,
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      const html = editor.getHTML();
      const plainText = editor.getText();

      setWordCount(plainText.split(/\s+/).filter(Boolean).length);
      setCharCount(plainText.length);

      onContentChange?.(json, html, plainText);

      // Auto-save with debounce
      if (autoSaveInterval > 0 && onSave && !isReadOnly) {
        if (saveTimeout.current) {
          clearTimeout(saveTimeout.current);
        }
        saveTimeout.current = setTimeout(() => {
          handleAutoSave(json);
        }, autoSaveInterval);
      }
    },
  });

  // Load initial content only once after editor is ready
  useEffect(() => {
    if (editor && !hasInitialized.current) {
      hasInitialized.current = true;
      const content = getInitialContent();
      
      // Check if content is actually empty (no text)
      const isEmpty = content?.content?.every((block: any) => 
        !block.content || block.content.length === 0
      );
      
      if (isEmpty) {
        // For empty documents, clear content to show placeholder
        editor.commands.setContent('', { emitUpdate: false });
      } else {
        // Use setContent with emitUpdate: false to prevent triggering onUpdate during initialization
        editor.commands.setContent(content, { emitUpdate: false });
      }
      // Force editor to render the content
      editor.view.updateState(editor.state);
    }
  }, [editor]);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isFullscreen]);

  // Lock body scroll when fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleAutoSave = async (content: Record<string, any>) => {
    if (!documentId || isReadOnly || !onSave) return;

    setIsSaving(true);
    try {
      await onSave(content);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualSave = async () => {
    if (!editor || !onSave) return;
    const json = editor.getJSON();
    setIsSaving(true);
    try {
      await onSave(json);
      setLastSaved(new Date());
      toast.success('Document saved!');
    } catch (error) {
      toast.error('Failed to save document');
      console.error(error);
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
      editor.commands.setContent(defaultContent, { emitUpdate: true });
      toast.success('Content cleared!');
      setShowClearConfirm(false);
    }
  };

  // Formatting commands
  const formatCommands = {
    toggleBold: () => editor?.chain().focus().toggleBold().run(),
    toggleItalic: () => editor?.chain().focus().toggleItalic().run(),
    toggleUnderline: () => editor?.chain().focus().toggleUnderline().run(),
    toggleStrike: () => editor?.chain().focus().toggleStrike().run(),
    toggleHeading1: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
    toggleHeading2: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
    toggleHeading3: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
    toggleBulletList: () => editor?.chain().focus().toggleBulletList().run(),
    toggleOrderedList: () => editor?.chain().focus().toggleOrderedList().run(),
    setTextAlign: (align: 'left' | 'center' | 'right') => editor?.chain().focus().setTextAlign(align).run(),
    toggleHighlight: () => editor?.chain().focus().toggleHighlight().run(),
    undo: () => editor?.chain().focus().undo().run(),
    redo: () => editor?.chain().focus().redo().run(),
    setLink: () => {
      const url = window.prompt('Enter URL');
      if (url) {
        editor?.chain().focus().setLink({ href: url }).run();
      }
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
        editor.chain().focus().insertContent(`<h2>Introduction</h2><p>${text}</p>`).run();
        toast.success('Introduction generated!');
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        toast.error('Failed to generate introduction: ' + errorMsg);
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
        const errorMsg = error instanceof Error ? error.message : String(error);
        toast.error('Failed to improve paragraph: ' + errorMsg);
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
        const errorMsg = error instanceof Error ? error.message : String(error);
        toast.error('Failed to generate outline: ' + errorMsg);
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
        const errorMsg = error instanceof Error ? error.message : String(error);
        toast.error('Failed to summarize text: ' + errorMsg);
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
        const errorMsg = error instanceof Error ? error.message : String(error);
        toast.error('Failed to generate related work: ' + errorMsg);
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
        const errorMsg = error instanceof Error ? error.message : String(error);
        toast.error('Failed to generate conclusion: ' + errorMsg);
      } finally {
        setIsProcessing(false);
      }
    },

    // Critic-specific AI commands
    generateFeedback: async () => {
      if (!editor) return;
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to);

      if (!text) {
        toast.info('Please select text to generate feedback for');
        return;
      }

      setIsProcessing(true);
      try {
        const prompt = `As an academic critic, provide constructive feedback on the following thesis excerpt:

"${text}"

Provide:
1. Strengths of this section
2. Areas for improvement
3. Specific suggestions
4. Academic tone assessment

Keep feedback professional, constructive, and actionable.`;

        const feedback = await callPuterAI(prompt, { temperature: 0.6, max_tokens: 500 });
        toast.success('Feedback generated! Check the output.');
        // Insert as a comment/note
        editor.chain().focus().insertContent(`<blockquote><strong>Critic Feedback:</strong><br/>${feedback}</blockquote>`).run();
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        toast.error('Failed to generate feedback: ' + errorMsg);
      } finally {
        setIsProcessing(false);
      }
    },

    adjustWordLimit: async (targetWordCount: number) => {
      if (!editor) return;
      const text = editor.getJSON().content?.map((c: any) => c.content?.map((cc: any) => cc.text).join('') || '').join('\n') || '';
      const currentWordCount = text.split(/\s+/).length;

      setIsProcessing(true);
      try {
        const adjustment = targetWordCount < currentWordCount ? 'condense' : 'expand';
        const prompt = `You are an expert academic editor. Please ${adjustment} the following thesis text to approximately ${targetWordCount} words while maintaining:
- All key arguments and findings
- Academic rigor and tone
- Proper structure and flow
- Citation validity

Current word count: ${currentWordCount}
Target word count: ${targetWordCount}

Text to adjust:
${text}

Return only the adjusted text without any explanation.`;

        const adjusted = await callPuterAI(prompt, { temperature: 0.6, max_tokens: targetWordCount + 500 });
        editor.chain().focus().setContent(adjusted).run();
        toast.success(`Draft adjusted to ~${targetWordCount} words!`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        toast.error('Failed to adjust word count: ' + errorMsg);
      } finally {
        setIsProcessing(false);
      }
    },

    applyFormattingStyle: async (style: 'apa' | 'mla' | 'chicago') => {
      if (!editor) return;
      const text = editor.getJSON().content?.map((c: any) => c.content?.map((cc: any) => cc.text).join('') || '').join('\n') || '';

      setIsProcessing(true);
      try {
        const styleGuides: Record<string, string> = {
          apa: 'APA 7th Edition format',
          mla: 'MLA 9th Edition format',
          chicago: 'Chicago Style 17th Edition (Notes-Bibliography)',
        };

        const prompt = `You are an expert academic formatter. Reformat the following thesis text according to ${styleGuides[style]} standards. 

Key formatting rules:
${
  style === 'apa'
    ? '- Double-spaced, Times New Roman 12pt\n- In-text citations: (Author, Year)\n- References page at end\n- Headers in APA format'
    : style === 'mla'
      ? '- Double-spaced, Times New Roman 12pt\n- In-text citations: (Author page)\n- Works Cited page at end\n- Hanging indent for citations'
      : '- Double-spaced, Times New Roman 12pt\n- Footnotes/endnotes for citations\n- Bibliography at end\n- Chapter headings properly formatted'
}

Maintain all content while applying the formatting standards.

Text to format:
${text}

Return the properly formatted text.`;

        const formatted = await callPuterAI(prompt, { temperature: 0.5, max_tokens: 2000 });
        editor.chain().focus().setContent(formatted).run();
        toast.success(`Formatting applied: ${style.toUpperCase()}`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        toast.error(`Failed to apply ${style} formatting: ` + errorMsg);
      } finally {
        setIsProcessing(false);
      }
    },

    generateChapterTemplates: async () => {
      if (!editor) return;
      setIsProcessing(true);
      try {
        const prompt = `Generate comprehensive chapter skeleton templates for a thesis with the following structure:
1. Introduction Chapter
2. Literature Review/Related Work
3. Methodology/Research Design
4. Results/Findings
5. Discussion
6. Conclusion

For each chapter, provide:
- Suggested structure and subsections
- Word count expectations
- Key elements to include
- Placeholder text in [BRACKETS]
- Tips for academic writing in that section

Format as full-text chapter skeletons that can be directly used as starting points.`;

        const templates = await callPuterAI(prompt, { temperature: 0.7, max_tokens: 3000 });
        editor.chain().focus().insertContent(`<h2>Chapter Templates</h2><pre>${templates}</pre>`).run();
        toast.success('Chapter templates generated!');
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        toast.error('Failed to generate templates: ' + errorMsg);
      } finally {
        setIsProcessing(false);
      }
    },

    improveCitations: async () => {
      if (!editor) return;
      const text = editor.getJSON().content?.map((c: any) => c.content?.map((cc: any) => cc.text).join('') || '').join('\n') || '';

      setIsProcessing(true);
      try {
        const prompt = `Review the following thesis text and enhance it by:
1. Adding proper in-text citations where needed
2. Suggesting scholarly sources for key claims
3. Improving citation formatting consistency
4. Identifying unsupported statements that need citations
5. Maintaining academic rigor

Current text:
${text}

Return the enhanced text with improved citations and notes on what was added or changed.`;

        const enhanced = await callPuterAI(prompt, { temperature: 0.6, max_tokens: 2000 });
        editor.chain().focus().setContent(enhanced).run();
        toast.success('Citations improved and enhanced!');
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        toast.error('Failed to improve citations: ' + errorMsg);
      } finally {
        setIsProcessing(false);
      }
    },
  };

  if (!editor) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight }}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">Initializing editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={editorContainerRef}
      className={cn(
        'space-y-4',
        className,
        isFullscreen && 'fixed inset-0 z-50 bg-background p-4 overflow-auto'
      )}
    >
      {/* Formatting Toolbar */}
      {showFormattingToolbar && (
        <div className="flex flex-wrap items-center gap-1 p-2 bg-muted/50 rounded-lg border sticky top-0 z-10 backdrop-blur-sm">
          <TooltipProvider>
            {/* Text formatting */}
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
              <TooltipContent>Bold (Ctrl+B)</TooltipContent>
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
              <TooltipContent>Italic (Ctrl+I)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={editor.isActive('underline') ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={formatCommands.toggleUnderline}
                  disabled={isReadOnly}
                >
                  <UnderlineIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Underline (Ctrl+U)</TooltipContent>
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

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={editor.isActive('highlight') ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={formatCommands.toggleHighlight}
                  disabled={isReadOnly}
                >
                  <Highlighter className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Highlight</TooltipContent>
            </Tooltip>

            <div className="border-l border-gray-200 dark:border-gray-700 mx-1 h-6" />

            {/* Headings */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={editor.isActive('heading', { level: 1 }) ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={formatCommands.toggleHeading1}
                  disabled={isReadOnly}
                >
                  <Heading1 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Heading 1</TooltipContent>
            </Tooltip>

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

            <div className="border-l border-gray-200 dark:border-gray-700 mx-1 h-6" />

            {/* Lists */}
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

            {/* Alignment */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={editor.isActive({ textAlign: 'left' }) ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => formatCommands.setTextAlign('left')}
                  disabled={isReadOnly}
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Align Left</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={editor.isActive({ textAlign: 'center' }) ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => formatCommands.setTextAlign('center')}
                  disabled={isReadOnly}
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Align Center</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={editor.isActive({ textAlign: 'right' }) ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => formatCommands.setTextAlign('right')}
                  disabled={isReadOnly}
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Align Right</TooltipContent>
            </Tooltip>

            <div className="border-l border-gray-200 dark:border-gray-700 mx-1 h-6" />

            {/* Link */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={editor.isActive('link') ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={formatCommands.setLink}
                  disabled={isReadOnly}
                >
                  <LinkIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add Link</TooltipContent>
            </Tooltip>

            <div className="border-l border-gray-200 dark:border-gray-700 mx-1 h-6" />

            {/* Undo/Redo */}
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
              <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
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
              <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
            </Tooltip>

            <div className="flex-1" />

            {/* Word/Char count */}
            <div className="text-xs text-muted-foreground flex items-center gap-3">
              <span>{wordCount} words</span>
              <span>{charCount} chars</span>
              {isSaving && (
                <span className="inline-flex items-center gap-1 text-yellow-500">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Saving...
                </span>
              )}
              {lastSaved && !isSaving && (
                <span className="text-green-500">Saved</span>
              )}
            </div>

            {/* Save button */}
            {onSave && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleManualSave}
                    disabled={isReadOnly || isSaving}
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Save (Ctrl+S)</TooltipContent>
              </Tooltip>
            )}

            {/* Fullscreen toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isFullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {/* AI Tools Toolbar */}
      {showAITools && !isReadOnly && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20">
          <div className="flex items-center gap-1 text-sm font-medium text-purple-600 dark:text-purple-400 mr-2">
            <Sparkles className="h-4 w-4" />
            AI Tools
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={aiCommands.generateIntroduction}
                  disabled={isProcessing}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
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
                  onClick={aiCommands.improveParagraph}
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
                  onClick={aiCommands.generateOutline}
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
                  onClick={aiCommands.summarizeSelection}
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
                <Button variant="ghost" size="sm" className="gap-2" disabled={isProcessing}>
                  <Lightbulb className="h-4 w-4" />
                  More <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={aiCommands.generateRelatedWork}>
                  Generate Related Work
                </DropdownMenuItem>
                <DropdownMenuItem onClick={aiCommands.generateConclusion}>
                  Generate Conclusion
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowWordLimitDialog(true)}>
                  Adjust Word Limit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowFormattingDialog(true)}>
                  Apply Citation Format
                </DropdownMenuItem>
                <DropdownMenuItem onClick={aiCommands.generateChapterTemplates}>
                  Generate Chapter Templates
                </DropdownMenuItem>
                <DropdownMenuItem onClick={aiCommands.improveCitations}>
                  Improve & Add Citations
                </DropdownMenuItem>
                {mode === 'critic' && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={aiCommands.generateFeedback}>
                      Generate Feedback
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {isProcessing && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </div>
            )}

            <div className="flex-1" />

            {onCreateCheckpoint && (
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
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowClearConfirm(true)}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Clear content</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {/* Editor Content */}
      <div className="border rounded-lg overflow-hidden bg-white dark:bg-slate-950 shadow-sm">
        <EditorContent 
          editor={editor}
          className="w-full bg-white dark:bg-slate-950"
        />
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
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
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
            <DialogTitle>Clear Content?</DialogTitle>
            <DialogDescription>
              This will remove all content and replace it with a blank template. This action cannot be undone unless you restore a previous checkpoint.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowClearConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearContent}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Content
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Word Limit Dialog */}
      <Dialog open={showWordLimitDialog} onOpenChange={setShowWordLimitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Word Limit</DialogTitle>
            <DialogDescription>
              Tailor your draft to a specific word count. AI will condense or expand while maintaining academic rigor.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Target Word Count: <span className="font-bold text-primary">{targetWordCount}</span>
              </label>
              <input
                type="range"
                min="1000"
                max="50000"
                step="500"
                value={targetWordCount}
                onChange={(e) => setTargetWordCount(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>1,000 words</span>
                <span>50,000 words</span>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowWordLimitDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  aiCommands.adjustWordLimit(targetWordCount);
                  setShowWordLimitDialog(false);
                }}
                disabled={isProcessing}
              >
                {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Adjust Draft
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Citation Format Dialog */}
      <Dialog open={showFormattingDialog} onOpenChange={setShowFormattingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply Citation Format</DialogTitle>
            <DialogDescription>
              Reformat your entire draft according to specific citation and formatting standards.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer p-3 border rounded-lg hover:bg-accent" 
                onClick={() => setSelectedStyle('apa')}>
                <input
                  type="radio"
                  name="style"
                  value="apa"
                  checked={selectedStyle === 'apa'}
                  onChange={() => setSelectedStyle('apa')}
                  className="cursor-pointer"
                />
                <div>
                  <div className="font-medium">APA 7th Edition</div>
                  <div className="text-sm text-muted-foreground">In-text: (Author, Year) • Double-spaced • Times New Roman 12pt</div>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-3 border rounded-lg hover:bg-accent"
                onClick={() => setSelectedStyle('mla')}>
                <input
                  type="radio"
                  name="style"
                  value="mla"
                  checked={selectedStyle === 'mla'}
                  onChange={() => setSelectedStyle('mla')}
                  className="cursor-pointer"
                />
                <div>
                  <div className="font-medium">MLA 9th Edition</div>
                  <div className="text-sm text-muted-foreground">In-text: (Author Page) • Works Cited page • Hanging indent</div>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer p-3 border rounded-lg hover:bg-accent"
                onClick={() => setSelectedStyle('chicago')}>
                <input
                  type="radio"
                  name="style"
                  value="chicago"
                  checked={selectedStyle === 'chicago'}
                  onChange={() => setSelectedStyle('chicago')}
                  className="cursor-pointer"
                />
                <div>
                  <div className="font-medium">Chicago Style 17th Edition</div>
                  <div className="text-sm text-muted-foreground">Notes-Bibliography • Footnotes/Endnotes • Bibliography page</div>
                </div>
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowFormattingDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  aiCommands.applyFormattingStyle(selectedStyle);
                  setShowFormattingDialog(false);
                }}
                disabled={isProcessing}
              >
                {isProcessing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Apply Format
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
