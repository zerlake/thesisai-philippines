/**
 * Puter AI Paper Search Integration
 * 
 * Uses MCP server to query real academic databases only
 * No mock data - only actual papers from CrossRef, arXiv, PubMed, Google Scholar
 */

import { Paper, PaperSearchQuery, PaperSearchResult } from '@/types/paper';
import { searchAcademicPapersViaMCP } from '@/lib/mcp-paper-search';

export class PuterAISearchService {
  private puterAI: any = null;
  private initPromise: Promise<boolean> | null = null;

  /**
   * Initialize Puter AI connection
   */
  async initialize(): Promise<boolean> {
    // Return cached promise if already initializing
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._doInitialize();
    return this.initPromise;
  }

  private async _doInitialize(): Promise<boolean> {
    try {
      // Try to load Puter SDK if needed
      if (typeof window !== 'undefined') {
        // Check if puter is already available
        if ((window as any).puter?.ai) {
          this.puterAI = (window as any).puter.ai;
          console.log('[PuterAI] Connected successfully');
          return true;
        }

        // Try to load the Puter SDK from the main loader
        // Use lib version which has deduplication built-in
        const { loadPuterSDK } = await import('@/lib/puter-sdk');
        await loadPuterSDK();

        // Check again after loading
        if ((window as any).puter?.ai) {
          this.puterAI = (window as any).puter.ai;
          console.log('[PuterAI] Connected successfully after SDK load');
          return true;
        }
      }

      console.warn('[PuterAI] Puter not available after initialization');
      return false;
    } catch (error) {
      console.error('[PuterAI] Initialization failed:', error);
      return false;
    }
  }

  /**
   * Check if Puter AI is available
   */
  isAvailable(): boolean {
    return this.puterAI !== null;
  }

  /**
   * Execute intelligent paper search with MCP
   * Queries real academic databases only through MCP server
   * Returns empty results if no papers found (no mock data)
   * Note: AI search ignores filters to maximize result coverage
   */
  async searchWithAI(query: string, _filters?: PaperSearchQuery['filters'], testMode = false): Promise<PaperSearchResult & { error?: string }> {
    try {
      console.log('[PuterAI] Searching academic databases via MCP for:', query);
      console.log('[PuterAI] Test mode:', testMode);

      // Use MCP-based search for real academic databases
      // In test mode, only use CrossRef to isolate issues
      const result = await searchAcademicPapersViaMCP(query, {
        maxResults: 50,
        timeout: 45000, // Increased timeout to allow all sources to complete
        sourcesOnly: testMode ? ['crossref'] : [],
      });

      console.log(`[PuterAI] Search completed. Found ${result.papers.length} papers`);
      
      // Note: AI search returns unfiltered results to maximize search coverage
      // Users can filter using the standard search if needed
      // This ensures AI search always returns relevant results from all sources
      
      // Return results as-is (empty if no papers found)
      // No mock data fallback - students should only see real papers
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Search failed';
      console.error('[PuterAI] Search error:', errorMsg);
      
      // Return empty result on error, not mocks
      return {
        papers: [],
        totalResults: 0,
        query,
        timestamp: Date.now(),
        error: errorMsg,
      };
    }
  }

}

export const puterAISearchService = new PuterAISearchService();
