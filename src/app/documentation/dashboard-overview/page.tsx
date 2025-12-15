'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { BookOpen, FileText, Users, Calendar, BarChart3, Settings, HelpCircle } from 'lucide-react';

export default function DashboardOverviewDoc() {
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
          <h1 className="text-4xl font-bold text-white">Dashboard Overview</h1>
          <p className="mt-4 text-lg text-slate-300">
            Understanding your ThesisAI dashboard and managing your academic workflow
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Dashboard Introduction</h2>
            <p className="text-slate-300 mb-4">
              Your ThesisAI dashboard serves as the central command center for your academic activities. 
              It provides a comprehensive overview of your projects, progress, upcoming deadlines, and 
              key analytics to help you stay organized throughout your academic journey.
            </p>
            <p className="text-slate-300 mb-4">
              The dashboard is designed with the thesis writing process in mind, featuring sections 
              for document management, progress tracking, collaboration tools, and performance analytics.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Dashboard Navigation</h2>
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-blue-400 mb-3">Sidebar Navigation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                  <div className="flex items-center gap-3 mb-3">
                    <BookOpen className="h-5 w-5 text-blue-400" />
                    <span className="font-medium">Dashboard Home</span>
                  </div>
                  <p className="text-sm text-slate-400">
                    Your personalized overview screen with key metrics and activity feed
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                  <div className="flex items-center gap-3 mb-3">
                    <FileText className="h-5 w-5 text-cyan-400" />
                    <span className="font-medium">Documents</span>
                  </div>
                  <p className="text-sm text-slate-400">
                    Manage your projects, chapters, and all academic documents
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="h-5 w-5 text-purple-400" />
                    <span className="font-medium">Collaborators</span>
                  </div>
                  <p className="text-sm text-slate-400">
                    Connect and manage advisors, critics, and research partners
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                  <div className="flex items-center gap-3 mb-3">
                    <BarChart3 className="h-5 w-5 text-green-400" />
                    <span className="font-medium">Analytics</span>
                  </div>
                  <p className="text-sm text-slate-400">
                    Track your productivity, writing patterns, and project progress
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="h-5 w-5 text-yellow-400" />
                    <span className="font-medium">Milestones</span>
                  </div>
                  <p className="text-sm text-slate-400">
                    Monitor deadlines, thesis phases, and important dates
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                  <div className="flex items-center gap-3 mb-3">
                    <Settings className="h-5 w-5 text-indigo-400" />
                    <span className="font-medium">Settings</span>
                  </div>
                  <p className="text-sm text-slate-400">
                    Configure your account, notifications, and preferences
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Dashboard Components</h2>
            
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-cyan-400 mb-3">1. Activity Feed</h3>
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <p className="text-slate-300 mb-4">
                  Located at the top of your dashboard, the activity feed shows:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Recent document activity and edits</li>
                  <li>Updates from collaborators (comments, approvals)</li>
                  <li>Upcoming milestones and deadlines</li>
                  <li>AI-generated insights and suggestions</li>
                  <li>System notifications and alerts</li>
                </ul>
                <p className="mt-4 text-sm text-slate-400">
                  <strong>Tip:</strong> Click on any notification to directly navigate to the relevant document or section.
                </p>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-cyan-400 mb-3">2. Quick Actions Panel</h3>
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <p className="text-slate-300 mb-4">
                  This panel provides shortcuts to frequently used features:
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 rounded-lg bg-blue-900/30 border border-blue-800/20 text-center">
                    <FileText className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                    <p className="text-xs">New Document</p>
                  </div>
                  <div className="p-3 rounded-lg bg-cyan-900/30 border border-cyan-800/20 text-center">
                    <Users className="h-6 w-6 text-cyan-400 mx-auto mb-2" />
                    <p className="text-xs">Invite Advisor</p>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-900/30 border border-purple-800/20 text-center">
                    <BarChart3 className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                    <p className="text-xs">Plagiarism Check</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-900/30 border border-green-800/20 text-center">
                    <BookOpen className="h-6 w-6 text-green-400 mx-auto mb-2" />
                    <p className="text-xs">AI Writing</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-cyan-400 mb-3">3. Project Progress Overview</h3>
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <p className="text-slate-300 mb-4">
                  Visual representation of your academic project status:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li><strong>Thesis Phase Progress:</strong> Visual progress bars for each phase (Conceptualize, Research, Write & Refine, Submit)</li>
                  <li><strong>Word Count Tracking:</strong> Total words written and goal progress</li>
                  <li><strong>Chapter Status:</strong> Completion status of each thesis chapter</li>
                  <li><strong>Deadline Countdown:</strong> Days remaining for key milestones</li>
                </ul>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-cyan-400 mb-3">4. Collaboration Hub</h3>
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <p className="text-slate-300 mb-4">
                  Centralized view of all collaborative activities:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Pending reviews from advisors or critics</li>
                  <li>Recent comments on your documents</li>
                  <li>Shared document activity</li>
                  <li>Collaborator statuses and availability</li>
                </ul>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-cyan-400 mb-3">5. AI Insights Panel</h3>
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <p className="text-slate-300 mb-4">
                  AI-powered recommendations and insights:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Suggested research papers based on your work</li>
                  <li>Writing improvement suggestions</li>
                  <li>Topic expansion ideas</li>
                  <li>Citation recommendations</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Dashboard Customization</h2>
            <p className="text-slate-300 mb-4">
              You can customize your dashboard to better suit your workflow:
            </p>
            
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-800/30">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Panel Arrangement</h3>
                <p className="text-slate-300">
                  Drag and drop dashboard panels to reorder them according to your preference. 
                  Place the most frequently used panels in prominent positions.
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-800/30">
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Notification Preferences</h3>
                <p className="text-slate-300">
                  Configure which types of notifications appear prominently on your dashboard. 
                  You can prioritize urgent deadlines while minimizing routine updates.
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-cyan-900/20 border border-cyan-800/30">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Quick Action Shortcuts</h3>
                <p className="text-slate-300">
                  Customize the quick action buttons based on your current thesis phase and frequent needs. 
                  These change dynamically as you progress through different stages of your research.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Managing Academic Documents</h2>
            <p className="text-slate-300 mb-4">
              Your dashboard provides centralized access to all academic documents:
            </p>
            
            <h3 className="text-xl font-semibold text-green-400 mb-3">Document Organization</h3>
            <ul className="list-disc pl-6 space-y-2 text-slate-300 mb-6">
              <li><strong>By Phase:</strong> Organize documents according to thesis phases (Proposal, Research, Writing, Submission)</li>
              <li><strong>By Type:</strong> Separate chapters, appendices, figures, references, etc.</li>
              <li><strong>By Status:</strong> Track documents by completion status (Draft, Review, Final)</li>
              <li><strong>By Deadline:</strong> Sort by upcoming submission dates</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-green-400 mb-3">Document Preview</h3>
            <p className="text-slate-300 mb-4">
              Hover over any document to see a preview of its latest content, progress indicators, 
              and recent activity. This helps you quickly assess each document's status.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Using Dashboard Analytics</h2>
            <p className="text-slate-300 mb-4">
              Leverage dashboard analytics to improve your academic performance:
            </p>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">Writing Productivity</h3>
                <p className="text-slate-300">
                  Track daily word counts, peak writing hours, and progress over time to optimize your writing schedule.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-orange-400 mb-2">AI Resource Usage</h3>
                <p className="text-slate-300">
                  Monitor how frequently you use different AI tools and their impact on your research efficiency.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-pink-400 mb-2">Collaboration Effectiveness</h3>
                <p className="text-slate-300">
                  Track response times from advisors and the frequency of collaborative feedback.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-red-400 mb-2">Deadline Adherence</h3>
                <p className="text-slate-300">
                  Monitor how well you're meeting your self-set and official deadlines.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Dashboard Best Practices</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-green-900/20 border border-green-800/30">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Daily Check-ins</h3>
                <p className="text-slate-300">
                  Spend 5 minutes each morning reviewing your dashboard to prioritize the day's tasks.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-800/30">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Weekly Reviews</h3>
                <p className="text-slate-300">
                  Analyze your weekly progress using dashboard analytics to identify improvement opportunities.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-800/30">
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Milestone Tracking</h3>
                <p className="text-slate-300">
                  Use the milestone tracker to break large objectives into manageable daily tasks.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-yellow-900/20 border border-yellow-800/30">
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">Collaboration Management</h3>
                <p className="text-slate-300">
                  Regularly check the collaboration hub to respond to feedback and maintain momentum.
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="flex justify-between mt-12">
          <div>
            <Link href="/documentation/first-steps" className="text-blue-400 hover:underline">
              ← First Steps
            </Link>
          </div>
          <div>
            <Link href="/documentation/grammar-checker" className="text-blue-400 hover:underline">
              Grammar Checker →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}