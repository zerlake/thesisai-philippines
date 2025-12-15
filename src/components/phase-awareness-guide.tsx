'use client';

import { AlertCircle, CheckCircle2, Target, HelpCircle } from 'lucide-react';

type Phase = 'conceptualize' | 'research' | 'write' | 'submit';

interface PhaseContent {
  title: string;
  what: string;
  why: string[];
  goal: string[];
  icon: React.ReactNode;
}

const phaseContent: Record<Phase, PhaseContent> = {
  conceptualize: {
    title: 'Phase 1: Conceptualize - Research Planning',
    what: 'This is your ideation and planning stage. You\'re answering fundamental questions: "What do I want to study?" "Why does it matter?" "What gap exists in current research?" You\'ll move from a vague topic to a focused research question with a clear structure.',
    why: [
      'You need creative generation to explore ideas, not refinement',
      'Grammar checking and summarization aren\'t yet relevant because you\'re still discovering what you want to say',
      'The Generate tool helps you brainstorm research questions, create outlines, and draft thesis statements'
    ],
    goal: [
      'A clearly defined research question',
      'A gap identified in existing literature',
      'A thesis statement (1-3 sentences explaining your contribution)',
      'An outline of your proposed chapters with section descriptions',
      'A solid foundation to begin your research'
    ],
    icon: <AlertCircle className="w-5 h-5 text-blue-500" />
  },
  research: {
    title: 'Phase 2: Research - Literature & Analysis',
    what: 'This is your evidence gathering and analysis stage. You\'re diving deep into academic literature, research papers, and data relevant to your thesis. You\'re not yet writing your own arguments—you\'re reading, understanding, and extracting insights from existing research to support your eventual thesis.',
    why: [
      'You need to absorb and process information, not generate new content yet',
      'Grammar/refining tools are premature—your focus is on comprehension and synthesis',
      'Summarize helps you condense lengthy papers, extract relevant findings, and build a comprehensive literature review'
    ],
    goal: [
      'A comprehensive literature review with 15-30 key sources',
      'Organized notes summarizing each source\'s key contributions',
      'A clear understanding of what\'s already known in your field',
      'Identified patterns, gaps, and opportunities in existing research',
      'A well-documented foundation for your own contributions'
    ],
    icon: <HelpCircle className="w-5 h-5 text-green-500" />
  },
  write: {
    title: 'Phase 3: Write & Refine - Content Creation',
    what: 'This is your active writing and development stage. You\'re converting research and ideas into chapters. You\'re drafting sections, improving clarity, and developing your unique academic voice. This is where your thesis takes shape—where you present your arguments, integrate evidence, and articulate your contribution to the field.',
    why: [
      'You have a full writing toolkit (Generate, Grammar, Summarize, Paraphrase) because writing is messy and iterative',
      'You need to Generate new sections, Grammar to polish, Paraphrase to integrate ethically, and Summarize to condense background info',
      'Advanced Options are NOT available because this phase is about exploration and development, not final presentation'
    ],
    goal: [
      'Completed draft of all major chapters (Introduction, Methodology, Results, Discussion, Conclusion)',
      'Clear, well-supported arguments grounded in research',
      'Proper paraphrasing and citations for all sources (no plagiarism)',
      'A developing academic voice that\'s consistent throughout',
      'Content that\'s coherent but may still need polishing'
    ],
    icon: <CheckCircle2 className="w-5 h-5 text-purple-500" />
  },
  submit: {
    title: 'Phase 4: Submit & Present - Finalization & Defense',
    what: 'This is your final polish and defense preparation stage. Your draft is complete, and now you\'re optimizing it for your specific audience(s)—your advisor, your committee, possibly external reviewers. You\'re also preparing to defend your work verbally, which means clarifying complex ideas and positioning your thesis for maximum impact.',
    why: [
      'Advanced Options are available ONLY NOW because you need audience awareness',
      'You can customize tone (formal, professional, conversational, academic) and complexity based on your audience',
      'You can create multiple versions: technical abstract for experts vs. accessible summary for general readers',
      'The Submit button sends your thesis formally to your advisor/committee for structured feedback'
    ],
    goal: [
      'A polished, publication-ready thesis with perfect grammar and clarity',
      'Multiple versions: academic abstract, accessible summary, presentation slides',
      'A thesis customized in tone and complexity for your specific audience',
      'Formal submission sent to your advisor/committee with the Submit button',
      'Advisor feedback received and reviewed',
      'A prepared defense presentation with clear, compelling explanations'
    ],
    icon: <Target className="w-5 h-5 text-orange-500" />
  }
};

export function PhaseAwarenessGuide({ phase = 'write' }: { phase?: Phase }) {
  const content = phaseContent[phase];
  const phaseIndex = ['conceptualize', 'research', 'write', 'submit'].indexOf(phase) + 1;
  
  // Determine phase color scheme
  const phaseColors = {
    conceptualize: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800',
    research: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800',
    write: 'bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800',
    submit: 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800',
  };

  const phaseBadgeColors = {
    conceptualize: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    research: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    write: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
    submit: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
  };

  return (
    <div className={`mt-8 p-6 bg-gradient-to-br rounded-lg border shadow-md transition-all duration-200 ${phaseColors[phase]}`}>
      {/* Header with phase title and icon */}
      <div className="flex items-start gap-3 mb-5 pb-4 border-b border-slate-300 dark:border-slate-600">
        {content.icon}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{content.title}</h2>
            <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${phaseBadgeColors[phase]}`}>
              You're here!
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">Strategic guidance for your current phase</p>
        </div>
      </div>

      {/* What You're Doing */}
      <div className="mb-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          What You're Doing
        </h3>
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{content.what}</p>
      </div>

      {/* Why These Tools */}
      <div className="mb-6">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          Why These Tools
        </h3>
        <ul className="space-y-2">
          {content.why.map((item, idx) => (
            <li key={idx} className="text-sm text-slate-700 dark:text-slate-300 flex gap-2">
              <span className="text-slate-400 mt-0.5 flex-shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* The Goal */}
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          The Goal
        </h3>
        <ul className="space-y-2">
          {content.goal.map((item, idx) => (
            <li key={idx} className="text-sm text-slate-700 dark:text-slate-300 flex gap-2">
              <span className="text-slate-400 mt-0.5 flex-shrink-0">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Phase Progress Indicator */}
      <div className="mt-6 pt-4 border-t border-slate-300 dark:border-slate-600">
        <div className="space-y-3">
          {/* Progress Bar */}
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((num) => (
              <div
                key={num}
                className={`flex-1 h-2 rounded-full transition-colors ${
                  num <= phaseIndex
                    ? phase === 'conceptualize'
                      ? 'bg-blue-500'
                      : phase === 'research'
                      ? 'bg-green-500'
                      : phase === 'write'
                      ? 'bg-purple-500'
                      : 'bg-orange-500'
                    : 'bg-slate-300 dark:bg-slate-600'
                }`}
              />
            ))}
          </div>
          {/* Phase Label */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-600 dark:text-slate-400">
              Phase {phaseIndex} of 4
            </span>
            <span className="text-slate-500 dark:text-slate-500">
              {phase === 'conceptualize'
                ? '~2-4 weeks'
                : phase === 'research'
                ? '~4-8 weeks'
                : phase === 'write'
                ? '~6-12 weeks'
                : '~2-4 weeks'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
