"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ShieldCheck } from 'lucide-react';
import { checkPlagiarism } from '@/lib/puter-sdk';
import { toast } from 'sonner';

// A new component to render the results
function PlagiarismResultRenderer({ results }: { results: any }) {
  if (!results) return null;

  const { riskLevel, percentage, issues, suggestions } = results;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Originality Report</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div>
            <h3 className="font-semibold">Risk Level: {riskLevel}</h3>
            <p className="text-sm text-muted-foreground">
              {percentage}% of the text was flagged for potential plagiarism.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Issues Found:</h3>
            <ul className="list-disc pl-5">
              {issues.map((issue: string, index: number) => (
                <li key={index} className="text-sm">{issue}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Suggestions:</h3>
            <ul className="list-disc pl-5">
              {suggestions.map((suggestion: string, index: number) => (
                <li key={index} className="text-sm">{suggestion}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function OriginalityChecker() {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  
  const wordCount = inputText.split(/\s+/).filter(word => word.length > 0).length;

  const handleCheckOriginality = async () => {
    if (!inputText) return;
    setIsLoading(true);
    setResults(null);
    setError('');

    try {
      const data = await checkPlagiarism(inputText);
      setResults(data);
      toast.success("Originality check completed!");
    } catch (error: any) {
      const msg = error.message || "Failed to check originality.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6" />
            Originality Checker
          </CardTitle>
          <CardDescription>
            Paste your text below to check for potential plagiarism and ensure originality.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="Paste your text here..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[200px]"
              disabled={isLoading}
            />
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">{wordCount} words</p>
              <Button onClick={handleCheckOriginality} disabled={isLoading || !inputText}>
                {isLoading ? "Checking..." : "Check Originality"}
              </Button>
            </div>
          </div>
          {error && <p className="text-red-500 mt-4">{error}</p>}
          {results && <PlagiarismResultRenderer results={results} />}
        </CardContent>
      </Card>
    </div>
  );
}
