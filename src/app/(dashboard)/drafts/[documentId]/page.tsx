"use client";

import { useEffect, useState, useRef } from "react";
import { UnifiedNovelEditor } from "@/components/unified-novel-editor";
import { ReviewNotesPanel } from "@/components/review-notes-panel";
import { useAuth } from "@/components/auth-provider";
import { BrandedLoader } from "@/components/branded-loader";
import { toast } from "sonner";
// @ts-ignore - useParams is available in client components in Next.js 15
import { useParams, useRouter } from "next/navigation";
import ThesisFinalizer from "@/components/ThesisFinalizer";
import { AdvisorMessagesPanel } from "@/components/advisor-messages-panel";
import { StudentMessagesPanel } from "@/components/student-messages-panel";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { TestimonialRequestModal } from "@/components/TestimonialRequestModal";

export default function DocumentEditorPage() {
  const params = useParams();
  const router = useRouter();
  const documentId = Array.isArray(params.documentId) ? params.documentId[0] : params.documentId;
  const { session, supabase, profile, isLoading: authLoading } = useAuth();
  const [initialContent, setInitialContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [documentTitle, setDocumentTitle] = useState<string>("");
  const [studentId, setStudentId] = useState<string>("");
  const [isNotesPanelOpen, setIsNotesPanelOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);

  // Track if document has been loaded for this documentId
  const loadedDocumentIdRef = useRef<string | null>(null);

  // Load document on mount - only once per documentId
  useEffect(() => {
    // Only load if we have a document ID and haven't loaded this document yet
    if (!documentId) {
      return;
    }

    // Prevent re-loading the same document
    if (loadedDocumentIdRef.current === documentId) {
      return;
    }

    let isMounted = true;

    const loadDocument = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('documents')
          .select('content, title, user_id')
          .eq('id', documentId)
          .single();

        if (!isMounted) return;

        if (error) {
          if (error.code !== 'PGRST116') {
            console.error('Error loading document:', error);
            toast.error('Failed to load document');
          }
          setIsLoading(false);
          return;
        }

        if (data) {
          if (data.content) {
            const content = typeof data.content === 'string'
              ? JSON.parse(data.content)
              : data.content;
            setInitialContent(content);
          }
          if (data.title) {
            setDocumentTitle(data.title);
          }
          if (data.user_id) {
            setStudentId(data.user_id);
          }
        }
        
        setIsLoading(false);
        loadedDocumentIdRef.current = documentId;
      } catch (err: any) {
        if (!isMounted) return;
        console.error('Error loading document:', err);
        toast.error('Failed to load document');
        setIsLoading(false);
      }
    };

    loadDocument();

    return () => {
      isMounted = false;
    };
  }, [documentId]);

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

  const handleSubmitToAdvisor = async () => {
    if (!documentId || !session) return;

    setIsSubmitting(true);
    try {
      // Update document status to pending_review
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          status: 'pending_review',
          updated_at: new Date().toISOString(),
        })
        .eq('id', documentId);

      if (updateError) {
        console.error('Update error details:', updateError);
        throw new Error(updateError.message || 'Failed to update document status');
      }

      toast.success('Draft submitted to your advisor!');

      // Show testimonial modal instead of immediate redirect
      setShowTestimonialModal(true);

    } catch (err: any) {
      console.error('Error submitting to advisor:', err?.message || err);
      toast.error(err?.message || 'Failed to submit draft to advisor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestimonialComplete = () => {
    // Redirect to chat/messages page after modal closes
    router.push('/chat');
  };

  if (!documentId) {
    return <BrandedLoader />;
  }

  // Only show loader while actively loading the document, not based on auth state
  // which can fluctuate and cause flickering
  if (isLoading || !documentTitle) {
    return <BrandedLoader />;
  }

  // Check if this is a Thesis Finalizer document
  const isThesisFinalizerProPlus = documentTitle.includes("Thesis Finalizer Pro +");
  const isThesisFinalizerPro = documentTitle.includes("Thesis Finalizer Pro");

  // Check access based on user profile - with safe defaults
  const hasPremiumPlusAccess = !!(profile && (
    profile.plan === 'pro_plus_advisor' ||
    profile.plan === 'pro_complete' ||
    profile.is_pro_user === true ||
    profile.role === 'admin' ||
    (profile.email && profile.email.includes('demo'))
  ));

  const hasProAccess = !!(profile && (
    profile.plan === 'pro' ||
    profile.plan === 'pro_plus_advisor' ||
    profile.plan === 'pro_complete' ||
    profile.is_pro_user === true ||
    profile.role === 'admin'
  ));

  // Determine mode and permissions with safe defaults
  const role = profile?.role || 'student';
  const mode = role === 'critic' ? 'critic' : role === 'advisor' ? 'advisor' : 'student';
  const isReadOnly = role === 'critic' || role === 'advisor';
  const showNotesPanel = role === 'critic' || role === 'advisor';

  // Determine what to show
  const showThesisFinalizer =
    (isThesisFinalizerProPlus && hasPremiumPlusAccess) ||
    (isThesisFinalizerPro && hasProAccess);

  const showMessagingPanel = isThesisFinalizerProPlus && hasPremiumPlusAccess;

  return (
    <div className="relative">
      <TestimonialRequestModal
        isOpen={showTestimonialModal}
        onClose={handleTestimonialComplete}
        onSuccess={handleTestimonialComplete}
        planType={profile?.plan === 'pro_complete' ? 'pro_complete' : 'pro_advisor'}
      />
      {/* Main Editor Area - adjusts width when messaging panel is open */}
      <div
        className="transition-all duration-300"
        style={{
          marginRight: showMessagingPanel && isNotesPanelOpen ? '400px' : '0',
        }}
      >
        <div className="space-y-4">
          {documentTitle && (
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">
                  {isThesisFinalizerProPlus ? "Final Draft for Submission" : documentTitle}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                {isThesisFinalizerProPlus && hasPremiumPlusAccess && mode === 'student' && (
                  <Button
                    onClick={handleSubmitToAdvisor}
                    disabled={isSubmitting}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {isSubmitting ? 'Submitting...' : 'Submit to Advisor'}
                  </Button>
                )}
                {isReadOnly && (
                  <span className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    Read-only mode
                  </span>
                )}
              </div>
            </div>
          )}

          {isThesisFinalizerProPlus && !hasPremiumPlusAccess ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-4">Premium Access Required</h2>
              <p className="text-muted-foreground mb-6">
                This Thesis Finalizer Pro + document requires a Pro + Advisor or Pro Complete subscription to access.
              </p>
              <p className="text-sm text-muted-foreground">
                Upgrade your plan to edit and collaborate on this final draft.
              </p>
            </div>
          ) : isThesisFinalizerProPlus ? (
            <UnifiedNovelEditor
              documentId={documentId}
              initialContent={initialContent}
              onSave={handleSave}
              onCreateCheckpoint={handleCreateCheckpoint}
              isReadOnly={isReadOnly}
              showAITools={!isReadOnly}
              mode={mode}
              autoSaveInterval={3000}
              placeholder="Write your draft here..."
            />
          ) : showThesisFinalizer ? (
            <ThesisFinalizer
              onSave={(finalDraft, shouldComplete = false) => {
                const paragraphs = finalDraft.split('\n\n').filter(p => p.trim() !== '');

                const contentForSaving = {
                  type: "doc",
                  content: paragraphs.map(paragraph => ({
                    type: "paragraph",
                    content: paragraph.split('\n').map((line) => ({
                      type: "text",
                      text: line
                    })).flat()
                  }))
                };

                handleSave(contentForSaving);
                toast.success('Draft saved successfully!');
              }}
            />
          ) : (
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
          )}
        </div>
      </div>

      {/* Messaging Panel for Thesis Finalizer Pro + documents */}
      {showMessagingPanel && hasPremiumPlusAccess && (
        <div
          className={`absolute top-0 right-0 h-full bg-background border-l transition-all duration-300 z-50 ${
            isNotesPanelOpen ? 'w-96' : 'w-0 overflow-hidden'
          }`}
        >
          <div className="h-full flex flex-col border-l">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Final Draft Communication</h3>
              <button
                onClick={() => setIsNotesPanelOpen(!isNotesPanelOpen)}
                className="text-muted-foreground hover:text-foreground"
              >
                {isNotesPanelOpen ? 'Close' : 'Open'} Messaging
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {profile?.role === 'advisor' || profile?.role === 'critic' ? (
                <AdvisorMessagesPanel />
              ) : (
                <StudentMessagesPanel />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Notes Panel for Advisors/Critics (only for non-Thesis Finalizer Pro + documents) */}
      {!isThesisFinalizerProPlus && showNotesPanel && (
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
