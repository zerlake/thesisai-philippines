'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { jsPDF } from 'jspdf';

interface Slide {
  title: string;
  bullets: string[];
  timeEstimate: number;
}

interface PdfGeneratorProps {
  slides: Slide[];
}

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

export function PdfGenerator({ slides }: PdfGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePdf = async () => {
    setIsGenerating(true);

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'in',
      format: [10, 7.5]
    });

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      doc.addPage();
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 10, 7.5, 'F');

      doc.setTextColor(255, 255, 255);

      doc.setFontSize(56);
      doc.setFont('helvetica', 'bold');
      doc.text(escapeHtml(slide.title), 0.5, 1, { maxWidth: 9 });

      doc.setFontSize(24);
      doc.setFont('helvetica', 'normal');
      let y = 3;
      for (const bullet of slide.bullets) {
        doc.text(`• ${escapeHtml(bullet)}`, 1, y, { maxWidth: 8 });
        y += 0.5;
      }

      doc.setDrawColor(255, 255, 255, 0.2);
      doc.line(0.5, 7, 9.5, 7);

      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255, 0.7);
      doc.text(`Slide ${i + 1} of ${slides.length}`, 0.5, 7.25);
      doc.text(`${Math.floor(slide.timeEstimate / 60)}m ${slide.timeEstimate % 60}s`, 9.5, 7.25, { align: 'right' });
    }

    doc.deletePage(1); // Delete the initial blank page

    doc.save('defense-presentation.pdf');
    setIsGenerating(false);
  };

  return (
    <Button onClick={generatePdf} disabled={isGenerating}>
      {isGenerating ? 'Generating PDF...' : 'Download PDF'}
    </Button>
  );
}
