// src/app/apps/literature-review-assistant/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  FileText, 
  Search, 
  Target, 
  Clock, 
  TrendingUp, 
  Layers, 
  Eye, 
  Filter,
  Plus,
  Trash2,
  Download,
  Upload,
  Database,
  Brain,
  Calendar,
  User,
  Quote,
  BookMarked,
  ListChecks,
  Tags
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function LiteratureReviewAssistantPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sources, setSources] = useState<any[]>([]);
  const [selectedSources, setSelectedSources] = useState<any[]>([]);
  const [reviewNotes, setReviewNotes] = useState('');
  const [thematicClusters, setThematicClusters] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('search');

  // Sample data for demonstration
  useEffect(() => {
    setSources([
      {
        id: '1',
        title: 'Machine Learning Approaches to Natural Language Processing',
        authors: ['Smith, J.', 'Johnson, K.', 'Williams, L.'],
        year: 2023,
        journal: 'Journal of AI Research',
        type: 'journal',
        relevance: 95,
        methodology: 'quantitative',
        sampleSize: 500,
        keyThemes: ['NLP', 'ML', 'algorithms'],
        summary: 'This paper examines contemporary approaches to applying machine learning in natural language processing tasks.',
        findings: 'Results show significant improvements in accuracy for complex parsing tasks.',
        quality: 'high',
        fullText: 'Full text content would be available here...'
      },
      {
        id: '2',
        title: 'Ethical Considerations in AI Research',
        authors: ['Chen, M.', 'Rodriguez, P.'],
        year: 2022,
        journal: 'Ethics in Technology',
        type: 'journal',
        relevance: 88,
        methodology: 'qualitative',
        sampleSize: null,
        keyThemes: ['ethics', 'AI', 'research'],
        summary: 'Addresses ethical frameworks for conducting AI research responsibly.',
        findings: 'Developed a comprehensive ethical decision-making model.',
        quality: 'high',
        fullText: 'Full text content would be available here...'
      },
      {
        id: '3',
        title: 'Thesis Writing Strategies for STEM Students',
        authors: ['Davis, R.', 'Miller, S.'],
        year: 2024,
        journal: 'Academic Writing Quarterly',
        type: 'journal',
        relevance: 92,
        methodology: 'mixed',
        sampleSize: 200,
        keyThemes: ['thesis', 'writing', 'strategy'],
        summary: 'Provides evidence-based strategies for effective thesis composition in STEM fields.',
        findings: 'Students using structured approaches showed 30% better outcomes.',
        quality: 'high',
        fullText: 'Full text content would be available here...'
      },
      {
        id: '4',
        title: 'Collaborative Research in Distributed Teams',
        authors: ['Thompson, A.', 'Lee, C.', 'Garcia, D.', 'Wilson, E.'],
        year: 2023,
        journal: 'Remote Research Methods',
        type: 'journal',
        relevance: 75,
        methodology: 'case-study',
        sampleSize: 30,
        keyThemes: ['collaboration', 'remote', 'teams'],
        summary: 'Examines challenges and best practices for distributed research teams.',
        findings: 'Clear communication protocols improve team cohesion significantly.',
        quality: 'medium',
        fullText: 'Full text content would be available here...'
      }
    ]);
  }, []);

  const handleSearch = () => {
    // In a real implementation, this would call an API
    // For now, we'll just filter the sample data
    if (searchQuery.trim() === '') {
      setSources([
        // ... sample data as above
      ]);
    } else {
      // Filter based on search query
      const filtered = sources.filter(source => 
        source.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        source.authors.some((author: string) => 
          author.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        source.keyThemes.some((theme: string) => 
          theme.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setSources(filtered);
    }
  };

  const handleAddSource = (source: any) => {
    if (!selectedSources.some(s => s.id === source.id)) {
      setSelectedSources([...selectedSources, source]);
    }
  };

  const handleRemoveSource = (id: string) => {
    setSelectedSources(selectedSources.filter(s => s.id !== id));
  };

  const generateLiteratureSynthesis = () => {
    // In a real implementation, this would call an AI service to generate synthesis
    // For now, we'll return a sample synthesis
    return `Based on the ${selectedSources.length} selected sources, the literature review reveals several key themes:

1. **Methodology Approaches**: Studies predominantly utilize ${selectedSources.filter(s => s.methodology === 'quantitative').length} quantitative approaches, with ${selectedSources.filter(s => s.methodology === 'qualitative').length} taking qualitative approaches and ${selectedSources.filter(s => s.methodology === 'mixed').length} using mixed methods.

2. **Key Themes Identified**: The most prevalent themes across literature include ${Array.from(new Set(selectedSources.flatMap(s => s.keyThemes))).join(', ')}.

3. **Sample Characteristics**: Studies vary in size, with ${selectedSources.filter(s => s.sampleSize && s.sampleSize > 100).length} using large samples (>100) and ${selectedSources.filter(s => !s.sampleSize || s.sampleSize < 100).length} using smaller samples.

4. **Quality Assessment**: Of the selected sources, ${selectedSources.filter(s => s.quality === 'high').length} are of high quality, ${selectedSources.filter(s => s.quality === 'medium').length} of medium quality, and ${selectedSources.filter(s => s.quality === 'low').length} of lower quality.`;
  };

  const generateThematicClusters = () => {
    // Group sources by key themes
    const allThemes = selectedSources.flatMap(s => s.keyThemes);
    const uniqueThemes = [...new Set(allThemes)];
    
    const clusters = uniqueThemes.map(theme => ({
      theme,
      sources: selectedSources.filter(s => s.keyThemes.includes(theme))
    }));
    
    setThematicClusters(clusters);
  };

  const handleExport = () => {
    // Export the current literature review state
    const exportData = {
      selectedSources,
      reviewNotes,
      thematicClusters,
      generatedSynthesis: generateLiteratureSynthesis(),
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `literature-review-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Literature Review Assistant</h1>
          <p className="text-muted-foreground">
            Organize and analyze your research sources for comprehensive literature reviews
          </p>
        </div>

        <Tabs defaultValue="search" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-[700px]">
            <TabsTrigger value="search">Search Sources</TabsTrigger>
            <TabsTrigger value="organization">Organization</TabsTrigger>
            <TabsTrigger value="synthesis">Synthesis</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search Research Sources
                </CardTitle>
                <CardDescription>
                  Find and evaluate research papers relevant to your thesis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Search by topic, author, or keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleSearch}>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>

                <div className="space-y-4">
                  {sources.map((source) => (
                    <Card key={source.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold truncate">{source.title}</h3>
                              <Badge variant={source.type === 'journal' ? 'default' : 'secondary'}>
                                {source.type}
                              </Badge>
                              <Badge variant="outline">{source.year}</Badge>
                              <Badge className={source.relevance > 85 ? 'bg-green-100 text-green-800' : source.relevance > 70 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                                {source.relevance}% relevance
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              {source.authors.join(', ')}
                            </p>
                            <p className="text-sm text-muted-foreground mb-2">
                              Published in: {source.journal}
                              {source.sampleSize && `, Sample: ${source.sampleSize}`}
                            </p>
                            <p className="text-sm mb-2 line-clamp-2">{source.summary}</p>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {source.keyThemes.map((theme: string, idx: number) => (
                                <Badge key={idx} variant="secondary">{theme}</Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleAddSource(source)}
                              disabled={selectedSources.some(s => s.id === source.id)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="organization" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Selected Sources ({selectedSources.length})
                </CardTitle>
                <CardDescription>
                  Review and manage the sources you've selected for your literature review
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedSources.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No sources selected yet. Search and add sources to begin organizing your review.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedSources.map((source) => (
                      <Card key={source.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold truncate">{source.title}</h3>
                                <Badge variant={source.type === 'journal' ? 'default' : 'secondary'}>
                                  {source.type}
                                </Badge>
                                <Badge variant="outline">{source.year}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {source.authors.join(', ')}
                              </p>
                              <div className="grid grid-cols-2 gap-4 mb-3">
                                <div>
                                  <p className="text-xs text-muted-foreground">Methodology</p>
                                  <p className="text-sm font-medium capitalize">{source.methodology}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Sample Size</p>
                                  <p className="text-sm font-medium">{source.sampleSize || 'N/A'}</p>
                                </div>
                              </div>
                              <p className="text-sm mb-3">{source.summary}</p>
                              <div className="flex flex-wrap gap-1 mb-3">
                                {source.keyThemes.map((theme: string, idx: number) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">{theme}</Badge>
                                ))}
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">Quality:</span>
                                  <Badge variant={source.quality === 'high' ? 'default' : source.quality === 'medium' ? 'secondary' : 'outline'}>
                                    {source.quality}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleRemoveSource(source.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedSources.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Review Notes
                  </CardTitle>
                  <CardDescription>
                    Add your thoughts and observations about the selected sources
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Add your analysis, connections between sources, or notes about how this fits into your thesis..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={6}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="synthesis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Literature Synthesis
                </CardTitle>
                <CardDescription>
                  AI-generated synthesis of your selected sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedSources.length > 0 ? (
                  <div className="space-y-6">
                    <div className="bg-muted p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Generated Synthesis</h4>
                      <p className="whitespace-pre-line">{generateLiteratureSynthesis()}</p>
                    </div>

                    <Button onClick={generateThematicClusters} className="w-full">
                      <Layers className="h-4 w-4 mr-2" />
                      Generate Thematic Clusters
                    </Button>

                    {thematicClusters.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-medium">Thematic Clusters</h4>
                        {thematicClusters.map((cluster, idx) => (
                          <Card key={idx}>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2 text-base">
                                <Tags className="h-4 w-4" />
                                {cluster.theme} ({cluster.sources.length} sources)
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                {cluster.sources.map((source: { id: string; title: string; authors: string[] }) => (
                                  <div key={source.id} className="text-sm p-2 bg-secondary rounded">
                                    {source.title} - {source.authors[0]}
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookMarked className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select sources to generate synthesis and thematic clusters</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Literature Analysis
                </CardTitle>
                <CardDescription>
                  In-depth analysis of your selected sources
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedSources.length > 0 ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold">{selectedSources.length}</div>
                        <div className="text-sm text-muted-foreground">Total Sources</div>
                      </div>
                      <div className="border rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold">
                          {selectedSources.filter(s => s.quality === 'high').length}
                        </div>
                        <div className="text-sm text-muted-foreground">High-Quality Sources</div>
                      </div>
                      <div className="border rounded-lg p-4 text-center">
                        <div className="text-2xl font-bold">
                          {[...new Set(selectedSources.flatMap(s => s.keyThemes))].length}
                        </div>
                        <div className="text-sm text-muted-foreground">Unique Themes</div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Methodology Distribution</h4>
                      <div className="space-y-2">
                        {['quantitative', 'qualitative', 'mixed', 'case-study'].map(method => {
                          const count = selectedSources.filter(s => s.methodology === method).length;
                          if (count === 0) return null;
                          
                          return (
                            <div key={method} className="flex items-center">
                              <span className="w-32 text-sm capitalize">{method}</span>
                              <Progress value={(count / selectedSources.length) * 100} className="flex-1 mx-2" />
                              <span className="w-8 text-sm">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-3">Top Themes</h4>
                      <div className="flex flex-wrap gap-2">
                        {Array.from(
                          new Set(selectedSources.flatMap(s => s.keyThemes))
                        ).map(theme => {
                          const count = selectedSources.filter(s => 
                            s.keyThemes.includes(theme)
                          ).length;
                          
                          return (
                            <Badge key={theme} variant="outline" className="flex items-center">
                              <span>{theme}</span>
                              <span className="ml-1 text-xs bg-muted rounded-full px-1">{count}</span>
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <ListChecks className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select sources to view analysis</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Export Literature Review
                </CardTitle>
                <CardDescription>
                  Export your organized literature review in various formats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="outline" size="lg" className="flex flex-col h-32" onClick={handleExport}>
                      <Database className="h-8 w-8 mb-2" />
                      <span>JSON Data</span>
                      <span className="text-xs text-muted-foreground">Full data export</span>
                    </Button>
                    <Button variant="outline" size="lg" className="flex flex-col h-32">
                      <FileText className="h-8 w-8 mb-2" />
                      <span>PDF Report</span>
                      <span className="text-xs text-muted-foreground">Formatted document</span>
                    </Button>
                    <Button variant="outline" size="lg" className="flex flex-col h-32">
                      <Quote className="h-8 w-8 mb-2" />
                      <span>BibTeX</span>
                      <span className="text-xs text-muted-foreground">For LaTeX documents</span>
                    </Button>
                  </div>

                  <div className="pt-4">
                    <h4 className="font-medium mb-2">Export Preview</h4>
                    <div className="border rounded-lg p-4 bg-muted">
                      <p className="text-sm">
                        Selected: {selectedSources.length} sources<br/>
                        Themes: {[...new Set(selectedSources.flatMap(s => s.keyThemes))].length} unique<br/>
                        Last updated: {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}