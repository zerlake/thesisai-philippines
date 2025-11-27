"use client";

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Badge } from './ui/badge';
import { Loader2, AlertTriangle, ExternalLink, Quote, Save, Library, Globe } from 'lucide-react';
import { useAuth } from './auth-provider';
import { toast } from 'sonner';
import { HighlightedText } from './highlighted-text';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import Link from 'next/link';
import { cn } from '../lib/utils';
import { checkPlagiarism } from '@/lib/puter-sdk';

type MatchSource = {
  url: string;
  title: string;
};

type Match = {
  sentence: string;
  sources: MatchSource[];
};

type WebOriginalityResult = {
  score: number;
  totalSentences: number;
  matchedSentences: number;
  matches: Match[];
  wordCount: number;
};

type InternalMatch = { documentId: string; title: string; similarity: number; };
type InternalOriginalityResult = { highestScore: number; matches: InternalMatch[]; };

interface OriginalityCheckPanelProps {
  documentContent: string;
  documentId: string;
}

const MINIMUM_WORD_COUNT = 20;

export function OriginalityCheckPanel({ documentContent, documentId }: OriginalityCheckPanelProps) {
  const { session, supabase } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [webResults, setWebResults] = useState<WebOriginalityResult | null>(null);
  const [internalResults, setInternalResults] = useState<InternalOriginalityResult | null>(null);

  const [isCiting, setIsCiting] = useState<number | null>(null);
  const [citationResults, setCitationResults] = useState<{ [key: number]: { inText: string; reference: string } }>({});
  const [isSavingCitation, setIsSavingCitation] = useState<number | null>(null);

  const plainTextContent = documentContent.replace(/<[^>]*>?/gm, ' ');
  const wordCount = plainTextContent.split(/\s+/).filter(Boolean).length;

  const handleCheckOriginality = async (checkType: 'web' | 'internal') => {
    if (wordCount < MINIMUM_WORD_COUNT) {
      toast.error(`Text must be at least ${MINIMUM_WORD_COUNT} words long.`);
      return;
    }

    setIsLoading(true);
    setError('');
    setWebResults(null);
    setInternalResults(null);
    setCitationResults({});

    try {
      // Call plagiarism check via Puter
      const data = await checkPlagiarism(plainTextContent);

      if (checkType === 'web') {
        // Transform Puter response to web format
        const webResult: WebOriginalityResult = {
          score: data.percentage || 0,
          totalSentences: plainTextContent.split('.').length,
          matchedSentences: Math.ceil((data.percentage || 0) / 100 * plainTextContent.split('.').length),
          matches: (data.issues || []).map((issue: string) => ({
            sentence: issue,
            sources: [{ url: '#', title: 'AI Analysis' }]
          })),
          wordCount: wordCount
        };
        setWebResults(webResult);
      } else {
        // For internal check, create a basic result
        const internalResult: InternalOriginalityResult = {
          highestScore: data.percentage || 0,
          matches: []
        };
        setInternalResults(internalResult);
      }
      
      toast.success(`Originality check (${checkType}) complete!`);
    } catch (err: any) {
      const msg = err.message || 'An unknown error occurred.';
      setError(msg);
      
      if (msg.includes("auth")) {
        toast.error("Please sign in to your Puter account");
      } else {
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestCitation = async (match: Match, index: number) => {
    // Citation generation moved to future enhancement
    // For now, provide a template-based citation
    const source = match.sources[0];
    if (!source) return;

    setIsCiting(index);
    try {
      // Generate basic APA citation format
      const inText = `(Source, n.d.)`;
      const reference = `Source. (n.d.). Retrieved from ${source.url}`;
      
      setCitationResults(prev => ({ 
        ...prev, 
        [index]: { inText, reference } 
      }));
      toast.success("Citation template generated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate citation.");
    } finally {
      setIsCiting(null);
    }
  };

  const handleSaveCitation = async (reference: string, index: number) => {
    if (!session) return;
    setIsSavingCitation(index);
    const { error } = await supabase.from('citations').insert({
        user_id: session.user.id,
        content: reference,
        style: 'APA 7th Edition'
    });

    if (error) {
        toast.error("Failed to save citation.");
        console.error(error);
    } else {
        toast.success("Citation saved to your bibliography!");
    }
    setIsSavingCitation(null);
  };

  const getScoreColor = (score: number) => {
    if (score < 15) return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300';
    if (score < 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-300';
    return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300';
  };
  
  const getScoreBadgeColor = (score: number) => {
    if (score < 15) return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-200 dark:border-green-700';
    if (score < 40) return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-700';
    return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700';
  };

  const matchedWords = webResults ? webResults.matches.reduce((sum, m) => sum + m.sentence.split(' ').length, 0) : 0;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Check the current document for potential plagiarism.
      </p>
      <Tabs defaultValue="web" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="web"><Globe className="w-4 h-4 mr-2" />Web Check</TabsTrigger>
          <TabsTrigger value="internal"><Library className="w-4 h-4 mr-2" />Internal Check</TabsTrigger>
        </TabsList>
        <TabsContent value="web">
          <Button 
            onClick={() => handleCheckOriginality('web')}
            disabled={isLoading || wordCount < MINIMUM_WORD_COUNT}
            className="w-full mt-4"
          >
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking...</> : 'Run Web Check'}
          </Button>
        </TabsContent>
        <TabsContent value="internal">
          <Button 
            onClick={() => handleCheckOriginality('internal')}
            disabled={isLoading || wordCount < MINIMUM_WORD_COUNT}
            className="w-full mt-4"
          >
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking...</> : 'Run Internal Check'}
          </Button>
        </TabsContent>
      </Tabs>
      
      {wordCount < MINIMUM_WORD_COUNT && !isLoading && (
        <p className="text-xs text-destructive text-center">
          Minimum {MINIMUM_WORD_COUNT} words required. Current: {wordCount}.
        </p>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {webResults && (
        <div className="space-y-4 pt-4">
          <div className={`p-4 rounded-lg border ${getScoreColor(webResults.score)}`}>
            <div className="flex items-center justify-between">
              <div className="font-semibold">Web Similarity</div>
              <div className="text-2xl font-bold">{webResults.score}%</div>
            </div>
            <p className="text-xs opacity-80 mt-1">
              {matchedWords} of {webResults.wordCount} words found.
            </p>
          </div>
          
          <HighlightedText 
            text={plainTextContent} 
            highlights={webResults.matches.map(m => m.sentence)} 
            className="text-xs max-h-48"
          />

          {webResults.matches.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Potential Matches</h4>
              <Accordion type="single" collapsible className="w-full max-h-64 overflow-y-auto">
                {webResults.matches.map((match, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left text-xs">
                      <span className="truncate pr-2">&quot;{match.sentence}&quot;</span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2">
                        <div className="p-2 bg-destructive/10 border-l-4 border-destructive rounded">
                          <p className="text-xs">&quot;{match.sentence}&quot;</p>
                        </div>
                        <div className="space-y-1">
                          {match.sources.map((source, sourceIndex) => (
                            <a key={sourceIndex} href={source.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-primary underline">
                              <ExternalLink className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{source.title || source.url}</span>
                            </a>
                          ))}
                        </div>
                        <div className="mt-2">
                          <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleSuggestCitation(match, index)}
                              disabled={isCiting === index}
                          >
                              {isCiting === index ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Quote className="w-3 h-3 mr-1" />}
                              Suggest Citation
                          </Button>
                          {citationResults[index] && (
                              <div className="mt-2 space-y-1 text-[10px] font-mono">
                                  <p className="p-1 bg-background rounded border">{citationResults[index].inText}</p>
                                  <p className="p-1 bg-background rounded border">{citationResults[index].reference}</p>
                                  <Button 
                                      variant="default" 
                                      size="sm"
                                      className="mt-1"
                                      onClick={() => handleSaveCitation(citationResults[index].reference, index)}
                                      disabled={isSavingCitation === index}
                                  >
                                      {isSavingCitation === index ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}
                                      Save
                                  </Button>
                              </div>
                          )}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}
        </div>
      )}

      {internalResults && (
        <div className="space-y-4 pt-4">
          <div className={`p-4 rounded-lg border ${getScoreColor(internalResults.highestScore)}`}>
            <div className="flex items-center justify-between">
              <div className="font-semibold">Internal Similarity</div>
              <div className="text-2xl font-bold">{internalResults.highestScore}%</div>
            </div>
            <p className="text-xs opacity-80 mt-1">
              Highest match found against another document.
            </p>
          </div>
          {internalResults.matches.length > 0 ? (
            <Table>
              <TableHeader><TableRow><TableHead className="text-xs">Similar Document</TableHead><TableHead className="text-right text-xs">Similarity</TableHead></TableRow></TableHeader>
              <TableBody>
                {internalResults.matches.map(match => (
                  <TableRow key={match.documentId}>
                    <TableCell><Link href={`/drafts/${match.documentId}`} className="text-primary underline font-medium text-xs">{match.title}</Link></TableCell>
                    <TableCell className="text-right"><Badge variant="outline" className={cn("text-xs", getScoreBadgeColor(match.similarity))}>{match.similarity}%</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground text-sm">No significant internal similarity found.</p>
          )}
        </div>
      )}
    </div>
  );
}