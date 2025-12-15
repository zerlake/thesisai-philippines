'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Menu, X, Home, BookOpen, Users, Settings, HelpCircle } from 'lucide-react';

export default function NavigationDoc() {
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
          <h1 className="text-4xl font-bold text-white">Navigation & Interface Guide</h1>
          <p className="mt-4 text-lg text-slate-300">
            Understanding the ThesisAI Philippines navigation system and user interface
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Introduction to Navigation</h2>
            <p className="text-slate-300 mb-4">
              The ThesisAI Philippines navigation system is designed to provide intuitive access to 
              academic tools and resources while maintaining a clean, distraction-free environment 
              for focused research and writing.
            </p>
            <p className="text-slate-300">
              Our interface follows best practices for academic software, prioritizing content visibility 
              and task-focused functionality with easy access to powerful AI tools.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Main Navigation Structure</h2>
            
            <div className="grid gap-6 mb-8">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-center gap-4 mb-4">
                  <Home className="h-6 w-6 text-blue-400" />
                  <h3 className="text-xl font-semibold text-white">Top-Level Navigation</h3>
                </div>
                <p className="text-slate-300 mb-4">
                  The main navigation provides access to key academic sections:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li><strong>Home:</strong> Return to the main dashboard</li>
                  <li><strong>Features:</strong> Access all AI-powered academic tools</li>
                  <li><strong>How It Works:</strong> Learn the thesis process and platform workflow</li>
                  <li><strong>Pricing:</strong> Subscription plans and academic pricing options</li>
                  <li><strong>FAQ:</strong> Frequently asked questions and troubleshooting</li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-center gap-4 mb-4">
                  <BookOpen className="h-6 w-6 text-cyan-400" />
                  <h3 className="text-xl font-semibold text-white">Academic Tools Menu</h3>
                </div>
                <p className="text-slate-300 mb-4">
                  The academic tools section provides quick access to specialized AI functions:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li><strong>Research Tools:</strong> Gap identifier, topic generator, literature analyzer</li>
                  <li><strong>Writing Assistance:</strong> Grammar checker, paraphraser, content enhancer</li>
                  <li><strong>Formatting:</strong> Citation manager, university template selector</li>
                  <li><strong>Collaboration:</strong> Advisor connection, critic management</li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-center gap-4 mb-4">
                  <Users className="h-6 w-6 text-purple-400" />
                  <h3 className="text-xl font-semibold text-white">Collaboration Hub</h3>
                </div>
                <p className="text-slate-300 mb-4">
                  Connect with your academic community:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li><strong>Advisors:</strong> Connect with thesis advisors and mentors</li>
                  <li><strong>Critics:</strong> Share with manuscript critics for certification</li>
                  <li><strong>Peers:</strong> Collaborate with fellow students and researchers</li>
                  <li><strong>Groups:</strong> Join research groups and academic communities</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Mobile Navigation</h2>
            
            <p className="text-slate-300 mb-4">
              The mobile navigation provides full access to all features in a compact menu:
            </p>
            
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Menu className="h-5 w-5 text-slate-400" />
                <h3 className="text-lg font-semibold text-white">Hamburger Menu</h3>
              </div>
              <p className="text-slate-300 mb-4">
                When viewing on mobile devices, the navigation collapses into a hamburger menu:
              </p>
              <div className="bg-slate-900 p-4 rounded-lg">
                <ul className="space-y-3 text-slate-300">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Home
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Features
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    How It Works
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Pricing
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    FAQ
                  </li>
                </ul>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-cyan-400 mb-3">Responsive Design Considerations</h3>
            <p className="text-slate-300 mb-4">
              The interface adapts to different screen sizes while maintaining functionality:
            </p>
            <ul className="list-disc pl-6 text-slate-300">
              <li>Full functionality available on mobile devices</li>
              <li>Touch-friendly navigation elements</li>
              <li>Adaptive tool interfaces for smaller screens</li>
              <li>Desktop-optimized wide-screen layout</li>
              <li>Consistent experience across devices</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">User Account Navigation</h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-3">Account Menu</h3>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li><strong>Profile:</strong> View and edit personal information</li>
                  <li><strong>Settings:</strong> Configure preferences and notifications</li>
                  <li><strong>Billing:</strong> Manage subscription and payment info</li>
                  <li><strong>Downloads:</strong> Export documents and data</li>
                  <li><strong>Logout:</strong> Secure session management</li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-3">Quick Access Toolbar</h3>
                <p className="text-slate-300 mb-3">
                  Commonly used features are available in the quick access toolbar:
                </p>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Document creation wizard</li>
                  <li>AI tool quick-launch</li>
                  <li>Collaboration invites</li>
                  <li>Support and help access</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Accessibility Features</h2>
            
            <div className="space-y-6">
              <div className="p-6 rounded-lg bg-blue-900/20 border border-blue-800/30">
                <h3 className="text-lg font-semibold text-blue-400 mb-3">Keyboard Navigation</h3>
                <p className="text-slate-300 mb-4">
                  The platform supports full keyboard navigation:
                </p>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Tab to navigate between interactive elements</li>
                  <li>Arrow keys to navigate menu items</li>
                  <li>Enter/Space to activate links and buttons</li>
                  <li>ESC to close menus and dialogs</li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-green-900/20 border border-green-800/30">
                <h3 className="text-lg font-semibold text-green-400 mb-3">Screen Reader Support</h3>
                <p className="text-slate-300">
                  All UI elements include proper ARIA labels and semantic structure for screen readers:
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Best Practices for Navigation</h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-amber-900/20 border border-amber-800/30">
                <h3 className="text-lg font-semibold text-amber-400 mb-2">Efficiency Tips</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Bookmark frequently used sections</li>
                  <li>Use the search feature to quickly find tools</li>
                  <li>Pin important documents to quick access</li>
                  <li>Familiarize yourself with keyboard shortcuts</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-800/30">
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Organization</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Group related projects in collections</li>
                  <li>Use tags to categorize documents</li>
                  <li>Set up project-based navigation views</li>
                  <li>Maintain a consistent workflow structure</li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        <div className="flex justify-between mt-12">
          <div>
            <Link href="/documentation" className="text-blue-400 hover:underline">
              ← Documentation Home
            </Link>
          </div>
          <div>
            <Link href="/documentation/hero-section" className="text-blue-400 hover:underline">
              Hero Section →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}