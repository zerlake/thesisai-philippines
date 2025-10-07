"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "./auth-provider";
import { Skeleton } from "./ui/skeleton";
import { RichTextEditor } from "./rich-text-editor";
import { saveAs } from "file-saver";
// @ts-ignore
import htmlDocx from "html-docx-js/dist/html-docx";
import jsPDF from "jspdf";
import { useEditor } from "@tiptap/react";
import CharacterCount from "@tiptap/extension-character-count";
import BubbleMenuExtension from "@tiptap/extension-bubble-menu";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { ExternalReviewDialog } from "./external-review-dialog";
import { CommentHighlight } from "@/lib/tiptap/comment-highlight";
import { useFocusMode } from "@/contexts/focus-mode-context";
import { FocusTimer } from "./focus-timer";
import { useDocument } from "@/hooks/useDocument";
import { EditorHeader } from "./editor-header";
import { EditorStatusBar } from "./editor-status-bar";
import { EditorAICompanion } from "./editor-ai-companion";
import { format } from "date-fns";
import { CheckCircle, XCircle, Eye, Minimize, Award } from "lucide-react";
import { Button } from "./ui/button";
import { CertificateDialog } from "./certificate-dialog";

// Import individual extensions instead of StarterKit
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Heading from '@tiptap/extension-heading';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Strike from '@tiptap/extension-strike';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import History from '@tiptap/extension-history';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Dropcursor from '@tiptap/extension-dropcursor';
import Gapcursor from '@tiptap/extension-gapcursor';
import HardBreak from '@tiptap/extension-hard-break';

export function Editor({ documentId }: { documentId: string }) {
  const { profile, supabase } = useAuth();
  const { isFocusMode, toggleFocusMode, isTimerActive } = useFocusMode();

  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExternalReviewDialogOpen, setIsExternalReviewDialogOpen] = useState(false);
  const [isCertificateDialogOpen, setIsCertificateDialogOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      Document, Paragraph, Text, Heading.configure({ levels: [2, 3, 4] }),
      Bold, Italic, Strike, BulletList, OrderedList, ListItem, History,
      HorizontalRule, Dropcursor, Gapcursor, HardBreak,
      CharacterCount, BubbleMenuExtension, CommentHighlight.configure({
        HTMLAttributes: { class: 'comment-highlight' },
      }),
    ],
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[calc(100vh-350px)]",
      },
    },
    onUpdate({ editor }) {
      doc.setContent(editor.getHTML());
      setWordCount((editor.storage as any).characterCount.words());
      setCharacterCount((editor.storage as any).characterCount.characters());
    },
  });

  const doc = useDocument(documentId, editor);

  useEffect(() => {
    if (editor && !doc.isOwner) {
      editor.setEditable(false);
    }
  }, [editor, doc.isOwner]);

  const handleSubmitForReview = async () => {
    if (!doc.isOwner) return;
    if (profile?.external_advisor_name) {
      setIsExternalReviewDialogOpen(true);
      return;
    }
    if (!profile?.advisor) {
      toast.error("You must connect with an advisor in your settings before submitting for review.");
      return;
    }
    setIsSubmitting(true);
    const { error } = await supabase.from("documents").update({ review_status: 'submitted' }).eq("id", documentId);
    if (error) toast.error("Failed to submit for review.");
    else {
      toast.success("Document submitted for review!");
      doc.setReviewStatus('submitted');
    }
    setIsSubmitting(false);
  };

  const handleRevertToDraft = async () => {
    if (!doc.isOwner) return;
    setIsSubmitting(true);
    const { error } = await supabase.from("documents").update({ review_status: 'draft' }).eq("id", documentId);
    if (error) toast.error("Failed to revert to draft.");
    else {
      toast.success("Document is now a draft and can be edited.");
      doc.setReviewStatus('draft');
    }
    setIsSubmitting(false);
  };

  const handleExport = async (format: 'docx' | 'pdf') => {
    setIsExporting(true);
    if (format === 'docx') {
      const contentHtml = `<h1>${doc.title}</h1>${doc.content}`;
      const converted = htmlDocx.asBlob(contentHtml);
      saveAs(converted, `${doc.title || 'document'}.docx`);
    } else {
      const pdf = new jsPDF();
      pdf.html(editor?.view.dom as HTMLElement, {
        callback: (pdfDoc: jsPDF) => { pdfDoc.save(`${doc.title || 'document'}.pdf`); },
        x: 15, y: 15,
        width: 170, windowWidth: 650
      });
    }
    
    if (profile?.external_advisor_name && doc.reviewStatus !== 'awaiting_external_review') {
      const { error } = await supabase.from("documents").update({ review_status: 'awaiting_external_review' }).eq("id", documentId);
      if (error) toast.error("Failed to update document status.");
      else {
        toast.success("Document status updated to 'Awaiting External Review'.");
        doc.setReviewStatus('awaiting_external_review');
      }
    }
    setIsExternalReviewDialogOpen(false);
    setIsExporting(false);
  };

  if (doc.isLoading || !editor) {
    return <Skeleton className="h-screen w-full" />;
  }

  const latestReview = doc.reviewHistory[0];
  const canSubmit = doc.isOwner && (doc.reviewStatus === 'draft' || doc.reviewStatus === 'needs_revision' || doc.reviewStatus === 'critic_revision_requested');
  const isAwaitingExternal = doc.isOwner && doc.reviewStatus === 'awaiting_external_review';
  const isAdvisorViewing = !doc.isOwner && profile?.role === 'advisor';
  const canGenerateCertificate = doc.isCriticViewing && doc.reviewStatus === 'approved' && !!doc.certificationDate;
  const studentName = `${doc.studentProfile?.first_name || ''} ${doc.studentProfile?.last_name || ''}`.trim();
  const criticName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim();
  const certificationDate = doc.certificationDate ? format(new Date(doc.certificationDate), "MMMM d, yyyy") : '';

  return (
    <>
      {isTimerActive && <FocusTimer />}
      {isFocusMode && (
        <Button onClick={toggleFocusMode} variant="outline" size="icon" className="fixed top-4 right-4 z-50" title="Exit Focus Mode">
          <Minimize className="w-4 h-4" />
        </Button>
      )}
      <div className={`grid ${isAdvisorViewing || doc.isCriticViewing ? 'lg:grid-cols-[1fr_350px]' : 'lg:grid-cols-[1fr_auto]'} gap-8 max-w-7xl mx-auto ${isFocusMode ? 'p-4 md:p-12' : ''}`}>
        <div className="space-y-4">
          {(isAdvisorViewing || doc.isCriticViewing) && <Alert><Eye className="h-4 w-4" /><AlertTitle>{profile?.role === 'critic' ? 'Critic' : 'Advisor'} Read-Only Mode</AlertTitle><AlertDescription>You are viewing a student&apos;s document. Use the toolkit on the right to generate feedback.</AlertDescription></Alert>}
          {doc.isOwner && (doc.reviewStatus === 'approved' || doc.reviewStatus === 'needs_revision') && latestReview && (
            <Alert variant={doc.reviewStatus === 'approved' ? 'default' : 'destructive'}>
              {doc.reviewStatus === 'approved' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <AlertTitle>Feedback from {latestReview.profiles?.first_name || 'your advisor'} on {isMounted && format(new Date(latestReview.created_at), "MMMM d, yyyy")}</AlertTitle>
              <AlertDescription>{latestReview.comments || "No comments provided."}</AlertDescription>
            </Alert>
          )}

          <EditorHeader
            title={doc.title}
            onTitleChange={doc.setTitle}
            reviewStatus={doc.reviewStatus}
            isOwner={doc.isOwner}
            canSubmit={canSubmit}
            isAwaitingExternal={isAwaitingExternal}
            isSubmitting={isSubmitting}
            saveState={doc.saveState}
            documentId={documentId}
            isPublic={doc.isPublic}
            onSubmitForReview={handleSubmitForReview}
            onRevertToDraft={handleRevertToDraft}
            onSaveDocument={() => doc.saveDocument(true)}
            onExport={handleExport}
            isExporting={isExporting}
            toggleFocusMode={toggleFocusMode}
            canGenerateCertificate={canGenerateCertificate}
            onGenerateCertificate={() => setIsCertificateDialogOpen(true)}
          />
          <RichTextEditor editor={editor} />
        </div>

        <EditorAICompanion
          isOwner={doc.isOwner}
          isAdvisorViewing={isAdvisorViewing}
          isCriticViewing={doc.isCriticViewing}
          editor={editor}
          documentContent={doc.content}
          documentId={documentId}
          reviewStatus={doc.reviewStatus}
          onReviewSubmit={doc.fetchDocumentData}
          comments={doc.comments}
          setComments={doc.setComments}
        />

        <EditorStatusBar
          wordCount={wordCount}
          characterCount={characterCount}
          saveState={doc.saveState}
          isOwner={doc.isOwner}
          isOffline={doc.isOffline}
        />

        <ExternalReviewDialog open={isExternalReviewDialogOpen} onOpenChange={setIsExternalReviewDialogOpen} onExport={handleExport} isExporting={isExporting} />
        
        {canGenerateCertificate && (
          <CertificateDialog
            open={isCertificateDialogOpen}
            onOpenChange={setIsCertificateDialogOpen}
            studentName={studentName}
            documentTitle={doc.title}
            criticName={criticName}
            certificationDate={certificationDate}
          />
        )}
      </div>
    </>
  );
}