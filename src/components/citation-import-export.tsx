import { useState, useRef } from 'react';
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
  Alert, 
  AlertDescription 
} from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Download, 
  Database, 
  FileText, 
  ScanSearch, 
  Globe,
  BookOpen,
  Plus,
  Trash2,
  Check,
  X
} from 'lucide-react';
import { toast } from 'sonner';

// Define types for import/export formats
export type ImportFormat = 'bibtex' | 'ris' | 'endnote' | 'csv' | 'zotero' | 'mendeley';
export type ExportFormat = 'bibtex' | 'ris' | 'endnote' | 'csv' | 'zotero' | 'mendeley' | 'docx' | 'txt';

interface CitationImportExportProps {
  onImportComplete: (citations: any[]) => void;
  userId: string;
}

const CitationImportExport: React.FC<CitationImportExportProps> = ({ 
  onImportComplete,
  userId 
}) => {
  const [importMethod, setImportMethod] = useState<'file' | 'doi' | 'isbn' | 'manual'>('file');
  const [importFormat, setImportFormat] = useState<ImportFormat>('bibtex');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('bibtex');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [doiInput, setDoiInput] = useState('');
  const [isbnInput, setIsbnInput] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFile(file);
      
      // If it's a text-based format, show a preview
      if (file.type === 'application/x-bibtex' || 
          file.type === 'application/x-research-info-systems' || 
          file.name.endsWith('.bib') || 
          file.name.endsWith('.ris')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          setImportPreview(parseImportPreview(content, file.name.split('.').pop() as ImportFormat || 'bibtex'));
        };
        reader.readAsText(file);
      }
    }
  };

  // Parse import preview based on format
  const parseImportPreview = (content: string, format: ImportFormat): any[] => {
    try {
      switch (format) {
        case 'bibtex':
          return parseBibTeX(content);
        case 'ris':
          return parseRIS(content);
        case 'csv':
          return parseCSV(content);
        default:
          // For other formats, return a simple preview
          return [
            { id: 'preview-1', title: `Preview of ${format.toUpperCase()} import`, authors: ['Multiple Authors'], year: new Date().getFullYear() }
          ];
      }
    } catch (error) {
      console.error(`Error parsing ${format} content:`, error);
      return [{ id: 'error', title: 'Error parsing content', authors: ['Error'], year: new Date().getFullYear() }];
    }
  };

  // Parse BibTeX content
  const parseBibTeX = (content: string): any[] => {
    const entries = content.split('\n@').filter(entry => entry.trim());
    const parsed: any[] = [];

    for (const entry of entries) {
      const lines = entry.split('\n');
      const entryType = entry.split('{')[0]?.trim() || 'misc';
      let id = entry.split('{')[1]?.split(',')[0]?.trim() || 'unknown';
      
      const parsedEntry: any = {
        id,
        type: entryType,
        authors: [],
        title: '',
        year: new Date().getFullYear(),
      };

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.includes('author')) {
          const authorMatch = trimmedLine.match(/author\s*=\s*[{"]/i);
          if (authorMatch) {
            const authorsStr = trimmedLine.substring(authorMatch.index! + authorMatch[0].length).replace(/[{},]/g, '').trim();
            // Handle both "Last, First and Last, First" and "First Last and First Last" formats
            parsedEntry.authors = authorsStr.split(' and ').map((author: string) => author.trim());
          }
        } else if (trimmedLine.includes('title')) {
          const titleMatch = trimmedLine.match(/title\s*=\s*[{"]/i);
          if (titleMatch) {
            parsedEntry.title = trimmedLine.substring(titleMatch.index! + titleMatch[0].length).replace(/[{}",]/g, '').trim();
          }
        } else if (trimmedLine.includes('year')) {
          const yearMatch = trimmedLine.match(/year\s*=\s*[{"]/i);
          if (yearMatch) {
            const yearStr = trimmedLine.substring(yearMatch.index! + yearMatch[0].length).replace(/[{}",]/g, '').trim();
            parsedEntry.year = parseInt(yearStr, 10) || new Date().getFullYear();
          }
        } else if (trimmedLine.includes('journal')) {
          const journalMatch = trimmedLine.match(/journal\s*=\s*[{"]/i);
          if (journalMatch) {
            parsedEntry.journal = trimmedLine.substring(journalMatch.index! + journalMatch[0].length).replace(/[{}",]/g, '').trim();
          }
        }
      }

      parsed.push(parsedEntry);
    }

    return parsed;
  };

  // Parse RIS content
  const parseRIS = (content: string): any[] => {
    const entries = content.split('\nER\n').filter(entry => entry.trim());
    const parsed: any[] = [];

    for (const entry of entries) {
      const lines = entry.split('\n');
      const parsedEntry: any = {
        authors: [],
        title: '',
        year: new Date().getFullYear(),
      };

      for (const line of lines) {
        if (line.startsWith('TY ')) {
          parsedEntry.type = line.substring(3).trim();
        } else if (line.startsWith('ID ')) {
          parsedEntry.id = line.substring(3).trim();
        } else if (line.startsWith('T1 ') || line.startsWith('TI ')) {
          parsedEntry.title = line.substring(3).trim();
        } else if (line.startsWith('AU ')) {
          parsedEntry.authors.push(line.substring(3).trim());
        } else if (line.startsWith('PY ')) {
          const yearMatch = line.substring(3).trim().match(/^\d{4}/);
          if (yearMatch) {
            parsedEntry.year = parseInt(yearMatch[0], 10);
          }
        } else if (line.startsWith('JO ') || line.startsWith('JF ')) {
          parsedEntry.journal = line.substring(3).trim();
        } else if (line.startsWith('VL ')) {
          parsedEntry.volume = line.substring(3).trim();
        } else if (line.startsWith('IS ')) {
          parsedEntry.issue = line.substring(3).trim();
        } else if (line.startsWith('SP ')) {
          parsedEntry.start_page = line.substring(3).trim();
        } else if (line.startsWith('EP ')) {
          parsedEntry.end_page = line.substring(3).trim();
        } else if (line.startsWith('DO ')) {
          parsedEntry.doi = line.substring(3).trim();
        } else if (line.startsWith('UR ')) {
          parsedEntry.url = line.substring(3).trim();
        }
      }

      if (!parsedEntry.id) {
        parsedEntry.id = `ris-${Date.now()}-${parsed.length}`;
      }

      parsed.push(parsedEntry);
    }

    return parsed;
  };

  // Parse CSV content
  const parseCSV = (content: string): any[] => {
    const lines = content.split('\n');
    if (lines.length < 2) return [];

    // Parse header row to determine columns
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

    // Parse data rows
    const parsed: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const values = lines[i].split(',');
      const entry: any = { id: `csv-${Date.now()}-${i}` };

      for (let j = 0; j < headers.length && j < values.length; j++) {
        const header = headers[j];
        const value = values[j].trim().replace(/"/g, ''); // Remove quotes

        if (header.includes('title')) {
          entry.title = value;
        } else if (header.includes('author') || header.includes('creator')) {
          entry.authors = value.split(';').map((a: string) => a.trim());
        } else if (header.includes('year') || header.includes('date')) {
          entry.year = parseInt(value, 10) || new Date().getFullYear();
        } else if (header.includes('doi')) {
          entry.doi = value;
        } else if (header.includes('url') || header.includes('link')) {
          entry.url = value;
        } else if (header.includes('journal') || header.includes('publication')) {
          entry.journal = value;
        } else {
          entry[header] = value;
        }
      }

      if (!entry.authors) entry.authors = [];
      if (!entry.title) entry.title = 'Untitled Entry';

      parsed.push(entry);
    }

    return parsed;
  };

  // Trigger file input
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Import from file
  const handleFileImport = async () => {
    if (!importFile) {
      toast.error('Please select a file to import');
      return;
    }

    setIsImporting(true);
    setImportProgress(0);

    try {
      // Simulate import progress
      for (let i = 0; i <= 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setImportProgress(Math.floor((i / 10) * 80));
      }

      // Process based on format
      let importedCitations: any[] = [];

      switch (importFormat) {
        case 'bibtex':
          // Actual BibTeX parsing would be implemented here
          importedCitations = parseBibTeX(await importFile.text());
          break;
        case 'ris':
          importedCitations = parseRIS(await importFile.text());
          break;
        case 'csv':
          importedCitations = parseCSV(await importFile.text());
          break;
        case 'zotero':
        case 'mendeley':
          // For Zotero/Mendeley, we would call their APIs
          // This would require user authentication to their accounts
          // For now, we'll simulate with a simple approach
          importedCitations = parseCSV(await importFile.text());
          break;
        default:
          importedCitations = [];
      }

      setImportProgress(100);

      if (importedCitations.length > 0) {
        setImportPreview(importedCitations);
        setShowPreview(true);
        toast.success(`Preview ${importedCitations.length} citations from ${importFile.name}`);
      } else {
        toast.error('No citations found in the imported file');
      }
    } catch (error) {
      console.error('Error importing file:', error);
      toast.error('Failed to import citations from file');
    } finally {
      setIsImporting(false);
    }
  };

  // Import from DOI
  const handleDOIImport = async () => {
    if (!doiInput.trim()) {
      toast.error('Please enter a DOI');
      return;
    }

    setIsImporting(true);

    try {
      // In a real implementation, we would call CrossRef API or similar
      // For this example, we'll simulate the API call
      const mockCitation = {
        id: `doi-${Date.now()}`,
        title: `Example paper based on DOI: ${doiInput}`,
        authors: ['Simulated, Author', 'Tester, Example'],
        year: new Date().getFullYear(),
        source: 'Journal of Simulated Examples',
        doi: doiInput,
        sourceType: 'journalArticle',
        style: 'APA 7th',
        content: `Simulated, A., & Tester, E. (${new Date().getFullYear()}). Example paper based on DOI: ${doiInput}. Journal of Simulated Examples.`,
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      onImportComplete([mockCitation]);
      toast.success('Citation imported from DOI');
      setDoiInput('');
    } catch (error) {
      console.error('Error importing from DOI:', error);
      toast.error('Failed to import citation from DOI');
    } finally {
      setIsImporting(false);
    }
  };

  // Import from ISBN
  const handleISBNImport = async () => {
    if (!isbnInput.trim()) {
      toast.error('Please enter an ISBN');
      return;
    }

    setIsImporting(true);

    try {
      // In a real implementation, we would call OpenLibrary or similar API
      // For this example, we'll simulate the API call
      const mockCitation = {
        id: `isbn-${Date.now()}`,
        title: `Example book based on ISBN: ${isbnInput}`,
        authors: ['Simulated, Bookwriter', 'Example, Author'],
        year: new Date().getFullYear(),
        source: 'Example Publishers',
        isbn: isbnInput,
        sourceType: 'book',
        style: 'APA 7th',
        content: `Simulated, B., & Example, A. (${new Date().getFullYear()}). Example book based on ISBN: ${isbnInput}. Example Publishers.`,
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      onImportComplete([mockCitation]);
      toast.success('Citation imported from ISBN');
      setIsbnInput('');
    } catch (error) {
      console.error('Error importing from ISBN:', error);
      toast.error('Failed to import citation from ISBN');
    } finally {
      setIsImporting(false);
    }
  };

  // Confirm import of previewed citations
  const confirmImport = () => {
    if (importPreview.length === 0) return;

    onImportComplete(importPreview);
    toast.success(`Imported ${importPreview.length} citations successfully!`);
    setShowPreview(false);
    setImportPreview([]);
    setImportFile(null);
  };

  // Export citations
  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);

    try {
      // In a real implementation, this would fetch the user's citations from the database
      // For this example, we'll simulate an export
      let content = '';
      const filename = `thesis-citations-${new Date().toISOString().slice(0, 10)}`;

      switch (format) {
        case 'bibtex':
          content = `@misc{example_key,
  title={Example Citation},
  author={Example, Author},
  year={${new Date().getFullYear()}},
  doi={10.1000/example.doi}
}\n`;
          break;
        case 'ris':
          content = `TY  - GEN
TI  - Example Citation
AU  - Example, Author
PY  - ${new Date().getFullYear()}
DO  - 10.1000/example.doi
ER  - \n`;
          break;
        case 'csv':
          content = `Title,Author,Year,DOI\n"Example Citation","Example, Author",${new Date().getFullYear()},"10.1000/example.doi"\n`;
          break;
        case 'docx':
          // Would require a library like docx to generate actual Word document
          content = `Thesis Citations\n\n1. Example, A. (${new Date().getFullYear()}). Example Citation. DOI: 10.1000/example.doi\n`;
          break;
        case 'txt':
          content = `Reference List:\n\nExample, A. (${new Date().getFullYear()}). Example Citation. DOI: 10.1000/example.doi\n\n`;
          break;
        default:
          content = `Exported at ${new Date().toISOString()}\nFormat: ${format}\n\nNo content available in demo.`;
      }

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.${format === 'docx' ? 'docx' : 'txt'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Citations exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting citations:', error);
      toast.error('Failed to export citations');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Citations
          </CardTitle>
          <CardDescription>
            Bring your research from other tools and databases into ThesisAI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Import Method Selection */}
            <div className="flex flex-wrap gap-4">
              <Button
                variant={importMethod === 'file' ? 'default' : 'outline'}
                onClick={() => setImportMethod('file')}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                From File
              </Button>
              <Button
                variant={importMethod === 'doi' ? 'default' : 'outline'}
                onClick={() => setImportMethod('doi')}
                className="gap-2"
              >
                <Globe className="h-4 w-4" />
                From DOI
              </Button>
              <Button
                variant={importMethod === 'isbn' ? 'default' : 'outline'}
                onClick={() => setImportMethod('isbn')}
                className="gap-2"
              >
                <BookOpen className="h-4 w-4" />
                From ISBN
              </Button>
              <Button
                variant={importMethod === 'manual' ? 'default' : 'outline'}
                onClick={() => setImportMethod('manual')}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Manual Entry
              </Button>
            </div>

            {/* Import Method Content */}
            <div className="space-y-4">
              {importMethod === 'file' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="import-format">File Format</Label>
                      <Select value={importFormat} onValueChange={(val) => setImportFormat(val as ImportFormat)}>
                        <SelectTrigger id="import-format">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bibtex">BibTeX (.bib)</SelectItem>
                          <SelectItem value="ris">RIS (.ris)</SelectItem>
                          <SelectItem value="endnote">EndNote (.enw)</SelectItem>
                          <SelectItem value="csv">CSV (.csv)</SelectItem>
                          <SelectItem value="zotero">Zotero RDF (.rdf)</SelectItem>
                          <SelectItem value="mendeley">Mendeley Export</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="import-file">Select File</Label>
                      <div className="flex gap-2">
                        <Input
                          id="import-file"
                          type="file"
                          accept=".bib,.ris,.enw,.rdf,.csv"
                          onChange={handleFileChange}
                          className="flex-1"
                          disabled={isImporting}
                        />
                        <Button type="button" onClick={triggerFileInput} variant="outline">
                          Browse
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={handleFileImport} 
                      disabled={!importFile || isImporting}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {isImporting ? 'Importing...' : 'Import Citations'}
                    </Button>
                  </div>

                  {isImporting && (
                    <div className="space-y-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                          style={{ width: `${importProgress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Importing citations... {importProgress}%
                      </p>
                    </div>
                  )}
                </div>
              )}

              {importMethod === 'doi' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="doi">DOI (Digital Object Identifier)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="doi"
                        placeholder="e.g., 10.1000/example.doi"
                        value={doiInput}
                        onChange={(e) => setDoiInput(e.target.value)}
                      />
                      <Button onClick={handleDOIImport} disabled={isImporting}>
                        <Globe className="h-4 w-4 mr-2" />
                        Import
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Enter the DOI (e.g., 10.1000/example.doi) to import citation details
                    </p>
                  </div>
                </div>
              )}

              {importMethod === 'isbn' && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="isbn">ISBN (International Standard Book Number)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="isbn"
                        placeholder="e.g., 978-0-123456-78-9"
                        value={isbnInput}
                        onChange={(e) => setIsbnInput(e.target.value)}
                      />
                      <Button onClick={handleISBNImport} disabled={isImporting}>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Import
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Enter the ISBN (e.g., 978-0-123456-78-9) to import book details
                    </p>
                  </div>
                </div>
              )}

              {importMethod === 'manual' && (
                <div className="space-y-4">
                  <Alert>
                    <ScanSearch className="h-4 w-4" />
                    <AlertDescription>
                      For manual citation entry, please use the main Citation Manager interface.
                      This section is for importing from existing sources.
                    </AlertDescription>
                  </Alert>
                  <div className="flex justify-end">
                    <Button variant="outline" onClick={() => setImportMethod('file')}>
                      Go to Import from File
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Import Preview */}
      {showPreview && importPreview.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Import Preview
              </span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={confirmImport} className="gap-2">
                  <Check className="h-4 w-4 mr-2" />
                  Confirm Import
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              Review {importPreview.length} citations before importing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {importPreview.map((citation, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium">{citation.title || 'Untitled'}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">
                          {citation.authors?.join(', ') || 'Unknown Author'}
                        </span>
                        {citation.year && (
                          <Badge variant="secondary">{citation.year}</Badge>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline">
                      {importFormat.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Citations
          </CardTitle>
          <CardDescription>
            Export your citation library in various formats for use in other tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              onClick={() => handleExport('bibtex')}
              disabled={isExporting}
              className="flex flex-col items-center gap-2 p-4"
            >
              <FileText className="h-6 w-6" />
              <span>BibTeX</span>
              <span className="text-xs text-muted-foreground">.bib</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleExport('ris')}
              disabled={isExporting}
              className="flex flex-col items-center gap-2 p-4"
            >
              <FileText className="h-6 w-6" />
              <span>RIS</span>
              <span className="text-xs text-muted-foreground">.ris</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleExport('docx')}
              disabled={isExporting}
              className="flex flex-col items-center gap-2 p-4"
            >
              <FileText className="h-6 w-6" />
              <span>Word</span>
              <span className="text-xs text-muted-foreground">.docx</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => handleExport('txt')}
              disabled={isExporting}
              className="flex flex-col items-center gap-2 p-4"
            >
              <FileText className="h-6 w-6" />
              <span>Plain Text</span>
              <span className="text-xs text-muted-foreground">.txt</span>
            </Button>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button 
              variant="outline" 
              onClick={() => handleExport('csv')}
              disabled={isExporting}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export All as CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".bib,.ris,.enw,.rdf,.csv"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default CitationImportExport;