"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  FileText, 
  Link, 
  Download, 
  Copy, 
  UserPlus, 
  MessageSquare,
  Users,
  Eye,
  Edit3,
  Check,
  Clock,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";

type Annotation = {
  id: string;
  userId: string;
  userName: string;
  content: string;
  text: string;
  position: { start: number; end: number };
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
};

type ResearchArticle = {
  id: string;
  title: string;
  authors: string[];
  year: number;
  abstract: string;
  keywords: string[];
  methodology: string;
  findings: string;
  conclusions: string;
  limitations: string;
  references: string[];
  annotations: Annotation[];
  tags: string[];
  doi?: string;
  url?: string;
  file?: File;
  citations: {
    apa: string;
    mla: string;
    chicago: string;
  };
  createdAt: Date;
  updatedAt: Date;
};

type Task = {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  assigneeName: string;
  status: "todo" | "in-progress" | "review" | "done";
  dueDate?: Date;
  createdAt: Date;
  completedAt?: Date;
};

type GroupMember = {
  id: string;
  name: string;
  email: string;
  role: "lead" | "member" | "advisor";
  joinedAt: Date;
};

export function ResearchArticleAnalyzer() {
  const { profile, session } = useAuth();
  const [activeArticle, setActiveArticle] = useState<ResearchArticle | null>(null);
  const [articles, setArticles] = useState<ResearchArticle[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [newAnnotation, setNewAnnotation] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newTask, setNewTask] = useState<Omit<Task, 'id' | 'createdAt' | 'completedAt'>>({
    title: "",
    description: "",
    assigneeId: "",
    assigneeName: "",
    status: "todo"
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const [activeTab, setActiveTab] = useState("analysis");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize with mock data
  useState(() => {
    if (profile) {
      const mockMembers: GroupMember[] = [
        {
          id: profile.id,
          name: profile.first_name || "User",
          email: session?.user.email || "",
          role: "lead",
          joinedAt: new Date()
        }
      ];
      
      const mockArticles: ResearchArticle[] = [
        {
          id: "art-1",
          title: "The Impact of AI on Academic Writing",
          authors: ["Dela Cruz, M. A.", "Santos, J. B."],
          year: 2023,
          abstract: "This study examines how AI tools are changing the way students approach academic writing in the Philippines. We surveyed 500 students from various universities and found that 78% use AI tools for writing assistance.",
          keywords: ["AI", "writing", "Philippines", "education"],
          methodology: "Quantitative survey research with 500 participants from 10 Philippine universities",
          findings: "78% of students use AI tools, with 65% reporting improved efficiency but 42% expressing concerns about academic integrity",
          conclusions: "AI tools enhance writing efficiency but require proper ethical guidelines in educational contexts",
          limitations: "Sample limited to urban universities; self-reported data may have response bias",
          references: [
            "Dela Cruz, M. A. (2023). AI in Education: Trends and Implications.",
            "Santos, J. B. (2022). Digital Tools and Academic Integrity."
          ],
          annotations: [],
          tags: ["methodology", "impact"],
          doi: "10.1234/ai-education-2023",
          citations: {
            apa: "Dela Cruz, M. A., & Santos, J. B. (2023). The Impact of AI on Academic Writing...",
            mla: "Dela Cruz, M. A., and J. B. Santos. The Impact of AI on Academic Writing...",
            chicago: "Dela Cruz, M. A., and J. B. Santos. 2023. The Impact of AI on Academic Writing..."
          },
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      setGroupMembers(mockMembers);
      setArticles(mockArticles);
      setActiveArticle(mockArticles[0]);
    }
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf' || selectedFile.name.endsWith('.doc') || selectedFile.name.endsWith('.docx')) {
        setFile(selectedFile);
        // Simulate extraction process
        extractFromPDF(selectedFile);
      } else {
        alert("Please select a PDF or Word document.");
      }
    }
  };

  const extractFromPDF = async (file: File) => {
    // Simulate extraction process
    setActiveTab("analysis");
    
    // Create a mock research article based on the file
    const mockArticle: ResearchArticle = {
      id: `art-${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
      authors: ["Auto-Extracted"],
      year: new Date().getFullYear(),
      abstract: "Abstract content extracted from the document...",
      keywords: ["extracted", "keyword", "auto"],
      methodology: "Methodology section extracted from document...",
      findings: "Findings and results extracted from document...",
      conclusions: "Conclusions drawn from the document...",
      limitations: "Study limitations mentioned in the document...",
      references: [
        "Sample reference extracted from document",
        "Additional references from bibliography"
      ],
      annotations: [],
      tags: ["auto-extracted"],
      citations: {
        apa: `Auto-Extracted. (${new Date().getFullYear()}). ${file.name.replace(/\.[^/.]+$/, "")}. [Auto-citation]`,
        mla: `Auto-Extracted. "${file.name.replace(/\.[^/.]+$/, "")}". [Auto-citation]`,
        chicago: `Auto-Extracted. ${new Date().getFullYear()}. "${file.name.replace(/\.[^/.]+$/, "")}". [Auto-citation]`
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setArticles([...articles, mockArticle]);
    setActiveArticle(mockArticle);
    alert("Document analyzed and added to your research collection!");
  };

  const handleUrlImport = () => {
    if (!url) return;
    
    // Simulate URL import
    setActiveTab("analysis");
    
    const mockArticle: ResearchArticle = {
      id: `art-${Date.now()}`,
      title: `Article from ${new URL(url).hostname}`,
      authors: ["Auto-Extracted"],
      year: new Date().getFullYear(),
      abstract: "Abstract content extracted from the URL...",
      keywords: ["extracted", "web", "auto"],
      methodology: "Methodology section extracted from web document...",
      findings: "Findings and results extracted from web document...",
      conclusions: "Conclusions drawn from web document...",
      limitations: "Study limitations mentioned in web document...",
      references: [
        "Sample reference extracted from web document"
      ],
      annotations: [],
      tags: ["web-extracted"],
      url,
      citations: {
        apa: `Auto-Extracted. (${new Date().getFullYear()}). Article from ${new URL(url).hostname}. [Auto-citation]`,
        mla: `Auto-Extracted. "Article from ${new URL(url).hostname}". [Auto-citation]`,
        chicago: `Auto-Extracted. ${new Date().getFullYear()}. "Article from ${new URL(url).hostname}". [Auto-citation]`
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setArticles([...articles, mockArticle]);
    setActiveArticle(mockArticle);
    setUrl("");
    alert("URL content analyzed and added to your research collection!");
  };

  const addAnnotation = () => {
    if (!activeArticle || !selectedText || !newAnnotation) return;

    const annotation: Annotation = {
      id: `ann-${Date.now()}`,
      userId: profile?.id || "",
      userName: "Current User",
      content: newAnnotation,
      text: selectedText,
      position: { start: 0, end: selectedText.length },
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: newTag ? [newTag] : []
    };

    const updatedAnnotations = [...annotations, annotation];
    setAnnotations(updatedAnnotations);

    // Update the current article with the new annotation
    if (activeArticle) {
      const updatedArticle: ResearchArticle = {
        ...activeArticle,
        annotations: [...activeArticle.annotations, annotation],
        tags: newTag && !activeArticle.tags.includes(newTag) ? [...activeArticle.tags, newTag] : activeArticle.tags
      };
      setActiveArticle(updatedArticle);
      
      // Update articles list
      setArticles(articles.map(a => a.id === updatedArticle.id ? updatedArticle : a));
    }

    setNewAnnotation("");
    setNewTag("");
    setSelectedText("");
  };

  const addTask = () => {
    if (!newTask.title || !newTask.assigneeId) return;

    const task: Task = {
      id: `task-${Date.now()}`,
      title: newTask.title,
      description: newTask.description,
      assigneeId: newTask.assigneeId,
      assigneeName: newTask.assigneeName,
      status: newTask.status,
      createdAt: new Date(),
      dueDate: newTask.dueDate
    };

    setTasks([...tasks, task]);
    setNewTask({
      title: "",
      description: "",
      assigneeId: "",
      assigneeName: "",
      status: "todo"
    });
  };

  const addMember = () => {
    if (!newMemberEmail) return;

    const newMember: GroupMember = {
      id: `member-${Date.now()}`,
      name: newMemberEmail.split('@')[0],
      email: newMemberEmail,
      role: "member",
      joinedAt: new Date()
    };

    setGroupMembers([...groupMembers, newMember]);
    setNewMemberEmail("");
  };

  const updateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: newStatus, completedAt: newStatus === 'done' ? new Date() : undefined } 
        : task
    ));
  };

  const exportArticle = (format: 'docx' | 'pdf' | 'csv') => {
    alert(`Exporting article in ${format.toUpperCase()} format. This would generate your file.`);
  };

  const addSampleData = () => {
    // Sample research article
    const mockArticle: ResearchArticle = {
      id: `art-${Date.now()}`,
      title: "The Impact of Technology on Student Learning Outcomes in Philippine Higher Education",
      authors: ["Dela Cruz, M. A.", "Santos, J. B.", "Reyes, C. D."],
      year: 2023,
      abstract: "This study investigates the relationship between technology use and academic performance among college students in the Philippines. Using a mixed-methods approach, we surveyed 420 students from 5 universities and conducted in-depth interviews with 25 participants. Results indicate a moderate positive correlation (r=0.45) between appropriate technology use and improved learning outcomes, with certain caveats related to distraction and over-dependence.",
      keywords: ["technology", "learning outcomes", "higher education", "Philippines", "digital literacy"],
      methodology: "Mixed-methods approach using quantitative surveys (n=420) and qualitative interviews (n=25). Survey instrument validated by 3 experts with Cronbach's alpha of 0.89. Interviews transcribed and analyzed using thematic analysis.",
      findings: [
        "Positive correlation (r=0.45) between appropriate technology use and academic performance",
        "Students using educational technology tools showed 18% improvement in assessment scores",
        "Digital divide affects 28% of students from low-income households",
        "Over-use of non-academic technology correlated with decreased study time (-1.5 hours/day)"
      ].join('\n'),
      conclusions: "Technology integration in higher education shows benefits when properly balanced. Institutions should focus on digital equity and training rather than just providing access. The key is in pedagogical design rather than pure technology adoption.",
      limitations: "Sample limited to private universities in Luzon; self-reported data may have response bias; cross-sectional design limits causal inferences.",
      references: [
        "Dela Cruz, M. A. (2023). Digital Divide in Philippine Universities. Philippine Journal of Education, 45(3), 123-145.",
        "Santos, J. B. (2022). Technology and Academic Performance. Asia Pacific Educational Review, 18(2), 89-102.",
        "Reyes, C. D. (2023). Digital Equity in Higher Education. International Journal of Educational Technology, 12(4), 67-82.",
        "Fernandez, A. L. (2021). Student Engagement in Online Learning. Philippine Educational Psychology, 34(1), 45-60."
      ],
      annotations: [
        {
          id: `ann-${Date.now()}-1`,
          userId: profile?.id || "",
          userName: profile?.first_name || "Sample User",
          content: "Significant finding about the positive correlation",
          text: "Results indicate a moderate positive correlation (r=0.45) between appropriate technology use and improved learning outcomes",
          position: { start: 0, end: 0 },
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: ["finding", "quantitative"]
        },
        {
          id: `ann-${Date.now()}-2`,
          userId: profile?.id || "",
          userName: profile?.first_name || "Sample User",
          content: "Important limitation that could affect generalizability",
          text: "Sample limited to private universities in Luzon",
          position: { start: 0, end: 0 },
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: ["limitation", "methodology"]
        }
      ],
      tags: ["quantitative", "mixed-methods", "technology", "philippines"],
      doi: "10.1234/sample-doi-2023",
      url: "https://example.com/sample-research",
      citations: {
        apa: "Dela Cruz, M. A., Santos, J. B., & Reyes, C. D. (2023). The impact of technology on student learning outcomes in Philippine higher education. Philippine Journal of Research, 15(2), 234-256.",
        mla: "Dela Cruz, Maria A., et al. \"The Impact of Technology on Student Learning Outcomes in Philippine Higher Education.\" Philippine Journal of Research, vol. 15, no. 2, 2023, pp. 234-256.",
        chicago: "Dela Cruz, Maria A., Juan B. Santos, and Clara D. Reyes. 2023. \"The Impact of Technology on Student Learning Outcomes in Philippine Higher Education.\" Philippine Journal of Research 15, no. 2: 234-256."
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setArticles([mockArticle]);
    setActiveArticle(mockArticle);
    
    // Add sample task
    const sampleTask: Task = {
      id: `task-${Date.now()}`,
      title: "Analyze methodology section",
      description: "Review the mixed-methods approach and evaluate the validity measures",
      assigneeId: profile?.id || "",
      assigneeName: profile?.first_name || "Sample User",
      status: "todo",
      createdAt: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };
    
    setTasks([sampleTask]);
    
    alert("Sample research article and tasks added successfully! Check the different tabs to see the sample data in action.");
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Research Article Analyzer</h1>
          <p className="text-muted-foreground">
            Analyze research articles with structured extraction and collaborative tools
          </p>
        </div>
        <Button variant="outline" onClick={addSampleData} className="self-start">
          <FileText className="w-4 h-4 mr-2" />
          Add Sample Data
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Article Import</CardTitle>
              <CardDescription>Upload a PDF/DOC or import from URL</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="pdf-upload">Upload PDF/DOC File</Label>
                <div className="flex gap-2 mt-2">
                  <Button asChild variant="outline" className="w-full">
                    <label htmlFor="pdf-upload">
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                      <input 
                        id="pdf-upload" 
                        type="file" 
                        className="hidden" 
                        accept=".pdf,.doc,.docx" 
                        onChange={handleFileChange}
                        ref={fileInputRef}
                      />
                    </label>
                  </Button>
                </div>
                {file && (
                  <div className="mt-2 p-2 bg-muted rounded text-sm">
                    <p>Selected: {file.name}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">Import from URL or DOI</Label>
                <div className="flex gap-2">
                  <Input
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/article.pdf or DOI"
                    className="flex-1"
                  />
                  <Button onClick={handleUrlImport}>
                    <Link className="w-4 h-4 mr-2" />
                    Import
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <Label>Recent Articles</Label>
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                {articles.map(article => (
                  <div 
                    key={article.id} 
                    className={`p-2 border rounded cursor-pointer ${activeArticle?.id === article.id ? 'bg-blue-50 border-blue-300' : 'hover:bg-muted'}`}
                    onClick={() => setActiveArticle(article)}
                  >
                    <p className="font-medium truncate">{article.title}</p>
                    <p className="text-xs text-muted-foreground">{article.authors.join(', ')}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {activeArticle && (
        <Tabs defaultValue="analysis" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="annotations">Annotations</TabsTrigger>
            <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
            <TabsTrigger value="matrix">Matrix</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-6 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Article Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Title</Label>
                    <p className="text-sm">{activeArticle.title}</p>
                  </div>
                  
                  <div>
                    <Label>Authors</Label>
                    <p className="text-sm">{activeArticle.authors.join(', ')}</p>
                  </div>
                  
                  <div>
                    <Label>Year</Label>
                    <p className="text-sm">{activeArticle.year}</p>
                  </div>
                  
                  <div>
                    <Label>DOI/URL</Label>
                    <p className="text-sm text-blue-500">{activeArticle.doi || activeArticle.url || "N/A"}</p>
                  </div>
                  
                  <div>
                    <Label>Keywords</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {activeArticle.keywords.map((keyword, idx) => (
                        <Badge key={idx} variant="secondary">{keyword}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Structured Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Abstract</Label>
                    <p className="text-sm">{activeArticle.abstract}</p>
                  </div>
                  
                  <div>
                    <Label>Methodology</Label>
                    <p className="text-sm">{activeArticle.methodology}</p>
                  </div>
                  
                  <div>
                    <Label>Findings</Label>
                    <p className="text-sm">{activeArticle.findings}</p>
                  </div>
                  
                  <div>
                    <Label>Conclusions</Label>
                    <p className="text-sm">{activeArticle.conclusions}</p>
                  </div>
                  
                  <div>
                    <Label>Limitations</Label>
                    <p className="text-sm">{activeArticle.limitations}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="annotations" className="space-y-6 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Add Annotation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Label htmlFor="selectedText">Selected Text</Label>
                    <Textarea
                      id="selectedText"
                      value={selectedText}
                      onChange={(e) => setSelectedText(e.target.value)}
                      placeholder="Highlight text in the document to appear here..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <Label htmlFor="annotation">New Annotation</Label>
                    <Textarea
                      id="annotation"
                      value={newAnnotation}
                      onChange={(e) => setNewAnnotation(e.target.value)}
                      placeholder="Add your annotation here..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="mb-4">
                    <Label htmlFor="tag">Tags (comma separated)</Label>
                    <Input
                      id="tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="e.g. methodology, research gap"
                    />
                  </div>
                  
                  <Button onClick={addAnnotation} disabled={!selectedText || !newAnnotation}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Add Annotation
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Annotations</CardTitle>
                  <CardDescription>{activeArticle.annotations.length} annotations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {activeArticle.annotations.map(annotation => (
                      <Card key={annotation.id} className="p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{annotation.userName}</p>
                            <p className="text-sm my-2 bg-muted p-2 rounded">{annotation.text}</p>
                            <p className="text-sm">{annotation.content}</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {annotation.tags.map(tag => (
                            <Badge key={tag} variant="secondary">{tag}</Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {annotation.createdAt.toLocaleString()}
                        </p>
                      </Card>
                    ))}
                    
                    {activeArticle.annotations.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">
                        No annotations yet. Add your first annotation to start collaborating.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="collaboration" className="space-y-6 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Group Members</CardTitle>
                      <CardDescription>Collaborators on this research</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Member email"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        className="w-48"
                      />
                      <Button onClick={addMember} size="sm">
                        <UserPlus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {groupMembers.map(member => (
                      <Badge key={member.id} variant="outline" className="flex items-center gap-2 px-3 py-1">
                        <Users className="w-3 h-3" />
                        {member.name} {member.role === 'lead' && '(Lead)'}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Assign Review Tasks</CardTitle>
                  <CardDescription>Track progress on article analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="taskTitle">Task Title</Label>
                      <Input
                        id="taskTitle"
                        value={newTask.title}
                        onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                        placeholder="e.g. Analyze methodology section"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="taskDesc">Description</Label>
                      <Textarea
                        id="taskDesc"
                        value={newTask.description}
                        onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                        placeholder="Task details..."
                        rows={2}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="assignee">Assign To</Label>
                      <select
                        id="assignee"
                        className="w-full p-2 border rounded-md"
                        value={newTask.assigneeId}
                        onChange={(e) => {
                          const member = groupMembers.find(m => m.id === e.target.value);
                          setNewTask({
                            ...newTask,
                            assigneeId: e.target.value,
                            assigneeName: member?.name || ""
                          });
                        }}
                      >
                        <option value="">Select member</option>
                        {groupMembers.map(member => (
                          <option key={member.id} value={member.id}>{member.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <Button onClick={addTask} disabled={!newTask.title || !newTask.assigneeId} className="w-full">
                      <Edit3 className="w-4 h-4 mr-2" />
                      Assign Task
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Task Board</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {(['todo', 'in-progress', 'review', 'done'] as const).map(status => (
                    <div key={status} className="bg-muted/50 p-3 rounded-md">
                      <h3 className="font-medium mb-3 capitalize flex items-center gap-2">
                        {status === 'todo' && <Edit3 className="w-4 h-4" />}
                        {status === 'in-progress' && <Edit3 className="w-4 h-4" />}
                        {status === 'review' && <Eye className="w-4 h-4" />}
                        {status === 'done' && <Check className="w-4 h-4" />}
                        {status.replace('-', ' ')} ({tasks.filter(t => t.status === status).length})
                      </h3>
                      <div className="space-y-2">
                        {tasks
                          .filter(task => task.status === status)
                          .map(task => (
                            <Card key={task.id} className="p-3">
                              <div className="flex justify-between">
                                <h4 className="font-medium">{task.title}</h4>
                                <Badge variant="outline">{task.assigneeName}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                              <div className="flex justify-between items-center mt-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => updateTaskStatus(task.id, 
                                    status === 'todo' ? 'in-progress' : 
                                    status === 'in-progress' ? 'review' : 
                                    status === 'review' ? 'done' : 'todo'
                                  )}
                                >
                                  {status === 'todo' && 'Start'}
                                  {status === 'in-progress' && 'Review'}
                                  {status === 'review' && 'Done'}
                                  {status === 'done' && 'Reopen'}
                                </Button>
                                {task.dueDate && (
                                  <span className="text-xs flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {task.dueDate.toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </Card>
                          ))
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="matrix" className="space-y-6 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Literature Review Matrix</CardTitle>
                <CardDescription>Structured comparison of research articles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Article</th>
                        <th className="text-left p-2">Authors</th>
                        <th className="text-left p-2">Year</th>
                        <th className="text-left p-2">Methodology</th>
                        <th className="text-left p-2">Key Findings</th>
                        <th className="text-left p-2">Gaps</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-2 font-medium">{activeArticle.title.substring(0, 30)}...</td>
                        <td className="p-2">{activeArticle.authors[0]}</td>
                        <td className="p-2">{activeArticle.year}</td>
                        <td className="p-2">{activeArticle.methodology.substring(0, 50)}...</td>
                        <td className="p-2">{activeArticle.findings.substring(0, 50)}...</td>
                        <td className="p-2">
                          {activeArticle.limitations.substring(0, 50)}...
                        </td>
                      </tr>
                      {/* Add more rows for other articles if available */}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Theme Development</CardTitle>
                <CardDescription>Identify and develop research themes across articles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {['AI in Education', 'Research Ethics', 'Technology Adoption'].map(theme => (
                    <Card key={theme} className="p-4">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold">{theme}</h3>
                        <Badge variant="outline">3 articles</Badge>
                      </div>
                      <div className="mt-2 space-y-1">
                        <p className="text-xs bg-muted p-2 rounded">Supporting quote from article...</p>
                        <p className="text-xs bg-muted p-2 rounded">Another supporting point...</p>
                      </div>
                      <Button size="sm" variant="outline" className="mt-3 w-full">
                        Review Theme
                      </Button>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="space-y-6 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Export Options</CardTitle>
                  <CardDescription>Export your analysis in various formats</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Button className="flex-1" onClick={() => exportArticle('docx')}>
                        <FileText className="w-4 h-4 mr-2" />
                        Export as DOCX
                      </Button>
                      <Button className="flex-1" onClick={() => exportArticle('pdf')}>
                        <FileText className="w-4 h-4 mr-2" />
                        Export as PDF
                      </Button>
                    </div>
                    
                    <Button className="w-full" onClick={() => exportArticle('csv')}>
                      <FileText className="w-4 h-4 mr-2" />
                      Export Literature Matrix (CSV)
                    </Button>
                    
                    <div className="mt-4">
                      <Label>Share Collaboration</Label>
                      <div className="flex gap-2 mt-2">
                        <Input 
                          readOnly 
                          value={`https://thesisai.com/article/${activeArticle.id}/review`} 
                          className="bg-muted"
                        />
                        <Button variant="outline">
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Citation Manager</CardTitle>
                  <CardDescription>Generate citations in multiple formats</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>APA Format</Label>
                      <div className="p-3 bg-muted rounded mt-1 text-sm">
                        {activeArticle.citations.apa}
                      </div>
                    </div>
                    
                    <div>
                      <Label>MLA Format</Label>
                      <div className="p-3 bg-muted rounded mt-1 text-sm">
                        {activeArticle.citations.mla}
                      </div>
                    </div>
                    
                    <div>
                      <Label>Chicago Format</Label>
                      <div className="p-3 bg-muted rounded mt-1 text-sm">
                        {activeArticle.citations.chicago}
                      </div>
                    </div>
                    
                    <Button className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Copy All Citations
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}