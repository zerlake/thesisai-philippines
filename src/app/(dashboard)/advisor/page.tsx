'use client';

import { useAuth } from '@/components/auth-provider';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { BrandedLoader } from '@/components/branded-loader';
import { Users, MessageSquare, FileText, ArrowRight } from 'lucide-react';

export default function AdvisorPage() {
  const authContext = useAuth();
  
  if (!authContext) {
    return <BrandedLoader />;
  }

  const { session, profile, isLoading } = authContext;

  // Redirect if not authenticated or not an advisor
  if (!isLoading && (!session || profile?.role !== 'advisor')) {
    redirect('/login');
  }

  if (isLoading) {
    return <BrandedLoader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Advisor Dashboard
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Welcome, {profile?.first_name || profile?.full_name || 'Advisor'}!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* My Students Card */}
          <Link href="/advisor/students" className="group">
            <div className="h-full bg-white dark:bg-slate-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">My Students</h2>
              <p className="text-gray-600 dark:text-gray-400">View and manage your assigned students</p>
            </div>
          </Link>

          {/* Document Review Card */}
          <Link href="/advisor/competency" className="group">
            <div className="h-full bg-white dark:bg-slate-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-600 cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <FileText className="w-8 h-8 text-green-600 dark:text-green-400" />
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Review & Feedback</h2>
              <p className="text-gray-600 dark:text-gray-400">Provide feedback and guidance on student work</p>
            </div>
          </Link>

          {/* Messages Card */}
          <Link href="/advisor/chat" className="group">
            <div className="h-full bg-white dark:bg-slate-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6 border border-gray-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600 cursor-pointer">
              <div className="flex items-start justify-between mb-4">
                <MessageSquare className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Messages</h2>
              <p className="text-gray-600 dark:text-gray-400">Communicate directly with your students</p>
            </div>
          </Link>
        </div>

        <div className="mt-12 bg-white dark:bg-slate-800 rounded-lg shadow p-8 border border-gray-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Getting Started</h2>
          
          <div className="space-y-4 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Quick Tips</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                <li>View all your assigned students in the <strong>My Students</strong> section</li>
                <li>Provide structured feedback through the <strong>Review & Feedback</strong> tool</li>
                <li>Chat with students in real-time using the <strong>Messages</strong> feature</li>
                <li>Track student progress and competency development</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Your Role</h3>
              <p className="text-gray-600 dark:text-gray-400">
                As an advisor, you can guide students through their thesis journey, provide feedback on their work, and maintain direct communication to ensure their academic success.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Role: <span className="font-semibold text-gray-700 dark:text-gray-300">Advisor</span>
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-600 mt-2">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
