// Define types for Zotero items and ThesisAI citations
export interface ZoteroItem {
  key: string;
  version: number;
  itemKey: string;
  itemType: string;
  title: string;
  creators?: Array<{
    creatorType: string;
    firstName?: string;
    lastName?: string;
    name?: string; // For single-field creators
  }>;
  abstractNote?: string;
  publicationTitle?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  date?: string;
  series?: string;
  seriesTitle?: string;
  seriesText?: string;
  journalAbbreviation?: string;
  language?: string;
  DOI?: string;
  ISSN?: string;
  ISBN?: string;
  shortTitle?: string;
  url?: string;
  accessDate?: string;
  archive?: string;
  archiveLocation?: string;
  libraryCatalog?: string;
  callNumber?: string;
  rights?: string;
  extra?: string;
  tags?: Array<{
    tag: string;
    type: number;
  }>;
  collections?: string[];
  relations?: Record<string, unknown>;
  dateAdded: string;
  dateModified: string;
  publisher?: string; // Added to match usage in generateAPACitation
  // Add other fields as needed
}

export interface MendeleyDocument {
  id: string;
  title: string;
  authors?: Array<{
    first_name: string;
    last_name: string;
  }>;
  source?: string; // Journal/conference name
  year?: number;
  doi?: string;
  isbn?: string;
  identifier?: {
    doi?: string;
    isbn?: string;
    arxiv?: string;
    pubmed?: string;
  };
  abstract?: string;
  keywords?: Array<{
    value: string;
  }>;
  created: string;
  last_modified: string;
  type: string;
  profiles?: Array<{
    id: string;
    first_name: string;
    last_name: string;
  }>;
  file_attached: boolean;
  link?: string;
  stats: {
    readers: number;
    groups: number;
  };
}

export interface ThesisAICitation {
  user_id: string;
  content: string;
  style: string;
  imported_from: string;
  original_id: string;
  metadata: Record<string, any>;
}

/**
 * Generates an APA 7th edition citation based on item type
 */
export function generateAPACitation(item: ZoteroItem | MendeleyDocument): string {
  let citation = '';

  // Determine if this is a Zotero or Mendeley item
  const isZoteroItem = 'key' in item;
  const creators = isZoteroItem ? item.creators : item['authors'] || item['profiles'];
  
  // Format authors
  if (creators && creators.length > 0) {
    const authors = creators.map(creator => {
      if ('firstName' in creator && creator.firstName && creator.lastName) {
        return `${creator.lastName}, ${creator.firstName.charAt(0)}.`;
      } else if ('first_name' in creator && creator.first_name && creator.last_name) {
        return `${creator.last_name}, ${creator.first_name.charAt(0)}.`;
      } else if ('name' in creator && creator.name) {
        return creator.name;
      } else if ('first_name' in creator) {
        return creator.first_name + ' ' + (creator.last_name || '');
      }
      return 'Unknown Author';
    });
    
    // Handle multiple authors (APA 7th edition format)
    if (authors.length === 1) {
      citation += `${authors[0]} `;
    } else if (authors.length === 2) {
      citation += `${authors[0]}, & ${authors[1]} `;
    } else if (authors.length > 2) {
      // For 3+ authors, use "First Author et al."
      citation += `${authors[0]} et al. `;
    }
  } else {
    citation += 'Unknown Author. ';
  }

  // Add date (in parentheses)
  const date = isZoteroItem ? item.date : item['year']?.toString();
  citation += `(${date || 'n.d.'}). `;

  // Add title
  const title = isZoteroItem ? item.title : item['title'];
  citation += `${title}. `;

  // Add publication info based on item type
  if (isZoteroItem) {
    if (item.itemType === 'journalArticle') {
      if (item.publicationTitle) citation += `${item.publicationTitle}, `;
      if (item.volume) citation += `${item.volume}`;
      if (item.issue) citation += `(${item.issue})`;
      citation += `, `;
      if (item.pages) citation += `${item.pages}`;
    } else if (item.itemType === 'book') {
      if (item.publisher) citation += `${item.publisher}`;
    } else if (item.itemType === 'conferencePaper') {
      if (item.publicationTitle) citation += `In ${item.publicationTitle} `;
    }
  } else { // Mendeley document
    const source = item['source'];
    const year = item['year'];
    const journalVolume = item['source'] && year ? `${source}, ${year}` : source || '';
    
    if (journalVolume) {
      citation += `${journalVolume}. `;
    }
  }

  // Add DOI or URL if available
  const doi = isZoteroItem ? item.DOI : item['doi'] || item['identifier']?.doi;
  const url = isZoteroItem ? item.url : item['link'];
  
  if (doi) {
    citation += `https://doi.org/${doi}`;
  } else if (url) {
    citation += `${url}`;
  }

  return citation.trim() + '.';
}

/**
 * Generates an MLA 9th edition citation
 */
export function generateMLACitation(item: ZoteroItem | MendeleyDocument): string {
  let citation = '';

  // Determine if this is a Zotero or Mendeley item
  const isZoteroItem = 'key' in item;
  const creators = isZoteroItem ? item.creators : item['authors'] || item['profiles'];
  
  // Format authors (First Last, First Last, and First Last)
  if (creators && creators.length > 0) {
    const authors = creators.map(creator => {
      if ('firstName' in creator && creator.firstName && creator.lastName) {
        return `${creator.lastName}, ${creator.firstName}`;
      } else if ('first_name' in creator && creator.first_name && creator.last_name) {
        return `${creator.last_name}, ${creator.first_name}`;
      } else if ('name' in creator && creator.name) {
        return creator.name;
      } else if ('first_name' in creator) {
        return `${creator.last_name || ''}, ${creator.first_name}`;
      }
      return 'Unknown Author';
    });
    
    if (authors.length === 1) {
      citation += `${authors[0]}. `;
    } else if (authors.length === 2) {
      citation += `${authors[0]}, and ${authors[1]}. `;
    } else if (authors.length === 3) {
      citation += `${authors[0]}, ${authors[1]}, and ${authors[2]}. `;
    } else if (authors.length > 3) {
      // For 4+ authors, use "First, et al."
      citation += `${authors[0]}, et al. `;
    }
  } else {
    citation += 'Unknown Author. ';
  }

  // Add title in quotation marks
  const title = isZoteroItem ? item.title : item['title'];
  citation += `"${title}." `;

  // Add publication info based on item type
  if (isZoteroItem) {
    if (item.itemType === 'journalArticle') {
      if (item.publicationTitle) citation += `${item.publicationTitle}, `;
      if (item.volume) citation += `vol. ${item.volume}, `;
      if (item.issue) citation += `no. ${item.issue}, `;
      if (item.pages) citation += `pp. ${item.pages}, `;
      if (item.date) citation += `${item.date}. `;
    } else if (item.itemType === 'book') {
      if (item.publisher) citation += `${item.publisher}, `;
      if (item.date) citation += `${item.date}. `;
    }
  } else { // Mendeley document
    const source = item['source'];
    const year = item['year'];
    if (source) {
      citation += `${source}, `;
    }
    if (year) {
      citation += `${year}. `;
    }
  }

  // Add DOI or URL if available
  const doi = isZoteroItem ? item.DOI : item['doi'] || item['identifier']?.doi;
  const url = isZoteroItem ? item.url : item['link'];
  
  if (doi) {
    citation += `https://doi.org/${doi}.`;
  } else if (url) {
    citation += `Accessed ${new Date().getFullYear()}, ${url}.`;
  }

  return citation.trim();
}

/**
 * Generates a Chicago 17th edition citation
 */
export function generateChicagoCitation(item: ZoteroItem | MendeleyDocument): string {
  let citation = '';

  // Determine if this is a Zotero or Mendeley item
  const isZoteroItem = 'key' in item;
  const creators = isZoteroItem ? item.creators : item['authors'] || item['profiles'];
  
  // Format authors (First Last, First Last, and First Last)
  if (creators && creators.length > 0) {
    const authors = creators.map(creator => {
      if ('firstName' in creator && creator.firstName && creator.lastName) {
        return `${creator.firstName} ${creator.lastName}`;
      } else if ('first_name' in creator && creator.first_name && creator.last_name) {
        return `${creator.first_name} ${creator.last_name}`;
      } else if ('name' in creator && creator.name) {
        return creator.name;
      } else if ('first_name' in creator) {
        return `${creator.first_name} ${creator.last_name || ''}`;
      }
      return 'Unknown Author';
    });
    
    if (authors.length === 1) {
      citation += `${authors[0]}. `;
    } else if (authors.length === 2) {
      citation += `${authors[0]} and ${authors[1]}. `;
    } else if (authors.length === 3) {
      citation += `${authors[0]}, ${authors[1]}, and ${authors[2]}. `;
    } else if (authors.length > 3) {
      // For 4+ authors, use "First, et al."
      citation += `${authors[0]}, et al. `;
    }
  } else {
    citation += 'Unknown Author. ';
  }

  // Add title in quotation marks
  const title = isZoteroItem ? item.title : item['title'];
  citation += `"${title}." `;

  // Add publication info based on item type
  if (isZoteroItem) {
    if (item.itemType === 'journalArticle') {
      if (item.publicationTitle) citation += `${item.publicationTitle} `;
      if (item.volume) citation += `${item.volume}, `;
      if (item.issue) citation += `no. ${item.issue} `;
      if (item.date) citation += `(${item.date}): `;
      if (item.pages) citation += `${item.pages}. `;
    } else if (item.itemType === 'book') {
      if (item.publisher) citation += `${item.publisher}, `;
      if (item.date) citation += `${item.date}. `;
    }
  } else { // Mendeley document
    const source = item['source'];
    const year = item['year'];
    if (source) {
      citation += `${source} `;
    }
    if (year) {
      citation += `(${year}): `;
    }
  }

  // Add DOI or URL if available
  const doi = isZoteroItem ? item.DOI : item['doi'] || item['identifier']?.doi;
  const url = isZoteroItem ? item.url : item['link'];
  
  if (doi) {
    citation += `https://doi.org/${doi}.`;
  } else if (url) {
    citation += `Accessed ${new Date().toLocaleDateString()}. ${url}`;
  }

  return citation.trim();
}

/**
 * Converts an item to a citation in the specified style
 */
export function generateCitation(item: ZoteroItem | MendeleyDocument, style: string = 'APA'): string {
  switch (style.toUpperCase()) {
    case 'APA':
    case 'APA 7TH EDITION':
      return generateAPACitation(item);
    case 'MLA':
    case 'MLA 9TH EDITION':
      return generateMLACitation(item);
    case 'CHICAGO':
    case 'CHICAGO 17TH EDITION':
      return generateChicagoCitation(item);
    default:
      return generateAPACitation(item); // Default to APA
  }
}

/**
 * Converts Zotero items to ThesisAI citation format
 */
export function convertZoteroItemsToCitations(
  items: ZoteroItem[], 
  userId: string,
  style: string = 'APA 7th Edition'
): ThesisAICitation[] {
  return items.map(item => ({
    user_id: userId,
    content: generateCitation(item, style),
    style: style,
    imported_from: 'zotero',
    original_id: item.key,
    metadata: {
      zotero_key: item.key,
      zotero_item_type: item.itemType,
      title: item.title,
      publication_title: item.publicationTitle,
      volume: item.volume,
      issue: item.issue,
      pages: item.pages,
      date: item.date,
      doi: item.DOI,
      isbn: item.ISBN,
      url: item.url,
      abstract: item.abstractNote,
      creators: item.creators,
      tags: item.tags?.map(tag => tag.tag),
      collections: item.collections,
      date_added: item.dateAdded,
      date_modified: item.dateModified,
      extra: item.extra,
      series: item.series,
      language: item.language,
    }
  }));
}

/**
 * Converts Mendeley documents to ThesisAI citation format
 */
export function convertMendeleyDocumentsToCitations(
  documents: MendeleyDocument[], 
  userId: string,
  style: string = 'APA 7th Edition'
): ThesisAICitation[] {
  return documents.map(doc => ({
    user_id: userId,
    content: generateCitation(doc, style),
    style: style,
    imported_from: 'mendeley',
    original_id: doc.id,
    metadata: {
      mendeley_id: doc.id,
      title: doc.title,
      authors: doc.authors || doc.profiles,
      source: doc.source,
      year: doc.year,
      doi: doc.doi || doc.identifier?.doi,
      isbn: doc.isbn || doc.identifier?.isbn,
      link: doc.link,
      abstract: doc.abstract,
      keywords: doc.keywords?.map(k => k.value),
      type: doc.type,
      created: doc.created,
      last_modified: doc.last_modified,
      stats: doc.stats,
      file_attached: doc.file_attached,
    }
  }));
}

/**
 * Maps Zotero item types to more standardized types
 */
export function mapZoteroItemType(zoteroType: string): string {
  const typeMap: Record<string, string> = {
    'journalArticle': 'journal-article',
    'book': 'book',
    'bookSection': 'book-section',
    'conferencePaper': 'conference-paper',
    'thesis': 'thesis',
    'dissertation': 'dissertation',
    'letter': 'letter',
    'manuscript': 'manuscript',
    'interview': 'interview',
    'film': 'film',
    'artwork': 'artwork',
    'webpage': 'webpage',
    'report': 'report',
    'bill': 'bill',
    'case': 'legal-case',
    'hearing': 'hearing',
    'patent': 'patent',
    'statute': 'statute',
    'email': 'email',
    'map': 'map',
    'blogPost': 'weblog',
    'instantMessage': 'personal-communication',
    'forumPost': 'webforum',
    'audioRecording': 'audio-recording',
    'presentation': 'presentation',
    'videoRecording': 'video-recording',
    'tvBroadcast': 'broadcast',
    'radioBroadcast': 'broadcast',
    'podcast': 'podcast',
    'computerProgram': 'software',
    'document': 'document',
    'encyclopediaArticle': 'encyclopedia-article',
    'dictionaryEntry': 'dictionary-entry',
  };

  return typeMap[zoteroType] || zoteroType;
}

/**
 * Maps Mendeley document types to standardized types
 */
export function mapMendeleyType(mendeleyType: string): string {
  const typeMap: Record<string, string> = {
    'journal': 'journal-article',
    'book': 'book',
    'book-chapter': 'book-section',
    'conference-proceeding': 'conference-paper',
    'thesis': 'thesis',
    'dissertation': 'dissertation',
    'letter': 'letter',
    'manuscript': 'manuscript',
    'interview': 'interview',
    'film': 'film',
    'artwork': 'artwork',
    'webpage': 'webpage',
    'report': 'report',
    'patent': 'patent',
    'magazine-article': 'magazine-article',
    'statute': 'statute',
    'email': 'email',
    'map': 'map',
    'blog-post': 'weblog',
    'forum-post': 'webforum',
    'audio-recording': 'audio-recording',
    'presentation': 'presentation',
    'video-recording': 'video-recording',
    'tv-broadcast': 'broadcast',
    'radio-broadcast': 'broadcast',
    'podcast': 'podcast',
    'computer-program': 'software',
    'document': 'document',
    'encyclopedia-article': 'encyclopedia-article',
    'dictionary-entry': 'dictionary-entry',
    'statistical-table': 'statistical-table',
    'chart-or-table': 'chart',
    'case': 'legal-case',
  };

  return typeMap[mendeleyType] || mendeleyType;
}

/**
 * Normalizes creators to a consistent format
 */
export function normalizeCreators(creators: any[]): Array<{
  type: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
}> {
  if (!creators) return [];

  return creators.map(creator => {
    if (creator.firstName && creator.lastName) {
      return {
        type: creator.creatorType || 'author',
        firstName: creator.firstName,
        lastName: creator.lastName,
      };
    } else if (creator.name) {
      return {
        type: creator.creatorType || 'author',
        fullName: creator.name,
      };
    } else if (creator.first_name && creator.last_name) {
      return {
        type: creator.creatorType || 'author',
        firstName: creator.first_name,
        lastName: creator.last_name,
      };
    }
    return {
      type: creator.creatorType || 'author',
    };
  });
}

/**
 * Extracts and formats tags from item
 */
export function extractTags(item: ZoteroItem | MendeleyDocument): string[] {
  if ('tags' in item && item.tags) {
    // Zotero item tags
    return (item.tags as Array<{tag: string}>).map(tag => tag.tag);
  } else if ('keywords' in item && item.keywords) {
    // Mendeley document keywords
    return (item.keywords as Array<{value: string}>).map(k => k.value);
  }
  return [];
}

/**
 * Formats date for consistent citation presentation
 */
export function formatDate(dateString?: string): string | undefined {
  if (!dateString) return undefined;
  
  try {
    // Try to parse the date - Zotero can have various formats
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return as-is if invalid
    
    // Format as "YYYY" or "Month YYYY" depending on precision
    return date.getFullYear().toString();
  } catch {
    return dateString; // Return as-is if parsing fails
  }
}