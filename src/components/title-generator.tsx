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

export function TitleGenerator() {
  const { session } = useAuth();
  const { isReady } = useAuthReady();
  const [summary, setSummary] = useState("");
  const [titles, setTitles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true);
    setTitles([]);

    try {
      const response = await fetch(
        "https://dnyjgzzfyzrsucucexhy.supabase.co/functions/v1/generate-titles",
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

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to generate titles.");

      setTitles(data.titles || []);
      toast.success("Titles generated successfully!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
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
          <Button onClick={handleGenerate} disabled={isLoading}>
            <Wand2 className="w-4 h-4 mr-2" />
            {isLoading ? "Generating..." : "Generate Titles"}
          </Button>
        </CardContent>
      </Card>

      {(isLoading || titles.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Titles</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
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