'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Scale, FileText, Users, AlertTriangle, Shield, Clock, Globe } from 'lucide-react';

export default function TermsOfServiceDoc() {
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
          <h1 className="text-4xl font-bold text-white">Terms of Service</h1>
          <p className="mt-4 text-lg text-slate-300">
            Legal terms and conditions governing your use of ThesisAI Philippines
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-invert max-w-none">
          <div className="text-center mb-12 bg-slate-800/50 border border-slate-700/50 rounded-xl p-8">
            <p className="text-slate-300 mb-2">Effective Date:</p>
            <p className="text-lg font-semibold text-blue-400">December 12, 2025</p>
            <p className="mt-4 text-slate-400">
              <Scale className="inline h-4 w-4 mr-2" />
              Please read these terms carefully before using ThesisAI Philippines
            </p>
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Agreement to Terms</h2>
            <p className="text-slate-300 mb-4">
              By accessing or using ThesisAI Philippines (&quot;the Platform&quot;, &quot;we&quot;, 
              &quot;us&quot;, &quot;our&quot;), you agree to be bound by these Terms of Service 
              (&quot;Terms&quot;, &quot;Agreement&quot;). These Terms constitute a legally binding 
              agreement between you (&quot;User&quot;, &quot;you&quot;, &quot;your&quot;) and 
              ThesisAI Philippines regarding your use of our AI-powered academic writing platform.
            </p>
            <p className="text-slate-300 mb-4">
              If you are using the Platform on behalf of an institution, organization, or other legal entity, 
              you represent that you have the authority to bind that entity to these Terms and in such case 
              &quot;you&quot; shall refer to that entity.
            </p>
            <p className="text-slate-300">
              Your access to and use of the Platform is conditioned on your acceptance of and compliance 
              with these Terms. These Terms apply to all users, visitors, and others who access or use the Platform.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Use License and Access</h2>
            
            <div className="space-y-6">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <FileText className="h-6 w-6 text-blue-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Personal Academic Use</h3>
                    <p className="text-slate-300 mb-4">
                      Subject to your compliance with these Terms, ThesisAI Philippines grants you a limited, 
                      non-exclusive, non-transferable license to access and use the Platform for your personal 
                      academic research and writing purposes.
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-slate-300">
                      <li>Use for undergraduate, graduate, or doctoral thesis work</li>
                      <li>Personal research and academic writing activities</li>
                      <li>Collaboration with academic advisors and research partners as permitted</li>
                      <li>Preparation of academic presentations and defenses</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Users className="h-6 w-6 text-cyan-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Institutional Use</h3>
                    <p className="text-slate-300 mb-4">
                      Academic institutions may use the Platform under separate institutional licensing agreements:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-slate-300">
                      <li>Faculty use for research and academic development</li>
                      <li>Student access as part of academic programs</li>
                      <li>Departmental or library licensing arrangements</li>
                      <li>University-wide implementation coordination</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="h-6 w-6 text-amber-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Prohibited Uses</h3>
                    <p className="text-slate-300 mb-4">
                      You shall not use the Platform for:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-slate-300">
                      <li>Academic dishonesty or plagiarism activities</li>
                      <li>Substituting AI-generated content as your own original work</li>
                      <li>Commercial reproduction or distribution of academic content</li>
                      <li>Harassment, discrimination, or other harmful content</li>
                      <li>Violating intellectual property rights of others</li>
                      <li>Activities that compromise academic integrity</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Account Registration and Responsibilities</h2>
            
            <h3 className="text-xl font-semibold text-purple-400 mb-3">Registration Requirements</h3>
            <p className="text-slate-300 mb-4">
              To access certain features of the Platform, you may be required to provide registration details 
              or other information. You agree that:
            </p>
            <ul className="list-disc pl-6 space-y-3 text-slate-300 mb-6">
              <li>All registration information is truthful, accurate, and complete</li>
              <li>You will maintain the accuracy of your information</li>
              <li>You are responsible for safeguarding your account credentials</li>
              <li>You will be responsible for all activities under your account</li>
              <li>You will notify us immediately of any unauthorized access to your account</li>
              <li>If you are a student, you have legitimate academic standing at an institution</li>
              <li>You are of legal age or have appropriate parental consent</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-cyan-400 mb-3">Student Account Specifics</h3>
            <p className="text-slate-300 mb-4">
              As a student user, you acknowledge and agree to additional responsibilities:
            </p>
            <ul className="list-disc pl-6 space-y-3 text-slate-300">
              <li>Use of Platform tools must align with your academic institution's honor code</li>
              <li>You will obtain appropriate permissions before sharing institutional information</li>
              <li>You maintain responsibility for the content generated with Platform assistance</li>
              <li>You will properly attribute use of AI tools as required by your institution</li>
              <li>You use the Platform to enhance your learning, not bypass academic requirements</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Intellectual Property Rights</h2>
            
            <div className="grid gap-6 mb-8">
              <div className="p-6 rounded-lg bg-blue-900/20 border border-blue-800/30">
                <h3 className="text-xl font-semibold text-blue-400 mb-3">Your Content</h3>
                <p className="text-slate-300 mb-4">
                  You retain ownership of all academic content you create, upload, or store on the Platform:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>You own all rights to your original academic work</li>
                  <li>ThesisAI Philippines does not claim ownership of your academic content</li>
                  <li>Your work remains your property and intellectual asset</li>
                  <li>You have the right to export your content at any time</li>
                  <li>You control sharing and collaboration permissions</li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-xl font-semibold text-white mb-3">Platform Content</h3>
                <p className="text-slate-300 mb-4">
                  The Platform and its original content, features, and functionality are owned by 
                  ThesisAI Philippines and are protected by international copyright, trademark, 
                  and other intellectual property laws.
                </p>
                <p className="text-slate-300">
                  Our AI-generated suggestions, analyses, and recommendations are provided for your 
                  use within the context of your own academic work. You may incorporate these into 
                  your work but must ensure they align with academic integrity standards.
                </p>
              </div>
              
              <div className="p-6 rounded-lg bg-purple-900/20 border border-purple-800/30">
                <h3 className="text-xl font-semibold text-purple-400 mb-3">AI-Generated Content</h3>
                <p className="text-slate-300 mb-4">
                  AI-generated content provided by our tools is licensed to you for use in your academic work:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>You may use AI suggestions as part of your academic work</li>
                  <li>You must ensure AI content meets your institution's standards</li>
                  <li>You remain responsible for academic integrity and proper attribution</li>
                  <li>We disclaim liability for errors in AI-generated content</li>
                  <li>You must verify accuracy and appropriateness of AI suggestions</li>
                </ul>
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-amber-900/20 border border-amber-800/30">
              <h4 className="font-semibold text-amber-400 mb-2">Academic Attribution</h4>
              <p className="text-slate-300">
                You are responsible for proper attribution and citation of sources. While the Platform 
                assists with citation management, the ultimate responsibility for academic integrity 
                rests with you as the student or researcher.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">AI Tool Usage Guidelines</h2>
            
            <div className="space-y-6">
              <div className="p-6 rounded-lg bg-green-900/20 border border-green-800/30">
                <h3 className="text-xl font-semibold text-green-400 mb-3">Appropriate AI Usage</h3>
                <p className="text-slate-300 mb-4">
                  You agree to use our AI tools ethically and in accordance with academic standards:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Use AI tools to enhance your learning, not replace critical thinking</li>
                  <li>Understand and verify AI-generated suggestions before incorporation</li>
                  <li>Maintain your own analytical and writing skills</li>
                  <li>Properly attribute AI assistance as required by your institution</li>
                  <li>Ensure AI usage aligns with your university's academic integrity policy</li>
                  <li>Use AI outputs as starting points for your own original work</li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-red-900/20 border border-red-800/30">
                <h3 className="text-xl font-semibold text-red-400 mb-3">Inappropriate AI Usage</h3>
                <p className="text-slate-300 mb-4">
                  The following uses of AI tools are strictly prohibited:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Presenting AI-generated content as your own original work</li>
                  <li>Bypassing learning through over-reliance on AI</li>
                  <li>Using AI to complete assessments without permission</li>
                  <li>Generating content that violates academic integrity</li>
                  <li>Attempting to use AI to deceive instructors or evaluators</li>
                  <li>Sharing AI-generated content without proper attribution</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">User Responsibilities and Conduct</h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-3">Expected Behavior</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Maintain academic integrity in all activities</li>
                  <li>Respect other users and collaborators</li>
                  <li>Use accurate and appropriate content</li>
                  <li>Respect intellectual property rights</li>
                  <li>Follow your academic institution's policies</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-3">Prohibited Activities</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Sharing false or misleading academic content</li>
                  <li>Engaging in harassment or discrimination</li>
                  <li>Violating academic honesty standards</li>
                  <li>Attempting to gain unauthorized access to others' accounts</li>
                  <li>Disrupting the Platform's functionality</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Collaboration Features</h2>
            
            <p className="text-slate-300 mb-4">
              The Platform offers collaboration tools that require special responsibility:
            </p>
            
            <div className="space-y-4 mb-6">
              <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-800/30">
                <h3 className="font-semibold text-blue-400 mb-2">Advisor and Critic Collaboration</h3>
                <p className="text-slate-300">
                  When collaborating with academic advisors, critics, or other reviewers:
                </p>
                <ul className="list-disc pl-6 mt-2 text-slate-300">
                  <li>Share only content you have rights to distribute</li>
                  <li>Respect confidentiality of shared materials</li>
                  <li>Follow your institution's collaboration policies</li>
                  <li>Maintain professional communication standards</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-green-900/20 border border-green-800/30">
                <h3 className="font-semibold text-green-400 mb-2">Peer Collaboration</h3>
                <p className="text-slate-300">
                  When collaborating with fellow students or researchers:
                </p>
                <ul className="list-disc pl-6 mt-2 text-slate-300">
                  <li>Respect shared document privacy</li>
                  <li>Follow academic collaboration ethics</li>
                  <li>Attribute collaborative contributions appropriately</li>
                  <li>Use collaboration tools for learning enhancement</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Termination and Suspension</h2>
            
            <h3 className="text-xl font-semibold text-yellow-400 mb-3">Grounds for Termination</h3>
            <p className="text-slate-300 mb-4">
              We may terminate or suspend your access to the Platform immediately, without prior notice, 
              for any of the following reasons:
            </p>
            <ul className="list-disc pl-6 space-y-3 text-slate-300 mb-6">
              <li>Breach of these Terms of Service</li>
              <li>Violation of academic integrity standards</li>
              <li>Engagement in inappropriate conduct toward other users</li>
              <li>Unauthorized use of academic materials</li>
              <li>Failure to comply with your academic institution's policies</li>
              <li>Misuse of AI tools or collaboration features</li>
              <li>Attempting to circumvent security measures</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-cyan-400 mb-3">Effect of Termination</h3>
            <p className="text-slate-300">
              Upon termination, your right to use the Platform will cease immediately. You will no 
              longer have access to your account or stored content unless you export it beforehand. 
              We may retain certain information as required by law or for legitimate business purposes.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Limitation of Liability</h2>
            
            <div className="p-6 rounded-lg bg-amber-900/20 border border-amber-800/30">
              <p className="text-slate-300 mb-4">
                ThesisAI Philippines shall not be liable for any indirect, incidental, special, 
                consequential or punitive damages, including without limitation, loss of profits, 
                data, use, goodwill, or other intangible losses, resulting from your access to or 
                use of the Platform or any content provided through our services.
              </p>
              
              <p className="text-slate-300 mb-4">
                Our liability is limited to the fullest extent permitted by law. In no event shall 
                the collective liability of ThesisAI Philippines to you exceed the amounts you have 
                paid to ThesisAI Philippines for use of the Platform in the past twelve (12) months.
              </p>
              
              <p className="text-slate-300">
                We do not guarantee that the Platform will be error-free, uninterrupted, or that all 
                content generated by our AI tools will be accurate. You use the Platform at your own risk.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">AI Accuracy Disclaimer</h2>
            
            <div className="space-y-6">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-xl font-semibold text-white mb-3">AI Tool Limitations</h3>
                <p className="text-slate-300 mb-4">
                  Our AI tools are designed to assist with academic writing and research but have inherent limitations:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>AI-generated content may contain inaccuracies or errors</li>
                  <li>AI suggestions may not be appropriate for all contexts or institutions</li>
                  <li>AI analysis may miss nuanced academic requirements</li>
                  <li>AI tools cannot replace human judgment and critical thinking</li>
                  <li>AI-generated content may require verification and validation</li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-red-900/20 border border-red-800/30">
                <h3 className="text-xl font-semibold text-red-400 mb-3">User Responsibility</h3>
                <p className="text-slate-300">
                  You are solely responsible for reviewing, validating, and verifying all AI-generated 
                  content before incorporating it into your academic work. You acknowledge that you 
                  must ensure all content meets your institution's academic standards and requirements.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Governing Law and Dispute Resolution</h2>
            
            <p className="text-slate-300 mb-4">
              These Terms shall be governed and construed in accordance with the laws of the Republic 
              of the Philippines, without regard to its conflict of law provisions. You agree to submit 
              to the exclusive jurisdiction of the courts located in Quezon City, Philippines for any 
              disputes arising out of or relating to these Terms or your use of the Platform.
            </p>
            
            <p className="text-slate-300 mb-4">
              In case of disputes, we encourage users to first seek resolution through our support 
              channels. If informal resolution is not successful, parties agree to engage in mediation 
              before pursuing litigation. Small claims court proceedings are exempt from this requirement.
            </p>
            
            <p className="text-slate-300">
              Any controversy, claim or dispute arising out of or relating to these Terms, or the 
              breach, termination, enforcement, interpretation or validity thereof, shall be referred 
              to and finally resolved by arbitration under the Rules of Procedure of the Philippine 
              Dispute Resolution Center, Inc. (PDRCI).
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Changes to Terms</h2>
            
            <p className="text-slate-300 mb-4">
              ThesisAI Philippines reserves the right to modify these Terms at any time. We will 
              notify users of any material changes through the Platform and via email at least 
              30 days before the changes take effect. Your continued use of the Platform after 
              the effective date of any changes constitutes acceptance of such changes.
            </p>
            
            <p className="text-slate-300">
              Minor changes may be effective immediately for legal compliance or security purposes. 
              We encourage users to review these Terms periodically to stay informed of updates.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Contact Information</h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-3">General Inquiries</h3>
                <address className="not-italic text-slate-300">
                  <p>ThesisAI Philippines</p>
                  <p>Email: legal@thesisai-philippines.com</p>
                  <p>Support: support@thesisai-philippines.com</p>
                </address>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-3">Legal Department</h3>
                <address className="not-italic text-slate-300">
                  <p>For legal questions or notices:</p>
                  <p>Email: legal@thesisai-philippines.com</p>
                  <p>Address: Legal Department, ThesisAI Philippines</p>
                </address>
              </div>
            </div>
          </section>
        </div>

        <div className="border-t border-slate-700/50 pt-8 mt-12">
          <p className="text-slate-400 text-sm">
            These Terms of Service were last updated on December 12, 2025. These Terms govern your 
            access to and use of the ThesisAI Philippines Platform and supersede all prior agreements 
            and understandings related to your use of the Platform.
          </p>
        </div>
      </div>

      <div className="flex justify-between mt-12">
        <div>
          <Link href="/documentation/privacy-policy" className="text-blue-400 hover:underline">
            ← Privacy Policy
          </Link>
        </div>
        <div>
          <Link href="/documentation/faq" className="text-blue-400 hover:underline">
            FAQ →
          </Link>
        </div>
      </div>
    </div>
  );
}