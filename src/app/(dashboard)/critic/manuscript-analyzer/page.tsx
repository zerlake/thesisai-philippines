'use client';

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { redirect } from "next/navigation";
import { BrandedLoader } from "@/components/branded-loader";
import { UnifiedNovelEditor } from "@/components/unified-novel-editor";
import { toast } from "sonner";
import {
  FileSearch,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  BookOpen,
  Lightbulb,
  BarChart,
  Loader2,
  Edit3
} from "lucide-react";

const sampleManuscripts = [
  {
    title: "Complete Thesis Draft",
    content: `ABSTRACT

This study investigates the impact of social media usage on academic performance among undergraduate students in Metro Manila. Using a mixed-methods approach combining quantitative surveys (n=450) and qualitative interviews (n=25), the research examines the relationship between daily social media consumption and grade point averages.

CHAPTER 1: INTRODUCTION

1.1 Background of the Study

The rapid proliferation of social media platforms has fundamentally transformed how students communicate, access information, and manage their time. Facebook, Instagram, Twitter, and TikTok have become integral parts of student life, with most undergraduates spending an average of 3-5 hours daily on these platforms (Statista, 2023).

1.2 Statement of the Problem

Despite the potential benefits of social media for academic collaboration and information sharing, concerns have been raised about its impact on student focus, study habits, and overall academic performance. This study seeks to address the following research questions:
1. What is the relationship between social media usage patterns and academic performance?
2. How do students perceive the impact of social media on their studies?
3. What strategies do high-performing students employ to manage social media use?

1.3 Objectives of the Study

The primary objective of this research is to examine the correlation between social media usage and academic performance among undergraduate students.

CHAPTER 2: REVIEW OF RELATED LITERATURE

2.1 Theoretical Framework

This study is grounded in the Uses and Gratifications Theory (Katz et al., 1974), which posits that individuals actively seek out media to satisfy specific needs. Additionally, the study draws from Self-Regulation Theory (Zimmerman, 2000) to understand how students manage their time and attention.

2.2 Related Studies

Several studies have examined the relationship between social media and academic performance with varying results. Wang et al. (2022) found a negative correlation between excessive social media use and GPA, while Chen (2021) identified potential benefits for collaborative learning.

CHAPTER 3: METHODOLOGY

3.1 Research Design

This study employs a concurrent mixed-methods design, collecting both quantitative and qualitative data simultaneously to provide a comprehensive understanding of the research problem.

3.2 Participants and Sampling

The study involved 450 undergraduate students from three universities in Metro Manila, selected through stratified random sampling to ensure representation across different academic programs and year levels.

3.3 Data Collection Instruments

Quantitative data was collected using a structured survey questionnaire measuring social media usage patterns and self-reported academic performance. Qualitative data was gathered through semi-structured interviews.

CHAPTER 4: RESULTS AND DISCUSSION

4.1 Quantitative Findings

Statistical analysis revealed a moderate negative correlation (r = -0.42, p < 0.001) between daily social media usage hours and GPA. Students spending more than 4 hours daily on social media had significantly lower GPAs compared to those with limited usage.

4.2 Qualitative Findings

Interview data revealed three main themes: (1) difficulty in maintaining focus, (2) procrastination behaviors, and (3) awareness of negative impacts coupled with inability to change habits.

CHAPTER 5: CONCLUSIONS AND RECOMMENDATIONS

5.1 Summary of Findings

The study confirms a significant negative relationship between excessive social media use and academic performance, while also identifying moderating factors such as self-regulation skills and purpose of use.

5.2 Recommendations

Based on the findings, the study recommends implementing digital literacy programs and time management workshops in universities to help students develop healthier social media habits.

REFERENCES

Chen, W. (2021). Social media and collaborative learning in higher education. Educational Technology Research, 15(3), 234-251.
Katz, E., Blumler, J. G., & Gurevitch, M. (1974). Uses and gratifications research. Public Opinion Quarterly, 37(4), 509-523.
Wang, X., Lee, Y., & Park, S. (2022). Social media addiction and academic performance: A meta-analysis. Computers & Education, 178, 104-118.
Zimmerman, B. J. (2000). Self-efficacy: An essential motive to learn. Contemporary Educational Psychology, 25(1), 82-91.`
  },
  {
    title: "Research Proposal",
    content: `RESEARCH PROPOSAL

Title: Investigating the Effectiveness of AI-Powered Tutoring Systems on Student Learning Outcomes in Mathematics

1. INTRODUCTION AND BACKGROUND

Artificial intelligence has emerged as a transformative force in education, with AI-powered tutoring systems gaining increasing adoption in schools worldwide. These systems promise personalized learning experiences tailored to individual student needs, potentially addressing the long-standing challenge of providing one-on-one instruction at scale.

2. PROBLEM STATEMENT

Despite the growing implementation of AI tutoring systems, empirical evidence regarding their effectiveness compared to traditional tutoring methods remains limited. This study seeks to address this gap by conducting a controlled experiment comparing learning outcomes between students using AI tutoring systems and those receiving traditional human tutoring.

3. RESEARCH OBJECTIVES

Primary Objective: To evaluate the comparative effectiveness of AI-powered tutoring systems versus human tutoring on mathematics learning outcomes.

Secondary Objectives:
- To assess student engagement levels with AI tutoring systems
- To identify factors that influence the effectiveness of AI tutoring
- To gather student perceptions and preferences regarding tutoring methods

4. METHODOLOGY

4.1 Research Design
This study will employ a quasi-experimental pretest-posttest control group design.

4.2 Participants
The study will involve 200 Grade 10 students from four public high schools, randomly assigned to experimental (AI tutoring) and control (human tutoring) groups.

4.3 Instruments
- Mathematics Achievement Test (pre and post)
- Student Engagement Questionnaire
- Semi-structured Interview Protocol

5. SIGNIFICANCE OF THE STUDY

This research will provide valuable insights for educators and policymakers regarding the potential of AI tutoring systems as a scalable solution for improving mathematics education.

6. TIMELINE

Phase 1 (Months 1-2): Literature review and instrument development
Phase 2 (Months 3-4): Data collection
Phase 3 (Months 5-6): Data analysis and report writing

7. REFERENCES

Baker, R. S. (2016). Stupid tutoring systems, intelligent humans. International Journal of AI in Education, 26(2), 600-614.
VanLehn, K. (2011). The relative effectiveness of human tutoring, intelligent tutoring systems, and other tutoring systems. Educational Psychologist, 46(4), 197-221.`
  },
  {
    title: "Literature Review Section",
    content: `CHAPTER 2: REVIEW OF RELATED LITERATURE

2.1 Introduction

This chapter presents a comprehensive review of existing literature related to online learning effectiveness, student engagement, and educational technology adoption. The review synthesizes findings from empirical studies, theoretical frameworks, and meta-analyses to establish the foundation for the current research.

2.2 Theoretical Framework

2.2.1 Community of Inquiry Framework

The Community of Inquiry (CoI) framework, developed by Garrison, Anderson, and Archer (2000), serves as the primary theoretical lens for this study. The framework identifies three essential elements for effective online learning: social presence, cognitive presence, and teaching presence. Social presence refers to the ability of participants to project themselves as "real people" in a mediated environment.

2.2.2 Self-Determination Theory

Self-Determination Theory (SDT), proposed by Deci and Ryan (1985), provides additional theoretical grounding by explaining the motivational factors that influence student engagement. According to SDT, intrinsic motivation is fostered when three basic psychological needs are met: autonomy, competence, and relatedness.

2.3 Review of Related Studies

2.3.1 Online Learning Effectiveness

The effectiveness of online learning has been extensively studied, with varying results. Bernard et al. (2014) conducted a meta-analysis of 74 studies comparing online and face-to-face instruction, finding no significant difference in achievement outcomes when controlling for methodological quality. However, Means et al. (2013) reported that students in online learning conditions performed modestly better than those receiving face-to-face instruction.

2.3.2 Student Engagement in Digital Environments

Research on student engagement in online environments has identified several critical factors. Dixson (2015) found that student-instructor interaction was the strongest predictor of engagement in online courses. Similarly, Martin and Bolliger (2018) identified three categories of engagement strategies: learner-content, learner-instructor, and learner-learner interactions.

2.3.3 Technology Acceptance in Education

The Technology Acceptance Model (TAM), originally developed by Davis (1989), has been widely applied to understand factors influencing educational technology adoption. Studies consistently show that perceived usefulness and ease of use are primary determinants of technology acceptance among both students and instructors.

2.4 Synthesis and Research Gap

While substantial literature exists on online learning effectiveness, few studies have examined the specific factors that contribute to successful learning outcomes in synchronous online environments. Furthermore, most existing research was conducted in Western contexts, limiting generalizability to developing country settings.

2.5 Chapter Summary

This literature review has established the theoretical and empirical foundations for the current study. The Community of Inquiry framework and Self-Determination Theory provide complementary perspectives for understanding online learning effectiveness. The review has also identified a significant gap in research regarding synchronous online learning in developing country contexts.

REFERENCES

Bernard, R. M., et al. (2014). A meta-analysis of blended learning and technology use in higher education. Internet and Higher Education, 17, 90-101.
Davis, F. D. (1989). Perceived usefulness, perceived ease of use, and user acceptance. MIS Quarterly, 13(3), 319-340.
Deci, E. L., & Ryan, R. M. (1985). Intrinsic motivation and self-determination in human behavior. Plenum Press.
Dixson, M. D. (2015). Measuring student engagement in the online course. Online Learning Journal, 19(4), 143-158.
Garrison, D. R., Anderson, T., & Archer, W. (2000). Critical inquiry in a text-based environment. The Internet and Higher Education, 2(2-3), 87-105.
Martin, F., & Bolliger, D. U. (2018). Engagement matters: Student perceptions on the importance of engagement strategies. Online Learning, 22(1), 205-222.
Means, B., et al. (2013). The effectiveness of online and blended learning: A meta-analysis. Teachers College Record, 115(3), 1-47.`
  }
];

type AnalysisResult = {
  overall_score: number;
  sections: {
    name: string;
    score: number;
    status: 'good' | 'warning' | 'error';
    feedback: string;
  }[];
  suggestions: string[];
  strengths: string[];
  areas_for_improvement: string[];
};

export default function ManuscriptAnalyzerPage() {
  const authContext = useAuth();
  const [manuscriptText, setManuscriptText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [inputMode, setInputMode] = useState<'paste' | 'editor'>('paste');
  const [editorContent, setEditorContent] = useState<any>(null);
  const [showSampleMenu, setShowSampleMenu] = useState(false);

  const loadSampleManuscript = (sample: typeof sampleManuscripts[0]) => {
    setManuscriptText(sample.content);
    setAnalysisResult(null);
    setShowSampleMenu(false);
    toast.success(`Loaded: ${sample.title}`);
  };

  if (!authContext) {
    return <BrandedLoader />;
  }

  const { session, profile, isLoading } = authContext;

  if (!isLoading && (!session || profile?.role !== 'critic')) {
    redirect('/login');
  }

  if (isLoading) {
    return <BrandedLoader />;
  }

  const handleEditorChange = (content: any, html: string, plainText: string) => {
    setEditorContent(content);
    setManuscriptText(plainText);
  };

  const handleAnalyze = async () => {
    if (!manuscriptText.trim()) return;

    setIsAnalyzing(true);

    // Simulate analysis
    await new Promise(resolve => setTimeout(resolve, 2000));

    setAnalysisResult({
      overall_score: 78,
      sections: [
        { name: 'Abstract', score: 85, status: 'good', feedback: 'Well-structured abstract with clear objectives and methodology.' },
        { name: 'Introduction', score: 72, status: 'warning', feedback: 'Introduction could benefit from a stronger hook and clearer problem statement.' },
        { name: 'Literature Review', score: 80, status: 'good', feedback: 'Comprehensive coverage of relevant literature with proper citations.' },
        { name: 'Methodology', score: 65, status: 'warning', feedback: 'Methodology section needs more detail on data collection procedures.' },
        { name: 'Results', score: 88, status: 'good', feedback: 'Results are well-presented with appropriate statistical analysis.' },
        { name: 'Discussion', score: 70, status: 'warning', feedback: 'Discussion should connect findings more explicitly to the research questions.' },
        { name: 'Conclusion', score: 82, status: 'good', feedback: 'Clear conclusions with practical implications.' },
        { name: 'References', score: 75, status: 'warning', feedback: 'Some references need to be formatted consistently.' },
      ],
      suggestions: [
        'Add more recent references (within the last 5 years)',
        'Include a limitations section in the methodology',
        'Strengthen the connection between findings and literature review',
        'Consider adding visual representations of key data',
      ],
      strengths: [
        'Strong theoretical framework',
        'Appropriate sample size and selection',
        'Clear research objectives',
        'Well-organized structure',
      ],
      areas_for_improvement: [
        'Methodology clarity',
        'Citation consistency',
        'Discussion depth',
        'Statistical interpretation',
      ],
    });

    setIsAnalyzing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileSearch className="h-8 w-8" />
            Manuscript Analyzer
          </h1>
          <p className="text-muted-foreground">
            Analyze manuscripts for structure, content quality, and academic standards
          </p>
        </div>
        <DropdownMenu open={showSampleMenu} onOpenChange={setShowSampleMenu}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              Load Sample
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            {sampleManuscripts.map((sample, index) => (
              <DropdownMenuItem
                key={index}
                onClick={() => loadSampleManuscript(sample)}
                className="cursor-pointer"
              >
                <FileText className="h-4 w-4 mr-2" />
                {sample.title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <Card className="lg:row-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Upload or Paste Manuscript</CardTitle>
                <CardDescription>
                  Paste the manuscript content or use the full editor for review
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={inputMode === 'paste' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setInputMode('paste')}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Paste
                </Button>
                <Button
                  variant={inputMode === 'editor' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setInputMode('editor')}
                >
                  <Edit3 className="mr-2 h-4 w-4" />
                  Editor
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {inputMode === 'paste' ? (
              <>
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Drag and drop a file here, or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Supports PDF, DOCX, TXT files
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or paste text</span>
                  </div>
                </div>

                <Textarea
                  placeholder="Paste manuscript content here..."
                  value={manuscriptText}
                  onChange={(e) => setManuscriptText(e.target.value)}
                  className="min-h-[300px] resize-none"
                />
              </>
            ) : (
              <div className="border rounded-lg">
                <UnifiedNovelEditor
                  documentId="critic-analyzer-temp"
                  initialContent={editorContent}
                  onContentChange={handleEditorChange}
                  isReadOnly={false}
                  showAITools={true}
                  showFormattingToolbar={true}
                  minHeight="400px"
                  mode="critic"
                  autoSaveInterval={0}
                  placeholder="Paste or write the manuscript content here for analysis..."
                />
              </div>
            )}

            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !manuscriptText.trim()}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <FileSearch className="mr-2 h-4 w-4" />
                  Analyze Manuscript
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        {analysisResult ? (
          <>
            {/* Overall Score */}
            <Card>
              <CardHeader>
                <CardTitle>Overall Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-4">
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-muted"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${analysisResult.overall_score * 3.52} 352`}
                        className={getScoreColor(analysisResult.overall_score)}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-3xl font-bold ${getScoreColor(analysisResult.overall_score)}`}>
                        {analysisResult.overall_score}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Badge variant={analysisResult.overall_score >= 70 ? 'default' : 'destructive'}>
                      {analysisResult.overall_score >= 80 ? 'Ready for Certification' :
                       analysisResult.overall_score >= 70 ? 'Minor Revisions Needed' :
                       'Major Revisions Required'}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Based on 8 evaluation criteria
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Analysis */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Detailed Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="sections">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="sections">
                      <FileText className="mr-2 h-4 w-4" />
                      Sections
                    </TabsTrigger>
                    <TabsTrigger value="strengths">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Strengths
                    </TabsTrigger>
                    <TabsTrigger value="improvements">
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Improvements
                    </TabsTrigger>
                    <TabsTrigger value="suggestions">
                      <Lightbulb className="mr-2 h-4 w-4" />
                      Suggestions
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="sections" className="space-y-4 mt-4">
                    {analysisResult.sections.map((section) => (
                      <div key={section.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(section.status)}
                            <span className="font-medium">{section.name}</span>
                          </div>
                          <span className={`font-bold ${getScoreColor(section.score)}`}>
                            {section.score}%
                          </span>
                        </div>
                        <Progress value={section.score} className="h-2" />
                        <p className="text-sm text-muted-foreground">{section.feedback}</p>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="strengths" className="mt-4">
                    <ul className="space-y-3">
                      {analysisResult.strengths.map((strength, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </TabsContent>

                  <TabsContent value="improvements" className="mt-4">
                    <ul className="space-y-3">
                      {analysisResult.areas_for_improvement.map((area, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                          <span>{area}</span>
                        </li>
                      ))}
                    </ul>
                  </TabsContent>

                  <TabsContent value="suggestions" className="mt-4">
                    <ul className="space-y-3">
                      {analysisResult.suggestions.map((suggestion, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Lightbulb className="h-5 w-5 text-blue-500 mt-0.5" />
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="lg:col-span-2">
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Export Report
                  </Button>
                  <Button variant="outline">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Use Feedback Template
                  </Button>
                  <Button>
                    Continue to Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="flex items-center justify-center min-h-[400px]">
            <CardContent className="text-center">
              <BarChart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Analysis Yet</h3>
              <p className="text-muted-foreground">
                Upload or paste a manuscript to begin analysis
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
