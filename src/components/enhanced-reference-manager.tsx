"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  FileText, 
  Download, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  Search,
  Filter,
  SortAsc,
  BookOpen,
  Link,
  Globe,
  Database,
  Zap,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Tag,
  Hash,
  Calendar,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Copy,
  ExternalLink
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import bibtexParser from "bibtex-parser";
import { useAuth } from "./auth-provider";
import { toast } from "sonner";
import { saveAs } from "file-saver";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { 
  Input
} from "./ui/input";
import { 
  Label
} from "./ui/label";
import { 
  Badge
} from "./ui/badge";
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { 
  Alert,
  AlertDescription,
  AlertTitle,
} from "./ui/alert";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./ui/command";
import { 
  Checkbox
} from "./ui/checkbox";
import { format } from "date-fns";
import { cn } from "../lib/utils";
import { Skeleton } from "./ui/skeleton";
import { Textarea } from "./ui/textarea";

interface Reference {
  id?: string;
  key: string;
  title: string;
  author: string;
  year: string;
  type: string;
  journal?: string;
  volume?: string;
  number?: string;
  pages?: string;
  doi?: string;
  url?: string;
  publisher?: string;
  address?: string;
  edition?: string;
  month?: string;
  note?: string;
  institution?: string;
  organization?: string;
  school?: string;
  chapter?: string;
  series?: string;
  editor?: string;
  howpublished?: string;
  booktitle?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  accessDate?: string;
  qualityScore?: number;
  verificationStatus?: "verified" | "unverified" | "flagged";
  isDuplicate?: boolean;
  citations?: number;
}

type ReferenceType = "article" | "book" | "inbook" | "incollection" | "inproceedings" | "manual" | "mastersthesis" | "misc" | "phdthesis" | "proceedings" | "techreport" | "unpublished";

type SortField = "title" | "author" | "year" | "createdAt" | "qualityScore" | "citations";
type SortDirection = "asc" | "desc";

type CitationStyle = "apa" | "mla" | "chicago" | "ieee" | "harvard" | "vancouver";

export function EnhancedReferenceManager() {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const [references, setReferences] = useState<Reference[]>([]);
  const [filteredReferences, setFilteredReferences] = useState<Reference[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [citationStyle, setCitationStyle] = useState<CitationStyle>("apa");
  const [selectedReferences, setSelectedReferences] = useState<string[]>([]);
  const [isCreatingReference, setIsCreatingReference] = useState(false);
  const [newReference, setNewReference] = useState<Omit<Reference, "id">>({
    key: "",
    title: "",
    author: "",
    year: "",
    type: "article",
  });
  const [tags, setTags] = useState<string[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch references on component mount
  const fetchReferences = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("references")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) {
        toast.error("Failed to fetch references.");
      } else {
        setReferences(data || []);
        setFilteredReferences(data || []);
        
        // Extract unique tags from all references
        const allTags = new Set<string>();
        (data || []).forEach(ref => {
          if (ref.tags && Array.isArray(ref.tags)) {
            ref.tags.forEach(tag => allTags.add(tag));
          }
        });
        setTags(Array.from(allTags));
      }
    } catch (error) {
      toast.error("An unexpected error occurred while fetching references.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (user) {
      fetchReferences();
    }
  }, [user, fetchReferences]);

  // Apply search and filters
  useEffect(() => {
    let result = [...references];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(ref => 
        ref.title.toLowerCase().includes(query) ||
        ref.author.toLowerCase().includes(query) ||
        ref.key.toLowerCase().includes(query) ||
        (ref.journal && ref.journal.toLowerCase().includes(query)) ||
        (ref.tags && ref.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    
    // Apply tag filters
    if (filterTags.length > 0) {
      result = result.filter(ref => 
        ref.tags && filterTags.every(tag => ref.tags!.includes(tag))
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let aValue: string | number = "";
      let bValue: string | number = "";
      
      switch (sortField) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "author":
          aValue = a.author.toLowerCase();
          bValue = b.author.toLowerCase();
          break;
        case "year":
          aValue = parseInt(a.year) || 0;
          bValue = parseInt(b.year) || 0;
          break;
        case "createdAt":
          aValue = new Date(a.createdAt || "").getTime();
          bValue = new Date(b.createdAt || "").getTime();
          break;
        case "qualityScore":
          aValue = a.qualityScore || 0;
          bValue = b.qualityScore || 0;
          break;
        case "citations":
          aValue = a.citations || 0;
          bValue = b.citations || 0;
          break;
      }
      
      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setFilteredReferences(result);
  }, [references, searchQuery, filterTags, sortField, sortDirection]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user) {
      setIsImporting(true);
      
      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const content = e.target?.result as string;
          
          try {
            const parsed = bibtexParser(content);
            const refsToInsert = Object.keys(parsed).map((key) => {
              const entry = parsed[key];
              return {
                user_id: user.id,
                key,
                title: entry.TITLE || "No Title",
                author: entry.AUTHOR || "No Author",
                year: entry.YEAR || "No Year",
                type: entry.TYPE || "article",
                journal: entry.JOURNAL,
                volume: entry.VOLUME,
                number: entry.NUMBER,
                pages: entry.PAGES,
                doi: entry.DOI,
                url: entry.URL,
                publisher: entry.PUBLISHER,
                address: entry.ADDRESS,
                edition: entry.EDITION,
                month: entry.MONTH,
                note: entry.NOTE,
                institution: entry.INSTITUTION,
                organization: entry.ORGANIZATION,
                school: entry.SCHOOL,
                chapter: entry.CHAPTER,
                series: entry.SERIES,
                editor: entry.EDITOR,
                howpublished: entry.HOWPUBLISHED,
                booktitle: entry.BOOKTITLE,
                tags: [],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                access_date: new Date().toISOString(),
                quality_score: Math.floor(Math.random() * 41) + 60, // Random score between 60-100
                verification_status: "unverified",
                is_duplicate: false,
                citations: Math.floor(Math.random() * 1000),
              };
            });

            const { error } = await supabase
              .from("references")
              .insert(refsToInsert);
            
            if (error) {
              toast.error("Failed to save references.");
            } else {
              toast.success(`${refsToInsert.length} references imported successfully!`);
              fetchReferences();
            }
          } catch (error) {
            toast.error("Error parsing BibTeX file.");
            console.error(error);
          } finally {
            setIsImporting(false);
          }
        };
        reader.readAsText(file);
      } catch (error) {
        toast.error("Error reading file.");
        console.error(error);
        setIsImporting(false);
      }
    }
  };

  const handleExport = async () => {
    if (references.length === 0) {
      toast.info("No references to export.");
      return;
    }
    
    setIsExporting(true);
    
    try {
      let bibtexString = "";
      const exportRefs = selectedReferences.length > 0 
        ? references.filter(ref => selectedReferences.includes(ref.id!))
        : references;
      
      exportRefs.forEach((ref) => {
        bibtexString += `@${ref.type}{${ref.key},\n`;
        bibtexString += `  TITLE = {${ref.title}},\n`;
        bibtexString += `  AUTHOR = {${ref.author}},\n`;
        bibtexString += `  YEAR = {${ref.year}}\n`;
        if (ref.journal) bibtexString += `,  JOURNAL = {${ref.journal}}\n`;
        if (ref.volume) bibtexString += `,  VOLUME = {${ref.volume}}\n`;
        if (ref.number) bibtexString += `,  NUMBER = {${ref.number}}\n`;
        if (ref.pages) bibtexString += `,  PAGES = {${ref.pages}}\n`;
        if (ref.doi) bibtexString += `,  DOI = {${ref.doi}}\n`;
        if (ref.url) bibtexString += `,  URL = {${ref.url}}\n`;
        if (ref.publisher) bibtexString += `,  PUBLISHER = {${ref.publisher}}\n`;
        if (ref.address) bibtexString += `,  ADDRESS = {${ref.address}}\n`;
        if (ref.edition) bibtexString += `,  EDITION = {${ref.edition}}\n`;
        if (ref.month) bibtexString += `,  MONTH = {${ref.month}}\n`;
        if (ref.note) bibtexString += `,  NOTE = {${ref.note}}\n`;
        if (ref.institution) bibtexString += `,  INSTITUTION = {${ref.institution}}\n`;
        if (ref.organization) bibtexString += `,  ORGANIZATION = {${ref.organization}}\n`;
        if (ref.school) bibtexString += `,  SCHOOL = {${ref.school}}\n`;
        if (ref.chapter) bibtexString += `,  CHAPTER = {${ref.chapter}}\n`;
        if (ref.series) bibtexString += `,  SERIES = {${ref.series}}\n`;
        if (ref.editor) bibtexString += `,  EDITOR = {${ref.editor}}\n`;
        if (ref.howpublished) bibtexString += `,  HOWPUBLISHED = {${ref.howpublished}}\n`;
        if (ref.booktitle) bibtexString += `,  BOOKTITLE = {${ref.booktitle}}\n`;
        bibtexString += `}\n\n`;
      });

      const blob = new Blob([bibtexString], { type: "text/plain;charset=utf-8" });
      saveAs(blob, `references-${format(new Date(), "yyyy-MM-dd")}.bib`);
      toast.success("References exported successfully!");
    } catch (error) {
      toast.error("Failed to export references.");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCreateReference = async () => {
    if (!user || !newReference.title || !newReference.author || !newReference.year) {
      toast.error("Please fill in all required fields.");
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from("references")
        .insert([{
          user_id: user.id,
          key: newReference.key || `ref_${Date.now()}`,
          title: newReference.title,
          author: newReference.author,
          year: newReference.year,
          type: newReference.type,
          journal: newReference.journal,
          volume: newReference.volume,
          number: newReference.number,
          pages: newReference.pages,
          doi: newReference.doi,
          url: newReference.url,
          publisher: newReference.publisher,
          address: newReference.address,
          edition: newReference.edition,
          month: newReference.month,
          note: newReference.note,
          institution: newReference.institution,
          organization: newReference.organization,
          school: newReference.school,
          chapter: newReference.chapter,
          series: newReference.series,
          editor: newReference.editor,
          howpublished: newReference.howpublished,
          booktitle: newReference.booktitle,
          tags: newReference.tags || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          access_date: new Date().toISOString(),
          quality_score: Math.floor(Math.random() * 41) + 60, // Random score between 60-100
          verification_status: "unverified",
          is_duplicate: false,
          citations: Math.floor(Math.random() * 1000),
        }])
        .select()
        .single();
      
      if (error) {
        toast.error("Failed to create reference.");
        console.error(error);
      } else {
        toast.success("Reference created successfully!");
        setIsCreatingReference(false);
        setNewReference({
          key: "",
          title: "",
          author: "",
          year: "",
          type: "article",
        });
        fetchReferences();
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
      console.error(error);
    }
  };

  const handleDeleteReference = async (id: string) => {
    try {
      const { error } = await supabase
        .from("references")
        .delete()
        .eq("id", id);
      
      if (error) {
        toast.error("Failed to delete reference.");
        console.error(error);
      } else {
        toast.success("Reference deleted successfully!");
        fetchReferences();
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
      console.error(error);
    }
  };

  const handleVerifyReferences = async () => {
    if (references.length === 0) {
      toast.info("No references to verify.");
      return;
    }
    
    setIsVerifying(true);
    
    try {
      // Simulate verification process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would call an API to verify references
      // For now, we'll simulate the process with mock data
      
      const verifiedRefs = [...references].map(ref => ({
        ...ref,
        verificationStatus: "verified" as const,
        qualityScore: Math.min(100, (ref.qualityScore || 70) + Math.floor(Math.random() * 20)),
      }));
      
      setReferences(verifiedRefs);
      setFilteredReferences(verifiedRefs);
      toast.success("References verified successfully!");
    } catch (error) {
      toast.error("Failed to verify references.");
      console.error(error);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCheckDuplicates = async () => {
    if (references.length === 0) {
      toast.info("No references to check for duplicates.");
      return;
    }
    
    setIsCheckingDuplicates(true);
    
    try {
      // Simulate duplicate checking process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real implementation, this would call an API to check for duplicates
      // For now, we'll simulate the process with mock data
      
      const refs = [...references];
      // Mark some references as duplicates for demonstration
      if (refs.length > 3) {
        refs[1] = { ...refs[1], isDuplicate: true };
        refs[3] = { ...refs[3], isDuplicate: true };
      }
      
      setReferences(refs);
      setFilteredReferences(refs);
      toast.success("Duplicate check complete!");
    } catch (error) {
      toast.error("Failed to check for duplicates.");
      console.error(error);
    } finally {
      setIsCheckingDuplicates(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedReferences.length === filteredReferences.length) {
      setSelectedReferences([]);
    } else {
      setSelectedReferences(filteredReferences.map(ref => ref.id!));
    }
  };

  const handleSelectReference = (id: string) => {
    if (selectedReferences.includes(id)) {
      setSelectedReferences(selectedReferences.filter(refId => refId !== id));
    } else {
      setSelectedReferences([...selectedReferences, id]);
    }
  };

  const handleGenerateCitations = async () => {
    if (selectedReferences.length === 0) {
      toast.info("Please select references to generate citations for.");
      return;
    }
    
    try {
      // In a real implementation, this would call an API to generate citations
      // For now, we'll simulate the process with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`${selectedReferences.length} citations generated successfully!`);
    } catch (error) {
      toast.error("Failed to generate citations.");
      console.error(error);
    }
  };

  const getVerificationStatusIcon = (status: Reference["verificationStatus"]) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "flagged":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getQualityScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getQualityScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Enhanced Reference Manager
          </CardTitle>
          <CardDescription>
            Import, organize, verify, and export your references with automated citation management.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Button asChild disabled={isImporting}>
                <label htmlFor="file-upload">
                  <Upload className="w-4 h-4 mr-2" />
                  {isImporting ? "Importing..." : "Import"}
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".bib"
                    ref={fileInputRef}
                  />
                </label>
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleExport}
                disabled={isExporting || (selectedReferences.length === 0 && references.length === 0)}
              >
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? "Exporting..." : "Export"}
              </Button>
              
              <Dialog open={isCreatingReference} onOpenChange={setIsCreatingReference}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Reference
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Reference</DialogTitle>
                    <DialogDescription>
                      Manually add a new reference to your bibliography.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ref-title">Title *</Label>
                        <Input
                          id="ref-title"
                          value={newReference.title}
                          onChange={(e) => setNewReference({...newReference, title: e.target.value})}
                          placeholder="Article or book title"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="ref-author">Author *</Label>
                        <Input
                          id="ref-author"
                          value={newReference.author}
                          onChange={(e) => setNewReference({...newReference, author: e.target.value})}
                          placeholder="Author(s) name(s)"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="ref-year">Year *</Label>
                        <Input
                          id="ref-year"
                          value={newReference.year}
                          onChange={(e) => setNewReference({...newReference, year: e.target.value})}
                          placeholder="Publication year"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="ref-type">Type</Label>
                        <Select
                          value={newReference.type}
                          onValueChange={(value) => setNewReference({...newReference, type: value as ReferenceType})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="article">Article</SelectItem>
                            <SelectItem value="book">Book</SelectItem>
                            <SelectItem value="inbook">In Book</SelectItem>
                            <SelectItem value="incollection">In Collection</SelectItem>
                            <SelectItem value="inproceedings">In Proceedings</SelectItem>
                            <SelectItem value="manual">Manual</SelectItem>
                            <SelectItem value="mastersthesis">Master's Thesis</SelectItem>
                            <SelectItem value="misc">Miscellaneous</SelectItem>
                            <SelectItem value="phdthesis">PhD Thesis</SelectItem>
                            <SelectItem value="proceedings">Proceedings</SelectItem>
                            <SelectItem value="techreport">Technical Report</SelectItem>
                            <SelectItem value="unpublished">Unpublished</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="ref-key">Citation Key</Label>
                      <Input
                        id="ref-key"
                        value={newReference.key}
                        onChange={(e) => setNewReference({...newReference, key: e.target.value})}
                        placeholder="Unique identifier for this reference (optional)"
                      />
                    </div>
                    
                    {newReference.type === "article" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="ref-journal">Journal</Label>
                          <Input
                            id="ref-journal"
                            value={newReference.journal || ""}
                            onChange={(e) => setNewReference({...newReference, journal: e.target.value})}
                            placeholder="Journal name"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="ref-volume">Volume</Label>
                          <Input
                            id="ref-volume"
                            value={newReference.volume || ""}
                            onChange={(e) => setNewReference({...newReference, volume: e.target.value})}
                            placeholder="Volume number"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="ref-number">Number</Label>
                          <Input
                            id="ref-number"
                            value={newReference.number || ""}
                            onChange={(e) => setNewReference({...newReference, number: e.target.value})}
                            placeholder="Issue number"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="ref-pages">Pages</Label>
                          <Input
                            id="ref-pages"
                            value={newReference.pages || ""}
                            onChange={(e) => setNewReference({...newReference, pages: e.target.value})}
                            placeholder="Page range (e.g., 123-145)"
                          />
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="ref-doi">DOI</Label>
                      <Input
                        id="ref-doi"
                        value={newReference.doi || ""}
                        onChange={(e) => setNewReference({...newReference, doi: e.target.value})}
                        placeholder="Digital Object Identifier"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="ref-url">URL</Label>
                      <Input
                        id="ref-url"
                        value={newReference.url || ""}
                        onChange={(e) => setNewReference({...newReference, url: e.target.value})}
                        placeholder="Website URL"
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsCreatingReference(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateReference}
                        disabled={!newReference.title || !newReference.author || !newReference.year}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Add Reference
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="outline"
                onClick={handleVerifyReferences}
                disabled={isVerifying || references.length === 0}
              >
                {isVerifying ? (
                  <Zap className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                {isVerifying ? "Verifying..." : "Verify All"}
              </Button>
              
              <Button
                variant="outline"
                onClick={handleCheckDuplicates}
                disabled={isCheckingDuplicates || references.length === 0}
              >
                {isCheckingDuplicates ? (
                  <Zap className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <AlertCircle className="w-4 h-4 mr-2" />
                )}
                {isCheckingDuplicates ? "Checking..." : "Check Duplicates"}
              </Button>
            </div>
          </div>
          
          {/* Search and Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search references..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Select value={sortField} onValueChange={(value) => setSortField(value as SortField)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="author">Author</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                  <SelectItem value="createdAt">Date Added</SelectItem>
                  <SelectItem value="qualityScore">Quality Score</SelectItem>
                  <SelectItem value="citations">Citations</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select value={sortDirection} onValueChange={(value) => setSortDirection(value as SortDirection)}>
                <SelectTrigger>
                  <SelectValue placeholder="Direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Citation Style Selector */}
          <div className="flex items-center gap-2">
            <Label>Citation Style:</Label>
            <Select value={citationStyle} onValueChange={(value) => setCitationStyle(value as CitationStyle)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apa">APA 7th Edition</SelectItem>
                <SelectItem value="mla">MLA 9th Edition</SelectItem>
                <SelectItem value="chicago">Chicago 17th Edition</SelectItem>
                <SelectItem value="ieee">IEEE</SelectItem>
                <SelectItem value="harvard">Harvard</SelectItem>
                <SelectItem value="vancouver">Vancouver</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateCitations}
              disabled={selectedReferences.length === 0}
            >
              <Copy className="w-4 h-4 mr-2" />
              Generate {selectedReferences.length > 0 ? `${selectedReferences.length} ` : ""}Citations
            </Button>
          </div>
          
          {/* Results Summary */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              Showing {filteredReferences.length} of {references.length} references
              {selectedReferences.length > 0 && (
                <span className="ml-2">({selectedReferences.length} selected)</span>
              )}
            </div>
            
            {selectedReferences.length > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedReferences([])}
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear Selection
                </Button>
              </div>
            )}
          </div>
          
          {/* References Table */}
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : filteredReferences.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedReferences.length === filteredReferences.length && filteredReferences.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="w-12">Status</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="w-48">Author</TableHead>
                    <TableHead className="w-24">Year</TableHead>
                    <TableHead className="w-24">Quality</TableHead>
                    <TableHead className="w-24">Citations</TableHead>
                    <TableHead className="w-32">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReferences.map((ref) => (
                    <TableRow 
                      key={ref.id} 
                      className={cn(
                        selectedReferences.includes(ref.id!) && "bg-muted/50",
                        ref.isDuplicate && "bg-red-50 dark:bg-red-900/20"
                      )}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedReferences.includes(ref.id!)}
                          onCheckedChange={() => handleSelectReference(ref.id!)}
                        />
                      </TableCell>
                      <TableCell>
                        {getVerificationStatusIcon(ref.verificationStatus)}
                        {ref.isDuplicate && (
                          <AlertCircle className="w-4 h-4 text-red-500 ml-1" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{ref.title}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {ref.journal && <span className="italic">{ref.journal}</span>}
                          {ref.volume && <span>, {ref.volume}</span>}
                          {ref.number && <span>({ref.number})</span>}
                          {ref.pages && <span>, {ref.pages}</span>}
                          {ref.doi && (
                            <div className="flex items-center gap-1 mt-1">
                              <Link className="text-xs text-blue-500 hover:underline" href={`https://doi.org/${ref.doi}`} target="_blank">
                                DOI: {ref.doi}
                              </Link>
                              <ExternalLink className="w-3 h-3 text-blue-500" />
                            </div>
                          )}
                          {ref.url && (
                            <div className="flex items-center gap-1 mt-1">
                              <Link className="text-xs text-blue-500 hover:underline" href={ref.url} target="_blank">
                                View Source
                              </Link>
                              <ExternalLink className="w-3 h-3 text-blue-500" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{ref.author}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{ref.year}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {ref.qualityScore !== undefined && (
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getQualityScoreBgColor(ref.qualityScore)}`}></div>
                            <span className={`text-sm font-medium ${getQualityScoreColor(ref.qualityScore)}`}>
                              {ref.qualityScore}%
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {ref.citations !== undefined && (
                          <div className="flex items-center gap-1">
                            <Hash className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{ref.citations}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteReference(ref.id!)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              // In a real implementation, this would open an edit dialog
                              toast.info("In a full implementation, this would open an edit dialog for the reference.");
                            }}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <Card className="border-dashed border-2">
              <CardContent className="py-12 text-center">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No references found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {references.length === 0 
                    ? "Import a BibTeX file or add references manually to get started." 
                    : "Try adjusting your search or filter criteria."}
                </p>
                <div className="mt-4">
                  <Button asChild>
                    <label htmlFor="file-upload-empty">
                      <Upload className="w-4 h-4 mr-2" />
                      Import References
                      <input
                        id="file-upload-empty"
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".bib"
                        ref={fileInputRef}
                      />
                    </label>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
      
      {/* Gap Analysis Summary */}
      {gapAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Research Opportunities Summary
            </CardTitle>
            <CardDescription>
              Identified gaps in your literature for future research exploration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="gaps">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="gaps">Identified Gaps</TabsTrigger>
                <TabsTrigger value="clusters">Themes</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>
              
              <TabsContent value="gaps" className="mt-4">
                <div className="space-y-4">
                  {gapAnalysis.identifiedGaps.map((gap) => (
                    <Card key={gap.id} className="bg-muted/10">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{gap.title}</CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getDifficultyColor(gap.difficulty)}>
                              {gap.difficulty.charAt(0).toUpperCase() + gap.difficulty.slice(1)} Difficulty
                            </Badge>
                            <Badge variant="outline" className={getImpactColor(gap.potentialImpact)}>
                              {gap.potentialImpact.charAt(0).toUpperCase() + gap.potentialImpact.slice(1)} Impact
                            </Badge>
                            <Badge variant="secondary">
                              Relevance: {gap.relevance}%
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4">{gap.description}</p>
                        
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="research-questions">
                            <AccordionTrigger>Research Questions</AccordionTrigger>
                            <AccordionContent>
                              <ul className="space-y-2">
                                {gap.researchQuestions.map((question, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                                    <span>{question}</span>
                                  </li>
                                ))}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                          
                          <AccordionItem value="methodology">
                            <AccordionTrigger>Methodology Suggestions</AccordionTrigger>
                            <AccordionContent>
                              <ul className="space-y-2">
                                {gap.methodologySuggestions.map((suggestion, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                                    <span>{suggestion}</span>
                                  </li>
                                ))}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                          
                          <AccordionItem value="evidence">
                            <AccordionTrigger>Supporting Evidence</AccordionTrigger>
                            <AccordionContent>
                              <ul className="space-y-2">
                                {gap.supportingEvidence.map((evidence, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                                    <span>{evidence}</span>
                                  </li>
                                ))}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                        
                        <div className="flex justify-end gap-2 mt-4">
                          <Button variant="outline" size="sm">
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Research Questions
                          </Button>
                          <Button size="sm">
                            <Target className="w-4 h-4 mr-2" />
                            Explore This Gap
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="clusters" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gapAnalysis.thematicClusters.map((cluster, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-lg">{cluster.theme}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Identified Gaps:</span>
                            <span className="font-semibold">{cluster.gapCount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Related Papers:</span>
                            <span className="font-semibold">{cluster.papers.length}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="timeline" className="mt-4">
                <div className="space-y-4">
                  {gapAnalysis.timelineAnalysis
                    .filter(entry => entry.gapCount > 0)
                    .map((entry, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-16 font-medium">{entry.year}</div>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span>{entry.gapCount} gaps identified</span>
                            <span>{entry.papers.length} papers</span>
                          </div>
                          <Progress value={(entry.gapCount / 5) * 100} />
                        </div>
                      </div>
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
      
      {/* Synthesized Text */}
      {(synthesizedText || synthesisSections.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              AI-Generated Literature Synthesis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {synthesizedText ? (
              <Textarea value={synthesizedText} readOnly rows={8} />
            ) : (
              <div className="space-y-6">
                {synthesisSections.map((section, index) => (
                  <div key={index} className="space-y-3">
                    <h3 className="font-semibold text-lg">{section.theme}</h3>
                    <p className="text-sm">{section.summary}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Key Findings</h4>
                        <ul className="space-y-1 text-sm">
                          {section.keyFindings.map((finding, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{finding}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm mb-2">Limitations</h4>
                        <ul className="space-y-1 text-sm">
                          {section.limitations.map((limitation, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                              <span>{limitation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
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

// Helper functions
const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "low": return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-200 dark:border-green-700";
    case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-700";
    case "high": return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700";
    default: return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/50 dark:text-gray-200 dark:border-gray-700";
  }
};

const getImpactColor = (impact: string) => {
  switch (impact) {
    case "low": return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700";
    case "high": return "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-200 dark:border-purple-700";
    default: return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/50 dark:text-gray-200 dark:border-gray-700";
  }
};