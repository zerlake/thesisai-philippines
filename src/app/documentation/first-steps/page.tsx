'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function FirstStepsDoc() {
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
          <h1 className="text-4xl font-bold text-white">First Steps with ThesisAI</h1>
          <p className="mt-4 text-lg text-slate-300">
            Your guide to getting started with ThesisAI and beginning your academic journey
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Welcome to ThesisAI</h2>
            <p className="text-slate-300 mb-4">
              Congratulations on creating your ThesisAI account! This guide will walk you through 
              your first steps to start leveraging AI-powered academic tools for your research and writing needs.
            </p>
            <p className="text-slate-300 mb-4">
              Whether you're beginning your thesis journey, refining your research proposal, or looking 
              to enhance your academic writing skills, ThesisAI provides the tools to accelerate your progress.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Step 1: Navigate Your Dashboard</h2>
            <p className="text-slate-300 mb-4">
              Your dashboard is the central hub of ThesisAI, designed to help you organize and manage your academic journey:
            </p>
            <div className="space-y-4 mb-6">
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Left Navigation Panel</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li><strong>Home:</strong> Your main dashboard overview</li>
                  <li><strong>New Document:</strong> Create new research documents</li>
                  <li><strong>My Documents:</strong> Access your saved work</li>
                  <li><strong>AI Tools:</strong> Access all AI-powered tools</li>
                  <li><strong>Collaboration:</strong> Manage advisors, critics, and group projects</li>
                  <li><strong>Settings:</strong> Adjust account preferences</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Top Navigation Bar</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Your profile menu with account settings</li>
                  <li>Search functionality to find documents and tools</li>
                  <li>Help and support options</li>
                  <li>Notification center for updates</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Main Workspace</h3>
                <p className="text-slate-300">
                  The central area displays your documents, analytics, and project progress.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Step 2: Create Your First Document</h2>
            <p className="text-slate-300 mb-4">
              Begin your academic work by creating your first document:
            </p>
            <ol className="list-decimal pl-6 mb-6 space-y-4 text-slate-300">
              <li>
                Click the <strong>&quot;New Document&quot;</strong> button on your dashboard
              </li>
              <li>
                Select the document type from the options:
                <ul className="list-circle pl-6 mt-2 space-y-1">
                  <li>Thesis/Dissertation Chapter</li>
                  <li>Research Proposal</li>
                  <li>Literature Review</li>
                  <li>Manuscript</li>
                  <li>Defense Presentation</li>
                </ul>
              </li>
              <li>
                Choose your document template based on your university's requirements
              </li>
              <li>
                Name your document and add a brief description
              </li>
              <li>
                Set up collaborators (advisors, peers, critics) if applicable
              </li>
            </ol>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Step 3: Explore Key AI Tools</h2>
            <p className="text-slate-300 mb-4">
              ThesisAI offers several powerful tools to assist with your academic work. Try these to get familiar with the platform:
            </p>
            
            <div className="grid gap-4 md:grid-cols-2 mb-6">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Research Gap Identifier</h3>
                <p className="text-slate-300 mb-3">
                  Upload relevant papers or paste abstracts to identify potential research gaps.
                </p>
                <p className="text-sm text-slate-400">
                  <strong>Try it:</strong> Upload 3-5 papers in your field to see potential research opportunities.
                </p>
              </div>
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Topic Generator</h3>
                <p className="text-slate-300 mb-3">
                  Input your field of study and any specific requirements to generate potential research topics.
                </p>
                <p className="text-sm text-slate-400">
                  <strong>Try it:</strong> Enter your discipline and see 10+ topic suggestions.
                </p>
              </div>
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Citation Assistant</h3>
                <p className="text-slate-300 mb-3">
                  Generate citations in APA, MLA, Chicago, or your university's specific format.
                </p>
                <p className="text-sm text-slate-400">
                  <strong>Try it:</strong> Enter publication details to generate properly formatted citations.
                </p>
              </div>
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Plagiarism Checker</h3>
                <p className="text-slate-300 mb-3">
                  Verify the originality of your work against millions of sources.
                </p>
                <p className="text-sm text-slate-400">
                  <strong>Try it:</strong> Paste a paragraph to check its originality score.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Step 4: Set Up Your Thesis Project</h2>
            <p className="text-slate-300 mb-4">
              For thesis work specifically, configure your project settings to optimize your workflow:
            </p>
            
            <div className="space-y-4 mb-6">
              <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-800/30">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Thesis Information</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Enter your thesis title (can be preliminary)</li>
                  <li>Add your research field and sub-field</li>
                  <li>Specify your university and department</li>
                  <li>Identify your thesis advisor</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-800/30">
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Thesis Phases</h3>
                <p className="text-slate-300 mb-3">
                  ThesisAI guides you through four main phases:
                </p>
                <ol className="list-decimal pl-6 text-slate-300">
                  <li><strong>Conceptualize:</strong> Define your research focus</li>
                  <li><strong>Research:</strong> Conduct literature review and data collection</li>
                  <li><strong>Write & Refine:</strong> Draft and refine your work</li>
                  <li><strong>Submit & Present:</strong> Prepare for submission and defense</li>
                </ol>
              </div>
              
              <div className="p-4 rounded-lg bg-cyan-900/20 border border-cyan-800/30">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Timeline Setup</h3>
                <p className="text-slate-300">
                  Establish your project timeline with key milestones and deadlines.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Step 5: Connect with Collaborators</h2>
            <p className="text-slate-300 mb-4">
              ThesisAI facilitates collaboration with your academic community:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2 text-slate-300">
              <li>Invite your thesis advisor to review and comment on your work</li>
              <li>Connect with critics for manuscript certification</li>
              <li>Collaborate with peers on group projects</li>
              <li>Share documents securely with appropriate access permissions</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-blue-400 mb-2">How to Invite Collaborators</h3>
            <ol className="list-decimal pl-6 text-slate-300">
              <li>Go to your document or navigate to the Collaboration tab</li>
              <li>Click &quot;Add Collaborator&quot;</li>
              <li>Enter their email address</li>
              <li>Select their role (Advisor, Critic, Peer, etc.)</li>
              <li>Set their permissions (View, Comment, Edit)</li>
              <li>Send the invitation</li>
            </ol>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Common First-Step Tips</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-green-900/20 border border-green-800/30">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Success Tip</h3>
                <p className="text-slate-300">
                  Start with a small task like generating research topics or checking the plagiarism 
                  score of a paragraph. This helps familiarize yourself with the platform gradually.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-yellow-900/20 border border-yellow-800/30">
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">Efficiency Tip</h3>
                <p className="text-slate-300">
                  Bookmark your most frequently used tools in the AI Tools section for quick access.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-red-900/20 border border-red-800/30">
                <h3 className="text-lg font-semibold text-red-400 mb-2">Important Note</h3>
                <p className="text-slate-300">
                  Always review AI-generated content critically. Use ThesisAI as an assistant, 
                  not a replacement for your academic judgment and expertise.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-800/30">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Pro Tip</h3>
                <p className="text-slate-300">
                  Regularly save your work and back it up. Although ThesisAI automatically saves, 
                  exporting copies is recommended for important documents.
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="flex justify-between mt-12">
          <div>
            <Link href="/documentation/account-setup" className="text-blue-400 hover:underline">
              ← Account Setup
            </Link>
          </div>
          <div>
            <Link href="/documentation/dashboard-overview" className="text-blue-400 hover:underline">
              Dashboard Overview →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}