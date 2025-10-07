"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Badge } from './ui/badge';
import { Loader2, CheckCircle, AlertTriangle, ExternalLink, History, Download, RefreshCw, Quote, Save, Library, Globe } from 'lucide-react';
import { useAuth } from './auth-provider';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from './ui/skeleton';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import Link from 'next/link';
import { UpgradePrompt } from './upgrade-prompt';
import { cn } from '../lib/utils';

const MINIMUM_WORD_COUNT = 20;

// Web Check Types
type MatchSource = { url: string; title: string; };
type Match = { sentence: string; sources: MatchSource[]; };
type WebOriginalityResult = { score: number; totalSentences: number; matchedSentences: number; matches: Match[]; wordCount: number; };
type CheckHistoryItem = { id: string; plagiarism_percent: number; word_count: number; created_at: string; };

// Internal Check Types
type InternalMatch = { documentId: string; title: string; similarity: number; };
type InternalOriginalityResult = { highestScore: number; matches: InternalMatch[]; };

export function OriginalityChecker() {
  const { session, supabase, profile } = useAuth();
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // State for Web Check
  const [webResults, setWebResults] = useState<WebOriginalityResult | null>(null);
  const [history, setHistory] = useState<CheckHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isCiting, setIsCiting] = useState<number | null>(null);
  const [citationResults, setCitationResults] = useState<{ [key: number]: { inText: string; reference: string } }>({});
  const [isSavingCitation, setIsSavingCitation] = useState<number | null>(null);

  // State for Internal Check
  const [internalResults, setInternalResults] = useState<InternalOriginalityResult | null>(null);

  const wordCount = inputText.split(/\s+/).filter(word => word.length > 0).length;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchHistory = useCallback(async () => {
    if (!session) return;
    setIsLoadingHistory(true);
    const { data, error } = await supabase.rpc('get_user_check_history', { p_limit: 5 });
    if (error) {
      toast.error("Failed to load check history.");
    } else {
      setHistory(data || []);
    }
    setIsLoadingHistory(false);
  }, [session, supabase]);

  useEffect(() => {
    if (profile?.plan !== 'free') {
      fetchHistory();
    } else {
      setIsLoadingHistory(false);
    }
  }, [fetchHistory, profile]);

  const handleCheck = async (checkType: 'web' | 'internal') => {
    if (wordCount < MINIMUM_WORD_COUNT) {
      setError(`Text must be at least ${MINIMUM_WORD_COUNT} words long.`);
      return;
    }
    if (!session) {
      setError("You must be logged in to perform this check.");
      return;
    }

    setIsLoading(true);
    setError('');
    setWebResults(null);
    setInternalResults(null);

    try {
      const functionName = checkType === 'web' ? 'check-plagiarism' : 'check-internal-plagiarism';
      const { data, error: functionError } = await supabase.functions.invoke(functionName, {
        body: { text: inputText }
      });
      
      if (functionError) throw new Error(functionError.message);
      if (data.error) throw new Error(data.error);

      if (checkType === 'web') {
        setWebResults(data);
        await fetchHistory();
      } else {
        setInternalResults(data);
      }
      toast.success(`Originality check (${checkType}) complete!`);

    } catch (err: any) {
      const errorMessage = err.message || 'An unknown error occurred.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewCheck = () => {
    setWebResults(null);
    setInternalResults(null);
    setError('');
  };

  const handleExportPdf = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(reportRef.current, { cacheBust: true, backgroundColor: 'white', pixelRatio: 2 });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const img = new Image();
      img.src = dataUrl;
      img.onload = () => {
        const imgWidth = img.width;
        const imgHeight = img.height;
        const ratio = imgWidth / imgHeight;
        const finalHeight = pdfWidth / ratio;
        pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, finalHeight);
        pdf.save('originality_report.pdf');
        toast.success("Report downloaded successfully!");
        setIsExporting(false);
      };
    } catch (err) {
      toast.error("Failed to download report.");
      setIsExporting(false);
    }
  };

  const handleSuggestCitation = async (match: Match, index: number) => {
    if (!session) return;
    const source = match.sources[0];
    if (!source) return;
    setIsCiting(index);
    try {
        const { data, error: functionError } = await supabase.functions.invoke('generate-citation-from-source', { body: { sentence: match.sentence, sourceUrl: source.url } });
        if (functionError) throw new Error(functionError.message);
        if (data.error) throw new Error(data.error);
        setCitationResults(prev => ({ ...prev, [index]: data }));
        toast.success("Citation suggestion generated!");
    } catch (err: any) {
        toast.error(err.message || "Failed to generate citation.");
    } finally {
        setIsCiting(null);
    }
  };

  const handleSaveCitation = async (reference: string, index: number) => {
    if (!session) return;
    setIsSavingCitation(index);
    const { error } = await supabase.from('citations').insert({ user_id: session.user.id, content: reference, style: 'APA 7th Edition' });
    if (error) {
        toast.error("Failed to save citation.");
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

  const getScoreIcon = (score: number) => {
    if (score < 10) return <CheckCircle className="w-5 h-5 text-green-600" />;
    return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
  };

  const matchedWords = webResults ? webResults.matches.reduce((sum, m) => sum + m.sentence.split(' ').length, 0) : 0;

  const hasResults = webResults || internalResults;

  if (profile?.plan === 'free') {
    return (
      <div className="max-w-4xl mx-auto">
        <UpgradePrompt 
          featureName="Unlimited Originality Checks"
          description="The Pro plan gives you unlimited access to our powerful originality checker to ensure your work is always plagiarism-free."
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Originality Checker</CardTitle>
          <CardDescription>Check your text for potential plagiarism against web sources or your own saved documents.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasResults ? (
            <div>
              <Textarea value={inputText} readOnly className="min-h-[200px] resize-y" />
            </div>
          ) : (
            <div>
              <Textarea id="text-input" placeholder="Paste your text here..." value={inputText} onChange={(e) => setInputText(e.target.value)} className="min-h-[200px] resize-y" disabled={isLoading} />
              <p className="text-sm text-muted-foreground mt-1">Word count: {wordCount} (minimum {MINIMUM_WORD_COUNT})</p>
            </div>
          )}

          {error && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

          {hasResults ? (
            <Button onClick={handleNewCheck} variant="outline" className="w-full" size="lg"><RefreshCw className="mr-2 h-4 w-4" />Start New Check</Button>
          ) : (
            <Tabs defaultValue="web" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="web"><Globe className="w-4 h-4 mr-2" />Web Check</TabsTrigger>
                <TabsTrigger value="internal"><Library className="w-4 h-4 mr-2" />Internal Check</TabsTrigger>
              </TabsList>
              <TabsContent value="web">
                <Button onClick={() => handleCheck('web')} disabled={isLoading || wordCount < MINIMUM_WORD_COUNT} className="w-full mt-4" size="lg">
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Checking Web...</> : 'Check for Originality on the Web'}
                </Button>
              </TabsContent>
              <TabsContent value="internal">
                <Button onClick={() => handleCheck('internal')} disabled={isLoading || wordCount < MINIMUM_WORD_COUNT} className="w-full mt-4" size="lg">
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Checking Internally...</> : 'Check Against My Saved Drafts'}
                </Button>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {webResults && (
        <Card ref={reportRef}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">{getScoreIcon(webResults.score)}Web Originality Report</CardTitle>
              <Button variant="outline" size="sm" onClick={handleExportPdf} disabled={isExporting}>{isExporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}Download Report</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className={`p-6 rounded-lg border-2 ${getScoreColor(webResults.score)}`}>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{webResults.score}%</div>
                <div className="text-lg font-medium mb-2">Similarity Detected</div>
                <div className="text-sm opacity-80">{matchedWords} of {webResults.wordCount} words found in {webResults.matchedSentences} potentially similar sentences.</div>
              </div>
            </div>
            {webResults.matches && webResults.matches.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Potential Matches Found</h3>
                <Accordion type="single" collapsible className="w-full max-h-[600px] overflow-y-auto pr-2">
                  {webResults.matches.map((match, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left"><div className="flex items-start gap-2 flex-1"><Badge variant="destructive" className="mt-1 flex-shrink-0">Match {index + 1}</Badge><span className="text-sm line-clamp-2">&quot;{match.sentence}&quot;</span></div></AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 pt-2">
                          <div className="p-3 bg-destructive/10 border-l-4 border-destructive rounded"><p className="text-sm font-medium">Matched Text:</p><p className="text-sm mt-1">&quot;{match.sentence}&quot;</p></div>
                          <div>
                            <p className="text-sm font-medium mb-2">Found in these sources:</p>
                            <div className="space-y-2">{match.sources.map((source, sourceIndex) => (<div key={sourceIndex} className="flex items-center gap-2 p-2 bg-muted/50 rounded"><ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" /><a href={source.url} target="_blank" rel="noopener noreferrer" className="text-primary underline text-sm flex-1 truncate">{source.title || source.url}</a></div>))}</div>
                          </div>
                          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                            <Button variant="outline" size="sm" onClick={() => handleSuggestCitation(match, index)} disabled={isCiting === index}>{isCiting === index ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Quote className="w-4 h-4 mr-2" />}Suggest Citation (APA 7th)</Button>
                            {citationResults[index] && (<div className="mt-3 space-y-2 text-xs font-mono"><div><p className="font-sans text-sm font-medium text-foreground mb-1">In-Text Citation:</p><p className="p-2 bg-background rounded border">{citationResults[index].inText}</p></div><div><p className="font-sans text-sm font-medium text-foreground mb-1">Reference List Entry:</p><p className="p-2 bg-background rounded border">{citationResults[index].reference}</p></div><Button variant="default" size="sm" className="mt-2" onClick={() => handleSaveCitation(citationResults[index].reference, index)} disabled={isSavingCitation === index}>{isSavingCitation === index ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}Save to Bibliography</Button></div>)}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {internalResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">{getScoreIcon(internalResults.highestScore)}Internal Similarity Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`p-6 rounded-lg border-2 ${getScoreColor(internalResults.highestScore)}`}>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">{internalResults.highestScore}%</div>
                <div className="text-lg font-medium mb-2">Highest Similarity Found</div>
                <div className="text-sm opacity-80">This is the highest match found against another document in your drafts.</div>
              </div>
            </div>
            {internalResults.matches.length > 0 ? (
              <Table>
                <TableHeader><TableRow><TableHead>Similar Document</TableHead><TableHead className="text-right">Similarity</TableHead></TableRow></TableHeader>
                <TableBody>
                  {internalResults.matches.map(match => (
                    <TableRow key={match.documentId}>
                      <TableCell><Link href={`/drafts/${match.documentId}`} className="text-primary underline font-medium">{match.title}</Link></TableCell>
                      <TableCell className="text-right"><Badge variant="outline" className={getScoreBadgeColor(match.similarity)}>{match.similarity}%</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground">No significant internal similarity found.</p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3"><History className="w-5 h-5" />Recent Web Checks</CardTitle>
          <CardDescription>Your last 5 originality checks against the web.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Word Count</TableHead><TableHead className="text-right">Similarity</TableHead></TableRow></TableHeader>
            <TableBody>
              {isLoadingHistory ? (Array.from({ length: 3 }).map((_, i) => (<TableRow key={i}><TableCell><Skeleton className="h-5 w-24" /></TableCell><TableCell><Skeleton className="h-5 w-16" /></TableCell><TableCell className="text-right"><Skeleton className="h-6 w-12 ml-auto" /></TableCell></TableRow>))) : history.length > 0 ? (history.map(item => (<TableRow key={item.id}><TableCell>{isMounted && formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</TableCell><TableCell>{item.word_count}</TableCell><TableCell className="text-right"><Badge variant="outline" className={getScoreBadgeColor(item.plagiarism_percent)}>{item.plagiarism_percent}%</Badge></TableCell></TableRow>))) : (<TableRow><TableCell colSpan={3} className="text-center h-24">No check history yet.</TableCell></TableRow>)}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}