'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useDocumentSave } from '@/hooks/use-document-save';
import { NovelEditor } from './novel-editor';
import { Button } from '@/components/ui/button';
import { createBrowserClient } from '@/lib/supabase';
import { ChevronDown, BookMarked, RotateCcw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface ThesisEditorProps {
  documentId: string;
  title?: string;
  phase?: 'conceptualize' | 'research' | 'write' | 'submit';
  isReadOnly?: boolean;
  onTitleChange?: (title: string) => void;
}

export function ThesisEditor({
  documentId,
  title: initialTitle = '',
  phase = 'write',
  isReadOnly = false,
  onTitleChange,
}: ThesisEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState<Record<string, any> | null>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const supabase = createBrowserClient();

  const { save, debouncedSave, createCheckpoint, listVersions, restoreVersion, isSaving, lastSaved } =
    useDocumentSave({ documentId, debounceDelay: 2000 });

  // Load initial content
  useEffect(() => {
    const loadDocument = async () => {
      try {
        const { data: doc, error } = await supabase
          .from('documents')
          .select('content_json, content, title, word_count')
          .eq('id', documentId)
          .single();

        if (error) {
          // Document doesn't exist yet (new documents return no rows error)
          // Use sample content if available, otherwise default
          const sample = getSampleContent(documentId);
          setContent(sample.content);
          setTitle(sample.title || '');
          return;
        }

        if (doc) {
          setContent(doc.content_json || getDefaultContent());
          setTitle(doc.title || '');
        } else {
          // Document doesn't exist yet, use sample content
          const sample = getSampleContent(documentId);
          setContent(sample.content);
          setTitle(sample.title || '');
        }
      } catch (err) {
        console.error('Exception loading document:', err);
        // Use default content on error
        setContent(getDefaultContent());
      }
    };

    if (documentId) {
      loadDocument();
    }
  }, [documentId, supabase]);

  const handleContentChange = useCallback(
    (json: Record<string, any>, html: string, plainText: string) => {
      setContent(json);
      const wordCount = plainText.split(/\s+/).filter(Boolean).length;

      // Auto-save with debounce
      debouncedSave({
        documentId,
        contentJson: json,
        contentHtml: html,
        title,
        wordCount,
      });
    },
    [documentId, title, debouncedSave]
  );

  const handleSave = useCallback(
    async (content: Record<string, any>) => {
      await save({
        documentId,
        contentJson: content,
        title,
        createVersion: false,
      });
    },
    [documentId, title, save]
  );

  const handleCreateCheckpoint = async (label: string) => {
    if (!content) {
      toast.error('No content to checkpoint');
      return;
    }

    const success = await createCheckpoint(content, title, label);
    if (success) {
      // Refresh versions list
      loadVersions();
    }
  };

  const loadVersions = async () => {
    setIsLoadingVersions(true);
    const versionsList = await listVersions(true, 20);
    setVersions(versionsList);
    setIsLoadingVersions(false);
  };

  const handleRestoreVersion = async (versionId: string) => {
    const success = await restoreVersion(versionId);
    if (success) {
      // Reload document
      try {
        const { data: doc } = await supabase
          .from('documents')
          .select('content_json, content, title')
          .eq('id', documentId)
          .single();

        if (doc) {
          setContent(doc.content_json);
          setTitle(doc.title || '');
        }
      } catch (err) {
        console.error('Error reloading document:', err);
      }
      setShowVersions(false);
    }
  };

  const getSampleContent = (docId: string): { title: string; content: any } => {
    // Map document IDs to sample content
    const samples: Record<string, { title: string; html: string }> = {
      'chapter-1-main': {
        title: 'Chapter 1 - Introduction',
        html: `<h1>Chapter I: Introduction</h1>
<h2>Background</h2>
<p>The rapid advancement of artificial intelligence in recent years has transformed multiple sectors of society, including education. As academic writing becomes increasingly complex, students require sophisticated tools to enhance their writing quality, structure, and coherence.</p>
<h2>Problem Statement</h2>
<p>Despite the availability of writing assistance tools, many graduate students struggle with organizing complex arguments, maintaining academic tone, and ensuring proper citations. This thesis addresses the gap between current AI capabilities and the specific needs of academic writers.</p>
<h2>Research Objectives</h2>
<ul>
<li>To evaluate the impact of AI-assisted writing tools on academic paper quality</li>
<li>To identify key features that improve student thesis writing outcomes</li>
<li>To propose an integrated system for academic writing support</li>
</ul>`
      },
      'chapter-2-main': {
        title: 'Chapter 2 - Literature Review',
        html: `<h1>Chapter II: Literature Review</h1>
<h2>Historical Context of Academic Writing Support</h2>
<p>Academic writing has been a cornerstone of higher education for centuries. Traditional approaches relied heavily on manual review and peer feedback. With the emergence of computational linguistics in the 1980s, automated writing assessment tools began to develop.</p>
<h2>Evolution of AI in Education</h2>
<p>The integration of artificial intelligence in educational settings has grown exponentially since the introduction of large language models. Early implementations focused on grammar and syntax checking. Current systems provide deeper semantic analysis and contextual suggestions.</p>
<h2>Key Findings</h2>
<p>Recent meta-analyses have shown that students using AI-assisted writing tools show a 23-35% improvement in paper organization and clarity. However, concerns about academic integrity and over-reliance on automation persist in the literature.</p>
<h3>Student Performance Metrics</h3>
<ul>
<li>Organization and structure: 28% improvement</li>
<li>Clarity and readability: 31% improvement</li>
<li>Citation accuracy: 18% improvement</li>
<li>Time spent on writing: 35% reduction</li>
</ul>
<h2>Critical Analysis</h2>
<p>While AI shows promise in academic writing support, several limitations exist. These tools often lack domain-specific knowledge and may provide generic suggestions that don't address discipline-specific conventions.</p>`
      },
      'chapter-3-main': {
        title: 'Chapter 3 - Research Methodology',
        html: `<h1>Chapter III: Research Methodology</h1>
<h2>Research Design</h2>
<p>This study employs a mixed-methods design combining quantitative and qualitative approaches. The quantitative component involves a quasi-experimental design comparing students using AI-assisted writing tools with a control group. The qualitative component includes semi-structured interviews with 15 participants to understand their experiences and perceptions of the technology.</p>
<p><strong>Variables:</strong> The independent variable is the use of AI writing assistance tools (presence/absence). Dependent variables include: paper organization, writing clarity, academic tone, citation accuracy, and time to completion.</p>

<h2>Population and Sampling</h2>
<p><strong>Target Population:</strong> Graduate students (Master's level) from diverse disciplinary backgrounds at universities with enrollment of 5,000+.</p>
<p><strong>Sampling Method:</strong> Purposive stratified sampling was used to recruit 120 quantitative participants and 15 qualitative participants. Inclusion criteria: (1) currently enrolled in graduate program, (2) English as primary language, (3) no prior experience with AI writing tools. Exclusion criteria: students with documented learning disabilities affecting writing, students taking leave of absence.</p>
<p><strong>Sample Characteristics:</strong> Expected demographics: 55% female, average age 26-35 years, 60% from STEM disciplines, 40% from humanities/social sciences.</p>

<h2>Instruments and Data Collection</h2>
<h3>Quantitative Instruments</h3>
<p><strong>Writing Quality Assessment Scale:</strong> A validated 25-item rubric measuring organization (8 items), clarity (7 items), academic tone (5 items), and citations (5 items). Each item scored on 5-point Likert scale.</p>
<ul>
<li>Cronbach's alpha: 0.87 (overall), 0.84 (organization), 0.81 (clarity), 0.78 (tone), 0.82 (citations)</li>
<li>Inter-rater reliability: ICC(2,1) = 0.85 (two independent raters)</li>
</ul>
<p><strong>Time Tracking:</strong> Automated software logs tracked hours spent on writing assignments for both groups over 12-week semester.</p>

<h3>Qualitative Instruments</h3>
<p><strong>Semi-structured Interviews:</strong> 15 open-ended questions exploring user experience, perceived benefits/challenges, and recommendations for improvement. Interviews conducted via Zoom, recorded and transcribed verbatim. Average duration: 45-60 minutes.</p>

<h2>Data Collection Procedures</h2>
<p><strong>Timeline:</strong> Data collection spans one 16-week academic semester (January-April 2024).</p>
<ul>
<li>Week 1: Participant recruitment and informed consent</li>
<li>Week 2: Baseline assessments and group assignment</li>
<li>Weeks 3-15: Intervention period with AI tool access (treatment group only)</li>
<li>Week 16: Final assessments and qualitative interviews</li>
</ul>
<p><strong>Location:</strong> Data collection conducted at three universities across different geographic regions. Quantitative data submitted via learning management system (Canvas). Qualitative interviews conducted remotely via video conference.</p>

<h2>Data Analysis Procedures</h2>
<h3>Quantitative Analysis</h3>
<p>Independent samples t-tests will compare writing quality scores between treatment and control groups. Analysis of Covariance (ANCOVA) will control for baseline writing ability. Effect sizes (Cohen's d) will be reported. Descriptive statistics will summarize time-on-task differences. Statistical significance threshold: α = 0.05. Missing data (expected &lt;5%) will be handled via multiple imputation.</p>

<h3>Qualitative Analysis</h3>
<p>Interview transcripts will undergo thematic analysis following Braun and Clarke's six-phase approach: familiarization, coding, theme development, theme review, definition, and write-up. Two independent coders will analyze 30% of interviews to establish inter-rater reliability (target: Cohen's kappa ≥ 0.75).</p>

<h2>Validity and Reliability</h2>
<h3>Internal Validity</h3>
<p>Potential confounding variables (prior GPA, writing experience, disciplinary background) will be collected and controlled statistically. Random assignment to groups minimizes selection bias. Standardized assessment rubric reduces measurement error.</p>

<h3>External Validity</h3>
<p>Study limitations: Findings may not generalize to undergraduate populations or non-English speaking students. Results specific to this AI tool version and may change with software updates. Geographic and institutional diversity improves transferability.</p>

<h3>Trustworthiness (Qualitative)</h3>
<ul>
<li><strong>Credibility:</strong> Member checking with 5 participants; peer debriefing with research team</li>
<li><strong>Dependability:</strong> Detailed audit trail; protocol documentation; codebook available</li>
<li><strong>Confirmability:</strong> Independent coders; decision trail documented</li>
<li><strong>Transferability:</strong> Rich thick description of context and procedures</li>
</ul>

<h2>Ethical Considerations</h2>
<p><strong>IRB Approval:</strong> This study has received approval from the Institutional Review Board (IRB #2024-0847, approval date: December 1, 2023).</p>
<p><strong>Informed Consent:</strong> All participants complete written informed consent before enrollment. Consent documents explain study purpose, procedures, time commitment (8-10 hours over semester), potential risks, and benefits.</p>
<p><strong>Confidentiality:</strong> All participants assigned unique ID codes. Personal identifiers removed from data files immediately. Audio recordings deleted 30 days after transcription. De-identified transcripts stored on encrypted, password-protected server.</p>
<p><strong>Risks and Mitigation:</strong> Minimal risk study. Potential inconvenience mitigated by providing writing support access to control group post-study. No sensitive personal data collected.</p>`
      },
      'chapter-4-main': {
        title: 'Chapter 4 - Results and Analysis',
        html: `<h1>Chapter IV: Results and Analysis</h1>
<h2>Participant Demographics</h2>
<p>A total of 120 participants completed the study (60 treatment, 60 control). The treatment group consisted of 33 female (55%) and 27 male (45%) participants with mean age of 28.4 years (SD = 3.2). The control group had 32 female (53%) and 28 male (47%) participants with mean age of 27.9 years (SD = 3.8). No significant differences existed between groups on baseline characteristics (p &gt; 0.05).</p>

<h2>Writing Quality Assessment Results</h2>
<h3>Overall Writing Quality Scores</h3>
<p>The treatment group (M = 78.5, SD = 8.2) scored significantly higher on the Writing Quality Assessment Scale than the control group (M = 68.3, SD = 9.4), t(118) = 6.14, p &lt; 0.001, Cohen's d = 1.12 (large effect). This represents a 14.9% improvement in overall writing quality.</p>

<h3>Subscale Analysis</h3>
<table>
<tbody>
<tr><th>Dimension</th><th>Treatment M(SD)</th><th>Control M(SD)</th><th>t-value</th><th>p-value</th><th>Cohen's d</th></tr>
<tr><td>Organization</td><td>19.8(2.1)</td><td>17.2(2.4)</td><td>5.92</td><td>&lt;.001</td><td>1.09</td></tr>
<tr><td>Clarity</td><td>18.3(1.9)</td><td>15.8(2.1)</td><td>5.54</td><td>&lt;.001</td><td>1.01</td></tr>
<tr><td>Academic Tone</td><td>16.7(1.6)</td><td>14.9(1.8)</td><td>4.82</td><td>&lt;.001</td><td>0.88</td></tr>
<tr><td>Citations</td><td>15.4(1.4)</td><td>12.8(2.2)</td><td>6.24</td><td>&lt;.001</td><td>1.14</td></tr>
</tbody>
</table>

<h2>Time-on-Task Analysis</h2>
<p>The treatment group spent significantly less time on writing assignments (M = 12.3 hours, SD = 2.1) compared to the control group (M = 18.9 hours, SD = 2.8), t(118) = 11.32, p &lt; 0.001, Cohen's d = 2.07 (very large effect). This represents a 34.9% reduction in time spent, consistent with our hypothesis.</p>

<h2>Qualitative Findings</h2>
<h3>Emergent Themes</h3>
<p><strong>Theme 1: Enhanced Organization and Structure</strong> (mentioned by 14/15 participants, 93%). Participants reported that the AI tool helped them organize their thoughts logically and maintain consistent argument flow. Representative quote: "The tool suggested how to reorganize my paragraphs, and suddenly my argument made much more sense."</p>

<p><strong>Theme 2: Improved Writing Efficiency</strong> (13/15 participants, 87%). Participants appreciated reduced time spent on drafting and revision. The tool's suggestions accelerated their writing process: "I could focus more on content instead of struggling with how to say it."</p>

<p><strong>Theme 3: Learning Tool Value</strong> (12/15 participants, 80%). Participants viewed the tool as a learning mechanism, improving their writing skills over time: "Using the tool helped me understand better academic writing conventions."</p>

<p><strong>Theme 4: Concerns About Over-reliance</strong> (8/15 participants, 53%). Some participants expressed concern about becoming dependent on the tool: "I worried sometimes if I was really writing or just editing suggestions."</p>

<h2>Validity and Reliability Checks</h2>
<p><strong>Internal Validity:</strong> ANCOVA controlling for baseline writing ability (measured via placement essays) maintained significance of main effect: F(1,117) = 34.52, p &lt; 0.001.</p>

<p><strong>Assumptions Tested:</strong> Levene's test indicated unequal variances (F = 4.23, p = 0.041); Welch's t-test applied and results remained significant. Normality assessed via Q-Q plots; minor deviations noted but sample size sufficient for robustness.</p>

<p><strong>Inter-rater Reliability:</strong> Writing quality assessments by two independent raters showed ICC(2,1) = 0.87, indicating good reliability.</p>

<h2>Summary of Key Findings</h2>
<ul>
<li>AI-assisted writing tool significantly improves overall writing quality (14.9% improvement)</li>
<li>Largest effects observed for organization (12.7% improvement) and citation accuracy (16.4% improvement)</li>
<li>Substantial time savings (34.9% reduction) without compromising quality</li>
<li>Qualitative data supports quantitative findings; participants report enhanced learning and efficiency</li>
<li>Concerns about over-reliance noted by approximately half of participants</li>
</ul>`
      },
      'chapter-5-main': {
        title: 'Chapter 5 - Conclusions and Recommendations',
        html: `<h1>Chapter V: Conclusions and Recommendations</h1>
<h2>Summary of Findings</h2>
<p>This mixed-methods study examined the impact of AI-assisted writing tools on graduate student thesis quality and productivity. The study involved 120 participants over a 16-week semester with comprehensive assessment using both quantitative measures and qualitative interviews.</p>

<h3>Key Quantitative Results</h3>
<ul>
<li>Treatment group demonstrated 14.9% improvement in overall writing quality compared to control group (t(118) = 6.14, p &lt; 0.001)</li>
<li>Largest improvements observed in organization (12.7%) and citations (16.4%)</li>
<li>Time-on-task reduced by 34.9% for treatment group without quality degradation</li>
<li>Results maintained when controlling for baseline writing ability using ANCOVA</li>
</ul>

<h3>Key Qualitative Results</h3>
<ul>
<li>93% of participants reported improved organization and structure</li>
<li>87% valued increased efficiency and reduced time burden</li>
<li>80% appreciated learning benefits and skill development</li>
<li>53% expressed concerns about over-reliance on the tool</li>
</ul>

<h2>Conclusions</h2>
<p>The findings provide strong evidence that AI-assisted writing tools significantly enhance graduate student thesis quality across multiple dimensions. The 14.9% improvement in overall writing quality, combined with substantial time savings, suggests substantial practical value. Importantly, improved efficiency does not come at the cost of quality; students using the tool produced higher-quality work in less time.</p>

<p>The mixed-methods approach provides complementary insights. Quantitative results demonstrate effect sizes across diverse populations, while qualitative data reveals mechanisms and student perceptions. Participants consistently reported that the tool functioned as a learning device, helping them internalize academic writing conventions rather than simply outsourcing the work.</p>

<p>However, the emergence of over-reliance concerns in 53% of participants suggests important caveats. While the tool appears beneficial, thoughtful implementation with clear guidelines about appropriate use is warranted. The tool should be positioned as a learning and productivity aid, not a replacement for student writing effort.</p>

<h2>Implications for Practice</h2>
<p><strong>For Universities:</strong> Institutions should consider implementing AI-assisted writing tools as part of their writing support infrastructure. Recommended approach: integrate tools into writing centers and study skills workshops with trained peer mentors to guide appropriate use and address over-reliance concerns.</p>

<p><strong>For Instructors:</strong> Faculty should explicitly address tool use in course syllabi and assignment guidelines. Clear expectations about when and how to use AI assistance can maximize benefits while maintaining academic integrity. Consider teaching writing sessions that incorporate the tool as part of instruction.</p>

<p><strong>For Students:</strong> Students should view these tools as learning opportunities rather than shortcuts. Most effective use involves: (1) drafting initial work independently, (2) using tool suggestions to refine and improve, (3) critically evaluating all suggestions, (4) reflecting on suggestions to improve future writing.</p>

<h2>Recommendations for Future Research</h2>
<p><strong>Population Expansion:</strong> Future studies should examine impact on undergraduate writers, ESL students, and students in technical disciplines where domain-specific language is critical. Current findings may not generalize to these populations.</p>

<p><strong>Longitudinal Follow-up:</strong> Assess whether writing quality improvements persist post-intervention. Does tool use develop lasting writing skills or create dependency? Multi-semester follow-up needed.</p>

<p><strong>Different Tool Versions:</strong> This study tested one specific tool. How do results vary across different AI platforms? Comparative studies examining feature differences would advance understanding.</p>

<p><strong>Over-reliance Mechanisms:</strong> Deeper investigation of over-reliance concerns is warranted. What specific practices lead to dependency? What pedagogical approaches mitigate this risk?</p>

<p><strong>Academic Integrity:</strong> While not directly assessed, future research should examine tool use in high-stakes assessments and mechanisms to ensure tool use supports rather than replaces learning.</p>

<h2>Limitations</h2>
<p><strong>Generalizability:</strong> Study limited to graduate students from three universities in North America. Results may not generalize to undergraduate populations, international contexts, or non-English writing.</p>

<p><strong>Tool Specificity:</strong> Results specific to this tool version. Software updates and new tools may yield different outcomes. Regular re-evaluation recommended.</p>

<p><strong>Intervention Length:</strong> 16-week semester provides limited long-term perspective. Effects may attenuate or strengthen over longer periods.</p>

<p><strong>Measurement:</strong> Writing quality assessed via single rubric. Complementary measures (faculty evaluation, peer review) would strengthen findings.</p>

<h2>Final Thoughts</h2>
<p>This research contributes evidence that well-designed AI tools can substantially support academic writing development. Rather than replacing human writing effort, effective tools enhance learning by providing immediate, intelligent feedback. As technology continues to evolve, the challenge for educators is thoughtful implementation that maximizes learning benefits while maintaining integrity and student agency. Further research and ongoing dialogue between technologists, educators, and students will help optimize these tools' role in academic development.</p>`
      },
    };

    const sample = samples[docId];
    if (sample) {
      // Convert HTML to TipTap JSON format
      const parser = new DOMParser();
      const doc = parser.parseFromString(sample.html, 'text/html');
      return {
        title: sample.title,
        content: convertHtmlToTipTap(doc.body),
      };
    }

    return {
      title: 'Untitled Document',
      content: getDefaultContent(),
    };
  };

  const convertHtmlToTipTap = (htmlElement: Element) => {
    // Simple HTML to TipTap conversion
    const content: any[] = [];

    const processNode = (node: Node): any[] => {
      const result: any[] = [];

      node.childNodes.forEach((child) => {
        if (child.nodeType === 3) { // Text node
          const text = child.textContent?.trim();
          if (text) {
            result.push({ type: 'text', text });
          }
        } else if (child.nodeType === 1) { // Element node
          const el = child as Element;
          const tag = el.tagName.toLowerCase();

          if (tag === 'h1') {
            result.push({
              type: 'heading',
              attrs: { level: 1 },
              content: processNode(el),
            });
          } else if (tag === 'h2') {
            result.push({
              type: 'heading',
              attrs: { level: 2 },
              content: processNode(el),
            });
          } else if (tag === 'h3') {
            result.push({
              type: 'heading',
              attrs: { level: 3 },
              content: processNode(el),
            });
          } else if (tag === 'p') {
            result.push({
              type: 'paragraph',
              content: processNode(el),
            });
          } else if (tag === 'ul') {
            result.push({
              type: 'bulletList',
              content: Array.from(el.children).map((li) => ({
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: processNode(li),
                  },
                ],
              })),
            });
          } else {
            result.push(...processNode(el));
          }
        }
      });

      return result;
    };

    return {
      type: 'doc',
      content: processNode(htmlElement),
    };
  };

  const getDefaultContent = () => ({
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: 'Thesis Title' }],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Abstract' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Start writing your thesis here...' }],
      },
    ],
  });

  if (!content) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading document...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with title and actions */}
      <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border">
        <div className="flex-1">
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              onTitleChange?.(e.target.value);
            }}
            placeholder="Untitled Document"
            disabled={isReadOnly}
            className="w-full text-2xl font-bold bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-primary focus:outline-none transition-colors disabled:opacity-50"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Version management dropdown */}
          <DropdownMenu open={showVersions} onOpenChange={setShowVersions}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <BookMarked className="h-4 w-4" />
                Versions
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">Document Checkpoints</p>
                {isLoadingVersions && <p className="text-xs text-gray-500">Loading...</p>}
              </div>
              <DropdownMenuSeparator />

              {versions.length === 0 ? (
                <div className="px-2 py-2 text-xs text-gray-500">No checkpoints yet</div>
              ) : (
                versions.map((version) => (
                  <div key={version.id} className="px-2 py-2 flex items-center justify-between gap-2">
                    <div className="text-sm flex-1">
                      <p className="font-medium">{version.checkpoint_label}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(version.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRestoreVersion(version.id)}
                      className="gap-1"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Restore
                    </Button>
                  </div>
                ))
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={loadVersions} disabled={isLoadingVersions}>
                Refresh
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Save status */}
          {lastSaved && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Saved {new Date(lastSaved).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Editor */}
      {content && (
        <NovelEditor
          key={documentId}
          documentId={documentId}
          initialContent={content}
          onContentChange={handleContentChange}
          onSave={handleSave}
          isReadOnly={isReadOnly}
          phase={phase}
          showAITools={!isReadOnly}
          onCreateCheckpoint={handleCreateCheckpoint}
        />
      )}
    </div>
  );
}
