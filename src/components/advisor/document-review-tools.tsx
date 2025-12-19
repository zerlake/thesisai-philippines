'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search,
  Filter,
  Download,
  Upload,
  BarChart3,
  MessageSquare,
  User,
  Star,
  Calendar,
  Flag,
  AlertTriangle,
  Check,
  RotateCcw,
  Copy,
  Trash2
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface Document {
  id: string;
  title: string;
  student_id: string;
  student_name: string;
  student_avatar?: string;
  content: string;
  created_at: string;
  updated_at: string;
  review_status: 'draft' | 'submitted' | 'in_review' | 'approved' | 'needs_revision';
  document_type: 'thesis' | 'proposal' | 'chapter_1' | 'chapter_2' | 'chapter_3' | 'chapter_4' | 'chapter_5' | 'literature_review' | 'methodology' | 'conclusion';
  feedback?: string;
  feedback_date?: string;
  revision_count: number;
  plagiarism_score?: number;
  word_count: number;
  reading_time: number; // in minutes
}

interface FeedbackTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
  applies_to: string[]; // document types this template applies to
}

interface RubricItem {
  id: string;
  criterion: string;
  description: string;
  weight: number; // percentage
  max_points: number;
  selected_point?: number; // point given by advisor
}

const mockDocuments: Document[] = [
  {
    id: 'doc1',
    title: 'Chapter 2: Literature Review',
    student_id: 'student1',
    student_name: 'Maria Santos',
    student_avatar: '',
    content: 'This chapter provides a comprehensive review of existing literature...',
    created_at: '2024-12-01T10:30:00Z',
    updated_at: '2024-12-15T14:22:00Z',
    review_status: 'submitted',
    document_type: 'chapter_2',
    revision_count: 0,
    plagiarism_score: 15,
    word_count: 3420,
    reading_time: 15
  },
  {
    id: 'doc2',
    title: 'Thesis Proposal',
    student_id: 'student2',
    student_name: 'Juan Dela Cruz',
    student_avatar: '',
    content: 'This proposal outlines the research methodology for studying...',
    created_at: '2024-11-28T09:15:00Z',
    updated_at: '2024-12-10T11:45:00Z',
    review_status: 'needs_revision',
    feedback: 'The methodology section needs more detail. Consider adding more background research.',
    feedback_date: '2024-12-11T10:30:00Z',
    document_type: 'proposal',
    revision_count: 1,
    plagiarism_score: 8,
    word_count: 2870,
    reading_time: 12
  },
  {
    id: 'doc3',
    title: 'Chapter 3: Methodology',
    student_id: 'student3',
    student_name: 'Ana Reyes',
    student_avatar: '',
    content: 'This chapter describes the research design and methodology used...',
    created_at: '2024-12-05T14:20:00Z',
    updated_at: '2024-12-14T16:30:00Z',
    review_status: 'submitted',
    document_type: 'chapter_3',
    revision_count: 0,
    plagiarism_score: 5,
    word_count: 2100,
    reading_time: 10
  },
  {
    id: 'doc4',
    title: 'Chapter 1: Introduction',
    student_id: 'student4',
    student_name: 'Carlos Garcia',
    student_avatar: '',
    content: 'This chapter introduces the research problem and objectives...',
    created_at: '2024-11-30T12:45:00Z',
    updated_at: '2024-12-12T09:15:00Z',
    review_status: 'approved',
    feedback: 'Well-written introduction. The research problem is clearly stated.',
    feedback_date: '2024-12-12T10:00:00Z',
    document_type: 'chapter_1',
    revision_count: 0,
    plagiarism_score: 3,
    word_count: 1850,
    reading_time: 8
  }
];

const mockFeedbackTemplates: FeedbackTemplate[] = [
  {
    id: 'tmpl1',
    name: 'General Structure Feedback',
    category: 'Structure',
    content: 'The document has a good overall structure, but consider adding more clear headings and subheadings to improve readability.',
    applies_to: ['thesis', 'chapter_1', 'chapter_2', 'chapter_3', 'chapter_4', 'chapter_5']
  },
  {
    id: 'tmpl2',
    name: 'Methodology Critique',
    category: 'Methodology',
    content: 'The methodology section needs more detail. Please elaborate on your data collection methods and justify your choice of approach.',
    applies_to: ['thesis', 'proposal', 'chapter_3', 'methodology']
  },
  {
    id: 'tmpl3',
    name: 'Citation Improvement',
    category: 'Academic Writing',
    content: 'There are several instances where citations are missing or incorrectly formatted. Please ensure all sources are properly cited according to APA style.',
    applies_to: ['thesis', 'literature_review', 'proposal']
  },
  {
    id: 'tmpl4',
    name: 'Plagiarism Warning',
    category: 'Quality',
    content: 'Similarity score is higher than acceptable. Please review highlighted sections and ensure all content is original with proper attribution.',
    applies_to: ['thesis', 'chapter_1', 'chapter_2', 'chapter_3', 'chapter_4', 'chapter_5']
  }
];

const mockRubric: RubricItem[] = [
  {
    id: 'r1',
    criterion: 'Research Question Clarity',
    description: 'How clearly is the research question defined?',
    weight: 20,
    max_points: 5
  },
  {
    id: 'r2',
    criterion: 'Literature Review Quality',
    description: 'Depth and relevance of literature review',
    weight: 25,
    max_points: 5
  },
  {
    id: 'r3',
    criterion: 'Methodology Soundness',
    description: 'Appropriateness and clarity of research methodology',
    weight: 30,
    max_points: 5
  },
  {
    id: 'r4',
    criterion: 'Writing Quality',
    description: 'Clarity, coherence, and academic tone',
    weight: 15,
    max_points: 5
  },
  {
    id: 'r5',
    criterion: 'Adherence to Guidelines',
    description: 'Following institutional and format guidelines',
    weight: 10,
    max_points: 5
  }
];

export function DocumentReviewTools() {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [rubricItems, setRubricItems] = useState<RubricItem[]>(mockRubric);
  const [sortBy, setSortBy] = useState<'updated_at' | 'student_name' | 'document_type'>('updated_at');
  const [filterStatus, setFilterStatus] = useState<'all' | 'submitted' | 'needs_revision'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'review' | 'rubric' | 'comparison'>('review');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter documents based on status and search term
  const filteredDocuments = documents.filter(doc => {
    const matchesStatus = filterStatus === 'all' || doc.review_status === filterStatus;
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.student_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Sort documents
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    if (sortBy === 'student_name') {
      return a.student_name.localeCompare(b.student_name);
    } else if (sortBy === 'document_type') {
      return a.document_type.localeCompare(b.document_type);
    } else {
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    }
  });

  // Apply template to feedback text
  const applyTemplate = () => {
    if (!selectedTemplate) return;
    
    const template = mockFeedbackTemplates.find(t => t.id === selectedTemplate);
    if (template) {
      setFeedbackText(prev => prev ? `${prev}\n\n${template.content}` : template.content);
    }
  };

  // Update rubric item points
  const updateRubricPoints = (id: string, points: number) => {
    setRubricItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, selected_point: Math.min(Math.max(points, 0), item.max_points) } : item
      )
    );
  };

  // Calculate total score
  const calculateTotalScore = () => {
    let totalWeightedScore = 0;
    let totalWeight = 0;
    
    rubricItems.forEach(item => {
      if (item.selected_point !== undefined) {
        totalWeightedScore += (item.selected_point / item.max_points) * item.weight;
        totalWeight += item.weight;
      }
    });
    
    return totalWeight > 0 ? Math.round((totalWeightedScore / totalWeight) * 100) : 0;
  };

  // Handle document approval
  const handleApproveDocument = async () => {
    if (!selectedDocument || !user) return;
    
    setIsSubmitting(true);
    try {
      // In a real implementation, this would call an API to update the document status
      const updatedDocs = documents.map(doc => 
        doc.id === selectedDocument.id 
          ? { ...doc, review_status: 'approved', feedback: feedbackText, feedback_date: new Date().toISOString() } 
          : doc
      );
      
      setDocuments(updatedDocs);
      setSelectedDocument(updatedDocs.find(doc => doc.id === selectedDocument.id) || null);
      alert('Document approved successfully!');
    } catch (error) {
      console.error('Error approving document:', error);
      alert('Error approving document');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle request revision
  const handleRequestRevision = async () => {
    if (!selectedDocument || !user) return;
    
    setIsSubmitting(true);
    try {
      // In a real implementation, this would call an API to update the document status
      const updatedDocs = documents.map(doc => 
        doc.id === selectedDocument.id 
          ? { ...doc, review_status: 'needs_revision', feedback: feedbackText, feedback_date: new Date().toISOString() } 
          : doc
      );
      
      setDocuments(updatedDocs);
      setSelectedDocument(updatedDocs.find(doc => doc.id === selectedDocument.id) || null);
      alert('Revision requested successfully!');
    } catch (error) {
      console.error('Error requesting revision:', error);
      alert('Error requesting revision');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copy document content to clipboard
  const copyDocumentContent = () => {
    if (selectedDocument) {
      navigator.clipboard.writeText(selectedDocument.content);
      alert('Document content copied to clipboard!');
    }
  };

  // Reset feedback
  const resetFeedback = () => {
    setFeedbackText('');
    setSelectedTemplate('');
    // Reset rubric selections
    setRubricItems(prev => prev.map(item => ({ ...item, selected_point: undefined })));
  };

  return (
    <Card className="h-[700px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Document Review Tools
            </CardTitle>
            <CardDescription>Review, provide feedback, and evaluate student documents</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Export All
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-1" />
              Bulk Import
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex h-full">
          {/* Document List */}
          <div className="w-1/3 border-r flex flex-col">
            <div className="p-4 border-b">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search documents by title or student..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Documents</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="needs_revision">Needs Revision</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updated_at">Date Updated</SelectItem>
                    <SelectItem value="student_name">Student Name</SelectItem>
                    <SelectItem value="document_type">Document Type</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-2">
                {sortedDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedDocument?.id === doc.id ? 'bg-accent' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => {
                      setSelectedDocument(doc);
                      setFeedbackText(doc.feedback || '');
                      // Initialize rubric points based on document if available
                      resetFeedback();
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium truncate">{doc.title}</h4>
                          <Badge variant={
                            doc.review_status === 'approved' ? 'default' : 
                            doc.review_status === 'needs_revision' ? 'destructive' : 
                            doc.review_status === 'submitted' ? 'secondary' : 
                            'outline'
                          }>
                            {doc.review_status === 'approved' ? 'Approved' : 
                             doc.review_status === 'needs_revision' ? 'Revision' : 
                             doc.review_status === 'submitted' ? 'Submitted' : 
                             'Draft'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={doc.student_avatar} />
                            <AvatarFallback>
                              {doc.student_name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <p className="text-xs text-muted-foreground truncate">{doc.student_name}</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {doc.document_type.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {doc.word_count} words
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {doc.reading_time} min read
                          </Badge>
                          {doc.plagiarism_score !== undefined && (
                            <Badge 
                              variant={doc.plagiarism_score > 20 ? 'destructive' : doc.plagiarism_score > 10 ? 'default' : 'secondary'} 
                              className="text-xs"
                            >
                              {doc.plagiarism_score}% similarity
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground text-right">
                        {new Date(doc.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          {/* Document Review Area */}
          <div className="flex-1 flex flex-col">
            {selectedDocument ? (
              <>
                <div className="border-b p-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">{selectedDocument.title}</h2>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={selectedDocument.student_avatar} />
                          <AvatarFallback>
                            {selectedDocument.student_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{selectedDocument.student_name}</p>
                          <p className="text-xs text-muted-foreground">Submitted on {new Date(selectedDocument.updated_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Badge variant={
                          selectedDocument.review_status === 'approved' ? 'default' : 
                          selectedDocument.review_status === 'needs_revision' ? 'destructive' : 
                          selectedDocument.review_status === 'submitted' ? 'secondary' : 
                          'outline'
                        }>
                          {selectedDocument.review_status === 'approved' ? 'Approved' : 
                           selectedDocument.review_status === 'needs_revision' ? 'Needs Revision' : 
                           selectedDocument.review_status === 'submitted' ? 'Submitted' : 
                           'Draft'}
                        </Badge>
                        <Badge variant="secondary">
                          {selectedDocument.document_type.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyDocumentContent}>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy Content
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-1" />
                      Download PDF
                    </Button>
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col">
                  {/* Tabs for different review tools */}
                  <div className="border-b">
                    <div className="flex">
                      <button
                        className={`px-4 py-2 text-sm font-medium ${
                          activeTab === 'review' 
                            ? 'text-foreground border-b-2 border-foreground' 
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                        onClick={() => setActiveTab('review')}
                      >
                        Feedback
                      </button>
                      <button
                        className={`px-4 py-2 text-sm font-medium ${
                          activeTab === 'rubric' 
                            ? 'text-foreground border-b-2 border-foreground' 
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                        onClick={() => setActiveTab('rubric')}
                      >
                        Rubric
                      </button>
                      <button
                        className={`px-4 py-2 text-sm font-medium ${
                          activeTab === 'comparison' 
                            ? 'text-foreground border-b-2 border-foreground' 
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                        onClick={() => setActiveTab('comparison')}
                      >
                        Compare
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    {activeTab === 'review' && (
                      <div className="flex-1 flex flex-col">
                        <div className="flex-1 p-4 overflow-auto">
                          <div className="prose max-w-none bg-muted/30 p-4 rounded-lg">
                            {selectedDocument.content}
                          </div>
                        </div>
                        
                        <div className="border-t p-4">
                          <div className="mb-4">
                            <label className="text-sm font-medium mb-2 block">Feedback Templates</label>
                            <div className="flex gap-2">
                              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                                <SelectTrigger className="flex-1">
                                  <SelectValue placeholder="Select a feedback template" />
                                </SelectTrigger>
                                <SelectContent>
                                  {mockFeedbackTemplates
                                    .filter(template => 
                                      template.applies_to.includes(selectedDocument.document_type) || 
                                      template.applies_to.includes('thesis')
                                    )
                                    .map(template => (
                                      <SelectItem key={template.id} value={template.id}>
                                        {template.name} ({template.category})
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                              <Button onClick={applyTemplate} disabled={!selectedTemplate}>
                                Apply
                              </Button>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <label className="text-sm font-medium mb-2 block">Your Feedback</label>
                            <Textarea
                              value={feedbackText}
                              onChange={(e) => setFeedbackText(e.target.value)}
                              placeholder="Provide detailed feedback for the student..."
                              rows={6}
                              className="mb-2"
                            />
                          </div>
                          
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              onClick={resetFeedback}
                              disabled={isSubmitting}
                            >
                              <RotateCcw className="h-4 w-4 mr-1" />
                              Reset
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={handleRequestRevision}
                              disabled={isSubmitting}
                              className="flex items-center gap-1"
                            >
                              <XCircle className="h-4 w-4" />
                              Request Revision
                            </Button>
                            <Button 
                              onClick={handleApproveDocument}
                              disabled={isSubmitting}
                              className="flex items-center gap-1"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Approve Document
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {activeTab === 'rubric' && (
                      <div className="flex-1 flex flex-col">
                        <div className="p-4 border-b">
                          <div className="flex justify-between items-center">
                            <h3 className="font-semibold">Rubric Evaluation</h3>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">Overall Score:</span>
                              <Badge variant="outline" className="text-lg px-3 py-1">
                                {calculateTotalScore()}%
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <ScrollArea className="flex-1 p-4">
                          <div className="space-y-4">
                            {rubricItems.map((item) => (
                              <div key={item.id} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-medium">{item.criterion}</h4>
                                  <Badge variant="secondary">{item.weight}% weight</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                                
                                <div className="flex items-center gap-4">
                                  <span className="text-sm text-muted-foreground">Score:</span>
                                  <div className="flex gap-2">
                                    {[...Array(item.max_points)].map((_, i) => (
                                      <button
                                        key={i}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                          (item.selected_point !== undefined && i < item.selected_point)
                                            ? 'bg-primary text-primary-foreground'
                                            : 'border'
                                        }`}
                                        onClick={() => updateRubricPoints(item.id, i + 1)}
                                      >
                                        {i + 1}
                                      </button>
                                    ))}
                                  </div>
                                  <span className="text-sm text-muted-foreground ml-2">
                                    {item.selected_point !== undefined ? `${item.selected_point}/${item.max_points}` : `0/${item.max_points}`}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}
                    
                    {activeTab === 'comparison' && (
                      <div className="flex-1 p-4">
                        <div className="text-center py-10">
                          <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold mb-2">Document Comparison Tool</h3>
                          <p className="text-muted-foreground mb-4">
                            Compare this document with previous versions or similar student work.
                          </p>
                          <div className="flex gap-2 justify-center">
                            <Button variant="outline">Compare with Previous Version</Button>
                            <Button variant="outline">Compare with Similar Topics</Button>
                          </div>
                          
                          <div className="mt-8 bg-muted/30 rounded-lg p-4">
                            <h4 className="font-medium mb-2">Previous Versions</h4>
                            <div className="text-sm text-muted-foreground">
                              No previous versions available for this document.
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a document to review</h3>
                <p className="text-muted-foreground mb-4">
                  Choose a document from the list to view its content and provide feedback.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}