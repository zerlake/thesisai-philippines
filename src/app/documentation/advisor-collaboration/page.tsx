'use client';

import Link from 'next/link';
import { Share2, MessageSquare, Clock, FileSignature } from 'lucide-react';

export default function AdvisorCollaborationDoc() {
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
          <h1 className="text-4xl font-bold text-white">Advisor & Critic Collaboration</h1>
          <p className="mt-4 text-lg text-slate-300">
            Submit drafts for advisor feedback and manuscript critic certification
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
            <p className="text-slate-300 mb-4">
              The Advisor & Critic Collaboration feature streamlines the feedback process
              between students and their thesis advisors or manuscript critics. Submit
              drafts, receive comments, track revisions, and obtain approvals all within
              the platform.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Key Features</h2>

            <div className="grid gap-6 mb-8">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Share2 className="h-6 w-6 text-blue-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Draft Submission</h3>
                    <p className="text-slate-300">
                      Submit drafts directly to your advisor or manuscript critic with
                      optional notes highlighting areas you&apos;d like reviewed.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <MessageSquare className="h-6 w-6 text-green-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Inline Comments</h3>
                    <p className="text-slate-300">
                      Advisors can leave comments directly on specific sections of your
                      document. Reply to comments and mark them as resolved.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Clock className="h-6 w-6 text-purple-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Version History</h3>
                    <p className="text-slate-300">
                      Track all revisions with complete version history. Compare versions
                      to see exactly what changed between submissions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <FileSignature className="h-6 w-6 text-orange-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Digital Approval</h3>
                    <p className="text-slate-300">
                      Receive digital approval signatures from advisors and critics.
                      Generate approval documentation for your thesis defense.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Workflow</h2>
            <ol className="list-decimal pl-6 space-y-4 text-slate-300">
              <li>
                <strong>Submit Draft:</strong> Upload your chapter or full thesis draft
                and select the reviewer (advisor or manuscript critic).
              </li>
              <li>
                <strong>Reviewer Notification:</strong> Your reviewer receives an email
                notification with a link to review your submission.
              </li>
              <li>
                <strong>Receive Feedback:</strong> View inline comments and overall
                feedback from your reviewer in the platform.
              </li>
              <li>
                <strong>Make Revisions:</strong> Address comments and submit a revised
                version. Previous versions are preserved.
              </li>
              <li>
                <strong>Obtain Approval:</strong> Once satisfied, your advisor can
                provide digital approval for the chapter or document.
              </li>
            </ol>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Reviewer Roles</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Thesis Advisor</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>Primary reviewer for all chapters</li>
                  <li>Can request revisions or approve</li>
                  <li>Provides overall guidance</li>
                  <li>Signs off on final manuscript</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Manuscript Critic</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>Reviews for language and format</li>
                  <li>Checks grammar and clarity</li>
                  <li>Verifies citation consistency</li>
                  <li>Provides certification</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Panel Member</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>Invited for specific chapters</li>
                  <li>Provides subject matter expertise</li>
                  <li>Reviews methodology section</li>
                  <li>Prepares defense questions</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">External Reviewer</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>Industry or academic expert</li>
                  <li>Reviews practical applications</li>
                  <li>Provides external validation</li>
                  <li>Optional recommendation letter</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Inviting Reviewers</h2>
            <p className="text-slate-300 mb-4">
              To add reviewers to your project:
            </p>
            <div className="p-6 rounded-lg bg-blue-900/20 border border-blue-800/30">
              <ol className="list-decimal pl-6 text-slate-300 space-y-2">
                <li>Go to Project Settings → Collaborators</li>
                <li>Click &quot;Invite Reviewer&quot;</li>
                <li>Enter their email address and select their role</li>
                <li>Customize permissions if needed</li>
                <li>Send invitation—they&apos;ll receive an email to join</li>
              </ol>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Best Practices</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-green-900/20 border border-green-800/30">
                <h3 className="text-lg font-semibold text-green-400 mb-2">For Students</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Submit complete chapters, not fragments</li>
                  <li>Include specific questions for your advisor</li>
                  <li>Respond to all comments before resubmitting</li>
                  <li>Give advisors adequate time to review</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-800/30">
                <h3 className="text-lg font-semibold text-purple-400 mb-2">For Advisors</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Use inline comments for specific feedback</li>
                  <li>Provide actionable suggestions</li>
                  <li>Set clear expectations for revisions</li>
                  <li>Acknowledge student improvements</li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        <div className="flex justify-between mt-12">
          <div>
            <Link href="/documentation/format-checker" className="text-blue-400 hover:underline">
              ← Format Checker
            </Link>
          </div>
          <div>
            <Link href="/documentation/team-collaboration" className="text-blue-400 hover:underline">
              Team Collaboration →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
