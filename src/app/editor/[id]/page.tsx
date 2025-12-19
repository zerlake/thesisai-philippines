'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, MailOpen } from 'lucide-react';
import Link from 'next/link';
import { ThesisEditor } from '@/components/thesis-editor';
import { EditorEmailNotificationsSidebar } from '@/components/editor-email-notifications-sidebar';
import { EmailNotificationIntro } from '@/components/email-notification-intro';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DocumentMetadata {
  id: string;
  title: string;
  thesis_phase?: string;
}

export default function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const documentId = resolvedParams.id;
  const [metadata, setMetadata] = useState<DocumentMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEmailNotifications, setShowEmailNotifications] = useState(false);

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('id, title, thesis_phase')
          .eq('id', documentId)
          .single();

        if (error || !data) {
          toast.error('Document not found');
          router.push('/');
          return;
        }

        setMetadata(data);
      } catch (error) {
        console.error('Error loading document metadata:', error);
        toast.error('Failed to load document');
      } finally {
        setIsLoading(false);
      }
    };

    if (documentId) {
      loadMetadata();
    }
  }, [documentId, supabase, router]);

  // Check for new messages when component mounts and every 10 seconds after
  useEffect(() => {
    const checkForNewMessages = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user?.id) return;

        const { data, error } = await supabase
          .from('advisor_student_messages')
          .select('id, is_read')
          .eq('recipient_id', session.user.id)
          .eq('is_read', false)
          .order('created_at', { ascending: false })
          .limit(1);

        if (!error && data && data.length > 0) {
          // Show notifications panel if there are unread messages
          setShowEmailNotifications(true);
        }
      } catch (error) {
        console.error('Error checking for new messages:', error);
      }
    };

    // Check immediately
    checkForNewMessages();

    // Then check every minute
    const interval = setInterval(checkForNewMessages, 60000);
    return () => clearInterval(interval);
  }, []);

  const getPhaseFromThesisPhase = (thesisPhase?: string): 'conceptualize' | 'research' | 'write' | 'submit' => {
    const phaseMap: Record<string, 'conceptualize' | 'research' | 'write' | 'submit'> = {
      'chapter-1': 'research',
      'chapter-2': 'write',
      'chapter-3': 'write',
      'chapter-4': 'write',
      'chapter-5': 'submit',
    };
    return phaseMap[thesisPhase || ''] || 'write';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading document...</p>
      </div>
    );
  }

  if (!metadata) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-gray-500">Document not found</p>
        <Link href="/" className="text-primary hover:text-primary/80">
          Return to home
        </Link>
      </div>
    );
  }

  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    // Show the intro once after initial load
    const timer = setTimeout(() => {
      setShowIntro(true);
    }, 2000); // Show after 2 seconds to give user time to see the editor

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/thesis-phases"
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
            <h1 className="text-xl font-bold text-foreground flex-1 text-center">{metadata.title || 'Untitled Document'}</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEmailNotifications(!showEmailNotifications)}
                className={`p-2 rounded-md transition-colors ${
                  showEmailNotifications
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
                title={showEmailNotifications ? "Hide messages" : "Show messages"}
              >
                {showEmailNotifications ? <MailOpen className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Editor with optional email notifications sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showIntro && (
          <div className="mb-6">
            <EmailNotificationIntro
              onDismiss={() => setShowIntro(false)}
              documentId={documentId}
            />
          </div>
        )}

        <div className="flex gap-8">
          {/* Main Editor Area */}
          <div className={`${showEmailNotifications ? 'lg:w-3/4' : 'w-full'}`}>
            <div className="bg-card rounded-lg border border-border shadow-lg overflow-hidden">
              <ThesisEditor
                documentId={documentId}
                title={metadata.title}
                phase={getPhaseFromThesisPhase(metadata.thesis_phase)}
                onTitleChange={(newTitle) => {
                  setMetadata((prev) => (prev ? { ...prev, title: newTitle } : null));
                }}
              />
            </div>
          </div>

          {/* Email Notifications Sidebar - Visible when toggled */}
          {showEmailNotifications && (
            <div className="lg:w-1/4 flex-shrink-0">
              <div className="bg-card rounded-lg border border-border shadow-lg overflow-hidden h-[calc(100vh-200px)] sticky top-24">
                <EditorEmailNotificationsSidebar documentId={documentId} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
