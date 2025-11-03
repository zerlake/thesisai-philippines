"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Plus,
  Search,
  Target,
  Map,
  Zap,
  Lightbulb,
  Network,
  Download,
  Upload,
  Save,
  RotateCcw,
  Trash2,
  Link,
  Unlink,
  Minus,
  PlusCircle,
  X,
  Brain,
  BookOpen,
  BarChart3,
  TrendingUp,
  Users
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "./auth-provider";

// Define types for our concept mapping system
type ConceptNode = {
  id: string;
  label: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  color?: string;
  description?: string;
  category?: string;
  connections: string[]; // IDs of connected nodes
};

type ConceptLink = {
  id: string;
  source: string; // Node ID
  target: string; // Node ID
  label?: string;
  type?: "hierarchical" | "associative" | "causal";
};

type ResearchQuestion = {
  id: string;
  text: string;
  relatedConcepts: string[];
  difficulty: "low" | "medium" | "high";
  relevance: number; // 0-100
};

type ConceptMap = {
  id: string;
  title: string;
  description: string;
  nodes: ConceptNode[];
  links: ConceptLink[];
  researchQuestions: ResearchQuestion[];
  createdAt: Date;
  updatedAt: Date;
};

// Mock data for research fields and sub-topics
const RESEARCH_FIELDS = [
  "Computer Science",
  "Education",
  "Business",
  "Health Sciences",
  "Psychology",
  "Engineering",
  "Environmental Science",
  "Social Sciences",
  "Mathematics",
  "Physics",
  "Biology",
  "Chemistry",
  "Medicine",
  "Law",
  "Art & Design"
];

const SAMPLE_CONCEPTS: Record<string, string[]> = {
  "Computer Science": [
    "Machine Learning",
    "Artificial Intelligence",
    "Data Science",
    "Cybersecurity",
    "Human-Computer Interaction",
    "Algorithms",
    "Software Engineering"
  ],
  "Education": [
    "Pedagogy",
    "Learning Theories",
    "Curriculum Design",
    "Educational Technology",
    "Assessment Methods",
    "Inclusive Education",
    "Educational Psychology"
  ],
  "Business": [
    "Strategic Management",
    "Marketing",
    "Finance",
    "Operations Research",
    "Organizational Behavior",
    "Entrepreneurship",
    "Supply Chain Management"
  ],
  "Health Sciences": [
    "Public Health",
    "Epidemiology",
    "Health Informatics",
    "Health Policy",
    "Clinical Research",
    "Health Economics",
    "Global Health"
  ]
};

export function ConceptMappingSystem() {
  const { session } = useAuth();
  const [conceptMap, setConceptMap] = useState<ConceptMap | null>(null);
  const [selectedNode, setSelectedNode] = useState<ConceptNode | null>(null);
  const [newNodeLabel, setNewNodeLabel] = useState("");
  const [newLinkLabel, setNewLinkLabel] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedField, setSelectedField] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestedConcepts, setSuggestedConcepts] = useState<ConceptNode[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [activeTab, setActiveTab] = useState<"map" | "questions" | "connections">("map");
  
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize a new concept map
  const initNewMap = () => {
    const newMap: ConceptMap = {
      id: `map-${Date.now()}`,
      title: "Untitled Concept Map",
      description: "Describe your concept map here",
      nodes: [],
      links: [],
      researchQuestions: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setConceptMap(newMap);
    setSelectedNode(null);
  };

  // Add a new node to the concept map
  const addNode = (label: string) => {
    if (!label.trim() || !conceptMap) return;
    
    const newNode: ConceptNode = {
      id: `node-${Date.now()}`,
      label: label.trim(),
      x: Math.random() * 600 + 100,
      y: Math.random() * 400 + 100,
      connections: [],
      category: "General"
    };
    
    setConceptMap(prev => {
      if (!prev) return null;
      return {
        ...prev,
        nodes: [...prev.nodes, newNode],
        updatedAt: new Date()
      };
    });
    
    setNewNodeLabel("");
  };

  // Add a new link between two nodes
  const addLink = (sourceId: string, targetId: string, label?: string) => {
    if (!conceptMap || sourceId === targetId) return;
    
    // Check if link already exists
    const linkExists = conceptMap.links.some(
      link => 
        (link.source === sourceId && link.target === targetId) ||
        (link.source === targetId && link.target === sourceId)
    );
    
    if (linkExists) {
      toast.error("Link already exists between these nodes");
      return;
    }
    
    const newLink: ConceptLink = {
      id: `link-${Date.now()}`,
      source: sourceId,
      target: targetId,
      label: label || "relates to"
    };
    
    setConceptMap(prev => {
      if (!prev) return null;
      return {
        ...prev,
        links: [...prev.links, newLink],
        updatedAt: new Date()
      };
    });
  };

  // Remove a node and its associated links
  const removeNode = (nodeId: string) => {
    if (!conceptMap) return;
    
    setConceptMap(prev => {
      if (!prev) return null;
      const updatedNodes = prev.nodes.filter(node => node.id !== nodeId);
      const updatedLinks = prev.links.filter(
        link => link.source !== nodeId && link.target !== nodeId
      );
      
      return {
        ...prev,
        nodes: updatedNodes,
        links: updatedLinks,
        updatedAt: new Date()
      };
    });
    
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  };

  // Remove a link
  const removeLink = (linkId: string) => {
    if (!conceptMap) return;
    
    setConceptMap(prev => {
      if (!prev) return null;
      return {
        ...prev,
        links: prev.links.filter(link => link.id !== linkId),
        updatedAt: new Date()
      };
    });
  };

  // Generate research questions based on concepts
  const generateResearchQuestions = () => {
    if (!conceptMap || conceptMap.nodes.length === 0) {
      toast.error("Add at least one concept to generate questions");
      return;
    }
    
    setIsGeneratingQuestions(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      const mockQuestions: ResearchQuestion[] = conceptMap.nodes.slice(0, 3).map((node, index) => ({
        id: `q-${Date.now()}-${index}`,
        text: `How does ${node.label} impact research in the field of ${selectedField || "your selected field"}?`,
        relatedConcepts: [node.id],
        difficulty: index % 3 === 0 ? "high" : index % 3 === 1 ? "medium" : "low",
        relevance: Math.floor(Math.random() * 40) + 60 // 60-100%
      }));
      
      setConceptMap(prev => {
        if (!prev) return null;
        return {
          ...prev,
          researchQuestions: [...prev.researchQuestions, ...mockQuestions],
          updatedAt: new Date()
        };
      });
      
      setIsGeneratingQuestions(false);
      toast.success("Research questions generated successfully!");
    }, 1500);
  };

  // Search for concepts based on field and search term
  const searchConcepts = () => {
    if (!selectedField || !searchTerm) {
      setSuggestedConcepts([]);
      setShowSuggestions(false);
      return;
    }
    
    const results = SAMPLE_CONCEPTS[selectedField]?.filter(concept =>
      concept.toLowerCase().includes(searchTerm.toLowerCase())
    ).map((label, index) => ({
      id: `search-${index}`,
      label,
      x: 0,
      y: 0,
      connections: [],
      category: selectedField
    })) || [];
    
    setSuggestedConcepts(results);
    setShowSuggestions(results.length > 0);
  };

  // Add selected suggestion to the map
  const addSuggestedConcept = (concept: ConceptNode) => {
    if (!conceptMap) {
      initNewMap();
    }
    
    // Wait for the map to be initialized
    setTimeout(() => {
      addNode(concept.label);
      setShowSuggestions(false);
      setSearchTerm("");
    }, 100);
  };

  // Handle save functionality
  const handleSave = async () => {
    if (!conceptMap) {
      toast.error("No concept map to save");
      return;
    }
    
    if (!session) {
      toast.error("You must be logged in to save concept maps");
      return;
    }
    
    // Simulate saving
    toast.success("Concept map saved successfully!");
  };

  // Initialize on first render
  useEffect(() => {
    initNewMap();
  }, []);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm && selectedField) {
        searchConcepts();
      } else {
        setSuggestedConcepts([]);
        setShowSuggestions(false);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm, selectedField]);

  // Get a color for a node based on its category
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Computer Science": "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700",
      "Education": "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-200 dark:border-green-700",
      "Business": "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/50 dark:text-purple-200 dark:border-purple-700",
      "Health Sciences": "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700",
      "General": "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/50 dark:text-gray-200 dark:border-gray-700",
      "Default": "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/50 dark:text-amber-200 dark:border-amber-700"
    };
    
    return colors[category] || colors["Default"];
  };

  // Get difficulty badge color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "low": return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-200 dark:border-green-700";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-200 dark:border-yellow-700";
      case "high": return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-200 dark:border-red-700";
      default: return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900/50 dark:text-gray-200 dark:border-gray-700";
    }
  };

  // Render a simple visualization of the concept map
  const renderVisualization = () => {
    if (!conceptMap || conceptMap.nodes.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-center p-8 bg-muted rounded-lg border-2 border-dashed">
          <Map className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No concepts added yet</h3>
          <p className="text-muted-foreground mb-4">
            Add your first concept to begin building your concept map
          </p>
          <Button onClick={() => addNode(newNodeLabel || "My First Concept")}>
            <Plus className="w-4 h-4 mr-2" />
            Add First Concept
          </Button>
        </div>
      );
    }

    // Calculate dimensions for the visualization
    const containerWidth = containerRef.current?.clientWidth || 800;
    const containerHeight = 500;
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;

    // Layout nodes in a circular pattern around the center
    const nodeCount = conceptMap.nodes.length;
    const radius = Math.min(containerWidth, containerHeight) * 0.3;
    
    const positionedNodes = conceptMap.nodes.map((node, index) => {
      const angle = (index * 2 * Math.PI) / nodeCount;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      return { ...node, x, y };
    });

    // Calculate min/max coordinates for scaling
    const minX = Math.min(...positionedNodes.map(n => n.x || 0));
    const maxX = Math.max(...positionedNodes.map(n => n.x || 0));
    const minY = Math.min(...positionedNodes.map(n => n.y || 0));
    const maxY = Math.max(...positionedNodes.map(n => n.y || 0));

    // Scale nodes to fit within the container with padding
    const padding = 100;
    const scaleX = (containerWidth - 2 * padding) / (maxX - minX || 1);
    const scaleY = (containerHeight - 2 * padding) / (maxY - minY || 1);
    const scale = Math.min(scaleX, scaleY, 1); // Don't scale up

    const scaledNodes = positionedNodes.map(node => ({
      ...node,
      x: padding + (node.x! - minX) * scale,
      y: padding + (node.y! - minY) * scale
    }));

    return (
      <div className="relative w-full h-[500px] bg-muted rounded-lg overflow-hidden">
        <svg 
          ref={svgRef} 
          width="100%" 
          height="100%" 
          className="w-full h-full"
        >
          {/* Render links */}
          {conceptMap.links.map(link => {
            const sourceNode = scaledNodes.find(n => n.id === link.source);
            const targetNode = scaledNodes.find(n => n.id === link.target);
            
            if (!sourceNode || !targetNode || !sourceNode.x || !sourceNode.y || !targetNode.x || !targetNode.y) {
              return null;
            }
            
            return (
              <g key={link.id}>
                <line
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke="#9CA3AF"
                  strokeWidth="2"
                  className="cursor-pointer"
                  onClick={() => removeLink(link.id)}
                />
                {link.label && (
                  <text
                    x={(sourceNode.x + targetNode.x) / 2}
                    y={(sourceNode.y + targetNode.y) / 2}
                    textAnchor="middle"
                    className="fill-current text-xs"
                    fill="#6B7280"
                  >
                    {link.label}
                  </text>
                )}
              </g>
            );
          })}
          
          {/* Render nodes */}
          {scaledNodes.map(node => (
            <g 
              key={node.id} 
              className="cursor-pointer"
              onClick={() => setSelectedNode(node)}
            >
              <circle
                cx={node.x}
                cy={node.y}
                r="30"
                className={`fill-current ${getCategoryColor(node.category || "General").split(' ')[0]}`}
                fill="#93C5FD"
                stroke="#1D4ED8"
                strokeWidth="2"
              />
              <text
                x={node.x}
                y={node.y}
                textAnchor="middle"
                className="fill-current"
                fill="#1F2937"
                fontWeight="bold"
                fontSize="12"
              >
                {node.label.length > 10 ? `${node.label.substring(0, 8)}...` : node.label}
              </text>
            </g>
          ))}
        </svg>
        
        {/* Add node controls */}
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
          <Input
            value={newNodeLabel}
            onChange={(e) => setNewNodeLabel(e.target.value)}
            placeholder="Add new concept..."
            className="flex-1 min-w-[200px]"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && newNodeLabel.trim()) {
                addNode(newNodeLabel);
              }
            }}
          />
          <Button 
            onClick={() => newNodeLabel.trim() && addNode(newNodeLabel)}
            disabled={!newNodeLabel.trim()}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Node
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                Enhanced Concept Mapping System
              </CardTitle>
              <CardDescription>
                Visualize and connect your research concepts with interactive mind mapping
              </CardDescription>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={initNewMap}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                New Map
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSave}
                disabled={!conceptMap}
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Concept Search and Field Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Research Field</label>
              <Select value={selectedField} onValueChange={setSelectedField}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a research field" />
                </SelectTrigger>
                <SelectContent>
                  {RESEARCH_FIELDS.map(field => (
                    <SelectItem key={field} value={field}>
                      {field}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Search Concepts</label>
              <div className="relative">
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search for concepts in selected field..."
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                
                {showSuggestions && (
                  <div className="absolute z-10 mt-1 w-full bg-background border rounded-md shadow-lg max-h-60 overflow-auto">
                    {suggestedConcepts.map((concept, index) => (
                      <div
                        key={index}
                        className="p-2 hover:bg-muted cursor-pointer flex items-center justify-between"
                        onClick={() => addSuggestedConcept(concept)}
                      >
                        <span>{concept.label}</span>
                        <PlusCircle className="w-4 h-4 text-primary" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Visualization */}
          <div ref={containerRef}>
            {renderVisualization()}
          </div>
          
          {/* Selected Node Details */}
          {selectedNode && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Node Details: {selectedNode.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Label</label>
                    <Input
                      value={selectedNode.label}
                      onChange={(e) => {
                        if (!conceptMap) return;
                        setConceptMap({
                          ...conceptMap,
                          nodes: conceptMap.nodes.map(node => 
                            node.id === selectedNode.id 
                              ? { ...node, label: e.target.value }
                              : node
                          ),
                          updatedAt: new Date()
                        });
                      }}
                      placeholder="Node label"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Select 
                      value={selectedNode.category || "General"} 
                      onValueChange={(value) => {
                        if (!conceptMap) return;
                        setConceptMap({
                          ...conceptMap,
                          nodes: conceptMap.nodes.map(node => 
                            node.id === selectedNode.id 
                              ? { ...node, category: value }
                              : node
                          ),
                          updatedAt: new Date()
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {RESEARCH_FIELDS.map(field => (
                          <SelectItem key={field} value={field}>
                            {field}
                          </SelectItem>
                        ))}
                        <SelectItem value="General">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={selectedNode.description || ""}
                    onChange={(e) => {
                      if (!conceptMap) return;
                      setConceptMap({
                        ...conceptMap,
                        nodes: conceptMap.nodes.map(node => 
                          node.id === selectedNode.id 
                            ? { ...node, description: e.target.value }
                            : node
                        ),
                        updatedAt: new Date()
                      });
                    }}
                    placeholder="Describe this concept..."
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => removeNode(selectedNode.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove Node
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Research Questions and Connections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Research Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-b">
            <nav className="flex space-x-8">
              <button
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "map"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setActiveTab("map")}
              >
                Concept Map
              </button>
              <button
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "questions"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setActiveTab("questions")}
              >
                Research Questions
              </button>
              <button
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "connections"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setActiveTab("connections")}
              >
                Cross-Field Connections
              </button>
            </nav>
          </div>

          <div className="py-6">
            {activeTab === "map" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Your Concept Map</h3>
                  <Button onClick={generateResearchQuestions} disabled={isGeneratingQuestions}>
                    {isGeneratingQuestions ? (
                      <>
                        <Zap className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Generate Research Questions
                      </>
                    )}
                  </Button>
                </div>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="info">
                    <AccordionTrigger>Map Information</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-muted p-4 rounded">
                          <p className="text-sm text-muted-foreground">Total Concepts</p>
                          <p className="text-2xl font-bold">
                            {conceptMap?.nodes.length || 0}
                          </p>
                        </div>
                        <div className="bg-muted p-4 rounded">
                          <p className="text-sm text-muted-foreground">Connections</p>
                          <p className="text-2xl font-bold">
                            {conceptMap?.links.length || 0}
                          </p>
                        </div>
                        <div className="bg-muted p-4 rounded">
                          <p className="text-sm text-muted-foreground">Research Questions</p>
                          <p className="text-2xl font-bold">
                            {conceptMap?.researchQuestions.length || 0}
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                {conceptMap?.nodes.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No concepts added yet</h3>
                    <p className="text-muted-foreground">
                      Start by adding concepts to your map using the visualization above
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Concept</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Connections</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {conceptMap?.nodes.map((node) => (
                        <TableRow key={node.id}>
                          <TableCell className="font-medium">{node.label}</TableCell>
                          <TableCell>
                            <Badge className={getCategoryColor(node.category || "General")}>
                              {node.category || "General"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {node.description || <span className="text-muted-foreground">No description</span>}
                          </TableCell>
                          <TableCell>{node.connections.length}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            )}
            
            {activeTab === "questions" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Research Questions</h3>
                  <Button 
                    onClick={generateResearchQuestions} 
                    disabled={isGeneratingQuestions || !conceptMap}
                  >
                    {isGeneratingQuestions ? (
                      <>
                        <Zap className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Lightbulb className="w-4 h-4 mr-2" />
                        Generate New Questions
                      </>
                    )}
                  </Button>
                </div>
                
                {conceptMap?.researchQuestions.length === 0 ? (
                  <div className="text-center py-8">
                    <Lightbulb className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No research questions yet</h3>
                    <p className="text-muted-foreground">
                      Generate research questions based on your concepts
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {conceptMap?.researchQuestions.map((question) => (
                      <Card key={question.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{question.text}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge className={getDifficultyColor(question.difficulty)}>
                                  {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)} difficulty
                                </Badge>
                                <Badge variant="outline">
                                  {question.relevance}% relevance
                                </Badge>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              <Target className="w-4 h-4 mr-2" />
                              Explore
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === "connections" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Cross-Field Connections</h3>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={async () => {
                      setIsLoading(true);
                      // Simulate analysis
                      await new Promise(resolve => setTimeout(resolve, 1500));
                      setIsLoading(false);
                      toast.success("Cross-field analysis completed!");
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <BarChart3 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Network className="w-4 h-4 mr-2" />
                        Analyze
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Field Relationships
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { field1: "Computer Science", field2: "Education", strength: 75 },
                          { field1: "Health Sciences", field2: "Psychology", strength: 85 },
                          { field1: "Business", field2: "Social Sciences", strength: 60 }
                        ].map((connection, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted rounded">
                            <div>
                              <p className="font-medium">{connection.field1} ↔ {connection.field2}</p>
                              <p className="text-sm text-muted-foreground">Related through concepts</p>
                            </div>
                            <Badge variant="secondary">{connection.strength}% connection</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Interdisciplinary Opportunities
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          "AI applications in education",
                          "Health informatics",
                          "Business psychology",
                          "Environmental economics"
                        ].map((opportunity, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 hover:bg-muted rounded">
                            <Lightbulb className="w-4 h-4 text-primary" />
                            <span>{opportunity}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Concept Linkage Analysis</CardTitle>
                    <CardDescription>
                      Identify relationships between concepts across different research fields
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-medium">Potential Interdisciplinary Connections</h4>
                        <div className="space-y-3">
                          {conceptMap?.nodes.map((node, index) => {
                            // Find related fields for each concept
                            const relatedFields = Object.entries(SAMPLE_CONCEPTS)
                              .filter(([field, concepts]) => 
                                concepts.some(c => 
                                  c.toLowerCase().includes(node.label.toLowerCase()) ||
                                  node.label.toLowerCase().includes(c.toLowerCase())
                                )
                              )
                              .map(([field]) => field)
                              .slice(0, 2);
                            
                            return (
                              <div key={node.id} className="p-3 border rounded-lg">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <p className="font-medium">{node.label}</p>
                                    <p className="text-sm text-muted-foreground">
                                      Connected to: {relatedFields.length > 0 ? relatedFields.join(", ") : "No direct connections identified"}
                                    </p>
                                  </div>
                                  <Button variant="outline" size="sm">
                                    <Link className="w-4 h-4" />
                                  </Button>
                                </div>
                                
                                {relatedFields.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {relatedFields.map((field, idx) => (
                                      <Badge key={idx} variant="secondary">
                                        {field}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-3">Cross-Field Visualization</h4>
                        <div className="aspect-square bg-muted rounded-lg p-4 flex items-center justify-center">
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="relative w-full h-full">
                              {/* Simulated visualization of cross-field connections */}
                              <div className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-blue-100 border-2 border-blue-300 flex items-center justify-center">
                                <span className="text-xs font-medium text-center px-2">CS</span>
                              </div>
                              
                              <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-green-100 border-2 border-green-300 flex items-center justify-center">
                                <span className="text-xs font-medium text-center px-2">Education</span>
                              </div>
                              
                              <div className="absolute bottom-1/4 right-1/3 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-purple-100 border-2 border-purple-300 flex items-center justify-center">
                                <span className="text-xs font-medium text-center px-2">Business</span>
                              </div>
                              
                              <div className="absolute top-1/2 right-1/4 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-red-100 border-2 border-red-300 flex items-center justify-center">
                                <span className="text-xs font-medium text-center px-2">Health</span>
                              </div>
                              
                              {conceptMap?.nodes.map((node, index) => {
                                const colors = ["blue", "green", "purple", "red"];
                                const color = colors[index % colors.length];
                                
                                return (
                                  <div 
                                    key={node.id}
                                    className={`absolute w-16 h-16 rounded-full bg-${color}-200 border-2 border-${color}-400 flex items-center justify-center`}
                                    style={{
                                      top: `${20 + (index % 3) * 30}%`,
                                      left: `${10 + (Math.floor(index / 3) * 30)}%`,
                                      transform: 'translate(-50%, -50%)'
                                    }}
                                  >
                                    <span className="text-xs font-medium text-center">
                                      {node.label.substring(0, 8)}...
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="font-medium mb-3">Suggested Cross-Field Research Directions</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingUp className="w-5 h-5 text-blue-500" />
                              <h5 className="font-medium">Computer Science + Education</h5>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Explore AI applications in educational technology, personalized learning systems, 
                              and automated assessment tools.
                            </p>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingUp className="w-5 h-5 text-green-500" />
                              <h5 className="font-medium">Health Sciences + Psychology</h5>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Investigate mental health interventions in clinical settings, 
                              behavioral change programs, and patient care improvements.
                            </p>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingUp className="w-5 h-5 text-purple-500" />
                              <h5 className="font-medium">Business + Social Sciences</h5>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Examine organizational behavior, consumer psychology, 
                              and market dynamics through an interdisciplinary lens.
                            </p>
                          </CardContent>
                        </Card>
                        
                        <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <TrendingUp className="w-5 h-5 text-amber-500" />
                              <h5 className="font-medium">Technology + Sustainability</h5>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Develop green technology solutions, environmental monitoring systems, 
                              and sustainable business practices.
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}