/**
 * Paper Summary Generation
 * Creates 3-5 sentence summaries for papers that lack abstracts
 */

import { Paper } from '@/types/paper';

/**
 * Generate a summary for papers that lack abstracts
 * Uses paper metadata to create a meaningful description
 */
export async function generatePaperSummaries(papers: Paper[]): Promise<Paper[]> {
  return papers.map(paper => {
    // Only generate a summary if the paper doesn't have an abstract or any other summary
    if (!paper.abstract && !paper.generatedSummary) {
      // Check if we have a Semantic Scholar TL;DR that we can use
      if (paper.s2Tldr) {
        // Use the existing TL;DR as the generated summary
        return {
          ...paper,
          generatedSummary: paper.s2Tldr
        };
      } else {
        // Generate a summary from metadata
        const generatedSummary = createSummaryFromMetadata(paper);
        return {
          ...paper,
          generatedSummary,
        };
      }
    }
    return paper;
  });
}

/**
 * Creates a summary from available paper metadata
 */
function createSummaryFromMetadata(paper: Paper): string {
  const parts: string[] = [];

  // Start with the core information
  let title = "Research Paper";
  if (paper.title) {
    if (Array.isArray(paper.title)) {
      title = paper.title[0] || "Research Paper";
    } else {
      title = paper.title;
    }
  }
  parts.push(`The research paper "${title}"`);

  // Add author information
  if (paper.authors && paper.authors.length > 0) {
    const authorNames = paper.authors.map(a => a.name).filter(Boolean).slice(0, 4);
    if (authorNames.length > 0) {
      let authorsText = "";
      if (authorNames.length === 1) {
        authorsText = `authored by ${authorNames[0]}`;
      } else if (authorNames.length === 2) {
        authorsText = `authored by ${authorNames[0]} and ${authorNames[1]}`;
      } else if (authorNames.length === 3) {
        authorsText = `authored by ${authorNames[0]}, ${authorNames[1]}, and ${authorNames[2]}`;
      } else if (authorNames.length >= 4) {
        authorsText = `authored by ${authorNames[0]}, ${authorNames[1]}, and ${authorNames.length - 2} other authors`;
      }
      parts.push(authorsText);
    }
  }

  // Add year and venue information
  let pubInfo = "";
  if (paper.year && paper.venue) {
    pubInfo = `was published in ${paper.venue} in ${paper.year}.`;
  } else if (paper.year) {
    pubInfo = `was published in ${paper.year}.`;
  } else if (paper.venue) {
    pubInfo = `was published in ${paper.venue}.`;
  } else {
    pubInfo = `is a research paper.`;
  }
  parts.push(pubInfo);

  // Describe the source and accessibility
  if (paper.sources && paper.sources.length > 0) {
    const sourcesText = paper.sources.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' and ');
    parts.push(`This work was retrieved from ${sourcesText},`);
  }

  // Include citation count if available
  if (paper.metadata.citationCount && paper.metadata.citationCount > 0) {
    parts.push(`and has received ${paper.metadata.citationCount} citation${paper.metadata.citationCount !== 1 ? 's' : ''}.`);
  } else {
    parts.push(`and appears to be a significant contribution to its field.`);
  }

  // Add specific source information
  if (paper.sourceIds.arxivId) {
    parts.push(`The paper is available as a preprint on arXiv with ID ${paper.sourceIds.arxivId}.`);
  } else if (paper.sourceIds.doi) {
    parts.push(`A DOI has been assigned to this work: ${paper.sourceIds.doi}.`);
  } else if (paper.sourceIds.openAlexId) {
    parts.push(`This paper is indexed in OpenAlex which provides comprehensive academic metadata.`);
  } else if (paper.sourceIds.semanticScholarId) {
    parts.push(`The paper is cataloged in Semantic Scholar's extensive academic database.`);
  }

  // Add field of study if available
  if (paper.s2FieldsOfStudy && paper.s2FieldsOfStudy.length > 0) {
    const fields = paper.s2FieldsOfStudy.slice(0, 3).join(', ');
    parts.push(`The research falls within the ${fields} domains.`);
  }

  // Combine parts into a coherent summary
  let summary = parts.join(' ').replace(/\s+/g, ' ').trim();

  // Ensure proper sentence structure
  if (!summary.endsWith('.')) {
    summary += '.';
  }

  // Limit to 3-5 sentences
  const sentences = summary.split('. ').filter(s => s.trim() !== '');
  if (sentences.length > 5) {
    return sentences.slice(0, 5).join('. ') + '.';
  }

  return summary;
}

/**
 * Generate a short summary for papers that have limited information
 */
export function generateShortSummary(paper: Paper): string {
  if (paper.abstract) {
    // Return a truncated version of the abstract if it exists
    const abstract = paper.abstract;
    if (abstract.length <= 200) return abstract;
    return abstract.substring(0, 197) + '...';
  }
  
  if (paper.generatedSummary) {
    return paper.generatedSummary;
  }
  
  // Fallback: create a minimal summary from available data
  let title = 'Untitled Paper';
  if (paper.title) {
    if (Array.isArray(paper.title)) {
      title = paper.title[0] || 'Untitled Paper';
    } else {
      title = paper.title;
    }
  }
  const year = paper.year ? ` (${paper.year})` : '';
  const venue = paper.venue ? ` published in ${paper.venue}` : '';
  
  return `${title}${year}${venue}.`;
}