import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Bot, 
  FileText, 
  Target,
  BookOpen,
  CheckCircle,
  RotateCcw,
  Copy,
  Download
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import PDFUploadUI from './pdf-upload-ui';
import PDFLibrary from './pdf-library';

interface PDFToContentGeneratorProps {
  userId: string;
}

const PDFToContentGenerator: React.FC<PDFToContentGeneratorProps> = ({ userId }) => {
  // Mock data for demonstration
  const [collections, setCollections] = useState([
    { id: '1', name: 'Literature Review', description: 'Papers for lit review', paperCount: 5, lastUpdated: '2024-01-15' },
    { id: '2', name: 'Methodology Sources', description: 'Papers with methodology details', paperCount: 3, lastUpdated: '2024-01-10' },
    { id: '3', name: 'Recent Publications', description: 'Papers from the last year', paperCount: 7, lastUpdated: '2024-01-20' }
  ]);
  
  const [papers, setPapers] = useState([
    { id: '1', title: 'Machine Learning in Education: A Comprehensive Review', authors: ['Smith, J.', 'Johnson, A.'], year: 2023, abstract: 'This paper provides a comprehensive review of machine learning applications in educational settings...', collections: ['1'], fileSize: 2456789 },
    { id: '2', title: 'AI-Assisted Learning Environments: Current State and Future Directions', authors: ['Williams, R.', 'Brown, T.'], year: 2024, abstract: 'This paper explores the current state of AI-assisted learning environments...', collections: ['1', '3'], fileSize: 1876543 },
    { id: '3', title: 'Ethical Considerations in Educational AI Systems', authors: ['Davis, P.', 'Miller, K.'], year: 2023, abstract: 'This paper discusses ethical considerations and challenges in implementing AI systems in education...', collections: ['2'], fileSize: 1234567 }
  ]);
  
  const [selectedPapers, setSelectedPapers] = useState<string[]>(['1', '2']);
  const [selectedCollection, setSelectedCollection] = useState<string | null>('1');
  const [contentType, setContentType] = useState<'literature_review' | 'summary' | 'synthesis' | 'introduction' | 'methodology'>('literature_review');
  const [contentLength, setContentLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [generationPrompt, setGenerationPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handlePDFUpload = (files: File[]) => {
    setUploadingFiles(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadingFiles(false);
          toast.success(`${files.length} PDF(s) uploaded successfully!`);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
    
    // In a real implementation, you would upload files to storage
    console.log('Uploading files:', files);
  };

  const handleCollectionCreate = (name: string, description?: string) => {
    const newCollection = {
      id: (collections.length + 1).toString(),
      name,
      description: description || '',
      paperCount: 0,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setCollections([...collections, newCollection]);
  };

  const handleCollectionSelect = (collectionId: string) => {
    setSelectedCollection(collectionId);
    // In a real implementation, we would filter papers based on collection
    console.log('Selected collection:', collectionId);
  };

  const handlePaperSelect = (paperId: string) => {
    setSelectedPapers(prev => 
      prev.includes(paperId) 
        ? prev.filter(id => id !== paperId) 
        : [...prev, paperId]
    );
  };

  const handleRemovePaper = (paperId: string) => {
    setPapers(prev => prev.filter(paper => paper.id !== paperId));
    setSelectedPapers(prev => prev.filter(id => id !== paperId));
    toast.success('Paper removed from library');
  };

  const handleAddToCollection = (paperId: string, collectionId: string) => {
    setPapers(prev => 
      prev.map(paper => 
        paper.id === paperId 
          ? { ...paper, collections: [...new Set([...paper.collections, collectionId])] } 
          : paper
      )
    );
    
    // Update collection paper count
    setCollections(prev => 
      prev.map(collection => 
        collection.id === collectionId 
          ? { ...collection, paperCount: collection.paperCount + 1 } 
          : collection
      )
    );
  };

  const handleGenerateContent = async () => {
    setIsGenerating(true);
    
    // Simulate generation process
    setTimeout(() => {
      const selectedPapersDetails = papers.filter(p => selectedPapers.includes(p.id));
      const papersList = selectedPapersDetails.map(p => p.title).join(', ');
      
      let content = '';
      switch(contentType) {
        case 'literature_review':
          content = `Based on the papers: ${papersList}\n\nThis literature review synthesizes key findings from recent research on this topic. The analysis reveals several important themes:\n\n1. The primary theme is...\n2. Secondary theme involves...\n3. Emerging trends indicate...\n\nThese findings suggest important implications for future research.`;
          break;
        case 'summary':
          content = `This summary synthesizes the key findings from: ${papersList}\n\nMain findings include X, Y, and Z. The research indicates important implications for the field, with particular attention to methodology and ethical considerations.`;
          break;
        case 'synthesis':
          content = `Synthesis of: ${papersList}\n\nThe research papers collectively indicate significant trends in this area. The synthesis reveals common themes around methodology, findings, and implications, with some variations in approach. These findings contribute to a deeper understanding of the research area.`;
          break;
        case 'introduction':
          content = `Introduction based on: ${papersList}\n\nThis research addresses an important gap in the literature regarding the intersection of X and Y. Building on previous work by ${selectedPapersDetails[0]?.authors?.[0] || 'authors'}, this study examines...\n\nThe remainder of this paper is organized as follows: literature review, methodology, results, discussion, and conclusion.`;
          break;
        case 'methodology':
          content = `Methodology overview based on: ${papersList}\n\nThis study employs a mixed-methods approach, incorporating elements from the methodologies described in these papers. The research design includes:\n\n- Data collection procedures adapted from ${selectedPapersDetails[0]?.authors?.[0] || 'previous studies'}\n- Analysis techniques from...\n- Validation approaches based on...\n\nThis methodology addresses the research questions effectively while ensuring reliability and validity.`;
          break;
        default:
          content = `Generated content based on: ${papersList}`;
      }
      
      setGeneratedContent(content);
      setIsGenerating(false);
      toast.success('Content generated successfully!');
    }, 2000);
  };

  const handleRegenerate = () => {
    setGeneratedContent('');
    handleGenerateContent();
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    toast.success('Content copied to clipboard!');
  };

  const handleInsertToEditor = () => {
    // This would integrate with the main editor
    toast.success('Content sent to editor!');
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">PDF-to-Content Generation</h1>
        <p className="text-muted-foreground">
          Transform your research papers into new content with AI assistance
        </p>
      </div>

      {/* Upload and Collection Management */}
      <PDFUploadUI
        onPDFUpload={handlePDFUpload}
        onCollectionCreate={handleCollectionCreate}
        onCollectionSelect={handleCollectionSelect}
        collections={collections}
        selectedCollection={selectedCollection}
        uploadingFiles={uploadingFiles}
        uploadProgress={uploadProgress}
      />

      {/* Library */}
      <PDFLibrary
        papers={papers}
        onPaperSelect={handlePaperSelect}
        selectedPapers={selectedPapers}
        onRemovePaper={handleRemovePaper}
        onAddToCollection={handleAddToCollection}
        collections={collections}
      />

      {/* Generation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Generate Content from Papers
          </CardTitle>
          <CardDescription>
            Select papers and configure generation parameters to create new content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {/* Content Type Selection */}
            <div className="grid gap-3">
              <Label>Content Type</Label>
              <RadioGroup 
                value={contentType} 
                onValueChange={(value: any) => setContentType(value)}
                className="grid grid-cols-2 md:grid-cols-5 gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="literature_review" id="literature_review" />
                  <Label htmlFor="literature_review" className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" /> Lit. Review
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="summary" id="summary" />
                  <Label htmlFor="summary" className="flex items-center gap-1">
                    <FileText className="h-4 w-4" /> Summary
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="synthesis" id="synthesis" />
                  <Label htmlFor="synthesis" className="flex items-center gap-1">
                    <Target className="h-4 w-4" /> Synthesis
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="introduction" id="introduction" />
                  <Label htmlFor="introduction" className="flex items-center gap-1">
                    <FileText className="h-4 w-4" /> Introduction
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="methodology" id="methodology" />
                  <Label htmlFor="methodology" className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" /> Methodology
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Length Selection */}
            <div className="grid gap-3">
              <Label>Content Length</Label>
              <div className="flex gap-4">
                {(['short', 'medium', 'long'] as const).map((length) => (
                  <div key={length} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={length}
                      checked={contentLength === length}
                      onChange={() => setContentLength(length)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor={length} className="capitalize">
                      {length}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Prompt */}
            <div className="grid gap-3">
              <Label htmlFor="prompt">Custom Prompt (Optional)</Label>
              <Textarea
                id="prompt"
                value={generationPrompt}
                onChange={(e) => setGenerationPrompt(e.target.value)}
                placeholder="Enter specific instructions for content generation..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Provide any specific instructions for how the content should be generated
              </p>
            </div>

            {/* Generate Button */}
            <div className="flex justify-end">
              <Button 
                onClick={handleGenerateContent} 
                disabled={selectedPapers.length === 0 || isGenerating}
                className="gap-2"
              >
                {isGenerating ? (
                  <>
                    <RotateCcw className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Bot className="h-4 w-4" />
                    Generate Content
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generated Content */}
      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Generated Content
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleRegenerate} className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Regenerate
                </Button>
                <Button variant="outline" size="sm" onClick={handleCopyToClipboard} className="gap-2">
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
                <Button size="sm" onClick={handleInsertToEditor} className="gap-2">
                  <Download className="h-4 w-4" />
                  Insert to Editor
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              Content generated from {selectedPapers.length} selected papers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50 max-h-[400px] overflow-y-auto">
              <pre className="whitespace-pre-wrap font-sans">
                {generatedContent}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PDFToContentGenerator;