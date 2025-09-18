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
  const [isGenerating, setIsGenerating] = useState(false);

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
    if (!description || !style || !session) return;

    setIsGenerating(true);
    try {
      const response = await fetch(
        "https://dnyjgzzfyzrsucucexhy.supabase.co/functions/v1/generate-citation",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
            apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRueWpnenpmeXpyc3VjdWNleGh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc0NDAxMjcsImV4cCI6MjA3MzAxNjEyN30.elZ6r3JJjdwGUadSzQ1Br5EdGeqZIEr67Z5QB_Q3eMw",
          },
          body: JSON.stringify({ description, style }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      const { error: insertError, data: newCitation } = await supabase
        .from("citations")
        .insert({
          user_id: user!.id,
          content: data.citation,
          style: style,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setCitations([newCitation, ...citations]);
      setDescription("");
      toast.success("Citation generated and saved!");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate citation.");
      console.error(error);
    } finally {
      setIsGenerating(false);
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
                disabled={isGenerating}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Describe the source, and the AI will generate a realistic citation.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={style} onValueChange={setStyle} disabled={isGenerating}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APA 7th Edition">APA 7th Edition</SelectItem>
                  <SelectItem value="MLA 9th Edition">MLA 9th Edition</SelectItem>
                  <SelectItem value="Chicago 17th Edition">Chicago 17th Edition</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" disabled={isGenerating || !description || !session}>
                <Wand2 className="w-4 h-4 mr-2" />
                {isGenerating ? "Generating..." : "Generate & Save"}
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