'use client';

import React from 'react';
import { Paper } from '@/types/paper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Heart,
  Download,
  ExternalLink,
  FileText,
  Calendar,
  Users,
  Quote,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaperListViewProps {
  papers: Paper[];
  isLoading?: boolean;
  onPaperSelect?: (paper: Paper) => void;
  onFavoriteToggle?: (paperId: string) => void;
  favorites?: Set<string>;
  onDownloadPDF?: (paper: Paper) => void;
}

export function PaperListView({
  papers,
  isLoading = false,
  onPaperSelect,
  onFavoriteToggle,
  favorites = new Set(),
  onDownloadPDF,
}: PaperListViewProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-lg bg-muted"
          />
        ))}
      </div>
    );
  }

  if (papers.length === 0) {
    return (
      <Card className="p-8 text-center">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
        <p className="mt-4 text-muted-foreground">
          No papers found. Try adjusting your search or filters.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {papers.map((paper) => (
        <PaperListItem
          key={paper.id}
          paper={paper}
          isFavorite={favorites.has(paper.id)}
          onSelect={onPaperSelect}
          onFavoriteToggle={onFavoriteToggle}
          onDownloadPDF={onDownloadPDF}
        />
      ))}
    </div>
  );
}

/**
 * Get the URL for a paper based on its source and ID
 */
function getPaperUrl(paper: Paper): string | undefined {
  // If we already have a URL from metadata, use that
  if (paper.metadata.url) {
    return paper.metadata.url;
  }

  // Construct URLs based on source IDs
  if (paper.sourceIds.doi) {
    return `https://doi.org/${paper.sourceIds.doi}`;
  }

  if (paper.sourceIds.arxivId) {
    // Check if it's already a full arXiv URL
    if (paper.sourceIds.arxivId.startsWith('http')) {
      return paper.sourceIds.arxivId;
    }
    // Otherwise, construct the URL
    const cleanArxivId = paper.sourceIds.arxivId.replace('arxiv:', '').replace('http://arxiv.org/abs/', '').replace('https://arxiv.org/abs/', '');
    return `https://arxiv.org/abs/${cleanArxivId}`;
  }

  if (paper.sourceIds.openAlexId) {
    // Check if OpenAlex ID is already a full URL
    if (paper.sourceIds.openAlexId.startsWith('http')) {
      return paper.sourceIds.openAlexId;
    }
    // Otherwise, construct the URL
    const cleanOpenAlexId = paper.sourceIds.openAlexId.replace('https://openalex.org/', '');
    return `https://openalex.org/${cleanOpenAlexId}`;
  }

  if (paper.sourceIds.semanticScholarId) {
    return `https://www.semanticscholar.org/paper/${paper.sourceIds.semanticScholarId}`;
  }

  // Fallback: try to construct from title (not ideal, but sometimes used)
  let titleString = '';
  if (paper.title) {
    if (Array.isArray(paper.title)) {
      titleString = paper.title[0] || '';
    } else {
      titleString = paper.title;
    }
  }

  if (titleString) {
    const encodedTitle = encodeURIComponent(titleString.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-'));
    return `https://scholar.google.com/scholar?q=${encodedTitle}`;
  }

  return undefined;
}

interface PaperListItemProps {
  paper: Paper;
  isFavorite?: boolean;
  onSelect?: (paper: Paper) => void;
  onFavoriteToggle?: (paperId: string) => void;
  onDownloadPDF?: (paper: Paper) => void;
}

function PaperListItem({
  paper,
  isFavorite = false,
  onSelect,
  onFavoriteToggle,
  onDownloadPDF,
}: PaperListItemProps) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <div className="p-4">
        {/* Title */}
        <h3
          onClick={() => onSelect?.(paper)}
          className="mb-2 cursor-pointer text-lg font-semibold hover:text-primary"
        >
          {Array.isArray(paper.title) ? (paper.title[0] || 'Untitled') : (paper.title || 'Untitled')}
        </h3>

        {/* Abstract, Semantic Scholar TL;DR, or Generated Summary */}
        {(paper.abstract || paper.s2Tldr || paper.generatedSummary) && (
          <p className="mb-3 line-clamp-3 text-sm text-muted-foreground">
            {paper.abstract || paper.s2Tldr || paper.generatedSummary}
          </p>
        )}

        {/* Metadata */}
        <div className="mb-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {paper.year && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {paper.year}
            </div>
          )}
          {paper.authors.length > 0 && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {paper.authors.slice(0, 2).map((a) => a.name).join(', ')}
              {paper.authors.length > 2 && ` +${paper.authors.length - 2}`}
            </div>
          )}
          {paper.metadata.citationCount !== undefined && (
            <div className="flex items-center gap-1">
              <Quote className="h-4 w-4" />
              {paper.metadata.citationCount} citations
            </div>
          )}
        </div>

        {/* Sources and Tags */}
        <div className="mb-4 flex flex-wrap gap-2">
          {paper.sources.map((source) => (
            <Badge key={source} variant="secondary" className="text-xs">
              {source}
            </Badge>
          ))}
          {paper.metadata.isOpenAccess && (
            <Badge variant="default" className="bg-green-600 text-xs">
              Open Access
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onFavoriteToggle?.(paper.id)}
            className={cn(
              'gap-2',
              isFavorite && 'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700'
            )}
          >
            <Heart
              className={cn('h-4 w-4', isFavorite && 'fill-current')}
            />
            {isFavorite ? 'Saved' : 'Save'}
          </Button>

          {paper.metadata.pdfUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownloadPDF?.(paper)}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              PDF
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelect?.(paper)}
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Explore
          </Button>
          {(paper.metadata.url || getPaperUrl(paper)) && (
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <a
                href={paper.metadata.url || getPaperUrl(paper)}
                target="_blank"
                rel="noopener noreferrer"
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View
              </a>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
