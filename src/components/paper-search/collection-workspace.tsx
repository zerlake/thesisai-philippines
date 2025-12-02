'use client';

import React, { useState, useEffect } from 'react';
import { Paper } from '@/types/paper';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { openPaper } from '@/lib/paper-open-handler';
import { 
  Plus, 
  Search, 
  Filter, 
  Tags, 
  Trash2, 
  ExternalLink,
  Folder,
  Palette,
  Calendar,
  Bookmark
} from 'lucide-react';

interface Collection {
  id: string;
  name: string;
  description?: string;
  papers: Paper[];
  color: string; // For visual identification
  createdAt: Date;
  updatedAt: Date;
}

interface CollectionWorkspaceProps {
  collections: Collection[];
  onCollectionsChange: (collections: Collection[]) => void;
  papers: Paper[];
  onPaperSelect: (paper: Paper) => void;
  className?: string;
}

export function CollectionWorkspace({
  collections,
  onCollectionsChange,
  papers,
  onPaperSelect,
  className = ''
}: CollectionWorkspaceProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedColor, setSelectedColor] = useState('blue');
  const [showFilters, setShowFilters] = useState(false);
  
  // Color options for collections
  const colorOptions = [
    { name: 'Blue', value: 'blue', class: 'bg-blue-100 border-blue-300' },
    { name: 'Green', value: 'green', class: 'bg-green-100 border-green-300' },
    { name: 'Purple', value: 'purple', class: 'bg-purple-100 border-purple-300' },
    { name: 'Red', value: 'red', class: 'bg-red-100 border-red-300' },
    { name: 'Yellow', value: 'yellow', class: 'bg-yellow-100 border-yellow-300' },
    { name: 'Indigo', value: 'indigo', class: 'bg-indigo-100 border-indigo-300' },
  ];

  // Create a new collection
  const createCollection = () => {
    if (!newCollectionName.trim()) return;

    const newCollection: Collection = {
      id: `collection_${Date.now()}`,
      name: newCollectionName.trim(),
      papers: [],
      color: selectedColor,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    onCollectionsChange([...collections, newCollection]);
    setNewCollectionName('');
    setSelectedColor('blue');
    setShowCreateDialog(false);
  };

  // Add paper to collection
  const addToCollection = (paper: Paper, collectionId: string) => {
    const updatedCollections = collections.map(col => {
      if (col.id === collectionId) {
        // Check if paper is already in collection
        if (col.papers.some(p => p.id === paper.id)) {
          return col;
        }
        
        return {
          ...col,
          papers: [...col.papers, paper],
          updatedAt: new Date()
        };
      }
      return col;
    });
    
    onCollectionsChange(updatedCollections);
  };

  // Remove paper from collection
  const removeFromCollection = (paperId: string, collectionId: string) => {
    const updatedCollections = collections.map(col => {
      if (col.id === collectionId) {
        return {
          ...col,
          papers: col.papers.filter(p => p.id !== paperId),
          updatedAt: new Date()
        };
      }
      return col;
    });
    
    onCollectionsChange(updatedCollections);
  };

  // Delete collection
  const deleteCollection = (collectionId: string) => {
    const updatedCollections = collections.filter(col => col.id !== collectionId);
    onCollectionsChange(updatedCollections);
    
    if (selectedCollection === collectionId) {
      setSelectedCollection(null);
    }
  };

  // Get all unique tags from papers in collections
  const getAllTags = () => {
    const allTags = new Set<string>();
    collections.forEach(col => {
      col.papers.forEach(paper => {
        if (paper.metadata.tags) {
          paper.metadata.tags.forEach(tag => allTags.add(tag));
        }
      });
    });
    return Array.from(allTags);
  };

  // Filter papers based on search and collection
  const filteredPapers = () => {
    let filtered = papers;
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(paper => 
        (Array.isArray(paper.title) ? (paper.title[0] || 'Untitled') : (paper.title || 'Untitled')).toLowerCase().includes(term) ||
        (paper.abstract && paper.abstract.toLowerCase().includes(term)) ||
        paper.authors.some(author => author.name.toLowerCase().includes(term))
      );
    }

    // Filter by selected collection
    if (selectedCollection) {
      const collection = collections.find(col => col.id === selectedCollection);
      if (collection) {
        filtered = collection.papers;
      }
    }

    return filtered;
  };

  const filteredPapersList = filteredPapers();
  const allTags = getAllTags();

  // Get collection color class
  const getColorClass = (color: string) => {
    const colorOption = colorOptions.find(opt => opt.value === color);
    return colorOption ? colorOption.class : 'bg-gray-100 border-gray-300';
  };

  return (
    <div className={className}>
      {/* Header with search and collection controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search papers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedCollection || 'all'} onValueChange={(value) => setSelectedCollection(value === 'all' ? null : value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by collection" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Collections</SelectItem>
              {collections.map(collection => (
                <SelectItem key={collection.id} value={collection.id}>
                  {collection.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Collection
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Collection</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Input
                  placeholder="Collection name"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                />
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Color</label>
                  <div className="flex gap-2">
                    {colorOptions.map(color => (
                      <button
                        key={color.value}
                        className={`h-8 w-8 rounded-full border-2 ${color.class} ${selectedColor === color.value ? 'ring-2 ring-offset-2' : ''}`}
                        onClick={() => setSelectedColor(color.value)}
                        aria-label={color.name}
                      />
                    ))}
                  </div>
                </div>
                
                <Button onClick={createCollection} className="w-full">
                  Create Collection
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <Card className="p-4 mb-6">
          <h3 className="font-semibold mb-3">Advanced Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tags</label>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Year Range</label>
              <div className="flex gap-2">
                <Input type="number" placeholder="From" className="w-24" />
                <Input type="number" placeholder="To" className="w-24" />
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Collections sidebar */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Collections
          </h3>
          
          <div className="space-y-3">
            {collections.map(collection => {
              const colorClass = getColorClass(collection.color);
              return (
                <Card 
                  key={collection.id} 
                  className={`p-4 cursor-pointer border-l-4 ${colorClass} transition-all hover:shadow-md ${
                    selectedCollection === collection.id ? 'ring-2 ring-ring' : ''
                  }`}
                  onClick={() => setSelectedCollection(collection.id === selectedCollection ? null : collection.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{collection.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {collection.papers.length} papers
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {collection.updatedAt.toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteCollection(collection.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {collection.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {collection.description}
                    </p>
                  )}
                </Card>
              );
            })}
            
            {collections.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Folder className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No collections yet</p>
                <p className="text-sm">Create your first collection to organize papers</p>
              </div>
            )}
          </div>
        </div>

        {/* Papers list */}
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {selectedCollection 
                ? collections.find(c => c.id === selectedCollection)?.name || 'Papers'
                : 'All Papers'
              }
            </h3>
            <div className="text-sm text-muted-foreground">
              {filteredPapersList.length} papers
            </div>
          </div>
          
          <div className="space-y-4">
            {filteredPapersList.map(paper => {
              // Find which collections this paper is in
              const paperCollections = collections.filter(col => 
                col.papers.some(p => p.id === paper.id)
              );
              
              return (
                <Card key={paper.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between">
                    <div className="flex-1">
                      <h4 
                        className="font-medium cursor-pointer hover:text-primary mb-2"
                        onClick={() => onPaperSelect(paper)}
                      >
                        {Array.isArray(paper.title) ? (paper.title[0] || 'Untitled') : (paper.title || 'Untitled')}
                      </h4>
                      
                      <div className="text-sm text-muted-foreground mb-2">
                        {paper.authors.slice(0, 3).map(a => a.name).join(', ')}
                        {paper.authors.length > 3 && ` +${paper.authors.length - 3}`}
                        {paper.year && `, ${paper.year}`}
                      </div>
                      
                      {paper.abstract && (
                        <p className="text-sm line-clamp-2 mb-2">
                          {paper.abstract}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {paperCollections.map(col => {
                          const colorClass = getColorClass(col.color);
                          return (
                            <Badge key={col.id} variant="secondary" className={`text-xs ${colorClass}`}>
                              {col.name}
                            </Badge>
                          );
                        })}
                        
                        {paper.metadata.isOpenAccess && (
                          <Badge variant="default" className="bg-green-600 text-xs">
                            Open Access
                          </Badge>
                        )}
                        
                        {paper.metadata.citationCount !== undefined && (
                          <Badge variant="outline" className="text-xs">
                            {paper.metadata.citationCount} citations
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      {collections.map(collection => {
                        const isInCollection = collection.papers.some(p => p.id === paper.id);
                        return (
                          <Button
                            key={`${collection.id}-${paper.id}`}
                            variant={isInCollection ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              if (isInCollection) {
                                removeFromCollection(paper.id, collection.id);
                              } else {
                                addToCollection(paper, collection.id);
                              }
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <Bookmark className={`h-4 w-4 ${isInCollection ? 'fill-current' : ''}`} />
                          </Button>
                        );
                      })}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openPaper(paper, (message) => toast.error(message))}
                        className="h-8 w-8 p-0"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
            
            {filteredPapersList.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No papers found</p>
                <p className="text-sm">
                  {searchTerm 
                    ? "Try a different search term" 
                    : selectedCollection 
                      ? "Add papers to this collection" 
                      : "Try searching for papers to get started"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}