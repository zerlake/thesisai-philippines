'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Download, Copy, Loader2 } from 'lucide-react';
import { SAMPLE_SLIDES } from '@/lib/validity-defender-sample-data';

interface SlideIntegratorProps {
  thesisId: string;
  instrumentIds: string[];
}

interface SlidePreview {
  slideNumber: number;
  title: string;
  content: string;
  notes: string;
}

export default function SlideIntegrator({ thesisId, instrumentIds }: SlideIntegratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [slides, setSlides] = useState<SlidePreview[]>([]);
  const [exportFormat, setExportFormat] = useState<'pptx' | 'html'>('pptx');

  useEffect(() => {
    const handleLoadSampleData = () => {
      // Load sample slides when sample data is loaded
      if (instrumentIds.length > 0) {
        setSlides(SAMPLE_SLIDES);
      }
    };

    window.addEventListener('loadSampleData', handleLoadSampleData);
    return () => window.removeEventListener('loadSampleData', handleLoadSampleData);
  }, [instrumentIds]);

  const generateSlides = async () => {
    if (instrumentIds.length === 0) {
      alert('Please validate at least one instrument first');
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate slide generation
      const generatedSlides: SlidePreview[] = [
        {
          slideNumber: 1,
          title: 'Research Instrument Validity',
          content: 'Comprehensive Overview of Validation Evidence',
          notes: 'Opening slide for Chapter 3 (Methodology) presentation',
        },
        {
          slideNumber: 2,
          title: 'Instrument Description',
          content: `Type: Survey/Questionnaire\nItems: [Number]\nSample: [Size]\nAdapted from: [Source]\nAdapted for Philippine Context`,
          notes: 'Provide specific details about your instrument',
        },
        {
          slideNumber: 3,
          title: 'Content Validity Evidence',
          content: `• Expert Panel Review (n = 3)\n• Content Validity Index = 0.92\n• Pilot Test Results (n = 40)\n• Item Clarity Verification`,
          notes: 'Present CVI values and expert review process',
        },
        {
          slideNumber: 4,
          title: 'Construct Validity Evidence',
          content: `• Factor Analysis Results\n• Convergent Validity (r = 0.73)\n• Discriminant Validity (r < 0.50)\n• Theoretical Alignment`,
          notes: 'Show factor loadings and correlation tables',
        },
        {
          slideNumber: 5,
          title: 'Reliability Assessment',
          content: `• Cronbach's Alpha = 0.87\n• Test-Retest ICC = 0.81\n• Interpretation: Strong Internal Consistency\n• Temporal Stability: Good`,
          notes: 'Highlight reliability coefficients and their meaning',
        },
        {
          slideNumber: 6,
          title: 'Validity Summary',
          content: `Content Validity: ✓ Confirmed\nConstruct Validity: ✓ Confirmed\nReliability: ✓ Confirmed\nAppropriateness: ✓ Confirmed`,
          notes: 'Conclude with comprehensive validity evidence',
        },
      ];

      setSlides(generatedSlides);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to generate slides');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadSlides = async () => {
    if (slides.length === 0) return;

    // In production, this would generate actual PPTX/HTML files
    alert(`Downloading slides as ${exportFormat.toUpperCase()}...`);

    // For now, log the slides for export
    console.log('Slides to export:', slides);
  };

  const copySlideContent = (content: string) => {
    navigator.clipboard.writeText(content);
    alert('Slide content copied to clipboard!');
  };

  if (slides.length === 0) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Generate PPT Slides</CardTitle>
            <CardDescription>
              Create presentation-ready slides from your instrument validity analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Ready to generate 6 slides covering: instrument description, content validity, construct validity,
                reliability, and comprehensive summary.
              </AlertDescription>
            </Alert>

            <Button onClick={generateSlides} disabled={isGenerating || instrumentIds.length === 0} className="w-full" size="lg" variant="default">
              {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isGenerating ? 'Generating...' : 'Generate Slides'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Export Options */}
      <Card className="bg-blue-50 border-blue-200 rounded-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-blue-900">Export Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Button
              variant={exportFormat === 'pptx' ? 'default' : 'outline'}
              onClick={() => setExportFormat('pptx')}
              size="sm"
            >
              PowerPoint (.pptx)
            </Button>
            <Button
              variant={exportFormat === 'html' ? 'default' : 'outline'}
              onClick={() => setExportFormat('html')}
              size="sm"
            >
              HTML (Print)
            </Button>
          </div>
          <Button onClick={downloadSlides} className="w-full" size="lg">
            <Download className="mr-2 h-4 w-4" />
            Download Slides
          </Button>
        </CardContent>
      </Card>

      {/* Slide Preview */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Preview ({slides.length} slides)</h2>

        {slides.map((slide) => (
          <Card key={slide.slideNumber} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Badge className="mb-2">Slide {slide.slideNumber}</Badge>
                  <CardTitle className="text-base">{slide.title}</CardTitle>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copySlideContent(slide.content)}
                  title="Copy content"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Main Content */}
              <div className="rounded-lg bg-muted p-4 text-foreground font-mono text-sm border border-border">
                <pre className="whitespace-pre-wrap break-words">{slide.content}</pre>
              </div>

              {/* Speaker Notes */}
              <div className="border-t border-border pt-4">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Speaker Notes</p>
                <p className="text-sm text-muted-foreground">{slide.notes}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tips */}
      <Alert className="border-purple-200 bg-purple-50 rounded-lg">
        <AlertDescription className="text-sm text-purple-900">
          <strong className="font-semibold">Tip:</strong> These slides are designed for your Chapter 3 (Methodology) presentation. Customize the
          content with your specific data, citations, and thesis details before presenting.
        </AlertDescription>
      </Alert>
    </div>
  );
}
