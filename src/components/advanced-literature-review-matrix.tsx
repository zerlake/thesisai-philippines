// Advanced Literature Review Matrix with AI-powered synthesis and research knowledge base integration

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
  AlertCircle,
  Sparkles,
  GitBranch,
  Brain,
  BookOpen,
  Target,
  Lightbulb
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  // AI-powered fields
  aiSummary?: string; // AI-generated summary
  researchGaps?: string[]; // AI-identified research gaps
  strengths?: string[]; // AI-identified strengths
  limitations?: string[]; // AI-identified limitations
  thematicConnections?: number[]; // IDs of thematically connected sources
  thematicCategory?: string; // AI-assigned thematic category
  qualityScore?: number; // AI-assessed quality score (1-10)
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
    sampleSize: 500,
    // AI-powered fields
    aiSummary: "This study found a significant positive correlation between X and Y using a survey methodology with 500 participants.",
    researchGaps: ["Limited to Western contexts", "No longitudinal follow-up", "Sample bias towards educated population"],
    strengths: ["Large sample size", "Rigorous methodology", "Validated instruments"],
    limitations: ["Self-report bias", "Cross-sectional design", "Limited generalizability"],
    thematicConnections: [3],
    thematicCategory: "Quantitative Methods",
    qualityScore: 8
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
    methodology: "Meta-analysis",
    // AI-powered fields
    aiSummary: "A comprehensive meta-analysis showing Z has a weak but consistent effect across studies.",
    researchGaps: ["Limited to English-language studies", "No examination of age effects", "Moderator analysis incomplete"],
    strengths: ["Comprehensive coverage", "Systematic approach", "Large number of studies included"],
    limitations: ["Heterogeneity between studies", "Publication bias possible"],
    thematicConnections: [3, 5],
    thematicCategory: "Literature Review",
    qualityScore: 9
  },
  {
    id: 3,
    author: "Johnson & Lee",
    title: "Exploring A through B",
    year: 2021,
    purpose: "To explore the relationship between A and B.",
    framework: "Constructivist Framework",
    methods: "Qualitative Interviews",
    results: "Identified 5 key factors influencing A through B.",
    conclusions: "A is predominantly influenced by B in specific contexts.",
    relevance: "Provides qualitative complement to quantitative findings.",
    notes: "Important for mixed-methods approach.",
    tags: ["qualitative", "interviews", "constructivist"],
    rating: 4,
    status: "completed",
    sourceType: "journal",
    doi: "10.1000/journal.11111",
    url: "https://example.com/article3",
    pages: "234-256",
    publisher: "Example Academic Press",
    keywords: ["qualitative", "interviews", "A", "B"],
    methodology: "Phenomenological",
    sampleSize: 25,
    // AI-powered fields
    aiSummary: "Qualitative study using interviews to identify 5 key factors influencing A through B.",
    researchGaps: ["Small sample size", "Limited context", "No follow-up interviews"],
    strengths: ["Rich data", "In-depth exploration", "Theoretical insights"],
    limitations: ["Small sample", "Limited generalizability", "Potential researcher bias"],
    thematicConnections: [1],
    thematicCategory: "Qualitative Methods",
    qualityScore: 7
  },
  {
    id: 4,
    author: "Rodriguez et al.",
    title: "Modern Approaches to Data Analysis",
    year: 2024,
    purpose: "To examine modern data analysis techniques.",
    framework: "Mixed Methods Framework",
    methods: "Mixed Methods",
    results: "Hybrid approaches yield better insights than single-method approaches.",
    conclusions: "Combining quantitative and qualitative methods enhances research validity.",
    relevance: "Supports my mixed-methods approach.",
    notes: "Critical for methodology chapter.",
    tags: ["mixed-methods", "analysis", "hybrid"],
    rating: 5,
    status: "completed",
    sourceType: "journal",
    doi: "10.1000/journal.22222",
    url: "https://example.com/article4",
    pages: "56-78",
    publisher: "Example Academic Press",
    keywords: ["mixed-methods", "data", "analysis"],
    methodology: "Mixed Methods",
    sampleSize: 120,
    // AI-powered fields
    aiSummary: "Mixed methods study demonstrating that combining quantitative and qualitative approaches enhances research validity.",
    researchGaps: ["Limited domain coverage", "Narrow case studies", "Limited generalization"],
    strengths: ["Methodological rigor", "Comprehensive approach", "Triangulation of findings"],
    limitations: ["Complexity of analysis", "Time intensive", "Requires multiple expertise"],
    thematicConnections: [2, 5],
    thematicCategory: "Mixed Methods",
    qualityScore: 9
  },
  {
    id: 5,
    author: "Thompson & Davis",
    title: "Understanding User Experience Trends",
    year: 2023,
    purpose: "To identify emerging trends in user experience.",
    framework: "User-Centered Design",
    methods: "Case Study",
    results: "Simplicity and accessibility are the dominant trends.",
    conclusions: "User expectations continue to evolve rapidly.",
    relevance: "Provides context for user interface considerations.",
    notes: "Useful for design chapter.",
    tags: ["case-study", "ux", "trends"],
    rating: 3,
    status: "in-progress",
    sourceType: "journal",
    doi: "10.1000/journal.33333",
    url: "https://example.com/article5",
    pages: "89-102",
    publisher: "Example Academic Press",
    keywords: ["user-experience", "trends", "interface"],
    methodology: "Case Study",
    sampleSize: 40,
    // AI-powered fields
    aiSummary: "Case study analysis identifying key trends in user experience design.",
    researchGaps: ["Limited sample size", "Single domain focus", "Short-term analysis"],
    strengths: ["Detailed insights", "Real-world application", "Rich descriptions"],
    limitations: ["Limited generalizability", "Context-specific findings"],
    thematicConnections: [2, 4],
    thematicCategory: "Case Study",
    qualityScore: 6
  },
];

// Import OpenRouter API service
import { OpenRouterAPI } from "../services/openrouter-api";

export function AdvancedLiteratureReviewMatrix() {
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
  const [activeTab, setActiveTab] = useState("matrix");
  const [aiSynthesis, setAiSynthesis] = useState("");
  const [thematicClusters, setThematicClusters] = useState<{[key: string]: number[]}>({});
  const [researchGaps, setResearchGaps] = useState<{id: number, gap: string}[]>([]);
  const [isGeneratingSynthesis, setIsGeneratingSynthesis] = useState(false);
  
  // Initialize OpenRouter API
  const openRouterAPI = new OpenRouterAPI();
  
  // Refs for export functionality
  const tableRef = useRef<HTMLDivElement>(null);

  // Filter and sort entries based on search, filter, and sort criteria
  const filteredAndSortedEntries = (() => {
    // First, ensure all entries have unique IDs to prevent React key warnings
    const uniqueEntries = entries.reduce((acc, entry) => {
      let uniqueId = entry.id;
      // If this ID already exists in our accumulator, find a new one
      while (acc.some(e => e.id === uniqueId)) {
        uniqueId = Math.max(...acc.map(e => e.id), 0) + 1;
      }
      acc.push({...entry, id: uniqueId});
      return acc;
    }, []);

    return uniqueEntries
      .filter(entry => {
        const matchesSearch = searchTerm === "" || 
          entry.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.results.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.keywords?.some(kw => kw.toLowerCase().includes(searchTerm.toLowerCase())) ||
          entry.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
          entry.aiSummary?.toLowerCase().includes(searchTerm.toLowerCase());
        
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
        if (sortField === "year" || sortField === "sampleSize" || sortField === "qualityScore") {
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
  })();

  // Get unique source types for filter
  const sourceTypes = Array.from(new Set(entries.map(entry => entry.sourceType).filter(Boolean))) as string[];

  // Get unique thematic categories
  const thematicCategories = Array.from(new Set(entries.map(entry => entry.thematicCategory).filter(Boolean))) as string[];

  // Group entries by thematic category
  useEffect(() => {
    const clusters: {[key: string]: number[]} = {};
    
    entries.forEach(entry => {
      if (entry.thematicCategory) {
        if (!clusters[entry.thematicCategory]) {
          clusters[entry.thematicCategory] = [];
        }
        clusters[entry.thematicCategory].push(entry.id);
      }
    });
    
    setThematicClusters(clusters);
  }, [entries]);

  // Extract research gaps from all entries
  useEffect(() => {
    const gaps: {id: number, gap: string}[] = [];
    
    entries.forEach(entry => {
      if (entry.researchGaps) {
        entry.researchGaps.forEach(gap => {
          gaps.push({id: entry.id, gap});
        });
      }
    });
    
    setResearchGaps(gaps);
  }, [entries]);

  // AI-powered synthesis using OpenRouter API
  const generateAISynthesis = async () => {
    setIsGeneratingSynthesis(true);
    
    try {
      // Create a prompt for the AI to synthesize the literature
      const literatureData = entries.map(entry => {
        return `
Title: ${entry.title}
Author: ${entry.author}
Year: ${entry.year}
Purpose: ${entry.purpose}
Methods: ${entry.methods}
Results: ${entry.results}
Conclusions: ${entry.conclusions}
Framework: ${entry.framework}
Research Gaps: ${entry.researchGaps?.join(", ") || "Not specified"}
Strengths: ${entry.strengths?.join(", ") || "Not specified"}
Limitations: ${entry.limitations?.join(", ") || "Not specified"}
        `.trim();
      }).join("\n---\n");

      const prompt = `
      Please analyze and synthesize the following literature sources. Provide:

      1. Main themes across the literature
      2. Common research gaps identified
      3. Key strengths and limitations of the studies
      4. Methodological approaches used
      5. Potential areas for future research
      6. How these sources connect to each other

      Literature Sources:
      ${literatureData}

      Format your response in clear sections with headers.
      `;

      const response = await openRouterAPI.chatCompletion({
        model: "openai/gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });

      const synthesis = response.choices[0].message.content as string;
      setAiSynthesis(synthesis);
    } catch (error) {
      console.error("Error generating AI synthesis:", error);
      setAiSynthesis("Error generating synthesis. Please try again later.");
    } finally {
      setIsGeneratingSynthesis(false);
    }
  };

  // AI-powered source addition with analysis (integration with research knowledge base)
  const addSourceFromKnowledgeBase = async (source: any) => {
    // Create a new entry with minimal data first
    const newEntry: MatrixEntry = {
      id: entries.length > 0 ? Math.max(...entries.map(e => e.id)) + 1 : 1,
      author: source.author || "Unknown Author",
      title: source.title || "Untitled Source",
      year: source.year || new Date().getFullYear(),
      purpose: source.purpose || source.abstract?.substring(0, 100) + "..." || "",
      framework: source.framework || "N/A",
      methods: source.methods || "Not specified",
      results: source.results || source.abstract?.substring(0, 150) + "..." || "",
      conclusions: source.conclusions || "Not specified",
      relevance: "To be determined",
      notes: "Added from research knowledge base",
      tags: source.tags || [],
      rating: source.rating || 3,
      status: "to-read",
      sourceType: source.type || "journal",
      doi: source.doi || "",
      url: source.url || "",
      pages: source.pages || "",
      publisher: source.publisher || "",
      keywords: source.keywords || [],
      methodology: source.methodology || "Not specified",
      sampleSize: source.sampleSize || undefined,
      // Initialize AI fields as empty
      aiSummary: "AI analysis pending...",
      researchGaps: [],
      strengths: [],
      limitations: [],
      thematicCategory: "Pending classification",
      qualityScore: 0
    };
    
    // Add the entry to the state first
    setEntries(prevEntries => [...prevEntries, newEntry]);
    
    // Now analyze the source using AI
    try {
      const prompt = `
      Analyze this research paper comprehensively:

      Title: ${newEntry.title}
      Author: ${newEntry.author}
      Year: ${newEntry.year}
      Purpose: ${newEntry.purpose}
      Methods: ${newEntry.methods}
      Results: ${newEntry.results}
      Conclusions: ${newEntry.conclusions}
      Framework: ${newEntry.framework}
      Sample Size: ${newEntry.sampleSize || 'Not specified'}

      Provide the following analysis in JSON format:
      {
        "summary": "Brief summary of the paper",
        "strengths": ["Strength 1", "Strength 2", "Strength 3"],
        "limitations": ["Limitation 1", "Limitation 2", "Limitation 3"],
        "qualityScore": Number between 1-10 (based on methodological rigor, sample size, impact, etc.),
        "thematicCategory": "One of: Quantitative Methods, Qualitative Methods, Literature Review, Theoretical Framework, Empirical Study, Mixed Methods, Case Study, Experimental Design, Survey Research, etc.",
        "researchGaps": ["Gap 1", "Gap 2"]
      }
      `;

      const response = await openRouterAPI.chatCompletion({
        model: "openai/gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });

      const content = response.choices[0].message.content as string;
      
      // Try to parse the JSON response
      let parsedResponse;
      try {
        // Extract JSON from the response if it's wrapped in code blocks
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Could not extract JSON from response");
        }
      } catch (parseError) {
        console.warn("Could not parse AI analysis JSON:", parseError);
        // Fallback: extract information from the text
        parsedResponse = {
          summary: content.substring(0, 200) + "...",
          strengths: ["AI analysis in progress"],
          limitations: ["AI analysis in progress"],
          qualityScore: 5,
          thematicCategory: "Analysis pending",
          researchGaps: ["AI analysis pending"]
        };
      }

      // Update the entry with AI analysis
      setEntries(prevEntries => 
        prevEntries.map(entry => 
          entry.id === newEntry.id 
            ? { 
                ...entry, 
                aiSummary: parsedResponse.summary,
                strengths: parsedResponse.strengths,
                limitations: parsedResponse.limitations,
                qualityScore: parsedResponse.qualityScore,
                thematicCategory: parsedResponse.thematicCategory,
                researchGaps: parsedResponse.researchGaps
              } 
            : entry
        )
      );
    } catch (error) {
      console.error("Error analyzing source with AI:", error);
      
      // Update the entry with error information
      setEntries(prevEntries => 
        prevEntries.map(entry => 
          entry.id === newEntry.id 
            ? { 
                ...entry, 
                aiSummary: "Error in AI analysis",
                strengths: ["Analysis failed"],
                limitations: ["Analysis failed"],
                qualityScore: 0,
                thematicCategory: "Analysis failed",
                researchGaps: ["Analysis failed"]
              } 
            : entry
        )
      );
    }
  };

  const handleAddEntry = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    // Create a new entry with initial data
    const newEntry: MatrixEntry = {
      id: entries.length > 0 ? Math.max(...entries.map(e => e.id)) + 1 : 1,
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
      sampleSize: parseInt(formData.get("sampleSize") as string, 10) || undefined,
      // Initialize AI fields as empty
      aiSummary: "AI analysis pending...",
      researchGaps: [],
      strengths: [],
      limitations: [],
      thematicCategory: "Pending classification",
      qualityScore: 0
    };

    // Add the entry to the state first
    setEntries(prevEntries => [...prevEntries, newEntry]);
    setIsAddDialogOpen(false);
    
    // Now analyze the source using AI in the background
    try {
      const prompt = `
      Analyze this research paper comprehensively:

      Title: ${newEntry.title}
      Author: ${newEntry.author}
      Year: ${newEntry.year}
      Purpose: ${newEntry.purpose}
      Methods: ${newEntry.methods}
      Results: ${newEntry.results}
      Conclusions: ${newEntry.conclusions}
      Framework: ${newEntry.framework}
      Sample Size: ${newEntry.sampleSize || 'Not specified'}

      Provide the following analysis in JSON format:
      {
        "summary": "Brief summary of the paper",
        "strengths": ["Strength 1", "Strength 2", "Strength 3"],
        "limitations": ["Limitation 1", "Limitation 2", "Limitation 3"],
        "qualityScore": Number between 1-10 (based on methodological rigor, sample size, impact, etc.),
        "thematicCategory": "One of: Quantitative Methods, Qualitative Methods, Literature Review, Theoretical Framework, Empirical Study, Mixed Methods, Case Study, Experimental Design, Survey Research, etc.",
        "researchGaps": ["Gap 1", "Gap 2"]
      }
      `;

      const response = await openRouterAPI.chatCompletion({
        model: "openai/gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      });

      const content = response.choices[0].message.content as string;
      
      // Try to parse the JSON response
      let parsedResponse;
      try {
        // Extract JSON from the response if it's wrapped in code blocks
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Could not extract JSON from response");
        }
      } catch (parseError) {
        console.warn("Could not parse AI analysis JSON:", parseError);
        // Fallback: extract information from the text
        parsedResponse = {
          summary: content.substring(0, 200) + "...",
          strengths: ["AI analysis in progress"],
          limitations: ["AI analysis in progress"],
          qualityScore: 5,
          thematicCategory: "Analysis pending",
          researchGaps: ["AI analysis pending"]
        };
      }

      // Update the entry with AI analysis
      setEntries(prevEntries => 
        prevEntries.map(entry => 
          entry.id === newEntry.id 
            ? { 
                ...entry, 
                aiSummary: parsedResponse.summary,
                strengths: parsedResponse.strengths,
                limitations: parsedResponse.limitations,
                qualityScore: parsedResponse.qualityScore,
                thematicCategory: parsedResponse.thematicCategory,
                researchGaps: parsedResponse.researchGaps
              } 
            : entry
        )
      );
    } catch (error) {
      console.error("Error analyzing new source with AI:", error);
      
      // Update the entry with error information
      setEntries(prevEntries => 
        prevEntries.map(entry => 
          entry.id === newEntry.id 
            ? { 
                ...entry, 
                aiSummary: "Error in AI analysis",
                strengths: ["Analysis failed"],
                limitations: ["Analysis failed"],
                qualityScore: 0,
                thematicCategory: "Analysis failed",
                researchGaps: ["Analysis failed"]
              } 
            : entry
        )
      );
    }
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
      sampleSize: parseInt(formData.get("sampleSize") as string, 10) || undefined,
      // Preserve AI fields or update them
      aiSummary: currentEntry.aiSummary,
      researchGaps: currentEntry.researchGaps,
      strengths: currentEntry.strengths,
      limitations: currentEntry.limitations,
      thematicCategory: currentEntry.thematicCategory,
      qualityScore: currentEntry.qualityScore
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

  const handleExport = (format: "csv" | "docx" | "pdf") => {
    if (format === "csv") {
      // Create CSV content
      const headers = [
        "ID", "Author", "Title", "Year", "Purpose", "Framework", 
        "Methods", "Results", "Conclusions", "Relevance", "Notes", "Tags", 
        "Rating", "Status", "Source Type", "DOI", "URL", "Pages", "Publisher",
        "Keywords", "Methodology", "Sample Size", "AI Summary", "Research Gaps",
        "Strengths", "Limitations", "Thematic Category", "Quality Score"
      ].join(",");
      
      const rows = filteredAndSortedEntries.map(entry => [
        entry.id,
        `"${entry.author}"`,
        `"${entry.title}"`,
        entry.year,
        `"${entry.purpose}"`,
        `"${entry.framework}"`,
        `"${entry.methods}"`,
        `"${entry.results}"`,
        `"${entry.conclusions}"`,
        `"${entry.relevance}"`,
        `"${entry.notes}"`,
        `"${entry.tags?.join("; ") || ""}"`,
        entry.rating || "",
        `"${entry.status || ""}"`,
        `"${entry.sourceType || ""}"`,
        `"${entry.doi || ""}"`,
        `"${entry.url || ""}"`,
        `"${entry.pages || ""}"`,
        `"${entry.publisher || ""}"`,
        `"${entry.keywords?.join("; ") || ""}"`,
        `"${entry.methodology || ""}"`,
        entry.sampleSize || "",
        `"${entry.aiSummary || ""}"`,
        `"${entry.researchGaps?.join("; ") || ""}"`,
        `"${entry.strengths?.join("; ") || ""}"`,
        `"${entry.limitations?.join("; ") || ""}"`,
        `"${entry.thematicCategory || ""}"`,
        entry.qualityScore || ""
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

  // Simulate connecting to research knowledge base
  const connectToResearchKnowledgeBase = () => {
    // In a real implementation, this would connect to an API to fetch relevant sources
    // For now, we'll simulate adding a few sources
    const mockSources = [
      {
        author: "Research AI",
        title: "Recent Advances in AI in Education",
        year: 2024,
        purpose: "To review recent developments in AI applications in educational settings",
        framework: "Technology Acceptance Model",
        methods: "Systematic Review",
        results: "AI implementations show 23% improvement in learning outcomes",
        conclusions: "AI tools significantly enhance educational effectiveness",
        type: "journal"
      },
      {
        author: "AI Scholar",
        title: "Synthesis of Quantitative Studies on Learning Analytics",
        year: 2023,
        purpose: "To synthesize findings from quantitative studies on learning analytics",
        framework: "Big Data Analytics Framework",
        methods: "Meta-analysis",
        results: "Learning analytics improve student performance by 15%",
        conclusions: "Data-driven approaches enhance educational outcomes",
        type: "journal"
      }
    ];
    
    mockSources.forEach(source => {
      addSourceFromKnowledgeBase(source);
    });
    
    alert("Connected to research knowledge base and added 2 relevant sources");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Advanced Literature Review Matrix
              <Badge variant="secondary" className="text-xs">
                {entries.length} sources
              </Badge>
            </CardTitle>
            <CardDescription>
              Organize, analyze, and synthesize your research sources for Chapter II with AI-powered insights.
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
                  <SelectItem value="qualityScore">Quality Score</SelectItem>
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
              
              <Button onClick={connectToResearchKnowledgeBase} variant="outline">
                <GitBranch className="w-4 h-4 mr-2" />
                From Research Base
              </Button>
              
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Source
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="matrix">Matrix</TabsTrigger>
            <TabsTrigger value="synthesis">AI Synthesis</TabsTrigger>
            <TabsTrigger value="gaps">Research Gaps</TabsTrigger>
            <TabsTrigger value="clusters">Thematic Clusters</TabsTrigger>
          </TabsList>
          
          <TabsContent value="matrix" className="mt-4">
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
                    <TableHead>AI Score</TableHead>
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
                        {entry.qualityScore && (
                          <div className="flex items-center gap-1">
                            {entry.qualityScore}/10
                            <div className="w-16 bg-gray-200 rounded-full h-1.5">
                              <div 
                                className={`h-1.5 rounded-full ${
                                  entry.qualityScore >= 8 ? 'bg-green-500' : 
                                  entry.qualityScore >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                                }`} 
                                style={{ width: `${entry.qualityScore * 10}%` }}
                              ></div>
                            </div>
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
                              <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                alert(`AI Summary: ${entry.aiSummary || "Not available"}`);
                              }}>
                                <Brain className="w-4 h-4 mr-2" />
                                View AI Summary
                              </DropdownMenuItem>
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
                    
                    {selectedEntry.strengths && selectedEntry.strengths.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-1 mt-2 flex items-center">
                          <Target className="w-4 h-4 mr-2 text-green-500" />
                          Strengths (AI-identified)
                        </h4>
                        <ul className="list-disc pl-6 text-sm">
                          {selectedEntry.strengths.map((strength, idx) => (
                            <li key={`strength-${selectedEntry.id}-${idx}`}>{strength}</li>
                          ))}
                        </ul>
                      </div>
                    )}
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
                    
                    {selectedEntry.researchGaps && selectedEntry.researchGaps.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-1 mt-2 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-2 text-orange-500" />
                          Research Gaps (AI-identified)
                        </h4>
                        <ul className="list-disc pl-6 text-sm">
                          {selectedEntry.researchGaps.map((gap, idx) => (
                            <li key={`gap-${selectedEntry.id}-${idx}`}>{gap}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {selectedEntry.limitations && selectedEntry.limitations.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-1 mt-2">Limitations (AI-identified)</h4>
                        <ul className="list-disc pl-6 text-sm">
                          {selectedEntry.limitations.map((limitation, idx) => (
                            <li key={`limitation-${selectedEntry.id}-${idx}`}>{limitation}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
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
                
                {selectedEntry.aiSummary && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <h4 className="font-medium mb-1 flex items-center">
                      <Sparkles className="w-4 h-4 mr-2 text-blue-500" />
                      AI-Powered Summary
                    </h4>
                    <p className="text-sm">{selectedEntry.aiSummary}</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="synthesis" className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-blue-500" />
                AI-Powered Literature Synthesis
              </h3>
              <Button onClick={generateAISynthesis} disabled={isGeneratingSynthesis}>
                {isGeneratingSynthesis ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Synthesis
                  </>
                )}
              </Button>
            </div>
            
            {aiSynthesis ? (
              <div className="p-4 border rounded-md bg-muted/30 whitespace-pre-wrap">
                {aiSynthesis}
              </div>
            ) : (
              <div className="p-8 text-center border-2 border-dashed rounded-md">
                <Sparkles className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">No research gaps identified yet</p>
                <p className="text-sm text-gray-400 mt-2">Add sources with AI analysis to identify research gaps</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="clusters" className="mt-4">
            <div className="flex items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <GitBranch className="w-5 h-5 mr-2 text-green-500" />
                Thematic Clusters
              </h3>
              <Badge variant="outline" className="ml-2">
                {Object.keys(thematicClusters).length} clusters
              </Badge>
            </div>
            
            {Object.keys(thematicClusters).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(thematicClusters).map(([category, ids]) => (
                  <div key={category} className="p-4 border rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">{category}</h4>
                      <Badge variant="outline">{ids.length} sources</Badge>
                    </div>
                    <div className="space-y-2">
                      {ids.map(id => {
                        const source = entries.find(e => e.id === id);
                        return source ? (
                          <div key={id} className="text-sm p-2 bg-muted rounded">
                            <span className="font-medium">{source.author}. </span>
                            <span className="italic">{source.title}</span>
                            <span className="ml-2 text-xs text-gray-500">({source.year})</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center border-2 border-dashed rounded-md">
                <GitBranch className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">No thematic clusters identified yet</p>
                <p className="text-sm text-gray-400 mt-2">AI will group sources by thematic similarity</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {/* Add Source Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <PlusCircle className="w-5 h-5 mr-2" />
              Add New Source
            </DialogTitle>
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
              <DialogTitle className="flex items-center">
                <Edit3 className="w-5 h-5 mr-2" />
                Edit Source
              </DialogTitle>
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