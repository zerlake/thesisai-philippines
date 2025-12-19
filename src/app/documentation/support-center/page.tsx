'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Headphones, Mail, MessageSquare, BookOpen, Shield, Users, Calendar, Clock } from 'lucide-react';

export default function SupportCenterDoc() {
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
          <h1 className="text-4xl font-bold text-white">Support Center & Help Resources</h1>
          <p className="mt-4 text-lg text-slate-300">
            Comprehensive support resources, troubleshooting guides, and contact options for ThesisAI users
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Getting Help with ThesisAI</h2>
            <p className="text-slate-300 mb-4">
              At ThesisAI Philippines, we're committed to providing exceptional support to help you 
              achieve academic success. Our comprehensive support system includes multiple channels, 
              extensive documentation, and community resources to assist you at every stage of your 
              thesis journey.
            </p>
            <p className="text-slate-300 mb-4">
              This guide will help you navigate our support options and find the most appropriate 
              resources for your needs, whether you're facing technical issues, need academic guidance, 
              or have questions about using our AI tools effectively.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Support Channels</h2>
            
            <div className="grid gap-6 mb-8">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Headphones className="h-6 w-6 text-blue-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Live Chat Support</h3>
                    <p className="text-slate-300 mb-2"><strong>Availability:</strong> Monday-Friday, 8:00 AM - 10:00 PM (Philippine Time)</p>
                    <p className="text-slate-300">
                      Get instant help from our support team through the live chat feature located in the 
                      bottom-right corner of your ThesisAI dashboard. Our support specialists can assist 
                      with technical issues, account questions, and tool usage guidance.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Mail className="h-6 w-6 text-cyan-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Email Support</h3>
                    <p className="text-slate-300 mb-2"><strong>Response Time:</strong> Within 24 business hours</p>
                    <p className="text-slate-300">
                      Send detailed inquiries to support@thesisai-philippines.com. This channel is ideal 
                      for complex issues, feature requests, or when you need to attach files or screenshots 
                      to help us understand your issue better.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <MessageSquare className="h-6 w-6 text-purple-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Academic Consultation</h3>
                    <p className="text-slate-300 mb-2"><strong>Scheduling:</strong> Available through calendar booking</p>
                    <p className="text-slate-300">
                      For complex academic questions or detailed guidance on using ThesisAI for your specific 
                      research needs, schedule a consultation with our academic support specialists. 
                      Sessions are 30-45 minutes and can be scheduled through the support section.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <BookOpen className="h-6 w-6 text-green-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Knowledge Base & Documentation</h3>
                    <p className="text-slate-300 mb-2"><strong>Availability:</strong> 24/7 Self-Service</p>
                    <p className="text-slate-300">
                      Access our comprehensive library of guides, tutorials, and troubleshooting articles 
                      covering all features of ThesisAI. This resource is constantly updated to address 
                      common questions and provide detailed usage instructions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Self-Help Resources</h2>
            
            <div className="grid gap-4 md:grid-cols-2 mb-8">
              <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-800/30">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Documentation Hub</h3>
                <p className="text-slate-300 text-sm mb-3">
                  Comprehensive guides for all ThesisAI features and tools
                </p>
                <ul className="list-disc pl-6 space-y-1 text-slate-300 text-sm">
                  <li>Getting started guides</li>
                  <li>Detailed feature tutorials</li>
                  <li>University-specific guides</li>
                  <li>AI tool usage best practices</li>
                  <li>Troubleshooting guides</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-green-900/20 border border-green-800/30">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Video Tutorials</h3>
                <p className="text-slate-300 text-sm mb-3">
                  Step-by-step visual guides for using ThesisAI tools
                </p>
                <ul className="list-disc pl-6 space-y-1 text-slate-300 text-sm">
                  <li>Screen recordings demonstrating features</li>
                  <li>Walkthrough of common workflows</li>
                  <li>Tips and tricks videos</li>
                  <li>Feature update announcements</li>
                  <li>Academic writing guidance</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-800/30">
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Community Forum</h3>
                <p className="text-slate-300 text-sm mb-3">
                  Connect with other researchers and share experiences
                </p>
                <ul className="list-disc pl-6 space-y-1 text-slate-300 text-sm">
                  <li>Q&A with experienced users</li>
                  <li>Best practices discussions</li>
                  <li>University-specific tips</li>
                  <li>Feature requests and feedback</li>
                  <li>Success story sharing</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-amber-900/20 border border-amber-800/30">
                <h3 className="text-lg font-semibold text-amber-400 mb-2">FAQ Section</h3>
                <p className="text-slate-300 text-sm mb-3">
                  Answers to the most common questions about ThesisAI
                </p>
                <ul className="list-disc pl-6 space-y-1 text-slate-300 text-sm">
                  <li>Account and subscription questions</li>
                  <li>Technical troubleshooting</li>
                  <li>Academic integrity concerns</li>
                  <li>University requirement clarifications</li>
                  <li>Billing and payment inquiries</li>
                </ul>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-cyan-400 mb-3">Quick Access Links</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
                <Link href="/faq">Common Questions</Link>
              </Button>
              <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
                <Link href="/troubleshooting">Troubleshooting</Link>
              </Button>
              <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
                <Link href="/video-tutorials">Video Guides</Link>
              </Button>
              <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800">
                <Link href="/community-forum">Community</Link>
              </Button>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Troubleshooting Common Issues</h2>
            
            <div className="space-y-6">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-red-400 mb-3">Login and Account Issues</h3>
                <ul className="list-disc pl-6 space-y-3 text-slate-300">
                  <li>
                    <strong>Forgot Password:</strong> Use the &quot;Forgot Password&quot; link on the login page. 
                    Check your spam folder if you don't receive the reset email.
                  </li>
                  <li>
                    <strong>Account Verification:</strong> If you don't receive your verification email, 
                    check your spam folder and wait 5-10 minutes as email delivery can take time.
                  </li>
                  <li>
                    <strong>Two-Factor Authentication:</strong> Contact support if you lose access to 
                    your authentication device or phone number.
                  </li>
                  <li>
                    <strong>School Account Issues:</strong> For university-affiliated accounts, ensure 
                    you're using your official school email and check with your IT department about 
                    external application permissions.
                  </li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-yellow-400 mb-3">Technical Issues</h3>
                <ul className="list-disc pl-6 space-y-3 text-slate-300">
                  <li>
                    <strong>Slow Performance:</strong> Clear your browser cache and cookies. 
                    Ensure you have a stable internet connection with at least 5 Mbps download speed.
                  </li>
                  <li>
                    <strong>Document Not Saving:</strong> Check your internet connection. 
                    Look for a sync status indicator in the top-right corner of the editor. 
                    Manually save using Ctrl+S if auto-save isn't working.
                  </li>
                  <li>
                    <strong>AI Tools Not Responding:</strong> Check if you've reached your quota 
                    for the day/month. Refresh the page or clear your browser cache and try again.
                  </li>
                  <li>
                    <strong>Formatting Issues:</strong> Switch to a different browser to determine 
                    if the issue is browser-specific. Export your work to prevent data loss.
                  </li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-green-400 mb-3">AI Tool Specific Issues</h3>
                <ul className="list-disc pl-6 space-y-3 text-slate-300">
                  <li>
                    <strong>Grammar Checker:</strong> Results may vary based on document complexity. 
                    Use the &quot;Improve&quot; option for iterative improvements rather than expecting 
                    perfection in one pass.
                  </li>
                  <li>
                    <strong>Paraphraser:</strong> Preserve technical terms manually as the AI may 
                    not always recognize domain-specific terminology that should remain unchanged.
                  </li>
                  <li>
                    <strong>Research Gap Identifier:</strong> Provide more detailed source material 
                    to improve the accuracy of gap identification. Results improve with more comprehensive input.
                  </li>
                  <li>
                    <strong>Citation Manager:</strong> Double-check automatically generated citations 
                    for accuracy. Some citation styles have complex rules that may require manual adjustment.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Preparing for Support Requests</h2>
            
            <h3 className="text-xl font-semibold text-blue-400 mb-3">Before Contacting Support</h3>
            <p className="text-slate-300 mb-4">
              Following these steps can help you resolve many issues quickly:
            </p>
            
            <div className="grid gap-6 md:grid-cols-2 mb-8">
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h4 className="font-semibold text-white mb-3">Basic Troubleshooting</h4>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Refresh your browser (Ctrl+F5 or Cmd+Shift+R)</li>
                  <li>Clear browser cache and cookies</li>
                  <li>Try a different browser (Chrome, Firefox, Edge)</li>
                  <li>Disable browser extensions that might interfere</li>
                  <li>Check your internet connection stability</li>
                  <li>Log out and log back in to refresh the session</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h4 className="font-semibold text-white mb-3">Information to Gather</h4>
                <p className="text-slate-300 mb-3">
                  Prepare these details to expedite your support request:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Browser type and version</li>
                  <li>Operating system and version</li>
                  <li>Specific steps that led to the issue</li>
                  <li>Expected vs. actual results</li>
                  <li>Screenshots of error messages</li>
                  <li>Approximate time when the issue occurred</li>
                </ul>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-purple-400 mb-3">Effective Communication with Support</h3>
            <p className="text-slate-300 mb-4">
              Provide clear, detailed information when contacting support:
            </p>
            <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-800/30">
              <ul className="list-disc pl-6 space-y-3 text-slate-300">
                <li><strong>Subject Line:</strong> Use a descriptive subject that summarizes the issue</li>
                <li><strong>Context:</strong> Explain what you were trying to accomplish</li>
                <li><strong>Steps:</strong> List the specific steps you took that led to the issue</li>
                <li><strong>Error Information:</strong> Include exact error messages (copy and paste when possible)</li>
                <li><strong>Frequency:</strong> Indicate if this is a recurring issue or happened once</li>
                <li><strong>Impact:</strong> Describe how this affects your academic work or timeline</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Academic Support Services</h2>
            
            <div className="space-y-6">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Users className="h-6 w-6 text-cyan-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Advisory Consultation Support</h3>
                    <p className="text-slate-300 mb-3">
                      We provide specialized support for academic advisors and thesis critics:
                    </p>
                    <ul className="list-disc pl-6 text-slate-300">
                      <li>Guidance on integrating ThesisAI into your advisory process</li>
                      <li>Training materials for introducing students to the platform</li>
                      <li>Recommendations for structuring feedback using our tools</li>
                      <li>Best practices for reviewing AI-assisted student work</li>
                      <li>Understanding AI-tool indicators in student submissions</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Shield className="h-6 w-6 text-green-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Academic Integrity Resources</h3>
                    <p className="text-slate-300 mb-3">
                      Comprehensive resources for maintaining academic integrity:
                    </p>
                    <ul className="list-disc pl-6 text-slate-300">
                      <li>Guidelines for appropriate AI tool usage</li>
                      <li>Educational materials on academic honesty</li>
                      <li>Resources for detecting AI-assisted writing (when required)</li>
                      <li>Best practices for ethical research conduct</li>
                      <li>University policy alignment resources</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <BookOpen className="h-6 w-6 text-purple-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Educational Resources</h3>
                    <p className="text-slate-300 mb-3">
                      Supplementary learning materials for academic skill development:
                    </p>
                    <ul className="list-disc pl-6 text-slate-300">
                      <li>Research methodology guides</li>
                      <li>Academic writing workshops</li>
                      <li>Data analysis training modules</li>
                      <li>Statistical tools tutorials</li>
                      <li>Plagiarism avoidance resources</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Emergency Support Procedures</h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-red-900/20 border border-red-800/30">
                <h3 className="text-lg font-semibold text-red-400 mb-2">Critical Issues</h3>
                <p className="text-slate-300 mb-3">
                  For critical issues close to deadlines:
                </p>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Contact emergency support via live chat</li>
                  <li>Clearly indicate the urgency and deadline in your message</li>
                  <li>Provide backup access to your work if possible</li>
                  <li>Have your account information ready</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-amber-900/20 border border-amber-800/30">
                <h3 className="text-lg font-semibold text-amber-400 mb-2">Data Recovery</h3>
                <p className="text-slate-300 mb-3">
                  Steps if you lose access to your documents:
                </p>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Check your document history tab</li>
                  <li>Look for auto-saved versions</li>
                  <li>Export your work regularly as backups</li>
                  <li>Contact support immediately with details</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 rounded-lg bg-blue-900/20 border border-blue-800/30">
              <h3 className="text-lg font-semibold text-blue-400 mb-2">Preventive Measures</h3>
              <p className="text-slate-300">
                To minimize the risk of critical issues, regularly export your work in multiple formats, 
                keep local backups of important documents, and start work well before deadlines to 
                allow time for technical issues to be resolved.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Support Policies</h2>
            
            <h3 className="text-xl font-semibold text-yellow-400 mb-3">Response Time Commitments</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="pb-2 text-white">Issue Type</th>
                    <th className="pb-2 text-white">Channel</th>
                    <th className="pb-2 text-white">Committed Response Time</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  <tr className="border-b border-slate-700/50">
                    <td className="py-3">Critical (Impacts submission)</td>
                    <td>Live Chat</td>
                    <td>Within 1 hour</td>
                  </tr>
                  <tr className="border-b border-slate-700/50">
                    <td className="py-3">Technical Issue</td>
                    <td>Email</td>
                    <td>Within 24 hours</td>
                  </tr>
                  <tr className="border-b border-slate-700/50">
                    <td className="py-3">Account Question</td>
                    <td>Email</td>
                    <td>Within 48 hours</td>
                  </tr>
                  <tr>
                    <td className="py-3">Feature Request</td>
                    <td>Forum/Email</td>
                    <td>Within 7 days</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <h3 className="text-xl font-semibold text-green-400 mb-3 mt-8">What We Support</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-green-900/20 border border-green-800/30">
                <h4 className="font-semibold text-green-400 mb-2">Supported Queries</h4>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Technical issues with ThesisAI features</li>
                  <li>Account management questions</li>
                  <li>Billing and subscription issues</li>
                  <li>Feature usage guidance</li>
                  <li>University integration questions</li>
                  <li>Academic integrity guidelines</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-red-900/20 border border-red-800/30">
                <h4 className="font-semibold text-red-400 mb-2">Outside Our Scope</h4>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Academic content review (we provide tools, not content feedback)</li>
                  <li>University policy disputes</li>
                  <li>Personal attacks or inappropriate behavior</li>
                  <li>Issues with non-ThesisAI platforms</li>
                  <li>Requests for illegal activities</li>
                </ul>
              </div>
            </div>
          </section>

          <div className="border-t border-slate-700/50 pt-8 mt-12">
            <h3 className="text-xl font-bold text-white mb-4">Still Need Help?</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Link href="/contact" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Contact Support
                </Link>
              </Button>
              <Button variant="outline" asChild className="border-slate-600 text-white hover:bg-slate-800">
                <Link href="/book-consultation" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule Consultation
                </Link>
              </Button>
              <Button variant="outline" asChild className="border-slate-600 text-white hover:bg-slate-800">
                <Link href="/community-forum" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Join Community
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-12">
          <div>
            <Link href="/documentation/university-guides" className="text-blue-400 hover:underline">
              ← University Guides
            </Link>
          </div>
          <div>
            <Link href="/documentation/privacy-policy" className="text-blue-400 hover:underline">
              Privacy Policy →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}