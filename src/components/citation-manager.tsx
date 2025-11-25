"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./auth-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Copy, Trash2, Wand2 } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { toast } from "sonner";
import { getSupabaseFunctionUrl } from "@/integrations/supabase/client";
import { useApiCall } from "@/hooks/use-api-call";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";

type Citation = {
  id: string;
  content: string;
  style: string;
};

export function CitationManager() {
  const { session, supabase } = useAuth();
  const user = session?.user;

  const [description, setDescription] = useState("");
  const [style, setStyle] = useState("APA 7th Edition");
  const [citations, setCitations] = useState<Citation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // const [isGenerating, setIsGenerating] = useState(false); // Replaced by useApiCall's loading state

  const { execute: generateCitation, loading: isGeneratingCitation } = useApiCall<any>({
    onSuccess: (data) => {
      // Data from the API call is handled here
      if (!data || !data.citation) {
        throw new Error("API returned no citation data.");
      }

      // Supabase insert happens after successful API call
      const insertCitation = async () => {
        if (!user) {
          toast.error("User not authenticated for saving citation.");
          return;
        }
        const { error: insertError, data: newCitation } = await supabase
          .from("citations")
          .insert({
            user_id: user.id,
            content: data.citation,
            style: style,
          })
          .select()
          .single();

        if (insertError) {
          throw insertError; // Propagate error for useApiCall to catch
        }

        setCitations([newCitation, ...citations]);
        setDescription("");
        toast.success("Citation generated and saved!");
      };
      
      insertCitation().catch((err) => {
        toast.error(err.message || "Failed to save citation to database.");
        console.error("Supabase insert error:", err);
      });
    },
    onError: (error) => {
      // Error from API call or from the insertCitation function above
      toast.error(error.message || "Failed to generate citation.");
      console.error(error);
    },
    autoErrorToast: false, // We handle toast explicitly
  });


  useEffect(() => {
    if (!user) return;
    const fetchCitations = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("citations")
        .select("id, content, style")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to fetch citations.");
        console.error(error);
      } else {
        setCitations(data || []);
      }
      setIsLoading(false);
    };
    fetchCitations();
  }, [user, supabase]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !style || !session) {
      toast.error("Please provide a description and select a style.");
      return;
    }

    // setIsGenerating(true); // Loading state managed by useApiCall
    try {
      await generateCitation(
        getSupabaseFunctionUrl("generate-citation"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          },
          body: JSON.stringify({ description, style }),
        }
      );
      // Success and error handled by useApiCall callbacks
    } catch (error) {
        // This catch block would only be reached if generateCitation explicitly rethrows after onError
        // Or if there's a sync error in execute, which useApiCall should handle
        console.error("Unexpected error in handleGenerate:", error);
    }
  };

  const handleDelete = async (citationId: string) => {
    const { error } = await supabase
      .from("citations")
      .delete()
      .eq("id", citationId);

    if (error) {
      toast.error("Failed to delete citation.");
    } else {
      setCitations(citations.filter((c) => c.id !== citationId));
      toast.success("Citation deleted.");
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Citation copied to clipboard!");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Citation Helper</CardTitle>
          <CardDescription>
            Generate and manage academic citations for your bibliography.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <Input
                placeholder="e.g., A 2022 book by Santos on Philippine history"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isGeneratingCitation}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Describe the source, and the AI will generate a realistic citation.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={style} onValueChange={setStyle} disabled={isGeneratingCitation}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APA 7th Edition">APA 7th Edition</SelectItem>
                  <SelectItem value="MLA 9th Edition">MLA 9th Edition</SelectItem>
                  <SelectItem value="Chicago 17th Edition">Chicago 17th Edition</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" disabled={isGeneratingCitation || !description || !session}>
                <Wand2 className="w-4 h-4 mr-2" />
                {isGeneratingCitation ? "Generating..." : "Generate & Save"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Citations</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Citation</TableHead>
                <TableHead className="w-[120px]">Style</TableHead>
                <TableHead className="text-right w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3}>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                </TableRow>
              ) : citations.length > 0 ? (
                citations.map((citation) => (
                  <TableRow key={citation.id}>
                    <TableCell className="font-mono text-xs">{citation.content}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{citation.style.split(" ")[0]}</Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => handleCopy(citation.content)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(citation.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center h-24">
                    No citations saved yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}