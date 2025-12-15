import { callPuterAI } from '@/lib/puter-ai-wrapper';
import { ExtractedPDFContent } from '@/lib/pdf-parser';

// Define types for content generation
export interface ContentGenerationParams {
  contentType: 'literature_review' | 'summary' | 'synthesis' | 'introduction' | 'methodology' | 'conclusion';
  length: 'short' | 'medium' | 'long';
  customPrompt?: string;
  context?: string;
  citationStyle?: 'apa' | 'mla' | 'chicago' | 'ieee';
}

export interface GeneratedContentResult {
  content: string;
  citations: Citation[];
  sourcesUsed: string[]; // Paper IDs used
  qualityScore: number;
  generationParams: ContentGenerationParams;
}

export interface Citation {
  id: string;
  title: string;
  authors: string[];
  year: number;
  citationText: string;
  sourcePaperId: string;
}

// Service to generate content from PDFs using Puter AI
export class PDFContentGenerationService {
  // Generate different types of content based on PDFs
  async generateContentFromPDFs(
    pdfContents: ExtractedPDFContent[],
    params: ContentGenerationParams
  ): Promise<GeneratedContentResult> {
    try {
      // Prepare context from PDFs
      const context = this.prepareContextFromPDFs(pdfContents, params);
      
      // Create the appropriate prompt based on content type
      const prompt = this.createGenerationPrompt(params, context);
      
      // Call Puter AI
      const generatedText = await callPuterAI(prompt, {
        temperature: 0.7,
        max_tokens: this.getTokensForLength(params.length),
      });
      
      // Generate citations from the PDFs used
      const citations = this.generateCitations(pdfContents, params.citationStyle || 'apa');
      
      // Extract source paper IDs used
      const sourcesUsed = pdfContents.map(pdf => 
        pdf.metadata.title || pdf.metadata.creator || 'Unknown Source'
      );
      
      return {
        content: generatedText,
        citations,
        sourcesUsed,
        qualityScore: this.estimateQualityScore(generatedText, pdfContents),
        generationParams: params
      };
    } catch (error) {
      console.error('Error generating content from PDFs:', error);
      throw new Error('Failed to generate content from PDFs');
    }
  }
  
  // Create a prompt for content generation based on content type
  private createGenerationPrompt(params: ContentGenerationParams, context: string): string {
    let basePrompt = '';
    
    switch (params.contentType) {
      case 'literature_review':
        basePrompt = `You are an expert academic writing assistant. Create a comprehensive literature review based on the provided research papers. The literature review should:\n\n`;
        basePrompt += `- Synthesize key findings from the papers\n`;
        basePrompt += `- Identify common themes and patterns\n`;
        basePrompt += `- Highlight disagreements or gaps in the research\n`;
        basePrompt += `- Provide a coherent narrative structure\n`;
        basePrompt += `- Critically evaluate the methodologies and conclusions\n`;
        basePrompt += `- Include in-text citations in ${params.citationStyle || 'APA'} format\n`;
        break;
        
      case 'summary':
        basePrompt = `You are an expert academic writing assistant. Create a concise summary of the key findings from the provided research papers. The summary should:\n\n`;
        basePrompt += `- Highlight the most important findings\n`;
        basePrompt += `- Maintain academic tone and precision\n`;
        basePrompt += `- Include relevant statistics or data\n`;
        basePrompt += `- Be suitable for inclusion in a thesis\n`;
        basePrompt += `- Include citations in ${params.citationStyle || 'APA'} format\n`;
        break;
        
      case 'synthesis':
        basePrompt = `You are an expert academic writing assistant. Create a research synthesis that integrates findings from the provided papers. The synthesis should:\n\n`;
        basePrompt += `- Combine information from multiple papers to draw new conclusions\n`;
        basePrompt += `- Identify relationships between different research findings\n`;
        basePrompt += `- Discuss implications of the combined research\n`;
        basePrompt += `- Highlight complementary or contradictory findings\n`;
        basePrompt += `- Include proper citations in ${params.citationStyle || 'APA'} format\n`;
        break;
        
      case 'introduction':
        basePrompt = `You are an expert academic writing assistant. Create an academic introduction based on the provided research papers. The introduction should:\n\n`;
        basePrompt += `- Establish the research context and significance\n`;
        basePrompt += `- Clearly state the problem being addressed\n`;
        basePrompt += `- Define key terms and concepts\n`;
        basePrompt += `- Outline the paper's structure\n`;
        basePrompt += `- Use formal academic language\n`;
        basePrompt += `- Include relevant citations in ${params.citationStyle || 'APA'} format\n`;
        break;
        
      case 'methodology':
        basePrompt = `You are an expert academic writing assistant. Create a methodology section based on the approaches described in the provided research papers. The methodology should:\n\n`;
        basePrompt += `- Describe the research design and approach\n`;
        basePrompt += `- Explain data collection methods\n`;
        basePrompt += `- Detail the analytical procedures\n`;
        basePrompt += `- Justify methodological choices\n`;
        basePrompt += `- Include appropriate citations for methodological approaches in ${params.citationStyle || 'APA'} format\n`;
        break;
        
      case 'conclusion':
        basePrompt = `You are an expert academic writing assistant. Create a comprehensive conclusion based on the findings in the provided research papers. The conclusion should:\n\n`;
        basePrompt += `- Summarize the key findings\n`;
        basePrompt += `- Discuss the implications of the research\n`;
        basePrompt += `- Suggest future research directions\n`;
        basePrompt += `- Connect back to the research questions or objectives\n`;
        basePrompt += `- Include citations for key findings in ${params.citationStyle || 'APA'} format\n`;
        break;
        
      default:
        basePrompt = `You are an expert academic writing assistant. Create academic content based on the provided research papers. The content should:\n\n`;
        basePrompt += `- Be well-structured and academically sound\n`;
        basePrompt += `- Synthesize information from the provided papers\n`;
        basePrompt += `- Include proper citations in ${params.citationStyle || 'APA'} format\n`;
        break;
    }
    
    // Add length instructions
    switch (params.length) {
      case 'short':
        basePrompt += `- Keep the content between 200-400 words\n`;
        break;
      case 'medium':
        basePrompt += `- Keep the content between 400-800 words\n`;
        break;
      case 'long':
        basePrompt += `- Keep the content between 800-1200 words\n`;
        break;
    }
    
    // Add any custom prompt instructions
    if (params.customPrompt) {
      basePrompt += `\nAdditional Instructions: ${params.customPrompt}\n`;
    }
    
    basePrompt += `\n\nThe research papers to base this content on are:\n\n${context}`;
    basePrompt += `\n\nGenerate only the requested content in academic style, with proper citations.`;
    
    return basePrompt;
  }
  
  // Prepare context from PDF contents
  private prepareContextFromPDFs(pdfContents: ExtractedPDFContent[], params: ContentGenerationParams): string {
    let context = '';
    
    pdfContents.forEach((pdf, index) => {
      context += `=== Paper ${index + 1} ===\n`;
      context += `Title: ${pdf.metadata.title || 'Unknown Title'}\n`;
      context += `Authors: ${pdf.metadata.author || 'Unknown Authors'}\n`;
      context += `Year: ${pdf.metadata.creationDate ? new Date(pdf.metadata.creationDate).getFullYear() : 'Unknown Year'}\n`;
      
      // Include summary if available
      if (pdf.summary) {
        context += `Summary: ${pdf.summary}\n`;
      }
      
      // Include key sections based on the content type needed
      if (params.contentType === 'methodology') {
        // For methodology, focus on methods sections
        const methodologySections = pdf.sections.filter(section => 
          /methodology|methods|material and methods|experimental|procedure/i.test(section.title)
        );
        if (methodologySections.length > 0) {
          methodologySections.forEach(section => {
            context += `Methodology Section: ${section.title}\n`;
            context += `${section.content.substring(0, 500)}...\n\n`;
          });
        }
      } else if (params.contentType === 'introduction') {
        // For introduction, focus on intro and abstract sections
        const introSections = pdf.sections.filter(section => 
          /abstract|introduction/i.test(section.title)
        );
        if (introSections.length > 0) {
          introSections.forEach(section => {
            context += `Introduction Section: ${section.title}\n`;
            context += `${section.content.substring(0, 500)}...\n\n`;
          });
        }
      } else {
        // For other types, include abstract and key findings
        if (pdf.textContent) {
          // Include beginning of text (often contains introduction) and relevant sections
          const introPart = pdf.textContent.substring(0, 1000);
          context += `Content Preview: ${introPart}...\n\n`;
        }
      }
      
      context += '\n';
    });
    
    return context;
  }
  
  // Generate citations in the requested style
  private generateCitations(pdfContents: ExtractedPDFContent[], style: 'apa' | 'mla' | 'chicago' | 'ieee'): Citation[] {
    return pdfContents.map((pdf, index) => {
      let citationText = '';
      
      // Extract author information
      const authors = pdf.metadata.author || 'Unknown Authors';
      const title = pdf.metadata.title || 'Unknown Title';
      const year = pdf.metadata.creationDate ? new Date(pdf.metadata.creationDate).getFullYear() : new Date().getFullYear();
      
      // Format citation based on requested style
      switch (style) {
        case 'apa':
          citationText = `${authors.split(',')[0]}., ${year}. ${title}.`;
          break;
        case 'mla':
          citationText = `${authors}. "${title}." ${year}.`;
          break;
        case 'chicago':
          citationText = `${authors}. "${title}." ${year}.`;
          break;
        case 'ieee':
          citationText = `${authors}, "${title}," ${year}.`;
          break;
        default:
          citationText = `${authors}, "${title}," ${year}.`;
          break;
      }
      
      return {
        id: `cit-${index}`,
        title: title,
        authors: [authors],
        year: year,
        citationText: citationText,
        sourcePaperId: pdf.metadata.title || `paper-${index}`
      };
    });
  }
  
  // Estimate quality score based on content characteristics
  private estimateQualityScore(content: string, pdfContents: ExtractedPDFContent[]): number {
    // Basic quality heuristics
    let score = 50; // Base score
    
    // Increase score for longer, more detailed content
    if (content.length > 500) score += 20;
    if (content.length > 1000) score += 10;
    
    // Increase score if multiple PDFs were used
    if (pdfContents.length > 1) score += 15;
    if (pdfContents.length > 3) score += 10;
    
    // Increase score if citations appear to be included
    if (content.toLowerCase().includes('citation') || content.toLowerCase().includes('reference') || 
        content.includes('(') && content.includes(')')) {
      score += 15;
    }
    
    // Cap the score between 0 and 100
    return Math.min(100, Math.max(0, score));
  }
  
  // Get appropriate token count based on length
  private getTokensForLength(length: 'short' | 'medium' | 'long'): number {
    switch (length) {
      case 'short': return 600; // ~200-400 words
      case 'medium': return 1200; // ~400-800 words
      case 'long': return 1800; // ~800-1200 words
      default: return 1000;
    }
  }
}

// Create a singleton instance of the service
export const pdfContentGenerationService = new PDFContentGenerationService();

// Helper function to generate content with error handling
export const generateContentFromPDFs = async (
  pdfContents: ExtractedPDFContent[],
  params: ContentGenerationParams
): Promise<GeneratedContentResult> => {
  try {
    return await pdfContentGenerationService.generateContentFromPDFs(pdfContents, params);
  } catch (error) {
    console.error('Error in generateContentFromPDFs helper:', error);
    throw error;
  }
};