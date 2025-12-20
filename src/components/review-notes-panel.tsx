'use client';

import { useEffect, useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
import { useAuth } from './auth-provider';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Save,
  Trash2,
  Send,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileText,
  Plus,
  X,
  Loader2,
  Bold,
  Italic,
  List,
  Highlighter,
  MoreVertical,
  Copy,
  History,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ReviewNote {
  id: string;
  document_id: string;
  reviewer_id: string;
  reviewer_name?: string;
  reviewer_role: 'advisor' | 'critic';
  content: any;
  content_html?: string;
  note_type: 'general' | 'revision' | 'approval' | 'suggestion';
  status: 'draft' | 'sent';
  created_at: string;
  updated_at: string;
}

interface ReviewNotesPanelProps {
  documentId: string;
  studentId?: string;
  isOpen: boolean;
  onToggle: () => void;
  mode: 'advisor' | 'critic';
  className?: string;
}

const noteTypeConfig = {
  general: {
    label: 'General Comment',
    icon: MessageSquare,
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  revision: {
    label: 'Revision Required',
    icon: AlertTriangle,
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  },
  approval: {
    label: 'Approval',
    icon: CheckCircle2,
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
  },
  suggestion: {
    label: 'Suggestion',
    icon: Lightbulb,
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  },
};

export function ReviewNotesPanel({
  documentId,
  studentId,
  isOpen,
  onToggle,
  mode,
  className,
}: ReviewNotesPanelProps) {
  const { session, supabase, profile } = useAuth();
  const [notes, setNotes] = useState<ReviewNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [noteType, setNoteType] = useState<ReviewNote['note_type']>('general');
  const [panelWidth, setPanelWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: mode === 'advisor'
          ? 'Write your feedback for the student...'
          : 'Write your review comments here...',
      }),
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[150px] p-3',
          'bg-background rounded-md border'
        ),
      },
    },
  });

  // Load notes
  useEffect(() => {
    if (!documentId || !session) return;

    const loadNotes = async () => {
      setIsLoading(true);
      try {
        // Try to load from review_notes table
        const { data, error } = await supabase
          .from('review_notes')
          .select('*')
          .eq('document_id', documentId)
          .eq('reviewer_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) {
          // Table might not exist, use local storage as fallback
          console.warn('review_notes table not available, using local storage');
          const localNotes = localStorage.getItem(`review_notes_${documentId}_${session.user.id}`);
          if (localNotes) {
            setNotes(JSON.parse(localNotes));
          }
        } else {
          setNotes(data || []);
        }
      } catch (err) {
        console.error('Error loading notes:', err);
        // Fallback to local storage
        const localNotes = localStorage.getItem(`review_notes_${documentId}_${session.user.id}`);
        if (localNotes) {
          setNotes(JSON.parse(localNotes));
        }
      }
      setIsLoading(false);
    };

    loadNotes();
  }, [documentId, session, supabase]);

  // Handle resize
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX;
      setPanelWidth(Math.min(Math.max(newWidth, 300), 600));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isResizing]);

  const saveNotesToLocalStorage = (updatedNotes: ReviewNote[]) => {
    if (session) {
      localStorage.setItem(
        `review_notes_${documentId}_${session.user.id}`,
        JSON.stringify(updatedNotes)
      );
    }
  };

  const handleSaveNote = async () => {
    if (!editor || !session) return;

    const content = editor.getJSON();
    const contentHtml = editor.getHTML();
    const plainText = editor.getText();

    if (!plainText.trim()) {
      toast.error('Please write something before saving');
      return;
    }

    setIsSaving(true);

    const noteData: ReviewNote = {
      id: activeNoteId || `note_${Date.now()}`,
      document_id: documentId,
      reviewer_id: session.user.id,
      reviewer_name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Reviewer',
      reviewer_role: mode,
      content,
      content_html: contentHtml,
      note_type: noteType,
      status: 'draft',
      created_at: activeNoteId ? notes.find(n => n.id === activeNoteId)?.created_at || new Date().toISOString() : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      // Try to save to database
      const { error } = await supabase
        .from('review_notes')
        .upsert(noteData, { onConflict: 'id' });

      if (error) {
        // Fallback to local storage
        const updatedNotes = activeNoteId
          ? notes.map(n => n.id === activeNoteId ? noteData : n)
          : [noteData, ...notes];
        setNotes(updatedNotes);
        saveNotesToLocalStorage(updatedNotes);
      } else {
        // Refresh notes from database
        const { data } = await supabase
          .from('review_notes')
          .select('*')
          .eq('document_id', documentId)
          .eq('reviewer_id', session.user.id)
          .order('created_at', { ascending: false });

        if (data) setNotes(data);
      }

      toast.success('Note saved!');
      editor.commands.clearContent();
      setActiveNoteId(null);
      setNoteType('general');
    } catch (err) {
      // Fallback to local storage
      const updatedNotes = activeNoteId
        ? notes.map(n => n.id === activeNoteId ? noteData : n)
        : [noteData, ...notes];
      setNotes(updatedNotes);
      saveNotesToLocalStorage(updatedNotes);
      toast.success('Note saved locally!');
      editor.commands.clearContent();
      setActiveNoteId(null);
    }

    setIsSaving(false);
  };

  const handleSendToStudent = async (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;

    // Update status to sent
    const updatedNote = { ...note, status: 'sent' as const, updated_at: new Date().toISOString() };

    try {
      await supabase
        .from('review_notes')
        .update({ status: 'sent', updated_at: new Date().toISOString() })
        .eq('id', noteId);
    } catch (err) {
      // Local storage fallback
    }

    const updatedNotes = notes.map(n => n.id === noteId ? updatedNote : n);
    setNotes(updatedNotes);
    saveNotesToLocalStorage(updatedNotes);
    toast.success('Feedback sent to student!');
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await supabase.from('review_notes').delete().eq('id', noteId);
    } catch (err) {
      // Local storage fallback
    }

    const updatedNotes = notes.filter(n => n.id !== noteId);
    setNotes(updatedNotes);
    saveNotesToLocalStorage(updatedNotes);
    toast.success('Note deleted');
  };

  const handleEditNote = (note: ReviewNote) => {
    setActiveNoteId(note.id);
    setNoteType(note.note_type);
    if (editor && note.content) {
      editor.commands.setContent(note.content);
    }
  };

  const handleCopyNote = (note: ReviewNote) => {
    if (note.content_html) {
      navigator.clipboard.writeText(note.content_html.replace(/<[^>]*>/g, ''));
      toast.success('Note copied to clipboard!');
    }
  };

  const handleNewNote = () => {
    setActiveNoteId(null);
    setNoteType('general');
    editor?.commands.clearContent();
    editor?.commands.focus();
  };

  const NoteTypeIcon = noteTypeConfig[noteType].icon;

  if (!isOpen) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              onClick={onToggle}
              className="fixed right-4 top-1/2 -translate-y-1/2 z-40 h-12 w-12 rounded-full shadow-lg"
            >
              <MessageSquare className="h-5 w-5" />
              {notes.length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {notes.length}
                </Badge>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Open {mode === 'advisor' ? 'Feedback' : 'Review'} Notes</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div
      className={cn(
        'fixed top-0 right-0 h-screen bg-card border-l shadow-xl z-40 flex flex-col',
        className
      )}
      style={{ width: `${panelWidth}px` }}
    >
      {/* Resize Handle */}
      <div
        ref={resizeRef}
        className={cn(
          'absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize z-50',
          'hover:bg-primary/50 transition-colors',
          isResizing && 'bg-primary'
        )}
        onMouseDown={() => setIsResizing(true)}
      />

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          <h3 className="font-semibold">
            {mode === 'advisor' ? 'Advisor Feedback' : 'Critic Review Notes'}
          </h3>
          <Badge variant="secondary">{notes.length}</Badge>
        </div>
        <Button variant="ghost" size="icon" onClick={onToggle}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Note Editor */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <NoteTypeIcon className="h-4 w-4" />
                {noteTypeConfig[noteType].label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {Object.entries(noteTypeConfig).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => setNoteType(key as ReviewNote['note_type'])}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {config.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {activeNoteId && (
            <Button variant="ghost" size="sm" onClick={handleNewNote}>
              <Plus className="h-4 w-4 mr-1" />
              New Note
            </Button>
          )}
        </div>

        {/* Mini formatting toolbar */}
        {editor && (
          <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-md">
            <Button
              variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="h-3 w-3" />
            </Button>
            <Button
              variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic className="h-3 w-3" />
            </Button>
            <Button
              variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List className="h-3 w-3" />
            </Button>
            <Button
              variant={editor.isActive('highlight') ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => editor.chain().focus().toggleHighlight().run()}
            >
              <Highlighter className="h-3 w-3" />
            </Button>
          </div>
        )}

        <EditorContent editor={editor} />

        <div className="flex items-center gap-2">
          <Button
            onClick={handleSaveNote}
            disabled={isSaving}
            className="flex-1"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {activeNoteId ? 'Update Note' : 'Save Note'}
          </Button>
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No notes yet</p>
            <p className="text-xs mt-1">Write your first feedback note above</p>
          </div>
        ) : (
          notes.map((note) => {
            const typeConfig = noteTypeConfig[note.note_type];
            const TypeIcon = typeConfig.icon;

            return (
              <Card key={note.id} className="relative">
                <CardHeader className="p-3 pb-2">
                  <div className="flex items-center justify-between">
                    <Badge className={cn('text-xs', typeConfig.color)}>
                      <TypeIcon className="h-3 w-3 mr-1" />
                      {typeConfig.label}
                    </Badge>
                    <div className="flex items-center gap-1">
                      {note.status === 'sent' ? (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Sent
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Draft
                        </Badge>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditNote(note)}>
                            <FileText className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopyNote(note)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </DropdownMenuItem>
                          {note.status === 'draft' && (
                            <DropdownMenuItem onClick={() => handleSendToStudent(note.id)}>
                              <Send className="h-4 w-4 mr-2" />
                              Send to Student
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div
                    className="prose prose-sm dark:prose-invert max-w-none text-sm"
                    dangerouslySetInnerHTML={{ __html: note.content_html || '' }}
                  />
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t bg-muted/30 text-xs text-muted-foreground text-center">
        {notes.filter(n => n.status === 'draft').length} draft(s) | {notes.filter(n => n.status === 'sent').length} sent
      </div>
    </div>
  );
}
