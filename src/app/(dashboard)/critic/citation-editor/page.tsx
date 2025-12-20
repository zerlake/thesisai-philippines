'use client';

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { redirect } from "next/navigation";
import { BrandedLoader } from "@/components/branded-loader";
import { callPuterAI } from "@/lib/puter-ai-wrapper";
import {
  Quote,
  FileText,
  Loader2,
  Plus,
  Trash2,
  Copy,
  RefreshCw,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  Download,
  Search,
} from "lucide-react";
import { toast } from "sonner";

type CitationStyle = 'APA7' | 'MLA9' | 'Chicago' | 'Harvard' | 'IEEE' | 'Vancouver';

type Citation = {
  id: string;
  type: 'journal' | 'book' | 'website' | 'conference' | 'thesis' | 'other';
  authors: string;
  year: string;
  title: string;
  source: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
  accessDate?: string;
  formatted: {
    [key in CitationStyle]?: string;
  };
};

const citationTypes = [
  { value: 'journal', label: 'Journal Article' },
  { value: 'book', label: 'Book' },
  { value: 'website', label: 'Website' },
  { value: 'conference', label: 'Conference Paper' },
  { value: 'thesis', label: 'Thesis/Dissertation' },
  { value: 'other', label: 'Other' },
];

const citationStyles: { value: CitationStyle; label: string }[] = [
  { value: 'APA7', label: 'APA 7th Edition' },
  { value: 'MLA9', label: 'MLA 9th Edition' },
  { value: 'Chicago', label: 'Chicago Style' },
  { value: 'Harvard', label: 'Harvard Style' },
  { value: 'IEEE', label: 'IEEE Style' },
  { value: 'Vancouver', label: 'Vancouver Style' },
];

const sampleCitations = [
  {
    title: "Journal Article Set",
    citations: [
      {
        type: 'journal' as const,
        authors: 'Smith, John; Johnson, Mary',
        year: '2023',
        title: 'The Impact of Artificial Intelligence on Modern Healthcare Systems',
        source: 'Journal of Medical Informatics',
        volume: '45',
        issue: '3',
        pages: '234-256',
        doi: '10.1234/jmi.2023.45678',
      },
      {
        type: 'journal' as const,
        authors: 'Garcia, Maria; Chen, Wei; Williams, Robert',
        year: '2022',
        title: 'Machine Learning Applications in Clinical Decision Support',
        source: 'Healthcare Technology Review',
        volume: '12',
        issue: '2',
        pages: '89-112',
        doi: '10.5678/htr.2022.12345',
      },
    ]
  },
  {
    title: "Book References",
    citations: [
      {
        type: 'book' as const,
        authors: 'Creswell, John W.; Creswell, J. David',
        year: '2018',
        title: 'Research Design: Qualitative, Quantitative, and Mixed Methods Approaches',
        source: 'SAGE Publications',
        pages: '1-275',
      },
      {
        type: 'book' as const,
        authors: 'Patton, Michael Quinn',
        year: '2015',
        title: 'Qualitative Research & Evaluation Methods',
        source: 'SAGE Publications',
        pages: '1-832',
      },
    ]
  },
  {
    title: "Mixed Sources",
    citations: [
      {
        type: 'website' as const,
        authors: 'World Health Organization',
        year: '2024',
        title: 'Global Health Statistics Report',
        source: 'WHO Official Website',
        url: 'https://www.who.int/data/gho',
        accessDate: 'January 15, 2024',
      },
      {
        type: 'conference' as const,
        authors: 'Lee, Sarah; Park, James',
        year: '2023',
        title: 'Emerging Trends in Educational Technology',
        source: 'International Conference on Education and Technology',
        pages: '45-52',
      },
      {
        type: 'thesis' as const,
        authors: 'Rodriguez, Ana',
        year: '2022',
        title: 'Student Engagement in Online Learning Environments',
        source: 'University of California, Los Angeles',
      },
    ]
  }
];

export default function CitationEditorPage() {
  const authContext = useAuth();
  const [citations, setCitations] = useState<Citation[]>([]);
  const [currentStyle, setCurrentStyle] = useState<CitationStyle>('APA7');
  const [isGenerating, setIsGenerating] = useState(false);
  const [rawInput, setRawInput] = useState("");
  const [editingCitation, setEditingCitation] = useState<Citation | null>(null);
  const [showSampleMenu, setShowSampleMenu] = useState(false);
  const [isLoadingSamples, setIsLoadingSamples] = useState(false);

  // Form state for new/edit citation
  const [formData, setFormData] = useState({
    type: 'journal' as Citation['type'],
    authors: '',
    year: '',
    title: '',
    source: '',
    volume: '',
    issue: '',
    pages: '',
    doi: '',
    url: '',
    accessDate: '',
  });

  if (!authContext) {
    return <BrandedLoader />;
  }

  const { session, profile, isLoading } = authContext;

  if (!isLoading && (!session || profile?.role !== 'critic')) {
    redirect('/login');
  }

  if (isLoading) {
    return <BrandedLoader />;
  }

  const resetForm = () => {
    setFormData({
      type: 'journal',
      authors: '',
      year: '',
      title: '',
      source: '',
      volume: '',
      issue: '',
      pages: '',
      doi: '',
      url: '',
      accessDate: '',
    });
    setEditingCitation(null);
  };

  const loadSampleCitations = async (sampleSet: typeof sampleCitations[0]) => {
    setIsLoadingSamples(true);
    setShowSampleMenu(false);

    try {
      const newCitations: Citation[] = [];

      for (const citationData of sampleSet.citations) {
        const prompt = `Format this citation in all major academic styles:

Citation Details:
- Type: ${citationData.type}
- Authors: ${citationData.authors}
- Year: ${citationData.year}
- Title: ${citationData.title}
- Source/Journal/Publisher: ${citationData.source}
${citationData.volume ? `- Volume: ${citationData.volume}` : ''}
${citationData.issue ? `- Issue: ${citationData.issue}` : ''}
${citationData.pages ? `- Pages: ${citationData.pages}` : ''}
${citationData.doi ? `- DOI: ${citationData.doi}` : ''}
${citationData.url ? `- URL: ${citationData.url}` : ''}
${citationData.accessDate ? `- Access Date: ${citationData.accessDate}` : ''}

Respond in this exact JSON format (no markdown, just JSON):
{
  "APA7": "formatted citation in APA 7th edition",
  "MLA9": "formatted citation in MLA 9th edition",
  "Chicago": "formatted citation in Chicago style",
  "Harvard": "formatted citation in Harvard style",
  "IEEE": "formatted citation in IEEE style",
  "Vancouver": "formatted citation in Vancouver style"
}`;

        const response = await callPuterAI(prompt, { temperature: 0.2, max_tokens: 1000 });
        const jsonMatch = response.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
          const formatted = JSON.parse(jsonMatch[0]);
          newCitations.push({
            id: `citation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: citationData.type,
            authors: citationData.authors,
            year: citationData.year,
            title: citationData.title,
            source: citationData.source,
            volume: citationData.volume,
            issue: citationData.issue,
            pages: citationData.pages,
            doi: citationData.doi,
            url: citationData.url,
            accessDate: citationData.accessDate,
            formatted,
          });
        }
      }

      setCitations([...citations, ...newCitations]);
      toast.success(`Loaded ${newCitations.length} citations from "${sampleSet.title}"`);
    } catch (error) {
      console.error("Failed to load sample citations:", error);
      toast.error("Failed to load sample citations");
    } finally {
      setIsLoadingSamples(false);
    }
  };

  const handleAddCitation = async () => {
    if (!formData.authors || !formData.title || !formData.year) {
      toast.error("Please fill in required fields: Authors, Title, Year");
      return;
    }

    setIsGenerating(true);

    try {
      const prompt = `Format this citation in all major academic styles:

Citation Details:
- Type: ${formData.type}
- Authors: ${formData.authors}
- Year: ${formData.year}
- Title: ${formData.title}
- Source/Journal/Publisher: ${formData.source}
${formData.volume ? `- Volume: ${formData.volume}` : ''}
${formData.issue ? `- Issue: ${formData.issue}` : ''}
${formData.pages ? `- Pages: ${formData.pages}` : ''}
${formData.doi ? `- DOI: ${formData.doi}` : ''}
${formData.url ? `- URL: ${formData.url}` : ''}
${formData.accessDate ? `- Access Date: ${formData.accessDate}` : ''}

Respond in this exact JSON format (no markdown, just JSON):
{
  "APA7": "formatted citation in APA 7th edition",
  "MLA9": "formatted citation in MLA 9th edition",
  "Chicago": "formatted citation in Chicago style",
  "Harvard": "formatted citation in Harvard style",
  "IEEE": "formatted citation in IEEE style",
  "Vancouver": "formatted citation in Vancouver style"
}`;

      const response = await callPuterAI(prompt, { temperature: 0.2, max_tokens: 1000 });

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const formatted = JSON.parse(jsonMatch[0]);

        const newCitation: Citation = {
          id: editingCitation?.id || `citation_${Date.now()}`,
          ...formData,
          formatted,
        };

        if (editingCitation) {
          setCitations(citations.map(c => c.id === editingCitation.id ? newCitation : c));
          toast.success("Citation updated");
        } else {
          setCitations([...citations, newCitation]);
          toast.success("Citation added");
        }

        resetForm();
      } else {
        throw new Error("Could not parse response");
      }
    } catch (error) {
      console.error("Failed to format citation:", error);
      toast.error("Failed to format citation");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleParseRawCitation = async () => {
    if (!rawInput.trim()) {
      toast.error("Please enter a citation to parse");
      return;
    }

    setIsGenerating(true);

    try {
      const prompt = `Parse this citation and extract its components. Then format it in all major academic styles.

Raw citation:
"${rawInput}"

Respond in this exact JSON format (no markdown, just JSON):
{
  "parsed": {
    "type": "journal|book|website|conference|thesis|other",
    "authors": "author names",
    "year": "publication year",
    "title": "title of the work",
    "source": "journal name/publisher/website",
    "volume": "volume number or empty string",
    "issue": "issue number or empty string",
    "pages": "page range or empty string",
    "doi": "DOI or empty string",
    "url": "URL or empty string"
  },
  "formatted": {
    "APA7": "formatted citation",
    "MLA9": "formatted citation",
    "Chicago": "formatted citation",
    "Harvard": "formatted citation",
    "IEEE": "formatted citation",
    "Vancouver": "formatted citation"
  }
}`;

      const response = await callPuterAI(prompt, { temperature: 0.2, max_tokens: 1000 });

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);

        const newCitation: Citation = {
          id: `citation_${Date.now()}`,
          ...result.parsed,
          formatted: result.formatted,
        };

        setCitations([...citations, newCitation]);
        setRawInput("");
        toast.success("Citation parsed and added");
      } else {
        throw new Error("Could not parse response");
      }
    } catch (error) {
      console.error("Failed to parse citation:", error);
      toast.error("Failed to parse citation");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditCitation = (citation: Citation) => {
    setEditingCitation(citation);
    setFormData({
      type: citation.type,
      authors: citation.authors,
      year: citation.year,
      title: citation.title,
      source: citation.source,
      volume: citation.volume || '',
      issue: citation.issue || '',
      pages: citation.pages || '',
      doi: citation.doi || '',
      url: citation.url || '',
      accessDate: citation.accessDate || '',
    });
  };

  const handleDeleteCitation = (id: string) => {
    setCitations(citations.filter(c => c.id !== id));
    toast.success("Citation deleted");
  };

  const handleCopyCitation = (citation: Citation) => {
    const formatted = citation.formatted[currentStyle];
    if (formatted) {
      navigator.clipboard.writeText(formatted);
      toast.success("Citation copied to clipboard");
    }
  };

  const handleCopyAllCitations = () => {
    const allFormatted = citations
      .map(c => c.formatted[currentStyle])
      .filter(Boolean)
      .join('\n\n');

    navigator.clipboard.writeText(allFormatted);
    toast.success("All citations copied to clipboard");
  };

  const handleExportBibliography = () => {
    const bibliography = citations
      .map(c => c.formatted[currentStyle])
      .filter(Boolean)
      .join('\n\n');

    const blob = new Blob([bibliography], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bibliography_${currentStyle}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Bibliography exported");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Quote className="h-8 w-8" />
            Citation Editor
          </h1>
          <p className="text-muted-foreground">
            Create, format, and manage academic citations in multiple styles
          </p>
        </div>
        <DropdownMenu open={showSampleMenu} onOpenChange={setShowSampleMenu}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2" disabled={isLoadingSamples}>
              {isLoadingSamples ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <BookOpen className="h-4 w-4" />
                  Load Samples
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            {sampleCitations.map((sample, index) => (
              <DropdownMenuItem
                key={index}
                onClick={() => loadSampleCitations(sample)}
                className="cursor-pointer"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                {sample.title} ({sample.citations.length})
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Citation Input */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Add Citation</CardTitle>
            <CardDescription>
              Enter citation details manually or paste a raw citation to parse
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="manual" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                <TabsTrigger value="parse">Parse Citation</TabsTrigger>
              </TabsList>

              <TabsContent value="manual" className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value as Citation['type'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {citationTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Year *</Label>
                    <Input
                      placeholder="2024"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Authors * (Last, First; Last, First)</Label>
                  <Input
                    placeholder="Smith, John; Doe, Jane"
                    value={formData.authors}
                    onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    placeholder="Title of the work"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Source (Journal/Publisher/Website)</Label>
                  <Input
                    placeholder="Journal of Academic Research"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Volume</Label>
                    <Input
                      placeholder="12"
                      value={formData.volume}
                      onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Issue</Label>
                    <Input
                      placeholder="3"
                      value={formData.issue}
                      onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Pages</Label>
                    <Input
                      placeholder="45-67"
                      value={formData.pages}
                      onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>DOI</Label>
                    <Input
                      placeholder="10.1000/xyz123"
                      value={formData.doi}
                      onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>URL</Label>
                    <Input
                      placeholder="https://..."
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleAddCitation}
                    disabled={isGenerating}
                    className="flex-1"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Formatting...
                      </>
                    ) : editingCitation ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Update Citation
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Citation
                      </>
                    )}
                  </Button>
                  {editingCitation && (
                    <Button variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="parse" className="space-y-4">
                <div className="space-y-2">
                  <Label>Paste Raw Citation</Label>
                  <Textarea
                    placeholder="Paste a citation in any format and we'll parse it automatically...

Example: Smith, J., & Doe, J. (2024). Title of the article. Journal Name, 12(3), 45-67. https://doi.org/10.1000/xyz123"
                    value={rawInput}
                    onChange={(e) => setRawInput(e.target.value)}
                    className="min-h-[150px]"
                  />
                </div>
                <Button
                  onClick={handleParseRawCitation}
                  disabled={isGenerating || !rawInput.trim()}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Parsing...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Parse & Add Citation
                    </>
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Style Selector & Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Citation Style</CardTitle>
            <CardDescription>
              Select the format for your citations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              value={currentStyle}
              onValueChange={(value) => setCurrentStyle(value as CitationStyle)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {citationStyles.map(style => (
                  <SelectItem key={style.value} value={style.value}>
                    {style.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleCopyAllCitations}
                disabled={citations.length === 0}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy All Citations
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleExportBibliography}
                disabled={citations.length === 0}
              >
                <Download className="mr-2 h-4 w-4" />
                Export Bibliography
              </Button>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-4 w-4" />
                <span className="font-medium text-sm">Total Citations</span>
              </div>
              <div className="text-3xl font-bold">{citations.length}</div>
            </div>
          </CardContent>
        </Card>

        {/* Citations List */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Citations ({citations.length})</CardTitle>
            <CardDescription>
              Your formatted citations in {citationStyles.find(s => s.value === currentStyle)?.label}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {citations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Quote className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Citations Yet</h3>
                <p className="text-muted-foreground text-sm">
                  Add your first citation using the form above
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {citations.map((citation, index) => (
                    <div
                      key={citation.id}
                      className="p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{index + 1}</Badge>
                            <Badge className="bg-primary/10 text-primary border-primary/20">
                              {citation.type}
                            </Badge>
                          </div>
                          <p className="text-sm font-mono bg-muted/50 p-2 rounded">
                            {citation.formatted[currentStyle] || 'Formatting not available'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {citation.authors} ({citation.year})
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyCitation(citation)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCitation(citation)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCitation(citation.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
