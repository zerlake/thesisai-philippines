'use client';
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function CommTemplatesPage() {
  const { session, profile, isLoading } = useAuth();
  const [templates, setTemplates] = useState<any[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    category: "",
    content: "",
    purpose: "",
    usageCount: 0
  });

  // Sample communication templates data
  const sampleTemplates = [
    {
      id: 1,
      name: "Positive Feedback",
      category: "Encouragement",
      content: "Your work shows strong research skills and clear arguments. The analysis of the data is thorough and well-presented. Your writing is clear and engaging, making it easy to follow your line of reasoning. The sources you selected are credible and relevant to your topic. Continue this excellent work as you move forward with your project.",
      purpose: "General positive reinforcement",
      usageCount: 124,
      lastUsed: "2023-11-15",
      status: "Active",
      rating: 4.7
    },
    {
      id: 2,
      name: "Constructive Criticism",
      category: "Improvement",
      content: "While your topic is interesting and relevant, consider strengthening your methodology section. The sample size appears too small to support your broad generalizations. Additionally, the literature review could benefit from more recent sources to strengthen your argument. Please ensure all citations follow the required format consistently throughout the document.",
      purpose: "Addressing major weaknesses",
      usageCount: 89,
      lastUsed: "2023-11-14",
      status: "Active",
      rating: 4.5
    },
    {
      id: 3,
      name: "Citation Issues",
      category: "Technical",
      content: "Several citations do not follow the required format. Please review the citation guide for proper formatting. Specifically, ensure that all journal titles are italicized, volume numbers are in italics, and page ranges are formatted correctly. Also, verify that all in-text citations have corresponding entries in your reference list and vice versa.",
      purpose: "Addressing citation formatting",
      usageCount: 215,
      lastUsed: "2023-11-12",
      status: "Active",
      rating: 4.8
    },
    {
      id: 4,
      name: "Methodology Concerns",
      category: "Structure",
      content: "Your methodology section needs more detail to ensure reproducibility. Please provide more information about your data collection procedures and explain why you chose this particular approach. Consider addressing potential limitations of your methodology and how they might affect the interpretation of your results.",
      purpose: "Addressing methodology gaps",
      usageCount: 76,
      lastUsed: "2023-11-10",
      status: "Active",
      rating: 4.6
    },
    {
      id: 5,
      name: "Analysis Depth",
      category: "Content",
      content: "Your analysis would benefit from deeper critical thinking. Rather than simply describing your findings, please interpret what they mean in the context of your research question. Consider discussing the implications of your results and how they contribute to the existing body of knowledge in your field.",
      purpose: "Improving analytical depth",
      usageCount: 98,
      lastUsed: "2023-11-16",
      status: "Active",
      rating: 4.7
    },
    {
      id: 6,
      name: "Formatting Issues",
      category: "Technical",
      content: "There are several formatting issues throughout your document that need to be addressed. Ensure consistent heading styles, proper margin settings, and correct font specifications. Also, check that your figures and tables meet the required formatting standards and are properly labeled.",
      purpose: "Addressing formatting problems",
      usageCount: 142,
      lastUsed: "2023-11-18",
      status: "Active",
      rating: 4.5
    },
    {
      id: 7,
      name: "Strong Introduction",
      category: "Encouragement",
      content: "Your introduction effectively sets up the research problem and provides a clear rationale for your study. The way you positioned your research within the existing literature demonstrates good understanding of the field. Your thesis statement is clear and appropriately scoped. This strong foundation will serve your project well.",
      purpose: "Praising effective introduction",
      usageCount: 67,
      lastUsed: "2023-11-08",
      status: "Active",
      rating: 4.6
    },
    {
      id: 8,
      name: "Conclusion Improvements",
      category: "Structure",
      content: "Your conclusion needs to more clearly connect back to your research questions and objectives. Summarize your key findings more concisely and discuss their broader implications. Also, consider suggesting specific directions for future research based on the limitations you identified in your study.",
      purpose: "Improving conclusion section",
      usageCount: 54,
      lastUsed: "2023-11-05",
      status: "Active",
      rating: 4.4
    },
  ];

  useEffect(() => {
    // Load sample data on component mount
    setTemplates(sampleTemplates);
    setFilteredTemplates(sampleTemplates);
  }, []);

  useEffect(() => {
    // Filter templates based on category and search term
    let result = templates;

    if (selectedCategory !== "all") {
      result = result.filter(template => template.category === selectedCategory);
    }

    if (searchTerm) {
      result = result.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTemplates(result);
  }, [selectedCategory, searchTerm, templates]);

  const handleAddTemplate = () => {
    if (!newTemplate.name || !newTemplate.category || !newTemplate.content) return;

    const newTemplateObj = {
      id: templates.length + 1,
      name: newTemplate.name,
      category: newTemplate.category,
      content: newTemplate.content,
      purpose: newTemplate.purpose,
      usageCount: 0,
      lastUsed: "Never",
      status: "Active",
      rating: Math.random() * 0.5 + 4.0 // Random rating between 4.0-4.5
    };

    setTemplates([...templates, newTemplateObj]);
    setNewTemplate({
      name: "",
      category: "",
      content: "",
      purpose: "",
      usageCount: 0
    });
  };

  const categories = [...new Set(sampleTemplates.map(t => t.category))];

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
        <h1 className="text-3xl font-bold">Communication Templates</h1>
        <p className="text-muted-foreground">Predefined templates for efficient and consistent feedback</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Total Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{templates.length}</div>
            <p className="text-sm text-muted-foreground">Communication templates</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Avg. Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {templates.length > 0
                ? templates.reduce((sum, t) => sum + t.rating, 0) / templates.length
                : 0}
            </div>
            <p className="text-sm text-muted-foreground">Across all templates</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Total Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{templates.reduce((sum, t) => sum + t.usageCount, 0)}</div>
            <p className="text-sm text-muted-foreground">Times used in feedback</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Feedback Communication Templates</CardTitle>
              <CardDescription>Standardized templates for various types of feedback</CardDescription>
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
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button onClick={() => setNewTemplate({
                  name: "",
                  category: "",
                  content: "",
                  purpose: "",
                  usageCount: 0
                })}>New Template</Button>
              </div>

              <ScrollArea className="h-[400px] w-full rounded-md border">
                <div className="p-4 space-y-4">
                  {filteredTemplates.map((template) => (
                    <div key={template.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{template.name}</h4>
                          <p className="text-sm text-muted-foreground">{template.purpose}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{template.category}</Badge>
                          <Badge variant="secondary">{template.rating}/5.0</Badge>
                        </div>
                      </div>
                      <p className="mt-2 text-sm">{template.content}</p>
                      <div className="mt-3 flex justify-between items-center">
                        <div className="text-xs text-muted-foreground">
                          Used {template.usageCount} times | Last used: {template.lastUsed}
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">Use Template</Button>
                          <Button variant="outline" size="sm">Edit</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create New Template</CardTitle>
            <CardDescription>Design a new communication template</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="Template name"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
              />
              <Select value={newTemplate.category} onValueChange={(value) => setNewTemplate({...newTemplate, category: value})}>
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
                placeholder="Purpose/Use case"
                value={newTemplate.purpose}
                onChange={(e) => setNewTemplate({...newTemplate, purpose: e.target.value})}
              />
              <Textarea
                placeholder="Template content"
                value={newTemplate.content}
                onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
                rows={5}
              />
              <Button onClick={handleAddTemplate} className="w-full">Save Template</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Template Analytics</CardTitle>
          <CardDescription>Usage statistics and effectiveness metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[250px] w-full rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Last Used</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map(template => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell><Badge variant="outline">{template.category}</Badge></TableCell>
                    <TableCell>{template.usageCount}</TableCell>
                    <TableCell>{template.rating}/5.0</TableCell>
                    <TableCell>{template.lastUsed}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}