"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Search, ChevronRight, FileText, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface WikiPage {
  title: string;
  slug: string;
  category?: string;
  description?: string;
  content?: string;
}

export function WikiViewer() {
  const [pages, setPages] = useState<WikiPage[]>([]);
  const [selectedPage, setSelectedPage] = useState<WikiPage | null>(null);
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPages, setIsLoadingPages] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch wiki pages on mount
  useEffect(() => {
    const fetchPages = async () => {
      try {
        setIsLoadingPages(true);
        console.log("Fetching wiki pages from /api/wiki...");
        const response = await fetch("/api/wiki");
        console.log("Response status:", response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log("Wiki pages data:", data);
          const pagesList = data.pages || [];
          console.log("Setting pages:", pagesList);
          
          if (pagesList.length > 0) {
            setPages(pagesList);
          } else {
            console.warn("API returned empty pages array, using fallback pages");
            // Fallback with common wiki pages
            setPages([
              { title: "Home", slug: "Home", description: "Wiki homepage and overview" },
              { title: "Getting Started", slug: "Getting-Started", description: "Setup and first steps" },
              { title: "Architecture Overview", slug: "Architecture-Overview", description: "System architecture" },
              { title: "Code Standards", slug: "Code-Standards", description: "Code conventions" },
              { title: "Technology Stack", slug: "Technology-Stack", description: "Technologies used" },
            ]);
          }
        } else {
          console.error("Failed to fetch wiki pages, status:", response.status);
          const errorData = await response.json().catch(() => ({}));
          console.error("Error response:", errorData);
          
          // Fallback pages
          console.warn("Using fallback pages");
          setPages([
            { title: "Home", slug: "Home", description: "Wiki homepage and overview" },
            { title: "Getting Started", slug: "Getting-Started", description: "Setup and first steps" },
            { title: "Architecture Overview", slug: "Architecture-Overview", description: "System architecture" },
            { title: "Code Standards", slug: "Code-Standards", description: "Code conventions" },
            { title: "Technology Stack", slug: "Technology-Stack", description: "Technologies used" },
          ]);
        }
      } catch (error) {
        console.error("Error fetching wiki pages:", error);
        // Use fallback pages
        console.warn("Using fallback pages due to error");
        setPages([
          { title: "Home", slug: "Home", description: "Wiki homepage and overview" },
          { title: "Getting Started", slug: "Getting-Started", description: "Setup and first steps" },
          { title: "Architecture Overview", slug: "Architecture-Overview", description: "System architecture" },
          { title: "Code Standards", slug: "Code-Standards", description: "Code conventions" },
          { title: "Technology Stack", slug: "Technology-Stack", description: "Technologies used" },
        ]);
      } finally {
        setIsLoadingPages(false);
      }
    };

    fetchPages();
  }, []);

  const filteredPages = pages.filter(
    (page) =>
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const loadWikiContent = async () => {
      if (!selectedPage) return;

      setIsLoading(true);
      try {
        const response = await fetch(`/api/wiki/${selectedPage.slug}`);
        if (response.ok) {
          const data = await response.json();
          setContent(data.content || "");
        } else {
          setContent(`# ${selectedPage.title}\n\n${selectedPage.description || ""}`);
        }
      } catch (error) {
        console.error("Failed to load wiki content:", error);
        setContent(`# ${selectedPage.title}\n\n_Content could not be loaded_`);
      } finally {
        setIsLoading(false);
      }
    };

    loadWikiContent();
  }, [selectedPage]);

  const handleSelectPage = (page: WikiPage) => {
    setSelectedPage(page);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar - Wiki Index */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Wiki
          </CardTitle>
          <CardDescription>Code documentation and guides</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search wiki..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>

          <ScrollArea className="h-[400px] border rounded-lg p-2">
            <div className="space-y-2">
              {isLoadingPages ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2 p-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                ))
              ) : filteredPages.length > 0 ? (
                filteredPages.map((page) => (
                  <Button
                    key={page.slug}
                    variant={selectedPage?.slug === page.slug ? "default" : "ghost"}
                    className="w-full justify-start text-left"
                    onClick={() => handleSelectPage(page)}
                  >
                    <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                    <div className="flex-1 truncate">
                      <div className="text-sm font-medium">{page.title}</div>
                      {page.category && (
                        <div className="text-xs text-muted-foreground">{page.category}</div>
                      )}
                    </div>
                    {selectedPage?.slug === page.slug && (
                      <ChevronRight className="h-4 w-4 ml-1 flex-shrink-0" />
                    )}
                  </Button>
                ))
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No pages found
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="pt-4 border-t space-y-2 text-xs">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 mt-0.5 text-yellow-500 flex-shrink-0" />
              <p className="text-muted-foreground">
                {isLoadingPages 
                  ? "Loading wiki pages..." 
                  : pages.length === 0 
                  ? "No pages loaded. Check browser console for errors." 
                  : "Click a page to view its content. Use the search to find specific topics."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content - Wiki Page */}
      <Card className="lg:col-span-3">
        <CardHeader>
          {selectedPage ? (
            <>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-2xl">{selectedPage.title}</CardTitle>
                  <CardDescription>{selectedPage.description}</CardDescription>
                </div>
                {selectedPage.category && (
                  <Badge variant="outline">{selectedPage.category}</Badge>
                )}
              </div>
            </>
          ) : (
            <>
              <CardTitle>Select a Wiki Page</CardTitle>
              <CardDescription>Choose a page from the sidebar to read documentation</CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent>
          {!selectedPage ? (
            <div className="py-12 text-center space-y-4">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
              <div className="space-y-2">
                <p className="font-medium">No Page Selected</p>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Select a wiki page from the list on the left to view its content. Start with
                  "Home" or "Getting Started" for an overview.
                </p>
              </div>
            </div>
          ) : isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="pt-4 space-y-3">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ) : (
            <ScrollArea className="h-[600px] pr-4">
              <article className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ node, ...props }) => (
                      <h1 className="text-3xl font-bold mt-0 mb-4" {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2 className="text-2xl font-bold mt-6 mb-3 border-b pb-2" {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 className="text-xl font-semibold mt-4 mb-2" {...props} />
                    ),
                    p: ({ node, ...props }) => <p className="mb-3 leading-7" {...props} />,
                    ul: ({ node, ...props }) => (
                      <ul className="list-disc list-inside mb-3 space-y-1" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol className="list-decimal list-inside mb-3 space-y-1" {...props} />
                    ),
                    li: ({ node, ...props }) => <li className="ml-2" {...props} />,
                    code: ({ node, inline, ...props }: any) =>
                      inline ? (
                        <code
                          className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
                          {...props}
                        />
                      ) : (
                        <code
                          className="block bg-muted p-3 rounded-lg overflow-x-auto text-sm font-mono mb-3"
                          {...props}
                        />
                      ),
                    pre: ({ node, ...props }) => <pre className="mb-3" {...props} />,
                    blockquote: ({ node, ...props }) => (
                      <blockquote
                        className="border-l-4 border-muted pl-4 italic text-muted-foreground mb-3"
                        {...props}
                      />
                    ),
                    table: ({ node, ...props }) => (
                      <div className="overflow-x-auto mb-3">
                        <table
                          className="w-full border-collapse border border-muted text-sm"
                          {...props}
                        />
                      </div>
                    ),
                    th: ({ node, ...props }) => (
                      <th className="border border-muted bg-muted p-2 text-left font-semibold" {...props} />
                    ),
                    td: ({ node, ...props }) => (
                      <td className="border border-muted p-2" {...props} />
                    ),
                    a: ({ node, ...props }) => (
                      <a
                        className="text-blue-500 hover:text-blue-600 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                        {...props}
                      />
                    ),
                  }}
                >
                  {content}
                </ReactMarkdown>
              </article>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
