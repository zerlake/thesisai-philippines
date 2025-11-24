"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
;
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bot, 
  Cpu, 
  Search, 
  Code, 
  FileText, 
  RefreshCw
} from "lucide-react";
import { useContext7 } from "@/contexts/context7-provider";

interface Context7DashboardProps {
  className?: string;
}

export function Context7Dashboard({ className }: Context7DashboardProps) {
  const {
    getDocumentation,
    config,
    getAvailableSamples
  } = useContext7();
  
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const sampleQueries = getAvailableSamples();

  useEffect(() => {
    // Pre-populate with sample documentation on initial load
    const loadSamples = async () => {
      const sampleDocs = await getDocumentation("thesis writing");
      setResults(sampleDocs);
    };
    loadSamples();
  }, [getDocumentation]);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Context7 Documentation Engine
            </CardTitle>
            <CardDescription>
              Real-time documentation via the Model Context Protocol
            </CardDescription>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Cpu className="h-3 w-3" />
            MCP v1.0
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat">Documentation</TabsTrigger>
            <TabsTrigger value="samples">Samples</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="chat" className="space-y-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="context7-query">Search documentation</Label>
                <div className="flex gap-2">
                  <Textarea
                    id="context7-query"
                    placeholder="Search for documentation (e.g., 'thesis outline', 'research methodology', 'citation formats', etc.)..."
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
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                {config.supportedLibraries && config.supportedLibraries.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {config.supportedLibraries.map((lib) => (
                      <Button
                        key={lib}
                        variant={selectedLibrary === lib ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedLibrary(selectedLibrary === lib ? undefined : lib)}
                      >
                        {lib}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
              
              <ScrollArea className="flex-grow h-96 rounded-md border p-4">
                {results.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Bot className="h-12 w-12 mx-auto mb-3 text-muted" />
                      <p>Search for real-time documentation using Context7.</p>
                      <p className="text-sm mt-2">Context7 provides version-specific documentation via MCP.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {results.map((result, index) => (
                      <div key={`${result.id}-${index}`} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold flex items-center gap-2">
                            {result.type === 'code-example' && <Code className="h-4 w-4" />}
                            {result.type === 'api-reference' && <FileText className="h-4 w-4" />}
                            {result.title}
                          </h3>
                          {result.version && (
                            <Badge variant="secondary" className="text-xs">
                              v{result.version}
                            </Badge>
                          )}
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                          {result.content}
                        </p>
                        {result.url && (
                          <a 
                            href={result.url} 
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
          </TabsContent>
          <TabsContent value="samples">
            <div className="space-y-4">
              <h3 className="font-medium">Sample Queries</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sampleQueries.map((sampleQuery, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => setQuery(sampleQuery)}
                    className="justify-start"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {sampleQuery}
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="settings">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Configuration</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Auto-fetch:</span>
                    <span className="font-mono">{config.autoFetch ? "enabled" : "disabled"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cache expiry:</span>
                    <span className="font-mono">{config.cacheExpiry} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Supported libraries:</span>
                    <span className="font-mono">{config.supportedLibraries?.join(", ")}</span>
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => {
                  // Clear documentation cache
                }}
                className="mt-4"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Clear Cache
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}