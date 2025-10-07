"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Upload, FileText } from "lucide-react";
import { useState } from "react";
import { useAuth } from "./auth-provider";
import { toast } from "sonner";

export function DocumentAnalyzer() {
  const { supabase } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setIsLoading(true);
    setAnalysis(null);

    const { data, error } = await supabase.functions.invoke('pdf-analyzer', {
      body: file,
    });

    setIsLoading(false);

    if (error) {
      toast.error("Failed to analyze PDF.");
      console.error("Error analyzing PDF:", error);
      return;
    }

    setAnalysis(data.text);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>PDF & Document Analysis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Upload a PDF document to automatically extract key data, summaries, and keywords.
        </p>
        <div className="flex gap-4">
          <Button asChild>
            <label htmlFor="pdf-upload">
              <Upload className="mr-2 h-4 w-4" /> Upload PDF
              <input id="pdf-upload" type="file" className="hidden" onChange={handleFileChange} accept=".pdf" />
            </label>
          </Button>
          <Button onClick={handleAnalyze} disabled={!file || isLoading}>
            {isLoading ? "Analyzing..." : <><FileText className="mr-2 h-4 w-4" /> Analyze</>}
          </Button>
        </div>
        {file && <p>Selected file: {file.name}</p>}
        {analysis && (
          <Card>
            <CardHeader>
              <CardTitle>Extracted Text</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="p-4 bg-slate-100 dark:bg-slate-800 rounded-md overflow-auto whitespace-pre-wrap">
                {analysis}
              </pre>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
