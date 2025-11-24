"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
;
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, BookOpen, Code } from "lucide-react";
import { useContext7 } from "@/contexts/context7-provider";

// Define types for documentation entries
interface DocumentationEntry {
  id: string;
  title: string;
  content: string;
  url?: string;
  version?: string;
  timestamp: Date;
  type: 'documentation' | 'code-example' | 'api-reference' | 'tutorial';
}

// interface Config {
//   supportedLibraries: string[];
// }

interface Context7DocsProps {
  className?: string;
}

export function Context7Docs({ className }: Context7DocsProps) {
  const {
    getDocumentation,
    documentationCache,
    config
  } = useContext7();
  
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<DocumentationEntry[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [selectedLibrary, setSelectedLibrary] = useState<string | undefined>(undefined);

  const handleSearch = async () => {
    if (!query.trim() || isSearching) return;
    
    try {
      setIsSearching(true);
      const docs = await getDocumentation(query, selectedLibrary);
      setResults(docs);
    } catch (error) {
      console.error("Error fetching documentation:", error);
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

  const allResults = Object.values(documentationCache).flat() as DocumentationEntry[];

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Context7 Documentation
            </CardTitle>
            <CardDescription>
              Real-time documentation from the Model Context Protocol
            </CardDescription>
          </div>
          <Badge variant="secondary">
            MCP v1.0
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col h-[500px] space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="docs-query">Search documentation</Label>
            <div className="flex gap-2">
              <Textarea
                id="docs-query"
                placeholder="Enter your query (e.g., React hooks, Next.js API routes, etc.)..."
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
            
            {config.supportedLibraries && config.supportedLibraries.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {config.supportedLibraries.map(lib => (
                  <Button
                    key={lib}
                    variant={selectedLibrary === lib ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedLibrary(selectedLibrary === lib ? undefined : lib)}
                  >
                    {lib}
                  </Button>
                ))}
                <div className="ml-auto flex gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuery("react hooks")}
                  >
                    Sample: React Hooks
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuery("nextjs api routes")}
                  >
                    Sample: Next.js API
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuery("typescript generics")}
                  >
                    Sample: TS Generics
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <ScrollArea className="flex-grow rounded-md border p-4">
            {results.length === 0 && allResults.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <BookOpen className="h-12 w-12 mx-auto mb-3 text-muted" />
                  <p>Search for documentation using Context7.</p>
                  <p className="text-sm mt-2">Context7 provides real-time, version-specific documentation via MCP.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {(results.length > 0 ? results : allResults).map((doc, index) => (
                  <div key={`${doc.id}-${index}`} className="border rounded-lg p-4">
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