'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, Brain, Target, ArrowRight, Star, Users } from 'lucide-react';

export default function HeroSectionDoc() {
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
          <h1 className="text-4xl font-bold text-white">Hero Section & Value Proposition</h1>
          <p className="mt-4 text-lg text-slate-300">
            Understanding the landing page hero section and how it presents ThesisAI value
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Introduction to the Hero Section</h2>
            <p className="text-slate-300 mb-4">
              The hero section of ThesisAI Philippines serves as the primary value proposition and 
              conversion point on our landing page. It's designed to immediately communicate the 
              platform's core value while engaging visitors with compelling visuals and clear pathways 
              to explore our AI-powered academic tools.
            </p>
            <p className="text-slate-300">
              This section follows best practices for academic platform marketing, emphasizing the 
              transformation potential while maintaining professional credibility essential for 
              academic audiences.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Key Components of the Hero Section</h2>
            
            <div className="grid gap-6 mb-8">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Sparkles className="h-6 w-6 text-blue-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Value Proposition Statement</h3>
                    <p className="text-slate-300 mb-4">
                      The hero headline clearly articulates the transformative value:
                    </p>
                    <blockquote className="border-l-4 border-blue-500 pl-4 text-lg text-slate-200 italic">
                      Transform Your Thesis with Enterprise AI
                    </blockquote>
                    <p className="mt-4 text-slate-300">
                      This statement immediately establishes the platform as a transformative tool that will 
                      significantly enhance the thesis writing process using advanced AI technology. The 
                      phrasing emphasizes both the academic context and the sophistication of our tools.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Brain className="h-6 w-6 text-cyan-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Visual Representation</h3>
                    <p className="text-slate-300 mb-4">
                      The 3D brain visualization represents the AI intelligence powering the platform:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-slate-300">
                      <li>Neural network visualization conveys AI sophistication</li>
                      <li>Blue-purple color scheme reinforces technological advancement</li>
                      <li>Animated particles suggest dynamic processing and analysis</li>
                      <li>Asymmetric positioning creates visual interest while maintaining balance</li>
                      <li>Floating elements add premium, enterprise-level aesthetics</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Target className="h-6 w-6 text-purple-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Conversion Elements</h3>
                    <p className="text-slate-300 mb-4">
                      The hero section includes clear calls-to-action designed to convert visitors:
                    </p>
                    <div className="flex flex-wrap gap-4 mt-4">
                      <div className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white text-sm font-medium">
                        Start Free Trial
                      </div>
                      <div className="px-4 py-2 border border-slate-600 rounded-lg text-white text-sm font-medium">
                        View Demo
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Users className="h-6 w-6 text-green-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Credibility Indicators</h3>
                    <p className="text-slate-300 mb-4">
                      Trust-building statistics provide social proof:
                    </p>
                    <div className="grid grid-cols-3 gap-6 mt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">10K+</div>
                        <div className="text-sm text-slate-400">Students</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-cyan-400">99.9%</div>
                        <div className="text-sm text-slate-400">Uptime</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-400">4.9/5</div>
                        <div className="text-sm text-slate-400">Rating</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Design Principles</h2>
            
            <div className="space-y-8">
              <div className="p-6 rounded-lg bg-blue-900/20 border border-blue-800/30">
                <h3 className="text-xl font-semibold text-blue-400 mb-3">Asymmetric Layout</h3>
                <p className="text-slate-300 mb-4">
                  The hero section employs an asymmetric design that breaks convention while maintaining balance:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li><strong>40-60 split:</strong> Content on left, visual on right</li>
                  <li><strong>Offset positioning:</strong> Elements avoid traditional center alignment</li>
                  <li><strong>Dynamic balance:</strong> Visual weight distributed for engagement</li>
                  <li><strong>Modern appeal:</strong> Appeals to tech-savvy academic users</li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-purple-900/20 border border-purple-800/30">
                <h3 className="text-xl font-semibold text-purple-400 mb-3">Color Psychology</h3>
                <p className="text-slate-300 mb-4">
                  The color scheme is strategically chosen for academic and enterprise contexts:
                </p>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-white mb-2">Primary Colors</h4>
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-blue-600 rounded-full mb-2"></div>
                        <span className="text-xs text-slate-300">Trust & Intellect</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-purple-600 rounded-full mb-2"></div>
                        <span className="text-xs text-slate-300">Creativity & Innovation</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-cyan-500 rounded-full mb-2"></div>
                        <span className="text-xs text-slate-300">Technology & Clarity</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-white mb-2">Background Gradients</h4>
                    <p className="text-slate-300">
                      The deep blue to purple gradient evokes feelings of academic rigor, technological 
                      sophistication, and innovative thinking - perfectly matching our target audience's expectations.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-lg bg-cyan-900/20 border border-cyan-800/30">
                <h3 className="text-xl font-semibold text-cyan-400 mb-3">Typography Hierarchy</h3>
                <p className="text-slate-300 mb-4">
                  The typography establishes clear information hierarchy while maintaining readability:
                </p>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-white mb-1">Primary Headline</h4>
                    <p className="text-slate-300 text-sm">7xl font with gradient effect for maximum impact</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Supporting Text</h4>
                    <p className="text-slate-300 text-sm">Larger font sizes for improved accessibility</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">Calls-to-Action</h4>
                    <p className="text-slate-300 text-sm">Bold, contrasting elements to drive conversions</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Visual Elements & Their Purpose</h2>
            
            <h3 className="text-xl font-semibold text-yellow-400 mb-3">Background Elements</h3>
            <p className="text-slate-300 mb-4">
              The background includes subtle animated elements designed to enhance the AI theme:
            </p>
            <div className="grid gap-4 md:grid-cols-2 mb-8">
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h4 className="font-semibold text-white mb-2">Floating Shapes</h4>
                <p className="text-slate-300 text-sm">
                  Soft, glowing shapes that suggest neural network connections and data flow
                </p>
              </div>
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h4 className="font-semibold text-white mb-2">Gradient Overlays</h4>
                <p className="text-slate-300 text-sm">
                  Subtle gradients that create depth and dimension while maintaining focus on content
                </p>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-green-400 mb-3">3D Brain Visualization</h3>
            <p className="text-slate-300 mb-4">
              The centerpiece visualization represents our AI technology in action:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-300 mb-6">
              <li><strong>Neural networks:</strong> Represent our machine learning foundations</li>
              <li><strong>Processing nodes:</strong> Show our data analysis capabilities</li>
              <li><strong>Connection flows:</strong> Demonstrate our research connectivity features</li>
              <li><strong>Dynamic elements:</strong> Highlight our real-time AI assistance</li>
              <li><strong>Asymmetric design:</strong> Reflect our innovative approach to traditional problems</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Conversion Optimization</h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-3">Call-to-Action Strategy</h3>
                <p className="text-slate-300 mb-4">
                  The CTAs are strategically positioned and designed for maximum effectiveness:
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg">
                    <ArrowRight className="h-4 w-4 text-white" />
                    <span className="text-white font-medium">Primary CTA</span>
                  </div>
                  <p className="text-sm text-slate-300">
                    "Start Free Trial" with gradient design to drive immediate engagement
                  </p>
                  
                  <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg">
                    <Star className="h-4 w-4 text-blue-400" />
                    <span className="text-white font-medium">Secondary CTA</span>
                  </div>
                  <p className="text-sm text-slate-300">
                    "View Demo" for users who need more information before committing
                  </p>
                </div>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-3">Trust Indicators</h3>
                <p className="text-slate-300 mb-4">
                  Multiple trust indicators build confidence in our platform:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Student success statistics</li>
                  <li>Platform reliability metrics</li>
                  <li>Quality ratings</li>
                  <li>Professional visual design</li>
                  <li>Clear value proposition</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Performance Considerations</h2>
            
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-800/30">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Loading Optimization</h3>
                <p className="text-slate-300">
                  The hero section is optimized for performance without sacrificing visual impact. 
                  All animations use CSS transforms and opacity for smooth 60fps performance, 
                  and visual elements are efficiently rendered with optimized animation properties.
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-green-900/20 border border-green-800/30">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Accessibility Features</h3>
                <p className="text-slate-300">
                  All visual elements include proper semantic HTML and ARIA attributes. 
                  Animations respect user preferences for reduced motion, and the section 
                  maintains proper heading hierarchy for screen readers.
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-800/30">
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Responsive Design</h3>
                <p className="text-slate-300">
                  The layout adapts gracefully to different screen sizes while maintaining 
                  the core value proposition. On mobile devices, the layout switches to a 
                  stacked arrangement that preserves all functionality and visual appeal.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Best Practices for Academic Platforms</h2>
            
            <p className="text-slate-300 mb-4">
              The hero section implements research-backed best practices for academic software platforms:
            </p>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-amber-900/20 border border-amber-800/30">
                <h3 className="text-lg font-semibold text-amber-400 mb-2">Academic Messaging</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Focus on transformation of academic process</li>
                  <li>Emphasize time-saving and quality improvement</li>
                  <li>Highlight institutional and advisor recognition</li>
                  <li>Mention specific academic use cases</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-cyan-900/20 border border-cyan-800/30">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Technology Confidence</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Show AI sophistication without intimidation</li>
                  <li>Emphasize augmentation, not replacement</li>
                  <li>Highlight human-AI collaboration</li>
                  <li>Focus on empowerment rather than automation</li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        <div className="flex justify-between mt-12">
          <div>
            <Link href="/documentation/navigation" className="text-blue-400 hover:underline">
              ← Navigation & Interface
            </Link>
          </div>
          <div>
            <Link href="/documentation/bento-grid-features" className="text-blue-400 hover:underline">
              Bento Grid Features →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}