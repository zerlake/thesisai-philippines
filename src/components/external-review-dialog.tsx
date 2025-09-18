"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import { FileDown, Loader2 } from "lucide-react";

interface ExternalReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (format: 'docx' | 'pdf') => void;
  isExporting: boolean;
}

export function ExternalReviewDialog({ open, onOpenChange, onExport, isExporting }: ExternalReviewDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Submit for External Review</AlertDialogTitle>
          <AlertDialogDescription>
            You have designated an external advisor. To submit your work for their review, you must first export it. This will also update the document's status to "Awaiting External Review".
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <div className="flex gap-2">
            <Button onClick={() => onExport('docx')} disabled={isExporting}>
              {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileDown className="w-4 h-4 mr-2" />}
              Export as DOCX
            </Button>
            <Button onClick={() => onExport('pdf')} disabled={isExporting}>
              {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileDown className="w-4 h-4 mr-2" />}
              Export as PDF
            </Button>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}