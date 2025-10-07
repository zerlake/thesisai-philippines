"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Upload, FileText, Download } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import bibtexParser from 'bibtex-parser';
import { useAuth } from "./auth-provider";
import { toast } from "sonner";
import { saveAs } from 'file-saver';

interface Reference {
  id?: string;
  key: string;
  title: string;
  author: string;
  year: string;
}

export function ReferenceManager() {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const [references, setReferences] = useState<Reference[]>([]);

  const fetchReferences = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("references")
      .select("*")
      .eq("user_id", user.id);
    if (error) {
      toast.error("Failed to fetch references.");
    } else {
      setReferences(data || []);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (user) {
      fetchReferences();
    }
  }, [user, fetchReferences]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        try {
          const parsed = bibtexParser(content);
          const refsToInsert = Object.keys(parsed).map(key => {
            const entry = parsed[key];
            return {
              user_id: user.id,
              key,
              title: entry.TITLE || 'No Title',
              author: entry.AUTHOR || 'No Author',
              year: entry.YEAR || 'No Year',
            };
          });

          const { error } = await supabase.from("references").insert(refsToInsert);
          if (error) {
            toast.error("Failed to save references.");
          } else {
            toast.success("References imported successfully!");
            fetchReferences();
          }
        } catch (error) {
          toast.error("Error parsing BibTeX file.");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExport = () => {
    let bibtexString = '';
    references.forEach(ref => {
      bibtexString += `@article{${ref.key},
`;
      bibtexString += `  TITLE = {${ref.title}},
`;
      bibtexString += `  AUTHOR = {${ref.author}},
`;
      bibtexString += `  YEAR = {${ref.year}}
`;
      bibtexString += `}
\n`;
    });

    const blob = new Blob([bibtexString], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "references.bib");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reference Manager</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Import and export your references to and from popular reference managers like Zotero and Mendeley.
        </p>
        <div className="flex gap-4">
          <Button asChild>
            <label htmlFor="file-upload">
              <Upload className="mr-2 h-4 w-4" /> Import
              <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".bib" />
            </label>
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
        {references.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Your References</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {references.map(ref => (
                  <div key={ref.id} className="p-2 border rounded-md">
                    <p className="font-bold">{ref.title}</p>
                    <p className="text-sm text-muted-foreground">{ref.author} ({ref.year})</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
