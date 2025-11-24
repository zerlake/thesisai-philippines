"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
;
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Search, 
  BookOpen, 
  Trash2, 
  FileText,
  Download,
  Copy
} from "lucide-react";

// Define types
type ReferenceType = "independent" | "dependent" | "intervening" | "moderating" | "control";

type Reference = {
  id: string;
  title: string;
  authors: string;
  year: number;
  type: ReferenceType;
  source: string;
  url?: string;
  citation: string;
  tags: string[];
  createdAt: Date;
};

// Main component
export function ReferenceManager() {
  const [references, setReferences] = useState<Reference[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [isAdding, setIsAdding] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedRef, _setSelectedRef] = useState<Reference | null>(null);
  
  const [newReference, setNewReference] = useState({
    title: "",
    authors: "",
    year: new Date().getFullYear(),
    type: "independent" as ReferenceType,
    source: "",
    tags: [] as string[],
  });

  // Filter references based on search and type
  const filteredReferences = references.filter(ref => {
    const matchesSearch = ref.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ref.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ref.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = selectedType === "all" || ref.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const handleAddReference = () => {
    if (!newReference.title || !newReference.authors) return;
    
    const newRef: Reference = {
      id: `ref-${Date.now()}`,
      title: newReference.title,
      authors: newReference.authors,
      year: newReference.year,
      type: newReference.type,
      source: newReference.source,
      citation: `${newReference.authors} (${newReference.year}). ${newReference.title}. ${newReference.source}.`,
      tags: newReference.tags,
      createdAt: new Date(),
    };
    
    setReferences([...references, newRef]);
    setNewReference({
      title: "",
      authors: "",
      year: new Date().getFullYear(),
      type: "independent",
      source: "",
      tags: [],
    });
    setIsAdding(false);
  };

  const handleDeleteReference = (id: string) => {
    setReferences(references.filter(ref => ref.id !== id));
  };

  const addSampleData = () => {
    const sampleReferences: Reference[] = [
      {
        id: `ref-${Date.now()}-1`,
        title: "The Impact of Social Media on Academic Performance",
        authors: "Dela Cruz, M.A., Santos, J.B.",
        year: 2023,
        type: "independent",
        source: "Journal of Educational Technology, 15(3), 45-67",
        citation: "Dela Cruz, M.A., & Santos, J.B. (2023). The impact of social media on academic performance. Journal of Educational Technology, 15(3), 45-67.",
        tags: ["social media", "academic performance", "students"],
        createdAt: new Date(),
      },
      {
        id: `ref-${Date.now()}-2`,
        title: "Student Engagement in Online Learning Environments",
        authors: "Reyes, C.D., Gonzales, P.E.",
        year: 2022,
        type: "dependent",
        source: "International Journal of E-Learning, 8(2), 123-145",
        citation: "Reyes, C.D., & Gonzales, P.E. (2022). Student engagement in online learning environments. International Journal of E-Learning, 8(2), 123-145.",
        tags: ["online learning", "student engagement", "education"],
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
      }
    ];
    
    setReferences(sampleReferences);
    setSearchTerm("");
    setSelectedType("all");
    
    alert("Sample references added! Browse different reference types and tags to see the management features.");
  };

  const getVariableColor = (type: ReferenceType) => {
    switch (type) {
      case "independent": return "bg-blue-100 text-blue-800 border-blue-300";
      case "dependent": return "bg-green-100 text-green-800 border-green-300";
      case "intervening": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "moderating": return "bg-purple-100 text-purple-800 border-purple-300";
      case "control": return "bg-gray-100 text-gray-800 border-gray-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getTypeIcon = (type: ReferenceType) => {
    switch (type) {
      case "independent": return "⚪"; // Circle
      case "dependent": return "🔷"; // Square
      case "intervening": return "🔶"; // Diamond 
      case "moderating": return "🔺"; // Triangle
      case "control": return "◇"; // Rhombus
      default: return "⚫"; // Default circle
    }
  };

  const _updateVariable = (_updatedVariable: Reference) => {
    // Reserved for future reference update functionality
    // setReferences(references.map(ref => ref.id === updatedVariable.id ? updatedVariable : ref));
  };

  // Render the component
  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reference Manager</h1>
          <p className="text-muted-foreground">Manage your citations and bibliography</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addSampleData}>
            <FileText className="w-4 h-4 mr-2" />
            Add Sample Data
          </Button>
          <Dialog open={isAdding} onOpenChange={setIsAdding}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Reference
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Reference</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">Title</Label>
                  <Input
                    id="title"
                    className="col-span-3"
                    value={newReference.title}
                    onChange={(e) => setNewReference({...newReference, title: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="authors" className="text-right">Authors</Label>
                  <Input
                    id="authors"
                    className="col-span-3"
                    value={newReference.authors}
                    onChange={(e) => setNewReference({...newReference, authors: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="year" className="text-right">Year</Label>
                  <Input
                    id="year"
                    type="number"
                    className="col-span-3"
                    value={newReference.year}
                    onChange={(e) => setNewReference({...newReference, year: parseInt(e.target.value) || new Date().getFullYear()})}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">Type</Label>
                  <Select value={newReference.type} onValueChange={(value: ReferenceType) => setNewReference({...newReference, type: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="independent">Independent Variable</SelectItem>
                      <SelectItem value="dependent">Dependent Variable</SelectItem>
                      <SelectItem value="intervening">Intervening Variable</SelectItem>
                      <SelectItem value="moderating">Moderating Variable</SelectItem>
                      <SelectItem value="control">Control Variable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="source" className="text-right">Source</Label>
                  <Input
                    id="source"
                    className="col-span-3"
                    value={newReference.source}
                    onChange={(e) => setNewReference({...newReference, source: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tags" className="text-right">Tags</Label>
                  <Input
                    id="tags"
                    placeholder="Comma separated tags"
                    className="col-span-3"
                    value={newReference.tags.join(", ")}
                    onChange={(e) => setNewReference({
                      ...newReference, 
                      tags: e.target.value.split(",").map(tag => tag.trim()).filter(tag => tag)
                    })}
                  />
                </div>
              </div>
              <Button onClick={handleAddReference} disabled={!newReference.title || !newReference.authors}>
                Add Reference
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search references..."
            className="pl-8 w-full sm:w-80"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="independent">Independent</SelectItem>
            <SelectItem value="dependent">Dependent</SelectItem>
            <SelectItem value="intervening">Intervening</SelectItem>
            <SelectItem value="moderating">Moderating</SelectItem>
            <SelectItem value="control">Control</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:w-[400px]">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="citations">Citations</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredReferences.length > 0 ? (
              filteredReferences.map((ref) => (
                <Card key={ref.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getTypeIcon(ref.type)}</span>
                        <CardTitle className="text-base line-clamp-2">{ref.title}</CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteReference(ref.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">{ref.authors} ({ref.year})</div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{ref.source}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {ref.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Added: {ref.createdAt.toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <BookOpen className="mx-auto h-12 w-12 mb-4" />
                <p>No references found. Add your first reference to get started.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="citations" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Generated Citations</CardTitle>
              <CardDescription>
                Your references formatted in various citation styles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {references.length > 0 ? (
                  references.map((ref, index) => (
                    <div key={ref.id} className="p-3 bg-muted rounded-md">
                      <div className="font-medium text-sm mb-1">{index + 1}. {ref.citation}</div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-3 h-3 mr-1" />
                          Export
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="mx-auto h-12 w-12 mb-4" />
                    <p>Add references to generate citations</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Variable Details Modal */}
      {showDetails && selectedRef && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">{selectedRef.title}</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowDetails(false)}
                >
                  Close
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Type</h4>
                  <Badge className={getVariableColor(selectedRef.type)}>
                    {selectedRef.type.charAt(0).toUpperCase() + selectedRef.type.slice(1)}
                  </Badge>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Authors</h4>
                  <p className="mt-1">{selectedRef.authors}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Year</h4>
                  <p className="mt-1">{selectedRef.year}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Source</h4>
                  <p className="mt-1">{selectedRef.source}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Tags</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedRef.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Citation</h4>
                  <p className="mt-1 text-sm bg-muted p-3 rounded-md">{selectedRef.citation}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}