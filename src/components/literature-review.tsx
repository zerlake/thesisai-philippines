"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Sparkles, ArrowUpRight, FilePlus2, Search } from 'lucide-react';
import { useAuth } from './auth-provider';
import { toast } from 'sonner';
import { Skeleton } from './ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { getSupabaseFunctionUrl } from '@/integrations/supabase/client';
import { useRouter } from 'next/navigation';
import { useApiCall } from '@/hooks/use-api-call';

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
  // const [isLoading, setIsLoading] = useState(false); // Replaced by useApiCall's loading state
  // const [isSynthesizing, setIsSynthesizing] = useState(false); // Replaced by useApiCall's loading state
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("arxiv");

  const { execute: searchArxiv, loading: isSearchingArxiv } = useApiCall<any>({
    onSuccess: (data) => {
      if (data.papers) {
        setPapers(data.papers.map((p: any) => ({
          id: p.id,
          title: p.title,
          link: p.url,
          publication_info: p.published,
          snippet: p.abstract,
        })));
        toast.success(`Found ${data.papers.length} papers from ArXiv`);
      } else {
        toast.info("No papers found for your search. Try different keywords.");
      }
    },
    onError: (error) => {
      toast.error(error.message || "An unexpected error occurred during search.");
      console.error(error);
    },
    autoErrorToast: false,
  });

  const { execute: synthesizeLiterature, loading: isSynthesizingLiterature } = useApiCall<any>({
    onSuccess: (data) => {
      if (!data.synthesizedText) {
        throw new Error("API returned no synthesized text.");
      }
      setSynthesizedText(data.synthesizedText);
      toast.success("Synthesis complete!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to synthesize sources.");
      console.error(error);
    },
    autoErrorToast: false,
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) {
      toast.error("Please enter a topic to search.");
      return;
    }
    if (!session) {
      toast.error("You must be logged in to search for literature.");
      return;
    }

    // setIsLoading(true); // Loading state managed by useApiCall
    setPapers([]);
    setSelectedPapers([]);
    setSynthesizedText("");

    try {
      const toolName = "search_papers";
      const toolArguments = {
        query: topic,
        max_results: 10,
      };

      await searchArxiv(
        getSupabaseFunctionUrl('call-arxiv-mcp-server'),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          },
          body: JSON.stringify({ toolName, toolArguments }),
        }
      );
    } catch (error: any) {
        // Errors are already handled by useApiCall's onError
        console.error("Local error before API call in handleSearch:", error);
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
    // setIsSynthesizing(true); // Loading state managed by useApiCall
    setSynthesizedText("");
    try {
      await synthesizeLiterature(
        getSupabaseFunctionUrl('synthesize-literature'),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          },
          body: JSON.stringify({ papers: selectedPapers.map(p => ({ title: p.title, snippet: p.snippet })) }),
        }
      );
    } catch (error: any) {
        // Errors are already handled by useApiCall's onError
        console.error("Local error before API call in handleSynthesize:", error);
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
              <TabsTrigger value="arxiv">ArXiv</TabsTrigger>
              <TabsTrigger value="other">Other Sources (Coming Soon)</TabsTrigger>
            </TabsList>
          </Tabs>
          <form onSubmit={handleSearch} className="flex items-center gap-2 mt-4">
            <Input id="topic" placeholder="e.g., Transformer architecture in NLP" value={topic} onChange={(e) => setTopic(e.target.value)} disabled={isSearchingArxiv} />
            <Button type="submit" disabled={isSearchingArxiv || !topic || !session}><Search className="w-4 h-4 mr-2" />{isSearchingArxiv ? "Searching..." : "Search"}</Button>
          </form>
        </CardContent>
      </Card>

      {isSearchingArxiv && <div className="space-y-4"><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /></div>}

      {!isSearchingArxiv && papers.length > 0 && (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Search Results</h3>
            <div className="flex items-center gap-2">
              {selectedPapers.length > 1 && <Button onClick={handleSynthesize} disabled={isSynthesizingLiterature || !session}><Sparkles className="w-4 h-4 mr-2" />{isSynthesizingLiterature ? "Synthesizing..." : `Synthesize (${selectedPapers.length})`}</Button>}
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