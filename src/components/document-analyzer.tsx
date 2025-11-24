'use client';

import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Upload, FileText, FileSearch, Hash, Eye, Download, Key, Target } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Progress } from "./ui/progress";
import { Alert, AlertDescription } from "./ui/alert";
import { createSanitizedHtml } from "@/lib/html-sanitizer";

// PDF.js initialization reserved for future file extraction enhancement
// let pdfjsLib: any = null;
// let pdfjsWorker: any = null;

export function DocumentAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [extractedText, setExtractedText] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [sections, setSections] = useState<{title: string, content: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedText, setSelectedText] = useState("");
  const [annotations, setAnnotations] = useState<{text: string, note: string, id: string}[]>([]);
  const [newAnnotation, setNewAnnotation] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<{pageIndex: number, text: string, index: number}[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const addSampleData = () => {
    // Simulate a sample document analysis
    const sampleText = `The Impact of Social Media on Academic Performance of Senior High School Students
    
ABSTRACT

This study examines the relationship between social media usage and academic performance among senior high school students in the Philippines. Using a mixed-methods approach, researchers surveyed 320 students from 5 schools in Region III and conducted in-depth interviews with 25 participants. Results indicate a moderate negative correlation (r=-0.38) between excessive social media use (>4 hours/day) and Grade Point Average, with some variations based on content type consumed. The study also revealed positive aspects of social media use for collaborative learning.

INTRODUCTION

The proliferation of digital technology has fundamentally changed how students access information, communicate, and learn. In the Philippine educational context, the K-12 curriculum introduced in 2016 has emphasized the integration of technology in learning processes. Social media platforms have become integral to student life, with 78% of senior high school students reporting daily use for educational purposes (PSA, 2023). However, concerns about distraction and reduced academic focus have also emerged.

METHODOLOGY

This study employed a mixed-methods approach combining quantitative surveys and qualitative interviews. The sample consisted of 320 students from five public senior high schools in Region III, selected through stratified random sampling. The survey instrument was adapted from the Digital Behavior Assessment Tool (DBAT) and validated by three educational technology experts (Cronbach's α = 0.87). Additionally, 25 participants were selected for in-depth interviews based on their social media usage patterns.

RESULTS

The analysis revealed that students who used social media for educational purposes for less than 2 hours per day showed improved collaborative learning outcomes, while those using it for entertainment purposes for more than 4 hours per day showed decreased academic performance. The correlation between excessive usage and lower grades was consistent across socioeconomic backgrounds, with some mitigating factors related to digital literacy skills.

CONCLUSION

While social media can be a valuable educational tool, its impact depends heavily on usage patterns and digital literacy skills. Schools should focus on developing comprehensive digital citizenship curricula that teaches students how to effectively balance social media use with academic responsibilities. The findings suggest that moderate, purposeful use of social media can enhance learning, while excessive usage correlates with decreased academic performance.
    
REFERENCES

Dela Cruz, M. A. (2023). Digital behavior of Filipino students. Philippine Journal of Educational Technology, 45(3), 123-145.

Santos, J. B. (2022). Technology integration in Philippine education. Asia Pacific Educational Review, 18(2), 89-102.

Reyes, C. D. (2021). Social media and learning outcomes. International Journal of Educational Research, 12(4), 67-82.`;
    
    setExtractedText(sampleText);
    setSummary("This study examines the relationship between social media usage and academic performance among senior high school students in the Philippines. Using a mixed-methods approach, researchers surveyed 320 students from 5 schools in Region III. Results indicate a moderate negative correlation between excessive social media use (>4 hours/day) and Grade Point Average, with some positive aspects for collaborative learning.");
    
    setKeywords(["social media", "academic performance", "senior high school", "Philippines", "digital behavior", "educational technology", "mixed-methods", "K-12 curriculum"]);
    
    setSections([
      {
        title: "Abstract",
        content: "This study examines the relationship between social media usage and academic performance among senior high school students in the Philippines. Using a mixed-methods approach, researchers surveyed 320 students from 5 schools in Region III and conducted in-depth interviews with 25 participants. Results indicate a moderate negative correlation (r=-0.38) between excessive social media use (>4 hours/day) and Grade Point Average, with some variations based on content type consumed."
      },
      {
        title: "Introduction",
        content: "The proliferation of digital technology has fundamentally changed how students access information, communicate, and learn. In the Philippine educational context, the K-12 curriculum introduced in 2016 has emphasized the integration of technology in learning processes. Social media platforms have become integral to student life, with 78% of senior high school students reporting daily use for educational purposes (PSA, 2023)."
      },
      {
        title: "Methodology",
        content: "This study employed a mixed-methods approach combining quantitative surveys and qualitative interviews. The sample consisted of 320 students from five public senior high schools in Region III, selected through stratified random sampling. The survey instrument was adapted from the Digital Behavior Assessment Tool (DBAT) and validated by three educational technology experts (Cronbach's α = 0.87)."
      },
      {
        title: "Results",
        content: "The analysis revealed that students who used social media for educational purposes for less than 2 hours per day showed improved collaborative learning outcomes, while those using it for entertainment purposes for more than 4 hours per day showed decreased academic performance. The correlation between excessive usage and lower grades was consistent across socioeconomic backgrounds."
      },
      {
        title: "Conclusion",
        content: "While social media can be a valuable educational tool, its impact depends heavily on usage patterns and digital literacy skills. Schools should focus on developing comprehensive digital citizenship curricula that teaches students how to effectively balance social media use with academic responsibilities."
      }
    ]);
    
    setProgress(100);
    setIsLoading(false);
    
    alert("Sample document analysis loaded! Explore the summary, keywords, sections, and annotations to see the tool's features in action.");
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setPdfUrl(""); // Clear URL when file is selected
      } else {
        toast.error("Please select a PDF file.");
      }
    }
  };

  const handleUrlImport = async () => {
    if (!pdfUrl) {
      toast.error("Please enter a PDF URL");
      return;
    }

    // Validate URL format
    try {
      new URL(pdfUrl);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setExtractedText("");
    setSummary("");
    setKeywords([]);
    setSections([]);
    setSearchResults([]);

    try {
      // Fetch the PDF from the URL
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      
      // Dynamically import pdfjs-dist when needed
      const pdfjsDist = await import('pdfjs-dist');
      const pdfjsLib = pdfjsDist.default;
      
      // Initialize worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
      
      // Load PDF
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      // Update progress
      setProgress(20);
      
      // Extract text from each page
      let fullText = "";
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // Extract text items and join them
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
          
        fullText += `\n\nPage ${i}:\n${pageText}`;
        
        // Update progress incrementally
        setProgress(20 + Math.floor((i / pdf.numPages) * 60));
      }
      
      setExtractedText(fullText);
      setProgress(90);
      
      // Simulate AI analysis (in a real implementation, this would run NLP in the browser)
      setTimeout(() => {
        // Generate summary (simulated)
        const textWords = fullText.trim().split(/\s+/);
        const summaryText = textWords.length > 50 
          ? textWords.slice(0, 50).join(' ') + '...' 
          : fullText;
        setSummary(summaryText);
        
        // Extract keywords (simulated)
        const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should']);
        const wordFreq: Record<string, number> = {};
        
        textWords
          .map(word => word.toLowerCase().replace(/[^\w\s]/g, ''))
          .filter(word => word.length > 3 && !commonWords.has(word))
          .forEach(word => {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
          });
        
        const topKeywords = Object.entries(wordFreq)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([word]) => word);
        
        setKeywords(topKeywords);
        
        // Identify sections (simulated - looking for common academic headings)
        const lines = fullText.split('\n');
        const foundSections = [];
        
        for (const line of lines) {
          if (/abstract|acknowledgment|methodology|method|results|findings|discussion|conclusion|references|bibliography/i.test(line)) {
            const sectionName = line.toLowerCase();
            foundSections.push({
              title: sectionName.charAt(0).toUpperCase() + sectionName.slice(1),
              content: line + '\n\n[Content would be extracted from the document...]'
            });
          }
        }
        
        setSections(foundSections);
        setProgress(100);
        setIsLoading(false);
        
        toast.success("PDF from URL processed successfully!");
      }, 1500);
    } catch (error) {
      console.error("Error processing PDF from URL:", error);
      setIsLoading(false);
      setProgress(0);
      toast.error("Failed to process PDF from URL. Please check the URL and try again.");
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setIsLoading(true);
    setProgress(0);
    setExtractedText("");
    setSummary("");
    setKeywords([]);
    setSections([]);
    setSearchResults([]);

    try {
      // Read file as ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      
      // Dynamically import pdfjs-dist when needed
      const pdfjsDist = await import('pdfjs-dist');
      const pdfjsLib = pdfjsDist.default;
      
      // Initialize worker
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
      
      // Load PDF
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      // Update progress
      setProgress(20);
      
      // Extract text from each page
      let fullText = "";
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // Extract text items and join them
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
          
        fullText += `\n\nPage ${i}:\n${pageText}`;
        
        // Update progress incrementally
        setProgress(20 + Math.floor((i / pdf.numPages) * 60));
      }
      
      setExtractedText(fullText);
      setProgress(90);
      
      // Simulate AI analysis (in a real implementation, this would run NLP in the browser)
      setTimeout(() => {
        // Generate summary (simulated)
        const textWords = fullText.trim().split(/\s+/);
        const summaryText = textWords.length > 50 
          ? textWords.slice(0, 50).join(' ') + '...' 
          : fullText;
        setSummary(summaryText);
        
        // Extract keywords (simulated)
        const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should']);
        const wordFreq: Record<string, number> = {};
        
        textWords
          .map(word => word.toLowerCase().replace(/[^\w\s]/g, ''))
          .filter(word => word.length > 3 && !commonWords.has(word))
          .forEach(word => {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
          });
        
        const topKeywords = Object.entries(wordFreq)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([word]) => word);
        
        setKeywords(topKeywords);
        
        // Identify sections (simulated - looking for common academic headings)
        const lines = fullText.split('\n');
        const foundSections = [];
        let currentSection = { title: "Introduction", content: "" };
        
        for (const line of lines) {
          if (line.trim().match(/^(Abstract|Introduction|Methodology|Methods|Results|Findings|Discussion|Conclusion|References|Bibliography)$/i)) {
            if (currentSection.title !== "Introduction" && currentSection.content) {
              foundSections.push({ ...currentSection });
            }
            currentSection = { title: line.trim(), content: "" };
          } else {
            currentSection.content += line + "\n";
          }
        }
        
        if (currentSection.content) {
          foundSections.push(currentSection);
        }
        
        setSections(foundSections);
        setProgress(100);
        setIsLoading(false);
        toast.success("Document analysis complete!");
      }, 1000);
      
    } catch (error) {
      console.error("Error processing PDF:", error);
      setIsLoading(false);
      setProgress(0);
      toast.error("Failed to analyze PDF. Please try another file.");
    }
  };

  const handleTextSelection = () => {
    if (textAreaRef.current) {
      const text = textAreaRef.current.value;
      const selectionStart = textAreaRef.current.selectionStart;
      const selectionEnd = textAreaRef.current.selectionEnd;
      
      if (selectionStart !== selectionEnd) {
        const selected = text.substring(selectionStart, selectionEnd);
        setSelectedText(selected);
      }
    }
  };

  const handleAddAnnotation = () => {
    if (selectedText && newAnnotation) {
      const annotation = {
        text: selectedText,
        note: newAnnotation,
        id: `ann-${Date.now()}`
      };
      
      setAnnotations([...annotations, annotation]);
      setNewAnnotation("");
      setSelectedText("");
      toast.success("Annotation added!");
    }
  };

  const handleSearch = () => {
    if (!searchTerm || !extractedText) return;
    
    const results: {pageIndex: number, text: string, index: number}[] = [];
    const pages = extractedText.split('\n\nPage ');
    
    for (let i = 0; i < pages.length; i++) {
      const pageContent = pages[i];
      const pageIndex = i === 0 ? 1 : i; // Adjust for first page
      
      const regex = new RegExp(searchTerm, 'gi');
      let match;
      
      while ((match = regex.exec(pageContent)) !== null) {
        const start = Math.max(0, match.index - 50);
        const end = Math.min(pageContent.length, match.index + searchTerm.length + 50);
        const context = pageContent.substring(start, end);
        
        results.push({
          pageIndex,
          text: context.replace(regex, `<mark>${match[0]}</mark>`),
          index: match.index
        });
      }
    }
    
    setSearchResults(results);
  };

  const handleExport = () => {
    // Create content to export
    let exportContent = "Document Analysis Report\n";
    exportContent += "=======================\n\n";
    exportContent += `File: ${file?.name || 'N/A'}\n\n`;
    
    if (summary) {
      exportContent += "SUMMARY:\n";
      exportContent += summary + "\n\n";
    }
    
    if (keywords.length > 0) {
      exportContent += "KEYWORDS:\n";
      exportContent += keywords.join(', ') + "\n\n";
    }
    
    if (sections.length > 0) {
      exportContent += "SECTIONS:\n";
      sections.forEach(section => {
        exportContent += `\n${section.title}:\n${section.content.substring(0, 200)}...\n`;
      });
      exportContent += "\n";
    }
    
    if (annotations.length > 0) {
      exportContent += "ANNOTATIONS:\n";
      annotations.forEach(ann => {
        exportContent += `\n"${ann.text}"\nNote: ${ann.note}\n`;
      });
      exportContent += "\n";
    }
    
    exportContent += `Full extracted text:\n${extractedText}`;
    
    // Create and download file
    const blob = new Blob([exportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis_${file?.name?.replace('.pdf', '') || 'document'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Analysis exported successfully!");
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-muted-foreground mb-4">
          Analyze PDF documents directly in your browser - no files uploaded to any server
        </p>
      </div>
      
      <Alert className="bg-blue-50 border-blue-200">
        <AlertDescription className="text-blue-800">
          <Key className="h-4 w-4 inline mr-2" />
          Your documents are processed entirely in your browser. Files never leave your device, ensuring maximum privacy and security.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Document Selection</CardTitle>
            <Button variant="outline" onClick={addSampleData} className="self-start">
              <FileText className="w-4 h-4 mr-2" />
              Add Sample Data
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Select a PDF document from your device to analyze. All processing happens locally in your browser.
          </p>
          {/* URL Import Option */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-grow">
                <Label htmlFor="pdf-url">Or import from URL</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="pdf-url"
                    type="url"
                    placeholder="https://example.com/document.pdf"
                    value={pdfUrl}
                    onChange={(e) => setPdfUrl(e.target.value)}
                    disabled={isLoading}
                  />
                  <Button 
                    onClick={handleUrlImport}
                    disabled={!pdfUrl || isLoading}
                    variant="outline"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-x-0 top-1/2 h-px bg-border transform -translate-y-1/2"></div>
              <span className="relative bg-background px-4 text-muted-foreground text-sm">OR</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="w-full sm:w-auto">
              <label htmlFor="pdf-upload">
                <Upload className="mr-2 h-4 w-4" /> Choose PDF File
                <input 
                  id="pdf-upload" 
                  type="file" 
                  className="hidden" 
                  onChange={handleFileChange} 
                  accept=".pdf" 
                  ref={fileInputRef}
                />
              </label>
            </Button>
            
            <Button 
              onClick={pdfUrl ? handleUrlImport : handleAnalyze} 
              disabled={(!file && !pdfUrl) || isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Progress value={progress} className="w-12 mr-2" /> 
                  Analyzing... {progress}%
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" /> Analyze Document
                </>
              )}
            </Button>
          </div>
          
          {file && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{file.name}</span>
              <span className="text-sm text-muted-foreground">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
            </div>
          )}
          
          {pdfUrl && !file && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium truncate max-w-xs">{pdfUrl}</span>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setPdfUrl("")}
                className="ml-auto"
              >
                Clear
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Document</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-center text-sm text-muted-foreground">
                Analyzing document: {progress}%
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {(summary || keywords.length > 0 || sections.length > 0) && (
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="keywords">Keywords</TabsTrigger>
            <TabsTrigger value="sections">Sections</TabsTrigger>
            <TabsTrigger value="annotations">Annotations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Document Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {summary ? (
                  <p className="whitespace-pre-line text-lg leading-relaxed">{summary}</p>
                ) : (
                  <p className="text-muted-foreground">No summary available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="keywords" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Extracted Keywords
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {keywords.length > 0 ? (
                    keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1">
                        {keyword}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No keywords extracted</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="sections" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSearch className="h-5 w-5" />
                  Document Sections
                </CardTitle>
              </CardHeader>
              <CardContent>
                {sections.length > 0 ? (
                  <div className="space-y-4">
                    {sections.map((section, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <CardTitle className="text-lg">{section.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="whitespace-pre-line line-clamp-3">{section.content}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No sections identified</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="annotations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Annotations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Select text to annotate</label>
                      <Textarea
                        ref={textAreaRef}
                        value={extractedText}
                        readOnly
                        rows={10}
                        className="font-mono text-sm"
                        onClick={handleTextSelection}
                        onSelect={handleTextSelection}
                      />
                    </div>
                    
                    {selectedText && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
                        <p className="font-medium mb-1 text-sm">Selected text:</p>
                        <p className="text-sm italic line-clamp-2">{selectedText}</p>
                        <div className="mt-3">
                          <label className="block text-sm font-medium mb-2">Add note</label>
                          <Input
                            value={newAnnotation}
                            onChange={(e) => setNewAnnotation(e.target.value)}
                            placeholder="Your annotation..."
                          />
                          <Button 
                            onClick={handleAddAnnotation} 
                            className="mt-2 w-full"
                            disabled={!newAnnotation}
                          >
                            Add Annotation
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Your Annotations</h3>
                    {annotations.length > 0 ? (
                      <div className="space-y-3">
                        {annotations.map((annotation, _index) => (
                           <Card key={annotation.id} className="p-3 border-l-4 border-l-blue-500">
                            <div className="text-sm text-muted-foreground font-medium mb-1">Selected Text:</div>
                            <p className="text-sm italic bg-muted p-2 rounded mb-2">{annotation.text}</p>
                            <div className="text-sm text-muted-foreground font-medium mb-1">Your Annotation:</div>
                            <p className="text-sm p-2 bg-blue-50 rounded text-foreground border border-blue-200">{annotation.note}</p>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No annotations yet</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {extractedText && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Full Extracted Text</CardTitle>
              <div className="flex gap-2">
                <Input
                  placeholder="Search in document..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-xs"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} size="sm">
                  Search
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {searchResults.length > 0 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="font-medium">{searchResults.length} results found for &quot;{searchTerm}&quot;</p>
              </div>
            )}
            
            <div className="relative">
              <Textarea
                value={extractedText}
                readOnly
                rows={20}
                className="font-mono text-sm"
              />
              {searchTerm && searchResults.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Search Results:</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {searchResults.map((result, index) => (
                      <Card key={index} className="p-3 text-sm">
                        <p className="font-medium">Page {result.pageIndex}</p>
                        <div 
                          className="mt-1" 
                          dangerouslySetInnerHTML={createSanitizedHtml(result.text)} 
                        />
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {(summary || keywords.length > 0 || sections.length > 0 || annotations.length > 0) && (
        <div className="flex justify-end">
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export Analysis
          </Button>
        </div>
      )}
    </div>
  );
}
