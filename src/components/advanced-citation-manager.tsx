import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Copy, 
  Trash2, 
  Download, 
  Upload, 
  BookOpen, 
  FileText, 
  Search, 
  Plus, 
  Edit3, 
  Check, 
  X,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Info,
  BookType,
  Database,
  ScanFace,
  Wand2,
  FilePlus2,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';
import { callPuterAI } from '@/lib/puter-ai-wrapper';

// Types for citation management
type CitationStyle = 'APA 7th' | 'MLA 9th' | 'Chicago 17th' | 'IEEE' | 'Harvard' | 'Vancouver';
type SourceType = 'journalArticle' | 'book' | 'bookSection' | 'thesis' | 'website' | 'report' | 'conferencePaper';

interface Citation {
  id: string;
  title: string;
  authors: string[];
  year: number;
  source: string; // Journal/publisher name
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  isbn?: string;
  url?: string;
  abstract?: string;
  sourceType: SourceType;
  style: CitationStyle;
  content: string; // The formatted citation
  tags: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface CitationFormData {
  title: string;
  authors: string;
  year: string;
  source: string;
  volume: string;
  issue: string;
  pages: string;
  doi: string;
  isbn: string;
  url: string;
  abstract: string;
  sourceType: SourceType;
  style: CitationStyle;
  tags: string;
  notes: string;
}

const AdvancedCitationManager = () => {
  const [citations, setCitations] = useState<Citation[]>([]);
  const [activeStyle, setActiveStyle] = useState<CitationStyle>('APA 7th');
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null); // ID of citation being edited
  const [editForm, setEditForm] = useState<CitationFormData>({
    title: '',
    authors: '',
    year: new Date().getFullYear().toString(),
    source: '',
    volume: '',
    issue: '',
    pages: '',
    doi: '',
    isbn: '',
    url: '',
    abstract: '',
    sourceType: 'journalArticle',
    style: 'APA 7th',
    tags: '',
    notes: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<SourceType | 'all'>('all');
  const [filterStyle, setFilterStyle] = useState<CitationStyle | 'all'>('all');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [generatingCitation, setGeneratingCitation] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load citations from Supabase when component mounts
  useEffect(() => {
    loadCitations();
  }, []);

  // Load citations from Supabase
  const loadCitations = async () => {
    // In a real implementation, this would fetch from Supabase
    // For now, we'll use mock data
    const mockCitations: Citation[] = [
      {
        id: '1',
        title: 'The Impact of Social Media on Academic Performance',
        authors: ['Dela Cruz, J.', 'Sanchez, M.A.'],
        year: 2023,
        source: 'Philippine Journal of Education',
        volume: '45',
        issue: '2',
        pages: '123-145',
        doi: '10.1234/pje.2023.45.2.123',
        sourceType: 'journalArticle',
        style: 'APA 7th',
        content: 'Dela Cruz, J., & Sanchez, M.A. (2023). The Impact of Social Media on Academic Performance. Philippine Journal of Education, 45(2), 123-145. https://doi.org/10.1234/pje.2023.45.2.123',
        tags: ['social-media', 'academic-performance'],
        notes: 'Key study showing correlation between usage and performance',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        title: 'Machine Learning Applications in Education',
        authors: ['Reyes, A.B.'],
        year: 2022,
        source: 'Springer Publishing',
        isbn: '978-0-123456-78-9',
        sourceType: 'book',
        style: 'APA 7th',
        content: 'Reyes, A.B. (2022). Machine Learning Applications in Education. Springer Publishing. ISBN: 978-0-123456-78-9',
        tags: ['machine-learning', 'education'],
        notes: 'Comprehensive overview of ML in educational contexts',
        createdAt: '2024-01-10T09:15:00Z',
        updatedAt: '2024-01-10T09:15:00Z'
      }
    ];
    setCitations(mockCitations);
  };

  // Handle form input changes
  const handleInputChange = (field: keyof CitationFormData, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add a new citation
  const addCitation = async () => {
    if (!editForm.title.trim()) {
      toast.error('Please enter a title for the citation');
      return;
    }

    try {
      // Format authors array from comma-separated string
      const authors = editForm.authors
        .split(',')
        .map(author => author.trim())
        .filter(author => author);

      // Generate the citation content using the selected style
      const newCitationContent = generateCitationContent({
        ...editForm,
        authors
      });

      const newCitation: Citation = {
        id: `cit-${Date.now()}`,
        title: editForm.title,
        authors,
        year: parseInt(editForm.year) || new Date().getFullYear(),
        source: editForm.source,
        volume: editForm.volume || undefined,
        issue: editForm.issue || undefined,
        pages: editForm.pages || undefined,
        doi: editForm.doi || undefined,
        isbn: editForm.isbn || undefined,
        url: editForm.url || undefined,
        abstract: editForm.abstract || undefined,
        sourceType: editForm.sourceType,
        style: editForm.style,
        content: newCitationContent,
        tags: editForm.tags
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag),
        notes: editForm.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setCitations(prev => [newCitation, ...prev]);
      resetForm();
      toast.success('Citation added successfully!');
    } catch (error) {
      console.error('Error adding citation:', error);
      toast.error('Failed to add citation. Please try again.');
    }
  };

  // Update an existing citation
  const updateCitation = async () => {
    if (!isEditing || !editForm.title.trim()) {
      toast.error('Please enter a title for the citation');
      return;
    }

    try {
      // Format authors array from comma-separated string
      const authors = editForm.authors
        .split(',')
        .map(author => author.trim())
        .filter(author => author);

      // Generate the citation content using the selected style
      const updatedCitationContent = generateCitationContent({
        ...editForm,
        authors
      });

      const updatedCitations = citations.map(citation => 
        citation.id === isEditing
          ? {
              ...citation,
              title: editForm.title,
              authors,
              year: parseInt(editForm.year) || new Date().getFullYear(),
              source: editForm.source,
              volume: editForm.volume || undefined,
              issue: editForm.issue || undefined,
              pages: editForm.pages || undefined,
              doi: editForm.doi || undefined,
              isbn: editForm.isbn || undefined,
              url: editForm.url || undefined,
              abstract: editForm.abstract || undefined,
              sourceType: editForm.sourceType,
              style: editForm.style,
              content: updatedCitationContent,
              tags: editForm.tags
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag),
              notes: editForm.notes,
              updatedAt: new Date().toISOString()
            }
          : citation
      );

      setCitations(updatedCitations);
      resetForm();
      setIsEditing(null);
      toast.success('Citation updated successfully!');
    } catch (error) {
      console.error('Error updating citation:', error);
      toast.error('Failed to update citation. Please try again.');
    }
  };

  // Delete a citation
  const deleteCitation = async (id: string) => {
    setCitations(prev => prev.filter(citation => citation.id !== id));
    toast.success('Citation deleted');
  };

  // Copy citation to clipboard
  const copyCitation = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Citation copied to clipboard!');
  };

  // Generate citation content based on form data and style
  const generateCitationContent = (formData: Omit<CitationFormData, 'authors'> & { authors: string[] }): string => {
    const { 
      title, authors, year, source, volume, issue, pages, doi, isbn, url, sourceType, style 
    } = formData;

    // Format authors based on style
    let authorsFormatted = '';
    if (authors.length === 1) {
      authorsFormatted = `${authors[0]}. `;
    } else if (authors.length === 2) {
      authorsFormatted = `${authors[0]}, & ${authors[1]}. `;
    } else if (authors.length > 2) {
      authorsFormatted = `${authors[0]}, et al. `;
    }

    // Generate content based on style
    switch (style) {
      case 'APA 7th':
        if (sourceType === 'journalArticle') {
          return `${authorsFormatted}(${year}). ${title}. ${source}, ${volume}${issue ? `(${issue})` : ''}, ${pages || ''}.${doi ? ` https://doi.org/${doi}` : ''}`;
        } else if (sourceType === 'book') {
          return `${authorsFormatted}(${year}). ${title}. ${source}. ${isbn ? `ISBN: ${isbn}` : ''}`;
        }
        // Default format
        return `${authorsFormatted}(${year}). ${title}. ${source}.`;
        
      case 'MLA 9th':
        if (sourceType === 'journalArticle') {
          return `${authorsFormatted} "Title." ${source}, vol. ${volume}, no. ${issue}, ${year}, pp. ${pages || ''}.${doi ? ` doi:${doi}` : ''}`;
        }
        return `${authorsFormatted} "Title." ${source}, ${year}.${isbn ? ` ISBN: ${isbn}` : ''}`;
        
      case 'Chicago 17th':
        if (sourceType === 'journalArticle') {
          return `${authorsFormatted} "Title." ${source} ${volume}, no. ${issue} (${year}): ${pages || ''}${doi ? ` doi:${doi}.` : '.'}`;
        }
        return `${authorsFormatted} Title. ${source}: ${source}, ${year}.${isbn ? ` ISBN: ${isbn}.` : ''}`;
        
      default: // Default to APA
        return `${authorsFormatted}(${year}). ${title}. ${source}.`;
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setEditForm({
      title: '',
      authors: '',
      year: new Date().getFullYear().toString(),
      source: '',
      volume: '',
      issue: '',
      pages: '',
      doi: '',
      isbn: '',
      url: '',
      abstract: '',
      sourceType: 'journalArticle',
      style: 'APA 7th',
      tags: '',
      notes: ''
    });
    setIsAdding(false);
    setIsEditing(null);
  };

  // Handle file import
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // For now, we'll just show a toast about the file
    setImportFile(file);
    toast.info(`Ready to import ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
  };

  // Import citations from file
  const importCitationsFromFile = async () => {
    if (!importFile) return;

    // In a real implementation, this would process the file
    // For now, we'll just show a success message
    toast.promise(
      new Promise<void>(resolve => {
        setTimeout(() => {
          // Pretend to import the file
          const mockImportedCitations: Citation[] = [
            {
              id: `imp-${Date.now()}`,
              title: 'Imported Citation Example',
              authors: ['Imported, A.'],
              year: 2024,
              source: 'Imported Journal',
              sourceType: 'journalArticle',
              style: activeStyle,
              content: 'Imported, A. (2024). Imported Citation Example. Imported Journal.',
              tags: ['imported'],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ];
          
          setCitations(prev => [...mockImportedCitations, ...prev]);
          setImportFile(null);
          resolve();
        }, 1500);
      }),
      {
        loading: 'Importing citations...',
        success: `Successfully imported ${importFile.name}`,
        error: 'Failed to import file'
      }
    );
  };

  // Generate a citation from AI
  const generateCitationWithAI = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please enter a description of the source to generate');
      return;
    }

    setGeneratingCitation(true);

    try {
      // Construct the AI prompt
      const prompt = `Generate an academic citation in ${activeStyle} format for: "${aiPrompt}". 
      
      Requirements:
      - Follow ${activeStyle} citation standards precisely
      - Include all necessary elements for a complete citation
      - If details are missing from the description, create realistic hypothetical values
      - Return only the citation in the requested format without additional text
      
      Example output for journal article in APA: "Doe, J. J., & Smith, J. J. (2023). Title of article. Journal Name, 45(2), 123-145. https://doi.org/10.1234/example.doi"
      Example output for book in APA: "Doe, J. J. (2023). Title of book. Publisher. ISBN: 978-0-123456-78-9"`;

      const aiGeneratedCitation = await callPuterAI(prompt, { 
        temperature: 0.3, // Lower temperature for more consistent citation formats
        max_tokens: 300 
      });

      // Create a new citation object based on what we can infer
      const newCitation: Citation = {
        id: `ai-${Date.now()}`,
        title: 'AI Generated Citation',
        authors: ['AI Generated'],
        year: new Date().getFullYear(),
        source: 'AI Generated Source',
        sourceType: 'journalArticle', // Default to journal article
        style: activeStyle,
        content: aiGeneratedCitation.trim(),
        tags: ['ai-generated'],
        notes: `AI generated based on: "${aiPrompt}"`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setCitations(prev => [newCitation, ...prev]);
      setAiPrompt('');
      toast.success('Citation generated with AI!');
    } catch (error) {
      console.error('Error generating citation with AI:', error);
      toast.error('Failed to generate citation with AI. Please try again.');
    } finally {
      setGeneratingCitation(false);
    }
  };

  // Filter citations based on search and filters
  const filteredCitations = citations.filter(citation => {
    const matchesSearch = !searchTerm || 
      citation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      citation.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      citation.authors.some(author => author.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || citation.sourceType === filterType;
    const matchesStyle = filterStyle === 'all' || citation.style === filterStyle;
    
    return matchesSearch && matchesType && matchesStyle;
  });

  // Get citation in different formats
  const getCitationInFormat = (citation: Citation, format: CitationStyle) => {
    // This would generate the citation in the requested format
    // For now, we'll just return the original content
    return citation.content;
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Advanced Citation Manager</h1>
        <p className="text-muted-foreground">
          Generate, manage, and format academic citations with AI assistance
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Citations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{citations.length}</div>
            <p className="text-xs text-muted-foreground">Across all styles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">APA Citations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {citations.filter(c => c.style === 'APA 7th').length}
            </div>
            <p className="text-xs text-muted-foreground">APA 7th Edition</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Most Used Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
             {citations.length > 0 ? 
               Math.max(...Object.values(
                 citations.reduce((acc, curr) => {
                   acc[curr.sourceType] = (acc[curr.sourceType] || 0) + 1;
                   return acc;
                 }, {} as Record<SourceType, number>)
               )) : 0
             }
            </div>
            <p className="text-xs text-muted-foreground">
              {citations.length > 0 ? 
                Object.entries(
                  citations.reduce((acc, curr) => {
                    acc[curr.sourceType] = (acc[curr.sourceType] || 0) + 1;
                    return acc;
                  }, {} as Record<SourceType, number>)
                ).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A' : 'N/A'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Last Added</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {citations[0]?.year || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {citations[0]?.title.substring(0, 20) + (citations[0]?.title.length > 20 ? '...' : '') || 'None'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="manage" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="manage">Manage Citations</TabsTrigger>
          <TabsTrigger value="ai-generate">AI Generator</TabsTrigger>
          <TabsTrigger value="import">Import/Export</TabsTrigger>
        </TabsList>

        {/* Manage Citations Tab */}
        <TabsContent value="manage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Citation Library
                </div>
                <Button 
                  onClick={() => setIsAdding(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Citation
                </Button>
              </CardTitle>
              <CardDescription>
                Your collection of academic citations with AI-powered management
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filter Bar */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search citations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select 
                  value={filterType} 
                  onValueChange={(val) => setFilterType(val as SourceType | 'all')}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="journalArticle">Journal Article</SelectItem>
                    <SelectItem value="book">Book</SelectItem>
                    <SelectItem value="thesis">Thesis</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                  </SelectContent>
                </Select>
                <Select 
                  value={filterStyle} 
                  onValueChange={(val) => setFilterStyle(val as CitationStyle | 'all')}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Styles</SelectItem>
                    <SelectItem value="APA 7th">APA 7th</SelectItem>
                    <SelectItem value="MLA 9th">MLA 9th</SelectItem>
                    <SelectItem value="Chicago 17th">Chicago 17th</SelectItem>
                    <SelectItem value="IEEE">IEEE</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Add/Edit Form */}
              {(isAdding || isEditing) && (
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {isEditing ? 'Edit Citation' : 'Add New Citation'}
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={resetForm}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          value={editForm.title}
                          onChange={(e) => handleInputChange('title', e.target.value)}
                          placeholder="Enter title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="authors">Authors *</Label>
                        <Input
                          id="authors"
                          value={editForm.authors}
                          onChange={(e) => handleInputChange('authors', e.target.value)}
                          placeholder="Enter authors (comma separated)"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="year">Year</Label>
                        <Input
                          id="year"
                          value={editForm.year}
                          onChange={(e) => handleInputChange('year', e.target.value)}
                          placeholder="e.g., 2023"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="source">Source/Journal</Label>
                        <Input
                          id="source"
                          value={editForm.source}
                          onChange={(e) => handleInputChange('source', e.target.value)}
                          placeholder="Publication name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sourceType">Source Type</Label>
                        <Select 
                          value={editForm.sourceType} 
                          onValueChange={(val) => handleInputChange('sourceType', val as SourceType)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="journalArticle">Journal Article</SelectItem>
                            <SelectItem value="book">Book</SelectItem>
                            <SelectItem value="bookSection">Book Section</SelectItem>
                            <SelectItem value="thesis">Thesis</SelectItem>
                            <SelectItem value="website">Website</SelectItem>
                            <SelectItem value="report">Report</SelectItem>
                            <SelectItem value="conferencePaper">Conference Paper</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="style">Citation Style</Label>
                        <Select 
                          value={editForm.style} 
                          onValueChange={(val) => handleInputChange('style', val as CitationStyle)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="APA 7th">APA 7th Edition</SelectItem>
                            <SelectItem value="MLA 9th">MLA 9th Edition</SelectItem>
                            <SelectItem value="Chicago 17th">Chicago 17th Edition</SelectItem>
                            <SelectItem value="IEEE">IEEE</SelectItem>
                            <SelectItem value="Harvard">Harvard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="volume">Volume</Label>
                        <Input
                          id="volume"
                          value={editForm.volume}
                          onChange={(e) => handleInputChange('volume', e.target.value)}
                          placeholder="e.g., 25"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="issue">Issue</Label>
                        <Input
                          id="issue"
                          value={editForm.issue}
                          onChange={(e) => handleInputChange('issue', e.target.value)}
                          placeholder="e.g., 3"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pages">Pages</Label>
                        <Input
                          id="pages"
                          value={editForm.pages}
                          onChange={(e) => handleInputChange('pages', e.target.value)}
                          placeholder="e.g., 123-145"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="doi">DOI</Label>
                        <Input
                          id="doi"
                          value={editForm.doi}
                          onChange={(e) => handleInputChange('doi', e.target.value)}
                          placeholder="e.g., 10.1234/journal.123"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="isbn">ISBN</Label>
                        <Input
                          id="isbn"
                          value={editForm.isbn}
                          onChange={(e) => handleInputChange('isbn', e.target.value)}
                          placeholder="e.g., 978-0-123456-78-9"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="url">URL</Label>
                        <Input
                          id="url"
                          value={editForm.url}
                          onChange={(e) => handleInputChange('url', e.target.value)}
                          placeholder="https://example.com"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 mt-4">
                      <Label htmlFor="tags">Tags</Label>
                      <Input
                        id="tags"
                        value={editForm.tags}
                        onChange={(e) => handleInputChange('tags', e.target.value)}
                        placeholder="Tags separated by commas, e.g., education, technology, research"
                      />
                    </div>
                    <div className="space-y-2 mt-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={editForm.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder="Add notes about this citation..."
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        onClick={resetForm}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={isEditing ? updateCitation : addCitation}
                        className="gap-2"
                      >
                        {isEditing ? (
                          <>
                            <Check className="h-4 w-4" />
                            Update Citation
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4" />
                            Add Citation
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Citations Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead className="hidden md:table-cell">Authors</TableHead>
                      <TableHead className="hidden sm:table-cell">Year</TableHead>
                      <TableHead className="hidden lg:table-cell">Source Type</TableHead>
                      <TableHead className="hidden xl:table-cell">Style</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCitations.length > 0 ? (
                      filteredCitations.map((citation) => (
                        <TableRow key={citation.id}>
                          <TableCell className="font-medium">
                            <div className="truncate max-w-xs">{citation.title}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {citation.content.substring(0, 100)}...
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="truncate max-w-xs">
                              {citation.authors.slice(0, 2).join(', ')}
                              {citation.authors.length > 2 && ` +${citation.authors.length - 2}`}
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {citation.year}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Badge variant="outline">
                              {citation.sourceType.replace(/([A-Z])/g, ' $1').trim()}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">
                            <Badge variant="secondary">
                              {citation.style.split(' ')[0]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyCitation(citation.content)}
                                title="Copy citation"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  // Set form data to edit this citation
                                  setEditForm({
                                    title: citation.title,
                                    authors: citation.authors.join(', '),
                                    year: citation.year.toString(),
                                    source: citation.source,
                                    volume: citation.volume || '',
                                    issue: citation.issue || '',
                                    pages: citation.pages || '',
                                    doi: citation.doi || '',
                                    isbn: citation.isbn || '',
                                    url: citation.url || '',
                                    abstract: citation.abstract || '',
                                    sourceType: citation.sourceType,
                                    style: citation.style,
                                    tags: citation.tags.join(', '),
                                    notes: citation.notes || ''
                                  });
                                  setIsEditing(citation.id);
                                }}
                                title="Edit citation"
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteCitation(citation.id)}
                                title="Delete citation"
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          {citations.length === 0 
                            ? "You haven't added any citations yet. Start by adding your first citation or importing from a file."
                            : "No citations match your search filters."
                          }
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Generator Tab */}
        <TabsContent value="ai-generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                AI Citation Generator
              </CardTitle>
              <CardDescription>
                Create citations from text descriptions with AI assistance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ai-prompt">Describe the source to generate a citation</Label>
                  <Textarea
                    id="ai-prompt"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Describe the source including title, author, year, publication, etc. Example: 'A 2023 journal article by Smith and Jones published in the Journal of Research on educational technology applications'"
                    rows={4}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <Label>Generation Style</Label>
                    <Select 
                      value={activeStyle} 
                      onValueChange={(val) => setActiveStyle(val as CitationStyle)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="APA 7th">APA 7th Edition</SelectItem>
                        <SelectItem value="MLA 9th">MLA 9th Edition</SelectItem>
                        <SelectItem value="Chicago 17th">Chicago 17th Edition</SelectItem>
                        <SelectItem value="IEEE">IEEE</SelectItem>
                        <SelectItem value="Harvard">Harvard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={generateCitationWithAI} 
                    disabled={generatingCitation || !aiPrompt.trim()}
                    className="gap-2"
                  >
                    {generatingCitation ? (
                      <>
                        <Wand2 className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Import/Export Tab */}
        <TabsContent value="import" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Import Citations
              </CardTitle>
              <CardDescription>
                Import citations from files or external sources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Import from File
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div 
                          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <FilePlus2 className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                          <p className="font-medium">Click to upload a file</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Supports BibTeX (.bib), RIS, and EndNote formats
                          </p>
                          {importFile && (
                            <div className="mt-3 p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                              <p>Selected: {importFile.name}</p>
                              <p className="text-gray-500 dark:text-gray-400">
                                {(importFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          )}
                        </div>
                        <Input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept=".bib,.ris,.enw,.xml"
                          onChange={handleFileImport}
                        />
                        <Button 
                          onClick={importCitationsFromFile} 
                          disabled={!importFile}
                          className="w-full gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          Import File
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ScanFace className="h-4 w-4" />
                        Import from DOI/ISBN
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="doi-isbn">Enter DOI or ISBN</Label>
                          <div className="flex gap-2">
                            <Input 
                              id="doi-isbn" 
                              placeholder="e.g., 10.1000/example.doi or 978-0-123456-78-9" 
                            />
                            <Button variant="outline">
                              <Globe className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Automatically fetch citation details from CrossRef, DOI, or ISBN databases
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Export Citations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        BibTeX
                      </Button>
                      <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        RIS
                      </Button>
                      <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Word (.docx)
                      </Button>
                      <Button variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Plain Text
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bibliography Preview */}
      {citations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookType className="h-5 w-5" />
                Bibliography Preview
              </div>
              <div className="flex gap-2">
                <Select value={activeStyle} onValueChange={(val) => setActiveStyle(val as CitationStyle)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="APA 7th">APA 7th</SelectItem>
                    <SelectItem value="MLA 9th">MLA 9th</SelectItem>
                    <SelectItem value="Chicago 17th">Chicago 17th</SelectItem>
                    <SelectItem value="IEEE">IEEE</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              Your formatted bibliography in {activeStyle} style
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-muted/50 max-h-60 overflow-y-auto">
              <h3 className="font-semibold mb-2">References</h3>
              {citations
                .filter(c => c.style === activeStyle)
                .map((citation, index) => (
                  <div key={citation.id} className="mb-2 text-sm">
                    {index + 1}. {citation.content}
                  </div>
                ))
              }
              {citations.filter(c => c.style === activeStyle).length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No citations match the selected style ({activeStyle}).
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedCitationManager;