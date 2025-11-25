'use client';

import Link from 'next/link';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white">Terms of Service</h1>
          <p className="mt-4 text-slate-400">
            Last updated: November 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white">1. Acceptance of Terms</h2>
            <p className="mt-4 text-slate-300">
              By accessing and using ThesisAI ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
            <p className="mt-4 text-slate-300">
              We reserve the right to modify these Terms of Service at any time. Your continued use of the Service following any changes constitutes your acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">2. Use License</h2>
            <p className="mt-4 text-slate-300">
              Permission is granted to temporarily download one copy of the materials (information or software) on ThesisAI for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="mt-3 list-inside list-disc space-y-2 text-slate-300">
              <li>Modifying or copying the materials</li>
              <li>Using the materials for any commercial purpose or for any public display</li>
              <li>Attempting to decompile or reverse engineer any software contained</li>
              <li>Removing any copyright or other proprietary notations</li>
              <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
              <li>Violating any applicable laws or regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">3. Disclaimer</h2>
            <p className="mt-4 text-slate-300">
              The materials on ThesisAI are provided on an 'as is' basis. ThesisAI makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
            <p className="mt-4 text-slate-300">
              Further, ThesisAI does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">4. Limitations</h2>
            <p className="mt-4 text-slate-300">
              In no event shall ThesisAI or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on ThesisAI, even if ThesisAI or an authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">5. Accuracy of Materials</h2>
            <p className="mt-4 text-slate-300">
              The materials appearing on ThesisAI could include technical, typographical, or photographic errors. ThesisAI does not warrant that any of the materials on our website are accurate, complete, or current. ThesisAI may make changes to the materials contained on our website at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">6. Materials and Content</h2>
            <p className="mt-4 text-slate-300">
              The materials on ThesisAI are protected by copyright law. You may not reproduce, republish, redistribute, or transmit any content without proper attribution and permission. All user-generated content must comply with applicable laws and regulations.
            </p>
            <p className="mt-4 text-slate-300">
              By submitting content to ThesisAI, you grant us a non-exclusive license to use, reproduce, modify, and distribute such content for the purpose of providing and improving our Services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">7. Links</h2>
            <p className="mt-4 text-slate-300">
              ThesisAI has not reviewed all of the sites linked to our website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by ThesisAI of the site. Use of any such linked website is at the user's own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">8. Modifications</h2>
            <p className="mt-4 text-slate-300">
              ThesisAI may revise these terms of service for our website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">9. Governing Law</h2>
            <p className="mt-4 text-slate-300">
              These terms and conditions are governed by and construed in accordance with the laws of the United States, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">10. User Accounts</h2>
            <p className="mt-4 text-slate-300">
              If you create an account on ThesisAI, you are responsible for maintaining the confidentiality of your account information and password. You agree to accept responsibility for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account.
            </p>
            <p className="mt-4 text-slate-300">
              You represent and warrant that the information you provide is true, accurate, and complete. You agree not to use a username or password that you know or have reason to know belongs to another person.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">11. Acceptable Use</h2>
            <p className="mt-4 text-slate-300">
              You agree not to use ThesisAI for any unlawful purposes or in any way that could damage, disable, or impair our Services. Prohibited behaviors include:
            </p>
            <ul className="mt-3 list-inside list-disc space-y-2 text-slate-300">
              <li>Harassing or causing distress or inconvenience to any person</li>
              <li>Transmitting malicious or harmful code</li>
              <li>Attempting to gain unauthorized access to systems</li>
              <li>Academic dishonesty or plagiarism</li>
              <li>Violating intellectual property rights</li>
              <li>Spamming or phishing activities</li>
              <li>Impersonating another user or entity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">12. Intellectual Property Rights</h2>
            <p className="mt-4 text-slate-300">
              All content, features, and functionality of ThesisAI (including but not limited to all information, software, text, displays, images, video and audio) and the design, selection and arrangement thereof are owned by ThesisAI, its licensors or other providers of such material and are protected by United States and international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">13. Termination</h2>
            <p className="mt-4 text-slate-300">
              We reserve the right to terminate your account and access to our Services at any time, for any reason, with or without notice. We may terminate accounts that violate these Terms of Service or engage in fraudulent or illegal activity.
            </p>
            <p className="mt-4 text-slate-300">
              Upon termination, your right to use the Service immediately ceases. We are not liable to you or any third party for termination of your account or access to our Services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">14. Payment Terms</h2>
            <p className="mt-4 text-slate-300">
              If you purchase a subscription or other paid services through ThesisAI, you agree to pay all charges that you incur. We may change our pricing at any time, but price changes will not apply to existing subscriptions until your next renewal date.
            </p>
            <p className="mt-4 text-slate-300">
              We offer a 30-day money-back guarantee for new subscriptions if you're not satisfied with our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">15. Refunds and Cancellation</h2>
            <p className="mt-4 text-slate-300">
              You may cancel your subscription at any time through your account settings. Refunds are available within 30 days of purchase. No refunds will be provided for partial months or unused portions of a subscription.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">16. No Warranty</h2>
            <p className="mt-4 text-slate-300">
              THE SERVICE IS PROVIDED "AS IS" AND WITHOUT WARRANTY OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING ANY WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">17. Limitation of Liability</h2>
            <p className="mt-4 text-slate-300">
              TO THE FULLEST EXTENT PERMITTED BY LAW, IN NO EVENT SHALL THESISAI BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">18. Contact Information</h2>
            <p className="mt-4 text-slate-300">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="mt-4 space-y-2 text-slate-300">
              <p>
                <span className="font-semibold text-white">Email:</span> legal@thesisai.com
              </p>
              <p>
                <span className="font-semibold text-white">Mailing Address:</span>
                <br />
                ThesisAI<br />
                San Francisco, CA 94105<br />
                United States
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">19. Academic Integrity</h2>
            <p className="mt-4 text-slate-300">
              ThesisAI is designed to assist and enhance your academic work. However, you are responsible for ensuring that your use of our Services complies with your institution's academic integrity policies. We do not condone plagiarism or academic dishonesty.
            </p>
            <p className="mt-4 text-slate-300">
              Always provide proper attribution and citation for content suggestions and improvements made with our tools. Consult with your instructors about appropriate use of AI tools in your coursework.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">20. Entire Agreement</h2>
            <p className="mt-4 text-slate-300">
              These Terms of Service, together with our Privacy Policy and any other agreements we may have with you, constitute the entire agreement between you and ThesisAI regarding the use of our Services.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-16 border-t border-slate-700 pt-8">
          <p className="text-center text-sm text-slate-400">
            Last updated: November 25, 2025
          </p>
          <div className="mt-6 flex justify-center gap-6">
            <Link href="/privacy-policy" className="text-blue-400 hover:text-blue-300">
              Privacy Policy
            </Link>
            <Link href="/contact" className="text-blue-400 hover:text-blue-300">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
