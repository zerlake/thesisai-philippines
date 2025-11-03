// Enhanced Literature Review Matrix with all required features

"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  PlusCircle, 
  FileDown, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Copy, 
  Download,
  MoreHorizontal,
  ExternalLink,
  Users,
  MessageCircle,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Define the data structure for each matrix entry
type MatrixEntry = {
  id: number;
  author: string;
  title: string;
  year: number;
  purpose: string;
  framework: string;
  methods: string;
  results: string;
  conclusions: string;
  relevance: string;
  notes: string;
  // Additional fields for enhanced functionality
  tags?: string[];
  rating?: number; // Quality score (1-5)
  status?: "to-read" | "in-progress" | "completed"; // Reading status
  advisorComments?: string; // For advisor collaboration
  sourceType?: "journal" | "book" | "conference" | "thesis" | "other"; // Source type
  doi?: string; // DOI for citation
  url?: string; // URL for online sources
  pages?: string; // Page range
  publisher?: string; // Publisher information
  keywords?: string[]; // Keywords for filtering
  methodology?: string; // Research methodology used in source
  sampleSize?: number; // Sample size if applicable
};

// Mock data with enhanced fields
const mockData: MatrixEntry[] = [
  {
    id: 1,
    author: "Smith et al.",
    title: "Impact of X on Y",
    year: 2022,
    purpose: "To investigate the effect of X on Y.",
    framework: "Social Learning Theory",
    methods: "Survey",
    results: "Positive correlation found between X and Y.",
    conclusions: "X is a significant predictor of Y.",
    relevance: "Directly supports my thesis argument about the importance of X.",
    notes: "Key article for chapter 2.",
    tags: ["quantitative", "correlation", "social learning"],
    rating: 4,
    status: "completed",
    sourceType: "journal",
    doi: "10.1000/journal.12345",
    url: "https://example.com/article1",
    pages: "45-67",
    publisher: "Example Academic Press",
    keywords: ["learning", "correlation", "X", "Y"],
    methodology: "Survey research",
    sampleSize: 500
  },
  {
    id: 2,
    author: "Chan & Wang",
    title: "A review of Z",
    year: 2023,
    purpose: "To synthesize existing literature on Z.",
    framework: "N/A",
    methods: "Meta-analysis",
    results: "Z shows a weak but consistent effect.",
    conclusions: "Further research is needed to understand the moderators of Z's effect.",
    relevance: "Provides background context for my study.",
    notes: "Useful for the introduction.",
    tags: ["review", "meta-analysis", "background"],
    rating: 5,
    status: "completed",
    sourceType: "journal",
    doi: "10.1000/journal.67890",
    url: "https://example.com/article2",
    pages: "123-145",
    publisher: "Example Academic Press",
    keywords: ["review", "meta-analysis", "Z"],
    methodology: "Meta-analysis"
  },
];

export function EnhancedLiteratureReviewMatrix() {
  const [entries, setEntries] = useState<MatrixEntry[]>(mockData);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<MatrixEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortField, setSortField] = useState<keyof MatrixEntry>("year");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedEntry, setSelectedEntry] = useState<MatrixEntry | null>(null);
  const [showAdvisorComments, setShowAdvisorComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  
  // Refs for export functionality
  const tableRef = useRef<HTMLDivElement>(null);

  // Filter and sort entries based on search, filter, and sort criteria
  const filteredAndSortedEntries = entries
    .filter(entry => {
      const matchesSearch = searchTerm === "" || 
        entry.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.results.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.keywords?.some(kw => kw.toLowerCase().includes(searchTerm.toLowerCase())) ||
        entry.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFilter = filterType === "all" || entry.sourceType === filterType;
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return sortDirection === "asc" ? 1 : -1;
      if (bValue === undefined) return sortDirection === "asc" ? -1 : 1;
      
      // Handle number comparison for year
      if (sortField === "year" || sortField === "sampleSize") {
        const aNum = Number(aValue);
        const bNum = Number(bValue);
        return sortDirection === "asc" ? aNum - bNum : bNum - aNum;
      }
      
      // Handle string comparison
      if (typeof aValue === "string" && typeof bValue === "string") {
        const aStr = aValue.toLowerCase();
        const bStr = bValue.toLowerCase();
        if (aStr < bStr) return sortDirection === "asc" ? -1 : 1;
        if (aStr > bStr) return sortDirection === "asc" ? 1 : -1;
        return 0;
      }
      
      return 0;
    });

  // Get unique source types for filter
  const sourceTypes = Array.from(new Set(entries.map(entry => entry.sourceType).filter(Boolean))) as string[];

  const handleAddEntry = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const newEntry: MatrixEntry = {
      id: Math.max(...entries.map(e => e.id), 0) + 1,
      author: formData.get("author") as string,
      title: formData.get("title") as string,
      year: parseInt(formData.get("year") as string, 10),
      purpose: formData.get("purpose") as string,
      framework: formData.get("framework") as string,
      methods: formData.get("methods") as string,
      results: formData.get("results") as string,
      conclusions: formData.get("conclusions") as string,
      relevance: formData.get("relevance") as string,
      notes: formData.get("notes") as string,
      tags: (formData.get("tags") as string)?.split(",").map(tag => tag.trim()) || [],
      rating: parseInt(formData.get("rating") as string) || undefined,
      status: (formData.get("status") as MatrixEntry["status"]) || "to-read",
      sourceType: formData.get("sourceType") as MatrixEntry["sourceType"],
      doi: formData.get("doi") as string,
      url: formData.get("url") as string,
      pages: formData.get("pages") as string,
      publisher: formData.get("publisher") as string,
      keywords: (formData.get("keywords") as string)?.split(",").map(kw => kw.trim()) || [],
      methodology: formData.get("methodology") as string,
      sampleSize: parseInt(formData.get("sampleSize") as string, 10) || undefined
    };

    setEntries([...entries, newEntry]);
    setIsAddDialogOpen(false);
  };

  const handleEditEntry = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentEntry) return;
    
    const formData = new FormData(event.currentTarget);
    const updatedEntry: MatrixEntry = {
      id: currentEntry.id,
      author: formData.get("author") as string,
      title: formData.get("title") as string,
      year: parseInt(formData.get("year") as string, 10),
      purpose: formData.get("purpose") as string,
      framework: formData.get("framework") as string,
      methods: formData.get("methods") as string,
      results: formData.get("results") as string,
      conclusions: formData.get("conclusions") as string,
      relevance: formData.get("relevance") as string,
      notes: formData.get("notes") as string,
      tags: (formData.get("tags") as string)?.split(",").map(tag => tag.trim()) || [],
      rating: parseInt(formData.get("rating") as string) || undefined,
      status: (formData.get("status") as MatrixEntry["status"]) || "to-read",
      sourceType: formData.get("sourceType") as MatrixEntry["sourceType"],
      doi: formData.get("doi") as string,
      url: formData.get("url") as string,
      pages: formData.get("pages") as string,
      publisher: formData.get("publisher") as string,
      keywords: (formData.get("keywords") as string)?.split(",").map(kw => kw.trim()) || [],
      methodology: formData.get("methodology") as string,
      sampleSize: parseInt(formData.get("sampleSize") as string, 10) || undefined
    };

    setEntries(entries.map(entry => entry.id === updatedEntry.id ? updatedEntry : entry));
    setIsEditDialogOpen(false);
    setCurrentEntry(null);
  };

  const handleDeleteEntry = (id: number) => {
    if (window.confirm("Are you sure you want to delete this source?")) {
      setEntries(entries.filter(entry => entry.id !== id));
    }
  };

  const handleEditClick = (entry: MatrixEntry) => {
    setCurrentEntry(entry);
    setIsEditDialogOpen(true);
  };

  const handleAddToMatrix = (source: any) => {
    // This would be connected to the Research tool in a full implementation
    const newEntry: MatrixEntry = {
      id: Math.max(...entries.map(e => e.id), 0) + 1,
      author: source.author || "",
      title: source.title || "",
      year: source.year || new Date().getFullYear(),
      purpose: source.purpose || "",
      framework: source.framework || "",
      methods: source.methods || "",
      results: source.results || "",
      conclusions: source.conclusions || "",
      relevance: "",
      notes: "",
      sourceType: source.type || "journal"
    };
    setEntries([...entries, newEntry]);
  };

  const handleExport = (format: "csv" | "docx" | "pdf") => {
    if (format === "csv") {
      // Create CSV content
      const headers = [
        "Author", "Title", "Year", "Purpose", "Framework", 
        "Methods", "Results", "Conclusions", "Relevance", "Notes"
      ].join(",");
      
      const rows = filteredAndSortedEntries.map(entry => [
        `"${entry.author}"`,
        `"${entry.title}"`,
        entry.year,
        `"${entry.purpose}"`,
        `"${entry.framework}"`,
        `"${entry.methods}"`,
        `"${entry.results}"`,
        `"${entry.conclusions}"`,
        `"${entry.relevance}"`,
        `"${entry.notes}"`
      ].join(","));
      
      const csvContent = [headers, ...rows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", "literature-review-matrix.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    // In a real implementation, DOCX and PDF export would require additional libraries
    if (format === "docx") {
      alert("DOCX export functionality would generate a Word document with the matrix data");
    }
    
    if (format === "pdf") {
      alert("PDF export functionality would generate a PDF document with the matrix data");
    }
  };

  const handleAddComment = () => {
    if (!selectedEntry || !newComment.trim() || !showAdvisorComments) return;
    
    // In a real implementation, this would update the entry with the comment
    alert(`Comment added to entry ${selectedEntry.id}: ${newComment}`);
    setNewComment("");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              Literature Review Matrix
              <Badge variant="secondary" className="text-xs">
                {entries.length} sources
              </Badge>
            </CardTitle>
            <CardDescription>
              Organize and synthesize your research sources for Chapter II.
            </CardDescription>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search sources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {sourceTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortField as string} onValueChange={(value: keyof MatrixEntry) => setSortField(value)}>
                <SelectTrigger className="w-[160px]">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="year">Year</SelectItem>
                  <SelectItem value="author">Author</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
              >
                {sortDirection === "asc" ? "↑ Asc" : "↓ Desc"}
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <FileDown className="w-4 h-4 mr-2" />
                    Export
                    <MoreHorizontal className="w-4 h-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleExport("csv")}>
                    <Download className="w-4 h-4 mr-2" />
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("docx")}>
                    <Download className="w-4 h-4 mr-2" />
                    Export as DOCX
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("pdf")}>
                    <Download className="w-4 h-4 mr-2" />
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Source
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto" ref={tableRef}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Author</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Framework</TableHead>
                <TableHead>Methods</TableHead>
                <TableHead>Results</TableHead>
                <TableHead>Conclusions</TableHead>
                <TableHead>Relevance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedEntries.map((entry) => (
                <TableRow 
                  key={entry.id} 
                  className={selectedEntry?.id === entry.id ? "bg-muted/50" : ""}
                  onClick={() => setSelectedEntry(entry)}
                >
                  <TableCell>{entry.author}</TableCell>
                  <TableCell className="font-medium max-w-xs">
                    <div className="flex items-center">
                      <span className="truncate">{entry.title}</span>
                      {entry.url && (
                        <a href={entry.url} target="_blank" rel="noopener noreferrer" 
                           className="ml-1 text-blue-500 hover:underline" 
                           onClick={(e) => e.stopPropagation()}>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{entry.year}</TableCell>
                  <TableCell className="max-w-xs truncate">{entry.purpose}</TableCell>
                  <TableCell>{entry.framework}</TableCell>
                  <TableCell>{entry.methods}</TableCell>
                  <TableCell className="max-w-xs truncate">{entry.results}</TableCell>
                  <TableCell className="max-w-xs truncate">{entry.conclusions}</TableCell>
                  <TableCell className="max-w-xs truncate">{entry.relevance}</TableCell>
                  <TableCell>
                    <Badge variant={
                      entry.status === "to-read" ? "secondary" : 
                      entry.status === "in-progress" ? "default" : 
                      "outline"
                    }>
                      {entry.status?.replace("-", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {entry.rating && (
                      <div className="flex items-center">
                        {"★".repeat(entry.rating)}
                        {"☆".repeat(5 - entry.rating)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(entry);
                        }}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEntry(entry.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(entry.title);
                            alert("Title copied to clipboard!");
                          }}>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Title
                          </DropdownMenuItem>
                          {entry.doi && (
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(entry.doi);
                              alert("DOI copied to clipboard!");
                            }}>
                              <Copy className="w-4 h-4 mr-2" />
                              Copy DOI
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {selectedEntry && (
          <div className="mt-6 p-4 border rounded-md bg-muted/30">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-lg mb-2">Selected Source Details</h3>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEditClick(selectedEntry)}
                >
                  <Edit3 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowAdvisorComments(!showAdvisorComments)}
                >
                  <Users className="w-4 h-4 mr-1" />
                  {showAdvisorComments ? "Hide" : "Advisor"} Comments
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-1">Purpose</h4>
                <p className="text-sm">{selectedEntry.purpose}</p>
                
                <h4 className="font-medium mb-1 mt-2">Framework</h4>
                <p className="text-sm">{selectedEntry.framework}</p>
                
                <h4 className="font-medium mb-1 mt-2">Methods</h4>
                <p className="text-sm">{selectedEntry.methods}</p>
                
                <h4 className="font-medium mb-1 mt-2">Results</h4>
                <p className="text-sm">{selectedEntry.results}</p>
                
                <h4 className="font-medium mb-1 mt-2">Publisher</h4>
                <p className="text-sm">{selectedEntry.publisher || "N/A"}</p>
              </div>
              
              <div>
                <h4 className="font-medium mb-1">Conclusions</h4>
                <p className="text-sm">{selectedEntry.conclusions}</p>
                
                <h4 className="font-medium mb-1 mt-2">Relevance to Thesis</h4>
                <p className="text-sm">{selectedEntry.relevance}</p>
                
                <h4 className="font-medium mb-1 mt-2">Notes</h4>
                <p className="text-sm">{selectedEntry.notes}</p>
                
                <h4 className="font-medium mb-1 mt-2">Source Type</h4>
                <p className="text-sm capitalize">{selectedEntry.sourceType || "N/A"}</p>
                
                {showAdvisorComments && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2 flex items-center">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Advisor Comments
                    </h4>
                    <Textarea 
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add your advisor's comments here..."
                      className="mb-2"
                    />
                    <Button size="sm" onClick={handleAddComment}>
                      Add Comment
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      {/* Add Source Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Source</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddEntry} className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input id="author" name="author" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" required />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input id="year" name="year" type="number" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sourceType">Source Type</Label>
                <Select name="sourceType">
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="journal">Journal Article</SelectItem>
                    <SelectItem value="book">Book</SelectItem>
                    <SelectItem value="conference">Conference Paper</SelectItem>
                    <SelectItem value="thesis">Thesis/Dissertation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Textarea id="purpose" name="purpose" required />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="framework">Framework</Label>
                <Textarea id="framework" name="framework" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="methods">Methods</Label>
                <Textarea id="methods" name="methods" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="results">Results</Label>
              <Textarea id="results" name="results" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="conclusions">Conclusions</Label>
              <Textarea id="conclusions" name="conclusions" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="relevance">Relevance to Thesis</Label>
              <Textarea id="relevance" name="relevance" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rating">Rating (1-5)</Label>
                <Select name="rating">
                  <SelectTrigger>
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Poor</SelectItem>
                    <SelectItem value="2">2 - Fair</SelectItem>
                    <SelectItem value="3">3 - Good</SelectItem>
                    <SelectItem value="4">4 - Very Good</SelectItem>
                    <SelectItem value="5">5 - Excellent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status">
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="to-read">To Read</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="doi">DOI</Label>
                <Input id="doi" name="doi" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input id="url" name="url" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pages">Pages</Label>
                <Input id="pages" name="pages" placeholder="e.g., 45-67" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sampleSize">Sample Size</Label>
                <Input id="sampleSize" name="sampleSize" type="number" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="publisher">Publisher</Label>
              <Input id="publisher" name="publisher" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="methodology">Methodology Used in Source</Label>
              <Input id="methodology" name="methodology" placeholder="e.g., Experimental, Survey, Case Study..." />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input id="tags" name="tags" placeholder="e.g., quantitative, correlation, social learning" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords (comma-separated)</Label>
              <Input id="keywords" name="keywords" placeholder="e.g., learning, correlation, X, Y" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" />
            </div>
            
            <DialogFooter>
              <Button type="submit">Add Source</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Source Dialog */}
      {currentEntry && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Source</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditEntry} className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-author">Author</Label>
                  <Input 
                    id="edit-author" 
                    name="author" 
                    defaultValue={currentEntry.author} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input 
                    id="edit-title" 
                    name="title" 
                    defaultValue={currentEntry.title} 
                    required 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-year">Year</Label>
                  <Input 
                    id="edit-year" 
                    name="year" 
                    type="number" 
                    defaultValue={currentEntry.year} 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-sourceType">Source Type</Label>
                  <Select name="sourceType" defaultValue={currentEntry.sourceType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="journal">Journal Article</SelectItem>
                      <SelectItem value="book">Book</SelectItem>
                      <SelectItem value="conference">Conference Paper</SelectItem>
                      <SelectItem value="thesis">Thesis/Dissertation</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-purpose">Purpose</Label>
                <Textarea 
                  id="edit-purpose" 
                  name="purpose" 
                  defaultValue={currentEntry.purpose} 
                  required 
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-framework">Framework</Label>
                  <Textarea 
                    id="edit-framework" 
                    name="framework" 
                    defaultValue={currentEntry.framework || ""} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-methods">Methods</Label>
                  <Textarea 
                    id="edit-methods" 
                    name="methods" 
                    defaultValue={currentEntry.methods || ""} 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-results">Results</Label>
                <Textarea 
                  id="edit-results" 
                  name="results" 
                  defaultValue={currentEntry.results || ""} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-conclusions">Conclusions</Label>
                <Textarea 
                  id="edit-conclusions" 
                  name="conclusions" 
                  defaultValue={currentEntry.conclusions || ""} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-relevance">Relevance to Thesis</Label>
                <Textarea 
                  id="edit-relevance" 
                  name="relevance" 
                  defaultValue={currentEntry.relevance || ""} 
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-rating">Rating (1-5)</Label>
                  <Select name="rating" defaultValue={currentEntry.rating?.toString()}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Poor</SelectItem>
                      <SelectItem value="2">2 - Fair</SelectItem>
                      <SelectItem value="3">3 - Good</SelectItem>
                      <SelectItem value="4">4 - Very Good</SelectItem>
                      <SelectItem value="5">5 - Excellent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select name="status" defaultValue={currentEntry.status}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="to-read">To Read</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-doi">DOI</Label>
                  <Input 
                    id="edit-doi" 
                    name="doi" 
                    defaultValue={currentEntry.doi || ""} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-url">URL</Label>
                  <Input 
                    id="edit-url" 
                    name="url" 
                    defaultValue={currentEntry.url || ""} 
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-pages">Pages</Label>
                  <Input 
                    id="edit-pages" 
                    name="pages" 
                    defaultValue={currentEntry.pages || ""} 
                    placeholder="e.g., 45-67" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-sampleSize">Sample Size</Label>
                  <Input 
                    id="edit-sampleSize" 
                    name="sampleSize" 
                    type="number" 
                    defaultValue={currentEntry.sampleSize || ""} 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-publisher">Publisher</Label>
                <Input 
                  id="edit-publisher" 
                  name="publisher" 
                  defaultValue={currentEntry.publisher || ""} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-methodology">Methodology Used in Source</Label>
                <Input 
                  id="edit-methodology" 
                  name="methodology" 
                  defaultValue={currentEntry.methodology || ""} 
                  placeholder="e.g., Experimental, Survey, Case Study..." 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
                <Input 
                  id="edit-tags" 
                  name="tags" 
                  defaultValue={currentEntry.tags?.join(", ") || ""} 
                  placeholder="e.g., quantitative, correlation, social learning" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-keywords">Keywords (comma-separated)</Label>
                <Input 
                  id="edit-keywords" 
                  name="keywords" 
                  defaultValue={currentEntry.keywords?.join(", ") || ""} 
                  placeholder="e.g., learning, correlation, X, Y" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea 
                  id="edit-notes" 
                  name="notes" 
                  defaultValue={currentEntry.notes || ""} 
                />
              </div>
              
              <DialogFooter>
                <Button type="submit">Update Source</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}