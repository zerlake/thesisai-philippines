'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Calendar,
  TrendingUp,
  BookOpen,
  Eye,
  AlertTriangle,
  Filter,
  X
} from 'lucide-react';

interface AdvancedFiltersProps {
  filters: any;
  onFiltersChange: (filters: any) => void;
  className?: string;
}

export function AdvancedFilters({
  filters,
  onFiltersChange,
  className = ''
}: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  const applyFilters = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const resetFilters = () => {
    const resetFilters = {
      minYear: 2000,
      maxYear: new Date().getFullYear(),
      minCitations: 0,
      maxCitations: 1000,
      isOpenAccess: false,
      hasRetraction: false,
      minImpact: 0,
      maxImpact: 10,
      keywords: [],
      excludeKeywords: [],
      sources: [],
      types: []
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Advanced Filters
        </h3>
        <Button variant="outline" size="sm" onClick={resetFilters}>
          Reset
        </Button>
      </div>
      
      <Card className="p-4">
        <div className="space-y-6">
          {/* Year Range */}
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4" />
              Publication Year
            </Label>
            <div className="flex items-center gap-4">
              <Input
                type="number"
                placeholder="From"
                value={localFilters.minYear}
                onChange={(e) => setLocalFilters({
                  ...localFilters,
                  minYear: parseInt(e.target.value) || 2000
                })}
                className="w-24"
              />
              <span>to</span>
              <Input
                type="number"
                placeholder="To"
                value={localFilters.maxYear}
                onChange={(e) => setLocalFilters({
                  ...localFilters,
                  maxYear: parseInt(e.target.value) || new Date().getFullYear()
                })}
                className="w-24"
              />
            </div>
          </div>

          {/* Citation Count */}
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4" />
              Citations
            </Label>
            <Slider
              min={0}
              max={500}
              step={1}
              value={[localFilters.minCitations, localFilters.maxCitations]}
              onValueChange={([min, max]) => setLocalFilters({
                ...localFilters,
                minCitations: min,
                maxCitations: max
              })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{localFilters.minCitations}</span>
              <span>{localFilters.maxCitations}</span>
            </div>
          </div>

          {/* Impact Factor (Simulated) */}
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4" />
              Impact Factor (Simulated)
            </Label>
            <Slider
              min={0}
              max={10}
              step={0.1}
              value={[localFilters.minImpact, localFilters.maxImpact]}
              onValueChange={([min, max]) => setLocalFilters({
                ...localFilters,
                minImpact: min,
                maxImpact: max
              })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{localFilters.minImpact.toFixed(1)}</span>
              <span>{localFilters.maxImpact.toFixed(1)}</span>
            </div>
          </div>

          {/* Boolean Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Checkbox
                  checked={localFilters.isOpenAccess}
                  onCheckedChange={(checked) => setLocalFilters({
                    ...localFilters,
                    isOpenAccess: checked as boolean
                  })}
                />
                <Eye className="h-4 w-4" />
                Open Access Only
              </Label>
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Checkbox
                  checked={localFilters.hasRetraction}
                  onCheckedChange={(checked) => setLocalFilters({
                    ...localFilters,
                    hasRetraction: checked as boolean
                  })}
                />
                <AlertTriangle className="h-4 w-4" />
                Exclude Retractions
              </Label>
            </div>
          </div>

          {/* Keywords */}
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4" />
              Keywords
            </Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {localFilters.keywords.map((keyword: string, index: number) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {keyword}
                  <button 
                    onClick={() => {
                      const newKeywords = [...localFilters.keywords];
                      newKeywords.splice(index, 1);
                      setLocalFilters({
                        ...localFilters,
                        keywords: newKeywords
                      });
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add keyword..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    setLocalFilters({
                      ...localFilters,
                      keywords: [...localFilters.keywords, e.currentTarget.value.trim()]
                    });
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
          </div>

          {/* Exclude Keywords */}
          <div>
            <Label className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4" />
              Exclude Keywords
            </Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {localFilters.excludeKeywords.map((keyword: string, index: number) => (
                <Badge key={index} variant="destructive" className="flex items-center gap-1">
                  {keyword}
                  <button 
                    onClick={() => {
                      const newKeywords = [...localFilters.excludeKeywords];
                      newKeywords.splice(index, 1);
                      setLocalFilters({
                        ...localFilters,
                        excludeKeywords: newKeywords
                      });
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Exclude keyword..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    setLocalFilters({
                      ...localFilters,
                      excludeKeywords: [...localFilters.excludeKeywords, e.currentTarget.value.trim()]
                    });
                    e.currentTarget.value = '';
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <Button onClick={applyFilters} className="flex-1">
            Apply Filters
          </Button>
        </div>
      </Card>
    </div>
  );
}