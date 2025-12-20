"use client";

import { useEffect, useState } from "react";
import { UnifiedNovelEditor } from "@/components/unified-novel-editor";
import { ReviewNotesPanel } from "@/components/review-notes-panel";
import { useAuth } from "@/components/auth-provider";
import { BrandedLoader } from "@/components/branded-loader";
import { toast } from "sonner";
// @ts-ignore - useParams is available in client components in Next.js 15
import { useParams } from "next/navigation";

export default function DocumentEditorPage() {
  const params = useParams();
  const documentId = Array.isArray(params.documentId) ? params.documentId[0] : params.documentId;
  const { session, supabase, profile } = useAuth();
  const [initialContent, setInitialContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [documentTitle, setDocumentTitle] = useState<string>("");
  const [studentId, setStudentId] = useState<string>("");
  const [isNotesPanelOpen, setIsNotesPanelOpen] = useState(false);

  useEffect(() => {
    if (!documentId || !session) return;

    const loadDocument = async () => {
      setIsLoading(true);
      try {
        // Load from documents table
        const { data, error } = await supabase
          .from('documents')
          .select('content, title, user_id')
          .eq('id', documentId)
          .single();

        if (error) {
          // PGRST116 = no rows found
          if (error.code !== 'PGRST116') {
            console.error('Error loading document:', error.message || error.code || error);
            toast.error('Failed to load document');
          }
          return;
        }

        if (data) {
          if (data.content) {
            // Handle both string and object content
            const content = typeof data.content === 'string'
              ? JSON.parse(data.content)
              : data.content;
            setInitialContent(content);
          }
          if (data.title) {
            setDocumentTitle(data.title);
          }
          // Get student ID (document owner) for advisor/critic context
          if (data.user_id) {
            setStudentId(data.user_id);
          }
        }
      } catch (err: any) {
        console.error('Error loading document:', err?.message || err);
        toast.error('Failed to load document');
      } finally {
        setIsLoading(false);
      }
    };

    loadDocument();
  }, [documentId, session, supabase]);

  const handleSave = async (content: Record<string, any>) => {
    if (!documentId || !session) return;

    try {
      const { error } = await supabase
        .from('documents')
        .update({
          content: JSON.stringify(content),
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId);

      if (error) {
        console.error('Error saving document:', error.message || error);
        throw error;
      }
    } catch (err: any) {
      console.error('Error saving document:', err?.message || err);
      throw err;
    }
  };

  const handleCreateCheckpoint = async (label: string) => {
    if (!documentId || !session) return;

    try {
      const { error } = await supabase
        .from('document_versions')
        .insert({
          document_id: documentId,
          user_id: session.user.id,
          label: label,
          content: initialContent,
        });

      if (error) throw error;
    } catch (err) {
      console.error('Error creating checkpoint:', err);
      throw err;
    }
  };

  if (!documentId) {
    return <BrandedLoader />;
  }

  if (isLoading) {
    return <BrandedLoader />;
  }

  // Determine mode based on user role
  const mode = profile?.role === 'critic' ? 'critic' : profile?.role === 'advisor' ? 'advisor' : 'student';
  const isReadOnly = profile?.role === 'critic' || profile?.role === 'advisor';
  const showNotesPanel = profile?.role === 'critic' || profile?.role === 'advisor';

  return (
    <div className="relative">
      {/* Main Editor Area - adjusts width when notes panel is open */}
      <div
        className="transition-all duration-300"
        style={{
          marginRight: showNotesPanel && isNotesPanelOpen ? '400px' : '0',
        }}
      >
        <div className="space-y-4">
          {documentTitle && (
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">{documentTitle}</h1>
              {isReadOnly && (
                <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  Read-only mode
                </span>
              )}
            </div>
          )}
          <UnifiedNovelEditor
            documentId={documentId}
            initialContent={initialContent}
            onSave={handleSave}
            onCreateCheckpoint={handleCreateCheckpoint}
            isReadOnly={isReadOnly}
            showAITools={!isReadOnly}
            mode={mode}
            autoSaveInterval={3000}
          />
        </div>
      </div>

      {/* Review Notes Panel for Advisors/Critics */}
      {showNotesPanel && (
        <ReviewNotesPanel
          documentId={documentId}
          studentId={studentId}
          isOpen={isNotesPanelOpen}
          onToggle={() => setIsNotesPanelOpen(!isNotesPanelOpen)}
          mode={mode as 'advisor' | 'critic'}
        />
      )}
    </div>
  );
}