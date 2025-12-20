'use client';

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { redirect } from "next/navigation";
import { BrandedLoader } from "@/components/branded-loader";
import { toast } from "sonner";
import {
  BookCopy,
  FileText,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Search,
  Copy,
} from "lucide-react";

type CitationIssue = {
  id: string;
  citation: string;
  type: 'missing' | 'incomplete' | 'format' | 'outdated' | 'unverified';
  severity: 'error' | 'warning' | 'info';
  description: string;
  suggestion: string;
};

type AuditResult = {
  totalCitations: number;
  validCitations: number;
  issues: CitationIssue[];
  score: number;
  byType: {
    missing: number;
    incomplete: number;
    format: number;
    outdated: number;
    unverified: number;
  };
};

const sampleTexts = [
  {
    title: "Text with Citation Issues",
    content: `According to research, social media has significant impacts on student performance. Smith (2019) found that excessive use leads to decreased attention spans. However, Johnson argues that moderate use can be beneficial for learning.

The methodology follows guidelines from the APA manual. Data was collected using surveys (n=200) and analyzed using SPSS. As noted by Williams, "quantitative methods provide reliable results."

Recent studies (Brown 2020; Davis, 2021; Miller et al) have shown improvements in online learning. The theoretical framework is based on Bandura's Social Learning Theory (1977) and Vygotsky's work on Zone of Proximal Development.

References:
Smith, J. (2019). Social Media and Education. Journal of Digital Learning.
Brown, A. (2020). Online Learning Effectiveness.
Davis, M. (2021). Educational Technology Review, 15(3), 45-67.`
  },
  {
    title: "Well-Cited Academic Text",
    content: `The relationship between emotional intelligence and academic performance has been extensively studied (Goleman, 1995; Bar-On, 2006; Mayer & Salovey, 1997). According to Goleman (1995, p. 34), "emotional intelligence is the ability to recognize and manage emotions in ourselves and others."

Recent meta-analyses have confirmed these findings (MacCann et al., 2020; Sanchez-Ruiz et al., 2022). The current study builds upon the theoretical framework established by Mayer and Salovey (1997), which defines emotional intelligence as comprising four branches: perceiving emotions, using emotions to facilitate thought, understanding emotions, and managing emotions.

References:
Bar-On, R. (2006). The Bar-On model of emotional-social intelligence. Psicothema, 18, 13-25.
Goleman, D. (1995). Emotional Intelligence. Bantam Books.
MacCann, C., et al. (2020). Emotional intelligence predicts academic performance: A meta-analysis. Psychological Bulletin, 146(2), 150-186.
Mayer, J. D., & Salovey, P. (1997). What is emotional intelligence? In P. Salovey & D. Sluyter (Eds.), Emotional development and emotional intelligence. Basic Books.
Sanchez-Ruiz, M. J., et al. (2022). Trait emotional intelligence and academic performance. Learning and Individual Differences, 96, 102149.`
  }
];

export default function CitationAuditorPage() {
  const authContext = useAuth();
  const [inputText, setInputText] = useState("");
  const [isAuditing, setIsAuditing] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [showSampleMenu, setShowSampleMenu] = useState(false);

  if (!authContext) return <BrandedLoader />;
  const { session, profile, isLoading } = authContext;
  if (!isLoading && (!session || profile?.role !== 'critic')) redirect('/login');
  if (isLoading) return <BrandedLoader />;

  const loadSample = (sample: typeof sampleTexts[0]) => {
    setInputText(sample.content);
    setResult(null);
    setShowSampleMenu(false);
    toast.success(`Loaded: ${sample.title}`);
  };

  const handleAudit = async () => {
    if (!inputText.trim()) {
      toast.error("Please enter text to audit");
      return;
    }

    setIsAuditing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulated audit results
    setResult({
      totalCitations: 12,
      validCitations: 8,
      score: 67,
      issues: [
        { id: '1', citation: 'Johnson argues that...', type: 'missing', severity: 'error', description: 'No year provided for Johnson citation', suggestion: 'Add publication year: Johnson (YYYY)' },
        { id: '2', citation: 'Williams, "quantitative methods..."', type: 'incomplete', severity: 'error', description: 'Direct quote without page number', suggestion: 'Add page number: (Williams, YYYY, p. XX)' },
        { id: '3', citation: 'Miller et al', type: 'format', severity: 'warning', description: 'Missing period after et al', suggestion: 'Use: Miller et al.' },
        { id: '4', citation: 'Bandura (1977)', type: 'outdated', severity: 'info', description: 'Citation is over 20 years old', suggestion: 'Consider adding more recent supporting sources' },
        { id: '5', citation: 'Brown, A. (2020)', type: 'incomplete', severity: 'warning', description: 'Reference missing journal/publisher info', suggestion: 'Add complete publication details' },
      ],
      byType: { missing: 2, incomplete: 2, format: 1, outdated: 1, unverified: 0 }
    });

    setIsAuditing(false);
    toast.success("Citation audit complete");
  };

  const getIssueIcon = (severity: string) => {
    switch (severity) {
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookCopy className="h-8 w-8" />
            Citation Auditor
          </h1>
          <p className="text-muted-foreground">
            Audit citations for completeness, accuracy, and format compliance
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
            {sampleTexts.map((sample, index) => (
              <DropdownMenuItem key={index} onClick={() => loadSample(sample)}>
                <FileText className="h-4 w-4 mr-2" />
                {sample.title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Text to Audit</CardTitle>
            <CardDescription>Paste manuscript text with citations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste text containing citations to audit..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
            />
            <Button onClick={handleAudit} disabled={isAuditing || !inputText.trim()} className="w-full">
              {isAuditing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Auditing...</> : <><Search className="mr-2 h-4 w-4" />Audit Citations</>}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audit Results</CardTitle>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="flex flex-col items-center justify-center min-h-[400px]">
                <BookCopy className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Enter text and click "Audit Citations"</p>
              </div>
            ) : (
              <Tabs defaultValue="issues" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="issues">Issues ({result.issues.length})</TabsTrigger>
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                </TabsList>

                <TabsContent value="issues">
                  <ScrollArea className="h-[350px]">
                    <div className="space-y-3">
                      {result.issues.map((issue) => (
                        <div key={issue.id} className="p-3 rounded-lg border">
                          <div className="flex items-start gap-2">
                            {getIssueIcon(issue.severity)}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline">{issue.type}</Badge>
                              </div>
                              <p className="text-sm font-medium">"{issue.citation}"</p>
                              <p className="text-xs text-muted-foreground mt-1">{issue.description}</p>
                              <p className="text-xs text-green-600 mt-1">💡 {issue.suggestion}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="summary">
                  <div className="space-y-4">
                    <div className="text-center p-4">
                      <div className={`text-5xl font-bold ${result.score >= 80 ? 'text-green-500' : result.score >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                        {result.score}%
                      </div>
                      <p className="text-muted-foreground">Citation Quality Score</p>
                      <Progress value={result.score} className="mt-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-center text-sm">
                      <div className="p-2 bg-muted rounded">
                        <div className="font-bold">{result.totalCitations}</div>
                        <div className="text-muted-foreground">Total Citations</div>
                      </div>
                      <div className="p-2 bg-muted rounded">
                        <div className="font-bold text-green-500">{result.validCitations}</div>
                        <div className="text-muted-foreground">Valid</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
