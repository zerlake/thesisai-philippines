'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AccountSetupDoc() {
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
          <h1 className="text-4xl font-bold text-white">Account Setup & Profile Configuration</h1>
          <p className="mt-4 text-lg text-slate-300">
            Setting up your account for optimal ThesisAI experience
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="prose prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Creating Your Account</h2>
            <p className="text-slate-300 mb-4">
              Creating your ThesisAI account is the first step toward enhanced academic productivity. 
              Our platform offers both free and premium plans to accommodate different research needs.
            </p>
            <ol className="list-decimal pl-6 space-y-2 text-slate-300">
              <li>Navigate to the ThesisAI Philippines website</li>
              <li>Click on &quot;Get Started&quot; or &quot;Register&quot; button</li>
              <li>Provide your email address and create a secure password</li>
              <li>Verify your email address through the confirmation link sent to your inbox</li>
              <li>Complete your initial profile setup with your academic information</li>
            </ol>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Profile Configuration</h2>
            <h3 className="text-xl font-semibold text-blue-400 mb-2">Personal Information</h3>
            <p className="text-slate-300 mb-4">
              To tailor your experience to your academic needs, provide accurate information in your profile:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2 text-slate-300">
              <li><strong>Full Name:</strong> Enter your legal name as it appears on academic documents</li>
              <li><strong>University:</strong> Select your institution from our database of Philippine universities</li>
              <li><strong>College/Department:</strong> Specify your college or department for custom recommendations</li>
              <li><strong>Program/Degree:</strong> Indicate your current program or degree for relevant tools</li>
              <li><strong>Year Level:</strong> Let us know your academic standing</li>
              <li><strong>Academic Advisor:</strong> Optionally add your advisor for collaboration features</li>
            </ul>

            <h3 className="text-xl font-semibold text-blue-400 mb-2">Academic Preferences</h3>
            <p className="text-slate-300 mb-4">
              Configure your academic preferences to receive personalized recommendations and tools:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2 text-slate-300">
              <li><strong>Primary Field:</strong> Select your primary academic field (Engineering, Liberal Arts, etc.)</li>
              <li><strong>Secondary Field:</strong> Add any secondary fields of interest</li>
              <li><strong>Thesis Topic:</strong> Briefly describe your thesis topic or research interests</li>
              <li><strong>Document Type:</strong> Specify if you're working on a thesis, dissertation, research paper, etc.</li>
              <li><strong>Preferred Format:</strong> Choose your university's preferred citation and formatting style</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Customizing Your Dashboard</h2>
            <h3 className="text-xl font-semibold text-cyan-400 mb-2">Workspace Preferences</h3>
            <p className="text-slate-300 mb-4">
              Customize your ThesisAI workspace to match your workflow preferences:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2 text-slate-300">
              <li><strong>Interface Language:</strong> Toggle between English and Filipino interface options</li>
              <li><strong>Editor Theme:</strong> Choose between light, dark, or automatic theme modes</li>
              <li><strong>Notification Settings:</strong> Configure email and in-app notifications</li>
              <li><strong>Auto-Save Frequency:</strong> Adjust how often your work is automatically saved</li>
              <li><strong>Backup Options:</strong> Enable cloud backup and synchronization</li>
            </ul>

            <h3 className="text-xl font-semibold text-cyan-400 mb-2">Collaboration Settings</h3>
            <p className="text-slate-300 mb-4">
              Manage how you collaborate with advisors and peers:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2 text-slate-300">
              <li><strong>Sharing Permissions:</strong> Control who can view or edit your documents</li>
              <li><strong>Review Notifications:</strong> Choose how you're notified of feedback</li>
              <li><strong>Collaborator Requests:</strong> Configure how you receive collaboration invitations</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Connecting Your Email</h2>
            <p className="text-slate-300 mb-4">
              For optimal collaboration and notifications, connect the email provided during registration:
            </p>
            <ol className="list-decimal pl-6 space-y-2 text-slate-300">
              <li>Go to your profile settings (click your avatar in the top-right corner)</li>
              <li>Select &quot;Account Settings&quot; from the dropdown menu</li>
              <li>Click on &quot;Email Settings&quot;</li>
              <li>Verify that your primary email is correctly listed</li>
              <li>Enable email notifications for collaboration and updates</li>
            </ol>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Security & Privacy Settings</h2>
            <h3 className="text-xl font-semibold text-purple-400 mb-2">Password Security</h3>
            <p className="text-slate-300 mb-4">
              Maintain strong security for your academic work:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2 text-slate-300">
              <li>Use a strong, unique password (at least 12 characters with numbers, symbols, and capital letters)</li>
              <li>Enable two-factor authentication for additional security</li>
              <li>Regularly update your password (recommended every 3-6 months)</li>
              <li>Never share your login credentials with others</li>
            </ul>

            <h3 className="text-xl font-semibold text-purple-400 mb-2">Privacy Controls</h3>
            <p className="text-slate-300 mb-4">
              Configure how your data and documents are used:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2 text-slate-300">
              <li>Data sharing preferences for improving AI features</li>
              <li>Visibility settings for collaborative workspaces</li>
              <li>Document retention policies</li>
              <li>Export and deletion options for your academic content</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">Troubleshooting Common Issues</h2>
            <h3 className="text-xl font-semibold text-red-400 mb-2">Account Verification Problems</h3>
            <p className="text-slate-300 mb-4">
              If you didn't receive your verification email:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2 text-slate-300">
              <li>Check your spam/junk folder</li>
              <li>Wait a few minutes (sometimes delivery takes time)</li>
              <li>Resend the verification email from the login page</li>
              <li>Contact support if the issue persists</li>
            </ul>
          </section>
        </div>

        <div className="flex justify-between mt-12">
          <div>
            <Link href="/documentation/introduction" className="text-blue-400 hover:underline">
              ← Introduction
            </Link>
          </div>
          <div>
            <Link href="/documentation/first-steps" className="text-blue-400 hover:underline">
              First Steps →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}