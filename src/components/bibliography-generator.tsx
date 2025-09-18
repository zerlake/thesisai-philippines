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
import { Clipboard, BookCopy, FilePlus2 } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Citation = {
  id: string;
  content: string;
  style: string;
};

type GroupedCitations = {
  [key: string]: Citation[];
};

export function BibliographyGenerator() {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const router = useRouter();

  const [groupedCitations, setGroupedCitations] = useState<GroupedCitations>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchCitations = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("citations")
        .select("id, content, style")
        .eq("user_id", user.id)
        .order("content", { ascending: true });

      if (error) {
        toast.error("Failed to fetch citations.");
        console.error(error);
      } else {
        const grouped = (data || []).reduce((acc: GroupedCitations, citation) => {
          const style = citation.style;
          if (!acc[style]) {
            acc[style] = [];
          }
          acc[style].push(citation);
          return acc;
        }, {});
        setGroupedCitations(grouped);
      }
      setIsLoading(false);
    };
    fetchCitations();
  }, [user, supabase]);

  const handleCopyToClipboard = (style: string) => {
    const citationsToCopy = groupedCitations[style].map(c => c.content).join('\n\n');
    navigator.clipboard.writeText(citationsToCopy);
    toast.success(`${style} bibliography copied to clipboard!`);
  };

  const handleSaveAsDraft = async (style: string) => {
    if (!user) return;
    setIsSaving(style);

    const content = groupedCitations[style].map(c => `<p style="text-indent: -36px; padding-left: 36px;">${c.content}</p>`).join('');
    const title = `Bibliography: ${style}`;

    const { data: newDoc, error } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        title: title,
        content: `<h2>${title}</h2>${content}`,
      })
      .select("id")
      .single();

    if (error) {
      toast.error("Failed to save bibliography as a draft.");
      console.error(error);
    } else if (newDoc) {
      toast.success("Bibliography saved successfully!");
      router.push(`/drafts/${newDoc.id}`);
    }
    setIsSaving(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Bibliography Generator</CardTitle>
          <CardDescription>
            Compile all your saved citations into a formatted bibliography, ready to be copied into your document.
          </CardDescription>
        </CardHeader>
      </Card>

      {isLoading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-10/12" />
          </CardContent>
        </Card>
      ) : Object.keys(groupedCitations).length > 0 ? (
        Object.entries(groupedCitations).map(([style, citations]) => (
          <Card key={style}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{style}</CardTitle>
                <CardDescription>{citations.length} source(s)</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleCopyToClipboard(style)}>
                  <Clipboard className="w-4 h-4 mr-2" />
                  Copy List
                </Button>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleSaveAsDraft(style)}
                    disabled={!!isSaving}
                >
                    <FilePlus2 className="w-4 h-4 mr-2" />
                    {isSaving === style ? "Saving..." : "Save as Draft"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {citations.map((citation) => (
                  <p key={citation.id} className="font-mono text-sm leading-relaxed" style={{ textIndent: '-36px', paddingLeft: '36px' }}>
                    {citation.content}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <BookCopy className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-semibold">No Citations Found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Go to the "Citations" page to generate and save sources first.
          </p>
        </div>
      )}
    </div>
  );
}