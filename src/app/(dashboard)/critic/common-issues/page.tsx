'use client';
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CommonIssuesPage() {
  const { session, profile, isLoading } = useAuth();
  const [issues, setIssues] = useState<any[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [newIssue, setNewIssue] = useState({
    category: "",
    issue: "",
    description: "",
    frequency: "Medium",
    severity: "Medium",
    resolution: "",
    example: ""
  });

  // Sample common issues data
  const sampleIssues = [
    { id: 1, category: "Citations", issue: "Incomplete reference entries", description: "Missing required fields in reference entries", frequency: "High", severity: "Medium", resolution: "Use a reference manager and verify all required fields are filled", example: "Missing page numbers, incomplete journal names, missing DOI", lastUpdated: "2023-11-15", status: "Active", occurrence: 245 },
    { id: 2, category: "Structure", issue: "Unclear thesis statement", description: "Thesis statement is vague or not arguable", frequency: "Medium", severity: "High", resolution: "Revise to be specific, arguable, and clear", example: "Instead of 'This paper discusses climate change', use 'Climate change mitigation requires immediate global policy reform'", lastUpdated: "2023-11-10", status: "Active", occurrence: 187 },
    { id: 3, category: "Language", issue: "Grammatical errors", description: "Frequent grammatical mistakes throughout document", frequency: "High", severity: "Low", resolution: "Use grammar checking tools and proofread multiple times", example: "Subject-verb disagreement, incorrect tense usage, comma splices", lastUpdated: "2023-11-08", status: "Active", occurrence: 523 },
    { id: 4, category: "Methodology", issue: "Insufficient sample size", description: "Sample size is too small to support conclusions", frequency: "Low", severity: "High", resolution: "Increase sample size or acknowledge limitations", example: "Survey with only 15 participants used to make broad generalizations", lastUpdated: "2023-11-12", status: "Active", occurrence: 89 },
    { id: 5, category: "Citations", issue: "Inconsistent citation style", description: "Switching between different citation formats within document", frequency: "Medium", severity: "Medium", resolution: "Choose one style and apply consistently", example: "Mixing APA and MLA formats in same document", lastUpdated: "2023-11-05", status: "Active", occurrence: 156 },
    { id: 6, category: "Analysis", issue: "Superficial analysis", description: "Analysis lacks depth and critical thinking", frequency: "High", severity: "High", resolution: "Dig deeper into data and provide more interpretation", example: "Simply describing results without explaining implications", lastUpdated: "2023-11-18", status: "Active", occurrence: 298 },
    { id: 7, category: "Structure", issue: "Poor paragraph organization", description: "Paragraphs lack focus or logical flow", frequency: "Medium", severity: "Medium", resolution: "Ensure each paragraph has a clear topic sentence", example: "Multiple ideas in single paragraph", lastUpdated: "2023-11-14", status: "Active", occurrence: 176 },
    { id: 8, category: "Language", issue: "Informal tone", description: "Using casual language in academic writing", frequency: "High", severity: "Low", resolution: "Maintain formal academic tone throughout", example: "Using contractions, slang, or personal pronouns", lastUpdated: "2023-11-16", status: "Active", occurrence: 312 },
  ];

  useEffect(() => {
    // Load sample data on component mount
    setIssues(sampleIssues);
    setFilteredIssues(sampleIssues);
  }, []);

  useEffect(() => {
    // Filter issues based on category and search term
    let result = issues;

    if (selectedCategory !== "all") {
      result = result.filter(issue => issue.category === selectedCategory);
    }

    if (searchTerm) {
      result = result.filter(issue =>
        issue.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredIssues(result);
  }, [selectedCategory, searchTerm, issues]);

  const handleAddIssue = () => {
    if (!newIssue.category || !newIssue.issue || !newIssue.description) return;

    const newIssueObj = {
      id: issues.length + 1,
      category: newIssue.category,
      issue: newIssue.issue,
      description: newIssue.description,
      frequency: newIssue.frequency,
      severity: newIssue.severity,
      resolution: newIssue.resolution,
      example: newIssue.example,
      lastUpdated: new Date().toISOString().split('T')[0],
      status: "Active",
      occurrence: Math.floor(Math.random() * 100) + 50 // Random occurrence count
    };

    setIssues([...issues, newIssueObj]);
    setNewIssue({
      category: "",
      issue: "",
      description: "",
      frequency: "Medium",
      severity: "Medium",
      resolution: "",
      example: ""
    });
  };

  const categories = [...new Set(sampleIssues.map(i => i.category))];

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
        <h1 className="text-3xl font-bold">Common Issues Library</h1>
        <p className="text-muted-foreground">Catalog of frequently encountered problems in academic writing</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Total Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{issues.length}</div>
            <p className="text-sm text-muted-foreground">Documented common issues</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">High Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{issues.filter(i => i.severity === "High").length}</div>
            <p className="text-sm text-muted-foreground">Critical issues to address</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Total Occurrences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{issues.reduce((sum, i) => sum + i.occurrence, 0)}</div>
            <p className="text-sm text-muted-foreground">Issues detected in reviews</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Issue Catalog</CardTitle>
              <CardDescription>Identify, categorize, and address recurring problems</CardDescription>
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
                  placeholder="Search issues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <ScrollArea className="h-[400px] w-full rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Issue</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Occurrences</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIssues.map((issue) => (
                      <TableRow key={issue.id}>
                        <TableCell><Badge variant="outline">{issue.category}</Badge></TableCell>
                        <TableCell className="font-medium">{issue.issue}</TableCell>
                        <TableCell>
                          <Badge variant={issue.frequency === "High" ? "default" : issue.frequency === "Medium" ? "secondary" : "outline"}>
                            {issue.frequency}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={issue.severity === "High" ? "destructive" : issue.severity === "Medium" ? "default" : "secondary"}>
                            {issue.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>{issue.occurrence}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">Details</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Report New Issue</CardTitle>
            <CardDescription>Document a new common issue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Select value={newIssue.category} onValueChange={(value) => setNewIssue({...newIssue, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Issue title"
                value={newIssue.issue}
                onChange={(e) => setNewIssue({...newIssue, issue: e.target.value})}
              />
              <Textarea
                placeholder="Issue description"
                value={newIssue.description}
                onChange={(e) => setNewIssue({...newIssue, description: e.target.value})}
                rows={3}
              />
              <div className="grid grid-cols-2 gap-4">
                <Select value={newIssue.frequency} onValueChange={(value) => setNewIssue({...newIssue, frequency: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={newIssue.severity} onValueChange={(value) => setNewIssue({...newIssue, severity: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Textarea
                placeholder="Resolution steps"
                value={newIssue.resolution}
                onChange={(e) => setNewIssue({...newIssue, resolution: e.target.value})}
                rows={2}
              />
              <Textarea
                placeholder="Example"
                value={newIssue.example}
                onChange={(e) => setNewIssue({...newIssue, example: e.target.value})}
                rows={2}
              />
              <Button onClick={handleAddIssue} className="w-full">Report Issue</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Issue Analysis</CardTitle>
          <CardDescription>Overview of common issues by category and severity</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] w-full rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Total Issues</TableHead>
                  <TableHead>High Severity</TableHead>
                  <TableHead>Avg. Occurrences</TableHead>
                  <TableHead>Most Common</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map(category => {
                  const categoryIssues = issues.filter(i => i.category === category);
                  const highSeverity = categoryIssues.filter(i => i.severity === "High").length;
                  const avgOccurrences = categoryIssues.length > 0
                    ? categoryIssues.reduce((sum, i) => sum + i.occurrence, 0) / categoryIssues.length
                    : 0;
                  const mostCommon = categoryIssues.length > 0
                    ? categoryIssues.reduce((prev, current) => (prev.occurrence > current.occurrence) ? prev : current)
                    : { issue: "No issues" };

                  return (
                    <TableRow key={category}>
                      <TableCell className="font-medium">{category}</TableCell>
                      <TableCell>{categoryIssues.length}</TableCell>
                      <TableCell>{highSeverity}</TableCell>
                      <TableCell>{avgOccurrences.toFixed(1)}</TableCell>
                      <TableCell>{mostCommon.issue}</TableCell>
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