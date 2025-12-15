// App Registry - Defines all available apps in the system
// Each app has input/output schemas and a handler function
import { z } from 'zod';

export type AppInput = Record<string, unknown>;
export type AppOutput = Record<string, unknown>;
export type AppHandler = (input: AppInput) => Promise<AppOutput>;

export interface AppDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'conceptualize' | 'research' | 'write' | 'submit' | 'defense';
  inputSchema: z.ZodSchema;
  outputSchema: z.ZodSchema;
  handler: AppHandler;
}

// Define the registry of apps
export const appRegistry: Record<string, AppDefinition> = {
  'topic-ideation': {
    id: 'topic-ideation',
    name: 'AI-Powered Search',
    description: 'Generate research topic ideas based on your field of interest',
    icon: '🔍',
    category: 'conceptualize',
    inputSchema: z.object({
      fieldOfStudy: z.string().min(1).describe('Field of study or research area'),
      interests: z.string().optional().describe('Specific interests or constraints'),
    }),
    outputSchema: z.object({
      topics: z.array(z.string()).describe('Generated topic ideas'),
    }),
    handler: async (input: AppInput) => {
      // Simulate API call to generate topics
      return {
        topics: [
          `Topic based on ${input.fieldOfStudy}: ${input.interests || 'General'}`,
          `Alternative topic in ${input.fieldOfStudy}`,
          `Innovative approach to ${input.fieldOfStudy}`
        ]
      };
    }
  },
  'problem-statement-refiner': {
    id: 'problem-statement-refiner',
    name: 'Problem-Statement Refiner',
    description: 'Refine and structure your research problem statement',
    icon: '🎯',
    category: 'conceptualize',
    inputSchema: z.object({
      initialStatement: z.string().min(1).describe('Initial problem statement'),
    }),
    outputSchema: z.object({
      refinedStatement: z.string().describe('Refined problem statement'),
      context: z.string().describe('Problem context'),
      gap: z.string().describe('Research gap addressed'),
      significance: z.string().describe('Significance of research'),
    }),
    handler: async (input: AppInput) => {
      return {
        refinedStatement: `Refined: ${input.initialStatement}`,
        context: 'Context for this problem',
        gap: 'Research gap identified',
        significance: 'Why this research matters'
      };
    }
  },
  'ai-search': {
    id: 'ai-search',
    name: 'AI-Powered Search',
    description: 'Find relevant research papers using AI-powered search',
    icon: '🔍',
    category: 'research',
    inputSchema: z.object({
      query: z.string().min(1).describe('Search query'),
      maxResults: z.number().optional().default(5).describe('Max number of results'),
    }),
    outputSchema: z.object({
      results: z.array(z.object({
        title: z.string(),
        url: z.string(),
        summary: z.string(),
      })),
    }),
    handler: async (input: AppInput) => {
      return {
        results: [
          { title: `Search result for ${input.query}`, url: '#', summary: 'Summary of result' },
          { title: `Another result for ${input.query}`, url: '#', summary: 'Another summary' }
        ]
      };
    }
  },
  'rrl-analyzer': {
    id: 'rrl-analyzer',
    name: 'RRL Analyzer',
    description: 'Analyze and extract key points from research papers',
    icon: '📊',
    category: 'research',
    inputSchema: z.object({
      papers: z.array(z.string()).describe('Papers to analyze (URLs or text)'),
    }),
    outputSchema: z.object({
      analysis: z.array(z.object({
        title: z.string(),
        methodology: z.string(),
        findings: z.string(),
        conclusion: z.string(),
        relevance: z.string(),
      })),
    }),
    handler: async (input: AppInput) => {
      return {
        analysis: [
          {
            title: 'Paper Analysis',
            methodology: 'Methodology used in paper',
            findings: 'Key findings from paper',
            conclusion: 'Conclusion of paper',
            relevance: 'How this relates to your research'
          }
        ]
      };
    }
  },
  'rrl-synthesizer': {
    id: 'rrl-synthesizer',
    name: 'RRL Synthesizer',
    description: 'Synthesize multiple research papers into a coherent review',
    icon: '🔗',
    category: 'research',
    inputSchema: z.object({
      papers: z.array(z.object({
        title: z.string(),
        content: z.string(),
        keyPoints: z.array(z.string()),
      })),
    }),
    outputSchema: z.object({
      synthesis: z.string().describe('Synthesized literature review'),
      themes: z.array(z.string()).describe('Identified themes'),
      gaps: z.array(z.string()).describe('Identified research gaps'),
    }),
    handler: async (input: AppInput) => {
      return {
        synthesis: 'Synthesized literature review based on provided papers',
        themes: ['Theme 1', 'Theme 2'],
        gaps: ['Research Gap 1', 'Research Gap 2']
      };
    }
  },
  'methodology-designer': {
    id: 'methodology-designer',
    name: 'Methodology Designer',
    description: 'Design and validate your research methodology',
    icon: '🧪',
    category: 'write',
    inputSchema: z.object({
      researchType: z.enum(['quantitative', 'qualitative', 'mixed']),
      objectives: z.array(z.string()).describe('Research objectives'),
    }),
    outputSchema: z.object({
      methodology: z.string().describe('Suggested methodology'),
      instruments: z.array(z.string()).describe('Suggested instruments'),
      validationSteps: z.array(z.string()).describe('Validation steps'),
    }),
    handler: async (input: AppInput) => {
      return {
        methodology: `Methodology for ${input.researchType} research`,
        instruments: ['Instrument 1', 'Instrument 2'],
        validationSteps: ['Step 1', 'Step 2']
      };
    }
  },
  'chapter-drafter': {
    id: 'chapter-drafter',
    name: 'Chapter Drafter',
    description: 'Draft chapters with AI assistance',
    icon: '✍️',
    category: 'write',
    inputSchema: z.object({
      chapterTitle: z.string().describe('Title of the chapter'),
      outline: z.string().describe('Chapter outline'),
      context: z.string().optional().describe('Additional context'),
    }),
    outputSchema: z.object({
      draft: z.string().describe('Drafted chapter content'),
    }),
    handler: async (input: AppInput) => {
      return {
        draft: `Draft for: ${input.chapterTitle}\n\nOutline: ${input.outline}\n\n${input.context || 'Content here...'}`,
      };
    }
  },
  'defense-simulator': {
    id: 'defense-simulator',
    name: 'Defense Q&A Simulator',
    description: 'Simulate defense questions and practice responses',
    icon: '🎤',
    category: 'defense',
    inputSchema: z.object({
      thesisTitle: z.string().describe('Thesis title'),
      keyPoints: z.array(z.string()).describe('Key points to focus on'),
    }),
    outputSchema: z.object({
      questions: z.array(z.string()).describe('Suggested defense questions'),
      answers: z.array(z.string()).describe('Suggested answers'),
    }),
    handler: async (input: AppInput) => {
      return {
        questions: [`Question about: ${input.thesisTitle}`, 'Another question'],
        answers: ['Answer to question 1', 'Answer to question 2']
      };
    }
  },
  'citation-formatter': {
    id: 'citation-formatter',
    name: 'Citation Cleaner / Formatter',
    description: 'Clean and format citations in various styles',
    icon: '📋',
    category: 'submit',
    inputSchema: z.object({
      citations: z.array(z.string()).describe('Citations to format'),
      style: z.enum(['APA', 'MLA', 'Chicago', 'Harvard']).default('APA'),
    }),
    outputSchema: z.object({
      formattedCitations: z.array(z.string()).describe('Formatted citations'),
    }),
    handler: async (input: AppInput) => {
      const citations = input.citations as string[];
      return {
        formattedCitations: citations.map(c => `[Formatted] ${c} [${input.style}]`)
      };
    }
  },
  'gap-finder': {
    id: 'gap-finder',
    name: 'Gap Finder',
    description: 'Identify research gaps in existing literature',
    icon: '🔍',
    category: 'research',
    inputSchema: z.object({
      literature: z.array(z.string()).describe('Literature to analyze'),
    }),
    outputSchema: z.object({
      gaps: z.array(z.string()).describe('Identified research gaps'),
      opportunities: z.array(z.string()).describe('Research opportunities'),
    }),
    handler: async (input: AppInput) => {
      return {
        gaps: ['Gap 1', 'Gap 2'],
        opportunities: ['Opportunity 1', 'Opportunity 2']
      };
    }
  },
  'slide-generator': {
    id: 'slide-generator',
    name: 'Defense Slide Outline Generator',
    description: 'Generate slide structure for defense presentation',
    icon: '📊',
    category: 'defense',
    inputSchema: z.object({
      thesisTitle: z.string().describe('Thesis title'),
      chapterTitles: z.array(z.string()).describe('Chapter titles'),
    }),
    outputSchema: z.object({
      slides: z.array(z.object({
        title: z.string(),
        content: z.string(),
      })),
    }),
    handler: async (input: AppInput) => {
      return {
        slides: [
          { title: 'Introduction', content: input.thesisTitle },
          { title: 'Chapters', content: (input.chapterTitles as string[]).join(', ') }
        ]
      };
    }
  },
};

// Get apps by category
export const getAppsByCategory = (category: AppDefinition['category']) => {
  return Object.values(appRegistry).filter(app => app.category === category);
};

// Get all apps
export const getAllApps = () => Object.values(appRegistry);

// Get app by ID
export const getAppById = (id: string) => appRegistry[id];

// Helper to get default values for an app's input schema
export const getAppDefaultValues = (app: AppDefinition) => {
  const defaults: Record<string, any> = {};
  const shape = (app.inputSchema as z.ZodObject<any>).shape;

  for (const [key, value] of Object.entries(shape)) {
    const zodValue = value as z.ZodTypeAny;
    const defaultValue = (zodValue as any)._def.defaultValue;

    if (typeof defaultValue === 'function') {
      defaults[key] = defaultValue();
    } else if (zodValue._def.typeName === 'ZodString') {
      defaults[key] = '';
    } else if (zodValue._def.typeName === 'ZodNumber') {
      defaults[key] = 0;
    } else if (zodValue._def.typeName === 'ZodBoolean') {
      defaults[key] = false;
    } else if (zodValue._def.typeName === 'ZodArray') {
      defaults[key] = [];
    } else {
      defaults[key] = '';
    }
  }

  return defaults;
};