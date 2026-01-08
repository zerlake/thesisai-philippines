
export interface ProtectedSpan {
  label: string;
  text: string;
}

/**
 * Extract protected spans from chapter text based on chapter type
 */
export function extractProtectedSpans(chapterId: string, text: string): ProtectedSpan[] {
  const spans: ProtectedSpan[] = [];

  // Normalize text for easier searching (optional, but good for robust matching)
  // We keep original text for the span content though.

  if (chapterId === 'chapter-1') {
    // Protect Research Questions
    const rqMatch = text.match(/(?:Statement of the Problem|Research Questions)[\s\S]*?(?=\n\s*(?:Significance|Scope|Hypothesis|[A-Z][A-Z\s]+)|$)/i);
    if (rqMatch) {
      spans.push({
        label: 'research_questions',
        text: rqMatch[0].trim()
      });
    }

    // Protect Objectives
    const objMatch = text.match(/(?:Objectives of the Study|Research Objectives)[\s\S]*?(?=\n\s*(?:Significance|Scope|Hypothesis|[A-Z][A-Z\s]+)|$)/i);
    if (objMatch) {
      spans.push({
        label: 'research_objectives',
        text: objMatch[0].trim()
      });
    }

    // Protect Hypotheses
    const hypMatch = text.match(/(?:Hypotheses|Hypothesis)[\s\S]*?(?=\n\s*(?:Significance|Scope|Definition|[A-Z][A-Z\s]+)|$)/i);
    if (hypMatch) {
      spans.push({
        label: 'hypotheses',
        text: hypMatch[0].trim()
      });
    }
  }
  else if (chapterId === 'chapter-2') {
    // Protect Theoretical Framework if explicitly labeled
    const tfMatch = text.match(/(?:Theoretical Framework|Conceptual Framework)[\s\S]*?(?=\n\s*(?:Literature|Review|[A-Z][A-Z\s]+)|$)/i);
    if (tfMatch) {
      spans.push({
        label: 'theoretical_framework',
        text: tfMatch[0].trim()
      });
    }
  }
  else if (chapterId === 'chapter-3') {
    // Protect Research Design
    const designMatch = text.match(/(?:Research Design)[\s\S]*?(?=\n\s*(?:Respondents|Participants|Sampling|[A-Z][A-Z\s]+)|$)/i);
    if (designMatch) {
      spans.push({
        label: 'research_design',
        text: designMatch[0].trim()
      });
    }

    // Protect Respondents/Sampling
    const samplingMatch = text.match(/(?:Respondents|Participants|Sampling|Sample)[\s\S]*?(?=\n\s*(?:Instrument|Data Collection|[A-Z][A-Z\s]+)|$)/i);
    if (samplingMatch) {
      spans.push({
        label: 'study_participants',
        text: samplingMatch[0].trim()
      });
    }

    // Protect Instruments
    const instrumentMatch = text.match(/(?:Research Instrument|Instrumentation)[\s\S]*?(?=\n\s*(?:Data Gathering|Data Collection|[A-Z][A-Z\s]+)|$)/i);
    if (instrumentMatch) {
      spans.push({
        label: 'research_instruments',
        text: instrumentMatch[0].trim()
      });
    }
  }
  else if (chapterId === 'chapter-4') {
    // Protect Tables and Figures Captions (simple heuristic)
    const captionMatches = text.matchAll(/^(?:Table|Figure)\s+\d+[\.:].*$/gm);
    for (const match of captionMatches) {
      spans.push({
        label: 'table_figure_caption',
        text: match[0].trim()
      });
    }

    // Protect numeric results blocks? hard to detect reliably with regex without strict formatting
    // But we can look for statistical statements maybe?
    // For now, protecting captions is a safer start.
  }
  else if (chapterId === 'chapter-5') {
    // Protect Conclusions
    const conclusionMatch = text.match(/(?:Conclusion|Conclusions)[\s\S]*?(?=\n\s*(?:Recommendation|Recommendations|[A-Z][A-Z\s]+)|$)/i);
    if (conclusionMatch) {
      spans.push({
        label: 'conclusions_section',
        text: conclusionMatch[0].trim()
      });
    }
  }

  return spans;
}

/**
 * Get specialized prompt for chapter agent
 */
export function getChapterAgentPrompt(chapterId: string): string {
  switch (chapterId) {
    case 'chapter-1':
      return `You are the Introduction Specialist.
Review Chapter 1 for clarity, flow, and strong problem conceptualization.
ENSURE the Research Questions and Objectives are clear and aligned (do not change them, they are protected).
Check that the Significance of the Study logically follows from the problem.`;

    case 'chapter-2':
      return `You are the Literature Review Specialist.
Ensure logical flow and synthesis of studies (not just a list).
Check that the Theoretical Framework is clearly explained.
Identify if transitions between topics are smooth.
Maintain the voice and argumentative structure.`;

    case 'chapter-3':
      return `You are the Methodology Specialist.
Ensure the research design is described clearly.
Check alignment between instruments and the data analysis plan.
Do NOT change the core methodology (participants, design, instruments) unless there are obvious contradictions.`;

    case 'chapter-4':
      return `You are the Results Specialist.
Ensure the narrative accurately describes the data.
Check for "writing efficiency" - avoid repetitive phrasing when describing tables.
Polish the qualitative interpretation of themes.
Do NOT alter key numeric findings.`;

    case 'chapter-5':
      return `You are the Discussion Specialist.
Ensure conclusions directly answer the Research Questions.
Check that recommendations are actionable and based on findings.
Synthesize the overall findings without simply repeating Chapter 4.`;

    default:
      return `You are a Thesis Specialist. Review the content for academic standards, clarity, and coherence.`;
  }
}

/**
 * Safeguard: Calculate token change ratio
 * Simple approximation: compare word counts or character counts
 */
export function calculateChangeRatio(original: string, revised: string): number {
  if (!original) return 1.0;

  // Levenshtein is expensive for large texts.
  // Use simple length difference ratio + Jaccard similarity or just word count diff?
  // Roadmap says "token_change_ratio".

  // Let's use a simple diff of words
  const originalWords = original.split(/\s+/);
  const revisedWords = revised.split(/\s+/);

  const diff = Math.abs(originalWords.length - revisedWords.length);
  const ratio = diff / originalWords.length;

  // This is length change ratio.
  // For true "edit distance" we'd need more complex logic.
  // But for safeguard against "over-rewriting" (e.g. hallucinating or deleting huge chunks), length check is a good first proxy.

  return ratio;
}
