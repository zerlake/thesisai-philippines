"use client";

import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";

interface CertificateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  documentTitle: string;
  criticName: string;
  certificationDate: string;
}

export function CertificateDialog({ open, onOpenChange, studentName, documentTitle, criticName, certificationDate }: CertificateDialogProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPdf = async () => {
    if (!certificateRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(certificateRef.current, { cacheBust: true, backgroundColor: 'white', pixelRatio: 2 });
      const pdf = new jsPDF('l', 'mm', 'a4'); // landscape
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('certificate_of_editing.pdf');
      toast.success("Certificate downloaded successfully!");
    } catch (err) {
      toast.error("Failed to download certificate.");
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Certificate of Editing</DialogTitle>
          <DialogDescription>
            This certificate endorses that the manuscript has been reviewed for language and style.
          </DialogDescription>
        </DialogHeader>
        <div className="p-4 bg-muted overflow-y-auto">
          <div ref={certificateRef} className="bg-white text-black p-12 aspect-[297/210] w-full">
            <div className="border-4 border-blue-800 p-8 h-full flex flex-col items-center justify-center text-center">
              <h1 className="text-4xl font-serif text-blue-900">Certificate of Editing</h1>
              <p className="mt-8 text-lg">This is to certify that the manuscript entitled</p>
              <h2 className="text-2xl font-semibold my-4">&quot;{documentTitle}&quot;</h2>
              <p className="text-lg">by</p>
              <h3 className="text-3xl font-bold my-4">{studentName}</h3>
              <p className="text-lg">has been reviewed and edited for grammar, style, and clarity.</p>
              <div className="mt-auto pt-12 w-full flex justify-around">
                <div className="text-center">
                  <p className="border-t-2 border-black pt-2 w-64 font-semibold">{criticName}</p>
                  <p className="text-sm">Manuscript Critic</p>
                </div>
                <div className="text-center">
                  <p className="border-t-2 border-black pt-2 w-64 font-semibold">{certificationDate}</p>
                  <p className="text-sm">Date</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Button onClick={handleExportPdf} disabled={isExporting}>
          {isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
          Download as PDF
        </Button>
      </DialogContent>
    </Dialog>
  );
}