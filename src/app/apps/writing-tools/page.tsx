// src/app/apps/writing-tools/page.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Pencil,
  BookOpen,
  CheckCircle,
  Clock,
  BarChart3,
  Download,
  Upload,
  SpellCheck,
  Palette,
  Search,
  MessageSquare,
  AlignLeft,
  Type,
  FileText,
  Hash,
  User,
  Calendar,
  TrendingUp,
  Target,
  Lightbulb,
  Sparkles,
  Edit,
  Eye,
  Save,
  Share2,
  Printer,
  FileDown,
  Copy,
  Trash2
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function WritingToolsPage() {
  const [text, setText] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [activeTool, setActiveTool] = useState('editor');
  const [wordCount, setWordCount] = useState(0);
  const [characterCount, setCharacterCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [gradeLevel, setGradeLevel] = useState(0);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Text analysis utilities
  useEffect(() => {
    if (!text) {
      setWordCount(0);
      setCharacterCount(0);
      setReadingTime(0);
      setGradeLevel(0);
      return;
    }

    // Count words
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCount(words);

    // Count characters
    const characters = text.length;
    setCharacterCount(characters);

    // Calculate estimated reading time (200 words per minute average)
    const time = Math.ceil(words / 200);
    setReadingTime(time);

    // Estimate grade level (Flesch–Kincaid Grade Level)
    // This is a simplified estimation - a real implementation would use the full formula
    const sentences = text.split(/[.!?]+/).length;
    const syllables = text.split(/[^aeiouAEIOUy]+/).filter(s => s.trim()).length;
    const estimatedGrade = sentences > 0 && words > 0 
      ? Math.round(0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59)
      : 0;
    setGradeLevel(Math.max(1, estimatedGrade)); // Minimum grade level of 1
  }, [text]);

  const runSpellCheck = () => {
    // In a real implementation, this would run actual spell-checking
    // For now, we'll just show a mock analysis
    const mockSuggestions = [
      {
        id: 1,
        type: 'spelling',
        original: 'teh',
        correction: 'the',
        position: 10,
        message: 'Possible spelling error'
      },
      {
        id: 2,
        type: 'grammar',
        original: 'they was',
        correction: 'they were',
        position: 45,
        message: 'Subject-verb disagreement'
      },
      {
        id: 3,
        type: 'style',
        original: 'very good',
        correction: 'excellent, outstanding, remarkable',
        position: 78,
        message: 'Consider more precise language'
      }
    ];
    
    setSuggestions(mockSuggestions);
  };

  const applySuggestion = (suggestion: any) => {
    // Apply the correction to the text
    let newText = text;
    
    // This is a simplified implementation - in reality, you'd need to accurately replace at position
    newText = newText.replace(suggestion.original, suggestion.correction);
    
    setText(newText);
    setSuggestions(suggestions.filter(s => s.id !== suggestion.id));
  };

  const generateWritingSuggestions = () => {
    // In a real implementation, this would use AI to analyze the text
    // For now, we'll return mock suggestions
    const aiSuggestions = [
      {
        id: 1,
        type: 'structure',
        message: 'Consider adding a transition sentence between paragraphs 2 and 3',
        severity: 'medium'
      },
      {
        id: 2,
        type: 'clarity',
        message: 'The phrase "various different" is redundant. Consider "various" or "different" alone.',
        severity: 'high'
      },
      {
        id: 3,
        type: 'tone',
        message: 'This paragraph may be too informal for academic writing. Consider rephrasing.',
        severity: 'medium'
      },
      {
        id: 4,
        type: 'citation',
        message: 'Consider adding a citation after this claim',
        severity: 'high'
      }
    ];
    
    setSuggestions(aiSuggestions);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportAs = (format: 'pdf' | 'docx' | 'txt') => {
    // In a real implementation, this would generate and download a file in the specified format
    alert(`Exporting in ${format.toUpperCase()} format...`);
    
    // Create a blob and download
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thesis-text.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Flesch Reading Ease Calculation
  const fleschReadingEase = text 
    ? Math.max(
        0,
        Math.min(
          100,
          Math.round(
            206.835 -
            1.015 * (wordCount / (text.split(/[.!?]+/).filter(s => s.trim()).length || 1)) -
            84.6 * (((text.match(/[aeiouAEIOU]/g) || []).length) / (wordCount || 1))
          )
        )
      ).toFixed(1)
    : 'N/A';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Writing Tools</h1>
          <p className="text-muted-foreground">
            Essential tools for effective academic writing
          </p>
        </div>

        <Tabs value={activeTool} onValueChange={setActiveTool} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
            <TabsTrigger value="editor">Text Editor</TabsTrigger>
            <TabsTrigger value="analyzer">Analyzer</TabsTrigger>
            <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pencil className="h-5 w-5" />
                  Academic Writing Editor
                </CardTitle>
                <CardDescription>
                  Write, edit, and refine your thesis content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-4 border-b pb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Words:</span>
                      <Badge variant="secondary">{wordCount}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Characters:</span>
                      <Badge variant="secondary">{characterCount}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-medium">Reading Time:</span>
                      <Badge variant="outline">{readingTime} min</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      <span className="text-sm font-medium">Grade Level:</span>
                      <Badge variant="outline">{gradeLevel}th grade</Badge>
                    </div>
                  </div>

                  <Textarea
                    ref={textareaRef}
                    placeholder="Start writing your thesis content here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="min-h-[400px] font-mono text-lg leading-relaxed"
                  />

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button onClick={runSpellCheck}>
                      <SpellCheck className="h-4 w-4 mr-2" />
                      Spell Check
                    </Button>
                    <Button onClick={generateWritingSuggestions} variant="secondary">
                      <Sparkles className="h-4 w-4 mr-2" />
                      AI Suggestions
                    </Button>
                    <Button onClick={copyToClipboard} variant="outline">
                      {copied ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Text
                        </>
                      )}
                    </Button>
                    <Button onClick={() => setText('')} variant="outline">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                    <Button onClick={() => setSaved(true)} variant="outline">
                      <Save className="h-4 w-4 mr-2" />
                      {saved ? 'Saved' : 'Save Draft'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analyzer" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Text Analysis
                </CardTitle>
                <CardDescription>
                  Detailed analysis of your writing metrics and readability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-3">Text Metrics</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Words</span>
                          <span className="font-semibold">{wordCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Characters</span>
                          <span className="font-semibold">{characterCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sentences</span>
                          <span className="font-semibold">{text ? text.split(/[.!?]+/).filter(s => s.trim()).length : 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Paragraphs</span>
                          <span className="font-semibold">{text ? text.split('\n\n').filter(p => p.trim()).length : 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Complex Words</span>
                          <span className="font-semibold">{text ? text.split(/\s+/).filter(w => w.length > 8).length : 0}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-3">Readability Scores</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span>Flesch Reading Ease</span>
                                                    <span className="font-semibold">
                                                      {fleschReadingEase}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Flesch-Kincaid Grade</span>
                          <span className="font-semibold">{gradeLevel}th grade</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Coleman-Liau Index</span>
                          <span className="font-semibold">
                            {text ? Math.max(0, Math.min(20, Math.round(0.0588 * (characterCount / wordCount) * 100 - 0.296 * (text.split(/[.!?]+/).filter(s => s.trim()).length / wordCount * 100) - 15.8))).toFixed(1) : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-3">Text Composition</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Short Sentences (&lt;10 words)</span>
                          <span className="text-sm">
                            {text ? Math.round((text.split(/[.!?]+/).filter(s => s.trim() && s.trim().split(/\s+/).length < 10).length / Math.max(1, text.split(/[.!?]+/).filter(s => s.trim()).length) * 100)) : 0}%
                          </span>
                        </div>
                        <Progress 
                          value={text ? Math.round((text.split(/[.!?]+/).filter(s => s.trim() && s.trim().split(/\s+/).length < 10).length / Math.max(1, text.split(/[.!?]+/).filter(s => s.trim()).length) * 100)) : 0} 
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Medium Sentences (10-20 words)</span>
                          <span className="text-sm">
                            {text ? Math.round((text.split(/[.!?]+/).filter(s => s.trim() && s.trim().split(/\s+/).length >= 10 && s.trim().split(/\s+/).length <= 20).length / Math.max(1, text.split(/[.!?]+/).filter(s => s.trim()).length) * 100)) : 0}%
                          </span>
                        </div>
                        <Progress 
                          value={text ? Math.round((text.split(/[.!?]+/).filter(s => s.trim() && s.trim().split(/\s+/).length >= 10 && s.trim().split(/\s+/).length <= 20).length / Math.max(1, text.split(/[.!?]+/).filter(s => s.trim()).length) * 100)) : 0} 
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Long Sentences (&gt;20 words)</span>
                          <span className="text-sm">
                            {text ? Math.round((text.split(/[.!?]+/).filter(s => s.trim() && s.trim().split(/\s+/).length > 20).length / Math.max(1, text.split(/[.!?]+/).filter(s => s.trim()).length) * 100)) : 0}%
                          </span>
                        </div>
                        <Progress 
                          value={text ? Math.round((text.split(/[.!?]+/).filter(s => s.trim() && s.trim().split(/\s+/).length > 20).length / Math.max(1, text.split(/[.!?]+/).filter(s => s.trim()).length) * 100)) : 0} 
                        />
                      </div>
                      
                      <div className="pt-4">
                        <h4 className="font-medium mb-2">Word Length Distribution</h4>
                        <div className="space-y-2">
                          {text ? Array.from({length: 6}, (_, i) => i).map(length => (
                            <div key={length} className="flex items-center gap-2">
                              <span className="text-xs w-12">{length + 1} letters</span>
                              <Progress 
                                className="flex-1" 
                                value={Math.min(100, 
                                  text.split(/\s+/).filter(word => word.length === length + 1).length / 
                                  text.split(/\s+/).length * 100 || 0
                                )}
                              />
                              <span className="text-xs w-10 text-right">
                                {Math.round(
                                  text.split(/\s+/).filter(word => word.length === length + 1).length / 
                                  text.split(/\s+/).length * 100 || 0
                                )}% 
                              </span>
                            </div>
                          )) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  AI Writing Suggestions
                </CardTitle>
                <CardDescription>
                  Intelligent recommendations to improve your writing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end mb-4">
                  <Button onClick={generateWritingSuggestions}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Suggestions
                  </Button>
                </div>

                {suggestions.length > 0 ? (
                  <div className="space-y-4">
                    {suggestions.map((suggestion) => (
                      <Card key={suggestion.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {suggestion.type === 'spelling' && <SpellCheck className="h-4 w-4 text-blue-500" />}
                                {suggestion.type === 'grammar' && <AlignLeft className="h-4 w-4 text-green-500" />}
                                {suggestion.type === 'style' && <Palette className="h-4 w-4 text-purple-500" />}
                                {suggestion.type === 'structure' && <FileText className="h-4 w-4 text-orange-500" />}
                                {suggestion.type === 'clarity' && <Eye className="h-4 w-4 text-cyan-500" />}
                                {suggestion.type === 'tone' && <MessageSquare className="h-4 w-4 text-pink-500" />}
                                {suggestion.type === 'citation' && <BookOpen className="h-4 w-4 text-indigo-500" />}
                                <span className="font-medium capitalize">{suggestion.type}</span>
                                {suggestion.severity && (
                                  <Badge variant={suggestion.severity === 'high' ? 'destructive' : suggestion.severity === 'medium' ? 'default' : 'secondary'}>
                                    {suggestion.severity}
                                  </Badge>
                                )}
                              </div>
                              <p className="mb-2">{suggestion.message}</p>
                              {suggestion.original && (
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-muted-foreground">Was:</span>
                                  <Badge variant="outline" className="line-through">
                                    {suggestion.original}
                                  </Badge>
                                  <span className="text-muted-foreground">→</span>
                                  <span className="text-muted-foreground">Now:</span>
                                  <Badge variant="secondary">
                                    {suggestion.correction}
                                  </Badge>
                                </div>
                              )}
                            </div>
                            <Button
                              size="sm"
                              onClick={() => suggestion.original ? applySuggestion(suggestion) : {}}
                              disabled={!suggestion.original}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Apply
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Generate suggestions to see AI-powered writing recommendations</p>
                    <p className="text-sm mt-2">AI will analyze your text and suggest improvements for clarity, structure, and style</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Export Options
                </CardTitle>
                <CardDescription>
                  Export your writing in various formats for different purposes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="flex flex-col items-center justify-center h-32"
                    onClick={() => exportAs('pdf')}
                  >
                    <FileText className="h-8 w-8 mb-2" />
                    <span>PDF</span>
                    <span className="text-xs text-muted-foreground mt-1">Professional document</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="flex flex-col items-center justify-center h-32"
                    onClick={() => exportAs('docx')}
                  >
                    <FileDown className="h-8 w-8 mb-2" />
                    <span>DOCX</span>
                    <span className="text-xs text-muted-foreground mt-1">Microsoft Word</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="flex flex-col items-center justify-center h-32"
                    onClick={() => exportAs('txt')}
                  >
                    <Type className="h-8 w-8 mb-2" />
                    <span>TXT</span>
                    <span className="text-xs text-muted-foreground mt-1">Plain text</span>
                  </Button>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-medium mb-4">Export Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fileName">File Name</Label>
                      <Input id="fileName" placeholder="e.g., thesis-chapter-1" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="format">Format Options</Label>
                      <Select value="standard" onValueChange={() => {}}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="academic">Academic (with citations)</SelectItem>
                          <SelectItem value="annotated">Annotated</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button>
                      <Printer className="h-4 w-4 mr-2" />
                      Export Document
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
