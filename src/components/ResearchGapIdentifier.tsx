'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  Search, 
  TrendingUp, 
  FileText, 
  GraduationCap, 
  AlertTriangle, 
  Download, 
  Copy,
  Calendar,
  PiggyBank,
  Trash2
} from 'lucide-react';
import { ResearchGap, GapAnalysisResponse } from '@/types/researchGap';
import { toast } from 'sonner';

export function ResearchGapIdentifier() {
  const [researchTopic, setResearchTopic] = useState("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [keywords, setKeywords] = useState("");
  const [researchFocus, setResearchFocus] = useState("");
  const [geographicScope, setGeographicScope] = useState("philippines");
  const [existingLiterature, setExistingLiterature] = useState("");
  const [importedReferences, setImportedReferences] = useState<{id: string, title: string, authors: string, year: number}[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<GapAnalysisResponse | null>(null);
  const [selectedGap, setSelectedGap] = useState<ResearchGap | null>(null);

  const fieldsOfStudy = [
    "Education", "Business", "Health Sciences", "Engineering",
    "Psychology", "Sociology", "Environmental Science",
    "Information Technology", "Public Health", "Agriculture",
    "Political Science", "Economics", "Mathematics", "Physics",
    "Chemistry", "Biology", "Anthropology", "History", "Linguistics"
  ];

  const researchFocuses = [
    { value: "quantitative", label: "Quantitative" },
    { value: "qualitative", label: "Qualitative" },
    { value: "mixed", label: "Mixed Methods" },
    { value: "theoretical", label: "Theoretical" },
    { value: "methodological", label: "Methodological" }
  ];

  const regions = [
    "Philippines (National)", "NCR", "Region I", "Region II", "Region III",
    "Region IV-A", "Region IV-B", "Region V", "Region VI",
    "Region VII", "Region VIII", "Region IX", "Region X",
    "Region XI", "Region XII", "CAR", "CARAGA", "BARMM", "International"
  ];

  const handleAnalyze = async () => {
    if (!researchTopic || !fieldOfStudy) return;

    setIsAnalyzing(true);
    setAnalysisProgress(0);

    try {
      // Update progress during API call
      setAnalysisProgress(20);
      
      // Call the backend function
      const response = await fetch('/api/analyze-research-gaps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          researchTopic,
          fieldOfStudy,
          keywords: keywords.split(',').map(k => k.trim()).filter(k => k),
          existingLiterature,
          researchFocus,
          importedReferences
        })
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      setAnalysisProgress(80);
      
      const analysisData = await response.json();
      setAnalysisResult(analysisData);
      setAnalysisProgress(100);
      toast.success("Research gaps analyzed successfully!");
    } catch (error) {
      console.error('Error analyzing research gaps:', error);
      toast.error('Failed to analyze research gaps. Please try again.');
      
      // Fallback to mock data
      const mockAnalysis: GapAnalysisResponse = {
        requestId: "gap-analysis-1",
        analysisDate: new Date(),
        confidenceScore: 85,
        methodology: "Literature synthesis and gap analysis using semantic similarity matching and citation analysis",
        dataSources: ["PubMed", "Google Scholar", "ACM Digital Library", "Philippine databases", ...importedReferences.map(ref => ref.title)],
        identifiedGaps: [
          {
            id: "gap-1",
            title: "Longitudinal Impact of Digital Learning Tools on Critical Thinking in Philippine Higher Education",
            description: "While numerous studies examine the immediate effects of digital learning tools on academic performance, there is a significant gap in understanding their long-term impact on critical thinking skills among Filipino college students.",
            gapType: "empirical",
            noveltyScore: 88,
            feasibilityScore: 75,
            significanceScore: 92,
            potentialContribution: "This research would provide crucial longitudinal data on the long-term educational outcomes of digital tool usage, informing educational policy and curriculum design in Philippine universities.",
            relatedFields: ["Education", "Educational Technology", "Psychology"],
            requiredResources: ["Longitudinal study participants", "Critical thinking assessment tools", "Digital learning platform access"],
            timelineEstimate: "12-18 months",
            supportingLiterature: [
              // Include imported references if available
              ...importedReferences.map(ref => ({
                id: `lit-${ref.id}`,
                title: ref.title,
                authors: ref.authors,
                year: ref.year,
                type: "study" as const,
                findings: "Initial findings on this topic",
                limitations: ["Limited to specific context", "Short-term findings"],
                relevanceScore: 75,
                contribution: "minor" as const,
                gapConnection: "Provides baseline understanding but lacks comprehensive analysis"
              })),
                  {
                    id: "lit-2",
                    title: "Technology Adoption in Higher Education: A Philippine Perspective",
                    authors: "Reyes, A. et al.",
                    year: 2021,
                    type: "review",
                    findings: "Review of technology adoption rates and challenges",
                    limitations: ["No learning outcome measures", "Cross-sectional data"],
                    relevanceScore: 65,
                    contribution: "moderate",
                    gapConnection: "Highlights adoption issues but lacks long-term learning impact analysis"
                  }
                ],
                keyCitations: [
                  "Santos & Dela Cruz (2022). Digital Learning and Academic Performance...",
                  "Reyes et al. (2021). Technology Adoption in Higher Education...",
                  ...importedReferences.map(ref => `${ref.authors} (${ref.year}). ${ref.title}`)
                ],
                researchMethodology: "Mixed-methods longitudinal study tracking students over 3 years",
                potentialChallenges: [
                  "Participant retention over long study period",
                  "Changing technology landscape during study",
                  "Establishing causal relationships"
                ],
                solutionApproach: "Use control groups with different technology exposure and validated critical thinking assessments"
              },
              {
                id: "gap-2",
                title: "Cultural Adaptation of Western Mental Health Interventions in Filipino Contexts",
                description: "Existing mental health interventions, primarily developed in Western contexts, may not fully address the unique cultural factors in Filipino society such as family dynamics, shame culture, and spiritual beliefs.",
                gapType: "contextual",
                noveltyScore: 95,
                feasibilityScore: 65,
                significanceScore: 98,
                potentialContribution: "This research would create culturally adapted mental health interventions that better serve Filipino populations, potentially improving treatment outcomes significantly.",
                relatedFields: ["Psychology", "Counseling", "Cultural Studies", "Public Health"],
                requiredResources: ["Licensed therapists", "Cultural consultants", "Community partnerships", "Validated assessment tools"],
                timelineEstimate: "18-24 months",
                supportingLiterature: [
                  {
                    id: "lit-4",
                    title: "Effectiveness of Western Therapy Models in Asian Pacific Contexts",
                    authors: "Chen, L. et al.",
                    year: 2020,
                    type: "study",
                    findings: "Reduced effectiveness due to cultural mismatch",
                    limitations: ["Limited to East Asian contexts", "No Filipino-specific data"],
                    relevanceScore: 85,
                    contribution: "major",
                    gapConnection: "Identifies cultural mismatch but lacks Philippine-specific validation"
                  }
                ],
                keyCitations: [
                  "Chen et al. (2020). Effectiveness of Western Therapy Models...",
                  ...importedReferences.map(ref => `${ref.authors} (${ref.year}). ${ref.title}`)
                ],
                researchMethodology: "Sequential explanatory mixed methods with quantitative efficacy study followed by qualitative cultural factor identification",
                potentialChallenges: [
                  "Balancing Western therapeutic principles with cultural practices",
                  "Accessing diverse cultural groups",
                  "Validating adapted interventions"
                ],
                solutionApproach: "Community-based participatory research with cultural adaptation frameworks"
              },
              {
                id: "gap-3",
                title: "Sustainable Energy Solutions for Philippine Off-Grid Communities",
                description: "While renewable energy technologies are advancing globally, there's limited research on the most effective and sustainable energy solutions specifically for off-grid communities in the Philippines, considering local environmental, economic, and social factors.",
                gapType: "methodological",
                noveltyScore: 82,
                feasibilityScore: 78,
                significanceScore: 89,
                potentialContribution: "This research would inform policy and practice for sustainable energy access, contributing to SDG 7 (Affordable and Clean Energy) in the Philippine context.",
                relatedFields: ["Engineering", "Environmental Science", "Development Studies", "Economics"],
                requiredResources: ["Field testing sites", "Energy measurement equipment", "Community access", "Technical expertise"],
                timelineEstimate: "24-30 months",
                supportingLiterature: [
                  {
                    id: "lit-6",
                    title: "Renewable Energy Adoption in Southeast Asia",
                    authors: "Kumar, A. & Singh, B.",
                    year: 2021,
                    type: "review",
                    findings: "Overview of renewable adoption across SEA",
                    limitations: ["No Filipino focus", "Limited off-grid analysis"],
                    relevanceScore: 60,
                    contribution: "moderate",
                    gapConnection: "Provides regional context but lacks Philippines specificity"
                  }
                ],
                keyCitations: [
                  "Kumar & Singh (2021). Renewable Energy Adoption in Southeast Asia",
                  ...importedReferences.map(ref => `${ref.authors} (${ref.year}). ${ref.title}`)
                ],
                researchMethodology: "Design science methodology with iterative solution development and field testing",
                potentialChallenges: [
                  "Diverse geographic conditions across islands",
                  "Limited research infrastructure in remote areas",
                  "Economic constraints of target communities"
                ],
                solutionApproach: "Community-centered design with participatory technology development"
              }
            ],
            recommendations: [
              {
                gapId: "gap-1",
                priority: "high",
                rationale: "High significance and feasibility; aligns with educational policy needs",
                nextSteps: [
                  "Validate critical thinking assessment tools for Filipino context",
                  "Identify potential universities for longitudinal study",
                  "Develop research protocol and ethics approval"
                ],
                estimatedEffort: "high",
                timelineEstimate: "6-12 months for initial setup",
                resourceRequirements: ["Research assistants", "Assessment tools", "Statistical software"]
              },
              {
                gapId: "gap-2",
                priority: "high",
                rationale: "Extremely high significance; addresses mental health crisis with cultural sensitivity",
                nextSteps: [
                  "Review existing cultural adaptation frameworks",
                  "Connect with community organizations",
                  "Develop culturally appropriate intervention protocols"
                ],
                estimatedEffort: "medium",
                timelineEstimate: "3-6 months for initial setup",
                resourceRequirements: ["Licensed therapists", "Cultural consultants", "Community partnerships"]
              },
              {
                gapId: "gap-3",
                priority: "medium",
                rationale: "High significance but requires significant resources and time",
                nextSteps: [
                  "Identify potential remote communities for study",
                  "Assess available renewable technologies for local conditions",
                  "Develop partnership with energy agencies"
                ],
                estimatedEffort: "high",
                timelineEstimate: "6-12 months for initial setup",
                resourceRequirements: ["Field equipment", "Technical expertise", "Community access"]
              }
            ],
            relatedConferences: [
              {
                id: "conf-1",
                name: "International Conference on Educational Technology",
                topic: "Technology in Education",
                deadline: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days from now
                location: "Singapore",
                acceptanceRate: 25,
                relevanceToGap: 90,
                url: "https://icet.edu"
              },
              {
                id: "conf-2",
                name: "Asian Conference on Psychology and the Behavioral Sciences",
                topic: "Psychology in Asian Contexts",
                deadline: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000), // 150 days from now
                location: "Manila, Philippines",
                acceptanceRate: 35,
                relevanceToGap: 95,
                url: "https://acp.edu.ph"
              },
              {
                id: "conf-3",
                name: "International Renewable Energy Conference",
                topic: "Sustainable Energy Solutions",
                deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days from now
                location: "Bangkok, Thailand",
                acceptanceRate: 40,
                relevanceToGap: 85,
                url: "https://irec.energy"
              }
            ],
            fundingOpportunities: [
              {
                id: "fund-1",
                title: "DOST-SEI Research Grant",
                organization: "Department of Science and Technology - Science Education Institute",
                deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
                amount: "PHP 200,000 - 1,000,000",
                description: "Support for research that addresses Philippine development needs",
                eligibility: "Filipino researchers affiliated with recognized institutions",
                relevanceToGaps: ["gap-1", "gap-2", "gap-3"],
                url: "https://www.dost.gov.ph"
              },
              {
                id: "fund-2",
                title: "CHED Research Grant",
                organization: "Commission on Higher Education",
                deadline: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000), // 100 days from now
                amount: "PHP 150,000 - 500,000",
                description: "Support for faculty-led research projects",
                eligibility: "Faculty members of higher education institutions",
                relevanceToGaps: ["gap-1", "gap-2"],
                url: "https://www.cped.gov.ph"
              }
            ]
          };

          setAnalysisResult(mockAnalysis);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportGapStatement = (gap: ResearchGap) => {
    const statement = `Research Gap Statement:

Gap Title: ${gap.title}

Description: ${gap.description}

Gap Type: ${gap.gapType.charAt(0).toUpperCase() + gap.gapType.slice(1)}

Novelty Score: ${gap.noveltyScore}/100

Potential Contribution: ${gap.potentialContribution}

Significance: ${gap.significanceScore}/100

Suggested Methodology: ${gap.researchMethodology}`;

    // Copy to clipboard for user
    navigator.clipboard.writeText(statement);
    alert("Gap statement copied to clipboard!");
  };

  const addSampleAnalysis = () => {
    setResearchTopic("Digital Learning and Critical Thinking in Philippine Higher Education");
    setFieldOfStudy("education");
    setKeywords("digital learning, critical thinking, higher education, philippines");
    setResearchFocus("quantitative");
    setGeographicScope("philippines");
    setExistingLiterature("Santos & Dela Cruz (2022). Digital Learning and Academic Performance...; Reyes et al. (2021). Technology Adoption in Higher Education...");

    // Add sample imported references
    const sampleRefs = [
      { id: "ref1", title: "Digital Learning and Academic Performance", authors: "Santos, M. & Dela Cruz, J.", year: 2022 },
      { id: "ref2", title: "Technology Adoption in Higher Education", authors: "Reyes et al.", year: 2021 }
    ];
    setImportedReferences(sampleRefs);

    // Create sample gap analysis
    const mockAnalysis: GapAnalysisResponse = {
      requestId: "gap-analysis-sample",
      analysisDate: new Date(),
      confidenceScore: 88,
      methodology: "Literature synthesis and gap analysis using semantic similarity matching",
      dataSources: ["Philippine databases", "Google Scholar", "Educational Research Index", ...sampleRefs.map(ref => ref.title)],
      identifiedGaps: [
        {
          id: "sample-gap-1",
          title: "Longitudinal Impact of Digital Learning Tools on Critical Thinking in Philippine Higher Education",
          description: "While numerous studies examine the immediate effects of digital learning tools on academic performance, there is a significant gap in understanding their long-term impact on critical thinking skills among Filipino college students.",
          gapType: "empirical",
          noveltyScore: 90,
          feasibilityScore: 80,
          significanceScore: 95,
          potentialContribution: "This research would provide crucial longitudinal data on the long-term educational outcomes of digital tool usage, informing educational policy.",
          relatedFields: ["Education", "Educational Technology", "Psychology"],
          requiredResources: ["Participants", "Assessment tools", "Statistical software"],
          timelineEstimate: "12-18 months",
          supportingLiterature: [
            // Include imported references in the supporting literature
            ...sampleRefs.map(ref => ({
              id: `lit-${ref.id}`,
              title: ref.title,
              authors: ref.authors,
              year: ref.year,
              type: "study" as const,
              findings: "Initial findings on this topic",
              limitations: ["Limited to specific context", "Short-term findings"],
              relevanceScore: 75,
              contribution: "minor" as const,
              gapConnection: "Provides baseline understanding but lacks comprehensive analysis"
            })),
            {
              id: "lit-a",
              title: "Digital Learning and Academic Performance",
              authors: "Santos, M. & Dela Cruz, J.",
              year: 2022,
              type: "study",
              findings: "Positive correlation between digital tools and scores",
              limitations: ["Short-term", "Limited scope"],
              relevanceScore: 85,
              contribution: "major",
              gapConnection: "Provides evidence but lacks long-term perspective"
            }
          ],
          keyCitations: [
            "Santos & Dela Cruz (2022). Digital Learning and Academic Performance...",
            ...sampleRefs.map(ref => `${ref.authors} (${ref.year}). ${ref.title}`)
          ],
          researchMethodology: "Longitudinal mixed-methods study",
          potentialChallenges: ["Participant retention", "Changing technology"],
          solutionApproach: "Use validated assessments and control groups"
        }
      ],
      recommendations: [
        {
          gapId: "sample-gap-1",
          priority: "high",
          rationale: "High significance and feasibility; aligns with educational policy needs",
          nextSteps: [
            "Develop research protocol",
            "Identify study locations",
            "Apply for ethics approval"
          ],
          estimatedEffort: "high",
          timelineEstimate: "6 months for setup",
          resourceRequirements: ["Research team", "Assessment tools", "Statistical software"]
        }
      ],
      relatedConferences: [
        {
          id: "conf-a",
          name: "International Conference on Educational Technology",
          topic: "Technology in Education",
          deadline: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
          location: "Online",
          acceptanceRate: 25,
          relevanceToGap: 90,
          url: "https://icet.edu"
        }
      ],
      fundingOpportunities: [
        {
          id: "fund-a",
          title: "DOST-SEI Research Grant",
          organization: "Department of Science and Technology",
          deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          amount: "PHP 200,000 - 1,000,000",
          description: "Support for research addressing Philippine development needs",
          eligibility: "Filipino researchers",
          relevanceToGaps: ["sample-gap-1"],
          url: "https://www.dost.gov.ph"
        }
      ]
    };

    setAnalysisResult(mockAnalysis);
    setAnalysisProgress(100);
    setIsAnalyzing(false);
    setSelectedGap(mockAnalysis.identifiedGaps[0]);
    alert("Sample gap analysis loaded! This demonstrates the tool's capabilities with realistic examples.");
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Target className="w-8 h-8 text-primary" />
            Research Gap Identifier
          </h1>
          <p className="text-muted-foreground">Identify novel research opportunities by analyzing existing literature gaps</p>
        </div>
        <Button variant="outline" onClick={addSampleAnalysis} className="self-start">
          <FileText className="w-4 h-4 mr-2" />
          Add Sample Analysis
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gap Analysis Parameters</CardTitle>
          <CardDescription>
            Define your research focus and parameters to identify potential gaps in existing literature
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="topic">Research Topic</Label>
              <Input
                id="topic"
                placeholder="Enter your research topic or area of interest (e.g., 'digital learning tools in higher education')"
                value={researchTopic}
                onChange={(e) => setResearchTopic(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="keywords">Keywords</Label>
              <Input
                id="keywords"
                placeholder="Enter relevant keywords for your research (comma separated)"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="field-of-study">Field of Study</Label>
                <Select value={fieldOfStudy} onValueChange={setFieldOfStudy}>
                  <SelectTrigger id="field-of-study" aria-label="Select field of study">
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
                <Label htmlFor="research-focus">Research Focus</Label>
                <Select value={researchFocus} onValueChange={setResearchFocus}>
                  <SelectTrigger id="research-focus" aria-label="Select research focus">
                    <SelectValue placeholder="Select research focus" />
                  </SelectTrigger>
                  <SelectContent>
                    {researchFocuses.map((focus) => (
                      <SelectItem key={focus.value} value={focus.value}>
                        {focus.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="geographic-scope">Geographic Scope</Label>
                <Select value={geographicScope} onValueChange={setGeographicScope}>
                  <SelectTrigger id="geographic-scope" aria-label="Select geographic scope">
                    <SelectValue placeholder="Select geographic scope" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="existing-literature">Existing Literature</Label>
                <div className="flex gap-2 mt-2">
                  <Textarea
                    id="existing-literature"
                    placeholder="List existing literature you're familiar with (optional)"
                    value={existingLiterature}
                    onChange={(e) => setExistingLiterature(e.target.value)}
                    rows={3}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="self-end h-20"
                    onClick={() => {
                      // In a real implementation, this would fetch references from the user's literature review
                      // For now, adding sample references
                      const sampleRefs = [
                        { id: "ref1", title: "Digital Learning and Academic Performance", authors: "Santos, M. & Dela Cruz, J.", year: 2022 },
                        { id: "ref2", title: "Technology Adoption in Higher Education", authors: "Reyes et al.", year: 2021 }
                      ];
                      setImportedReferences(sampleRefs);
                      toast.success("Sample references imported successfully!");
                    }}
                    aria-label="Import literature references"
                  >
                    <FileText className="w-4 h-4" />
                  </Button>
                </div>
                {importedReferences.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium mb-1">Imported References:</p>
                    <div className="space-y-1">
                      {importedReferences.map(ref => (
                        <div key={ref.id} className="text-sm flex justify-between items-center p-2 bg-muted rounded">
                          <span>{ref.title}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setImportedReferences(prev => prev.filter(r => r.id !== ref.id))}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={!researchTopic || !fieldOfStudy || isAnalyzing}
              className="w-full sm:w-auto"
            >
              <Search className="w-4 h-4 mr-2" />
              {isAnalyzing ? "Analyzing Gaps..." : "Identify Research Gaps"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {isAnalyzing && (
        <Card>
          <CardHeader>
            <CardTitle>Gap Analysis in Progress</CardTitle>
            <CardDescription>
              Analyzing literature, identifying gaps, and evaluating novelty and feasibility
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Processing topic and keywords...</span>
                <span>{analysisProgress < 30 ? analysisProgress : analysisProgress >= 30 && analysisProgress < 60 ? 30 : analysisProgress >= 60 ? 90 : analysisProgress}%</span>
              </div>
              <Progress value={analysisProgress} className="w-full" />
              <div className="text-center text-sm text-muted-foreground">
                {analysisProgress < 30 ? "Analyzing keywords and topic..." : 
                 analysisProgress < 60 ? "Scanning literature databases..." :
                 analysisProgress < 90 ? "Evaluating gaps and feasibility..." :
                 "Compiling recommendations..."}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {analysisResult && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Identified Research Gaps</h2>
            <div className="flex gap-2">
              <Badge variant="secondary">Confidence: {analysisResult.confidenceScore}%</Badge>
              <Badge variant="outline">{analysisResult.identifiedGaps.length} gaps found</Badge>
            </div>
          </div>

          <Tabs defaultValue="gaps" className="w-full">
            <TabsList className="grid w-full grid-cols-4 sm:w-[600px]">
              <TabsTrigger value="gaps">Gap List</TabsTrigger>
              <TabsTrigger value="analysis">Gap Analysis</TabsTrigger>
              <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
              <TabsTrigger value="export">Export Findings</TabsTrigger>
            </TabsList>

            <TabsContent value="gaps" className="mt-4">
              <div className="grid gap-6">
                {analysisResult.identifiedGaps.map((gap) => (
                  <Card
                    key={gap.id}
                    className={`hover:shadow-md transition-shadow cursor-pointer ${selectedGap?.id === gap.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedGap(gap)}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            <span className="gap-title">{gap.title}</span>
                          </CardTitle>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            <Badge variant="outline">
                              Type: {gap.gapType.charAt(0).toUpperCase() + gap.gapType.slice(1)}
                            </Badge>
                            <Badge variant={gap.noveltyScore >= 80 ? "default" : gap.noveltyScore >= 60 ? "secondary" : "outline"}>
                              Novelty: {gap.noveltyScore}
                            </Badge>
                            <Badge variant={gap.significanceScore >= 80 ? "default" : gap.significanceScore >= 60 ? "secondary" : "outline"}>
                              Significance: {gap.significanceScore}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-3">{gap.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium mb-1 flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            Potential Contribution
                          </h4>
                          <p className="text-sm">{gap.potentialContribution}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-1 flex items-center gap-1">
                            <GraduationCap className="h-4 w-4" />
                            Research Fields
                          </h4>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {gap.relatedFields.map((field, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {field}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-2 bg-blue-50 rounded border border-blue-100">
                          <div className="text-2xl font-bold text-blue-700">{gap.noveltyScore}</div>
                          <div className="text-xs text-blue-600">Novelty Score</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded border border-green-100">
                          <div className="text-2xl font-bold text-green-700">{gap.feasibilityScore}</div>
                          <div className="text-xs text-green-600">Feasibility Score</div>
                        </div>
                        <div className="text-center p-2 bg-purple-50 rounded border border-purple-100">
                          <div className="text-2xl font-bold text-purple-700">{gap.significanceScore}</div>
                          <div className="text-xs text-purple-600">Significance Score</div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); exportGapStatement(gap); }}>
                          <FileText className="w-4 h-4 mr-2" />
                          Export Gap
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="mt-4">
              {selectedGap ? (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Gap Analysis: {selectedGap.title}
                      </CardTitle>
                      <CardDescription>
                        Detailed analysis of the identified research gap
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Gap Description</h4>
                          <p className="text-muted-foreground">{selectedGap.description}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Gap Type</h4>
                            <Badge variant="outline" className="capitalize">
                              {selectedGap.gapType}
                            </Badge>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Timeline Estimate</h4>
                            <p className="text-muted-foreground">{selectedGap.timelineEstimate}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Required Resources</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedGap.requiredResources.map((resource, idx) => (
                              <Badge key={idx} variant="secondary">
                                {resource}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Supporting Literature</h4>
                          <div className="space-y-3">
                            {selectedGap.supportingLiterature.map((lit) => (
                              <div key={lit.id} className="p-3 border rounded-lg bg-muted">
                                <div className="flex justify-between">
                                  <h5 className="font-medium">{lit.title}</h5>
                                  <Badge variant="outline" className="text-xs">
                                    {lit.type} ({lit.year})
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{lit.authors}</p>
                                <p className="text-sm mt-1"><span className="font-medium">Findings:</span> {lit.findings}</p>
                                <div className="mt-2">
                                  <div className="flex justify-between text-xs">
                                    <span>Relevance: {lit.relevanceScore}/100</span>
                                    <span>Contribution: {lit.contribution}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Potential Challenges & Solutions</h4>
                          <div className="space-y-2">
                            {selectedGap.potentialChallenges.map((challenge, idx) => (
                              <div key={idx} className="flex items-start">
                                <AlertTriangle className="w-4 h-4 mt-1 text-yellow-600 mr-2" />
                                <div>
                                  <p className="text-sm font-medium">Challenge: {challenge}</p>
                                  <p className="text-sm text-muted-foreground">Solution: {selectedGap.solutionApproach}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recommendations</CardTitle>
                      <CardDescription>
                        Priority recommendations for addressing this research gap
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {analysisResult.recommendations
                        .filter(rec => rec.gapId === selectedGap.id)
                        .map((rec, idx) => (
                          <div key={idx} className="p-4 border rounded-lg mb-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">Priority: 
                                <Badge className={`ml-2 ${rec.priority === 'high' ? 'bg-red-500' : rec.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}>
                                  {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)}
                                </Badge>
                              </h4>
                              <span className="text-sm">Effort: {rec.estimatedEffort}</span>
                            </div>
                            
                            <p className="text-sm mb-2"><span className="font-medium">Rationale:</span> {rec.rationale}</p>
                            
                            <div className="mt-3">
                              <h5 className="font-medium mb-1">Next Steps:</h5>
                              <ul className="list-disc list-inside space-y-1">
                                {rec.nextSteps.map((step, stepIdx) => (
                                  <li key={stepIdx} className="text-sm">{step}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12 text-muted-foreground">
                    <Target className="mx-auto h-12 w-12 mb-4" />
                    <p>Select a research gap to see detailed analysis and recommendations</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="opportunities" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Related Conferences
                    </CardTitle>
                    <CardDescription>
                      Conferences where this research gap could be presented
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysisResult.relatedConferences.map((conf) => (
                        <div key={conf.id} className="p-4 border rounded-lg">
                          <h4 className="font-medium">{conf.name}</h4>
                          <p className="text-sm text-muted-foreground">{conf.topic}</p>
                          <div className="flex justify-between text-xs mt-2">
                            <span>{conf.location}</span>
                            <span>Deadline: {conf.deadline.toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between text-xs mt-1">
                            <span>Acceptance: {conf.acceptanceRate}%</span>
                            <span>Relevance: {conf.relevanceToGap}%</span>
                          </div>
                          <a href={conf.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-2 block">
                            Visit Conference Website
                          </a>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PiggyBank className="w-5 h-5" />
                      Funding Opportunities
                    </CardTitle>
                    <CardDescription>
                      Potential funding sources for gap research
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analysisResult.fundingOpportunities.map((fund) => (
                        <div key={fund.id} className="p-4 border rounded-lg">
                          <h4 className="font-medium">{fund.title}</h4>
                          <p className="text-sm text-muted-foreground">{fund.organization}</p>
                          <div className="flex justify-between text-xs mt-2">
                            <span>Amount: {fund.amount}</span>
                            <span>Deadline: {fund.deadline.toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs mt-2">{fund.description}</p>
                          <a href={fund.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-2 block">
                            Visit Funding Website
                          </a>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="export" className="mt-4">
              {selectedGap ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Gap Statement Export</CardTitle>
                    <CardDescription>
                      Export the research gap statement for your thesis proposal
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <h4 className="font-medium mb-2">Generated Gap Statement:</h4>
                        <div className="whitespace-pre-line space-y-2">
                          <p><span className="font-medium">Gap Title:</span> {selectedGap.title}</p>
                          <p><span className="font-medium">Description:</span> {selectedGap.description}</p>
                          <p><span className="font-medium">Gap Type:</span> {selectedGap.gapType}</p>
                          <p><span className="font-medium">Novelty Score:</span> {selectedGap.noveltyScore}/100</p>
                          <p><span className="font-medium">Potential Contribution:</span> {selectedGap.potentialContribution}</p>
                          <p><span className="font-medium">Significance:</span> {selectedGap.significanceScore}/100</p>
                          <p><span className="font-medium">Research Methodology:</span> {selectedGap.researchMethodology}</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => exportGapStatement(selectedGap)}
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
                    <p>Select a research gap to generate and export the gap statement</p>
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