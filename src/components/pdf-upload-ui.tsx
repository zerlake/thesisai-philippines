import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Upload, 
  FileText, 
  X, 
  FolderPlus, 
  Check, 
  Loader2,
  AlertCircle,
  ExternalLink,
  Trash2,
  Edit3,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';

interface PDFUploadUIProps {
  onPDFUpload: (files: File[]) => void;
  onCollectionCreate: (name: string, description?: string) => void;
  onCollectionSelect: (collectionId: string) => void;
  collections: any[];
  selectedCollection: string | null;
  uploadingFiles: boolean;
  uploadProgress: number;
}

const PDFUploadUI: React.FC<PDFUploadUIProps> = ({
  onPDFUpload,
  onCollectionCreate,
  onCollectionSelect,
  collections,
  selectedCollection,
  uploadingFiles,
  uploadProgress
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');
  const [showCollectionForm, setShowCollectionForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // Handle drop event
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf');
      if (files.length > 0) {
        onPDFUpload(files);
      } else {
        toast.error('Please upload only PDF files');
      }
    }
  }, [onPDFUpload]);

  // Handle file input change
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).filter(file => file.type === 'application/pdf');
      if (files.length > 0) {
        onPDFUpload(files);
      } else {
        toast.error('Please upload only PDF files');
      }
    }
  };

  // Create a new collection
  const handleCreateCollection = () => {
    if (!newCollectionName.trim()) {
      toast.error('Please enter a collection name');
      return;
    }

    onCollectionCreate(newCollectionName, newCollectionDescription);
    setNewCollectionName('');
    setNewCollectionDescription('');
    setShowCollectionForm(false);
    toast.success('Collection created successfully');
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Research Papers
          </CardTitle>
          <CardDescription>
            Drag and drop PDF files here or click to browse your device
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div 
            className={`relative p-8 text-center rounded-lg transition-colors ${
              dragActive 
                ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500' 
                : 'bg-gray-50 dark:bg-gray-800/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-medium">Drop your research papers here</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Supports PDF files with text content
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Browse Files
              </Button>
              <Input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
            
            {uploadingFiles && (
              <div className="mt-4 space-y-2">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Processing... {uploadProgress}%
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Collections Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FolderPlus className="h-5 w-5" />
                Research Paper Collections
              </CardTitle>
              <CardDescription>
                Organize your uploaded papers into collections for different research purposes
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowCollectionForm(!showCollectionForm)}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              New Collection
            </Button>
          </div>
        </CardHeader>
        
        {showCollectionForm && (
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="space-y-4">
              <div>
                <Label htmlFor="collectionName">Collection Name</Label>
                <Input
                  id="collectionName"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="e.g., Literature Review Papers, Chapter 2 Sources"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="collectionDescription">Description (Optional)</Label>
                <Input
                  id="collectionDescription"
                  value={newCollectionDescription}
                  onChange={(e) => setNewCollectionDescription(e.target.value)}
                  placeholder="Brief description of this collection"
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateCollection} className="gap-2">
                  <Check className="h-4 w-4" />
                  Create Collection
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowCollectionForm(false);
                    setNewCollectionName('');
                    setNewCollectionDescription('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <CardContent>
          {collections.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <FolderPlus className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="mt-2 text-sm font-medium">No collections yet</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Create your first collection to organize research papers.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {collections.map((collection) => (
                <div 
                  key={collection.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedCollection === collection.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => onCollectionSelect(collection.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{collection.name}</h3>
                      {collection.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                          {collection.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 ml-2">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {collection.paperCount || 0} papers
                      </Badge>
                      {collection.lastUpdated && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Updated {new Date(collection.lastUpdated).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {selectedCollection === collection.id && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  
                  {collection.papers && collection.papers.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {collection.papers.slice(0, 3).map((paper: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <FileText className="h-3 w-3 text-gray-400" />
                          <span className="truncate">{paper.title || paper.fileName}</span>
                        </div>
                      ))}
                      {collection.papers.length > 3 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          +{collection.papers.length - 3} more papers
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFUploadUI;