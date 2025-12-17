'use client';

import Link from 'next/link';
import { Network, Users, MessageSquare, Share2 } from 'lucide-react';

export default function CollaborativeLiteratureReviewDoc() {
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
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Team</span>
          </div>
          <h1 className="text-4xl font-bold text-white">Collaborative Literature Review</h1>
          <p className="mt-4 text-lg text-slate-300">
            Annotate, tag, and analyze literature together with real-time collaboration
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
            <p className="text-slate-300 mb-4">
              The Collaborative Literature Review feature enables research teams to work
              together on reviewing and analyzing academic literature. Share annotations,
              discuss findings, and build a comprehensive literature review as a team
              with real-time synchronization.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Key Features</h2>

            <div className="grid gap-6 mb-8">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Users className="h-6 w-6 text-emerald-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Real-Time Collaboration</h3>
                    <p className="text-slate-300">
                      Multiple team members can view and annotate the same documents
                      simultaneously. See each other&apos;s cursors and changes in real-time.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Network className="h-6 w-6 text-blue-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Shared Annotation Library</h3>
                    <p className="text-slate-300">
                      Build a team-wide collection of annotated articles. Search and filter
                      through annotations made by any team member.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <MessageSquare className="h-6 w-6 text-purple-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Discussion Threads</h3>
                    <p className="text-slate-300">
                      Start discussions on specific annotations or articles. Resolve
                      disagreements and document team decisions directly in context.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Share2 className="h-6 w-6 text-orange-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Role-Based Access</h3>
                    <p className="text-slate-300">
                      Assign roles to team members (lead researcher, reviewer, editor)
                      with appropriate permissions for each role.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Setting Up Collaboration</h2>
            <ol className="list-decimal pl-6 space-y-4 text-slate-300">
              <li>
                <strong>Create a Team Workspace:</strong> Set up a shared workspace for
                your research group with a descriptive name and project details.
              </li>
              <li>
                <strong>Invite Team Members:</strong> Add collaborators via email invitation.
                Each member needs a ThesisAI account.
              </li>
              <li>
                <strong>Assign Roles:</strong> Define roles and permissions for each member
                based on their responsibilities.
              </li>
              <li>
                <strong>Upload Literature:</strong> Add articles to the shared library.
                PDFs are stored securely and accessible to all members.
              </li>
              <li>
                <strong>Start Collaborating:</strong> Begin annotating, commenting, and
                discussing articles together in real-time.
              </li>
            </ol>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Team Roles</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Lead Researcher</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>Full admin access</li>
                  <li>Manage team members</li>
                  <li>Set project guidelines</li>
                  <li>Approve final reviews</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Reviewer</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>Upload articles</li>
                  <li>Add annotations</li>
                  <li>Participate in discussions</li>
                  <li>Generate reports</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Viewer</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>Read-only access</li>
                  <li>View annotations</li>
                  <li>Comment on discussions</li>
                  <li>Export reports</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Collaboration Best Practices</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-green-900/20 border border-green-800/30">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Do</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Establish annotation conventions early</li>
                  <li>Use consistent tagging schemes</li>
                  <li>Resolve discussions before finalizing</li>
                  <li>Regular sync meetings to align findings</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-red-900/20 border border-red-800/30">
                <h3 className="text-lg font-semibold text-red-400 mb-2">Avoid</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Duplicate annotations on same content</li>
                  <li>Unresolved discussion threads</li>
                  <li>Inconsistent categorization</li>
                  <li>Working on same section simultaneously</li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        <div className="flex justify-between mt-12">
          <div>
            <Link href="/documentation/article-analyzer" className="text-blue-400 hover:underline">
              ← Article Analyzer
            </Link>
          </div>
          <div>
            <Link href="/documentation/pdf-analysis" className="text-blue-400 hover:underline">
              PDF Analysis →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
