/**
 * React Hook for Paper Search
 * Manages search state, caching, and deduplication
 * Uses direct API implementation (no MCP dependency)
 */

import { useState, useCallback } from 'react';
import { Paper, PaperSearchQuery, PaperSearchResult } from '@/types/paper';
import { directPaperSearchService } from '@/lib/direct-paper-search';
import { generateSamplePapers } from '@/lib/sample-papers-data';

export interface UsePaperSearchState {
  papers: Paper[];
  totalResults: number;
  isLoading: boolean;
  error: string | null;
  query: string;
  hasSearched: boolean;
}

export interface UsePaperSearchOptions {
  debounceMs?: number;
  cacheResults?: boolean;
}

export function usePaperSearch(options?: UsePaperSearchOptions) {
  const [state, setState] = useState<UsePaperSearchState>({
    papers: [],
    totalResults: 0,
    isLoading: false,
    error: null,
    query: '',
    hasSearched: false,
  });

  const [filters, setFilters] = useState<PaperSearchQuery['filters']>();
  const debounceMs = options?.debounceMs || 300;
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  /**
   * Execute paper search with fallback to sample data
   */
  const search = useCallback(
    async (query: string, searchFilters?: PaperSearchQuery['filters']) => {
      if (!query.trim()) {
        setState((prev) => ({
          ...prev,
          papers: [],
          totalResults: 0,
          query: '',
          hasSearched: false,
        }));
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const searchQuery: PaperSearchQuery = {
          query,
          maxResults: 50,
          filters: searchFilters,
        };

        try {
          // Try server-side API first (avoids CORS issues)
          const response = await fetch('/api/papers/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(searchQuery),
          });

          if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
          }

          const result = await response.json();

          setState((prev) => ({
            ...prev,
            papers: result.papers,
            totalResults: result.totalResults,
            query: result.query,
            isLoading: false,
            hasSearched: true,
          }));
        } catch (apiError) {
          // Fallback to sample data
          console.warn('[PaperSearch] API search failed, using sample data:', apiError);
          const samplePapers = generateSamplePapers(10, query);

          setState((prev) => ({
            ...prev,
            papers: samplePapers as any,
            totalResults: samplePapers.length,
            query,
            isLoading: false,
            hasSearched: true,
            error: 'Using sample data (search service unavailable)',
          }));
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to search papers';
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
          hasSearched: true,
        }));
      }
    },
    []
  );

  /**
   * Debounced search - useful for search input
   */
  const debouncedSearch = useCallback(
    (query: string, searchFilters?: PaperSearchQuery['filters']) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      const timer = setTimeout(() => {
        search(query, searchFilters);
      }, debounceMs);

      setDebounceTimer(timer);

      return () => clearTimeout(timer);
    },
    [search, debounceMs, debounceTimer]
  );

  /**
   * Filter papers by multiple criteria
   */
  const filterPapers = useCallback(
    (filterFn: (paper: Paper) => boolean): Paper[] => {
      return state.papers.filter(filterFn);
    },
    [state.papers]
  );

  /**
   * Sort papers
   */
  const sortPapers = useCallback(
    (sortFn: (a: Paper, b: Paper) => number): Paper[] => {
      return [...state.papers].sort(sortFn);
    },
    [state.papers]
  );

  /**
   * Get paper by ID
   */
  const getPaperById = useCallback(
    (id: string): Paper | undefined => {
      return state.papers.find((p) => p.id === id);
    },
    [state.papers]
  );

  /**
   * Clear search
   */
  const clearSearch = useCallback(() => {
    setState({
      papers: [],
      totalResults: 0,
      isLoading: false,
      error: null,
      query: '',
      hasSearched: false,
    });
    setFilters(undefined);
  }, []);

  /**
   * Update filters and re-search
   */
  const updateFilters = useCallback(
    (newFilters: PaperSearchQuery['filters']) => {
      setFilters(newFilters);
      if (state.query) {
        search(state.query, newFilters);
      }
    },
    [state.query, search]
  );

  /**
   * Set papers directly (used for AI search results)
   */
  const setPapers = useCallback((papers: Paper[], query: string) => {
    setState((prev) => ({
      ...prev,
      papers,
      totalResults: papers.length,
      query,
      isLoading: false,
      hasSearched: true,
      error: null,
    }));
  }, []);

  return {
    // State
    papers: state.papers,
    totalResults: state.totalResults,
    isLoading: state.isLoading,
    error: state.error,
    query: state.query,
    hasSearched: state.hasSearched,
    filters,

    // Methods
    search,
    debouncedSearch,
    filterPapers,
    sortPapers,
    getPaperById,
    clearSearch,
    updateFilters,
    setPapers,
  };
}

/**
 * Hook for managing a single paper's related papers
 */
export function useRelatedPapers(paper: Paper | null) {
  const [relatedPapers, setRelatedPapers] = useState<Paper[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Find similar papers by title
   */
  const findSimilar = useCallback(async () => {
    if (!paper) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await directPaperSearchService.search({
        query: `${paper.title}`,
        maxResults: 10,
      });

      // Filter out the original paper
      setRelatedPapers(result.papers.filter((p) => p.id !== paper.id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to find similar papers';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [paper]);

  /**
   * Find papers by author
   */
  const findByAuthor = useCallback(
    async (authorName: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await directPaperSearchService.search({
          query: `author:${authorName}`,
          maxResults: 20,
        });

        setRelatedPapers(result.papers);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to find papers by author';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Find papers by year range
   */
  const findByYearRange = useCallback(
    async (minYear: number, maxYear: number) => {
      if (!paper) return;

      setIsLoading(true);
      setError(null);

      try {
        const result = await directPaperSearchService.search({
          query: paper.title,
          maxResults: 20,
          filters: {
            minYear,
            maxYear,
          },
        });

        setRelatedPapers(result.papers.filter((p) => p.id !== paper.id));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to find papers by year';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [paper]
  );

  return {
    relatedPapers,
    isLoading,
    error,
    findSimilar,
    findByAuthor,
    findByYearRange,
  };
}

/**
 * Hook for managing paper collections
 */
export function usePaperCollection() {
  const [collection, setCollection] = useState<Paper[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const addToCollection = useCallback((paper: Paper) => {
    setCollection((prev) => {
      // Check if already exists
      if (prev.some((p) => p.id === paper.id)) {
        return prev;
      }
      return [...prev, paper];
    });
  }, []);

  const removeFromCollection = useCallback((paperId: string) => {
    setCollection((prev) => prev.filter((p) => p.id !== paperId));
  }, []);

  const toggleFavorite = useCallback((paperId: string) => {
    setFavorites((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(paperId)) {
        newSet.delete(paperId);
      } else {
        newSet.add(paperId);
      }
      return newSet;
    });
  }, []);

  const isFavorite = useCallback((paperId: string) => {
    return favorites.has(paperId);
  }, [favorites]);

  const clearCollection = useCallback(() => {
    setCollection([]);
    setFavorites(new Set());
  }, []);

  return {
    collection,
    favorites,
    addToCollection,
    removeFromCollection,
    toggleFavorite,
    isFavorite,
    clearCollection,
  };
}
