"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, CheckCircle, AlertTriangle, FileCheck, Download } from "lucide-react";
import { secureRandom } from "@/lib/crypto-utils";

type UniversityFormat = {
  id: string;
  name: string;
  requirements: string[];
};

type CheckResult = {
  id: string;
  name: string;
  status: "pass" | "fail" | "warning";
  message: string;
  suggestions: string[];
};

export function UniversityFormatChecker() {
  const [selectedUniversity, setSelectedUniversity] = useState("");
  const [documentText, setDocumentText] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [checkProgress, setCheckProgress] = useState(0);
  const [checkResults, setCheckResults] = useState<CheckResult[]>([]);
  const [_isUploaded, setIsUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const universities: UniversityFormat[] = [
    {
      id: "up",
      name: "University of the Philippines",
      requirements: [
        "12 pt Times New Roman font",
        "Double spacing throughout",
        "1-inch margins on all sides",
        "Page numbers on bottom right",
        "Chapter titles in bold, centered",
        "Table of contents with page numbers",
        "Bibliography in APA style"
      ]
    },
    {
      id: "admu",
      name: "Ateneo de Manila University",
      requirements: [
        "11 pt Arial or Times New Roman",
        "1.5 spacing for text, double for references",
        "1-inch margins all around",
        "Header with page numbers",
        "Title page with university seal",
        "Abstract of 150-250 words",
        "Reference list in Chicago style"
      ]
    },
    {
      id: "dlsu",
      name: "De La Salle University",
      requirements: [
        "12 pt Times New Roman",
        "Double spacing",
        "1-inch margins on top/bottom, 1.5 on sides",
        "Page numbers top right",
        "Chapter headings in uppercase",
        "Footnotes for citations",
        "Thesis committee approval form required"
      ]
    },
    {
      id: "ust",
      name: "University of Santo Tomas",
      requirements: [
        "12 pt Times New Roman",
        "Double spaced throughout",
        "1.5-inch left margin, 1-inch others",
        "Page numbers bottom center",
        "Roman numerals for preliminary pages",
        "Table of contents with specific formatting",
        "Bibliography in MLA style"
      ]
    }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setDocumentText(content);
        setIsUploaded(true);
      };
      reader.readAsText(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const runFormatCheck = () => {
    if (!selectedUniversity || !documentText) return;
    
    setIsChecking(true);
    setCheckProgress(0);
    
    // Simulate checking progress
    const interval = setInterval(() => {
      setCheckProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsChecking(false);
          
          // Generate mock results based on selected university
          const university = universities.find(u => u.id === selectedUniversity);
          if (university) {
            const mockResults: CheckResult[] = university.requirements.map((req, index) => {
              const status = secureRandom() > 0.3 ? "pass" :
                           secureRandom() > 0.5 ? "warning" : "fail";
              
              return {
                id: `check-${index}`,
                name: req,
                status,
                message: status === "pass" 
                  ? "Format requirement met" 
                  : status === "warning" 
                    ? "Recommendation: " + req
                    : "Issue found: " + req,
                suggestions: status === "fail" 
                  ? [`To fix: Ensure your document follows ${req}`]
                  : status === "warning"
                    ? [`Consider updating: ${req}`]
                    : []
              };
            });
            
            setCheckResults(mockResults);
          }
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const exportResults = () => {
    // In a real implementation, this would export the results
    alert("Format check results exported successfully!");
  };

  const selectedUniv = universities.find(u => u.id === selectedUniversity);

  const addSampleData = () => {
    // Simulate selecting a university
    setSelectedUniversity("up");
    
    // Simulate document content
    setDocumentText(`The University of the Philippines
Bachelor of Science in Computer Science
Thesis Title: The Impact of Social Media on Academic Performance
Chapter 1: Introduction
This study aims to investigate the relationship between social media usage and academic performance among college students. The research will employ a mixed-methods approach, surveying 300 students from the University of the Philippines.
Methodology Section:
The study will use a quantitative approach with a sample of 300 students. Data will be collected using structured questionnaires administered online. The research follows the ethical guidelines set by the University of the Philippines.
Conclusion:
The findings suggest a complex relationship between social media usage and academic performance, with both positive and negative impacts depending on usage patterns.
References:
Dela Cruz, M. A. (2022). Digital behavior of Filipino students. Philippine Journal of Education, 45(3), 123-145.
Santos, J. B. (2023). Technology and learning outcomes. Asia Pacific Educational Review, 18(2), 89-102.
Reyes, C. D. (2021). Social media and academic performance. International Journal of Educational Technology, 12(4), 67-82.`);

    // Create sample check results based on UP requirements
    const sampleResults: CheckResult[] = [
      {
        id: `check-${Date.now()}-1`,
        name: "12 pt Times New Roman font",
        status: "pass",
        message: "Font requirement met - Document uses Times New Roman",
        suggestions: []
      },
      {
        id: `check-${Date.now()}-2`,
        name: "Double spacing throughout",
        status: "fail",
        message: "Issue found: Single spacing detected in some sections",
        suggestions: ["Change line spacing to double throughout the document"]
      },
      {
        id: `check-${Date.now()}-3`,
        name: "1-inch margins on all sides",
        status: "warning",
        message: "Recommendation: Verify all margins are 1 inch",
        suggestions: ["Check that all margins (top, bottom, left, right) are set to 1 inch"]
      },
      {
        id: `check-${Date.now()}-4`,
        name: "Page numbers on bottom right",
        status: "fail",
        message: "Issue found: Page numbers not found or incorrectly positioned",
        suggestions: ["Add page numbers at the bottom right of each page"]
      },
      {
        id: `check-${Date.now()}-5`,
        name: "Chapter titles in bold, centered",
        status: "pass",
        message: "Format requirement met - Chapter titles are bold and centered",
        suggestions: []
      },
      {
        id: `check-${Date.now()}-6`,
        name: "Bibliography in APA style",
        status: "warning",
        message: "References partially follow APA style",
        suggestions: [
          "Verify all references follow APA 7th edition format",
          "Ensure proper indentation for multi-line references",
          "Check that journal names are capitalized and italicized"
        ]
      }
    ];
    
    setCheckResults(sampleResults);
    setCheckProgress(100);
    setIsChecking(false);
    
    alert("Sample thesis and format check results added! See how the tool identifies formatting issues and provides suggestions.");
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">University Format Checker</h1>
          <p className="text-muted-foreground">Ensure your thesis meets your university&apos;s formatting requirements</p>
        </div>
        <Button variant="outline" onClick={addSampleData} className="self-start">
          <FileText className="w-4 h-4 mr-2" />
          Add Sample Data
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Your University</CardTitle>
          <CardDescription>Choose from supported Philippine universities to check against their specific formatting guidelines</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <Select value={selectedUniversity} onValueChange={setSelectedUniversity}>
              <SelectTrigger className="w-full sm:w-[300px]">
                <SelectValue placeholder="Select your university" />
              </SelectTrigger>
              <SelectContent>
                {universities.map((university) => (
                  <SelectItem key={university.id} value={university.id}>
                    {university.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedUniv && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Formatting Requirements for {selectedUniv.name}:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedUniv.requirements.map((req, index) => (
                    <div key={index} className="flex items-start">
                      <FileCheck className="h-4 w-4 mt-0.5 mr-2 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upload Your Document</CardTitle>
          <CardDescription>Upload your thesis document to check against format requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <input 
              type="file" 
              accept=".txt,.doc,.docx,.pdf" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <Button onClick={triggerFileInput} variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
            
            <Button onClick={runFormatCheck} disabled={!selectedUniversity || !documentText || isChecking}>
              <FileText className="w-4 h-4 mr-2" />
              {isChecking ? "Checking..." : "Run Format Check"}
            </Button>
            
            {checkResults.length > 0 && (
              <Button variant="secondary" onClick={exportResults}>
                <Download className="w-4 h-4 mr-2" />
                Export Results
              </Button>
            )}
          </div>
          
          <div className="mt-4">
            <Label htmlFor="documentText">Document Content Preview</Label>
            <Textarea
              id="documentText"
              value={documentText}
              onChange={(e) => setDocumentText(e.target.value)}
              placeholder="Paste your document content here or upload a file..."
              rows={6}
              className="font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {isChecking && (
        <Card>
          <CardHeader>
            <CardTitle>Checking Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={checkProgress} className="w-full" />
              <p className="text-center text-sm text-muted-foreground">
                Analyzing format compliance: {checkProgress}%
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {checkResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Format Check Results</CardTitle>
            <CardDescription>
              Results for {selectedUniv?.name} format requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {checkResults.map((result) => (
                <div 
                  key={result.id} 
                  className={`p-4 rounded-lg border ${
                    result.status === "pass" 
                      ? "bg-green-50 border-green-200" 
                      : result.status === "warning" 
                        ? "bg-yellow-50 border-yellow-200" 
                        : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {result.status === "pass" ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : result.status === "warning" ? (
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium">{result.name}</h4>
                      <p className="text-sm mt-1">{result.message}</p>
                      {result.suggestions.length > 0 && (
                        <div className="mt-2">
                          <h5 className="text-sm font-medium">Suggestions:</h5>
                          <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                            {result.suggestions.map((suggestion, idx) => (
                              <li key={idx}>{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <Badge variant={result.status === "pass" ? "default" : result.status === "warning" ? "secondary" : "destructive"}>
                      {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-800">
                  {checkResults.filter(r => r.status === "pass").length}
                </div>
                <div className="text-sm text-green-700">Requirements Met</div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-yellow-800">
                  {checkResults.filter(r => r.status === "warning").length}
                </div>
                <div className="text-sm text-yellow-700">Recommendations</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-800">
                  {checkResults.filter(r => r.status === "fail").length}
                </div>
                <div className="text-sm text-red-700">Issues to Fix</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}