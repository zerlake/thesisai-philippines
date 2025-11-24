"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Users, 
  FileText, 
  GitBranch,
  UserPlus,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { toast } from "sonner";

type Reference = {
  id: string;
  title: string;
  authors: string;
  year: number;
  type: "independent" | "dependent" | "intervening" | "moderating" | "control";
  source: string;
  url?: string;
  citation: string;
  tags: string[];
  createdAt: Date;
};

type GroupMember = {
  id: string;
  name: string;
  email: string;
  role: "lead" | "member" | "advisor";
  joinedAt: Date;
};

type Theme = {
  id: string;
  name: string;
  description: string;
  codes: string[];
  supportingQuotes: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  members: string[];
};

export function LiteratureReviewCollaboration() {
  const { session, profile } = useAuth();
  const [references, setReferences] = useState<Reference[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Sample state to allow for functionality demonstration
  const [newReference, setNewReference] = useState({
    title: "",
    authors: "",
    year: new Date().getFullYear(),
    type: "independent" as "independent" | "dependent" | "intervening" | "moderating" | "control",
    source: "",
    tags: [] as string[],
  });

  const [newTheme, setNewTheme] = useState({
    name: "",
    description: "",
    codes: [] as string[],
    supportingQuotes: [] as string[],
  });

  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [_selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [relationships, _setRelationships] = useState<any[]>([]);

  // Filter references based on search
  const filteredReferences = references.filter(ref => 
    ref.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ref.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ref.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addSampleData = () => {
    // Sample references
    const sampleRefs: Reference[] = [
      {
        id: `ref-${Date.now()}-1`,
        title: "The Impact of Social Media on Academic Performance",
        authors: "Dela Cruz, M.A., Santos, J.B.",
        year: 2023,
        type: "independent",
        source: "Journal of Educational Technology, 15(3), 45-67",
        citation: "Dela Cruz, M.A. & Santos, J.B. (2023). The impact of social media on academic performance. Journal of Educational Technology, 15(3), 45-67.",
        tags: ["social media", "academic performance", "Philippines"],
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
      },
      {
        id: `ref-${Date.now()}-2`,
        title: "Student Engagement in Online Learning Environments",
        authors: "Reyes, C.D., Gonzales, P.E.",
        year: 2022,
        type: "dependent",
        source: "International Journal of E-Learning, 8(2), 123-145",
        citation: "Reyes, C.D. & Gonzales, P.E. (2022). Student engagement in online learning environments. International Journal of E-Learning, 8(2), 123-145.",
        tags: ["online learning", "student engagement", "digital literacy"],
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000) // 2 days ago
      }
    ];

    // Sample group members
    const sampleMembers: GroupMember[] = [
      {
        id: profile?.id || `user-${Date.now()}`,
        name: profile?.first_name || "Current User",
        email: session?.user.email || "user@example.com",
        role: "lead",
        joinedAt: new Date()
      },
      {
        id: `member-${Date.now()}-1`,
        name: "Research Partner 1",
        email: "partner1@example.com",
        role: "member",
        joinedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      {
        id: `member-${Date.now()}-2`, 
        name: "Research Partner 2",
        email: "partner2@example.com",
        role: "member",
        joinedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      }
    ];

    // Sample themes
    const sampleThemes: Theme[] = [
      {
        id: `theme-${Date.now()}-1`,
        name: "Digital Learning Impact",
        description: "Effects of digital tools on learning outcomes",
        codes: ["Social Media Usage", "Academic Performance", "Student Engagement"],
        supportingQuotes: [
          "AI tools are changing the way students approach academic writing",
          "Moderate use of digital tools can enhance collaborative learning"
        ],
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        createdBy: profile?.id || "",
        members: [profile?.id || `user-${Date.now()}`, `member-${Date.now()}-1`]
      },
      {
        id: `theme-${Date.now()}-2`,
        name: "Technology and Education",
        description: "Integration of technology in educational contexts",
        codes: ["Educational Technology", "Learning Outcomes", "Digital Divide"],
        supportingQuotes: [
          "Technology integration varies significantly across Philippine universities",
          "Students from low-income households have less access to digital learning tools"
        ],
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        createdBy: `member-${Date.now()}-1`,
        members: [profile?.id || `user-${Date.now()}`, `member-${Date.now()}-1`, `member-${Date.now()}-2`]
      }
    ];

    setReferences(sampleRefs);
    setGroupMembers(sampleMembers);
    setThemes(sampleThemes);
    setSearchTerm("");
    
    toast.success("Sample literature review data added! Explore the collaboration features to see the tool in action.");
  };

  const addReference = () => {
    if (!newReference.title || !newReference.authors) {
      toast.error("Title and authors are required.");
      return;
    }

    const newRef: Reference = {
      ...newReference,
      id: `ref-${Date.now()}`,
      citation: `${newReference.authors} (${newReference.year}). ${newReference.title}. ${newReference.source}.`,
      tags: newReference.tags.filter(tag => tag.trim() !== ""),
      createdAt: new Date()
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
    toast.success("Reference added successfully!");
  };

  const _updateReference = (_updatedReference: Reference) => {
    // Reserved for future reference update functionality
    // setReferences(references.map(ref => ref.id === updatedReference.id ? updatedReference : ref));
  };

  const _deleteReference = (_id: string) => {
    // Reserved for future reference delete functionality
    // setReferences(references.filter(ref => ref.id !== id));
    // toast.success("Reference deleted.");
  };

  const addTheme = () => {
    if (!newTheme.name || !newTheme.description) {
      toast.error("Theme name and description are required.");
      return;
    }

    const theme: Theme = {
      ...newTheme,
      id: `theme-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: profile?.id || "",
      members: [profile?.id || ""]
    };

    setThemes([...themes, theme]);
    setNewTheme({
      name: "",
      description: "",
      codes: [],
      supportingQuotes: []
    });
    toast.success("Theme added successfully!");
  };

  const _updateTheme = (_updatedTheme: Theme) => {
    // Reserved for future theme update functionality
    // setThemes(themes.map(theme => theme.id === updatedTheme.id ? updatedTheme : theme));
  };

  const _deleteTheme = (_id: string) => {
    // Reserved for future theme delete functionality
    // setThemes(themes.filter(theme => theme.id !== id));
    // toast.success("Theme deleted.");
  };

  const addMember = () => {
    if (!newMemberEmail || !/\S+@\S+\.\S+/.test(newMemberEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    // Check if member already exists
    if (groupMembers.some(member => member.email === newMemberEmail)) {
      toast.error("Member already exists in the group.");
      return;
    }

    const newMember: GroupMember = {
      id: `member-${Date.now()}-${groupMembers.length}`,
      name: newMemberEmail.split('@')[0],
      email: newMemberEmail,
      role: "member",
      joinedAt: new Date()
    };

    setGroupMembers([...groupMembers, newMember]);
    setNewMemberEmail("");
    toast.success("Member added successfully!");
  };

  const _removeMember = (_id: string) => {
    // Reserved for future member removal functionality
    // setGroupMembers(groupMembers.filter(member => member.id !== id));
    // toast.success("Member removed.");
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Collaborative Literature Review</h1>
          <p className="text-muted-foreground">Work together with your team to analyze and organize research</p>
        </div>
        <Button variant="outline" onClick={addSampleData}>
          <FileText className="w-4 h-4 mr-2" />
          Add Sample Data
        </Button>
      </div>

      {/* Team Members Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Members
          </CardTitle>
          <CardDescription>Collaborate with your group on literature analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <Input
              placeholder="Member email"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              className="flex-1"
            />
            <Button onClick={addMember} disabled={!newMemberEmail}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {groupMembers.map(member => (
              <Badge key={member.id} variant="outline" className="px-3 py-1 flex items-center gap-2">
                <Users className="w-3 h-3" />
                {member.name} {member.role === 'lead' && '(Lead)'}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="references" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="references">References</TabsTrigger>
          <TabsTrigger value="themes">Theme Development</TabsTrigger>
          <TabsTrigger value="relationships">Relationships</TabsTrigger>
        </TabsList>
        
        <TabsContent value="references" className="space-y-6 mt-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Card className="sm:col-span-1">
              <CardHeader>
                <CardTitle>Add New Reference</CardTitle>
                <CardDescription>Enter details for a new reference</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newReference.title}
                      onChange={(e) => setNewReference({...newReference, title: e.target.value})}
                      placeholder="e.g., The Impact of Social Media on Education"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="authors">Authors</Label>
                    <Input
                      id="authors"
                      value={newReference.authors}
                      onChange={(e) => setNewReference({...newReference, authors: e.target.value})}
                      placeholder="e.g., Dela Cruz, M.A., & Santos, J.B."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="year">Year</Label>
                      <Input
                        id="year"
                        type="number"
                        value={newReference.year}
                        onChange={(e) => setNewReference({...newReference, year: parseInt(e.target.value) || new Date().getFullYear()})}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select value={newReference.type} onValueChange={(value) => setNewReference({...newReference, type: value as any})}>
                        <SelectTrigger>
                          <SelectValue />
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
                  </div>
                  
                  <div>
                    <Label htmlFor="source">Source</Label>
                    <Input
                      id="source"
                      value={newReference.source}
                      onChange={(e) => setNewReference({...newReference, source: e.target.value})}
                      placeholder="e.g., Journal name, volume, pages"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      value={newReference.tags.join(", ")}
                      onChange={(e) => setNewReference({...newReference, tags: e.target.value.split(",").map(tag => tag.trim())})}
                      placeholder="e.g., social media, academic performance, philippines"
                    />
                  </div>
                  
                  <Button onClick={addReference}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Reference
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <div className="sm:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">References ({references.length})</h2>
                <Input
                  placeholder="Search references..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-xs"
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                {filteredReferences.map(reference => (
                  <Card key={reference.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{reference.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">{reference.authors} ({reference.year})</p>
                        </div>
                        <Badge variant="outline" className="capitalize">{reference.type.replace('-', ' ')}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-2"><span className="font-medium">Source: </span>{reference.source}</p>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {reference.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        Added: {reference.createdAt.toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="themes" className="space-y-6 mt-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Create New Theme</CardTitle>
                <CardDescription>Develop research themes collaboratively</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="theme-name">Theme Name</Label>
                    <Input
                      id="theme-name"
                      value={newTheme.name}
                      onChange={(e) => setNewTheme({...newTheme, name: e.target.value})}
                      placeholder="e.g., Digital Learning Impact"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="theme-desc">Description</Label>
                    <Textarea
                      id="theme-desc"
                      value={newTheme.description}
                      onChange={(e) => setNewTheme({...newTheme, description: e.target.value})}
                      placeholder="Describe the research theme..."
                      rows={2}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="theme-codes">Codes (comma separated)</Label>
                    <Input
                      id="theme-codes"
                      value={newTheme.codes.join(", ")}
                      onChange={(e) => setNewTheme({...newTheme, codes: e.target.value.split(",").map(code => code.trim()).filter(code => code)})}
                      placeholder="e.g., Social Media Usage, Academic Performance"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="theme-quotes">Supporting Quotes</Label>
                    <Textarea
                      id="theme-quotes"
                      value={newTheme.supportingQuotes.join("\n")}
                      onChange={(e) => setNewTheme({...newTheme, supportingQuotes: e.target.value.split("\n").filter(quote => quote.trim() !== "")})}
                      placeholder="Add supporting quotes or evidence, one per line..."
                      rows={3}
                    />
                  </div>
                  
                  <Button onClick={addTheme} disabled={!newTheme.name || !newTheme.description}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Theme
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Developed Themes</h3>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {themes.map(theme => (
                  <Card 
                    key={theme.id} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedTheme(theme)}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{theme.name}</CardTitle>
                        <Badge variant="outline">{theme.codes.length} codes</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm mb-3">{theme.description}</p>
                      
                      <div className="mb-3">
                        <h4 className="text-sm font-medium mb-2">Codes:</h4>
                        <div className="flex flex-wrap gap-1">
                          {theme.codes.map((code, index) => (
                            <Badge key={index} variant="secondary">{code}</Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium mb-2">Supporting Evidence:</h4>
                        <div className="space-y-1 max-h-24 overflow-y-auto">
                          {theme.supportingQuotes.slice(0, 2).map((quote, index) => (
                            <p key={index} className="text-xs bg-muted p-2 rounded truncate">{quote}</p>
                          ))}
                          {theme.supportingQuotes.length > 2 && (
                            <p className="text-xs text-muted-foreground">+{theme.supportingQuotes.length - 2} more quotes</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground">
                        <span>Created: {theme.createdAt.toLocaleDateString()}</span>
                        <span>{theme.members.length} collaborators</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="relationships" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Relationship Management</CardTitle>
              <CardDescription>Define and manage relationships between variables</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Source Variable</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source variable" />
                      </SelectTrigger>
                      <SelectContent>
                        {references.filter(ref => ref.type === "independent").map(ref => (
                          <SelectItem key={ref.id} value={ref.id}>{ref.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Target Variable</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select target variable" />
                      </SelectTrigger>
                      <SelectContent>
                        {references.filter(ref => ref.type === "dependent").map(ref => (
                          <SelectItem key={ref.id} value={ref.id}>{ref.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label>Relationship Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="causal">Causal Relationship</SelectItem>
                      <SelectItem value="correlational">Correlational Relationship</SelectItem>
                      <SelectItem value="moderating">Moderating Relationship</SelectItem>
                      <SelectItem value="meditating">Mediating Relationship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Description</Label>
                  <Textarea placeholder="Describe the relationship..." rows={2} />
                </div>
                
                <Button className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Relationship
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Established Relationships</CardTitle>
              <CardDescription>Connect your research variables</CardDescription>
            </CardHeader>
            <CardContent>
              {relationships.length > 0 ? (
                <div className="space-y-3">
                  {relationships.map(rel => {
                    const source = references.find(r => r.id === rel.sourceId);
                    const target = references.find(r => r.id === rel.targetId);
                    
                    return (
                      <div key={rel.id} className="flex items-center gap-2 p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{source?.title || "Unknown"}</Badge>
                          <GitBranch className="w-4 h-4 text-muted-foreground" />
                          <Badge variant="outline">{target?.title || "Unknown"}</Badge>
                        </div>
                        <Badge variant="secondary" className="ml-2">{rel.type}</Badge>
                        <p className="ml-2 text-sm text-muted-foreground">{rel.description}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <GitBranch className="mx-auto h-12 w-12 mb-4" />
                  <p>No relationships defined yet. Connect your variables to visualize your conceptual framework.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}