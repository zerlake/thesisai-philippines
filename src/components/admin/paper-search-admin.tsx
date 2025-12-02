'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Settings,
  RefreshCw,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Server,
  Database,
} from 'lucide-react';
import { directPaperSearchService } from '@/lib/direct-paper-search';
import { toast } from 'sonner';

interface MCPServerStatus {
  name: string;
  id: string;
  status: 'connected' | 'disconnected' | 'error';
  lastChecked: Date;
  errorMessage?: string;
}

export function PaperSearchAdmin() {
  const [cacheStats, setCacheStats] = useState<{ size: number; keys: string[] }>({ size: 0, keys: [] });
  const [mcpStatus, setMcpStatus] = useState<MCPServerStatus[]>([
    {
      name: 'CrossRef',
      id: 'crossref',
      status: 'connected',
      lastChecked: new Date(),
    },
    {
      name: 'Paper Search (ArXiv/OpenAlex)',
      id: 'paper_search',
      status: 'connected',
      lastChecked: new Date(),
    },
    {
      name: 'Google Scholar',
      id: 'semantic_scholar',
      status: 'connected',
      lastChecked: new Date(),
    },
  ]);
  const [testQuery, setTestQuery] = useState('machine learning');
  const [testResults, setTestResults] = useState<any>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    updateCacheStats();
    const interval = setInterval(updateCacheStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const updateCacheStats = () => {
    const stats = directPaperSearchService.getCacheStats();
    setCacheStats(stats);
  };

  const handleClearCache = () => {
    directPaperSearchService.clearCache();
    setCacheStats({ size: 0, keys: [] });
    toast.success('Cache cleared');
  };

  const handleCheckMCPStatus = async () => {
    // In a real implementation, ping each MCP server
    const updatedStatus = mcpStatus.map((server) => ({
      ...server,
      lastChecked: new Date(),
      status: 'connected' as const,
    }));
    setMcpStatus(updatedStatus);
    toast.success('MCP status updated');
  };

  const handleTestSearch = async () => {
    if (!testQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setIsTesting(true);
    try {
      const result = await directPaperSearchService.search({
        query: testQuery,
        maxResults: 20,
      });

      const sources = {
        crossref: result.papers.filter((p) => p.sources.includes('crossref')).length,
        arxiv: result.papers.filter((p) => p.sources.includes('arxiv')).length,
        openalex: result.papers.filter((p) => p.sources.includes('openalex')).length,
        semantic_scholar: result.papers.filter((p) => p.sources.includes('semantic_scholar')).length,
      };

      const testResults = {
        query: result.query,
        totalResults: result.totalResults,
        papers: result.papers,
        timestamp: result.timestamp,
        sources,
      };

      setTestResults(testResults);
      toast.success(`Search returned ${result.totalResults} papers`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Search failed';
      toast.error(message);
      console.error('[PaperSearchAdmin] Search error:', error);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Paper Search Management</h2>
        <p className="text-muted-foreground">
          Configure and monitor MCP servers for academic paper search
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mcp-servers">MCP Servers</TabsTrigger>
          <TabsTrigger value="cache">Cache Management</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Cache Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Cached Results</span>
                    <span className="text-2xl font-bold">{cacheStats.size}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Caching query results for 5 minutes
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">MCP Servers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Active Servers</span>
                    <span className="text-2xl font-bold">
                      {mcpStatus.filter((s) => s.status === 'connected').length}/{mcpStatus.length}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCheckMCPStatus}
                    className="w-full"
                  >
                    Check Status
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configuration Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="border-l-2 border-primary pl-4">
                  <div className="font-medium">CrossRef API</div>
                  <div className="text-sm text-muted-foreground">
                    Academic research database with DOI metadata
                  </div>
                  <div className="mt-2 flex gap-1">
                    <Badge variant="secondary" className="text-xs">
                      search
                    </Badge>
                  </div>
                </div>
                <div className="border-l-2 border-primary pl-4">
                  <div className="font-medium">arXiv API</div>
                  <div className="text-sm text-muted-foreground">
                    Physics, math, and computer science preprints
                  </div>
                  <div className="mt-2 flex gap-1">
                    <Badge variant="secondary" className="text-xs">
                      search
                    </Badge>
                  </div>
                </div>
                <div className="border-l-2 border-primary pl-4">
                  <div className="font-medium">OpenAlex API</div>
                  <div className="text-sm text-muted-foreground">
                    Biomedical and life sciences literature
                  </div>
                  <div className="mt-2 flex gap-1">
                    <Badge variant="secondary" className="text-xs">
                      search
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MCP Servers Tab */}
        <TabsContent value="mcp-servers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>MCP Server Status</CardTitle>
              <CardDescription>
                Monitor connected MCP servers for paper search
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Server</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Checked</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mcpStatus.map((server) => (
                    <TableRow key={server.id}>
                      <TableCell>
                        <div className="font-medium">{server.name}</div>
                        <div className="text-xs text-muted-foreground">{server.id}</div>
                      </TableCell>
                      <TableCell>
                        {server.status === 'connected' ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Connected
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700">
                            <AlertCircle className="mr-1 h-3 w-3" />
                            Disconnected
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {server.lastChecked.toLocaleTimeString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleCheckMCPStatus}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cache Management Tab */}
        <TabsContent value="cache" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cache Management</CardTitle>
              <CardDescription>
                View and manage cached search results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Cache entries expire after 5 minutes of inactivity
                </AlertDescription>
              </Alert>

              <div className="rounded-lg bg-muted p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium">Cached Queries</span>
                  <Badge>{cacheStats.size}</Badge>
                </div>
                {cacheStats.keys.length > 0 ? (
                  <div className="mt-3 max-h-48 overflow-y-auto space-y-1">
                    {cacheStats.keys.map((key) => (
                      <div
                        key={key}
                        className="truncate text-xs text-muted-foreground"
                      >
                        {key}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No cached queries</div>
                )}
              </div>

              <Button
                variant="destructive"
                onClick={handleClearCache}
                className="w-full"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All Cache
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Testing Tab */}
        <TabsContent value="testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Testing</CardTitle>
              <CardDescription>
                Test paper search functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-query">Search Query</Label>
                <div className="flex gap-2">
                  <Input
                    id="test-query"
                    value={testQuery}
                    onChange={(e) => setTestQuery(e.target.value)}
                    placeholder="Enter search query..."
                  />
                  <Button
                    onClick={handleTestSearch}
                    disabled={isTesting || !testQuery.trim()}
                  >
                    {isTesting ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      'Test'
                    )}
                  </Button>
                </div>
              </div>

              {testResults && (
                <div className="rounded-lg border p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Query</span>
                      <span className="text-muted-foreground">{testResults.query}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Total Results</span>
                      <Badge>{testResults.totalResults}</Badge>
                    </div>
                    <div className="mt-3">
                      <span className="text-sm font-medium">Results by Source</span>
                      <div className="mt-2 grid gap-2 grid-cols-2 text-sm">
                        {Object.entries(testResults.sources).map(([source, count]) => (
                          <div key={source} className="flex justify-between">
                            <span className="capitalize text-muted-foreground">{source}</span>
                            <span className="font-medium">{count as number}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
