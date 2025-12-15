import { describe, it, expect, vi } from 'vitest';
import { extractDOI, extractDOIFromPaper } from '@/lib/scihub-integration';

describe('Sci-Hub Integration', () => {
  describe('extractDOI', () => {
    it('should extract DOI from standard format', () => {
      const text = 'This paper has DOI: 10.1038/nature12373';
      expect(extractDOI(text)).toBe('10.1038/nature12373');
    });

    it('should extract DOI with longer suffix', () => {
      const text = 'DOI: 10.1145/3025453.3025815';
      expect(extractDOI(text)).toBe('10.1145/3025453.3025815');
    });

    it('should return null for missing DOI', () => {
      const text = 'This paper has no DOI';
      expect(extractDOI(text)).toBeNull();
    });

    it('should handle DOI at start of string', () => {
      const text = '10.1038/nature12373 is the DOI';
      expect(extractDOI(text)).toBe('10.1038/nature12373');
    });

    it('should handle DOI with special characters', () => {
      const text = 'The DOI is 10.1186/1751-0147-55-44';
      expect(extractDOI(text)).toBe('10.1186/1751-0147-55-44');
    });
  });

  describe('extractDOIFromPaper', () => {
    it('should extract DOI from paper link', () => {
      const paper = {
        title: 'Sample Paper',
        link: 'https://doi.org/10.1038/nature12373',
      };
      expect(extractDOIFromPaper(paper)).toBe('10.1038/nature12373');
    });

    it('should extract DOI from publication info', () => {
      const paper = {
        title: 'Sample Paper',
        link: 'https://example.com',
        publication_info: '2023 - DOI: 10.1145/3025453.3025815',
      };
      expect(extractDOIFromPaper(paper)).toBe('10.1145/3025453.3025815');
    });

    it('should extract DOI from title', () => {
      const paper = {
        title: 'Sample Paper (10.1186/1751-0147-55-44)',
        link: 'https://example.com',
      };
      expect(extractDOIFromPaper(paper)).toBe('10.1186/1751-0147-55-44');
    });

    it('should prefer DOI from link over publication_info', () => {
      const paper = {
        title: 'Sample Paper',
        link: 'https://doi.org/10.1038/nature12373',
        publication_info: 'DOI: 10.1145/3025453.3025815',
      };
      expect(extractDOIFromPaper(paper)).toBe('10.1038/nature12373');
    });

    it('should return null when no DOI found', () => {
      const paper = {
        title: 'Sample Paper',
        link: 'https://example.com',
      };
      expect(extractDOIFromPaper(paper)).toBeNull();
    });

    it('should handle empty paper object', () => {
      const paper = {};
      expect(extractDOIFromPaper(paper)).toBeNull();
    });
  });

  describe('DOI normalization', () => {
    it('should handle DOI without 10. prefix', () => {
      const text = 'Paper: 1038/nature12373';
      // This should NOT match since pattern requires 10.
      expect(extractDOI(text)).toBeNull();
    });

    it('should accept complex DOI patterns', () => {
      const text = 'DOI: 10.1109/5.771073';
      expect(extractDOI(text)).toBe('10.1109/5.771073');
    });

    it('should handle multi-digit publisher ID', () => {
      const text = 'Reference: 10.54321/some.paper.id';
      expect(extractDOI(text)).toBe('10.54321/some.paper.id');
    });
  });
});
