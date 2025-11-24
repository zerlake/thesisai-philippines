"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
;
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, BookText, GraduationCap, Code } from "lucide-react";
import { useContext7, type DocumentationEntry } from "@/contexts/context7-provider";

interface ThesisContext7DocsProps {
  className?: string;
}

export function ThesisContext7Docs({ className }: ThesisContext7DocsProps) {
  const {
    getDocumentation,
    documentationCache
  } = useContext7();
  
  const [query, setQuery] = React.useState<string>("");
  const [results, setResults] = React.useState<DocumentationEntry[]>([]);
  const [isSearching, setIsSearching] = React.useState<boolean>(false);

  const handleSearch = async () => {
    if (!query.trim() || isSearching) return;
    
    try {
      setIsSearching(true);
      // Focus on thesis-related documentation
      const thesisQuery = `thesis writing ${query}`;
      const docs = await getDocumentation(thesisQuery);
      setResults(docs);
    } catch (error) {
      console.error("Error fetching thesis documentation:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const allResults = Object.values(documentationCache).flat();

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Thesis Documentation via Context7
            </CardTitle>
            <CardDescription>
              Academic writing documentation and code examples
            </CardDescription>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <BookText className="h-3 w-3" />
            Thesis MCP
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col h-[500px] space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="thesis-docs-query">Thesis documentation search</Label>
            <div className="flex gap-2">
              <Textarea
                id="thesis-docs-query"
                placeholder="Search for thesis writing guidance, academic tools, research methodologies, citation formats, etc...."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isSearching}
                className="flex-grow resize-none"
                rows={2}
              />
              <Button 
                onClick={handleSearch} 
                disabled={isSearching || !query.trim()}
                className="h-[calc(2*theme(spacing.10)+8px)]"
              >
                {isSearching ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuery("thesis writing")}
              >
                Sample: Writing
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="ml-2"
                onClick={() => setQuery("research methodology")}
              >
                Sample: Methodology
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="ml-2"
                onClick={() => setQuery("citation formats")}
              >
                Sample: Citations
              </Button>
            </div>
          </div>
          
          <ScrollArea className="flex-grow rounded-md border p-4 bg-muted/10">
            {results.length === 0 && allResults.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <GraduationCap className="h-12 w-12 mx-auto mb-3 text-muted" />
                  <p>Search for thesis writing documentation.</p>
                  <p className="text-sm mt-2">Context7 provides real-time academic writing guidance.</p>
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md text-left">
                    <p className="font-medium mb-1">Thesis Documentation Features:</p>
                    <ul className="text-sm list-disc pl-5 space-y-1">
                      <li>Academic writing guidelines</li>
                      <li>Research methodology references</li>
                      <li>Citation format examples</li>
                      <li>Thesis structure templates</li>
                      <li>Platform-specific tooling docs</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {(results.length > 0 ? results : allResults).map((doc, index) => (
                  <div key={`${doc.id}-${index}`} className="border rounded-lg p-4 bg-background">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold flex items-center gap-2">
                        {doc.type === 'code-example' && <Code className="h-4 w-4" />}
                        {doc.type === 'api-reference' && <FileText className="h-4 w-4" />}
                        {doc.title}
                      </h3>
                      {doc.version && (
                        <Badge variant="secondary" className="text-xs">
                          v{doc.version}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground max-h-32 overflow-hidden">
                      {doc.content.substring(0, 300)}{doc.content.length > 300 ? '...' : ''}
                    </p>
                    {doc.url && (
                      <a 
                        href={doc.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                      >
                        View full documentation
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}