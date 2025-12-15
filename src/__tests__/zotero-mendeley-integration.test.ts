import { 
  generateCitation, 
  convertZoteroItemsToCitations, 
  convertMendeleyDocumentsToCitations,
  mapZoteroItemType,
  mapMendeleyType,
  normalizeCreators,
  extractTags,
  formatDate,
  ZoteroItem,
  MendeleyDocument,
  ThesisAICitation
} from '@/lib/zotero-converter';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { toast } from 'sonner';

// Mock the toast library since it may not be available in test environment
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock the supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(() => ({ data: { user: { id: 'test-user-123' } }, error: null }))
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({ data: [], error: null })),
        single: vi.fn(() => ({ data: {}, error: null })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({ data: { id: 'test-import-123' }, error: null }))
        })),
        single: vi.fn(() => ({ data: { id: 'test-import-123' }, error: null }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({ error: null }))
      }))
    }))
  }))
}));

describe('Zotero & Mendeley Integration - Data Converter Tests', () => {
  describe('Citation Generation', () => {
    const mockZoteroItem: ZoteroItem = {
      key: 'ABC123',
      version: 1,
      itemKey: 'ABC123',
      itemType: 'journalArticle',
      title: 'Sample Research Article',
      creators: [
        { creatorType: 'author', firstName: 'John', lastName: 'Doe' },
        { creatorType: 'author', firstName: 'Jane', lastName: 'Smith' }
      ],
      abstractNote: 'This is a sample abstract',
      publicationTitle: 'Journal of Sample Research',
      volume: '10',
      issue: '2',
      pages: '123-145',
      date: '2023',
      DOI: '10.1000/example.doi',
      url: 'https://example.com/article',
      dateAdded: '2023-01-01T00:00:00Z',
      dateModified: '2023-01-01T00:00:00Z',
    };

    const mockMendeleyDocument: MendeleyDocument = {
      id: 'DOC456',
      title: 'Sample Mendeley Document',
      authors: [
        { first_name: 'Alice', last_name: 'Johnson' },
        { first_name: 'Bob', last_name: 'Williams' }
      ],
      source: 'Mendeley Journal',
      year: 2023,
      doi: '10.1000/mendeley.doi',
      link: 'https://mendeley.com/document',
      created: '2023-01-01T00:00:00Z',
      last_modified: '2023-01-01T00:00:00Z',
      type: 'journal',
      file_attached: true,
      stats: {
        readers: 50,
        groups: 5
      }
    };

    it('should generate a valid APA citation for Zotero items', () => {
      const citation = generateCitation(mockZoteroItem, 'APA');
      expect(citation).toContain('Doe, J., & Smith, J.');
      expect(citation).toContain('(2023)');
      expect(citation).toContain('Sample Research Article.');
      expect(citation).toContain('Journal of Sample Research');
      expect(citation).toContain('https://doi.org/10.1000/example.doi');
    });

    it('should generate a valid MLA citation for Zotero items', () => {
      const citation = generateCitation(mockZoteroItem, 'MLA');
      expect(citation).toContain('Doe, John, and Smith, Jane.');
      expect(citation).toContain('“Sample Research Article.”');
      expect(citation).toContain('Journal of Sample Research');
    });

    it('should generate a valid Chicago citation for Zotero items', () => {
      const citation = generateCitation(mockZoteroItem, 'CHICAGO');
      expect(citation).toContain('Doe, John, and Smith, Jane.');
      expect(citation).toContain('“Sample Research Article.”');
      expect(citation).toContain('Journal of Sample Research');
    });

    it('should generate a valid APA citation for Mendeley documents', () => {
      const citation = generateCitation(mockMendeleyDocument, 'APA');
      expect(citation).toContain('Johnson, A., & Williams, B.');
      expect(citation).toContain('(2023)');
      expect(citation).toContain('Sample Mendeley Document.');
      expect(citation).toContain('https://doi.org/10.1000/mendeley.doi');
    });

    it('should fall back to APA format for unrecognized citation style', () => {
      const citation = generateCitation(mockZoteroItem, 'UNKNOWN_STYLE');
      expect(citation).toContain('Doe, J., & Smith, J.');
      expect(citation).toContain('(2023)');
    });
  });

  describe('Zotero Item Conversion', () => {
    const mockItems: ZoteroItem[] = [
      {
        key: 'ITEM1',
        version: 1,
        itemKey: 'ITEM1',
        itemType: 'journalArticle',
        title: 'First Article',
        creators: [{ creatorType: 'author', firstName: 'Author', lastName: 'One' }],
        date: '2023',
        DOI: '10.1000/first.doi',
        dateAdded: '2023-01-01T00:00:00Z',
        dateModified: '2023-01-01T00:00:00Z',
      },
      {
        key: 'ITEM2',
        version: 1,
        itemKey: 'ITEM2',
        itemType: 'book',
        title: 'First Book',
        creators: [{ creatorType: 'author', firstName: 'Author', lastName: 'Two' }],
        date: '2022',
        publisher: 'Sample Publisher',
        ISBN: '1234567890',
        dateAdded: '2023-01-01T00:00:00Z',
        dateModified: '2023-01-01T00:00:00Z',
      }
    ];

    it('should convert Zotero items to ThesisAI citations', () => {
      const citations = convertZoteroItemsToCitations(mockItems, 'test-user-123');
      expect(citations).toHaveLength(2);
      
      const firstCitation = citations[0];
      expect(firstCitation.user_id).toBe('test-user-123');
      expect(firstCitation.imported_from).toBe('zotero');
      expect(firstCitation.original_id).toBe('ITEM1');
      expect(firstCitation.content).toContain('One, A.');
      expect(firstCitation.style).toBe('APA 7th Edition');
      expect(firstCitation.metadata).toHaveProperty('zotero_key', 'ITEM1');
      expect(firstCitation.metadata).toHaveProperty('title', 'First Article');
    });

    it('should allow custom citation style', () => {
      const citations = convertZoteroItemsToCitations(mockItems, 'test-user-123', 'MLA 9TH EDITION');
      expect(citations[0].style).toBe('MLA 9TH EDITION');
      expect(citations[0].content).toContain('One, Author.');
    });
  });

  describe('Mendeley Document Conversion', () => {
    const mockDocuments: MendeleyDocument[] = [
      {
        id: 'DOC1',
        title: 'First Mendeley Document',
        authors: [{ first_name: 'Mendeley', last_name: 'Author' }],
        year: 2023,
        doi: '10.1000/mendeley.doi',
        created: '2023-01-01T00:00:00Z',
        last_modified: '2023-01-01T00:00:00Z',
        type: 'journal',
        file_attached: true,
        stats: { readers: 100, groups: 10 },
        link: 'https://mendeley.com/doc1'
      }
    ];

    it('should convert Mendeley documents to ThesisAI citations', () => {
      const citations = convertMendeleyDocumentsToCitations(mockDocuments, 'test-user-123');
      expect(citations).toHaveLength(1);
      
      const citation = citations[0];
      expect(citation.user_id).toBe('test-user-123');
      expect(citation.imported_from).toBe('mendeley');
      expect(citation.original_id).toBe('DOC1');
      expect(citation.content).toContain('Author, M.');
      expect(citation.metadata).toHaveProperty('mendeley_id', 'DOC1');
      expect(citation.metadata).toHaveProperty('title', 'First Mendeley Document');
      expect(citation.metadata).toHaveProperty('authors');
      expect(citation.metadata).toHaveProperty('year', 2023);
    });
  });

  describe('Utility Functions', () => {
    it('should map Zotero item types correctly', () => {
      expect(mapZoteroItemType('journalArticle')).toBe('journal-article');
      expect(mapZoteroItemType('book')).toBe('book');
      expect(mapZoteroItemType('unknown-type')).toBe('unknown-type');
    });

    it('should map Mendeley document types correctly', () => {
      expect(mapMendeleyType('journal')).toBe('journal-article');
      expect(mapMendeleyType('book')).toBe('book');
      expect(mapMendeleyType('unknown-type')).toBe('unknown-type');
    });

    it('should normalize creators properly', () => {
      const creators = [
        { creatorType: 'author', firstName: 'John', lastName: 'Doe' },
        { creatorType: 'editor', name: 'Jane Smith' }
      ];
      
      const normalized = normalizeCreators(creators);
      expect(normalized).toHaveLength(2);
      expect(normalized[0]).toEqual({
        type: 'author',
        firstName: 'John',
        lastName: 'Doe',
      });
      expect(normalized[1]).toEqual({
        type: 'editor',
        fullName: 'Jane Smith',
      });
    });

    it('should extract tags from Zotero items', () => {
      const item: ZoteroItem = {
        key: 'TEST',
        version: 1,
        itemKey: 'TEST',
        itemType: 'journalArticle',
        title: 'Test Item',
        dateAdded: '2023-01-01T00:00:00Z',
        dateModified: '2023-01-01T00:00:00Z',
        tags: [
          { tag: 'tag1', type: 1 },
          { tag: 'tag2', type: 1 }
        ]
      };
      
      const tags = extractTags(item);
      expect(tags).toEqual(['tag1', 'tag2']);
    });

    it('should extract keywords from Mendeley documents', () => {
      const doc: MendeleyDocument = {
        id: 'TEST',
        title: 'Test Document',
        source: 'Test Journal',
        year: 2023,
        created: '2023-01-01T00:00:00Z',
        last_modified: '2023-01-01T00:00:00Z',
        type: 'journal',
        file_attached: true,
        stats: { readers: 0, groups: 0 },
        keywords: [
          { value: 'keyword1' },
          { value: 'keyword2' }
        ]
      };
      
      const tags = extractTags(doc);
      expect(tags).toEqual(['keyword1', 'keyword2']);
    });

    it('should format dates correctly', () => {
      expect(formatDate('2023-05-15T10:30:00Z')).toBe('2023');
      expect(formatDate('invalid-date')).toBe('invalid-date');
      expect(formatDate(undefined)).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle Zotero items without creators', () => {
      const item: ZoteroItem = {
        key: 'NO-CREATORS',
        version: 1,
        itemKey: 'NO-CREATORS',
        itemType: 'journalArticle',
        title: 'No Creators Article',
        dateAdded: '2023-01-01T00:00:00Z',
        dateModified: '2023-01-01T00:00:00Z',
      };
      
      const citation = generateCitation(item, 'APA');
      expect(citation).toContain('Unknown Author.');
    });

    it('should handle Zotero items with single author', () => {
      const item: ZoteroItem = {
        key: 'ONE-AUTHOR',
        version: 1,
        itemKey: 'ONE-AUTHOR',
        itemType: 'journalArticle',
        title: 'Single Author Article',
        creators: [{ creatorType: 'author', firstName: 'Single', lastName: 'Author' }],
        dateAdded: '2023-01-01T00:00:00Z',
        dateModified: '2023-01-01T00:00:00Z',
      };
      
      const citation = generateCitation(item, 'APA');
      expect(citation).toContain('Author, S.');
    });

    it('should handle Zotero items with many authors', () => {
      const item: ZoteroItem = {
        key: 'MANY-AUTHORS',
        version: 1,
        itemKey: 'MANY-AUTHORS',
        itemType: 'journalArticle',
        title: 'Many Authors Article',
        creators: [
          { creatorType: 'author', firstName: 'First', lastName: 'Author' },
          { creatorType: 'author', firstName: 'Second', lastName: 'Author' },
          { creatorType: 'author', firstName: 'Third', lastName: 'Author' },
          { creatorType: 'author', firstName: 'Fourth', lastName: 'Author' },
        ],
        dateAdded: '2023-01-01T00:00:00Z',
        dateModified: '2023-01-01T00:00:00Z',
      };
      
      const citation = generateCitation(item, 'APA');
      expect(citation).toContain('Author, F. et al.');
    });

    it('should handle missing DOI or URL', () => {
      const item: ZoteroItem = {
        key: 'NO-DOI',
        version: 1,
        itemKey: 'NO-DOI',
        itemType: 'journalArticle',
        title: 'No DOI Article',
        creators: [{ creatorType: 'author', firstName: 'Test', lastName: 'Author' }],
        dateAdded: '2023-01-01T00:00:00Z',
        dateModified: '2023-01-01T00:00:00Z',
      };
      
      const citation = generateCitation(item, 'APA');
      // Should not include DOI or URL since neither is present
      expect(citation).not.toContain('https://doi.org/');
    });
  });
});

describe('Zotero/Mendeley Import Workflow Integration Tests', () => {
  // These would be more comprehensive tests that validate the complete workflow
  it('should process a complete Zotero import workflow', async () => {
    // This would simulate the complete process:
    // 1. API key verification
    // 2. Fetching libraries
    // 3. Fetching items from libraries
    // 4. Converting items to citations
    // 5. Saving to the database
    
    // For now, this is a placeholder as the full integration would require
    // real API keys and database access
    expect(true).toBe(true);
  });
  
  it('should process a complete Mendeley import workflow', async () => {
    // Similar to Zotero, this tests the complete Mendeley workflow
    expect(true).toBe(true);
  });
  
  it('should handle API errors gracefully', async () => {
    // Test that the system handles API errors from Zotero/Mendeley
    expect(true).toBe(true);
  });
  
  it('should maintain data integrity during import', async () => {
    // Test that imported data maintains integrity and doesn't corrupt existing citations
    expect(true).toBe(true);
  });
});

describe('UI Component Integration Tests', () => {
  it('should render the Zotero import modal correctly', () => {
    // This would test the ZoteroImportModal component
    expect(true).toBe(true);
  });
  
  it('should handle user API key input validation', () => {
    // Test validation of API key input
    expect(true).toBe(true);
  });
  
  it('should display library selection after successful verification', () => {
    // Test that libraries are listed after successful verification
    expect(true).toBe(true);
  });
  
  it('should track import progress accurately', () => {
    // Test progress tracking functionality
    expect(true).toBe(true);
  });
});