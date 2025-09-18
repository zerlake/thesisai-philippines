"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Wand2, MessageCircle } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { AIAssistantPanel } from "./ai-assistant-panel";
import { AdvisorAiToolkit } from "./advisor-ai-toolkit";
import { AdvisorReviewPanel } from "./advisor-review-panel";
import { CommentSidebar } from "./comment-sidebar";
import { useIsMobile } from "../hooks/use-mobile";
import { type Editor } from "@tiptap/react";
import { type Comment } from "@/hooks/useDocument";

interface EditorAICompanionProps {
  isOwner: boolean;
  isAdvisorViewing: boolean;
  editor: Editor | null;
  documentContent: string;
  documentId: string;
  reviewStatus: string;
  onReviewSubmit: () => void;
  comments: Comment[];
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
}

export function EditorAICompanion({
  isOwner, isAdvisorViewing, editor, documentContent, documentId, reviewStatus,
  onReviewSubmit, comments, setComments
}: EditorAICompanionProps) {
  const isMobile = useIsMobile();
  const [isCommentSidebarOpen, setIsCommentSidebarOpen] = useState(false);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);

  return (
    <>
      <div>
        <div className="flex flex-col gap-4 pt-20">
          <Button variant="outline" size="icon" onClick={() => setIsCommentSidebarOpen(!isCommentSidebarOpen)}>
            <MessageCircle className="w-5 h-5" />
          </Button>
          {isOwner && (
            isMobile ? (
              <Sheet>
                <SheetTrigger asChild><Button className="rounded-full h-12 w-12 shadow-lg"><Wand2 className="w-6 h-6" /></Button></SheetTrigger>
                <SheetContent><SheetHeader><SheetTitle>AI Assistant</SheetTitle><SheetDescription>Supercharge your writing process.</SheetDescription></SheetHeader><div className="py-4"><AIAssistantPanel editor={editor} documentContent={documentContent} documentId={documentId} /></div></SheetContent>
              </Sheet>
            ) : (
              <AIAssistantPanel editor={editor} documentContent={documentContent} documentId={documentId} />
            )
          )}
          {isAdvisorViewing && (
            <div className="hidden lg:block space-y-6">
              <AdvisorAiToolkit editor={editor} />
              {reviewStatus === 'submitted' && <AdvisorReviewPanel documentId={documentId} onReviewSubmit={onReviewSubmit} />}
            </div>
          )}
        </div>
      </div>

      {isCommentSidebarOpen && (
        <div className="fixed top-16 right-0 h-[calc(100vh-64px)] w-80 bg-card border-l z-10">
          <CommentSidebar 
            documentId={documentId} 
            editor={editor} 
            comments={comments}
            setComments={setComments}
            activeCommentId={activeCommentId}
            setActiveCommentId={setActiveCommentId}
          />
        </div>
      )}
    </>
  );
}