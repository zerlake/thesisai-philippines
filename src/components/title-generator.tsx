"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { useAuth } from "./auth-provider";
import { toast } from "sonner";
import { Copy, Wand2 } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { Label } from "./ui/label";
import { useAuthReady } from "@/hooks/use-auth-ready";
import { getSupabaseFunctionUrl } from "@/integrations/supabase/client";
import { useApiCall } from "@/hooks/use-api-call";

export function TitleGenerator() {
  const { session } = useAuth();
  const { isReady } = useAuthReady();
  const [summary, setSummary] = useState("");
  const [titles, setTitles] = useState<string[]>([]);
  // const [isLoading, setIsLoading] = useState(false); // Replaced by useApiCall's loading state

  const { execute: generateTitlesCall, loading: isGenerating } = useApiCall<any>({
    onSuccess: (data) => {
      if (!data.titles) {
        throw new Error("API returned no titles data.");
      }
      setTitles(data.titles || []);
      toast.success("Titles generated successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
    autoErrorToast: false, // We handle toast explicitly
  });

  const handleGenerate = async () => {
    if (!summary.trim()) {
      toast.error("Please enter a summary or abstract first.");
      return;
    }
    
    if (!isReady) {
      toast.error("Please wait while your session is loading...");
      return;
    }
    
    if (!session) {
      toast.error("You must be logged in to use this feature.");
      return;
    }

    // setIsLoading(true); // Replaced
    setTitles([]);

    try {
      await generateTitlesCall(
        getSupabaseFunctionUrl("generate-titles"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          },
          body: JSON.stringify({ summary }),
        }
      );
    } catch (error: any) {
        // Errors are already handled by useApiCall's onError
        console.error("Local error before API call in handleGenerate:", error);
    }
  };

  const handleCopy = (title: string) => {
    navigator.clipboard.writeText(title);
    toast.success("Title copied to clipboard!");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Title Generator</CardTitle>
          <CardDescription>
            Paste your abstract or summary to generate creative and academic title suggestions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="summary">Abstract / Summary</Label>
            <Textarea
              id="summary"
              placeholder="Paste your text here..."
              className="min-h-[200px] resize-y"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </div>
          <Button onClick={handleGenerate} disabled={isGenerating}>
            <Wand2 className="w-4 h-4 mr-2" />
            {isGenerating ? "Generating..." : "Generate Titles"}
          </Button>
        </CardContent>
      </Card>

      {(isGenerating || titles.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Titles</CardTitle>
          </CardHeader>
          <CardContent>
            {isGenerating ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-11/12" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <div className="space-y-3">
                {titles.map((title, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-md border bg-tertiary">
                    <p className="font-medium flex-1">{title}</p>
                    <Button variant="ghost" size="icon" onClick={() => handleCopy(title)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}