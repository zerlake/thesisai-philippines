'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Copy, RotateCcw, BookOpen, FileText, Hash, User, Calendar } from 'lucide-react';
import { toast } from 'sonner';

// Define citation style types
type CitationStyle = 'apa' | 'mla' | 'chicago' | 'harvard' | 'ieee';

// Define citation format type
interface CitationSource {
  type: 'book' | 'journal' | 'website' | 'thesis' | 'conference' | 'report';
  title: string;
  author: string;
  year: string;
  publisher?: string;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
  accessed?: string;
}

// APA 7th edition formatter
const formatAPA = (source: CitationSource): string => {
  let result = '';

  // Author format: Lastname, F. M. (Year)
  if (source.author) {
    const authors = source.author.split(/,\s*|\sand\s/i);
    if (authors.length === 1) {
      result = `${source.author}. `;
    } else if (authors.length === 2) {
      result = `${authors[0]}, & ${authors[1]}. `;
    } else if (authors.length > 2) {
      // For 3+ authors, use first author followed by et al.
      result = `${authors[0]}, et al. `;
    } else {
      result = `Anonymous. `;
    }
    result += `(${source.year}). `;
  } else {
    result = `(n.d.). `;
  }

  // Title
  result += `${source.title}. `;

  // Additional formatting based on type
  if (source.type === 'journal' && source.journal) {
    result += `${source.journal}, ${source.volume}${source.issue ? `(${source.issue})` : ''}, ${source.pages}.`;
    if (source.doi) {
      result += ` https://doi.org/${source.doi}`;
    }
  } else if (source.type === 'book' && source.publisher) {
    result += `${source.publisher}.`;
  } else if (source.type === 'website' && source.url) {
    result += `Retrieved ${source.accessed || 'n.d.'} from ${source.url}`;
  } else {
    if (source.publisher) {
      result += `${source.publisher}.`;
    }
  }

  return result;
};

// MLA 9th edition formatter
const formatMLA = (source: CitationSource): string => {
  let result = '';

  // Author format: Lastname, Firstname, and Author 2, if applicable.
  if (source.author) {
    const authors = source.author.split(/,\s*|\sand\s/i);
    if (authors.length === 1) {
      result = `${source.author}. `;
    } else if (authors.length === 2) {
      result = `${authors[0]}, and ${authors[1]}. `;
    } else if (authors.length > 2) {
      // For 3+ authors, use first author followed by et al.
      result = `${authors[0]}, et al. `;
    }
  } else {
    result = `Anonymous. `;
  }

  // Title in quotation marks
  result += `"${source.title}." `;

  if (source.type === 'journal' && source.journal) {
    result += `${source.journal}, vol. ${source.volume}, no. ${source.issue}, ${source.year}, pp. ${source.pages}.`;
  } else if (source.type === 'book' && source.publisher) {
    result += `${source.publisher}, ${source.year}.`;
  } else if (source.type === 'website' && source.url) {
    result += `${source.publisher || 'n.p.'}, ${source.year || 'n.d.'}, ${source.url}. Accessed ${source.accessed || 'n.d.'}`;
  } else {
    result += `${source.publisher || 'Publisher not listed'}, ${source.year}.`;
  }

  return result;
};

// Chicago 17th edition (Notes-Bibliography) formatter
const formatChicago = (source: CitationSource): string => {
  let result = '';

  if (source.author) {
    const authors = source.author.split(/,\s*|\sand\s/i);
    if (authors.length === 1) {
      result = `${source.author}. `;
    } else if (authors.length === 2) {
      result = `${authors[0]}, and ${authors[1]}. `;
    } else if (authors.length > 2) {
      // For 3+ authors, use first author followed by et al.
      result = `${authors[0]}, et al. `;
    }
  } else {
    result = `Anonymous. `;
  }

  result += `"<i>${source.title}</i>." `;

  if (source.type === 'journal' && source.journal) {
    result += `${source.journal} ${source.volume}, no. ${source.issue} (${source.year}): ${source.pages}.`;
    if (source.doi) {
      result += ` https://doi.org/${source.doi}`;
    }
  } else if (source.type === 'book' && source.publisher) {
    result += `${source.publisher}, ${source.year}.`;
  } else if (source.type === 'website' && source.url) {
    result += `Last modified ${source.accessed || source.year || 'n.d.'}. ${source.url}.`;
  } else {
    result += `${source.publisher || 'Publisher not listed'}, ${source.year}.`;
  }

  return result;
};

// Harvard style formatter
const formatHarvard = (source: CitationSource): string => {
  let result = '';

  // Author format: Lastname, Initial(s). (Year)
  if (source.author) {
    const authors = source.author.split(/,\s*|\sand\s/i);
    if (authors.length === 1) {
      result = `${source.author} (${source.year}) `;
    } else if (authors.length === 2) {
      result = `${authors[0]} and ${authors[1]} (${source.year}) `;
    } else if (authors.length > 2) {
      // For 3+ authors, use first author followed by et al.
      result = `${authors[0]}, et al. (${source.year}) `;
    }
  } else {
    result = `Anonymous (${source.year || 'n.d.'}) `;
  }

  // Title
  result += `'<i>${source.title}</i>' `;

  if (source.type === 'journal' && source.journal) {
    result += `${source.journal}, ${source.volume}(${source.issue}), pp.${source.pages}.`;
  } else if (source.type === 'book' && source.publisher) {
    result += `${source.publisher}.`;
  } else if (source.type === 'website' && source.url) {
    result += `Available at: ${source.url} (Accessed: ${source.accessed || 'date not listed'})`;
  } else {
    result += `${source.publisher || 'Publisher not listed'}.`;
  }

  return result;
};

// IEEE style formatter
const formatIEEE = (source: CitationSource): string => {
  let result = '[1] ';

  // Author format: Initials. Lastname
  if (source.author) {
    const authors = source.author.split(/,\s*|\sand\s/i);
    const formattedAuthors = authors.map(author => {
      const parts = author.trim().split(/\s+/);
      if (parts.length >= 2) {
        const lastName = parts.pop(); // Last part is the last name
        const initials = parts.map(part => part.charAt(0) + '.').join(''); // Initials of everything else
        return `${initials} ${lastName}`;
      }
      return author; // Fallback if format isn't as expected
    }).join(', ');

    result += `${formattedAuthors}, `;
  }

  // Title in quotes depending on type
  result += `"${source.title}", `;

  if (source.type === 'journal' && source.journal) {
    result += `${source.journal}, vol. ${source.volume}, no. ${source.issue}, pp. ${source.pages}, ${source.year}.`;
    if (source.doi) {
      result += ` doi: 10.1109/${source.doi}.`;
    }
  } else if (source.type === 'book' && source.publisher) {
    result += `${source.publisher}, ${source.year}.`;
  } else if (source.type === 'website' && source.url) {
    result += `${source.publisher || 'Website'} [Online]. Available: ${source.url || 'URL not listed'}. [Accessed: ${source.accessed || 'date not listed'}].`;
  } else {
    result += `${source.publisher || 'Publisher not listed'}, ${source.year}.`;
  }

  return result;
};

const CitationFormatter = () => {
  const [citationType, setCitationType] = useState<CitationSource['type']>('book');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [year, setYear] = useState('');
  const [publisher, setPublisher] = useState('');
  const [journal, setJournal] = useState('');
  const [volume, setVolume] = useState('');
  const [issue, setIssue] = useState('');
  const [pages, setPages] = useState('');
  const [doi, setDoi] = useState('');
  const [url, setUrl] = useState('');
  const [accessed, setAccessed] = useState('');
  const [output, setOutput] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<CitationStyle>('apa');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Calculate citation whenever input changes
  useEffect(() => {
    const source: CitationSource = {
      type: citationType,
      title,
      author,
      year,
      publisher: publisher || undefined,
      journal: journal || undefined,
      volume: volume || undefined,
      issue: issue || undefined,
      pages: pages || undefined,
      doi: doi || undefined,
      url: url || undefined,
      accessed: accessed || undefined,
    };

    if (!title || !author || !year) {
      setOutput('');
      return;
    }

    switch (selectedStyle) {
      case 'apa':
        setOutput(formatAPA(source));
        break;
      case 'mla':
        setOutput(formatMLA(source));
        break;
      case 'chicago':
        setOutput(formatChicago(source));
        break;
      case 'harvard':
        setOutput(formatHarvard(source));
        break;
      case 'ieee':
        setOutput(formatIEEE(source));
        break;
      default:
        setOutput(formatAPA(source));
    }
  }, [citationType, title, author, year, publisher, journal, volume, issue, pages, doi, url, accessed, selectedStyle]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    toast.success('Citation copied to clipboard!');
  };

  const resetForm = () => {
    setCitationType('book');
    setTitle('');
    setAuthor('');
    setYear('');
    setPublisher('');
    setJournal('');
    setVolume('');
    setIssue('');
    setPages('');
    setDoi('');
    setUrl('');
    setAccessed('');
    setSelectedStyle('apa');
    setOutput('');
    setShowAdvanced(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Citation Formatter
          </CardTitle>
          <CardDescription>
            Generate properly formatted citations in multiple academic styles (APA, MLA, Chicago, Harvard, IEEE)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Citation Type and Style Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="citation-type">Source Type</Label>
              <Select value={citationType} onValueChange={(v: CitationSource['type']) => setCitationType(v)}>
                <SelectTrigger id="citation-type">
                  <SelectValue placeholder="Select source type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="book">Book</SelectItem>
                  <SelectItem value="journal">Journal Article</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="thesis">Thesis/Dissertation</SelectItem>
                  <SelectItem value="conference">Conference Paper</SelectItem>
                  <SelectItem value="report">Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="citation-style">Citation Style</Label>
              <Select value={selectedStyle} onValueChange={(v: CitationStyle) => setSelectedStyle(v)}>
                <SelectTrigger id="citation-style">
                  <SelectValue placeholder="Select citation style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apa">APA 7th Edition</SelectItem>
                  <SelectItem value="mla">MLA 9th Edition</SelectItem>
                  <SelectItem value="chicago">Chicago 17th Edition</SelectItem>
                  <SelectItem value="harvard">Harvard Style</SelectItem>
                  <SelectItem value="ieee">IEEE Style</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Basic Citation Fields */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter title"
                  className="flex items-center gap-2"
                />
                <div className="flex items-center mt-1 text-xs text-muted-foreground">
                  <BookOpen className="h-3 w-3 mr-1" />
                  Required field
                </div>
              </div>
              <div>
                <Label htmlFor="author">Author *</Label>
                <Input
                  id="author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g., Smith, John A."
                  className="flex items-center gap-2"
                />
                <div className="flex items-center mt-1 text-xs text-muted-foreground">
                  <User className="h-3 w-3 mr-1" />
                  Required field
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="e.g., 2025"
                  className="flex items-center gap-2"
                />
                <div className="flex items-center mt-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  Required field
                </div>
              </div>
              <div>
                <Label htmlFor="publisher">Publisher</Label>
                <Input
                  id="publisher"
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                  placeholder="e.g., Academic Press"
                />
              </div>
            </div>
          </div>

          {/* Advanced Fields Toggle */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Fields
              <Hash className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Advanced Fields */}
          {showAdvanced && (
            <div className="space-y-4 border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {citationType === 'journal' && (
                  <>
                    <div>
                      <Label htmlFor="journal">Journal Name</Label>
                      <Input
                        id="journal"
                        value={journal}
                        onChange={(e) => setJournal(e.target.value)}
                        placeholder="e.g., Journal of Academic Research"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="volume">Volume</Label>
                        <Input
                          id="volume"
                          value={volume}
                          onChange={(e) => setVolume(e.target.value)}
                          placeholder="e.g., 15"
                        />
                      </div>
                      <div>
                        <Label htmlFor="issue">Issue</Label>
                        <Input
                          id="issue"
                          value={issue}
                          onChange={(e) => setIssue(e.target.value)}
                          placeholder="e.g., 3"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="pages">Page Range</Label>
                      <Input
                        id="pages"
                        value={pages}
                        onChange={(e) => setPages(e.target.value)}
                        placeholder="e.g., 123-145"
                      />
                    </div>
                  </>
                )}
                <div>
                  <Label htmlFor="doi">DOI</Label>
                  <Input
                    id="doi"
                    value={doi}
                    onChange={(e) => setDoi(e.target.value)}
                    placeholder="e.g., 10.1000/example.doi"
                  />
                </div>
                <div>
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="e.g., https://example.com/article"
                  />
                </div>
                <div>
                  <Label htmlFor="accessed">Accessed Date</Label>
                  <Input
                    id="accessed"
                    value={accessed}
                    onChange={(e) => setAccessed(e.target.value)}
                    placeholder="e.g., YYYY-MM-DD"
                    type="date"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Output Section */}
          {output && (
            <Card className="mt-6">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Formatted Citation</CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={copyToClipboard} size="sm">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button onClick={resetForm} size="sm" variant="outline">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Your {selectedStyle.toUpperCase()} formatted citation
                  {selectedStyle === 'apa' && (
                    <Badge variant="outline" className="ml-2">7th Edition</Badge>
                  )}
                  {selectedStyle === 'mla' && (
                    <Badge variant="outline" className="ml-2">9th Edition</Badge>
                  )}
                  {selectedStyle === 'chicago' && (
                    <Badge variant="outline" className="ml-2">17th Edition</Badge>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md min-h-[100px] flex items-center">
                  <p className="whitespace-pre-wrap">{output}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructions */}
          <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
            <h3 className="font-medium text-blue-800 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              How to Use the Citation Formatter
            </h3>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-sm text-blue-700">
              <li>Select the type of source you're citing</li>
              <li>Choose the required citation style (APA, MLA, Chicago, Harvard, IEEE)</li>
              <li>Fill in the required fields marked with *</li>
              <li>Click "Show Advanced Fields" if you need to add journal, volume, issue, etc.</li>
              <li>Your formatted citation will appear automatically</li>
              <li>Copy the citation to your clipboard with one click</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CitationFormatter;