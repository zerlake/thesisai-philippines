'use client';

import React, { useState, useEffect } from 'react';
import { usePaperSearch, usePaperCollection } from '@/hooks/usePaperSearch';
import { PaperSearchBar } from './paper-search-bar';
import { PaperListView } from './paper-list-view';
import { PaperMapView } from './paper-map-view';
import { PaperExploration } from './paper-exploration';
import { CollectionWorkspace } from './collection-workspace';
import { AuthorNetworkGraph } from './author-network-graph';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Grid3x3, List, Download, Zap, Sparkles, Network, FolderTree, Search, Users } from 'lucide-react';
import { Paper } from '@/types/paper';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { generateSamplePapers } from '@/lib/sample-papers-data';
import { callPuterAI } from '@/lib/puter-ai-wrapper';
import { loadPuterSDK } from '@/lib/puter-sdk';
import { ensurePuterAuth } from '@/lib/puter-sdk';
import { openPaper } from '@/lib/paper-open-handler';

type ViewMode = 'list' | 'map';

export function FindPapersPage() {
  const {
    papers,
    totalResults,
    isLoading,
    error,
    query,
    hasSearched,
    search,
    debouncedSearch,
    setPapers,
  } = usePaperSearch({ debounceMs: 500 });

  const {
    collection,
    favorites,
    addToCollection,
    toggleFavorite,
  } = usePaperCollection();

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPaper, setSelectedPaper] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [isGeneratingQuery, setIsGeneratingQuery] = useState(false);
  const [puterReady, setPuterReady] = useState(false);
  const [explorationMode, setExplorationMode] = useState<'search' | 'network' | 'authors' | 'collections'>('search');
  const [collections, setCollections] = useState<any[]>([]);
  const [currentCollection, setCurrentCollection] = useState<string | null>(null);
  const [explorationPaper, setExplorationPaper] = useState<Paper | null>(null);

  // Function to explore a paper in detail
  const explorePaperInDetail = (paper: Paper) => {
    setExplorationPaper(paper);
    setExplorationMode('network'); // Switch to network view by default
  };

  // Initialize Puter SDK
  useEffect(() => {
    const initPuter = async () => {
      try {
        await loadPuterSDK();
        setPuterReady(true);
      } catch (error) {
        console.error('Failed to load Puter SDK:', error);
        setPuterReady(false);
      }
    };
    initPuter();
  }, []);

  const handleSearch = (searchQuery: string) => {
    setSearchInput(searchQuery);
    search(searchQuery);
  };

  const handleAISearch = (aiResults: any) => {
    // AI search returns PaperSearchResult with papers array
    setSearchInput(aiResults.query);
    // Set the papers directly from AI results
    if (aiResults.papers && aiResults.papers.length > 0) {
      setPapers(aiResults.papers, aiResults.query);
    }
  };

  const handleGenerateSearchQuery = async () => {
    if (!puterReady) {
      toast.error('Puter AI is not ready. Please try again.');
      return;
    }

    setIsGeneratingQuery(true);
    try {
      await ensurePuterAuth();

      const prompt = `Generate a research paper search query. I'm looking for papers on academic writing, thesis research, or educational methodology.

Please provide just ONE specific search query that would find relevant research papers. Make it detailed enough to be useful for a research database search.

Format: Just the search query, nothing else.`;

      const result = await callPuterAI(prompt, {
        temperature: 0.7,
        max_tokens: 100,
      });

      setSearchInput(result.trim());
      search(result.trim());
      toast.success('Search query generated with Puter AI');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to generate search query:', error);
      toast.error(`Failed to generate query: ${errorMsg}`);
    } finally {
      setIsGeneratingQuery(false);
    }
  };



  const handlePaperSelect = (paper: Paper) => {
    openPaper(paper, (message) => toast.error(message));
  };

  const handleDownloadPDF = (paperId: string) => {
    const paper = papers.find((p) => p.id === paperId);
    if (!paper) return;

    openPaper(paper, (message) => toast.error(message));
  };

  const handleExportCollection = () => {
    const csv = [
      ['Title', 'Authors', 'Year', 'Citation Count', 'Sources', 'DOI'].join(','),
      ...collection.map((p) =>
        [
          `"${p.title}"`,
          `"${p.authors.map((a) => a.name).join('; ')}"`,
          p.year || '',
          p.metadata.citationCount || '',
          p.sources.join(';'),
          p.sourceIds.doi || '',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thesis-papers-${Date.now()}.csv`;
    a.click();
  };

  const handleLoadSampleData = () => {
    const samplePapers = generateSamplePapers(10);
    setSearchInput('Sample Papers');
    toast.success(`Loaded ${samplePapers.length} sample papers`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/10 py-8">
      <div className="container mx-auto space-y-8 px-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">Find Research Papers</h1>
            <p className="text-lg text-muted-foreground">
              Search across CrossRef, ArXiv, OpenAlex, and Semantic Scholar
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <PaperSearchBar
          onSearch={handleSearch}
          onAISearch={handleAISearch}
          isLoading={isLoading}
          value={searchInput}
          onChange={setSearchInput}
        />

        <div className="grid gap-8 lg:grid-cols-4">
          {/* Results */}
          <div className="space-y-4 lg:col-span-4">
            {/* Main Navigation Tabs */}
            <Tabs
              value={explorationMode}
              onValueChange={(value) => setExplorationMode(value as typeof explorationMode)}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="search" className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Search Results
                </TabsTrigger>
                <TabsTrigger value="network" className="flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  Network Map
                </TabsTrigger>
                <TabsTrigger value="authors" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Author Network
                </TabsTrigger>
                <TabsTrigger value="collections" className="flex items-center gap-2">
                  <FolderTree className="h-4 w-4" />
                  Collections
                </TabsTrigger>
              </TabsList>

              {/* Search Results Tab */}
              <TabsContent value="search" className="mt-4 space-y-4">
                {/* Results Header */}
                {hasSearched && (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {isLoading ? 'Searching...' : `Found ${totalResults} papers`}
                      </p>
                      {query && (
                        <p className="text-xs text-muted-foreground">
                          for "{query}"
                        </p>
                      )}
                    </div>
                    {collection.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {collection.length} saved
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleExportCollection}
                          className="gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Export
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* View Mode Tabs */}
                {papers.length > 0 && (
                  <Tabs
                    value={viewMode}
                    onValueChange={(value) => setViewMode(value as ViewMode)}
                  >
                    <TabsList>
                      <TabsTrigger value="list" className="gap-2">
                        <List className="h-4 w-4" />
                        List View
                      </TabsTrigger>
                      <TabsTrigger value="map" className="gap-2">
                        <Grid3x3 className="h-4 w-4" />
                        Network Map
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="list" className="mt-4">
                      <PaperListView
                        papers={papers}
                        isLoading={isLoading}
                        onPaperSelect={handlePaperSelect}
                        onFavoriteToggle={toggleFavorite}
                        favorites={favorites}
                        onDownloadPDF={(paper) => handleDownloadPDF(paper.id)}
                      />
                    </TabsContent>

                    <TabsContent value="map" className="mt-4">
                      <PaperMapView
                        papers={papers}
                        isLoading={isLoading}
                        onPaperSelect={handlePaperSelect}
                        selectedPaperId={selectedPaper || undefined}
                      />
                    </TabsContent>
                  </Tabs>
                )}

                {/* Empty State */}
                {!isLoading && !error && hasSearched && papers.length === 0 && (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">
                      No papers found. Try different search terms or adjust filters.
                    </p>
                  </Card>
                )}

                {/* Initial State */}
                {!hasSearched && (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">
                      Start by entering a search query above
                    </p>
                  </Card>
                )}
              </TabsContent>

              {/* Network Visualization Tab */}
              <TabsContent value="network" className="mt-4">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Paper Network Visualization</h3>
                  <PaperMapView
                    papers={papers}
                    isLoading={isLoading}
                    onPaperSelect={handlePaperSelect}
                    selectedPaperId={selectedPaper || undefined}
                  />
                </div>
              </TabsContent>

              {/* Author Network Tab */}
              <TabsContent value="authors" className="mt-4">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Author Collaboration Network</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Visualize how researchers in your field collaborate and connect
                      </p>
                    </div>
                  </div>

                  {/* Help Card */}
                  {papers.length > 0 && (
                    <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 p-4">
                      <div className="flex gap-3">
                        <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="space-y-2 text-sm">
                          <p className="font-medium text-blue-900 dark:text-blue-100">
                            How to use this network:
                          </p>
                          <ul className="space-y-1 text-blue-800 dark:text-blue-200 text-xs ml-2 list-disc">
                            <li><strong>Hover over nodes</strong> to see author details and papers</li>
                            <li><strong>Click nodes</strong> to select authors and see their papers</li>
                            <li><strong>Node size</strong> = number of papers; <strong>Color</strong> = collaboration count</li>
                            <li><strong>Lines</strong> show co-authorship relationships</li>
                            <li>Use <strong>Zoom/Pan controls</strong> to explore different parts of the network</li>
                          </ul>
                        </div>
                      </div>
                    </Card>
                  )}

                  <AuthorNetworkGraph
                    papers={papers}
                    onAuthorSelect={(authorName, authorPapers) => {
                      toast.info(`Selected author: ${authorName} (${authorPapers.length} papers)`);
                    }}
                  />
                </div>
              </TabsContent>

              {/* Collections Tab */}
              <TabsContent value="collections" className="mt-4">
                <CollectionWorkspace
                  collections={collections}
                  onCollectionsChange={setCollections}
                  papers={papers}
                  onPaperSelect={handlePaperSelect}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
