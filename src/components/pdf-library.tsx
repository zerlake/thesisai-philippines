import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search,
  FileText,
  Tag,
  Calendar,
  User,
  BookOpen,
  ExternalLink,
  Trash2,
  Eye,
  Download,
  Check,
  X
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface PDFLibraryProps {
  papers: any[];
  onPaperSelect: (paperId: string) => void;
  selectedPapers: string[];
  onRemovePaper: (paperId: string) => void;
  onAddToCollection: (paperId: string, collectionId: string) => void;
  collections: any[];
}

interface PaperDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paper: any | null;
}

const PaperDetailsDialog: React.FC<PaperDetailsDialogProps> = ({ 
  open, 
  onOpenChange, 
  paper 
}) => {
  if (!paper) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{paper.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h3 className="font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Authors
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {Array.isArray(paper.authors) ? paper.authors.join(', ') : paper.authors || 'Unknown'}
              </p>
            </div>
            <div>
              <h3 className="font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Published
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {paper.year || 'Unknown'}
              </p>
            </div>
          </div>

          {paper.doi && (
            <div>
              <h3 className="font-medium flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                DOI
              </h3>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1 break-all">
                {paper.doi}
              </p>
            </div>
          )}

          {paper.abstract && (
            <div>
              <h3 className="font-medium">Abstract</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 whitespace-pre-line">
                {paper.abstract}
              </p>
            </div>
          )}

          <div>
            <h3 className="font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Content Preview
            </h3>
            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm max-h-60 overflow-y-auto">
              <p className="text-gray-700 dark:text-gray-300">
                {paper.content ? paper.content.substring(0, 500) + '...' : 'Content not available'}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const PDFLibrary: React.FC<PDFLibraryProps> = ({
  papers,
  onPaperSelect,
  selectedPapers,
  onRemovePaper,
  onAddToCollection,
  collections
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCollection, setFilterCollection] = useState<string | null>(null);
  const [selectedPaperDetails, setSelectedPaperDetails] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Filter papers based on search term and selected collection
  const filteredPapers = papers.filter(paper => {
    const matchesSearch = paper.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         paper.authors?.some((author: string) => 
                           author.toLowerCase().includes(searchTerm.toLowerCase())
                         ) ||
                         paper.abstract?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCollection = !filterCollection || 
                              paper.collections?.includes(filterCollection);
    
    return matchesSearch && matchesCollection;
  });

  const handleViewDetails = (paper: any) => {
    setSelectedPaperDetails(paper);
    setShowDetailsDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Research Paper Library
          </CardTitle>
          <CardDescription>
            Manage and organize your uploaded research papers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search papers by title, author, or abstract..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="w-full sm:w-48">
              <select
                value={filterCollection || ''}
                onChange={(e) => setFilterCollection(e.target.value || null)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 h-10"
              >
                <option value="">All Collections</option>
                {collections.map(collection => (
                  <option key={collection.id} value={collection.id}>
                    {collection.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Paper List */}
          <div className="space-y-3">
            {filteredPapers.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-gray-400" />
                <h3 className="mt-2 text-sm font-medium">No papers found</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Upload some research papers to get started.
                </p>
              </div>
            ) : (
              filteredPapers.map((paper) => {
                const isSelected = selectedPapers.includes(paper.id);
                return (
                  <div 
                    key={paper.id} 
                    className={`border rounded-lg p-4 flex items-start gap-4 transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onPaperSelect(paper.id)}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    
                    <FileText className="h-8 w-8 text-blue-500 mt-0.5" />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium line-clamp-1">{paper.title || 'Untitled Paper'}</h3>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewDetails(paper)}
                            className="h-7 w-7 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => onRemovePaper(paper.id)}
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {Array.isArray(paper.authors) && paper.authors.length > 0 
                          ? paper.authors.join(', ') 
                          : 'Unknown Authors'}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-2 flex-wrap">
                        {paper.year && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Calendar className="h-3 w-3" />
                            {paper.year}
                          </div>
                        )}
                        
                        {paper.collections && paper.collections.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Tag className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                            {paper.collections.map((collectionId: string) => {
                              const collection = collections.find(c => c.id === collectionId);
                              return collection ? (
                                <Badge key={collectionId} variant="secondary" className="text-xs">
                                  {collection.name}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <span>{paper.fileSize ? (paper.fileSize / 1024 / 1024).toFixed(2) + ' MB' : 'N/A'}</span>
                        </div>
                      </div>
                      
                      {paper.abstract && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                          {paper.abstract}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            onAddToCollection(paper.id, e.target.value);
                            toast.success('Paper added to collection');
                          }
                        }}
                        className="text-xs rounded border border-input bg-background px-2 py-1 h-8"
                        defaultValue=""
                      >
                        <option value="">Add to collection</option>
                        {collections.map(collection => (
                          <option key={collection.id} value={collection.id}>
                            {collection.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      <PaperDetailsDialog 
        open={showDetailsDialog} 
        onOpenChange={setShowDetailsDialog} 
        paper={selectedPaperDetails} 
      />
    </div>
  );
};

export default PDFLibrary;