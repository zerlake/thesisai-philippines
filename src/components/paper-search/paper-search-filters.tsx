'use client';

import React, { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { PaperSearchQuery } from '@/types/paper';
import { cn } from '@/lib/utils';

interface PaperSearchFiltersProps {
  onFiltersChange: (filters: PaperSearchQuery['filters']) => void;
  isExpanded?: boolean;
  onExpandChange?: (expanded: boolean) => void;
}

const SOURCES = [
  { id: 'crossref', label: 'CrossRef' },
  { id: 'arxiv', label: 'ArXiv' },
  { id: 'openalex', label: 'OpenAlex' },
  { id: 'semantic_scholar', label: 'Semantic Scholar' },
] as const;

const CURRENT_YEAR = new Date().getFullYear();

export function PaperSearchFilters({
  onFiltersChange,
  isExpanded = false,
  onExpandChange,
}: PaperSearchFiltersProps) {
  const [expanded, setExpanded] = useState(isExpanded);
  const [minYear, setMinYear] = useState<number>(2010);
  const [maxYear, setMaxYear] = useState<number>(CURRENT_YEAR);
  const [minCitations, setMinCitations] = useState<number>(0);
  const [sources, setSources] = useState<Set<string>>(
    new Set(['crossref', 'arxiv', 'openalex', 'semantic_scholar'])
  );
  const [openAccessOnly, setOpenAccessOnly] = useState(false);

  const handleExpandChange = (newExpanded: boolean) => {
    setExpanded(newExpanded);
    onExpandChange?.(newExpanded);
  };

  const handleSourceChange = (sourceId: string) => {
    const newSources = new Set(sources);
    if (newSources.has(sourceId)) {
      newSources.delete(sourceId);
    } else {
      newSources.add(sourceId);
    }
    setSources(newSources);
    updateFilters({
      minYear,
      maxYear,
      minCitations,
      sources: Array.from(newSources) as ('crossref' | 'arxiv' | 'openalex' | 'semantic_scholar')[],
      isOpenAccessOnly: openAccessOnly,
    });
  };

  const handleOpenAccessChange = () => {
    const newOpenAccessOnly = !openAccessOnly;
    setOpenAccessOnly(newOpenAccessOnly);
    updateFilters({
      minYear,
      maxYear,
      minCitations,
      sources: Array.from(sources) as ('crossref' | 'arxiv' | 'openalex' | 'semantic_scholar')[],
      isOpenAccessOnly: newOpenAccessOnly,
    });
  };

  const handleYearRangeChange = (newRange: [number, number]) => {
    setMinYear(newRange[0]);
    setMaxYear(newRange[1]);
    updateFilters({
      minYear: newRange[0],
      maxYear: newRange[1],
      minCitations,
      sources: Array.from(sources) as ('crossref' | 'arxiv' | 'openalex' | 'semantic_scholar')[],
      isOpenAccessOnly: openAccessOnly,
    });
  };

  const handleCitationsChange = (value: number[]) => {
    setMinCitations(value[0]);
    updateFilters({
      minYear,
      maxYear,
      minCitations: value[0],
      sources: Array.from(sources) as ('crossref' | 'arxiv' | 'openalex' | 'semantic_scholar')[],
      isOpenAccessOnly: openAccessOnly,
    });
  };

  const updateFilters = (filters: PaperSearchQuery['filters']) => {
    onFiltersChange(filters);
  };

  const clearFilters = () => {
    setMinYear(2010);
    setMaxYear(CURRENT_YEAR);
    setMinCitations(0);
    setSources(new Set(['crossref', 'arxiv', 'openalex', 'semantic_scholar']));
    setOpenAccessOnly(false);
    onFiltersChange({
      minYear: 2010,
      maxYear: CURRENT_YEAR,
      minCitations: 0,
      sources: ['crossref', 'arxiv', 'openalex', 'semantic_scholar'],
      isOpenAccessOnly: false,
    });
  };

  const hasActiveFilters =
    minYear > 2010 ||
    maxYear < CURRENT_YEAR ||
    minCitations > 0 ||
    sources.size < 4 ||
    openAccessOnly;

  return (
    <Card className="w-full">
      <div className="p-4">
        <button
          onClick={() => handleExpandChange(!expanded)}
          className="flex w-full items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <span className="font-medium">Filters</span>
            {hasActiveFilters && (
              <span className="inline-flex items-center justify-center rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                {[
                  minYear > 2010 || maxYear < CURRENT_YEAR ? 1 : 0,
                  minCitations > 0 ? 1 : 0,
                  sources.size < 4 ? 1 : 0,
                  openAccessOnly ? 1 : 0,
                ].reduce((a, b) => a + b, 0)}
              </span>
            )}
          </div>
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform',
              expanded && 'rotate-180'
            )}
          />
        </button>

        {expanded && (
          <div className="mt-4 space-y-4 border-t pt-4">
            {/* Year Range */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Year Range</Label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Slider
                    min={2000}
                    max={CURRENT_YEAR}
                    step={1}
                    value={[minYear, maxYear]}
                    onValueChange={handleYearRangeChange}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{minYear}</span>
                <span>{maxYear}</span>
              </div>
            </div>

            {/* Citation Count */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Minimum Citations</Label>
              <Slider
                min={0}
                max={1000}
                step={10}
                value={[minCitations]}
                onValueChange={handleCitationsChange}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground">{minCitations} citations</div>
            </div>

            {/* Sources */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Sources</Label>
              <div className="space-y-2">
                {SOURCES.map((source) => (
                  <div key={source.id} className="flex items-center gap-2">
                    <Checkbox
                      id={source.id}
                      checked={sources.has(source.id)}
                      onCheckedChange={() => handleSourceChange(source.id)}
                    />
                    <label
                      htmlFor={source.id}
                      className="text-sm cursor-pointer"
                    >
                      {source.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Open Access */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="open-access"
                checked={openAccessOnly}
                onCheckedChange={handleOpenAccessChange}
              />
              <label
                htmlFor="open-access"
                className="text-sm cursor-pointer"
              >
                Open Access only
              </label>
            </div>

            {/* Quality Indicators */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Quality Indicators</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="has-abstract"
                    checked={minCitations >= 0}
                    onCheckedChange={(checked) => {
                      setMinCitations(checked ? 0 : -1);
                      updateFilters({
                        minYear,
                        maxYear,
                        minCitations: checked ? 0 : -1,
                        sources: Array.from(sources) as ('crossref' | 'arxiv' | 'openalex' | 'semantic_scholar')[],
                        isOpenAccessOnly: openAccessOnly,
                      });
                    }}
                  />
                  <label
                    htmlFor="has-abstract"
                    className="text-sm cursor-pointer"
                  >
                    Has Abstract
                  </label>
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="w-full"
              >
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
