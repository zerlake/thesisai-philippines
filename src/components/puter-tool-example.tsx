'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useAITool, useAIToolsBatch } from '@/hooks/useAITool';
import { AlertCircle, CheckCircle2, Loader2, Zap } from 'lucide-react';

/**
 * Example component demonstrating Puter AI tool integration
 * Shows single tool execution with fallback handling
 */
export function PuterToolExample() {
  const [topic, setTopic] = useState('Machine Learning in Healthcare');
  
  const { data, error, loading, fallback, execute } = useAITool(
    'generate-research-questions',
    { topic },
    {
      timeout: 30000,
      retries: 3,
      onSuccess: (data) => console.log('Tool executed successfully:', data),
      onError: (error) => console.error('Tool failed:', error)
    }
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Research Question Generator</CardTitle>
        <CardDescription>Generate research questions for your topic</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="topic">Research Topic</Label>
          <Input
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter your research topic"
          />
        </div>

        <Button
          onClick={() => execute()}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Generate Questions
            </>
          )}
        </Button>

        {fallback && (
          <Badge variant="outline" className="w-full justify-center">
            Using fallback - AI service unavailable
          </Badge>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        )}

        {data && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="font-semibold">Generated Questions:</span>
            </div>
            <ul className="space-y-1 ml-7">
              {Array.isArray(data.questions) && data.questions.map((q: string, i: number) => (
                <li key={i} className="text-sm text-muted-foreground">
                  {i + 1}. {q}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Example component for batch tool execution
 * Demonstrates executing multiple tools simultaneously with progress tracking
 */
export function PuterBatchToolExample() {
  const [documentContent, setDocumentContent] = useState('');

  const tools = [
    {
      toolName: 'check-grammar',
      input: { text: documentContent },
      config: { retries: 2 }
    },
    {
      toolName: 'improve-writing',
      input: { text: documentContent },
      config: { retries: 2 }
    },
    {
      toolName: 'summarize-text',
      input: { text: documentContent },
      config: { retries: 2 }
    }
  ];

  const { results, error, loading, progress, execute } = useAIToolsBatch(tools, {
    timeout: 60000,
    onSuccess: (results) => console.log('Batch execution complete:', results)
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Batch Tool Execution</CardTitle>
        <CardDescription>
          Run multiple analysis tools on your document
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="content">Document Content</Label>
          <Textarea
            id="content"
            value={documentContent}
            onChange={(e) => setDocumentContent(e.target.value)}
            placeholder="Paste your document content here..."
            rows={6}
          />
        </div>

        <Button
          onClick={() => execute()}
          disabled={loading || !documentContent}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing ({Math.round(progress)}%)
            </>
          ) : (
            'Analyze Content'
          )}
        </Button>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Results:</h3>
            {results.map((result, index) => (
              <Card key={index} className="bg-muted">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <span className="font-medium text-sm">
                      Tool {index + 1}
                    </span>
                    <Badge variant={result.success ? 'default' : 'destructive'}>
                      {result.fallback ? 'Fallback' : result.success ? 'Success' : 'Failed'}
                    </Badge>
                  </div>
                  {result.error && (
                    <p className="text-xs text-destructive mt-2">{result.error}</p>
                  )}
                  {result.data && (
                    <pre className="text-xs overflow-auto max-h-32 mt-2 p-2 bg-background rounded">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Tool status indicator component
 */
export function PuterToolStatusIndicator({ toolName }: { toolName: string }) {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  const checkStatus = async () => {
    try {
      // Simulate checking tool availability
      // In a real app, this would check against the actual AI service
      setIsAvailable(Math.random() > 0.2); // 80% chance of being available
    } catch {
      setIsAvailable(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">{toolName}</span>
      <button onClick={checkStatus} className="text-xs text-muted-foreground hover:text-foreground">
        {isAvailable === null && 'Check'}
        {isAvailable === true && <CheckCircle2 className="h-4 w-4 text-green-600" />}
        {isAvailable === false && <AlertCircle className="h-4 w-4 text-red-600" />}
      </button>
    </div>
  );
}

/**
 * Dashboard overview showing all available tools with status
 */
export function PuterToolsDashboard() {
  const tools = [
    'generate-topic-ideas',
    'generate-research-questions',
    'generate-outline',
    'paraphrase-text',
    'improve-writing',
    'check-plagiarism',
    'generate-presentation-slides',
    'generate-defense-questions'
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Tools Status</CardTitle>
        <CardDescription>Monitor availability of all AI tools</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tools.map((tool) => (
            <PuterToolStatusIndicator key={tool} toolName={tool} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
