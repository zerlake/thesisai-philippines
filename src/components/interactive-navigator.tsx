import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  GitBranch, 
  Navigation, 
  Search,
  FileText,
  Target,
  CheckCircle,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';
import { DocumentTreeNode } from '@/types/thesis-structure';

interface InteractiveNavigatorProps {
  structure: DocumentTreeNode[];
  onNavigateToSection: (sectionId: string) => void;
  currentSectionId?: string;
  expandedSections?: string[];
  onToggleExpand?: (sectionId: string) => void;
}

const InteractiveNavigator: React.FC<InteractiveNavigatorProps> = ({
  structure,
  onNavigateToSection,
  currentSectionId,
  expandedSections = [],
  onToggleExpand
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'tree' | 'linear' | 'flow'>('tree');
  const [activeSection, setActiveSection] = useState<string | null>(currentSectionId || null);
  
  // Filter structure based on search term
  const filteredStructure = useMemo(() => {
    if (!searchTerm) return structure;
    
    const term = searchTerm.toLowerCase();
    
    const filterNodes = (nodes: DocumentTreeNode[]): DocumentTreeNode[] => {
      return nodes
        .map(node => {
          // Check if this node matches the search term
          const matchesTitle = node.title.toLowerCase().includes(term);
          const matchesContent = node.contentPreview.toLowerCase().includes(term);
          const matchesId = node.id.toLowerCase().includes(term);
          
          // Filter children
          const filteredChildren = filterNodes(node.children);
          
          // Return node if it matches or has matching children
          if (matchesTitle || matchesContent || matchesId || filteredChildren.length > 0) {
            return {
              ...node,
              children: filteredChildren
            };
          }
          
          return null;
        })
        .filter((node): node is DocumentTreeNode => node !== null);
    };
    
    return filterNodes(structure);
  }, [structure, searchTerm]);

  // Calculate overall progress
  const calculateOverallProgress = () => {
    let completed = 0;
    let total = 0;

    const traverse = (nodes: DocumentTreeNode[]) => {
      for (const node of nodes) {
        total++;
        if (node.status === 'complete') completed++;
        traverse(node.children);
      }
    };

    traverse(structure);
    
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  // Render the structure tree
  const renderStructureTree = (nodes: DocumentTreeNode[], depth: number = 0) => {
    return (
      <div className={`pl-${depth * 4} space-y-1`}>
        {nodes.map(node => (
          <div key={node.id} className="border-l-2 border-gray-200 dark:border-gray-700 pl-4">
            <div 
              className={`p-2 rounded cursor-pointer transition-colors flex items-start justify-between ${
                activeSection === node.id 
                  ? 'bg-blue-50 dark:bg-blue-900/30 border-l-2 border-blue-500' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              onClick={() => {
                setActiveSection(node.id);
                onNavigateToSection(node.id);
              }}
              onDoubleClick={() => onToggleExpand?.(node.id)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {node.type === 'chapter' && <BookOpen className="h-4 w-4 text-blue-500" />}
                  {node.type === 'section' && <GitBranch className="h-4 w-4 text-purple-500" />}
                  {node.type === 'subsection' && <GitBranch className="h-4 w-4 text-green-500" />}
                  {node.type !== 'chapter' && node.type !== 'section' && node.type !== 'subsection' && <FileText className="h-4 w-4 text-gray-500" />}
                  <span className={`font-medium ${node.academicScore < 70 ? 'text-red-600 dark:text-red-400' : ''}`}>
                    {node.title}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {node.type}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                  {node.contentPreview.substring(0, 80)}...
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={
                    node.status === 'complete' ? 'default' : 
                    node.status === 'in_progress' ? 'secondary' : 
                    node.status === 'needs_review' ? 'destructive' : 'outline'
                  }
                  className="text-xs"
                >
                  {node.academicScore}/100
                </Badge>
                {node.wordCount > 0 && (
                  <span className="text-xs text-gray-500">{node.wordCount}w</span>
                )}
              </div>
            </div>
            
            {(expandedSections.includes(node.id) || viewMode !== 'tree') && node.children.length > 0 && (
              <div className="mt-1">
                {renderStructureTree(node.children, depth + 1)}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const overallProgress = calculateOverallProgress();

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5" />
              Interactive Thesis Navigator
            </CardTitle>
            <CardDescription>
              Navigate your thesis structure efficiently with AI-powered assistance
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setViewMode('tree')}>
              Tree
            </Button>
            <Button size="sm" variant="outline" onClick={() => setViewMode('linear')}>
              Linear
            </Button>
            <Button size="sm" variant="outline" onClick={() => setViewMode('flow')}>
              Flow
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progress Overview */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Thesis Completion</span>
              <span>{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="w-full" />
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search sections by title or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Structure Navigation */}
          <div className="max-h-[500px] overflow-y-auto border rounded-md p-4 bg-gray-50 dark:bg-gray-800/30">
            {filteredStructure.length > 0 ? (
              renderStructureTree(filteredStructure)
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Search className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p>No sections match your search term</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setActiveSection(null)}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset View
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setViewMode('tree')}
            >
              <Target className="h-4 w-4 mr-2" />
              Structure Map
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setViewMode('flow')}
            >
              <Navigation className="h-4 w-4 mr-2" />
              Reading Path
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractiveNavigator;