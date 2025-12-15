'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HelpCircle, MessageSquare, Search, ThumbsUp, Star, ShieldCheck, BookOpen, Users } from 'lucide-react';

export default function FAQDoc() {
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
          <h1 className="text-4xl font-bold text-white">Frequently Asked Questions</h1>
          <p className="mt-4 text-lg text-slate-300">
            Answers to common questions about ThesisAI Philippines and academic AI tools
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-invert max-w-none">
          <section className="mb-12">
            <div className="mb-12">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search in FAQs..."
                  className="w-full pl-12 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-6">General Questions</h2>
            
            <div className="space-y-6">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-xl font-semibold text-white mb-3">What is ThesisAI Philippines?</h3>
                <p className="text-slate-300">
                  ThesisAI Philippines is the premier AI-powered academic writing platform for Filipino students and researchers. 
                  Our platform combines artificial intelligence with academic expertise to provide tools for thesis research, 
                  manuscript checking, and academic writing automation. We're specifically designed to meet the needs of 
                  students in Philippine universities, with support for local academic standards and requirements.
                </p>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-xl font-semibold text-white mb-3">Is ThesisAI appropriate for all academic levels?</h3>
                <p className="text-slate-300">
                  Yes, ThesisAI supports all academic levels from undergraduate to doctoral studies. Our tools 
                  are designed to scale in complexity and depth according to your academic level. Whether 
                  you're working on a simple term paper or a complex doctoral dissertation, our platform 
                  provides the appropriate level of assistance and sophistication.
                </p>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-xl font-semibold text-white mb-3">How does ThesisAI differ from other writing tools?</h3>
                <p className="text-slate-300">
                  ThesisAI was specifically built for the Filipino academic environment with:
                </p>
                <ul className="list-disc pl-6 mt-2 text-slate-300">
                  <li>Deep understanding of Philippine university requirements and standards</li>
                  <li>Integration with local academic databases and resources</li>
                  <li>Features designed for thesis and dissertation-specific workflows</li>
                  <li>AI models trained on academic content relevant to the Philippines context</li>
                  <li>Collaboration tools for working with local advisors and critics</li>
                  <li>Support for Filipino universities' specific formatting requirements</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">AI Tools & Features</h2>
            
            <div className="space-y-6">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-xl font-semibold text-white mb-3">How do I use the AI writing assistant ethically?</h3>
                <p className="text-slate-300 mb-4">
                  Our AI tools are designed to assist and enhance your academic work, not replace your 
                  original thinking. Ethical use includes:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Using AI-generated suggestions as starting points for your own original work</li>
                  <li>Always reviewing and verifying AI output for accuracy and appropriateness</li>
                  <li>Ensuring AI assistance aligns with your institution's academic integrity policies</li>
                  <li>Maintaining intellectual ownership and authorship of your work</li>
                  <li>Properly citing any AI-suggested sources or references</li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-xl font-semibold text-white mb-3">What AI tools are available in ThesisAI?</h3>
                <p className="text-slate-300 mb-4">
                  Our platform includes numerous AI-powered tools:
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-800/30">
                    <h4 className="font-semibold text-blue-400 mb-2">Research Tools</h4>
                    <ul className="list-disc pl-6 text-slate-300 text-sm">
                      <li>Research gap identifier</li>
                      <li>Topic generator</li>
                      <li>Literature analyzer</li>
                      <li>Reference formatter</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-cyan-900/20 border border-cyan-800/30">
                    <h4 className="font-semibold text-cyan-400 mb-2">Writing Tools</h4>
                    <ul className="list-disc pl-6 text-slate-300 text-sm">
                      <li>AI writing assistant</li>
                      <li>Grammar checker</li>
                      <li>Paraphraser</li>
                      <li>Style enhancer</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-800/30">
                    <h4 className="font-semibold text-purple-400 mb-2">Analysis Tools</h4>
                    <ul className="list-disc pl-6 text-slate-300 text-sm">
                      <li>Citation analyzer</li>
                      <li>Originality checker</li>
                      <li>Methodology consultant</li>
                      <li>Thesis structure advisor</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-green-900/20 border border-green-800/30">
                    <h4 className="font-semibold text-green-400 mb-2">Collaboration Tools</h4>
                    <ul className="list-disc pl-6 text-slate-300 text-sm">
                      <li>Advisor collaboration</li>
                      <li>Critic integration</li>
                      <li>Peer review system</li>
                      <li>Progress tracking</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-xl font-semibold text-white mb-3">Can the AI complete my thesis for me?</h3>
                <p className="text-slate-300">
                  No, ThesisAI does not and cannot complete your thesis for you. Our AI tools are designed 
                  to assist and enhance your research and writing process, but the original thinking, 
                  critical analysis, and creative synthesis required for academic work must come from you. 
                  Using AI to bypass the learning process or present AI-generated content as your own 
                  original work violates academic integrity standards. Our platform is meant to support 
                  your intellectual development, not replace it.
                </p>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-xl font-semibold text-white mb-3">How accurate are the AI-generated suggestions?</h3>
                <p className="text-slate-300">
                  Our AI tools provide high-quality suggestions based on extensive training data and 
                  advanced algorithms, but they are not infallible. All AI-generated content should 
                  be reviewed critically for accuracy, relevance, and appropriateness for your specific 
                  research context. You are ultimately responsible for the content of your academic work 
                  and should verify all AI-generated information against reliable academic sources.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Academic Integrity & Ethics</h2>
            
            <div className="space-y-6">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-xl font-semibold text-white mb-3">How does ThesisAI support academic integrity?</h3>
                <p className="text-slate-300 mb-4">
                  Academic integrity is foundational to our platform design:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>We provide tools to help you improve your own writing, not replace it</li>
                  <li>Our AI generates suggestions that you must review, verify, and integrate thoughtfully</li>
                  <li>We include educational resources about proper AI tool usage in academia</li>
                  <li>Our platform encourages proper citation and attribution practices</li>
                  <li>We provide transparency about AI involvement in content generation</li>
                  <li>We align our tools with university academic honor codes and policies</li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-xl font-semibold text-white mb-3">What should I do if my university has strict AI policies?</h3>
                <p className="text-slate-300">
                  If your university has specific policies regarding AI tool usage:
                </p>
                <ol className="list-decimal pl-6 mt-4 space-y-2 text-slate-300">
                  <li>Review your institution's official policy carefully</li>
                  <li>Consult with your thesis advisor or department about appropriate AI usage</li>
                  <li>Use the disclosure tools provided in our platform to document AI assistance</li>
                  <li>Adjust your usage patterns to align with your university's guidelines</li>
                  <li>Contact our support team if you need help configuring your usage for compliance</li>
                </ol>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-xl font-semibold text-white mb-3">How do I cite ThesisAI in my work?</h3>
                <p className="text-slate-300 mb-4">
                  The appropriate citation method depends on your institution's specific requirements. 
                  Generally, if your university requires disclosure of AI usage:
                </p>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Include a statement in your methodology section acknowledging AI assistance</li>
                  <li>Describe how you used the tools and what functions you used</li>
                  <li>Specify that AI tools assisted with research, writing, or analysis</li>
                  <li>Emphasize your critical role in reviewing and validating AI-generated content</li>
                  <li>Ensure you maintain intellectual ownership of your academic work</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">University & Institutional Questions</h2>
            
            <div className="space-y-6">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-xl font-semibold text-white mb-3">Does ThesisAI work with my university's requirements?</h3>
                <p className="text-slate-300">
                  ThesisAI is designed to support the formatting and structural requirements of major 
                  Philippine universities. Our platform includes templates and formatting tools that 
                  align with local academic standards. When you create a new project, you can select 
                  your specific university from our database to automatically apply the appropriate 
                  formatting guidelines. We continuously update our templates based on feedback from 
                  students and faculty across the Philippines.
                </p>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-xl font-semibold text-white mb-3">Can my advisor access my work on ThesisAI?</h3>
                <p className="text-slate-300 mb-4">
                  Yes, our platform includes collaboration features that allow you to invite advisors 
                  and critics to review your work. You maintain control over access permissions:
                </p>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Invite specific individuals with email invitations</li>
                  <li>Control their access level (view, comment, or edit)</li>
                  <li>Share specific documents or entire project folders</li>
                  <li>Track feedback and revision history</li>
                  <li>Maintain privacy for drafts until ready for review</li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-xl font-semibold text-white mb-3">How does ThesisAI handle institutional partnerships?</h3>
                <p className="text-slate-300">
                  We work directly with universities to ensure our platform aligns with institutional 
                  policies and requirements. Our institutional partnerships include faculty training, 
                  curriculum integration support, and customization of platform features to match 
                  specific university needs. If your institution is interested in a partnership, 
                  please contact our academic relations team.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Technical Questions</h2>
            
            <div className="space-y-6">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-xl font-semibold text-white mb-3">What browsers and devices are supported?</h3>
                <p className="text-slate-300">
                  ThesisAI is fully responsive and works on all modern devices and browsers. For 
                  the best experience, we recommend using the latest versions of Chrome, Safari, 
                  Firefox, or Edge. Our platform is optimized for desktop computers but also offers 
                  full functionality on tablets. Mobile phones can access most features, though 
                  the writing experience is optimized for larger screens.
                </p>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-xl font-semibold text-white mb-3">How is my data secured and backed up?</h3>
                <p className="text-slate-300">
                  Data security is paramount to our platform. All documents are encrypted both in 
                  transit and at rest using industry-standard AES-256 encryption. We implement 
                  multi-layer security measures including secure cloud storage, regular security 
                  audits, and access controls. Your academic work is backed up daily, and you can 
                  export your work in multiple formats at any time. We do not use your personal 
                  academic content for training AI models without explicit consent.
                </p>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-xl font-semibold text-white mb-3">How much storage do I have?</h3>
                <p className="text-slate-300">
                  Storage limits depend on your subscription plan. Basic accounts include 5GB of 
                  academic document storage, which is typically sufficient for multiple thesis 
                  projects. Premium plans offer 50GB of storage. All plans include unlimited 
                  version history and project management features. Large files (like high-resolution 
                  images) are automatically optimized to preserve quality while managing storage usage.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Pricing & Subscription</h2>
            
            <div className="space-y-6">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-xl font-semibold text-white mb-3">What subscription options are available?</h3>
                <p className="text-slate-300 mb-4">
                  We offer several plans to accommodate different academic needs:
                </p>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-800/30">
                    <h4 className="font-semibold text-blue-400 mb-2">Free</h4>
                    <ul className="list-disc pl-6 text-slate-300 text-sm">
                      <li>Essential AI tools</li>
                      <li>5GB storage</li>
                      <li>Basic formatting</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-800/30">
                    <h4 className="font-semibold text-purple-400 mb-2">Student</h4>
                    <ul className="list-disc pl-6 text-slate-300 text-sm">
                      <li>Full AI tool suite</li>
                      <li>20GB storage</li>
                      <li>Advanced analytics</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-green-900/20 border border-green-800/30">
                    <h4 className="font-semibold text-green-400 mb-2">Premium</h4>
                    <ul className="list-disc pl-6 text-slate-300 text-sm">
                      <li>Unlimited AI access</li>
                      <li>50GB storage</li>
                      <li>Priority support</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-xl font-semibold text-white mb-3">Are there discounts for academic institutions?</h3>
                <p className="text-slate-300">
                  Yes, we offer academic institution discounts and special pricing for bulk student 
                  purchases. Universities and colleges can contact our academic sales team to discuss 
                  institutional licensing options, faculty packages, and classroom integration support. 
                  We also provide free access for professors who wish to evaluate the platform for 
                  course integration.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Support & Troubleshooting</h2>
            
            <div className="space-y-6">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-xl font-semibold text-white mb-3">How do I get help if I encounter issues?</h3>
                <p className="text-slate-300 mb-4">
                  We offer multiple support channels:
                </p>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Live chat support with academic specialists (Mon-Fri, 8am-10pm)</li>
                  <li>Email support at support@thesisai-philippines.com</li>
                  <li>Comprehensive documentation and video tutorials</li>
                  <li>Community forum for peer assistance</li>
                  <li>Academic consultation sessions for complex research questions</li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-xl font-semibold text-white mb-3">What if I'm not satisfied with the platform?</h3>
                <p className="text-slate-300">
                  We offer a 14-day money-back guarantee for all paid subscriptions. If you're not 
                  satisfied with ThesisAI for your academic work, contact our support team within 
                  14 days of purchase for a full refund. We continuously work to improve our platform 
                  based on user feedback and academic requirements.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-xl p-8 text-center border border-slate-700/50">
              <h3 className="text-2xl font-bold text-white mb-4">Still Have Questions?</h3>
              <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
                Our support team is here to help with any questions not covered in our FAQs. 
                We're committed to supporting your academic success with ThesisAI Philippines.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700">
                  <Link href="/contact">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Contact Support
                  </Link>
                </Button>
                <Button variant="outline" asChild className="border-slate-600 text-white hover:bg-slate-800">
                  <Link href="/community">Join Community</Link>
                </Button>
                <Button variant="outline" asChild className="border-slate-600 text-white hover:bg-slate-800">
                  <Link href="/tutorials">View Tutorials</Link>
                </Button>
              </div>
            </div>
          </section>
        </div>

        <div className="flex justify-between mt-12">
          <div>
            <Link href="/documentation/terms-of-service" className="text-blue-400 hover:underline">
              ← Terms of Service
            </Link>
          </div>
          <div>
            <Link href="/documentation/university-guides" className="text-blue-400 hover:underline">
              University Guides →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}