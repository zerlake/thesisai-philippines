/**
 * Multi-Modal AI Generator
 * Phase 5 Sprint 3: Extended Capabilities
 *
 * Generates various content formats:
 * - Diagrams and flowcharts
 * - Charts and visualizations
 * - Presentation slides
 * - Video scripts
 * - Infographics
 */

export interface MultiModalRequest {
  type: ContentType;
  input: ContentInput;
  options: GenerationOptions;
}

export type ContentType =
  | 'diagram'
  | 'flowchart'
  | 'chart'
  | 'infographic'
  | 'presentation'
  | 'video-script'
  | 'mind-map'
  | 'timeline';

export interface ContentInput {
  text?: string;
  data?: DataSet;
  concepts?: string[];
  title?: string;
  description?: string;
  context?: string;
}

export interface DataSet {
  labels: string[];
  values: number[];
  series?: DataSeries[];
  metadata?: Record<string, any>;
}

export interface DataSeries {
  name: string;
  data: number[];
  color?: string;
}

export interface GenerationOptions {
  style?: 'academic' | 'professional' | 'minimal' | 'colorful';
  format?: 'svg' | 'png' | 'mermaid' | 'html' | 'markdown';
  dimensions?: { width: number; height: number };
  colorScheme?: string[];
  includeLabels?: boolean;
  animated?: boolean;
}

export interface GeneratedContent {
  id: string;
  type: ContentType;
  content: string;
  format: string;
  metadata: ContentMetadata;
  preview?: string;
  alternativeVersions?: string[];
}

export interface ContentMetadata {
  generatedAt: Date;
  inputSummary: string;
  style: string;
  dimensions?: { width: number; height: number };
  processingTime: number;
}

export interface DiagramSpec {
  type: 'sequence' | 'class' | 'entity-relationship' | 'state' | 'component';
  title: string;
  elements: DiagramElement[];
  connections: DiagramConnection[];
}

export interface DiagramElement {
  id: string;
  label: string;
  type: string;
  properties?: Record<string, string>;
}

export interface DiagramConnection {
  from: string;
  to: string;
  label?: string;
  type?: 'solid' | 'dashed' | 'dotted';
  direction?: 'forward' | 'backward' | 'both';
}

export interface FlowchartSpec {
  title: string;
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
}

export interface FlowchartNode {
  id: string;
  label: string;
  type: 'start' | 'end' | 'process' | 'decision' | 'io' | 'subprocess';
}

export interface FlowchartEdge {
  from: string;
  to: string;
  label?: string;
  condition?: string;
}

export interface PresentationSlide {
  title: string;
  content: string[];
  notes?: string;
  layout: 'title' | 'content' | 'two-column' | 'image' | 'quote';
  visualElements?: string[];
}

export interface VideoScript {
  title: string;
  duration: number; // seconds
  scenes: VideoScene[];
  narration: string;
}

export interface VideoScene {
  id: string;
  duration: number;
  visual: string;
  narration: string;
  transition?: string;
}

export class MultiModalGenerator {
  private defaultOptions: GenerationOptions = {
    style: 'academic',
    format: 'mermaid',
    includeLabels: true,
    animated: false,
    colorScheme: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
  };

  /**
   * Generate content based on request
   */
  async generate(request: MultiModalRequest): Promise<GeneratedContent> {
    const startTime = Date.now();
    const options = { ...this.defaultOptions, ...request.options };

    let content: string;
    let format: string = options.format || 'mermaid';

    switch (request.type) {
      case 'diagram':
        content = this.generateDiagram(request.input, options);
        break;
      case 'flowchart':
        content = this.generateFlowchart(request.input, options);
        break;
      case 'chart':
        content = this.generateChart(request.input, options);
        format = 'html';
        break;
      case 'mind-map':
        content = this.generateMindMap(request.input, options);
        break;
      case 'timeline':
        content = this.generateTimeline(request.input, options);
        break;
      case 'presentation':
        content = this.generatePresentation(request.input, options);
        format = 'markdown';
        break;
      case 'video-script':
        content = this.generateVideoScript(request.input, options);
        format = 'markdown';
        break;
      case 'infographic':
        content = this.generateInfographic(request.input, options);
        format = 'html';
        break;
      default:
        throw new Error(`Unsupported content type: ${request.type}`);
    }

    return {
      id: `gen_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type: request.type,
      content,
      format,
      metadata: {
        generatedAt: new Date(),
        inputSummary: this.summarizeInput(request.input),
        style: options.style || 'academic',
        dimensions: options.dimensions,
        processingTime: Date.now() - startTime
      }
    };
  }

  /**
   * Generate diagram (Mermaid format)
   */
  private generateDiagram(input: ContentInput, options: GenerationOptions): string {
    const concepts = input.concepts || this.extractConceptsFromText(input.text || '');
    const title = input.title || 'Concept Diagram';

    // Generate class diagram for concepts
    let mermaid = 'classDiagram\n';
    mermaid += `    note "${title}"\n`;

    // Create classes for each concept
    concepts.forEach((concept, index) => {
      const className = this.sanitizeId(concept);
      mermaid += `    class ${className} {\n`;
      mermaid += `        +String name\n`;
      mermaid += `        +describe()\n`;
      mermaid += `    }\n`;
    });

    // Create relationships between concepts
    for (let i = 0; i < concepts.length - 1; i++) {
      const from = this.sanitizeId(concepts[i]);
      const to = this.sanitizeId(concepts[i + 1]);
      mermaid += `    ${from} --> ${to} : relates to\n`;
    }

    return mermaid;
  }

  /**
   * Generate flowchart (Mermaid format)
   */
  private generateFlowchart(input: ContentInput, options: GenerationOptions): string {
    const text = input.text || '';
    const title = input.title || 'Process Flow';

    // Extract steps from text
    const steps = this.extractStepsFromText(text);

    let mermaid = 'flowchart TD\n';
    mermaid += `    subgraph "${title}"\n`;

    // Start node
    mermaid += `    A([Start]) --> B\n`;

    // Process nodes
    steps.forEach((step, index) => {
      const nodeId = String.fromCharCode(66 + index); // B, C, D, etc.
      const nextId = index < steps.length - 1
        ? String.fromCharCode(67 + index)
        : 'Z';

      // Determine node shape based on content
      if (step.toLowerCase().includes('if') || step.toLowerCase().includes('?')) {
        mermaid += `    ${nodeId}{${this.truncate(step, 30)}} --> |Yes| ${nextId}\n`;
        mermaid += `    ${nodeId} --> |No| ${nextId}\n`;
      } else {
        mermaid += `    ${nodeId}[${this.truncate(step, 40)}] --> ${nextId}\n`;
      }
    });

    // End node
    mermaid += `    Z([End])\n`;
    mermaid += `    end\n`;

    return mermaid;
  }

  /**
   * Generate chart (HTML/Chart.js format)
   */
  private generateChart(input: ContentInput, options: GenerationOptions): string {
    const data = input.data || this.extractDataFromText(input.text || '');
    const title = input.title || 'Data Chart';
    const colors = options.colorScheme || this.defaultOptions.colorScheme!;

    // Determine chart type based on data
    const chartType = data.series ? 'bar' : 'pie';

    const chartConfig = {
      type: chartType,
      data: {
        labels: data.labels,
        datasets: data.series
          ? data.series.map((series, i) => ({
              label: series.name,
              data: series.data,
              backgroundColor: colors[i % colors.length]
            }))
          : [{
              data: data.values,
              backgroundColor: colors.slice(0, data.values.length)
            }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: title
          },
          legend: {
            position: 'bottom'
          }
        }
      }
    };

    return `
<div class="chart-container" style="max-width: 600px; margin: auto;">
  <canvas id="chart_${Date.now()}"></canvas>
</div>
<script>
  new Chart(document.getElementById('chart_${Date.now()}'), ${JSON.stringify(chartConfig, null, 2)});
</script>
`;
  }

  /**
   * Generate mind map (Mermaid format)
   */
  private generateMindMap(input: ContentInput, options: GenerationOptions): string {
    const concepts = input.concepts || this.extractConceptsFromText(input.text || '');
    const title = input.title || 'Mind Map';

    let mermaid = 'mindmap\n';
    mermaid += `  root((${title}))\n`;

    // Group concepts into categories (simplified)
    const categories = this.groupConcepts(concepts);

    Object.entries(categories).forEach(([category, items]) => {
      mermaid += `    ${category}\n`;
      items.forEach(item => {
        mermaid += `      ${item}\n`;
      });
    });

    return mermaid;
  }

  /**
   * Generate timeline (Mermaid format)
   */
  private generateTimeline(input: ContentInput, options: GenerationOptions): string {
    const text = input.text || '';
    const title = input.title || 'Timeline';

    // Extract events from text
    const events = this.extractEventsFromText(text);

    let mermaid = 'timeline\n';
    mermaid += `    title ${title}\n`;

    events.forEach(event => {
      mermaid += `    ${event.date} : ${event.description}\n`;
    });

    return mermaid;
  }

  /**
   * Generate presentation slides
   */
  private generatePresentation(input: ContentInput, options: GenerationOptions): string {
    const text = input.text || '';
    const title = input.title || 'Presentation';

    const slides = this.generateSlides(text, title);

    let markdown = `# ${title}\n\n`;
    markdown += `---\n\n`;

    slides.forEach((slide, index) => {
      markdown += `## ${slide.title}\n\n`;

      slide.content.forEach(point => {
        markdown += `- ${point}\n`;
      });

      if (slide.notes) {
        markdown += `\n> **Notes:** ${slide.notes}\n`;
      }

      if (index < slides.length - 1) {
        markdown += `\n---\n\n`;
      }
    });

    return markdown;
  }

  /**
   * Generate video script
   */
  private generateVideoScript(input: ContentInput, options: GenerationOptions): string {
    const text = input.text || '';
    const title = input.title || 'Video Script';

    const script = this.createVideoScript(text, title);

    let markdown = `# Video Script: ${title}\n\n`;
    markdown += `**Total Duration:** ${script.duration} seconds\n\n`;
    markdown += `---\n\n`;

    script.scenes.forEach((scene, index) => {
      markdown += `## Scene ${index + 1} (${scene.duration}s)\n\n`;
      markdown += `**Visual:** ${scene.visual}\n\n`;
      markdown += `**Narration:**\n> ${scene.narration}\n\n`;
      if (scene.transition) {
        markdown += `*Transition: ${scene.transition}*\n\n`;
      }
      markdown += `---\n\n`;
    });

    markdown += `## Full Narration\n\n`;
    markdown += script.narration;

    return markdown;
  }

  /**
   * Generate infographic (HTML format)
   */
  private generateInfographic(input: ContentInput, options: GenerationOptions): string {
    const data = input.data || this.extractDataFromText(input.text || '');
    const title = input.title || 'Infographic';
    const concepts = input.concepts || this.extractConceptsFromText(input.text || '');
    const colors = options.colorScheme || this.defaultOptions.colorScheme!;

    let html = `
<div class="infographic" style="max-width: 800px; margin: auto; font-family: system-ui; padding: 20px;">
  <h1 style="text-align: center; color: ${colors[0]};">${title}</h1>

  <div class="stats-row" style="display: flex; justify-content: space-around; margin: 30px 0;">
`;

    // Add stat blocks
    data.labels.slice(0, 4).forEach((label, i) => {
      html += `
    <div class="stat-block" style="text-align: center; padding: 20px;">
      <div style="font-size: 48px; font-weight: bold; color: ${colors[i % colors.length]};">
        ${data.values[i]}
      </div>
      <div style="color: #666; margin-top: 10px;">${label}</div>
    </div>
`;
    });

    html += `
  </div>

  <div class="key-points" style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
    <h3 style="color: ${colors[0]};">Key Points</h3>
    <ul style="list-style: none; padding: 0;">
`;

    concepts.slice(0, 5).forEach((concept, i) => {
      html += `
      <li style="padding: 10px 0; border-bottom: 1px solid #ddd; display: flex; align-items: center;">
        <span style="width: 30px; height: 30px; background: ${colors[i % colors.length]}; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: white; margin-right: 15px;">${i + 1}</span>
        ${concept}
      </li>
`;
    });

    html += `
    </ul>
  </div>
</div>
`;

    return html;
  }

  /**
   * Extract concepts from text
   */
  private extractConceptsFromText(text: string): string[] {
    const words = text.split(/\s+/);
    const concepts: Map<string, number> = new Map();

    // Extract noun phrases (simplified)
    for (let i = 0; i < words.length - 1; i++) {
      const bigram = `${words[i]} ${words[i + 1]}`.toLowerCase();
      const clean = bigram.replace(/[^a-z\s]/g, '').trim();

      if (clean.length > 5 && !this.isStopPhrase(clean)) {
        concepts.set(clean, (concepts.get(clean) || 0) + 1);
      }
    }

    // Sort by frequency and return top concepts
    return Array.from(concepts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([concept]) => this.capitalize(concept));
  }

  /**
   * Extract steps from text
   */
  private extractStepsFromText(text: string): string[] {
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];

    // Look for numbered steps or action verbs
    const steps: string[] = [];

    sentences.forEach(sentence => {
      const trimmed = sentence.trim();
      // Check for step indicators
      if (/^\d+[.)]\s*/.test(trimmed) ||
          /^(first|second|third|then|next|finally|lastly)/i.test(trimmed) ||
          /^(step|phase|stage)\s*\d*/i.test(trimmed)) {
        steps.push(trimmed.replace(/^\d+[.)]\s*/, ''));
      }
    });

    // If no explicit steps found, use first few sentences
    if (steps.length === 0) {
      return sentences.slice(0, 5).map(s => s.trim());
    }

    return steps;
  }

  /**
   * Extract data from text
   */
  private extractDataFromText(text: string): DataSet {
    // Look for numbers and their labels
    const numberPattern = /(\d+(?:\.\d+)?)\s*(?:%|percent)?\s*(?:of\s+)?([a-zA-Z\s]+)/gi;
    const labels: string[] = [];
    const values: number[] = [];

    let match;
    while ((match = numberPattern.exec(text)) !== null) {
      values.push(parseFloat(match[1]));
      labels.push(this.capitalize(match[2].trim()));
    }

    // If no data found, create sample data
    if (labels.length === 0) {
      return {
        labels: ['Category A', 'Category B', 'Category C', 'Category D'],
        values: [25, 35, 20, 20]
      };
    }

    return { labels: labels.slice(0, 6), values: values.slice(0, 6) };
  }

  /**
   * Extract events for timeline
   */
  private extractEventsFromText(text: string): Array<{ date: string; description: string }> {
    const events: Array<{ date: string; description: string }> = [];

    // Look for year patterns
    const yearPattern = /(\d{4})\s*[:-]?\s*(.+?)(?:\.|$)/g;
    let match;

    while ((match = yearPattern.exec(text)) !== null) {
      events.push({
        date: match[1],
        description: match[2].trim()
      });
    }

    // If no dated events found, create generic timeline
    if (events.length === 0) {
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
      sentences.slice(0, 5).forEach((sentence, i) => {
        events.push({
          date: `Phase ${i + 1}`,
          description: this.truncate(sentence.trim(), 50)
        });
      });
    }

    return events;
  }

  /**
   * Generate presentation slides from text
   */
  private generateSlides(text: string, title: string): PresentationSlide[] {
    const slides: PresentationSlide[] = [];
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim());

    // Title slide
    slides.push({
      title,
      content: ['Thesis Presentation'],
      layout: 'title'
    });

    // Overview slide
    slides.push({
      title: 'Overview',
      content: paragraphs.slice(0, 3).map(p => this.truncate(p, 100)),
      layout: 'content'
    });

    // Content slides
    paragraphs.forEach((para, index) => {
      if (index < 5) {
        const points = para.match(/[^.!?]+[.!?]+/g) || [para];
        slides.push({
          title: `Key Point ${index + 1}`,
          content: points.slice(0, 4).map(p => this.truncate(p.trim(), 80)),
          layout: 'content',
          notes: `Discuss: ${this.truncate(para, 100)}`
        });
      }
    });

    // Conclusion slide
    slides.push({
      title: 'Conclusion',
      content: ['Summary of key findings', 'Implications', 'Future directions'],
      layout: 'content'
    });

    // Thank you slide
    slides.push({
      title: 'Thank You',
      content: ['Questions?'],
      layout: 'title'
    });

    return slides;
  }

  /**
   * Create video script from text
   */
  private createVideoScript(text: string, title: string): VideoScript {
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim());
    const scenes: VideoScene[] = [];
    let totalNarration = '';

    // Introduction scene
    scenes.push({
      id: 'intro',
      duration: 10,
      visual: `Title card: "${title}"`,
      narration: `Welcome to this presentation on ${title}.`,
      transition: 'fade'
    });
    totalNarration += scenes[0].narration + ' ';

    // Content scenes
    paragraphs.slice(0, 5).forEach((para, index) => {
      const narration = this.truncate(para, 200);
      const duration = Math.max(15, Math.ceil(narration.split(/\s+/).length / 2.5));

      scenes.push({
        id: `scene_${index + 1}`,
        duration,
        visual: `Supporting graphic for: ${this.truncate(para, 50)}`,
        narration,
        transition: 'slide'
      });
      totalNarration += narration + ' ';
    });

    // Conclusion scene
    scenes.push({
      id: 'conclusion',
      duration: 10,
      visual: 'Summary slide with key takeaways',
      narration: 'Thank you for watching. These are the key points to remember.',
      transition: 'fade'
    });
    totalNarration += scenes[scenes.length - 1].narration;

    const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0);

    return {
      title,
      duration: totalDuration,
      scenes,
      narration: totalNarration
    };
  }

  /**
   * Group concepts into categories
   */
  private groupConcepts(concepts: string[]): Record<string, string[]> {
    // Simple categorization based on keywords
    const categories: Record<string, string[]> = {
      'Main Topics': [],
      'Methods': [],
      'Findings': [],
      'Other': []
    };

    const methodKeywords = ['method', 'approach', 'technique', 'analysis', 'study'];
    const findingKeywords = ['result', 'finding', 'outcome', 'conclusion', 'show'];

    concepts.forEach(concept => {
      const lower = concept.toLowerCase();
      if (methodKeywords.some(k => lower.includes(k))) {
        categories['Methods'].push(concept);
      } else if (findingKeywords.some(k => lower.includes(k))) {
        categories['Findings'].push(concept);
      } else if (categories['Main Topics'].length < 3) {
        categories['Main Topics'].push(concept);
      } else {
        categories['Other'].push(concept);
      }
    });

    // Remove empty categories
    return Object.fromEntries(
      Object.entries(categories).filter(([_, items]) => items.length > 0)
    );
  }

  /**
   * Check if phrase is a stop phrase
   */
  private isStopPhrase(phrase: string): boolean {
    const stopPhrases = [
      'the the', 'and the', 'of the', 'in the', 'to the',
      'is a', 'are the', 'was the', 'will be', 'has been'
    ];
    return stopPhrases.includes(phrase);
  }

  /**
   * Sanitize string for use as ID
   */
  private sanitizeId(str: string): string {
    return str.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
  }

  /**
   * Truncate string to max length
   */
  private truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + '...';
  }

  /**
   * Capitalize first letter of each word
   */
  private capitalize(str: string): string {
    return str.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Summarize input for metadata
   */
  private summarizeInput(input: ContentInput): string {
    if (input.title) return input.title;
    if (input.text) return this.truncate(input.text, 50);
    if (input.concepts) return `Concepts: ${input.concepts.slice(0, 3).join(', ')}`;
    return 'Generated content';
  }
}

// Singleton instance
export const multiModalGenerator = new MultiModalGenerator();
