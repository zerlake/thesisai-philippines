"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Badge } from './ui/badge';
import { Loader2, CheckCircle, AlertTriangle, ExternalLink, History, Download, RefreshCw, Quote, Save, Library, Globe, ArrowUpRight, FilePlus2, Search, Sparkles } from 'lucide-react';
import { useAuth } from './auth-provider';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from './ui/skeleton';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import Link from 'next/link';
import { cn } from '../lib/utils';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { useRouter } from 'next/navigation';
import { Paper } from '../types';
import { SemanticScholarApi, CoreApi, CrossrefApi, OpenAlexApi } from '../lib/academic-apis';

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function LiteratureReview() {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [papers, setPapers] = useState<Paper[]>([]);
  const lastRequestTime = useRef<number>(0);
  const [selectedPapers, setSelectedPapers] = useState<Paper[]>([]);
  const [synthesizedText, setSynthesizedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("arxiv");
  
  // Initialize API clients
  const apiClients = {
    'semantic-scholar': new SemanticScholarApi(),
    'core': new CoreApi(),
    'crossref': new CrossrefApi(),
    'openalex': new OpenAlexApi()
  };

  const handleSearch = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!topic) {
      toast.error("Please enter a search topic");
      return;
    }

    setIsLoading(true);
    setPapers([]);
    setSelectedPapers([]);
    setSynthesizedText("");

    try {
      if (!session) {
        throw new Error("Authentication session not found. Please log in again.");
      }

      // Rate limiting
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTime.current;
      if (timeSinceLastRequest < 3000) {
        await delay(3000 - timeSinceLastRequest);
      }
      
      let results: Paper[] = [];
      
      if (activeTab === 'arxiv') {
        // Existing arXiv search
        const query = encodeURIComponent(topic);
        const apiUrl = `https://export.arxiv.org/api/query?search_query=all:${query}&start=0&max_results=10&sortBy=relevance`;
        
        lastRequestTime.current = Date.now();
        const arxivResponse = await fetch(apiUrl, {
          headers: {
            'Accept': 'application/xml',
          },
          mode: 'cors'
        });
        
        if (!arxivResponse.ok) {
          throw new Error(`arXiv API request failed with status ${arxivResponse.status}`);
        }
        
        const arxivData = await arxivResponse.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(arxivData, "text/xml");
        const entries = xmlDoc.getElementsByTagName("entry");
        
        if (entries.length === 0) {
          throw new Error("No papers found matching your search criteria.");
        }

        results = Array.from(entries).map((entry) => {
          const id = entry.getElementsByTagName("id")[0]?.textContent || "";
          const arxivId = id.split("/abs/")[1] || id;
          return {
            id: arxivId,
            title: entry.getElementsByTagName("title")[0]?.textContent?.trim() || "Untitled",
            link: `https://arxiv.org/abs/${arxivId}`,
            publication_info: entry.getElementsByTagName("published")[0]?.textContent || "",
            snippet: entry.getElementsByTagName("summary")[0]?.textContent?.trim() || "No abstract available",
            source: 'arxiv'
          };
        });
      } else {
        // Use the selected alternative source
        const api = apiClients[activeTab as keyof typeof apiClients];
        if (!api) {
          throw new Error("Selected source is not available.");
        }
        results = await api.search(topic);
      }
      
      setPapers(results);
    } catch (error: any) {
      console.error("Search failed:", error);
      setPapers([]);
      
      if (error.message === "Failed to fetch") {
        toast.error("Unable to connect to the search service. Please try again later.");
      } else {
        toast.error(`Search failed: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaperSelection = (paper: Paper, isSelected: boolean) => {
    if (isSelected) {
      setSelectedPapers([...selectedPapers, paper]);
    } else {
      setSelectedPapers(selectedPapers.filter(p => p.id !== paper.id));
    }
  };

  const handleSynthesize = async () => {
    if (selectedPapers.length < 2) {
      toast.info("Please select at least two sources to synthesize.");
      return;
    }
    if (!session) {
      toast.error("You must be logged in to synthesize sources.");
      return;
    }
    setIsSynthesizing(true);
    setSynthesizedText("");
    try {
      const response = await fetch(
        "https://dnyjgzzfyzrsucucexhy.supabase.co/functions/v1/synthesize-literature",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ papers: selectedPapers.map(p => ({ title: p.title, snippet: p.snippet })) }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setSynthesizedText(data.synthesizedText);
      toast.success("Synthesis complete!");
    } catch (error: any) {
      toast.error(error.message || "Failed to synthesize sources.");
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleSaveAsDraft = async () => {
    if (!user || papers.length === 0 || !topic) return;
    setIsSaving(true);

    let content = `<h2>Literature Review Research for: ${topic}</h2>`;
    
    if (synthesizedText) {
      content += `<h3>AI-Generated Synthesis</h3><p>${synthesizedText}</p>`;
    }

    content += "<h3>Found Sources</h3>";
    papers.forEach(p => {
      content += `<hr>`;
      content += `<h4><a href="${p.link}" target="_blank" rel="noopener noreferrer">${p.title}</a></h4>`;
      if (p.publication_info) {
        content += `<p><strong>Source:</strong> ${p.publication_info}</p>`;
      }
      content += `<p><strong>Snippet:</strong> ${p.snippet}</p>`;
    });

    const { data: newDoc, error } = await supabase
      .from("documents")
      .insert({ user_id: user.id, title: `Research: ${topic}`, content })
      .select("id").single();

    if (error) {
      toast.error("Failed to save draft.");
    } else if (newDoc) {
      toast.success("Research saved successfully!");
      router.push(`/drafts/${newDoc.id}`);
    }
    setIsSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Chapter II: Literature Review Helper</CardTitle>
          <CardDescription>Search for sources, then select at least two to generate a synthesized paragraph.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="arxiv">arXiv</TabsTrigger>
              <TabsTrigger value="semantic-scholar">Semantic Scholar</TabsTrigger>
              <TabsTrigger value="core">CORE</TabsTrigger>
              <TabsTrigger value="crossref">Crossref</TabsTrigger>
              <TabsTrigger value="openalex">OpenAlex</TabsTrigger>
            </TabsList>
          </Tabs>
          <form onSubmit={handleSearch} className="flex items-center gap-2 mt-4">
            <Input id="topic" placeholder="e.g., Transformer architecture in NLP" value={topic} onChange={(e) => setTopic(e.target.value)} disabled={isLoading} />
            <Button type="submit" disabled={isLoading || !topic || !session}><Search className="w-4 h-4 mr-2" />{isLoading ? "Searching..." : "Search"}</Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && <div className="space-y-4"><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /></div>}

      {!isLoading && papers.length > 0 && (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Search Results</h3>
            <div className="flex items-center gap-2">
              {selectedPapers.length > 1 && <Button onClick={handleSynthesize} disabled={isSynthesizing || !session}><Sparkles className="w-4 h-4 mr-2" />{isSynthesizing ? "Synthesizing..." : `Synthesize (${selectedPapers.length})`}</Button>}
              <Button variant="outline" onClick={handleSaveAsDraft} disabled={isSaving}><FilePlus2 className="w-4 h-4 mr-2" />{isSaving ? "Saving..." : "Save as Draft"}</Button>
            </div>
          </div>

          {synthesizedText && (
            <Card className="bg-muted/50">
              <CardHeader><CardTitle className="text-lg">AI-Generated Synthesis</CardTitle></CardHeader>
              <CardContent><Textarea value={synthesizedText} readOnly rows={6} /></CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {papers.map((paper) => (
              <Card key={paper.id}>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Checkbox id={`select-${paper.id}`} className="mt-1.5" onCheckedChange={(checked) => handlePaperSelection(paper, !!checked)} />
                    <div>
                      <CardTitle className="text-base">{paper.title}</CardTitle>
                      {paper.publication_info && <CardDescription>{paper.publication_info}</CardDescription>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground ml-8">{paper.snippet}</p>
                </CardContent>
                <CardFooter>
                  <a href={paper.link} target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button variant="outline" className="w-full">
                      View Source <ArrowUpRight className="w-4 h-4 ml-2" />
                    </Button>
                  </a>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}