'use client';
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function FormatSpecsPage() {
  const { session, profile, isLoading } = useAuth();
  const [specifications, setSpecifications] = useState<any[]>([]);
  const [activeSpec, setActiveSpec] = useState<any>(null);
  const [newSpec, setNewSpec] = useState({
    name: "",
    version: "",
    description: "",
    institution: "",
    category: "Academic"
  });

  // Sample format specifications data
  const sampleSpecifications = [
    {
      id: 1,
      name: "APA Style",
      version: "7th Edition",
      description: "Standard for social sciences, psychology, education, and business",
      institution: "American Psychological Association",
      category: "Academic",
      lastUpdated: "2023-11-15",
      complianceRate: 85,
      usage: "High",
      details: {
        margins: "1 inch on all sides",
        font: "Times New Roman, 12 pt",
        spacing: "Double-spaced throughout",
        titlePage: "Required",
        abstract: "Required for articles 1200+ words",
        headings: "5 levels with specific formatting",
        citations: "Author-date style",
        referenceList: "Alphabetical by author's last name"
      }
    },
    {
      id: 2,
      name: "MLA Style",
      version: "9th Edition",
      description: "Standard for humanities, literature, and arts",
      institution: "Modern Language Association",
      category: "Academic",
      lastUpdated: "2023-11-10",
      complianceRate: 78,
      usage: "High",
      details: {
        margins: "1 inch on all sides",
        font: "Times New Roman, 12 pt",
        spacing: "Double-spaced throughout",
        titlePage: "Not required (header on first page)",
        abstract: "Not required",
        headings: "No specific formatting",
        citations: "Author-page style",
        referenceList: "Works Cited page"
      }
    },
    {
      id: 3,
      name: "Chicago Style",
      version: "17th Edition",
      description: "Used in history, philosophy, and arts",
      institution: "University of Chicago Press",
      category: "Academic",
      lastUpdated: "2023-11-05",
      complianceRate: 82,
      usage: "Medium",
      details: {
        margins: "1 inch on all sides",
        font: "Times New Roman, 12 pt",
        spacing: "Double-spaced throughout",
        titlePage: "Required",
        abstract: "Optional",
        headings: "Flexible formatting",
        citations: "Notes-bibliography or author-date",
        referenceList: "Bibliography or Reference List"
      }
    },
    {
      id: 4,
      name: "IEEE Style",
      version: "Latest",
      description: "Standard for technical fields, engineering, and computer science",
      institution: "Institute of Electrical and Electronics Engineers",
      category: "Technical",
      lastUpdated: "2023-11-12",
      complianceRate: 90,
      usage: "Medium",
      details: {
        margins: "0.75 inch on all sides",
        font: "Times New Roman, 10-12 pt",
        spacing: "Double-spaced throughout",
        titlePage: "Required",
        abstract: "Required",
        headings: "Numbered sections",
        citations: "Numbered in brackets",
        referenceList: "Numbered bibliography"
      }
    },
    {
      id: 5,
      name: "Harvard Style",
      version: "Latest",
      description: "Common in business, social sciences, and some humanities",
      institution: "Harvard University",
      category: "Academic",
      lastUpdated: "2023-11-08",
      complianceRate: 75,
      usage: "Medium",
      details: {
        margins: "1 inch on all sides",
        font: "Times New Roman, 12 pt",
        spacing: "Double-spaced throughout",
        titlePage: "Not required",
        abstract: "Optional",
        headings: "No specific formatting",
        citations: "Author-date style",
        referenceList: "Reference List"
      }
    },
    {
      id: 6,
      name: "AMA Style",
      version: "11th Edition",
      description: "Used in medical and scientific publications",
      institution: "American Medical Association",
      category: "Scientific",
      lastUpdated: "2023-11-18",
      complianceRate: 88,
      usage: "Low",
      details: {
        margins: "1 inch on all sides",
        font: "Times New Roman, 12 pt",
        spacing: "Double-spaced throughout",
        titlePage: "Required",
        abstract: "Required for research articles",
        headings: "Structured format",
        citations: "Numbered in superscript",
        referenceList: "Numbered bibliography"
      }
    },
  ];

  useEffect(() => {
    // Load sample data on component mount
    setSpecifications(sampleSpecifications);
    setActiveSpec(sampleSpecifications[0]);
  }, []);

  const handleAddSpec = () => {
    if (!newSpec.name || !newSpec.version || !newSpec.description) return;

    const newSpecObj = {
      id: specifications.length + 1,
      name: newSpec.name,
      version: newSpec.version,
      description: newSpec.description,
      institution: newSpec.institution,
      category: newSpec.category,
      lastUpdated: new Date().toISOString().split('T')[0],
      complianceRate: Math.floor(Math.random() * 20) + 70, // Random compliance rate between 70-90
      usage: "Medium",
      details: {
        margins: "To be defined",
        font: "To be defined",
        spacing: "To be defined",
        titlePage: "To be defined",
        abstract: "To be defined",
        headings: "To be defined",
        citations: "To be defined",
        referenceList: "To be defined"
      }
    };

    setSpecifications([...specifications, newSpecObj]);
    setNewSpec({
      name: "",
      version: "",
      description: "",
      institution: "",
      category: "Academic"
    });
  };

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
        <h1 className="text-3xl font-bold">Format Specifications</h1>
        <p className="text-muted-foreground">Detailed specifications for academic formatting requirements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Total Formats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{specifications.length}</div>
            <p className="text-sm text-muted-foreground">Supported formatting styles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Avg. Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {specifications.length > 0
                ? Math.round(specifications.reduce((sum, s) => sum + s.complianceRate, 0) / specifications.length)
                : 0}%
            </div>
            <p className="text-sm text-muted-foreground">Overall compliance rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {[...new Set(specifications.map(s => s.category))].length}
            </div>
            <p className="text-sm text-muted-foreground">Format categories</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Format Specifications</CardTitle>
              <CardDescription>Guidelines and requirements for different formatting styles</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="details">Style Details</TabsTrigger>
                  <TabsTrigger value="templates">Templates</TabsTrigger>
                </TabsList>
                <TabsContent value="overview">
                  <ScrollArea className="h-[400px] w-full rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Format</TableHead>
                          <TableHead>Version</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Compliance</TableHead>
                          <TableHead>Usage</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {specifications.map((spec) => (
                          <TableRow
                            key={spec.id}
                            className={activeSpec && activeSpec.id === spec.id ? "bg-muted" : ""}
                            onClick={() => setActiveSpec(spec)}
                          >
                            <TableCell className="font-medium">{spec.name}</TableCell>
                            <TableCell>{spec.version}</TableCell>
                            <TableCell><Badge variant="outline">{spec.category}</Badge></TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <span className="mr-2">{spec.complianceRate}%</span>
                                <Progress value={spec.complianceRate} className="w-20" />
                              </div>
                            </TableCell>
                            <TableCell><Badge variant={spec.usage === "High" ? "default" : spec.usage === "Medium" ? "secondary" : "outline"}>{spec.usage}</Badge></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="details">
                  {activeSpec ? (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{activeSpec.name} ({activeSpec.version})</h3>
                        <p className="text-muted-foreground mb-4">{activeSpec.description}</p>
                        <div className="text-sm">
                          <p><span className="font-medium">Institution:</span> {activeSpec.institution}</p>
                          <p><span className="font-medium">Category:</span> {activeSpec.category}</p>
                          <p><span className="font-medium">Last Updated:</span> {activeSpec.lastUpdated}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                          <h4 className="font-semibold">Document Requirements</h4>
                          <div className="text-sm space-y-2">
                            <p><span className="font-medium">Margins:</span> {activeSpec.details.margins}</p>
                            <p><span className="font-medium">Font:</span> {activeSpec.details.font}</p>
                            <p><span className="font-medium">Spacing:</span> {activeSpec.details.spacing}</p>
                            <p><span className="font-medium">Title Page:</span> {activeSpec.details.titlePage}</p>
                            <p><span className="font-medium">Abstract:</span> {activeSpec.details.abstract}</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold">Citation & References</h4>
                          <div className="text-sm space-y-2">
                            <p><span className="font-medium">Citations:</span> {activeSpec.details.citations}</p>
                            <p><span className="font-medium">Reference List:</span> {activeSpec.details.referenceList}</p>
                            <p><span className="font-medium">Headings:</span> {activeSpec.details.headings}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p>Select a format specification to view details</p>
                  )}
                </TabsContent>
                <TabsContent value="templates">
                  <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Format Templates</h3>
                      <p>Download templates for each format specification:</p>

                      {specifications.map(spec => {
                        let downloadUrl = "#";
                        let fileName = `${spec.name.replace(/\s+/g, '_')}_Template.docx`;

                        // Set specific download URLs based on format type
                        switch(spec.name) {
                          case "APA Style":
                            downloadUrl = "https://apastyle.apa.org/instructional-aids/student-paper-setup-guide.pdf";
                            fileName = "APA_Style_Setup_Guide.pdf";
                            break;
                          case "MLA Style":
                            downloadUrl = "https://cdn.dal.ca/content/dam/dalhousie/pdf/library/Style_Guides/MLA9_QuickGuide-2021.pdf";
                            fileName = "MLA_Style_Quick_Guide.pdf";
                            break;
                          case "Chicago Style":
                            downloadUrl = "https://www.uis.edu/sites/default/files/inline-images/Chicago-Style-17th-PUBLISHED-Fall-2018.pdf";
                            fileName = "Chicago_Style_Guide.pdf";
                            break;
                          case "IEEE Style":
                            downloadUrl = "https://www.csudh.edu/Assets/csudh-sites/csc/docs/IEEE-StyleManual.pdf";
                            fileName = "IEEE_Style_Manual.pdf";
                            break;
                          case "Harvard Style":
                            downloadUrl = "https://www.westernsydney.edu.au/content/dam/digital/pdf/eds/library/cite_Harvard.pdf";
                            fileName = "Harvard_Style_Guide.pdf";
                            break;
                          case "AMA Style":
                            downloadUrl = "https://mym.cdn.usa.edu/WritingCenter/AMA_References_11th.pdf";
                            fileName = "AMA_Style_Reference_Guide.pdf";
                            break;
                          default:
                            downloadUrl = "#";
                            fileName = `${spec.name.replace(/\s+/g, '_')}_Template.pdf`;
                        }

                        return (
                          <div key={spec.id} className="flex justify-between items-center border-b pb-2">
                            <div>
                              <h4 className="font-medium">{spec.name} ({spec.version})</h4>
                              <p className="text-sm text-muted-foreground">{spec.description}</p>
                            </div>
                            <a href={downloadUrl} download={fileName}>
                              <Button variant="outline" size="sm">Download</Button>
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add New Format</CardTitle>
            <CardDescription>Define a new format specification</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                placeholder="Format name"
                value={newSpec.name}
                onChange={(e) => setNewSpec({...newSpec, name: e.target.value})}
              />
              <Input
                placeholder="Version"
                value={newSpec.version}
                onChange={(e) => setNewSpec({...newSpec, version: e.target.value})}
              />
              <Input
                placeholder="Institution"
                value={newSpec.institution}
                onChange={(e) => setNewSpec({...newSpec, institution: e.target.value})}
              />
              <Select value={newSpec.category} onValueChange={(value) => setNewSpec({...newSpec, category: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Academic">Academic</SelectItem>
                  <SelectItem value="Technical">Technical</SelectItem>
                  <SelectItem value="Scientific">Scientific</SelectItem>
                  <SelectItem value="Business">Business</SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                placeholder="Description"
                value={newSpec.description}
                onChange={(e) => setNewSpec({...newSpec, description: e.target.value})}
                rows={3}
              />
              <Button onClick={handleAddSpec} className="w-full">Add Format</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Format Compliance Analytics</CardTitle>
          <CardDescription>Compliance rates across different formats</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px] w-full rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Format</TableHead>
                  <TableHead>Compliance Rate</TableHead>
                  <TableHead>Usage Level</TableHead>
                  <TableHead>Most Common Issues</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {specifications.map(spec => (
                  <TableRow key={spec.id}>
                    <TableCell className="font-medium">{spec.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className="mr-2">{spec.complianceRate}%</span>
                        <Progress value={spec.complianceRate} className="w-24" />
                      </div>
                    </TableCell>
                    <TableCell><Badge variant={spec.usage === "High" ? "default" : spec.usage === "Medium" ? "secondary" : "outline"}>{spec.usage}</Badge></TableCell>
                    <TableCell>Citation formatting, Spacing</TableCell>
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