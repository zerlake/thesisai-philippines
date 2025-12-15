'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, BookOpen, Users, CheckCircle, Scale, Bot, Search, FileText } from 'lucide-react';

export default function AcademicIntegrityDoc() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <Link 
            href="/documentation" 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Documentation
          </Link>
          <h1 className="text-4xl font-bold text-white">Academic Integrity & Ethical AI Usage</h1>
          <p className="mt-4 text-lg text-slate-300">
            Understanding responsible AI usage in academic work and maintaining scholarly ethics
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Introduction to Academic Integrity</h2>
            <p className="text-slate-300 mb-4">
              Academic integrity is the cornerstone of scholarly work and essential for maintaining the 
              credibility and value of academic degrees. At ThesisAI Philippines, we believe that AI 
              tools should enhance human intellectual capacity rather than replace it, and we are 
              committed to supporting ethical use of AI in academic contexts.
            </p>
            <p className="text-slate-300 mb-4">
              This guide outlines how to responsibly incorporate AI tools into your academic work 
              while preserving the authenticity of your intellectual contributions and maintaining 
              the highest standards of academic honesty.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Principles of Academic Integrity</h2>
            
            <div className="grid gap-6 mb-8">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-6 w-6 text-green-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Honesty</h3>
                    <p className="text-slate-300">
                      Truthfully represent your academic achievements and clearly distinguish between 
                      your original ideas and those derived from other sources. When using AI tools, 
                      acknowledge their contribution appropriately.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Scale className="h-6 w-6 text-blue-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Trust</h3>
                    <p className="text-slate-300">
                      Build trust with your academic community by consistently acting with integrity. 
                      Others should be able to rely on the authenticity and originality of your work.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Shield className="h-6 w-6 text-cyan-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Fairness</h3>
                    <p className="text-slate-300">
                      Ensure that your academic work reflects your true abilities and knowledge. 
                      Use AI tools to enhance your learning process rather than circumventing it.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Users className="h-6 w-6 text-purple-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Respect</h3>
                    <p className="text-slate-300">
                      Acknowledge the intellectual contributions of others through proper attribution 
                      and citation. Respect the work of fellow researchers and scholars.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <BookOpen className="h-6 w-6 text-yellow-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Responsibility</h3>
                    <p className="text-slate-300">
                      Take responsibility for your academic work and the decisions you make about 
                      using AI tools. Understand the policies of your institution regarding AI usage.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Responsible AI Usage in Academic Work</h2>
            
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-green-900/20 border border-green-800/30">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Appropriate AI Usage</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li><strong>Research Enhancement:</strong> Using AI to identify relevant literature and research patterns</li>
                  <li><strong>Writing Improvement:</strong> Employing AI for grammar, style, and clarity suggestions</li>
                  <li><strong>Idea Development:</strong> Leveraging AI for brainstorming and exploring research directions</li>
                  <li><strong>Formatting Assistance:</strong> Utilizing AI for consistent academic formatting</li>
                  <li><strong>Organization Support:</strong> Using AI to structure and organize complex information</li>
                  <li><strong>Productivity Tools:</strong> Employing AI for scheduling, task management, and progress tracking</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-red-900/20 border border-red-800/30">
                <h3 className="text-lg font-semibold text-red-400 mb-2">Inappropriate AI Usage</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li><strong>Content Substitution:</strong> Passing off AI-generated content as your own work</li>
                  <li><strong>Idea Appropriation:</strong> Using AI-generated ideas without acknowledgment</li>
                  <li><strong>Learning Circumvention:</strong> Using AI to complete learning exercises without engagement</li>
                  <li><strong>Authorship Violation:</strong> Claiming exclusive authorship of AI-influenced work</li>
                  <li><strong>Academic Dishonesty:</strong> Using AI on assessments or assignments without permission</li>
                  <li><strong>Citation Evasion:</strong> Attempting to bypass plagiarism detection via AI rewriting</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-800/30">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">ThesisAI's Approach</h3>
                <p className="text-slate-300 mb-3">
                  At ThesisAI Philippines, we design our AI tools to promote learning and enhance 
                  critical thinking while respecting academic integrity:
                </p>
                <ul className="list-disc pl-6 text-slate-300">
                  <li><strong>Educational Focus:</strong> All AI suggestions come with explanations to promote learning</li>
                  <li><strong>Transparency:</strong> Clear indication of AI involvement in content generation</li>
                  <li><strong>Human Oversight:</strong> AI suggestions require human evaluation and approval</li>
                  <li><strong>Integrity Checks:</strong> Built-in reminders about appropriate usage</li>
                  <li><strong>Ethical Guidelines:</strong> Prominent documentation of ethical usage practices</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Specific Guidelines for Each Tool</h2>
            
            <div className="space-y-8">
              <div className="border border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center gap-2">
                  <Bot className="h-5 w-5" />
                  AI Writing Assistant & Paraphraser
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-white">Recommended Use:</p>
                      <p className="text-slate-300 text-sm">
                        Use for improving clarity and grammar in your original thoughts. Always review and 
                        refine AI suggestions to ensure they accurately reflect your intended meaning.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-white">Avoid:</p>
                      <p className="text-slate-300 text-sm">
                        Directly incorporating AI-generated text without substantial modification and personal oversight.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-blue-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-white">Best Practice:</p>
                      <p className="text-slate-300 text-sm">
                        Use as a tool to enhance your expression of your own ideas, not as a replacement for your thinking process.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-purple-400 mb-4 flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Research Gap Identifier & Topic Generator
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-white">Recommended Use:</p>
                      <p className="text-slate-300 text-sm">
                        Use these tools for inspiration and to identify potential research directions. 
                        Develop your own interpretation and approach to the suggested topics.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-white">Avoid:</p>
                      <p className="text-slate-300 text-sm">
                        Simply copying suggested research questions without thoughtful consideration of their relevance to your interests and capabilities.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-blue-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-white">Best Practice:</p>
                      <p className="text-slate-300 text-sm">
                        Use suggestions as a starting point for your own creative exploration and critical analysis.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-green-400 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Citation Manager & Bibliography Generator
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-white">Recommended Use:</p>
                      <p className="text-slate-300 text-sm">
                        Use to ensure consistent citation format and completeness. Always verify 
                        the accuracy of citations generated by AI tools.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-white">Avoid:</p>
                      <p className="text-slate-300 text-sm">
                        Assuming AI-generated citations are error-free. Always double-check citation accuracy.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-blue-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-white">Best Practice:</p>
                      <p className="text-slate-300 text-sm">
                        Use AI tools as assistants while maintaining personal responsibility for citation accuracy.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Institutional Policies & Compliance</h2>
            
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">Understanding Your University's AI Policy</h3>
                <p className="text-slate-300 mb-4">
                  AI usage policies vary significantly among Philippine universities. Common policy categories include:
                </p>
                <ul className="list-disc pl-6 space-y-3 text-slate-300">
                  <li><strong>Permitted with Disclosure:</strong> AI tools may be used if their contribution is acknowledged</li>
                  <li><strong>Prohibited During Assessment:</strong> AI tools may not be used during exams or certain assignments</li>
                  <li><strong>Guided Usage:</strong> AI tools are allowed only for specific purposes designated by instructors</li>
                  <li><strong>Research-Only:</strong> AI tools permitted for research assistance but not content creation</li>
                  <li><strong>Case-by-Case:</strong> Usage determined individually for each assignment or course</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-800/30">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Recommended Actions</h3>
                <ol className="list-decimal pl-6 space-y-3 text-slate-300">
                  <li>Review your university's academic integrity policy regarding AI tool usage</li>
                  <li>Consult with your professors or advisors about their specific expectations</li>
                  <li>Document AI usage in your research methodology section if required</li>
                  <li>Keep records of AI interactions for transparency purposes</li>
                  <li>Adjust your tool usage according to different course requirements</li>
                  <li>Stay informed about evolving institutional policies</li>
                </ol>
              </div>
              
              <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-800/30">
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Documentation Requirements</h3>
                <p className="text-slate-300 mb-4">
                  Depending on your institution's policy, you may need to document AI usage:
                </p>
                <div className="grid gap-4 md:grid-cols-2 text-slate-300">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Information to Track</h4>
                    <ul className="list-disc pl-6">
                      <li>Specific AI tools used</li>
                      <li>Sections of work assisted</li>
                      <li>Extent of AI involvement</li>
                      <li>Modifications made to AI output</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Disclosure Locations</h4>
                    <ul className="list-disc pl-6">
                      <li>Methodology section</li>
                      <li>Acknowledgments</li>
                      <li>Footnotes/endnotes</li>
                      <li>Appendix material</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Maintaining Learning Objectives</h2>
            
            <h3 className="text-xl font-semibold text-cyan-400 mb-3">Balancing AI Assistance with Skill Development</h3>
            <p className="text-slate-300 mb-4">
              It's important to ensure that AI tools enhance rather than undermine your learning process:
            </p>
            
            <div className="grid gap-4 md:grid-cols-2 mb-8">
              <div className="p-4 rounded-lg bg-green-900/20 border border-green-800/30">
                <h4 className="font-semibold text-green-400 mb-2">Skill-Building Approaches</h4>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Attempt tasks independently before seeking AI assistance</li>
                  <li>Use AI feedback to identify areas for improvement</li>
                  <li>Practice skills without AI to build competence</li>
                  <li>Reflect on AI suggestions to understand underlying principles</li>
                  <li>Monitor your skill development over time</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-red-900/20 border border-red-800/30">
                <h4 className="font-semibold text-red-400 mb-2">Avoiding Dependency</h4>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Don't rely solely on AI for content creation</li>
                  <li>Maintain regular practice without AI tools</li>
                  <li>Develop your own analytical and critical thinking skills</li>
                  <li>Resist the temptation to take shortcuts that bypass learning</li>
                  <li>Ensure AI usage enhances rather than replaces cognitive effort</li>
                </ul>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-amber-400 mb-3">Assessment Considerations</h3>
            <p className="text-slate-300 mb-4">
              Different types of academic assessments may have varying AI usage allowances:
            </p>
            <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="pb-2 text-white">Assessment Type</th>
                    <th className="pb-2 text-white">Typical AI Policy</th>
                    <th className="pb-2 text-white">Recommended Approach</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr className="border-b border-slate-700/50">
                    <td className="py-3">Research Proposals</td>
                    <td>Often permitted with disclosure</td>
                    <td>Use AI for formatting and clarity, but ensure original thought</td>
                  </tr>
                  <tr className="border-b border-slate-700/50">
                    <td className="py-3">Literature Reviews</td>
                    <td>Generally allowed for organization</td>
                    <td>AI can help organize sources; your synthesis is key</td>
                  </tr>
                  <tr className="border-b border-slate-700/50">
                    <td className="py-3">Draft Writing</td>
                    <td>Often permitted</td>
                    <td>Use for improvement, maintain your voice and ideas</td>
                  </tr>
                  <tr>
                    <td className="py-3">Final Submissions</td>
                    <td>Varies by institution</td>
                    <td>Check specific policy; disclosure may be required</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Best Practices for Ethical AI Usage</h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 rounded-lg bg-blue-900/20 border border-blue-800/30">
                <h3 className="text-lg font-semibold text-blue-400 mb-3">Transparent Usage</h3>
                <ul className="list-disc pl-6 text-slate-300 space-y-2">
                  <li>Keep a personal log of AI tool usage during your research</li>
                  <li>Be prepared to discuss AI's role in your work with advisors</li>
                  <li>Use the transparency features built into ThesisAI tools</li>
                  <li>Understand that AI usage patterns may be detectable in writing style</li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-green-900/20 border border-green-800/30">
                <h3 className="text-lg font-semibold text-green-400 mb-3">Continuous Learning</h3>
                <ul className="list-disc pl-6 text-slate-300 space-y-2">
                  <li>Use AI feedback to improve your own skills over time</li>
                  <li>Regularly practice academic tasks without AI assistance</li>
                  <li>Seek feedback on your non-AI-assisted work</li>
                  <li>Reflect on how AI tools help or hinder your growth</li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-purple-900/20 border border-purple-800/30">
                <h3 className="text-lg font-semibold text-purple-400 mb-3">Collaboration Ethics</h3>
                <ul className="list-disc pl-6 text-slate-300 space-y-2">
                  <li>Inform collaborators if you've used AI in shared work</li>
                  <li>Respect co-authors' comfort levels with AI usage</li>
                  <li>Be transparent with advisors about AI assistance</li>
                  <li>Follow group policies regarding AI usage</li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-cyan-900/20 border border-cyan-800/30">
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">Quality Assurance</h3>
                <ul className="list-disc pl-6 text-slate-300 space-y-2">
                  <li>Critically evaluate all AI-generated content</li>
                  <li>Verify factual accuracy of AI suggestions</li>
                  <li>Maintain your own standards for quality and rigor</li>
                  <li>Don't accept AI suggestions without personal assessment</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">FAQ: Academic Integrity and AI Usage</h2>
            
            <div className="space-y-6">
              <div className="border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Can I use AI tools for my thesis without violating academic integrity?</h3>
                <p className="text-slate-300">
                  Yes, when used appropriately. AI tools can enhance your research and writing process as long 
                  as you maintain intellectual ownership of your ideas and properly acknowledge AI's role. 
                  The key is using AI to augment your abilities rather than replace your thinking. 
                  Always consult your institution's specific policies regarding AI usage in academic work.
                </p>
              </div>
              
              <div className="border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Do I need to disclose my AI usage?</h3>
                <p className="text-slate-300">
                  Yes, transparency is crucial. Many institutions require disclosure of AI tool usage, 
                  especially for major assignments and submissions. Even when not explicitly required, 
                  being transparent about AI assistance demonstrates academic honesty and allows 
                  reviewers to properly assess your work.
                </p>
              </div>
              
              <div className="border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">How do I balance AI assistance with developing my own skills?</h3>
                <p className="text-slate-300">
                  Use AI tools as scaffolding to support your learning, not as crutches to avoid 
                  intellectual effort. Attempt challenging tasks independently first, then use AI 
                  for feedback and improvement. Regularly practice skills without AI assistance 
                  to ensure continued development. Treat AI as a teaching assistant rather than 
                  a substitute for your own cognitive work.
                </p>
              </div>
              
              <div className="border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-2">What if my institution prohibits AI tools?</h3>
                <p className="text-slate-300">
                  Respect your institution's policies while advocating for thoughtful AI integration. 
                  Engage in constructive dialogue about the potential benefits of responsible AI 
                  usage in education. Consider how your institution might evolve its policies as 
                  AI becomes more prevalent in academic and professional contexts. 
                  In the meantime, focus on traditional research methods and manual writing techniques.
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="flex justify-between mt-12">
          <div>
            <Link href="/documentation/essay-editor" className="text-blue-400 hover:underline">
              ← Essay Editor
            </Link>
          </div>
          <div>
            <Link href="/documentation/citation-manager" className="text-blue-400 hover:underline">
              Citation Manager →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}