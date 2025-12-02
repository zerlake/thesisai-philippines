'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { puterAISearchService } from '@/lib/puter-ai-search';
import { PaperSearchQuery } from '@/types/paper';
import { toast } from 'sonner';

interface PaperSearchBarProps {
  onSearch: (query: string) => void;
  onAISearch?: (results: any) => void;
  isLoading?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  filters?: PaperSearchQuery['filters'];
}

export function PaperSearchBar({
  onSearch,
  onAISearch,
  isLoading = false,
  placeholder = 'Search papers by title, author, DOI...',
  value = '',
  onChange,
  filters,
}: PaperSearchBarProps) {
  const [query, setQuery] = useState(value);
  const [isAISearching, setIsAISearching] = useState(false);
  const [puterAvailable, setPuterAvailable] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Check if Puter is available on mount
  useEffect(() => {
    const checkPuter = async () => {
      const initialized = await puterAISearchService.initialize();
      setPuterAvailable(initialized);
      if (!initialized) {
        console.log('[PaperSearch] Puter AI not available - using standard search');
      }
    };
    checkPuter();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    onChange?.(newValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  const handleAISearch = async () => {
    if (!query.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    if (!puterAvailable) {
      toast.error('Puter AI is not available. Using standard search instead.');
      onSearch(query);
      return;
    }

    setIsAISearching(true);
    try {
      console.log('[PaperSearch] Starting AI search:', query);
      console.log('[PaperSearch] Applying filters:', filters);
      
      // Check URL for test mode: ?test=true
      const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
      const testMode = params.get('test') === 'true';
      
      const results = await puterAISearchService.searchWithAI(query, filters, testMode);
      console.log('[PaperSearch] AI search results:', results);

      if (onAISearch) {
        onAISearch(results);
      } else {
        onSearch(query);
      }

      if (results.papers.length > 0) {
        toast.success(`Found ${results.papers.length} papers with AI search`);
      } else if (results.error) {
        // MCP connection error
        toast.error(`Search service unavailable: ${results.error}`);
      } else {
        // No papers found (but service was OK)
        toast.info('No papers found. Try a different search query.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'AI search failed';
      console.error('[PaperSearch] AI search error:', error);
      toast.error(`Search error: ${errorMessage}`);

      // Fallback to standard search
      onSearch(query);
    } finally {
      setIsAISearching(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    onChange?.('');
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={handleChange}
            disabled={isLoading || isAISearching}
            className="pl-10 pr-10"
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* AI Search Button (Primary) - now will submit regular search when AI unavailable */}
        <Button
          type="button"
          onClick={handleAISearch}
          disabled={isAISearching || isLoading || !query.trim()}
          className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          title={puterAvailable ? 'Search with AI' : 'Puter AI not available'}
        >
          {isAISearching ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="hidden sm:inline">AI Searching...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">AI Search</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
