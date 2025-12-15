import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  BookOpen, 
  GitBranch, 
  Navigation,
  Target,
  CheckCircle,
  AlertTriangle,
  FileText,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Copy
} from 'lucide-react';
import { toast } from 'sonner';

// Define types for thesis structure
interface DocumentTreeNode {
  id: string;
  type: 'chapter' | 'section' | 'subsection' | 'paragraph' | 'figure' | 'table' | 'equation';
  title: string;
  contentPreview: string;
  wordCount: number;
  academicScore: number; // 0-100
  children: DocumentTreeNode[];
  status?: 'complete' | 'incomplete' | 'needs_review' | 'draft';
}

interface StructureAnalysisResult {
  documentId: string;
  structureMap: DocumentTreeNode[];
  flowScore: number; // 0-100
  complianceScore: number; // 0-100
  recommendations: StructureRecommendation[];
  citationMap: any[]; // Cross-reference mapping
  sectionProperties: Record<string, SectionMetadata>;
  summary: AnalysisSummary;
}

interface StructureRecommendation {
  id: string;
  type: 'reorganization' | 'content_placement' | 'flow_improvement' | 'compliance';
  title: string;
  description: string;
  suggestedChanges: ChangeInstruction[];
  priority: 'high' | 'medium' | 'low';
  confidenceScore: number; // 0-100
  estimatedTime: number; // Minutes to implement
  effectivenessEstimate: number; // Expected impact (0-100)
}

interface ChangeInstruction {
  action: 'move' | 'insert' | 'delete' | 'modify' | 'combine' | 'split';
  targetLocation: string; // Section ID
  content: string;
  reason: string; // Why this change is recommended
  before?: string; // Content before change
  after?: string; // Content after change
}

interface SectionMetadata {
  completeness: number; // 0-100
  complexity: 'basic' | 'intermediate' | 'advanced';
  keyCitations: string[];
  relatedSections: string[];
  writingQuality: number; // 0-100
}

interface AnalysisSummary {
  totalChapters: number;
  totalSections: number;
  totalWordCount: number;
  averageQuality: number; // 0-100
}

interface ThesisStructureNavigatorProps {
  documentId: string;
  documentContent: string;
  onNavigateToSection?: (sectionId: string) => void;
  userId: string;
}

const ThesisStructureNavigator: React.FC<ThesisStructureNavigatorProps> = ({ 
  documentId, 
  documentContent,
  onNavigateToSection,
  userId 
}) => {
  const [structure, setStructure] = useState<DocumentTreeNode[] | null>(null);
  const [analysisResult, setAnalysisResult] = useState<StructureAnalysisResult | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [viewMode, setViewMode] = useState<'tree' | 'linear' | 'flow'>('tree');
  const [zoomLevel, setZoomLevel] = useState(1);

  // Mock structure data
  const mockStructure: DocumentTreeNode[] = [
    {
      id: 'ch1',
      type: 'chapter',
      title: 'Chapter 1: Introduction',
      contentPreview: 'This chapter introduces the research problem, objectives, and significance of the study...',
      wordCount: 1200,
      academicScore: 95,
      status: 'complete',
      children: [
        {
          id: 'ch1-1',
          type: 'section',
          title: 'Background of the Study',
          contentPreview: 'The rapid advancement of digital technologies has fundamentally changed how we approach...',
          wordCount: 400,
          academicScore: 92,
          status: 'complete',
          children: [
            {
              id: 'ch1-1-1',
              type: 'subsection',
              title: 'Digital Learning Evolution',
              contentPreview: 'Digital learning has evolved significantly over the past decade...',
              wordCount: 150,
              academicScore: 89,
              status: 'complete',
              children: []
            },
            {
              id: 'ch1-1-2',
              type: 'subsection',
              title: 'Current State of AI in Education',
              contentPreview: 'AI applications in education have expanded rapidly...',
              wordCount: 250,
              academicScore: 95,
              status: 'needs_review',
              children: []
            }
          ]
        },
        {
          id: 'ch1-2',
          type: 'section',
          title: 'Statement of the Problem',
          contentPreview: 'This study addresses the gap in understanding of digital learning effectiveness...',
          wordCount: 350,
          academicScore: 96,
          status: 'complete',
          children: []
        },
        {
          id: 'ch1-3',
          type: 'section',
          title: 'Significance of the Study',
          contentPreview: 'The findings of this study will benefit educators, students, and policy makers...',
          wordCount: 280,
          academicScore: 88,
          status: 'complete',
          children: []
        }
      ]
    },
    {
      id: 'ch2',
      type: 'chapter',
      title: 'Chapter 2: Literature Review',
      contentPreview: 'This chapter reviews existing literature related to our research topic...',
      wordCount: 2500,
      academicScore: 87,
      status: 'incomplete',
      children: [
        {
          id: 'ch2-1',
          type: 'section',
          title: 'Theoretical Framework',
          contentPreview: 'The main theoretical foundations of this research include...',
          wordCount: 500,
          academicScore: 90,
          status: 'complete',
          children: []
        },
        {
          id: 'ch2-2',
          type: 'section',
          title: 'Related Studies',
          contentPreview: 'Previous studies have examined various aspects of digital learning...',
          wordCount: 800,
          academicScore: 85,
          status: 'draft',
          children: []
        },
        {
          id: 'ch2-3',
          type: 'section',
          title: 'Gap Analysis',
          contentPreview: 'Despite existing research, there are gaps in understanding...',
          wordCount: 150,
          academicScore: 75,
          status: 'draft',
          children: []
        }
      ]
    },
    {
      id: 'ch3',
      type: 'chapter',
      title: 'Chapter 3: Methodology',
      contentPreview: 'This chapter describes the research design and methodology used...',
      wordCount: 1800,
      academicScore: 93,
      status: 'complete',
      children: [
        {
          id: 'ch3-1',
          type: 'section',
          title: 'Research Design',
          contentPreview: 'This study employs a mixed-methods research approach...',
          wordCount: 400,
          academicScore: 95,
          status: 'complete',
          children: []
        }
      ]
    }
  ];

  // Mock analysis result
  const mockAnalysisResult: StructureAnalysisResult = {
    documentId: documentId,
    structureMap: mockStructure,
    flowScore: 85,
    complianceScore: 92,
    recommendations: [
      {
        id: 'rec1',
        type: 'flow_improvement',
        title: 'Better Transition Between Chapters',
        description: 'Add a connecting paragraph between Chapter 2 and Chapter 3 to improve flow.',
        suggestedChanges: [{
          action: 'insert' as const,
          targetLocation: 'ch2',
          content: 'The preceding literature review established the theoretical foundation for our methodology, which we now describe in detail.',
          reason: 'Improve logical flow between literature review and methodology'
        }],
        priority: 'high',
        confidenceScore: 88,
        estimatedTime: 10,
        effectivenessEstimate: 75
      },
      {
        id: 'rec2',
        type: 'content_placement',
        title: 'Move Table Placement',
        description: 'Move Table 3 to better support content in Section 2.3.',
        suggestedChanges: [{
          action: 'move' as const,
          targetLocation: 'ch2-2',
          content: 'Table 3: Summary of Related Studies',
          reason: 'Position table closer to relevant discussion'
        }],
        priority: 'medium',
        confidenceScore: 75,
        estimatedTime: 5,
        effectivenessEstimate: 60
      }
    ],
    citationMap: [],
    sectionProperties: {},
    summary: {
      totalChapters: 3,
      totalSections: 7,
      totalWordCount: 5500,
      averageQuality: 90
    }
  };

  // Load and analyze document structure
  useEffect(() => {
    if (documentContent) {
      analyzeStructure();
    }
  }, [documentContent]);

  const analyzeStructure = async () => {
    setIsAnalyzing(true);
    // In a real implementation, this would call an API to analyze the document structure
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setStructure(mockStructure);
      setAnalysisResult(mockAnalysisResult);
      toast.success('Thesis structure analyzed successfully!');
    } catch (error) {
      console.error('Error analyzing structure:', error);
      toast.error('Failed to analyze document structure');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Filter structure based on search term
  const filteredStructure = useMemo(() => {
    if (!searchTerm) return structure;

    const searchTermLower = searchTerm.toLowerCase();
    
    const filterNodes = (nodes: DocumentTreeNode[]): DocumentTreeNode[] => {
      return nodes
        .map(node => {
          // Check if this node matches the search term
          const matches = 
            node.title.toLowerCase().includes(searchTermLower) ||
            node.contentPreview.toLowerCase().includes(searchTermLower) ||
            node.type.toLowerCase().includes(searchTermLower);
            
          // Filter children
          const filteredChildren = filterNodes(node.children);
          
          // Return node if it matches or has matching children
          if (matches || filteredChildren.length > 0) {
            return {
              ...node,
              children: filteredChildren
            };
          }
          
          return null;
        })
        .filter((node): node is DocumentTreeNode => node !== null);
    };

    return filterNodes(structure || []);
  }, [structure, searchTerm]);

  // Navigate to a section
  const navigateToSection = (sectionId: string) => {
    setSelectedSection(sectionId);
    onNavigateToSection?.(sectionId);
    toast.info(`Navigating to section ${sectionId}`);
  };

  // Get structure statistics
  const getStructureStats = (nodes: DocumentTreeNode[] = structure || []): { 
    totalChapters: number, 
    totalSections: number, 
    totalWords: number 
  } => {
    let chapters = 0;
    let sections = 0;
    let words = 0;

    const traverse = (treeNodes: DocumentTreeNode[]) => {
      for (const node of treeNodes) {
        if (node.type === 'chapter') chapters++;
        if (node.type === 'section' || node.type === 'subsection') sections++;
        words += node.wordCount;
        traverse(node.children);
      }
    };

    traverse(nodes);
    return { totalChapters: chapters, totalSections: sections, totalWords: words };
  };

  const stats = getStructureStats();

  // Render the structure tree
  const renderStructure = (nodes: DocumentTreeNode[], depth = 0) => {
    if (!nodes || nodes.length === 0) return null;

    const indentClass = `ml-${depth * 4}`;

    return (
      <div className={`space-y-1 ${depth > 0 ? 'mt-1' : ''}`}>
        {nodes.map((node) => (
          <div key={node.id} className={indentClass}>
            <div 
              className={`p-2 rounded transition-colors cursor-pointer ${
                selectedSection === node.id 
                  ? 'bg-primary/10 border-l-2 border-primary' 
                  : 'hover:bg-accent hover:border-l-2 hover:border-primary/50'
              }`}
              onClick={() => navigateToSection(node.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {node.type === 'chapter' && <BookOpen className="h-4 w-4 text-blue-500" />}
                  {(node.type === 'section' || node.type === 'subsection') && <GitBranch className="h-4 w-4 text-purple-500" />}
                  {node.type === 'paragraph' && <FileText className="h-4 w-4 text-gray-500" />}
                  <span className={`font-medium ${node.academicScore < 70 ? 'text-red-500' : 'text-foreground'}`}>
                    {node.title}
                  </span>
                  <Badge variant={node.status === 'needs_review' ? 'destructive' : node.status === 'draft' ? 'secondary' : 'outline'} className="text-xs">
                    {node.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Badge variant={node.academicScore >= 90 ? 'default' : node.academicScore >= 70 ? 'secondary' : 'destructive'} className="text-xs">
                      {node.academicScore}/100
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {node.wordCount}w
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1 truncate">
                {node.contentPreview}
              </p>
            </div>
            
            {node.children.length > 0 && (
              <div className="mt-1">
                {renderStructure(node.children, depth + 1)}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              AI-Powered Structure Navigator
            </CardTitle>
            <CardDescription>
              Analyze and navigate your thesis structure with AI-assisted recommendations
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            <Button size="sm" onClick={analyzeStructure} disabled={isAnalyzing}>
              {isAnalyzing ? 'Analyzing...' : 'Re-analyze'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setViewMode(viewMode === 'tree' ? 'linear' : viewMode === 'linear' ? 'flow' : 'tree')}>
              {viewMode === 'tree' ? 'Linear' : viewMode === 'linear' ? 'Flow' : 'Tree'} View
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Structure Statistics */}
          {structure && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-2xl font-bold">{stats.totalChapters}</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">Chapters</p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-2xl font-bold">{stats.totalSections}</p>
                <p className="text-sm text-purple-700 dark:text-purple-300">Sections</p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-2xl font-bold">{stats.totalWords.toLocaleString()}</p>
                <p className="text-sm text-green-700 dark:text-green-300">Total Words</p>
              </div>
            </div>
          )}
          
          {/* Search and Controls */}
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sections by title or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setZoomLevel(prev => Math.max(0.8, prev - 0.1))}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setZoomLevel(prev => Math.min(1.5, prev + 0.1))}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Select value={viewMode} onValueChange={(value: 'tree' | 'linear' | 'flow') => setViewMode(value as any)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tree">Tree View</SelectItem>
                  <SelectItem value="linear">Linear View</SelectItem>
                  <SelectItem value="flow">Flow View</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Structure Visualization */}
          <div 
            className="border rounded-lg p-4 bg-muted/30 min-h-[200px] max-h-[600px] overflow-y-auto"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
          >
            {structure ? (
              viewMode === 'tree' ? (
                renderStructure(filteredStructure || [])
              ) : (
                <div className="space-y-4">
                  {filteredStructure?.map((node, index) => (
                    <div key={node.id} className="p-3 border rounded hover:bg-accent cursor-pointer" onClick={() => navigateToSection(node.id)}>
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{node.title}</h4>
                        <Badge variant="outline">{node.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{node.contentPreview}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>{node.wordCount} words</span>
                        <span>Score: {node.academicScore}/100</span>
                        <Badge variant={node.status === 'complete' ? 'default' : node.status === 'draft' ? 'secondary' : 'destructive'}>
                          {node.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg mb-2">No Structure Analyzed</h3>
                <p className="text-muted-foreground mb-4">
                  Analyze your document to visualize its structure and get navigation assistance
                </p>
                <Button onClick={analyzeStructure}>
                  Analyze Document Structure
                </Button>
              </div>
            )}
          </div>
          
          {/* AI Recommendations */}
          {analysisResult?.recommendations && analysisResult.recommendations.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-5 w-5 text-primary" />
                <h3 className="font-medium">AI Recommendations</h3>
                <Badge variant="secondary">{analysisResult.recommendations.length} suggestions</Badge>
              </div>
              
              <div className="space-y-3">
                {analysisResult.recommendations.map((rec) => (
                  <Card key={rec.id} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${
                          rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                          rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {rec.priority === 'high' ? <AlertTriangle className="h-4 w-4" /> :
                           rec.priority === 'medium' ? <Target className="h-4 w-4" /> :
                           <CheckCircle className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{rec.title}</h4>
                            <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'secondary' : 'outline'}>
                              {rec.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                          <div className="flex gap-2 mt-3">
                            <Button size="sm">Apply</Button>
                            <Button size="sm" variant="outline">Learn More</Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          
          {/* Quick Navigation */}
          {structure && (
            <div>
              <h3 className="font-medium flex items-center gap-2 mb-3">
                <Navigation className="h-4 w-4" />
                Quick Navigation
              </h3>
              <div className="flex flex-wrap gap-2">
                {structure.map((chapter) => (
                  <Button
                    key={chapter.id}
                    variant={selectedSection === chapter.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => navigateToSection(chapter.id)}
                  >
                    {chapter.title}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ThesisStructureNavigator;