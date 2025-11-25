'use client';

import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white">Privacy Policy</h1>
          <p className="mt-4 text-slate-400">
            Last updated: November 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white">1. Introduction</h2>
            <p className="mt-4 text-slate-300">
              ThesisAI ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
            <p className="mt-4 text-slate-300">
              Please read this Privacy Policy carefully. If you do not agree with our policies and practices, please do not use our Services. By using our Services, you consent to our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">2. Information We Collect</h2>
            <h3 className="mt-4 text-lg font-semibold text-white">2.1 Information You Provide</h3>
            <p className="mt-2 text-slate-300">
              We collect information you directly provide, including:
            </p>
            <ul className="mt-3 list-inside list-disc space-y-2 text-slate-300">
              <li>Account registration information (name, email, password)</li>
              <li>Academic essays and writing submissions</li>
              <li>Research topics and related information</li>
              <li>Communication with our support team</li>
              <li>Payment and billing information</li>
              <li>Profile preferences and settings</li>
            </ul>

            <h3 className="mt-6 text-lg font-semibold text-white">2.2 Automatically Collected Information</h3>
            <p className="mt-2 text-slate-300">
              We automatically collect certain information when you use our Services:
            </p>
            <ul className="mt-3 list-inside list-disc space-y-2 text-slate-300">
              <li>Log data (IP address, browser type, pages visited)</li>
              <li>Device information (device type, operating system)</li>
              <li>Usage information (features used, interaction patterns)</li>
              <li>Cookies and similar tracking technologies</li>
              <li>Location information (if permitted)</li>
            </ul>

            <h3 className="mt-6 text-lg font-semibold text-white">2.3 Information from Third Parties</h3>
            <p className="mt-2 text-slate-300">
              We may receive information about you from third-party services, including payment processors and analytics providers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">3. How We Use Your Information</h2>
            <p className="mt-4 text-slate-300">
              We use the information we collect for various purposes:
            </p>
            <ul className="mt-3 list-inside list-disc space-y-2 text-slate-300">
              <li>Providing and improving our Services</li>
              <li>Processing transactions and sending related information</li>
              <li>Sending promotional communications (with your consent)</li>
              <li>Responding to your inquiries and support requests</li>
              <li>Analyzing usage patterns and improving user experience</li>
              <li>Detecting and preventing fraudulent activities</li>
              <li>Complying with legal obligations</li>
              <li>Personalizing your experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">4. How We Share Your Information</h2>
            <p className="mt-4 text-slate-300">
              We do not sell, trade, or rent your personal information to third parties. We may share information in the following circumstances:
            </p>
            <ul className="mt-3 list-inside list-disc space-y-2 text-slate-300">
              <li>With service providers who assist in our operations</li>
              <li>For legal reasons or law enforcement requests</li>
              <li>To protect our rights and prevent misuse</li>
              <li>With your explicit consent</li>
              <li>In case of business transfer or merger</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">5. Data Security</h2>
            <p className="mt-4 text-slate-300">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.
            </p>
            <p className="mt-4 text-slate-300">
              Your passwords are encrypted, and we use SSL/TLS encryption for data transmission. We encourage you to maintain the confidentiality of your password and account information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">6. Your Rights and Choices</h2>
            <p className="mt-4 text-slate-300">
              Depending on your location, you may have rights regarding your personal information:
            </p>
            <ul className="mt-3 list-inside list-disc space-y-2 text-slate-300">
              <li>Right to access your personal information</li>
              <li>Right to correct inaccurate data</li>
              <li>Right to delete your information</li>
              <li>Right to opt-out of marketing communications</li>
              <li>Right to data portability</li>
              <li>Right to restrict processing</li>
              <li>Right to withdraw consent</li>
            </ul>
            <p className="mt-4 text-slate-300">
              To exercise these rights, please contact us at privacy@thesisai.com.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">7. Cookies and Tracking</h2>
            <p className="mt-4 text-slate-300">
              We use cookies and similar tracking technologies to enhance your experience. These may include:
            </p>
            <ul className="mt-3 list-inside list-disc space-y-2 text-slate-300">
              <li>Essential cookies (necessary for site functionality)</li>
              <li>Analytical cookies (to understand usage patterns)</li>
              <li>Marketing cookies (to deliver personalized content)</li>
              <li>Preference cookies (to remember your settings)</li>
            </ul>
            <p className="mt-4 text-slate-300">
              You can control cookie preferences through your browser settings. However, some features may not function properly if cookies are disabled.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">8. Children's Privacy</h2>
            <p className="mt-4 text-slate-300">
              Our Services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware of such collection, we will delete the information and terminate the child's account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">9. International Data Transfers</h2>
            <p className="mt-4 text-slate-300">
              Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. By using our Services, you consent to such transfers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">10. Data Retention</h2>
            <p className="mt-4 text-slate-300">
              We retain personal information for as long as necessary to provide our Services and fulfill the purposes outlined in this Privacy Policy. You can request deletion of your data anytime, subject to legal obligations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">11. Third-Party Links</h2>
            <p className="mt-4 text-slate-300">
              Our Services may contain links to third-party websites. We are not responsible for their privacy practices. Please review their privacy policies before providing personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">12. Changes to This Policy</h2>
            <p className="mt-4 text-slate-300">
              We may update this Privacy Policy periodically. We will notify you of significant changes by posting the new policy on our website and updating the "Last updated" date. Your continued use of our Services constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white">13. Contact Us</h2>
            <p className="mt-4 text-slate-300">
              If you have questions about this Privacy Policy or our privacy practices, please contact us:
            </p>
            <div className="mt-4 space-y-2 text-slate-300">
              <p>
                <span className="font-semibold text-white">Email:</span> privacy@thesisai.com
              </p>
              <p>
                <span className="font-semibold text-white">Mailing Address:</span>
                <br />
                ThesisAI<br />
                San Francisco, CA 94105<br />
                United States
              </p>
              <p>
                <span className="font-semibold text-white">Data Protection Officer:</span> dpo@thesisai.com
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-16 border-t border-slate-700 pt-8">
          <p className="text-center text-sm text-slate-400">
            Last updated: November 25, 2025
          </p>
          <div className="mt-6 flex justify-center gap-6">
            <Link href="/terms-of-service" className="text-blue-400 hover:text-blue-300">
              Terms of Service
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
