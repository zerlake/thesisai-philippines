'use client';

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { redirect } from "next/navigation";
import { toast } from "sonner";
import {
  LayoutTemplate,
  FileText,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Upload,
  FileCheck,
  Type,
  AlignLeft,
  List,
} from "lucide-react";

type FormatIssue = {
  id: string;
  category: 'margins' | 'font' | 'spacing' | 'headings' | 'pagination' | 'citations' | 'structure';
  location: string;
  expected: string;
  found: string;
  severity: 'error' | 'warning';
};

type FormatResult = {
  score: number;
  template: string;
  issues: FormatIssue[];
  sections: {
    name: string;
    status: 'pass' | 'warning' | 'fail';
    details: string;
  }[];
};

const formatTemplates = [
  { value: 'apa7', label: 'APA 7th Edition' },
  { value: 'mla9', label: 'MLA 9th Edition' },
  { value: 'chicago', label: 'Chicago Manual of Style' },
  { value: 'ieee', label: 'IEEE Format' },
  { value: 'harvard', label: 'Harvard Style' },
  { value: 'university', label: 'University Custom Format' },
];

export default function FormatCheckerPage() {
  const authContext = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState('apa7');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<FormatResult | null>(null);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  if (!authContext) {
    // If auth context is not available, redirect to login
    redirect('/login');
  }
  const { session, profile, isLoading } = authContext;

  // Redirect if not authenticated or not authorized
  if (!isLoading && (!session || profile?.role !== 'critic')) {
    redirect('/login');
  }

  // Render the page immediately with role-based access control handled inside
  // The content will show loading states internally if needed
  const handleFileUpload = () => {
    setUploadedFile("sample_thesis.docx");
    toast.success("File uploaded: sample_thesis.docx");
  };

  const handleCheck = async () => {
    if (!uploadedFile) {
      toast.error("Please upload a document first");
      return;
    }

    setIsChecking(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    setResult({
      score: 78,
      template: formatTemplates.find(t => t.value === selectedTemplate)?.label || '',
      issues: [
        { id: '1', category: 'margins', location: 'Page 3-7', expected: '1 inch all sides', found: '0.75 inch left margin', severity: 'error' },
        { id: '2', category: 'font', location: 'Chapter 2 Headings', expected: 'Times New Roman 12pt Bold', found: 'Arial 14pt Bold', severity: 'error' },
        { id: '3', category: 'spacing', location: 'Body text', expected: 'Double spacing (2.0)', found: '1.5 line spacing', severity: 'warning' },
        { id: '4', category: 'headings', location: 'Section 3.2', expected: 'Level 2: Flush left, Bold', found: 'Centered, Bold Italic', severity: 'warning' },
        { id: '5', category: 'pagination', location: 'Preliminary pages', expected: 'Roman numerals (i, ii, iii)', found: 'Arabic numerals (1, 2, 3)', severity: 'error' },
        { id: '6', category: 'citations', location: 'References', expected: 'Hanging indent 0.5"', found: 'No hanging indent', severity: 'warning' },
      ],
      sections: [
        { name: 'Title Page', status: 'pass', details: 'Correctly formatted with all required elements' },
        { name: 'Abstract', status: 'pass', details: 'Within word limit, properly structured' },
        { name: 'Table of Contents', status: 'warning', details: 'Minor spacing inconsistencies' },
        { name: 'Chapter Headings', status: 'fail', details: 'Font and alignment issues detected' },
        { name: 'Body Text', status: 'warning', details: 'Line spacing needs adjustment' },
        { name: 'References', status: 'fail', details: 'Hanging indent and formatting issues' },
        { name: 'Appendices', status: 'pass', details: 'Correctly labeled and formatted' },
      ]
    });

    setIsChecking(false);
    toast.success("Format check complete");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'font': return <Type className="h-4 w-4" />;
      case 'spacing': return <AlignLeft className="h-4 w-4" />;
      case 'headings': return <List className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <LayoutTemplate className="h-8 w-8" />
            Format Compliance Checker
          </h1>
          <p className="text-muted-foreground">
            Verify document formatting against academic style guides
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Upload Document</CardTitle>
            <CardDescription>Select format template and upload file</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Format Template</label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {formatTemplates.map(template => (
                    <SelectItem key={template.value} value={template.value}>
                      {template.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div
              className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onClick={handleFileUpload}
            >
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                PDF, DOCX, DOC (Max 50MB)
              </p>
            </div>

            {uploadedFile && (
              <div className="flex items-center gap-2 p-2 bg-muted rounded">
                <FileCheck className="h-4 w-4 text-green-500" />
                <span className="text-sm">{uploadedFile}</span>
              </div>
            )}

            <Button onClick={handleCheck} disabled={isChecking || !uploadedFile} className="w-full">
              {isChecking ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Checking...</> : <><FileCheck className="mr-2 h-4 w-4" />Check Format</>}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Compliance Report</CardTitle>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="flex flex-col items-center justify-center min-h-[400px]">
                <LayoutTemplate className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Upload a document to check format compliance</p>
              </div>
            ) : (
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="issues">Issues ({result.issues.length})</TabsTrigger>
                  <TabsTrigger value="sections">Sections</TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                  <div className="space-y-4">
                    <div className="text-center p-6 rounded-lg border">
                      <div className={`text-5xl font-bold ${result.score >= 80 ? 'text-green-500' : result.score >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                        {result.score}%
                      </div>
                      <p className="text-muted-foreground mt-2">Format Compliance Score</p>
                      <Progress value={result.score} className="mt-4" />
                      <p className="text-sm mt-2">Template: <strong>{result.template}</strong></p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-red-500/10 rounded">
                        <div className="text-2xl font-bold text-red-500">{result.issues.filter(i => i.severity === 'error').length}</div>
                        <div className="text-xs text-muted-foreground">Errors</div>
                      </div>
                      <div className="p-3 bg-yellow-500/10 rounded">
                        <div className="text-2xl font-bold text-yellow-500">{result.issues.filter(i => i.severity === 'warning').length}</div>
                        <div className="text-xs text-muted-foreground">Warnings</div>
                      </div>
                      <div className="p-3 bg-green-500/10 rounded">
                        <div className="text-2xl font-bold text-green-500">{result.sections.filter(s => s.status === 'pass').length}</div>
                        <div className="text-xs text-muted-foreground">Passed</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="issues">
                  <ScrollArea className="h-[350px]">
                    <div className="space-y-3">
                      {result.issues.map((issue) => (
                        <div key={issue.id} className="p-3 rounded-lg border">
                          <div className="flex items-center gap-2 mb-2">
                            {getCategoryIcon(issue.category)}
                            <Badge variant={issue.severity === 'error' ? 'destructive' : 'secondary'}>
                              {issue.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground ml-auto">{issue.location}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="p-2 bg-green-500/10 rounded">
                              <div className="text-xs text-muted-foreground">Expected</div>
                              <div>{issue.expected}</div>
                            </div>
                            <div className="p-2 bg-red-500/10 rounded">
                              <div className="text-xs text-muted-foreground">Found</div>
                              <div>{issue.found}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="sections">
                  <ScrollArea className="h-[350px]">
                    <div className="space-y-2">
                      {result.sections.map((section, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                          {getStatusIcon(section.status)}
                          <div className="flex-1">
                            <div className="font-medium">{section.name}</div>
                            <div className="text-xs text-muted-foreground">{section.details}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
