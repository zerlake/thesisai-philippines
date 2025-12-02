'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { SAMPLE_PRACTICE_QUESTIONS } from '@/lib/validity-defender-sample-data';

interface PracticeModeProps {
  thesisId: string;
  instrumentIds: string[];
}

interface PracticeQuestion {
  id: string;
  questionText: string;
  questionType: string;
  expectedPoints: string[];
}

interface PracticeSession {
  sessionId: string;
  questions: PracticeQuestion[];
  totalQuestions: number;
}

export default function PracticeMode({ thesisId, instrumentIds }: PracticeModeProps) {
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userResponse, setUserResponse] = useState('');
  const [sessionStarted, setSessionStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    score: number;
    feedback: string;
    wellCoveredPoints: string[];
    missingPoints: string[];
  } | null>(null);

  useEffect(() => {
    const handleLoadSampleData = () => {
      // Pre-load sample practice session when sample data is loaded
      if (instrumentIds.length > 0) {
        const sampleSession: PracticeSession = {
          sessionId: 'sample-session-001',
          questions: SAMPLE_PRACTICE_QUESTIONS,
          totalQuestions: SAMPLE_PRACTICE_QUESTIONS.length,
        };
        setSession(sampleSession);
      }
    };

    window.addEventListener('loadSampleData', handleLoadSampleData);
    return () => window.removeEventListener('loadSampleData', handleLoadSampleData);
  }, [instrumentIds]);

  const handleStartSession = async () => {
    if (instrumentIds.length === 0) {
      alert('Please validate at least one instrument first');
      return;
    }

    // If session is already loaded (from sample data), just start it
    if (session) {
      setSessionStarted(true);
      setCurrentQuestionIndex(0);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/instruments/practice-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thesisId,
          instrumentIds,
        }),
      });

      const data = (await response.json()) as PracticeSession;

      if (!response.ok) {
        alert('Failed to start practice session');
        return;
      }

      setSession(data);
      setSessionStarted(true);
      setCurrentQuestionIndex(0);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitResponse = async () => {
    if (!userResponse.trim()) {
      alert('Please provide a response');
      return;
    }

    // Simulate AI scoring
    const score = Math.round(Math.random() * 30 + 70); // 70-100
    const currentQuestion = session?.questions[currentQuestionIndex];
    const wellCovered = currentQuestion?.expectedPoints.slice(0, 2) || [];
    const missing = currentQuestion?.expectedPoints.slice(2) || [];

    setFeedback({
      score,
      feedback:
        score >= 85
          ? 'Excellent response! You covered the key points comprehensively.'
          : score >= 70
            ? 'Good response. Consider adding more specific evidence and citations.'
            : 'You have the right ideas, but need to strengthen with more detail.',
      wellCoveredPoints: wellCovered,
      missingPoints: missing,
    });
  };

  const handleNextQuestion = () => {
    if (session && currentQuestionIndex < session.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserResponse('');
      setFeedback(null);
    }
  };

  const handleEndSession = () => {
    setSession(null);
    setSessionStarted(false);
    setCurrentQuestionIndex(0);
    setUserResponse('');
    setFeedback(null);
  };

  if (!sessionStarted) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Start Practice Session</CardTitle>
            <CardDescription>
              Simulate a thesis defense by answering randomized questions about your instruments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600">
              You'll be asked {instrumentIds.length > 0 ? '5-10' : '0'} questions covering content validity, construct
              validity, reliability, and methodology.
            </p>
            <Button
               onClick={handleStartSession}
               disabled={isLoading || instrumentIds.length === 0}
               className="w-full"
               size="lg"
               variant="default"
             >
               {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
               {isLoading ? 'Starting...' : 'Start Practice Session'}
             </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session) return null;

  const currentQuestion = session.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / session.totalQuestions) * 100;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-semibold">
            Question {currentQuestionIndex + 1} of {session.totalQuestions}
          </span>
          <span className="text-muted-foreground text-xs font-medium">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Badge variant="secondary" className="mb-2">
                {currentQuestion.questionType}
              </Badge>
              <CardTitle className="text-lg">{currentQuestion.questionText}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Response Input */}
          {!feedback ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Response</label>
                <Textarea
                  placeholder="Type your response here. Aim for 2-3 minutes of speaking time..."
                  value={userResponse}
                  onChange={(e) => setUserResponse(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </div>
              <Button onClick={handleSubmitResponse} className="w-full" disabled={!userResponse.trim()}>
                Submit Response
              </Button>
            </>
          ) : (
            <>
              {/* Feedback */}
              <div className="space-y-4">
                {/* Score Display */}
                <div className="rounded-lg bg-gradient-to-r from-green-50 to-blue-50 p-6 text-center border border-green-200">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Your Score</p>
                  <p className="text-5xl font-bold text-green-600">{feedback.score}</p>
                  <p className="text-xs text-muted-foreground mt-2">/100</p>
                </div>

                {/* Feedback Text */}
                <Alert className="rounded-lg border-blue-200 bg-blue-50">
                  <AlertDescription className="text-sm text-blue-900">{feedback.feedback}</AlertDescription>
                </Alert>

                {/* Well Covered Points */}
                {feedback.wellCoveredPoints.length > 0 && (
                  <div className="space-y-2 rounded-lg border border-green-200 bg-green-50 p-4">
                    <h4 className="font-semibold text-sm text-green-900">Well Covered Points</h4>
                    <ul className="space-y-1">
                      {feedback.wellCoveredPoints.map((point, idx) => (
                        <li key={idx} className="flex gap-2 text-sm text-green-800">
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Missing Points */}
                {feedback.missingPoints.length > 0 && (
                  <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <h4 className="font-semibold text-sm text-amber-900">Areas for Improvement</h4>
                    <ul className="space-y-1">
                      {feedback.missingPoints.map((point, idx) => (
                        <li key={idx} className="flex gap-2 text-sm text-amber-800">
                          <XCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex gap-2 pt-4">
                  {currentQuestionIndex < session.questions.length - 1 ? (
                    <Button onClick={handleNextQuestion} className="flex-1">
                      Next Question
                    </Button>
                  ) : (
                    <Button onClick={handleEndSession} variant="outline" className="flex-1">
                      End Session
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* End Session Button */}
      {!feedback && (
        <Button onClick={handleEndSession} variant="outline" className="w-full">
          End Practice Session
        </Button>
      )}
    </div>
  );
}
