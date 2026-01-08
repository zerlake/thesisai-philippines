'use client';

import { useState, useRef, useEffect } from 'react';
import { callPuterAI } from '@/lib/puter-ai-wrapper';
import { useAuth } from '@/components/auth-provider';
import { Button } from './ui/button';
import Link from 'next/link';
import { ThesisFinalizerService } from '@/lib/thesis-finalizer-service';
import { AdvisorComment } from '@/lib/types/advisor-comments';
import { RevisionJob } from '@/lib/types/revision';
import { extractProtectedSpans, getChapterAgentPrompt, calculateChangeRatio } from '@/lib/thesis-sections';

interface ThesisFinalizerProps {
  onSave?: (finalDraft: string, shouldComplete?: boolean) => void;
}

export default function ThesisFinalizer({ onSave }: ThesisFinalizerProps = {}) {
  const [chapterFiles, setChapterFiles] = useState<File[]>([]);
  const [finalDraft, setFinalDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [loadingPremiumStatus, setLoadingPremiumStatus] = useState(true);
  const [isSampleMode, setIsSampleMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { profile, isLoading: authLoading, supabase } = useAuth();
  const finalizerService = new ThesisFinalizerService(supabase);

  useEffect(() => {
    if (!authLoading && profile) {
      const hasPremium = profile.subscription_status === 'active' ||
                        profile.plan_type === 'premium' ||
                        profile.plan === 'pro_plus_advisor' ||
                        profile.plan === 'pro_complete' ||
                        profile.is_pro_user === true ||
                        profile.role === 'admin';
      setIsPremiumUser(hasPremium);
      setLoadingPremiumStatus(false);
    } else if (!authLoading) {
      setLoadingPremiumStatus(false);
    }
  }, [profile, authLoading]);

  // Effect to handle sample mode toggle
  useEffect(() => {
    if (isSampleMode) {
      loadSampleData();
    } else {
      const isCurrentFilesSample = chapterFiles.some(file => file.name.startsWith('chapter') && file.name.endsWith('.txt'));
      if (isCurrentFilesSample) {
        setChapterFiles([]);
      }
    }
  }, [isSampleMode]);

  if (!loadingPremiumStatus && !isPremiumUser) {
    return (
      <div className="p-6 border rounded-lg bg-white shadow-sm">
        <h3 className="text-xl font-bold mb-4 text-slate-900">Thesis Finalizer Pro</h3>
        <p className="text-slate-600 mb-4">
          This premium feature is available exclusively for Pro, Pro + Advisor, and Pro Complete subscribers.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <h4 className="font-bold text-lg text-blue-800 mb-2">Premium Access Required</h4>
          <p className="text-blue-700 mb-4">
            Unlock advanced thesis finalization with our multi-agent AI system
          </p>
          <Button asChild>
            <Link href="/pricing">Upgrade to Premium</Link>
          </Button>
          <p className="text-sm text-blue-600 mt-3">
            Already a Premium user? <Link href="/login" className="text-blue-800 underline">Log in</Link>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-200">
          <h4 className="font-semibold text-slate-900 mb-3">How It Works:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-medium text-slate-800">Parallel AI Agents</p>
              <p>Multiple specialized agents work simultaneously on different aspects of your thesis</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-medium text-slate-800">Cohesion Check</p>
              <p>Ensures logical flow and consistency across all chapters</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-medium text-slate-800">Style Harmonization</p>
              <p>Standardizes voice, tense, and formatting (APA/MLA)</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="font-medium text-slate-800">Citation Validation</p>
              <p>Checks and fixes citations, adds missing references</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loadingPremiumStatus) {
    return (
      <div className="p-6 border rounded-lg bg-white shadow-sm">
        <h3 className="text-xl font-bold mb-4 text-slate-900">Thesis Finalizer Pro</h3>
        <p className="text-slate-600 mb-4">
          Checking your subscription status...
        </p>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const finalizeThesis = async () => {
    if (chapterFiles.length < 3) {
      alert('Please upload at least 3 chapter files');
      return;
    }

    setLoading(true);
    setProgress(`Starting thesis finalization with ${chapterFiles.length} chapters...`);

    try {
      const isAdvisorMode = profile?.plan === 'pro_plus_advisor' || profile?.plan === 'pro_complete' || profile?.role === 'admin';
      let advisorComments: AdvisorComment[] = [];

      if (isAdvisorMode && profile?.id) {
         try {
            const { data: thesisProject } = await supabase
               .from('thesis_projects')
               .select('id')
               .eq('user_id', profile.id)
               .maybeSingle();

            if (thesisProject?.id) {
               advisorComments = await finalizerService.getAdvisorComments(thesisProject.id);
               if (advisorComments.length > 0) {
                  setProgress(`Found ${advisorComments.length} advisor comments to address...`);
               }
            }
         } catch (e) {
            console.error("Error fetching thesis info:", e);
         }
      }

      const chapters = [];
      const chapterMap: Record<string, string> = {};

      for (let i = 0; i < chapterFiles.length; i++) {
        const file = chapterFiles[i];
        const fileName = file.name.replace(/\.[^/.]+$/, "");
        const chapterProgress = Math.round(((i) / chapterFiles.length) * 30);
        setProgress(`Reading: ${fileName} (${chapterProgress}%)...`);

        const chapterText = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve(reader.result as string);
          };
          reader.onerror = () => {
            reject(new Error(`Failed to read file: ${file.name}`));
          };
          reader.readAsText(file);
        });

        chapters.push(chapterText);

        if (fileName.toLowerCase().includes('chapter 1') || fileName.toLowerCase().includes('introduction')) chapterMap['chapter-1'] = chapterText;
        else if (fileName.toLowerCase().includes('chapter 2') || fileName.toLowerCase().includes('literature')) chapterMap['chapter-2'] = chapterText;
        else if (fileName.toLowerCase().includes('chapter 3') || fileName.toLowerCase().includes('methodology')) chapterMap['chapter-3'] = chapterText;
        else if (fileName.toLowerCase().includes('chapter 4') || fileName.toLowerCase().includes('results')) chapterMap['chapter-4'] = chapterText;
        else if (fileName.toLowerCase().includes('chapter 5') || fileName.toLowerCase().includes('conclusion')) chapterMap['chapter-5'] = chapterText;

        const chapterReadProgress = Math.round(((i + 1) / chapterFiles.length) * 30);
        setProgress(`${fileName} read successfully! (${chapterReadProgress}%)`);
      }

      setProgress('Orchestrator AI is analyzing your thesis chapters to plan specialized tasks...');

      const orchestratorRes = await callPuterAI(
        `You are Thesis Orchestrator. Analyze these thesis chapters and assign 6 specific refinement tasks for thesis phases. Include all chapters (Chapter 1 Introduction, Literature Review, Methodology, Results, Discussion, etc.) in the processing. Output JSON: {agents: [{name, prompt, context: "chapter1+chapter2"}]}
Chapters: ${chapters.slice(0, 3).join('\n\n---\n\n')}`,
        { temperature: 0.3, max_tokens: 1000 }
      );

      setProgress('Spawning parallel AI agents...');

      let tasks;
      try {
        const responseText = typeof orchestratorRes === 'string' ? orchestratorRes : JSON.stringify(orchestratorRes);
        const jsonStart = responseText.indexOf('{');
        const jsonEnd = responseText.lastIndexOf('}') + 1;

        if (jsonStart !== -1 && jsonEnd !== 0) {
          const jsonStr = responseText.substring(jsonStart, jsonEnd);
          tasks = JSON.parse(jsonStr).agents;
        } else {
          tasks = JSON.parse(responseText).agents;
        }
      } catch (parseError) {
        console.error('Error parsing orchestrator response:', parseError);
        tasks = [
          { name: 'IntroductionAgent', prompt: 'Review and refine Chapter 1 Introduction for clarity, research objectives, and thesis statement', context: chapters.join('\n\n') },
          { name: 'LiteratureCoherenceAgent', prompt: 'Check logical flow and coherence in literature review chapters', context: chapters.join('\n\n') },
          { name: 'MethodologyAgent', prompt: 'Review and refine methodology chapters for clarity and completeness', context: chapters.join('\n\n') },
          { name: 'ResultsAnalysisAgent', prompt: 'Analyze results chapters for proper interpretation and presentation', context: chapters.join('\n\n') },
          { name: 'ThesisFlowAgent', prompt: 'Ensure smooth transitions between all thesis chapters and consistent academic tone', context: chapters.join('\n\n') },
          { name: 'FinalReviewAgent', prompt: 'Perform final review of entire thesis for academic standards and completeness', context: chapters.join('\n\n') }
        ];
      }

      if (!tasks) {
        throw new Error('Could not parse tasks from orchestrator response');
      }

      const agentResults = [];
      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        const progressPercentage = 30 + Math.round((i / tasks.length) * 55);
        setProgress(`Processing thesis with ${task.name} - Agent ${i + 1}/${tasks.length} (${progressPercentage}%)...`);

        try {
          let result = "";
          let handledByAdvisor = false;

          if (isAdvisorMode && advisorComments.length > 0) {
             let targetChapterId: any = null;
             let textToRevise = task.context;

             if (task.name === 'IntroductionAgent' && chapterMap['chapter-1']) {
                targetChapterId = 'chapter-1';
                textToRevise = chapterMap['chapter-1'];
             } else if (task.name === 'LiteratureCoherenceAgent' && chapterMap['chapter-2']) {
                targetChapterId = 'chapter-2';
                textToRevise = chapterMap['chapter-2'];
             } else if (task.name === 'MethodologyAgent' && chapterMap['chapter-3']) {
                targetChapterId = 'chapter-3';
                textToRevise = chapterMap['chapter-3'];
             } else if (task.name === 'ResultsAnalysisAgent' && chapterMap['chapter-4']) {
                targetChapterId = 'chapter-4';
                textToRevise = chapterMap['chapter-4'];
             } else if (task.name === 'ThesisFlowAgent' && chapterMap['chapter-5']) {
                targetChapterId = 'chapter-5';
                textToRevise = chapterMap['chapter-5'];
             }

             const relevantComments = targetChapterId
                ? advisorComments.filter(c => c.chapter_id === targetChapterId)
                : [];

             if (relevantComments.length > 0 && targetChapterId) {
                setProgress(`Using Advisor-Aligned Revision for ${task.name} with ${relevantComments.length} comments...`);

                const aggregatedComments = relevantComments.map(c => `- ${c.raw_text}`).join('\n');

                const job: RevisionJob = {
                   thesisId: 'temp',
                   chapterId: targetChapterId,
                   scopeId: 'full_chapter',
                   revisionScope: 'chapter',
                   originalText: textToRevise,
                   advisorComments: aggregatedComments,
                   advisorCommentIds: relevantComments.map(c => c.id),
                   studentInstructions: `${task.prompt}\n\n${getChapterAgentPrompt(targetChapterId)}`,
                   protectedSpans: extractProtectedSpans(targetChapterId, textToRevise),
                   rewriteLevel: 'light_revision',
                   outputFormat: 'text_only'
                };

                const revisionResult = await finalizerService.runAdvisorAlignedRevision(job);

                // SAFEGUARD: Check change ratio to prevent over-rewriting
                const changeRatio = calculateChangeRatio(textToRevise, revisionResult.revised_text);
                if (changeRatio > 0.4) {
                   console.warn(`[Safeguard] High change ratio detected: ${(changeRatio * 100).toFixed(1)}%.`);
                   // Append a warning note for the user
                   revisionResult.revised_text += `\n\n[System Note: This revision involved significant changes (${(changeRatio * 100).toFixed(0)}%). Please review protected sections carefully.]`;
                }

                result = revisionResult.revised_text;

                if (revisionResult.advisor_requirements_checklist) {
                   result += `\n\n[Advisor Requirements Addressed:]\n${revisionResult.advisor_requirements_checklist.map((r, idx) => `${idx+1}. ${r} (${revisionResult.requirement_status[idx]})`).join('\n')}`;
                }

                handledByAdvisor = true;
             }
          }

          if (!handledByAdvisor) {
             result = await callPuterAI(
               `You are ${task.name}. ${task.prompt}\n\nContext: ${task.context}`,
               { temperature: 0.5, max_tokens: 2000 }
             );
          }

          agentResults.push({
            name: task.name,
            result: typeof result === 'string' ? result : JSON.stringify(result)
          });

          const completedPercentage = 30 + Math.round(((i + 1) / tasks.length) * 55);
          setProgress(`${task.name} completed! Processing thesis chapters: ${completedPercentage}%`);
        } catch (error) {
          console.error(`Error in ${task.name}:`, error);
          agentResults.push({
            name: task.name,
            result: `Error processing: ${(error as Error).message}`
          });
        }
      }

      setProgress('85% - Final integration AI is synthesizing all agent outputs into a cohesive thesis...');

      const finalRes = await callPuterAI(
        `Merge all agent outputs into ONE cohesive final thesis draft. Ensure flow, APA format, no gaps, and proper thesis chapter structure.

Agent outputs: ${JSON.stringify(agentResults)} + Original thesis chapters: ${chapters.join('\n\n')}`,
        { temperature: 0.4, max_tokens: 4000 }
      );

      const finalDraftContent = typeof finalRes === 'string' ? finalRes : JSON.stringify(finalRes);
      setFinalDraft(finalDraftContent);
      setProgress('100% - Final thesis draft with proper chapter structure generated successfully!');

      if (onSave) {
        onSave(finalDraftContent, false);
      }
    } catch (error) {
      setProgress(`Error occurred: ${(error as Error).message}`);
      console.error("Finalization error:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSampleData = async () => {
    setLoading(true);
    setProgress('Loading sample chapters...');
    try {
      const chapterPaths = [
        'chapter1_introduction.txt',
        'chapter2_review_of_literature.txt',
        'chapter3_methodology.txt',
        'chapter4_results_discussion.txt',
        'chapter5_conclusion_recommendations.txt',
      ];
      const files = await Promise.all(
        chapterPaths.map(async (path) => {
          const response = await fetch(`/sample-chapters/${path}`);
          const text = await response.text();
          return new File([text], path, { type: 'text/plain' });
        })
      );
      setChapterFiles(files);
      setProgress('Sample chapters loaded successfully!');
    } catch (error) {
      console.error('Error loading sample data:', error);
      setProgress(`Error: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setChapterFiles(Array.from(e.target.files));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setChapterFiles(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm">
      <h3 className="text-xl font-bold mb-4 text-slate-900">Thesis Finalizer Pro</h3>
      <p className="text-slate-600 mb-4">
        Upload your thesis chapters and let our multi-agent AI system polish them into a cohesive final draft.
      </p>

      <div
        className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center mb-6 transition-colors hover:border-blue-400"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex items-center justify-center mb-4">
          <label htmlFor="sample-mode-toggle" className="flex items-center cursor-pointer">
            <div className="relative">
              <input
                id="sample-mode-toggle"
                type="checkbox"
                className="sr-only"
                checked={isSampleMode}
                onChange={() => setIsSampleMode(!isSampleMode)}
                disabled={loading}
              />
              <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
              <div
                className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${
                  isSampleMode ? 'translate-x-full bg-blue-500' : ''
                }`}
              ></div>
            </div>
            <div className="ml-3 text-gray-700 font-medium">
              {isSampleMode ? 'Sample Mode ON' : 'Sample Mode OFF'}
            </div>
          </label>
        </div>

        {!isSampleMode && (
          <>
            <label htmlFor="chapter-files-upload" className="cursor-pointer">
              <input
                id="chapter-files-upload"
                data-testid="chapter-files-upload"
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple
                accept=".txt,.doc,.docx,.pdf,.rtf"
                disabled={isSampleMode || loading}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors ${
                  isSampleMode || loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={isSampleMode || loading}
              >
                Select Chapter Files
              </button>
            </label>
            <p className="mt-2 text-slate-600">
              {chapterFiles.length > 0
                ? `${chapterFiles.length} files selected`
                : 'Drag & drop files or click to browse'}
            </p>
          </>
        )}
        {isSampleMode && (
          <p className="mt-2 text-slate-600">
            Sample chapters automatically loaded. Toggle off to upload your own.
          </p>
        )}
        <p className="text-sm text-slate-500 mt-1">
          Supports: .txt, .doc, .docx, .pdf, .rtf files
        </p>
      </div>

      {chapterFiles.length > 0 && (
        <div className="mb-6">
          <h4 className="font-medium text-slate-700 mb-2">Selected Files:</h4>
          <ul className="space-y-1">
            {chapterFiles.map((file, index) => (
              <li key={index} className="text-sm text-slate-600 flex items-center">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={finalizeThesis}
        disabled={loading || chapterFiles.length < 3}
        className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors mb-4 ${
          loading || chapterFiles.length < 3
            ? 'bg-slate-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
            {progress || 'Finalizing Thesis...'}
          </span>
        ) : (
          `Finalize ${chapterFiles.length} Chapters with Multi-Agent AI`
        )}
      </button>

      {progress && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-slate-700">Processing Status</span>
            {progress.includes('%') && (
              <span className="text-sm font-medium text-blue-600">
                {progress.match(/(\d+)%/)?.[0] || '0%'}
              </span>
            )}
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5 mb-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{
                width: (() => {
                  const match = progress.match(/(\d+)%/);
                  return match ? match[1] + '%' : '0%';
                })()
              }}
            ></div>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
              <p className="ml-2 text-blue-800 text-sm">{progress}</p>
            </div>
          </div>
        </div>
      )}

      {finalDraft && (
        <div className="mt-6 border-t border-slate-200 pt-6">
          <h4 className="font-bold text-lg text-slate-900 mb-3">Final Draft Preview:</h4>
          <div className="p-4 bg-slate-50 rounded-lg max-h-96 overflow-auto border border-slate-200">
            <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans">
              {finalDraft}
            </pre>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={() => navigator.clipboard.writeText(finalDraft)}
              className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition-colors"
            >
              Copy to Clipboard
            </button>
            <button
              onClick={() => {
                const blob = new Blob([finalDraft], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'thesis_final_draft.txt';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Download Draft
            </button>
            <button
              onClick={() => {
                if (onSave) {
                  onSave(finalDraft, true);
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-edit">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Open with Text Editor
            </button>
            {(profile?.plan === 'pro_plus_advisor' || profile?.plan === 'pro_complete' || profile?.role === 'admin') && (
              <button
                onClick={() => {
                  alert('Sending draft to advisor... (This would integrate with advisor communication system)');
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-send">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
                Send to Advisor
              </button>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-slate-200">
        <h4 className="font-semibold text-slate-900 mb-3">How It Works:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="font-medium text-slate-800">Parallel AI Agents</p>
            <p>Multiple specialized agents work simultaneously on different aspects of your thesis</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="font-medium text-slate-800">Cohesion Check</p>
            <p>Ensures logical flow and consistency across all chapters</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="font-medium text-slate-800">Style Harmonization</p>
            <p>Standardizes voice, tense, and formatting (APA/MLA)</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="font-medium text-slate-800">Citation Validation</p>
            <p>Checks and fixes citations, adds missing references</p>
          </div>
        </div>
      </div>
    </div>
  );
}