'use client';

import Link from 'next/link';
import { ChevronRight, BookOpen, Zap, Shield, Users } from 'lucide-react';

interface DocSection {
  title: string;
  description: string;
  icon: React.ReactNode;
  topics: Array<{ name: string; slug: string }>;
}

const docSections: DocSection[] = [
  {
    title: 'Getting Started',
    description: 'Quick start guides and setup instructions',
    icon: <Zap className="h-6 w-6" />,
    topics: [
      { name: 'Introduction', slug: 'introduction' },
      { name: 'Account Setup', slug: 'account-setup' },
      { name: 'First Steps', slug: 'first-steps' },
      { name: 'Dashboard Overview', slug: 'dashboard-overview' },
    ],
  },
  {
    title: 'Features',
    description: 'Comprehensive guides for all features',
    icon: <BookOpen className="h-6 w-6" />,
    topics: [
      { name: 'Grammar Checker', slug: 'grammar-checker' },
      { name: 'Topic Generator', slug: 'topic-generator' },
      { name: 'Research Gap Identifier', slug: 'research-gap-identifier' },
      { name: 'Paraphraser', slug: 'paraphraser' },
      { name: 'Essay Editor', slug: 'essay-editor' },
    ],
  },
  {
    title: 'Best Practices',
    description: 'Tips and strategies for maximum productivity',
    icon: <Shield className="h-6 w-6" />,
    topics: [
      { name: 'Academic Integrity', slug: 'academic-integrity' },
      { name: 'Writing Excellence', slug: 'writing-excellence' },
      { name: 'Research Methodology', slug: 'research-methodology' },
      { name: 'Time Management', slug: 'time-management' },
    ],
  },
  {
    title: 'Account & Support',
    description: 'Profile, billing, and support resources',
    icon: <Users className="h-6 w-6" />,
    topics: [
      { name: 'Profile Settings', slug: 'profile-settings' },
      { name: 'Subscription Plans', slug: 'subscription-plans' },
      { name: 'Billing FAQ', slug: 'billing-faq' },
      { name: 'Get Help', slug: 'get-help' },
    ],
  },
];

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white">Documentation</h1>
          <p className="mt-4 text-lg text-slate-300">
            Everything you need to know to master ThesisAI
          </p>
          <div className="mt-6 flex gap-4">
            <input
              type="search"
              placeholder="Search documentation..."
              className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder-slate-500"
            />
            <button className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Quick Links */}
        <div className="mb-16 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-700 bg-slate-800 p-6 hover:shadow-md hover:shadow-blue-500/20">
            <h3 className="font-semibold text-white">Quick Start Guide</h3>
            <p className="mt-2 text-sm text-slate-300">
              Get up and running in 5 minutes
            </p>
            <Link
              href="#"
              className="mt-4 inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
            >
              Start Reading <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-800 p-6 hover:shadow-md hover:shadow-blue-500/20">
            <h3 className="font-semibold text-white">Video Tutorials</h3>
            <p className="mt-2 text-sm text-slate-300">
              Watch step-by-step video guides
            </p>
            <Link
              href="#"
              className="mt-4 inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
            >
              Watch Videos <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-800 p-6 hover:shadow-md hover:shadow-blue-500/20">
            <h3 className="font-semibold text-white">API Reference</h3>
            <p className="mt-2 text-sm text-slate-300">
              Developer API documentation
            </p>
            <Link
              href="#"
              className="mt-4 inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
            >
              View API Docs <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-800 p-6 hover:shadow-md hover:shadow-blue-500/20">
            <h3 className="font-semibold text-white">Troubleshooting</h3>
            <p className="mt-2 text-sm text-slate-300">
              Common issues and solutions
            </p>
            <Link
              href="#"
              className="mt-4 inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
            >
              Get Help <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Documentation Sections */}
        <div className="space-y-12">
          {docSections.map((section) => (
            <div key={section.title}>
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/20 p-3 text-blue-300">
                  {section.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {section.title}
                  </h2>
                  <p className="text-slate-300">{section.description}</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {section.topics.map((topic) => (
                  <Link
                    key={topic.slug}
                    href={`/documentation/${topic.slug}`}
                    className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 hover:border-blue-500 hover:bg-slate-800"
                  >
                    <span className="font-medium text-white">
                      {topic.name}
                    </span>
                    <ChevronRight className="ml-auto h-4 w-4 text-slate-500" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Help Section */}
        <div className="mt-16 rounded-lg bg-slate-800 p-8 border border-slate-700">
          <h2 className="text-2xl font-bold text-white">Still need help?</h2>
          <p className="mt-2 text-slate-300">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contact"
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Contact Support
            </Link>
            <Link
              href="/blog"
              className="rounded-lg border border-slate-700 px-6 py-3 font-semibold text-white hover:bg-slate-700"
            >
              Read Blog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
