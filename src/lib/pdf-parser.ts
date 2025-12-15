import { toast } from 'sonner';

// Define types for extracted data
export interface PDFMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
  creationDate?: string;
  modificationDate?: string;
  format?: string;
  pageCount?: number;
  fileSize?: number;
}

export interface ExtractedPDFContent {
  metadata: PDFMetadata;
  textContent: string;
  sections: PDFSection[];
  keywords: string[];
  summary: string;
}

export interface PDFSection {
  title: string;
  content: string;
  pageNumber: number;
}

// Function to extract text content from a PDF ArrayBuffer
export async function extractTextFromPDF(pdfBuffer: ArrayBuffer): Promise<string> {
  try {
    // Dynamically import pdfjs-dist when needed
    const pdfjsDist = await import('pdfjs-dist');
    const pdfjsLib = pdfjsDist.default;

    // Set the worker source
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

    // Load PDF
    const pdf = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;

    // Extract text from each page
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      // Extract text items and join them with appropriate spacing
      const pageText = textContent.items
        .map((item: any) => item.str || '')
        .join(' ')
        .replace(/\s+/g, ' ') // Normalize multiple spaces
        .trim();

      fullText += `\n\nPage ${i}:\n${pageText}`;
    }

    return fullText.trim();
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

// Function to extract metadata from a PDF ArrayBuffer
export async function extractMetadataFromPDF(pdfBuffer: ArrayBuffer): Promise<PDFMetadata> {
  try {
    // Dynamically import pdfjs-dist when needed
    const pdfjsDist = await import('pdfjs-dist');
    const pdfjsLib = pdfjsDist.default;

    // Set the worker source
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

    // Load PDF
    const pdf = await pdfjsLib.getDocument({ data: pdfBuffer }).promise;

    // Get metadata
    const metadata = await pdf.getMetadata();
    const info = metadata.info as any; // Explicitly cast to any
    
    return {
      title: info.Title,
      author: info.Author,
      subject: info.Subject,
      keywords: info.Keywords,
      creator: info.Creator,
      producer: info.Producer,
      creationDate: info.CreationDate,
      modificationDate: info.ModDate,
      // format: metadata.contentDispositionFilename, // Removed as it does not exist on type
      pageCount: pdf.numPages,
    };
  } catch (error) {
    console.error('Error extracting metadata from PDF:', error);
    // Return empty metadata but don't throw to allow processing to continue
    return {};
  }
}

// Function to identify sections in the PDF text content
export function identifySections(fullText: string): PDFSection[] {
  const sections: PDFSection[] = [];
  const lines = fullText.split('\n');
  
  // Common academic section headers to look for
  const sectionPatterns = [
    /abstract/i,
    /introduction/i,
    /methodology|methods|material and methods/i,
    /literature review/i,
    /results|findings/i,
    /discussion/i,
    /conclusion/i,
    /references|bibliography/i,
    /appendix/i,
    /acknowledgments/i
  ];

  let currentSection: PDFSection | null = null;
  let currentPage = 1;

  for (const line of lines) {
    // Check if this line is a section header
    const isSectionHeader = sectionPatterns.some(pattern => pattern.test(line.trim()));

    if (isSectionHeader) {
      // If we have a previous section, save it
      if (currentSection && currentSection.content.trim()) {
        sections.push(currentSection);
      }

      // Start a new section
      currentSection = {
        title: line.trim(),
        content: '',
        pageNumber: currentPage
      };
    } else {
      // Add content to current section or add to the last section if no section is active
      if (currentSection) {
        currentSection.content += line + '\n';
      } else if (sections.length > 0) {
        sections[sections.length - 1].content += line + '\n';
      }
    }

    // Update page number if this line indicates a page break
    if (line.startsWith('Page') && line.includes(':') && !currentSection?.title.includes('Page')) {
      const match = line.match(/Page (\d+):/);
      if (match) {
        currentPage = parseInt(match[1], 10);
      }
    }
  }

  // Add the last section if it exists
  if (currentSection && currentSection.content.trim()) {
    sections.push(currentSection);
  }

  return sections;
}

// Function to extract keywords from text
export function extractKeywords(text: string, maxKeywords: number = 10): string[] {
  // Common academic words to exclude
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 
    'as', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 
    'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 
    'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her',
    'us', 'them', 'my', 'your', 'his', 'its', 'our', 'their', 'which', 'who', 'what', 'where',
    'when', 'why', 'how', 'than', 'then', 'now', 'here', 'there', 'so', 'if', 'also', 'very',
    'much', 'more', 'most', 'some', 'many', 'such', 'only', 'own', 'same', 'other', 'new',
    'first', 'last', 'long', 'little', 'large', 'small', 'old', 'young', 'good', 'bad', 'well',
    'better', 'best', 'able', 'research', 'study', 'paper', 'result', 'analysis', 'method',
    'data', 'find', 'show', 'use', 'based', 'effect', 'significance', 'significant', 'paper'
  ]);

  // Split text into words, clean them, and count frequency
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Replace non-word characters with spaces
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.has(word))
    .map(word => word.replace(/[.,;:!?()"\[\]{}]/g, '')); // Remove punctuation

  // Count frequency of each word
  const wordFreq: Record<string, number> = {};
  words.forEach(word => {
    wordFreq[word] = (wordFreq[word] || 0) + 1;
  });

  // Sort words by frequency and return top N
  return Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);
}

// Function to generate a summary from text
export function generateSummary(text: string, maxWords: number = 80): string {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  if (sentences.length === 0) return '';

  // Extract first few sentences that make up to maxWords
  let summary = '';
  let wordCount = 0;

  for (const sentence of sentences) {
    const sentenceWords = sentence.trim().split(/\s+/);
    if (wordCount + sentenceWords.length <= maxWords) {
      summary += sentence.trim() + '. ';
      wordCount += sentenceWords.length;
    } else {
      // Add partial sentence if we still have room
      const remainingWords = maxWords - wordCount;
      if (remainingWords > 0) {
        const partialSentence = sentenceWords.slice(0, remainingWords).join(' ');
        summary += partialSentence + '...';
      }
      break;
    }
  }

  return summary.trim();
}

// Main function to process a PDF file and extract all necessary information
export async function processPDF(pdfFile: File): Promise<ExtractedPDFContent> {
  try {
    // Show processing start
    const toastId = toast.loading(`Processing ${pdfFile.name}...`);
    
    // Convert file to ArrayBuffer
    const arrayBuffer = await pdfFile.arrayBuffer();
    
    // Extract text content
    const textContent = await extractTextFromPDF(arrayBuffer);
    
    // Extract metadata
    const metadata = await extractMetadataFromPDF(arrayBuffer);
    
    // Update file size in metadata
    metadata.fileSize = pdfFile.size;
    
    // Identify sections
    const sections = identifySections(textContent);
    
    // Extract keywords
    const keywords = extractKeywords(textContent);
    
    // Generate summary
    const summary = generateSummary(textContent);
    
    // Update processing status
    toast.success(`${pdfFile.name} processed successfully!`, { id: toastId });
    
    return {
      metadata,
      textContent,
      sections,
      keywords,
      summary
    };
  } catch (error) {
    console.error('Error processing PDF:', error);
    toast.error(`Failed to process ${pdfFile.name}`);
    throw error;
  }
}

// Function to process multiple PDF files
export async function processMultiplePDFs(pdfFiles: File[]): Promise<ExtractedPDFContent[]> {
  const results: ExtractedPDFContent[] = [];
  
  for (const file of pdfFiles) {
    try {
      const result = await processPDF(file);
      results.push(result);
    } catch (error) {
      console.error(`Error processing ${file.name}:`, error);
      // Continue processing other files even if one fails
    }
  }
  
  return results;
}

// Function to analyze PDFs for academic content
export async function analyzeAcademicPDF(pdfFile: File): Promise<ExtractedPDFContent> {
  const content = await processPDF(pdfFile);
  
  // Additional academic-specific analysis
  // Look for academic indicators like references, citations, etc.
  const academicIndicators = {
    hasAbstract: /abstract/i.test(content.textContent.substring(0, 500)),
    hasReferences: /references|bibliography|cited literature/i.test(content.textContent),
    hasCitations: /\(\w+,\s*\d{4}\)|\[.*\d{4}.*\]/.test(content.textContent),
    hasMethodology: /methodology|methods|experimental|procedure/i.test(content.textContent),
    hasResults: /results|findings|data|analysis/i.test(content.textContent),
  };
  
  // Enhance content with academic analysis
  content.metadata = {
    ...content.metadata,
    ...academicIndicators
  };
  
  return content;
}