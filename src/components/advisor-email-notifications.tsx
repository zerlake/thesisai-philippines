'use client';

import { useEffect, useState } from 'react';
import { useAuth } from './auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Mail, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Badge } from './ui/badge';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { toast } from 'sonner';

interface StudentSubmission {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  document_id: string;
  document_title: string;
  submission_status: 'submitted' | 'reviewed' | 'needs_revision' | 'approved';
  submitted_at: string;
  advisor_reviewed_at: string | null;
  review_notes: string | null;
}

interface Message {
  id: string;
  sender_id: string;
  sender_role: 'student' | 'advisor' | 'critic';
  sender_name: string;
  message: string;
  created_at: string;
}

export function AdvisorEmailNotifications() {
  const { session, supabase } = useAuth();
  const user = session?.user;
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<StudentSubmission | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debug: Log component mount
  useEffect(() => {
    console.log('[AdvisorEmailNotifications] Component mounted', { userId: user?.id, hasSupabase: !!supabase });
  }, [user?.id, supabase]);

  // Load messages for selected submission
  useEffect(() => {
    if (!selectedSubmission || !supabase) return;

    const loadMessages = async () => {
      setLoadingMessages(true);
      try {
        const { data: msgs, error } = await supabase
          .from('advisor_student_messages')
          .select('id, sender_id, sender_role, message, created_at')
          .eq('document_id', selectedSubmission.document_id)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error loading messages:', error);
          return;
        }

        // Get sender names for each message
        const messagesWithNames = await Promise.all(
          (msgs || []).map(async (msg) => {
            const { data: sender } = await supabase
              .from('profiles')
              .select('full_name, name')
              .eq('id', msg.sender_id)
              .single();

            return {
              ...msg,
              sender_name: sender?.full_name || sender?.name || 'Unknown',
            };
          })
        );

        setMessages(messagesWithNames);
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();
  }, [selectedSubmission, supabase]);

  // Fetch submissions for advisor
  useEffect(() => {
    if (!user?.id) return;

    const fetchSubmissions = async () => {
      try {
        setIsLoading(true);
        
        // Get advisor's students
        const { data: relationships, error: relError } = await supabase
          .from('advisor_student_relationships')
          .select('student_id')
          .eq('advisor_id', user.id);

        if (relError) {
          console.error('Error fetching relationships:', relError);
          return;
        }

        if (!relationships || relationships.length === 0) {
          setSubmissions([]);
          setIsLoading(false);
          return;
        }

        const studentIds = relationships.map(r => r.student_id);

        // Get submitted documents from those students
        const { data: docs, error: docsError } = await supabase
          .from('documents')
          .select(`
            id,
            title,
            user_id,
            review_status,
            created_at,
            updated_at
          `)
          .in('user_id', studentIds)
          .eq('review_status', 'submitted')
          .order('updated_at', { ascending: false });

        if (docsError) {
          console.error('Error fetching documents:', docsError);
          return;
        }

        // Get student details for each document
        const submissionsWithDetails = await Promise.all(
          (docs || []).map(async (doc) => {
            const { data: student } = await supabase
              .from('profiles')
              .select('full_name, name, email')
              .eq('id', doc.user_id)
              .single();

            return {
              id: doc.id,
              student_id: doc.user_id,
              student_name: student?.full_name || student?.name || 'Unknown',
              student_email: student?.email || '',
              document_id: doc.id,
              document_title: doc.title || 'Untitled',
              submission_status: 'submitted' as const,
              submitted_at: doc.updated_at || doc.created_at,
              advisor_reviewed_at: null,
              review_notes: null,
            };
          })
        );

        setSubmissions(submissionsWithDetails);
      } catch (error) {
        console.error('Error fetching submissions:', error);
        const errorMsg = error instanceof Error ? error.message : 'Failed to load submissions';
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch immediately and then poll every 5 seconds
    fetchSubmissions();
    const interval = setInterval(fetchSubmissions, 5000);
    return () => clearInterval(interval);
  }, [user?.id, supabase]);

  const handleReviewSubmission = async () => {
    if (!selectedSubmission || !user?.id) return;

    setIsSubmittingReview(true);
    try {
      // Update document status based on whether feedback was provided
      const newStatus = reviewText.trim() ? 'needs_revision' : 'approved';
      
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          review_status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedSubmission.document_id);

      if (updateError) throw updateError;

      // Save review feedback as a message from advisor to student
      if (reviewText.trim()) {
        const { error: messageError } = await supabase
          .from('advisor_student_messages')
          .insert([
            {
              document_id: selectedSubmission.document_id,
              sender_id: user.id,
              sender_role: 'advisor',
              recipient_id: selectedSubmission.student_id,
              message: reviewText,
              subject: `Feedback on ${selectedSubmission.document_title}`,
              is_read: false,
            },
          ]);

        if (messageError) {
          console.error('Error saving review feedback:', messageError);
        }
      }

      toast.success(`Document marked as ${newStatus === 'approved' ? 'approved' : 'needs revision'}!`);
      setReviewText('');
      
      // Refresh submissions
      setSubmissions(submissions.filter(s => s.id !== selectedSubmission.id));
      setSelectedSubmission(null);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Mail className="w-5 h-5 text-blue-600" />;
      case 'reviewed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'needs_revision':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <Badge className="bg-blue-100 text-blue-800">New Submission</Badge>;
      case 'reviewed':
        return <Badge className="bg-green-100 text-green-800">Reviewed</Badge>;
      case 'needs_revision':
        return <Badge className="bg-amber-100 text-amber-800">Needs Revision</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
        <CardHeader>
          <CardTitle className="text-red-900 dark:text-red-100">Error Loading Notifications</CardTitle>
          <CardDescription className="text-red-800 dark:text-red-200">{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => { setError(null); setIsLoading(true); }}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>Manage student submissions and feedback</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-96">
            <p className="text-muted-foreground">Loading submissions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Email Notifications
        </CardTitle>
        <CardDescription>
          {submissions.length > 0
            ? `You have ${submissions.length} new student submission${submissions.length !== 1 ? 's' : ''}`
            : 'No pending submissions'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Submissions List */}
          <div className="space-y-3">
            {submissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Mail className="w-12 h-12 text-gray-300 mb-3" />
                <p className="text-gray-600 font-medium">No pending submissions</p>
                <p className="text-sm text-gray-500">
                  Your students will submit documents for review here
                </p>
              </div>
            ) : (
              submissions.map((submission) => (
                <button
                  key={submission.id}
                  onClick={() => setSelectedSubmission(submission)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedSubmission?.id === submission.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getStatusIcon(submission.submission_status)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm truncate">
                          {submission.student_name}
                        </p>
                        {getStatusBadge(submission.submission_status)}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {submission.document_title}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatDistanceToNow(new Date(submission.submitted_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Detail View & Review Panel */}
          {selectedSubmission ? (
            <div className="flex flex-col gap-4 h-full">
              {/* Submission Details */}
              <div className="space-y-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                    Student
                  </p>
                  <p className="text-sm font-medium">{selectedSubmission.student_name}</p>
                  <p className="text-xs text-gray-500">{selectedSubmission.student_email}</p>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                    Document
                  </p>
                  <p className="text-sm font-medium">{selectedSubmission.document_title}</p>
                  <Link href={`/advisor/students/${selectedSubmission.student_id}`}>
                    <Button variant="outline" size="sm" className="mt-2 w-full">
                      View Full Document
                    </Button>
                  </Link>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                    Submitted
                  </p>
                  <p className="text-sm">
                    {new Date(selectedSubmission.submitted_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Messages Conversation */}
              <div className="flex-1 flex flex-col min-h-0 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-t-lg">
                  <p className="text-sm font-semibold">Conversation</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {loadingMessages ? (
                    <p className="text-sm text-gray-500 text-center py-4">Loading messages...</p>
                  ) : messages.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No messages yet</p>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-2 ${msg.sender_role === 'advisor' ? 'justify-end' : ''}`}
                      >
                        <div
                          className={`max-w-xs p-3 rounded-lg text-sm ${
                            msg.sender_role === 'advisor'
                              ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100'
                              : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          <p className="font-semibold text-xs mb-1">{msg.sender_name}</p>
                          <p className="break-words">{msg.message}</p>
                          <span className="text-xs opacity-70 mt-2 block">
                            {new Date(msg.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Review/Feedback Panel */}
              <div className="space-y-3 p-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  Send Feedback
                </p>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Add your feedback message here..."
                  className="w-full p-3 border border-blue-300 dark:border-blue-700 rounded-md text-sm resize-none bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  disabled={isSubmittingReview}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleReviewSubmission}
                    disabled={isSubmittingReview}
                    className="flex-1"
                  >
                    {isSubmittingReview ? 'Sending...' : 'Send Feedback'}
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedSubmission(null);
                      setReviewText('');
                    }}
                    variant="outline"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
              <div className="text-center">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  Select a submission
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  to provide your feedback
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
