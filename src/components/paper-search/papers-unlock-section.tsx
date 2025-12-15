"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, Search, FileText, Unlock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SciHubUnlockButton } from '@/components/scihub-unlock-button';
import { extractDOIFromPaper } from '@/lib/scihub-integration';
import { toast } from 'sonner';

import { Paper } from '@/types/paper';

interface PapersUnlockProps {
  papers: Paper[];
  isLoading?: boolean;
  query?: string;
  totalResults?: number;
}

export function PapersUnlockSection({
  papers,
  isLoading = false,
  query = '',
  totalResults = 0,
}: PapersUnlockProps) {
  const [searchFilter, setSearchFilter] = useState('');
  const [unlockedPapers, setUnlockedPapers] = useState<Set<string>>(new Set());
  const [manualDOIs, setManualDOIs] = useState<Record<string, string>>({});

  const getTitle = (paper: Paper): string => {
    return String(paper?.title || 'Untitled');
  };

  const getPaperLink = (paper: Paper): string => {
    // Priority: metadata.url > metadata.pdfUrl > DOI link > default
    if (paper?.metadata?.url) return paper.metadata.url;
    if (paper?.metadata?.pdfUrl) return paper.metadata.pdfUrl;
    if (paper?.sourceIds?.doi) return `https://doi.org/${paper.sourceIds.doi}`;
    if (paper?.sourceIds?.arxivId) return `https://arxiv.org/abs/${paper.sourceIds.arxivId}`;
    return '#';
  };

  const getPublicationInfo = (paper: Paper): string => {
    const parts = [];
    if (paper?.venue) parts.push(paper.venue);
    if (paper?.year) parts.push(paper.year.toString());
    return parts.join(', ');
  };

  const getSnippet = (paper: Paper): string => {
    return String(paper?.abstract || paper?.s2Tldr || paper?.generatedSummary || 'No description available');
  };

  const filteredPapers = papers.filter((paper) => {
    const titleStr = getTitle(paper).toLowerCase();
    const pubInfoStr = getPublicationInfo(paper).toLowerCase();
    return titleStr.includes(searchFilter.toLowerCase()) || pubInfoStr.includes(searchFilter.toLowerCase());
  });

  const papersWithDOI = filteredPapers.filter((paper) => {
    const autoDOI = extractDOIFromPaper(paper);
    const manualDOI = manualDOIs[paper.id];
    return autoDOI || manualDOI;
  });
  
  const papersWithoutDOI = filteredPapers.filter((paper) => {
    const autoDOI = extractDOIFromPaper(paper);
    const manualDOI = manualDOIs[paper.id];
    return !autoDOI && !manualDOI;
  });

  const getDOIForPaper = (paper: any): string | null => {
    return manualDOIs[paper.id] || extractDOIFromPaper(paper);
  };

  const handleUnlockSuccess = (paperId: string) => {
    setUnlockedPapers((prev) => new Set([...prev, paperId]));
    toast.success('PDF unlocked successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold">Unlock Paywalled Papers</h2>
            <p className="text-muted-foreground mt-1">
              Access paywalled research papers via Sci-Hub when legal sources are unavailable
            </p>
          </div>
          <Badge variant="outline" className="text-base px-3 py-1">
            {papersWithDOI.length} unlockable
          </Badge>
        </div>
      </div>

      {/* Legal Notice Alert */}
      <Alert className="border-amber-300 bg-amber-50 text-amber-900">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertDescription>
          <strong>Legal Notice:</strong> Sci-Hub access is unofficial and may violate copyright laws in some jurisdictions. 
          Always prefer open-access sources like ArXiv, PubMed Central, or publisher repositories first. 
          Use only for personal, non-commercial research.
        </AlertDescription>
      </Alert>

      {/* Tabs for different views */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            All Papers ({filteredPapers.length})
          </TabsTrigger>
          <TabsTrigger value="unlockable" className="flex items-center gap-2">
            <Unlock className="h-4 w-4" />
            Unlockable ({papersWithDOI.length})
          </TabsTrigger>
          <TabsTrigger value="no-doi" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            No DOI ({papersWithoutDOI.length})
          </TabsTrigger>
        </TabsList>

        {/* All Papers Tab */}
        <TabsContent value="all" className="mt-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter papers by title or source..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-10"
            />
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="pt-8 text-center text-muted-foreground">
                Loading papers...
              </CardContent>
            </Card>
          ) : filteredPapers.length === 0 ? (
            <Card>
              <CardContent className="pt-8 text-center">
                <p className="text-muted-foreground">No papers to display</p>
                {query && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Try searching for different papers
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[600px] border rounded-lg">
              <div className="p-4 space-y-3">
                {filteredPapers.map((paper) => {
                  const doi = extractDOIFromPaper(paper);
                  const isUnlocked = unlockedPapers.has(paper.id);

                  return (
                    <Card key={paper.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base line-clamp-2">
                              {getTitle(paper)}
                            </CardTitle>
                            {getPublicationInfo(paper) && (
                              <CardDescription className="mt-1">
                                {getPublicationInfo(paper)}
                              </CardDescription>
                            )}
                          </div>
                          {isUnlocked && (
                            <Badge className="flex-shrink-0 bg-green-600">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Unlocked
                            </Badge>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="pb-3">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {getSnippet(paper)}
                        </p>
                        {doi && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">DOI:</span>
                            <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                              {doi}
                            </code>
                          </div>
                        )}
                      </CardContent>

                      <CardFooter className="gap-2 flex-wrap pt-0">
                        <a href={getPaperLink(paper)} target="_blank" rel="noopener noreferrer" className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            View Source
                          </Button>
                        </a>
                        {doi ? (
                          <SciHubUnlockButton
                            paper={paper}
                            variant="default"
                            size="sm"
                            onSuccess={() => handleUnlockSuccess(paper.id)}
                          />
                        ) : (
                          <Button variant="ghost" size="sm" disabled className="opacity-50">
                            No DOI
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        {/* Unlockable Papers Tab */}
        <TabsContent value="unlockable" className="mt-6 space-y-4">
          {papersWithDOI.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No papers with DOI found. Papers without DOI cannot be unlocked via Sci-Hub.
              </AlertDescription>
            </Alert>
          ) : (
            <ScrollArea className="h-[600px] border rounded-lg">
              <div className="p-4 space-y-3">
                {papersWithDOI.map((paper) => {
                  const doi = extractDOIFromPaper(paper);
                  const isUnlocked = unlockedPapers.has(paper.id);

                  return (
                    <Card key={paper.id} className={isUnlocked ? 'border-green-300 bg-green-50' : ''}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base line-clamp-2">
                              {getTitle(paper)}
                            </CardTitle>
                            {getPublicationInfo(paper) && (
                              <CardDescription className="mt-1">
                                {getPublicationInfo(paper)}
                              </CardDescription>
                            )}
                          </div>
                          {isUnlocked && (
                            <Badge className="flex-shrink-0 bg-green-600">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Unlocked
                            </Badge>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="pb-3">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {getSnippet(paper)}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs font-semibold text-muted-foreground">DOI:</span>
                          <code className="text-xs bg-blue-100 px-2 py-1 rounded font-mono text-blue-900">
                            {doi}
                          </code>
                        </div>
                      </CardContent>

                      <CardFooter className="gap-2 flex-wrap pt-0">
                        <a href={getPaperLink(paper)} target="_blank" rel="noopener noreferrer" className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            View Source
                          </Button>
                        </a>
                        <SciHubUnlockButton
                          paper={paper}
                          variant="default"
                          size="sm"
                          onSuccess={() => handleUnlockSuccess(paper.id)}
                        />
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </TabsContent>

        {/* No DOI Tab */}
        <TabsContent value="no-doi" className="mt-6 space-y-4">
          {papersWithoutDOI.length === 0 ? (
            <Alert>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                All papers in your search have DOI! Ready to unlock.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <Alert className="bg-blue-50 border-blue-300 text-blue-900">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  These papers don't have DOI metadata. You can enter DOI manually if you know it, 
                  search through other sources, or request from the authors.
                </AlertDescription>
              </Alert>

              <ScrollArea className="h-[500px] border rounded-lg">
                <div className="p-4 space-y-3">
                  {papersWithoutDOI.map((paper) => (
                    <Card key={paper.id} className="opacity-75">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base line-clamp-2">
                          {getTitle(paper)}
                        </CardTitle>
                        {getPublicationInfo(paper) && (
                          <CardDescription className="mt-1">
                            {getPublicationInfo(paper)}
                          </CardDescription>
                        )}
                      </CardHeader>

                      <CardContent className="pb-3 space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {getSnippet(paper)}
                        </p>
                        
                        {!manualDOIs[paper.id] && (
                          <div className="space-y-2 bg-amber-50 p-3 rounded border border-amber-200">
                            <label className="text-xs font-semibold text-amber-900">
                              Have the DOI? Enter it:
                            </label>
                            <div className="flex gap-2">
                              <Input
                                placeholder="e.g., 10.1038/nature12373"
                                defaultValue=""
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && e.currentTarget.value) {
                                    setManualDOIs((prev) => ({
                                      ...prev,
                                      [paper.id]: e.currentTarget.value.trim(),
                                    }));
                                    e.currentTarget.value = '';
                                  }
                                }}
                                className="text-xs h-8"
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  const input = (e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement);
                                  if (input && input.value) {
                                    setManualDOIs((prev) => ({
                                      ...prev,
                                      [paper.id]: input.value.trim(),
                                    }));
                                    input.value = '';
                                  }
                                }}
                                className="h-8 px-2"
                              >
                                Add
                              </Button>
                            </div>
                          </div>
                        )}

                        {manualDOIs[paper.id] && (
                          <div className="bg-green-50 p-2 rounded border border-green-200">
                            <p className="text-xs font-semibold text-green-900">DOI added:</p>
                            <code className="text-xs bg-green-100 px-1.5 py-0.5 rounded text-green-900 font-mono block mt-1 break-all">
                              {manualDOIs[paper.id]}
                            </code>
                          </div>
                        )}
                      </CardContent>

                      <CardFooter className="gap-2 flex-wrap pt-0">
                        {manualDOIs[paper.id] ? (
                          <>
                            <SciHubUnlockButton 
                              paper={paper} 
                              doi={manualDOIs[paper.id]}
                              variant="default" 
                              size="sm"
                              onSuccess={() => handleUnlockSuccess(paper.id)}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setManualDOIs((prev) => {
                                  const newDOIs = { ...prev };
                                  delete newDOIs[paper.id];
                                  return newDOIs;
                                });
                              }}
                            >
                              Clear
                            </Button>
                          </>
                        ) : (
                          <a href={getPaperLink(paper)} target="_blank" rel="noopener noreferrer" className="w-full">
                            <Button variant="outline" size="sm" className="w-full">
                              Try Searching Manually
                            </Button>
                          </a>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Footer Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Unlockable Papers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{papersWithDOI.length}</div>
            <p className="text-xs text-muted-foreground mt-1">have DOI for unlock</p>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 border-amber-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Already Unlocked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{unlockedPapers.size}</div>
            <p className="text-xs text-muted-foreground mt-1">papers unlocked this session</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-50 border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Need Manual Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-600">{papersWithoutDOI.length}</div>
            <p className="text-xs text-muted-foreground mt-1">papers without DOI</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
