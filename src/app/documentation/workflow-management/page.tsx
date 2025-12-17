'use client';

import Link from 'next/link';
import { CheckSquare, Calendar, BarChart3, Clock } from 'lucide-react';

export default function WorkflowManagementDoc() {
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
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">Pro</span>
          </div>
          <h1 className="text-4xl font-bold text-white">Research Workflow Management</h1>
          <p className="mt-4 text-lg text-slate-300">
            Track tasks, deadlines, and progress with comprehensive workflow tools
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
            <p className="text-slate-300 mb-4">
              Our Research Workflow Management tools help you stay organized and on track
              throughout your research journey. From initial planning to final submission,
              these tools provide structure and visibility into your progress.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Key Features</h2>

            <div className="grid gap-6 mb-8">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <CheckSquare className="h-6 w-6 text-green-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Task Management</h3>
                    <p className="text-slate-300">
                      Create, organize, and track tasks for every phase of your research.
                      Break down large milestones into manageable subtasks with dependencies.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Calendar className="h-6 w-6 text-blue-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Timeline & Milestones</h3>
                    <p className="text-slate-300">
                      Visualize your research timeline with Gantt charts and milestone tracking.
                      Set deadlines aligned with your university&apos;s academic calendar.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <BarChart3 className="h-6 w-6 text-purple-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Progress Analytics</h3>
                    <p className="text-slate-300">
                      Monitor your progress with detailed analytics and reports. Track completion
                      rates, identify bottlenecks, and adjust your plan accordingly.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Clock className="h-6 w-6 text-orange-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Time Tracking</h3>
                    <p className="text-slate-300">
                      Log time spent on different research activities. Understand where your
                      time goes and optimize your workflow for better productivity.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Getting Started</h2>
            <ol className="list-decimal pl-6 space-y-4 text-slate-300">
              <li>
                <strong>Create Your Research Project:</strong> Set up a new project with your
                thesis title, expected completion date, and key milestones.
              </li>
              <li>
                <strong>Import a Template:</strong> Use our pre-built templates for common
                thesis structures or create your own custom workflow.
              </li>
              <li>
                <strong>Add Tasks:</strong> Break down each chapter or phase into specific
                tasks with estimated durations.
              </li>
              <li>
                <strong>Set Deadlines:</strong> Align your tasks with your university&apos;s
                submission deadlines and defense schedule.
              </li>
              <li>
                <strong>Track Progress:</strong> Update task status as you work and monitor
                your overall progress on the dashboard.
              </li>
            </ol>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Workflow Templates</h2>
            <p className="text-slate-300 mb-4">
              Choose from our pre-built templates designed for Philippine universities:
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Undergraduate Thesis</h3>
                <p className="text-sm text-slate-300">
                  Standard 5-chapter format with typical 1-semester timeline
                </p>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Master&apos;s Thesis</h3>
                <p className="text-sm text-slate-300">
                  Extended research timeline with comprehensive literature review phase
                </p>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Doctoral Dissertation</h3>
                <p className="text-sm text-slate-300">
                  Multi-year plan with publication milestones and comprehensive exams
                </p>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Group Research Project</h3>
                <p className="text-sm text-slate-300">
                  Collaborative workflow with task assignments and team coordination
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Notifications & Reminders</h2>
            <p className="text-slate-300 mb-4">
              Stay on track with automated notifications:
            </p>
            <ul className="list-disc pl-6 text-slate-300 space-y-2">
              <li>Deadline reminders (1 week, 3 days, 1 day before)</li>
              <li>Overdue task alerts</li>
              <li>Weekly progress summaries</li>
              <li>Milestone completion celebrations</li>
              <li>Advisor meeting reminders</li>
            </ul>
          </section>
        </div>

        <div className="flex justify-between mt-12">
          <div>
            <Link href="/documentation/ai-idea-generation" className="text-blue-400 hover:underline">
              ← AI Idea Generation
            </Link>
          </div>
          <div>
            <Link href="/documentation/article-analyzer" className="text-blue-400 hover:underline">
              Article Analyzer →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
