'use client';

import React, { useState, useEffect } from 'react';
import { Paper } from '@/types/paper';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PaperListView } from './paper-list-view';
import { PaperNetworkGraph } from './paper-network-graph';
import { searchCrossRef, searchSemanticScholar, searchOpenAlex } from '@/lib/academic-api-search';
import { Loader2, BookOpen, ArrowUpRight, ArrowDown, Users } from 'lucide-react';

interface PaperExplorationProps {
  paper: Paper;
  onPaperSelect: (paper: Paper) => void;
  className?: string;
}

export function PaperExploration({
  paper,
  onPaperSelect,
  className = ''
}: PaperExplorationProps) {
  const [activeTab, setActiveTab] = useState('similar');
  const [similarPapers, setSimilarPapers] = useState<Paper[]>([]);
  const [references, setReferences] = useState<Paper[]>([]);
  const [citedBy, setCitedBy] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState({
    similar: false,
    references: false,
    citedBy: false
  });
  const [error, setError] = useState<Record<string, string | null>>({
    similar: null,
    references: null,
    citedBy: null
  });

  // Fetch similar papers
  const fetchSimilarPapers = async () => {
    if (similarPapers.length > 0) return; // Already loaded
    
    setIsLoading(prev => ({ ...prev, similar: true }));
    setError(prev => ({ ...prev, similar: null }));
    
    try {
      // Search by title keywords or related topics
      // Handle the case where title might be an array
      let titleString = 'Untitled';
      if (paper.title) {
        if (Array.isArray(paper.title)) {
          titleString = paper.title[0] || 'Untitled';
        } else {
          titleString = paper.title;
        }
      }
      const keywords = titleString.split(' ').slice(0, 3).join(' ');
      const [crossrefResults, semanticResults, openalexResults] = await Promise.allSettled([
        searchCrossRef(keywords),
        searchSemanticScholar(keywords),
        searchOpenAlex(keywords)
      ]);

      const similar: Paper[] = [];
      
      if (crossrefResults.status === 'fulfilled') similar.push(...crossrefResults.value);
      if (semanticResults.status === 'fulfilled') similar.push(...semanticResults.value);
      if (openalexResults.status === 'fulfilled') similar.push(...openalexResults.value);

      // Remove the original paper and limit results
      const filtered = similar
        .filter(p => p.id !== paper.id)
        .slice(0, 20);

      setSimilarPapers(filtered);
    } catch (err) {
      setError(prev => ({ 
        ...prev, 
        similar: err instanceof Error ? err.message : 'Failed to load similar papers' 
      }));
    } finally {
      setIsLoading(prev => ({ ...prev, similar: false }));
    }
  };

  // Fetch references (backward citations)
  const fetchReferences = async () => {
    if (references.length > 0) return; // Already loaded
    
    setIsLoading(prev => ({ ...prev, references: true }));
    setError(prev => ({ ...prev, references: null }));
    
    try {
      // In a real implementation, you'd fetch the reference list from the paper's metadata
      // For now, we'll search by related terms
      // Handle the case where title might be an array
      let titleString = 'Untitled';
      if (paper.title) {
        if (Array.isArray(paper.title)) {
          titleString = paper.title[0] || 'Untitled';
        } else {
          titleString = paper.title;
        }
      }
      const keywords = titleString.split(' ').slice(0, 3).join(' ') + ' reference';
      
      const [crossrefResults, semanticResults, openalexResults] = await Promise.allSettled([
        searchCrossRef(keywords),
        searchSemanticScholar(keywords),
        searchOpenAlex(keywords)
      ]);

      const refs: Paper[] = [];
      
      if (crossrefResults.status === 'fulfilled') refs.push(...crossrefResults.value);
      if (semanticResults.status === 'fulfilled') refs.push(...semanticResults.value);
      if (openalexResults.status === 'fulfilled') refs.push(...openalexResults.value);

      // Remove the original paper and limit results
      const filtered = refs
        .filter(p => p.id !== paper.id)
        .slice(0, 20);

      setReferences(filtered);
    } catch (err) {
      setError(prev => ({ 
        ...prev, 
        references: err instanceof Error ? err.message : 'Failed to load references' 
      }));
    } finally {
      setIsLoading(prev => ({ ...prev, references: false }));
    }
  };

  // Fetch cited-by papers (forward citations)
  const fetchCitedBy = async () => {
    if (citedBy.length > 0) return; // Already loaded
    
    setIsLoading(prev => ({ ...prev, citedBy: true }));
    setError(prev => ({ ...prev, citedBy: null }));
    
    try {
      // Search for papers that cite this one
      // In a real implementation, you'd use an API that provides citation data
      // Handle the case where title might be an array
      let titleString = 'Untitled';
      if (paper.title) {
        if (Array.isArray(paper.title)) {
          titleString = paper.title[0] || 'Untitled';
        } else {
          titleString = paper.title;
        }
      }
      const query = `citing "${titleString.substring(0, 50)}"`;
      
      const [crossrefResults, semanticResults, openalexResults] = await Promise.allSettled([
        searchCrossRef(query),
        searchSemanticScholar(query),
        searchOpenAlex(query)
      ]);

      const citing: Paper[] = [];
      
      if (crossrefResults.status === 'fulfilled') citing.push(...crossrefResults.value);
      if (semanticResults.status === 'fulfilled') citing.push(...semanticResults.value);
      if (openalexResults.status === 'fulfilled') citing.push(...openalexResults.value);

      // Remove the original paper and limit results
      const filtered = citing
        .filter(p => p.id !== paper.id)
        .slice(0, 20);

      setCitedBy(filtered);
    } catch (err) {
      setError(prev => ({ 
        ...prev, 
        citedBy: err instanceof Error ? err.message : 'Failed to load citing papers' 
      }));
    } finally {
      setIsLoading(prev => ({ ...prev, citedBy: false }));
    }
  };

  // Handle tab changes
  useEffect(() => {
    if (activeTab === 'similar' && similarPapers.length === 0) {
      fetchSimilarPapers();
    } else if (activeTab === 'references' && references.length === 0) {
      fetchReferences();
    } else if (activeTab === 'cited-by' && citedBy.length === 0) {
      fetchCitedBy();
    }
  }, [activeTab]);

  // Get the papers to display based on the active tab
  const getPapersForTab = () => {
    switch (activeTab) {
      case 'similar': return similarPapers;
      case 'references': return references;
      case 'cited-by': return citedBy;
      default: return [];
    }
  };

  const currentPapers = getPapersForTab();
  const currentLoading = isLoading[activeTab as keyof typeof isLoading];
  const currentError = error[activeTab as keyof typeof error];

  return (
    <div className={className}>
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="similar" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Similar
          </TabsTrigger>
          <TabsTrigger value="references" className="flex items-center gap-2">
            <ArrowDown className="h-4 w-4" />
            References
          </TabsTrigger>
          <TabsTrigger value="cited-by" className="flex items-center gap-2">
            <ArrowUpRight className="h-4 w-4" />
            Cited by
          </TabsTrigger>
        </TabsList>

        <TabsContent value="similar" className="mt-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Similar Papers</h3>
              <Badge variant="outline">{similarPapers.length} papers</Badge>
            </div>
            
            {currentLoading && (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}
            
            {currentError && (
              <div className="text-center py-4 text-red-500">
                Error loading similar papers: {currentError}
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mt-2"
                  onClick={fetchSimilarPapers}
                >
                  Retry
                </Button>
              </div>
            )}
            
            {!currentLoading && !currentError && (
              <PaperListView 
                papers={similarPapers}
                onPaperSelect={onPaperSelect}
                isLoading={false}
              />
            )}
          </Card>
        </TabsContent>

        <TabsContent value="references" className="mt-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">References</h3>
              <Badge variant="outline">{references.length} papers</Badge>
            </div>
            
            {currentLoading && (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}
            
            {currentError && (
              <div className="text-center py-4 text-red-500">
                Error loading references: {currentError}
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mt-2"
                  onClick={fetchReferences}
                >
                  Retry
                </Button>
              </div>
            )}
            
            {!currentLoading && !currentError && (
              <PaperListView 
                papers={references}
                onPaperSelect={onPaperSelect}
                isLoading={false}
              />
            )}
          </Card>
        </TabsContent>

        <TabsContent value="cited-by" className="mt-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Cited by</h3>
              <Badge variant="outline">{citedBy.length} papers</Badge>
            </div>
            
            {currentLoading && (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}
            
            {currentError && (
              <div className="text-center py-4 text-red-500">
                Error loading citing papers: {currentError}
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mt-2"
                  onClick={fetchCitedBy}
                >
                  Retry
                </Button>
              </div>
            )}
            
            {!currentLoading && !currentError && (
              <PaperListView 
                papers={citedBy}
                onPaperSelect={onPaperSelect}
                isLoading={false}
              />
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Network visualization for the current tab */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">Network Visualization</h3>
        <PaperNetworkGraph 
          papers={[paper, ...currentPapers]} 
          onPaperSelect={onPaperSelect}
          selectedPaper={paper}
        />
      </div>
    </div>
  );
}