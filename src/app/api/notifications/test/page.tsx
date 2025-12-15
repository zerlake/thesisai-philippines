'use client';

import { EmailNotificationDemo } from '@/components/email-notification-demo';

export default function EmailNotificationTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Email Notifications Testing</h1>
          <p className="text-slate-400">
            Test the email notification system by sending test emails to advisors.
          </p>
        </div>

        {/* Demo Component */}
        <div className="mb-8">
          <EmailNotificationDemo />
        </div>

        {/* Documentation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* Setup Guide */}
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">📚 Setup Guide</h2>
            <ol className="space-y-3 text-sm text-slate-700">
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 min-w-6">1.</span>
                <span>Get your Resend API key from <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">resend.com</a></span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 min-w-6">2.</span>
                <span>Add <code className="bg-slate-100 px-2 py-1 rounded text-xs">RESEND_API_KEY</code> to your <code className="bg-slate-100 px-2 py-1 rounded text-xs">.env.local</code></span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 min-w-6">3.</span>
                <span>Set <code className="bg-slate-100 px-2 py-1 rounded text-xs">INTERNAL_API_KEY</code> for security</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-blue-600 min-w-6">4.</span>
                <span>Test with <code className="bg-slate-100 px-2 py-1 rounded text-xs">delivered@resend.dev</code></span>
              </li>
            </ol>
          </div>

          {/* Features */}
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">✨ Features</h2>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex gap-2">
                <span className="text-blue-600">✓</span>
                <span>Beautiful responsive email templates</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">✓</span>
                <span>4 notification types (submission, revision, request, milestone)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">✓</span>
                <span>Easy-to-use React hooks</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">✓</span>
                <span>Type-safe API routes</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600">✓</span>
                <span>Security with API key validation</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Code Examples */}
        <div className="mt-8 bg-white rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">💻 Code Examples</h2>

          <div className="space-y-6">
            {/* Example 1 */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">1. Using the Hook (Client-Side)</h3>
              <pre className="bg-slate-100 p-4 rounded-lg overflow-x-auto text-xs text-slate-900">
{`import { useNotificationEmail } from '@/hooks/useNotificationEmail';

function MyComponent() {
  const { sendEmail, isLoading } = useNotificationEmail();

  const handleClick = async () => {
    await sendEmail({
      to: 'advisor@example.com',
      advisorName: 'Dr. Garcia',
      studentName: 'Maria Santos',
      actionType: 'submission',
      documentTitle: 'Chapter 1',
      message: 'New submission ready for review',
    });
  };

  return <button onClick={handleClick}>{isLoading ? 'Sending...' : 'Send'}</button>;
}`}
              </pre>
            </div>

            {/* Example 2 */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">2. Using Helper Functions (Server-Side)</h3>
              <pre className="bg-slate-100 p-4 rounded-lg overflow-x-auto text-xs text-slate-900">
{`import { notifyAdvisorOfSubmission } from '@/lib/resend-notification';

// In your API route or server action
await notifyAdvisorOfSubmission(
  'advisor@example.com',
  'Dr. Garcia',
  'Maria Santos',
  'Chapter 1 - Introduction',
  'document-id-123'
);`}
              </pre>
            </div>

            {/* Example 3 */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">3. Generic Email Function</h3>
              <pre className="bg-slate-100 p-4 rounded-lg overflow-x-auto text-xs text-slate-900">
{`import { sendNotificationEmail } from '@/lib/resend-notification';

await sendNotificationEmail({
  to: 'advisor@example.com',
  advisorName: 'Dr. Garcia',
  studentName: 'Maria Santos',
  actionType: 'milestone',
  documentTitle: 'Thesis Outline Completed',
  message: '🎉 Maria has completed the thesis outline!',
  actionUrl: 'https://thesisai-philippines.vercel.app/advisor',
  actionButtonText: 'View Dashboard',
});`}
              </pre>
            </div>
          </div>
        </div>

        {/* Files Created */}
        <div className="mt-8 bg-white rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">📁 Files Created</h2>
          <div className="space-y-2 text-sm text-slate-700">
            <p className="font-semibold">Email Templates:</p>
            <p className="ml-4">• <code className="bg-slate-100 px-2 py-1 rounded">src/emails/advisor-notification.tsx</code></p>

            <p className="font-semibold mt-3">Utilities:</p>
            <p className="ml-4">• <code className="bg-slate-100 px-2 py-1 rounded">src/lib/resend-notification.ts</code></p>

            <p className="font-semibold mt-3">API Routes:</p>
            <p className="ml-4">• <code className="bg-slate-100 px-2 py-1 rounded">src/app/api/notifications/send-email/route.ts</code></p>

            <p className="font-semibold mt-3">React Hooks:</p>
            <p className="ml-4">• <code className="bg-slate-100 px-2 py-1 rounded">src/hooks/useNotificationEmail.ts</code></p>

            <p className="font-semibold mt-3">Components:</p>
            <p className="ml-4">• <code className="bg-slate-100 px-2 py-1 rounded">src/components/email-notification-demo.tsx</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}
