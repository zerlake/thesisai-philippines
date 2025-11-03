import { Paper } from '../types';

export class SemanticScholarApi {
  async search(query: string): Promise<Paper[]> {
    try {
      console.log('SemanticScholarApi - Searching for:', query);
      
      const response = await fetch(
        `/api/semantic-scholar?query=${encodeURIComponent(query)}`,
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      console.log('SemanticScholarApi - Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('SemanticScholarApi - Error response:', errorText);
        return [];
      }

      const data = await response.json();
      console.log('SemanticScholarApi - Received data:', {
        hasData: !!data.data,
        dataLength: data.data?.length,
        total: data.total
      });
      
      if (!data.data || !Array.isArray(data.data)) {
        console.warn('SemanticScholarApi - No valid data array in response');
        return [];
      }

      return data.data.map((paper: any) => {
        try {
          // Create publication info
          const pubParts = [];
          if (paper.venue) pubParts.push(`Published in ${paper.venue}`);
          if (paper.year) pubParts.push(`(${paper.year})`);
          if (paper.citationCount !== undefined) pubParts.push(`| Cited ${paper.citationCount} times`);
          
          // Create author string
          const authors = paper.authors?.slice(0, 3)
            .map((a: any) => a.name)
            .filter(Boolean);
          
          const authorString = authors?.length 
            ? `Authors: ${authors.join(', ')}${paper.authors.length > 3 ? ' et al.' : ''}. `
            : '';

          // Create snippet with author information if no abstract available
          let snippet = paper.abstract;
          if (!snippet || snippet === 'No abstract available') {
            snippet = [
              authorString.trim(),
              paper.venue ? `Published in ${paper.venue}.` : '',
              'Abstract not available in Semantic Scholar database.'
            ].filter(Boolean).join(' ');
          }

          const paperId = paper.paperId || paper.id;
          return {
            id: paperId || Math.random().toString(36).substring(7),
            title: paper.title || 'Untitled',
            link: paper.url || (paperId ? `https://www.semanticscholar.org/paper/${paperId}` : ''),
            publication_info: pubParts.join(' ') || 'Publication details unavailable',
            snippet: snippet,
            source: 'semantic-scholar'
          };
        } catch (err) {
          console.error('SemanticScholarApi - Error processing paper:', err, paper);
          return null;
        }
      }).filter(Boolean);
    } catch (error) {
      console.error('Semantic Scholar API error:', error);
      return []; // Return empty array instead of throwing
    }
  }
}

export class CoreApi {
  async search(query: string): Promise<Paper[]> {
    try {
      // Using CORE API v3 - without authorization header
      const response = await fetch(
        `https://api.core.ac.uk/v3/search/works?q=${encodeURIComponent(query)}&limit=10`,
        {
          headers: {
            'Accept': 'application/json'
          },
          mode: 'cors'
        }
      );

      if (!response.ok) {
        // If the v3 endpoint doesn't work, try the v2 endpoint
        const v2Response = await fetch(
          `https://core.ac.uk/api-v2/search/${encodeURIComponent(query)}?limit=10`,
          {
            headers: {
              'Accept': 'application/json'
            },
            mode: 'cors'
          }
        );
        
        if (v2Response.ok) {
          const v2Data = await v2Response.json();
          if (v2Data.results && Array.isArray(v2Data.results)) {
            return v2Data.results.map((paper: any) => ({
              id: paper.identifier || paper.id || Math.random().toString(36).substring(7),
              title: paper.title || 'Untitled',
              link: paper.downloadUrl || paper.doi || paper.url || '',
              publication_info: paper.publisher || paper.journal || 'Publisher unknown',
              snippet: paper.abstract || paper.description || 'No abstract available',
              source: 'core'
            }));
          }
        }
        
        // If both endpoints fail, return empty array rather than throwing
        console.warn(`CORE API: v3 failed with ${response.status}, v2 failed with ${v2Response.status}`);
        return [];
      }

      const data = await response.json();
      
      if (!data.results || !Array.isArray(data.results)) {
        return [];
      }

      return data.results.map((paper: any) => ({
        id: paper.id || Math.random().toString(36).substring(7),
        title: paper.title || 'Untitled',
        link: paper.downloadUrl || paper.doi || '',
        publication_info: paper.publisher 
          ? `Published by ${paper.publisher}${paper.yearPublished ? ` (${paper.yearPublished})` : ''}`
          : paper.yearPublished 
            ? `Published ${paper.yearPublished}`
            : 'Publication info unavailable',
        snippet: paper.abstract || paper.description || 'No abstract available',
        source: 'core'
      }));
    } catch (error) {
      // Handle all errors gracefully by returning an empty array
      console.error('CORE API error (network or other):', error);
      return [];
    }
  }
}

export class CrossrefApi {
  async search(query: string): Promise<Paper[]> {
    try {
      const response = await fetch(
        `https://api.crossref.org/works?query.title=${encodeURIComponent(query)}&rows=10&select=title,DOI,URL,abstract,created,publisher`,
        {
          headers: {
            'Accept': 'application/json',
          },
          mode: 'cors'
        }
      );

      if (!response.ok) {
        console.warn(`Crossref API request failed with status ${response.status}`);
        return [];
      }

      const data = await response.json();
      
      if (!data.message?.items || !Array.isArray(data.message.items)) {
        return [];
      }

      return data.message.items.map((item: any) => ({
        id: item.DOI || item.id || Math.random().toString(36).substring(7),
        title: Array.isArray(item.title) ? item.title[0] || 'Untitled' : item.title || 'Untitled',
        link: item.URL || item.link || '',
        publication_info: item.created?.['date-time'] ? `Published ${new Date(item.created['date-time']).getFullYear()}` : 'Year unknown',
        snippet: item.abstract || 'No abstract available',
        source: 'crossref'
      }));
    } catch (error) {
      console.error('Crossref API error:', error);
      return []; // Return empty array instead of throwing
    }
  }
}

export class OpenAlexApi {
  async search(query: string): Promise<Paper[]> {
    try {
      // OpenAlex API: requesting works with abstract details
      const response = await fetch(
        `https://api.openalex.org/works?search=${encodeURIComponent(query)}&per-page=10&select=id,title,doi,abstract_inverted_index,primary_location,publication_year,authorships`,
        {
          headers: {
            'Accept': 'application/json',
          },
          mode: 'cors'
        }
      );

      if (!response.ok) {
        throw new Error(`OpenAlex API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.results || !Array.isArray(data.results)) {
        return [];
      }

      return data.results.map((paper: any) => {
        let snippet = 'No abstract available';
        
        // Try to reconstruct abstract from inverted index if available
        if (paper.abstract_inverted_index && typeof paper.abstract_inverted_index === 'object') {
          const entries = Object.entries(paper.abstract_inverted_index);
          if (entries.length > 0) {
            // Create array based on highest position
            const maxPosition = Math.max(
              ...entries.flatMap(([, positions]) => positions as number[])
            );
            
            const words = new Array(maxPosition + 1).fill('');
            
            // Fill in the words - only at each position once
            for (const [word, positions] of entries) {
              for (const pos of positions as number[]) {
                if (pos >= 0 && pos <= maxPosition && words[pos] === '') {
                  words[pos] = word;
                }
              }
            }
            
            // Join the words, filtering out empty strings
            const reconstructed = words.filter(word => word !== '').join(' ');
            if (reconstructed.trim()) {
              snippet = reconstructed;
            }
          }
        }
        
        // If still no abstract, provide basic info
        if (snippet === 'No abstract available') {
          const authors = paper.authorships && Array.isArray(paper.authorships) 
            ? `${paper.authorships.length} author(s)` 
            : 'Unknown authors';
          snippet = `No abstract available. ${authors}.`;
        }

        return {
          id: paper.id || Math.random().toString(36).substring(7),
          title: paper.title || 'Untitled',
          link: paper.primary_location?.pdf_url || paper.primary_location?.landing_page_url || paper.doi || '',
          publication_info: paper.publication_year ? `Published ${paper.publication_year}` : 'Year unknown',
          snippet: snippet,
          source: 'openalex'
        };
      });
    } catch (error) {
      console.error('OpenAlex API error:', error);
      throw error;
    }
  }
}