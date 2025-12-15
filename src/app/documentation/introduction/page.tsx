'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function IntroductionDoc() {
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
          <h1 className="text-4xl font-bold text-white">Introduction to ThesisAI Philippines</h1>
          <p className="mt-4 text-lg text-slate-300">
            Welcome to the leading AI-powered academic writing platform for Filipino students
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">What is ThesisAI Philippines?</h2>
            <p className="text-slate-300 mb-4">
              ThesisAI Philippines is the premier AI-powered platform for thesis research, manuscript checking, 
              and academic writing automation designed specifically for Philippine universities. Our mission is 
              to empower Filipino researchers and students with cutting-edge artificial intelligence tools that 
              streamline the research process and enhance academic excellence.
            </p>
            <p className="text-slate-300 mb-4">
              Unlike generic writing assistants, ThesisAI understands the unique requirements of academic writing 
              in the Philippine educational context, including specific formatting guidelines, research methodologies, 
              and cultural considerations.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Our Core Features</h2>
            <div className="grid gap-4 md:grid-cols-2 mb-8">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-xl font-semibold text-blue-400 mb-2">AI Research Assistant</h3>
                <p className="text-slate-300">
                  Intelligent tools that help identify research gaps, find relevant sources, and extract key insights 
                  from academic papers.
                </p>
              </div>
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-xl font-semibold text-cyan-400 mb-2">Citation Manager</h3>
                <p className="text-slate-300">
                  Automatically generate citations in various academic styles and manage your bibliography with ease.
                </p>
              </div>
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-xl font-semibold text-purple-400 mb-2">Originality Checker</h3>
                <p className="text-slate-300">
                  Ensure academic integrity by checking your work against millions of sources to detect potential plagiarism.
                </p>
              </div>
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-xl font-semibold text-green-400 mb-2">Advisor Collaboration</h3>
                <p className="text-slate-300">
                  Seamlessly share your work with advisors and peers, receive feedback, and track revisions.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Who Should Use ThesisAI?</h2>
            <ul className="list-disc pl-6 text-slate-300 space-y-2">
              <li>Graduate and undergraduate students working on their thesis or dissertation</li>
              <li>Researchers conducting academic studies in Philippine universities</li>
              <li>Faculty members overseeing student research projects</li>
              <li>Academic institutions looking to enhance their research programs</li>
              <li>Librarians and academic support staff</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Why Choose ThesisAI Philippines?</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-800/30">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Philippine-Focused</h3>
                <p className="text-slate-300">
                  Specifically designed to meet the needs of Filipino students and comply with local academic standards.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-800/30">
                <h3 className="text-lg font-semibold text-purple-400 mb-2">AI-Powered Intelligence</h3>
                <p className="text-slate-300">
                  Leverage advanced artificial intelligence to accelerate your research and writing process.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-cyan-900/20 border border-cyan-800/30">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Academic Integrity</h3>
                <p className="text-slate-300">
                  Designed to assist and enhance your work while maintaining academic honesty and ethical standards.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Getting Started</h2>
            <p className="text-slate-300 mb-4">
              Getting started with ThesisAI is simple. Create your account, familiarize yourself with our tools, 
              and begin transforming your academic writing process. We recommend exploring our 
              <Link href="/documentation/account-setup" className="text-blue-400 hover:underline"> Account Setup </Link>
              guide to configure your profile for optimal results.
            </p>
          </section>
        </div>

        <div className="flex justify-between mt-12">
          <div>
            <Link href="/documentation" className="text-blue-400 hover:underline">
              ← Back to Documentation
            </Link>
          </div>
          <div>
            <Link href="/documentation/account-setup" className="text-blue-400 hover:underline">
              Account Setup →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}