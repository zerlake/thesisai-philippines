"use client";

import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { ShareDialog } from "./share-dialog";
import { Eye, FileDown, Loader2, Save, Send, Share2, Undo2, CheckCircle, XCircle, Maximize } from "lucide-react";

interface EditorHeaderProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  reviewStatus: string;
  isOwner: boolean;
  canSubmit: boolean;
  isAwaitingExternal: boolean;
  isSubmitting: boolean;
  saveState: 'idle' | 'saving' | 'saved';
  documentId: string;
  isPublic: boolean;
  onSubmitForReview: () => void;
  onRevertToDraft: () => void;
  onSaveDocument: () => void;
  onExport: (format: 'docx' | 'pdf') => void;
  isExporting: boolean;
  toggleFocusMode: () => void;
}

export function EditorHeader({
  title, onTitleChange, reviewStatus, isOwner, canSubmit, isAwaitingExternal, isSubmitting,
  saveState, documentId, isPublic, onSubmitForReview, onRevertToDraft, onSaveDocument,
  onExport, isExporting, toggleFocusMode
}: EditorHeaderProps) {

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft': return <Badge variant="secondary">Draft</Badge>;
      case 'submitted': return <Badge className="bg-blue-100 text-blue-800">Submitted</Badge>;
      case 'approved': return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'needs_revision': return <Badge variant="destructive">Needs Revision</Badge>;
      case 'awaiting_external_review': return <Badge className="bg-yellow-100 text-yellow-800">Awaiting External Review</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 flex-1">
        <Input
          placeholder="Thesis Title"
          className="text-3xl font-bold border-none shadow-none focus-visible:ring-0 h-14 flex-1"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          disabled={!isOwner}
        />
        {getStatusBadge(reviewStatus)}
      </div>
      <div className="flex items-center gap-2">
        {isOwner && (
          <>
            {canSubmit && <Button onClick={onSubmitForReview} disabled={isSubmitting || saveState !== 'idle'}><Send className="w-4 h-4 mr-2" />Submit for Review</Button>}
            {isAwaitingExternal && <Button onClick={onRevertToDraft} disabled={isSubmitting || saveState !== 'idle'}><Undo2 className="w-4 h-4 mr-2" />Revert to Draft</Button>}
            <Button onClick={onSaveDocument} disabled={saveState !== 'idle'} variant="outline">
              {saveState === 'saving' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {saveState === 'saved' && <CheckCircle className="w-4 h-4 mr-2 text-green-500" />}
              {saveState === 'idle' && <Save className="w-4 h-4 mr-2" />}
              {saveState === 'saving' ? 'Saving...' : saveState === 'saved' ? 'Saved!' : 'Save'}
            </Button>
            <ShareDialog documentId={documentId} isPublic={isPublic}><Button variant="outline"><Share2 className="w-4 h-4 mr-2" />Share</Button></ShareDialog>
          </>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="outline"><FileDown className="w-4 h-4 mr-2" />Export</Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onExport('docx')} disabled={isExporting}>Export as DOCX</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onExport('pdf')} disabled={isExporting}>Export as PDF</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button onClick={toggleFocusMode} variant="outline" size="icon" title="Enter Focus Mode">
          <Maximize className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}