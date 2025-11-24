"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { secureRandomInt, generateSecureId } from "@/lib/crypto-utils";
;
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  BookOpen, 
  Search, 
  Plus, 
  Copy, 
  Download, 
  RefreshCw, 
  Bot, 
  MessageSquare, 
  Calendar,
  User
} from "lucide-react";
import { toast } from "sonner";
import { useContext7 } from "@/contexts/context7-provider";

interface LiteratureEntry {
  id: string;
  title: string;
  authors: string;
  year: string;
  abstract: string;
  tags: string[];
  url?: string;
  addedBy: string;
  dateAdded: string;
  notes?: string;
  relevanceScore?: number;
}

interface LiteratureReviewState {
  entries: LiteratureEntry[];
  searchTerm: string;
  selectedTags: string[];
  collaborators: string[];
  searchResults: LiteratureEntry[];
  isSearching: boolean;
}

interface Context7CollaborativeLiteratureReviewProps {
  className?: string;
}

export function Context7CollaborativeLiteratureReview({ className }: Context7CollaborativeLiteratureReviewProps) {
  const { getDocumentation } = useContext7();
  const [state, setState] = useState<LiteratureReviewState>({
    entries: [],
    searchTerm: "",
    selectedTags: [],
    collaborators: ["You (Researcher)", "Dr. Smith (Advisor)", "Prof. Jones (Critic)"],
    searchResults: [],
    isSearching: false,
  });
  
  const [newEntry, setNewEntry] = useState<Omit<LiteratureEntry, 'id' | 'addedBy' | 'dateAdded'>>({
    title: "",
    authors: "",
    year: "",
    abstract: "",
    tags: [],
    notes: "",
  });
  const [newTag, setNewTag] = useState("");

  // Function to search with Context7 integration
  const searchLiteratureWithContext7 = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    try {
      setState(prev => ({ ...prev, isSearching: true }));
      
      // In a real implementation, this would call Context7 for academic literature documentation
      // For now, we'll simulate using the getDocumentation function
      const docs = await getDocumentation(`literature review ${query}`, "academic");
      
      // Transform documentation results to literature entries
      const literatureEntries: LiteratureEntry[] = docs.map((doc, index) => ({
        id: doc.id || `lit_${Date.now()}_${index}`,
        title: doc.title,
        authors: "Simulated Authors", 
        year: new Date().getFullYear().toString(),
        abstract: doc.content.substring(0, 300) + (doc.content.length > 300 ? "..." : ""),
        tags: ["simulated", "academic", "research"],
        url: doc.url,
        addedBy: "Context7 AI",
        dateAdded: new Date().toISOString().split('T')[0],
        notes: `Context7-sourced documentation for: ${query}`,
        relevanceScore: secureRandomInt(0, 100)
      }));
      
      setState(prev => ({
        ...prev,
        searchResults: literatureEntries,
        isSearching: false
      }));
    } catch (error) {
      console.error("Error searching literature with Context7:", error);
      toast.error("Error searching literature with Context7");
      setState(prev => ({ ...prev, isSearching: false }));
    }
  }, [getDocumentation]);

  const addEntryToReview = (entry: LiteratureEntry) => {
    const newEntryWithId: LiteratureEntry = {
      ...entry,
      id: `entry_${Date.now()}_${generateSecureId().substr(0, 9)}`,
      addedBy: "You",
      dateAdded: new Date().toISOString().split('T')[0],
    };
    
    setState(prev => ({
      ...prev,
      entries: [newEntryWithId, ...prev.entries],
      searchResults: prev.searchResults.filter(e => e.id !== entry.id)
    }));
    
    toast.success("Literature entry added to review");
  };

  const addNewEntry = () => {
    if (!newEntry.title.trim() || !newEntry.authors.trim()) {
      toast.error("Title and authors are required");
      return;
    }
    
    const newLitEntry: LiteratureEntry = {
      ...newEntry,
      id: `entry_${Date.now()}_${generateSecureId().substr(0, 9)}`,
      addedBy: "You",
      dateAdded: new Date().toISOString().split('T')[0],
    };
    
    setState(prev => ({
      ...prev,
      entries: [newLitEntry, ...prev.entries],
    }));
    
    setNewEntry({
      title: "",
      authors: "",
      year: "",
      abstract: "",
      tags: [],
      notes: "",
    });
    
    toast.success("New literature entry added");
  };

  const addTag = () => {
    if (newTag.trim() && !state.selectedTags.includes(newTag.trim())) {
      setState(prev => ({
        ...prev,
        selectedTags: [...prev.selectedTags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setState(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Apply search when search term changes
  useEffect(() => {
    if (state.searchTerm) {
      searchLiteratureWithContext7(state.searchTerm);
    }
  }, [state.searchTerm, searchLiteratureWithContext7]);

  // Filter entries based on search and tags
  const filteredEntries = state.entries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                         entry.authors.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
                         entry.abstract.toLowerCase().includes(state.searchTerm.toLowerCase());
    
    const matchesTags = state.selectedTags.length === 0 || 
                       state.selectedTags.some(tag => entry.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Context7 Collaborative Literature Review
            </CardTitle>
            <CardDescription>
              Collaborate with your research team using Context7 for real-time documentation
            </CardDescription>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Bot className="h-3 w-3" />
            MCP Enabled
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search">Search Literature</TabsTrigger>
            <TabsTrigger value="my-entries">My Entries</TabsTrigger>
            <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
          </TabsList>
          
          <TabsContent value="search" className="space-y-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search for literature using Context7..."
                  value={state.searchTerm}
                  onChange={(e) => setState(prev => ({ ...prev, searchTerm: e.target.value }))}
                  className="flex-grow"
                />
                <Button 
                  onClick={() => searchLiteratureWithContext7(state.searchTerm)}
                  disabled={!state.searchTerm.trim() || state.isSearching}
                >
                  {state.isSearching ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Search
                </Button>
              </div>
              
              {state.searchResults.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      Context7 Literature Results
                    </CardTitle>
                    <CardDescription>
                      {state.searchResults.length} relevant documents found
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-4">
                        {state.searchResults.map((entry) => (
                          <div key={entry.id} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold">{entry.title}</h3>
                                <p className="text-sm text-muted-foreground">{entry.authors} ({entry.year})</p>
                              </div>
                              <div className="flex gap-2">
                                <Badge variant="secondary">{entry.relevanceScore}% match</Badge>
                                <Button 
                                  size="sm" 
                                  onClick={() => addEntryToReview(entry)}
                                >
                                  <Plus className="h-4 w-4" />
                                  Add
                                </Button>
                              </div>
                            </div>
                            <p className="mt-2 text-sm">{entry.abstract}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {entry.tags.map(tag => (
                                <Badge key={tag} variant="outline">{tag}</Badge>
                              ))}
                            </div>
                            {entry.url && (
                              <a 
                                href={entry.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                              >
                                View Source
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
              
              <Card>
                <CardHeader>
                  <CardTitle>Add New Entry</CardTitle>
                  <CardDescription>
                    Manually add a literature entry to your review
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newEntry.title}
                        onChange={(e) => setNewEntry(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter title..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="authors">Authors</Label>
                      <Input
                        id="authors"
                        value={newEntry.authors}
                        onChange={(e) => setNewEntry(prev => ({ ...prev, authors: e.target.value }))}
                        placeholder="Enter authors..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year">Year</Label>
                      <Input
                        id="year"
                        value={newEntry.year}
                        onChange={(e) => setNewEntry(prev => ({ ...prev, year: e.target.value }))}
                        placeholder="Enter year..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags (comma separated)</Label>
                      <Input
                        id="tags"
                        value={newEntry.tags.join(', ')}
                        onChange={(e) => setNewEntry(prev => ({ ...prev, tags: e.target.value.split(',').map(tag => tag.trim()) }))}
                        placeholder="Enter tags..."
                      />
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="abstract">Abstract</Label>
                    <Textarea
                      id="abstract"
                      value={newEntry.abstract}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, abstract: e.target.value }))}
                      placeholder="Enter abstract..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={newEntry.notes || ""}
                      onChange={(e) => setNewEntry(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Enter notes..."
                      rows={2}
                    />
                  </div>
                  <Button 
                    onClick={addNewEntry} 
                    className="mt-4 w-full"
                    disabled={!newEntry.title.trim() || !newEntry.authors.trim()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Entry
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="my-entries" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Your Literature Entries</h3>
              <div className="flex gap-2">
                <div className="flex gap-1">
                  {state.selectedTags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button 
                        onClick={() => removeTag(tag)}
                        className="ml-1 text-xs"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addTag()}
                    className="w-32"
                  />
                  <Button size="sm" onClick={addTag}>Add</Button>
                </div>
              </div>
            </div>
            
            <ScrollArea className="h-96">
              {filteredEntries.length > 0 ? (
                <div className="space-y-4">
                  {filteredEntries.map((entry) => (
                    <Card key={entry.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-semibold">{entry.title}</h3>
                            <p className="text-sm text-muted-foreground">{entry.authors} ({entry.year})</p>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Added by {entry.addedBy} on {entry.dateAdded}
                          </div>
                        </div>
                        <p className="mt-2 text-sm">{entry.abstract}</p>
                        {entry.notes && (
                          <div className="mt-2 p-2 bg-muted rounded-md">
                            <p className="text-xs font-medium">Notes:</p>
                            <p className="text-xs">{entry.notes}</p>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {entry.tags.map(tag => (
                            <Badge key={tag} variant="outline">{tag}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                  <BookOpen className="h-12 w-12 mb-3 text-muted" />
                  <p>No literature entries yet.</p>
                  <p className="text-sm mt-2">Search for literature or add entries manually.</p>
                  <p className="text-xs mt-2 text-muted-foreground">Context7 provides real-time academic documentation</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="collaboration" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Collaborators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {state.collaborators.map((collaborator, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{collaborator}</span>
                      </div>
                      <Badge variant="outline">Contributing</Badge>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Label htmlFor="invite-email">Invite Collaborator</Label>
                  <div className="flex gap-2 mt-2">
                    <Input 
                      id="invite-email" 
                      placeholder="Enter email address..." 
                      className="flex-grow"
                    />
                    <Button>Invite</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Collaboration Tools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Export to Shared Workspace
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Summary
                  </Button>
                  <Button variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Review Session
                  </Button>
                  <Button variant="outline">
                    <Bot className="h-4 w-4 mr-2" />
                    AI Analysis with Context7
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}