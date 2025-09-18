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

type Paper = {
  id: string;
  title: string;
  link: string;
  publication_info: string;
  snippet: string;
};

export function LiteratureReview() {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const router = useRouter();
  const [topic, setTopic] = useState("");
  const [papers, setPapers] = useState<Paper[]>([]);
  const [selectedPapers, setSelectedPapers] = useState<Paper[]>([]);
  const [synthesizedText, setSynthesizedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("scholar");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;

    setIsLoading(true);
    setPapers([]);
    setSelectedPapers([]);
    setSynthesizedText("");

    try {
      if (!session) {
        throw new Error("Authentication session not found. Please log in again.");
      }

      const functionName = activeTab === "web" ? "search-web" : "search-google-scholar";

      const response = await fetch(
        `https://dnyjgzzfyzrsucucexhy.supabase.co/functions/v1/${functionName}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRueWpnenpmeXpyc3VjdWNleGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NDAxMjcsImV4cCI6MjA3MzAxNjEyN30.elZ6r3JJjdwGUadSzQ1Br5EdGeqZIEr67Z5QB_Q3eMw",
          },
          body: JSON.stringify({ query: topic }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }

      if (data.papers) {
        setPapers(data.papers);
      } else {
        throw new Error("The search did not return the expected data. Please try again.");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An unexpected error occurred.");
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
            apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRueWpnenpmeXpyc3VjdWNleGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NDAxMjcsImV4cCI6MjA3MzAxNjEyN30.elZ6r3JJjdwGUadSzQ1Br5EdGeqZIEr67Z5QB_Q3eMw",
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="scholar">Google Scholar</TabsTrigger>
              <TabsTrigger value="web">Web Search</TabsTrigger>
            </TabsList>
          </Tabs>
          <form onSubmit={handleSearch} className="flex items-center gap-2 mt-4">
            <Input id="topic" placeholder="e.g., AI in Philippine Higher Education" value={topic} onChange={(e) => setTopic(e.target.value)} disabled={isLoading} />
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
                <CardContent><p className="text-sm text-muted-foreground ml-8">{paper.snippet}</p></CardContent>
                <CardFooter><a href={paper.link} target="_blank" rel="noopener noreferrer" className="w-full"><Button variant="outline" className="w-full">View Source <ArrowUpRight className="w-4 h-4 ml-2" /></Button></a></CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}