"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { FileDown, Loader2 } from "lucide-react";

interface ExternalReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (format: 'docx' | 'pdf') => void;
  isExporting: boolean;
}

export function ExternalReviewDialog({
  open,
  onOpenChange,
  onExport,
  isExporting,
}: ExternalReviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Prepare for External Review</DialogTitle>
          <DialogDescription>
            Export your document to share with your external advisor. After exporting, the document status will be updated to "Awaiting External Review".
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 pt-4">
          <Button
            size="lg"
            variant="outline"
            onClick={() => onExport('docx')}
            disabled={isExporting}
          >
            {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileDown className="w-4 h-4 mr-2" />}
            Export as DOCX
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => onExport('pdf')}
            disabled={isExporting}
          >
            {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileDown className="w-4 h-4 mr-2" />}
            Export as PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}