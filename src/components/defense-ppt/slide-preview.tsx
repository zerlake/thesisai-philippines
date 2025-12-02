'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Slide {
  id: string;
  title: string;
  bullets: string[];
  notes: string;
  timeEstimate: number;
  order: number;
}

interface SlidePreviewProps {
  slide: Slide;
  allSlides: Slide[];
}

export function SlidePreview({ slide, allSlides }: SlidePreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(slide.order);
  const [isExporting, setIsExporting] = useState(false);
  const slideContainerRef = useRef<HTMLDivElement>(null);
  const currentSlide = allSlides[currentIndex];

  const goToPrevious = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const goToNext = () => {
    if (currentIndex < allSlides.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.default;

      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Add all slides to PDF
      for (let i = 0; i < allSlides.length; i++) {
        if (i > 0) pdf.addPage();

        const s = allSlides[i];

        // Dark background
        pdf.setFillColor(30, 41, 59);
        pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');

        // Title
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(44);
        pdf.setTextColor(255, 255, 255);
        const titleLines = pdf.splitTextToSize(s.title, pdfWidth - 20);
        pdf.text(titleLines, 10, 20);

        // Bullets
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(20);
        let yPos = titleLines.length * 12 + 30;

        for (const bullet of s.bullets) {
          const lines = pdf.splitTextToSize(`• ${bullet}`, pdfWidth - 20);
          pdf.text(lines, 10, yPos);
          yPos += lines.length * 8 + 4;
        }

        // Footer
        pdf.setFontSize(10);
        pdf.setTextColor(200, 200, 200);
        const footerY = pdfHeight - 10;
        pdf.text(`Slide ${s.order + 1} of ${allSlides.length}`, 10, footerY);
        pdf.text(`${Math.floor(s.timeEstimate / 60)}m ${s.timeEstimate % 60}s`, pdfWidth - 30, footerY);
      }

      pdf.save('defense-presentation.pdf');
      toast.success('Presentation exported as PDF!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to export PDF';
      toast.error(message);
      console.error('PDF export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPptx = async () => {
    setIsExporting(true);
    try {
      const PptxGenJS = (await import('pptxgenjs')).default;
      const prs = new PptxGenJS();

      for (const s of allSlides) {
        const slide = prs.addSlide();

        // Dark background
        slide.background = { color: '1e293b' };

        // Title
        slide.addText(s.title, {
          x: 0.5,
          y: 0.4,
          w: 9,
          h: 1,
          fontSize: 48,
          bold: true,
          color: 'FFFFFF',
          align: 'left',
          fontFace: 'Calibri',
          margin: [0, 0, 0, 0]
        });

        // Bullets - create formatted text with proper line breaks
        const bulletTexts = s.bullets.map(bullet => ({
          text: bullet,
          options: {
            fontSize: 22,
            color: 'FFFFFF',
            fontFace: 'Calibri',
            margin: [0, 0, 6, 0]
          }
        }));

        // Add all bullets in a single text box for better editability
        const bulletContent = bulletTexts.map(bt => bt.text).join('\n');
        
        slide.addText(bulletContent, {
          x: 0.7,
          y: 1.6,
          w: 8.6,
          h: 4.5,
          fontSize: 22,
          color: 'FFFFFF',
          align: 'left',
          fontFace: 'Calibri',
          valign: 'top',
          margin: [0, 0, 0, 0],
          lineSpacing: 32
        });

        // Footer with slide info and separator line
        slide.addShape(prs.ShapeType.line, {
          x: 0.5,
          y: 6.4,
          w: 9,
          h: 0,
          line: { color: 'FFFFFF', width: 0.5, transparency: 50 }
        });

        slide.addText(`Slide ${s.order + 1} of ${allSlides.length}`, {
          x: 0.5,
          y: 6.55,
          w: 5,
          h: 0.35,
          fontSize: 11,
          color: 'CCCCCC',
          align: 'left',
          fontFace: 'Calibri',
          margin: [0, 0, 0, 0]
        });

        slide.addText(`${Math.floor(s.timeEstimate / 60)}m ${s.timeEstimate % 60}s`, {
          x: 5,
          y: 6.55,
          w: 4.5,
          h: 0.35,
          fontSize: 11,
          color: 'CCCCCC',
          align: 'right',
          fontFace: 'Calibri',
          margin: [0, 0, 0, 0]
        });
      }

      prs.writeFile({ fileName: 'defense-presentation.pptx' });
      toast.success('Presentation exported as PPTX!');
    } catch (err) {
      toast.error('Failed to export PPTX');
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Slide Preview */}
      <Card className="border-2">
        <CardContent className="pt-8">
          <div 
            ref={slideContainerRef}
            data-slide-index={currentIndex}
            className="aspect-video bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-12 flex flex-col justify-between text-white"
          >
            {/* Title Area */}
            <div>
              <h1 className="text-5xl font-bold mb-8">{currentSlide.title}</h1>
              <div className="space-y-4">
                {currentSlide.bullets.map((bullet, index) => (
                  <p key={index} className="text-2xl leading-relaxed">
                    {bullet}
                  </p>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-end pt-8 border-t border-white/20">
              <div className="text-sm">
                Slide {currentSlide.order + 1} of {allSlides.length}
              </div>
              <div className="text-sm">
                {Math.floor(currentSlide.timeEstimate / 60)}m {currentSlide.timeEstimate % 60}s
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex gap-4 justify-center">
        <Button
          variant="outline"
          onClick={goToPrevious}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="text-center py-2">
          <div className="text-sm font-semibold">
            Slide {currentIndex + 1} of {allSlides.length}
          </div>
        </div>

        <Button
          variant="outline"
          onClick={goToNext}
          disabled={currentIndex === allSlides.length - 1}
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Presenter Notes */}
      {currentSlide.notes && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">Presenter Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base leading-relaxed text-blue-900 whitespace-pre-wrap">
              {currentSlide.notes}
            </p>
            <p className="text-xs text-blue-700 mt-4">
              ~{Math.ceil((currentSlide.notes.split(/\s+/).length / 120) * 60)} seconds at normal speaking pace
            </p>
          </CardContent>
        </Card>
      )}

      {/* Slide Thumbnails */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Slides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {allSlides.map((s, index) => (
              <button
                key={s.id}
                onClick={() => setCurrentIndex(index)}
                className={`p-3 rounded-lg border-2 transition-all text-left ${
                  index === currentIndex
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary'
                }`}
              >
                <div className="text-xs font-semibold truncate">{s.order + 1}</div>
                <div className="text-xs text-muted-foreground truncate">{s.title}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {Math.floor(s.timeEstimate / 60)}m {s.timeEstimate % 60}s
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Export</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleExportPdf}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export as PDF
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={handleExportPptx}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export as PPTX
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
