"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  Search, 
  TrendingUp, 
  FileText, 
  Globe, 
  Database, 
  Lightbulb,
  BookOpen,
  AlertTriangle,
  Download,
  Copy
} from "lucide-react";

type PhilippineStat = {
  id: string;
  source: string;
  year: number;
  value: string;
  description: string;
};

type LiteratureGap = {
  id: string;
  title: string;
  issue: string;
  significance: string;
  suggestedApproach: string;
};

type ResearchProblem = {
  id: string;
  title: string;
  description: string;
  context: string;
  gap: string;
  significance: string;
  relevance: "high" | "medium" | "low";
  phStatus: boolean; // Philippine relevance
  dataAvailability: "high" | "medium" | "low";
  potentialImpact: string;
  suggestedApproach: string;
  relatedLiterature: string[];
  phStatistics: PhilippineStat[];
  literatureGaps: LiteratureGap[];
};

export function ResearchProblemIdentifier() {
  const [researchTopic, setResearchTopic] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [location, setLocation] = useState("philippines");
  const [region, setRegion] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [identifiedProblems, setIdentifiedProblems] = useState<ResearchProblem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<ResearchProblem | null>(null);

  const fieldsOfStudy = [
    "Education", "Business", "Health Sciences", "Engineering", 
    "Psychology", "Sociology", "Environmental Science", 
    "Information Technology", "Public Health", "Agriculture"
  ];

  const regions = [
    "National", "NCR", "Region I", "Region II", "Region III", 
    "Region IV-A", "Region IV-B", "Region V", "Region VI", 
    "Region VII", "Region VIII", "Region IX", "Region X", 
    "Region XI", "Region XII", "CAR", "CARAGA", "BARMM"
  ];

  const handleAnalyze = () => {
    if (!researchTopic || !fieldOfStudy) return;
    
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    // Simulate analysis progress with more detailed steps
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAnalyzing(false);
          
          // Generate mock research problems with enhanced functionality
          const mockProblems: ResearchProblem[] = [
            {
              id: "1",
              title: `Cyberbullying Among Senior High School Students in ${region || 'Philippines'}`,
              description: "Examining factors contributing to cyberbullying among senior high school students in the Philippines.",
              context: `According to PSA 2023 data, there has been a 16% increase in reported cyberbullying cases among teenagers in ${region || 'Region X'}.`,
              gap: `Few studies discuss this trend among senior high school students in ${region || 'Bukidnon'}. Most research focuses on Metro Manila and college students.`,
              significance: `Addressing this gap could inform local prevention strategies and school policies tailored to this region.`,
              relevance: "high",
              phStatus: true,
              dataAvailability: "high",
              potentialImpact: "High potential to inform local school policies and intervention strategies",
              suggestedApproach: "Mixed-methods approach with surveys and focus group discussions in selected schools",
              relatedLiterature: [
                "Philippine Digital Safety Report 2023",
                "Cyberbullying Patterns in ASEAN Youth, 2022",
                "Digital Well-being of Filipino Students Study"
              ],
              phStatistics: [
                {
                  id: "stat-1",
                  source: "PSA",
                  year: 2023,
                  value: "16% rise in cyberbullying cases",
                  description: "Increase among teenagers in Region X"
                },
                {
                  id: "stat-2", 
                  source: "DepEd",
                  year: 2023,
                  value: "42% of students report online harassment",
                  description: "National survey of high school students"
                }
              ],
              literatureGaps: [
                {
                  id: "gap-1",
                  title: "Regional Focus Gap",
                  issue: "Most studies concentrated in urban areas",
                  significance: "Lack of regional perspectives and interventions",
                  suggestedApproach: "Study specific regional factors and cultural context"
                },
                {
                  id: "gap-2",
                  title: "Age-Specific Research",
                  issue: "Limited research on senior high school experiences",
                  significance: "Important life transition period with unique vulnerabilities",
                  suggestedApproach: "Focus on developmental and social factors specific to this age group"
                }
              ]
            },
            {
              id: "2",
              title: `Sustainable ${fieldOfStudy} Practices in Philippine SMEs`,
              description: "Analyzing the adoption of sustainable practices in small and medium enterprises within the Philippines.",
              context: "NEDA data shows that 99.6% of Philippine businesses are SMEs, contributing 35% to national GDP.",
              gap: "Limited research on sustainability practices among micro-SMEs, particularly in rural areas outside major cities.",
              significance: "Could guide policy for sustainable economic growth in line with SDGs.",
              relevance: "medium",
              phStatus: true,
              dataAvailability: "medium", 
              potentialImpact: "Could guide business sustainability initiatives and government support programs",
              suggestedApproach: "Case study approach with selected SMEs in major cities",
              relatedLiterature: [
                "Philippine Business Sustainability Guidelines",
                "ASEAN SME Sustainability Framework",
                "Green Business Practices in Southeast Asia"
              ],
              phStatistics: [
                {
                  id: "stat-3",
                  source: "NEDA",
                  year: 2023,
                  value: "99.6% of businesses are SMEs",
                  description: "Contribution to national economic structure"
                },
                {
                  id: "stat-4",
                  source: "DTI",
                  year: 2023,
                  value: "35% GDP contribution",
                  description: "Economic significance of SMEs"
                }
              ],
              literatureGaps: [
                {
                  id: "gap-3",
                  title: "Rural vs Urban Practices",
                  issue: "Little comparison of sustainability practices between rural and urban SMEs",
                  significance: "Different resource access and market dynamics",
                  suggestedApproach: "Comparative study of rural and urban SME sustainability models"
                }
              ]
            },
            {
              id: "3",
              title: `Challenges in ${fieldOfStudy} Research in Philippine Universities`,
              description: "Investigating the barriers to effective research implementation in local universities.",
              context: "CHED report indicates that only 40% of state universities meet research productivity standards.",
              gap: "Limited studies on research capacity building mechanisms for faculty and students.",
              significance: "Could influence university research policies and funding allocation.",
              relevance: "high",
              phStatus: true,
              dataAvailability: "high",
              potentialImpact: "Could influence university research policies and funding allocation",
              suggestedApproach: "Survey and interviews with researchers and university administrators",
              relatedLiterature: [
                "Philippine Higher Education Research Report",
                "University Research Productivity Metrics",
                "Academic Research Challenges in Developing Countries"
              ],
              phStatistics: [
                {
                  id: "stat-5",
                  source: "CHED",
                  year: 2023,
                  value: "40% of state universities meet research standards",
                  description: "Research productivity benchmark"
                }
              ],
              literatureGaps: [
                {
                  id: "gap-4",
                  title: "Faculty Support Systems",
                  issue: "Limited research on institutional support for faculty research",
                  significance: "Critical for improving research output",
                  suggestedApproach: "Study of institutional mechanisms for research support"
                }
              ]
            }
          ];
          
          setIdentifiedProblems(mockProblems);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const generateResearchQuestions = (problemId: string) => {
    setIsGenerating(true);
    // In a real implementation, this would call an AI API to generate research questions
    setTimeout(() => {
      setIsGenerating(false);
      alert(`Research questions generated for problem: ${problemId}`);
    }, 1500);
  };

  const exportProblemStatement = (problem: ResearchProblem) => {
    const statement = `Research Problem Statement:
    
Context: ${problem.context}

Gap: ${problem.gap}

Significance: ${problem.significance}

Suggested Research Question: To what extent does ${problem.title.toLowerCase()} affect [specific outcomes] in ${region || 'the Philippines'}, and what factors contribute to this phenomenon?`;

    // Copy to clipboard for user
    navigator.clipboard.writeText(statement);
    alert("Problem statement copied to clipboard!");
  };

  const addSampleData = () => {
    // Simulate a research topic input
    setResearchTopic("The Impact of Social Media Usage on Academic Performance of Senior High School Students in Region III");
    setFieldOfStudy("education");
    setLocation("regional");
    setRegion("Region III");
    
    // Create sample research problems
    const mockProblems: ResearchProblem[] = [
      {
        id: "1",
        title: "Social Media Usage and Academic Performance in Region III",
        description: "Examining the relationship between social media usage patterns and academic performance among senior high school students in Central Luzon.",
        context: "According to PSA 2023 data, 85% of teenagers in Region III have daily access to social media platforms, with average usage of 4.5 hours per day.",
        gap: "Few studies discuss this relationship specifically among senior high school students in Region III. Most research focuses on college students or national trends.",
        significance: "Addressing this gap could inform local education policies and student guidance programs for balanced technology use.",
        relevance: "high",
        phStatus: true,
        dataAvailability: "high",
        potentialImpact: "High potential to inform local education policies and student guidance programs",
        suggestedApproach: "Mixed-methods approach with surveys in selected schools and focus group discussions",
        relatedLiterature: [
          "Philippine Digital Safety Report 2023",
          "Social Media and Academic Performance in ASEAN Youth, 2022",
          "Digital Well-being of Filipino Students Study",
          "Student Technology Use Patterns in Central Luzon High Schools"
        ],
        phStatistics: [
          {
            id: "stat-1",
            source: "PSA",
            year: 2023,
            value: "85% of teenagers have daily social media access",
            description: "In Region III, with average usage of 4.5 hours per day"
          },
          {
            id: "stat-2", 
            source: "DepEd",
            year: 2023,
            value: "42% of students report distraction from social media",
            description: "National survey of high school students"
          }
        ],
        literatureGaps: [
          {
            id: "gap-1",
            title: "Regional Focus Gap",
            issue: "Most studies concentrated in NCR and Region IV",
            significance: "Lack of regional perspectives and interventions for Central Luzon",
            suggestedApproach: "Study specific regional factors and cultural context in Region III"
          },
          {
            id: "gap-2",
            title: "Age-Specific Research",
            issue: "Limited research on senior high school digital behavior",
            significance: "Important life transition period with unique vulnerabilities",
            suggestedApproach: "Focus on developmental and social factors specific to this age group"
          }
        ]
      },
      {
        id: "2",
        title: "Technology Integration in Philippine Senior High Schools",
        description: "Analyzing factors that influence effective technology integration in the K-12 curriculum.",
        context: "NEDA data shows that 65% of public senior high schools in Region III have limited digital infrastructure, affecting implementation of the technology-focused tracks.",
        gap: "Limited research on teacher readiness and institutional factors that affect technology integration in the new K-12 system.",
        significance: "Could guide policy for educational technology investment in line with the Digital Philippines 2030 plan.",
        relevance: "medium",
        phStatus: true,
        dataAvailability: "medium", 
        potentialImpact: "Could guide educational technology policies and teacher training programs",
        suggestedApproach: "Case study approach with selected schools in Region III",
        relatedLiterature: [
          "Philippine Educational Technology Framework",
          "K-12 Technology Integration Best Practices",
          "Teacher Digital Readiness Survey in Philippine Schools"
        ],
        phStatistics: [
          {
            id: "stat-3",
            source: "DepEd",
            year: 2023,
            value: "65% of public senior high schools have limited digital infrastructure",
            description: "In Region III, affecting technology track implementation"
          },
          {
            id: "stat-4",
            source: "CHED",
            year: 2023,
            value: "40% of teachers need additional technology training",
            description: "Report on teacher readiness for digital learning"
          }
        ],
        literatureGaps: [
          {
            id: "gap-3",
            title: "Implementation Research",
            issue: "Little research on actual implementation challenges at the school level",
            significance: "Critical for effective technology adoption in schools",
            suggestedApproach: "Multi-site case study of technology implementation in different school contexts"
          }
        ]
      }
    ];
    
    setIdentifiedProblems(mockProblems);
    setAnalysisProgress(100);
    setIsAnalyzing(false);
    setSelectedProblem(mockProblems[0]); // Select the first problem
    
    alert("Sample research problems added! The tool now shows realistic examples with Philippine statistics and literature gaps.");
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Research Problem Identifier</h1>
          <p className="text-muted-foreground">Discover relevant research problems with Philippine-specific data and literature gaps</p>
        </div>
        <Button variant="outline" onClick={addSampleData} className="self-start">
          <FileText className="w-4 h-4 mr-2" />
          Add Sample Data
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Research Topic Analysis</CardTitle>
          <CardDescription>
            Enter your research topic and field of study to identify potential problems using AI analysis, Philippine statistics, and literature gap identification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="topic">Research Topic</Label>
              <Input
                id="topic"
                placeholder="Enter your research topic or area of interest (e.g., 'cyberbullying among senior high school students in Bukidnon')"
                value={researchTopic}
                onChange={(e) => setResearchTopic(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="field">Field of Study</Label>
                <Select value={fieldOfStudy} onValueChange={setFieldOfStudy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select field of study" />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldsOfStudy.map((field) => (
                      <SelectItem key={field} value={field.toLowerCase()}>
                        {field}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="location">Geographic Focus</Label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="philippines">Philippines</SelectItem>
                    <SelectItem value="national">National</SelectItem>
                    <SelectItem value="regional">Regional</SelectItem>
                    <SelectItem value="provincial">Provincial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {location !== "philippines" && location !== "national" && (
                <div>
                  <Label htmlFor="region">Specific Region</Label>
                  <Select value={region} onValueChange={setRegion}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((reg) => (
                        <SelectItem key={reg} value={reg}>
                          {reg}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            <Button 
              onClick={handleAnalyze} 
              disabled={!researchTopic || !fieldOfStudy || isAnalyzing}
              className="w-full sm:w-auto"
            >
              <Search className="w-4 h-4 mr-2" />
              {isAnalyzing ? "Analyzing..." : "Identify Research Problems"}
            </Button>
            <Button
              variant="outline"
              onClick={addSampleData}
              disabled={isAnalyzing}
              className="w-full sm:w-auto"
            >
              <FileText className="w-4 h-4 mr-2" />
              Load Sample Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {isAnalyzing && (
        <Card>
          <CardHeader>
            <CardTitle>AI Analysis in Progress</CardTitle>
            <CardDescription>
              Analyzing your topic, checking Philippine databases, and identifying literature gaps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Parsing topic...</span>
                <span>{analysisProgress < 30 ? analysisProgress : analysisProgress >= 30 && analysisProgress < 60 ? 30 : analysisProgress >= 60 ? 100 : analysisProgress}%</span>
              </div>
              <Progress value={analysisProgress} className="w-full" />
              <div className="text-center text-sm text-muted-foreground">
                Searching Philippine databases: {analysisProgress < 30 ? "PSA, DepEd, DOH, NEDA" : analysisProgress < 60 ? "PSA, DepEd, DOH, NEDA" : analysisProgress < 90 ? "PSA, DepEd, DOH, NEDA, CHED" : "Complete"}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {identifiedProblems.length > 0 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Identified Research Problems</h2>
            <Badge variant="secondary">{identifiedProblems.length} problems found</Badge>
          </div>
          
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="grid w-full grid-cols-3 sm:w-[400px]">
              <TabsTrigger value="list">Problem List</TabsTrigger>
              <TabsTrigger value="analysis">Gap Analysis</TabsTrigger>
              <TabsTrigger value="export">Export Statement</TabsTrigger>
            </TabsList>
            
            <TabsContent value="list" className="mt-4">
              <div className="grid gap-6">
                {identifiedProblems.map((problem) => (
                  <Card 
                    key={problem.id} 
                    className={`hover:shadow-md transition-shadow cursor-pointer ${selectedProblem?.id === problem.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedProblem(problem)}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            {problem.title}
                          </CardTitle>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            <Badge 
                              variant={problem.relevance === "high" ? "default" : problem.relevance === "medium" ? "secondary" : "outline"}
                            >
                              {problem.relevance.charAt(0).toUpperCase() + problem.relevance.slice(1)} Relevance
                            </Badge>
                            {problem.phStatus && (
                              <Badge variant="outline" className="border-blue-500 text-blue-700">
                                <Globe className="w-3 h-3 mr-1" />
                                Philippine Focus
                              </Badge>
                            )}
                            <Badge variant="outline">
                              Data: {problem.dataAvailability.charAt(0).toUpperCase() + problem.dataAvailability.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-2"><span className="font-medium">Context:</span> {problem.context}</p>
                      <p className="text-muted-foreground mb-2"><span className="font-medium">Gap:</span> {problem.gap}</p>
                      <p className="text-muted-foreground mb-4"><span className="font-medium">Significance:</span> {problem.significance}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            Potential Impact
                          </h4>
                          <p className="text-sm">{problem.potentialImpact}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-1">
                            <Lightbulb className="h-4 w-4" />
                            Suggested Approach
                          </h4>
                          <p className="text-sm">{problem.suggestedApproach}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            generateResearchQuestions(problem.id);
                          }}
                          disabled={isGenerating}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Generate Questions
                        </Button>
                        <Button variant="outline" size="sm">
                          <Database className="w-4 h-4 mr-2" />
                          Check Data Sources
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="analysis" className="mt-4">
              {selectedProblem ? (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Philippine Statistics</CardTitle>
                      <CardDescription>
                        Recent data from Philippine government sources related to this research problem
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedProblem.phStatistics.map((stat) => (
                          <div key={stat.id} className="p-4 border rounded-lg bg-blue-50">
                            <div className="flex items-center gap-2 mb-2">
                              <Database className="h-4 w-4 text-blue-600" />
                              <h4 className="font-medium">{stat.source} ({stat.year})</h4>
                            </div>
                            <p className="text-lg font-bold text-blue-800">{stat.value}</p>
                            <p className="text-sm text-blue-600">{stat.description}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Literature Gap Analysis</CardTitle>
                      <CardDescription>
                        Identified gaps in existing research based on your topic
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedProblem.literatureGaps.map((gap) => (
                          <div key={gap.id} className="p-4 border rounded-lg">
                            <h4 className="font-medium flex items-center gap-1">
                              <AlertTriangle className="h-4 w-4" />
                              {gap.title}
                            </h4>
                            <p className="mt-2"><span className="font-medium">Issue:</span> {gap.issue}</p>
                            <p><span className="font-medium">Significance:</span> {gap.significance}</p>
                            <p className="mt-2"><span className="font-medium">Suggested Approach:</span> {gap.suggestedApproach}</p>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-6">
                        <h3 className="font-medium mb-3">Recommendations</h3>
                        <ul className="list-disc list-inside space-y-2">
                          <li>Focus on regional differences within the Philippines to provide nuanced insights</li>
                          <li>Consider partnership with local institutions for data access</li>
                          <li>Align your research with Philippine government priorities in {fieldOfStudy}</li>
                          <li>Engage with local communities to ensure cultural relevance</li>
                          <li>Address the identified literature gaps in your study design</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12 text-muted-foreground">
                    <BookOpen className="mx-auto h-12 w-12 mb-4" />
                    <p>Select a research problem to see detailed statistics and literature gap analysis</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="export" className="mt-4">
              {selectedProblem ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Problem Statement Generator</CardTitle>
                    <CardDescription>
                      Export a structured research problem statement for your thesis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <h4 className="font-medium mb-2">Generated Problem Statement:</h4>
                        <p className="whitespace-pre-line">
                          Context: {selectedProblem.context}
                        </p>
                        <p className="whitespace-pre-line mt-2">
                          Gap: {selectedProblem.gap}
                        </p>
                        <p className="whitespace-pre-line mt-2">
                          Significance: {selectedProblem.significance}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => exportProblemStatement(selectedProblem)}
                          className="flex items-center gap-2"
                        >
                          <Copy className="w-4 h-4" />
                          Copy to Clipboard
                        </Button>
                        <Button 
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Download as Text
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-12 text-muted-foreground">
                    <Target className="mx-auto h-12 w-12 mb-4" />
                    <p>Select a research problem to generate and export the problem statement</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}