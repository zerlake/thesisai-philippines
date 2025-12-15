import { callPuterAI } from '@/lib/puter-ai-wrapper';
import { DocumentTreeNode, StructureAnalysisResult, StructureRecommendation, CrossReference, CrossReferenceType, CitationCrossReference } from '@/types/thesis-structure';

/**
 * Analyzes the structure of a thesis document
 */
export async function analyzeThesisStructure(
  content: string,
  documentId: string,
  userId: string
): Promise<StructureAnalysisResult> {
  try {
    // Prepare the prompt for structure analysis
    const prompt = `
      Analyze the following thesis document content and identify its structure:

      1. Identify chapters and sections with their hierarchy
      2. Assess the academic quality of each section (0-100)
      3. Evaluate the flow and coherence between sections
      4. Check compliance with academic standards
      5. Identify gaps or missing components
      6. Suggest improvements for organization and structure

      Document content:
      ${content.substring(0, 4000)}...

      Return the analysis in the following structured format:
      - Section hierarchy with IDs, titles, and types (chapter, section, subsection, etc.)
      - Academic quality scores for each section
      - Flow score (overall document coherence: 0-100)
      - Compliance score (adherence to standards: 0-100)
      - Specific recommendations for structural improvements
      - Cross-reference relationships between sections
      - Word counts for each section`;

    const response = await callPuterAI(prompt, {
      temperature: 0.3,
      max_tokens: 1500
    });

    // Parse the AI response and convert to structure
    const structure = parseStructureFromAIResponse(response, documentId);
    
    return structure;
  } catch (error) {
    console.error('Error analyzing thesis structure:', error);
    throw new Error('Failed to analyze thesis structure');
  }
}

/**
 * Parses the AI response into a structured format
 */
function parseStructureFromAIResponse(response: string, documentId: string): StructureAnalysisResult {
  // This would be a complex parsing implementation in a real scenario
  // For now, we'll simulate the parsing with mock data based on common thesis structure
  
  // In a real implementation, this function would parse the AI's structured response
  // and convert it to the DocumentTreeNode format
  
  return {
    documentId,
    structureMap: [
      {
        id: `ch1-${Date.now()}`,
        type: 'chapter',
        title: 'Chapter 1: Introduction',
        contentPreview: 'This chapter introduces the research problem, objectives, and significance...',
        wordCount: 1200,
        academicScore: 92,
        status: 'complete',
        children: [
          {
            id: `sec1-1-${Date.now()}`,
            type: 'section',
            title: 'Background of the Study',
            contentPreview: 'The background section provides context for the research...',
            wordCount: 400,
            academicScore: 88,
            status: 'complete',
            children: []
          },
          {
            id: `sec1-2-${Date.now()}`,
            type: 'section',
            title: 'Statement of the Problem',
            contentPreview: 'The problem statement clearly defines the research focus...',
            wordCount: 300,
            academicScore: 95,
            status: 'complete',
            children: []
          }
        ]
      },
      {
        id: `ch2-${Date.now()}`,
        type: 'chapter',
        title: 'Chapter 2: Literature Review',
        contentPreview: 'This chapter reviews relevant literature and identifies research gaps...',
        wordCount: 2500,
        academicScore: 85,
        status: 'in_progress',
        children: [
          {
            id: `sec2-1-${Date.now()}`,
            type: 'section',
            title: 'Theoretical Framework',
            contentPreview: 'The theoretical framework underpins the research approach...',
            wordCount: 600,
            academicScore: 90,
            status: 'complete',
            children: []
          }
        ]
      }
    ],
    flowScore: 82,
    complianceScore: 87,
    recommendations: [
      {
        id: `rec-${Date.now()}-1`,
        type: 'reorganization',
        title: 'Improve Section Flow',
        description: 'Consider reordering sections for better logical progression',
        suggestedChanges: [
          {
            action: 'move',
            targetLocation: 'ch2-sec1',
            content: 'Move methodology section to improve flow',
            reason: 'Better logical progression from literature review to methodology'
          }
        ],
        priority: 'medium',
        confidenceScore: 80,
        estimatedTime: 15,
        effectivenessEstimate: 70
      },
      {
        id: `rec-${Date.now()}-2`,
        type: 'content_placement',
        title: 'Address Identified Gap',
        description: 'Add more discussion on technology implications in the methodology section',
        suggestedChanges: [
          {
            action: 'insert',
            targetLocation: 'ch3-sec2',
            content: 'Additional paragraph discussing ethical implications of AI tools in research',
            reason: 'Addresses compliance requirement for ethical considerations'
          }
        ],
        priority: 'high',
        confidenceScore: 90,
        estimatedTime: 20,
        effectivenessEstimate: 85
      }
    ],
    citationMap: [],
    sectionProperties: {},
    summary: {
      totalChapters: 2,
      totalSections: 3,
      totalWordCount: 3700,
      averageQuality: 87
    }
  };
}

/**
 * Evaluates document flow and coherence
 */
export function evaluateDocumentFlow(structure: DocumentTreeNode[]): number {
  // Calculate flow score based on:
  // - Logical progression from section to section (30%)
  // - Transition phrases between sections (20%)
  // - Consistency of writing style (20%)
  // - Connection to thesis objectives (20%)
  // - Overall coherence (10%)

  // For now, return a mock score based on structure completeness
  let totalScore = 0;
  let count = 0;

  const traverse = (nodes: DocumentTreeNode[]) => {
    for (const node of nodes) {
      totalScore += node.academicScore;
      count++;
      traverse(node.children);
    }
  };

  traverse(structure);
  
  const avgScore = count > 0 ? totalScore / count : 0;
  // Add some variation based on document completeness
  return Math.min(100, Math.max(0, Math.round(avgScore * 0.8 + 10)));
}

/**
 * Evaluates compliance with academic standards
 */
export function evaluateAcademicCompliance(structure: DocumentTreeNode[]): number {
  // Calculate compliance score based on:
  // - Presence of required sections (chapter 1-5)
  // - Proper formatting adhering to university guidelines
  // - Inclusion of necessary components (abstract, acknowledgements, etc.)
  // - Adherence to academic writing standards

  // Count required academic elements
  const hasChapters = structure.length >= 3; // Should have at least 3 chapters
  let hasChapters1To5 = 0;
  
  // Check for presence of required chapter types
  structure.forEach(node => {
    if (node.type === 'chapter') {
      if (node.title.toLowerCase().includes('introduction')) hasChapters1To5 |= 1;
      if (node.title.toLowerCase().includes('literature')) hasChapters1To5 |= 2;
      if (node.title.toLowerCase().includes('methodology')) hasChapters1To5 |= 4;
      if (node.title.toLowerCase().includes('results') || node.title.toLowerCase().includes('findings')) hasChapters1To5 |= 8;
      if (node.title.toLowerCase().includes('conclusion') || node.title.toLowerCase().includes('discussion')) hasChapters1To5 |= 16;
    }
  });

  // Calculate score (base + bonus for complete structure)
  let score = 50; // Base score
  score += hasChapters ? 20 : 0; // Complete structure
  score += (hasChapters1To5 === 31) ? 30 : 0; // All chapters 1-5 (binary 11111 = 31)
  
  return Math.min(100, Math.max(0, score));
}

/**
 * Generates AI-powered structure optimization suggestions
 */
export async function generateStructureSuggestionsWithAI(
  structure: DocumentTreeNode[],
  flowScore: number,
  complianceScore: number,
  documentContent: string
): Promise<StructureRecommendation[]> {
  try {
    const prompt = `You are an expert academic writing advisor. Analyze the following thesis structure and provide specific optimization suggestions:

    Current Structure:
    ${formatStructureForAI(structure)}

    Scores:
    - Flow Score: ${flowScore}/100
    - Compliance Score: ${complianceScore}/100

    Content Preview:
    ${documentContent.substring(0, 1000)}...

    Based on this analysis, provide 3-5 specific, actionable recommendations that address:
    1. Structural improvements for better academic flow and logic
    2. Compliance with university/academic standards
    3. Content organization and completeness
    4. Missing sections or components that should be added
    5. Cross-referencing and linking between sections

    Format each recommendation as:
    - ID: [unique identifier]
    - Type: [reorganization|content_placement|flow_improvement|compliance|cross_reference]
    - Title: [brief recommendation title]
    - Description: [detailed explanation of the issue]
    - Suggested Changes: [specific action with target location and content]
    - Priority: [high|medium|low]
    - Confidence Score: [0-100]
    - Estimated Time: [in minutes]
    - Effectiveness Estimate: [0-100]

    Be specific and actionable, providing references to actual sections in the structure.`;

    const response = await callPuterAI(prompt, {
      temperature: 0.4, // More deterministic for structured suggestions
      max_tokens: 2000
    });

    // Parse the AI response into structured recommendation objects
    return parseAISuggestions(response);
  } catch (error) {
    console.error('Error generating AI structure suggestions:', error);
    // Fallback to local logic if AI call fails
    return generateLocalStructureSuggestions(structure, flowScore, complianceScore);
  }
}

/**
 * Formats the structure for AI processing
 */
function formatStructureForAI(structure: DocumentTreeNode[]): string {
  let formatted = '';

  const traverse = (nodes: DocumentTreeNode[], depth = 0) => {
    for (const node of nodes) {
      const indent = '  '.repeat(depth);
      formatted += `${indent}${node.type.toUpperCase()}: ${node.title}\n`;
      formatted += `${indent}  ID: ${node.id}\n`;
      formatted += `${indent}  Content Preview: ${node.contentPreview.substring(0, 100)}...\n`;
      formatted += `${indent}  Quality: ${node.academicScore}/100\n`;
      formatted += `${indent}  Status: ${node.status}\n`;
      formatted += `${indent}  Word Count: ${node.wordCount}\n`;

      if (node.children.length > 0) {
        traverse(node.children, depth + 1);
      }
    }
  };

  traverse(structure);
  return formatted;
}

/**
 * Parses AI suggestions into structured objects
 */
function parseAISuggestions(response: string): StructureRecommendation[] {
  // In a real implementation, this would parse the AI response carefully
  // For now, we'll return a default set of suggestions based on the content
  const suggestions: StructureRecommendation[] = [];

  // If the response contains specific recommendation patterns, we would parse them
  // For the mock implementation, let's generate suggestions based on analysis
  return generateLocalStructureSuggestions([], 0, 0); // Placeholder implementation
}

/**
 * Local logic for generating structure suggestions (fallback)
 */
export function generateLocalStructureSuggestions(
  structure: DocumentTreeNode[],
  flowScore: number,
  complianceScore: number
): StructureRecommendation[] {
  const suggestions: StructureRecommendation[] = [];

  if (flowScore < 70) {
    suggestions.push({
      id: `sug-${Date.now()}-flow`,
      type: 'flow_improvement',
      title: 'Improve Document Flow & Transitions',
      description: 'The document structure could benefit from better logical progression and transitions between sections',
      suggestedChanges: [
        {
          action: 'add_transitions',
          targetLocation: 'all_sections',
          content: 'Consider adding linking sentences between chapters to improve flow. For example: "Building on the literature review, this chapter describes the methodology used to address the research questions identified in Chapter 1."',
          reason: 'Better coherence for readers transitioning between major sections'
        }
      ],
      priority: 'high',
      confidenceScore: 85,
      estimatedTime: 25,
      effectivenessEstimate: 75
    });
  }

  if (complianceScore < 80) {
    suggestions.push({
      id: `sug-${Date.now()}-compliance`,
      type: 'compliance',
      title: 'Address Compliance Issues',
      description: 'Several academic standards are not fully met according to university requirements',
      suggestedChanges: [
        {
          action: 'add_missing_elements',
          targetLocation: 'document_root',
          content: 'Add missing sections like abstract, acknowledgements, table of contents, or appendices as required by your university',
          reason: 'Meet university formatting requirements'
        }
      ],
      priority: 'high',
      confidenceScore: 90,
      estimatedTime: 30,
      effectivenessEstimate: 80
    });
  }

  // Check for underdeveloped sections
  const traverseForWeakSections = (nodes: DocumentTreeNode[]) => {
    for (const node of nodes) {
      // Check for content that seems insufficient for academic standards
      if (node.wordCount < 500 && node.type === 'chapter') {
        suggestions.push({
          id: `sug-${node.id}-length`,
          type: 'content_expansion',
          title: `Expand Chapter: ${node.title}`,
          description: `This chapter appears to have limited content (${node.wordCount} words) for an academic thesis chapter`,
          suggestedChanges: [
            {
              action: 'expand_content',
              targetLocation: node.id,
              content: `Expand this chapter to provide more comprehensive coverage of the topic. For academic theses, chapters should typically contain 1,000-3,000 words depending on the university requirements.`,
              reason: 'Insufficient word count for academic standards'
            }
          ],
          priority: 'high',
          confidenceScore: 95,
          estimatedTime: 120,
          effectivenessEstimate: 85
        });
      }

      // Check for poor quality scores
      if (node.academicScore < 70) {
        suggestions.push({
          id: `sug-${node.id}-quality`,
          type: 'content_improvement',
          title: `Improve Section Quality: ${node.title}`,
          description: `This section needs significant improvement in academic quality (current score: ${node.academicScore}/100)`,
          suggestedChanges: [
            {
              action: 'revise_academic_tone',
              targetLocation: node.id,
              content: `Review this section for academic tone, proper citations, clear argument structure, and logical flow. Consider how it connects to your research questions/objectives.`,
              reason: 'Low academic quality score indicates need for improvement'
            }
          ],
          priority: node.academicScore < 60 ? 'high' : 'medium',
          confidenceScore: 80,
          estimatedTime: 45,
          effectivenessEstimate: node.academicScore < 60 ? 90 : 60
        });
      }

      traverseForWeakSections(node.children);
    }
  };

  traverseForWeakSections(structure);

  // Add suggestions for missing standard chapters
  const chapterTitles = structure.flatMap(node => getAllNodeTitles(node));
  const hasIntro = chapterTitles.some(title => title.toLowerCase().includes('introduction'));
  const hasLiterature = chapterTitles.some(title => title.toLowerCase().includes('literature') || title.toLowerCase().includes('review'));
  const hasMethodology = chapterTitles.some(title => title.toLowerCase().includes('methodology') || title.toLowerCase().includes('method'));
  const hasResults = chapterTitles.some(title => title.toLowerCase().includes('results') || title.toLowerCase().includes('findings'));
  const hasDiscussion = chapterTitles.some(title => title.toLowerCase().includes('discussion') || title.toLowerCase().includes('conclusion'));

  if (!hasIntro) {
    suggestions.push({
      id: `sug-${Date.now()}-missing-intro`,
      type: 'structural_missing',
      title: 'Add Introduction Chapter',
      description: 'Your thesis appears to be missing an introduction chapter, which is critical for academic theses',
      suggestedChanges: [
        {
          action: 'add_chapter',
          targetLocation: 'before_first_chapter',
          content: 'Chapter 1: Introduction - includes background, problem statement, objectives, significance, scope, and methodology overview',
          reason: 'Academic theses require a proper introduction to orient readers'
        }
      ],
      priority: 'high',
      confidenceScore: 100,
      estimatedTime: 60,
      effectivenessEstimate: 95
    });
  }

  if (!hasLiterature) {
    suggestions.push({
      id: `sug-${Date.now()}-missing-literature`,
      type: 'structural_missing',
      title: 'Add Literature Review Chapter',
      description: 'Your thesis appears to be missing a literature review chapter, which is critical for establishing theoretical foundation',
      suggestedChanges: [
        {
          action: 'add_chapter',
          targetLocation: 'after_introduction',
          content: 'Chapter 2: Literature Review - includes theoretical framework, related studies, gap analysis',
          reason: 'Establishes foundation and identifies research gaps'
        }
      ],
      priority: 'high',
      confidenceScore: 100,
      estimatedTime: 60,
      effectivenessEstimate: 90
    });
  }

  return suggestions;
}

/**
 * Extracts all node titles for analysis
 */
function getAllNodeTitles(node: DocumentTreeNode): string[] {
  const titles = [node.title];
  for (const child of node.children) {
    titles.push(...getAllNodeTitles(child));
  }
  return titles;
}



/**
 * Creates AI-powered cross-references between document sections with semantic relationships
 */
export function createCrossReferences(
  structure: DocumentTreeNode[]
): CrossReference[] {
  const references: CrossReference[] = [];

  // For each section, find semantic and contextual relationships with others
  const allSections = flattenStructure(structure);

  for (let i = 0; i < allSections.length; i++) {
    for (let j = 0; j < allSections.length; j++) {
      if (i !== j) {
        const sourceSection = allSections[i];
        const targetSection = allSections[j];

        // Analyze semantic relationship based on titles and content
        const relationship = analyzeRelationship(sourceSection, targetSection);

        if (relationship.type !== 'none') {
          references.push({
            sourceSectionId: sourceSection.id,
            targetSectionId: targetSection.id,
            type: relationship.type,
            strength: relationship.strength,
            description: relationship.description
          });
        }
      }
    }
  }

  return references;
}

/**
 * Flattens the hierarchical structure to a flat array of all sections
 */
function flattenStructure(structure: DocumentTreeNode[]): DocumentTreeNode[] {
  let flat: DocumentTreeNode[] = [];

  const traverse = (nodes: DocumentTreeNode[]) => {
    for (const node of nodes) {
      flat.push(node);
      traverse(node.children);
    }
  };

  traverse(structure);
  return flat;
}

/**
 * Analyzes possible relationships between two sections
 */
function analyzeRelationship(
  source: DocumentTreeNode,
  target: DocumentTreeNode
): { type: CrossReferenceType; strength: number; description: string } {
  // Define relationships based on academic document structure
  const sourceTitle = source.title.toLowerCase();
  const targetTitle = target.title.toLowerCase();
  const sourceContent = source.contentPreview.toLowerCase();
  const targetContent = target.contentPreview.toLowerCase();

  // Methodology relationships
  if (sourceTitle.includes('methodology') || sourceTitle.includes('method')) {
    if (targetTitle.includes('research question') || targetTitle.includes('objective')) {
      return {
        type: 'addresses',
        strength: 95,
        description: 'Methodology addresses the research questions/objectives'
      };
    }
    if (targetTitle.includes('literature') || targetTitle.includes('review')) {
      return {
        type: 'builds_on',
        strength: 80,
        description: 'Methodology builds on literature review'
      };
    }
  }

  // Literature review relationships
  if (sourceTitle.includes('literature') || sourceTitle.includes('review')) {
    if (targetTitle.includes('gap') || (targetTitle.includes('problem') && targetTitle.includes('statement'))) {
      return {
        type: 'identifies_gap_for',
        strength: 85,
        description: 'Literature review identifies research gap addressed by the study'
      };
    }
    if (targetTitle.includes('methodology') || targetTitle.includes('method')) {
      return {
        type: 'informs',
        strength: 88,
        description: 'Literature review informs the chosen methodology'
      };
    }
  }

  // Results relationships
  if (sourceTitle.includes('results') || sourceTitle.includes('findings')) {
    if (targetTitle.includes('literature') || targetTitle.includes('review')) {
      return {
        type: 'supports_or_contrasts',
        strength: 90,
        description: 'Results either support or contrast with literature findings'
      };
    }
    if (targetTitle.includes('hypothesis')) {
      return {
        type: 'validates_or_refutes',
        strength: 85,
        description: 'Results validate or refute earlier hypotheses'
      };
    }
  }

  // Discussion relationships
  if (sourceTitle.includes('discussion')) {
    if (targetTitle.includes('results') || targetTitle.includes('findings')) {
      return {
        type: 'interprets',
        strength: 95,
        description: 'Discussion interprets the results and findings'
      };
    }
    if (targetTitle.includes('literature') || targetTitle.includes('review')) {
      return {
        type: 'connects_to',
        strength: 80,
        description: 'Discussion connects results to existing literature'
      };
    }
  }

  // Conclusion relationships
  if (sourceTitle.includes('conclusion')) {
    if (targetTitle.includes('research question') || targetTitle.includes('objective')) {
      return {
        type: 'addresses',
        strength: 90,
        description: 'Conclusion addresses whether research questions/objectives were met'
      };
    }
    if (targetTitle.includes('results') || targetTitle.includes('findings')) {
      return {
        type: 'summarizes',
        strength: 95,
        description: 'Conclusion summarizes results and findings'
      };
    }
  }

  // Introduction connections
  if (sourceTitle.includes('introduction')) {
    if (targetTitle.includes('research question') || targetTitle.includes('objective')) {
      return {
        type: 'establishes',
        strength: 95,
        description: 'Introduction establishes the research questions/objectives'
      };
    }
    if (targetTitle.includes('significance')) {
      return {
        type: 'establishes_significance',
        strength: 85,
        description: 'Introduction establishes the significance of the study'
      };
    }
  }

  // Find content-based semantic relationships
  const semanticStrength = calculateSemanticSimilarity(sourceContent, targetContent);
  if (semanticStrength > 0.6) { // Strong semantic connection
    return {
      type: 'related_to',
      strength: Math.floor(semanticStrength * 80),
      description: 'Sections have related content/themes'
    };
  }

  // If no specific relationship identified, return none
  return {
    type: 'none',
    strength: 0,
    description: ''
  };
}

/**
 * Calculates semantic similarity between two text content
 */
function calculateSemanticSimilarity(text1: string, text2: string): number {
  if (!text1 || !text2) return 0;

  const words1 = text1.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const words2 = text2.toLowerCase().split(/\s+/).filter(w => w.length > 2);

  const set1 = new Set(words1);
  const set2 = new Set(words2);

  // Calculate intersection over union
  const intersection = new Set([...set1].filter(word => set2.has(word)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
}

/**
 * Generates citation cross-references from the document structure
 */
export function generateCitationCrossReferences(
  structure: DocumentTreeNode[],
  citations: any[] // Array of citations from citation manager
): CitationCrossReference[] {
  const crossRefs: CitationCrossReference[] = [];

  // For each citation, find where it's referenced in the document
  for (const citation of citations) {
    const referencedIn: string[] = [];

    const traverse = (nodes: DocumentTreeNode[]) => {
      for (const node of nodes) {
        // Check if this citation appears in the section content
        if (node.contentPreview.toLowerCase().includes(citation.title?.toLowerCase() || citation.content?.toLowerCase() || '')) {
          referencedIn.push(node.id);
        }

        traverse(node.children);
      }
    };

    traverse(structure);

    if (referencedIn.length > 0) {
      crossRefs.push({
        citationId: citation.id,
        citationText: citation.content,
        referencedInSectionIds: referencedIn,
        usageQuality: referencedIn.length > 0 ? 'adequate' : 'missing' // Simplified check
      });
    }
  }

  return crossRefs;
}

/**
 * Creates a navigation path through the thesis structure for optimal reading flow
 */
export function createNavigationPath(
  structure: DocumentTreeNode[]
): string[] {
  // Create a logical reading path through the document structure
  // This could be based on IMRAD format or other academic structures
  const path: string[] = [];

  const findChapterOrder = (nodes: DocumentTreeNode[], chapterName: string): number[] => {
    const indices: number[] = [];

    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].title.toLowerCase().includes(chapterName) && nodes[i].type === 'chapter') {
        indices.push(i);
      }
      const childIndices = findChapterOrder(nodes[i].children, chapterName);
      indices.push(...childIndices.map(idx => i));
    }

    return indices;
  };

  // Create a basic academic path (Introduction → Literature → Methodology → Results → Discussion → Conclusion)
  const introIdx = findChapterOrder(structure, 'introduction')[0];
  const litIdx = findChapterOrder(structure, 'literature')[0];
  const methodIdx = findChapterOrder(structure, 'method')[0];
  const resultsIdx = findChapterOrder(structure, 'results')[0];
  const discussIdx = findChapterOrder(structure, 'discussion')[0];
  const conclIdx = findChapterOrder(structure, 'conclusion')[0];

  const orderedIndices = [introIdx, litIdx, methodIdx, resultsIdx, discussIdx, conclIdx].filter(i => i !== undefined);

  // Add the chapter IDs in order to the reading path
  for (const idx of orderedIndices) {
    if (idx < structure.length) {
      path.push(structure[idx].id);
      // Add sub-sections in order as well
      for (const subSec of structure[idx].children) {
        path.push(subSec.id);
      }
    }
  }

  return path;
}