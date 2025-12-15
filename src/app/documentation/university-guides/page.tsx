'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { University, BookOpen, Users, FileText, ShieldCheck, GraduationCap } from 'lucide-react';

export default function UniversityGuidesDoc() {
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
          <h1 className="text-4xl font-bold text-white">University-Specific Guides</h1>
          <p className="mt-4 text-lg text-slate-300">
            Comprehensive guides for thesis requirements and formatting standards across Philippine universities
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Introduction to University-Specific Guides</h2>
            <p className="text-slate-300 mb-4">
              ThesisAI Philippines recognizes that each university in the Philippines has its own unique 
              thesis requirements, formatting standards, and submission procedures. Our University-Specific 
              Guides provide detailed, accurate, and up-to-date information about the requirements at 
              major universities across the country.
            </p>
            <p className="text-slate-300 mb-4">
              These guides are regularly updated in collaboration with university officials and academic 
              staff to ensure compliance with institutional standards and requirements. Whether you're at 
              UP, Ateneo, DLSU, UST, or any other Philippine university, our platform helps ensure your 
              thesis meets the specific standards required by your institution.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Available University Guides</h2>
            
            <div className="space-y-6">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <University className="h-6 w-6 text-blue-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">University of the Philippines (UP)</h3>
                    <p className="text-slate-300 mb-3">
                      Complete guide for UP thesis requirements, including specific formatting standards, 
                      submission procedures, and evaluation criteria across different colleges and campuses.
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-slate-300">
                      <li>UP System-wide thesis writing guidelines</li>
                      <li>College-specific requirements (UP Diliman, UP Manila, UP Visayas, etc.)</li>
                      <li>Defensive procedures and requirements</li>
                      <li>Copyright and Intellectual Property guidelines</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <GraduationCap className="h-6 w-6 text-cyan-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Ateneo de Manila University</h3>
                    <p className="text-slate-300 mb-3">
                      Detailed requirements for Ateneo thesis submissions, including Jesuit educational 
                      values integration, specific format requirements, and quality standards.
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-slate-300">
                      <li>Honor Code compliance requirements</li>
                      <li>Manila Document Format (MDF) specifications</li>
                      <li>Service-oriented research considerations</li>
                      <li>Theology and Philosophy integration guidelines</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <BookOpen className="h-6 w-6 text-purple-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">De La Salle University (DLSU)</h3>
                    <p className="text-slate-300 mb-3">
                      Comprehensive guide for DLSU thesis requirements, including Lasallian values 
                      integration, technical writing standards, and research methodology guidelines.
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-slate-300">
                      <li>Research Office (ORSP) guidelines</li>
                      <li>Technical writing and documentation requirements</li>
                      <li>Entrepreneurial mindset integration</li>
                      <li>Patent and commercialization considerations</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <FileText className="h-6 w-6 text-green-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">University of Santo Tomas (UST)</h3>
                    <p className="text-slate-300 mb-3">
                      Complete UST thesis requirements guide, including Catholic educational values, 
                      historical documentation standards, and specific formatting procedures.
                    </p>
                    <ul className="list-disc pl-6 space-y-2 text-slate-300">
                      <li>Archival and historical research guidelines</li>
                      <li>Thomasian values integration</li>
                      <li>Traditional and contemporary research approaches</li>
                      <li>Religious and cultural sensitivity requirements</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-start gap-4">
                  <Users className="h-6 w-6 text-amber-400 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Other University Systems</h3>
                    <p className="text-slate-300 mb-3">
                      Guides for other major Philippine universities and systems:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
                      <ul className="list-disc pl-6">
                        <li>Far Eastern University (FEU)</li>
                        <li>Adamson University</li>
                        <li>Central Philippine University</li>
                        <li>Technological Institute of the Philippines (TIP)</li>
                      </ul>
                      <ul className="list-disc pl-6">
                        <li>University of the East (UE)</li>
                        <li>Mapua University</li>
                        <li>Lyceum of the Philippines</li>
                        <li>Philippine Women's University</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">How University Guides Are Integrated</h2>
            
            <div className="space-y-8">
              <div className="p-6 rounded-xl bg-blue-900/20 border border-blue-800/30">
                <h3 className="text-xl font-semibold text-blue-400 mb-3">Automated Formatting</h3>
                <p className="text-slate-300 mb-4">
                  When you select your university, ThesisAI automatically applies the appropriate formatting:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Page layout specifications (margins, orientation, paper size)</li>
                  <li>Font types, sizes, and formatting requirements</li>
                  <li>Spacing rules (line spacing, paragraph spacing)</li>
                  <li>Header and footer configurations</li>
                  <li>Title page and front matter formatting</li>
                  <li>Chapter organization and numbering systems</li>
                  <li>Reference and citation style preferences</li>
                  <li>Appendix and supplementary material formatting</li>
                </ul>
              </div>
              
              <div className="p-6 rounded-xl bg-green-900/20 border border-green-800/30">
                <h3 className="text-xl font-semibold text-green-400 mb-3">Content Guidelines</h3>
                <p className="text-slate-300 mb-4">
                  University-specific content requirements are integrated into the writing process:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Required sections and chapter structures</li>
                  <li>Abstract length and format specifications</li>
                  <li>Approval and signature sheet requirements</li>
                  <li>Copyright and permission guidelines</li>
                  <li>Special considerations for different fields of study</li>
                  <li>Defensive presentation requirements</li>
                  <li>Revision and resubmission procedures</li>
                </ul>
              </div>
              
              <div className="p-6 rounded-xl bg-purple-900/20 border border-purple-800/30">
                <h3 className="text-xl font-semibold text-purple-400 mb-3">Submission Preparation</h3>
                <p className="text-slate-300 mb-4">
                  The platform guides you through the submission process:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Required documents and checklists</li>
                  <li>Digital submission portal instructions</li>
                  <li>Hard copy preparation guidelines</li>
                  <li>Binding and presentation requirements</li>
                  <li>Timeline and deadline management</li>
                  <li>Schedule of defense preparation</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Selecting Your University</h2>
            
            <h3 className="text-xl font-semibold text-cyan-400 mb-3">During Project Setup</h3>
            <p className="text-slate-300 mb-4">
              When creating a new thesis project, you'll be prompted to select your university:
            </p>
            <ol className="list-decimal pl-6 space-y-4 text-slate-300">
              <li>Click &quot;New Thesis Project&quot; in your dashboard</li>
              <li>Select your university from the comprehensive list</li>
              <li>Choose your college or school within the university</li>
              <li>Specify your degree program and field of study</li>
              <li>Confirm your program level (undergraduate, master's, doctorate)</li>
              <li>Review the specific requirements summary for your institution</li>
            </ol>
            
            <h3 className="text-xl font-semibold text-yellow-400 mb-3 mt-8">Changing University Settings</h3>
            <p className="text-slate-300 mb-4">
              If you need to change your university selection:
            </p>
            <ol className="list-decimal pl-6 space-y-4 text-slate-300">
              <li>Go to &quot;Project Settings&quot; for your active thesis</li>
              <li>Select &quot;University Configuration&quot;</li>
              <li>Choose your new university from the list</li>
              <li>Review changes that will be applied to your document</li>
              <li>Apply changes (existing content will be reformatted)</li>
              <li>Verify that formatting has been properly updated</li>
            </ol>
            
            <div className="mt-6 p-4 rounded-lg bg-amber-900/20 border border-amber-800/30">
              <h4 className="font-semibold text-amber-400 mb-2">Important Note</h4>
              <p className="text-slate-300">
                Changing your university selection will update all formatting and structural elements 
                of your document to comply with the new institution's requirements. Any custom formatting 
                you've applied may be overwritten. We recommend reviewing your document after changing 
                university settings to ensure content integrity.
              </p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">University-Specific Features</h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-2">Local Content Integration</h3>
                <p className="text-slate-300">
                  Incorporate local research, statistics, and cultural considerations relevant to your institution's focus.
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-2">Regional Language Support</h3>
                <p className="text-slate-300">
                  For universities emphasizing regional languages, the assistant supports local language integration where appropriate.
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-2">Institutional Values Alignment</h3>
                <p className="text-slate-300">
                  Align your research with your university's specific mission, vision, and institutional values.
                </p>
              </div>
              
              <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-2">Faculty and Resource Integration</h3>
                <p className="text-slate-300">
                  Connect with university-specific resources, faculty expertise, and research centers.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Staying Updated with Requirements</h2>
            
            <div className="space-y-6">
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-xl font-semibold text-cyan-400 mb-3">Automatic Updates</h3>
                <p className="text-slate-300 mb-4">
                  ThesisAI automatically receives updates when universities update their requirements:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Changes to formatting standards</li>
                  <li>Updates to citation requirements</li>
                  <li>New institutional policies</li>
                  <li>Modified submission procedures</li>
                  <li>Revised evaluation criteria</li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-xl font-semibold text-green-400 mb-3">Notification System</h3>
                <p className="text-slate-300 mb-4">
                  You will be notified of requirement changes that affect your work:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Email notifications for significant changes</li>
                  <li>In-platform alerts for requirement updates</li>
                  <li>Dashboard notifications with change summaries</li>
                  <li>Options to apply updates immediately or review later</li>
                </ul>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <h3 className="text-xl font-semibold text-purple-400 mb-3">Verification Process</h3>
                <p className="text-slate-300 mb-4">
                  All university requirement information is verified through official channels:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-slate-300">
                  <li>Direct collaboration with university offices</li>
                  <li>Regular communication with academic administrators</li>
                  <li>Verification through official university handbooks</li>
                  <li>Input from faculty and staff at partner institutions</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Getting Support for University Requirements</h2>
            
            <h3 className="text-xl font-semibold text-blue-400 mb-3">In-Platform Guidance</h3>
            <p className="text-slate-300 mb-4">
              ThesisAI provides contextual help throughout the writing process:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-300">
              <li>Context-sensitive help with university requirements</li>
              <li>Pop-up explanations for specific formatting rules</li>
              <li>Examples based on your institution's standards</li>
              <li>Tips for meeting particular university expectations</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-yellow-400 mb-3 mt-6">University Liaison Program</h3>
            <p className="text-slate-300 mb-4">
              We maintain direct relationships with universities to ensure accuracy:
            </p>
            <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
              <ul className="list-disc pl-6 text-slate-300">
                <li>Direct contact with Graduate School or Thesis Offices</li>
                <li>Partnership agreements with key academic units</li>
                <li>Annual verification of all requirement documents</li>
                <li>Faculty advisory input on best practices</li>
              </ul>
            </div>
            
            <h3 className="text-xl font-semibold text-red-400 mb-3 mt-6">Discrepancy Reporting</h3>
            <p className="text-slate-300 mb-4">
              If you find discrepancies between ThesisAI guidance and your university requirements:
            </p>
            <ol className="list-decimal pl-6 text-slate-300">
              <li>Contact your university's thesis office directly to confirm the correct requirement</li>
              <li>Report the discrepancy through our platform feedback system</li>
              <li>Include specific details about the conflicting requirement</li>
              <li>We will verify and update our guides promptly</li>
              <li>Continue following your university's official requirements until changes are implemented</li>
            </ol>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Best Practices for Managing University Requirements</h2>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-green-900/20 border border-green-800/30">
                <h3 className="text-lg font-semibold text-green-400 mb-2">Pre-Writing Phase</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Verify your university's current requirements before starting</li>
                  <li>Download the latest university handbook or thesis manual</li>
                  <li>Connect with your thesis advisor early in the process</li>
                  <li>Attend thesis writing workshops offered by your university</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-800/30">
                <h3 className="text-lg font-semibold text-blue-400 mb-2">Writing Phase</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Regularly refer to university-specific guidelines</li>
                  <li>Use the platform's university-specific templates</li>
                  <li>Have periodic check-ins with your advisor</li>
                  <li>Review formatting requirements as you progress</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-800/30">
                <h3 className="text-lg font-semibold text-purple-400 mb-2">Review Phase</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Conduct final format review using university checklist</li>
                  <li>Have multiple review cycles with different proofreaders</li>
                  <li>Print sample pages to check physical format requirements</li>
                  <li>Confirm all university-specific forms are completed</li>
                </ul>
              </div>
              
              <div className="p-4 rounded-lg bg-amber-900/20 border border-amber-800/30">
                <h3 className="text-lg font-semibold text-amber-400 mb-2">Submission Phase</h3>
                <ul className="list-disc pl-6 text-slate-300">
                  <li>Follow the exact submission procedure outlined by your university</li>
                  <li>Allow sufficient time for formatting reviews</li>
                  <li>Prepare both digital and physical copies as required</li>
                  <li>Keep submission receipts and confirmations</li>
                </ul>
              </div>
            </div>
          </section>
        </div>

        <div className="flex justify-between mt-12">
          <div>
            <Link href="/documentation/citation-manager" className="text-blue-400 hover:underline">
              ← Citation Manager
            </Link>
          </div>
          <div>
            <Link href="/documentation/support-center" className="text-blue-400 hover:underline">
              Support Center →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}