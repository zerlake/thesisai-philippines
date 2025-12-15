import React, { useState, useEffect } from 'react';
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
  Download,
  Quote,
  User,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import PDFUploadUI from './pdf-upload-ui';
import PDFLibrary from './pdf-library';
import { processMultiplePDFs, ExtractedPDFContent } from '@/lib/pdf-parser';
import { 
  generateContentFromPDFs, 
  ContentGenerationParams, 
  GeneratedContentResult,
  Citation
} from '@/lib/pdf-content-generation-service';
import { toast } from 'sonner';

interface PDFToContentGeneratorWithCitationsProps {
  userId: string;
}

const PDFToContentGeneratorWithCitations: React.FC<PDFToContentGeneratorWithCitationsProps> = ({ userId }) => {
  // State for collections (will be fetched from backend in real implementation)
  const [collections, setCollections] = useState([
    { id: '1', name: 'Literature Review', description: 'Papers for lit review', paperCount: 0, lastUpdated: new Date().toISOString() },
    { id: '2', name: 'Methodology Sources', description: 'Papers with methodology details', paperCount: 0, lastUpdated: new Date().toISOString() },
    { id: '3', name: 'Recent Publications', description: 'Papers from the last year', paperCount: 0, lastUpdated: new Date().toISOString() }
  ]);
  
  // State for papers
  const [papers, setPapers] = useState<ExtractedPDFContent[]>([]);
  const [allPapers, setAllPapers] = useState<any[]>([]);
  
  // Selection states
  const [selectedPapers, setSelectedPapers] = useState<string[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  
  // Generation parameters
  const [contentType, setContentType] = useState<ContentGenerationParams['contentType']>('literature_review');
  const [contentLength, setContentLength] = useState<ContentGenerationParams['length']>('medium');
  const [citationStyle, setCitationStyle] = useState<'apa' | 'mla' | 'chicago' | 'ieee'>('apa');
  const [generationPrompt, setGenerationPrompt] = useState('');
  
  // Generation results
  const [generatedContent, setGeneratedContent] = useState<GeneratedContentResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // UI states
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Handle PDF upload with processing
  const handlePDFUpload = async (files: File[]) => {
    setUploadingFiles(true);
    setUploadProgress(0);
    
    try {
      // Process the PDFs to extract content
      const extractedPapers = await processMultiplePDFs(files);
      
      // Update papers state
      const newPapers = extractedPapers.map((extracted, index) => ({
        id: `paper-${Date.now()}-${index}`,
        ...extracted,
        fileName: files[index].name,
        fileSize: files[index].size,
        uploadDate: new Date().toISOString(),
        collections: selectedCollection ? [selectedCollection] : []
      }));
      
      setPapers(prev => [...prev, ...newPapers]);
      
      // Update all papers for the library component
      const newAllPapers = newPapers.map(paper => ({
        id: paper.id,
        title: paper.metadata.title || paper.fileName,
        authors: [paper.metadata.author || 'Unknown Author'],
        year: paper.metadata.creationDate ? new Date(paper.metadata.creationDate).getFullYear() : new Date().getFullYear(),
        abstract: paper.summary,
        collections: paper.collections || [],
        fileSize: paper.fileSize,
        content: paper.textContent.substring(0, 200) + '...'
      }));
      
      setAllPapers(prev => [...prev, ...newAllPapers]);
      
      toast.success(`${files.length} PDF(s) uploaded and processed successfully!`);
    } catch (error) {
      console.error('Error processing PDFs:', error);
      toast.error('Failed to process PDFs. Please try again.');
    } finally {
      setUploadingFiles(false);
      setUploadProgress(0);
    }
  };

  const handleCollectionCreate = (name: string, description?: string) => {
    const newCollection = {
      id: `col-${Date.now()}`,
      name,
      description: description || '',
      paperCount: 0,
      lastUpdated: new Date().toISOString()
    };
    setCollections([...collections, newCollection]);
    toast.success('Collection created successfully');
  };

  const handleCollectionSelect = (collectionId: string) => {
    setSelectedCollection(collectionId);
  };

  const handlePaperSelect = (paperId: string) => {
    setSelectedPapers(prev => 
      prev.includes(paperId) 
        ? prev.filter(id => id !== paperId) 
        : [...prev, paperId]
    );
  };

  const handleRemovePaper = (paperId: string) => {
    setPapers(prev => prev.filter(paper => (paper as any).id !== paperId));
    setAllPapers(prev => prev.filter(p => p.id !== paperId));
    setSelectedPapers(prev => prev.filter(id => id !== paperId));
    toast.success('Paper removed from library');
  };

  const handleAddToCollection = (paperId: string, collectionId: string) => {
    setPapers(prev => 
      prev.map(paper => {
        const paperAny = paper as any;
        return paperAny.id === paperId 
          ? { ...paper, collections: [...new Set([...(paperAny.collections || []), collectionId])] } 
          : paper;
      })
    );
    
    setAllPapers(prev => 
      prev.map(p => 
        p.id === paperId 
          ? { ...p, collections: [...new Set([...p.collections, collectionId])] } 
          : p
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
    if (selectedPapers.length === 0) {
      toast.error('Please select at least one paper to generate content from');
      return;
    }

    setIsGenerating(true);

    try {
      // Get the selected paper objects
      const selectedPaperObjects = papers.filter(paper => selectedPapers.includes((paper as any).id));
      
      if (selectedPaperObjects.length === 0) {
        toast.error('No papers found for selected IDs');
        setIsGenerating(false);
        return;
      }

      // Prepare generation parameters
      const params: ContentGenerationParams = {
        contentType,
        length: contentLength,
        customPrompt: generationPrompt,
        citationStyle
      };

      // Generate content using the service
      const result = await generateContentFromPDFs(selectedPaperObjects, params);
      
      setGeneratedContent(result);
      toast.success('Content generated successfully!');
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = () => {
    if (selectedPapers.length === 0) {
      toast.error('Please select at least one paper to regenerate content from');
      return;
    }
    setGeneratedContent(null);
    handleGenerateContent();
  };

  const handleCopyToClipboard = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent.content);
      toast.success('Content copied to clipboard!');
    }
  };

  const handleInsertToEditor = () => {
    // This would integrate with the main editor
    toast.success('Content sent to editor!');
  };

  // Format citation with proper styling based on citation style
  const formatCitation = (citation: Citation): React.ReactElement => {
    let formattedCitation = citation.citationText;

    switch (citationStyle) {
      case 'apa':
        formattedCitation = `${citation.authors.join(', ')}. (${citation.year}). ${citation.title}.`;
        break;
      case 'mla':
        formattedCitation = `${citation.authors.join(', ')}. "${citation.title}." ${citation.year}.`;
        break;
      case 'chicago':
        formattedCitation = `${citation.authors.join(', ')}. "${citation.title}." ${citation.year}.`;
        break;
      case 'ieee':
        formattedCitation = `${citation.authors.join(', ')}, "${citation.title}," ${citation.year}.`;
        break;
      default:
        formattedCitation = citation.citationText;
    }

    return (
      <div className="text-sm p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-2">
          <Quote className="h-4 w-4 mt-0.5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium">{citation.title}</p>
            <p className="text-gray-600 dark:text-gray-300">{formattedCitation}</p>
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
              <User className="h-3 w-3" />
              {citation.authors.join(', ')}
              <Separator orientation="vertical" className="h-3" />
              <Calendar className="h-3 w-3" />
              {citation.year}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">PDF-to-Content Generation</h1>
        <p className="text-muted-foreground">
          Transform your research papers into new content with AI assistance and proper citations
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
        papers={allPapers}
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
            Select papers and configure generation parameters to create new content with proper citations
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
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
              >
                {([
                  { value: 'literature_review', label: 'Lit. Review', icon: BookOpen },
                  { value: 'summary', label: 'Summary', icon: FileText },
                  { value: 'synthesis', label: 'Synthesis', icon: Target },
                  { value: 'introduction', label: 'Introduction', icon: FileText },
                  { value: 'methodology', label: 'Methodology', icon: BookOpen },
                  { value: 'conclusion', label: 'Conclusion', icon: CheckCircle }
                ]).map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <Label htmlFor={option.value} className="flex items-center gap-1">
                      <option.icon className="h-4 w-4" /> {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              {/* Citation Style */}
              <div className="grid gap-3">
                <Label>Citation Style</Label>
                <Select value={citationStyle} onValueChange={(value: any) => setCitationStyle(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select citation style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apa">APA</SelectItem>
                    <SelectItem value="mla">MLA</SelectItem>
                    <SelectItem value="chicago">Chicago</SelectItem>
                    <SelectItem value="ieee">IEEE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Custom Prompt */}
            <div className="grid gap-3">
              <Label htmlFor="prompt">Custom Instructions (Optional)</Label>
              <Textarea
                id="prompt"
                value={generationPrompt}
                onChange={(e) => setGenerationPrompt(e.target.value)}
                placeholder="Enter specific instructions for content generation (e.g., focus on methodology, emphasize certain authors, etc.)"
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Provide specific instructions to guide the content generation
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
              Content generated from {selectedPapers.length} selected papers with {generatedContent.citations.length} citations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Generated content */}
              <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50 max-h-[400px] overflow-y-auto">
                <pre className="whitespace-pre-wrap font-sans">
                  {generatedContent.content}
                </pre>
              </div>

              {/* Citations */}
              {generatedContent.citations.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Quote className="h-5 w-5" />
                    <h3 className="font-medium">References</h3>
                    <Badge variant="secondary">{generatedContent.citations.length} citations</Badge>
                  </div>
                  
                  <div className="grid gap-3">
                    {generatedContent.citations.map((citation, index) => (
                      <div key={citation.id || index}>
                        {formatCitation(citation)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Generation details */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span>Quality Score: <Badge variant="secondary">{generatedContent.qualityScore}/100</Badge></span>
                  <span>Style: <Badge variant="secondary">{citationStyle.toUpperCase()}</Badge></span>
                </div>
                <span>Generated: {new Date().toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Papers Summary */}
      {selectedPapers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Selected Papers ({selectedPapers.length})
            </CardTitle>
            <CardDescription>
              Papers that will be used for content generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {papers
                .filter(paper => selectedPapers.includes((paper as any).id))
                .map((paper) => (
                  <div key={(paper as any).id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{paper.metadata.title || 'Untitled Paper'}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {paper.metadata.author || 'Unknown Author'} • {(paper as any).fileSize ? (((paper as any).fileSize / 1024 / 1024).toFixed(2) + ' MB') : 'N/A'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {paper.metadata.creationDate ? new Date(paper.metadata.creationDate).getFullYear() : 'N/A'}
                      </Badge>
                      {(paper as any).collections && (paper as any).collections.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {collections.find(c => c.id === (paper as any).collections![0])?.name || 'Collection'}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              }
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PDFToContentGeneratorWithCitations;