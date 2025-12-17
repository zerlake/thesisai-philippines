'use client';

import Link from 'next/link';
import { Users, FolderKanban, Bell, GitBranch } from 'lucide-react';

export default function TeamCollaborationDoc() {
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
          <h1 className="text-4xl font-bold text-white">Research Team Collaboration</h1>
          <p className="mt-4 text-lg text-slate-300">
            Shared workspaces, task assignments, progress tracking for group projects
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
            <p className="text-slate-300 mb-4">
              The Research Team Collaboration feature enables groups of researchers to work
              together on thesis projects seamlessly. Share workspaces, assign tasks, track
              progress, and coordinate efforts whether you&apos;re working on a group thesis or
              collaborating across research teams.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Key Features</h2>

            <div className="grid gap-6 mb-8">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Users className="h-6 w-6 text-emerald-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Shared Workspaces</h3>
                    <p className="text-slate-300">
                      Create team workspaces where all members can access shared documents,
                      resources, and tools. Real-time synchronization keeps everyone updated.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <FolderKanban className="h-6 w-6 text-blue-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Task Management</h3>
                    <p className="text-slate-300">
                      Assign tasks to team members with deadlines and priorities. Track
                      completion status and identify bottlenecks in your project timeline.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Bell className="h-6 w-6 text-purple-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Activity Feed</h3>
                    <p className="text-slate-300">
                      Stay informed with a real-time activity feed showing all team actions,
                      updates, and milestones. Never miss important changes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <GitBranch className="h-6 w-6 text-orange-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Version Control</h3>
                    <p className="text-slate-300">
                      Track document changes with full version history. See who made what
                      changes and easily revert if needed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Setting Up Your Team</h2>
            <ol className="list-decimal pl-6 space-y-4 text-slate-300">
              <li>
                <strong>Create Team Workspace:</strong> Start a new team workspace with
                your project name and description.
              </li>
              <li>
                <strong>Invite Members:</strong> Add team members via email invitation.
                They&apos;ll receive access upon accepting.
              </li>
              <li>
                <strong>Assign Roles:</strong> Set team lead, editor, and contributor
                roles with appropriate permissions.
              </li>
              <li>
                <strong>Set Up Structure:</strong> Create folders for chapters, resources,
                and reference materials.
              </li>
              <li>
                <strong>Define Tasks:</strong> Break down your thesis into tasks and
                assign responsibilities to team members.
              </li>
            </ol>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Team Roles</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Team Lead</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>Full administrative access</li>
                  <li>Manage team membership</li>
                  <li>Assign and reassign tasks</li>
                  <li>Set project milestones</li>
                  <li>Final document approval</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Editor</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>Edit all documents</li>
                  <li>Create and assign tasks</li>
                  <li>Manage file organization</li>
                  <li>Review team submissions</li>
                  <li>Cannot manage members</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Contributor</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>Edit assigned sections</li>
                  <li>Upload resources</li>
                  <li>Comment on documents</li>
                  <li>Update task status</li>
                  <li>View all content</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Task Management Features</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Task Properties</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>Title and description</li>
                  <li>Assignee(s)</li>
                  <li>Due date and reminders</li>
                  <li>Priority level</li>
                  <li>Status (To Do, In Progress, Done)</li>
                  <li>Attached documents</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Views & Filters</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>List view by status</li>
                  <li>Kanban board view</li>
                  <li>Calendar view</li>
                  <li>Filter by assignee</li>
                  <li>Filter by due date</li>
                  <li>Search across tasks</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Best Practices</h2>
            <div className="p-6 rounded-lg bg-blue-900/20 border border-blue-800/30">
              <ul className="list-disc pl-6 text-slate-300 space-y-2">
                <li>Establish clear roles and responsibilities at the start</li>
                <li>Set regular check-in meetings to sync progress</li>
                <li>Use consistent naming conventions for files and folders</li>
                <li>Update task status daily to keep everyone informed</li>
                <li>Use comments for discussions rather than external chat</li>
                <li>Back up important documents regularly</li>
                <li>Review version history before major submissions</li>
              </ul>
            </div>
          </section>
        </div>

        <div className="flex justify-between mt-12">
          <div>
            <Link href="/documentation/advisor-collaboration" className="text-blue-400 hover:underline">
              ← Advisor Collaboration
            </Link>
          </div>
          <div>
            <Link href="/documentation/defense-preparation" className="text-blue-400 hover:underline">
              Defense Preparation →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
