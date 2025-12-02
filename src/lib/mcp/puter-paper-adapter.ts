/**
 * Puter MCP Adapter for Paper Search
 * Configures Puter AI to call MCP servers for paper search
 */

import { PaperSearchQuery, PaperSearchResult } from '@/types/paper';
import { paperSearchService } from './paper-search';

export interface PuterMCPConfig {
  tools: PuterMCPToolConfig[];
}

export interface PuterMCPToolConfig {
  id: string;
  type: 'mcp';
  transport?: 'remote' | 'local';
  tools: {
    name: string;
    schema: Record<string, any>;
  }[];
}

/**
 * Puter MCP Tools Configuration
 * Define tool schemas that Puter AI can expose to the model
 */
export const PUTER_MCP_TOOLS_CONFIG: PuterMCPConfig = {
  tools: [
    {
      id: 'crossref',
      type: 'mcp',
      transport: 'remote',
      tools: [
        {
          name: 'search_works_by_query',
          schema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query for academic works',
              },
              rows: {
                type: 'number',
                description: 'Number of results to return (default: 20)',
                default: 20,
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'get_work_metadata',
          schema: {
            type: 'object',
            properties: {
              doi: {
                type: 'string',
                description: 'Digital Object Identifier',
              },
            },
            required: ['doi'],
          },
        },
      ],
    },
    {
      id: 'paper_search',
      type: 'mcp',
      transport: 'remote',
      tools: [
        {
          name: 'search_arxiv',
          schema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'ArXiv search query',
              },
              max_results: {
                type: 'number',
                description: 'Maximum number of results',
                default: 20,
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'search_openalex',
          schema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'OpenAlex search query',
              },
              max_results: {
                type: 'number',
                description: 'Maximum number of results',
                default: 20,
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'download_arxiv',
          schema: {
            type: 'object',
            properties: {
              arxiv_id: {
                type: 'string',
                description: 'ArXiv ID (e.g., 2301.12345)',
              },
            },
            required: ['arxiv_id'],
          },
        },
        {
          name: 'get_openalex_work',
          schema: {
            type: 'object',
            properties: {
              work_id: {
                type: 'string',
                description: 'OpenAlex Work ID',
              },
            },
            required: ['work_id'],
          },
        },
      ],
    },
    {
      id: 'semantic_scholar',
      type: 'mcp',
      transport: 'remote',
      tools: [
        {
          name: 'search_semantic_scholar',
          schema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Semantic Scholar search query',
              },
              limit: {
                type: 'number',
                description: 'Number of results to return',
                default: 20,
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'get_paper_details',
          schema: {
            type: 'object',
            properties: {
              paper_id: {
                type: 'string',
                description: 'Semantic Scholar paper ID',
              },
            },
            required: ['paper_id'],
          },
        },
        {
          name: 'get_author_info',
          schema: {
            type: 'object',
            properties: {
              author_id: {
                type: 'string',
                description: 'Author ID from Semantic Scholar',
              },
            },
            required: ['author_id'],
          },
        },
      ],
    },
  ],
};

/**
 * Initialize Puter with MCP tools configuration
 * This would be called during app initialization
 */
export async function initializePuterMCPTools(puterInstance: any): Promise<void> {
  if (!puterInstance) {
    console.warn('Puter instance not available, skipping MCP tools initialization');
    return;
  }

  try {
    // In a real implementation, you would call Puter's API to register these tools
    // puterInstance.registerMCPTools(PUTER_MCP_TOOLS_CONFIG);
    console.log('Puter MCP tools initialized:', PUTER_MCP_TOOLS_CONFIG.tools.map((t) => t.id));
  } catch (error) {
    console.error('Failed to initialize Puter MCP tools:', error);
  }
}

/**
 * Adapter to bridge Puter AI calls to our paper search service
 * This handles the actual tool execution when Puter calls the MCP tools
 */
export class PuterPaperSearchAdapter {
  async executePaperSearch(query: PaperSearchQuery, puterAI: any): Promise<PaperSearchResult> {
    if (!puterAI) {
      throw new Error('Puter AI instance not available');
    }

    try {
      // Prepare tool bindings - these are called by Puter when executing MCP tools
      const mcpTools = {
        crossrefSearch: async (q: string, rows?: number) => {
          const result = await puterAI.tools.invoke('crossref.search_works_by_query', {
            query: q,
            rows: rows || 20,
          });
          return result.works || [];
        },

        arxivSearch: async (q: string, maxResults?: number) => {
          const result = await puterAI.tools.invoke('paper_search.search_arxiv', {
            query: q,
            max_results: maxResults || 20,
          });
          return result.entries || [];
        },

        openalexSearch: async (q: string, maxResults?: number) => {
          const result = await puterAI.tools.invoke('paper_search.search_openalex', {
            query: q,
            max_results: maxResults || 20,
          });
          return result.works || [];
        },

        semanticScholarSearch: async (q: string, maxResults?: number) => {
          const result = await puterAI.tools.invoke('semantic_scholar.search_semantic_scholar', {
            query: q,
            limit: maxResults || 20,
          });
          return result.papers || [];
        },
      };

      // Execute search through paper search service
      return await paperSearchService.search(query, mcpTools);
    } catch (error) {
      console.error('Paper search adapter error:', error);
      throw error;
    }
  }

  /**
   * Get author information from Semantic Scholar
   */
  async getAuthorInfo(authorId: string, puterAI: any): Promise<any> {
    if (!puterAI) {
      throw new Error('Puter AI instance not available');
    }

    try {
      const result = await puterAI.tools.invoke('semantic_scholar.get_author_info', {
        author_id: authorId,
      });
      return result;
    } catch (error) {
      console.error('Failed to get author info:', error);
      throw error;
    }
  }

  /**
   * Get work metadata from CrossRef by DOI
   */
  async getWorkMetadata(doi: string, puterAI: any): Promise<any> {
    if (!puterAI) {
      throw new Error('Puter AI instance not available');
    }

    try {
      const result = await puterAI.tools.invoke('crossref.get_work_metadata', {
        doi,
      });
      return result;
    } catch (error) {
      console.error('Failed to get work metadata:', error);
      throw error;
    }
  }

  /**
   * Download PDF from ArXiv
   */
  async downloadArxivPDF(arxivId: string, puterAI: any): Promise<any> {
    if (!puterAI) {
      throw new Error('Puter AI instance not available');
    }

    try {
      const result = await puterAI.tools.invoke('paper_search.download_arxiv', {
        arxiv_id: arxivId,
      });
      return result;
    } catch (error) {
      console.error('Failed to download ArXiv PDF:', error);
      throw error;
    }
  }

  /**
   * Get OpenAlex work details
   */
  async getOpenAlexWork(workId: string, puterAI: any): Promise<any> {
    if (!puterAI) {
      throw new Error('Puter AI instance not available');
    }

    try {
      const result = await puterAI.tools.invoke('paper_search.get_openalex_work', {
        work_id: workId,
      });
      return result;
    } catch (error) {
      console.error('Failed to get OpenAlex work details:', error);
      throw error;
    }
  }
}

export const puterPaperAdapter = new PuterPaperSearchAdapter();
