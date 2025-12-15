'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Shield, Lock, Eye, FileText, Users, Calendar, Clock, Globe } from 'lucide-react';

export default function PrivacyPolicyDoc() {
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
          <h1 className="text-4xl font-bold text-white">Privacy Policy & Data Protection</h1>
          <p className="mt-4 text-lg text-slate-300">
            Comprehensive information about how ThesisAI Philippines collects, uses, and protects your data
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-invert max-w-none">
          <div className="text-center mb-12 bg-slate-800/50 border border-slate-700/50 rounded-xl p-8">
            <p className="text-slate-300 mb-2">Last Updated:</p>
            <p className="text-lg font-semibold text-blue-400">December 12, 2025</p>
            <p className="mt-4 text-slate-400">
              <Lock className="inline h-4 w-4 mr-2" />
              This privacy policy applies to all users of ThesisAI Philippines
            </p>
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Introduction to Our Privacy Commitment</h2>
            <p className="text-slate-300 mb-4">
              At ThesisAI Philippines, we are deeply committed to protecting your privacy and safeguarding 
              your personal information. As a platform serving the Filipino academic community, we understand 
              the sensitivity of academic work and the importance of maintaining the confidentiality and 
              integrity of your research.
            </p>
            <p className="text-slate-300 mb-4">
              This Privacy Policy describes how we collect, use, share, and protect the information you 
              provide when using our AI-powered academic writing platform. Our commitment extends beyond 
              legal compliance to ensure that your academic work remains yours, securely stored and protected.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Information We Collect</h2>
            
            <div className="space-y-6">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-center gap-4 mb-4">
                  <Shield className="h-6 w-6 text-blue-400" />
                  <h3 className="text-xl font-semibold text-white">Personal Information</h3>
                </div>
                <p className="text-slate-300 mb-4">
                  When you create an account with ThesisAI Philippines, we collect the following personal information:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li><strong>Email Address:</strong> Used for account verification and communication</li>
                  <li><strong>Name:</strong> Displayed in your profile and used for personalization</li>
                  <li><strong>Academic Information:</strong> University, program, year level, and research focus</li>
                  <li><strong>Institutional Affiliation:</strong> University or school information (optional)</li>
                  <li><strong>Contact Information:</strong> Phone number and address (if provided)</li>
                  <li><strong>Academic Credentials:</strong> Degree level and field of study</li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-center gap-4 mb-4">
                  <FileText className="h-6 w-6 text-cyan-400" />
                  <h3 className="text-xl font-semibold text-white">Academic Content</h3>
                </div>
                <p className="text-slate-300 mb-4">
                  The academic content you create and upload to ThesisAI includes:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li><strong>Thesis Documents:</strong> All chapters, proposals, and academic papers</li>
                  <li><strong>Research Materials:</strong> Notes, references, and source materials</li>
                  <li><strong>Drafts and Revisions:</strong> All versions of your academic work</li>
                  <li><strong>Research Data:</strong> Surveys, interview data, and other research materials</li>
                  <li><strong>Collaboration Content:</strong> Comments, feedback, and discussion threads</li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-center gap-4 mb-4">
                  <Globe className="h-6 w-6 text-purple-400" />
                  <h3 className="text-xl font-semibold text-white">Technical Information</h3>
                </div>
                <p className="text-slate-300 mb-4">
                  We automatically collect technical information about your usage:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li><strong>Device Information:</strong> Browser type, operating system, screen resolution</li>
                  <li><strong>Usage Data:</strong> Pages visited, features used, time spent on platform</li>
                  <li><strong>IP Address:</strong> Geolocation data (used only for anti-fraud measures)</li>
                  <li><strong>Performance Metrics:</strong> System performance and error reporting</li>
                  <li><strong>AI Interaction Logs:</strong> Tools used and outputs generated (for quality improvement)</li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-center gap-4 mb-4">
                  <Users className="h-6 w-6 text-green-400" />
                  <h3 className="text-xl font-semibold text-white">Collaboration Information</h3>
                </div>
                <p className="text-slate-300 mb-4">
                  Information related to collaboration features:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li><strong>Collaborator Invitations:</strong> Email addresses of invited collaborators</li>
                  <li><strong>Permission Settings:</strong> Access levels and permissions granted to others</li>
                  <li><strong>Interaction Records:</strong> Comments, reviews, and feedback exchanges</li>
                  <li><strong>Shared Content:</strong> Documents shared with advisors, critics, and peers</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">How We Use Your Information</h2>
            
            <div className="grid gap-6 md:grid-cols-2 mb-8">
              <div className="p-6 rounded-lg bg-blue-900/20 border border-blue-800/30">
                <h3 className="text-lg font-semibold text-blue-400 mb-3">Service Provision</h3>
                <ul className="space-y-2 text-slate-300">
                  <li>Provide access to academic writing tools and AI assistance</li>
                  <li>Store and manage your research documents securely</li>
                  <li>Enable real-time collaboration with advisors and peers</li>
                  <li>Deliver personalized academic recommendations</li>
                  <li>Process citation and reference management requests</li>
                  <li>Provide backup and synchronization services</li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-cyan-900/20 border border-cyan-800/30">
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">AI System Improvement</h3>
                <ul className="space-y-2 text-slate-300">
                  <li>Train and improve our AI models (with anonymized data)</li>
                  <li>Enhance tool accuracy and relevance</li>
                  <li>Identify common academic writing challenges</li>
                  <li>Develop new AI capabilities for academic use</li>
                  <li>Improve user experience based on usage patterns</li>
                  <li>Maintain and improve system performance</li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-green-900/20 border border-green-800/30">
                <h3 className="text-lg font-semibold text-green-400 mb-3">Communication</h3>
                <ul className="space-y-2 text-slate-300">
                  <li>Send important account and security notifications</li>
                  <li>Provide updates about feature releases and maintenance</li>
                  <li>Respond to support requests and inquiries</li>
                  <li>Send academic resource recommendations (with consent)</li>
                  <li>Invite participation in user experience surveys</li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-purple-900/20 border border-purple-800/30">
                <h3 className="text-lg font-semibold text-purple-400 mb-3">Legal Compliance</h3>
                <ul className="space-y-2 text-slate-300">
                  <li>Comply with Philippine Data Privacy Act requirements</li>
                  <li>Resolve disputes and enforce our agreements</li>
                  <li>Protect our legal rights and interests</li>
                  <li>Investigate potential violations of our policies</li>
                  <li>Cooperate with regulatory authorities when required</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Data Protection and Security Measures</h2>
            
            <div className="space-y-6">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-xl font-semibold text-yellow-400 mb-4">Technical Safeguards</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                      <div>
                        <h4 className="font-medium text-white">Encryption</h4>
                        <p className="text-sm text-slate-300">AES-256 encryption for data at rest and TLS 1.3 for data in transit</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                      <div>
                        <h4 className="font-medium text-white">Access Control</h4>
                        <p className="text-sm text-slate-300">Role-based permissions with multi-factor authentication</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                      <div>
                        <h4 className="font-medium text-white">Secure Storage</h4>
                        <p className="text-sm text-slate-300">Cloud infrastructure with SOC 2 Type II compliance</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                      <div>
                        <h4 className="font-medium text-white">Regular Audits</h4>
                        <p className="text-sm text-slate-300">Quarterly security assessments and penetration testing</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                      <div>
                        <h4 className="font-medium text-white">Intrusion Detection</h4>
                        <p className="text-sm text-slate-300">24/7 monitoring for suspicious activities</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                      <div>
                        <h4 className="font-medium text-white">Data Backup</h4>
                        <p className="text-sm text-slate-300">Daily encrypted backups with 99.99% uptime SLA</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-xl font-semibold text-amber-400 mb-4">Administrative Safeguards</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-white mb-2">Staff Training and Access</h4>
                    <p className="text-slate-300">
                      All ThesisAI employees undergo mandatory privacy training and sign confidentiality agreements. 
                      Access to user data is restricted to authorized personnel based on job necessity.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-2">Data Retention and Disposal</h4>
                    <p className="text-slate-300">
                      We retain your data only as long as necessary for providing our services or as required 
                      by law. Upon account deletion, your data is securely wiped within 30 days using 
                      industry-standard protocols.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-2">Incident Response</h4>
                    <p className="text-slate-300">
                      We maintain a comprehensive incident response plan that includes immediate containment, 
                      assessment, remediation, and notification procedures in case of any security incidents.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">AI Model Training and Data Usage</h2>
            
            <h3 className="text-xl font-semibold text-cyan-400 mb-3">How Your Content is Used in AI Models</h3>
            <p className="text-slate-300 mb-4">
              As an AI-powered academic platform, we use aggregated, anonymized data to improve our services. 
              However, we prioritize your ownership and privacy:
            </p>
            
            <div className="grid gap-6 mb-8">
              <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-800/30">
                <h4 className="font-semibold text-blue-400 mb-2">What We Do</h4>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Use aggregate patterns to improve grammar and style suggestions</li>
                  <li>Analyze common research challenges to enhance our tools</li>
                  <li>Train models on publicly shared content (with explicit consent)</li>
                  <li>Improve academic writing recommendations based on usage patterns</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-red-900/20 border border-red-800/30">
                <h4 className="font-semibold text-red-400 mb-2">What We Don't Do</h4>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Use your private documents in training without explicit consent</li>
                  <li>Share your academic content with third parties for their AI training</li>
                  <li>Use your research for commercial purposes outside our platform</li>
                  <li>Retain personally identifiable information in training datasets</li>
                </ul>
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-green-900/20 border border-green-800/30">
              <h4 className="font-semibold text-green-400 mb-2">Your Control Over AI Usage</h4>
              <p className="text-slate-300">
                You have complete control over how your content is used to improve our AI systems. 
                Through your privacy settings, you can opt in or out of contributing to model improvements. 
                Any content you choose to share for AI improvement is anonymized and combined with other 
                users' content, ensuring your individual work remains private.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">User Rights and Data Control</h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Your Data Rights</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <Eye className="h-5 w-5 text-blue-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-white">Access Right</p>
                      <p className="text-sm text-slate-300">Request a copy of all data we hold about you</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Lock className="h-5 w-5 text-green-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-white">Rectification Right</p>
                      <p className="text-sm text-slate-300">Correct inaccurate personal information</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-purple-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-white">Erasure Right</p>
                      <p className="text-sm text-slate-300">Request deletion of your personal data</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-cyan-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-white">Portability Right</p>
                      <p className="text-sm text-slate-300">Export your academic work in various formats</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Managing Your Data</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-amber-400 mb-2">Privacy Settings</h4>
                    <p className="text-slate-300 text-sm">
                      Accessible through your account settings, these controls allow you to manage:
                    </p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-300 text-sm">
                      <li>Marketing communications preferences</li>
                      <li>AI model training consent</li>
                      <li>Collaboration privacy settings</li>
                      <li>Data retention preferences</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-amber-400 mb-2">Export and Deletion</h4>
                    <p className="text-slate-300 text-sm">
                      You can export or delete your data at any time through the account management section.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Third-Party Services and Integration</h2>
            
            <h3 className="text-xl font-semibold text-purple-400 mb-3">Services We Use</h3>
            <p className="text-slate-300 mb-4">
              ThesisAI integrates with carefully selected third-party services to enhance your experience:
            </p>
            
            <div className="space-y-4 mb-6">
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h4 className="font-semibold text-white mb-2">Cloud Infrastructure</h4>
                <p className="text-slate-300 text-sm mb-2">
                  We use secure cloud providers that comply with international security standards:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-slate-300 text-sm">
                  <li>Data storage in geographically distributed, secure facilities</li>
                  <li>Regular security audits and compliance certifications</li>
                  <li>Industry-standard encryption and access controls</li>
                  <li>Philippine data residency options available</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h4 className="font-semibold text-white mb-2">Payment Processing</h4>
                <p className="text-slate-300 text-sm mb-2">
                  Secure payment processing through PCI DSS compliant providers:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-slate-300 text-sm">
                  <li>Tokenization of payment information</li>
                  <li>End-to-end encryption for transactions</li>
                  <li>Zero-knowledge storage of financial data</li>
                  <li>Compliance with Bangko Sentral ng Pilipinas guidelines</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h4 className="font-semibold text-white mb-2">Academic Databases</h4>
                <p className="text-slate-300 text-sm mb-2">
                  Integration with university libraries and academic databases:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-slate-300 text-sm">
                  <li>Secure API connections with proper authentication</li>
                  <li>No transmission of your academic documents to external databases</li>
                  <li>Compliance with university library access policies</li>
                  <li>Protection of institutional access credentials</li>
                </ul>
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-amber-900/20 border border-amber-800/30">
              <h4 className="font-semibold text-amber-400 mb-2">Your Responsibility</h4>
              <p className="text-slate-300 text-sm">
                You are responsible for understanding the privacy policies of any third-party services 
                you connect to ThesisAI. We recommend reviewing these policies before integration.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Compliance with Philippine Laws</h2>
            
            <div className="grid gap-6">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-xl font-semibold text-blue-400 mb-3">Data Privacy Act Compliance</h3>
                <p className="text-slate-300 mb-4">
                  ThesisAI Philippines fully complies with Republic Act No. 10173, the Data Privacy Act of 2012, 
                  and all subsequent regulations:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Registration with the National Privacy Commission</li>
                  <li>Implementation of privacy by design principles</li>
                  <li>Mandatory breach notification procedures</li>
                  <li>User consent mechanisms for data processing</li>
                  <li>Appointment of a Data Protection Officer</li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-xl font-semibold text-green-400 mb-3">Academic Integrity Standards</h3>
                <p className="text-slate-300 mb-4">
                  We align with Philippine academic standards and university requirements:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Compliance with university-specific research ethics</li>
                  <li>Support for institutional review board requirements</li>
                  <li>Facilitation of proper citation and attribution practices</li>
                  <li>Tools designed to enhance, not replace, academic work</li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-xl font-semibold text-cyan-400 mb-3">Intellectual Property Rights</h3>
                <p className="text-slate-300 mb-4">
                  Protection of your intellectual property in accordance with Philippine IP laws:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Recognition of authorship for all academic content</li>
                  <li>Compliance with copyright and fair use provisions</li>
                  <li>Support for patent and trademark considerations</li>
                  <li>Respect for traditional knowledge and cultural heritage</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Contact Information</h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Data Protection Inquiry</h3>
                <p className="text-slate-300 mb-4">
                  For privacy-related questions, concerns, or requests:
                </p>
                <address className="not-italic text-slate-300">
                  <p className="font-medium text-blue-400">Data Protection Officer</p>
                  <p>ThesisAI Philippines</p>
                  <p>Email: privacy@thesisai-philippines.com</p>
                  <p>Phone: +63 (2) 8xxx-xxxx</p>
                </address>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">National Privacy Commission</h3>
                <p className="text-slate-300 mb-4">
                  You may file complaints with the National Privacy Commission:
                </p>
                <address className="not-italic text-slate-300">
                  <p className="font-medium text-green-400">National Privacy Commission</p>
                  <p>Roosevelt Boulevard, Quezon City, Philippines</p>
                  <p>Website: www.privacy.gov.ph</p>
                  <p>Helpline: 8898-5050</p>
                </address>
              </div>
            </div>
          </section>

          <div className="border-t border-slate-700/50 pt-8 mt-12">
            <p className="text-slate-400 text-sm">
              This Privacy Policy is effective as of December 12, 2025. We may update this policy to reflect 
              changes in our practices or legal requirements. We will notify users of any material changes 
              through the platform and via email.
            </p>
          </div>
        </div>

        <div className="flex justify-between mt-12">
          <div>
            <Link href="/documentation/support-center" className="text-blue-400 hover:underline">
              ← Support Center
            </Link>
          </div>
          <div>
            <Link href="/documentation/terms-of-service" className="text-blue-400 hover:underline">
              Terms of Service →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}