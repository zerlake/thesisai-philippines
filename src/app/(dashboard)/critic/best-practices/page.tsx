'use client';
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function BestPracticesPage() {
  const { session, profile, isLoading } = useAuth();
  const [practices, setPractices] = useState<any[]>([]);
  const [filteredPractices, setFilteredPractices] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [newPractice, setNewPractice] = useState({
    title: "",
    category: "",
    description: "",
    implementation: "",
    examples: ""
  });

  // Sample best practices data
  const samplePractices = [
    { id: 1, title: "Clear Thesis Statement", category: "Structure", description: "Ensure the thesis statement is clear, concise, and arguable.", implementation: "Place the thesis statement at the end of the introduction paragraph", examples: "Instead of: 'This paper will discuss climate change.' Use: 'Climate change mitigation requires immediate global cooperation through policy reform and technological innovation.'", lastUpdated: "2023-11-15", status: "Active", rating: 4.8 },
    { id: 2, title: "Proper Citations", category: "Citations", description: "Follow the required citation style consistently throughout the document.", implementation: "Use a reference manager to maintain consistent citation format", examples: "APA: (Smith, 2023, p. 45) | MLA: (Smith 45) | Chicago: Smith, 2023, 45", lastUpdated: "2023-11-10", status: "Active", rating: 4.7 },
    { id: 3, title: "Logical Flow", category: "Organization", description: "Maintain logical progression between paragraphs and sections.", implementation: "Use transition sentences to connect ideas between paragraphs", examples: "Use phrases like 'Building on this point,' or 'However, this view is challenged by...'", lastUpdated: "2023-11-08", status: "Active", rating: 4.6 },
    { id: 4, title: "Evidence-Based Arguments", category: "Arguments", description: "Support claims with credible evidence and sources.", implementation: "Provide at least 2-3 sources for each major claim", examples: "According to recent studies (Johnson, 2022; Lee & Kim, 2023), the correlation is significant.", lastUpdated: "2023-11-12", status: "Active", rating: 4.9 },
    { id: 5, title: "Consistent Tone", category: "Style", description: "Maintain an academic tone throughout the document.", implementation: "Avoid contractions, slang, and personal pronouns when possible", examples: "Use 'it is important to note' instead of 'it's important to note'", lastUpdated: "2023-11-05", status: "Active", rating: 4.5 },
    { id: 6, title: "Proper Headings", category: "Format", description: "Use consistent heading hierarchy according to style guide", implementation: "Follow the specific heading structure required by your institution", examples: "Level 1: Centered, Bold, Title Case | Level 2: Left-Aligned, Bold, Title Case", lastUpdated: "2023-11-18", status: "Active", rating: 4.4 },
    { id: 7, title: "Clear Transitions", category: "Organization", description: "Use transition words to connect ideas between paragraphs", implementation: "Start paragraphs with transition words that show relationships", examples: "Furthermore, However, Similarly, In contrast, As a result", lastUpdated: "2023-11-14", status: "Active", rating: 4.6 },
    { id: 8, title: "Strong Topic Sentences", category: "Structure", description: "Begin each paragraph with a clear topic sentence", implementation: "Each paragraph should have a topic sentence that relates to the thesis", examples: "The economic impact of renewable energy adoption is substantial. Research shows...", lastUpdated: "2023-11-16", status: "Active", rating: 4.7 },
  ];

  useEffect(() => {
    // Load sample data on component mount
    setPractices(samplePractices);
    setFilteredPractices(samplePractices);
  }, []);

  useEffect(() => {
    // Filter practices based on category and search term
    let result = practices;

    if (selectedCategory !== "all") {
      result = result.filter(practice => practice.category === selectedCategory);
    }

    if (searchTerm) {
      result = result.filter(practice =>
        practice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        practice.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        practice.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPractices(result);
  }, [selectedCategory, searchTerm, practices]);

  const handleAddPractice = () => {
    if (!newPractice.title || !newPractice.category || !newPractice.description) return;

    const newPracticeObj = {
      id: practices.length + 1,
      title: newPractice.title,
      category: newPractice.category,
      description: newPractice.description,
      implementation: newPractice.implementation,
      examples: newPractice.examples,
      lastUpdated: new Date().toISOString().split('T')[0],
      status: "Active",
      rating: Math.random() * 0.5 + 4.5 // Random rating between 4.5-5.0
    };

    setPractices([...practices, newPracticeObj]);
    setNewPractice({
      title: "",
      category: "",
      description: "",
      implementation: "",
      examples: ""
    });
  };

  const categories = [...new Set(samplePractices.map(p => p.category))];

  // Check if user is authenticated and has critic role
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!session || !profile || profile.role !== 'critic') {
    return <div>Please log in as a critic to access this page</div>;
  }

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Best Practices Guide</h1>
        <p className="text-muted-foreground">Comprehensive guide to academic writing best practices</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Total Practices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{practices.length}</div>
            <p className="text-sm text-muted-foreground">Curated best practices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Avg. Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {practices.length > 0
                ? practices.reduce((sum, p) => sum + p.rating, 0) / practices.length
                : 0}
            </div>
            <p className="text-sm text-muted-foreground">Across all practices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{categories.length}</div>
            <p className="text-sm text-muted-foreground">Practice areas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Best Practices Library</CardTitle>
              <CardDescription>Guidelines and recommendations for high-quality academic work</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Search practices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <ScrollArea className="h-[400px] w-full rounded-md border">
                <Accordion type="single" collapsible className="w-full">
                  {filteredPractices.map((practice) => (
                    <AccordionItem key={practice.id} value={`item-${practice.id}`}>
                      <AccordionTrigger className="py-3">
                        <div className="flex justify-between items-center w-full">
                          <span>{practice.title}</span>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary">{practice.category}</Badge>
                            <Badge variant="outline">{practice.rating}/5.0</Badge>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3">
                          <p><span className="font-medium">Description:</span> {practice.description}</p>
                          <p><span className="font-medium">Implementation:</span> {practice.implementation}</p>
                          <p><span className="font-medium">Examples:</span> {practice.examples}</p>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Last updated: {practice.lastUpdated}</span>
                            <span>Status: {practice.status}</span>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add New Practice</CardTitle>
            <CardDescription>Contribute to the best practices library</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="Practice title"
                value={newPractice.title}
                onChange={(e) => setNewPractice({...newPractice, title: e.target.value})}
              />
              <Select value={newPractice.category} onValueChange={(value) => setNewPractice({...newPractice, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Description"
                value={newPractice.description}
                onChange={(e) => setNewPractice({...newPractice, description: e.target.value})}
                rows={3}
              />
              <Textarea
                placeholder="Implementation guidelines"
                value={newPractice.implementation}
                onChange={(e) => setNewPractice({...newPractice, implementation: e.target.value})}
                rows={3}
              />
              <Textarea
                placeholder="Examples"
                value={newPractice.examples}
                onChange={(e) => setNewPractice({...newPractice, examples: e.target.value})}
                rows={3}
              />
              <Button onClick={handleAddPractice} className="w-full">Add Practice</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Practice Statistics</CardTitle>
          <CardDescription>Overview of best practices by category</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[250px] w-full rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Avg. Rating</TableHead>
                  <TableHead>Most Popular</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map(category => {
                  const categoryPractices = practices.filter(p => p.category === category);
                  const avgRating = categoryPractices.length > 0
                    ? categoryPractices.reduce((sum, p) => sum + p.rating, 0) / categoryPractices.length
                    : 0;
                  const mostPopular = categoryPractices.length > 0
                    ? categoryPractices.reduce((prev, current) => (prev.rating > current.rating) ? prev : current)
                    : { title: "No practices" };

                  return (
                    <TableRow key={category}>
                      <TableCell className="font-medium">{category}</TableCell>
                      <TableCell>{categoryPractices.length}</TableCell>
                      <TableCell>{avgRating.toFixed(2)}</TableCell>
                      <TableCell>{mostPopular.title}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}